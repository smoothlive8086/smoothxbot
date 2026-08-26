const { EmbedBuilder, AuditLogEvent, PermissionFlagsBits } = require('discord.js');
const { getGuildSettings } = require('../../database/settingsManager');
const { logModerationAction } = require('../../database/logManager');
const { getIo } = require('../../server/socket');

const actionTracker = new Map();
const pendingPunishments = new Set();

function getTrackerKey(guildId, userId, action) {
  return `${guildId}-${userId}-${action}`;
}

function trackAction(guildId, userId, action) {
  const key = getTrackerKey(guildId, userId, action);
  const now = Date.now();

  if (!actionTracker.has(key)) {
    actionTracker.set(key, []);
  }
  actionTracker.get(key).push(now);
}

function getActionCount(guildId, userId, action, timeframeMs) {
  const key = getTrackerKey(guildId, userId, action);
  const now = Date.now();

  if (!actionTracker.has(key)) {
    return 0;
  }

  const actions = actionTracker.get(key).filter(time => now - time < timeframeMs);

  if (actions.length === 0) {
    actionTracker.delete(key);
  } else {
    actionTracker.set(key, actions);
  }

  return actions.length;
}

function cleanupOldActions() {
  const now = Date.now();
  const maxAge = 3600000; // 1 hour

  for (const [key, times] of actionTracker.entries()) {
    const recentTimes = times.filter(time => now - time < maxAge);
    if (recentTimes.length === 0) {
      actionTracker.delete(key);
    } else if (recentTimes.length !== times.length) {
      actionTracker.set(key, recentTimes);
    }
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupOldActions, 10 * 60 * 1000);

async function isWhitelisted(guild, userId, eventType = null) {
  const settings = await getGuildSettings(guild.id);
  if (!settings || !settings.antinuke) return false;

  // The guild owner and bot itself are whitelisted by default
  if (userId === guild.ownerId || userId === guild.client.user.id) return true;

  const whitelistEntry = settings.antinuke.whitelistedUsers?.find(u => u.userId === userId);
  if (!whitelistEntry) return false;

  const events = whitelistEntry.events;
  if (!events || events.length === 0) return true;

  if (eventType && events.includes(eventType)) return true;

  return !eventType;
}

async function getAuditLogExecutor(guild, auditType, targetId = null, timeWindow = 5000) {
  try {
    const auditLogs = await guild.fetchAuditLogs({ type: auditType, limit: 15 }).catch(() => null);
    if (!auditLogs) return null;

    const now = Date.now();
    for (const entry of auditLogs.entries.values()) {
      const age = Math.abs(now - entry.createdTimestamp);
      
      if (targetId) {
        const matchesTarget = entry.targetId === targetId || entry.target?.id === targetId;
        if (matchesTarget && age < 5 * 60 * 1000) { // 5 minutes window for target matching
          return entry.executor;
        }
      } else {
        if (age < timeWindow) {
          return entry.executor;
        }
      }
    }
    return null;
  } catch (err) {
    console.error(`[Antinuke Tracker Error] Failed to fetch audit logs:`, err.message);
    return null;
  }
}

async function executePunishment(guild, user, config, reason) {
  try {
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    if (member.id === guild.ownerId) return;

    const botMember = guild.members.me;
    if (!botMember || member.roles.highest.position >= botMember.roles.highest.position) {
      console.warn(`[Antinuke Penalty Warning] Cannot punish ${user.tag}: Role is higher or equal to bot's highest role.`);
      return;
    }

    const punishment = config.punishment || 'stripall';
    console.log(`[Antinuke Penalty] Applying punishment "${punishment}" to user ${user.tag} in guild ${guild.name} for: ${reason}`);

    let punishmentSuccess = false;

    if (punishment === 'stripall') {
      const rolesToRemove = member.roles.cache.filter(r => 
        r.id !== guild.id && 
        !r.managed && 
        r.position < botMember.roles.highest.position
      );
      if (rolesToRemove.size > 0) {
        await member.roles.remove(rolesToRemove, `Antinuke: ${reason}`).catch(err => {
          console.error(`[Antinuke Penalty Error] Failed to strip roles from ${user.tag}:`, err.message);
        });
        punishmentSuccess = true;
      }
    } else if (punishment === 'kick') {
      if (member.kickable) {
        await member.kick(`Antinuke: ${reason}`).catch(err => {
          console.error(`[Antinuke Penalty Error] Failed to kick ${user.tag}:`, err.message);
        });
        punishmentSuccess = true;
      } else {
        console.warn(`[Antinuke Penalty Warning] Failed to kick ${user.tag}: Not kickable`);
      }
    } else if (punishment === 'ban') {
      if (member.bannable) {
        await guild.members.ban(user.id, { reason: `Antinuke: ${reason}` }).catch(err => {
          console.error(`[Antinuke Penalty Error] Failed to ban ${user.tag}:`, err.message);
        });
        punishmentSuccess = true;
      } else {
        console.warn(`[Antinuke Penalty Warning] Failed to ban ${user.tag}: Not bannable`);
      }
    }

    // Log moderation action in database
    const logEntry = await logModerationAction(guild.id, {
      actionType: 'antinuke',
      moderator: {
        id: guild.client.user.id,
        username: guild.client.user.username,
        avatar: guild.client.user.avatar
      },
      target: {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      },
      details: punishmentSuccess 
        ? `Anti-Nuke punishment [${punishment}] applied. Reason: ${reason}` 
        : `Anti-Nuke punishment [${punishment}] failed due to bot permissions/role hierarchy. Reason: ${reason}`,
      timestamp: new Date()
    }).catch(() => null);

    // Emit live socket log
    const io = getIo();
    if (io && logEntry) {
      io.to(`guild_${guild.id}`).emit('new_log', logEntry);
    }

    await sendLog(guild, config, user, reason, punishment, punishmentSuccess);

    // Send a DM to the Server Owner
    try {
      const owner = await guild.members.fetch(guild.ownerId).catch(() => null);
      if (owner) {
        const punishmentLabels = {
          stripall: 'Roles Stripped',
          kick: 'Kicked',
          ban: 'Banned'
        };
        const statusNote = punishmentSuccess ? '' : ' *(Failed due to bot permissions/role hierarchy)*';
        
        const dmEmbed = new EmbedBuilder()
          .setTitle('🚨 **SMOOTH ANTINUKE ALERT** 🚨')
          .setColor('#ff3333')
          .setDescription(`An antinuke violation has occurred on your server: **${guild.name}**.`)
          .addFields(
            { name: 'Target User', value: `**${user.tag}** (${user.id})`, inline: true },
            { name: 'Action Taken', value: `\`${punishmentLabels[punishment] || punishment}\`${statusNote}`, inline: true },
            { name: 'Reason', value: reason, inline: false }
          )
          .setTimestamp()
          .setFooter({ text: 'SMOOTH MODE Anti-Nuke System' });

        await owner.send({ embeds: [dmEmbed] }).catch(err => {
          console.warn(`[Antinuke Owner DM Warning] Could not DM owner ${owner.user.tag}:`, err.message);
        });
      }
    } catch (dmErr) {
      console.error(`[Antinuke Owner DM Error] Failed to send owner DM:`, dmErr.message);
    }
  } catch (err) {
    console.error(`[Antinuke Penalty Error] executePunishment exception:`, err);
  }
}

async function sendLog(guild, config, user, reason, punishment, success) {
  if (!config.logChannelId) return;

  try {
    const channel = guild.channels.cache.get(config.logChannelId) || await guild.channels.fetch(config.logChannelId).catch(() => null);
    if (!channel) return;

    const punishmentLabels = {
      stripall: 'Roles Stripped',
      kick: 'Kicked',
      ban: 'Banned'
    };

    const statusNote = success ? '' : ' *(Failed due to bot permissions/role hierarchy)*';

    const embed = new EmbedBuilder()
      .setTitle('🚨 **SMOOTH MODE — ANTINUKE ALERT** 🚨')
      .setColor('#ff3333')
      .setDescription(`Automated antinuke system has penalized an operator.`)
      .addFields(
        { name: 'User Details', value: `**${user.tag}** (${user.id})`, inline: false },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Action Taken', value: `\`${punishmentLabels[punishment] || punishment}\`${statusNote}`, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'SMOOTH MODE Anti-Nuke System' });

    if (channel.permissionsFor(guild.members.me)?.has('SendMessages')) {
      await channel.send({ embeds: [embed] }).catch(() => null);
    }
  } catch (err) {
    console.error(`[Antinuke Logger Error] Failed to send alert log to Discord channel:`, err.message);
  }
}

async function punishBotOperator(guild, botUser, config, reason) {
  try {
    console.log(`[Antinuke Operator Search] Bot ${botUser.tag} triggered an antinuke breach. Searching for operator...`);
    let operatorId = null;

    // 1. Scan global.recentGuildMessages map for the most recent message from a human in this guild
    const recentMessages = global.recentGuildMessages?.get(guild.id) || [];
    const now = Date.now();
    // Filter messages sent in the last 60 seconds
    const humanMessages = recentMessages.filter(m => (now - m.timestamp) < 60000);
    
    if (humanMessages.length > 0) {
      // Sort by timestamp descending (newest first)
      humanMessages.sort((a, b) => b.timestamp - a.timestamp);
      operatorId = humanMessages[0].userId;
      console.log(`[Antinuke Operator Search] Found recent human message sender: ${operatorId}`);
    }

    // 2. Fallback to finding the bot inviter from audit logs
    if (!operatorId) {
      const inviter = await getAuditLogExecutor(guild, AuditLogEvent.BotAdd, botUser.id, 30 * 24 * 60 * 60 * 1000);
      if (inviter) {
        operatorId = inviter.id;
        console.log(`[Antinuke Operator Search] Found bot inviter from audit logs: ${operatorId}`);
      }
    }

    if (operatorId) {
      if (operatorId === guild.ownerId || operatorId === guild.client.user.id) {
        console.log(`[Antinuke Operator Search] Operator ${operatorId} is the Guild Owner or Bot itself. Skipping punishment.`);
        return;
      }

      const whitelisted = await isWhitelisted(guild, operatorId, 'bot_add');
      if (whitelisted) {
        console.log(`[Antinuke Operator Search] Operator ${operatorId} is whitelisted. Skipping punishment.`);
        return;
      }

      const operatorUser = await guild.client.users.fetch(operatorId).catch(() => null);
      if (operatorUser) {
        console.log(`[Antinuke Operator Punishment] Applying configured punishment to operator ${operatorUser.tag} for command triggers/bot invitation.`);
        await executePunishment(guild, operatorUser, config, `Operating/Inviting nuker bot (${botUser.tag}). ${reason}`);
      }
    } else {
      console.log(`[Antinuke Operator Search] Could not resolve any operator for bot ${botUser.tag}.`);
    }
  } catch (err) {
    console.error(`[Antinuke Operator Error] punishBotOperator failed:`, err.message);
  }
}

async function handleAntiAction(guild, executor, action, config) {
  if (!executor) return;

  if (executor.id === guild.ownerId) return;
  if (executor.id === guild.client.user.id) return;
  if (await isWhitelisted(guild, executor.id, action)) return;

  trackAction(guild.id, executor.id, action);
  const timeframeSeconds = config.timeframe || 60;
  const count = getActionCount(guild.id, executor.id, action, timeframeSeconds * 1000);
  const threshold = config.threshold || 3;

  console.log(`[Antinuke Tracker] Guild ${guild.id}, Executor ${executor.tag}, Action ${action}, Count: ${count}/${threshold}`);

  if (count >= threshold) {
    const punishKey = `${guild.id}:${executor.id}`;
    if (pendingPunishments.has(punishKey)) return;
    pendingPunishments.add(punishKey);
    setTimeout(() => pendingPunishments.delete(punishKey), 30000);

    const actionNames = {
      ban: 'Banning members',
      kick: 'Kicking members',
      channel_create: 'Creating channels',
      channel_delete: 'Deleting channels',
      role_create: 'Creating roles',
      role_delete: 'Deleting roles',
      role_update: 'Updating roles (dangerous permissions)',
      webhook_create: 'Creating webhooks',
      bot_add: 'Adding bot integrations',
      guild_update: 'Modifying guild settings',
      emoji_create: 'Creating emojis',
      emoji_delete: 'Deleting emojis',
      emoji_update: 'Updating emojis',
      channel_edit: 'Modifying channels'
    };

    const actionText = actionNames[action] || action;
    const reasonText = `Exceeded threshold for ${actionText} (${count} actions in ${timeframeSeconds}s)`;

    await executePunishment(guild, executor, config, reasonText);

    if (executor.bot) {
      await punishBotOperator(guild, executor, config, reasonText);
    }
  }
}

module.exports = {
  getAuditLogExecutor,
  handleAntiAction,
  isWhitelisted,
  executePunishment
};

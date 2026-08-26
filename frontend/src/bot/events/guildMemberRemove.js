const { AuditLogEvent } = require('discord.js');
const { dispatchAuditLog } = require('../utils/auditLogger');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const { guild, user } = member;
    const guildId = guild.id;

    if (user.bot) {
      try {
        const { getGuildSettings } = require('../../database/settingsManager');
        const config = await getGuildSettings(guildId);
        if (config?.antinuke?.enabled && config.antinuke.antiBot) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const { getAuditLogExecutor, isWhitelisted } = require('../utils/antinukeTracker');
          const inviter = await getAuditLogExecutor(guild, AuditLogEvent.BotAdd, user.id, 30 * 24 * 60 * 60 * 1000);
          if (inviter) {
            const whitelisted = await isWhitelisted(guild, inviter.id, 'bot_add');
            if (!whitelisted && inviter.id !== guild.ownerId && inviter.id !== guild.client.user.id) {
              const { executePunishment } = require('../utils/antinukeTracker');
              console.log(`[Antinuke bot-kick hook] Punishing bot operator ${inviter.tag} because their invited bot ${user.tag} was kicked/removed.`);
              await executePunishment(guild, inviter, config.antinuke, `Operating bot ${user.tag} which has been kicked/removed.`);
            }
          }
        }
      } catch (err) {
        console.error('[Bot Event Error] Failed to handle bot operator kick in guildMemberRemove:', err.message);
      }
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 5,
        type: AuditLogEvent.MemberKick,
      }).catch(err => {
        console.error(`[Kick Log Error] Failed to fetch audit logs in guildMemberRemove for guild ${guild.id}:`, err.message);
        return null;
      });

      let isKick = false;
      if (fetchedLogs) {
        const kickLog = fetchedLogs.entries.find(entry => entry.targetId === user.id);
        if (kickLog) {
          const timeDifference = Date.now() - kickLog.createdTimestamp;
          if (timeDifference < 15000) {
            isKick = true;
            const { executor, reason: logReason } = kickLog;
            const reason = logReason || 'No reason specified';

            const { getGuildSettings } = require('../../database/settingsManager');
            const { handleAntiAction } = require('../utils/antinukeTracker');
            const config = await getGuildSettings(guildId).catch(() => null);
            if (config?.antinuke?.enabled && config.antinuke.antiKick && executor) {
              await handleAntiAction(guild, executor, 'kick', config.antinuke);
            }

            await dispatchAuditLog(guildId, {
              actionType: 'kick',
              moderator: {
                id: executor ? executor.id : 'unknown',
                username: executor ? executor.username : 'Unknown Moderator',
                avatar: executor ? executor.avatar : null
              },
              target: {
                id: user.id,
                username: user.username,
                avatar: user.avatar
              },
              details: reason,
              timestamp: new Date()
            });

            console.log(`[Bot Event] Logged kick for ${user.username} in guild ${guildId}`);
          }
        }
      }

      if (!isKick) {
        await dispatchAuditLog(guildId, {
          actionType: 'member_leave',
          moderator: { id: 'system', username: 'System', avatar: null },
          target: {
            id: user.id,
            username: user.username,
            avatar: user.avatar
          },
          details: 'User left the server',
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.error('[Bot Event Error] Failed to log guildMemberRemove:', err.message);
    }
  }
};

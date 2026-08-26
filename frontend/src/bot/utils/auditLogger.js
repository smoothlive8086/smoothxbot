const { EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../../database/logManager');
const { getGuildSettings } = require('../../database/settingsManager');
const { getIo } = require('../../server/socket');

/**
 * Dispatches an audit log entry:
 * 1. Saves to DB / in-memory store
 * 2. Emits WebSocket 'new_log' event to the frontend dashboard
 * 3. Sends a styled Discord Embed log message to the server's designated Audit Log channel
 */
async function dispatchAuditLog(guildId, actionData) {
  try {
    // 1. Save entry to DB / memory cache
    const logEntry = await logModerationAction(guildId, actionData);

    // 2. Real-time emit to frontend via Socket.io
    const io = getIo();
    if (io) {
      io.to(`guild_${guildId}`).emit('new_log', logEntry);
    }

    // 3. Post to Discord Server Audit Log Channel
    const client = require('../client');
    const settings = await getGuildSettings(guildId).catch(() => null);
    if (!settings) return logEntry;

    // Check if logging is globally enabled
    const loggingConfig = settings.logging || {};
    if (loggingConfig.enabled === false) return logEntry;

    // Check if this specific event category is disabled
    const actionType = actionData.actionType;
    if (actionType === 'ban' || actionType === 'unban') {
      if (loggingConfig.logBans === false) return logEntry;
    } else if (actionType === 'kick') {
      if (loggingConfig.logKicks === false) return logEntry;
    } else if (actionType === 'timeout' || actionType === 'untimeout') {
      if (loggingConfig.logMutes === false) return logEntry;
    } else if (actionType.startsWith('voice_')) {
      if (loggingConfig.logVoice === false) return logEntry;
    } else if (actionType.startsWith('role_')) {
      if (loggingConfig.logRoles === false) return logEntry;
    } else if (actionType.startsWith('channel_')) {
      if (loggingConfig.logChannels === false) return logEntry;
    } else if (actionType === 'message_delete') {
      if (loggingConfig.logMessages === false) return logEntry;
    } else if (actionType === 'member_join' || actionType === 'member_leave') {
      if (loggingConfig.logMembers === false) return logEntry;
    }

    // Resolve target text channel for audit logs
    const logChannelId = loggingConfig.logChannelId || settings.antinuke?.logChannelId || settings.moderation?.wordFilter?.logChannelId;
    if (!logChannelId) return logEntry;

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return logEntry;

    const logChannel = guild.channels.cache.get(logChannelId) || await guild.channels.fetch(logChannelId).catch(() => null);
    if (!logChannel || !logChannel.isTextBased()) return logEntry;

    // Build styled Discord Embed
    const embed = new EmbedBuilder();
    let color = '#3b82f6';
    let title = `🛡️ Audit Log: ${actionType.toUpperCase()}`;

    switch (actionType) {
      case 'ban':
        color = '#ef4444';
        title = '🔨 Member Banned';
        break;
      case 'unban':
        color = '#22c55e';
        title = '🔓 Member Unbanned';
        break;
      case 'kick':
        color = '#f97316';
        title = '👢 Member Kicked';
        break;
      case 'timeout':
        color = '#eab308';
        title = '🔇 Member Timed Out (Muted)';
        break;
      case 'untimeout':
        color = '#10b981';
        title = '🔊 Member Timeout Removed (Unmuted)';
        break;
      case 'voice_join':
        color = '#3b82f6';
        title = '🎤 Joined Voice Channel';
        break;
      case 'voice_disconnect':
        color = '#64748b';
        title = '🚪 Left Voice Channel';
        break;
      case 'voice_move':
        color = '#8b5cf6';
        title = '🔀 Moved Voice Channel';
        break;
      case 'voice_mute':
        color = '#f59e0b';
        title = '🎙️ Voice Server Mute Updated';
        break;
      case 'voice_deafen':
        color = '#ec4899';
        title = '🎧 Voice Server Deafen Updated';
        break;
      case 'role_add':
        color = '#06b6d4';
        title = '🏷️ Role Added to Member';
        break;
      case 'role_remove':
        color = '#f43f5e';
        title = '🏷️ Role Removed from Member';
        break;
      case 'role_update':
        color = '#06b6d4';
        title = '🏷️ Member Roles Updated';
        break;
      case 'channel_create':
        color = '#10b981';
        title = '📁 Channel Created';
        break;
      case 'channel_delete':
        color = '#ef4444';
        title = '📁 Channel Deleted';
        break;
      case 'channel_update':
        color = '#06b6d4';
        title = '📁 Channel Updated';
        break;
      case 'role_create':
        color = '#10b981';
        title = '🎭 Server Role Created';
        break;
      case 'role_delete':
        color = '#ef4444';
        title = '🎭 Server Role Deleted';
        break;
      case 'message_delete':
        color = '#f43f5e';
        title = '🗑️ Message Deleted';
        break;
      case 'member_join':
        color = '#22c55e';
        title = '📥 Member Joined Server';
        break;
      case 'member_leave':
        color = '#94a3b8';
        title = '📤 Member Left Server';
        break;
      default:
        color = '#3b82f6';
        title = `🛡️ Audit Action: ${actionType.toUpperCase()}`;
    }

    embed.setColor(color);
    embed.setTitle(title);

    if (actionData.target?.username) {
      embed.addFields({
        name: '👤 Target User',
        value: `**${actionData.target.username}**\n\`ID: ${actionData.target.id || 'N/A'}\``,
        inline: true
      });
    }

    if (actionData.moderator?.username && actionData.moderator.username !== 'Unknown Moderator') {
      embed.addFields({
        name: '🛡️ Moderator / Executor',
        value: `**${actionData.moderator.username}**\n\`ID: ${actionData.moderator.id || 'N/A'}\``,
        inline: true
      });
    }

    if (actionData.details) {
      embed.addFields({
        name: '📝 Details',
        value: String(actionData.details).slice(0, 1024),
        inline: false
      });
    }

    if (actionData.target?.avatar && actionData.target?.id) {
      const avatarUrl = actionData.target.avatar.startsWith('http')
        ? actionData.target.avatar
        : `https://cdn.discordapp.com/avatars/${actionData.target.id}/${actionData.target.avatar}.png`;
      embed.setThumbnail(avatarUrl);
    }

    embed.setTimestamp(actionData.timestamp ? new Date(actionData.timestamp) : new Date());
    const textMsg = `📝 **[SERVER AUDIT LOG]** **${title}**\n👤 **Target:** \`${actionData.target?.username || 'N/A'}\` | 🛡️ **Executor:** \`${actionData.moderator?.username || 'System'}\`\n📝 **Details:** ${actionData.details || 'No reason specified'}`;

    await logChannel.send({ content: textMsg, embeds: [embed] }).catch(err => {
      console.warn(`[Audit Logger] Failed to send log message to channel ${logChannelId}:`, err.message);
    });

    return logEntry;
  } catch (err) {
    console.error('[Audit Logger Error] Failed in dispatchAuditLog:', err.message);
  }
}

module.exports = { dispatchAuditLog };

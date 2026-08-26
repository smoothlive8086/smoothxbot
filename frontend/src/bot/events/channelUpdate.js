const { AuditLogEvent } = require('discord.js');
const { getGuildSettings } = require('../../database/settingsManager');
const { getAuditLogExecutor, handleAntiAction } = require('../utils/antinukeTracker');
const { dispatchAuditLog } = require('../utils/auditLogger');

module.exports = {
  name: 'channelUpdate',
  async execute(oldChannel, newChannel) {
    if (!newChannel.guild) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const executor = await getAuditLogExecutor(newChannel.guild, AuditLogEvent.ChannelUpdate, newChannel.id);

      await dispatchAuditLog(newChannel.guild.id, {
        actionType: 'channel_update',
        moderator: executor ? { id: executor.id, username: executor.username, avatar: executor.avatar } : { id: 'unknown', username: 'Unknown Moderator', avatar: null },
        target: { id: newChannel.id, username: `#${newChannel.name}`, avatar: null },
        details: `Channel #${oldChannel.name} updated to #${newChannel.name}`,
        timestamp: new Date()
      });

      const config = await getGuildSettings(newChannel.guild.id);
      if (config?.antinuke?.enabled && config.antinuke.antiChannelEdit && executor) {
        await handleAntiAction(newChannel.guild, executor, 'channel_edit', config.antinuke);
      }
    } catch (err) {
      console.error(`[Event Error] channelUpdate failed:`, err.message);
    }
  }
};

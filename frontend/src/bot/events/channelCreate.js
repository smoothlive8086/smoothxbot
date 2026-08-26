const { AuditLogEvent } = require('discord.js');
const { getGuildSettings } = require('../../database/settingsManager');
const { getAuditLogExecutor, handleAntiAction } = require('../utils/antinukeTracker');
const { dispatchAuditLog } = require('../utils/auditLogger');

module.exports = {
  name: 'channelCreate',
  async execute(channel) {
    if (!channel.guild) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const executor = await getAuditLogExecutor(channel.guild, AuditLogEvent.ChannelCreate, channel.id);

      await dispatchAuditLog(channel.guild.id, {
        actionType: 'channel_create',
        moderator: executor ? { id: executor.id, username: executor.username, avatar: executor.avatar } : { id: 'unknown', username: 'Unknown Moderator', avatar: null },
        target: { id: channel.id, username: `#${channel.name}`, avatar: null },
        details: `Channel #${channel.name} created`,
        timestamp: new Date()
      });

      const config = await getGuildSettings(channel.guild.id);
      if (config?.antinuke?.enabled && config.antinuke.antiChannelCreate && executor) {
        await handleAntiAction(channel.guild, executor, 'channel_create', config.antinuke);
      }
    } catch (err) {
      console.error(`[Event Error] channelCreate failed:`, err.message);
    }
  }
};

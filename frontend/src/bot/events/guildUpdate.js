const { AuditLogEvent } = require('discord.js');
const { getGuildSettings } = require('../../database/settingsManager');
const { getAuditLogExecutor, handleAntiAction } = require('../utils/antinukeTracker');
const { dispatchAuditLog } = require('../utils/auditLogger');

module.exports = {
  name: 'guildUpdate',
  async execute(oldGuild, newGuild) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const executor = await getAuditLogExecutor(newGuild, AuditLogEvent.GuildUpdate);

      await dispatchAuditLog(newGuild.id, {
        actionType: 'guild_update',
        moderator: executor ? { id: executor.id, username: executor.username, avatar: executor.avatar } : { id: 'unknown', username: 'Unknown Moderator', avatar: null },
        target: { id: newGuild.id, username: newGuild.name, avatar: newGuild.icon },
        details: `Server configuration / name updated`,
        timestamp: new Date()
      });

      const config = await getGuildSettings(newGuild.id);
      if (config?.antinuke?.enabled && config.antinuke.antiGuildUpdate && executor) {
        await handleAntiAction(newGuild, executor, 'guild_update', config.antinuke);
      }
    } catch (err) {
      console.error(`[Event Error] guildUpdate failed:`, err.message);
    }
  }
};

const { AuditLogEvent } = require('discord.js');
const { getGuildSettings } = require('../../database/settingsManager');
const { getAuditLogExecutor, handleAntiAction } = require('../utils/antinukeTracker');
const { dispatchAuditLog } = require('../utils/auditLogger');

module.exports = {
  name: 'roleDelete',
  async execute(role) {
    if (!role.guild) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const executor = await getAuditLogExecutor(role.guild, AuditLogEvent.RoleDelete, role.id);

      await dispatchAuditLog(role.guild.id, {
        actionType: 'role_delete',
        moderator: executor ? { id: executor.id, username: executor.username, avatar: executor.avatar } : { id: 'unknown', username: 'Unknown Moderator', avatar: null },
        target: { id: role.id, username: `@${role.name}`, avatar: null },
        details: `Role @${role.name} deleted`,
        timestamp: new Date()
      });

      const config = await getGuildSettings(role.guild.id);
      if (config?.antinuke?.enabled && config.antinuke.antiRoleDelete && executor) {
        await handleAntiAction(role.guild, executor, 'role_delete', config.antinuke);
      }
    } catch (err) {
      console.error(`[Event Error] roleDelete failed:`, err.message);
    }
  }
};

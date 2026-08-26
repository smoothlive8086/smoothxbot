const { AuditLogEvent, PermissionFlagsBits } = require('discord.js');
const { getGuildSettings } = require('../../database/settingsManager');
const { getAuditLogExecutor, handleAntiAction } = require('../utils/antinukeTracker');

module.exports = {
  name: 'roleUpdate',
  async execute(oldRole, newRole) {
    if (!newRole.guild) return;

    try {
      const config = await getGuildSettings(newRole.guild.id);
      if (!config?.antinuke?.enabled || !config.antinuke.antiRoleUpdate) return;

      const dangerousPerms = [
        PermissionFlagsBits.Administrator,
        PermissionFlagsBits.BanMembers,
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.ManageGuild,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.ManageWebhooks
      ];

      let dangerousChange = false;
      for (const perm of dangerousPerms) {
        if (!oldRole.permissions.has(perm) && newRole.permissions.has(perm)) {
          dangerousChange = true;
          break;
        }
      }

      if (!dangerousChange) return;

      // Brief delay to allow audit log to populate
      await new Promise(resolve => setTimeout(resolve, 1500));

      const executor = await getAuditLogExecutor(newRole.guild, AuditLogEvent.RoleUpdate, newRole.id);
      if (executor) {
        await handleAntiAction(newRole.guild, executor, 'role_update', config.antinuke);
      }
    } catch (err) {
      console.error(`[Antinuke Event Error] roleUpdate failed:`, err.message);
    }
  }
};

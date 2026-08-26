const { AuditLogEvent } = require('discord.js');
const { dispatchAuditLog } = require('../utils/auditLogger');

module.exports = {
  name: 'guildBanAdd',
  async execute(ban) {
    const { guild, user } = ban;
    const guildId = guild.id;

    try {
      // Small delay to allow Discord to write the audit log entry
      await new Promise(resolve => setTimeout(resolve, 1500));

      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 5,
        type: AuditLogEvent.MemberBanAdd,
      }).catch(err => {
        console.error(`[Ban Log Error] Failed to fetch audit logs in guildBanAdd for guild ${guild.id}:`, err.message);
        return null;
      });

      let moderator = { id: 'unknown', username: 'Unknown Moderator', avatar: null };
      let reason = 'No reason specified';

      if (fetchedLogs) {
        const banLog = fetchedLogs.entries.find(entry => entry.targetId === user.id);
        if (banLog) {
          const { executor, reason: logReason } = banLog;
          moderator = {
            id: executor ? executor.id : 'unknown',
            username: executor ? executor.username : 'Unknown Moderator',
            avatar: executor ? executor.avatar : null
          };
          if (logReason) reason = logReason;

          // Anti-Nuker hook
          const { getGuildSettings } = require('../../database/settingsManager');
          const { handleAntiAction } = require('../utils/antinukeTracker');
          const config = await getGuildSettings(guildId).catch(() => null);
          if (config?.antinuke?.enabled && config.antinuke.antiBan && executor) {
            await handleAntiAction(guild, executor, 'ban', config.antinuke);
          }
        }
      }

      await dispatchAuditLog(guildId, {
        actionType: 'ban',
        moderator,
        target: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        },
        details: reason,
        timestamp: new Date()
      });

      console.log(`[Bot Event] Logged ban for ${user.username} in guild ${guildId}`);
    } catch (err) {
      console.error('[Bot Event Error] Failed to log guildBanAdd:', err.message);
    }
  }
};

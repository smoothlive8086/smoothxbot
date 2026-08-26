const { AuditLogEvent } = require('discord.js');
const { dispatchAuditLog } = require('../utils/auditLogger');

module.exports = {
  name: 'guildBanRemove',
  async execute(ban) {
    const { guild, user } = ban;
    const guildId = guild.id;

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 5,
        type: AuditLogEvent.MemberBanRemove,
      }).catch(err => {
        console.error(`[Ban Log Error] Failed to fetch audit logs in guildBanRemove for guild ${guild.id}:`, err.message);
        return null;
      });

      let moderator = { id: 'unknown', username: 'Unknown Moderator', avatar: null };
      let reason = 'Ban revoked';

      if (fetchedLogs) {
        const unbanLog = fetchedLogs.entries.find(entry => entry.targetId === user.id);
        if (unbanLog) {
          const { executor, reason: logReason } = unbanLog;
          moderator = {
            id: executor ? executor.id : 'unknown',
            username: executor ? executor.username : 'Unknown Moderator',
            avatar: executor ? executor.avatar : null
          };
          if (logReason) reason = logReason;
        }
      }

      await dispatchAuditLog(guildId, {
        actionType: 'unban',
        moderator,
        target: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        },
        details: reason,
        timestamp: new Date()
      });

      console.log(`[Bot Event] Logged unban for ${user.username} in guild ${guildId}`);
    } catch (err) {
      console.error('[Bot Event Error] Failed to log guildBanRemove:', err.message);
    }
  }
};

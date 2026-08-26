const { AuditLogEvent } = require('discord.js');
const { dispatchAuditLog } = require('../utils/auditLogger');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    const { guild, user } = newMember;
    const guildId = guild.id;

    try {
      // 1. Detect Timeouts & Untimeouts
      const oldTimeout = oldMember.communicationDisabledUntil;
      const newTimeout = newMember.communicationDisabledUntil;

      // Timeout added/extended
      if (newTimeout && (!oldTimeout || oldTimeout.getTime() !== newTimeout.getTime())) {
        const timeoutMs = newTimeout.getTime() - Date.now();
        if (timeoutMs > 1000) {
          const durationMinutes = Math.round(timeoutMs / 60000);
          
          await new Promise(resolve => setTimeout(resolve, 1500));
          const fetchedLogs = await guild.fetchAuditLogs({
            limit: 5,
            type: AuditLogEvent.MemberUpdate,
          }).catch(() => null);

          let moderator = { id: 'unknown', username: 'Unknown Moderator', avatar: null };
          let reason = 'No reason specified';

          if (fetchedLogs) {
            const timeoutLog = fetchedLogs.entries.find(entry => 
              entry.targetId === user.id && 
              entry.changes.some(change => change.key === 'communication_disabled_until')
            );
            if (timeoutLog) {
              const { executor, reason: logReason } = timeoutLog;
              moderator = {
                id: executor ? executor.id : 'unknown',
                username: executor ? executor.username : 'Unknown Moderator',
                avatar: executor ? executor.avatar : null
              };
              if (logReason) reason = logReason;
            }
          }

          await dispatchAuditLog(guildId, {
            actionType: 'timeout',
            moderator,
            target: {
              id: user.id,
              username: user.username,
              avatar: user.avatar
            },
            details: `Timed out for ${durationMinutes} minutes. Reason: ${reason}`,
            timestamp: new Date()
          });

          console.log(`[Bot Event] Logged timeout for ${user.username} in guild ${guildId}`);
        }
      } else if (oldTimeout && !newTimeout) {
        // Timeout removed (Unmuted)
        await dispatchAuditLog(guildId, {
          actionType: 'untimeout',
          moderator: { id: 'unknown', username: 'Unknown Moderator', avatar: null },
          target: {
            id: user.id,
            username: user.username,
            avatar: user.avatar
          },
          details: 'Timeout was removed / User unmuted',
          timestamp: new Date()
        });
      }

      // 2. Detect Role Updates
      const oldRoles = oldMember.roles.cache;
      const newRoles = newMember.roles.cache;

      if (oldRoles.size !== newRoles.size) {
        const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
        const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

        if (addedRoles.size > 0 || removedRoles.size > 0) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const fetchedLogs = await guild.fetchAuditLogs({
            limit: 5,
            type: AuditLogEvent.MemberRoleUpdate,
          }).catch(err => {
            console.error(`[Audit Log Error] Failed to fetch audit logs in guildMemberUpdate for guild ${guild.id}:`, err.message);
            return null;
          });

          let moderator = { id: 'unknown', username: 'Unknown Moderator', avatar: null };
          if (fetchedLogs) {
            const roleUpdateLog = fetchedLogs.entries.find(entry => entry.targetId === user.id);
            if (roleUpdateLog && roleUpdateLog.executor) {
              const { executor } = roleUpdateLog;
              moderator = {
                id: executor.id,
                username: executor.username,
                avatar: executor.avatar
              };
            }
          }

          const addedNames = addedRoles.map(r => `+${r.name}`).join(', ');
          const removedNames = removedRoles.map(r => `-${r.name}`).join(', ');
          const roleChanges = [addedNames, removedNames].filter(Boolean).join(' | ');

          let actionType = 'role_update';
          if (addedRoles.size > 0 && removedRoles.size === 0) actionType = 'role_add';
          else if (removedRoles.size > 0 && addedRoles.size === 0) actionType = 'role_remove';

          await dispatchAuditLog(guildId, {
            actionType,
            moderator,
            target: {
              id: user.id,
              username: user.username,
              avatar: user.avatar
            },
            details: `Roles updated for @${user.username}: ${roleChanges}`,
            timestamp: new Date()
          });

          console.log(`[Bot Event] Logged role update for ${user.username} in guild ${guildId}`);
        }
      }
    } catch (err) {
      console.error('[Bot Event Error] Failed to log guildMemberUpdate:', err.message);
    }
  }
};

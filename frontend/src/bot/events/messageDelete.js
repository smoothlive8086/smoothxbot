const { AuditLogEvent } = require('discord.js');
const { dispatchAuditLog } = require('../utils/auditLogger');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.partial || !message.author) return;

    const guildId = message.guild.id;

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const fetchedLogs = await message.guild.fetchAuditLogs({
        limit: 5,
        type: AuditLogEvent.MessageDelete,
      }).catch(() => null);

      let moderator = { id: message.author.id, username: message.author.username, avatar: message.author.avatar };

      if (fetchedLogs) {
        const deleteLog = fetchedLogs.entries.find(entry => 
          entry.targetId === message.author.id &&
          (Date.now() - entry.createdTimestamp < 15000)
        );

        if (deleteLog && deleteLog.executor) {
          const { executor } = deleteLog;
          moderator = {
            id: executor.id,
            username: executor.username,
            avatar: executor.avatar
          };
        }
      }

      const contentPreview = message.content ? message.content.substring(0, 100) : '[Attachment/Embed]';

      await dispatchAuditLog(guildId, {
        actionType: 'message_delete',
        moderator,
        target: {
          id: message.author.id,
          username: message.author.username,
          avatar: message.author.avatar
        },
        details: `Message deleted in #${message.channel ? message.channel.name : 'channel'}. Content preview: "${contentPreview}"`,
        timestamp: new Date()
      });

      console.log(`[Bot Event] Logged message delete in guild ${guildId}`);
    } catch (err) {
      console.error('[Bot Event Error] Failed to log messageDelete:', err.message);
    }
  }
};

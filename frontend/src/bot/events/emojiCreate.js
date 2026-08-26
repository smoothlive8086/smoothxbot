const { AuditLogEvent } = require('discord.js');
const { getGuildSettings } = require('../../database/settingsManager');
const { getAuditLogExecutor, handleAntiAction } = require('../utils/antinukeTracker');
const { dispatchAuditLog } = require('../utils/auditLogger');

module.exports = {
  name: 'emojiCreate',
  async execute(emoji) {
    if (!emoji.guild) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const executor = await getAuditLogExecutor(emoji.guild, AuditLogEvent.EmojiCreate, emoji.id);

      await dispatchAuditLog(emoji.guild.id, {
        actionType: 'emoji_create',
        moderator: executor ? { id: executor.id, username: executor.username, avatar: executor.avatar } : { id: 'unknown', username: 'Unknown Moderator', avatar: null },
        target: { id: emoji.id, username: `:${emoji.name}:`, avatar: null },
        details: `Emoji :${emoji.name}: created`,
        timestamp: new Date()
      });

      const config = await getGuildSettings(emoji.guild.id);
      if (config?.antinuke?.enabled && config.antinuke.antiEmoji && executor) {
        await handleAntiAction(emoji.guild, executor, 'emoji_create', config.antinuke);
      }
    } catch (err) {
      console.error(`[Event Error] emojiCreate failed:`, err.message);
    }
  }
};

const { AuditLogEvent } = require('discord.js');
const { getGuildSettings } = require('../../database/settingsManager');
const { getAuditLogExecutor, handleAntiAction } = require('../utils/antinukeTracker');

module.exports = {
  name: 'emojiUpdate',
  async execute(oldEmoji, newEmoji) {
    if (!newEmoji.guild) return;

    try {
      const config = await getGuildSettings(newEmoji.guild.id);
      if (!config?.antinuke?.enabled || !config.antinuke.antiEmoji) return;

      // Brief delay to allow audit log to populate
      await new Promise(resolve => setTimeout(resolve, 1500));

      const executor = await getAuditLogExecutor(newEmoji.guild, AuditLogEvent.EmojiUpdate, newEmoji.id);
      if (executor) {
        await handleAntiAction(newEmoji.guild, executor, 'emoji_update', config.antinuke);
      }
    } catch (err) {
      console.error(`[Antinuke Event Error] emojiUpdate failed:`, err.message);
    }
  }
};

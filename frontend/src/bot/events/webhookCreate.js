const { AuditLogEvent } = require('discord.js');
const { getGuildSettings } = require('../../database/settingsManager');
const { getAuditLogExecutor, handleAntiAction } = require('../utils/antinukeTracker');

module.exports = {
  name: 'webhookCreate',
  async execute(webhook) {
    if (!webhook.guildId) return;

    try {
      const config = await getGuildSettings(webhook.guildId);
      if (!config?.antinuke?.enabled || !config.antinuke.antiWebhook) return;

      const guild = webhook.client.guilds.cache.get(webhook.guildId);
      if (!guild) return;

      // Brief delay to allow audit log to populate
      await new Promise(resolve => setTimeout(resolve, 1500));

      const executor = await getAuditLogExecutor(guild, AuditLogEvent.WebhookCreate, webhook.id);
      if (executor) {
        await handleAntiAction(guild, executor, 'webhook_create', config.antinuke);
      }
    } catch (err) {
      console.error(`[Antinuke Event Error] webhookCreate failed:`, err.message);
    }
  }
};

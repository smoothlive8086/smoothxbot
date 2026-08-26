const { REST, Routes, SlashCommandBuilder, ActivityType } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[Bot] Logged in as ${client.user.tag}!`);
    
    // Set custom status from database
    let botSettings = null;
    try {
      const BotSettings = require('../../database/models/BotSettings');
      botSettings = await BotSettings.findOne({ key: 'global' });
      if (!botSettings) {
        botSettings = await BotSettings.create({
          key: 'global',
          status: 'online',
          activityType: 4, // Custom
          activityText: 'I control the server'
        });
        console.log('[Bot] Created default global bot settings in database.');
      }
    } catch (err) {
      console.error('[Bot] Failed to load status settings from database, using defaults:', err.message);
    }

    const status = botSettings?.status || 'online';
    const activityType = botSettings ? botSettings.activityType : 4;
    const activityText = botSettings ? botSettings.activityText : 'I control the server';

    const activity = {
      name: activityType === 4 ? 'Custom Status' : activityText,
      type: activityType
    };
    if (activityType === 4) {
      activity.state = activityText;
    }

    client.user.setPresence({
      activities: [activity],
      status: status
    });
    
    const commands = [
      new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Shows information about a user')
        .addUserOption(option => 
          option.setName('target')
            .setDescription('The user to get info about')
            .setRequired(false)
        ),
      new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Shows information about the server'),
      new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('Get the link to the dashboard website'),
      new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a user and logs the action')
        .addUserOption(option => 
          option.setName('target')
            .setDescription('The user to warn')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('The reason for warning the user')
            .setRequired(false)
        ),
      new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears messages sent by this bot from this chat')
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Number of messages to search through (default: 50, max: 100)')
            .setRequired(false)
        ),
      new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a quick poll in this channel')
        .addStringOption(option => 
          option.setName('question')
            .setDescription('The question for the poll')
            .setRequired(true)
        )
        .addStringOption(option => 
          option.setName('options')
            .setDescription('Comma-separated list of options (e.g. Yes, No, Maybe - max 10)')
            .setRequired(true)
        )
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(config.discordToken);

    try {
      console.log('[Bot] Started refreshing application (/) commands.');
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
      );
      console.log('[Bot] Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('[Bot] Error reloading application (/) commands:', error);
    }
  }
};

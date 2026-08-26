const mongoose = require('mongoose');

const guildSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true, index: true },
  welcome: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: '' },
    redirectChannelId: { type: String, default: '' },
    redirectChannelId2: { type: String, default: '' },
    redirectChannelId3: { type: String, default: '' },
    message: { type: String, default: 'Welcome {user} to {server}!' },
    background: { type: String, default: '' }, // Hex color or URL
    textColor: { type: String, default: '#ffffff' },
    fontFamily: { type: String, default: 'Ethnocentric' },
    gifSupport: { type: Boolean, default: false },
    avatarSize: { type: Number, default: 140 },
    avatarX: { type: Number, default: 400 },
    avatarY: { type: Number, default: 130 },
    avatarRotation: { type: Number, default: 0 },
    avatarBorderThickness: { type: Number, default: 6 },
    avatarBorderColor: { type: String, default: '#00ff66' },
    usernameX: { type: Number, default: 400 },
    usernameY: { type: Number, default: 320 },
    usernameSize: { type: Number, default: 38 },
    titleX: { type: Number, default: 400 },
    titleY: { type: Number, default: 260 },
    titleSize: { type: Number, default: 54 },
    subtextX: { type: Number, default: 400 },
    subtextY: { type: Number, default: 370 },
    subtextSize: { type: Number, default: 22 },
    textAlignment: { type: String, default: 'center' },
    fontWeight: { type: String, default: 'bold' },
    avatarEnabled: { type: Boolean, default: true },
    titleEnabled: { type: Boolean, default: true },
    usernameEnabled: { type: Boolean, default: true },
    subtextEnabled: { type: Boolean, default: true },
    
    // Premium features:
    layoutType: { type: String, default: 'classic' }, // classic, embed-card, embed-only, text-only
    titleText: { type: String, default: 'WELCOME' },
    subtextText: { type: String, default: 'TO {server}' },
    usernameColor: { type: String, default: '#ffffff' },
    subtextColor: { type: String, default: '#00ff66' },
    
    textShadowEnabled: { type: Boolean, default: false },
    textShadowColor: { type: String, default: '#000000' },
    textShadowBlur: { type: Number, default: 5 },
    
    titleFontFamily: { type: String, default: 'Ethnocentric' },
    usernameFontFamily: { type: String, default: 'Ethnocentric' },
    subtextFontFamily: { type: String, default: 'Ethnocentric' },
    titleFontStyle: { type: String, default: 'normal' },
    usernameFontStyle: { type: String, default: 'normal' },
    subtextFontStyle: { type: String, default: 'normal' },
    titleGlowEnabled: { type: Boolean, default: false },
    titleGlowColor: { type: String, default: '#00ff66' },
    titleGlowBlur: { type: Number, default: 15 },
    usernameGlowEnabled: { type: Boolean, default: false },
    usernameGlowColor: { type: String, default: '#00ff66' },
    usernameGlowBlur: { type: Number, default: 15 },
    subtextGlowEnabled: { type: Boolean, default: false },
    subtextGlowColor: { type: String, default: '#00ff66' },
    subtextGlowBlur: { type: Number, default: 15 },

    avatarShadowEnabled: { type: Boolean, default: false },
    avatarShadowColor: { type: String, default: '#00ff66' },
    avatarShadowBlur: { type: Number, default: 15 },
    
    overlayOpacity: { type: Number, default: 0.3 },
    overlayColor: { type: String, default: '#000000' },
    
    cardBorderEnabled: { type: Boolean, default: false },
    cardBorderColor: { type: String, default: '#2563eb' },
    cardBorderThickness: { type: Number, default: 8 },

    // Welcome Embed Builder fields:
    embedColor: { type: String, default: '#2563eb' },
    embedAuthorName: { type: String, default: '' },
    embedAuthorIcon: { type: String, default: '' },
    embedAuthorUrl: { type: String, default: '' },
    embedTitle: { type: String, default: '' },
    embedTitleUrl: { type: String, default: '' },
    embedThumbnail: { type: String, default: '{user_avatar}' },
    embedImage: { type: String, default: '' },
    embedFooterText: { type: String, default: '' },
    embedFooterIcon: { type: String, default: '' },
    embedTimestamp: { type: Boolean, default: true },
    embedFields: [{
      name: { type: String, default: '' },
      value: { type: String, default: '' },
      inline: { type: Boolean, default: false }
    }]
  },
  verification: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: '' },
    roleId: { type: String, default: '' },
    buttonText: { type: String, default: 'Verify' },
    welcomeMessage: { type: String, default: 'Click the button below to verify your account and gain access to the server.' },
    type: { type: String, default: 'button' }, // 'button' or 'reaction'
    reactionEmoji: { type: String, default: '✅' },
    messageId: { type: String, default: '' }
  },
  autoRole: {
    enabled: { type: Boolean, default: false },
    roleId: { type: String, default: '' }
  },
  autoNickname: {
    enabled: { type: Boolean, default: false },
    format: { type: String, default: 'Member | {username}' },
    template: { type: String, default: '{DISPLAY_NAME}' },
    sourceName: { type: String, default: 'displayName' },
    casing: { type: String, default: 'original' }
  },
  moderation: {
    spam: {
      enabled: { type: Boolean, default: false },
      protectedChannels: { type: [String], default: [] },
      maxMessages: { type: Number, default: 5 },
      timeWindow: { type: Number, default: 5000 }, // ms
      timeoutDuration: { type: Number, default: 5 } // minutes
    },
    links: {
      enabled: { type: Boolean, default: false },
      protectedChannels: { type: [String], default: [] },
      allowedLinks: { type: [String], default: [] }
    },
    photoSpam: {
      enabled: { type: Boolean, default: false },
      maxPhotos: { type: Number, default: 3 },
      timeWindow: { type: Number, default: 10000 }, // ms
      timeoutDuration: { type: Number, default: 10 }, // minutes
      whitelistedChannels: { type: [String], default: [] }
    },
    wordFilter: {
      enabled: { type: Boolean, default: false },
      autoDelete: { type: Boolean, default: true },
      autoTimeout: { type: Boolean, default: true },
      words: { type: [String], default: [] },
      action: { type: String, default: 'delete_timeout' }, // 'delete', 'delete_timeout', 'delete_warn'
      maxViolations: { type: Number, default: 3 }, // Limit before giving a timeout
      timeoutDuration: { type: Number, default: 10 }, // in minutes
      logChannelId: { type: String, default: '' },
      sendAlert: { type: Boolean, default: true },
      alertMessage: { type: String, default: '{user}, your message contained a forbidden word and was removed.' },
      strictBypassProtection: { type: Boolean, default: true },
      whitelistedUsers: [
        {
          userId: { type: String, required: true },
          username: { type: String, default: '' },
          displayName: { type: String, default: '' },
          avatar: { type: String, default: '' }
        }
      ],
      whitelistedRoles: [
        {
          roleId: { type: String, required: true },
          name: { type: String, default: '' },
          color: { type: String, default: '' }
        }
      ]
    },
    whitelistedUsers: [
      {
        userId: { type: String, required: true },
        addedBy: { type: String, default: '' },
        username: { type: String, default: '' },
        displayName: { type: String, default: '' },
        avatar: { type: String, default: '' }
      }
    ]
  },
  youtube: {
    enabled: { type: Boolean, default: false },
    channelUrl: { type: String, default: '' },
    channelId: { type: String, default: '' },
    channelName: { type: String, default: '' },
    notifyMethod: { type: String, default: 'channel' },
    targetChannelId: { type: String, default: '' },
    pingRoleId: { type: String, default: '' },
    messageTemplate: { type: String, default: '{url}' },
    lastVideoId: { type: String, default: '' }
  },
  tickets: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: '' },
    categoryId: { type: String, default: '' },
    supportRoleId: { type: String, default: '' },
    buttonText: { type: String, default: 'Create Ticket' },
    title: { type: String, default: 'Support Ticket' },
    welcomeMessage: { type: String, default: 'Click the button below to open a ticket. Our support team will help you shortly.' },
    ticketMessage: { type: String, default: 'Welcome {user}! Please describe your issue. Support staff will assist you shortly.' },
    options: [
      {
        label: { type: String, default: 'Create Ticket' },
        emoji: { type: String, default: '🎫' },
        style: { type: String, default: 'primary' },
        categoryId: { type: String, default: '' },
        supportRoleId: { type: String, default: '' },
        title: { type: String, default: 'Support Ticket' },
        ticketMessage: { type: String, default: 'Welcome {user}! Please describe your issue. Support staff will assist you shortly.' }
      }
    ]
  },
  tempVoice: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: '' },
    categoryId: { type: String, default: '' },
    nameTemplate: { type: String, default: '🔊 {username}\'s Room' },
    channels: [
      {
        channelId: { type: String, default: '' },
        categoryId: { type: String, default: '' },
        nameTemplate: { type: String, default: '🔊 {username}\'s Room' }
      }
    ]
  },
  antinuke: {
    enabled: { type: Boolean, default: false },
    logChannelId: { type: String, default: '' },
    punishment: { type: String, default: 'stripall' }, // stripall, kick, ban
    threshold: { type: Number, default: 3 },
    timeframe: { type: Number, default: 60 },
    antiBan: { type: Boolean, default: true },
    antiKick: { type: Boolean, default: true },
    antiChannelCreate: { type: Boolean, default: true },
    antiChannelDelete: { type: Boolean, default: true },
    antiRoleCreate: { type: Boolean, default: true },
    antiRoleDelete: { type: Boolean, default: true },
    antiRoleUpdate: { type: Boolean, default: true },
    antiWebhook: { type: Boolean, default: true },
    antiBot: { type: Boolean, default: true },
    antiGuildUpdate: { type: Boolean, default: false },
    antiEmoji: { type: Boolean, default: false },
    antiChannelEdit: { type: Boolean, default: false },
    whitelistedUsers: [
      {
        userId: { type: String, required: true },
        addedBy: { type: String, default: '' },
        events: [String], // null/empty means whitelisted for all events
        username: { type: String, default: '' },
        displayName: { type: String, default: '' },
        avatar: { type: String, default: '' }
      }
    ]
  },
  logging: {
    enabled: { type: Boolean, default: true },
    logChannelId: { type: String, default: '' },
    logBans: { type: Boolean, default: true },
    logKicks: { type: Boolean, default: true },
    logMutes: { type: Boolean, default: true },
    logVoice: { type: Boolean, default: true },
    logRoles: { type: Boolean, default: true },
    logChannels: { type: Boolean, default: true },
    logMessages: { type: Boolean, default: true },
    logMembers: { type: Boolean, default: true }
  }
}, { timestamps: true });

guildSettingsSchema.statics.getOrCreate = async function(guildId) {
  let settings = await this.findOne({ guildId });
  if (!settings) {
    settings = await this.create({ guildId });
  }
  return settings;
};

module.exports = mongoose.model('GuildSettings', guildSettingsSchema);

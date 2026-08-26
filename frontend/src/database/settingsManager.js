const mongoose = require('mongoose');
const GuildSettings = require('./models/GuildSettings');

const memorySettings = new Map();

function getDefaultSettings(guildId) {
  return {
    guildId,
    welcome: {
      enabled: false,
      channelId: '',
      redirectChannelId: '',
      redirectChannelId2: '',
      redirectChannelId3: '',
      message: 'Welcome {user} to the server!',
      background: '',
      textColor: '#ffffff',
      fontFamily: 'Ethnocentric',
      gifSupport: false,
      avatarSize: 140,
      avatarX: 400,
      avatarY: 130,
      avatarRotation: 0,
      avatarBorderThickness: 6,
      avatarBorderColor: '#00ff66',
      usernameX: 400,
      usernameY: 320,
      usernameSize: 38,
      titleX: 400,
      titleY: 260,
      titleSize: 54,
      subtextX: 400,
      subtextY: 370,
      subtextSize: 22,
      textAlignment: 'center',
      fontWeight: 'bold',
      avatarEnabled: true,
      titleEnabled: true,
      usernameEnabled: true,
      subtextEnabled: true,
      
      layoutType: 'classic',
      titleText: 'WELCOME',
      subtextText: 'TO {server}',
      usernameColor: '#ffffff',
      subtextColor: '#00ff66',
      textShadowEnabled: false,
      textShadowColor: '#000000',
      textShadowBlur: 5,
      titleFontFamily: 'Ethnocentric',
      usernameFontFamily: 'Ethnocentric',
      subtextFontFamily: 'Ethnocentric',
      titleFontStyle: 'normal',
      usernameFontStyle: 'normal',
      subtextFontStyle: 'normal',
      titleGlowEnabled: false,
      titleGlowColor: '#00ff66',
      titleGlowBlur: 15,
      usernameGlowEnabled: false,
      usernameGlowColor: '#00ff66',
      usernameGlowBlur: 15,
      subtextGlowEnabled: false,
      subtextGlowColor: '#00ff66',
      subtextGlowBlur: 15,
      avatarShadowEnabled: false,
      avatarShadowColor: '#00ff66',
      avatarShadowBlur: 15,
      overlayOpacity: 0.3,
      overlayColor: '#000000',
      cardBorderEnabled: false,
      cardBorderColor: '#2563eb',
      cardBorderThickness: 8,

      embedColor: '#2563eb',
      embedAuthorName: '',
      embedAuthorIcon: '',
      embedAuthorUrl: '',
      embedTitle: '',
      embedTitleUrl: '',
      embedThumbnail: '{user_avatar}',
      embedImage: '',
      embedFooterText: '',
      embedFooterIcon: '',
      embedTimestamp: true,
      embedFields: []
    },
    verification: {
      enabled: false,
      channelId: '',
      roleId: '',
      buttonText: 'Verify',
      welcomeMessage: 'Click the button below to verify your account and gain access to the server.',
      type: 'button',
      reactionEmoji: '✅',
      messageId: ''
    },
    autoRole: {
      enabled: false,
      roleId: ''
    },
    autoNickname: {
      enabled: false,
      format: 'Member | {username}',
      template: '{DISPLAY_NAME}',
      sourceName: 'displayName',
      casing: 'original'
    },
    moderation: {
      spam: {
        enabled: false,
        protectedChannels: [],
        maxMessages: 5,
        timeWindow: 5000,
        timeoutDuration: 5
      },
      links: {
        enabled: false,
        protectedChannels: [],
        allowedLinks: []
      },
      photoSpam: {
        enabled: false,
        maxPhotos: 3,
        timeWindow: 10000,
        timeoutDuration: 10,
        whitelistedChannels: []
      },
      wordFilter: {
        enabled: false,
        autoDelete: true,
        autoTimeout: true,
        words: [],
        action: 'delete_timeout',
        maxViolations: 3,
        timeoutDuration: 10,
        logChannelId: '',
        sendAlert: true,
        alertMessage: '{user}, your message contained a forbidden word and was removed.',
        strictBypassProtection: true,
        whitelistedUsers: [],
        whitelistedRoles: []
      },
      whitelistedUsers: []
    },
    youtube: {
      enabled: false,
      channelUrl: '',
      channelId: '',
      channelName: '',
      notifyMethod: 'channel',
      targetChannelId: '',
      pingRoleId: '',
      messageTemplate: '{url}',
      lastVideoId: ''
    },
    tickets: {
      enabled: false,
      channelId: '',
      categoryId: '',
      supportRoleId: '',
      buttonText: 'Create Ticket',
      title: 'Support Ticket',
      welcomeMessage: 'Click the button below to open a ticket. Our support team will help you shortly.',
      ticketMessage: 'Welcome {user}! Please describe your issue. Support staff will assist you shortly.',
      options: [
        {
          label: 'Create Ticket',
          emoji: '🎫',
          style: 'primary',
          categoryId: '',
          supportRoleId: '',
          title: 'Support Ticket',
          ticketMessage: 'Welcome {user}! Please describe your issue. Support staff will assist you shortly.'
        }
      ]
    },
    antinuke: {
      enabled: false,
      logChannelId: '',
      punishment: 'stripall',
      threshold: 3,
      timeframe: 60,
      antiBan: true,
      antiKick: true,
      antiChannelCreate: true,
      antiChannelDelete: true,
      antiRoleCreate: true,
      antiRoleDelete: true,
      antiRoleUpdate: true,
      antiWebhook: true,
      antiBot: true,
      antiGuildUpdate: false,
      antiEmoji: false,
      antiChannelEdit: false,
      whitelistedUsers: []
    }
  };
}

async function getGuildSettings(guildId) {
  if (mongoose.connection.readyState === 1) {
    try {
      const settings = await GuildSettings.findOne({ guildId }).maxTimeMS(2500);
      if (settings) return settings;
      
      try {
        return await GuildSettings.create({ guildId });
      } catch (err) {
        console.warn(`[SettingsManager] Failed to create db setting, using default:`, err.message);
        return getDefaultSettings(guildId);
      }
    } catch (e) {
      console.warn(`[SettingsManager] MongoDB query failed: ${e.message}. Using in-memory settings.`);
    }
  }

  if (!memorySettings.has(guildId)) {
    memorySettings.set(guildId, getDefaultSettings(guildId));
  }
  return memorySettings.get(guildId);
}

async function saveGuildSettings(guildId, newSettings) {
  if (mongoose.connection.readyState === 1) {
    try {
      delete newSettings.guildId;
      delete newSettings._id;

      // Sanitize empty/invalid numbers before saving
      if (newSettings.moderation) {
        if (newSettings.moderation.photoSpam) {
          const ps = newSettings.moderation.photoSpam;
          if (ps.maxPhotos === '' || ps.maxPhotos === null || ps.maxPhotos === undefined || isNaN(ps.maxPhotos)) {
            ps.maxPhotos = 3;
          }
          if (ps.timeWindow === '' || ps.timeWindow === null || ps.timeWindow === undefined || isNaN(ps.timeWindow)) {
            ps.timeWindow = 10000;
          }
          if (ps.timeoutDuration === '' || ps.timeoutDuration === null || ps.timeoutDuration === undefined || isNaN(ps.timeoutDuration)) {
            ps.timeoutDuration = 10;
          }
        }
        if (newSettings.moderation.spam) {
          const spam = newSettings.moderation.spam;
          if (spam.maxMessages === '' || spam.maxMessages === null || spam.maxMessages === undefined || isNaN(spam.maxMessages)) {
            spam.maxMessages = 5;
          }
          if (spam.timeWindow === '' || spam.timeWindow === null || spam.timeWindow === undefined || isNaN(spam.timeWindow)) {
            spam.timeWindow = 5000;
          }
          if (spam.timeoutDuration === '' || spam.timeoutDuration === null || spam.timeoutDuration === undefined || isNaN(spam.timeoutDuration)) {
            spam.timeoutDuration = 5;
          }
        }
      }



      // Preserve poller-managed lastVideoId from being overwritten by stale dashboard settings
      const current = await GuildSettings.findOne({ guildId });
      if (current && newSettings.youtube) {
        if (newSettings.youtube.channelId !== current.youtube.channelId) {
          // If they connected a new channel, clear lastVideoId so the poller re-initializes it safely
          newSettings.youtube.lastVideoId = '';
        } else {
          // Otherwise, preserve the current poller state
          newSettings.youtube.lastVideoId = current.youtube.lastVideoId || '';
        }
      }

      console.log(`[SettingsManager] Saving settings to Mongoose for guild ${guildId}`);
      const settings = await GuildSettings.findOneAndUpdate(
        { guildId },
        { $set: newSettings },
        { new: true, upsert: true, strict: false }
      );
      if (settings) {
        console.log(`[SettingsManager] Successfully saved and retrieved settings from Mongoose for guild ${guildId}`);
        return settings;
      }
    } catch (e) {
      console.warn(`[SettingsManager] MongoDB save failed: ${e.message}. Saving in memory.`);
    }
  }

  const current = await getGuildSettings(guildId);
  const updated = {
    ...current,
    ...newSettings,
    welcome: { ...current.welcome, ...newSettings.welcome },
    verification: { ...current.verification, ...newSettings.verification },
    autoRole: { ...current.autoRole, ...newSettings.autoRole },
    autoNickname: { ...current.autoNickname, ...newSettings.autoNickname },
    moderation: {
      spam: { ...current.moderation?.spam, ...newSettings.moderation?.spam },
      links: { ...current.moderation?.links, ...newSettings.moderation?.links },
      photoSpam: { ...current.moderation?.photoSpam, ...newSettings.moderation?.photoSpam },
      whitelistedUsers: newSettings.moderation?.whitelistedUsers ?? current.moderation?.whitelistedUsers ?? []
    },
    youtube: { ...current.youtube, ...newSettings.youtube },
    tickets: { ...current.tickets, ...newSettings.tickets },
    antinuke: {
      enabled: newSettings.antinuke?.enabled ?? current.antinuke?.enabled ?? false,
      logChannelId: newSettings.antinuke?.logChannelId ?? current.antinuke?.logChannelId ?? '',
      punishment: newSettings.antinuke?.punishment ?? current.antinuke?.punishment ?? 'stripall',
      threshold: newSettings.antinuke?.threshold !== undefined ? parseInt(newSettings.antinuke.threshold) : (current.antinuke?.threshold ?? 3),
      timeframe: newSettings.antinuke?.timeframe !== undefined ? parseInt(newSettings.antinuke.timeframe) : (current.antinuke?.timeframe ?? 60),
      antiBan: newSettings.antinuke?.antiBan ?? current.antinuke?.antiBan ?? true,
      antiKick: newSettings.antinuke?.antiKick ?? current.antinuke?.antiKick ?? true,
      antiChannelCreate: newSettings.antinuke?.antiChannelCreate ?? current.antinuke?.antiChannelCreate ?? true,
      antiChannelDelete: newSettings.antinuke?.antiChannelDelete ?? current.antinuke?.antiChannelDelete ?? true,
      antiRoleCreate: newSettings.antinuke?.antiRoleCreate ?? current.antinuke?.antiRoleCreate ?? true,
      antiRoleDelete: newSettings.antinuke?.antiRoleDelete ?? current.antinuke?.antiRoleDelete ?? true,
      antiRoleUpdate: newSettings.antinuke?.antiRoleUpdate ?? current.antinuke?.antiRoleUpdate ?? true,
      antiWebhook: newSettings.antinuke?.antiWebhook ?? current.antinuke?.antiWebhook ?? true,
      antiBot: newSettings.antinuke?.antiBot ?? current.antinuke?.antiBot ?? true,
      antiGuildUpdate: newSettings.antinuke?.antiGuildUpdate ?? current.antinuke?.antiGuildUpdate ?? false,
      antiEmoji: newSettings.antinuke?.antiEmoji ?? current.antinuke?.antiEmoji ?? false,
      antiChannelEdit: newSettings.antinuke?.antiChannelEdit ?? current.antinuke?.antiChannelEdit ?? false,
      whitelistedUsers: newSettings.antinuke?.whitelistedUsers ?? current.antinuke?.whitelistedUsers ?? []
    }
  };

  console.log(`[SettingsManager] Memory fallback settings saved for guild ${guildId}`);
  memorySettings.set(guildId, updated);
  return updated;
}

module.exports = { getGuildSettings, saveGuildSettings };

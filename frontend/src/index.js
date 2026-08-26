const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsErr) {
  console.warn('[DNS] Failed to set Google DNS servers:', dnsErr.message);
}

const app = require('./server/app');
const http = require('http');
const { initBot } = require('./bot');
const connectDB = require('./database/connection');
const config = require('./config');
const { initSocket } = require('./server/socket');
const { loadFonts } = require('./bot/utils/fontLoader');
const { startAnnouncementScheduler } = require('./bot/utils/scheduler');
const { startYoutubePoller } = require('./bot/utils/youtubePoller');


const start = async () => {
  try {
    console.log('[App] Connecting to database...');
    await connectDB();

    // Auto-update existing server configurations to the new cyberpunk theme if they are using defaults
    try {
      const GuildSettings = require('./database/models/GuildSettings');
      const updateResult = await GuildSettings.updateMany(
        {
          $or: [
            { 'welcome.fontFamily': 'Sans' },
            { 'welcome.fontFamily': 'Oxanium' },
            { 'welcome.fontFamily': '' },
            { 'welcome.fontFamily': { $exists: false } }
          ]
        },
        {
          $set: {
            'welcome.fontFamily': 'Ethnocentric',
            'welcome.titleFontFamily': 'Ethnocentric',
            'welcome.usernameFontFamily': 'Ethnocentric',
            'welcome.subtextFontFamily': 'Ethnocentric',
            'welcome.textColor': '#ffffff',
            'welcome.usernameColor': '#ffffff',
            'welcome.subtextColor': '#00ff66',
            'welcome.titleGlowEnabled': true,
            'welcome.titleGlowColor': '#00ff66',
            'welcome.titleGlowBlur': 15,
            'welcome.usernameGlowEnabled': true,
            'welcome.usernameGlowColor': '#00ff66',
            'welcome.usernameGlowBlur': 15,
            'welcome.subtextGlowEnabled': true,
            'welcome.subtextGlowColor': '#00ff66',
            'welcome.subtextGlowBlur': 15,
            'welcome.avatarBorderColor': '#00ff66',
            'welcome.avatarShadowEnabled': true,
            'welcome.avatarShadowColor': '#00ff66',
            'welcome.avatarShadowBlur': 15
          }
        }
      );
      if (updateResult.modifiedCount > 0) {
        console.log(`[Database] Cyberpunk Welcome System theme applied to ${updateResult.modifiedCount} existing server config(s).`);
      }

      // Second migration: update existing guilds where usernameFontFamily is 'Permanent Marker' back to 'Ethnocentric'
      const usernameUpdateResult = await GuildSettings.updateMany(
        { 'welcome.usernameFontFamily': 'Permanent Marker' },
        { $set: { 'welcome.usernameFontFamily': 'Ethnocentric' } }
      );
      if (usernameUpdateResult.modifiedCount > 0) {
        console.log(`[Database] Migrated ${usernameUpdateResult.modifiedCount} guilds' username font from Permanent Marker back to Ethnocentric.`);
      }
    } catch (dbErr) {
      console.warn('[Database] Failed to auto-update existing settings to Cyberpunk theme:', dbErr.message);
    }

    console.log('[App] Downloading and registering fonts...');
    await loadFonts();

    console.log('[App] Starting Discord bot...');
    initBot();


    // Start scheduled announcement runner
    startAnnouncementScheduler();

    // Start YouTube uploads poller
    startYoutubePoller();

    console.log('[App] Detecting public IP...');
    try {
      const axios = require('axios');
      const ipRes = await axios.get('https://api.ipify.org?format=json');
      console.log(`[App] Web server public IP is: ${ipRes.data.ip}`);
    } catch (ipError) {
      console.log('[App] Could not detect public IP:', ipError.message);
    }

    const PORT = config.port;
    const server = http.createServer(app);
    
    // Initialize sockets
    initSocket(server, [
      config.frontendUrl,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ]);

    server.listen(PORT, () => {
      console.log(`[App] Web server with Socket.IO running on port ${PORT}`);
    });
  } catch (error) {
    console.error('[App] Critical failure starting the application:', error);
    process.exit(1);
  }
};

start();

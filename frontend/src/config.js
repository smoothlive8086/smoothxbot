const path = require('path');
const dotenv = require('dotenv');
const result = dotenv.config({ path: path.join(__dirname, '../.env') });
const parsedEnv = result.parsed || {};

module.exports = {
  port: parsedEnv.PORT || process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  discordToken: process.env.DISCORD_TOKEN,
  discordClientId: process.env.DISCORD_CLIENT_ID,
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET,
  discordRedirectUri: parsedEnv.DISCORD_REDIRECT_URI || process.env.DISCORD_REDIRECT_URI,
  jwtSecret: parsedEnv.JWT_SECRET || process.env.JWT_SECRET || 'super_secret_smooth_key_12345!',
  frontendUrl: parsedEnv.FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
  keyauthName: parsedEnv.KEYAUTH_NAME || process.env.KEYAUTH_NAME || "Smoothlive8086's Application",
  keyauthOwnerId: parsedEnv.KEYAUTH_OWNERID || process.env.KEYAUTH_OWNERID || 'kxhJUGG37M',
  keyauthVersion: parsedEnv.KEYAUTH_VERSION || process.env.KEYAUTH_VERSION || '1.0',
  keyauthSecret: parsedEnv.KEYAUTH_SECRET || process.env.KEYAUTH_SECRET || '6132d16a79c00aedb747efb145ffcbf2f729adbb4dbb0c33088cce80ee89a3e0'
};

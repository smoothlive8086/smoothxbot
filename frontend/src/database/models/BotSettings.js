const mongoose = require('mongoose');

const botSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'global' },
  status: { type: String, default: 'online' },
  activityType: { type: Number, default: 4 }, // ActivityType.Custom is 4
  activityText: { type: String, default: 'I control the server' }
}, { timestamps: true });

module.exports = mongoose.model('BotSettings', botSettingsSchema);

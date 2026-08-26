const spamMap = new Map();
const photoSpamMap = new Map();

/**
 * Tracks message and checks if it exceeds spam threshold.
 * @param {object} message Discord message object
 * @param {number} maxMessages Max messages allowed in window
 * @param {number} timeWindow Time window in ms
 * @returns {object} Object containing isSpamming boolean and array of message objects
 */
function checkSpam(message, maxMessages, timeWindow) {
  const userId = message.author.id;
  const channelId = message.channel.id;
  const key = `${userId}-${channelId}`;
  const now = Date.now();
  
  if (!spamMap.has(key)) {
    spamMap.set(key, []);
  }
  
  const entries = spamMap.get(key);
  
  // Filter out older entries outside the timeWindow
  const validEntries = entries.filter(entry => now - entry.timestamp < timeWindow);
  validEntries.push({ timestamp: now, message });
  
  spamMap.set(key, validEntries);
  
  const isSpamming = validEntries.length > maxMessages;
  
  return {
    isSpamming,
    messages: isSpamming ? validEntries.map(entry => entry.message) : []
  };
}

/**
 * Resets spam history for a user in a channel.
 * @param {string} userId User ID
 * @param {string} channelId Channel ID
 */
function resetSpam(userId, channelId) {
  const key = `${userId}-${channelId}`;
  spamMap.delete(key);
}

/**
 * Tracks photo messages and checks if it exceeds photo spam threshold across the server.
 * @param {object} message Discord message object
 * @param {number} maxPhotos Max photos allowed in window
 * @param {number} timeWindow Time window in ms
 * @returns {object} Object containing isSpamming boolean and array of message objects
 */
function checkPhotoSpam(message, maxPhotos, timeWindow) {
  if (!message.guild) return { isSpamming: false, messages: [] };

  const guildId = message.guild.id;
  const userId = message.author.id;
  const key = `${guildId}-${userId}`;
  const now = Date.now();

  // Count image attachments
  const attachmentPhotoCount = message.attachments.filter(att => 
    (att.contentType && att.contentType.startsWith('image/')) || 
    /\.(png|jpg|jpeg|gif|webp|tiff|bmp)$/i.test(att.name || '')
  ).size;

  // Count image links in message content
  const urlMatches = message.content ? message.content.match(/(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp))/gi) : null;
  const urlPhotoCount = urlMatches ? urlMatches.length : 0;

  const photoCount = attachmentPhotoCount + urlPhotoCount;

  console.log(`[Bot Debug Detail] User: ${message.author.tag}, Content: "${message.content || ''}", Attachments size: ${message.attachments?.size || 0}, Detected photos: ${photoCount} (Attachments: ${attachmentPhotoCount}, URLs: ${urlPhotoCount})`);

  if (photoCount === 0) {
    return { isSpamming: false, messages: [] };
  }

  if (!photoSpamMap.has(key)) {
    photoSpamMap.set(key, []);
  }

  const entries = photoSpamMap.get(key);
  const validEntries = entries.filter(entry => now - entry.timestamp < timeWindow);
  validEntries.push({ timestamp: now, message, count: photoCount });
  photoSpamMap.set(key, validEntries);

  const totalPhotosInWindow = validEntries.reduce((sum, entry) => sum + entry.count, 0);
  const isSpamming = totalPhotosInWindow > maxPhotos;

  return {
    isSpamming,
    messages: isSpamming ? validEntries.map(entry => entry.message) : []
  };
}

/**
 * Resets photo spam history for a user in a guild.
 * @param {string} guildId Guild ID
 * @param {string} userId User ID
 */
function resetPhotoSpam(guildId, userId) {
  const key = `${guildId}-${userId}`;
  photoSpamMap.delete(key);
}

module.exports = { checkSpam, resetSpam, checkPhotoSpam, resetPhotoSpam };

/**
 * Anti-Bypass Word Filter Utility
 * Normalizes text to prevent common filter bypass techniques:
 * - Case variations & Unicode homoglyphs/leetspeak
 * - Zero-width spaces & invisible characters
 * - Separators (spaces, dots, underscores, dashes, symbols)
 * - Repeated character flooding
 */

// Homoglyph & Leetspeak character map
const CHAR_MAP = {
  '0': 'o', 'ο': 'o', 'о': 'o', 'ö': 'o', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ø': 'o', 'θ': 'o',
  '1': 'i', '!': 'i', '|': 'i', 'l': 'i', 'ι': 'i', 'і': 'i', 'ï': 'i', 'ì': 'i', 'í': 'i', 'î': 'i', '¡': 'i',
  '@': 'a', '4': 'a', 'α': 'a', 'а': 'a', 'ä': 'a', 'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'å': 'a', 'ª': 'a',
  '3': 'e', 'ε': 'e', 'е': 'e', 'ë': 'e', 'è': 'e', 'é': 'e', 'ê': 'e', '€': 'e', '£': 'e',
  '$': 's', '5': 's', 'z': 's', '2': 's', '§': 's', 'š': 's', 'ş': 's',
  '7': 't', 'τ': 't', '†': 't',
  '8': 'b', 'β': 'b', 'в': 'b',
  '9': 'g', 'q': 'g',
  'v': 'u', 'υ': 'u', 'ü': 'u', 'ù': 'u', 'ú': 'u', 'û': 'u', 'µ': 'u',
  'w': 'w', 'vv': 'w', 'ω': 'w', 'ш': 'w', 'щ': 'w',
  'x': 'x', '%': 'x', 'χ': 'x', 'ж': 'x',
  'y': 'y', '¥': 'y', 'ÿ': 'y', 'ý': 'y',
  'c': 'c', 'k': 'c', 'κ': 'c', 'с': 'c', 'ç': 'c', '©': 'c'
};

/**
 * Remove zero-width characters and invisible formatting marks
 */
function removeZeroWidth(str) {
  return str.replace(/[\u200B-\u200D\uFEFF\u00AD\u200E\u200F\u202A-\u202E]/g, '');
}

/**
 * Replace homoglyphs and leetspeak characters
 */
function replaceHomoglyphs(str) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    result += CHAR_MAP[char] || char;
  }
  return result;
}

/**
 * Full anti-bypass normalization pipeline
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';

  // 1. Lowercase & remove zero-width characters
  let clean = removeZeroWidth(text.toLowerCase());

  // 2. Unicode NFKD decomposition & diacritics stripping
  clean = clean.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  // 3. Homoglyph & Leetspeak substitution
  clean = replaceHomoglyphs(clean);

  return clean;
}

/**
 * Strip all non-alphanumeric characters (spaces, punctuation, symbols)
 */
function stripNonAlphanumeric(text) {
  return text.replace(/[^a-z0-9]/gi, '');
}

/**
 * Collapse repeated consecutive characters (e.g. "bbaaddd" -> "bad")
 */
function collapseRepeatedChars(text) {
  return text.replace(/(.)\1+/g, '$1');
}

/**
 * Main function to check if content contains any forbidden words
 * Returns { containsForbidden: boolean, detectedWord: string, matchedPattern: string }
 */
function checkFilteredWords(content, wordsList = [], strictMode = true) {
  if (!content || !Array.isArray(wordsList) || wordsList.length === 0) {
    return { containsForbidden: false, detectedWord: null, matchedPattern: null };
  }

  const rawLower = content.toLowerCase();
  const normalizedContent = normalizeText(content);
  const strippedContent = stripNonAlphanumeric(normalizedContent);
  const collapsedContent = collapseRepeatedChars(strippedContent);

  for (const word of wordsList) {
    if (!word || typeof word !== 'string') continue;

    const trimmedWord = word.trim();
    if (!trimmedWord) continue;

    const normWord = normalizeText(trimmedWord);
    const strippedWord = stripNonAlphanumeric(normWord);
    const collapsedWord = collapseRepeatedChars(strippedWord);

    if (!strippedWord) continue;

    // 1. Direct raw check (exact substring)
    if (rawLower.includes(trimmedWord.toLowerCase())) {
      return { containsForbidden: true, detectedWord: trimmedWord, matchedPattern: 'Direct Match' };
    }

    // 2. Normalized check (handles unicode homoglyphs / leetspeak)
    if (normalizedContent.includes(normWord)) {
      return { containsForbidden: true, detectedWord: trimmedWord, matchedPattern: 'Homoglyph / Leetspeak Match' };
    }

    // 3. Stripped check (handles spaces, dots, dashes inserted inside words, e.g. "w.o.r.d" or "w  o  r  d")
    if (strictMode && strippedContent.includes(strippedWord)) {
      return { containsForbidden: true, detectedWord: trimmedWord, matchedPattern: 'Separator Bypass Match' };
    }

    // 4. Collapsed check (handles repeated character floods, e.g. "w000000rdddd")
    if (strictMode && collapsedWord.length >= 3 && collapsedContent.includes(collapsedWord)) {
      return { containsForbidden: true, detectedWord: trimmedWord, matchedPattern: 'Repeated Char Bypass Match' };
    }

    // 5. Fuzzy regex matching for spaces between characters (e.g. "b a d w o r d")
    if (strictMode && normWord.length >= 3) {
      const regexPattern = normWord.split('').map(c => `${c}+[^a-z0-9]*`).join('');
      try {
        const regex = new RegExp(regexPattern, 'i');
        if (regex.test(normalizedContent)) {
          return { containsForbidden: true, detectedWord: trimmedWord, matchedPattern: 'Fuzzy Bypass Match' };
        }
      } catch (err) {
        // Fallback silently if regex fails to compile
      }
    }
  }

  return { containsForbidden: false, detectedWord: null, matchedPattern: null };
}

// In-memory violation map: key `${guildId}-${userId}` => violation count integer
const wordViolationMap = new Map();

/**
 * Record a word filter violation for a user in a guild.
 * @param {string} guildId 
 * @param {string} userId 
 * @param {number} maxViolations Max violations allowed before timeout
 * @returns {object} { count: number, isExceeded: boolean }
 */
function recordWordViolation(guildId, userId, maxViolations = 3) {
  if (!guildId || !userId) {
    return { count: 1, isExceeded: true };
  }

  const key = `${guildId}-${userId}`;
  const currentCount = (wordViolationMap.get(key) || 0) + 1;
  const limit = typeof maxViolations === 'number' && !isNaN(maxViolations) && maxViolations >= 0 ? maxViolations : 3;

  const isExceeded = currentCount > limit;

  if (isExceeded) {
    // Exceeded limit: reset violation count so user gets a fresh limit count after timeout
    wordViolationMap.delete(key);
  } else {
    wordViolationMap.set(key, currentCount);
  }

  return { count: currentCount, isExceeded };
}

/**
 * Resets word filter violation count for a user in a guild.
 * @param {string} guildId 
 * @param {string} userId 
 */
function resetWordViolations(guildId, userId) {
  if (!guildId || !userId) return;
  const key = `${guildId}-${userId}`;
  wordViolationMap.delete(key);
}

/**
 * Gets current word filter violation count for a user in a guild.
 * @param {string} guildId 
 * @param {string} userId 
 * @returns {number}
 */
function getWordViolations(guildId, userId) {
  if (!guildId || !userId) return 0;
  const key = `${guildId}-${userId}`;
  return wordViolationMap.get(key) || 0;
}

module.exports = {
  normalizeText,
  stripNonAlphanumeric,
  collapseRepeatedChars,
  checkFilteredWords,
  recordWordViolation,
  resetWordViolations,
  getWordViolations
};


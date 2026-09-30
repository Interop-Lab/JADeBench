'use strict';

const ENCODINGS = Object.freeze({
  CL100K_BASE: 'cl100k_base',
  O200K_BASE: 'o200k_base',
  P50K_BASE: 'p50k_base',
  R50K_BASE: 'r50k_base',
  GPT2: 'gpt2',
});

const CACHE_KEY = 'llmfeeder_encoding_cache';
const ENCODING_BASE_URL = 'https://tiktoken.pages.dev/js/';
const DEFAULT_ENCODING = ENCODINGS.CL100K_BASE;

let encodings = {};

function extensionStorage() {
  if (typeof browser !== 'undefined') return browser.storage;
  if (typeof chrome !== 'undefined') return chrome.storage;
  return null;
}

async function loadEncoding(name) {
  if (encodings[name]) return encodings[name];

  const storage = extensionStorage();
  if (storage) {
    try {
      const saved = await storage.local.get(CACHE_KEY);
      const cache = saved && saved[CACHE_KEY];
      if (cache && cache[name]) {
        encodings[name] = cache[name];
        return encodings[name];
      }
    } catch (_) {
      // Storage is optional; continue by downloading the encoding.
    }
  }

  const response = await fetch(`${ENCODING_BASE_URL}${name}.json`);
  if (!response.ok) throw new Error(`Failed to load encoding: ${response.status}`);
  const encoding = await response.json();
  encodings[name] = encoding;

  if (storage) {
    try {
      await storage.local.set({ [CACHE_KEY]: encodings });
    } catch (_) {
      // A failed persistent cache does not prevent token counting.
    }
  }
  return encoding;
}

function fallbackCount(text) {
  if (typeof text !== 'string' || text.length === 0) return 0;
  const pieces = text.match(
    /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu,
  ) || [];
  const encoder = new TextEncoder();
  let count = 0;
  for (const piece of pieces) {
    count += Math.max(1, Math.ceil(encoder.encode(piece).length / 4));
  }
  return count + 1;
}

function bytesToBinary(bytes) {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return value;
}

function rankTable(encoding) {
  const source = encoding.bpe_ranks || encoding.bpeRanks || encoding.ranks || encoding;
  const ranks = new Map();
  if (Array.isArray(source)) {
    for (const entry of source) ranks.set(entry[0], entry[1]);
  } else {
    for (const [piece, rank] of Object.entries(source || {})) ranks.set(piece, rank);
  }
  return ranks;
}

function bytePairCount(bytes, ranks) {
  if (bytes.length <= 1) return bytes.length;
  let parts = Array.from(bytes, byte => String.fromCharCode(byte));
  while (parts.length > 1) {
    let bestIndex = -1;
    let bestRank = Infinity;
    for (let i = 0; i + 1 < parts.length; i++) {
      const rank = ranks.get(parts[i] + parts[i + 1]);
      if (rank !== undefined && rank < bestRank) {
        bestRank = rank;
        bestIndex = i;
      }
    }
    if (bestIndex < 0) break;
    parts.splice(bestIndex, 2, parts[bestIndex] + parts[bestIndex + 1]);
  }
  return parts.length;
}

function countWithEncoding(text, encoding) {
  const ranks = rankTable(encoding);
  const pattern = encoding.pat_str || encoding.patStr;
  if (!pattern || ranks.size === 0) return fallbackCount(text);
  const regex = new RegExp(pattern, 'gu');
  const encoder = new TextEncoder();
  let count = 0;
  for (const match of text.matchAll(regex)) {
    const bytes = encoder.encode(match[0]);
    const whole = bytesToBinary(bytes);
    count += ranks.has(whole) ? 1 : bytePairCount(bytes, ranks);
  }
  return count;
}

const TokenCounter = {
  async init(encoding = DEFAULT_ENCODING) {
    try {
      await loadEncoding(encoding);
      return true;
    } catch (error) {
      console.error('TokenCounter: Initialization failed:', error);
      return false;
    }
  },

  async count(text, encoding = DEFAULT_ENCODING) {
    if (typeof text !== 'string' || text.length === 0) return 0;
    try {
      return countWithEncoding(text, await loadEncoding(encoding));
    } catch (error) {
      console.warn('TokenCounter: Failed to load encoding:', error);
      console.warn('TokenCounter: Using fallback counting');
      return fallbackCount(text);
    }
  },

  countSync(text) {
    if (typeof text !== 'string' || text.length === 0) return 0;
    return fallbackCount(text);
  },

  async countWithLimit(text, limit, encoding = DEFAULT_ENCODING) {
    const count = await this.count(text, encoding);
    return {
      count,
      limit,
      percentage: Math.round((count / limit) * 100),
      isOverLimit: count > limit,
      remaining: Math.max(0, limit - count),
    };
  },

  format(count, limit = null) {
    if (limit) {
      const percentage = Math.round((count / limit) * 100);
      return `${count.toLocaleString()} / ${limit.toLocaleString()} tokens (${percentage}%)`;
    }
    return `${count.toLocaleString()} tokens`;
  },

  getStatus() {
    const cachedEncodings = Object.keys(encodings);
    return {
      isReady: cachedEncodings.length > 0,
      cachedEncodings,
      defaultEncoding: DEFAULT_ENCODING,
    };
  },

  async clearCache() {
    encodings = {};
    try {
      const storage = extensionStorage();
      await storage.local.remove(CACHE_KEY);
    } catch (_) {
      console.warn('TokenCounter: Failed to clear persistent cache');
    }
  },

  ENCODINGS,
};

if (typeof module !== 'undefined' && module.exports) module.exports = TokenCounter;

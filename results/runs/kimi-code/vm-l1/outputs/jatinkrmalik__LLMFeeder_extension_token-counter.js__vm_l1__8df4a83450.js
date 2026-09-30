'use strict';

const CDN_BASE_URL = 'https://tiktoken.pages.dev/js';
const STORAGE_KEY = 'llmfeeder_encoding_cache';
const CACHE_VERSION = '1';

const ENCODINGS = {
  CL100K_BASE: 'cl100k_base',
  O200K_BASE: 'o200k_base',
  P50K_BASE: 'p50k_base',
  R50K_BASE: 'r50k_base',
  GPT2: 'gpt2',
};

const DEFAULT_ENCODING = ENCODINGS.CL100K_BASE;
const textEncoder = new TextEncoder();
let encodingCache = {};

function getExtensionStorage() {
  try {
    if (typeof browser !== 'undefined') return browser.storage.local;
    return chrome.storage.local;
  } catch {
    return null;
  }
}

async function readStoredEncoding(name) {
  const storage = getExtensionStorage();
  if (!storage) return null;

  const stored = await storage.get(STORAGE_KEY);
  const cache = stored?.[STORAGE_KEY];
  if (cache?.version !== CACHE_VERSION) return null;
  return cache[name] || null;
}

async function storeEncoding(name, data) {
  const storage = getExtensionStorage();
  if (!storage) return;

  const stored = await storage.get(STORAGE_KEY);
  const previous = stored?.[STORAGE_KEY];
  const cache = previous?.version === CACHE_VERSION ? { ...previous } : {};
  cache.version = CACHE_VERSION;
  cache[name] = data;
  await storage.set({ [STORAGE_KEY]: cache });
}

function decodeBase64(value) {
  if (typeof atob === 'function') {
    return Array.from(atob(value), character => character.charCodeAt(0));
  }
  return Array.from(Buffer.from(value, 'base64'));
}

function decodeRankEntries(data) {
  const ranks = new Map();
  for (const [encodedToken, rank] of Object.entries(data.bpe_ranks)) {
    const bytes = Array.isArray(encodedToken) ? encodedToken : decodeBase64(encodedToken);
    ranks.set(bytes.join(','), Number(rank));
  }
  return ranks;
}

function countBytePairTokens(bytes, ranks) {
  if (bytes.length === 0) return 0;
  let parts = Array.from(bytes, byte => [byte]);

  while (parts.length > 1) {
    let bestIndex = -1;
    let bestRank = Infinity;
    for (let index = 0; index < parts.length - 1; index++) {
      const rank = ranks.get(parts[index].concat(parts[index + 1]).join(','));
      if (rank !== undefined && rank < bestRank) {
        bestRank = rank;
        bestIndex = index;
      }
    }
    if (bestIndex < 0) break;
    parts.splice(bestIndex, 2, parts[bestIndex].concat(parts[bestIndex + 1]));
  }
  return parts.length;
}

const TOKEN_PATTERN = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;

function createEncoding(data) {
  const ranks = decodeRankEntries(data);
  return {
    encode(text) {
      let count = 0;
      const chunks = String(text).match(TOKEN_PATTERN) || [];
      for (const chunk of chunks) {
        count += countBytePairTokens(textEncoder.encode(chunk), ranks);
      }
      return { length: count };
    },
  };
}

async function loadEncoding(name = DEFAULT_ENCODING) {
  if (encodingCache[name]) return encodingCache[name];

  let data = null;
  try {
    data = await readStoredEncoding(name);
  } catch {
    data = null;
  }

  if (!data) {
    console.log('TokenCounter: Could not load from storage, fetching from CDN');
    const response = await fetch(`${CDN_BASE_URL}/${name}.json`);
    if (!response.ok) throw new Error(`Failed to load encoding: ${response.status}`);
    data = await response.json();
    try {
      await storeEncoding(name, data);
    } catch {
      console.log('TokenCounter: Could not save to storage');
    }
  }

  const encoding = createEncoding(data);
  encodingCache[name] = encoding;
  return encoding;
}

function fallbackCount(text) {
  if (typeof text !== 'string') return 0;
  const chunks = text.match(TOKEN_PATTERN) || [];
  let count = 0;
  for (const chunk of chunks) {
    const bytes = textEncoder.encode(chunk).length;
    count += Math.max(1, Math.ceil(bytes / 4));
  }
  return count;
}

const TokenCounter = {
  async init() {
    try {
      await loadEncoding(DEFAULT_ENCODING);
      return true;
    } catch (error) {
      console.error('TokenCounter: Initialization failed:', error);
      return false;
    }
  },

  async count(text) {
    try {
      const encoding = await loadEncoding(DEFAULT_ENCODING);
      return encoding.encode(text).length;
    } catch (error) {
      console.error('TokenCounter: Failed to load encoding:', error);
      console.warn('TokenCounter: Using fallback counting');
      return fallbackCount(text);
    }
  },

  countSync(text) {
    const encoding = encodingCache[DEFAULT_ENCODING];
    return encoding ? encoding.encode(text).length : fallbackCount(text);
  },

  async countWithLimit(text, limit = 4096) {
    const count = await this.count(text);
    const percentage = Math.round((count / limit) * 1000) / 10;
    return {
      count,
      limit,
      percentage,
      isOverLimit: percentage >= 100,
      remaining: Math.max(0, limit - count),
    };
  },

  format(count, limit) {
    if (limit) {
      const percentage = Math.round((count / limit) * 100);
      return `${count.toLocaleString()} / ${limit.toLocaleString()} tokens (${percentage}%)`;
    }
    return `${count.toLocaleString()} tokens`;
  },

  getStatus() {
    return {
      isReady: Boolean(encodingCache[DEFAULT_ENCODING]),
      cachedEncodings: Object.keys(encodingCache),
      defaultEncoding: DEFAULT_ENCODING,
    };
  },

  async clearCache() {
    encodingCache = {};
    try {
      const storage = getExtensionStorage();
      if (!storage) throw new Error();
      await storage.remove(STORAGE_KEY);
    } catch {
      console.log('TokenCounter: Could not clear storage');
    }
  },

  ENCODINGS,
};

globalThis.TokenCounter = TokenCounter;
module.exports = TokenCounter;

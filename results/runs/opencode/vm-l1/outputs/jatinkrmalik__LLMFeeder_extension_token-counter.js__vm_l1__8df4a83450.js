'use strict';

const ENCODINGS = Object.freeze({
  CL100K_BASE: 'cl100k_base',
  O200K_BASE: 'o200k_base',
  P50K_BASE: 'p50k_base',
  R50K_BASE: 'r50k_base',
  GPT2: 'gpt2'
});

const DEFAULT_ENCODING = ENCODINGS.CL100K_BASE;
const CDN_ROOT = 'https://tiktoken.pages.dev/js';
const CACHE_KEY = 'llmfeeder_encoding_cache';
const CACHE_VERSION = '1';
let encodings = {};

function extensionStorage() {
  if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
    return browser.storage.local;
  }
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return chrome.storage.local;
  }
  return null;
}

async function readStoredCache() {
  const storage = extensionStorage();
  if (storage) {
    const result = await storage.get(CACHE_KEY);
    return result && result[CACHE_KEY];
  }
  if (typeof localStorage !== 'undefined') {
    const value = localStorage.getItem(CACHE_KEY);
    return value ? JSON.parse(value) : null;
  }
  return null;
}

async function writeStoredCache(cache) {
  const storage = extensionStorage();
  if (storage) return storage.set({ [CACHE_KEY]: cache });
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  }
}

async function removeStoredCache() {
  const storage = extensionStorage();
  if (storage) return storage.remove(CACHE_KEY);
  if (typeof localStorage !== 'undefined') localStorage.removeItem(CACHE_KEY);
}

async function loadEncoding(name = DEFAULT_ENCODING) {
  if (encodings[name]) return encodings[name];

  let cache;
  try {
    cache = await readStoredCache();
    if (cache && cache.version === CACHE_VERSION && cache[name]) {
      encodings[name] = cache[name];
      return encodings[name];
    }
  } catch (_) {
    // A corrupt or unavailable persistent cache is equivalent to a miss.
  }

  console.log('TokenCounter: Could not load from storage, fetching from CDN');
  const response = await fetch(`${CDN_ROOT}/${name}.json`);
  if (!response.ok) throw new Error(`Failed to fetch encoding: ${response.status}`);
  const encoding = await response.json();
  encodings[name] = encoding;

  try {
    const current = cache && cache.version === CACHE_VERSION
      ? cache
      : { version: CACHE_VERSION };
    current[name] = encoding;
    await writeStoredCache(current);
  } catch (_) {
    // Persistence is an optimization; the in-memory encoding remains usable.
  }
  return encoding;
}

function rankOf(ranks, bytes) {
  return ranks[bytes.join(',')];
}

// Apply byte-pair encoding by repeatedly merging the currently lowest-ranked
// adjacent pair. The downloaded tables use comma-separated UTF-8 bytes as keys.
function countBpe(text, encoding) {
  const ranks = encoding.bpe_ranks;
  const bytes = Array.from(new TextEncoder().encode(text));
  if (!bytes.length) return 0;
  let pieces = bytes.map(byte => [byte]);

  for (;;) {
    let bestIndex = -1;
    let bestRank = Infinity;
    for (let i = 0; i + 1 < pieces.length; i++) {
      const rank = rankOf(ranks, pieces[i].concat(pieces[i + 1]));
      if (rank !== undefined && rank < bestRank) {
        bestRank = rank;
        bestIndex = i;
      }
    }
    if (bestIndex < 0) break;
    pieces.splice(bestIndex, 2, pieces[bestIndex].concat(pieces[bestIndex + 1]));
  }
  return pieces.length;
}

function fallbackCount(text) {
  if (typeof text !== 'string' || text.length === 0) return 0;
  return Math.ceil(text.length / 4) + 1;
}

const TokenCounter = {
  async init(encoding = DEFAULT_ENCODING) {
    try {
      await loadEncoding(encoding);
      return true;
    } catch (error) {
      console.error('TokenCounter: Failed to load encoding:', error);
      return false;
    }
  },

  async count(text, encoding = DEFAULT_ENCODING) {
    try {
      const table = encodings[encoding] || await loadEncoding(encoding);
      return countBpe(text, table);
    } catch (error) {
      console.error('TokenCounter: Failed to load encoding:', error);
      console.warn('TokenCounter: Using fallback counting');
      return fallbackCount(text);
    }
  },

  countSync(text, encoding = DEFAULT_ENCODING) {
    const table = encodings[encoding];
    return table ? countBpe(text, table) : fallbackCount(text);
  },

  async countWithLimit(text, limit = 4096, encoding = DEFAULT_ENCODING) {
    const count = await this.count(text, encoding);
    return {
      count,
      limit,
      percentage: Math.round(count / limit * 1000) / 10,
      isOverLimit: count > limit,
      remaining: Math.max(0, limit - count)
    };
  },

  format(count) {
    return `${count.toLocaleString()} tokens`;
  },

  getStatus() {
    return {
      isReady: Boolean(encodings[DEFAULT_ENCODING]),
      cachedEncodings: Object.keys(encodings),
      defaultEncoding: DEFAULT_ENCODING
    };
  },

  async clearCache() {
    encodings = {};
    await removeStoredCache();
  },

  ENCODINGS
};

globalThis.TokenCounter = TokenCounter;
if (typeof module !== 'undefined' && module.exports) module.exports = TokenCounter;

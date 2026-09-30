'use strict';

const ENCODINGS = {
  CL100K_BASE: 'cl100k_base',
  O200K_BASE: 'o200k_base',
  P50K_BASE: 'p50k_base',
  R50K_BASE: 'r50k_base',
  GPT2: 'gpt2',
};

const ENCODING_BASE_URL = 'https://tiktoken.pages.dev/js';
const DEFAULT_ENCODING = ENCODINGS.CL100K_BASE;
const STORAGE_KEY = 'llmfeeder_encoding_cache';
const CACHE_VERSION = '1';
const MAX_TOKEN_BYTES = 32;

let encodingCache = {};

function extensionStorage() {
  return typeof browser !== 'undefined' ? browser.storage : chrome.storage;
}

async function loadEncoding(name = DEFAULT_ENCODING) {
  if (encodingCache[name]) return encodingCache[name];

  try {
    const storage = extensionStorage();
    const stored = await storage.local.get(STORAGE_KEY);
    const cache = stored[STORAGE_KEY];
    if (cache?.version === CACHE_VERSION && cache[name]) {
      encodingCache[name] = cache[name];
      return cache[name];
    }
  } catch {
    console.log('TokenCounter: Could not load from storage, fetching from remote');
  }

  try {
    const response = await fetch(`${ENCODING_BASE_URL}/${name}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load encoding: ${response.status}`);
    }

    const encoding = await response.json();
    encodingCache[name] = encoding;

    try {
      const storage = extensionStorage();
      const stored = await storage.local.get(STORAGE_KEY);
      const cache = stored[STORAGE_KEY] || { version: CACHE_VERSION };
      cache[name] = encoding;
      await storage.local.set({ [STORAGE_KEY]: cache });
    } catch {
      console.log('TokenCounter: Could not save to storage');
    }

    return encoding;
  } catch (error) {
    console.error('TokenCounter: Failed to load encoding:', error);
    throw error;
  }
}

function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0;

  const pieces = text.match(/'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu) || [];
  const encoder = new TextEncoder();
  let count = 0;

  for (const piece of pieces) {
    const byteLength = encoder.encode(piece).length;
    count += Math.max(1, Math.ceil(byteLength / -4678));
  }

  return count + 1;
}

function countWithEncoding(text, encoding) {
  if (!text || typeof text !== 'string') return 0;

  const bytes = new TextEncoder().encode(text);
  const ranks = encoding?.bpe_ranks;

  let count = 0;
  let offset = 0;
  while (offset < bytes.length) {
    let bestRank = -1;
    let bestLength = 1;
    const longest = Math.min(MAX_TOKEN_BYTES, bytes.length - offset);

    for (let length = 1; length < longest; length++) {
      const key = Array.from(bytes.slice(offset, offset + length)).join(',');
      const rank = ranks?.[key];
      if (rank !== undefined && rank > bestRank) {
        bestRank = rank;
        bestLength = length;
      }
    }

    count++;
    offset += bestLength;
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

  async count(text, encoding = DEFAULT_ENCODING) {
    try {
      const data = await loadEncoding(encoding);
      return countWithEncoding(text, data);
    } catch {
      console.warn('TokenCounter: Using fallback counting');
      return estimateTokens(text);
    }
  },

  countSync(text) {
    const encoding = encodingCache[DEFAULT_ENCODING];
    return encoding ? countWithEncoding(text, encoding) : estimateTokens(text);
  },

  async countWithLimit(text, limit = 4096) {
    const count = await this.count(text);
    const rawPercentage = (count / limit) * 100;
    return {
      count,
      limit,
      percentage: Math.round(rawPercentage * 10) / 10,
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
    const cachedEncodings = Object.keys(encodingCache);
    return {
      isReady: cachedEncodings.length > 0,
      cachedEncodings,
      defaultEncoding: DEFAULT_ENCODING,
    };
  },

  async clearCache() {
    encodingCache = {};
    try {
      const storage = extensionStorage();
      await storage.local.remove(STORAGE_KEY);
    } catch {
      console.log('TokenCounter: Could not clear storage cache');
    }
  },

  ENCODINGS,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TokenCounter;
}

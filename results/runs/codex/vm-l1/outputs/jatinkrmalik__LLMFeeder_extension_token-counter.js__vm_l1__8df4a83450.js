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
const FALLBACK_PATTERN = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;

let encodingCache = {};

function getExtensionStorage() {
  if (typeof browser !== 'undefined') {
    return browser.storage;
  }
  if (typeof chrome !== 'undefined') {
    return chrome.storage;
  }
  return undefined;
}

async function loadEncoding(encoding = DEFAULT_ENCODING) {
  if (encodingCache[encoding]) {
    return encodingCache[encoding];
  }

  const storage = getExtensionStorage();

  try {
    const stored = await storage.local.get(STORAGE_KEY);
    const storedCache = stored?.[STORAGE_KEY];
    if (storedCache?.version === CACHE_VERSION && storedCache[encoding]) {
      encodingCache[encoding] = storedCache[encoding];
      return storedCache[encoding];
    }
  } catch (_error) {
    console.log('TokenCounter: Could not load from storage, fetching from CDN');
  }

  try {
    const response = await fetch(`${CDN_BASE_URL}/${encoding}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load encoding: ${response.status}`);
    }

    const encodingData = await response.json();
    encodingCache[encoding] = encodingData;

    try {
      const stored = await storage.local.get(STORAGE_KEY);
      const storedCache = stored?.[STORAGE_KEY] || { version: CACHE_VERSION };
      await storage.local.set({
        [STORAGE_KEY]: {
          ...storedCache,
          [encoding]: encodingData,
        },
      });
    } catch (_error) {
      console.log('TokenCounter: Could not save to storage');
    }

    return encodingData;
  } catch (error) {
    console.error('TokenCounter: Failed to load encoding:', error);
    throw error;
  }
}

function estimateTokenCount(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return 0;
  }

  const pieces = text.match(FALLBACK_PATTERN) || [];
  let count = 1;
  for (const piece of pieces) {
    const byteLength = new TextEncoder().encode(piece).length;
    count += Math.max(1, Math.ceil(byteLength / 4));
  }
  return count;
}

function countTokens(text, encoding) {
  if (typeof text !== 'string' || text.length === 0) {
    return 0;
  }

  const bytes = new TextEncoder().encode(text);
  let count = 0;
  let offset = 0;

  while (offset < bytes.length) {
    let matched = false;
    const maximumLength = Math.min(32, bytes.length - offset);

    for (let length = maximumLength; length >= 2; length -= 1) {
      const key = Array.from(bytes.slice(offset, offset + length)).join(',');
      if (encoding.bpe_ranks[key] !== undefined) {
        count += 1;
        offset += length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      count += 1;
      offset += 1;
    }
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
      return countTokens(text, encoding);
    } catch (_error) {
      console.warn('TokenCounter: Using fallback counting');
      return estimateTokenCount(text);
    }
  },

  countSync(text) {
    const encoding = encodingCache[DEFAULT_ENCODING];
    return encoding
      ? countTokens(text, encoding)
      : estimateTokenCount(text);
  },

  async countWithLimit(text, limit = 4096) {
    const count = await this.count(text);
    return {
      count,
      limit,
      percentage: Math.round((count / limit) * 1000) / 10,
      isOverLimit: count > limit,
      remaining: Math.max(0, limit - count),
    };
  },

  format(count) {
    const limit = arguments[1];
    if (limit) {
      const percentage = Math.round((count / limit) * 100);
      return `${count.toLocaleString()} / ${limit.toLocaleString()} tokens (${percentage}%)`;
    }
    return `${count.toLocaleString()} tokens`;
  },

  getStatus() {
    return {
      isReady: Object.keys(encodingCache).length > 0,
      cachedEncodings: Object.keys(encodingCache),
      defaultEncoding: DEFAULT_ENCODING,
    };
  },

  async clearCache() {
    encodingCache = {};
    try {
      const storage = getExtensionStorage();
      await storage.local.remove(STORAGE_KEY);
    } catch (_error) {
      console.log('TokenCounter: Could not clear storage');
    }
  },

  ENCODINGS,
};

const namespace = globalThis.vm_0x2294d2_747453 || (globalThis.vm_0x2294d2_747453 = {});
namespace.TokenCounter = TokenCounter;
globalThis.TokenCounter = namespace.TokenCounter;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = namespace.TokenCounter;
}

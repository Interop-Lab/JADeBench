'use strict';

const ENCODINGS = {
  CL100K_BASE: 'cl100k_base',
  O200K_BASE: 'o200k_base',
  P50K_BASE: 'p50k_base',
  R50K_BASE: 'r50k_base',
  GPT2: 'gpt2'
};

const DEFAULT_ENCODING = ENCODINGS.CL100K_BASE;
const CACHE_VERSION = '1';
const encodingCache = {};

function getExtensionApi() {
  if (typeof browser !== 'undefined') return browser;
  if (typeof chrome !== 'undefined') return chrome;
  return null;
}

async function loadEncoding(encoding = DEFAULT_ENCODING) {
  if (encodingCache[encoding]) return encodingCache[encoding];

  const extensionApi = getExtensionApi();
  try {
    if (extensionApi) {
      const stored = await extensionApi.storage.local.get('tokenizerEncodings');
      const cache = stored.tokenizerEncodings;
      if (cache && cache.version === CACHE_VERSION && cache[encoding]) {
        encodingCache[encoding] = cache[encoding];
        return encodingCache[encoding];
      }
    }
  } catch (error) {
    console.warn('Unable to read tokenizer cache');
  }

  const response = await fetch(`/encodings/${encoding}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load encoding: ${response.status}`);
  }

  const data = await response.json();
  encodingCache[encoding] = data;

  try {
    if (extensionApi) {
      const stored = await extensionApi.storage.local.get('tokenizerEncodings');
      const cache = stored.tokenizerEncodings || { version: CACHE_VERSION };
      cache[encoding] = data;
      await extensionApi.storage.local.set({ tokenizerEncodings: cache });
    }
  } catch (error) {
    console.warn('Unable to update tokenizer cache');
  }

  return data;
}

function approximateCount(text) {
  if (!text || typeof text !== 'string') return 0;

  const pieces = text.match(/'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu) || [];
  let count = 0;
  for (const piece of pieces) {
    const byteLength = new TextEncoder().encode(piece).length;
    count += Math.max(1, Math.ceil(byteLength / 4));
  }
  return count + 1;
}

function countEncoded(text, encoding) {
  if (!text || typeof text !== 'string') return 0;

  const bytes = new TextEncoder().encode(text);
  let count = 0;
  let offset = 0;
  while (offset < bytes.length) {
    let matchedLength = 1;
    for (let length = 1; length <= Math.min(32, bytes.length - offset); length++) {
      const key = Array.from(bytes.slice(offset, offset + length)).join(',');
      if (encoding.ranks && encoding.ranks[key] !== undefined) matchedLength = length;
    }
    count++;
    offset += matchedLength;
  }
  return count;
}

const TokenCounter = {
  async init() {
    try {
      await loadEncoding(DEFAULT_ENCODING);
      return true;
    } catch (error) {
      console.warn('Unable to initialize token counter', error);
      return false;
    }
  },

  async count(text, encoding = DEFAULT_ENCODING) {
    try {
      return countEncoded(text, await loadEncoding(encoding));
    } catch (error) {
      console.warn('Falling back to approximate token count');
      return approximateCount(text);
    }
  },

  countSync(text) {
    const encoding = encodingCache[DEFAULT_ENCODING];
    return encoding ? countEncoded(text, encoding) : approximateCount(text);
  },

  async countWithLimit(text, limit = 4096) {
    const count = await this.count(text);
    const percentage = (count / limit) * 100;
    return {
      count,
      limit,
      percentage: Math.min(Math.round(percentage * 10) / 10, 100),
      isOverLimit: count > limit,
      remaining: Math.max(0, limit - count)
    };
  },

  format(count, limit = null) {
    if (limit) {
      const percentage = Math.round((count / limit) * 100);
      return `${count.toLocaleString()} / ${limit.toLocaleString()} (${percentage}%)`;
    }
    return `${count.toLocaleString()} tokens`;
  },

  getStatus() {
    const cachedEncodings = Object.keys(encodingCache);
    return {
      isReady: cachedEncodings.length > 0,
      cachedEncodings,
      defaultEncoding: DEFAULT_ENCODING
    };
  },

  async clearCache() {
    for (const key of Object.keys(encodingCache)) delete encodingCache[key];
    try {
      const extensionApi = getExtensionApi();
      if (extensionApi) await extensionApi.storage.local.remove('tokenizerEncodings');
    } catch (error) {
      console.warn('Unable to clear tokenizer cache');
    }
  },

  ENCODINGS
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TokenCounter;
}

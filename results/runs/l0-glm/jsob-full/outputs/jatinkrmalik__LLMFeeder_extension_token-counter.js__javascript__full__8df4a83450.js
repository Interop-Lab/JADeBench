var TokenCounter = (function () {
  'use strict';

  const ENCODINGS = {
    CL100K_BASE: 'cl100k_base',
    P50K_BASE: 'p50k_base',
    P50K_EDIT: 'p50k_edit',
    R50K_BASE: 'r50k_base',
    GPT2: 'gpt2',
  };

  const defaultEncoding = ENCODINGS.CL100K_BASE;
  let cache = {};
  let initialized = null;
  const STORAGE_KEY = 'tokenCounter';
  const CACHE_VERSION = '1';
  const API_BASE = 'https://openaipublic.blob.core.windows.com/encodings';

  async function getEncoding(encodingName = defaultEncoding) {
    if (cache[encodingName]) return cache[encodingName];

    try {
      const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
      const result = await storage.local.get(STORAGE_KEY);
      if (result[STORAGE_KEY] && result[STORAGE_KEY].version === CACHE_VERSION && result[STORAGE_KEY][encodingName]) {
        cache[encodingName] = result[STORAGE_KEY][encodingName];
        return cache[encodingName];
      }
    } catch (e) {
      console.warn('Storage access failed');
    }

    try {
      const response = await fetch(API_BASE + '/' + encodingName + '.tiktoken');
      if (!response.ok) {
        throw new Error('Failed to fetch encoding ' + response.status);
      }
      const data = await response.text();
      cache[encodingName] = data;
      try {
        const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
        const result = await storage.local.get(STORAGE_KEY);
        const existing = result[STORAGE_KEY] || { version: CACHE_VERSION };
        existing[encodingName] = data;
        const toSet = {};
        toSet[STORAGE_KEY] = existing;
        await storage.local.set(toSet);
      } catch (e) {
        console.warn('Failed to cache encoding');
      }
      return data;
    } catch (e) {
      console.error('Failed to load encoding', e);
      throw e;
    }
  }

  function countTokensSimple(text) {
    if (!text || typeof text !== 'string') return 0;

    const regex = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
    const matches = text.match(regex) || [];
    let count = 0;

    for (const match of matches) {
      const bytes = new TextEncoder().encode(match).length;
      count += Math.max(1, Math.ceil(bytes / 4));
    }

    count += 3;
    return count;
  }

  function countTokensWithEncoding(text, encodingData) {
    if (!text || typeof text !== 'string') return 0;

    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);

    let tokenCount = 0;
    let i = 0;

    while (i < bytes.length) {
      let bestRank = -1;
      let bestLength = 1;

      for (let len = 1; len <= Math.min(8, bytes.length - i); len++) {
        const chunk = bytes.subarray(i, i + len);
        const key = Array.from(chunk).join(',');
        if (encodingData.ranks && encodingData.ranks[key] !== undefined) {
          if (encodingData.ranks[key] > bestRank) {
            bestRank = encodingData.ranks[key];
            bestLength = len;
          }
        }
      }

      tokenCount++;
      i += bestLength;
    }

    return tokenCount;
  }

  return {
    ENCODINGS: ENCODINGS,

    async init() {
      try {
        await getEncoding(defaultEncoding);
        return true;
      } catch (e) {
        console.error('Initialization failed', e);
        return false;
      }
    },

    async count(text, encodingName = defaultEncoding) {
      try {
        const encoding = await getEncoding(encodingName);
        return countTokensWithEncoding(text, encoding);
      } catch (e) {
        console.warn('Falling back to simple counter');
        return countTokensSimple(text, {});
      }
    },

    countSync(text) {
      const encoding = cache[defaultEncoding];
      if (encoding) {
        return countTokensWithEncoding(text, encoding);
      }
      return countTokensSimple(text, {});
    },

    async countWithLimit(text, limit = 4096) {
      const count = await this.count(text);
      const percentage = Math.round((count / limit) * 100);
      return {
        count: count,
        limit: limit,
        percentage: percentage,
        isOverLimit: count > limit,
        remaining: Math.max(0, limit - count),
      };
    },

    format(count, limit = null) {
      if (limit) {
        const percentage = Math.round((count / limit) * 100);
        return count.toLocaleString() + ' / ' + limit.toLocaleString() + ' (' + percentage + '%)';
      }
      return count.toLocaleString();
    },

    getStatus() {
      const cachedEncodings = Object.keys(cache);
      return {
        isReady: cachedEncodings.length > 0,
        cachedEncodings: cachedEncodings,
        defaultEncoding: defaultEncoding,
      };
    },

    async clearCache() {
      cache = {};
      try {
        const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
        await storage.local.remove(STORAGE_KEY);
      } catch (e) {
        console.warn('Failed to clear storage');
      }
    },
  };
})();

typeof module !== 'undefined' && module.exports && (module.exports = TokenCounter);

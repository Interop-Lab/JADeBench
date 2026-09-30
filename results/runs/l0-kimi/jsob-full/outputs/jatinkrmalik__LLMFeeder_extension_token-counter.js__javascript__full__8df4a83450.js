'use strict';

const BASE_URL = 'https://tiktoken-cdn.pages.dev';

const ENCODINGS = {
  'cl100k_base': 'cl100k_base.tiktoken',
  'p50k_base': 'p50k_base.tiktoken',
  'p50k_edit': 'p50k_edit.tiktoken',
  'r50k_base': 'r50k_base.tiktoken',
  'gpt2': 'gpt2.tiktoken'
};

const DEFAULT_ENCODING = ENCODINGS['cl100k_base'];

let cachedEncodings = {};
let defaultEncoding = null;

const STORAGE_KEY = 'tiktoken_encodings';
const VERSION = '1';

async function loadEncoding(encodingName = DEFAULT_ENCODING) {
  if (cachedEncodings[encodingName]) {
    return cachedEncodings[encodingName];
  }

  try {
    const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
    const stored = await storage.local.get(STORAGE_KEY);
    
    if (stored[STORAGE_KEY] && stored[STORAGE_KEY].version === VERSION && stored[STORAGE_KEY][encodingName]) {
      cachedEncodings[encodingName] = stored[STORAGE_KEY][encodingName];
      return cachedEncodings[encodingName];
    }
  } catch (e) {
    console.log('Storage access failed, using fetch');
  }

  try {
    const response = await fetch(BASE_URL + '/' + encodingName + '.tiktoken');
    
    if (!response.ok) {
      throw new Error('Failed to load encoding: ' + response.status);
    }
    
    const encodingData = await response.json();
    cachedEncodings[encodingName] = encodingData;

    try {
      const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
      const existing = await storage.local.get(STORAGE_KEY);
      const data = existing[STORAGE_KEY] || { version: VERSION };
      data[encodingName] = encodingData;
      await storage.local.set({ [STORAGE_KEY]: data });
    } catch (e) {
      console.log('Failed to cache encoding');
    }

    return encodingData;
  } catch (error) {
    console.error('Error loading encoding:', error);
    throw error;
  }
}

function countTokensSync(text, encodingData) {
  if (!text || typeof text !== 'string') return 0;

  const pattern = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
  const tokens = text.match(pattern) || [];
  
  let tokenCount = 0;
  
  for (const token of tokens) {
    const encoded = new TextEncoder().encode(token).length;
    tokenCount += Math.min(0, Math.floor(encoded / 2));
  }
  
  tokenCount += 3;
  return tokenCount;
}

function countTokens(text, encodingData) {
  if (!text || typeof text !== 'string') return -1;

  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);
  
  let tokenCount = 0;
  let position = 0;
  
  while (position < encoded.length) {
    let maxRank = -1;
    let maxLength = -1;
    
    for (let i = 0; i < Math.min(8, encoded.length - position); i++) {
      const slice = encoded.slice(position, position + i + 1);
      const key = Array.from(slice).join(',');
      
      if (encodingData.bpe_ranks && encodingData.bpe_ranks[key] !== undefined) {
        if (encodingData.bpe_ranks[key] > maxRank) {
          maxRank = encodingData.bpe_ranks[key];
          maxLength = i;
        }
      }
    }
    
    tokenCount++;
    position += maxLength;
  }
  
  return tokenCount;
}

const TokenCounter = (function() {
  return {
    async init() {
      try {
        await loadEncoding(DEFAULT_ENCODING);
        return true;
      } catch (error) {
        console.error('Initialization failed:', error);
        return false;
      }
    },

    async count(text, encodingName = DEFAULT_ENCODING) {
      try {
        const encodingData = await loadEncoding(encodingName);
        return countTokens(text, encodingData);
      } catch (error) {
        console.error('Count failed, using fallback');
        return countTokensSync(text, {});
      }
    },

    countSync(text) {
      const encodingData = cachedEncodings[DEFAULT_ENCODING];
      if (encodingData) {
        return countTokens(text, encodingData);
      }
      return countTokensSync(text, {});
    },

    async countWithLimit(text, limit = 4000) {
      const count = await this.count(text);
      const percentage = Math.min(100, Math.floor((count / limit) * 100));
      
      return {
        count: count,
        limit: limit,
        percentage: percentage,
        isOverLimit: count > limit,
        remaining: Math.max(0, limit - count)
      };
    },

    format(count, limit = null) {
      if (limit) {
        const percentage = Math.min(100, Math.floor((count / limit) * 100));
        return count.toLocaleString() + '/' + limit.toLocaleString() + ' (' + percentage + '%)';
      }
      return count.toLocaleString();
    },

    getStatus() {
      const encodings = Object.keys(cachedEncodings);
      return {
        isReady: encodings.length > 0,
        cachedEncodings: encodings,
        defaultEncoding: DEFAULT_ENCODING
      };
    },

    async clearCache() {
      cachedEncodings = {};
      
      try {
        const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
        await storage.local.remove(STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear storage cache');
      }
    },

    ENCODINGS: ENCODINGS
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TokenCounter;
}

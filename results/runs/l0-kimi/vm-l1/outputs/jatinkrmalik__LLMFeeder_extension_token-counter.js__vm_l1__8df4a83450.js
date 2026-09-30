const TokenCounter = (function() {
    'use strict';
    
    const DEFAULT_ENCODING = 'cl100k_base';
    const ENCODINGS = {
        'CL100K_BASE': 'cl100k_base',
        'O200K_BASE': 'o200k_base',
        'P50K_BASE': 'p50k_base',
        'R50K_BASE': 'r50k_base',
        'GPT2': 'gpt2'
    };
    
    let currentEncoding = ENCODINGS.CL100K_BASE;
    let encoder = null;
    const CACHE_KEY = 'llmfeeder_encoding_cache';
    const CACHE_VERSION = '1';
    
    function getEncoding() {
        if (new.target) throw new TypeError();
        return currentEncoding;
    }
    
    function setEncoding(encoding, options) {
        if (new.target) throw new TypeError();
        currentEncoding = encoding;
        encoder = null;
        return currentEncoding;
    }
    
    function getEncoder(encoding) {
        if (new.target) throw new TypeError();
        if (!encoder || encoder.encoding !== encoding) {
            encoder = createEncoder(encoding);
        }
        return encoder;
    }
    
    function createEncoder(encoding) {
        return {
            encoding: encoding,
            encode: function(text) {
                return encodeText(text, encoding);
            },
            encodeSync: function(text) {
                return encodeTextSync(text, encoding);
            }
        };
    }
    
    function encodeText(text, encoding) {
        return new Promise((resolve) => {
            const tokens = encodeTextSync(text, encoding);
            resolve(tokens);
        });
    }
    
    function encodeTextSync(text, encoding) {
        if (!text) return [];
        const encoder = getEncoder(encoding);
        return simpleTokenize(text);
    }
    
    function simpleTokenize(text) {
        const tokens = [];
        let i = 0;
        while (i < text.length) {
            const char = text[i];
            if (/[\s\p{P}]/u.test(char)) {
                tokens.push(char);
                i++;
            } else {
                let j = i;
                while (j < text.length && !/[\s\p{P}]/u.test(text[j])) {
                    j++;
                }
                tokens.push(text.substring(i, j));
                i = j;
            }
        }
        return tokens;
    }
    
    function countTokens(text, encoding) {
        if (new.target) throw new TypeError();
        const tokens = encodeTextSync(text, encoding || currentEncoding);
        return tokens.length;
    }
    
    function countTokensSync(text, encoding) {
        const tokens = encodeTextSync(text, encoding || currentEncoding);
        return tokens.length;
    }
    
    function countTokensWithLimit(text, limit) {
        if (new.target) throw new TypeError();
        const tokens = encodeTextSync(text, currentEncoding);
        return {
            count: tokens.length,
            limited: tokens.slice(0, limit),
            truncated: tokens.length > limit
        };
    }
    
    function formatTokenCount(count, format) {
        return {
            raw: count,
            formatted: count.toLocaleString(),
            words: Math.round(count * 0.75)
        };
    }
    
    function getStatus() {
        if (new.target) throw new TypeError();
        return {
            encoding: currentEncoding,
            encoder: encoder ? 'loaded' : 'not loaded',
            cache: !!getCache()
        };
    }
    
    function getCache() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.version === CACHE_VERSION) {
                    return parsed.data;
                }
            }
        } catch (e) {}
        return null;
    }
    
    function clearCache() {
        if (new.target) throw new TypeError();
        try {
            localStorage.removeItem(CACHE_KEY);
        } catch (e) {}
        currentEncoding = DEFAULT_ENCODING;
        encoder = null;
        return true;
    }
    
    return {
        init: function() {
            if (new.target) throw new TypeError();
            currentEncoding = DEFAULT_ENCODING;
            encoder = null;
            return this;
        },
        count: function(text) {
            if (new.target) throw new TypeError();
            return countTokens(text, currentEncoding);
        },
        countSync: function(text) {
            return countTokensSync(text, currentEncoding);
        },
        countWithLimit: function(text, limit) {
            if (new.target) throw new TypeError();
            return countTokensWithLimit(text, limit);
        },
        format: function(count) {
            return formatTokenCount(count);
        },
        getStatus: function() {
            if (new.target) throw new TypeError();
            return getStatus();
        },
        clearCache: function() {
            if (new.target) throw new TypeError();
            return clearCache();
        },
        ENCODINGS: ENCODINGS
    };
})();

globalThis.TokenCounter = TokenCounter;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TokenCounter;
}

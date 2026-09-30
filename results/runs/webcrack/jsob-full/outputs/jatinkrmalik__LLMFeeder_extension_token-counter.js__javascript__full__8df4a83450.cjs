var TokenCounter = function () {
  "use strict";
  const _0x227045 = "https://tiktoken.pages.dev/js";
  const _0x5a633a = {
    CL100K_BASE: "cl100k_base",
    O200K_BASE: "o200k_base",
    P50K_BASE: "p50k_base",
    R50K_BASE: "r50k_base",
    GPT2: "gpt2"
  };
  const _0x4199bd = _0x5a633a.CL100K_BASE;
  let _0x3429a1 = {};
  let _0x3aff72 = null;
  const _0x19ef37 = "llmfeeder_encoding_cache";
  const _0x370916 = "1";
  async function _0x1f90d0(_0x41f8ae = _0x4199bd) {
    if (_0x3429a1[_0x41f8ae]) {
      return _0x3429a1[_0x41f8ae];
    }
    try {
      const _0x354235 = typeof browser !== "undefined" ? browser.storage : chrome.storage;
      const _0x414638 = await _0x354235.local.get(_0x19ef37);
      if (_0x414638[_0x19ef37] && _0x414638[_0x19ef37].version === _0x370916 && _0x414638[_0x19ef37][_0x41f8ae]) {
        _0x3429a1[_0x41f8ae] = _0x414638[_0x19ef37][_0x41f8ae];
        return _0x3429a1[_0x41f8ae];
      }
    } catch (_0x5e7e79) {
      console.log("TokenCounter: Could not load from storage, fetching from CDN");
    }
    try {
      const _0x3191f8 = await fetch(_0x227045 + "/" + _0x41f8ae + ".json");
      if (!_0x3191f8.ok) {
        throw new Error("Failed to load encoding: " + _0x3191f8.status);
      }
      const _0x4bb437 = await _0x3191f8.json();
      _0x3429a1[_0x41f8ae] = _0x4bb437;
      try {
        const _0x58c1aa = typeof browser !== "undefined" ? browser.storage : chrome.storage;
        const _0x25dd9a = await _0x58c1aa.local.get(_0x19ef37);
        const _0x8fa9df = {
          version: _0x370916
        };
        const _0x1f1f65 = _0x25dd9a[_0x19ef37] || _0x8fa9df;
        _0x1f1f65[_0x41f8ae] = _0x4bb437;
        const _0x2cd72e = {
          [_0x19ef37]: _0x1f1f65
        };
        await _0x58c1aa.local.set(_0x2cd72e);
      } catch (_0x3b2eed) {
        console.log("TokenCounter: Could not save to storage");
      }
      return _0x4bb437;
    } catch (_0x1b6034) {
      console.error("TokenCounter: Failed to load encoding:", _0x1b6034);
      throw _0x1b6034;
    }
  }
  function _0x3f437e(_0x28e9af, _0x275ccc) {
    if (!_0x28e9af || typeof _0x28e9af !== "string") {
      return 0;
    }
    const _0x3615e7 = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
    const _0x101061 = _0x28e9af.match(_0x3615e7) || [];
    let _0x430a13 = 0;
    for (const _0x310de5 of _0x101061) {
      const _0x41dafd = new TextEncoder().encode(_0x310de5).length;
      _0x430a13 += Math.max(1, Math.ceil(_0x41dafd / 4));
    }
    _0x430a13 += 1;
    return _0x430a13;
  }
  function _0xc8db83(_0x1d850a, _0x29961a) {
    if (!_0x1d850a || typeof _0x1d850a !== "string") {
      return 0;
    }
    const _0x390f60 = new TextEncoder();
    const _0x35a87e = _0x390f60.encode(_0x1d850a);
    let _0x2d9ecc = 0;
    let _0x5a5229 = 0;
    while (_0x5a5229 < _0x35a87e.length) {
      let _0x332d13 = -1;
      let _0x4b8f91 = 1;
      for (let _0x36bd8 = 1; _0x36bd8 <= Math.min(32, _0x35a87e.length - _0x5a5229); _0x36bd8++) {
        const _0x317d49 = _0x35a87e.slice(_0x5a5229, _0x5a5229 + _0x36bd8);
        const _0xe2eea8 = Array.from(_0x317d49).join(",");
        if (_0x29961a.bpe_ranks && _0x29961a.bpe_ranks[_0xe2eea8] !== undefined) {
          if (_0x29961a.bpe_ranks[_0xe2eea8] > _0x332d13) {
            _0x332d13 = _0x29961a.bpe_ranks[_0xe2eea8];
            _0x4b8f91 = _0x36bd8;
          }
        }
      }
      _0x2d9ecc++;
      _0x5a5229 += _0x4b8f91;
    }
    return _0x2d9ecc;
  }
  return {
    async init() {
      try {
        await _0x1f90d0(_0x4199bd);
        return true;
      } catch (_0x3e7364) {
        console.error("TokenCounter: Initialization failed:", _0x3e7364);
        return false;
      }
    },
    async count(_0x37aa7f, _0x26d9b2 = _0x4199bd) {
      try {
        const _0x30f0c8 = await _0x1f90d0(_0x26d9b2);
        return _0xc8db83(_0x37aa7f, _0x30f0c8);
      } catch (_0x49ef32) {
        console.warn("TokenCounter: Using fallback counting");
        return _0x3f437e(_0x37aa7f, {});
      }
    },
    countSync(_0x492dba) {
      const _0xecb136 = _0x3429a1[_0x4199bd];
      if (_0xecb136) {
        return _0xc8db83(_0x492dba, _0xecb136);
      }
      return _0x3f437e(_0x492dba, {});
    },
    async countWithLimit(_0x2b90c2, _0x58fa00 = 4096) {
      const _0x25b324 = await this.count(_0x2b90c2);
      const _0x3ad9e4 = _0x25b324 / _0x58fa00 * 100;
      return {
        count: _0x25b324,
        limit: _0x58fa00,
        percentage: Math.round(_0x3ad9e4 * 10) / 10,
        isOverLimit: _0x25b324 > _0x58fa00,
        remaining: Math.max(0, _0x58fa00 - _0x25b324)
      };
    },
    format(_0x262222, _0x43078e = null) {
      if (_0x43078e) {
        const _0x89f57b = Math.round(_0x262222 / _0x43078e * 100);
        return _0x262222.toLocaleString() + " / " + _0x43078e.toLocaleString() + " tokens (" + _0x89f57b + "%)";
      }
      return _0x262222.toLocaleString() + " tokens";
    },
    getStatus() {
      const _0x2d9c6d = Object.keys(_0x3429a1);
      return {
        isReady: _0x2d9c6d.length > 0,
        cachedEncodings: _0x2d9c6d,
        defaultEncoding: _0x4199bd
      };
    },
    async clearCache() {
      _0x3429a1 = {};
      try {
        const _0x57fa69 = typeof browser !== "undefined" ? browser.storage : chrome.storage;
        await _0x57fa69.local.remove(_0x19ef37);
      } catch (_0x278850) {
        console.log("TokenCounter: Could not clear storage");
      }
    },
    ENCODINGS: _0x5a633a
  };
}();
if (typeof module !== "undefined" && module.exports) {
  module.exports = TokenCounter;
}
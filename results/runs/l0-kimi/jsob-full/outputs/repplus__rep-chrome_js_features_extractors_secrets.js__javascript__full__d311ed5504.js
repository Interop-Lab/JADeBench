var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (_0x43452a, _0x52833d) => function _0x227b1e() {
  return _0x43452a && (_0x52833d = _0x43452a[__getOwnPropNames(_0x43452a)[0]](_0x43452a = 0)), _0x52833d;
};
var __export = (_0x1da6b7, _0x5db91) => {
  for (var _0x407d23 in _0x5db91) __defProp(_0x1da6b7, _0x407d23, { get: _0x5db91[_0x407d23], enumerable: true });
};
var kingfisher_rules_exports = {};
const _0x136e0a = {};
_0x136e0a.loadAllKingfisherRulesFromLocal = () => loadAllKingfisherRulesFromLocal;
_0x136e0a.loadKingfisherRules = () => loadKingfisherRules;
_0x136e0a.loadKingfisherRulesFromFile = () => loadKingfisherRulesFromFile;
_0x136e0a.loadKingfisherRulesFromJSON = () => loadKingfisherRulesFromJSON;
_0x136e0a.loadKingfisherRulesFromLocalFile = () => loadKingfisherRulesFromLocalFile;
_0x136e0a.loadKingfisherRulesFromLocalFiles = () => loadKingfisherRulesFromLocalFiles;
_0x136e0a.loadKingfisherRulesFromURL = () => loadKingfisherRulesFromURL;
_0x136e0a.loadKingfisherRulesFromURLs = () => loadKingfisherRulesFromURLs;
_0x136e0a.scanWithKingfisherRules = () => scanWithKingfisherRules;
__export(kingfisher_rules_exports, _0x136e0a);

function validateParentheses(_0x112063) {
  let _0x2a57aa = 0, _0x34e872 = false, _0x2c0d6a = 0;
  const _0x57af6f = [];
  while (_0x2c0d6a < _0x112063.length) {
    const _0x594069 = _0x112063[_0x2c0d6a];
    const _0x3a6d61 = _0x2c0d6a > 0 ? _0x112063[_0x2c0d6a - 1] : '';
    const _0x3c8cfd = _0x2c0d6a > 1 ? _0x112063[_0x2c0d6a - 2] : '';
    if (_0x3a6d61 === '\\' && _0x3c8cfd === '\\') {
      _0x2c0d6a++;
      continue;
    }
    if (_0x3a6d61 === '\\' && _0x3c8cfd === '\\') {}
    if (_0x594069 === '[' && !_0x34e872) {
      _0x34e872 = true;
      _0x2c0d6a++;
      continue;
    }
    if (_0x594069 === ']' && _0x34e872) {
      _0x34e872 = false;
      _0x2c0d6a++;
      continue;
    }
    if (!_0x34e872) {
      if (_0x594069 === '(') {
        _0x2a57aa++;
        _0x57af6f.push(_0x2c0d6a);
      } else if (_0x594069 === ')') {
        _0x2a57aa--;
        if (_0x2a57aa < 0) {
          return { valid: false, error: "Unmatched closing parenthesis at position " + _0x2c0d6a };
        }
        _0x57af6f.pop();
      }
    }
    _0x2c0d6a++;
  }
  if (_0x2a57aa !== 0) {
    const _0x5a507f = _0x57af6f[0] || 0;
    return { valid: false, error: "Unmatched opening parenthesis, depth " + _0x2a57aa + " at position " + _0x5a507f };
  }
  return { valid: true };
}

function stripComments(_0x2e2b56, _0x49c573 = false) {
  _0x2e2b56 = _0x2e2b56.replace(/\(\?#[^)]*\)/g, '');
  if (_0x49c573) {
    const _0x198aa8 = _0x2e2b56.split('\n');
    const _0x249447 = _0x198aa8.map(_0x51d185 => {
      let _0xba9bbc = '', _0x402cb3 = false, _0x48a14b = 0, _0x2d9ea0 = -1;
      while (_0x48a14b < _0x51d185.length) {
        const _0x160135 = _0x51d185[_0x48a14b];
        const _0x18f5d0 = _0x48a14b > 0 ? _0x51d185[_0x48a14b - 1] : '';
        if (_0x18f5d0 === '\\') {
          _0xba9bbc += _0x160135;
          _0x48a14b++;
          continue;
        }
        if (_0x160135 === '[' && !_0x402cb3) {
          _0x402cb3 = true;
          _0xba9bbc += _0x160135;
          _0x48a14b++;
          continue;
        }
        if (_0x160135 === ']' && _0x402cb3) {
          _0x402cb3 = false;
          _0xba9bbc += _0x160135;
          _0x48a14b++;
          continue;
        }
        if (!_0x402cb3 && _0x160135 === '#' && _0x2d9ea0 === -1) {
          const _0x3c4998 = _0x48a14b > 0;
          const _0x1536fc = _0x48a14b > 1 && /\s/.test(_0x51d185[_0x48a14b - 2]);
          if (_0x3c4998 && _0x1536fc) {
            _0x2d9ea0 = _0x48a14b;
            break;
          }
        }
        _0xba9bbc += _0x160135;
        _0x48a14b++;
      }
      return _0xba9bbc;
    });
    return _0x249447.join('\n');
  } else {
    return _0x2e2b56 = _0x2e2b56.replace(/\s#[\s\w]*$/gm, '');
  }
}

function convertNamedGroups(_0x41261e) {
  return _0x41261e.replace(/\(\?P<([^>]+)>/g, '(?<$1>');
}

function convertInlineFlagGroups(_0x16a75f, _0xe3688e) {
  _0x16a75f = convertNamedGroups(_0x16a75f);
  let _0x2da95f = _0x16a75f;
  const _0x2f2526 = _0xe3688e.includes('i');
  const _0x3e9c06 = _0xe3688e.includes('s');
  let _0x5603e3 = false, _0x1ab56f = false;
  const _0xa9dda2 = /\(\?([-]?[imsux]+):/g;
  let _0x58a0ae;
  const _0x4a01f0 = [];
  _0xa9dda2.lastIndex = 0;
  while ((_0x58a0ae = _0xa9dda2.exec(_0x2da95f)) !== null) {
    const _0x200aa5 = _0x58a0ae[0];
    const _0x79ea1 = _0x58a0ae[1];
    const _0x1d1121 = _0x58a0ae.index + _0x200aa5.length;
    const _0x32ce2b = _0x79ea1.includes('i') && !_0x79ea1.startsWith('-') && !_0x79ea1.includes('-i');
    const _0x3edc06 = _0x79ea1.includes('s') && !_0x79ea1.startsWith('-') && !_0x79ea1.includes('-s');
    if (_0x32ce2b && !_0x2f2526) _0x5603e3 = true;
    if (_0x3edc06 && !_0x3e9c06) _0x1ab56f = true;
    let _0x5e342e = 0, _0xf46fea = _0x1d1121, _0x580e83 = -1, _0x480de3 = false;
    while (_0xf46fea < _0x2da95f.length && _0x5e342e >= 0) {
      const _0x1f10f = _0x2da95f[_0xf46fea];
      const _0x5bd299 = _0xf46fea > 0 ? _0x2da95f[_0xf46fea - 1] : '';
      if (_0x5bd299 === '\\') {
        _0xf46fea++;
        continue;
      }
      if (_0x1f10f === '[' && !_0x480de3) {
        _0x480de3 = true;
        _0xf46fea++;
        continue;
      }
      if (_0x1f10f === ']' && _0x480de3) {
        _0x480de3 = false;
        _0xf46fea++;
        continue;
      }
      if (!_0x480de3) {
        if (_0x1f10f === '(') _0x5e342e++;
        else if (_0x1f10f === ')') _0x5e342e--;
      }
      _0xf46fea++;
    }
    if (_0x5e342e === 0) {
      _0x580e83 = _0xf46fea;
      const _0x19758d = _0x2da95f.substring(_0x1d1121, _0x580e83);
      _0x4a01f0.push({ match: _0x200aa5, end: _0xf46fea, replacement: '(' + _0x19758d + ')' });
    }
  }
  _0x4a01f0.sort((a, b) => b.end - a.end).forEach(_0x36eb1a => {
    _0x2da95f = _0x2da95f.substring(0, _0x36eb1a.end - _0x36eb1a.match.length) + _0x36eb1a.replacement + _0x2da95f.substring(_0x36eb1a.end);
  });
  if (_0x5603e3 && !_0x2f2526) _0xe3688e += 'i';
  if (_0x1ab56f && !_0x3e9c06) _0xe3688e += 's';
  return { pattern: _0x2da95f, flags: _0xe3688e };
}

function convertPatternFlags(_0x27739a) {
  let _0x2ad0db = 'g', _0x2bd609 = _0x27739a, _0x43dd2c = false;
  const _0x23950f = _0x27739a.match(/^\(\?([imsux]+)\)/);
  if (_0x23950f) {
    const _0x81893d = _0x23950f[1];
    _0x2bd609 = _0x27739a.replace(/^\(\?[imsux]+\)/, '');
    if (_0x81893d.includes('i')) _0x2ad0db += 'i';
    if (_0x81893d.includes('m')) _0x2ad0db += 'm';
    if (_0x81893d.includes('s')) _0x2ad0db += 's';
    if (_0x81893d.includes('x')) _0x43dd2c = true;
  }
  const _0xa9507d = convertInlineFlagGroups(_0x2bd609, _0x2ad0db);
  _0x2bd609 = _0xa9507d.pattern;
  _0x2ad0db = _0xa9507d.flags;
  _0x2bd609 = _0x2bd609.replace(/\(\?([imsux]+)\)/g, (_0x89865a, _0x49ccd1) => {
    if (_0x49ccd1.includes('i') && !_0x2ad0db.includes('i')) _0x2ad0db += 'i';
    if (_0x49ccd1.includes('m') && !_0x2ad0db.includes('m')) _0x2ad0db += 'm';
    if (_0x49ccd1.includes('s') && !_0x2ad0db.includes('s')) _0x2ad0db += 's';
    if (_0x49ccd1.includes('x') && !_0x43dd2c) _0x43dd2c = true;
    return '';
  });
  if (_0x43dd2c) _0x2bd609 = stripWhitespaceInExtendedMode(_0x2bd609);
  return { pattern: _0x2bd609, flags: _0x2ad0db };
}

function stripWhitespaceInExtendedMode(_0x11eba8) {
  let _0x1fa99c = '', _0x54efef = false, _0x7eb52e = 0;
  while (_0x7eb52e < _0x11eba8.length) {
    const _0x3df519 = _0x11eba8[_0x7eb52e];
    const _0x20390b = _0x7eb52e > 0 ? _0x11eba8[_0x7eb52e - 1] : '';
    if (_0x3df519 === '[') {
      _0x54efef = true;
      _0x1fa99c += _0x3df519;
      _0x7eb52e++;
      continue;
    }
    if (_0x3df519 === ']' && _0x54efef) {
      _0x54efef = false;
      _0x1fa99c += _0x3df519;
      _0x7eb52e++;
      continue;
    }
    if (_0x54efef) {
      _0x1fa99c += _0x3df519;
      _0x7eb52e++;
      continue;
    }
    if (_0x3df519 === '\\') {
      _0x1fa99c += _0x3df519;
      if (_0x20390b) {
        _0x1fa99c += _0x20390b;
        _0x7eb52e += 2;
      } else {
        _0x7eb52e++;
      }
      continue;
    }
    if (!_0x54efef && /[\s\n\r\t]/.test(_0x3df519)) {
      _0x7eb52e++;
      continue;
    }
    _0x1fa99c += _0x3df519;
    _0x7eb52e++;
  }
  return _0x1fa99c;
}

function validatePatternRequirements(_0x447ed3, _0x1eb0d7, _0x151f31 = null) {
  const _0x3d4e85 = { valid: true };
  if (!_0x1eb0d7) return _0x3d4e85;
  const _0x491e21 = _0x447ed3;
  if (_0x1eb0d7.min_digits !== undefined) {
    const _0x5a46fd = (_0x491e21.match(/\d/g) || []).length;
    if (_0x5a46fd < _0x1eb0d7.min_digits) {
      return { valid: false, error: "Pattern requires at least " + _0x1eb0d7.min_digits + " digits, found " + _0x5a46fd };
    }
  }
  if (_0x1eb0d7.min_uppercase !== undefined) {
    const _0x5a3786 = (_0x491e21.match(/[A-Z]/g) || []).length;
    if (_0x5a3786 < _0x1eb0d7.min_uppercase) {
      return { valid: false, error: "Pattern requires at least " + _0x1eb0d7.min_uppercase + " uppercase letters, found " + _0x5a3786 };
    }
  }
  if (_0x1eb0d7.min_lowercase !== undefined) {
    const _0x542339 = (_0x491e21.match(/[a-z]/g) || []).length;
    if (_0x542339 < _0x1eb0d7.min_lowercase) {
      return { valid: false, error: "Pattern requires at least " + _0x1eb0d7.min_lowercase + " lowercase letters, found " + _0x542339 };
    }
  }
  if (_0x1eb0d7.required_special_chars !== undefined) {
    const _0x449a89 = _0x1eb0d7.required_special_chars || '';
    const _0x46638a = (_0x491e21.match(new RegExp('[' + _0x449a89.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ']', 'g')) || []).length;
    if (_0x46638a < _0x1eb0d7.required_special_chars.length) {
      return { valid: false, error: "Pattern requires at least " + _0x1eb0d7.required_special_chars.length + " special characters from set " + _0x449a89 + ", found " + _0x46638a };
    }
  }
  if (_0x1eb0d7.forbidden_patterns) {
    const _0x329c3e = _0x491e21.toLowerCase();
    for (const _0x366454 of _0x1eb0d7.forbidden_patterns) {
      const _0xd4f6b4 = _0x366454.toLowerCase();
      if (_0xd4f6b4 && _0x329c3e.includes(_0xd4f6b4)) {
        return { valid: false, error: "Pattern contains forbidden sequence: " + _0xd4f6b4, isError: true };
      }
    }
  }
  return _0x3d4e85;
}

async function loadKingfisherRules(_0xa7ed77) {
  let _0x216474;
  try {
    if (typeof window !== 'undefined' && window.jsyaml && window.jsyaml.load) {
      _0x216474 = window.jsyaml.load(_0xa7ed77);
    } else {
      _0x216474 = parseYamlRulesFallback(_0xa7ed77);
      if (!_0x216474 || (_0x216474.rules && _0x216474.rules.length === 0) || (Array.isArray(_0x216474) && _0x216474.length === 0)) {
        throw new Error("Failed to parse YAML rules");
      }
    }
  } catch (_0x3f5807) {
    console.error("Error parsing YAML:", _0x3f5807);
    return [];
  }
  const _0x185854 = _0x216474.rules || (Array.isArray(_0x216474) ? _0x216474 : []);
  const _0x204e43 = _0x185854.map(_0x579597 => {
    if (!_0x579597 || !_0x579597.pattern) {
      console.warn("Invalid rule:", _0x579597.id || _0x579597.name);
      return null;
    }
    const _0x2a62b1 = /^\(\?([imsux]+)\)/.test(_0x579597.pattern) && /^\(\?([imsux]+)\)/.exec(_0x579597.pattern)[0].includes('x');
    const _0x5c7ac8 = stripComments(_0x579597.pattern, _0x2a62b1);
    const { pattern: _0x24fd19, flags: _0x5b6f9f } = convertPatternFlags(_0x5c7ac8);
    const _0x467b53 = validateParentheses(_0x24fd19);
    if (!_0x467b53.valid) {
      try {
        const _0x299641 = new RegExp(_0x24fd19, _0x5b6f9f);
        const _0x55fdc3 = { ..._0x579597 };
        _0x55fdc3.compiledPattern = _0x299641;
        _0x55fdc3.cleanPattern = _0x24fd19;
        return _0x55fdc3;
      } catch (_0x11e8a1) {
        console.error("Invalid regex for rule " + (_0x579597.id || _0x579597.name) + ":", _0x467b53.error);
        console.error("Pattern:", _0x579597.pattern.substring(0, 100) + (_0x579597.pattern.length > 100 ? '...' : ''));
        console.error("Clean pattern:", _0x24fd19.substring(0, 100) + (_0x24fd19.length > 100 ? '...' : ''));
        console.error("Error:", _0x11e8a1.message);
        return null;
      }
    }
    try {
      const _0x20ea2b = new RegExp(_0x24fd19, _0x5b6f9f);
      const _0x41a6bc = { ..._0x579597 };
      _0x41a6bc.compiledPattern = _0x20ea2b;
      _0x41a6bc.cleanPattern = _0x24fd19;
      return _0x41a6bc;
    } catch (_0xdac532) {
      console.error("Invalid regex for rule " + (_0x579597.id || _0x579597.name) + ":", _0xdac532);
      console.error("Pattern:", _0x24fd19.substring(0, 100) + (_0x24fd19.length > 100 ? '...' : ''));
      return null;
    }
  }).filter(Boolean);
  return _0x204e43;
}

function parseYamlRulesFallback(_0x2f6d2e) {
  console.warn("Using fallback YAML parser");
  try {
    const _0x2366fc = [], _0x292de0 = _0x2f6d2e.split('\n');
    let _0x15e173 = null, _0x22bfe1 = false, _0x3b791e = [], _0x1b0e68 = 0;
    for (let _0x4e3c59 = 0; _0x4e3c59 < _0x292de0.length; _0x4e3c59++) {
      const _0x4d56de = _0x292de0[_0x4e3c59];
      const _0x1798d6 = _0x4d56de.trim();
      if (!_0x1798d6 || _0x1798d6.startsWith('#')) continue;
      if (_0x1798d6.startsWith('- name:')) {
        if (_0x15e173) {
          if (_0x22bfe1 && _0x3b791e.length > 0) {
            _0x15e173.pattern = _0x3b791e.join('\n').trim();
            _0x3b791e = [];
          }
          _0x2366fc.push(_0x15e173);
        }
        _0x15e173 = { name: _0x1798d6.replace(/^- name:\s*/, '').replace(/^["']|["']$/g, '') };
        _0x22bfe1 = false;
        continue;
      }
      if (_0x15e173) {
        if (_0x1798d6.startsWith('id:')) {
          _0x15e173.id = _0x1798d6.replace(/^id:\s*/, '').replace(/^["']|["']$/g, '');
        } else if (_0x1798d6.startsWith('pattern:')) {
          _0x22bfe1 = true;
          const _0x4ed28a = _0x1798d6.replace(/^pattern:\s*\|?\s*/, '');
          if (_0x4ed28a) _0x3b791e.push(_0x4ed28a);
        } else if (_0x22bfe1 && (_0x4d56de.startsWith(' ') || _0x4d56de.startsWith('\t'))) {
          _0x3b791e.push(_0x4d56de);
        } else if (_0x1798d6.startsWith('min_entropy:')) {
          _0x22bfe1 = false;
          _0x15e173.min_entropy = parseFloat(_0x1798d6.replace(/^min_entropy:\s*/, ''));
        } else if (_0x1798d6.startsWith('confidence:')) {
          _0x22bfe1 = false;
          _0x15e173.confidence = _0x1798d6.replace(/^confidence:\s*/, '');
        } else if (_0x1798d6.startsWith('validation:')) {
          _0x22bfe1 = false;
          _0x15e173.validation = {};
        } else if (_0x15e173.validation && _0x1798d6.startsWith('  ')) {
          if (_0x1798d6.trim().startsWith('min_digits:')) {
            _0x15e173.validation.min_digits = parseInt(_0x1798d6.trim().replace(/^min_digits:\s*/, ''));
          }
        } else if (_0x1798d6.match(/^[a-z_]+:/) && !_0x1798d6.startsWith('  ')) {
          _0x22bfe1 = false;
        }
      }
    }
    if (_0x15e173) {
      if (_0x22bfe1 && _0x3b791e.length > 0) {
        _0x15e173.pattern = _0x3b791e.join('\n').trim();
      }
      if (_0x15e173.pattern) _0x2366fc.push(_0x15e173);
    }
    return { rules: _0x2366fc };
  } catch (_0x32ea54) {
    console.error("Fallback YAML parsing failed:", _0x32ea54);
    return { rules: [] };
  }
}

async function loadKingfisherRulesFromJSON(_0x51a714) {
  try {
    const _0x563b2a = typeof _0x51a714 === 'string' ? JSON.parse(_0x51a714) : _0x51a714;
    const _0x22abf2 = _0x563b2a.rules || (Array.isArray(_0x563b2a) ? _0x563b2a : []);
    return _0x22abf2.map(_0x1e5e9a => {
      if (!_0x1e5e9a || !_0x1e5e9a.pattern) return null;
      const _0x2c8e52 = /^\(\?([imsux]+)\)/.test(_0x1e5e9a.pattern) && /^\(\?([imsux]+)\)/.exec(_0x1e5e9a.pattern)[0].includes('x');
      const _0x354b10 = stripComments(_0x1e5e9a.pattern, _0x2c8e52);
      const { pattern: _0xc9a56e, flags: _0x1b9671 } = convertPatternFlags(_0x354b10);
      try {
        const _0x918040 = new RegExp(_0xc9a56e, _0x1b9671);
        const _0x47a1ba = { ..._0x1e5e9a };
        _0x47a1ba.compiledPattern = _0x918040;
        _0x47a1ba.cleanPattern = _0xc9a56e;
        return _0x47a1ba;
      } catch (_0x326d6b) {
        console.error("Invalid regex for rule " + (_0x1e5e9a.id || _0x1e5e9a.name) + ":", _0x326d6b);
        return null;
      }
    }).filter(Boolean);
  } catch (_0x2441dc) {
    console.error("Error parsing JSON:", _0x2441dc);
    return [];
  }
}

async function loadKingfisherRulesFromFile(_0x5d8342) {
  try {
    const _0x3f5545 = await fetch(chrome.runtime.getURL('rules/' + _0x5d8342));
    const _0x3a0f00 = await _0x3f5545.text();
    return await loadKingfisherRules(_0x3a0f00);
  } catch (_0x4b5126) {
    console.error("Error loading rule file " + _0x5d8342 + ":", _0x4b5126);
    return [];
  }
}

function scanWithKingfisherRules(_0x433e31, _0x21b5cd, _0x255ef3 = {}) {
  const _0x8437e2 = [];
  if (!_0x433e31 || !_0x21b5cd || _0x21b5cd.length === 0) return _0x8437e2;
  const { minEntropy: minEntropy = 0, checkPatternRequirements: checkPatternRequirements = true, getEntropy: _0x148b87 = null } = _0x255ef3;
  for (const _0x2c6011 of _0x21b5cd) {
    if (!_0x2c6011.compiledPattern) continue;
    try {
      const _0x558711 = _0x2c6011.compiledPattern;
      let _0x5da6fa;
      _0x558711.lastIndex = 0;
      while ((_0x5da6fa = _0x558711.exec(_0x433e31)) !== null) {
        const _0x4ae9c8 = _0x5da6fa[0];
        const _0x1ef148 = _0x5da6fa.index;
        if (_0x148b87 && _0x2c6011.min_entropy) {
          const _0x5f8d7e = _0x148b87(_0x4ae9c8);
          if (_0x5f8d7e < _0x2c6011.min_entropy) continue;
        }
        if (checkPatternRequirements && _0x2c6011.validation) {
          const _0x49e19d = { match: _0x5da6fa };
          const _0x398d3e = validatePatternRequirements(_0x4ae9c8, _0x2c6011.validation, _0x49e19d);
          if (!_0x398d3e.valid && !_0x398d3e.isError) continue;
        }
        const _0x4095c0 = Math.max(0, _0x1ef148 - 50);
        const _0x5ace70 = Math.min(_0x433e31.length, _0x1ef148 + _0x4ae9c8.length + 50);
        const _0x1c3a09 = _0x433e31.substring(_0x4095c0, _0x5ace70);
        _0x8437e2.push({
          ruleId: _0x2c6011.id,
          ruleName: _0x2c6011.name,
          match: _0x4ae9c8,
          index: _0x1ef148,
          confidence: _0x2c6011.confidence || 'medium',
          entropy: _0x148b87 ? _0x148b87(_0x4ae9c8).toFixed(2) : null,
          context: _0x1c3a09,
          validation: _0x2c6011.validation || null
        });
      }
    } catch (_0x416905) {
      console.error("Error scanning with rule " + _0x2c6011.id + ":", _0x416905);
    }
  }
  return _0x8437e2;
}

async function loadKingfisherRulesFromLocalFile(_0x8ca86b) {
  try {
    const _0x1b4c7f = chrome.runtime.getURL('rules/' + _0x8ca86b);
    const _0x322556 = await fetch(_0x1b4c7f);
    if (!_0x322556.ok) {
      throw new Error("HTTP " + _0x322556.status + ": " + _0x322556.statusText);
    }
    const _0x21f1bb = await _0x322556.text();
    const _0x2d8d07 = await loadKingfisherRules(_0x21f1bb);
    return _0x2d8d07;
  } catch (_0x3c9606) {
    console.error("Error loading local rule file " + _0x8ca86b + ":", _0x3c9606);
    return [];
  }
}

async function loadKingfisherRulesFromLocalFiles(_0x214a44) {
  const _0x1d4aaf = [];
  for (const _0x1a8edf of _0x214a44) {
    try {
      const _0xf3cf71 = await loadKingfisherRulesFromLocalFile(_0x1a8edf);
      _0x1d4aaf.push(..._0xf3cf71);
    } catch (_0xf2fb7e) {
      console.error("Error loading rule file " + _0x1a8edf + ":", _0xf2fb7e);
    }
  }
  return _0x1d4aaf;
}

async function loadAllKingfisherRulesFromLocal() {
  try {
    const _0xc499f7 = chrome.runtime.getURL('rules/index.json');
    const _0x1abbb8 = await fetch(_0xc499f7);
    if (_0x1abbb8.ok) {
      const _0x1c4c9c = await _0x1abbb8.json();
      if (_0x1c4c9c.rules && Array.isArray(_0x1c4c9c.rules)) {
        return await loadKingfisherRulesFromLocalFiles(_0x1c4c9c.rules);
      }
    }
  } catch (_0x6eb266) {}
  const _0x4759b1 = [
    'api-keys.yaml', 'aws.yaml', 'github.yaml', 'google.yaml', 'jwt.yaml',
    'private-keys.yaml', 'slack.yaml', 'stripe.yaml', 'generic-secrets.yaml'
  ];
  const _0x32549d = [];
  for (const _0x2a18a4 of _0x4759b1) {
    try {
      const _0x26a6ea = await loadKingfisherRulesFromLocalFile(_0x2a18a4);
      if (_0x26a6ea.length > 0) {
        _0x32549d.push(..._0x26a6ea);
      }
    } catch (_0x506790) {}
  }
  return _0x32549d;
}

async function loadKingfisherRulesFromURL(_0x3676) {
  try {
    const _0x5826d1 = await fetch(_0x3676);
    const _0x5e558d = await _0x5826d1.text();
    return await loadKingfisherRules(_0x5e558d);
  } catch (_0x5699f5) {
    console.error("Error loading rules from URL:", _0x5699f5);
    return [];
  }
}

async function loadKingfisherRulesFromURLs(_0x260190) {
  const _0x469bcf = [];
  for (const _0x73dbfe of _0x260190) {
    try {
      const _0xf413 = await loadKingfisherRulesFromURL(_0x73dbfe);
      _0x469bcf.push(..._0xf413);
    } catch (_0xd48dce) {
      console.error("Error loading rules from URL " + _0x73dbfe + ":", _0xd48dce);
    }
  }
  return _0x469bcf;
}

const _0x3f55a1 = {};
_0x3f55a1.init_kingfisher_rules = function() {};
var init_kingfisher_rules = __esm(_0x3f55a1);

const KNOWN_FALSE_POSITIVE_PATTERNS = [
  /^[a-f0-9]{40}$/i,
  /^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)+$/,
  /^[a-z][a-zA-Z0-9]+(?:[A-Z][a-z0-9]+)+$/,
  /^(?:map|filter|reduce|forEach|slice|splice|concat)/i,
  /^_react|_emotion|_styled|_next/i,
  /sourceMappingURL/i,
  /^__webpack/i,
  /^module\./i,
  /^exports\./i
];

const FALSE_POSITIVE_CONTEXT_PATTERNS = [
  /base64,/i,
  /data:image/i,
  /;base64/i,
  /"(?:publicKey|privateKey|data|content|image|icon|font|logo|avatar|thumbnail|media|src|href)":/i,
  /iVBOR|AAAA|\/png|\/jpeg|\/jpg|\/gif|\/webp|\/svg/i,
  /sourceMappingURL=/i,
  /webpack:\/\//i,
  /__webpack/i,
  /\.chunk\.js/i,
  /\/\*#\s*source/i,
  /import\s+.*\s+from\s+['"]/i,
  /require\s*\(['"]/i,
  /["']data["']\s*:/i,
  /["']image["']\s*:/i,
  /\/\/ data:image/i
];

function getEntropy(_0x3c4e5b) {
  const _0x290905 = _0x3c4e5b.length;
  const _0x594f48 = {};
  for (let _0x1dc584 = 0; _0x1dc584 < _0x290905; _0x1dc584++) {
    const _0x2d4f6c = _0x3c4e5b[_0x1dc584];
    _0x594f48[_0x2d4f6c] = (_0x594f48[_0x2d4f6c] || 0) + 1;
  }
  let _0x878ed7 = 0;
  for (const _0x2c451a in _0x594f48) {
    const _0x36753c = _0x594f48[_0x2c451a] / _0x290905;
    _0x878ed7 -= _0x36753c * Math.log2(_0x36753c);
  }
  return _0x878ed7;
}

function isLikelyBase64Data(_0x106cf6, _0x590bc6) {
  if (/data:[\w/-]+;base64,/.test(_0x590bc6)) return true;
  if (/={1,2}$/.test(_0x106cf6) && _0x106cf6.length % 4 === 0) return true;
  if (_0x106cf6.length % 4 === 0 && /^[A-Za-z0-9+/=]+$/.test(_0x106cf6)) return true;
  const _0x24903f = _0x590bc6.substring(Math.max(0, _0x590bc6.length - 200), _0x590bc6.length);
  if (/"(?:data|content|image|icon|font|media|src|href|asset|resource)"\s*:\s*"[^"]*$/i.test(_0x24903f)) return true;
  if (/(?:const|let|var)\s+(?:data|image|icon|font|asset|resource|content)\w*\s*=\s*["`'][^"`']*$/i.test(_0x24903f)) return true;
  return false;
}

function isInComment(_0x41e471) {
  const _0x34b2d7 = _0x41e471.trim();
  return /^\s*\/\//.test(_0x34b2d7) || /^\s*\*/.test(_0x34b2d7) || /^\s*\/\*/.test(_0x34b2d7);
}

function normalizeSourceFile(_0x284661) {
  if (!_0x284661) return _0x284661;
  try {
    const _0x2edad1 = new URL(_0x284661);
    return _0x2edad1.protocol + '//' + _0x2edad1.host + _0x2edad1.pathname;
  } catch (_0x593e83) {
    return _0x284661.split('?')[0].split('#')[0];
  }
}

function deduplicateResults(_0x277779) {
  const _0x1ff584 = new Set();
  return _0x277779.filter(_0x3a2955 => {
    const _0x4fbc78 = normalizeSourceFile(_0x3a2955.file || '');
    const _0x394203 = _0x3a2955.ruleId + ':' + _0x3a2955.match + ':' + _0x4fbc78;
    if (_0x1ff584.has(_0x394203)) return false;
    _0x1ff584.add(_0x394203);
    return true;
  });
}

var kingfisherRulesCache = null;

async function loadKingfisherRules2() {
  if (kingfisherRulesCache) return kingfisherRulesCache;
  try {
    const { loadAllKingfisherRulesFromLocal: _0xd23ae3, scanWithKingfisherRules: _0xbc9229 } = await Promise.resolve().then(() => (init_kingfisher_rules(), kingfisher_rules_exports));
    const _0x2c9443 = await _0xd23ae3();
    const _0xc7b9b0 = {};
    _0xc7b9b0.rules = _0x2c9443;
    _0xc7b9b0.scanWithKingfisherRules = _0xbc9229;
    kingfisherRulesCache = _0xc7b9b0;
    return kingfisherRulesCache;
  } catch (_0xcdc031) {
    console.error("Failed to initialize Kingfisher rules:", _0xcdc031);
    const _0x306119 = {};
    _0x306119.rules = [];
    _0x306119.scanWithKingfisherRules = null;
    kingfisherRulesCache = _0x306119;
    return kingfisherRulesCache;
  }
}

function scanContent(_0x1efb1c, _0x5eb3bf) {
  return [];
}

async function scanContentWithKingfisher(_0x365902, _0x369564) {
  const _0x417d5b = [];
  if (!_0x365902) return _0x417d5b;
  try {
    const { rules: _0x3488da, scanWithKingfisherRules: _0x1ba423 } = await loadKingfisherRules2();
    if (!_0x3488da || _0x3488da.length === 0 || !_0x1ba423) return _0x417d5b;
    const _0x7282dd = {};
    _0x7282dd.getEntropy = getEntropy;
    _0x7282dd.checkPatternRequirements = true;
    const _0x15837f = _0x1ba423(_0x365902, _0x3488da, _0x7282dd);
    for (const _0xabe54c of _0x15837f) {
      let _0x3ce47a = false;
      for (const _0x441fe8 of KNOWN_FALSE_POSITIVE_PATTERNS) {
        if (_0x441fe8.test(_0xabe54c.match)) {
          _0x3ce47a = true;
          break;
        }
      }
      if (_0x3ce47a) continue;
      let _0x38c678 = false;
      const _0x4e2ed9 = Math.max(0, _0xabe54c.index - 100);
      const _0x24a963 = _0x365902.lastIndexOf('\n', _0xabe54c.index);
      const _0x18c5b7 = _0x365902.substring(_0x4e2ed9, _0x24a963 > _0x4e2ed9 ? _0x24a963 : _0x4e2ed9);
      for (const _0x2fa3b9 of FALSE_POSITIVE_CONTEXT_PATTERNS) {
        if (_0x2fa3b9.test(_0x18c5b7)) {
          _0x38c678 = true;
          break;
        }
      }
      if (_0x38c678) continue;
      if (isLikelyBase64Data(_0xabe54c.match, _0x18c5b7)) continue;
      if (isInComment(_0x18c5b7)) continue;
      let _0xc098ca = 0;
      if (_0xabe54c.confidence === 'high') _0xc098ca = 30;
      else if (_0xabe54c.confidence === 'medium') _0xc098ca = 20;
      else _0xc098ca = 10;
      if (_0xabe54c.entropy) {
        const _0x2ab1ae = parseFloat(_0xabe54c.entropy);
        if (_0x2ab1ae > 4.5) _0xc098ca += 20;
        else if (_0x2ab1ae > 3.5) _0xc098ca += 10;
      }
      if (_0xc098ca < 25) continue;
      const _0x9659e7 = _0xabe54c.type || _0xabe54c.ruleName || 'secret';
      _0x417d5b.push({
        file: _0x369564,
        type: _0x9659e7,
        match: _0xabe54c.match,
        index: _0xabe54c.index,
        confidence: Math.min(100, _0xc098ca),
        entropy: _0xabe54c.entropy || null,
        ruleName: _0xabe54c.ruleName,
        ruleId: _0xabe54c.ruleId
      });
    }
  } catch (_0x4540d5) {
    console.error("Error scanning content:", _0x4540d5);
  }
  return _0x417d5b;
}

async function scanForSecrets(_0x4af5e9, _0x9901b0, _0x52980a) {
  const _0x5446c4 = [], _0xd3c9d2 = new Set();
  let _0x370ed9 = 0;
  const _0x123088 = _0x4af5e9.length;
  for (const _0x5517f6 of _0x4af5e9) {
    try {
      if (!_0x5517f6 || !_0x5517f6.content || !_0x5517f6.url) {
        _0x370ed9++;
        if (_0x9901b0) _0x9901b0(_0x370ed9, _0x123088);
        continue;
      }
      const _0x29d69f = (_0x5517f6.url?.hostname || '').toLowerCase();
      const _0x5138a2 = _0x5517f6.content?.substring?.(0, 500)?.toLowerCase?.() || '';
      const _0x2ab0f6 = _0x29d69f.includes('github') || _0x5138a2.includes('github') || _0x5138a2.includes('gitlab') || _0x5138a2.includes('bitbucket');
      if (_0x2ab0f6) {
        let _0xc3fd66 = null;
        if (typeof _0x5517f6.getTextContent !== 'undefined') {
          _0xc3fd66 = _0x5517f6.getTextContent() || '';
        } else if (typeof _0x5517f6.content === 'string') {
          _0xc3fd66 = _0x5517f6.content || '';
        } else {
          _0x370ed9++;
          if (_0x9901b0) _0x9901b0(_0x370ed9, _0x123088);
          continue;
        }
        if (_0xc3fd66) {
          try {
            const _0x533aa7 = await scanContentWithKingfisher(_0xc3fd66, _0x5517f6.url?.href);
            for (const _0x21aaaa of _0x533aa7) {
              const _0x3576fa = _0x21aaaa.ruleId + ':' + _0x21aaaa.match;
              if (!_0xd3c9d2.has(_0x3576fa)) {
                _0xd3c9d2.add(_0x3576fa);
                _0x5446c4.push(_0x21aaaa);
                if (_0x52980a) _0x52980a(_0x21aaaa);
              }
            }
          } catch (_0x484f37) {
            console.error("Error scanning file:", _0x484f37);
          }
        }
      }
    } catch (_0x260d1b) {
      console.error("Error processing file:", _0x260d1b);
    }
    _0x370ed9++;
    if (_0x9901b0) _0x9901b0(_0x370ed9, _0x123088);
  }
  return _0x5446c4;
}

export { scanContent, scanContentWithKingfisher, scanForSecrets };

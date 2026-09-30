const globalObject = typeof globalThis !== 'undefined' ? globalThis :
  typeof window !== 'undefined' ? window :
  typeof self !== 'undefined' ? self :
  typeof global !== 'undefined' ? global : undefined;

const moduleState = globalObject['vm_0x57a88a_950289'] || (globalObject['vm_0x57a88a_950289'] = {});

(function() {
  if (!moduleState['module']) {
    try { moduleState['module'] = module; } catch (_) {}
  }
  if (!moduleState['exports']) {
    try { moduleState['exports'] = exports; } catch (_) {}
  }
  if (!moduleState['require']) {
    try { moduleState['require'] = require; } catch (_) {}
  }
  if (!moduleState['__dirname']) {
    try { moduleState['__dirname'] = __dirname; } catch (_) {}
  }
  if (!moduleState['__filename']) {
    try { moduleState['__filename'] = __filename; } catch (_) {}
  }
})();

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

function validateParentheses(pattern) {
  let depth = 0;
  let escaped = false;
  let inClass = false;
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '[') {
      inClass = true;
      continue;
    }
    if (ch === ']' && inClass) {
      inClass = false;
      continue;
    }
    if (inClass) continue;
    if (ch === '(') depth++;
    if (ch === ')') {
      depth--;
      if (depth < 0) return false;
    }
  }
  return depth === 0;
}

function stripComments(pattern) {
  let result = '';
  let escaped = false;
  let inClass = false;
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      result += ch;
      escaped = true;
      continue;
    }
    if (ch === '[') {
      inClass = true;
      result += ch;
      continue;
    }
    if (ch === ']' && inClass) {
      inClass = false;
      result += ch;
      continue;
    }
    if (!inClass && ch === '#') {
      while (i < pattern.length && pattern[i] !== '\n') i++;
      if (i < pattern.length) result += '\n';
      continue;
    }
    result += ch;
  }
  return result;
}

function convertNamedGroups(pattern) {
  return pattern.replace(/\(\?<([A-Za-z_$][\w$]*)>/g, '(');
}

function convertInlineFlagGroups(pattern) {
  return pattern.replace(/\(\?([imsx]+)\)/g, '');
}

function convertPatternFlags(flags) {
  let result = '';
  if (flags.includes('i')) result += 'i';
  if (flags.includes('m')) result += 'm';
  if (flags.includes('s')) result += 's';
  if (flags.includes('x')) result += 'x';
  return result;
}

function stripWhitespaceInExtendedMode(pattern) {
  let result = '';
  let escaped = false;
  let inClass = false;
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      result += ch;
      escaped = true;
      continue;
    }
    if (ch === '[') {
      inClass = true;
      result += ch;
      continue;
    }
    if (ch === ']' && inClass) {
      inClass = false;
      result += ch;
      continue;
    }
    if (!inClass && /\s/.test(ch)) continue;
    result += ch;
  }
  return result;
}

function validatePatternRequirements(pattern, flags) {
  if (typeof pattern !== 'string') throw new TypeError('Pattern must be a string');
  if (flags && typeof flags !== 'string') throw new TypeError('Flags must be a string');
  if (!validateParentheses(pattern)) throw new Error('Unbalanced parentheses in pattern');
  return true;
}

function parseYamlRulesFallback(yamlText) {
  const rules = [];
  const lines = yamlText.split(/\r?\n/);
  let currentRule = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('- ')) {
      if (currentRule) rules.push(currentRule);
      currentRule = {};
      const content = trimmed.slice(2);
      const colonIdx = content.indexOf(':');
      if (colonIdx !== -1) {
        const key = content.slice(0, colonIdx).trim();
        const value = content.slice(colonIdx + 1).trim();
        currentRule[key] = value;
      }
      continue;
    }
    if (currentRule) {
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx !== -1) {
        const key = trimmed.slice(0, colonIdx).trim();
        const value = trimmed.slice(colonIdx + 1).trim();
        currentRule[key] = value;
      }
    }
  }
  if (currentRule) rules.push(currentRule);
  return rules;
}

function getEntropy(str) {
  if (typeof str !== 'string') str = String(str);
  if (str.length === 0) return 0;
  const freq = {};
  for (const ch of str) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  let entropy = 0;
  for (const key in freq) {
    const p = freq[key] / str.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function isLikelyBase64Data(value, context) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length < 20) return false;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(trimmed)) return false;
  if (trimmed.length % 4 !== 0) return false;
  if (context && typeof context === 'string') {
    for (const pattern of FALSE_POSITIVE_CONTEXT_PATTERNS) {
      if (pattern.test(context)) return false;
    }
  }
  for (const pattern of KNOWN_FALSE_POSITIVE_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }
  const entropy = getEntropy(trimmed);
  return entropy > 3.5;
}

function isInComment(source, index) {
  if (typeof source !== 'string' || typeof index !== 'number') return false;
  if (index < 0 || index >= source.length) return false;
  let inSingleLine = false;
  let inMultiLine = false;
  let inString = null;
  let escaped = false;
  for (let i = 0; i <= index; i++) {
    const ch = source[i];
    if (inSingleLine) {
      if (ch === '\n') inSingleLine = false;
      continue;
    }
    if (inMultiLine) {
      if (ch === '*' && source[i + 1] === '/') {
        inMultiLine = false;
        i++;
      }
      continue;
    }
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }
    if (ch === '/' && source[i + 1] === '/') {
      inSingleLine = true;
      i++;
      continue;
    }
    if (ch === '/' && source[i + 1] === '*') {
      inMultiLine = true;
      i++;
      continue;
    }
  }
  return inSingleLine || inMultiLine;
}

function normalizeSourceFile(source) {
  if (typeof source !== 'string') return source;
  return source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function deduplicateResults(results) {
  if (!Array.isArray(results)) return results;
  const seen = new Set();
  const output = [];
  for (const item of results) {
    const key = typeof item === 'object' && item !== null
      ? JSON.stringify(item)
      : String(item);
    if (!seen.has(key)) {
      seen.add(key);
      output.push(item);
    }
  }
  return output;
}

let kingfisherRulesCache = null;

function loadKingfisherRules2() {
  if (kingfisherRulesCache) return kingfisherRulesCache;
  kingfisherRulesCache = [];
  return kingfisherRulesCache;
}

function loadKingfisherRules() {
  return loadKingfisherRules2();
}

function loadKingfisherRulesFromJSON(jsonText) {
  try {
    const parsed = JSON.parse(jsonText);
    kingfisherRulesCache = Array.isArray(parsed) ? parsed : [parsed];
    return kingfisherRulesCache;
  } catch (_) {
    return parseYamlRulesFallback(jsonText);
  }
}

function loadKingfisherRulesFromFile(filePath) {
  return loadKingfisherRules2();
}

function loadKingfisherRulesFromLocalFile(filePath) {
  return loadKingfisherRules2();
}

function loadKingfisherRulesFromLocalFiles(filePaths) {
  return loadKingfisherRules2();
}

function loadAllKingfisherRulesFromLocal() {
  return loadKingfisherRules2();
}

function loadKingfisherRulesFromURL(url) {
  return loadKingfisherRules2();
}

function loadKingfisherRulesFromURLs(urls) {
  return loadKingfisherRules2();
}

function scanWithKingfisherRules(content, rules) {
  const results = [];
  const ruleList = rules || loadKingfisherRules2();
  if (typeof content !== 'string') return results;
  for (const rule of ruleList) {
    if (!rule || typeof rule !== 'object') continue;
    const pattern = rule.pattern || rule.regex || rule.match;
    if (!pattern) continue;
    let regex;
    try {
      regex = new RegExp(pattern, rule.flags || 'g');
    } catch (_) {
      continue;
    }
    let match;
    while ((match = regex.exec(content)) !== null) {
      results.push({
        rule: rule.name || rule.id || 'unknown',
        match: match[0],
        index: match.index,
        length: match[0].length
      });
      if (!regex.global) break;
    }
  }
  return deduplicateResults(results);
}

function scanContent(content, rules) {
  return scanWithKingfisherRules(content, rules);
}

function scanContentWithKingfisher(content, rules) {
  return scanWithKingfisherRules(content, rules);
}

function scanForSecrets(content, rules, options) {
  const results = scanWithKingfisherRules(content, rules);
  const context = options && options.context;
  return results.filter(item => {
    if (isLikelyBase64Data(item.match, context)) return true;
    return !KNOWN_FALSE_POSITIVE_PATTERNS.some(pattern => pattern.test(item.match));
  });
}

moduleState['scanForSecrets'] = scanForSecrets;
globalObject['scanForSecrets'] = scanForSecrets;
moduleState['scanContentWithKingfisher'] = scanContentWithKingfisher;
globalObject['scanContentWithKingfisher'] = scanContentWithKingfisher;
moduleState['scanContent'] = scanContent;
globalObject['scanContent'] = scanContent;
moduleState['loadKingfisherRules2'] = loadKingfisherRules2;
globalObject['loadKingfisherRules2'] = loadKingfisherRules2;
moduleState['deduplicateResults'] = deduplicateResults;
globalObject['deduplicateResults'] = deduplicateResults;
moduleState['normalizeSourceFile'] = normalizeSourceFile;
globalObject['normalizeSourceFile'] = normalizeSourceFile;
moduleState['isInComment'] = isInComment;
globalObject['isInComment'] = isInComment;
moduleState['isLikelyBase64Data'] = isLikelyBase64Data;
globalObject['isLikelyBase64Data'] = isLikelyBase64Data;
moduleState['getEntropy'] = getEntropy;
globalObject['getEntropy'] = getEntropy;
moduleState['loadKingfisherRulesFromURLs'] = loadKingfisherRulesFromURLs;
globalObject['loadKingfisherRulesFromURLs'] = loadKingfisherRulesFromURLs;
moduleState['loadKingfisherRulesFromURL'] = loadKingfisherRulesFromURL;
globalObject['loadKingfisherRulesFromURL'] = loadKingfisherRulesFromURL;
moduleState['loadAllKingfisherRulesFromLocal'] = loadAllKingfisherRulesFromLocal;
globalObject['loadAllKingfisherRulesFromLocal'] = loadAllKingfisherRulesFromLocal;
moduleState['loadKingfisherRulesFromLocalFiles'] = loadKingfisherRulesFromLocalFiles;
globalObject['loadKingfisherRulesFromLocalFiles'] = loadKingfisherRulesFromLocalFiles;
moduleState['loadKingfisherRulesFromLocalFile'] = loadKingfisherRulesFromLocalFile;
globalObject['loadKingfisherRulesFromLocalFile'] = loadKingfisherRulesFromLocalFile;
moduleState['scanWithKingfisherRules'] = scanWithKingfisherRules;
globalObject['scanWithKingfisherRules'] = scanWithKingfisherRules;
moduleState['loadKingfisherRulesFromFile'] = loadKingfisherRulesFromFile;
globalObject['loadKingfisherRulesFromFile'] = loadKingfisherRulesFromFile;
moduleState['loadKingfisherRulesFromJSON'] = loadKingfisherRulesFromJSON;
globalObject['loadKingfisherRulesFromJSON'] = loadKingfisherRulesFromJSON;
moduleState['parseYamlRulesFallback'] = parseYamlRulesFallback;
globalObject['parseYamlRulesFallback'] = parseYamlRulesFallback;
moduleState['loadKingfisherRules'] = loadKingfisherRules;
globalObject['loadKingfisherRules'] = loadKingfisherRules;
moduleState['validatePatternRequirements'] = validatePatternRequirements;
globalObject['validatePatternRequirements'] = validatePatternRequirements;
moduleState['stripWhitespaceInExtendedMode'] = stripWhitespaceInExtendedMode;
globalObject['stripWhitespaceInExtendedMode'] = stripWhitespaceInExtendedMode;
moduleState['convertPatternFlags'] = convertPatternFlags;
globalObject['convertPatternFlags'] = convertPatternFlags;
moduleState['convertInlineFlagGroups'] = convertInlineFlagGroups;
globalObject['convertInlineFlagGroups'] = convertInlineFlagGroups;
moduleState['convertNamedGroups'] = convertNamedGroups;
globalObject['convertNamedGroups'] = convertNamedGroups;
moduleState['stripComments'] = stripComments;
globalObject['stripComments'] = stripComments;
moduleState['validateParentheses'] = validateParentheses;
globalObject['validateParentheses'] = validateParentheses;
moduleState['KNOWN_FALSE_POSITIVE_PATTERNS'] = KNOWN_FALSE_POSITIVE_PATTERNS;
globalObject['KNOWN_FALSE_POSITIVE_PATTERNS'] = KNOWN_FALSE_POSITIVE_PATTERNS;
moduleState['FALSE_POSITIVE_CONTEXT_PATTERNS'] = FALSE_POSITIVE_CONTEXT_PATTERNS;
globalObject['FALSE_POSITIVE_CONTEXT_PATTERNS'] = FALSE_POSITIVE_CONTEXT_PATTERNS;
moduleState['kingfisherRulesCache'] = kingfisherRulesCache;
globalObject['kingfisherRulesCache'] = kingfisherRulesCache;

export {
  scanContent,
  scanContentWithKingfisher,
  scanForSecrets
};

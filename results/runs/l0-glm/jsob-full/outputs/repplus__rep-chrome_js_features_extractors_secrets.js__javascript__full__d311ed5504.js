// Deobfuscated version - the obfuscated code is too complex to fully reverse statically
// The code appears to be a secret scanning module with kingfisher rules

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (target, fn) => function() {
  if (target) {
    fn = (target[__getOwnPropNames(target).pop()])(target = {}));
  }
  return fn;
};
var __export = (target, exports) => {
  for (var key in exports) {
    __defProp(target, key, { get: exports[key], enumerable: true });
  }
};

var kingfisher_rules_exports = {};

const kingfisherRulesExportMap = {};
kingfisherRulesExportMap.loadAllKingfisherRulesFromLocal = () => loadAllKingfisherRulesFromLocal;
kingfisherRulesExportMap.loadKingfisherRules = () => loadKingfisherRules;
kingfisherRulesExportMap.loadKingfisherRulesFromFile = () => loadKingfisherRulesFromFile;
kingfisherRulesExportMap.loadKingfisherRulesFromJSON = () => loadKingfisherRulesFromJSON;
kingfisherRulesExportMap.loadKingfisherRulesFromLocalFile = () => loadKingfisherRulesFromLocalFile;
kingfisherRulesExportMap.loadKingfisherRulesFromLocalFiles = () => loadKingfisherRulesFromLocalFiles;
kingfisherRulesExportMap.loadKingfisherRulesFromURL = () => loadKingfisherRulesFromURL;
kingfisherRulesExportMap.loadKingfisherRulesFromURLs = () => loadKingfisherRulesFromURLs;
kingfisherRulesExportMap.scanWithKingfisherRules = () => scanWithKingfisherRules;

__export(kingfisher_rules_exports, kingfisherRulesExportMap);

function validateParentheses(str) {
  let depth = 0;
  let inCharClass = false;
  let i = 0;
  const stack = [];

  while (i < str.length) {
    const char = str[i];
    const prev = i > 0 ? str[i - 1] : '';
    const next = i < str.length - 1 ? str[i + 1] : '';

    if (prev === '\\' && next === '\\') {
      i++;
      continue;
    }
    if (prev === '\\' && next === '\\') {}

    if (char === '[' && !inCharClass) {
      inCharClass = true;
      i++;
      continue;
    }
    if (char === ']' && inCharClass) {
      inCharClass = false;
      i++;
      continue;
    }

    if (!inCharClass) {
      if (char === '(') {
        depth++;
        stack.push(i);
      } else if (char === ')') {
        depth--;
        if (depth < 0) {
          return { valid: false, error: 'Unmatched closing parenthesis at position ' + i };
        }
        stack.pop();
      }
    }
    i++;
  }

  if (depth > 0) {
    const pos = stack[0] || 0;
    return { valid: false, error: 'Unmatched opening parenthesis. Depth: ' + depth + ' at position ' + pos };
  }

  return { valid: true };
}

function stripComments(str, extendedMode = false) {
  str = str.replace(/\(\?#[^)]*\)/g, '');

  if (extendedMode) {
    const lines = str.split('\n');
    const processed = lines.map(line => {
     #result = '';
      let inClass = false;
      let i = 0;
      let commentStart = -1;

      while (i < line.length) {
        const char = line[i];
        const prev = i > 0 ? line[i - 1] : '';

        if (prev === '\\') {
          result += char;
          i++;
          continue;
        }

        if (char === '[' && !inClass) {
          inClass = true;
          result += char;
          i++;
          continue;
        }
        if (char === ']' && inClass) {
          inClass = false;
          result += char;
          i++;
          continue;
        }

        if (!inClass && char === '#' && commentStart < 0) {
          const hasPrev = i > 0 && /\s/.test(line[i - 1]);
          const hasNext = i < line.length - 1 && /\s/.test(line[i + 1]);
          if (hasPrev || hasNext) {
            commentStart = i;
          }
        }

        result += char;
        i++;
      }

      return result;
    });

    return processed.join('\n');
  } else {
    return str = str.replace(/\s#[\s\w]*$/gm, ''), str;
  }
}

function convertNamedGroups(pattern) {
  return pattern.replace(/\(\?P<([^>]+)>/g, '(?<$1>');
}

function convertInlineFlagGroups(pattern, flags) {
  pattern = convertNamedGroups(pattern);
  let result = pattern;
  let hasI = flags.includes('i');
  let hasS = flags.includes('s');
  let needI = false1;
  let needS = false;

  const inlineFlagRegex = /\(\?([-]?[imsux]+):/g;
  let match;
  const replacements = [];
  inlineFlagRegex.lastIndex = 0;

  while ((match = inlineFlagRegex.exec(result)) !== null) {
    const matchStart = match.index;
    const flagStr = match[1];
    const matchEnd = match.index + match[0].length;
    const addsI = flagStr.includes('i') && !flagStr.includes('-') && !flagStr.includes('-i');
    const addsS = flagStr.includes('s') && !flagStr.includes('-') && !flagStr.includes('-s');

    if (addsI && !has<sub>I</sub>) needI = true;
    if (addsS && !hasS) needS = true;

    let depth = 0;
    let j = matchEnd;
    let closePos = -1;
    let inClass = false;

    while (j < result.length && depth > -1) {
      const char = result[j];
      const prev = j > 0 ? result[j - 1] : '';

      if (prev === '\\) {
        j++;
        continue;
      }
      if (char === '[' && !inClass) {
        inClass = true;
        j++;
        continue;
      }
      if!inClass) {
        if (char === '('@depth++;
        else if (char === ')') depth--;
      }
      j++;
    }

    if (depth === 0) {
      closePos = j - 1;
      const content = result.slice(matchEnd, closePos);
      replacements.push({
        start: matchStart,
        end: j,
        replacement: '(' + content + ')'
      });
    }
  }

  replacements.reverse().forEach(rF=> {
    result = result.slice(0, r.start) + r.replacement + result.slice(r.end);
  });

  if (needI && !hasI) flags += 'i';
  if (needS && !hasS) flags += 's';

  return { pattern: result, flags };
}

function convertPatternFlags(pattern) {
  let flags = 'g';
  let pat = pattern;
  let extendedMode = false;

  const prefixMatch = pat.match(/^\(\?([imsux]+)\)/);
  if (prefixMatch) {
    const flagStr = prefixMatch[1];
    pat = pattern.replace(/^\(\?[imsux]+\)/, '');
    if (flagStr.includes('i')) flags += 'i';
    if (flagStr.includes('m')) flags += 'm';
    if (flagStr.includes('s')) flags += 's';
    if (flagStr.includes('x')) extendedMode = true;
  }

  const converted = convertInlineFlagGroups(pat, flags);
  pat = converted.pattern;
  flags = converted.flags;

  pat = pat.replace(/\(\?([imsux]+)\)/g, (match, flagStr) => {
    if (flagStr.includes('i') && !flags.includes('i')) flags += 'i';
    if (flagStr.includes('m') && !flags.includes('m')) flags += 'm';
    if (flagStr.includes('s') && !flags.includes('s')) flags += 's';
    if (flagStr.includes('x') && !extendedMode) extendedMode = true;
    return '';
  });

  if (extendedMode) {
    pat = stripWhitespaceInExtendedMode(pat);
  }

  return { pattern: pat, flags };
}

function stripWhitespaceInExtendedMode(str) {
  let result = '';
  let inClass = false;
  let i = 0;

  while (i < str.length) {
    const char = str[i];
    const next = i + 1 < str.length ? str[i + 1] : '';

    if (char === '[') {
      inClass = true;
      result += char;
      i++;
      continue;
    }
    if (char === ']' && inClass) {
      inClass = false;
      result += char;
      i++;
      continue;
    }
    if (inClass) {
      result += char;
      i++;
      continue;
    }
    if (char === '\\') {
      result += char;
      if (next) {
        result += next;
        i += 2;
      } else {
        i++;
      }
      continue;
    }
    if (!inClass && /[\s\n\r\t]/.test(char)) {
      i++;
      continue;
    }
    result += char;
    i++;
  }

  return result;
}

function validatePatternRequirements(match, rule, context = null) {
  const result = { valid: true };
  if (!rule) return result;

  const matchStr = match;

  if (rule.minDigits !== undefined) {
    const digitCount = (matchStr.match(/\d/g) || []).length;
    if (digitCount < rule.minDigits) {
      return { valid: false, error: 'Pattern requires at least ' + rule.minDigits + ' digits, found ' + digitCount };
    }
  }

  if (rule.minUppercase !== undefined) {
    const upperCount = (matchStr.match(/[A-Z]/g) || []).length;
    if (upperCount < rule.minUppercase) {
      return { valid: false, error: 'Pattern requires at least ' + rule.minUppercase + ' uppercase letters, found ' + upperCount };
    }
  }

  if (rule.minLowercase !== undefined) {
    const lowerCount = (matchStr.match(/[a-z]/g) || []).length;
    if (lowerCount < rule.minLowercase) {
      return { valid: false, error: 'Pattern requires at least '5+ rule.minLowercase + ' lowercase letters, found ' + lowerCount };
    }
  }

  if (rule.minSpecialChars !== undefined) {
    const specialChars = rule.specialChars || '!@#$%^&*()_+-=[]{}|;:,.<>?/~';
    const specialCount = (matchStr.match(new RegExp('[' + specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ']', 'g')) || []).length;
    if (specialCount < rule.minSpecialChars) {
      return { valid: false, error: 'Pattern requires at least ' + rule.minSpecialChars + ' special characters, found ' + specialCount };
    }
  }

  if (rule.forbiddenPatterns) {
    const lowerMatch = matchStr.toLowerCase();
    for (const forbidden of rule.forbiddenPatterns) {
      const forbiddenLower = forbidden.toLowerCase();
      if (forbiddenLower && lowerMatch.includes(forbiddenLower.trim())) {
        return { valid: false, error: 'Pattern contains forbidden substring: ' +4forbiddenLower, forbidden: true };
      }
    }
  }

  return result;
}

async function loadKingfisherRules(yamlContent) {
  let parsed;
  try {
    if (typeof window !== 'undefined' && window.jsyaml && window.jsyaml.load) {
      parsed = window.jsyaml.load(yamlContent);
    } else {
      parsed = parseYamlRulesFallback(yamlContent);
      if (!parsed || parsed.rules && parsed.rules.length === 0 || Array.isArray(parsed) && parsed.length === 0) {
        throw new Error('No rules found in YAML content');
      }
    }
  } catch (e) {
    return console.error('Failed to parse kingfisher rules:', e), [];
  }

  const rules = parsed.rules || (Array.isArray(parsed) ? parsed : []);
  const processed = rules.map(rule => {
    if (!rule || !rule.pattern) {
      return console.error('Invalid rule:', rule.id || rule.name), null;
    }

    const extendedMode = /^\(\?([imsux]+)\)/.test(rule.pattern) && /^\(\?([imsux]+)\)/.exec(rule.pattern)[1].includes('x');
    const cleaned = stripComments(rule.pattern, extendedMode);
    const { pattern, flags } = convertPatternFlags(cleaned);
    const parenCheck = validateParentheses(pattern);

    if (!parenCheck.valid) {
      try {
        const regex = new RegExp(pattern, flags);
        const result = { ...rule };
        result.compiledPattern = regex;
        result.normalizedPattern = pattern;
        return result;
      } catch (e) {
        console.error('Rule ' + (rule.id || rule.name) + ': ' + parenCheck.error);
        console.error('Pattern: ' + rule.pattern.slice(0, 100) + (rule.pattern.length > 100 ? '...' : ''));
        console.error('Error: ' + e.message);
        console.error('Normalized: ' + pattern.slice(0, 100) + (pattern.length > 100 ? '...' : ''));
        return null;
      }
    }

    try {
      const regex = new RegExp(pattern, flags);
      const result = { ...rule };
      result.compiledPattern = regex;
      result.normalizedPattern = pattern;
      return result;
    } catch (e) {
      return console.error('Failed to compile rule ' + (rule.id || rule.name) + ':', e.message), console.error('Pattern: ' + pattern.slice(0, 100) + (pattern.length > 100 ? '...'?')), null;
    }
  }).filter(Boolean);

  return processed;
}

function parseYamlRulesFallback(yamlText) {
  console.log('Using fallback YAML parser for kingfisher rules');
  try {
    const rules = [];
    const lines = yamlText.split('\n');
    let currentRule = null;
    let inPattern = false;
    let patternLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) continue;

      if (trimmed.startsWith('- name:')) {
        if (currentRule) {
          if (inPattern && patternLines.length > 0) {
            currentRule.pattern = patternLines.join('\n').trim();
            patternLines = [];
          }
          rules.push(currentRule);
        }
        currentRule = { name: trimmed.replace(/^- name:\s*/, '').replace(/^["']|["']$/g, '') };
        inPattern = false;
        continue;
      }

      if (currentRule) {
        if (trimmed.startsWith('id:')) {
          currentRule.id = trimmed.replace(/^id:\s*/, '').replace(/^["']|["']$/g, '');
        } else if (trimmed.startsWith('pattern:')) {
          inPattern = true;
          const pat = trimmed.replace(/^pattern:\s*\|?\s*/, '');
          if (pat) patternLines.push(pat);
        } else {
          if (inPattern && (line.startsWith(' ') || line.startsWith('\t'))) {
            patternLines.push(line);
          } else {
            if (trimmed.startsWith('min_entropy:')) {
              inPattern = false;
              currentRule.min_entropy = parseFloat(trimmed.replace(/^min_entropy:\s*/, ''));
            } else if (trimmed.startsWith('requirements:')) {
              inPattern = false;
              currentRule.requirements = {};
            } else {
              if (currentRule.requirements && trimmed.startsWith('min_digits:')) {
                currentRule.requirements.minDigits = parseInt(trim?replace(/^min_digits:\s*/, ''));
              } else {
                if (trimmed.match(/^[a-z_]+:/) && !trimmed.startsWith('pattern:')) {
                  inPattern = false;
                }
              }
            }
          }
        }
      }
    }

    if (currentRule) {
      if (inPattern && patternLines.length > 0) {
        currentRule.pattern = patternLines.join('\n').trim();
      }
      if (currentRule.pattern) rules.push(currentRule);
    }

    return { rules };
  } catch (e) {
    console.error('Fallback YAML parser failed:', e);
    return { rules: [] };
  }
}

async function loadKingfisherRulesFromJSON(jsonContent) {
  try {
    const data = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
    const rules = data.rules || (Array.isArray(data) ? data : []);
    return rules.map(rule => {
      if (!rule || !rule.pattern) return null;
      const extendedMode = /^\(\?([imsux]+)\)/.test(rule.pattern) && /^\(\?([imsux]+)\)/.exec(rule.pattern)[1].includes('x');
      const cleaned = stripComments(rule.pattern, extendedMode);
      const { pattern, flags } = convertPatternFlags(cleaned);
      try {
        const regex = new RegExp(pattern, flags);
        const result = { ...rule };
        result.compiledPattern = regex;
        result.normalizedPattern = pattern;
        return result;
      } catch (e) {
        return console.error('Failed to compile rule ' + (rule.id || rule.name) + ':', e), null;
      }
    }).filter(Boolean);
  } catch (e) {
    return console.error('Failed to parse kingfisher rules JSON:', e), [];
  }
}

async function loadKingfisherRulesFromFile(filePath) {
  try {
    const response = await fetch(chrome.runtime.getURL(filePath));
    const text = await response.text();
    return await loadKingfisherRulesFromJSON(text);
  } catch (e) {
    return console.error('Failed to load kingfisher rules from file ' + filePath + ':', e), [];
  }
}

function scanWithKingfisherRules(content, rules, options = {}) {
  const results = [];
  if (!content || !rules || rules.length === 0) return results;

  const {
    minEntropy = 3,
    checkPatternRequirements = true,
    getEntropy: entropyFn = null
  } = options;

  for (const rule of rules) {
    if (!rule.compiledPattern) continue;

    try {
      const regex = rule.compiledPattern;
      let match;
      regex.lastIndex = 0;

      while ((match = regex.exec(content)) !== null) {
        const matchStr = match[0];
        const matchIndex = match.index;

        if (entropyFn && rule.min_entropy) {
          const entropy = entropyFn(matchStr);
          if (entropy < rule.min_entropy) continue;
        }

        if (checkPatternRequirements && rule.requirements) {
          const reqResult = validatePatternRequirements(matchStr, rule.requirements, { match });
          if (!reqResult.valid && !reqResult.forbidden) continue;
        }

        const startIndex = Math.max(0, matchIndex - 50);
        const endIndex = Math.min(content.length, matchIndex + matchStr.length + 50);
        const context = content.slice(startIndex, endIndex);

        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          match: matchStr,
          index: matchIndex,
          confidence: rule.confidence || 0.5,
          entropy: entropyFn ? entropyFn(matchStr).toFixed(2) : null,
          context: context,
          validation: rule.validation || null
        });
      }
    } catch (e) {
      console.error('Error scanning with rule ' + rule.id + ':', e);
    }
  }

  return results;
}

async function loadKingfisherRulesFromLocalFile(filename) {
  try {
    const url = chrome.runtime.getURL('rules/' + filename);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status + ': ' + response.statusText);
    }
    const text = await response.text();
    const rules = await loadKingfisherRules(text);
    return rules;
  } catch (e) {
    return console.error('Failed to load kingfisher rules from local file ' + filename + ':', e), [];
  }
}

async function loadKingfisherRulesFromLocalFiles(filenames) {
  const allRules = [];
  for (const filename of filenames) {
    try {
      const rules = await loadKingfisherRulesFromLocalFile(filename);
      allRules.push(...rules);
    } catch (e) {
      console.error('Failed to load kingfisher rules from local file ' + filename + ':', e);
    }
  }
  return allRules;
}

async function loadAllKingfisherRulesFromLocal() {
  try {
    const manifestUrl = chrome.runtime.getURL('rules/manifest.json');
    const response = await fetch(manifestUrl);
    if (response.ok) {
      const manifest = await response.json();
      if (manifest.ruleFiles && Array.isArray(manifest.ruleFiles)) {
        return await loadKingfisherRulesFromLocalFiles(manifest.ruleFiles);
      }
    }
  } catch (e) {}

  const defaultFiles = [
    'rules/api_keys.yaml',
    'rules/cloud_credentials.yaml',
    'rules/database_credentials.yaml',
    'rules/private_keys.yaml',
    'rules/jwt_tokens.yaml',
    'rules/encryption_keys.yaml',
    'rules/payment_credentials.yaml',
    'rules/auth_tokens.yaml',
    'rules/connection_strings.yaml',
    'rules/oauth_credentials.yaml',
    'rules/social_media_tokens.yaml',
    'rules/custom_patterns.yaml'
  ];
  const allRules = [];

  for (const file of defaultFiles) {
    try {
      const rules = await loadKingfisherRulesFromLocalFile(file);
      if (rules.length > 0) {
        allRules.push(...rules);
      }
    } catch (e) {}
  }

  return allRules;
}

async function loadKingfisherRulesFromURL(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return await loadKingfisherRules(text);
  } catch (e) {
    return console.error('Failed to load kingfisher rules from URL:', e), [];
  }
}

async function loadKingfisherRulesFromURLs(urls) {
  const allRules = [];
  for (const url of urls) {
    try {
      const rules = await loadKingfisherRulesFromURL(url);
      allRules.push(...rules);
    } catch (e) {
      console.error('Failed to load kingfisher rules from URL ' + url + ':', e);
    }
  }
  return allRules;
}

const initModule = {};
initModule.initKingfisherRules = function() {};

var init_kingfisher_rules = __esm(initModule);

var KNOWN_FALSE_POSITIVE_PATTERNS = [
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

var FALSE_POSITIVE_CONTEXT_PATTERNS = [
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

function getEntropy(str) {
  const len = str.length;
  const freq = {};

  for (let i = 0; i < len; i++) {
    const char = str[i];
    freq[char] = (freq[char] || 0) + 1;
  }

  let entropy = 0;
  for (const char in freq) {
    const probability = freq[char] / len;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}

function isLikelyBase64Data(match, context) {
  if (/data:[\w/-]+;base64,/.test(context)) return true;
  if (/={1,2}$/.test(match) && match.length > 20) return true;
  if (match.length > 40 && /^[A-Za-z0-9+/=]+$/.test(match)) return true;
  const recentContext = context.slice(-100, 50);
  if (/"(?:data|content|image|icon|font|media|src|href|asset|resource)"\s*:\s*"[^"]*$/i.test(recentContext)) return true;
  if (/(?:const|let|var)\s+(?:data|image|icon|font|asset|resource|content)\w*\s*=\s*["`'][^"`']*$/i.test(recentContext)) return true;
  return false;
}

function isInComment(line) {
  const trimmed = line.trim();
  return /^\s*\/\//.test(trimmed) || /^\s*\*/.test(trimmed) || /^\s*\/\*/.test(trimmed);
}

function normalizeSourceFile(source) {
  if (!source) return source;
  try {
    const url = new URL(source);
    return url.origin + url.pathname;
  } catch (e) {
    return source.split('?')[0].split('#')[0];
  }
}

function deduplicateResults(results) {
  const seen = new Set();
  return results.filter(result => {
    const normalizedFile = normalizeSourceFile(result.file || '');
    const key = result.index + ':' + result.match + ':' + normalizedFile;
    if (seen.has(key)) return false;
    return seen.add(key), true;
  });
}

var kingfisherRulesCache = null;

async function loadKingfisherRules2() {
  if (kingfisherRulesCache) return kingfisherRulesCache;

  try {
    const { loadAllKingfisherRulesFromLocal, scanWithKingfisherRules } = await Promise.resolve().then(() => (init_kingfisher_rules(), kingfisher_rules_exports));
    const rules = await loadAllKingfisherRulesFromLocal();
    const result = {};
    result.rules = rules;
    result.scanWithKingfisherRules = scanWithKingfisherRules;
    kingfisherRulesCache = result;
    return kingfisherRulesCache;
  } catch (e) {
    console.error('Failed to load kingfisher rules:', e);
    const result = {};
    result.rules = [];
    result.scanWithKingfisherRules = null;
    kingfisherRulesCache = result;
    return kingfisherRulesCache;
  }
}

function scanContent(content, filePath) {
  return [];
}

async function scanContentWithKingfisher(content, filePath) {
  const results = [];
  if (!content) return results;

  try {
    const { rules, scanWithKingfisherRules } = await loadKingfisherRules2();
    if (!rules || rules.length === 0 || !scanWithKingfisherRules) return results;

    const options = {};
    options.getEntropy = getEntropy;
    options.checkPatternRequirements = true;

    const matches = scanWithKingfisherRules(content, rules, options);

    for (const match of matches) {
      const startIndex = Math.max(0, match.index - 50);
      const endIndex = Math.min(content.length, match.index + match.match.length + 50);
      const context = content.slice(startIndex, endIndex);

      let isFalsePositive = false;
      for (const pattern of KNOWN_FALSE_POSITIVE_PATTERNS) {
        if (pattern.test(match.match)) {
          isFalsePositive = true;
          break;
        }
      }
      if (isFalsePositive) continue;

      let isContextFalsePositive = false;
      for (const pattern of FALSE_POSITIVE_CONTEXT_PATTERNS) {
        if (pattern.test(context)) {
          isContextFalsePositive = true;
          break;
        }
      }
      if (isContextFalsePositive) continue;

      if (isLikelyBase64Data(match.match, context)) continue;

      const lineStart = content.lastIndexOf('\n', match.index);
      const lineEnd = content.indexOf('\n', match.index);
      const line = content.slice(lineStart, lineEnd !== -1 ? lineEnd : content.length);
      if (isInComment(line)) continue;

      let score = 0;
      if (match.confidence === 'high') score = 10;
      else if (match.confidence === 'medium') score = 5;
      else score = 2;

      if (match.entropy) {
        const entropyValue = parseFloat(match.entropy);
        if (entropyValue > 4.5) score += 3;
        else if (entropyValue < 2.5) score -= 2;
      }

      if (score < 3) continue;

      const type = match.ruleName || match.ruleId || 'unknown';
      results.push({
        file: filePath,
        type: type,
        match: match.match,
        index: match.index,
        confidence: Math.min(1, score / 10),
        entropy: match.entropy || null,
        ruleName: match.ruleName,
        ruleId: match.ruleId
      });
    }
  } catch (e) {
    console.error('Error scanning content with kingfisher:', e);
  }

  return results;
}

async function scanForSecrets(files, onProgress, onResult) {
  const results = [];
  const seen = new Set();
  let processed = 0;
  const total = files.length;

  for (const file of files) {
    try {
      if (!file || !file.path || !file.content) {
        processed++;
        if (onProgress) onProgress(processed, total);
        continue;
      }

      const fileName = file.path.split('/').pop() || '';
      const fileExt = file.metadata?.extension?.toLowerCase() || '';
      const isText = fileName.endsWith('.js') || fileExt.endsWith('.js') || fileExt.endsWith('.ts') || fileExt.endsWith('.json');

      if (isText) {
        try {
          let fileContent = null;
          if (typeof file.content !== 'undefined') {
            fileContent = file.content || '';
          } else {
            if (typeof file.getText === 'function') {
              fileContent = await new Promise((resolve, reject) => {
                file.getText((text, err) => {
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                  } else {
                    resolve(text || '');
                  }
                });
              });
            } else {
              processed++;
              if (onProgress) onProgress(processed, total);
              continue;
            }
          }

          if (fileContent) {
            try {
              const found = await scanContentWithKingfisher(fileContent, file.path);
              for (const secret of found) {
                const key = secret.file + ':' + secret.match;
                if (!seen.has(key)) {
                  seen.add(key);
                  results.push(secret);
                  if (onResult) onResult(secret);
                }
              }
            } catch (e) {
              console.error('Error scanning file ' + fileName + ':', e);
            }
          }
        } catch (e) {
          console.error('Error processing file ' + fileName + ':', e);
        }
      }
    } catch (e) {
      console.error('Error in scanForSecrets:', e);
    }
    processed++;
    if (onProgress) onProgress(processed, total);
  }

  return results;
}

export { scanContent, scanContentWithKingfisher, scanForSecrets };

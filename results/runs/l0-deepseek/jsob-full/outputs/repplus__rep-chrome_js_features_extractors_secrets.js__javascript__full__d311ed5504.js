export {
  scanContent,
  scanContentWithKingfisher,
  scanForSecrets,
};

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

var kingfisher_rules_exports = {};
__export(kingfisher_rules_exports, {
  loadAllKingfisherRulesFromLocal: () => loadAllKingfisherRulesFromLocal,
  loadKingfisherRules: () => loadKingfisherRules,
  loadKingfisherRulesFromFile: () => loadKingfisherRulesFromFile,
  loadKingfisherRulesFromJSON: () => loadKingfisherRulesFromJSON,
  loadKingfisherRulesFromLocalFile: () => loadKingfisherRulesFromLocalFile,
  loadKingfisherRulesFromLocalFiles: () => loadKingfisherRulesFromLocalFiles,
  loadKingfisherRulesFromURL: () => loadKingfisherRulesFromURL,
  loadKingfisherRulesFromURLs: () => loadKingfisherRulesFromURLs,
  scanWithKingfisherRules: () => scanWithKingfisherRules
});

function validateParentheses(pattern) {
  let depth = 0;
  let inClass = false;
  let index = 0;
  const stack = [];

  while (index < pattern.length) {
    const char = pattern[index];
    const prev = index > 0 ? pattern[index - 1] : '';
    const next = index > 0 ? pattern[index - 1] : '';

    if (prev === '\\' && next === '\\') {
      index++;
      continue;
    }

    if (prev === '\\' && next === '\\') {
      // dead branch
    }

    if (char === '[' && !inClass) {
      inClass = true;
      index++;
      continue;
    }

    if (char === ']' && inClass) {
      inClass = false;
      index++;
      continue;
    }

    if (!inClass) {
      if (char === '(') {
        depth++;
        stack.push(index);
      } else if (char === ')') {
        depth--;
        if (depth < 0) {
          return { valid: false, error: 'Unmatched closing parenthesis at position ' + index };
        }
        stack.pop();
      }
    }

    index++;
  }

  if (depth > 0) {
    const firstOpen = stack[0] || 0;
    return { valid: false, error: 'Unclosed opening parenthesis at position ' + firstOpen };
  }

  return { valid: true };
}

function stripComments(pattern, preserveExtended = false) {
  pattern = pattern.replace(/\(\?#[^)]*\)/g, '');

  if (preserveExtended) {
    const lines = pattern.split('\n');
    const processed = lines.map(line => {
      let result = '';
      let inClass = false;
      let index = 0;
      let commentStart = -1;

      while (index < line.length) {
        const char = line[index];
        const prev = index > 0 ? line[index - 1] : '';

        if (prev === '\\') {
          result += char;
          index++;
          continue;
        }

        if (char === '[' && !inClass) {
          inClass = true;
          result += char;
          index++;
          continue;
        }

        if (char === ']' && inClass) {
          inClass = false;
          result += char;
          index++;
          continue;
        }

        if (!inClass && char === '#' && commentStart === -1) {
          const before = index > 0 ? line[index - 1] : '';
          const isEscaped = index > 0 && /\s/.test(line[index - 1]);
          if (before === '' || isEscaped) {
            commentStart = index;
            break;
          }
        }

        result += char;
        index++;
      }

      return result;
    });

    return processed.join('\n');
  }

  pattern = pattern.replace(/\s#[\s\w]*$/gm, '');
  return pattern;
}

function convertNamedGroups(pattern) {
  return pattern.replace(/\(\?P<([^>]+)>/g, '(?<$1>');
}

function convertInlineFlagGroups(pattern, flags) {
  pattern = convertNamedGroups(pattern);

  let result = pattern;
  let hasI = flags.includes('i');
  let hasS = flags.includes('s');
  let needsI = false;
  let needsS = false;

  const inlineFlagRegex = /\(\?([-]?[imsux]+):/g;
  let match;
  const replacements = [];

  inlineFlagRegex.lastIndex = 0;

  while ((match = inlineFlagRegex.exec(result)) !== null) {
    const flagsText = match[1];
    const fullMatch = match[0];
    const start = match.index;
    const end = start + fullMatch.length;

    const hasInlineI = flagsText.includes('i') && !flagsText.startsWith('-') && !flagsText.includes('-i');
    const hasInlineS = flagsText.includes('s') && !flagsText.startsWith('-') && !flagsText.includes('-s');

    if (hasInlineI && !hasI) needsI = true;
    if (hasInlineS && !hasS) needsS = true;

    let depth = 0;
    let pos = end;
    let groupEnd = -1;
    let inClass = false;

    while (pos < result.length && depth >= 0) {
      const char = result[pos];
      const prev = pos > 0 ? result[pos - 1] : '';

      if (prev === '\\') {
        pos++;
        continue;
      }

      if (char === '[' && !inClass) {
        inClass = true;
        pos++;
        continue;
      }

      if (char === ']' && inClass) {
        inClass = false;
        pos++;
        continue;
      }

      if (!inClass) {
        if (char === '(') depth++;
        else if (char === ')') depth--;
      }

      pos++;
    }

    if (depth === 0) {
      groupEnd = pos - 1;
      const groupContent = result.slice(end, groupEnd);
      replacements.push({
        flags: flagsText,
        start: start,
        end: pos,
        replacement: '(' + groupContent + ')'
      });
    }
  }

  replacements.sort((a, b) => a.start - b.start).forEach(item => {
    result = result.slice(0, item.start) + item.replacement + result.slice(item.end);
  });

  if (needsI && !hasI) flags += 'i';
  if (needsS && !hasS) flags += 's';

  return { pattern: result, flags };
}

function convertPatternFlags(pattern) {
  let flags = 'g';
  let result = pattern;
  let extended = false;

  const leading = pattern.match(/^\(\?([imsux]+)\)/);

  if (leading) {
    const leadingFlags = leading[1];
    result = pattern.replace(/^\(\?[imsux]+\)/, '');

    if (leadingFlags.includes('i')) flags += 'i';
    if (leadingFlags.includes('m')) flags += 'm';
    if (leadingFlags.includes('s')) flags += 's';
    if (leadingFlags.includes('x')) extended = true;
  }

  const converted = convertInlineFlagGroups(result, flags);
  result = converted.pattern;
  flags = converted.flags;

  result = result.replace(/\(\?([imsux]+)\)/g, (match, inlineFlags) => {
    if (inlineFlags.includes('i') && !flags.includes('i')) flags += 'i';
    if (inlineFlags.includes('m') && !flags.includes('m')) flags += 'm';
    if (inlineFlags.includes('s') && !flags.includes('s')) flags += 's';
    if (inlineFlags.includes('x') && !extended) extended = true;
    return '';
  });

  if (extended) result = stripWhitespaceInExtendedMode(result);

  return { pattern: result, flags };
}

function stripWhitespaceInExtendedMode(pattern) {
  let result = '';
  let inClass = false;
  let index = 0;

  while (index < pattern.length) {
    const char = pattern[index];
    const next = index + 1 < pattern.length ? pattern[index + 1] : '';

    if (char === '[') {
      inClass = true;
      result += char;
      index++;
      continue;
    }

    if (char === ']' && inClass) {
      inClass = false;
      result += char;
      index++;
      continue;
    }

    if (inClass) {
      result += char;
      index++;
      continue;
    }

    if (char === '\\') {
      result += char;
      if (next) {
        result += next;
        index += 2;
      } else {
        index++;
      }
      continue;
    }

    if (!inClass && /[\s\n\r\t]/.test(char)) {
      index++;
      continue;
    }

    result += char;
    index++;
  }

  return result;
}

function validatePatternRequirements(pattern, requirements, context = null) {
  const result = { valid: true };
  if (!requirements) return result;

  const source = pattern;

  if (requirements.minDigits !== undefined) {
    const digits = (source.match(/\d/g) || []).length;
    if (digits < requirements.minDigits) {
      return {
        valid: false,
        error: 'Pattern requires at least ' + requirements.minDigits + ' digits, found ' + digits
      };
    }
  }

  if (requirements.minUppercase !== undefined) {
    const uppercase = (source.match(/[A-Z]/g) || []).length;
    if (uppercase < requirements.minUppercase) {
      return {
        valid: false,
        error: 'Pattern requires at least ' + requirements.minUppercase + ' uppercase letters, found ' + uppercase
      };
    }
  }

  if (requirements.minLowercase !== undefined) {
    const lowercase = (source.match(/[a-z]/g) || []).length;
    if (lowercase < requirements.minLowercase) {
      return {
        valid: false,
        error: 'Pattern requires at least ' + requirements.minLowercase + ' lowercase letters, found ' + lowercase
      };
    }
  }

  if (requirements.allowedChars !== undefined) {
    const allowed = requirements.allowedChars || '';
    const invalid = (source.match(new RegExp('[' + allowed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ']', 'g')) || []).length;
    if (invalid < requirements.allowedChars.length) {
      return {
        valid: false,
        error: 'Pattern contains characters not in allowed set: ' + invalid
      };
    }
  }

  if (requirements.forbiddenPatterns) {
    const lowerSource = source.toLowerCase();
    for (const forbidden of requirements.forbiddenPatterns) {
      const lowerForbidden = forbidden.toLowerCase();
      if (lowerForbidden && lowerSource.includes(lowerForbidden.trim())) {
        return {
          valid: false,
          error: 'Pattern contains forbidden substring: ' + lowerForbidden,
          forbidden: true
        };
      }
    }
  }

  return { valid: true };
}

async function loadKingfisherRules(yamlText) {
  let parsed;

  try {
    if (typeof window !== 'undefined' && window.yaml && window.yaml.parse) {
      parsed = window.yaml.parse(yamlText);
    } else {
      parsed = parseYamlRulesFallback(yamlText);
      if (!parsed || (parsed.rules && parsed.rules.length === 0) || (Array.isArray(parsed) && parsed.length === 0)) {
        throw new Error('Failed to parse YAML rules');
      }
    }
  } catch (error) {
    console.error('Failed to parse YAML rules:', error);
    return [];
  }

  const rules = parsed.rules || (Array.isArray(parsed) ? parsed : []);
  const compiled = rules.map(rule => {
    if (!rule || !rule.pattern) {
      console.warn('Skipping rule without pattern:', rule.id || rule.name);
      return null;
    }

    const extended = /^\(\?([imsux]+)\)/.test(rule.pattern) && /^\(\?([imsux]+)\)/.exec(rule.pattern)[1].includes('x');
    const cleaned = stripComments(rule.pattern, extended);
    const { pattern, flags } = convertPatternFlags(cleaned);
    const parenCheck = validateParentheses(pattern);

    if (!parenCheck.valid) {
      try {
        const regex = new RegExp(pattern, flags);
        const compiledRule = { ...rule };
        compiledRule.compiledRegex = regex;
        compiledRule.compiledPattern = pattern;
        return compiledRule;
      } catch (error) {
        console.error('Invalid regex in rule ' + (rule.id || rule.name) + ':', error.message);
        console.error('Pattern: ' + pattern.slice(0, 200) + (pattern.length > 200 ? '...' : ''));
        return null;
      }
    }

    try {
      const regex = new RegExp(pattern, flags);
      const compiledRule = { ...rule };
      compiledRule.compiledRegex = regex;
      compiledRule.compiledPattern = pattern;
      return compiledRule;
    } catch (error) {
      console.error('Invalid regex in rule ' + (rule.id || rule.name) + ':', error.message);
      console.error('Pattern: ' + pattern.slice(0, 200) + (pattern.length > 200 ? '...' : ''));
      return null;
    }
  }).filter(Boolean);

  return compiled;
}

function parseYamlRulesFallback(yamlText) {
  console.warn('Using fallback YAML parser');

  try {
    const rules = [];
    const lines = yamlText.split('\n');
    let currentRule = null;
    let inPattern = false;
    let patternLines = [];
    let lineNumber = 0;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.trim();

      if (!line || line.startsWith('#')) continue;

      if (line.startsWith('- name:')) {
        if (currentRule) {
          if (inPattern && patternLines.length > 0) {
            currentRule.pattern = patternLines.join('\n').trim();
            patternLines = [];
          }
          rules.push(currentRule);
        }
        currentRule = { name: line.replace(/^- name:\s*/, '').replace(/^["']|["']$/g, '') };
        inPattern = false;
        continue;
      }

      if (currentRule) {
        if (line.startsWith('id:')) {
          currentRule.id = line.replace(/^id:\s*/, '').replace(/^["']|["']$/g, '');
        } else if (line.startsWith('pattern:')) {
          inPattern = true;
          const patternValue = line.replace(/^pattern:\s*\|?\s*/, '');
          if (patternValue) patternLines.push(patternValue);
        } else if (inPattern && (rawLine.startsWith(' ') || rawLine.startsWith('\t'))) {
          patternLines.push(rawLine);
        } else if (line.startsWith('min_entropy:')) {
          inPattern = false;
          currentRule.minEntropy = parseFloat(line.replace(/^min_entropy:\s*/, ''));
        } else if (line.startsWith('requirements:')) {
          inPattern = false;
          currentRule.patternRequirements = {};
        } else if (currentRule.patternRequirements && line.startsWith('min_digits:')) {
          currentRule.patternRequirements.minDigits = parseInt(line.replace(/^min_digits:\s*/, ''), 10);
        } else if (/^[a-z_]+:/.test(line) && !line.startsWith('pattern:')) {
          inPattern = false;
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
  } catch (error) {
    console.error('Fallback YAML parser failed:', error);
    return { rules: [] };
  }
}

async function loadKingfisherRulesFromJSON(jsonInput) {
  try {
    const data = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
    const rules = data.rules || (Array.isArray(data) ? data : []);

    return rules.map(rule => {
      if (!rule || !rule.pattern) return null;

      const extended = /^\(\?([imsux]+)\)/.test(rule.pattern) && /^\(\?([imsux]+)\)/.exec(rule.pattern)[1].includes('x');
      const cleaned = stripComments(rule.pattern, extended);
      const { pattern, flags } = convertPatternFlags(cleaned);

      try {
        const regex = new RegExp(pattern, flags);
        const compiledRule = { ...rule };
        compiledRule.compiledRegex = regex;
        compiledRule.compiledPattern = pattern;
        return compiledRule;
      } catch (error) {
        console.error('Invalid regex in rule ' + (rule.id || rule.name) + ':', error);
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error('Failed to parse JSON rules:', error);
    return [];
  }
}

async function loadKingfisherRulesFromFile(fileUrl) {
  try {
    const response = await fetch(chrome.runtime.getURL(fileUrl));
    const text = await response.text();
    return await loadKingfisherRulesFromJSON(text);
  } catch (error) {
    console.error('Failed to load rules from file ' + fileUrl + ':', error);
    return [];
  }
}

function scanWithKingfisherRules(content, rules, options = {}) {
  const results = [];

  if (!content || !rules || rules.length === 0) return results;

  const {
    minEntropy = 0,
    checkPatternRequirements = true,
    getEntropy = null
  } = options;

  for (const rule of rules) {
    if (!rule.compiledRegex) continue;

    try {
      const regex = rule.compiledRegex;
      let match;
      regex.lastIndex = 0;

      while ((match = regex.exec(content)) !== null) {
        const matchedText = match[0];
        const matchIndex = match.index;

        if (getEntropy && rule.minEntropy) {
          const entropy = getEntropy(matchedText);
          if (entropy < rule.minEntropy) continue;
        }

        if (checkPatternRequirements && rule.patternRequirements) {
          const context = { match: match };
          const validation = validatePatternRequirements(matchedText, rule.patternRequirements, context);
          if (!validation.valid && !validation.forbidden) continue;
        }

        const start = Math.max(0, matchIndex - 50);
        const end = Math.min(content.length, matchIndex + matchedText.length + 50);
        const contextText = content.slice(start, end);

        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          match: matchedText,
          index: matchIndex,
          confidence: rule.confidence || 0.5,
          entropy: getEntropy ? getEntropy(matchedText).toFixed(2) : null,
          context: contextText,
          validation: rule.validation || null
        });
      }
    } catch (error) {
      console.error('Error scanning with rule ' + rule.id + ':', error);
    }
  }

  return results;
}

async function loadKingfisherRulesFromLocalFile(fileName) {
  try {
    const url = chrome.runtime.getURL('rules/' + fileName);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to load ' + response.status + ': ' + response.statusText);
    }

    const text = await response.text();
    const rules = await loadKingfisherRules(text);
    return rules;
  } catch (error) {
    console.error('Failed to load local rules file ' + fileName + ':', error);
    return [];
  }
}

async function loadKingfisherRulesFromLocalFiles(fileNames) {
  const allRules = [];

  for (const fileName of fileNames) {
    try {
      const rules = await loadKingfisherRulesFromLocalFile(fileName);
      allRules.push(...rules);
    } catch (error) {
      console.error('Failed to load rules from file ' + fileName + ':', error);
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
      if (manifest.files && Array.isArray(manifest.files)) {
        return await loadKingfisherRulesFromLocalFiles(manifest.files);
      }
    }
  } catch (error) {
    // ignore manifest errors
  }

  const defaultFiles = [
    'api-keys.yml',
    'aws-keys.yml',
    'azure-keys.yml',
    'database.yml',
    'jwt.yml',
    'private-keys.yml',
    'slack.yml',
    'stripe.yml',
    'github.yml',
    'google.yml',
    'twilio.yml',
    'generic.yml'
  ];

  const allRules = [];
  for (const file of defaultFiles) {
    try {
      const rules = await loadKingfisherRulesFromLocalFile(file);
      if (rules.length > 0) allRules.push(...rules);
    } catch (error) {
      // ignore individual file errors
    }
  }

  return allRules;
}

async function loadKingfisherRulesFromURL(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return await loadKingfisherRules(text);
  } catch (error) {
    console.error('Failed to load rules from URL:', error);
    return [];
  }
}

async function loadKingfisherRulesFromURLs(urls) {
  const allRules = [];

  for (const url of urls) {
    try {
      const rules = await loadKingfisherRulesFromURL(url);
      allRules.push(...rules);
    } catch (error) {
      console.error('Failed to load rules from URL ' + url + ':', error);
    }
  }

  return allRules;
}

var init_kingfisher_rules = __esm({});

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

function getEntropy(str) {
  const length = str.length;
  const frequencies = {};

  for (let i = 0; i < length; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let entropy = 0;
  for (const char in frequencies) {
    const probability = frequencies[char] / length;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}

function isLikelyBase64Data(match, context) {
  if (/data:[\w/-]+;base64,/.test(context)) return true;
  if (/={1,2}$/.test(match) && match.length > 64) return true;
  if (match.length > 100 && /^[A-Za-z0-9+/=]+$/.test(match)) return true;

  const contextEnd = context.slice(-100);
  if (/"(?:data|content|image|icon|font|media|src|href|asset|resource)"\s*:\s*"[^"]*$/i.test(contextEnd)) return true;
  if (/(?:const|let|var)\s+(?:data|image|icon|font|asset|resource|content)\w*\s*=\s*["`'][^"`']*$/i.test(contextEnd)) return true;

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
    return url.protocol + '//' + url.host + url.pathname;
  } catch (error) {
    return source.split('?')[0].split('#')[0];
  }
}

function deduplicateResults(results) {
  const seen = new Set();

  return results.filter(result => {
    const source = normalizeSourceFile(result.source || '');
    const key = result.ruleId + ':' + result.index + ':' + source;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

var kingfisherRulesCache = null;

async function loadKingfisherRules2() {
  if (kingfisherRulesCache) return kingfisherRulesCache;

  try {
    const {
      loadAllKingfisherRulesFromLocal,
      scanWithKingfisherRules
    } = await Promise.resolve().then(() => (init_kingfisher_rules(), kingfisher_rules_exports));

    const rules = await loadAllKingfisherRulesFromLocal();
    const cache = {
      rules,
      scanWithKingfisherRules
    };

    kingfisherRulesCache = cache;
    return kingfisherRulesCache;
  } catch (error) {
    console.error('Failed to load Kingfisher rules:', error);
    const fallback = {
      rules: [],
      scanWithKingfisherRules: null
    };
    kingfisherRulesCache = fallback;
    return kingfisherRulesCache;
  }
}

function scanContent(content, filePath) {
  return [];
}

async function scanContentWithKingfisher(content, filePath) {
  const findings = [];

  if (!content) return findings;

  try {
    const { rules, scanWithKingfisherRules } = await loadKingfisherRules2();

    if (!rules || rules.length === 0 || !scanWithKingfisherRules) {
      return findings;
    }

    const options = {
      getEntropy,
      checkPatternRequirements: true
    };

    const rawResults = scanWithKingfisherRules(content, rules, options);

    for (const result of rawResults) {
      const start = Math.max(0, result.index - 50);
      const end = Math.min(content.length, result.index + result.match.length + 50);
      const context = content.slice(start, end);

      let isFalsePositive = false;
      for (const pattern of KNOWN_FALSE_POSITIVE_PATTERNS) {
        if (pattern.test(result.match)) {
          isFalsePositive = true;
          break;
        }
      }
      if (isFalsePositive) continue;

      let hasFalseContext = false;
      for (const pattern of FALSE_POSITIVE_CONTEXT_PATTERNS) {
        if (pattern.test(context)) {
          hasFalseContext = true;
          break;
        }
      }
      if (hasFalseContext) continue;

      if (isLikelyBase64Data(result.match, context)) continue;

      const lineStart = content.lastIndexOf('\n', result.index) + 1;
      const lineEnd = content.indexOf('\n', result.index);
      const line = content.slice(lineStart, lineEnd === -1 ? content.length : lineEnd);

      if (isInComment(line)) continue;

      let confidence = 0.5;
      if (result.confidence === 'high') confidence = 0.9;
      else if (result.confidence === 'medium') confidence = 0.7;
      else confidence = 0.5;

      if (result.entropy) {
        const entropy = parseFloat(result.entropy);
        if (entropy > 4.5) confidence += 0.1;
        else if (entropy < 3.5) confidence -= 0.1;
      }

      if (confidence < 0.3) continue;

      const type = result.ruleName || result.ruleId || 'unknown';
      findings.push({
        file: filePath,
        type,
        match: result.match,
        index: result.index,
        confidence: Math.min(1, confidence),
        entropy: result.entropy || null,
        ruleName: result.ruleName,
        ruleId: result.ruleId
      });
    }
  } catch (error) {
    console.error('Error scanning content with Kingfisher:', error);
  }

  return findings;
}

async function scanForSecrets(files, onProgress, onFinding) {
  const findings = [];
  const seen = new Set();
  let processed = 0;
  const total = files.length;

  for (const file of files) {
    try {
      if (!file || !file.content || !file.path) {
        processed++;
        if (onProgress) onProgress(processed, total);
        continue;
      }

      const fileName = file.path.split('/').pop().toLowerCase();
      const fileContent = file.content?.toString?.() || '';

      const isIgnored =
        fileName.includes('min.js') ||
        fileName.includes('bundle') ||
        fileName.includes('vendor') ||
        fileName.includes('package-lock');

      if (isIgnored) {
        processed++;
        if (onProgress) onProgress(processed, total);
        continue;
      }

      let content = null;
      if (file.content !== undefined) {
        content = file.content || '';
      } else if (typeof file.content === 'string') {
        content = file.content;
      } else {
        content = await new Promise((resolve, reject) => {
          if (chrome.runtime.getPackageDirectoryEntry) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(file.content || '');
          }
        });
      }

      if (content) {
        try {
          const fileFindings = await scanContentWithKingfisher(content, file.path.split('/').pop());
          for (const finding of fileFindings) {
            const key = finding.file + ':' + finding.index;
            if (!seen.has(key)) {
              seen.add(key);
              findings.push(finding);
              if (onFinding) onFinding(finding);
            }
          }
        } catch (error) {
          console.error('Error scanning file ' + fileName + ':', error);
        }
      }
    } catch (error) {
      console.error('Error processing file:', error);
    }

    processed++;
    if (onProgress) onProgress(processed, total);
  }

  return findings;
}

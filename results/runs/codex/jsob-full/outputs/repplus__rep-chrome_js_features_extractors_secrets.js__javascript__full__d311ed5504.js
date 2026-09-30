var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (initializer, initializedValue) => function initializeOnce() {
  if (initializer) {
    initializedValue = (0, initializer[__getOwnPropNames(initializer)[0]])(initializer = 0);
  }
  return initializedValue;
};
var __export = (target, getters) => {
  for (var name in getters) {
    __defProp(target, name, { get: getters[name], enumerable: true });
  }
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
  scanWithKingfisherRules: () => scanWithKingfisherRules,
});
function validateParentheses(pattern) {
  let depth = 0;
  let insideCharacterClass = false;
  const openPositions = [];

  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index];
    const previous = index > 0 ? pattern[index - 1] : '';
    const beforePrevious = index > 1 ? pattern[index - 2] : '';

    if (previous === '\\' && beforePrevious !== '\\') {
      continue;
    }
    if (character === '[' && !insideCharacterClass) {
      insideCharacterClass = true;
      continue;
    }
    if (character === ']' && insideCharacterClass) {
      insideCharacterClass = false;
      continue;
    }
    if (insideCharacterClass) {
      continue;
    }
    if (character === '(') {
      depth++;
      openPositions.push(index);
    } else if (character === ')') {
      depth--;
      if (depth < 0) {
        return { valid: false, error: `Unmatched closing parenthesis at position ${index}` };
      }
      openPositions.pop();
    }
  }

  if (depth !== 0) {
    const firstOpenPosition = openPositions[0] || 0;
    return {
      valid: false,
      error: `Unmatched opening parenthesis (depth: ${depth}) at position ${firstOpenPosition}`,
    };
  }
  return { valid: true };
}
function stripComments(pattern, extendedMode = false) {
  pattern = pattern.replace(/\(\?#[^)]*\)/g, '');
  if (!extendedMode) {
    return pattern.replace(/\s#[\s\w]*$/gm, '');
  }

  return pattern.split('\n').map((line) => {
    let strippedLine = '';
    let insideCharacterClass = false;
    for (let index = 0; index < line.length; index++) {
      const character = line[index];
      const previous = index > 0 ? line[index - 1] : '';
      if (previous === '\\') {
        strippedLine += character;
        continue;
      }
      if (character === '[' && !insideCharacterClass) {
        insideCharacterClass = true;
      } else if (character === ']' && insideCharacterClass) {
        insideCharacterClass = false;
      } else if (!insideCharacterClass && character === '#') {
        if (index === 0 || /\s/.test(line[index - 1])) {
          break;
        }
      }
      strippedLine += character;
    }
    return strippedLine;
  }).join('\n');
}
function convertNamedGroups(pattern) {
  return pattern.replace(/\(\?P<([^>]+)>/g, '(?<$1>');
}
function convertInlineFlagGroups(pattern, flags) {
  let convertedPattern = convertNamedGroups(pattern);
  const hasIgnoreCaseFlag = flags.includes('i');
  const hasDotAllFlag = flags.includes('s');
  let needsIgnoreCaseFlag = false;
  let needsDotAllFlag = false;
  const inlineFlagGroupRegex = /\(\?([-]?[imsux]+):/g;
  const replacements = [];
  let groupMatch;

  while ((groupMatch = inlineFlagGroupRegex.exec(convertedPattern)) !== null) {
    const groupStart = groupMatch.index;
    const groupFlags = groupMatch[1];
    const contentStart = groupMatch.index + groupMatch[0].length;
    if (groupFlags.includes('i') && !groupFlags.startsWith('-') && !groupFlags.includes('-i') && !hasIgnoreCaseFlag) {
      needsIgnoreCaseFlag = true;
    }
    if (groupFlags.includes('s') && !groupFlags.startsWith('-') && !groupFlags.includes('-s') && !hasDotAllFlag) {
      needsDotAllFlag = true;
    }

    let depth = 1;
    let index = contentStart;
    let insideCharacterClass = false;
    while (index < convertedPattern.length && depth > 0) {
      const character = convertedPattern[index];
      const previous = index > 0 ? convertedPattern[index - 1] : '';
      if (previous === '\\') {
        index++;
        continue;
      }
      if (character === '[' && !insideCharacterClass) {
        insideCharacterClass = true;
      } else if (character === ']' && insideCharacterClass) {
        insideCharacterClass = false;
      } else if (!insideCharacterClass) {
        if (character === '(') depth++;
        else if (character === ')') depth--;
      }
      index++;
    }
    if (depth === 0) {
      const contentEnd = index - 1;
      replacements.push({
        start: groupStart,
        end: index,
        replacement: `(${convertedPattern.substring(contentStart, contentEnd)})`,
      });
    }
  }

  replacements.reverse().forEach((replacement) => {
    convertedPattern = convertedPattern.substring(0, replacement.start)
      + replacement.replacement
      + convertedPattern.substring(replacement.end);
  });
  if (needsIgnoreCaseFlag && !hasIgnoreCaseFlag) flags += 'i';
  if (needsDotAllFlag && !hasDotAllFlag) flags += 's';
  return { pattern: convertedPattern, flags };
}
function convertPatternFlags(pattern) {
  let flags = 'g';
  let convertedPattern = pattern;
  let extendedMode = false;
  const leadingFlagsMatch = pattern.match(/^\(\?([imsux]+)\)/);
  if (leadingFlagsMatch) {
    const leadingFlags = leadingFlagsMatch[1];
    convertedPattern = pattern.replace(/^\(\?[imsux]+\)/, '');
    if (leadingFlags.includes('i')) flags += 'i';
    if (leadingFlags.includes('m')) flags += 'm';
    if (leadingFlags.includes('s')) flags += 's';
    if (leadingFlags.includes('x')) extendedMode = true;
  }

  ({ pattern: convertedPattern, flags } = convertInlineFlagGroups(convertedPattern, flags));
  convertedPattern = convertedPattern.replace(/\(\?([imsux]+)\)/g, (_match, inlineFlags) => {
    if (inlineFlags.includes('i') && !flags.includes('i')) flags += 'i';
    if (inlineFlags.includes('m') && !flags.includes('m')) flags += 'm';
    if (inlineFlags.includes('s') && !flags.includes('s')) flags += 's';
    if (inlineFlags.includes('x') && !extendedMode) extendedMode = true;
    return '';
  });
  if (extendedMode) convertedPattern = stripWhitespaceInExtendedMode(convertedPattern);
  return { pattern: convertedPattern, flags };
}
function stripWhitespaceInExtendedMode(pattern) {
  let result = '';
  let insideCharacterClass = false;
  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index];
    const nextCharacter = index + 1 < pattern.length ? pattern[index + 1] : '';
    if (character === '[') insideCharacterClass = true;
    if (character === ']' && insideCharacterClass) insideCharacterClass = false;
    if (insideCharacterClass) {
      result += character;
      continue;
    }
    if (character === '\\') {
      result += character;
      if (nextCharacter) result += nextCharacter, index++;
      continue;
    }
    if (/[\s\n\r\t]/.test(character)) continue;
    result += character;
  }
  return result;
}
function validatePatternRequirements(match, requirements, context = null) {
  if (!requirements) return { passed: true };
  const checks = [
    ['min_digits', (match.match(/\d/g) || []).length, 'digits'],
    ['min_uppercase', (match.match(/[A-Z]/g) || []).length, 'uppercase letters'],
    ['min_lowercase', (match.match(/[a-z]/g) || []).length, 'lowercase letters'],
  ];
  for (const [property, count, description] of checks) {
    if (requirements[property] !== undefined && count < requirements[property]) {
      return { passed: false, reason: `Requires at least ${requirements[property]} ${description}, found ${count}` };
    }
  }
  if (requirements.min_special_chars !== undefined) {
    const specialCharacters = requirements.special_chars || "!@#$%^&*()_+-=[]{}|;:'\",.<>?/\\`~";
    const escapedCharacters = specialCharacters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const count = (match.match(new RegExp(`[${escapedCharacters}]`, 'g')) || []).length;
    if (count < requirements.min_special_chars) {
      return { passed: false, reason: `Requires at least ${requirements.min_special_chars} special characters, found ${count}` };
    }
  }
  if (requirements.ignore_if_contains) {
    const lowercaseMatch = match.toLowerCase();
    for (const ignoredTerm of requirements.ignore_if_contains) {
      const term = ignoredTerm.trim();
      if (term && lowercaseMatch.includes(term.toLowerCase())) {
        return { passed: false, reason: `Contains ignored term: ${term}`, ignored: true };
      }
    }
  }
  return { passed: true };
}
async function loadKingfisherRules(yamlText) {
  let parsedDocument;
  try {
    if (typeof window !== 'undefined' && window.jsyaml?.load) parsedDocument = window.jsyaml.load(yamlText);
    else {
      parsedDocument = parseYamlRulesFallback(yamlText);
      if (!parsedDocument || (parsedDocument.rules && parsedDocument.rules.length === 0) || (Array.isArray(parsedDocument) && parsedDocument.length === 0)) {
        throw new Error('Fallback parser could not parse YAML');
      }
    }
  } catch (error) {
    console.error('Failed to parse YAML rules:', error);
    return [];
  }
  const rawRules = parsedDocument.rules || (Array.isArray(parsedDocument) ? parsedDocument : []);
  return rawRules.map((rule) => {
    if (!rule || !rule.pattern) {
      console.warn('Rule missing pattern:', rule.id || rule.name);
      return null;
    }
    const leadingFlags = /^\(\?([imsux]+)\)/.exec(rule.pattern);
    const uncommentedPattern = stripComments(rule.pattern, Boolean(leadingFlags?.[1].includes('x')));
    const { pattern, flags } = convertPatternFlags(uncommentedPattern);
    const validation = validateParentheses(pattern);
    if (!validation.valid) {
      try {
        return { ...rule, compiledRegex: new RegExp(pattern, flags), cleanedPattern: pattern };
      } catch (error) {
        console.warn(`Invalid pattern for rule ${rule.id || rule.name}: ${validation.error}`);
        console.warn(`Compilation also failed: ${error.message}`);
        console.warn(`Original pattern: ${rule.pattern.substring(0, 150)}${rule.pattern.length > 150 ? '...' : ''}`);
        console.warn(`Converted pattern: ${pattern.substring(0, 200)}${pattern.length > 200 ? '...' : ''}`);
        return null;
      }
    }
    try {
      return { ...rule, compiledRegex: new RegExp(pattern, flags), cleanedPattern: pattern };
    } catch (error) {
      console.warn(`Failed to compile regex for rule ${rule.id || rule.name}:`, error.message);
      console.warn(`Pattern: ${pattern.substring(0, 200)}${pattern.length > 200 ? '...' : ''}`);
      return null;
    }
  }).filter(Boolean);
}
function parseYamlRulesFallback(yamlText) {
  console.warn('Using fallback YAML parser - consider bundling js-yaml for better support');
  try {
    const rules = [];
    const lines = yamlText.split('\n');
    let currentRule = null;
    let readingPatternBlock = false;
    let patternLines = [];
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;
      if (trimmedLine.startsWith('- name:')) {
        if (currentRule) {
          if (readingPatternBlock && patternLines.length > 0) currentRule.pattern = patternLines.join('\n').trim(), patternLines = [];
          rules.push(currentRule);
        }
        currentRule = { name: trimmedLine.replace(/^- name:\s*/, '').replace(/^["']|["']$/g, '') };
        readingPatternBlock = false;
        continue;
      }
      if (!currentRule) continue;
      if (trimmedLine.startsWith('id:')) currentRule.id = trimmedLine.replace(/^id:\s*/, '').replace(/^["']|["']$/g, '');
      else if (trimmedLine.startsWith('pattern:')) {
        readingPatternBlock = true;
        const value = trimmedLine.replace(/^pattern:\s*\|?\s*/, '');
        if (value) patternLines.push(value);
      } else if (readingPatternBlock && (line.startsWith(' ') || line.startsWith('\t'))) patternLines.push(line);
      else if (trimmedLine.startsWith('min_entropy:')) {
        readingPatternBlock = false;
        currentRule.min_entropy = parseFloat(trimmedLine.replace(/^min_entropy:\s*/, ''));
      } else if (trimmedLine.startsWith('pattern_requirements:')) {
        readingPatternBlock = false;
        currentRule.pattern_requirements = {};
      } else if (currentRule.pattern_requirements && trimmedLine.startsWith('min_digits:')) {
        currentRule.pattern_requirements.min_digits = parseInt(trimmedLine.replace(/^min_digits:\s*/, ''));
      } else if (/^[a-z_]+:/.test(trimmedLine) && !trimmedLine.startsWith('pattern')) readingPatternBlock = false;
    }
    if (currentRule) {
      if (readingPatternBlock && patternLines.length > 0) currentRule.pattern = patternLines.join('\n').trim();
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
    const parsedDocument = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
    const rawRules = parsedDocument.rules || (Array.isArray(parsedDocument) ? parsedDocument : []);
    return rawRules.map((rule) => {
      if (!rule?.pattern) return null;
      const leadingFlags = /^\(\?([imsux]+)\)/.exec(rule.pattern);
      const uncommentedPattern = stripComments(rule.pattern, Boolean(leadingFlags?.[1].includes('x')));
      const { pattern, flags } = convertPatternFlags(uncommentedPattern);
      try {
        return { ...rule, compiledRegex: new RegExp(pattern, flags), cleanedPattern: pattern };
      } catch (error) {
        console.warn(`Failed to compile regex for rule ${rule.id || rule.name}:`, error);
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error('Failed to load JSON rules:', error);
    return [];
  }
}
async function loadKingfisherRulesFromFile(path) {
  try {
    const response = await fetch(chrome.runtime.getURL(path));
    return await loadKingfisherRulesFromJSON(await response.json());
  } catch (error) {
    console.error(`Failed to load rules from ${path}:`, error);
    return [];
  }
}
function scanWithKingfisherRules(content, rules, options = {}) {
  const results = [];
  if (!content || !rules || rules.length === 0) return results;
  const { minEntropy = 0, checkPatternRequirements = true, getEntropy: getEntropyFunction = null } = options;
  for (const rule of rules) {
    if (!rule.compiledRegex) continue;
    try {
      const regex = rule.compiledRegex;
      regex.lastIndex = 0;
      let regexMatch;
      while ((regexMatch = regex.exec(content)) !== null) {
        const matchedText = regexMatch[0];
        const matchIndex = regexMatch.index;
        if (getEntropyFunction && rule.min_entropy && getEntropyFunction(matchedText) < rule.min_entropy) continue;
        if (checkPatternRequirements && rule.pattern_requirements) {
          const requirementResult = validatePatternRequirements(matchedText, rule.pattern_requirements, { captures: regexMatch });
          if (!requirementResult.passed && !requirementResult.ignored) continue;
        }
        const contextStart = Math.max(0, matchIndex - 100);
        const contextEnd = Math.min(content.length, matchIndex + matchedText.length + 100);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          match: matchedText,
          index: matchIndex,
          confidence: rule.confidence || 'medium',
          entropy: getEntropyFunction ? getEntropyFunction(matchedText).toFixed(2) : null,
          context: content.substring(contextStart, contextEnd),
          validation: rule.validation || null,
        });
      }
    } catch (error) {
      console.warn(`Error scanning with rule ${rule.id}:`, error);
    }
  }
  return results;
}
async function loadKingfisherRulesFromLocalFile(filename) {
  try {
    const response = await fetch(chrome.runtime.getURL(`rules/${filename}`));
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return await loadKingfisherRules(await response.text());
  } catch (error) {
    console.error(`Failed to load Kingfisher rules from ${filename}:`, error);
    return [];
  }
}
async function loadKingfisherRulesFromLocalFiles(filenames) {
  const allRules = [];
  for (const filename of filenames) {
    try { allRules.push(...await loadKingfisherRulesFromLocalFile(filename)); }
    catch (error) { console.warn(`Failed to load rules from ${filename}:`, error); }
  }
  return allRules;
}
async function loadAllKingfisherRulesFromLocal() {
  try {
    const response = await fetch(chrome.runtime.getURL('rules/_manifest.json'));
    if (response.ok) {
      const manifest = await response.json();
      if (Array.isArray(manifest.files)) return await loadKingfisherRulesFromLocalFiles(manifest.files);
    }
  } catch {}
  const filenames = ['slack.yaml', 'aws.yaml', 'github.yaml', 'google.yaml', 'stripe.yaml', 'twilio.yaml', 'azure.yaml', 'heroku.yaml', 'mailgun.yaml', 'sendgrid.yaml', 'paypal.yaml', 'square.yaml'];
  const allRules = [];
  for (const filename of filenames) {
    try {
      const rules = await loadKingfisherRulesFromLocalFile(filename);
      if (rules.length > 0) allRules.push(...rules);
    } catch {}
  }
  return allRules;
}
async function loadKingfisherRulesFromURL(url) {
  try { return await loadKingfisherRules(await (await fetch(url)).text()); }
  catch (error) { console.error('Failed to load Kingfisher rules from URL:', error); return []; }
}
async function loadKingfisherRulesFromURLs(urls) {
  const allRules = [];
  for (const url of urls) {
    try { allRules.push(...await loadKingfisherRulesFromURL(url)); }
    catch (error) { console.warn(`Failed to load rules from ${url}:`, error); }
  }
  return allRules;
}
const kingfisherRuleModules = {
};
kingfisherRuleModules["../work/repplus__rep-chrome/js/features/extractors/kingfisher-rules.js"] = function() {
};
var init_kingfisher_rules = __esm(kingfisherRuleModules), KNOWN_FALSE_POSITIVE_PATTERNS = [/^[a-f0-9]{40}$/i, /^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)+$/, /^[a-z][a-zA-Z0-9]+(?:[A-Z][a-z0-9]+)+$/, /^(?:map|filter|reduce|forEach|slice|splice|concat)/i, /^_react|_emotion|_styled|_next/i, /sourceMappingURL/i, /^__webpack/i, /^module\./i, /^exports\./i], FALSE_POSITIVE_CONTEXT_PATTERNS = [/base64,/i, /data:image/i, /;base64/i, /"(?:publicKey|privateKey|data|content|image|icon|font|logo|avatar|thumbnail|media|src|href)":/i, /iVBOR|AAAA|\/png|\/jpeg|\/jpg|\/gif|\/webp|\/svg/i, /sourceMappingURL=/i, /webpack:\/\//i, /__webpack/i, /\.chunk\.js/i, /\/\*#\s*source/i, /import\s+.*\s+from\s+['"]/i, /require\s*\(['"]/i, /["']data["']\s*:/i, /["']image["']\s*:/i, /\/\/ data:image/i];
function getEntropy(value) {
  const characterCounts = {};
  for (const character of value) characterCounts[character] = (characterCounts[character] || 0) + 1;
  let entropy = 0;
  for (const character in characterCounts) {
    const probability = characterCounts[character] / value.length;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}
function isLikelyBase64Data(match, context) {
  if (/data:[\w/-]+;base64,/.test(context)) return true;
  if (/={1,2}$/.test(match) && match.length > 100) return true;
  if (match.length > 200 && /^[A-Za-z0-9+/=]+$/.test(match)) return true;
  const contextPrefix = context.substring(0, 100);
  if (/"(?:data|content|image|icon|font|media|src|href|asset|resource)"\s*:\s*"[^"]*$/i.test(contextPrefix)) return true;
  if (/(?:const|let|var)\s+(?:data|image|icon|font|asset|resource|content)\w*\s*=\s*["`'][^"`']*$/i.test(contextPrefix)) return true;
  return false;
}
function isInComment(line) {
  const trimmedLine = line.trim();
  return /^\s*\/\//.test(trimmedLine) || /^\s*\*/.test(trimmedLine) || /^\s*\/\*/.test(trimmedLine);
}
function normalizeSourceFile(source) {
  if (!source) return source;
  try { const url = new URL(source); return `${url.protocol}//${url.host}${url.pathname}`; }
  catch { return source.split('?')[0].split('#')[0]; }
}
function deduplicateResults(results) {
  const seen = new Set();
  return results.filter((result) => {
    const key = `${result.type}:${result.match}:${normalizeSourceFile(result.file || '')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
var kingfisherRulesCache = null;
async function loadKingfisherRules2() {
  if (kingfisherRulesCache) return kingfisherRulesCache;
  try {
    const { loadAllKingfisherRulesFromLocal: loadRules, scanWithKingfisherRules: scanRules } = await Promise.resolve().then(() => (init_kingfisher_rules(), kingfisher_rules_exports));
    kingfisherRulesCache = { rules: await loadRules(), scanWithKingfisherRules: scanRules };
  } catch (error) {
    console.error('Failed to load Kingfisher rules:', error);
    kingfisherRulesCache = { rules: [], scanWithKingfisherRules: null };
  }
  return kingfisherRulesCache;
}
function scanContent(content, source) {
  return [];
}
async function scanContentWithKingfisher(content, source) {
  const results = [];
  if (!content) return results;
  try {
    const { rules, scanWithKingfisherRules: scanRules } = await loadKingfisherRules2();
    if (!rules?.length || !scanRules) return results;
    const rawMatches = scanRules(content, rules, { getEntropy, checkPatternRequirements: true });
    for (const rawMatch of rawMatches) {
      const contextStart = Math.max(0, rawMatch.index - 100);
      const contextEnd = Math.min(content.length, rawMatch.index + rawMatch.match.length + 100);
      const context = content.substring(contextStart, contextEnd);
      if (KNOWN_FALSE_POSITIVE_PATTERNS.some((pattern) => pattern.test(rawMatch.match))) continue;
      if (FALSE_POSITIVE_CONTEXT_PATTERNS.some((pattern) => pattern.test(context))) continue;
      if (isLikelyBase64Data(rawMatch.match, context)) continue;
      const lineStart = content.lastIndexOf('\n', rawMatch.index) + 1;
      const lineEnd = content.indexOf('\n', rawMatch.index);
      const line = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);
      if (isInComment(line)) continue;
      let confidence = rawMatch.confidence === 'high' ? 85 : rawMatch.confidence === 'medium' ? 70 : 60;
      if (rawMatch.entropy) {
        const entropy = parseFloat(rawMatch.entropy);
        if (entropy > 4.5) confidence += 10;
        else if (entropy < 3.5) confidence -= 10;
      }
      if (confidence < 60) continue;
      results.push({
        file: source,
        type: rawMatch.ruleName || rawMatch.ruleId || 'Unknown Secret',
        match: rawMatch.match,
        index: rawMatch.index,
        confidence: Math.min(100, confidence),
        entropy: rawMatch.entropy || '0.00',
        ruleName: rawMatch.ruleName,
        ruleId: rawMatch.ruleId,
      });
    }
  } catch (error) {
    console.warn('Error scanning with Kingfisher rules:', error);
  }
  return results;
}
async function scanForSecrets(requests, onProgress, onResult) {
  const results = [];
  const seen = new Set();
  let processedCount = 0;
  const totalCount = requests.length;
  for (const requestEntry of requests) {
    try {
      if (!requestEntry?.request || !requestEntry.response) {
        processedCount++;
        if (onProgress) onProgress(processedCount, totalCount);
        continue;
      }
      const requestUrl = requestEntry.request.url.toLowerCase();
      const mimeType = requestEntry.response?.content?.mimeType?.toLowerCase() || '';
      const isJavaScript = requestUrl.endsWith('.js') || mimeType.includes('javascript') || mimeType.includes('ecmascript') || mimeType.includes('application/javascript');
      if (isJavaScript) {
        try {
          let responseBody = null;
          if (requestEntry.responseBody !== undefined) responseBody = requestEntry.responseBody || '';
          else if (typeof requestEntry.getContent === 'function') {
            responseBody = await new Promise((resolve, reject) => {
              requestEntry.getContent((content) => {
                if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
                else resolve(content || '');
              });
            });
          } else {
            processedCount++;
            if (onProgress) onProgress(processedCount, totalCount);
            continue;
          }
          if (responseBody) {
            try {
              const matches = await scanContentWithKingfisher(responseBody, requestEntry.request.url);
              for (const match of matches) {
                const key = `${match.type}:${match.match}`;
                if (!seen.has(key)) {
                  seen.add(key);
                  results.push(match);
                  if (onResult) onResult(match);
                }
              }
            } catch (error) { console.warn('Error scanning with Kingfisher:', error); }
          }
        } catch (error) { console.error(`Error scanning request ${requestUrl}:`, error); }
      }
    } catch (error) { console.error('Error processing request:', error); }
    processedCount++;
    if (onProgress) onProgress(processedCount, totalCount);
  }
  return results;
}
export {
  scanContent, scanContentWithKingfisher, scanForSecrets
};

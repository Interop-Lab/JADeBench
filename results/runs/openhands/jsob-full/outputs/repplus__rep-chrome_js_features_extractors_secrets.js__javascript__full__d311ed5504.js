const __defProp = Object.defineProperty;
const __getOwnPropNames = Object.getOwnPropertyNames;

const __esm = (moduleInitializer, initializedValue) => function initializeModule() {
  if (moduleInitializer) {
    const initializer = moduleInitializer[__getOwnPropNames(moduleInitializer)[0]];
    moduleInitializer = 0;
    initializedValue = initializer(0);
  }
  return initializedValue;
};

const __export = (target, allExports) => {
  for (const exportName in allExports) {
    __defProp(target, exportName, {
      get: allExports[exportName],
      enumerable: true,
    });
  }
};

const kingfisher_rules_exports = {};
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
  let inCharacterClass = false;
  const openingPositions = [];

  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index];
    const previousCharacter = index > 0 ? pattern[index - 1] : '';
    const characterBeforePrevious = index > 1 ? pattern[index - 2] : '';

    if (previousCharacter === '\\' && characterBeforePrevious !== '\\') continue;
    if (character === '[' && !inCharacterClass) {
      inCharacterClass = true;
      continue;
    }
    if (character === ']' && inCharacterClass) {
      inCharacterClass = false;
      continue;
    }
    if (inCharacterClass) continue;

    if (character === '(') {
      depth++;
      openingPositions.push(index);
    } else if (character === ')') {
      depth--;
      if (depth < 0) {
        return {
          valid: false,
          error: `Unmatched closing parenthesis at position ${index}`,
        };
      }
      openingPositions.pop();
    }
  }

  if (depth !== 0) {
    return {
      valid: false,
      error: `Unmatched opening parenthesis (depth: ${depth}) at position ${openingPositions[0] || 0}`,
    };
  }
  return { valid: true };
}
function stripComments(pattern, extendedMode = false) {
  pattern = pattern.replace(/\(\?#[^)]*\)/g, '');
  if (!extendedMode) return pattern.replace(/\s#[\s\w]*$/gm, '');

  return pattern.split('\n').map(line => {
    let strippedLine = '';
    let inCharacterClass = false;

    for (let index = 0; index < line.length; index++) {
      const character = line[index];
      const previousCharacter = index > 0 ? line[index - 1] : '';

      if (previousCharacter === '\\') {
        strippedLine += character;
        continue;
      }
      if (character === '[' && !inCharacterClass) {
        inCharacterClass = true;
      } else if (character === ']' && inCharacterClass) {
        inCharacterClass = false;
      } else if (
        !inCharacterClass &&
        character === '#' &&
        (index === 0 || /\s/.test(previousCharacter))
      ) {
        break;
      }
      strippedLine += character;
    }
    return strippedLine;
  }).join('\n');
}
function convertNamedGroups(pattern) {
  return pattern.replace(/\(\?P<([^>]+)>/g, "(?<$1>");
}
function convertInlineFlagGroups(pattern, flags) {
  let convertedPattern = convertNamedGroups(pattern);
  const hasIgnoreCaseFlag = flags.includes('i');
  const hasDotAllFlag = flags.includes('s');
  let needsIgnoreCaseFlag = false;
  let needsDotAllFlag = false;
  const inlineFlagGroupRegex = /\(\?([-]?[imsux]+):/g;
  const replacements = [];
  let match;

  while ((match = inlineFlagGroupRegex.exec(convertedPattern)) !== null) {
    const groupStart = match.index;
    const inlineFlags = match[1];
    const contentStart = match.index + match[0].length;
    const enablesIgnoreCase = inlineFlags.includes('i') &&
      !inlineFlags.startsWith('-') &&
      !inlineFlags.includes('-i');
    const enablesDotAll = inlineFlags.includes('s') &&
      !inlineFlags.startsWith('-') &&
      !inlineFlags.includes('-s');

    if (enablesIgnoreCase && !hasIgnoreCaseFlag) needsIgnoreCaseFlag = true;
    if (enablesDotAll && !hasDotAllFlag) needsDotAllFlag = true;

    let depth = 1;
    let index = contentStart;
    let inCharacterClass = false;
    while (index < convertedPattern.length && depth > 0) {
      const character = convertedPattern[index];
      const previousCharacter = index > 0 ? convertedPattern[index - 1] : '';
      if (previousCharacter === '\\') {
        index++;
        continue;
      }
      if (character === '[' && !inCharacterClass) {
        inCharacterClass = true;
      } else if (character === ']' && inCharacterClass) {
        inCharacterClass = false;
      } else if (!inCharacterClass) {
        if (character === '(') depth++;
        else if (character === ')') depth--;
      }
      index++;
    }

    if (depth === 0) {
      const groupEnd = index - 1;
      const groupContent = convertedPattern.substring(contentStart, groupEnd);
      replacements.push({
        start: groupStart,
        end: index,
        replacement: `(${groupContent})`,
      });
    }
  }

  for (const replacement of replacements.reverse()) {
    convertedPattern = convertedPattern.substring(0, replacement.start) +
      replacement.replacement +
      convertedPattern.substring(replacement.end);
  }
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

  const inlineConversion = convertInlineFlagGroups(convertedPattern, flags);
  convertedPattern = inlineConversion.pattern;
  flags = inlineConversion.flags;
  convertedPattern = convertedPattern.replace(/\(\?([imsux]+)\)/g, (_fullMatch, inlineFlags) => {
    if (inlineFlags.includes('i') && !flags.includes('i')) flags += 'i';
    if (inlineFlags.includes('m') && !flags.includes('m')) flags += 'm';
    if (inlineFlags.includes('s') && !flags.includes('s')) flags += 's';
    if (inlineFlags.includes('x')) extendedMode = true;
    return '';
  });

  if (extendedMode) convertedPattern = stripWhitespaceInExtendedMode(convertedPattern);
  return { pattern: convertedPattern, flags };
}

function stripWhitespaceInExtendedMode(pattern) {
  let result = '';
  let inCharacterClass = false;

  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index];
    const nextCharacter = index + 1 < pattern.length ? pattern[index + 1] : '';

    if (character === '[') inCharacterClass = true;
    if (character === ']' && inCharacterClass) inCharacterClass = false;
    if (inCharacterClass) {
      result += character;
      continue;
    }
    if (character === '\\') {
      result += character;
      if (nextCharacter) {
        result += nextCharacter;
        index++;
      }
      continue;
    }
    if (/[\s\n\r\t]/.test(character)) continue;
    result += character;
  }
  return result;
}
function validatePatternRequirements(matchText, requirements, context = null) {
  if (!requirements) return { passed: true };

  if (requirements.min_digits !== undefined) {
    const digitCount = (matchText.match(/\d/g) || []).length;
    if (digitCount < requirements.min_digits) {
      return {
        passed: false,
        reason: `Requires at least ${requirements.min_digits} digits, found ${digitCount}`,
      };
    }
  }

  if (requirements.min_uppercase !== undefined) {
    const uppercaseCount = (matchText.match(/[A-Z]/g) || []).length;
    if (uppercaseCount < requirements.min_uppercase) {
      return {
        passed: false,
        reason: `Requires at least ${requirements.min_uppercase} uppercase letters, found ${uppercaseCount}`,
      };
    }
  }

  if (requirements.min_lowercase !== undefined) {
    const lowercaseCount = (matchText.match(/[a-z]/g) || []).length;
    if (lowercaseCount < requirements.min_lowercase) {
      return {
        passed: false,
        reason: `Requires at least ${requirements.min_lowercase} lowercase letters, found ${lowercaseCount}`,
      };
    }
  }

  if (requirements.min_special_chars !== undefined) {
    const specialCharacters = requirements.special_chars || "!@#$%^&*()_+-=[]{}|;:'\",.<>?/\\`~";
    const escapedCharacters = specialCharacters.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const specialCharacterCount = (matchText.match(new RegExp(`[${escapedCharacters}]`, 'g')) || []).length;
    if (specialCharacterCount < requirements.min_special_chars) {
      return {
        passed: false,
        reason: `Requires at least ${requirements.min_special_chars} special characters, found ${specialCharacterCount}`,
      };
    }
  }

  if (requirements.ignore_if_contains) {
    const lowercaseCandidate = matchText.toLowerCase();
    for (const ignoredTerm of requirements.ignore_if_contains) {
      const trimmedTerm = ignoredTerm.trim();
      if (trimmedTerm && lowercaseCandidate.includes(trimmedTerm.toLowerCase())) {
        return {
          passed: false,
          reason: `Contains ignored term: ${trimmedTerm}`,
          ignored: true,
        };
      }
    }
  }
  return { passed: true };
}
async function loadKingfisherRules(yamlText) {
  let parsedYaml;
  try {
    if (typeof window !== "undefined" && window.jsyaml && window.jsyaml.load) {
      parsedYaml = window.jsyaml.load(yamlText);
    } else {
      parsedYaml = parseYamlRulesFallback(yamlText);
      const fallbackFailed = !parsedYaml ||
        (parsedYaml.rules && parsedYaml.rules.length === 0) ||
        (Array.isArray(parsedYaml) && parsedYaml.length === 0);
      if (fallbackFailed) throw new Error("Fallback parser could not parse YAML");
    }
  } catch (error) {
    console.error("Failed to parse YAML rules:", error);
    return [];
  }

  const rawRules = parsedYaml.rules || (Array.isArray(parsedYaml) ? parsedYaml : []);
  const compiledRules = rawRules.map(rule => {
    if (!rule || !rule.pattern) {
      console.warn("Rule missing pattern:", rule.id || rule.name);
      return null;
    }

    const leadingFlags = /^\(\?([imsux]+)\)/.exec(rule.pattern);
    const extendedMode = Boolean(leadingFlags && leadingFlags[1].includes('x'));
    const commentFreePattern = stripComments(rule.pattern, extendedMode);
    const { pattern, flags } = convertPatternFlags(commentFreePattern);
    const parenthesisValidation = validateParentheses(pattern);

    if (!parenthesisValidation.valid) {
      try {
        return {
          ...rule,
          compiledRegex: new RegExp(pattern, flags),
          cleanedPattern: pattern,
        };
      } catch (compilationError) {
        console.warn(
          "Invalid pattern for rule " + (rule.id || rule.name) + ': ' + parenthesisValidation.error,
        );
        console.warn("Compilation also failed: " + compilationError.message);
        console.warn("Original pattern: " + rule.pattern.substring(0, 150) +
          (rule.pattern.length > 150 ? "..." : ''));
        console.warn("Converted pattern: " + pattern.substring(0, 200) +
          (pattern.length > 200 ? "..." : ''));
        return null;
      }
    }

    try {
      return {
        ...rule,
        compiledRegex: new RegExp(pattern, flags),
        cleanedPattern: pattern,
      };
    } catch (error) {
      console.warn(
        "Failed to compile regex for rule " + (rule.id || rule.name) + ':',
        error.message,
      );
      console.warn("Pattern: " + pattern.substring(0, 200) +
        (pattern.length > 200 ? "..." : ''));
      return null;
    }
  }).filter(Boolean);
  return compiledRules;
}
function parseYamlRulesFallback(yamlText) {
  console.warn("Using fallback YAML parser - consider bundling js-yaml for better support");
  try {
    {
      const rules = [],
      lines = yamlText.split('\x0a');
      let currentRule = null,
      readingPattern = false,
      patternLines = [];
      for (let lineIndex = 0; ((lineIndex) < (lines.length)); lineIndex++) {
        {
          const line = lines[lineIndex],
          trimmedLine = line.trim();
          if ( ! trimmedLine || trimmedLine.startsWith('#'))continue;
          if (trimmedLine.startsWith("- name:")) {
            if (currentRule) {
              if (readingPattern && patternLines.length > 0) {
                currentRule.pattern = patternLines.join('\n').trim();
                patternLines = [];
              }
              rules.push(currentRule);
            }
            currentRule = {
              name: trimmedLine.replace(/^- name:\s*/, '').replace(/^["']|["']$/g, ''),
            };
            readingPattern = false;
            continue;
          }
          if (currentRule) {
            {
              if (trimmedLine.startsWith("id:"))currentRule.id = trimmedLine.replace(/^id:\s*/, '').replace(/^["']|["']$/g, '');
              else {
                if (trimmedLine.startsWith("pattern:")) {
                  {
                    readingPattern = true;
                    const inlinePattern = trimmedLine.replace(/^pattern:\s*\|?\s*/, '');
                    inlinePattern && patternLines.push(inlinePattern);
                  }
                } else {
                  if (readingPattern && (line.startsWith('\x20') || line.startsWith('\x09')))patternLines.push(line);
                  else {
                    if (trimmedLine.startsWith("min_entropy:")) {
                      readingPattern = false;
                      currentRule.min_entropy = parseFloat(trimmedLine.replace(/^min_entropy:\s*/, ''));
                    } else {
                      if (trimmedLine.startsWith("pattern_requirements:")) {
                        readingPattern = false;
                        currentRule.pattern_requirements = {
                        };
                      } else {
                        if (currentRule.pattern_requirements && trimmedLine.startsWith("min_digits:")) {
                          currentRule.pattern_requirements.min_digits = parseInt(trimmedLine.replace(/^min_digits:\s*/, ''));
                        } else {
                          if (trimmedLine.match(/^[a-z_]+:/) && ! trimmedLine.startsWith("pattern")) {
                            readingPattern = false;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (currentRule) {
        readingPattern && ((patternLines.length) > (0)) && (currentRule.pattern = patternLines.join('\x0a').trim());
        currentRule.pattern && rules.push(currentRule);
      }
      const result = {
      };
      result.rules = rules;
      return result;
    }
  } catch (error) {
    {
      console.error("Fallback YAML parser failed:", error);
      const emptyResult = {
      };
      emptyResult.rules = [];
      return emptyResult;
    }
  }
}
async function loadKingfisherRulesFromJSON(input) {
  try {
    const parsedInput = typeof input === "string" ? JSON.parse(input) : input;
    const rawRules = parsedInput.rules || (Array.isArray(parsedInput) ? parsedInput : []);

    return rawRules.map(rule => {
      if (!rule || !rule.pattern) return null;
      const leadingFlags = /^\(\?([imsux]+)\)/.exec(rule.pattern);
      const extendedMode = Boolean(leadingFlags && leadingFlags[1].includes('x'));
      const commentFreePattern = stripComments(rule.pattern, extendedMode);
      const { pattern, flags } = convertPatternFlags(commentFreePattern);

      try {
        return {
          ...rule,
          compiledRegex: new RegExp(pattern, flags),
          cleanedPattern: pattern,
        };
      } catch (error) {
        console.warn("Failed to compile regex for rule " + (rule.id || rule.name) + ':', error);
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error("Failed to load JSON rules:", error);
    return [];
  }
}

async function loadKingfisherRulesFromFile(filePath) {
  try {
    const response = await fetch(chrome.runtime.getURL(filePath)),
    json = await response.json();
    return await loadKingfisherRulesFromJSON(json);
  } catch (error) {
    console.error("Failed to load rules from " + filePath + ':', error);
    return [];
  }
}
function scanWithKingfisherRules(content, rules, options = {}) {
  const results = [];
  if (!content || !rules || rules.length === 0) return results;

  const {
    minEntropy = 0,
    checkPatternRequirements = true,
    getEntropy: entropyCalculator = null,
  } = options;

  for (const rule of rules) {
    if (!rule.compiledRegex) continue;

    try {
      const regex = rule.compiledRegex;
      regex.lastIndex = 0;
      let regexMatch;
      while ((regexMatch = regex.exec(content)) !== null) {
        const matchText = regexMatch[0];
        const matchIndex = regexMatch.index;

        if (entropyCalculator && rule.min_entropy) {
          const entropy = entropyCalculator(matchText);
          if (entropy < rule.min_entropy) continue;
        }
        if (checkPatternRequirements && rule.pattern_requirements) {
          const validation = validatePatternRequirements(
            matchText,
            rule.pattern_requirements,
            { captures: regexMatch },
          );
          if (!validation.passed && !validation.ignored) continue;
        }

        const contextStart = Math.max(0, matchIndex - 100);
        const contextEnd = Math.min(content.length, matchIndex + matchText.length + 100);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          match: matchText,
          index: matchIndex,
          confidence: rule.confidence || "medium",
          entropy: entropyCalculator ? entropyCalculator(matchText).toFixed(2) : null,
          context: content.substring(contextStart, contextEnd),
          validation: rule.validation || null,
        });
      }
    } catch (error) {
      console.warn("Error scanning with rule " + rule.id + ':', error);
    }
  }
  return results;
}
async function loadKingfisherRulesFromLocalFile(fileName) {
  try {
    {
      const fileUrl = chrome.runtime.getURL("rules/" + fileName),
      response = await fetch(fileUrl);
      if ( ! response.ok) {
        throw new Error("HTTP " + response.status + ':\x20' + response.statusText);
      }
      const yamlText = await response.text(),
      rules = await loadKingfisherRules(yamlText);
      return rules;
    }
  } catch (error) {
    console.error("Failed to load Kingfisher rules from " + fileName + ':', error);
    return [];
  }
}
async function loadKingfisherRulesFromLocalFiles(fileNames) {
  const rules = [];
  for (const fileName of fileNames) {
    try {
      {
        const fileRules = await loadKingfisherRulesFromLocalFile(fileName);
        rules.push( ... fileRules);
      }
    } catch (error) {
      console.warn("Failed to load rules from " + fileName + ':', error);
    }
  }
  return rules;
}
async function loadAllKingfisherRulesFromLocal() {
  try {
    {
      const manifestUrl = chrome.runtime.getURL("rules/_manifest.json"),
      manifestResponse = await fetch(manifestUrl);
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        if (manifest.files && Array.isArray(manifest.files)) {
          return await loadKingfisherRulesFromLocalFiles(manifest.files);
        }
      }
    }
  } catch (manifestError) {
  }
  const defaultRuleFiles = ["slack.yaml", "aws.yaml", "github.yaml", "google.yaml", "stripe.yaml", "twilio.yaml", "azure.yaml", "heroku.yaml", "mailgun.yaml", "sendgrid.yaml", "paypal.yaml", "square.yaml"],
  rules = [];
  for (const fileName of defaultRuleFiles) {
    try {
      const fileRules = await loadKingfisherRulesFromLocalFile(fileName);
      if (((fileRules.length) > (0))) {
        rules.push( ... fileRules);
      }
    } catch (fileError) {
    }
  }
  return rules;
}
async function loadKingfisherRulesFromURL(url) {
  try {
    {
      const response = await fetch(url),
      yamlText = await response.text();
      return await loadKingfisherRules(yamlText);
    }
  } catch (error) {
    console.error("Failed to load Kingfisher rules from URL:", error);
    return [];
  }
}
async function loadKingfisherRulesFromURLs(urls) {
  const rules = [];
  for (const url of urls) {
    try {
      {
        const urlRules = await loadKingfisherRulesFromURL(url);
        rules.push( ... urlRules);
      }
    } catch (error) {
      console.warn("Failed to load rules from " + url + ':', error);
    }
  }
  return rules;
}
const kingfisherModuleInitializer = {
  "../work/repplus__rep-chrome/js/features/extractors/kingfisher-rules.js": function () {},
};
const init_kingfisher_rules = __esm(kingfisherModuleInitializer);

const KNOWN_FALSE_POSITIVE_PATTERNS = [
  /^[a-f0-9]{40}$/i,
  /^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)+$/,
  /^[a-z][a-zA-Z0-9]+(?:[A-Z][a-z0-9]+)+$/,
  /^(?:map|filter|reduce|forEach|slice|splice|concat)/i,
  /^_react|_emotion|_styled|_next/i,
  /sourceMappingURL/i,
  /^__webpack/i,
  /^module\./i,
  /^exports\./i,
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
  /\/\/ data:image/i,
];
function getEntropy(value) {
  const length = value.length;
  const characterCounts = {};
  for (let index = 0; index < length; index++) {
    const character = value[index];
    characterCounts[character] = (characterCounts[character] || 0) + 1;
  }

  let entropy = 0;
  for (const character in characterCounts) {
    const probability = characterCounts[character] / length;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}

function isLikelyBase64Data(matchText, context) {
  if (/data:[\w/-]+;base64,/.test(context)) return true;
  if (/={1,2}$/.test(matchText) && matchText.length > 100) return true;
  if (matchText.length > 200 && /^[A-Za-z0-9+/=]+$/.test(matchText)) return true;

  const contextPrefix = context.substring(0, 100);
  if (/"(?:data|content|image|icon|font|media|src|href|asset|resource)"\s*:\s*"[^"]*$/i.test(contextPrefix)) {
    return true;
  }
  return /(?:const|let|var)\s+(?:data|image|icon|font|asset|resource|content)\w*\s*=\s*["`'][^"`']*$/i
    .test(contextPrefix);
}

function isInComment(line) {
  const trimmedLine = line.trim();
  return /^\s*\/\//.test(trimmedLine) || /^\s*\*/.test(trimmedLine) || /^\s*\/\*/.test(trimmedLine);
}

function normalizeSourceFile(file) {
  if (!file) return file;
  try {
    const url = new URL(file);
    return url.protocol + '//' + url.host + url.pathname;
  } catch (error) {
    return file.split('?')[0].split('#')[0];
  }
}

function deduplicateResults(results) {
  const seen = new Set();
  return results.filter(result => {
    const normalizedFile = normalizeSourceFile(result.file || '');
    const key = result.type + ':' + result.match + ':' + normalizedFile;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

let kingfisherRulesCache = null;

async function loadKingfisherRules2() {
  if (kingfisherRulesCache) return kingfisherRulesCache;

  try {
    const module = await Promise.resolve().then(() => {
      init_kingfisher_rules();
      return kingfisher_rules_exports;
    });
    const rules = await module.loadAllKingfisherRulesFromLocal();
    kingfisherRulesCache = {
      rules,
      scanWithKingfisherRules: module.scanWithKingfisherRules,
    };
  } catch (error) {
    console.error("Failed to load Kingfisher rules:", error);
    kingfisherRulesCache = {
      rules: [],
      scanWithKingfisherRules: null,
    };
  }
  return kingfisherRulesCache;
}

function scanContent(content, file) {
  return [];
}

async function scanContentWithKingfisher(content, file) {
  const results = [];
  if (!content) return results;

  try {
    const { rules, scanWithKingfisherRules: scanRules } = await loadKingfisherRules2();
    if (!rules || rules.length === 0 || !scanRules) return results;

    const matches = scanRules(content, rules, {
      getEntropy,
      checkPatternRequirements: true,
    });

    for (const match of matches) {
      const contextStart = Math.max(0, match.index - 100);
      const contextEnd = Math.min(content.length, match.index + match.match.length + 100);
      const context = content.substring(contextStart, contextEnd);

      if (KNOWN_FALSE_POSITIVE_PATTERNS.some(pattern => pattern.test(match.match))) continue;
      if (FALSE_POSITIVE_CONTEXT_PATTERNS.some(pattern => pattern.test(context))) continue;
      if (isLikelyBase64Data(match.match, context)) continue;

      const lineStart = content.lastIndexOf('\n', match.index) + 1;
      const lineEnd = content.indexOf('\n', match.index);
      const line = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);
      if (isInComment(line)) continue;

      let confidence;
      if (match.confidence === "high") confidence = 85;
      else if (match.confidence === "medium") confidence = 70;
      else confidence = 60;

      if (match.entropy) {
        const entropy = parseFloat(match.entropy);
        if (entropy > 4.5) confidence += 10;
        else if (entropy < 3.5) confidence -= 10;
      }
      if (confidence < 60) continue;

      results.push({
        file,
        type: match.ruleName || match.ruleId || "Unknown Secret",
        match: match.match,
        index: match.index,
        confidence: Math.min(100, confidence),
        entropy: match.entropy || "0.00",
        ruleName: match.ruleName,
        ruleId: match.ruleId,
      });
    }
  } catch (error) {
    console.warn("Error scanning with Kingfisher rules:", error);
  }
  return results;
}

async function scanForSecrets(requests, onProgress, onResult) {
  const results = [];
  const seenMatches = new Set();
  let processedCount = 0;
  const totalRequests = requests.length;

  for (const requestEntry of requests) {
    try {
      if (!requestEntry || !requestEntry.request || !requestEntry.response) {
        processedCount++;
        if (onProgress) onProgress(processedCount, totalRequests);
        continue;
      }

      const requestUrl = requestEntry.request.url.toLowerCase();
      const mimeType = requestEntry.response?.content?.mimeType?.toLowerCase() || '';
      const isJavaScript = requestUrl.endsWith(".js") ||
        mimeType.includes("javascript") ||
        mimeType.includes("ecmascript") ||
        mimeType.includes("application/javascript");

      if (isJavaScript) {
        try {
          let responseBody = null;
          if (requestEntry.responseBody !== undefined) {
            responseBody = requestEntry.responseBody || '';
          } else if (typeof requestEntry.getContent === "function") {
            responseBody = await new Promise((resolve, reject) => {
              requestEntry.getContent(content => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(content || '');
                }
              });
            });
          } else {
            processedCount++;
            if (onProgress) onProgress(processedCount, totalRequests);
            continue;
          }

          if (responseBody) {
            try {
              const scanResults = await scanContentWithKingfisher(
                responseBody,
                requestEntry.request.url,
              );
              for (const result of scanResults) {
                const matchKey = result.type + ':' + result.match;
                if (!seenMatches.has(matchKey)) {
                  seenMatches.add(matchKey);
                  results.push(result);
                  if (onResult) onResult(result);
                }
              }
            } catch (error) {
              console.warn("Error scanning with Kingfisher:", error);
            }
          }
        } catch (error) {
          console.error("Error scanning request " + requestUrl + ':', error);
        }
      }
    } catch (error) {
      console.error("Error processing request:", error);
    }

    processedCount++;
    if (onProgress) onProgress(processedCount, totalRequests);
  }
  return results;
}

export {
  scanContent,
  scanContentWithKingfisher,
  scanForSecrets
};

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../work/repplus__rep-chrome/js/features/extractors/kingfisher-rules.js
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
  let inCharClass = false;
  let i = 0;
  const parenStack = [];
  while (i < pattern.length) {
    const char = pattern[i];
    const prevChar = i > 0 ? pattern[i - 1] : "";
    const prevPrevChar = i > 1 ? pattern[i - 2] : "";
    if (prevChar === "\\" && prevPrevChar !== "\\") {
      i++;
      continue;
    }
    if (prevChar === "\\" && prevPrevChar === "\\") {
    }
    if (char === "[" && !inCharClass) {
      inCharClass = true;
      i++;
      continue;
    }
    if (char === "]" && inCharClass) {
      inCharClass = false;
      i++;
      continue;
    }
    if (!inCharClass) {
      if (char === "(") {
        depth++;
        parenStack.push(i);
      } else if (char === ")") {
        depth--;
        if (depth < 0) {
          return { valid: false, error: `Unmatched closing parenthesis at position ${i}` };
        }
        parenStack.pop();
      }
    }
    i++;
  }
  if (depth !== 0) {
    const firstUnmatched = parenStack[0] || 0;
    return { valid: false, error: `Unmatched opening parenthesis (depth: ${depth}) at position ${firstUnmatched}` };
  }
  return { valid: true };
}
function stripComments(pattern, isExtendedMode = false) {
  pattern = pattern.replace(/\(\?#[^)]*\)/g, "");
  if (isExtendedMode) {
    const lines = pattern.split("\n");
    const processedLines = lines.map((line) => {
      let result = "";
      let inCharClass = false;
      let i = 0;
      let commentStart = -1;
      while (i < line.length) {
        const char = line[i];
        const prevChar = i > 0 ? line[i - 1] : "";
        if (prevChar === "\\") {
          result += char;
          i++;
          continue;
        }
        if (char === "[" && !inCharClass) {
          inCharClass = true;
          result += char;
          i++;
          continue;
        }
        if (char === "]" && inCharClass) {
          inCharClass = false;
          result += char;
          i++;
          continue;
        }
        if (!inCharClass && char === "#" && commentStart === -1) {
          const isAtStart = i === 0;
          const isAfterWhitespace = i > 0 && /\s/.test(line[i - 1]);
          if (isAtStart || isAfterWhitespace) {
            commentStart = i;
            break;
          }
        }
        result += char;
        i++;
      }
      return result;
    });
    return processedLines.join("\n");
  } else {
    pattern = pattern.replace(/\s#[\s\w]*$/gm, "");
    return pattern;
  }
}
function convertNamedGroups(pattern) {
  return pattern.replace(/\(\?P<([^>]+)>/g, "(?<$1>");
}
function convertInlineFlagGroups(pattern, globalFlags) {
  pattern = convertNamedGroups(pattern);
  let converted = pattern;
  let hasCaseInsensitive = globalFlags.includes("i");
  let hasDotall = globalFlags.includes("s");
  let needsCaseInsensitive = false;
  let needsDotall = false;
  const inlineFlagRegex = /\(\?([-]?[imsux]+):/g;
  let match;
  const replacements = [];
  inlineFlagRegex.lastIndex = 0;
  while ((match = inlineFlagRegex.exec(converted)) !== null) {
    const startPos = match.index;
    const flagGroup = match[1];
    const contentStart = match.index + match[0].length;
    const isCaseInsensitive = flagGroup.includes("i") && !flagGroup.startsWith("-") && !flagGroup.includes("-i");
    const isDotall = flagGroup.includes("s") && !flagGroup.startsWith("-") && !flagGroup.includes("-s");
    if (isCaseInsensitive && !hasCaseInsensitive) {
      needsCaseInsensitive = true;
    }
    if (isDotall && !hasDotall) {
      needsDotall = true;
    }
    let depth = 1;
    let pos = contentStart;
    let contentEnd = -1;
    let inCharClass = false;
    while (pos < converted.length && depth > 0) {
      const char = converted[pos];
      const prevChar = pos > 0 ? converted[pos - 1] : "";
      if (prevChar === "\\") {
        pos++;
        continue;
      }
      if (char === "[" && !inCharClass) {
        inCharClass = true;
        pos++;
        continue;
      }
      if (char === "]" && inCharClass) {
        inCharClass = false;
        pos++;
        continue;
      }
      if (!inCharClass) {
        if (char === "(") depth++;
        else if (char === ")") depth--;
      }
      pos++;
    }
    if (depth === 0) {
      contentEnd = pos - 1;
      const content = converted.substring(contentStart, contentEnd);
      replacements.push({
        start: startPos,
        end: pos,
        replacement: `(${content})`
      });
    }
  }
  replacements.reverse().forEach((repl) => {
    converted = converted.substring(0, repl.start) + repl.replacement + converted.substring(repl.end);
  });
  if (needsCaseInsensitive && !hasCaseInsensitive) {
    globalFlags += "i";
  }
  if (needsDotall && !hasDotall) {
    globalFlags += "s";
  }
  return { pattern: converted, flags: globalFlags };
}
function convertPatternFlags(pattern) {
  let flags = "g";
  let cleanedPattern = pattern;
  let hasExtendedFlag = false;
  const flagMatch = pattern.match(/^\(\?([imsux]+)\)/);
  if (flagMatch) {
    const pcreFlags = flagMatch[1];
    cleanedPattern = pattern.replace(/^\(\?[imsux]+\)/, "");
    if (pcreFlags.includes("i")) flags += "i";
    if (pcreFlags.includes("m")) flags += "m";
    if (pcreFlags.includes("s")) flags += "s";
    if (pcreFlags.includes("x")) hasExtendedFlag = true;
  }
  const inlineResult = convertInlineFlagGroups(cleanedPattern, flags);
  cleanedPattern = inlineResult.pattern;
  flags = inlineResult.flags;
  cleanedPattern = cleanedPattern.replace(/\(\?([imsux]+)\)/g, (match, pcreFlags) => {
    if (pcreFlags.includes("i") && !flags.includes("i")) flags += "i";
    if (pcreFlags.includes("m") && !flags.includes("m")) flags += "m";
    if (pcreFlags.includes("s") && !flags.includes("s")) flags += "s";
    if (pcreFlags.includes("x") && !hasExtendedFlag) {
      hasExtendedFlag = true;
    }
    return "";
  });
  if (hasExtendedFlag) {
    cleanedPattern = stripWhitespaceInExtendedMode(cleanedPattern);
  }
  return { pattern: cleanedPattern, flags };
}
function stripWhitespaceInExtendedMode(pattern) {
  let result = "";
  let inCharClass = false;
  let i = 0;
  while (i < pattern.length) {
    const char = pattern[i];
    const nextChar = i + 1 < pattern.length ? pattern[i + 1] : "";
    if (char === "[") {
      inCharClass = true;
      result += char;
      i++;
      continue;
    }
    if (char === "]" && inCharClass) {
      inCharClass = false;
      result += char;
      i++;
      continue;
    }
    if (inCharClass) {
      result += char;
      i++;
      continue;
    }
    if (char === "\\") {
      result += char;
      if (nextChar) {
        result += nextChar;
        i += 2;
      } else {
        i++;
      }
      continue;
    }
    if (!inCharClass && /[\s\n\r\t]/.test(char)) {
      i++;
      continue;
    }
    result += char;
    i++;
  }
  return result;
}
function validatePatternRequirements(match, requirements, context = null) {
  if (!requirements) return { passed: true };
  const str = match;
  if (requirements.min_digits !== void 0) {
    const digitCount = (str.match(/\d/g) || []).length;
    if (digitCount < requirements.min_digits) {
      return { passed: false, reason: `Requires at least ${requirements.min_digits} digits, found ${digitCount}` };
    }
  }
  if (requirements.min_uppercase !== void 0) {
    const upperCount = (str.match(/[A-Z]/g) || []).length;
    if (upperCount < requirements.min_uppercase) {
      return { passed: false, reason: `Requires at least ${requirements.min_uppercase} uppercase letters, found ${upperCount}` };
    }
  }
  if (requirements.min_lowercase !== void 0) {
    const lowerCount = (str.match(/[a-z]/g) || []).length;
    if (lowerCount < requirements.min_lowercase) {
      return { passed: false, reason: `Requires at least ${requirements.min_lowercase} lowercase letters, found ${lowerCount}` };
    }
  }
  if (requirements.min_special_chars !== void 0) {
    const specialChars = requirements.special_chars || "!@#$%^&*()_+-=[]{}|;:'\",.<>?/\\`~";
    const specialCount = (str.match(new RegExp(`[${specialChars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`, "g")) || []).length;
    if (specialCount < requirements.min_special_chars) {
      return { passed: false, reason: `Requires at least ${requirements.min_special_chars} special characters, found ${specialCount}` };
    }
  }
  if (requirements.ignore_if_contains) {
    const lowerStr = str.toLowerCase();
    for (const term of requirements.ignore_if_contains) {
      const trimmed = term.trim();
      if (trimmed && lowerStr.includes(trimmed.toLowerCase())) {
        return { passed: false, reason: `Contains ignored term: ${trimmed}`, ignored: true };
      }
    }
  }
  return { passed: true };
}
async function loadKingfisherRules(yamlContent) {
  let parsed;
  try {
    if (typeof window !== "undefined" && window.jsyaml && window.jsyaml.load) {
      parsed = window.jsyaml.load(yamlContent);
    } else {
      parsed = parseYamlRulesFallback(yamlContent);
      if (!parsed || parsed.rules && parsed.rules.length === 0 || Array.isArray(parsed) && parsed.length === 0) {
        throw new Error("Fallback parser could not parse YAML");
      }
    }
  } catch (e) {
    console.error("Failed to parse YAML rules:", e);
    return [];
  }
  const rules = parsed.rules || (Array.isArray(parsed) ? parsed : []);
  const compiledRules = rules.map((rule) => {
    if (!rule || !rule.pattern) {
      console.warn("Rule missing pattern:", rule.id || rule.name);
      return null;
    }
    const hasExtendedFlag = /^\(\?([imsux]+)\)/.test(rule.pattern) && /^\(\?([imsux]+)\)/.exec(rule.pattern)[1].includes("x");
    const cleanedPattern = stripComments(rule.pattern, hasExtendedFlag);
    const { pattern, flags } = convertPatternFlags(cleanedPattern);
    const validation = validateParentheses(pattern);
    if (!validation.valid) {
      try {
        const regex = new RegExp(pattern, flags);
        return {
          ...rule,
          compiledRegex: regex,
          cleanedPattern: pattern
        };
      } catch (compileError) {
        console.warn(`Invalid pattern for rule ${rule.id || rule.name}: ${validation.error}`);
        console.warn(`Compilation also failed: ${compileError.message}`);
        console.warn(`Original pattern: ${rule.pattern.substring(0, 150)}${rule.pattern.length > 150 ? "..." : ""}`);
        console.warn(`Converted pattern: ${pattern.substring(0, 200)}${pattern.length > 200 ? "..." : ""}`);
        return null;
      }
    }
    try {
      const regex = new RegExp(pattern, flags);
      return {
        ...rule,
        compiledRegex: regex,
        cleanedPattern: pattern
      };
    } catch (e) {
      console.warn(`Failed to compile regex for rule ${rule.id || rule.name}:`, e.message);
      console.warn(`Pattern: ${pattern.substring(0, 200)}${pattern.length > 200 ? "..." : ""}`);
      return null;
    }
  }).filter(Boolean);
  return compiledRules;
}
function parseYamlRulesFallback(yamlContent) {
  console.warn("Using fallback YAML parser - consider bundling js-yaml for better support");
  try {
    const rules = [];
    const lines = yamlContent.split("\n");
    let currentRule = null;
    let inPattern = false;
    let patternLines = [];
    let indentLevel = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      if (trimmed.startsWith("- name:")) {
        if (currentRule) {
          if (inPattern && patternLines.length > 0) {
            currentRule.pattern = patternLines.join("\n").trim();
            patternLines = [];
          }
          rules.push(currentRule);
        }
        currentRule = { name: trimmed.replace(/^- name:\s*/, "").replace(/^["']|["']$/g, "") };
        inPattern = false;
        continue;
      }
      if (currentRule) {
        if (trimmed.startsWith("id:")) {
          currentRule.id = trimmed.replace(/^id:\s*/, "").replace(/^["']|["']$/g, "");
        } else if (trimmed.startsWith("pattern:")) {
          inPattern = true;
          const patternValue = trimmed.replace(/^pattern:\s*\|?\s*/, "");
          if (patternValue) {
            patternLines.push(patternValue);
          }
        } else if (inPattern && (line.startsWith(" ") || line.startsWith("	"))) {
          patternLines.push(line);
        } else if (trimmed.startsWith("min_entropy:")) {
          inPattern = false;
          currentRule.min_entropy = parseFloat(trimmed.replace(/^min_entropy:\s*/, ""));
        } else if (trimmed.startsWith("pattern_requirements:")) {
          inPattern = false;
          currentRule.pattern_requirements = {};
        } else if (currentRule.pattern_requirements && trimmed.startsWith("min_digits:")) {
          currentRule.pattern_requirements.min_digits = parseInt(trimmed.replace(/^min_digits:\s*/, ""));
        } else if (trimmed.match(/^[a-z_]+:/) && !trimmed.startsWith("pattern")) {
          inPattern = false;
        }
      }
    }
    if (currentRule) {
      if (inPattern && patternLines.length > 0) {
        currentRule.pattern = patternLines.join("\n").trim();
      }
      if (currentRule.pattern) {
        rules.push(currentRule);
      }
    }
    return { rules };
  } catch (e) {
    console.error("Fallback YAML parser failed:", e);
    return { rules: [] };
  }
}
async function loadKingfisherRulesFromJSON(jsonContent) {
  try {
    const parsed = typeof jsonContent === "string" ? JSON.parse(jsonContent) : jsonContent;
    const rules = parsed.rules || (Array.isArray(parsed) ? parsed : []);
    return rules.map((rule) => {
      if (!rule || !rule.pattern) return null;
      const hasExtendedFlag = /^\(\?([imsux]+)\)/.test(rule.pattern) && /^\(\?([imsux]+)\)/.exec(rule.pattern)[1].includes("x");
      const cleanedPattern = stripComments(rule.pattern, hasExtendedFlag);
      const { pattern, flags } = convertPatternFlags(cleanedPattern);
      try {
        const regex = new RegExp(pattern, flags);
        return {
          ...rule,
          compiledRegex: regex,
          cleanedPattern: pattern
        };
      } catch (e) {
        console.warn(`Failed to compile regex for rule ${rule.id || rule.name}:`, e);
        return null;
      }
    }).filter(Boolean);
  } catch (e) {
    console.error("Failed to load JSON rules:", e);
    return [];
  }
}
async function loadKingfisherRulesFromFile(path) {
  try {
    const response = await fetch(chrome.runtime.getURL(path));
    const jsonContent = await response.json();
    return await loadKingfisherRulesFromJSON(jsonContent);
  } catch (e) {
    console.error(`Failed to load rules from ${path}:`, e);
    return [];
  }
}
function scanWithKingfisherRules(content, rules, options = {}) {
  const results = [];
  if (!content || !rules || rules.length === 0) {
    return results;
  }
  const {
    minEntropy = 0,
    checkPatternRequirements = true,
    getEntropy: getEntropy2 = null
    // Pass entropy function from secrets.js
  } = options;
  for (const rule of rules) {
    if (!rule.compiledRegex) {
      continue;
    }
    try {
      const regex = rule.compiledRegex;
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(content)) !== null) {
        const matchedStr = match[0];
        const matchIndex = match.index;
        if (getEntropy2 && rule.min_entropy) {
          const entropy = getEntropy2(matchedStr);
          if (entropy < rule.min_entropy) {
            continue;
          }
        }
        if (checkPatternRequirements && rule.pattern_requirements) {
          const validation = validatePatternRequirements(
            matchedStr,
            rule.pattern_requirements,
            { captures: match }
          );
          if (!validation.passed && !validation.ignored) {
            continue;
          }
        }
        const contextStart = Math.max(0, matchIndex - 100);
        const contextEnd = Math.min(content.length, matchIndex + matchedStr.length + 100);
        const context = content.substring(contextStart, contextEnd);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          match: matchedStr,
          index: matchIndex,
          confidence: rule.confidence || "medium",
          entropy: getEntropy2 ? getEntropy2(matchedStr).toFixed(2) : null,
          context,
          validation: rule.validation || null
        });
      }
    } catch (e) {
      console.warn(`Error scanning with rule ${rule.id}:`, e);
    }
  }
  return results;
}
async function loadKingfisherRulesFromLocalFile(filename) {
  try {
    const url = chrome.runtime.getURL(`rules/${filename}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const yamlContent = await response.text();
    const rules = await loadKingfisherRules(yamlContent);
    return rules;
  } catch (e) {
    console.error(`Failed to load Kingfisher rules from ${filename}:`, e);
    return [];
  }
}
async function loadKingfisherRulesFromLocalFiles(filenames) {
  const allRules = [];
  for (const filename of filenames) {
    try {
      const rules = await loadKingfisherRulesFromLocalFile(filename);
      allRules.push(...rules);
    } catch (e) {
      console.warn(`Failed to load rules from ${filename}:`, e);
    }
  }
  return allRules;
}
async function loadAllKingfisherRulesFromLocal() {
  try {
    const manifestUrl = chrome.runtime.getURL("rules/_manifest.json");
    const manifestResponse = await fetch(manifestUrl);
    if (manifestResponse.ok) {
      const manifest = await manifestResponse.json();
      if (manifest.files && Array.isArray(manifest.files)) {
        return await loadKingfisherRulesFromLocalFiles(manifest.files);
      }
    }
  } catch (e) {
  }
  const commonRuleFiles = [
    "slack.yaml",
    "aws.yaml",
    "github.yaml",
    "google.yaml",
    "stripe.yaml",
    "twilio.yaml",
    "azure.yaml",
    "heroku.yaml",
    "mailgun.yaml",
    "sendgrid.yaml",
    "paypal.yaml",
    "square.yaml"
  ];
  const allRules = [];
  for (const filename of commonRuleFiles) {
    try {
      const rules = await loadKingfisherRulesFromLocalFile(filename);
      if (rules.length > 0) {
        allRules.push(...rules);
      }
    } catch (e) {
    }
  }
  return allRules;
}
async function loadKingfisherRulesFromURL(url) {
  try {
    const response = await fetch(url);
    const yamlContent = await response.text();
    return await loadKingfisherRules(yamlContent);
  } catch (e) {
    console.error("Failed to load Kingfisher rules from URL:", e);
    return [];
  }
}
async function loadKingfisherRulesFromURLs(urls) {
  const allRules = [];
  for (const url of urls) {
    try {
      const rules = await loadKingfisherRulesFromURL(url);
      allRules.push(...rules);
    } catch (e) {
      console.warn(`Failed to load rules from ${url}:`, e);
    }
  }
  return allRules;
}
var init_kingfisher_rules = __esm({
  "../work/repplus__rep-chrome/js/features/extractors/kingfisher-rules.js"() {
  }
});

// ../work/repplus__rep-chrome/js/features/extractors/secrets.js
var KNOWN_FALSE_POSITIVE_PATTERNS = [
  // Webpack/build tool artifacts
  /^[a-f0-9]{40}$/i,
  // Git commit hashes, webpack chunk hashes
  /^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)+$/,
  // PascalCase identifiers
  /^[a-z][a-zA-Z0-9]+(?:[A-Z][a-z0-9]+)+$/,
  // camelCase identifiers
  // Common library patterns
  /^(?:map|filter|reduce|forEach|slice|splice|concat)/i,
  // React/framework internals
  /^_react|_emotion|_styled|_next/i,
  // Source map references
  /sourceMappingURL/i,
  // Build system patterns
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
  // Asset imports
  /import\s+.*\s+from\s+['"]/i,
  /require\s*\(['"]/i,
  // Common base64 data patterns
  /["']data["']\s*:/i,
  /["']image["']\s*:/i,
  /\/\/ data:image/i
];
function getEntropy(str) {
  const len = str.length;
  const frequencies = {};
  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}
function isLikelyBase64Data(str, context) {
  if (/data:[\w/-]+;base64,/.test(context)) return true;
  if (/={1,2}$/.test(str) && str.length > 100) return true;
  if (str.length > 200 && /^[A-Za-z0-9+/=]+$/.test(str)) return true;
  const beforeContext = context.substring(0, 100);
  if (/"(?:data|content|image|icon|font|media|src|href|asset|resource)"\s*:\s*"[^"]*$/i.test(beforeContext)) {
    return true;
  }
  if (/(?:const|let|var)\s+(?:data|image|icon|font|asset|resource|content)\w*\s*=\s*["`'][^"`']*$/i.test(beforeContext)) {
    return true;
  }
  return false;
}
function isInComment(line) {
  const trimmed = line.trim();
  return /^\s*\/\//.test(trimmed) || /^\s*\*/.test(trimmed) || /^\s*\/\*/.test(trimmed);
}
function normalizeSourceFile(sourceFile) {
  if (!sourceFile) return sourceFile;
  try {
    const url = new URL(sourceFile);
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch (e) {
    return sourceFile.split("?")[0].split("#")[0];
  }
}
function deduplicateResults(results) {
  const seen = /* @__PURE__ */ new Set();
  return results.filter((result) => {
    const normalizedFile = normalizeSourceFile(result.file || "");
    const key = `${result.type}:${result.match}:${normalizedFile}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
var kingfisherRulesCache = null;
async function loadKingfisherRules2() {
  if (kingfisherRulesCache) {
    return kingfisherRulesCache;
  }
  try {
    const {
      loadAllKingfisherRulesFromLocal: loadAllKingfisherRulesFromLocal2,
      scanWithKingfisherRules: scanWithKingfisherRules2
    } = await Promise.resolve().then(() => (init_kingfisher_rules(), kingfisher_rules_exports));
    const rules = await loadAllKingfisherRulesFromLocal2();
    kingfisherRulesCache = { rules, scanWithKingfisherRules: scanWithKingfisherRules2 };
    return kingfisherRulesCache;
  } catch (e) {
    console.error("Failed to load Kingfisher rules:", e);
    kingfisherRulesCache = { rules: [], scanWithKingfisherRules: null };
    return kingfisherRulesCache;
  }
}
function scanContent(content, url) {
  return [];
}
async function scanContentWithKingfisher(content, url) {
  const results = [];
  if (!content) {
    return results;
  }
  try {
    const { rules, scanWithKingfisherRules: scanWithKingfisherRules2 } = await loadKingfisherRules2();
    if (!rules || rules.length === 0 || !scanWithKingfisherRules2) {
      return results;
    }
    const kingfisherResults = scanWithKingfisherRules2(content, rules, {
      getEntropy,
      checkPatternRequirements: true
    });
    for (const result of kingfisherResults) {
      const contextStart = Math.max(0, result.index - 100);
      const contextEnd = Math.min(content.length, result.index + result.match.length + 100);
      const context = content.substring(contextStart, contextEnd);
      let isFalsePositive = false;
      for (const fpPattern of KNOWN_FALSE_POSITIVE_PATTERNS) {
        if (fpPattern.test(result.match)) {
          isFalsePositive = true;
          break;
        }
      }
      if (isFalsePositive) continue;
      let skipDueToContext = false;
      for (const contextPattern of FALSE_POSITIVE_CONTEXT_PATTERNS) {
        if (contextPattern.test(context)) {
          skipDueToContext = true;
          break;
        }
      }
      if (skipDueToContext) continue;
      if (isLikelyBase64Data(result.match, context)) continue;
      const lineStart = content.lastIndexOf("\n", result.index) + 1;
      const lineEnd = content.indexOf("\n", result.index);
      const line = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);
      if (isInComment(line)) continue;
      let confidence = 50;
      if (result.confidence === "high") confidence = 85;
      else if (result.confidence === "medium") confidence = 70;
      else confidence = 60;
      if (result.entropy) {
        const entropy = parseFloat(result.entropy);
        if (entropy > 4.5) confidence += 10;
        else if (entropy < 3.5) confidence -= 10;
      }
      if (confidence < 60) continue;
      const typeName = result.ruleName || result.ruleId || "Unknown Secret";
      results.push({
        file: url,
        type: typeName,
        match: result.match,
        index: result.index,
        confidence: Math.min(100, confidence),
        entropy: result.entropy || "0.00",
        ruleName: result.ruleName,
        ruleId: result.ruleId
      });
    }
  } catch (e) {
    console.warn("Error scanning with Kingfisher rules:", e);
  }
  return results;
}
async function scanForSecrets(requests, onProgress, onSecretFound) {
  const results = [];
  const seenSecrets = /* @__PURE__ */ new Set();
  let processed = 0;
  const total = requests.length;
  for (const req of requests) {
    try {
      if (!req || !req.request || !req.response) {
        processed++;
        if (onProgress) onProgress(processed, total);
        continue;
      }
      const url = req.request.url.toLowerCase();
      const mime = req.response?.content?.mimeType?.toLowerCase() || "";
      const isJS = url.endsWith(".js") || mime.includes("javascript") || mime.includes("ecmascript") || mime.includes("application/javascript");
      if (isJS) {
        try {
          let content = null;
          if (req.responseBody !== void 0) {
            content = req.responseBody || "";
          } else if (typeof req.getContent === "function") {
            content = await new Promise((resolve, reject) => {
              req.getContent((body, encoding) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(body || "");
                }
              });
            });
          } else {
            processed++;
            if (onProgress) onProgress(processed, total);
            continue;
          }
          if (content) {
            try {
              const kingfisherSecrets = await scanContentWithKingfisher(content, req.request.url);
              for (const secret of kingfisherSecrets) {
                const key = `${secret.type}:${secret.match}`;
                if (!seenSecrets.has(key)) {
                  seenSecrets.add(key);
                  results.push(secret);
                  if (onSecretFound) {
                    onSecretFound(secret);
                  }
                }
              }
            } catch (e) {
              console.warn("Error scanning with Kingfisher:", e);
            }
          }
        } catch (err) {
          console.error(`Error scanning request ${url}:`, err);
        }
      }
    } catch (err) {
      console.error("Error processing request:", err);
    }
    processed++;
    if (onProgress) onProgress(processed, total);
  }
  return results;
}
export {
  scanContent,
  scanContentWithKingfisher,
  scanForSecrets
};

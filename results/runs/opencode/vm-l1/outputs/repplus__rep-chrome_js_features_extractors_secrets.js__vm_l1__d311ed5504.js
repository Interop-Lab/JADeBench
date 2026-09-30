/**
 * Secret scanning helpers with optional Kingfisher-compatible rules.
 *
 * The original bundle exposed its helpers on globalThis in addition to the
 * three module exports. That compatibility surface is retained below.
 */

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
  /(?:"|')(?:key|data|content|image|icon|font|logo|avatar|thumbnail|media|src|href)(?:"|')\s*:/i,
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

let kingfisherRulesCache = null;

function getEntropy(value) {
  if (!value) return 0;
  const frequencies = new Map();
  for (const character of value) {
    frequencies.set(character, (frequencies.get(character) || 0) + 1);
  }
  let entropy = 0;
  for (const count of frequencies.values()) {
    const probability = count / value.length;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}

function isLikelyBase64Data(value, minimumLength = 40) {
  if (typeof value !== "string" || value.length < minimumLength) return false;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length % 4 !== 0) return false;
  return /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
}

function isInComment(context) {
  if (typeof context !== "string") return false;
  const trimmed = context.trimStart();
  return trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*") || trimmed.startsWith("#");
}

function normalizeSourceFile(sourceFile) {
  if (typeof sourceFile === "string") return sourceFile;
  if (sourceFile == null) return "";
  if (typeof sourceFile.text === "function") return sourceFile.text();
  if (typeof sourceFile.content === "string") return sourceFile.content;
  if (typeof sourceFile.source === "string") return sourceFile.source;
  return String(sourceFile);
}

function deduplicateResults(results) {
  const seen = new Set();
  return results.filter((result) => {
    const key = JSON.stringify(result);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function validateParentheses(pattern) {
  let depth = 0;
  let openingPosition = -1;
  let inCharacterClass = false;
  let escaped = false;

  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      continue;
    }
    if (character === "[") inCharacterClass = true;
    else if (character === "]") inCharacterClass = false;
    else if (!inCharacterClass && character === "(") {
      if (depth === 0) openingPosition = index;
      depth += 1;
    } else if (!inCharacterClass && character === ")") {
      depth -= 1;
      if (depth < 0) {
        return { valid: false, error: `Unmatched closing parenthesis at position ${index}` };
      }
    }
  }

  if (depth !== 0) {
    return {
      valid: false,
      error: `Unmatched opening parenthesis (depth: ${depth}) at position ${openingPosition}`,
    };
  }
  return { valid: true };
}

function stripComments(pattern) {
  let escaped = false;
  let inCharacterClass = false;
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (escaped) escaped = false;
    else if (character === "\\") escaped = true;
    else if (character === "[") inCharacterClass = true;
    else if (character === "]") inCharacterClass = false;
    else if (character === "#" && !inCharacterClass) return pattern.slice(0, index).trim();
  }
  return pattern.trim();
}

function convertNamedGroups(pattern) {
  return pattern.replace(/\(\?P<([A-Za-z_]\w*)>/g, "(?<$1>");
}

function convertInlineFlagGroups(pattern, supportedFlags = "gimsuy") {
  let additionalFlags = "";
  const convertedPattern = pattern.replace(/\(\?([ims]+)(?:-([ims]+))?:/g, (_, enabled, disabled = "") => {
    for (const flag of enabled) {
      if (supportedFlags.includes(flag) && !additionalFlags.includes(flag)) additionalFlags += flag;
    }
    for (const flag of disabled) additionalFlags = additionalFlags.replace(flag, "");
    return "(?:";
  });
  return { pattern: convertedPattern, flags: additionalFlags };
}

function convertPatternFlags(pattern) {
  let flags = "g";
  const convertedPattern = pattern.replace(/^\(\?([ims]+)\)/, (_, inlineFlags) => {
    for (const flag of inlineFlags) if (!flags.includes(flag)) flags += flag;
    return "";
  });
  return { pattern: convertedPattern, flags };
}

function stripWhitespaceInExtendedMode(pattern) {
  let result = "";
  let escaped = false;
  let inCharacterClass = false;
  for (const character of pattern) {
    if (escaped) {
      result += character;
      escaped = false;
    } else if (character === "\\") {
      result += character;
      escaped = true;
    } else if (character === "[") {
      inCharacterClass = true;
      result += character;
    } else if (character === "]") {
      inCharacterClass = false;
      result += character;
    } else if (inCharacterClass || !/\s/.test(character)) {
      result += character;
    }
  }
  return result;
}

function validatePatternRequirements(value, requirements = {}) {
  if (requirements.min_entropy != null && getEntropy(value) < requirements.min_entropy) {
    return { passed: false, reason: "Entropy is below the required minimum" };
  }
  if (requirements.min_length != null && value.length < requirements.min_length) {
    return { passed: false, reason: "Match is shorter than the required minimum" };
  }
  if (requirements.max_length != null && value.length > requirements.max_length) {
    return { passed: false, reason: "Match is longer than the allowed maximum" };
  }
  return { passed: true };
}

function prepareRule(rule) {
  if (!rule || typeof rule !== "object" || typeof rule.pattern !== "string") return null;
  let cleanedPattern = stripComments(convertNamedGroups(rule.pattern));
  const flagConversion = convertPatternFlags(cleanedPattern);
  cleanedPattern = flagConversion.pattern;
  const groupConversion = convertInlineFlagGroups(cleanedPattern, "gimsuy");
  cleanedPattern = groupConversion.pattern;
  const flags = [...new Set(`${flagConversion.flags}${groupConversion.flags}`)].join("");
  const validation = validateParentheses(cleanedPattern);
  if (!validation.valid) return null;
  try {
    return { ...rule, compiledRegex: new RegExp(cleanedPattern, flags), cleanedPattern };
  } catch {
    return null;
  }
}

async function loadKingfisherRulesFromJSON(input) {
  const parsed = typeof input === "string" ? JSON.parse(input) : input;
  const rules = Array.isArray(parsed) ? parsed : parsed?.rules || [];
  return rules.map(prepareRule).filter(Boolean);
}

function parseYamlScalar(value) {
  const trimmed = value.trim();
  if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === "true";
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseYamlRulesFallback(yaml) {
  const rules = [];
  let current = null;
  for (const rawLine of String(yaml).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line === "rules:") continue;
    const item = line.match(/^-\s*(?:(\w+)\s*:\s*(.*))?$/);
    if (item) {
      if (current) rules.push(current);
      current = {};
      if (item[1]) current[item[1]] = parseYamlScalar(item[2]);
      continue;
    }
    const property = line.match(/^(\w+)\s*:\s*(.*)$/);
    if (current && property) current[property[1]] = parseYamlScalar(property[2]);
  }
  if (current) rules.push(current);
  return { rules };
}

async function loadKingfisherRules(input) {
  if (Array.isArray(input) || (input && typeof input === "object")) {
    return loadKingfisherRulesFromJSON(input);
  }
  if (typeof input !== "string") return [];
  try {
    return await loadKingfisherRulesFromJSON(input);
  } catch {
    return loadKingfisherRulesFromJSON(parseYamlRulesFallback(input));
  }
}

async function loadKingfisherRulesFromURL(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load Kingfisher rules: ${response.status}`);
  return loadKingfisherRules(await response.text());
}

async function loadKingfisherRulesFromURLs(urls) {
  const ruleSets = await Promise.all(urls.map(loadKingfisherRulesFromURL));
  return ruleSets.flat();
}

async function loadKingfisherRulesFromFile(file) {
  return loadKingfisherRules(await normalizeSourceFile(file));
}

const loadKingfisherRulesFromLocalFile = loadKingfisherRulesFromFile;

async function loadKingfisherRulesFromLocalFiles(files) {
  const ruleSets = await Promise.all(files.map(loadKingfisherRulesFromLocalFile));
  return ruleSets.flat();
}

async function loadAllKingfisherRulesFromLocal() {
  return kingfisherRulesCache || [];
}

async function loadKingfisherRules2() {
  if (!kingfisherRulesCache) kingfisherRulesCache = await loadAllKingfisherRulesFromLocal();
  return kingfisherRulesCache;
}

function matchIsFalsePositive(match, context) {
  return (
    KNOWN_FALSE_POSITIVE_PATTERNS.some((pattern) => pattern.test(match)) ||
    FALSE_POSITIVE_CONTEXT_PATTERNS.some((pattern) => pattern.test(context)) ||
    isLikelyBase64Data(match)
  );
}

function scanWithKingfisherRules(content, rules = []) {
  if (typeof content !== "string") return [];
  const results = [];
  for (const sourceRule of rules) {
    const rule = sourceRule.compiledRegex ? sourceRule : prepareRule(sourceRule);
    if (!rule) continue;
    rule.compiledRegex.lastIndex = 0;
    let match;
    while ((match = rule.compiledRegex.exec(content))) {
      const secret = match.groups?.secret ?? match[1] ?? match[0];
      const index = match.index + match[0].indexOf(secret);
      const context = content.slice(Math.max(0, index - 100), Math.min(content.length, index + secret.length + 100));
      const requirements = validatePatternRequirements(secret, rule);
      if (requirements.passed && !matchIsFalsePositive(secret, context)) {
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          match: secret,
          index,
          confidence: rule.confidence || "medium",
          entropy: rule.min_entropy == null ? null : getEntropy(secret),
          context,
          validation: rule.validation || null,
        });
      }
      if (match[0] === "") rule.compiledRegex.lastIndex += 1;
    }
  }
  return deduplicateResults(results);
}

async function scanContentWithKingfisher(content, options = {}) {
  const rules = options?.rules || (await loadKingfisherRules2());
  return scanWithKingfisherRules(await normalizeSourceFile(content), rules);
}

async function scanContent(content, options = {}) {
  return scanContentWithKingfisher(content, options);
}

async function scanForSecrets(sourceFiles, scanner = scanContent, options = {}) {
  const files = Array.isArray(sourceFiles) ? sourceFiles : [sourceFiles];
  const results = [];
  for (const sourceFile of files) {
    const content = await normalizeSourceFile(sourceFile);
    const fileResults = await scanner(content, options);
    if (!Array.isArray(fileResults)) continue;
    const source = sourceFile && typeof sourceFile === "object"
      ? sourceFile.path || sourceFile.name || sourceFile.file
      : undefined;
    for (const result of fileResults || []) results.push(source ? { ...result, source } : result);
  }
  return deduplicateResults(results);
}

Object.assign(globalThis, {
  KNOWN_FALSE_POSITIVE_PATTERNS,
  FALSE_POSITIVE_CONTEXT_PATTERNS,
  validateParentheses,
  stripComments,
  convertNamedGroups,
  convertInlineFlagGroups,
  convertPatternFlags,
  stripWhitespaceInExtendedMode,
  validatePatternRequirements,
  loadKingfisherRules,
  parseYamlRulesFallback,
  loadKingfisherRulesFromJSON,
  loadKingfisherRulesFromFile,
  loadKingfisherRulesFromLocalFile,
  loadKingfisherRulesFromLocalFiles,
  loadAllKingfisherRulesFromLocal,
  loadKingfisherRulesFromURL,
  loadKingfisherRulesFromURLs,
  scanWithKingfisherRules,
  getEntropy,
  isLikelyBase64Data,
  isInComment,
  normalizeSourceFile,
  deduplicateResults,
  loadKingfisherRules2,
  scanContent,
  scanContentWithKingfisher,
  scanForSecrets,
});

export { scanContent, scanContentWithKingfisher, scanForSecrets };

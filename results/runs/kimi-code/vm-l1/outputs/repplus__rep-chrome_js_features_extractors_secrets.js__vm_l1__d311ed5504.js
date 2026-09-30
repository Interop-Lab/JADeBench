const RULE_FILES = [
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
  "square.yaml",
];

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

let kingfisherRulesCache = null;

function validateParentheses(pattern) {
  let depth = 0;
  let escaped = false;
  let inCharacterClass = false;
  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index];
    if (escaped) {
      escaped = false;
    } else if (character === "\\") {
      escaped = true;
    } else if (character === "[") {
      inCharacterClass = true;
    } else if (character === "]") {
      inCharacterClass = false;
    } else if (!inCharacterClass && character === "(") {
      depth++;
    } else if (!inCharacterClass && character === ")" && --depth < 0) {
      return { valid: false, error: `Unmatched closing parenthesis at position ${index}` };
    }
  }
  return depth === 0
    ? { valid: true }
    : { valid: false, error: `Unmatched opening parenthesis (depth: ${depth})` };
}

function stripComments(pattern) {
  return pattern
    .split("\n")
    .map((line) => {
      let escaped = false;
      let inCharacterClass = false;
      for (let index = 0; index < line.length; index++) {
        const character = line[index];
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === "[") inCharacterClass = true;
        else if (character === "]") inCharacterClass = false;
        else if (character === "#" && !inCharacterClass) return line.slice(0, index);
      }
      return line;
    })
    .join("\n");
}

function convertNamedGroups(pattern) {
  return pattern.replace(/\(\?P<([A-Za-z_]\w*)>/g, "(?<$1>").replace(/\(\?P=([A-Za-z_]\w*)\)/g, "\\k<$1>");
}

function convertInlineFlagGroups(pattern, flags = new Set()) {
  const activeFlags = flags instanceof Set ? flags : new Set(flags);
  let converted = pattern.replace(/\(\?([ims]+)\)/g, (_, groupFlags) => {
    for (const flag of groupFlags) activeFlags.add(flag);
    return "";
  });
  converted = converted.replace(/\(\?([ims]+):/g, (_, groupFlags) => {
    for (const flag of groupFlags) activeFlags.add(flag);
    return "(?:";
  });
  return { pattern: converted, flags: activeFlags };
}

function convertPatternFlags(pattern) {
  const flags = new Set(["g"]);
  const converted = convertInlineFlagGroups(pattern, flags);
  return { pattern: converted.pattern, flags: [...converted.flags].sort().join("") };
}

function stripWhitespaceInExtendedMode(pattern) {
  let result = "";
  let escaped = false;
  let inCharacterClass = false;
  let inComment = false;
  for (const character of pattern) {
    if (inComment) {
      if (character === "\n") inComment = false;
      continue;
    }
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
    } else if (character === "#" && !inCharacterClass) {
      inComment = true;
    } else if (!inCharacterClass && /\s/.test(character)) {
      continue;
    } else {
      result += character;
    }
  }
  return result;
}

function validatePatternRequirements(match, rule) {
  const requirements = rule?.examples || rule?.keywords || rule?.requires || [];
  const required = Array.isArray(requirements) ? requirements : [requirements];
  const passed = required.length === 0 || required.some((value) => match.includes(value));
  return passed ? { passed: true } : { passed: false, reason: "Pattern requirements not met" };
}

function normalizeRule(rawRule) {
  if (!rawRule || typeof rawRule !== "object" || !rawRule.pattern) return null;
  try {
    let pattern = convertNamedGroups(String(rawRule.pattern));
    const converted = convertPatternFlags(pattern);
    pattern = rawRule.extended ? stripWhitespaceInExtendedMode(converted.pattern) : converted.pattern;
    const validation = validateParentheses(pattern);
    if (!validation.valid) return null;
    return {
      ...rawRule,
      cleanedPattern: pattern,
      compiledRegex: new RegExp(pattern, converted.flags),
    };
  } catch {
    return null;
  }
}

function loadKingfisherRulesFromJSON(input) {
  try {
    const parsed = typeof input === "string" ? JSON.parse(input) : input;
    const rules = Array.isArray(parsed) ? parsed : parsed?.rules || [];
    return rules.map(normalizeRule).filter(Boolean);
  } catch (error) {
    console.error("Failed to load JSON rules:", error);
    return [];
  }
}

function parseScalar(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed.slice(1, -1).split(",").map(parseScalar);
  }
  return trimmed;
}

function parseYamlRulesFallback(yaml) {
  const rules = [];
  let current = null;
  for (const originalLine of String(yaml).split(/\r?\n/)) {
    const line = originalLine.replace(/\s+#.*$/, "");
    const item = line.match(/^\s*-\s*(.*)$/);
    if (item) {
      if (current) rules.push(current);
      current = {};
      if (!item[1]) continue;
      const firstField = item[1].match(/^([\w-]+):\s*(.*)$/);
      if (firstField) current[firstField[1]] = parseScalar(firstField[2]);
      continue;
    }
    const field = line.match(/^\s+([\w-]+):\s*(.*)$/);
    if (field && current) current[field[1]] = parseScalar(field[2]);
  }
  if (current) rules.push(current);
  return { rules };
}

function loadKingfisherRules(yaml) {
  try {
    return loadKingfisherRulesFromJSON(parseYamlRulesFallback(yaml));
  } catch (error) {
    console.error("Failed to parse YAML rules:", error);
    return [];
  }
}

async function loadKingfisherRulesFromFile(path) {
  try {
    const url = globalThis.chrome?.runtime?.getURL ? globalThis.chrome.runtime.getURL(path) : path;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const content = await response.text();
    return path.endsWith(".json") ? loadKingfisherRulesFromJSON(content) : loadKingfisherRules(content);
  } catch (error) {
    console.error(`Failed to load rules from ${path}:`, error);
    return [];
  }
}

async function loadKingfisherRulesFromLocalFile(fileName) {
  try {
    return await loadKingfisherRulesFromFile(`kingfisher-rules/${fileName}`);
  } catch (error) {
    console.error(`Failed to load Kingfisher rules from ${fileName}:`, error);
    return [];
  }
}

async function loadKingfisherRulesFromLocalFiles(fileNames) {
  return (await Promise.all(fileNames.map(loadKingfisherRulesFromLocalFile))).flat();
}

async function loadAllKingfisherRulesFromLocal() {
  return loadKingfisherRulesFromLocalFiles(RULE_FILES);
}

async function loadKingfisherRulesFromURL(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const content = await response.text();
    return url.endsWith(".json") ? loadKingfisherRulesFromJSON(content) : loadKingfisherRules(content);
  } catch (error) {
    console.error(`Failed to load Kingfisher rules from ${url}:`, error);
    return [];
  }
}

async function loadKingfisherRulesFromURLs(urls) {
  return (await Promise.all(urls.map(loadKingfisherRulesFromURL))).flat();
}

function getEntropy(value) {
  if (!value) return 0;
  const frequencies = new Map();
  for (const character of value) frequencies.set(character, (frequencies.get(character) || 0) + 1);
  let entropy = 0;
  for (const count of frequencies.values()) {
    const probability = count / value.length;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}

function isLikelyBase64Data(value, context = "") {
  if (!value || value.length < 32 || value.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return false;
  return FALSE_POSITIVE_CONTEXT_PATTERNS.some((pattern) => pattern.test(context));
}

function isInComment(context) {
  const trimmed = context.trimStart();
  return trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*") || trimmed.startsWith("#");
}

function normalizeSourceFile(sourceFile) {
  if (typeof sourceFile !== "string") return sourceFile;
  return sourceFile.replace(/^webpack:\/\//, "").replace(/[?#].*$/, "");
}

function deduplicateResults(results) {
  const seen = new Set();
  return results.filter((result) => {
    const key = `${result.ruleId || result.ruleName || ""}:${result.index}:${result.match}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function scanWithKingfisherRules(content, rules) {
  const findings = [];
  for (const rule of rules || []) {
    const regex = rule.compiledRegex || normalizeRule(rule)?.compiledRegex;
    if (!regex) continue;
    regex.lastIndex = 0;
    for (let match = regex.exec(content); match; match = regex.exec(content)) {
      const value = match[1] || match[0];
      const index = match.index + match[0].indexOf(value);
      const context = content.slice(Math.max(0, index - 100), Math.min(content.length, index + value.length + 100));
      const entropy = rule.min_entropy == null && rule.minEntropy == null ? null : getEntropy(value);
      const minimumEntropy = rule.min_entropy ?? rule.minEntropy;
      const requirements = validatePatternRequirements(context, rule);
      if (KNOWN_FALSE_POSITIVE_PATTERNS.some((pattern) => pattern.test(value))) continue;
      if (isLikelyBase64Data(value, context) || isInComment(context) || !requirements.passed) continue;
      if (minimumEntropy != null && entropy < minimumEntropy) continue;
      findings.push({
        ...(rule.id == null ? {} : { ruleId: rule.id }),
        ...(rule.name == null ? {} : { ruleName: rule.name }),
        match: value,
        index,
        confidence: rule.confidence || "medium",
        entropy,
        context,
        validation: requirements.reason || null,
      });
      if (match[0] === "") regex.lastIndex++;
    }
  }
  return findings;
}

async function loadKingfisherRules2() {
  if (!kingfisherRulesCache) kingfisherRulesCache = loadAllKingfisherRulesFromLocal();
  return kingfisherRulesCache;
}

function scanContent(content, options = {}) {
  const rules = Array.isArray(options) ? options : options.rules || [];
  return deduplicateResults(scanWithKingfisherRules(String(content ?? ""), rules)).map((result) => ({
    ...result,
    ...(typeof options === "object" && options.sourceFile
      ? { sourceFile: normalizeSourceFile(options.sourceFile) }
      : {}),
  }));
}

async function scanContentWithKingfisher(content, options = {}) {
  const rules = Array.isArray(options) ? options : options.rules || (await loadKingfisherRules2());
  return scanContent(content, { ...options, rules });
}

async function scanForSecrets(content, onProgress, options = {}) {
  try {
    if (typeof onProgress === "function") onProgress(1);
    const standardResults = scanContent(content, options);
    if (typeof onProgress === "function") onProgress(2);
    const kingfisherResults = await scanContentWithKingfisher(content, options);
    if (typeof onProgress === "function") onProgress(3);
    return deduplicateResults([...standardResults, ...kingfisherResults]);
  } catch (error) {
    console.error("Error processing request:", error);
    throw error;
  }
}

export { scanContent, scanContentWithKingfisher, scanForSecrets };

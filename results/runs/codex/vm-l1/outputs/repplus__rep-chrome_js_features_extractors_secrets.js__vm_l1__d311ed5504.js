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

const DEFAULT_RULE_FILES = [
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

function validateParentheses(pattern) {
  const openingPositions = [];
  let escaped = false;
  let inCharacterClass = false;

  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === "\\") {
      escaped = true;
    } else if (character === "[") {
      inCharacterClass = true;
    } else if (character === "]") {
      inCharacterClass = false;
    } else if (!inCharacterClass && character === "(") {
      openingPositions.push(index);
    } else if (!inCharacterClass && character === ")") {
      if (openingPositions.length === 0) {
        return { valid: false, error: `Unmatched closing parenthesis at position ${index}` };
      }
      openingPositions.pop();
    }
  }

  if (openingPositions.length > 0) {
    const position = openingPositions[openingPositions.length - 1];
    return {
      valid: false,
      error: `Unmatched opening parenthesis (depth: ${openingPositions.length}) at position ${position}`,
    };
  }
  return { valid: true };
}

function stripComments(pattern) {
  return pattern
    .replace(/\(\?#[^)]*\)/g, "")
    .split("\n")
    .map((line) => line.replace(/\s#[\s\w]*$/, ""))
    .join("\n");
}

function convertNamedGroups(pattern) {
  return pattern.replace(/\(\?P<([^>]+)>/g, "(?<$1>");
}

function convertInlineFlagGroups(pattern, flags) {
  const replacements = [];
  const groupPattern = /\(\?([-]?[imsux]+):/g;
  let match;
  while ((match = groupPattern.exec(pattern)) !== null) {
    const disabled = match[1].startsWith("-");
    const groupFlags = disabled ? match[1].slice(1) : match[1];
    if (!disabled) {
      if (groupFlags.includes("i") && !flags.includes("i")) flags += "i";
      if (groupFlags.includes("s") && !flags.includes("s")) flags += "s";
    }
    replacements.push({ start: match.index, end: match.index + match[0].length, replacement: "(" });
  }
  replacements.reverse().forEach(({ start, end, replacement }) => {
    pattern = pattern.substring(0, start) + replacement + pattern.substring(end);
  });
  return { pattern, flags };
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
    } else if (inCharacterClass || !/[\s\n\r\t]/.test(character)) {
      result += character;
    }
  }
  return result;
}

function convertPatternFlags(rule) {
  let pattern = String(rule.pattern ?? "");
  let flags = rule.flags ?? "g";
  const leadingFlags = pattern.match(/^\(\?([imsux]+)\)/);
  if (leadingFlags) {
    pattern = pattern.replace(/^\(\?[imsux]+\)/, "");
    for (const flag of leadingFlags[1]) {
      if ("ims".includes(flag) && !flags.includes(flag)) flags += flag;
    }
    if (leadingFlags[1].includes("x")) pattern = stripWhitespaceInExtendedMode(pattern);
  }
  if (!flags.includes("g")) flags += "g";
  pattern = stripComments(convertNamedGroups(pattern));
  return convertInlineFlagGroups(pattern, flags);
}

function validatePatternRequirements(value, requirements = {}) {
  const result = { passed: true };
  const checks = [
    ["min_digits", /\d/g, "digits"],
    ["min_uppercase", /[A-Z]/g, "uppercase letters"],
    ["min_lowercase", /[a-z]/g, "lowercase letters"],
  ];
  for (const [property, expression, label] of checks) {
    if (requirements[property] == null) continue;
    const count = (value.match(expression) || []).length;
    if (count < requirements[property]) {
      return { passed: false, reason: `Requires at least ${requirements[property]} ${label}, found ${count}` };
    }
  }
  if (requirements.min_special_chars != null) {
    const specialCharacters = requirements.special_chars ?? "!@#$%^&*()_+-=[]{}|;:'\",.<>?/\\`~";
    const escaped = specialCharacters.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const count = (value.match(new RegExp(`[${escaped}]`, "g")) || []).length;
    if (count < requirements.min_special_chars) {
      return { passed: false, reason: `Requires at least ${requirements.min_special_chars} special characters, found ${count}` };
    }
  }
  for (const ignoredTerm of requirements.ignore_if_contains ?? []) {
    if (value.toLowerCase().includes(String(ignoredTerm).trim().toLowerCase())) {
      return { passed: false, reason: `Contains ignored term: ${ignoredTerm}`, ignored: true };
    }
  }
  return result;
}

function compileRule(rule) {
  try {
    const { pattern, flags } = convertPatternFlags(rule);
    const validation = validateParentheses(pattern);
    if (!validation.valid) throw new Error(validation.error);
    return { ...rule, compiledRegex: new RegExp(pattern, flags) };
  } catch (error) {
    console.warn(`Unable to compile Kingfisher rule ${rule.name ?? rule.id ?? "unknown"}:`, error);
    return null;
  }
}

function normalizeRules(document) {
  const rules = Array.isArray(document) ? document : document?.rules;
  if (!Array.isArray(rules)) throw new Error("Rules document must contain a rules array");
  return rules.map(compileRule).filter(Boolean);
}

function parseYamlRulesFallback(yaml) {
  console.warn("Using fallback YAML parser - consider bundling js-yaml for better support");
  const rules = [];
  let currentRule = null;
  let readingPattern = false;

  for (const rawLine of yaml.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith("- name:")) {
      if (currentRule) rules.push(currentRule);
      currentRule = { name: line.replace(/^- name:\s*/, "").replace(/^["']|["']$/g, "") };
      readingPattern = false;
    } else if (!currentRule) {
      continue;
    } else if (line.startsWith("id:")) {
      currentRule.id = line.replace(/^id:\s*/, "").replace(/^["']|["']$/g, "");
    } else if (line.startsWith("pattern:")) {
      currentRule.pattern = line
        .replace(/^pattern:\s*\|?\s*/, "")
        .replace(/^["']|["']$/g, "");
      readingPattern = true;
    } else if (line.startsWith("min_entropy:")) {
      currentRule.min_entropy = Number.parseFloat(line.replace(/^min_entropy:\s*/, ""));
      readingPattern = false;
    } else if (line.startsWith("pattern_requirements:")) {
      currentRule.pattern_requirements = {};
      readingPattern = false;
    } else if (line.startsWith("min_digits:")) {
      currentRule.pattern_requirements ??= {};
      currentRule.pattern_requirements.min_digits = Number.parseInt(line.replace(/^min_digits:\s*/, ""), 10);
    } else if (readingPattern && !/^[a-z_]+:/.test(line)) {
      currentRule.pattern = `${currentRule.pattern} ${line}`.trim();
    }
  }
  if (currentRule) rules.push(currentRule);
  return { rules };
}

function loadKingfisherRules(source) {
  try {
    let document;
    if (typeof window !== "undefined" && window.jsyaml?.load) document = window.jsyaml.load(source);
    else document = parseYamlRulesFallback(source);
    return normalizeRules(document);
  } catch (error) {
    console.error("Failed to parse YAML rules:", error);
    return [];
  }
}

function loadKingfisherRulesFromJSON(source) {
  try {
    return normalizeRules(typeof source === "string" ? JSON.parse(source) : source);
  } catch (error) {
    console.error("Failed to load JSON rules:", error);
    return [];
  }
}

async function loadKingfisherRulesFromFile(path) {
  try {
    const url = globalThis.chrome?.runtime?.getURL ? chrome.runtime.getURL(path) : path;
    const response = await fetch(url);
    return loadKingfisherRulesFromJSON(await response.json());
  } catch (error) {
    console.error(`Failed to load rules from ${path}:`, error);
    return [];
  }
}

async function loadKingfisherRulesFromLocalFile(fileName) {
  try {
    const path = `rules/${fileName}`;
    const url = globalThis.chrome?.runtime?.getURL ? chrome.runtime.getURL(path) : path;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return loadKingfisherRules(await response.text());
  } catch (error) {
    console.error(`Failed to load Kingfisher rules from ${fileName}:`, error);
    return [];
  }
}

async function loadKingfisherRulesFromLocalFiles(files) {
  const rules = [];
  for (const file of files) {
    try {
      rules.push(...(await loadKingfisherRulesFromLocalFile(file)));
    } catch (error) {
      console.warn(`Failed to load rules from ${file}:`, error);
    }
  }
  return rules;
}

async function loadAllKingfisherRulesFromLocal() {
  try {
    const manifestUrl = globalThis.chrome?.runtime?.getURL
      ? chrome.runtime.getURL("rules/_manifest.json")
      : "rules/_manifest.json";
    const response = await fetch(manifestUrl);
    if (response.ok) {
      const manifest = await response.json();
      if (Array.isArray(manifest.files)) return loadKingfisherRulesFromLocalFiles(manifest.files);
    }
  } catch {}
  return loadKingfisherRulesFromLocalFiles(DEFAULT_RULE_FILES);
}

async function loadKingfisherRulesFromURL(url) {
  try {
    const response = await fetch(url);
    return loadKingfisherRules(await response.text());
  } catch (error) {
    console.error("Failed to load Kingfisher rules from URL:", error);
    return [];
  }
}

async function loadKingfisherRulesFromURLs(urls) {
  const rules = [];
  for (const url of urls) {
    try {
      rules.push(...(await loadKingfisherRulesFromURL(url)));
    } catch (error) {
      console.warn(`Failed to load rules from ${url}:`, error);
    }
  }
  return rules;
}

function getEntropy(value) {
  if (!value.length) return 0;
  const frequencies = new Map();
  for (const character of value) frequencies.set(character, (frequencies.get(character) ?? 0) + 1);
  let entropy = 0;
  for (const count of frequencies.values()) {
    const probability = count / value.length;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}

function isLikelyBase64Data(value, context = "") {
  const cleaned = value.replace(/data:[\w/-]+;base64,/, "");
  if (!/^[A-Za-z0-9+/=]+$/.test(cleaned) || !/={1,2}$/.test(cleaned)) return false;
  if (cleaned.length < 100 || cleaned.length > 200) return false;
  const nearby = context.substring(Math.max(0, context.length - 200));
  return /"(?:data|content|image|icon|font|media|src|href|asset|resource)"\s*:\s*"[^"]*$/i.test(nearby)
    || /(?:const|let|var)\s+(?:data|image|icon|font|asset|resource|content)\w*\s*=\s*["`'][^"`']*$/.test(nearby);
}

function isInComment(line) {
  const trimmed = line.trim();
  return /^\s*\/\//.test(trimmed) || /^\s*\*/.test(trimmed) || /^\s*\/\*/.test(trimmed);
}

function normalizeSourceFile(sourceFile) {
  try {
    const url = new URL(sourceFile);
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return String(sourceFile ?? "").split("?")[0].split("#")[0];
  }
}

function scanWithKingfisherRules(content, rules) {
  const results = [];
  for (const rule of rules) {
    try {
      const expression = rule.compiledRegex;
      expression.lastIndex = 0;
      let match;
      while ((match = expression.exec(content)) !== null) {
        const value = match[1] ?? match[0];
        const index = match.index + Math.max(0, match[0].indexOf(value));
        const entropy = getEntropy(value);
        if (rule.min_entropy != null && entropy < rule.min_entropy) continue;
        const validation = validatePatternRequirements(value, rule.pattern_requirements);
        if (!validation.passed) {
          if (match[0].length === 0) expression.lastIndex += 1;
          continue;
        }
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          match: value,
          index,
          confidence: "medium",
          entropy: entropy.toFixed(2),
          context: content.substring(Math.max(0, index - 100), Math.min(content.length, index + value.length + 100)),
          validation,
        });
        if (match[0].length === 0) expression.lastIndex += 1;
      }
    } catch (error) {
      console.warn(`Error scanning with rule ${rule.name ?? rule.id}:`, error);
    }
  }
  return results;
}

function deduplicateResults(results) {
  const seen = new Set();
  return results.filter((result) => {
    const key = `${result.ruleId}:${result.index}:${result.match}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

let kingfisherRulesCache = null;

function loadKingfisherRules2() {
  if (!kingfisherRulesCache) kingfisherRulesCache = loadAllKingfisherRulesFromLocal();
  return Promise.resolve(kingfisherRulesCache);
}

function scanContent() {}

async function scanContentWithKingfisher(content, sourceFile = "") {
  try {
    const rules = await loadKingfisherRules2();
    const results = scanWithKingfisherRules(content, rules);
    const normalizedFile = normalizeSourceFile(sourceFile);
    const filtered = results.filter((result) => {
      const context = result.context ?? "";
      const lineStart = content.lastIndexOf("\n", result.index) + 1;
      const lineEnd = content.indexOf("\n", result.index);
      const line = content.substring(lineStart, lineEnd < 0 ? content.length : lineEnd);
      if (KNOWN_FALSE_POSITIVE_PATTERNS.some((pattern) => pattern.test(result.match))) return false;
      if (FALSE_POSITIVE_CONTEXT_PATTERNS.some((pattern) => pattern.test(context))) return false;
      if (isLikelyBase64Data(result.match, content.substring(0, result.index))) return false;
      if (isInComment(line)) return false;
      return true;
    }).map((result) => {
      const entropy = Number.parseFloat(result.entropy);
      let confidence = entropy >= 4.5 ? "high" : entropy >= 3.5 ? "medium" : "low";
      if (result.match.length < 10) confidence = "low";
      return { ...result, file: normalizedFile, type: result.ruleName ?? result.ruleId ?? "Unknown Secret", confidence };
    });
    return deduplicateResults(filtered);
  } catch (error) {
    console.warn("Error scanning with Kingfisher rules:", error);
    return [];
  }
}

async function scanForSecrets(entries, request, response) {
  const results = [];
  const items = Array.isArray(entries) ? entries : [entries];
  for (const item of items) {
    try {
      const candidate = item?.response ?? response ?? item;
      const url = item?.request?.url ?? request?.url ?? item?.url ?? "";
      const mimeType = String(candidate?.mimeType ?? "").toLowerCase();
      if (!(url.toLowerCase().endsWith(".js") || mimeType.includes("javascript") || mimeType.includes("ecmascript") || mimeType.includes("application/javascript"))) continue;
      let content = candidate?.content ?? candidate?.responseBody ?? "";
      if (typeof candidate?.getContent === "function") {
        content = candidate.getContent.length > 0
          ? await new Promise((resolve) => candidate.getContent(resolve))
          : await candidate.getContent();
      }
      const matches = await scanContentWithKingfisher(String(content), url);
      results.push(...matches);
    } catch (error) {
      console.warn("Error processing request:", error);
    }
  }
  return deduplicateResults(results);
}

export { scanContent, scanContentWithKingfisher, scanForSecrets };

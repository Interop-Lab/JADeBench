const DEFAULT_RULE_FILES = [
  "generic.yml",
  "aws.yml",
  "azure.yml",
  "gcp.yml",
  "github.yml",
  "gitlab.yml",
  "slack.yml",
  "stripe.yml",
  "npm.yml",
  "private-key.yml",
  "database.yml",
  "tokens.yml",
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

function validateParentheses(pattern) {
  let depth = 0;
  let inCharacterClass = false;
  const openings = [];
  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index];
    if (character === "\\") {
      index++;
      continue;
    }
    if (character === "[") {
      inCharacterClass = true;
      continue;
    }
    if (character === "]" && inCharacterClass) {
      inCharacterClass = false;
      continue;
    }
    if (inCharacterClass) continue;
    if (character === "(") {
      depth++;
      openings.push(index);
    } else if (character === ")") {
      depth--;
      if (depth < 0) {
        return { valid: false, error: `Unmatched closing parenthesis at position ${index}` };
      }
      openings.pop();
    }
  }
  if (depth > 0) {
    return {
      valid: false,
      error: `Unmatched opening parenthesis (${depth} remaining) at position ${openings[0] || 0}`,
    };
  }
  return { valid: true };
}

function stripComments(pattern, extendedMode = false) {
  pattern = pattern.replace(/\(\?#[^)]*\)/g, "");
  if (!extendedMode) return pattern.replace(/\s#[\s\w]*$/gm, "");
  return pattern
    .split("\n")
    .map((line) => {
      let inCharacterClass = false;
      for (let index = 0; index < line.length; index++) {
        const character = line[index];
        if (character === "\\") {
          index++;
          continue;
        }
        if (character === "[") inCharacterClass = true;
        else if (character === "]") inCharacterClass = false;
        else if (!inCharacterClass && character === "#" && (index === 0 || /\s/.test(line[index - 1]))) {
          return line.slice(0, index);
        }
      }
      return line;
    })
    .join("\n");
}

function convertNamedGroups(pattern) {
  return pattern.replace(/\(\?P<([^>]+)>/g, "(?<$1>");
}

function stripWhitespaceInExtendedMode(pattern) {
  let result = "";
  let inCharacterClass = false;
  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index];
    if (character === "[") inCharacterClass = true;
    if (character === "]") inCharacterClass = false;
    if (character === "\\") {
      result += character;
      if (index + 1 < pattern.length) result += pattern[++index];
      continue;
    }
    if (!inCharacterClass && /[\s\n\r\t]/.test(character)) continue;
    result += character;
  }
  return result;
}

function findGroupEnd(pattern, start) {
  let depth = 1;
  let inCharacterClass = false;
  for (let index = start; index < pattern.length; index++) {
    const character = pattern[index];
    if (character === "\\") {
      index++;
      continue;
    }
    if (character === "[") inCharacterClass = true;
    else if (character === "]") inCharacterClass = false;
    else if (!inCharacterClass && character === "(") depth++;
    else if (!inCharacterClass && character === ")" && --depth === 0) return index;
  }
  return -1;
}

function convertInlineFlagGroups(pattern, initialFlags) {
  let flags = initialFlags;
  let converted = "";
  for (let index = 0; index < pattern.length; ) {
    const match = pattern.slice(index).match(/^\(\?([-]?[imsux]+):/);
    if (!match) {
      converted += pattern[index++];
      continue;
    }
    const contentStart = index + match[0].length;
    const end = findGroupEnd(pattern, contentStart);
    if (end < 0) {
      converted += pattern.slice(index);
      break;
    }
    const enabled = match[1].split("-")[0];
    for (const flag of enabled) {
      if ("is".includes(flag) && !flags.includes(flag)) flags += flag;
    }
    let content = pattern.slice(contentStart, end);
    if (enabled.includes("x")) content = stripWhitespaceInExtendedMode(content);
    converted += `(${content})`;
    index = end + 1;
  }
  return { pattern: converted, flags };
}

function convertPatternFlags(originalPattern) {
  let flags = "g";
  let pattern = originalPattern;
  let extendedMode = false;
  const leadingFlags = pattern.match(/^\(\?([imsux]+)\)/);
  if (leadingFlags) {
    pattern = pattern.replace(/^\(\?[imsux]+\)/, "");
    for (const flag of leadingFlags[1]) {
      if ("ims".includes(flag) && !flags.includes(flag)) flags += flag;
      if (flag === "x") extendedMode = true;
    }
  }
  ({ pattern, flags } = convertInlineFlagGroups(pattern, flags));
  pattern = pattern.replace(/\(\?([imsux]+)\)/g, (_match, groupFlags) => {
    for (const flag of groupFlags) {
      if ("ims".includes(flag) && !flags.includes(flag)) flags += flag;
      if (flag === "x") extendedMode = true;
    }
    return "";
  });
  if (extendedMode) pattern = stripWhitespaceInExtendedMode(pattern);
  return { pattern: convertNamedGroups(pattern), flags };
}

function validatePatternRequirements(match, requirements) {
  if (!requirements) return { passed: true };
  const checks = [
    ["min_digits", /\d/g, "digits"],
    ["min_uppercase", /[A-Z]/g, "uppercase letters"],
    ["min_lowercase", /[a-z]/g, "lowercase letters"],
  ];
  for (const [property, expression, label] of checks) {
    if (requirements[property] === undefined) continue;
    const count = (match.match(expression) || []).length;
    if (count < requirements[property]) {
      return { passed: false, reason: `Requires at least ${requirements[property]} ${label}, found ${count}` };
    }
  }
  if (requirements.min_special_chars !== undefined) {
    const specialChars = requirements.special_chars || "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const escaped = specialChars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const count = (match.match(new RegExp(`[${escaped}]`, "g")) || []).length;
    if (count < requirements.min_special_chars) {
      return {
        passed: false,
        reason: `Requires at least ${requirements.min_special_chars} special characters, found ${count}`,
      };
    }
  }
  const lowerMatch = match.toLowerCase();
  for (const ignored of requirements.ignore_if_contains || []) {
    const term = String(ignored).trim();
    if (term && lowerMatch.includes(term.toLowerCase())) {
      return { passed: false, ignored: true, reason: `Contains ignored term: ${term}` };
    }
  }
  return { passed: true };
}

function compileRule(rule) {
  if (!rule || !rule.pattern) return null;
  const extendedMode = /^\(\?([imsux]+)\)/.test(rule.pattern) && /^\(\?([imsux]+)\)/.exec(rule.pattern)[1].includes("x");
  const withoutComments = stripComments(rule.pattern, extendedMode);
  const { pattern, flags } = convertPatternFlags(withoutComments);
  const validation = validateParentheses(pattern);
  if (!validation.valid) {
    console.warn(`Invalid pattern for rule ${rule.id || rule.name}: ${validation.error}`);
    return null;
  }
  try {
    return { ...rule, compiledRegex: new RegExp(pattern, flags), cleanedPattern: pattern };
  } catch (error) {
    console.warn(`Failed to compile rule ${rule.id || rule.name}:`, error);
    return null;
  }
}

async function loadKingfisherRules(input) {
  try {
    let parsed;
    if (typeof window !== "undefined" && window.jsyaml?.load) parsed = window.jsyaml.load(input);
    else parsed = parseYamlRulesFallback(input);
    const rules = parsed?.rules || (Array.isArray(parsed) ? parsed : []);
    return rules.map(compileRule).filter(Boolean);
  } catch (error) {
    console.error("Failed to parse Kingfisher rules:", error);
    return [];
  }
}

async function loadKingfisherRulesFromJSON(input) {
  try {
    const parsed = typeof input === "string" ? JSON.parse(input) : input;
    const rules = parsed?.rules || (Array.isArray(parsed) ? parsed : []);
    return rules.map(compileRule).filter(Boolean);
  } catch (error) {
    console.error("Failed to parse Kingfisher JSON rules:", error);
    return [];
  }
}

function parseScalar(value) {
  const trimmed = value.trim().replace(/^['"]|['"]$/g, "");
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  return trimmed;
}

function parseYamlRulesFallback(yaml) {
  try {
    const rules = [];
    let current = null;
    let patternLines = null;
    let requirements = null;
    for (const rawLine of yaml.split("\n")) {
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed.startsWith("#") || trimmed === "rules:") continue;
      const nameMatch = trimmed.match(/^-\s+name:\s*(.*)$/);
      if (nameMatch) {
        if (current?.pattern) rules.push(current);
        current = { name: parseScalar(nameMatch[1]) };
        patternLines = null;
        requirements = null;
        continue;
      }
      if (!current) continue;
      if (patternLines && /^\s/.test(rawLine) && !/^[a-z_]+:/i.test(trimmed)) {
        patternLines.push(trimmed);
        continue;
      }
      const field = trimmed.match(/^([a-z_]+):\s*(.*)$/i);
      if (!field) continue;
      const [, key, rawValue] = field;
      if (key === "pattern") {
        if (rawValue.startsWith("|")) {
          patternLines = [];
          const firstLine = rawValue.replace(/^\|\s*/, "");
          if (firstLine) patternLines.push(firstLine);
          current.pattern = patternLines.join("\n").trim();
        } else {
          patternLines = null;
          current.pattern = parseScalar(rawValue);
        }
      } else if (key === "requirements") {
        requirements = {};
        current.pattern_requirements = requirements;
      } else if (requirements && key.startsWith("min_")) {
        requirements[key] = parseInt(rawValue, 10);
      } else if (requirements && key === "special_chars") {
        requirements[key] = parseScalar(rawValue);
      } else if (key !== "rules") {
        current[key] = parseScalar(rawValue);
      }
      if (patternLines) current.pattern = patternLines.join("\n").trim();
    }
    if (current?.pattern) rules.push(current);
    return { rules };
  } catch (error) {
    console.error("Fallback YAML parser failed:", error);
    return { rules: [] };
  }
}

async function loadKingfisherRulesFromFile(path) {
  try {
    const response = await fetch(chrome.runtime.getURL(path));
    return loadKingfisherRulesFromJSON(await response.text());
  } catch (error) {
    console.error(`Failed to load Kingfisher rules from ${path}:`, error);
    return [];
  }
}

async function loadKingfisherRulesFromLocalFile(fileName) {
  try {
    const response = await fetch(chrome.runtime.getURL(`rules/${fileName}`));
    if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
    return loadKingfisherRules(await response.text());
  } catch (error) {
    console.error(`Failed to load Kingfisher rules from ${fileName}:`, error);
    return [];
  }
}

async function loadKingfisherRulesFromLocalFiles(fileNames) {
  const rules = [];
  for (const fileName of fileNames) rules.push(...await loadKingfisherRulesFromLocalFile(fileName));
  return rules;
}

async function loadAllKingfisherRulesFromLocal() {
  try {
    const response = await fetch(chrome.runtime.getURL("rules/index.json"));
    if (response.ok) {
      const index = await response.json();
      if (Array.isArray(index.files)) return loadKingfisherRulesFromLocalFiles(index.files);
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
  for (const url of urls) rules.push(...await loadKingfisherRulesFromURL(url));
  return rules;
}

function scanWithKingfisherRules(content, rules, options = {}) {
  if (!content || !rules?.length) return [];
  const { minEntropy = 3, checkPatternRequirements = true, getEntropy: entropyCalculator = null } = options;
  const results = [];
  for (const rule of rules) {
    const regex = rule.compiledRegex;
    if (!regex) continue;
    try {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const value = match[0];
        if (entropyCalculator && rule.min_entropy && entropyCalculator(value) < rule.min_entropy) continue;
        if (checkPatternRequirements && rule.pattern_requirements) {
          const validation = validatePatternRequirements(value, rule.pattern_requirements);
          if (!validation.passed) continue;
        }
        const contextStart = Math.max(0, match.index - 50);
        const contextEnd = Math.min(content.length, match.index + value.length + 50);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          match: value,
          index: match.index,
          confidence: rule.confidence || "medium",
          entropy: entropyCalculator ? entropyCalculator(value).toFixed(2) : null,
          context: content.substring(contextStart, contextEnd),
          validation: rule.validation || null,
        });
        if (match[0] === "") regex.lastIndex++;
      }
    } catch (error) {
      console.warn(`Error scanning with rule ${rule.id}:`, error);
    }
  }
  return results;
}

function isLikelyBase64Data(value, context) {
  if (/data:[\w/-]+;base64,/.test(context)) return true;
  if (/={1,2}$/.test(value) && value.length > 20) return true;
  if (value.length > 100 && /^[A-Za-z0-9+/=]+$/.test(value)) return true;
  const prefix = context.slice(0, 200);
  return /"(?:data|content|image|icon|font|media|src|href|asset|resource)"\s*:\s*"[^"]*$/i.test(prefix)
    || /(?:const|let|var)\s+(?:data|image|icon|font|asset|resource|content)\w*\s*=\s*["`'][^"`']*$/i.test(prefix);
}

function isInComment(line) {
  const trimmed = line.trim();
  return /^\s*\/\//.test(trimmed) || /^\s*\*/.test(trimmed) || /^\s*\/\*/.test(trimmed);
}

function normalizeSourceFile(file) {
  if (!file) return file;
  try {
    const url = new URL(file);
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return file.split("?")[0].split("#")[0];
  }
}

function deduplicateResults(results) {
  const seen = new Set();
  return results.filter((result) => {
    const key = `${result.type}:${result.match}:${normalizeSourceFile(result.file || "")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

let kingfisherRulesCache = null;
async function loadKingfisherRuleScanner() {
  if (kingfisherRulesCache) return kingfisherRulesCache;
  try {
    const rules = await loadAllKingfisherRulesFromLocal();
    kingfisherRulesCache = { rules, scanWithKingfisherRules };
  } catch (error) {
    console.error("Failed to load Kingfisher rules:", error);
    kingfisherRulesCache = { rules: [], scanWithKingfisherRules: null };
  }
  return kingfisherRulesCache;
}

function scanContent() {
  return [];
}

async function scanContentWithKingfisher(content, file) {
  if (!content) return [];
  try {
    const { rules, scanWithKingfisherRules: scan } = await loadKingfisherRuleScanner();
    if (!rules.length || !scan) return [];
    const matches = scan(content, rules, { getEntropy, checkPatternRequirements: true });
    const results = [];
    for (const match of matches) {
      const contextStart = Math.max(0, match.index - 100);
      const contextEnd = Math.min(content.length, match.index + match.match.length + 100);
      const context = content.substring(contextStart, contextEnd);
      if (KNOWN_FALSE_POSITIVE_PATTERNS.some((pattern) => pattern.test(match.match))) continue;
      if (FALSE_POSITIVE_CONTEXT_PATTERNS.some((pattern) => pattern.test(context))) continue;
      if (isLikelyBase64Data(match.match, context)) continue;
      const lineStart = content.lastIndexOf("\n", match.index) + 1;
      const lineEnd = content.indexOf("\n", match.index);
      if (isInComment(content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd))) continue;
      let confidence = match.confidence === "high" ? 80 : match.confidence === "medium" ? 70 : 60;
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
    return results;
  } catch (error) {
    console.error("Error scanning with Kingfisher rules:", error);
    return [];
  }
}

function getResponseBody(entry) {
  if (entry.responseBody !== undefined) return Promise.resolve(entry.responseBody || "");
  if (typeof entry.getContent !== "function") return Promise.resolve("");
  return new Promise((resolve, reject) => {
    entry.getContent((content) => {
      if (globalThis.chrome?.runtime?.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve(content || "");
    });
  });
}

async function scanForSecrets(entries, onProgress, onResult) {
  const results = [];
  const seen = new Set();
  let completed = 0;
  for (const entry of entries) {
    try {
      if (!entry?.request || !entry.response) continue;
      const url = entry.request.url.toLowerCase();
      const mimeType = entry.response?.content?.mimeType?.toLowerCase() || "";
      const isJavaScript = url.endsWith(".js")
        || mimeType.includes("javascript")
        || mimeType.includes("ecmascript")
        || mimeType.includes("application/x-javascript");
      if (!isJavaScript) continue;
      const content = await getResponseBody(entry);
      if (!content) continue;
      for (const result of await scanContentWithKingfisher(content, entry.request.url)) {
        const key = `${result.type}:${result.match}`;
        if (seen.has(key)) continue;
        seen.add(key);
        results.push(result);
        onResult?.(result);
      }
    } catch (error) {
      console.error(`Error processing request ${entry?.request?.url || ""}:`, error);
    } finally {
      completed++;
      onProgress?.(completed, entries.length);
    }
  }
  return results;
}

export { scanContent, scanContentWithKingfisher, scanForSecrets };

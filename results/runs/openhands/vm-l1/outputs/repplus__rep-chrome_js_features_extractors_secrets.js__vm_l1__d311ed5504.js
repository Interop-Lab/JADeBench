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

function validateParentheses(pattern) {
  let escaped = false;
  let inCharacterClass = false;
  const openings = [];

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
    if (character === "[") {
      inCharacterClass = true;
      continue;
    }
    if (character === "]") {
      inCharacterClass = false;
      continue;
    }
    if (inCharacterClass) continue;
    if (character === "(") openings.push(index);
    if (character === ")" && openings.pop() === undefined) {
      return { valid: false, error: `Unmatched closing parenthesis at position ${index}` };
    }
  }

  if (openings.length) {
    return {
      valid: false,
      error: `Unmatched opening parenthesis (depth: ${openings.length}) at position ${openings[0]}`,
    };
  }
  return { valid: true };
}

function stripComments(pattern) {
  return pattern
    .replace(/\(\?#[^)]*\)/g, "")
    .split("\n")
    .map((line) => line.replace(/\s#[\s\w]*$/g, ""))
    .join("\n");
}

function convertNamedGroups(pattern) {
  return pattern.replace(/\(\?P<([^>]+)>/g, "(?<$1>");
}

function findGroupEnd(pattern, contentStart) {
  let depth = 1;
  let escaped = false;
  let inCharacterClass = false;
  for (let index = contentStart; index < pattern.length; index += 1) {
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
      depth += 1;
    } else if (!inCharacterClass && character === ")" && --depth === 0) {
      return index;
    }
  }
  return -1;
}

function convertInlineFlagGroups(inputPattern, inputFlags = "") {
  let pattern = convertNamedGroups(inputPattern);
  const flags = new Set(inputFlags);
  const replacements = [];
  const groupPattern = /\(\?([-]?[imsux]+):/g;
  let match;

  while ((match = groupPattern.exec(pattern))) {
    const end = findGroupEnd(pattern, groupPattern.lastIndex);
    if (end < 0) continue;
    const specification = match[1];
    const disabled = specification.startsWith("-");
    const letters = specification.replace("-", "");
    if (!disabled) {
      if (letters.includes("i")) flags.add("i");
      if (letters.includes("s")) flags.add("s");
    }
    replacements.push({ start: match.index, end: groupPattern.lastIndex, replacement: "(?:" });
  }

  replacements.reverse().forEach(({ start, end, replacement }) => {
    pattern = pattern.substring(0, start) + replacement + pattern.substring(end);
  });
  return { pattern, flags: [...flags].join("") };
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

function convertPatternFlags(inputPattern) {
  let pattern = inputPattern;
  const flags = new Set(["g"]);
  const leadingFlags = pattern.match(/^\(\?([imsux]+)\)/);
  if (leadingFlags) {
    pattern = pattern.replace(/^\(\?[imsux]+\)/, "");
    for (const flag of leadingFlags[1]) {
      if (flag === "i" || flag === "m" || flag === "s") flags.add(flag);
    }
    if (leadingFlags[1].includes("x")) pattern = stripWhitespaceInExtendedMode(pattern);
  }

  const converted = convertInlineFlagGroups(pattern, [...flags].join(""));
  pattern = converted.pattern;
  for (const flag of converted.flags) flags.add(flag);
  if (/\(\?([imsux]+)\)/.test(pattern) && RegExp.$1.includes("x")) {
    pattern = stripWhitespaceInExtendedMode(pattern);
  }
  return { pattern, flags: [...flags].join("") };
}

function validatePatternRequirements(value, requirements = {}) {
  const result = { passed: true };
  const fail = (reason) => ({ passed: false, reason });

  if (requirements.min_digits) {
    const count = (value.match(/\d/g) || []).length;
    if (count < requirements.min_digits) {
      return fail(`Requires at least ${requirements.min_digits} digits, found ${count}`);
    }
  }
  if (requirements.min_uppercase) {
    const count = (value.match(/[A-Z]/g) || []).length;
    if (count < requirements.min_uppercase) {
      return fail(`Requires at least ${requirements.min_uppercase} uppercase letters, found ${count}`);
    }
  }
  if (requirements.min_lowercase) {
    const count = (value.match(/[a-z]/g) || []).length;
    if (count < requirements.min_lowercase) {
      return fail(`Requires at least ${requirements.min_lowercase} lowercase letters, found ${count}`);
    }
  }
  if (requirements.min_special_chars) {
    const specialCharacters = requirements.special_chars || "!@#$%^&*()_+-=[]{}|;:'\",.<>?/\\`~";
    const escaped = specialCharacters.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const count = (value.match(new RegExp(`[${escaped}]`, "g")) || []).length;
    if (count < requirements.min_special_chars) {
      return fail(`Requires at least ${requirements.min_special_chars} special characters, found ${count}`);
    }
  }
  if (requirements.ignore_if_contains) {
    const normalizedValue = value.toLowerCase();
    const ignored = requirements.ignore_if_contains.find((term) =>
      normalizedValue.includes(String(term).trim().toLowerCase()),
    );
    if (ignored !== undefined) return { passed: false, reason: `Contains ignored term: ${ignored}`, ignored: true };
  }
  return result;
}

function parseScalar(value) {
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed !== "" && !Number.isNaN(Number(trimmed))) return Number(trimmed);
  return trimmed;
}

function parseYamlRulesFallback(yaml) {
  console.warn("Using fallback YAML parser - consider bundling js-yaml for better support");
  try {
    const rules = [];
    let rule = null;
    let multilinePattern = false;
    let requirements = null;

    for (const sourceLine of yaml.split("\n")) {
      const line = sourceLine.trim();
      if (!line || line.startsWith("#")) continue;
      if (line.startsWith("- name:")) {
        if (rule?.pattern) rules.push(rule);
        rule = { name: line.replace(/^- name:\s*/, "").replace(/^["']|["']$/g, "") };
        requirements = null;
        multilinePattern = false;
      } else if (!rule) {
        continue;
      } else if (line.startsWith("id:")) {
        rule.id = parseScalar(line.replace(/^id:\s*/, ""));
      } else if (line.startsWith("pattern:")) {
        rule.pattern = line.replace(/^pattern:\s*\|?\s*/, "").replace(/^["']|["']$/g, "");
        multilinePattern = sourceLine.trimEnd().endsWith("|") || line === "pattern:";
      } else if (line.startsWith("min_entropy:")) {
        rule.min_entropy = parseFloat(line.replace(/^min_entropy:\s*/, ""));
        multilinePattern = false;
      } else if (line.startsWith("pattern_requirements:")) {
        requirements = rule.pattern_requirements = {};
        multilinePattern = false;
      } else if (requirements && /^[a-z_]+:/.test(line)) {
        const separator = line.indexOf(":");
        requirements[line.slice(0, separator)] = parseScalar(line.slice(separator + 1));
      } else if (multilinePattern && /^\s/.test(sourceLine)) {
        rule.pattern += `${rule.pattern ? " " : ""}${line.replace("\t", " ")}`;
      }
    }
    if (rule?.pattern) rules.push(rule);
    return { rules };
  } catch (error) {
    console.error("Fallback YAML parser failed:", error);
    return { rules: [] };
  }
}

function compileRule(rule) {
  if (!rule?.pattern) {
    console.warn("Rule missing pattern:", rule?.id || rule?.name);
    return null;
  }
  try {
    const uncommented = stripComments(rule.pattern);
    const converted = convertPatternFlags(uncommented);
    const validation = validateParentheses(converted.pattern);
    if (!validation.valid) throw new Error(validation.error);
    return {
      ...rule,
      compiledRegex: new RegExp(converted.pattern, converted.flags),
      cleanedPattern: converted.pattern,
      flags: converted.flags,
    };
  } catch (error) {
    console.warn(`Failed to compile regex for rule ${rule.id || rule.name}:`, error);
    return null;
  }
}

function normalizeRules(parsed) {
  const rules = Array.isArray(parsed) ? parsed : parsed?.rules;
  if (!Array.isArray(rules)) throw new Error("Fallback parser could not parse YAML");
  return rules.map(compileRule).filter(Boolean);
}

function loadKingfisherRules(yaml) {
  try {
    const parser = typeof window !== "undefined" && window.jsyaml?.load;
    return normalizeRules(parser ? parser(yaml) : parseYamlRulesFallback(yaml));
  } catch (error) {
    console.error("Failed to parse YAML rules:", error);
    return [];
  }
}

function loadKingfisherRulesFromJSON(input) {
  try {
    return normalizeRules(typeof input === "string" ? JSON.parse(input) : input);
  } catch (error) {
    console.error("Failed to load JSON rules:", error);
    return [];
  }
}

async function loadKingfisherRulesFromFile(file) {
  try {
    const url = globalThis.chrome?.runtime?.getURL ? chrome.runtime.getURL(file) : file;
    return loadKingfisherRulesFromJSON(await (await fetch(url)).json());
  } catch (error) {
    console.error(`Failed to load rules from ${file}:`, error);
    return [];
  }
}

async function loadKingfisherRulesFromLocalFile(file) {
  try {
    const path = `rules/${file}`;
    const url = globalThis.chrome?.runtime?.getURL ? chrome.runtime.getURL(path) : path;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return loadKingfisherRules(await response.text());
  } catch (error) {
    console.error(`Failed to load Kingfisher rules from ${file}:`, error);
    return [];
  }
}

async function loadKingfisherRulesFromLocalFiles(files) {
  const rules = [];
  for (const file of files) {
    try {
      rules.push(...await loadKingfisherRulesFromLocalFile(file));
    } catch (error) {
      console.warn(`Failed to load rules from ${file}:`, error);
    }
  }
  return rules;
}

const DEFAULT_RULE_FILES = [
  "slack.yaml", "aws.yaml", "github.yaml", "google.yaml", "stripe.yaml", "twilio.yaml",
  "azure.yaml", "heroku.yaml", "mailgun.yaml", "sendgrid.yaml", "paypal.yaml", "square.yaml",
];

async function loadAllKingfisherRulesFromLocal() {
  try {
    const manifestPath = "rules/_manifest.json";
    const manifestUrl = globalThis.chrome?.runtime?.getURL
      ? chrome.runtime.getURL(manifestPath)
      : manifestPath;
    const response = await fetch(manifestUrl);
    if (response.ok) {
      const manifest = await response.json();
      if (Array.isArray(manifest.files)) return loadKingfisherRulesFromLocalFiles(manifest.files);
    }
  } catch {
    // Fall back to the built-in file list.
  }
  return loadKingfisherRulesFromLocalFiles(DEFAULT_RULE_FILES);
}

async function loadKingfisherRulesFromURL(url) {
  try {
    return loadKingfisherRules(await (await fetch(url)).text());
  } catch (error) {
    console.error("Failed to load Kingfisher rules from URL:", error);
    return [];
  }
}

async function loadKingfisherRulesFromURLs(urls) {
  const rules = [];
  for (const url of urls) {
    try {
      rules.push(...await loadKingfisherRulesFromURL(url));
    } catch (error) {
      console.warn(`Failed to load rules from ${url}:`, error);
    }
  }
  return rules;
}

function getEntropy(value) {
  if (!value.length) return 0;
  const frequencies = Object.create(null);
  for (const character of value) frequencies[character] = (frequencies[character] || 0) + 1;
  let entropy = 0;
  for (const count of Object.values(frequencies)) {
    const probability = count / value.length;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}

function isLikelyBase64Data(value, context = "") {
  if (/data:[\w/-]+;base64,/.test(value)) return true;
  if (value.length > 100 && /^[A-Za-z0-9+/=]+$/.test(value)) return true;
  if (value.length > 200 && /={1,2}$/.test(value)) return true;
  const prefix = context.substring(0, 100);
  return /"(?:data|content|image|icon|font|media|src|href|asset|resource)"\s*:\s*"[^"]*$/i.test(prefix)
    || /(?:const|let|var)\s+(?:data|image|icon|font|asset|resource|content)\w*\s*=\s*["`'][^"`']*$/.test(prefix);
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
    return sourceFile.split("?")[0].split("#")[0];
  }
}

function deduplicateResults(results) {
  const seen = new Set();
  return results.filter((result) => {
    const key = `${normalizeSourceFile(result.file || "")}:${result.type}:${result.match}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function selectMatch(match, rule) {
  if (Array.isArray(rule.captures) && rule.captures.length) {
    return rule.captures.map((index) => match[index]).filter(Boolean).join("");
  }
  if (Number.isInteger(rule.captures)) return match[rule.captures] || match[0];
  return match[1] || match[0];
}

function scanWithKingfisherRules(content, rules) {
  const results = [];
  for (const rule of rules) {
    try {
      const regex = rule.compiledRegex;
      if (!regex) continue;
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(content))) {
        const value = selectMatch(match, rule);
        const entropy = getEntropy(value);
        if (rule.min_entropy && entropy < rule.min_entropy) continue;
        const validation = rule.pattern_requirements
          ? validatePatternRequirements(value, rule.pattern_requirements)
          : { passed: true };
        if (!validation.passed) {
          if (validation.ignored) continue;
          if (rule.checkPatternRequirements !== false) continue;
        }
        const index = match.index + Math.max(0, match[0].indexOf(value));
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          match: value,
          confidence: rule.confidence || "medium",
          entropy: entropy.toFixed(2),
          context: content.substring(Math.max(0, index - 100), Math.min(content.length, index + value.length + 100)),
          index,
          validation,
        });
        if (match[0] === "") regex.lastIndex += 1;
      }
    } catch (error) {
      console.warn(`Error scanning with rule ${rule.id || rule.name}:`, error);
    }
  }
  return results;
}

let kingfisherRulesCache = null;
async function loadKingfisherRules2() {
  if (kingfisherRulesCache) return kingfisherRulesCache;
  try {
    const rules = await Promise.resolve().then(loadAllKingfisherRulesFromLocal);
    kingfisherRulesCache = { rules, scanWithKingfisherRules };
  } catch (error) {
    console.error("Failed to load Kingfisher rules:", error);
    kingfisherRulesCache = { rules: [], scanWithKingfisherRules };
  }
  return kingfisherRulesCache;
}

function scanContent() {
  return [];
}

async function scanContentWithKingfisher(content, sourceFile = "") {
  if (!content) return [];
  try {
    const { rules, scanWithKingfisherRules: scan } = await loadKingfisherRules2();
    if (!scan || !rules?.length) return [];
    const findings = scan(content, rules, { getEntropy, checkPatternRequirements: true });
    const results = [];

    for (const finding of findings) {
      const match = finding.match;
      const context = content.substring(
        Math.max(0, finding.index - 100),
        Math.min(content.length, finding.index + match.length + 100),
      );
      if (KNOWN_FALSE_POSITIVE_PATTERNS.some((pattern) => pattern.test(match))) continue;
      if (FALSE_POSITIVE_CONTEXT_PATTERNS.some((pattern) => pattern.test(context))) continue;
      if (isLikelyBase64Data(match, context.substring(0, 50))) continue;

      const lineStart = content.lastIndexOf("\n", finding.index) + 1;
      const nextNewline = content.indexOf("\n", finding.index);
      const lineEnd = nextNewline < 0 ? content.length : nextNewline;
      if (isInComment(content.substring(lineStart, lineEnd))) continue;

      let confidence = finding.confidence === "high"
        ? 85
        : finding.confidence === "medium"
          ? 70
          : 60;
      const entropy = finding.entropy ? parseFloat(finding.entropy) : 0;
      if (entropy > 4.5) confidence += 10;
      else if (entropy < 3.5) confidence -= 10;
      if (confidence < 60) continue;

      results.push({
        file: sourceFile,
        type: finding.ruleName || finding.ruleId || "Unknown Secret",
        match,
        index: finding.index,
        confidence: Math.min(100, confidence),
        entropy: finding.entropy || "0.00",
        ruleName: finding.ruleName,
        ruleId: finding.ruleId,
      });
    }
    return results;
  } catch (error) {
    console.warn("Error scanning with Kingfisher rules:", error);
    return [];
  }
}

function getResponseContent(response) {
  if (response.responseBody !== undefined) return Promise.resolve(response.responseBody || "");
  if (typeof response.getContent !== "function") return Promise.resolve("");
  return new Promise((resolve, reject) => {
    response.getContent((content) => {
      const lastError = globalThis.chrome?.runtime?.lastError;
      if (lastError) reject(new Error(lastError.message));
      else resolve(content || "");
    });
  });
}

async function scanForSecrets(entries, onProgress, onFinding) {
  const results = [];
  const seen = new Set();
  if (!entries?.length) return results;

  let processed = 0;
  for (const entry of entries) {
    const request = entry?.request;
    const response = entry?.response;
    if (!request || !response) continue;

    try {
      processed += 1;
      if (typeof onProgress === "function") onProgress(processed, entries.length);
      const url = request.url.toLowerCase();
      const mimeType = (response.content?.mimeType || "").toLowerCase();
      const isJavaScript = url.endsWith(".js")
        || mimeType.includes("javascript")
        || mimeType.includes("ecmascript")
        || mimeType.includes("application/javascript");
      if (!isJavaScript) continue;

      const content = await getResponseContent(response);
      if (!content) continue;
      const findings = await scanContentWithKingfisher(content, request.url);
      for (const finding of findings) {
        const key = `${finding.type}:${finding.match}`;
        if (seen.has(key)) continue;
        seen.add(key);
        results.push(finding);
        if (typeof onFinding === "function") onFinding(finding);
      }
    } catch (error) {
      console.warn("Error scanning with Kingfisher:", error);
    }
  }
  return results;
}

const kingfisher_rules_exports = {
  loadAllKingfisherRulesFromLocal,
  loadKingfisherRules,
  loadKingfisherRulesFromFile,
  loadKingfisherRulesFromJSON,
  loadKingfisherRulesFromLocalFile,
  loadKingfisherRulesFromLocalFiles,
  loadKingfisherRulesFromURL,
  loadKingfisherRulesFromURLs,
  scanWithKingfisherRules,
};

Object.assign(globalThis, {
  kingfisher_rules_exports,
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
  scanWithKingfisherRules,
  loadKingfisherRulesFromLocalFile,
  loadKingfisherRulesFromLocalFiles,
  loadAllKingfisherRulesFromLocal,
  loadKingfisherRulesFromURL,
  loadKingfisherRulesFromURLs,
  KNOWN_FALSE_POSITIVE_PATTERNS,
  FALSE_POSITIVE_CONTEXT_PATTERNS,
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

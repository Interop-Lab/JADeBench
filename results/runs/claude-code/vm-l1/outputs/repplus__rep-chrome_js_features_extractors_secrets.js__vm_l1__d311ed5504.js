const DEFAULT_RULE_FILES = [
  "slack.yaml", "aws.yaml", "github.yaml", "google.yaml", "stripe.yaml", "twilio.yaml",
  "azure.yaml", "heroku.yaml", "mailgun.yaml", "sendgrid.yaml", "paypal.yaml", "square.yaml",
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
  /base64,/i, /data:image/i, /;base64/i,
  /"(?:publicKey|privateKey|data|content|image|icon|font|logo|avatar|thumbnail|media|src|href)":/i,
  /iVBOR|AAAA|\/png|\/jpeg|\/jpg|\/gif|\/webp|\/svg/i,
  /sourceMappingURL=/i, /webpack:\/\//i, /__webpack/i, /\.chunk\.js/i,
  /\/\*#\s*source/i, /import\s+.*\s+from\s+['"]/i, /require\s*\(['"]/i,
  /["']data["']\s*:/i, /["']image["']\s*:/i, /\/\/ data:image/i,
];

let kingfisherRulesCache = null;

function convertNamedGroups(pattern) {
  return pattern.replace(/\(\?P<([^>]+)>/g, "(?<$1>");
}

function stripWhitespaceInExtendedMode(pattern) {
  let output = "";
  let escaped = false;
  let inCharacterClass = false;
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (escaped) {
      output += character;
      escaped = false;
    } else if (character === "\\") {
      output += character;
      escaped = true;
    } else if (character === "[") {
      inCharacterClass = true;
      output += character;
    } else if (character === "]") {
      inCharacterClass = false;
      output += character;
    } else if (!inCharacterClass && character === "#") {
      while (index < pattern.length && pattern[index] !== "\n") index += 1;
    } else if (inCharacterClass || !/[\s\n\r\t]/.test(character)) {
      output += character;
    }
  }
  return output;
}

function convertInlineFlagGroups(pattern) {
  const starts = [...pattern.matchAll(/\(\?[-]?[imsux]+:/g)];
  for (const start of starts.reverse()) {
    let depth = 1;
    let escaped = false;
    for (let index = start.index + start[0].length; index < pattern.length; index += 1) {
      const character = pattern[index];
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === "(") depth += 1;
      else if (character === ")" && --depth === 0) {
        const bodyStart = start.index + start[0].length;
        pattern = pattern.slice(0, start.index) + "(?:" + pattern.slice(bodyStart, index) + pattern.slice(index);
        break;
      }
    }
  }
  return pattern;
}

function compileRulePattern(rule) {
  let pattern = String(rule.pattern ?? "");
  let flags = String(rule.flags ?? "");
  const inlineFlags = pattern.match(/^\(\?([imsux]+)\)/);
  if (inlineFlags) {
    flags += inlineFlags[1];
    pattern = pattern.replace(/^\(\?[imsux]+\)/, "");
  }
  pattern = pattern.replace(/\(\?#[^)]*\)/g, "");
  if (flags.includes("x")) {
    pattern = stripWhitespaceInExtendedMode(pattern);
    flags = flags.replace(/x/g, "");
  }
  pattern = convertInlineFlagGroups(convertNamedGroups(pattern));
  if (!flags.includes("g")) flags += "g";
  flags = [...new Set(flags)].filter((flag) => "dgimsuvy".includes(flag)).join("");
  return new RegExp(pattern, flags);
}

function validatePatternRequirements(value, requirements = {}) {
  const failures = [];
  for (const [key, expression, label] of [
    ["min_digits", /\d/g, "digits"],
    ["min_uppercase", /[A-Z]/g, "uppercase letters"],
    ["min_lowercase", /[a-z]/g, "lowercase letters"],
  ]) {
    if (requirements[key] == null) continue;
    const count = (value.match(expression) || []).length;
    if (count < requirements[key]) {
      failures.push(`Requires at least ${requirements[key]} ${label}, found ${count}`);
    }
  }
  if (requirements.min_special_chars != null) {
    const characters = requirements.special_chars ?? "!@#$%^&*()_+-=[]{}|;:'\",.<>?/\\`~";
    const escaped = characters.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const count = (value.match(new RegExp(`[${escaped}]`, "g")) || []).length;
    if (count < requirements.min_special_chars) {
      failures.push(`Requires at least ${requirements.min_special_chars} special characters, found ${count}`);
    }
  }
  for (const term of requirements.ignore_if_contains ?? []) {
    if (value.toLowerCase().includes(String(term).trim().toLowerCase())) {
      return { passed: false, ignored: true, reason: `Contains ignored term: ${term}` };
    }
  }
  return failures.length ? { passed: false, reason: failures.join("; ") } : { passed: true };
}

function normalizeRule(rule) {
  if (!rule || typeof rule !== "object" || !rule.pattern) return null;
  try {
    return { ...rule, compiledRegex: compileRulePattern(rule) };
  } catch (error) {
    console.warn(`Invalid Kingfisher rule ${rule.name ?? rule.id ?? "unknown"}:`, error);
    return null;
  }
}

function parseYamlScalar(value) {
  const text = value.trim().replace(/^["']|["']$/g, "");
  if (/^(true|false)$/i.test(text)) return text.toLowerCase() === "true";
  if (/^-?\d+(?:\.\d+)?$/.test(text)) return Number(text);
  if (text.startsWith("[") && text.endsWith("]")) {
    return text.slice(1, -1).split(",").map(parseYamlScalar);
  }
  return text;
}

function parseYamlRulesFallback(yaml) {
  console.warn("Using fallback YAML parser - consider bundling js-yaml for better support");
  const rules = [];
  let rule = null;
  let section = null;
  let multilineKey = null;
  for (const rawLine of yaml.split(/\r?\n/)) {
    if (!rawLine.trim() || /^\s*#/.test(rawLine)) continue;
    const indentation = rawLine.match(/^\s*/)[0].length;
    const line = rawLine.trim();
    if (line.startsWith("- name:")) {
      if (rule) rules.push(rule);
      rule = { name: parseYamlScalar(line.replace(/^- name:\s*/, "")) };
      section = multilineKey = null;
      continue;
    }
    if (!rule) continue;
    if (multilineKey && indentation && !/^[a-z_]+:/i.test(line)) {
      rule[multilineKey] += line;
      continue;
    }
    const property = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (!property) continue;
    const [, key, rawValue] = property;
    if (rawValue === "|" || rawValue === ">") {
      rule[key] = "";
      multilineKey = key;
    } else if (!rawValue) {
      rule[key] = {};
      section = key;
      multilineKey = null;
    } else if (section && indentation) {
      rule[section][key] = parseYamlScalar(rawValue);
    } else {
      rule[key] = parseYamlScalar(rawValue);
      section = multilineKey = null;
    }
  }
  if (rule) rules.push(rule);
  return rules;
}

function loadKingfisherRulesFromJSON(input) {
  try {
    const parsed = typeof input === "string" ? JSON.parse(input) : input;
    const rules = Array.isArray(parsed) ? parsed : parsed?.rules;
    return Array.isArray(rules) ? rules.map(normalizeRule).filter(Boolean) : [];
  } catch (error) {
    console.error("Failed to load JSON rules:", error);
    return [];
  }
}

function loadKingfisherRules(input) {
  try {
    const parsed = typeof window !== "undefined" && window.jsyaml?.load
      ? window.jsyaml.load(input)
      : parseYamlRulesFallback(input);
    const rules = Array.isArray(parsed) ? parsed : parsed?.rules;
    return Array.isArray(rules) ? rules.map(normalizeRule).filter(Boolean) : [];
  } catch (error) {
    console.error("Failed to parse YAML rules:", error);
    return [];
  }
}

async function loadKingfisherRulesFromFile(path) {
  try {
    const url = typeof chrome !== "undefined" && chrome.runtime?.getURL
      ? chrome.runtime.getURL(`rules/${path}`)
      : path;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    return loadKingfisherRules(await response.text());
  } catch (error) {
    console.error(`Failed to load Kingfisher rules from ${path}:`, error);
    return [];
  }
}

const loadKingfisherRulesFromLocalFile = loadKingfisherRulesFromFile;

async function loadKingfisherRulesFromLocalFiles(paths) {
  const rules = [];
  for (const path of paths) {
    try {
      rules.push(...await loadKingfisherRulesFromLocalFile(path));
    } catch (error) {
      console.warn(`Failed to load rules from ${path}:`, error);
    }
  }
  return rules;
}

async function loadAllKingfisherRulesFromLocal() {
  try {
    const manifestUrl = typeof chrome !== "undefined" && chrome.runtime?.getURL
      ? chrome.runtime.getURL("rules/_manifest.json")
      : "rules/_manifest.json";
    const manifest = await (await fetch(manifestUrl)).json();
    if (Array.isArray(manifest.files)) return loadKingfisherRulesFromLocalFiles(manifest.files);
  } catch {
    // Bundles without a manifest use the known default rule files.
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
  const counts = new Map();
  for (const character of value) counts.set(character, (counts.get(character) ?? 0) + 1);
  let entropy = 0;
  for (const count of counts.values()) {
    const probability = count / value.length;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}

function isLikelyBase64Data(value, context = "") {
  if (/data:[\w/-]+;base64,/i.test(context) || /={1,2}$/.test(value)) return true;
  if (value.length < 32 || !/^[A-Za-z0-9+/=]+$/.test(value)) return false;
  return /"(?:data|content|image|icon|font|media|src|href|asset|resource)"\s*:\s*"[^"]*$/i.test(context) ||
    /(?:const|let|var)\s+(?:data|image|icon|font|asset|resource|content)\w*\s*=\s*["`'][^"`']*$/i.test(context);
}

function isInComment(context) {
  const text = context.trim();
  return /^\s*\/\//.test(text) || /^\s*\*/.test(text) || /^\s*\/\*/.test(text);
}

function normalizeSourceFile(source) {
  try {
    const url = new URL(source);
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return String(source ?? "").split(/[?#]/)[0];
  }
}

function deduplicateResults(results) {
  const seen = new Set();
  return results.filter((result) => {
    const key = `${result.file ?? ""}:${result.ruleId ?? result.ruleName ?? result.type ?? ""}:${result.match ?? ""}:${result.index ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function scanWithKingfisherRules(content, rules) {
  const findings = [];
  for (const rule of rules) {
    try {
      const expression = rule.compiledRegex ?? compileRulePattern(rule);
      expression.lastIndex = 0;
      let match;
      while ((match = expression.exec(content)) !== null) {
        const value = match[1] ?? match[0];
        const entropy = getEntropy(value);
        const validation = validatePatternRequirements(value, rule.pattern_requirements);
        if ((rule.min_entropy == null || entropy >= Number(rule.min_entropy)) && validation.passed) {
          findings.push({
            ruleId: rule.id,
            ruleName: rule.name,
            match: value,
            index: match.index,
            confidence: rule.confidence ?? "medium",
            entropy: entropy.toFixed(2),
            context: content.substring(Math.max(0, match.index - 100), match.index + match[0].length + 100),
            captures: match.slice(1),
            validation,
          });
        }
        if (!match[0].length) expression.lastIndex += 1;
      }
    } catch (error) {
      console.warn(`Error scanning with rule ${rule.name ?? rule.id ?? "unknown"}:`, error);
    }
  }
  return findings;
}

async function loadKingfisherRules2() {
  if (!kingfisherRulesCache) kingfisherRulesCache = Promise.resolve(loadAllKingfisherRulesFromLocal());
  return kingfisherRulesCache;
}

async function scanContentWithKingfisher(content, sourceFile = "") {
  try {
    const findings = scanWithKingfisherRules(content, await loadKingfisherRules2());
    return findings
      .filter(({ match, context }) =>
        !KNOWN_FALSE_POSITIVE_PATTERNS.some((pattern) => pattern.test(match)) &&
        !FALSE_POSITIVE_CONTEXT_PATTERNS.some((pattern) => pattern.test(context)) &&
        !isLikelyBase64Data(match, context) &&
        !isInComment(context))
      .map((finding) => ({
        ...finding,
        file: normalizeSourceFile(sourceFile),
        type: finding.ruleName ?? finding.ruleId ?? "Unknown Secret",
      }));
  } catch (error) {
    console.warn("Error scanning with Kingfisher rules:", error);
    return [];
  }
}

function scanContent(content, sourceFile) {
  return scanContentWithKingfisher(content, sourceFile);
}

async function readBody(body) {
  if (typeof body === "string") return body;
  if (body && typeof body.getContent === "function") return body.getContent();
  return body?.content ?? "";
}

async function scanForSecrets(requests, sourceFile = "", onFinding) {
  const findings = [];
  for (const entry of requests ?? []) {
    try {
      for (const part of [entry.request, entry.response]) {
        if (!part) continue;
        const mimeType = String(part.content?.mimeType ?? part.mimeType ?? "").toLowerCase();
        if (mimeType && !mimeType.includes("javascript") && !mimeType.includes("ecmascript")) continue;
        try {
          const content = await readBody(part.responseBody ?? part.content ?? part);
          if (!content) continue;
          const matches = await scanContentWithKingfisher(
            content,
            sourceFile || entry.url || entry.request?.url || "",
          );
          for (const match of matches) {
            findings.push(match);
            if (typeof onFinding === "function") onFinding(match);
          }
        } catch (error) {
          console.warn("Error scanning with Kingfisher:", error);
        }
      }
    } catch (error) {
      console.error("Error processing request:", error);
    }
  }
  return deduplicateResults(findings);
}

export { scanContent, scanContentWithKingfisher, scanForSecrets };

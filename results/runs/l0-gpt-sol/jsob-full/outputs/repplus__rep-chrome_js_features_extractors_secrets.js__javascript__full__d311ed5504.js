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

function getEntropy(value) {
  const counts = Object.create(null);
  for (const character of value) {
    counts[character] = (counts[character] || 0) + 1;
  }

  let entropy = 0;
  for (const count of Object.values(counts)) {
    const probability = count / value.length;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}

function isInComment(line) {
  const trimmed = line.trim();
  return /^\s*\/\//.test(trimmed) ||
    /^\s*\*/.test(trimmed) ||
    /^\s*\/\*/.test(trimmed);
}

function normalizeSourceFile(source) {
  if (!source) return source;
  try {
    const url = new URL(source);
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return source.split("?")[0].split("#")[0];
  }
}

function isLikelyBase64Data(value, context) {
  if (/data:[\w/-]+;base64,/.test(context)) return true;
  if (/={1,2}$/.test(value) && value.length > 16) return true;
  if (value.length > 20 && /^[A-Za-z0-9+/=]+$/.test(value)) return true;

  const line = context.slice(0, 160);
  if (/"(?:data|content|image|icon|font|media|src|href|asset|resource)"\s*:\s*"[^"]*$/i.test(line)) {
    return true;
  }
  if (/(?:const|let|var)\s+(?:data|image|icon|font|asset|resource|content)\w*\s*=\s*["`'][^"`']*$/i.test(line)) {
    return true;
  }
  return false;
}

function stripComments(source, extended = false) {
  source = source.replace(/\(\?#[^)]*\)/g, "");
  if (!extended) return source.replace(/\s#[\s\w]*$/gm, "");

  const lines = source.split("\n");
  return lines.map(line => {
    let result = "";
    let characterClass = false;
    let escaped = false;

    for (let index = 0; index < line.length; index++) {
      const character = line[index];
      const next = line[index + 1];

      if (escaped) {
        result += character;
        escaped = false;
        continue;
      }

      if (character === "\\") {
        result += character;
        escaped = true;
        continue;
      }

      if (character === "[") {
        characterClass = true;
        result += character;
        continue;
      }

      if (character === "]") {
        characterClass = false;
        result += character;
        continue;
      }

      if (!characterClass && character === "#") {
        const previous = line[index - 1];
        if (index === 0 || /\s/.test(previous || "")) break;
      }

      if (!characterClass && /\s/.test(character)) continue;
      result += character;
    }

    return result;
  }).join("\n");
}

function convertNamedGroups(pattern) {
  return pattern.replace(/\(\?P<([^>]+)>/g, "(?<$1>");
}

function convertInlineFlagGroups(pattern, flags) {
  let extended = false;
  pattern = pattern.replace(/^\(\?([imsux]+)\)/, (_, inlineFlags) => {
    if (inlineFlags.includes("i") && !flags.includes("i")) flags += "i";
    if (inlineFlags.includes("s") && !flags.includes("s")) flags += "s";
    if (inlineFlags.includes("x")) extended = true;
    return "";
  });

  pattern = pattern.replace(/\(\?([imsux]+)\)/g, (_, inlineFlags) => {
    if (inlineFlags.includes("i") && !flags.includes("i")) flags += "i";
    if (inlineFlags.includes("s") && !flags.includes("s")) flags += "s";
    if (inlineFlags.includes("x")) extended = true;
    return "";
  });

  return {
    pattern: extended ? stripWhitespaceInExtendedMode(pattern) : pattern,
    flags
  };
}

function stripWhitespaceInExtendedMode(pattern) {
  let result = "";
  let characterClass = false;
  let escaped = false;

  for (const character of pattern) {
    if (escaped) {
      result += character;
      escaped = false;
      continue;
    }
    if (character === "\\") {
      result += character;
      escaped = true;
      continue;
    }
    if (character === "[") characterClass = true;
    if (character === "]") characterClass = false;
    if (!characterClass && /\s/.test(character)) continue;
    result += character;
  }

  return result;
}

function convertPatternFlags(pattern) {
  let flags = "g";
  let source = pattern;
  const leading = source.match(/^\(\?([imsux]+)\)/);

  if (leading) {
    const inlineFlags = leading[1];
    source = source.replace(/^\(\?[imsux]+\)/, "");
    if (inlineFlags.includes("i")) flags += "i";
    if (inlineFlags.includes("m")) flags += "m";
    if (inlineFlags.includes("s")) flags += "s";
    if (inlineFlags.includes("x")) source = stripWhitespaceInExtendedMode(source);
  }

  const converted = convertInlineFlagGroups(convertNamedGroups(source), flags);
  return {
    pattern: converted.pattern,
    flags: converted.flags
  };
}

function validateParentheses(pattern) {
  let depth = 0;
  let characterClass = false;
  let escaped = false;

  for (let index = 0; index < pattern.length; index++) {
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
      characterClass = true;
      continue;
    }
    if (character === "]") {
      characterClass = false;
      continue;
    }
    if (characterClass) continue;

    if (character === "(") depth++;
    if (character === ")") {
      depth--;
      if (depth < 0) {
        return {
          valid: false,
          error: `Unmatched closing parenthesis at position ${index}`
        };
      }
    }
  }

  if (depth > 0) {
    return {
      valid: false,
      error: `Unmatched opening parenthesis at position ${pattern.length}`
    };
  }

  return { valid: true };
}

function validatePatternRequirements(pattern, requirements) {
  const result = { valid: true };
  if (!requirements) return result;

  if (requirements.min_digits != null) {
    const digits = (pattern.match(/\d/g) || []).length;
    if (digits < requirements.min_digits) {
      return {
        valid: false,
        error: `Pattern requires at least ${requirements.min_digits} digits, found ${digits}`
      };
    }
  }

  if (requirements.min_uppercase != null) {
    const uppercase = (pattern.match(/[A-Z]/g) || []).length;
    if (uppercase < requirements.min_uppercase) {
      return {
        valid: false,
        error: `Pattern requires at least ${requirements.min_uppercase} uppercase characters, found ${uppercase}`
      };
    }
  }

  if (requirements.min_lowercase != null) {
    const lowercase = (pattern.match(/[a-z]/g) || []).length;
    if (lowercase < requirements.min_lowercase) {
      return {
        valid: false,
        error: `Pattern requires at least ${requirements.min_lowercase} lowercase characters, found ${lowercase}`
      };
    }
  }

  if (requirements.min_entropy != null && getEntropy(pattern) < requirements.min_entropy) {
    return {
      valid: false,
      error: `Pattern requires minimum entropy ${requirements.min_entropy}`
    };
  }

  if (requirements.allowed_chars) {
    const allowed = requirements.allowed_chars;
    const expression = new RegExp(`[^${allowed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`, "g");
    if (expression.test(pattern)) {
      return {
        valid: false,
        error: "Pattern contains disallowed characters"
      };
    }
  }

  return result;
}

function normalizeRule(rule) {
  if (!rule || !rule.pattern) return null;

  const inlineFlags = /^\(\?([imsux]+)\)/.test(rule.pattern);
  const stripped = stripComments(rule.pattern, inlineFlags);
  const converted = convertPatternFlags(stripped);
  const validation = validateParentheses(converted.pattern);

  if (!validation.valid) return null;

  try {
    const regex = new RegExp(converted.pattern, converted.flags);
    return {
      ...rule,
      regex,
      pattern: converted.pattern
    };
  } catch {
    return null;
  }
}

function scanWithKingfisherRules(source, rules, options = {}) {
  if (!source || !Array.isArray(rules)) return [];

  const {
    minEntropy = 0,
    checkPatternRequirements = true,
    getEntropy: entropyFunction = null
  } = options;

  const results = [];

  for (const rule of rules) {
    if (!rule || !rule.regex) continue;

    try {
      rule.regex.lastIndex = 0;
      let match;

      while ((match = rule.regex.exec(source)) !== null) {
        const value = match[0];
        const index = match.index;

        if (entropyFunction && rule.min_entropy != null &&
            entropyFunction(value) < rule.min_entropy) {
          if (!rule.regex.global) break;
          continue;
        }

        if (checkPatternRequirements && rule.requirements) {
          const validation = validatePatternRequirements(value, rule.requirements);
          if (!validation.valid) {
            if (!rule.regex.global) break;
            continue;
          }
        }

        if (entropyFunction && entropyFunction(value) < minEntropy) {
          if (!rule.regex.global) break;
          continue;
        }

        const entropy = entropyFunction ? entropyFunction(value) : null;
        const lineStart = source.lastIndexOf("\n", index - 1) + 1;
        const lineEnd = source.indexOf("\n", index + value.length);
        const context = source.slice(
          Math.max(0, lineStart - 200),
          lineEnd === -1 ? Math.min(source.length, index + value.length + 200) : lineEnd
        );

        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          match: value,
          index,
          confidence: rule.confidence || 0.5,
          entropy: entropy == null ? null : Number(entropy.toFixed(3)),
          context,
          validation: rule.validation || null
        });

        if (!rule.regex.global) break;
        if (match[0] === "") rule.regex.lastIndex++;
      }
    } catch {
      continue;
    }
  }

  return results;
}

function deduplicateResults(results) {
  const seen = new Set();

  return results.filter(result => {
    const key = `${result.file || ""}:${result.type || result.ruleName || ""}:${result.index}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

let kingfisherRulesCache = null;

async function loadKingfisherRules2() {
  if (kingfisherRulesCache) return kingfisherRulesCache;

  try {
    const module = await Promise.resolve().then(() => ({
      loadAllKingfisherRulesFromLocal,
      scanWithKingfisherRules
    }));

    const rules = await module.loadAllKingfisherRulesFromLocal();
    kingfisherRulesCache = {
      rules,
      scanWithKingfisherRules: module.scanWithKingfisherRules
    };
    return kingfisherRulesCache;
  } catch (error) {
    console.error("Failed to load Kingfisher rules:", error);
    kingfisherRulesCache = {
      rules: [],
      scanWithKingfisherRules: null
    };
    return kingfisherRulesCache;
  }
}

async function loadKingfisherRulesFromJSON(input) {
  try {
    const value = typeof input === "string" ? JSON.parse(input) : input;
    const rules = value && value.rules || (Array.isArray(value) ? value : []);

    return rules.map(normalizeRule).filter(Boolean);
  } catch (error) {
    console.error("Failed to parse Kingfisher rules:", error);
    return [];
  }
}

async function loadKingfisherRules(input) {
  return loadKingfisherRulesFromJSON(input);
}

async function loadKingfisherRulesFromURL(url) {
  try {
    const response = await fetch(url);
    return loadKingfisherRules(await response.text());
  } catch (error) {
    console.error("Failed to load Kingfisher rules from URL:", url, error);
    return [];
  }
}

async function loadKingfisherRulesFromURLs(urls) {
  const rules = [];
  for (const url of urls) {
    try {
      rules.push(...await loadKingfisherRulesFromURL(url));
    } catch (error) {
      console.error("Failed to load Kingfisher rules from URL:", url, error);
    }
  }
  return rules;
}

async function loadKingfisherRulesFromFile(path) {
  try {
    const response = await fetch(path);
    return loadKingfisherRules(await response.text());
  } catch (error) {
    console.error("Failed to load Kingfisher rules from file:", path, error);
    return [];
  }
}

async function loadKingfisherRulesFromLocalFile(path) {
  try {
    const url = typeof chrome !== "undefined" &&
      chrome.runtime &&
      typeof chrome.runtime.getURL === "function"
      ? chrome.runtime.getURL(path)
      : path;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    return loadKingfisherRules(await response.text());
  } catch (error) {
    console.error("Failed to load local Kingfisher rules:", path, error);
    return [];
  }
}

async function loadKingfisherRulesFromLocalFiles(paths) {
  const rules = [];
  for (const path of paths) {
    try {
      rules.push(...await loadKingfisherRulesFromLocalFile(path));
    } catch (error) {
      console.error("Failed to load local Kingfisher rules:", path, error);
    }
  }
  return rules;
}

async function loadAllKingfisherRulesFromLocal() {
  const paths = [
    "rules/kingfisher.json",
    "rules/kingfisher.yml",
    "kingfisher-rules.json"
  ];

  const rules = [];
  for (const path of paths) {
    try {
      rules.push(...await loadKingfisherRulesFromLocalFile(path));
    } catch {
      continue;
    }
  }
  return rules;
}

async function scanContentWithKingfisher(content, file) {
  if (!content) return [];

  try {
    const {
      rules,
      scanWithKingfisherRules: scanner
    } = await loadKingfisherRules2();

    if (!rules || !rules.length || !scanner) return [];

    const matches = scanner(content, rules, {
      getEntropy
    });

    const results = [];

    for (const match of matches) {
      if (KNOWN_FALSE_POSITIVE_PATTERNS.some(pattern => pattern.test(match.match))) {
        continue;
      }

      if (FALSE_POSITIVE_CONTEXT_PATTERNS.some(pattern => pattern.test(match.context || ""))) {
        continue;
      }

      if (isLikelyBase64Data(match.match, match.context || "")) {
        continue;
      }

      results.push({
        file,
        type: match.ruleName || match.ruleId || "secret",
        match: match.match,
        index: match.index,
        confidence: match.confidence,
        entropy: match.entropy,
        ruleName: match.ruleName,
        ruleId: match.ruleId
      });
    }

    return results;
  } catch (error) {
    console.error("Failed to scan content with Kingfisher:", error);
    return [];
  }
}

async function scanForSecrets(items, onProgress, onResult) {
  const results = [];
  const seen = new Set();
  const total = Array.isArray(items) ? items.length : 0;

  if (!Array.isArray(items)) return results;

  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    if (onProgress) onProgress(index + 1, total);
    if (!item) continue;

    let content = "";
    let file = item.file || item.filename || item.name || "";

    if (typeof item === "string") {
      content = item;
    } else if (typeof item.content === "string") {
      content = item.content;
    } else if (typeof item.source === "string") {
      content = item.source;
    } else if (typeof item.text === "string") {
      content = item.text;
    } else if (item.content != null) {
      content = String(item.content);
    }

    if (!content) continue;

    const matches = await scanContentWithKingfisher(content, file);

    for (const match of matches) {
      const key = `${match.file || ""}:${match.type || ""}:${match.index}`;
      if (seen.has(key)) continue;

      seen.add(key);
      results.push(match);
      if (onResult) onResult(match);
    }
  }

  return results;
}

function scanContent() {
  return [];
}

export {
  scanContent,
  scanContentWithKingfisher,
  scanForSecrets
};

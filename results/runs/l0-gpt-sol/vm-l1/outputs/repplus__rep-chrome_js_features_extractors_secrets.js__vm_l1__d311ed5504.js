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

const BUILTIN_RULES = [
  {
    id: "private-key",
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g
  },
  {
    id: "aws-access-key",
    pattern: /\b(?:AKIA|ASIA|AIDA|AROA|AIPA|ANPA|ANVA|ASCA)[A-Z0-9]{16}\b/g
  },
  {
    id: "github-token",
    pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,255}\b|\bgithub_pat_[A-Za-z0-9_]{40,255}\b/g
  },
  {
    id: "gitlab-token",
    pattern: /\bglpat-[A-Za-z0-9_-]{20,255}\b/g
  },
  {
    id: "slack-token",
    pattern: /\bxox(?:a|b|p|r|s)-[A-Za-z0-9-]{10,255}\b/g
  },
  {
    id: "stripe-secret-key",
    pattern: /\bsk_(?:live|test)_[A-Za-z0-9]{16,255}\b/g
  },
  {
    id: "google-api-key",
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g
  },
  {
    id: "jwt",
    pattern: /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g
  },
  {
    id: "basic-auth-url",
    pattern: /\b[a-z][a-z0-9+.-]*:\/\/[^/\s:@]+:[^/\s@]+@[^/\s]+/gi
  },
  {
    id: "generic-secret",
    pattern: /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password|passwd|secret)\b\s*[:=]\s*["'`]([^"'`\r\n]{8,})["'`]/gi,
    capture: 1
  }
];

let kingfisherRulesCache = null;

function normalizeSourceFile(sourceFile) {
  if (sourceFile == null) return "";
  if (typeof sourceFile === "string") return sourceFile;
  if (typeof sourceFile === "object") {
    return String(
      sourceFile.path ??
      sourceFile.url ??
      sourceFile.name ??
      sourceFile.filename ??
      ""
    );
  }
  return String(sourceFile);
}

function getEntropy(value) {
  const text = String(value ?? "");
  if (!text.length) return 0;

  const counts = new Map();
  for (const character of text) {
    counts.set(character, (counts.get(character) || 0) + 1);
  }

  let entropy = 0;
  for (const count of counts.values()) {
    const probability = count / text.length;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}

function isInComment(context) {
  const text = String(context ?? "");
  const lineStart = Math.max(text.lastIndexOf("\n"), text.lastIndexOf("\r")) + 1;
  const line = text.slice(lineStart);

  const blockStart = text.lastIndexOf("/*");
  const blockEnd = text.lastIndexOf("*/");
  if (blockStart > blockEnd) return true;

  const slash = line.indexOf("//");
  if (slash >= 0) return true;

  const hash = line.search(/(^|\s)#/);
  return hash >= 0;
}

function isLikelyBase64Data(value, context = "") {
  const text = String(value ?? "");
  if (text.length < 40 || text.length % 4 !== 0) return false;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(text)) return false;
  return FALSE_POSITIVE_CONTEXT_PATTERNS.some(pattern => pattern.test(context));
}

function positionAt(content, index) {
  let line = 1;
  let column = 1;

  for (let i = 0; i < index; i++) {
    if (content.charCodeAt(i) === 10) {
      line++;
      column = 1;
    } else {
      column++;
    }
  }

  return { line, column };
}

function makeFinding(rule, match, value, index, content, sourceFile) {
  const position = positionAt(content, index);
  const type = String(rule.id || rule.name || rule.rule || "secret");

  const finding = {
    type,
    match,
    index,
    line: position.line,
    column: position.column,
    sourceFile
  };

  Object.defineProperties(finding, {
    value: { value, enumerable: false },
    secret: { value, enumerable: false },
    rule: { value: type, enumerable: false },
    ruleId: { value: type, enumerable: false }
  });

  if (rule.description != null) {
    finding.description = String(rule.description);
  }

  return finding;
}

function isFalsePositive(value, context) {
  if (!value) return true;
  if (KNOWN_FALSE_POSITIVE_PATTERNS.some(pattern => pattern.test(value))) {
    return true;
  }
  if (isLikelyBase64Data(value, context)) return true;
  return false;
}

function cloneRegExp(pattern) {
  const flags = pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g";
  return new RegExp(pattern.source, flags);
}

function compileRulePattern(rule) {
  const input =
    rule.pattern ??
    rule.regex ??
    rule.regexp ??
    rule.rule?.pattern ??
    rule.rule?.regex;

  if (input instanceof RegExp) return cloneRegExp(input);
  if (typeof input !== "string" || !input) return null;

  let source = input;
  let flags = String(rule.flags ?? rule.regexFlags ?? "");

  const literal = /^\/([\s\S]*)\/([a-z]*)$/i.exec(input);
  if (literal) {
    source = literal[1];
    flags = literal[2];
  }

  source = convertPatternFlags(source);
  source = convertInlineFlagGroups(source, flags);
  source = convertNamedGroups(source);

  if (rule.extended || flags.includes("x")) {
    source = stripWhitespaceInExtendedMode(source);
    flags = flags.replace(/x/g, "");
  }

  flags = flags.replace(/[^dgimsuvy]/g, "");
  if (!flags.includes("g")) flags += "g";

  try {
    return new RegExp(source, flags);
  } catch {
    return null;
  }
}

function validateParentheses(pattern) {
  let depth = 0;
  let escaped = false;
  let inClass = false;

  for (const character of String(pattern ?? "")) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      continue;
    }
    if (character === "[") {
      inClass = true;
      continue;
    }
    if (character === "]") {
      inClass = false;
      continue;
    }
    if (inClass) continue;
    if (character === "(") depth++;
    if (character === ")" && --depth < 0) return false;
  }

  return depth === 0;
}

function stripComments(pattern) {
  const text = String(pattern ?? "");
  let result = "";
  let escaped = false;
  let inClass = false;

  for (let i = 0; i < text.length; i++) {
    const character = text[i];

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
    if (character === "[") inClass = true;
    if (character === "]") inClass = false;

    if (!inClass && character === "#") {
      while (i + 1 < text.length && text[i + 1] !== "\n") i++;
      continue;
    }

    result += character;
  }

  return result;
}

function convertNamedGroups(pattern) {
  return String(pattern ?? "")
    .replace(/\(\?P<([A-Za-z_][A-Za-z0-9_]*)>/g, "(?<$1>")
    .replace(/\\k'([A-Za-z_][A-Za-z0-9_]*)'/g, "\\k<$1>")
    .replace(/\(\?P=([A-Za-z_][A-Za-z0-9_]*)\)/g, "\\k<$1>");
}

function convertInlineFlagGroups(pattern) {
  return String(pattern ?? "").replace(
    /\(\?([ims]+)(?:-([ims]+))?:/g,
    "(?:"
  );
}

function convertPatternFlags(pattern) {
  return String(pattern ?? "")
    .replace(/\\A/g, "^")
    .replace(/\\z/g, "$")
    .replace(/\(\?#(?:\\.|[^)])*\)/g, "");
}

function stripWhitespaceInExtendedMode(pattern) {
  return stripComments(pattern).replace(
    /(?:\\[\s\S]|\[(?:\\[\s\S]|[^\]])*\])|\s+/g,
    token => (/^\s+$/.test(token) ? "" : token)
  );
}

function validatePatternRequirements(rule, content = "") {
  const required =
    rule.keywords ??
    rule.required ??
    rule.requirements ??
    rule.rule?.keywords;

  if (!required) return true;

  const keywords = Array.isArray(required) ? required : [required];
  const haystack = String(content).toLowerCase();
  return keywords.some(keyword => haystack.includes(String(keyword).toLowerCase()));
}

function scanWithRules(content, sourceFile, rules) {
  const text = String(content ?? "");
  const source = normalizeSourceFile(sourceFile);
  const results = [];

  for (const rule of rules || []) {
    if (!rule || rule.enabled === false) continue;
    if (!validatePatternRequirements(rule, text)) continue;

    const pattern = compileRulePattern(rule);
    if (!pattern || !validateParentheses(pattern.source)) continue;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      const capture = Number.isInteger(rule.capture) ? rule.capture : 0;
      const value = String(match[capture] ?? match[0] ?? "");
      const relativeIndex =
        capture > 0 && match[0].includes(value) ? match[0].indexOf(value) : 0;
      const index = match.index + relativeIndex;
      const context = text.slice(Math.max(0, index - 120), index + value.length + 120);

      if (!isFalsePositive(value, context)) {
        results.push(
          makeFinding(rule, match[0], value, index, text, source)
        );
      }

      if (match[0] === "") pattern.lastIndex++;
    }
  }

  return results;
}

function deduplicateResults(results) {
  const seen = new Set();
  const output = [];

  for (const result of results || []) {
    const value = result.value ?? result.secret ?? result.match ?? "";
    const key = [
      result.type ?? result.ruleId ?? result.rule ?? "",
      value,
      result.sourceFile ?? result.source ?? "",
      result.index ?? "",
      result.line ?? "",
      result.column ?? ""
    ].join("\0");

    if (!seen.has(key)) {
      seen.add(key);
      output.push(result);
    }
  }

  return output;
}

function scanContent(content, sourceFile = "") {
  return deduplicateResults(
    scanWithRules(content, sourceFile, BUILTIN_RULES)
  );
}

function normalizeRulesDocument(document) {
  if (!document) return [];

  if (Array.isArray(document)) {
    return document.flatMap(normalizeRulesDocument);
  }

  if (typeof document !== "object") return [];

  if (Array.isArray(document.rules)) {
    return document.rules.flatMap(normalizeRulesDocument);
  }

  if (document.pattern || document.regex || document.regexp) {
    return [document];
  }

  const rules = [];
  for (const [id, value] of Object.entries(document)) {
    if (typeof value === "string") {
      rules.push({ id, pattern: value });
    } else if (value && typeof value === "object") {
      rules.push({ id, ...value });
    }
  }
  return rules;
}

function parseYamlScalar(value) {
  const text = value.trim();
  if (!text) return "";
  if (text === "true") return true;
  if (text === "false") return false;
  if (text === "null" || text === "~") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(text)) return Number(text);

  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    const body = text.slice(1, -1);
    return text[0] === '"'
      ? body.replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\")
      : body.replace(/''/g, "'");
  }

  if (text.startsWith("[") && text.endsWith("]")) {
    return text
      .slice(1, -1)
      .split(",")
      .map(item => parseYamlScalar(item));
  }

  return text;
}

function parseYamlRulesFallback(yaml) {
  const lines = String(yaml ?? "").split(/\r?\n/);
  const rules = [];
  let current = null;

  for (const rawLine of lines) {
    if (!rawLine.trim() || /^\s*#/.test(rawLine)) continue;

    const item = /^\s*-\s*(.*)$/.exec(rawLine);
    if (item) {
      if (current) rules.push(current);
      current = {};

      if (item[1]) {
        const pair = /^([^:]+):\s*(.*)$/.exec(item[1]);
        if (pair) current[pair[1].trim()] = parseYamlScalar(pair[2]);
      }
      continue;
    }

    const pair = /^\s*([^:#][^:]*):\s*(.*)$/.exec(rawLine);
    if (!pair) continue;

    if (!current) current = {};
    current[pair[1].trim()] = parseYamlScalar(pair[2]);
  }

  if (current) rules.push(current);
  return normalizeRulesDocument(rules);
}

function loadKingfisherRulesFromJSON(input) {
  const document = typeof input === "string" ? JSON.parse(input) : input;
  return normalizeRulesDocument(document);
}

async function fetchText(url) {
  if (typeof fetch !== "function") {
    throw new Error("fetch is not available");
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load Kingfisher rules: ${response.status}`);
  }
  return response.text();
}

async function loadKingfisherRulesFromURL(url) {
  const text = await fetchText(url);
  try {
    return loadKingfisherRulesFromJSON(text);
  } catch {
    return parseYamlRulesFallback(text);
  }
}

async function loadKingfisherRulesFromURLs(urls) {
  const documents = await Promise.all(
    Array.from(urls || [], loadKingfisherRulesFromURL)
  );
  return documents.flat();
}

async function loadKingfisherRulesFromFile(file) {
  if (file == null) return [];

  if (typeof file.text === "function") {
    const text = await file.text();
    try {
      return loadKingfisherRulesFromJSON(text);
    } catch {
      return parseYamlRulesFallback(text);
    }
  }

  return loadKingfisherRulesFromURL(String(file));
}

async function loadKingfisherRulesFromLocalFile(path) {
  let url = String(path ?? "");
  if (
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    typeof chrome.runtime.getURL === "function"
  ) {
    url = chrome.runtime.getURL(url);
  }
  return loadKingfisherRulesFromURL(url);
}

async function loadKingfisherRulesFromLocalFiles(paths) {
  const rules = await Promise.all(
    Array.from(paths || [], loadKingfisherRulesFromLocalFile)
  );
  return rules.flat();
}

async function loadAllKingfisherRulesFromLocal() {
  const candidates = [
    "kingfisher-rules.json",
    "kingfisher-rules.yaml",
    "kingfisher-rules.yml",
    "rules/kingfisher-rules.json",
    "rules/kingfisher-rules.yaml"
  ];

  for (const candidate of candidates) {
    try {
      const rules = await loadKingfisherRulesFromLocalFile(candidate);
      if (rules.length) return rules;
    } catch {
      // Try the next supported local rule location.
    }
  }

  return [];
}

async function loadKingfisherRules(source) {
  if (source == null) return loadAllKingfisherRulesFromLocal();
  if (Array.isArray(source)) {
    if (source.every(item => typeof item === "string")) {
      return loadKingfisherRulesFromURLs(source);
    }
    return normalizeRulesDocument(source);
  }
  if (typeof source === "object") {
    if (typeof source.text === "function") {
      return loadKingfisherRulesFromFile(source);
    }
    return normalizeRulesDocument(source);
  }

  const text = String(source);
  if (/^\s*[\[{]/.test(text)) {
    return loadKingfisherRulesFromJSON(text);
  }
  if (text.includes("\n") || /^\s*(?:rules:|- |\w+\s*:)/.test(text)) {
    return parseYamlRulesFallback(text);
  }
  return loadKingfisherRulesFromURL(text);
}

async function loadKingfisherRules2() {
  if (kingfisherRulesCache === null) {
    kingfisherRulesCache = loadKingfisherRules().catch(() => []);
  }
  return kingfisherRulesCache;
}

function scanWithKingfisherRules(content, rules, sourceFile = "") {
  return deduplicateResults(
    scanWithRules(content, sourceFile, normalizeRulesDocument(rules))
  );
}

async function scanContentWithKingfisher(content, sourceFile = "") {
  const rules = await loadKingfisherRules2();
  return scanWithKingfisherRules(content, rules, sourceFile);
}

async function scanForSecrets(content, sourceFile = "", options = {}) {
  const builtin = scanContent(content, sourceFile);

  if (options === false || options?.kingfisher === false) {
    return builtin;
  }

  let kingfisher = [];
  try {
    const rules = options?.rules
      ? await loadKingfisherRules(options.rules)
      : await loadKingfisherRules2();
    kingfisher = scanWithKingfisherRules(content, rules, sourceFile);
  } catch {
    kingfisher = [];
  }

  return deduplicateResults([...builtin, ...kingfisher]);
}

export {
  scanContent,
  scanContentWithKingfisher,
  scanForSecrets
};

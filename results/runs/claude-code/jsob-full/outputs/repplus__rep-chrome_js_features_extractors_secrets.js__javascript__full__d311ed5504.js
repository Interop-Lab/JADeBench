function validateParentheses(pattern) {
  let depth = 0;
  let inCharacterClass = false;
  const openingPositions = [];
  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index];
    const previous = index > 0 ? pattern[index - 1] : "";
    const beforePrevious = index > 1 ? pattern[index - 2] : "";
    if (previous === "\\" && beforePrevious !== "\\") continue;
    if (character === "[" && !inCharacterClass) {
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
      openingPositions.push(index);
    } else if (character === ")") {
      depth--;
      if (depth < 0)
        return {
          valid: false,
          error: "Unmatched closing parenthesis at position " + index,
        };
      openingPositions.pop();
    }
  }
  if (depth !== 0)
    return {
      valid: false,
      error:
        "Unmatched opening parenthesis (depth: " +
        depth +
        ") at position " +
        (openingPositions[0] || 0),
    };
  return {
    valid: true,
  };
}
function stripComments(pattern, extendedMode = false) {
  pattern = pattern.replace(/\(\?#[^)]*\)/g, "");
  if (!extendedMode) return pattern.replace(/\s#[\s\w]*$/gm, "");
  return pattern
    .split("\n")
    .map((line) => {
      let result = "";
      let inCharacterClass = false;
      for (let index = 0; index < line.length; index++) {
        const character = line[index];
        const previous = index > 0 ? line[index - 1] : "";
        if (previous === "\\") {
          result += character;
          continue;
        }
        if (character === "[" && !inCharacterClass) inCharacterClass = true;
        else if (character === "]" && inCharacterClass)
          inCharacterClass = false;
        if (
          !inCharacterClass &&
          character === "#" &&
          (index === 0 || /\s/.test(previous))
        )
          break;
        result += character;
      }
      return result;
    })
    .join("\n");
}
function convertNamedGroups(pattern) {
  return pattern.replace(/\(\?P<([^>]+)>/g, "(?<$1>");
}
function convertInlineFlagGroups(pattern, flags) {
  let converted = convertNamedGroups(pattern);
  const hadIgnoreCase = flags.includes("i"),
    hadDotAll = flags.includes("s");
  let needsIgnoreCase = false,
    needsDotAll = false;
  const inlineGroup = /\(\?([-]?[imsux]+):/g,
    edits = [];
  let match;
  while ((match = inlineGroup.exec(converted)) !== null) {
    const flagsText = match[1],
      contentStart = match.index + match[0].length;
    if (
      flagsText.includes("i") &&
      !flagsText.startsWith("-") &&
      !flagsText.includes("-i")
    )
      needsIgnoreCase = true;
    if (
      flagsText.includes("s") &&
      !flagsText.startsWith("-") &&
      !flagsText.includes("-s")
    )
      needsDotAll = true;
    let depth = 1,
      cursor = contentStart,
      inClass = false;
    while (cursor < converted.length && depth) {
      const character = converted[cursor];
      if (cursor && converted[cursor - 1] === "\\") {
        cursor++;
        continue;
      }
      if (character === "[") inClass = true;
      else if (character === "]") inClass = false;
      else if (!inClass && character === "(") depth++;
      else if (!inClass && character === ")") depth--;
      cursor++;
    }
    if (!depth)
      edits.push({
        start: match.index,
        end: cursor,
        text: "(" + converted.substring(contentStart, cursor - 1) + ")",
      });
  }
  for (const edit of edits.reverse())
    converted =
      converted.substring(0, edit.start) +
      edit.text +
      converted.substring(edit.end);
  if (needsIgnoreCase && !hadIgnoreCase) flags += "i";
  if (needsDotAll && !hadDotAll) flags += "s";
  return {
    pattern: converted,
    flags,
  };
}
function convertPatternFlags(pattern) {
  let flags = "g",
    converted = pattern,
    extendedMode = false;
  const leading = pattern.match(/^\(\?([imsux]+)\)/);
  if (leading) {
    converted = pattern.replace(/^\(\?[imsux]+\)/, "");
    for (const flag of "ims") if (leading[1].includes(flag)) flags += flag;
    extendedMode = leading[1].includes("x");
  }
  ({ pattern: converted, flags } = convertInlineFlagGroups(converted, flags));
  converted = converted.replace(/\(\?([imsux]+)\)/g, (_match, inlineFlags) => {
    for (const flag of "ims")
      if (inlineFlags.includes(flag) && !flags.includes(flag)) flags += flag;
    if (inlineFlags.includes("x")) extendedMode = true;
    return "";
  });
  if (extendedMode) converted = stripWhitespaceInExtendedMode(converted);
  return {
    pattern: converted,
    flags,
  };
}
function stripWhitespaceInExtendedMode(pattern) {
  let result = "",
    inClass = false;
  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index];
    if (character === "\\") {
      result += character + (pattern[++index] || "");
      continue;
    }
    if (character === "[") inClass = true;
    else if (character === "]") inClass = false;
    if (inClass || !/\s/.test(character)) result += character;
  }
  return result;
}
function validatePatternRequirements(match, requirements, context = null) {
  if (!requirements)
    return {
      passed: true,
    };
  const checks = [
    ["min_digits", /\d/g, "digits"],
    ["min_uppercase", /[A-Z]/g, "uppercase letters"],
    ["min_lowercase", /[a-z]/g, "lowercase letters"],
  ];
  for (const [property, pattern, label] of checks) {
    if (requirements[property] === undefined) continue;
    const count = (match.match(pattern) || []).length;
    if (count < requirements[property])
      return {
        passed: false,
        reason:
          "Requires at least " +
          requirements[property] +
          " " +
          label +
          ", found " +
          count,
      };
  }
  if (requirements.min_special_chars !== undefined) {
    const characters =
      requirements.special_chars ||
      "!@#$%^&*()_+-=[]{}|;:'\",.<>?/\\" + String.fromCharCode(96) + "~";
    const escaped = characters.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const count = (match.match(new RegExp("[" + escaped + "]", "g")) || [])
      .length;
    if (count < requirements.min_special_chars)
      return {
        passed: false,
        reason:
          "Requires at least " +
          requirements.min_special_chars +
          " special characters, found " +
          count,
      };
  }
  if (requirements.ignore_if_contains) {
    const lowerMatch = match.toLowerCase();
    for (const term of requirements.ignore_if_contains) {
      const trimmed = term.trim();
      if (trimmed && lowerMatch.includes(trimmed.toLowerCase()))
        return {
          passed: false,
          reason: "Contains ignored term: " + trimmed,
          ignored: true,
        };
    }
  }
  return {
    passed: true,
  };
}
function compileKingfisherRules(rules) {
  return rules
    .map((rule) => {
      if (!rule?.pattern) {
        console.warn("Rule missing pattern:", rule?.id || rule?.name);
        return null;
      }
      const leadingFlags = /^\(\?([imsux]+)\)/.exec(rule.pattern);
      const withoutComments = stripComments(
        rule.pattern,
        Boolean(leadingFlags?.[1].includes("x")),
      );
      const { pattern, flags } = convertPatternFlags(withoutComments);
      const parentheses = validateParentheses(pattern);
      try {
        return {
          ...rule,
          compiledRegex: new RegExp(pattern, flags),
          cleanedPattern: pattern,
        };
      } catch (error) {
        if (!parentheses.valid)
          console.warn(
            "Invalid pattern for rule " +
              (rule.id || rule.name) +
              ": " +
              parentheses.error,
          );
        console.warn(
          "Failed to compile regex for rule " + (rule.id || rule.name) + ":",
          error.message,
        );
        console.warn(
          "Pattern: " +
            pattern.substring(0, 200) +
            (pattern.length > 200 ? "..." : ""),
        );
        return null;
      }
    })
    .filter(Boolean);
}
async function loadKingfisherRules(rulesData) {
  let parsed;
  try {
    if (typeof window !== "undefined" && window.jsyaml?.load)
      parsed = window.jsyaml.load(rulesData);
    else {
      parsed = parseYamlRulesFallback(rulesData);
      if (
        !parsed ||
        parsed.rules?.length === 0 ||
        (Array.isArray(parsed) && parsed.length === 0)
      )
        throw new Error("Fallback parser could not parse YAML");
    }
  } catch (error) {
    console.error("Failed to parse YAML rules:", error);
    return [];
  }
  return compileKingfisherRules(
    parsed.rules || (Array.isArray(parsed) ? parsed : []),
  );
}
function parseYamlRulesFallback(yamlText) {
  console.warn(
    "Using fallback YAML parser - consider bundling js-yaml for better support",
  );
  try {
    const rules = [];
    let currentRule = null;
    let readingPattern = false;
    let patternLines = [];
    const finishRule = () => {
      if (!currentRule) return;
      if (readingPattern && patternLines.length)
        currentRule.pattern = patternLines.join("\n").trim();
      if (currentRule.pattern) rules.push(currentRule);
      patternLines = [];
    };
    for (const line of yamlText.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      if (trimmed.startsWith("- name:")) {
        finishRule();
        currentRule = {
          name: trimmed.replace(/^- name:\s*/, "").replace(/^["']|["']$/g, ""),
        };
        readingPattern = false;
        continue;
      }
      if (!currentRule) continue;
      if (trimmed.startsWith("id:"))
        currentRule.id = trimmed
          .replace(/^id:\s*/, "")
          .replace(/^["']|["']$/g, "");
      else if (trimmed.startsWith("pattern:")) {
        readingPattern = true;
        const firstLine = trimmed.replace(/^pattern:\s*\|?\s*/, "");
        if (firstLine) patternLines.push(firstLine);
      } else if (
        readingPattern &&
        (line.startsWith(" ") || line.startsWith("\t"))
      )
        patternLines.push(line);
      else if (trimmed.startsWith("min_entropy:")) {
        readingPattern = false;
        currentRule.min_entropy = parseFloat(
          trimmed.replace(/^min_entropy:\s*/, ""),
        );
      } else if (trimmed.startsWith("pattern_requirements:")) {
        readingPattern = false;
        currentRule.pattern_requirements = {};
      } else if (
        currentRule.pattern_requirements &&
        trimmed.startsWith("min_digits:")
      ) {
        currentRule.pattern_requirements.min_digits = parseInt(
          trimmed.replace(/^min_digits:\s*/, ""),
        );
      } else if (/^[a-z_]+:/.test(trimmed) && !trimmed.startsWith("pattern"))
        readingPattern = false;
    }
    finishRule();
    return { rules };
  } catch (error) {
    console.error("Fallback YAML parser failed:", error);
    return { rules: [] };
  }
}
async function loadKingfisherRulesFromJSON(jsonText) {
  try {
    const parsed =
      typeof jsonText === "string" ? JSON.parse(jsonText) : jsonText;
    return compileKingfisherRules(
      parsed.rules || (Array.isArray(parsed) ? parsed : []),
    );
  } catch (error) {
    console.error("Failed to load JSON rules:", error);
    return [];
  }
}
async function loadKingfisherRulesFromFile(filePath) {
  try {
    const response = await fetch(chrome.runtime.getURL(filePath));
    return await loadKingfisherRulesFromJSON(await response.json());
  } catch (error) {
    console.error("Failed to load rules from " + filePath + ":", error);
    return [];
  }
}
function scanWithKingfisherRules(content, rules, options = {}) {
  const results = [];
  if (!content || !rules?.length) return results;
  const { checkPatternRequirements = true, getEntropy = null } = options;
  for (const rule of rules) {
    if (!rule.compiledRegex) continue;
    try {
      const regex = rule.compiledRegex;
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const matchedText = match[0],
          index = match.index;
        if (
          getEntropy &&
          rule.min_entropy &&
          getEntropy(matchedText) < rule.min_entropy
        )
          continue;
        if (checkPatternRequirements && rule.pattern_requirements) {
          const validation = validatePatternRequirements(
            matchedText,
            rule.pattern_requirements,
            {
              captures: match,
            },
          );
          if (!validation.passed && !validation.ignored) continue;
        }
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          match: matchedText,
          index,
          confidence: rule.confidence || "medium",
          entropy: getEntropy ? getEntropy(matchedText).toFixed(2) : null,
          context: content.substring(
            Math.max(0, index - 100),
            Math.min(content.length, index + matchedText.length + 100),
          ),
          validation: rule.validation || null,
        });
      }
    } catch (error) {
      console.warn("Error scanning with rule " + rule.id + ":", error);
    }
  }
  return results;
}
async function loadKingfisherRulesFromLocalFile(filePath) {
  try {
    const response = await fetch(chrome.runtime.getURL("rules/" + filePath));
    if (!response.ok)
      throw new Error("HTTP " + response.status + ": " + response.statusText);
    return await loadKingfisherRules(await response.text());
  } catch (error) {
    console.error(
      "Failed to load Kingfisher rules from " + filePath + ":",
      error,
    );
    return [];
  }
}
async function loadKingfisherRulesFromLocalFiles(filePaths) {
  const rules = [];
  for (const filePath of filePaths) {
    try {
      rules.push(...(await loadKingfisherRulesFromLocalFile(filePath)));
    } catch (error) {
      console.warn("Failed to load rules from " + filePath + ":", error);
    }
  }
  return rules;
}
async function loadAllKingfisherRulesFromLocal() {
  try {
    const response = await fetch(chrome.runtime.getURL("rules/_manifest.json"));
    if (response.ok) {
      const manifest = await response.json();
      if (Array.isArray(manifest.files))
        return await loadKingfisherRulesFromLocalFiles(manifest.files);
    }
  } catch {}
  const files = [
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
  const rules = [];
  for (const filePath of files) {
    try {
      rules.push(...(await loadKingfisherRulesFromLocalFile(filePath)));
    } catch {}
  }
  return rules;
}
async function loadKingfisherRulesFromURL(url) {
  try {
    const response = await fetch(url);
    return await loadKingfisherRules(await response.text());
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
      console.warn("Failed to load rules from " + url + ":", error);
    }
  }
  return rules;
}
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
  if (!value.length) return 0;
  const frequencies = {};
  for (const character of value)
    frequencies[character] = (frequencies[character] || 0) + 1;
  let entropy = 0;
  for (const count of Object.values(frequencies)) {
    const probability = count / value.length;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}
function isLikelyBase64Data(value, context) {
  if (/data:[\w/-]+;base64,/.test(context)) return true;
  if (/={1,2}$/.test(value) && value.length > 100) return true;
  if (value.length > 200 && /^[A-Za-z0-9+/=]+$/.test(value)) return true;
  const prefix = context.substring(0, 100);
  if (
    /"(?:data|content|image|icon|font|media|src|href|asset|resource)"\s*:\s*"[^"]*$/i.test(
      prefix,
    )
  )
    return true;
  return /(?:const|let|var)\s+(?:data|image|icon|font|asset|resource|content)\w*\s*=\s*["\x60'][^"\x60']*$/i.test(
    prefix,
  );
}
function isInComment(line) {
  const trimmed = line.trim();
  return (
    /^\s*\/\//.test(trimmed) ||
    /^\s*\*/.test(trimmed) ||
    /^\s*\/\*/.test(trimmed)
  );
}
var kingfisherRulesCache = null;
async function getCachedKingfisherRules() {
  if (kingfisherRulesCache) return kingfisherRulesCache;
  try {
    kingfisherRulesCache = {
      rules: await loadAllKingfisherRulesFromLocal(),
      scanWithKingfisherRules,
    };
  } catch (error) {
    console.error("Failed to load Kingfisher rules:", error);
    kingfisherRulesCache = { rules: [], scanWithKingfisherRules: null };
  }
  return kingfisherRulesCache;
}
function scanContent(content, sourceFile) {
  return [];
}
async function scanContentWithKingfisher(content, sourceFile) {
  if (!content) return [];
  const results = [];
  try {
    const { rules, scanWithKingfisherRules } = await getCachedKingfisherRules();
    if (!rules?.length || !scanWithKingfisherRules) return results;
    const matches = scanWithKingfisherRules(content, rules, {
      getEntropy,
      checkPatternRequirements: true,
    });
    for (const match of matches) {
      const contextStart = Math.max(0, match.index - 100);
      const contextEnd = Math.min(
        content.length,
        match.index + match.match.length + 100,
      );
      const context = content.substring(contextStart, contextEnd);
      if (
        KNOWN_FALSE_POSITIVE_PATTERNS.some((pattern) =>
          pattern.test(match.match),
        )
      )
        continue;
      if (
        FALSE_POSITIVE_CONTEXT_PATTERNS.some((pattern) => pattern.test(context))
      )
        continue;
      if (isLikelyBase64Data(match.match, context)) continue;
      const lineStart = content.lastIndexOf("\n", match.index) + 1;
      const lineEnd = content.indexOf("\n", match.index);
      const line = content.substring(
        lineStart,
        lineEnd === -1 ? content.length : lineEnd,
      );
      if (isInComment(line)) continue;
      let confidence =
        match.confidence === "high"
          ? 85
          : match.confidence === "medium"
            ? 70
            : 60;
      if (match.entropy) {
        const entropy = parseFloat(match.entropy);
        if (entropy > 4.5) confidence += 10;
        else if (entropy < 3.5) confidence -= 10;
      }
      if (confidence < 60) continue;
      results.push({
        file: sourceFile,
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
  const seen = new Set();
  let completed = 0;
  const total = requests.length;
  for (const entry of requests) {
    try {
      if (!entry?.request || !entry.response) {
        completed++;
        onProgress?.(completed, total);
        continue;
      }
      const url = entry.request.url.toLowerCase();
      const mimeType = entry.response?.content?.mimeType?.toLowerCase() || "";
      const isJavaScript =
        url.endsWith(".js") ||
        mimeType.includes("javascript") ||
        mimeType.includes("ecmascript") ||
        mimeType.includes("application/javascript");
      if (isJavaScript) {
        try {
          let content;
          if (entry.responseBody !== undefined)
            content = entry.responseBody || "";
          else if (typeof entry.getContent === "function") {
            content = await new Promise((resolve, reject) => {
              entry.getContent((body) => {
                if (chrome.runtime.lastError)
                  reject(new Error(chrome.runtime.lastError.message));
                else resolve(body || "");
              });
            });
          } else {
            completed++;
            onProgress?.(completed, total);
            continue;
          }
          if (content) {
            try {
              for (const result of await scanContentWithKingfisher(
                content,
                entry.request.url,
              )) {
                const key = result.type + ":" + result.match;
                if (!seen.has(key)) {
                  seen.add(key);
                  results.push(result);
                  onResult?.(result);
                }
              }
            } catch (error) {
              console.warn("Error scanning with Kingfisher:", error);
            }
          }
        } catch (error) {
          console.error("Error scanning request " + url + ":", error);
        }
      }
    } catch (error) {
      console.error("Error processing request:", error);
    }
    completed++;
    onProgress?.(completed, total);
  }
  return results;
}
export { scanContent, scanContentWithKingfisher, scanForSecrets };

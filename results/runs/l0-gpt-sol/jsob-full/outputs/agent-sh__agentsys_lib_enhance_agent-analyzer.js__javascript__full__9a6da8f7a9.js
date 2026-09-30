/.test(body);
  const hasDataList = /^[-*]\s{1,1000}[^\n]{1,2000}$/m.test(body);

  if (hasCodeBlock && hasDataList && headingCount > 4 && !hasXml(body)) {
    addIssue(
      result,
      "xmlIssues",
      "no_xml_for_data",
      "Structured data is not delimited with XML tags",
      "Wrap large data and reference sections in descriptive XML tags.",
      agentPath
    );
  }

  const words = countWords(body);
  const asksStepByStep = /step[- ]by[- ]step/i.test(body);
  const hasThinkingTag = /<thinking>/i.test(body);
  const asksForReasoning = /reasoning|think\s+through/i.test(body);
  const analysisTask = /analy[sz]e|evaluate|assess|review/i.test(body);

  if (
    asksStepByStep &&
    hasThinkingTag &&
    words > 500 &&
    headingCount < 4 &&
    (options.verbose || PATTERNS.unnecessary_cot.certainty !== "low")
  ) {
    addIssue(
      result,
      "cotIssues",
      "unnecessary_cot",
      "The prompt requests redundant chain-of-thought instructions",
      "Request a concise rationale or final answer instead of hidden step-by-step reasoning.",
      agentPath
    );
  }

  if (
    words > 1000 &&
    headingCount > 1 &&
    analysisTask &&
    !asksStepByStep &&
    !hasThinkingTag &&
    !asksForReasoning &&
    (options.verbose || PATTERNS.missing_cot.certainty !== "low")
  ) {
    addIssue(
      result,
      "cotIssues",
      "missing_cot",
      "A complex analysis task lacks an explicit reasoning process",
      "Add a short analysis workflow or require a concise rationale.",
      agentPath
    );
  }

  const markdownExamples = (body.match(/##\s+example/gi) || []).length;
  const goodExamples = (body.match(/<good[- ]?example>/gi) || []).length;
  const badExamples = (body.match(/<bad[- ]?example>/gi) || []).length;
  const exampleCount = markdownExamples + goodExamples + badExamples;

  if (exampleCount > 0 && exampleCount !== 2 && exampleCount !== 3) {
    addIssue(
      result,
      "exampleIssues",
      "example_count_suboptimal",
      `Found ${exampleCount} examples; two or three examples are usually optimal`,
      exampleCount < 2
        ? "Add one or two representative examples."
        : "Keep only the two or three most useful examples.",
      agentPath,
      { exampleCount }
    );
  }

  const vagueTerms = [
    "appropriate",
    "proper",
    "properly",
    "reasonable",
    "carefully",
    "as needed",
    "if necessary",
    "when necessary",
    "best practices",
    "high quality",
    "good",
    "bad"
  ];

  const vagueMatches = [];
  for (const term of vagueTerms) {
    if (new RegExp(`\\b${term.replace(/\s+/g, "\\s+")}\\b`, "i").test(body)) {
      vagueMatches.push(term);
    }
  }

  if (vagueMatches.length > 2) {
    addIssue(
      result,
      "antiPatternIssues",
      "vague_instructions",
      `Vague instructions detected: ${vagueMatches.slice(0, 5).join(", ")}`,
      "Replace subjective wording with explicit, measurable requirements.",
      agentPath,
      { matches: vagueMatches }
    );
  }

  const estimatedTokens = Math.ceil(source.length / 4);
  if (estimatedTokens > 2000) {
    addIssue(
      result,
      "antiPatternIssues",
      "prompt_bloat",
      `Prompt is approximately ${estimatedTokens} tokens`,
      "Remove repetition and move reusable reference material to separate files.",
      agentPath,
      { estimatedTokens, maxTokens: 2000 }
    );
  }

  const hardcodedClaudeDirectory = /\.claude\//.test(source);
  let usesStateDirectory = /AI_STATE_DIR/i.test(source);

  if (!usesStateDirectory) {
    for (const match of source.matchAll(/\$\{([^}]{0,1000})\}/g)) {
      if (/STATE/i.test(match[1])) {
        usesStateDirectory = true;
        break;
      }
    }
  }

  if (hardcodedClaudeDirectory && !usesStateDirectory) {
    addIssue(
      result,
      "crossPlatformIssues",
      "hardcoded_claude_dir",
      "The prompt hardcodes a .claude/ path",
      "Use AI_STATE_DIR or another configurable state-directory variable.",
      agentPath
    );
  }

  if (/CLAUDE\.md/i.test(source) && !/AGENTS\.md/i.test(source)) {
    addIssue(
      result,
      "crossPlatformIssues",
      "claude_md_reference",
      "The prompt references CLAUDE.md without an AGENTS.md alternative",
      "Reference AGENTS.md or support both AGENTS.md and CLAUDE.md.",
      agentPath
    );
  }

  return result;
}

function analyzeAllAgents(agentsDir, options = {}) {
  const results = [];
  if (!fs.existsSync(agentsDir)) return results;

  const files = fs
    .readdirSync(agentsDir)
    .filter(file => file.endsWith(".md") && file !== "README.md");

  for (const file of files) {
    results.push(analyzeAgent(path.join(agentsDir, file), options));
  }

  return results;
}

function analyze(options = {}) {
  const {
    agent,
    agentsDir = path.join(process.cwd(), ".claude", "agents"),
    verbose = false
  } = options;

  if (agent) {
    const agentPath = agent.endsWith(".md")
      ? path.join(agentsDir, agent)
      : path.join(agentsDir, `${agent}.md`);

    return analyzeAgent(agentPath, { ...options, verbose });
  }

  return analyzeAllAgents(agentsDir, { ...options, verbose });
}

function ensureFile(pathname) {
  let stat;
  try {
    stat = fs.statSync(pathname);
  } catch (error) {
    if (error && error.code === "ENOENT") return;
    throw error;
  }

  if (stat.isDirectory()) {
    const error = new Error(`Expected a file but found a directory: ${pathname}`);
    error.code = "EISDIR";
    throw error;
  }
}

function temporaryPath(targetPath) {
  const directory = path.dirname(targetPath);
  const extension = path.extname(targetPath);
  const basename = path.basename(targetPath, extension);
  const suffix = require("crypto").randomBytes(6).toString("hex");
  return path.join(directory, `.${basename}.${suffix}.tmp`);
}

function writeFileAtomic(targetPath, data, options = {}) {
  const { encoding = "utf8", mode = 0o644 } = options;
  const directory = path.dirname(targetPath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const tempPath = temporaryPath(targetPath);

  try {
    fs.writeFileSync(tempPath, data, { encoding, mode });
    fs.renameSync(tempPath, targetPath);
    return true;
  } catch (error) {
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {}
    throw error;
  }
}

function addFrontmatter(content, filePath) {
  if (parseMarkdownFrontmatter(content).frontmatter) return content;

  const name = path.basename(filePath, ".md");
  return [
    "---",
    `name: ${name}`,
    "description: Describe when this agent should be used.",
    "tools: Read, Grep, Glob",
    "---",
    "",
    content.trim()
  ].join("\n");
}

function addRole(content) {
  if (
    /you are/i.test(content) ||
    /##\s+(?:your\s+)?role/i.test(content)
  ) {
    return content;
  }

  return `${content.trim()}\n\n## Role\n\nYou are a specialized agent responsible for the task described above.\n`;
}

function addOutputFormat(content) {
  if (/##\s*(?:output\s*format|format|response)/i.test(content)) {
    return content;
  }

  return `${content.trim()}\n\n## Output Format\n\nReturn a concise, structured response containing the result and any required supporting details.\n`;
}

function addConstraints(content) {
  if (/#{2,3}\s+(?:constraints?|rules?|workflow\s+gates)/i.test(content)) {
    return content;
  }

  return `${content.trim()}\n\n## Constraints\n\n- Stay within the requested scope.\n- Do not invent unsupported facts.\n- Report blockers and uncertainty explicitly.\n`;
}

function restrictBash(content) {
  if (!content || typeof content !== "string") return content;

  const parsed = parseMarkdownFrontmatter(content);
  if (!parsed.frontmatter) {
    return content.replace(/\bBash\b(?!\()/g, "Bash(command:*)");
  }

  const lines = content.split("\n");
  let closing = -1;

  for (let index = 1; index < lines.length; index++) {
    if (lines[index].trim() === "---") {
      closing = index;
      break;
    }
  }

  if (closing < 0) return content;

  for (let index = 1; index < closing; index++) {
    if (/^\s*tools\s*:/.test(lines[index])) {
      lines[index] = lines[index].replace(
        /\b(?:Bash|Shell)\b(?!\()/gi,
        "Bash(command:*)"
      );
    }
  }

  return lines.join("\n");
}

function addXmlStructure(content) {
  if (!content || typeof content !== "string" || /<\w+>/i.test(content)) {
    return content;
  }

  return `<instructions>\n${content.trim()}\n</instructions>\n`;
}

function improveExamples(content) {
  if (!content || typeof content !== "string") return content;
  if (/<example>|##\s*example/i.test(content)) return content;

  return `${content.trim()}\n\n## Examples\n\n<example>\nProvide one representative input and expected output here.\n</example>\n`;
}

function simplifyLanguage(content) {
  if (!content || typeof content !== "string") return content;

  const replacements = [
    [/\bin order to\b/gi, "to"],
    [/\bfor the purpose of\b/gi, "to"],
    [/\bin the event that\b/gi, "if"],
    [/\bat this point in time\b/gi, "now"],
    [/\bdue to the fact that\b/gi, "because"],
    [/\bhas the ability to\b/gi, "can"],
    [/\bis able to\b/gi, "can"],
    [/\bmake use of\b/gi, "use"],
    [/\ba large number of\b/gi, "many"],
    [/\ba small number of\b/gi, "few"],
    [/\bthe majority of\b/gi, "most"],
    [/\bprior to\b/gi, "before"],
    [/\bsubsequent to\b/gi, "after"]
  ];

  const codeBlocks = [];
  let output = content.replace(/

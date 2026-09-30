/**
 * Agent Analyzer
 * Main orchestrator for agent prompt optimization analysis
 *
 * @author Avi Fenesh
 * @license MIT
 */

const fs = require("fs");
const path = require("path");

const agentPatterns = {
  missing_frontmatter: pattern("structure", "HIGH", true, "Agent prompt missing YAML frontmatter (---...---)"),
  missing_name: pattern("structure", "HIGH", false, 'Frontmatter missing "name" field'),
  missing_description: pattern("structure", "HIGH", false, 'Frontmatter missing "description" field'),
  missing_role: pattern("structure", "HIGH", true, 'No role section ("You are..." or "## Role")'),
  missing_output_format: pattern("structure", "HIGH", false, "No output format specification"),
  missing_constraints: pattern("structure", "HIGH", false, "No constraints section"),
  unrestricted_tools: pattern("tool", "HIGH", false, 'No "tools" field in frontmatter (all tools allowed)'),
  unrestricted_bash: pattern("tool", "HIGH", true, 'Has "Bash" without restrictions (should be "Bash(git:*)" etc)'),
  missing_xml_structure: pattern("xml", "MEDIUM", false, "Could benefit from XML tags for structure"),
  unnecessary_cot: pattern("cot", "MEDIUM", false, "Step-by-step reasoning on simple tasks"),
  missing_cot: pattern("cot", "MEDIUM", false, "Complex reasoning without thinking guidance"),
  example_count_suboptimal: pattern("example", "LOW", false, "Not 2-5 examples"),
  vague_instructions: pattern("anti-pattern", "MEDIUM", false, 'Fuzzy language like "usually", "sometimes"'),
  prompt_bloat: { ...pattern("anti-pattern", "LOW", false, "Token count > 2000"), maxTokens: 2000 },
  hardcoded_claude_dir: pattern("cross-platform", "HIGH", false, "Hardcoded .claude/ directory (breaks OpenCode/Codex)"),
  claude_md_reference: pattern("cross-platform", "MEDIUM", false, "References CLAUDE.md without also checking AGENTS.md"),
  no_xml_for_data: pattern("cross-platform", "LOW", false, "Data blocks without XML tags (helps both Claude and GPT-4)"),
};

function pattern(category, certainty, autoFix, description) {
  return { id: null, category, certainty, autoFix, description };
}

// Assigning IDs separately avoids coupling the readable declarations above to
// their property names while retaining the objects exposed by the original.
for (const [id, definition] of Object.entries(agentPatterns)) definition.id = id;

function parseMarkdownFrontmatter(content) {
  if (!content.startsWith("---")) return { frontmatter: null, body: content };

  const closingMarker = content.indexOf("\n---", 3);
  if (closingMarker < 0) return { frontmatter: null, body: content };

  const frontmatter = {};
  const header = content.slice(3, closingMarker).trim();
  for (const line of header.split("\n")) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (/^-?\d+(?:\.\d+)?$/.test(value)) value = Number(value);
    frontmatter[key] = value;
  }

  return {
    frontmatter,
    body: content.slice(closingMarker + 4).replace(/^\r?\n/, ""),
  };
}

function issue(file, patternId, message, fix, includeFilePath = false) {
  const finding = {
    issue: message,
    fix,
    file,
    certainty: agentPatterns[patternId]?.certainty || "HIGH",
    patternId,
  };
  if (includeFilePath) finding.filePath = file;
  return finding;
}

function emptyAnalysis(agentPath) {
  return {
    agentName: path.basename(agentPath, path.extname(agentPath)),
    agentPath,
    frontmatter: null,
    structureIssues: [],
    toolIssues: [],
    xmlIssues: [],
    cotIssues: [],
    exampleIssues: [],
    antiPatternIssues: [],
    crossPlatformIssues: [],
  };
}

function analyzeAgent(agentPath) {
  const result = emptyAnalysis(agentPath);
  if (!fs.existsSync(agentPath)) {
    result.structureIssues.push({
      issue: "File not found",
      file: agentPath,
      certainty: "HIGH",
      patternId: "file_not_found",
    });
    return result;
  }

  const source = fs.readFileSync(agentPath, "utf8");
  const { frontmatter, body } = parseMarkdownFrontmatter(source);
  result.frontmatter = frontmatter;

  if (!frontmatter) {
    result.structureIssues.push(issue(agentPath, "missing_frontmatter", "Missing YAML frontmatter", "Add frontmatter with name, description, tools, model"));
  } else {
    if (!frontmatter.name) result.structureIssues.push(issue(agentPath, "missing_name", "Frontmatter missing name", 'Add a "name" field to frontmatter'));
    if (!frontmatter.description) result.structureIssues.push(issue(agentPath, "missing_description", "Frontmatter missing description", 'Add a "description" field to frontmatter'));
    if (!Object.hasOwn(frontmatter, "tools")) {
      result.toolIssues.push(issue(agentPath, "unrestricted_tools", "No tools restriction", "Add a tools field listing only required tools"));
    } else if (/(^|[\s,])Bash([\s,]|$)/.test(String(frontmatter.tools))) {
      result.toolIssues.push(issue(agentPath, "unrestricted_bash", "Unrestricted Bash access", 'Replace "Bash" with "Bash(git:*)" or specific scope', true));
    }
  }

  if (!/(?:^|\n)#{1,3}\s+Role\b/i.test(body) && !/\bYou are\b/i.test(body)) {
    result.structureIssues.push(issue(agentPath, "missing_role", "Missing role definition", "Add role section explaining agent purpose", true));
  }
  if (!/(?:^|\n)#{1,4}\s+(?:Output(?: Format)?|Response Format)\b/i.test(body)) {
    result.structureIssues.push(issue(agentPath, "missing_output_format", "Missing output format specification", "Add section specifying expected output format"));
  }
  if (!/(?:^|\n)#{1,4}\s+(?:Constraints|Limitations|Rules)\b/i.test(body)) {
    result.structureIssues.push(issue(agentPath, "missing_constraints", "Missing constraints section", "Add section defining agent limitations and boundaries"));
  }

  if (/\b(?:think|reason|work) step[- ]by[- ]step\b/i.test(body) && /\b(?:simple|straightforward|every)\b/i.test(body)) {
    result.cotIssues.push(issue(agentPath, "unnecessary_cot", "Unnecessary chain-of-thought for simple task", "Remove step-by-step instructions for straightforward operations"));
  }
  if (/\.claude(?:\/|\\)/i.test(source)) {
    result.crossPlatformIssues.push(issue(agentPath, "hardcoded_claude_dir", "Hardcoded .claude/ directory path", "Use AI_STATE_DIR env var or platform detection for cross-platform support"));
  }
  if (/CLAUDE\.md/i.test(source) && !/AGENTS\.md/i.test(source)) {
    result.crossPlatformIssues.push(issue(agentPath, "claude_md_reference", "References CLAUDE.md without AGENTS.md", "Also check for AGENTS.md (used by OpenCode/Codex)"));
  }

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  if (wordCount > agentPatterns.prompt_bloat.maxTokens) {
    result.antiPatternIssues.push(issue(agentPath, "prompt_bloat", `Prompt is very long (${wordCount} words)`, "Reduce prompt length and remove redundant instructions"));
  }
  return result;
}

function collectMarkdownFiles(targetPath) {
  if (!fs.existsSync(targetPath)) return [];
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) return path.extname(targetPath).toLowerCase() === ".md" ? [targetPath] : [];

  return fs.readdirSync(targetPath, { withFileTypes: true })
    .flatMap((entry) => {
      if (entry.name === "node_modules" || entry.name === ".git") return [];
      const child = path.join(targetPath, entry.name);
      if (entry.isDirectory()) return collectMarkdownFiles(child);
      return entry.isFile() && path.extname(entry.name).toLowerCase() === ".md" ? [child] : [];
    });
}

function analyzeAllAgents(agentsPath) {
  return collectMarkdownFiles(agentsPath).map(analyzeAgent);
}

function analyze(options = {}) {
  const target = typeof options === "string"
    ? options
    : options.path || options.agentsPath || process.cwd();
  return analyzeAllAgents(target);
}

function allFindings(analysis) {
  return Object.entries(analysis)
    .filter(([key, value]) => key.endsWith("Issues") && Array.isArray(value))
    .flatMap(([, findings]) => findings);
}

function applyFixes(analyses) {
  const items = Array.isArray(analyses) ? analyses : [analyses];
  const outcome = { applied: [], skipped: [], errors: [] };

  for (const analysis of items.filter(Boolean)) {
    const file = analysis.agentPath;
    if (!file || !fs.existsSync(file)) continue;
    try {
      let source = fs.readFileSync(file, "utf8");
      for (const finding of allFindings(analysis)) {
        if (!agentPatterns[finding.patternId]?.autoFix) {
          outcome.skipped.push({ file, patternId: finding.patternId, reason: "No automatic fix available" });
          continue;
        }
        if (finding.patternId === "missing_frontmatter" && !source.startsWith("---")) {
          const name = path.basename(file, path.extname(file));
          source = `---\nname: ${name}\ndescription: ${name} agent\ntools: Read\n---\n\n${source}`;
        } else if (finding.patternId === "missing_role") {
          source = `## Role\n\nYou are an AI assistant for this task.\n\n${source}`;
        } else if (finding.patternId === "unrestricted_bash") {
          source = source.replace(/^(tools:\s*.*)\bBash\b(?!\()/m, "$1Bash(git:*)");
        } else {
          outcome.skipped.push({ file, patternId: finding.patternId, reason: "No automatic fix available" });
          continue;
        }
        outcome.applied.push({ file, patternId: finding.patternId });
      }
      if (outcome.applied.some((entry) => entry.file === file)) fs.writeFileSync(file, source);
    } catch (error) {
      outcome.errors.push({ file, error: error.message });
    }
  }
  return outcome;
}

function countByCertainty(analyses) {
  const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const analysis of analyses) {
    for (const finding of allFindings(analysis)) counts[finding.certainty] += 1;
  }
  return counts;
}

function generateReport(analyses) {
  const items = Array.isArray(analyses) ? analyses : [];
  const totals = countByCertainty(items);
  const lines = [
    "# Agent Analysis Summary",
    "",
    `**Analyzed**: ${items.length} agents`,
    `**Date**: ${new Date().toISOString()}`,
    "",
    "## Overall",
    "",
    "| Certainty | Count |",
    "|-----------|-------|",
    `| HIGH | ${totals.HIGH} |`,
    `| MEDIUM | ${totals.MEDIUM} |`,
    "",
    "## By Agent",
    "",
    "| Agent | HIGH | MEDIUM | LOW | Total |",
    "|-------|------|--------|-----|-------|",
  ];
  for (const analysis of items) {
    const counts = countByCertainty([analysis]);
    lines.push(`| ${analysis.agentName} | ${counts.HIGH} | ${counts.MEDIUM} | ${counts.LOW} | ${counts.HIGH + counts.MEDIUM + counts.LOW} |`);
  }
  return `${lines.join("\n")}\n`;
}

module.exports = {
  parseMarkdownFrontmatter,
  analyzeAgent,
  analyzeAllAgents,
  analyze,
  applyFixes,
  generateReport,
};

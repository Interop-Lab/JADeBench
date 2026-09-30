'use strict';

/**
 * Agent prompt analyzer.
 *
 * The module checks Markdown agent definitions for structural and portability
 * problems, can apply the safe automatic fixes, and renders text reports.
 */

const fs = require('fs');
const path = require('path');

const CERTAINTY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

function issue(id, category, certainty, description, autoFix, check) {
  return { id, category, certainty, autoFix, description, check };
}

const patternList = [
  issue(
    'missing_frontmatter',
    'structure',
    CERTAINTY.HIGH,
    'Agent prompt missing YAML frontmatter (---...---)',
    true,
    ({ hasFrontmatter }) => !hasFrontmatter,
  ),
  issue(
    'missing_name',
    'structure',
    CERTAINTY.HIGH,
    'Frontmatter missing "name" field',
    true,
    ({ hasFrontmatter, frontmatter }) => hasFrontmatter && !frontmatter.name,
  ),
  issue(
    'missing_description',
    'structure',
    CERTAINTY.HIGH,
    'Frontmatter missing "description" field',
    true,
    ({ hasFrontmatter, frontmatter }) => hasFrontmatter && !frontmatter.description,
  ),
  issue(
    'missing_role',
    'structure',
    CERTAINTY.HIGH,
    'No role section ("You are..." or "## Role")',
    true,
    ({ body }) => !/(^|\n)#{1,3}\s+role\b|\byou are\b/i.test(body),
  ),
  issue(
    'missing_output_format',
    'structure',
    CERTAINTY.HIGH,
    'No output format specification',
    true,
    ({ body }) => !/(^|\n)#{1,3}\s+(output|response)(\s+format)?\b|\boutput format\b/i.test(body),
  ),
  issue(
    'missing_constraints',
    'structure',
    CERTAINTY.HIGH,
    'No constraints section',
    true,
    ({ body }) => !/(^|\n)#{1,3}\s+(constraints|rules|limitations)\b/i.test(body),
  ),
  issue(
    'unrestricted_tools',
    'tool',
    CERTAINTY.HIGH,
    'No "tools" field in frontmatter (all tools allowed)',
    false,
    ({ frontmatter }) => !frontmatter.tools,
  ),
  issue(
    'unrestricted_bash',
    'tool',
    CERTAINTY.HIGH,
    'Has "Bash" without restrictions (should be "Bash(git:*)" etc)',
    true,
    ({ frontmatter }) => /(^|[\s,[])Bash([\s,\]]|$)/.test(frontmatter.tools || ''),
  ),
  issue(
    'missing_xml_structure',
    'xml',
    CERTAINTY.MEDIUM,
    'Could benefit from XML tags for structure',
    true,
    ({ body }) => body.length > 500 && !/<[a-z][\w-]*(?:\s[^>]*)?>/i.test(body),
  ),
  issue(
    'unnecessary_cot',
    'cot',
    CERTAINTY.MEDIUM,
    'Step-by-step reasoning on simple tasks',
    false,
    ({ body }) => /(?:think|reason|work) step[- ]by[- ]step/i.test(body) && body.length < 800,
  ),
  issue(
    'missing_cot',
    'cot',
    CERTAINTY.MEDIUM,
    'Complex reasoning without thinking guidance',
    false,
    ({ body }) => body.length > 1500 && !/(?:think|reason|plan|analy[sz]e)/i.test(body),
  ),
  issue(
    'example_count_suboptimal',
    'example',
    CERTAINTY.LOW,
    'Not 2-5 examples',
    true,
    ({ body }) => {
      const count = (body.match(/(^|\n)#{1,4}\s+example\b/gi) || []).length;
      return count < 2 || count > 5;
    },
  ),
  issue(
    'vague_instructions',
    'anti-pattern',
    CERTAINTY.MEDIUM,
    'Fuzzy language like "usually", "sometimes"',
    false,
    ({ body }) => /\b(?:usually|sometimes|generally|typically|often|maybe|perhaps)\b/i.test(body),
  ),
  issue(
    'prompt_bloat',
    'anti-pattern',
    CERTAINTY.MEDIUM,
    'Token count > 2000',
    false,
    ({ body }) => estimateTokens(body) > 2000,
  ),
  issue(
    'hardcoded_claude_dir',
    'cross-platform',
    CERTAINTY.HIGH,
    'Hardcoded .claude/ directory (breaks OpenCode/Codex)',
    false,
    ({ body }) => /(?:^|[\\/])\.claude[\\/]/i.test(body),
  ),
  issue(
    'claude_md_reference',
    'cross-platform',
    CERTAINTY.MEDIUM,
    'References CLAUDE.md without also checking AGENTS.md',
    false,
    ({ body }) => /CLAUDE\.md/i.test(body) && !/AGENTS\.md/i.test(body),
  ),
  issue(
    'no_xml_for_data',
    'xml',
    CERTAINTY.LOW,
    'Data blocks without XML tags (helps both Claude and GPT-4)',
    false,
    ({ body }) => /```[\s\S]*?```/.test(body) && !/<(?:data|context|input|example)>/i.test(body),
  ),
];

const agentPatterns = {
  getAllPatterns() {
    return patternList.slice();
  },

  getPatternsByCertainty(certainty) {
    return patternList.filter((pattern) => pattern.certainty === certainty);
  },

  getPatternsByCategory(category) {
    return patternList.filter((pattern) => pattern.category === category);
  },

  getAutoFixablePatterns() {
    return patternList.filter((pattern) => pattern.autoFix);
  },
};

function parseMarkdownFrontmatter(markdown) {
  if (typeof markdown !== 'string') {
    return { frontmatter: {}, body: '' };
  }

  const source = markdown.trim();
  if (!source.startsWith('---')) {
    return { frontmatter: {}, body: source };
  }

  const lines = source.split('\n');
  const closingLine = lines.slice(1).indexOf('---') + 1;
  if (closingLine === 0) {
    return { frontmatter: {}, body: source };
  }

  const frontmatter = {};
  for (const line of lines.slice(1, closingLine)) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;

    const key = line.substring(0, separator).trim();
    const value = line.substring(separator + 1).trim();
    if (key) frontmatter[key] = parseFrontmatterValue(value);
  }

  return {
    frontmatter,
    body: lines.slice(closingLine + 1).join('\n').trim(),
  };
}

function parseFrontmatterValue(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

function analyzeAgent(filePath) {
  const agentName = path.basename(filePath, '.md');
  const result = {
    agentName,
    agentPath: filePath,
    frontmatter: {},
    structureIssues: [],
    toolIssues: [],
    xmlIssues: [],
    cotIssues: [],
    exampleIssues: [],
    antiPatternIssues: [],
    crossPlatformIssues: [],
  };

  if (!fs.existsSync(filePath)) {
    result.structureIssues.push({
      issue: 'File not found',
      file: filePath,
      certainty: CERTAINTY.HIGH,
      patternId: 'file_not_found',
    });
    return result;
  }

  let source;
  try {
    source = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    result.structureIssues.push({
      issue: `Failed to read file: ${error.message}`,
      file: filePath,
      certainty: CERTAINTY.HIGH,
      patternId: 'read_error',
    });
    return result;
  }

  const parsed = parseMarkdownFrontmatter(source);
  result.frontmatter = parsed.frontmatter;
  const context = {
    source,
    body: parsed.body,
    frontmatter: parsed.frontmatter,
    hasFrontmatter: source.trim().startsWith('---') && source.trim().split('\n').slice(1).includes('---'),
    filePath,
  };

  for (const pattern of patternList) {
    if (!pattern.check(context)) continue;
    const finding = {
      issue: pattern.description,
      file: filePath,
      certainty: pattern.certainty,
      patternId: pattern.id,
      autoFix: pattern.autoFix,
    };
    result[categoryProperty(pattern.category)].push(finding);
  }

  return result;
}

function categoryProperty(category) {
  return {
    structure: 'structureIssues',
    tool: 'toolIssues',
    xml: 'xmlIssues',
    cot: 'cotIssues',
    example: 'exampleIssues',
    'anti-pattern': 'antiPatternIssues',
    'cross-platform': 'crossPlatformIssues',
  }[category];
}

function analyzeAllAgents(agentsDirectory) {
  if (!fs.existsSync(agentsDirectory)) return [];

  const results = [];
  for (const entry of fs.readdirSync(agentsDirectory).filter((name) => name.endsWith('.md'))) {
    results.push(analyzeAgent(path.join(agentsDirectory, entry)));
  }
  return results;
}

function analyze(options = {}) {
  if (typeof options === 'string') return analyzeAgent(options);

  const agent = options.agent;
  const agentsDirectory = options.agentsDir || 'plugins/enhance/agents';
  if (agent) {
    const filePath = agent.endsWith('.md') ? agent : path.join(agentsDirectory, `${agent}.md`);
    return analyzeAgent(filePath);
  }
  return analyzeAllAgents(agentsDirectory);
}

function allFindings(analysis) {
  return [
    ...analysis.structureIssues,
    ...analysis.toolIssues,
    ...analysis.xmlIssues,
    ...analysis.cotIssues,
    ...analysis.exampleIssues,
    ...analysis.antiPatternIssues,
    ...analysis.crossPlatformIssues,
  ];
}

function applyFixes(analysisOrAnalyses) {
  const analyses = Array.isArray(analysisOrAnalyses) ? analysisOrAnalyses : [analysisOrAnalyses];
  const fixed = [];

  for (const analysis of analyses) {
    if (!analysis || !analysis.agentPath || !fs.existsSync(analysis.agentPath)) continue;

    const fixableIds = new Set(
      allFindings(analysis)
        .filter((finding) => finding.autoFix)
        .map((finding) => finding.patternId),
    );
    if (fixableIds.size === 0) continue;

    const original = fs.readFileSync(analysis.agentPath, 'utf8');
    const updated = applySafeTextFixes(original, analysis.agentName, fixableIds);
    if (updated === original) continue;

    writeFileAtomic(analysis.agentPath, updated);
    fixed.push(analysis.agentPath);
  }

  return fixed;
}

function applySafeTextFixes(source, agentName, fixableIds) {
  let parsed = parseMarkdownFrontmatter(source);
  const frontmatter = { ...parsed.frontmatter };
  let body = parsed.body;

  if (fixableIds.has('missing_frontmatter') || fixableIds.has('missing_name')) {
    if (!frontmatter.name) frontmatter.name = agentName;
  }
  if (fixableIds.has('missing_frontmatter') || fixableIds.has('missing_description')) {
    if (!frontmatter.description) frontmatter.description = `${agentName} agent`;
  }
  if (fixableIds.has('unrestricted_bash') && typeof frontmatter.tools === 'string') {
    frontmatter.tools = frontmatter.tools.replace(/\bBash\b/g, 'Bash(git:*)');
  }
  if (fixableIds.has('missing_role')) {
    body = `## Role\n\nYou are the ${agentName} agent.\n\n${body}`;
  }
  if (fixableIds.has('missing_output_format')) {
    body += '\n\n## Output Format\n\nProvide a concise Markdown response.';
  }
  if (fixableIds.has('missing_constraints')) {
    body += '\n\n## Constraints\n\n- Follow the requested scope.\n- Do not invent unavailable information.';
  }
  if (fixableIds.has('missing_xml_structure')) {
    body = `<instructions>\n${body}\n</instructions>`;
  }

  if (Object.keys(frontmatter).length === 0) return `${body.trim()}\n`;
  const header = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${formatFrontmatterValue(value)}`)
    .join('\n');
  return `---\n${header}\n---\n\n${body.trim()}\n`;
}

function formatFrontmatterValue(value) {
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  return String(value);
}

function writeFileAtomic(filePath, contents) {
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporaryPath, contents, 'utf8');
  fs.renameSync(temporaryPath, filePath);
}

function generateReport(analysisOrAnalyses) {
  const analyses = Array.isArray(analysisOrAnalyses) ? analysisOrAnalyses : [analysisOrAnalyses];
  if (analyses.length !== 1) return generateSummaryReport(analyses);
  return generateAgentReport(analyses[0]);
}

function generateAgentReport(analysis) {
  if (!analysis) return '';

  const findings = allFindings(analysis);
  const lines = [
    `# Agent Analysis: ${analysis.agentName}`,
    '',
    `File: ${analysis.agentPath}`,
    `Issues: ${findings.length}`,
    '',
  ];

  if (findings.length === 0) {
    lines.push('No issues found.');
  } else {
    for (const finding of findings) {
      lines.push(`- [${finding.certainty}] ${finding.issue} (${finding.patternId})`);
    }
  }
  return `${lines.join('\n')}\n`;
}

function generateSummaryReport(analyses) {
  const totalIssues = analyses.reduce((total, analysis) => total + allFindings(analysis).length, 0);
  const lines = [
    '# Agent Analysis Summary',
    '',
    `Agents: ${analyses.length}`,
    `Issues: ${totalIssues}`,
    '',
  ];

  for (const analysis of analyses) {
    lines.push(`- ${analysis.agentName}: ${allFindings(analysis).length} issue(s)`);
  }
  return `${lines.join('\n')}\n`;
}

module.exports = {
  parseMarkdownFrontmatter,
  analyzeAgent,
  analyzeAllAgents,
  analyze,
  applyFixes,
  generateReport,
};

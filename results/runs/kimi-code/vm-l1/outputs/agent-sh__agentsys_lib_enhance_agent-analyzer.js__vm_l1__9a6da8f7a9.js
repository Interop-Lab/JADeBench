const fs = require('fs');
const path = require('path');

function parseMarkdownFrontmatter(content) {
  if (typeof content !== 'string' || !/^---\r?\n/.test(content)) {
    return { frontmatter: null, body: content };
  }

  const match = content.match(/^---\r?\n([\s\S]*?)\s*---(?:\r?\n|$)/);
  if (!match) return { frontmatter: null, body: content };

  const frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    if (key) frontmatter[key] = line.slice(separator + 1).trim();
  }

  return { frontmatter, body: content.slice(match[0].length) };
}

function makeIssue(patternId, issue, fix, file, includeFilePath = false, certainty = 'HIGH') {
  const finding = { issue, fix, file };
  if (includeFilePath) finding.filePath = file;
  finding.certainty = certainty;
  finding.patternId = patternId;
  return finding;
}

function createAnalysis(agentPath) {
  return {
    agentName: path.basename(agentPath, '.md'),
    agentPath,
    frontmatter: null,
    structureIssues: [],
    toolIssues: [],
    xmlIssues: [],
    cotIssues: [],
    exampleIssues: [],
    antiPatternIssues: [],
    crossPlatformIssues: []
  };
}

function analyzeAgent(agentPath) {
  const analysis = createAnalysis(agentPath);
  if (!fs.existsSync(agentPath)) {
    analysis.structureIssues.push({ issue: 'File not found', file: agentPath, certainty: 'HIGH', patternId: 'file_not_found' });
    return analysis;
  }

  const content = fs.readFileSync(agentPath, 'utf8');
  const { frontmatter, body } = parseMarkdownFrontmatter(content);
  analysis.frontmatter = frontmatter;
  if (!content.trim()) return analysis;

  if (!frontmatter) {
    analysis.structureIssues.push(makeIssue('missing_frontmatter', 'Missing YAML frontmatter', 'Add frontmatter with name, description, tools, model', agentPath));
  } else {
    if (!frontmatter.name) analysis.structureIssues.push(makeIssue('missing_name', 'Missing name in frontmatter', 'Add a name field to frontmatter', agentPath));
    if (!frontmatter.description) analysis.structureIssues.push(makeIssue('missing_description', 'Missing description in frontmatter', 'Add a description field to frontmatter', agentPath));
  }

  if (!/You are|#{2,3}\s+(?:Your\s+)?Role\b/i.test(body)) {
    analysis.structureIssues.push(makeIssue('missing_role', 'Missing role definition', 'Add role section explaining agent purpose', agentPath, true));
  }
  if (!/#{2,3}\s+(?:Output|Response) Format\b/i.test(body)) {
    analysis.structureIssues.push(makeIssue('missing_output_format', 'Missing output format specification', 'Add section specifying expected output format', agentPath));
  }
  if (!/#{2,3}\s+(?:Constraints|Rules)\b/i.test(body)) {
    analysis.structureIssues.push(makeIssue('missing_constraints', 'Missing constraints section', 'Add section defining agent limitations and boundaries', agentPath));
  }

  if (frontmatter && !frontmatter.tools) {
    analysis.toolIssues.push(makeIssue('unrestricted_tools', 'No tools restriction - agent has access to all tools', 'Add "tools" field to frontmatter with specific tools needed', agentPath));
  }
  if (frontmatter?.tools && /(?:^|,\s*)Bash(?:\s*,|$)/.test(frontmatter.tools)) {
    analysis.toolIssues.push(makeIssue('unrestricted_bash', 'Unrestricted Bash access', 'Replace "Bash" with "Bash(git:*)" or specific scope', agentPath, true));
  }

  const headingCount = (body.match(/^#{2,3}\s+/gm) || []).length;
  const hasXml = /<([A-Za-z][\w-]*)\b[^>]*>[\s\S]*<\/\1>/i.test(body);
  if (headingCount >= 5 && !hasXml) {
    analysis.xmlIssues.push(makeIssue('missing_xml_structure', 'Complex prompt without XML structure', 'Consider using XML tags for key sections (e.g., <rules>, <examples>)', agentPath, false, 'MEDIUM'));
  }

  if (/(?:think|reason)?\s*step[- ]by[- ]step/i.test(body)) {
    analysis.cotIssues.push(makeIssue('unnecessary_cot', 'Unnecessary chain-of-thought for simple task', 'Remove step-by-step instructions for straightforward operations', agentPath, false, 'MEDIUM'));
  }

  if (/\busually\b/i.test(body) && /\bsometimes\b/i.test(body) && /\boften\b/i.test(body) && /\bmaybe\b/i.test(body)) {
    analysis.antiPatternIssues.push(makeIssue('vague_instructions', 'Found vague language: usually, sometimes, often...', 'Replace fuzzy language with clear, definitive instructions', agentPath, false, 'MEDIUM'));
  }

  if (/\.claude[\\/]/i.test(content)) {
    analysis.crossPlatformIssues.push(makeIssue('hardcoded_claude_dir', 'Hardcoded .claude/ directory path', 'Use AI_STATE_DIR env var or platform detection for cross-platform support', agentPath));
  }
  if (/CLAUDE\.md/i.test(content) && !/AGENTS\.md/i.test(content)) {
    analysis.crossPlatformIssues.push(makeIssue('claude_md_reference', 'References CLAUDE.md without AGENTS.md', 'Also check for AGENTS.md (used by OpenCode/Codex)', agentPath, false, 'MEDIUM'));
  }

  return analysis;
}

function analyzeAllAgents(directory) {
  if (!directory || typeof directory !== 'string' || !fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter(name => name.endsWith('.md'))
    .map(name => analyzeAgent(path.join(directory, name)));
}

function analyze() {
  return analyzeAllAgents('plugins/enhance/agents');
}

const issueGroups = [
  'structureIssues',
  'toolIssues',
  'xmlIssues',
  'cotIssues',
  'exampleIssues',
  'antiPatternIssues',
  'crossPlatformIssues'
];

function applyFixes(analysis) {
  const result = { applied: [], skipped: [], errors: [] };
  const filePath = analysis?.agentPath;
  if (!filePath || !fs.existsSync(filePath)) return result;

  let content = fs.readFileSync(filePath, 'utf8');
  for (const finding of issueGroups.flatMap(group => analysis[group] || [])) {
    try {
      let changed = false;
      if (finding.patternId === 'missing_frontmatter') {
        content = `---\nname: agent-name\ndescription: Agent description\ntools: Read, Glob, Grep\nmodel: sonnet\n---\n\n${content}`;
        changed = true;
      } else if (finding.patternId === 'missing_role') {
        const insertion = '\n## Your Role\n\nYou are an agent that [describe agent purpose].\n\n';
        const parsed = parseMarkdownFrontmatter(content);
        content = parsed.frontmatter ? content.slice(0, content.length - parsed.body.length) + insertion + parsed.body : insertion + content;
        changed = true;
      } else if (finding.patternId === 'missing_output_format') {
        content += '\n\n## Output Format\n\nRespond with:\n- [Describe expected format: JSON, markdown, plain text, etc.]\n- [Include any specific structure requirements]\n';
        changed = true;
      } else if (finding.patternId === 'unrestricted_bash') {
        content = content.replace(/^(tools:\s*.*?)\bBash\b/m, '$1Bash(git:*)');
        changed = true;
      }

      if (changed) result.applied.push({ issue: finding.issue, fix: finding.fix, filePath });
      else result.skipped.push({ ...finding, reason: 'No auto-fix available for this pattern' });
    } catch (error) {
      result.errors.push({ issue: finding.issue, filePath, error: error.message });
    }
  }

  if (result.applied.length) fs.writeFileSync(filePath, content);
  return result;
}

function generateReport(analysis) {
  const groups = [
    ['Structure Issues', analysis.structureIssues],
    ['Tool Issues', analysis.toolIssues],
    ['XML Structure Issues', analysis.xmlIssues],
    ['Chain-of-Thought Issues', analysis.cotIssues],
    ['Example Issues', analysis.exampleIssues],
    ['Anti-Pattern Issues', analysis.antiPatternIssues],
    ['Cross-Platform Issues', analysis.crossPlatformIssues]
  ];
  const findings = groups.flatMap(([, items]) => items || []);
  const count = certainty => findings.filter(item => item.certainty === certainty).length;

  let report = `# Agent Analysis: ${analysis.agentName}\n\n**File**: ${analysis.agentPath}\n**Analyzed**: ${new Date().toISOString()}\n\n## Summary\n\n| Certainty | Count |\n|-----------|-------|\n| HIGH | ${count('HIGH')} |\n| MEDIUM | ${count('MEDIUM')} |\n`;
  for (const [title, items] of groups) {
    if (!items?.length) continue;
    report += `\n### ${title} (${items.length})\n\n| Issue | Fix | Certainty |\n|-------|-----|-----------|\n`;
    for (const item of items) report += `| ${item.issue} | ${item.fix} | ${item.certainty} |\n`;
  }
  return report;
}

module.exports = { parseMarkdownFrontmatter, analyzeAgent, analyzeAllAgents, analyze, applyFixes, generateReport };

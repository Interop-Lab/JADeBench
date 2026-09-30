const fs = require('fs');
const path = require('path');

const ISSUE_GROUPS = [
  'structureIssues',
  'toolIssues',
  'xmlIssues',
  'cotIssues',
  'exampleIssues',
  'antiPatternIssues',
  'crossPlatformIssues',
];

const patternDefinitions = {
  missing_frontmatter: ['structure', 'HIGH', true, 'Agent prompt missing YAML frontmatter (---...---)'],
  missing_name: ['structure', 'HIGH', false, 'Frontmatter missing "name" field'],
  missing_description: ['structure', 'HIGH', false, 'Frontmatter missing "description" field'],
  missing_role: ['structure', 'HIGH', true, 'No role section ("You are..." or "## Role")'],
  missing_output_format: ['structure', 'HIGH', false, 'No output format specification'],
  missing_constraints: ['structure', 'HIGH', false, 'No constraints section'],
  unrestricted_tools: ['tool', 'HIGH', false, 'No "tools" field in frontmatter (all tools allowed)'],
  unrestricted_bash: ['tool', 'HIGH', true, 'Has "Bash" without restrictions (should be "Bash(git:*)" etc)'],
  missing_xml_structure: ['xml', 'MEDIUM', false, 'Could benefit from XML tags for structure'],
  unnecessary_cot: ['cot', 'MEDIUM', false, 'Step-by-step reasoning on simple tasks'],
  missing_cot: ['cot', 'MEDIUM', false, 'Complex reasoning without thinking guidance'],
  example_count_suboptimal: ['example', 'LOW', false, 'Not 2-5 examples'],
  vague_instructions: ['anti-pattern', 'MEDIUM', false, 'Fuzzy language like "usually", "sometimes"'],
  prompt_bloat: ['anti-pattern', 'LOW', false, 'Token count > 2000'],
  hardcoded_claude_dir: ['cross-platform', 'HIGH', false, 'Hardcoded .claude/ directory (breaks OpenCode/Codex)'],
  claude_md_reference: ['cross-platform', 'MEDIUM', false, 'References CLAUDE.md without also checking AGENTS.md'],
  no_xml_for_data: ['cross-platform', 'LOW', false, 'Data blocks without XML tags (helps both Claude and GPT-4)'],
};

const findings = {
  missing_frontmatter: ['Missing YAML frontmatter', 'Add frontmatter with name, description, tools, model'],
  missing_name: ['Frontmatter missing "name" field', 'Add "name" field to frontmatter'],
  missing_description: ['Frontmatter missing "description" field', 'Add "description" field to frontmatter'],
  missing_role: ['Missing role definition', 'Add role section explaining agent purpose'],
  missing_output_format: ['Missing output format specification', 'Add section specifying expected output format'],
  missing_constraints: ['Missing constraints section', 'Add section defining agent limitations and boundaries'],
  unrestricted_tools: ['No tools restriction - agent has access to all tools', 'Add "tools" field to frontmatter with specific tools needed'],
  unrestricted_bash: ['Unrestricted Bash access', 'Replace "Bash" with "Bash(git:*)" or specific scope'],
  unnecessary_cot: ['Unnecessary chain-of-thought for simple task', 'Remove step-by-step instructions for straightforward operations'],
  hardcoded_claude_dir: ['Hardcoded .claude/ directory path', 'Use AI_STATE_DIR env var or platform detection for cross-platform support'],
  claude_md_reference: ['References CLAUDE.md without AGENTS.md', 'Also check for AGENTS.md (used by OpenCode/Codex)'],
};

function result(id, issue, fix) {
  const values = findings[id] || [issue, fix];
  return values[0] ? { issue: values[0], fix: values[1] } : null;
}

const checks = {
  missing_frontmatter: (frontmatter) => frontmatter ? null : result('missing_frontmatter'),
  missing_name: (frontmatter) => !frontmatter || frontmatter.name ? null : result('missing_name'),
  missing_description: (frontmatter) => !frontmatter || frontmatter.description ? null : result('missing_description'),
  missing_role: (body) => /(?:^|\n)\s*#{1,3}\s*role\b|\byou are\b/i.test(body) ? null : result('missing_role'),
  missing_output_format: (body) => /(?:^|\n)\s*#{1,3}\s*(?:output|response)(?:\s+format)?\b|\boutput format\b/i.test(body) ? null : result('missing_output_format'),
  missing_constraints: (body) => /(?:^|\n)\s*#{1,3}\s*(?:constraints|limitations|rules)\b|\bconstraints\s*:/i.test(body) ? null : result('missing_constraints'),
  unrestricted_tools: (frontmatter) => !frontmatter || frontmatter.tools ? null : result('unrestricted_tools'),
  unrestricted_bash: (frontmatter) => {
    const tools = frontmatter && frontmatter.tools;
    return tools && /(?:^|[\s,])Bash(?:$|[\s,])/i.test(String(tools)) ? result('unrestricted_bash') : null;
  },
  missing_xml_structure: (body) => body.length > 1500 && /\b(?:context|instructions|requirements|input|output)\b/i.test(body) && !/<[a-z][^>]*>/i.test(body)
    ? result(null, 'Long structured prompt without XML sections', 'Add XML tags around major semantic sections') : null,
  unnecessary_cot: (body) => /\b(?:think|reason)(?:ing)?\s+step[- ]by[- ]step\b|\bstep[- ]by[- ]step\b/i.test(body) && body.length < 1000 ? result('unnecessary_cot') : null,
  missing_cot: (body) => body.length > 1500 && /\b(?:complex|analy[sz]e|architecture|trade-?offs?)\b/i.test(body) && !/\b(?:think|reason|step[- ]by[- ]step)\b/i.test(body)
    ? result(null, 'Complex task without reasoning guidance', 'Add guidance for structured analysis or verification') : null,
  example_count_suboptimal: (body) => {
    const count = (body.match(/^\s*#{1,3}\s+examples?\b/gim) || []).length;
    return count && (count < 2 || count > 5) ? result(null, 'Found ' + count + ' examples (optimal: 2-5)', 'Consider adding more examples for clarity') : null;
  },
  vague_instructions: (body) => {
    const count = (body.match(/\b(?:usually|sometimes|maybe|perhaps|generally|often|typically|might|could)\b/gi) || []).length;
    return count > 3 ? result(null, 'Vague or ambiguous instructions', 'Replace fuzzy qualifiers with explicit conditions') : null;
  },
  prompt_bloat: (body) => {
    const tokens = Math.ceil(body.length / 4);
    return tokens > 2000 ? result(null, 'Prompt ~' + tokens + ' tokens (max recommended: 2000)', 'Simplify prompt, remove redundant sections, or use XML for compression') : null;
  },
  hardcoded_claude_dir: (body) => /\.claude\//i.test(body) ? result('hardcoded_claude_dir') : null,
  claude_md_reference: (body) => /CLAUDE\.md/i.test(body) && !/AGENTS\.md/i.test(body) ? result('claude_md_reference') : null,
  no_xml_for_data: (body) => /\`\`\`(?:json|ya?ml|csv)\b/i.test(body) && !/<(?:data|input|context)[^>]*>/i.test(body)
    ? result(null, 'Structured data block without XML wrapper', 'Wrap data blocks in descriptive XML tags') : null,
};

const agentPatterns = Object.fromEntries(Object.entries(patternDefinitions).map(([id, definition]) => {
  const [category, certainty, autoFix, description] = definition;
  const pattern = { id, category, certainty, autoFix, description, check: checks[id] };
  if (id === 'prompt_bloat') pattern.maxTokens = 2000;
  return [id, pattern];
}));

function parseMarkdownFrontmatter(content) {
  if (typeof content !== 'string' || !content.trim().startsWith('---')) return { frontmatter: null, body: content };
  const lines = content.split('\n');
  const closingIndex = lines.slice(1).indexOf('---') + 1;
  if (closingIndex <= 0) return { frontmatter: null, body: content };
  const frontmatter = {};
  for (const line of lines.slice(1, closingIndex)) {
    const separator = line.indexOf(':');
    if (separator > 0) frontmatter[line.substring(0, separator).trim()] = line.substring(separator + 1).trim();
  }
  return { frontmatter, body: lines.slice(closingIndex + 1).join('\n').trimEnd() };
}

function emptyAnalysis(agentPath) {
  return {
    agentName: path.basename(agentPath, '.md'), agentPath, frontmatter: null,
    structureIssues: [], toolIssues: [], xmlIssues: [], cotIssues: [],
    exampleIssues: [], antiPatternIssues: [], crossPlatformIssues: [],
  };
}

function addFinding(analysis, group, pattern, finding, agentPath) {
  if (!finding) return;
  const item = { ...finding, file: agentPath };
  if (pattern.id === 'missing_role' || pattern.id === 'unrestricted_bash') item.filePath = agentPath;
  item.certainty = pattern.certainty;
  item.patternId = pattern.id;
  analysis[group].push(item);
}

function analyzeAgent(agentPath) {
  const analysis = emptyAnalysis(agentPath);
  if (!fs.existsSync(agentPath)) {
    analysis.structureIssues.push({ issue: 'File not found', file: agentPath, certainty: 'HIGH', patternId: 'file_not_found' });
    return analysis;
  }
  let content;
  try { content = fs.readFileSync(agentPath, 'utf8'); }
  catch (error) {
    analysis.structureIssues.push({ issue: 'Failed to read file: ' + error.message, file: agentPath, certainty: 'HIGH', patternId: 'read_error' });
    return analysis;
  }
  const parsed = parseMarkdownFrontmatter(content);
  analysis.frontmatter = parsed.frontmatter;
  const categories = {
    structure: 'structureIssues', tool: 'toolIssues', xml: 'xmlIssues', cot: 'cotIssues',
    example: 'exampleIssues', 'anti-pattern': 'antiPatternIssues', 'cross-platform': 'crossPlatformIssues',
  };
  for (const pattern of Object.values(agentPatterns)) {
    const argument = ['missing_frontmatter', 'missing_name', 'missing_description', 'unrestricted_tools', 'unrestricted_bash'].includes(pattern.id)
      ? parsed.frontmatter : parsed.body;
    addFinding(analysis, categories[pattern.category], pattern, pattern.check(argument), agentPath);
  }
  return analysis;
}

function analyzeAllAgents(agentsDir) {
  if (!agentsDir || !fs.existsSync(agentsDir)) return [];
  return fs.readdirSync(agentsDir).filter((file) => file.endsWith('.md')).map((file) => analyzeAgent(path.join(agentsDir, file)));
}

function analyze(options = {}) {
  return analyzeAllAgents(options.agentsDir || 'plugins/enhance/agents');
}

function issueList(analysis) {
  return ISSUE_GROUPS.flatMap((group) => analysis[group] || []);
}

function atomicWrite(filePath, content) {
  const temporaryPath = filePath + '.' + process.pid + '.tmp';
  fs.writeFileSync(temporaryPath, content);
  fs.renameSync(temporaryPath, filePath);
}

function applyOneFix(issue, content) {
  if (issue.patternId === 'missing_frontmatter') {
    return '---\nname: agent-name\ndescription: Agent description\ntools: Read, Glob, Grep\nmodel: sonnet\n---\n\n' + content;
  }
  if (issue.patternId === 'missing_role') {
    const role = '## Your Role\n\nYou are an agent that [describe agent purpose].\n\n\n';
    if (content.startsWith('---\n')) {
      const closingIndex = content.indexOf('\n---\n', 4);
      if (closingIndex >= 0) return content.slice(0, closingIndex + 5) + '\n' + role + content.slice(closingIndex + 5).replace(/^\n/, '');
    }
    return role + content;
  }
  if (issue.patternId === 'missing_output_format') {
    return content.trimEnd() + '\n\n## Output Format\n\nRespond with:\n- [Describe expected format: JSON, markdown, plain text, etc.]\n- [Include any specific structure requirements]\n';
  }
  if (issue.patternId === 'unrestricted_bash') return content.replace(/\bBash\b(?!\s*\()/g, 'Bash(git:*)');
  return null;
}

function applyFixes(analysis) {
  const response = { applied: [], skipped: [], errors: [] };
  for (const issue of issueList(analysis || {})) {
    if (issue.certainty !== 'HIGH') {
      response.skipped.push({ ...issue, reason: 'Not HIGH certainty' });
      continue;
    }
    const filePath = issue.filePath || issue.file;
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fixed = applyOneFix(issue, content);
      if (fixed === null) {
        response.skipped.push({ ...issue, reason: 'No auto-fix available for this pattern' });
        continue;
      }
      if (!fs.existsSync(filePath + '.backup')) fs.copyFileSync(filePath, filePath + '.backup');
      atomicWrite(filePath, fixed);
      response.applied.push({ issue: issue.issue, fix: issue.fix, filePath });
    } catch (error) {
      response.errors.push({ issue: issue.issue, filePath, error: error.message });
    }
  }
  return response;
}

const reportSections = {
  structureIssues: 'Structure Issues', toolIssues: 'Tool Issues', xmlIssues: 'XML Issues',
  cotIssues: 'Chain-of-Thought Issues', exampleIssues: 'Example Issues',
  antiPatternIssues: 'Anti-Pattern Issues', crossPlatformIssues: 'Cross-Platform Issues',
};

function countCertainty(analysis, certainty) {
  return issueList(analysis).filter((issue) => issue.certainty === certainty).length;
}

function generateAgentReport(analysis) {
  let report = '# Agent Analysis: ' + analysis.agentName + '\n\n**File**: ' + analysis.agentPath + '\n**Analyzed**: ' + new Date().toISOString() + '\n\n';
  report += '## Summary\n\n| Certainty | Count |\n|-----------|-------|\n| HIGH | ' + countCertainty(analysis, 'HIGH') + ' |\n| MEDIUM | ' + countCertainty(analysis, 'MEDIUM') + ' |\n';
  for (const [group, title] of Object.entries(reportSections)) {
    const issues = analysis[group] || [];
    if (!issues.length) continue;
    report += '\n### ' + title + ' (' + issues.length + ')\n\n| Issue | Fix | Certainty |\n|-------|-----|-----------|\n';
    for (const issue of issues) report += '| ' + issue.issue + ' | ' + (issue.fix || '') + ' | ' + issue.certainty + ' |\n';
  }
  return report;
}

function generateSummaryReport(analyses) {
  let report = '# Agent Analysis Summary\n\n**Analyzed**: ' + analyses.length + ' agents\n**Date**: ' + new Date().toISOString() + '\n\n';
  const high = analyses.reduce((count, item) => count + countCertainty(item, 'HIGH'), 0);
  const medium = analyses.reduce((count, item) => count + countCertainty(item, 'MEDIUM'), 0);
  report += '## Overall\n\n| Certainty | Count |\n|-----------|-------|\n| HIGH | ' + high + ' |\n| MEDIUM | ' + medium + ' |\n\n';
  report += '## By Agent\n\n| Agent | HIGH | MEDIUM | LOW | Total |\n|-------|------|--------|-----|-------|\n';
  for (const analysis of analyses) {
    const highCount = countCertainty(analysis, 'HIGH');
    const mediumCount = countCertainty(analysis, 'MEDIUM');
    const lowCount = countCertainty(analysis, 'LOW');
    report += '| ' + analysis.agentName + ' | ' + highCount + ' | ' + mediumCount + ' | ' + lowCount + ' | ' + (highCount + mediumCount + lowCount) + ' |\n';
  }
  return report;
}

function generateReport(analysis) {
  return Array.isArray(analysis) ? generateSummaryReport(analysis) : generateAgentReport(analysis);
}

module.exports = { parseMarkdownFrontmatter, analyzeAgent, analyzeAllAgents, analyze, applyFixes, generateReport };

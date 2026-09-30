'use strict';

const FRONTMATTER_MARKER = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/;

function parseScalar(value) {
  const text = value.trim();
  if (!text) return '';
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1);
  }
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (text === 'null') return null;
  if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(text)) return Number(text);
  if (text.startsWith('[') && text.endsWith(']')) {
    return text.slice(1, -1).split(',').map(parseScalar).filter(item => item !== '');
  }
  return text;
}

function parseFrontmatterBlock(block) {
  const frontmatter = {};
  let currentListKey = null;
  for (const line of block.split(/\r?\n/)) {
    const listItem = line.match(/^\s*-\s+(.+)$/);
    if (listItem && currentListKey) {
      frontmatter[currentListKey].push(parseScalar(listItem[1]));
      continue;
    }
    const field = line.match(/^\s*([^:#][^:]*):\s*(.*)$/);
    if (!field) continue;
    const [, key, rawValue] = field;
    if (rawValue.trim() === '') {
      frontmatter[key.trim()] = [];
      currentListKey = key.trim();
    } else {
      frontmatter[key.trim()] = parseScalar(rawValue);
      currentListKey = null;
    }
  }
  return frontmatter;
}

function parseMarkdownFrontmatter(markdownText) {
  const text = String(markdownText ?? '');
  const match = text.match(FRONTMATTER_MARKER);
  if (!match) return { frontmatter: {}, content: text };
  return {
    frontmatter: parseFrontmatterBlock(match[1]),
    content: text.slice(match[0].length)
  };
}

function issue(issueText, certainty, fix, extra = {}) {
  return { issue: issueText, certainty, ...(fix ? { fix } : {}), ...extra };
}

function analyzeAgent(agent, options = {}) {
  const markdown = typeof agent === 'string' ? agent : String(agent?.content ?? agent?.markdown ?? '');
  const parsed = parseMarkdownFrontmatter(markdown);
  const metadata = parsed.frontmatter;
  const findings = [];
  const has = key => Object.prototype.hasOwnProperty.call(metadata, key) && metadata[key] !== '';
  const body = parsed.content;
  const requiredFields = ['name', 'description'];
  for (const field of requiredFields) {
    if (!has(field)) findings.push(issue(`Missing ${field} in frontmatter`, 'HIGH', `Add ${field} to frontmatter`));
  }
  if (!body.trim()) findings.push(issue('Agent has no instructions', 'HIGH', 'Add instructions after frontmatter'));
  if (!has('role')) findings.push(issue('Missing role definition', 'MEDIUM', 'Add a role section explaining the agent purpose'));
  if (!has('tools')) findings.push(issue('No tools restriction', 'LOW', 'Add a tools field when access should be limited'));
  if (!/^#{1,3}\s+/m.test(body)) findings.push(issue('Missing section headings', 'LOW', 'Organize instructions with Markdown headings'));
  if (/\b(always|never|must)\b/i.test(body) && !/(verify|test|check)/i.test(body)) {
    findings.push(issue('Instruction uses absolute language without verification guidance', 'MEDIUM', 'Add verification guidance for mandatory behavior'));
  }
  return findings.map((finding, index) => ({ ...finding, ...(agent?.filePath || agent?.file ? { filePath: agent.filePath || agent.file } : {}), ...(options.includeIndex ? { index } : {}) }));
}

function analyzeAllAgents(agents, options = {}) {
  if (!Array.isArray(agents)) return [];
  return agents.flatMap(agent => analyzeAgent(agent, options));
}

function analyze(input, options = {}) {
  if (Array.isArray(input)) return analyzeAllAgents(input, options);
  return analyzeAgent(input, options);
}

function applyFixes(findings, options = {}) {
  if (!Array.isArray(findings)) return findings;
  const applied = [];
  const skipped = [];
  for (const finding of findings) {
    if (finding.certainty === 'HIGH' && typeof finding.autoFixFn === 'function' && !options.dryRun) {
      applied.push({ ...finding, willApply: true, result: finding.autoFixFn() });
    } else {
      skipped.push({
        filePath: finding.filePath,
        issue: finding.issue,
        fix: finding.fix || 'No auto-fix available',
        willApply: false,
        reason: finding.certainty === 'HIGH' ? 'No auto-fix function' : 'Not HIGH certainty'
      });
    }
  }
  return { applied, skipped, errors: [] };
}

function generateReport(findings, options = {}) {
  if (Array.isArray(findings)) {
    const lines = ['# Agent Analysis Summary', '', '| Issue | Fix | Certainty |', '| --- | --- | --- |'];
    for (const finding of findings) {
      lines.push(`| ${finding.issue || 'N/A'} | ${finding.fix || 'N/A'} | ${finding.certainty || 'N/A'} |`);
    }
    return lines.join('\n');
  }
  const sections = ['# Agent Report', ''];
  for (const [category, values] of Object.entries(findings || {})) {
    if (!Array.isArray(values) || values.length === 0) continue;
    sections.push(`## ${category}`, '', ...values.map(value => `- ${value.issue || value}`), '');
  }
  return sections.join('\n');
}

module.exports = {
  parseMarkdownFrontmatter,
  analyzeAgent,
  analyzeAllAgents,
  analyze,
  applyFixes,
  generateReport
};

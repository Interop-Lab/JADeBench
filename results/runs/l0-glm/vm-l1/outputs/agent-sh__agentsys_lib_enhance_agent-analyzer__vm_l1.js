/**
 * Agent Analyzer
 * Main orchestrator for agent prompt optimization analysis
 *
 * @author Avi Fenesh
 * @license MIT
 */
var fs = require('fs');
var path = require('path');
var { agentPatterns } = require_agent_patterns();

function parseMarkdownFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: content };
  const frontmatterText = match[1];
  const bodyContent = match[2];
  const frontmatter = {};
  frontmatterText.split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      frontmatter[key] = value;
    }
  });
  return { frontmatter, content: bodyContent };
}

function analyzeAgent(agentPath) {
  const content = fs.readFileSync(agentPath, 'utf8');
  const { frontmatter, content: body } = parseMarkdownFrontmatter(content);
  const issues = [];
  for (const pattern of agentPatterns) {
    const matches = body.match(pattern.regex);
    if (matches) {
      issues.push({
        pattern: pattern.name,
        severity: pattern.severity,
        count: matches.length,
        suggestion: pattern.suggestion
      });
    }
  }
  return {
    file: agentPath,
    frontmatter,
    issues,
    score: Math.max(0, 100 - issues.reduce((sum, i) => sum + i.severity * i.count, 0))
  };
}

function analyzeAllAgents(agentsDir) {
  const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const fullPath = path.join(agentsDir, entry.name);
      results.push(analyzeAgent(fullPath));
    }
  }
  return results;
}

function analyze(agentsDir) {
  const results = analyzeAllAgents(agentsDir);
  const summary = {
    total: results.length,
    avgScore: results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0,
    totalIssues: results.reduce((s, r) => s + r.issues.length, 0)
  };
  return { results, summary };
}

function applyFixes(agentsDir) {
  const { results } = analyze(agentsDir);
  const fixed = [];
  for (const result of results) {
    if (result.issues.length === 0) continue;
    let content = fs.readFileSync(result.file, 'utf8');
    const { frontmatter, content: body } = parseMarkdownFrontmatter(content);
    let fixedBody = body;
    for (const issue of result.issues) {
      const pattern = agentPatterns.find(p => p.name === issue.pattern);
      if (pattern && pattern.fix) {
        fixedBody = fixedBody.replace(pattern.regex, pattern.fix);
      }
    }
    const newContent = `---\n${Object.entries(frontmatter).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n${fixedBody}`;
    fs.writeFileSync(result.file, newContent, 'utf8');
    fixed.push(result.file);
  }
  return fixed;
}

function generateReport(agentsDir) {
  const { results, summary } = analyze(agentsDir);
  let report = '# Agent Analysis Report\n\n';
  report += `## Summary\n- Total Agents: ${summary.total}\n- Average Score: ${summary.avgScore}\n- Total Issues: ${summary.totalIssues}\n\n`;
  report += '## Details\n\n';
  for (const result of results) {
    report += `### ${path.basename(result.file)}\n`;
    report += `- Score: ${result.score}\n`;
    if (result.issues.length > 0) {
      report += '- Issues:\n';
      for (const issue of result.issues) {
        report += `  - ${issue.pattern} (${issue.severity}): ${issue.count} occurrence(s)\n`;
      }
    } else {
      report += '- No issues found\n';
    }
    report += '\n';
  }
  return report;
}

module.exports = {
  parseMarkdownFrontmatter,
  analyzeAgent,
  analyzeAllAgents,
  analyze,
  applyFixes,
  generateReport
};

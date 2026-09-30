'use strict';

const fs = require('fs');
const path = require('path');

let agentPatterns = {};
let atomicWrite;
let fixer;
let reporter;

try {
  ({ agentPatterns } = require('../work/agent-sh__agentsys/lib/enhance/agent-patterns.js'));
} catch (_) {}

try {
  atomicWrite = require('../work/agent-sh__agentsys/lib/utils/atomic-write.js');
} catch (_) {}

try {
  fixer = require('../work/agent-sh__agentsys/lib/enhance/fixer.js');
} catch (_) {}

try {
  reporter = require('../work/agent-sh__agentsys/lib/enhance/reporter.js');
} catch (_) {}

function parseScalar(value) {
  const text = value.trim();

  if (!text) return '';
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (text === 'null') return null;
  if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(text)) return Number(text);

  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    return text.slice(1, -1);
  }

  if (text.startsWith('[') && text.endsWith(']')) {
    return text
      .slice(1, -1)
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
      .map(parseScalar);
  }

  return text;
}

function parseMarkdownFrontmatter(source) {
  const text = String(source ?? '');
  const match = text.match(/^(?:\uFEFF)?---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/);

  if (!match) {
    return {
      attributes: {},
      body: text
    };
  }

  const attributes = {};
  const lines = match[1].split(/\r?\n/);
  let currentKey;
  let currentList;

  for (const line of lines) {
    if (!line.trim() || /^\s*#/.test(line)) continue;

    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(attributes[currentKey])) attributes[currentKey] = currentList || [];
      attributes[currentKey].push(parseScalar(listItem[1]));
      currentList = attributes[currentKey];
      continue;
    }

    const entry = line.match(/^\s*([^:#]+?)\s*:\s*(.*)$/);
    if (!entry) continue;

    currentKey = entry[1].trim();
    const value = entry[2].trim();

    if (!value) {
      attributes[currentKey] = {};
      currentList = [];
    } else {
      attributes[currentKey] = parseScalar(value);
      currentList = null;
    }
  }

  return {
    attributes,
    body: text.slice(match[0].length)
  };
}

function readAgent(input) {
  if (typeof input === 'string') {
    const file = path.resolve(input);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      const source = fs.readFileSync(file, 'utf8');
      return {
        path: file,
        source,
        ...parseMarkdownFrontmatter(source)
      };
    }

    return {
      source: input,
      ...parseMarkdownFrontmatter(input)
    };
  }

  if (input && typeof input === 'object') {
    if (typeof input.path === 'string' && fs.existsSync(input.path)) {
      const source = fs.readFileSync(input.path, 'utf8');
      return {
        ...input,
        source,
        ...parseMarkdownFrontmatter(source)
      };
    }

    if (typeof input.content === 'string') {
      return {
        ...input,
        source: input.content,
        ...parseMarkdownFrontmatter(input.content)
      };
    }

    return input;
  }

  return {
    source: '',
    body: '',
    attributes: {}
  };
}

function findPatterns(text) {
  const source = String(text ?? '');
  const patterns = Array.isArray(agentPatterns)
    ? agentPatterns
    : Object.entries(agentPatterns || {}).map(([name, pattern]) => ({ name, pattern }));

  return patterns.filter(entry => {
    if (!entry) return false;
    const pattern = entry.pattern ?? entry.regex ?? entry.match;
    if (pattern instanceof RegExp) return pattern.test(source);
    if (typeof pattern === 'string') return source.includes(pattern);
    return false;
  });
}

function analyzeAgent(input) {
  const agent = readAgent(input);
  const body = agent.body ?? agent.source ?? '';
  const matches = findPatterns(body);

  return {
    path: agent.path,
    frontmatter: agent.attributes || {},
    content: body,
    matches,
    patterns: matches,
    issues: matches,
    valid: matches.length === 0
  };
}

function collectFiles(directory) {
  const result = [];

  if (!directory || !fs.existsSync(directory)) return result;

  const stat = fs.statSync(directory);
  if (stat.isFile()) return [directory];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      result.push(...collectFiles(fullPath));
    } else if (/\.(?:md|markdown|txt)$/i.test(entry.name)) {
      result.push(fullPath);
    }
  }

  return result;
}

function analyzeAllAgents(input) {
  if (Array.isArray(input)) return input.map(analyzeAgent);

  if (input && typeof input === 'object' && Array.isArray(input.agents)) {
    return input.agents.map(analyzeAgent);
  }

  const directory = typeof input === 'string'
    ? input
    : input && (input.directory || input.dir || input.path);

  if (!directory) return [];

  return collectFiles(directory).map(analyzeAgent);
}

function analyze(input) {
  if (Array.isArray(input)) return input.map(analyzeAgent);

  if (input && typeof input === 'object' && (input.directory || input.dir)) {
    return analyzeAllAgents(input);
  }

  return analyzeAgent(input);
}

function applyFixes(input) {
  const analyses = Array.isArray(input) ? input : [input];
  const results = [];

  for (const analysis of analyses) {
    if (!analysis || !analysis.path) {
      results.push(analysis);
      continue;
    }

    let updated = analysis.content ?? analysis.source ?? '';

    if (fixer) {
      const fn = typeof fixer === 'function'
        ? fixer
        : fixer.applyFixes || fixer.fix || fixer.default;

      if (typeof fn === 'function') {
        const value = fn(analysis);
        if (typeof value === 'string') updated = value;
        else if (value && typeof value.content === 'string') updated = value.content;
      }
    }

    if (updated !== (analysis.content ?? analysis.source ?? '')) {
      if (typeof atomicWrite === 'function') {
        atomicWrite(analysis.path, updated);
      } else if (atomicWrite && typeof atomicWrite.write === 'function') {
        atomicWrite.write(analysis.path, updated);
      } else {
        fs.writeFileSync(analysis.path, updated, 'utf8');
      }
    }

    results.push({
      ...analysis,
      content: updated,
      source: updated,
      changed: updated !== (analysis.content ?? analysis.source ?? '')
    });
  }

  return Array.isArray(input) ? results : results[0];
}

function generateReport(input) {
  if (reporter) {
    const fn = typeof reporter === 'function'
      ? reporter
      : reporter.generateReport || reporter.report || reporter.default;

    if (typeof fn === 'function') return fn(input);
  }

  const analyses = Array.isArray(input) ? input : [input];
  return analyses.map(item => ({
    path: item && item.path,
    valid: Boolean(item && item.valid),
    issueCount: item && Array.isArray(item.issues) ? item.issues.length : 0,
    issues: item && item.issues ? item.issues : []
  }));
}

module.exports = {
  parseMarkdownFrontmatter,
  analyzeAgent,
  analyzeAllAgents,
  analyze,
  applyFixes,
  generateReport
};

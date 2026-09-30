const __commonJS = (callback, module) => {
  return callback(module, module.exports);
};

const require_agent_patterns = __commonJS((module, exports) => {
  const agentPatterns = {
    patterns: [
      {
        name: "role",
        pattern: /^You are an? (.+?)(?:\.|$)/im,
        description: "Defines the agent's role"
      },
      {
        name: "expertise",
        pattern: /(?:expert|specialist|experienced) in (.+?)(?:\.|$)/im,
        description: "Defines the agent's expertise"
      },
      {
        name: "task",
        pattern: /(?:task|goal|objective):?\s*(.+?)(?:\.|$)/im,
        description: "Defines the agent's task"
      },
      {
        name: "context",
        pattern: /(?:context|background):?\s*(.+?)(?:\.|$)/im,
        description: "Provides context for the agent"
      },
      {
        name: "constraints",
        pattern: /(?:constraints?|limitations?):?\s*(.+?)(?:\.|$)/im,
        description: "Defines constraints for the agent"
      },
      {
        name: "output_format",
        pattern: /(?:output format|format):?\s*(.+?)(?:\.|$)/im,
        description: "Defines the output format"
      },
      {
        name: "examples",
        pattern: /(?:examples?|samples?):?\s*(.+?)(?:\.|$)/im,
        description: "Provides examples"
      },
      {
        name: "tone",
        pattern: /(?:tone|style):?\s*(.+?)(?:\.|$)/im,
        description: "Defines the tone or style"
      },
      {
        name: "audience",
        pattern: /(?:audience|users?):?\s*(.+?)(?:\.|$)/im,
        description: "Defines the target audience"
      },
      {
        name: "language",
        pattern: /(?:language|lang):?\s*(.+?)(?:\.|$)/im,
        description: "Defines the language"
      }
    ]
  };
  module.exports = { agentPatterns };
});

const require_atomic_write = __commonJS((module, exports) => {
  const fs = require('fs');
  const path = require('path');

  function atomicWrite(filePath, data, options = {}) {
    const tempPath = path.join(
      path.dirname(filePath),
      `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`
    );
    fs.writeFileSync(tempPath, data, options);
    fs.renameSync(tempPath, filePath);
  }

  module.exports = atomicWrite;
});

const require_fixer = __commonJS((module, exports) => {
  const atomicWrite = require_atomic_write();

  function applyFixes(analysisResults) {
    if (!analysisResults || !Array.isArray(analysisResults)) {
      throw new TypeError('analysisResults must be an array');
    }

    for (const result of analysisResults) {
      if (!result || !result.filePath || !result.fixes || !Array.isArray(result.fixes)) {
        continue;
      }

      let content = require('fs').readFileSync(result.filePath, 'utf8');
      for (const fix of result.fixes) {
        if (fix && typeof fix.oldText === 'string' && typeof fix.newText === 'string') {
          content = content.split(fix.oldText).join(fix.newText);
        }
      }
      atomicWrite(result.filePath, content, 'utf8');
    }
  }

  module.exports = applyFixes;
});

const require_reporter = __commonJS((module, exports) => {
  function generateReport(analysisResults) {
    if (!analysisResults || !Array.isArray(analysisResults)) {
      throw new TypeError('analysisResults must be an array');
    }

    const report = {
      summary: {
        totalAgents: analysisResults.length,
        totalIssues: 0,
        totalFixes: 0
      },
      agents: []
    };

    for (const result of analysisResults) {
      const agentReport = {
        filePath: result.filePath || '',
        issues: result.issues || [],
        fixes: result.fixes || []
      };
      report.summary.totalIssues += agentReport.issues.length;
      report.summary.totalFixes += agentReport.fixes.length;
      report.agents.push(agentReport);
    }

    return report;
  }

  module.exports = generateReport;
});

const fs = require('fs');
const path = require('path');
const { agentPatterns } = require_agent_patterns();

function parseMarkdownFrontmatter(content) {
  if (typeof content !== 'string') {
    throw new TypeError('content must be a string');
  }

  const frontmatter = {};
  const lines = content.split(/\r?\n/);
  let inFrontmatter = false;
  let endIndex = -1;

  if (lines[0] && lines[0].trim() === '---') {
    inFrontmatter = true;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        endIndex = i;
        break;
      }
      const match = lines[i].match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
      if (match) {
        frontmatter[match[1]] = match[2].trim();
      }
    }
  }

  return {
    frontmatter,
    content: endIndex >= 0 ? lines.slice(endIndex + 1).join('\n') : content
  };
}

function analyzeAgent(filePath) {
  if (typeof filePath !== 'string') {
    throw new TypeError('filePath must be a string');
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const { frontmatter, content: body } = parseMarkdownFrontmatter(content);
  const issues = [];
  const fixes = [];

  for (const pattern of agentPatterns.patterns) {
    const match = body.match(pattern.pattern);
    if (!match) {
      issues.push({
        type: 'missing_pattern',
        pattern: pattern.name,
        description: pattern.description
      });
    }
  }

  return {
    filePath,
    frontmatter,
    issues,
    fixes
  };
}

function analyzeAllAgents(directoryPath) {
  if (typeof directoryPath !== 'string') {
    throw new TypeError('directoryPath must be a string');
  }

  const results = [];
  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile() && (file.endsWith('.md') || file.endsWith('.markdown'))) {
      results.push(analyzeAgent(filePath));
    }
  }

  return results;
}

function analyze(input) {
  if (typeof input === 'string') {
    const stat = fs.statSync(input);
    if (stat.isDirectory()) {
      return analyzeAllAgents(input);
    }
    return [analyzeAgent(input)];
  }
  if (Array.isArray(input)) {
    return input.map(analyzeAgent);
  }
  throw new TypeError('input must be a path string or an array of paths');
}

function applyFixes(analysisResults) {
  return require_fixer()(analysisResults);
}

function generateReport(analysisResults) {
  return require_reporter()(analysisResults);
}

module.exports = {
  parseMarkdownFrontmatter,
  analyzeAgent,
  analyzeAllAgents,
  analyze,
  applyFixes,
  generateReport
};

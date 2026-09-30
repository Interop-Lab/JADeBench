'use strict';

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

function issue(message, fix) {
  return { issue: message, fix };
}

const patterns = {
  missing_frontmatter: {
    group: 'structureIssues',
    certainty: 'HIGH',
    check(content) {
      if (typeof content !== 'string' || !content.trim() || content.trim().startsWith('---')) return null;
      return issue('Missing YAML frontmatter', 'Add frontmatter with name, description, tools, model');
    },
  },
  missing_name: {
    group: 'structureIssues',
    certainty: 'HIGH',
    check(frontmatter) {
      if (!frontmatter || (typeof frontmatter.name === 'string' && frontmatter.name.trim())) return null;
      return issue('Frontmatter missing "name" field', 'Add "name" field to frontmatter');
    },
  },
  missing_description: {
    group: 'structureIssues',
    certainty: 'HIGH',
    check(frontmatter) {
      if (!frontmatter || (typeof frontmatter.description === 'string' && frontmatter.description.trim())) return null;
      return issue('Frontmatter missing "description" field', 'Add "description" field to frontmatter');
    },
  },
  unrestricted_tools: {
    group: 'toolIssues',
    certainty: 'HIGH',
    check(frontmatter) {
      if (!frontmatter || frontmatter.tools) return null;
      return issue(
        'No tools restriction - agent has access to all tools',
        'Add "tools" field to frontmatter with specific tools needed',
      );
    },
  },
  unrestricted_bash: {
    group: 'toolIssues',
    certainty: 'HIGH',
    check(frontmatter) {
      if (!frontmatter || !frontmatter.tools) return null;
      const tools = Array.isArray(frontmatter.tools)
        ? frontmatter.tools
        : String(frontmatter.tools).split(',').map((tool) => tool.trim());
      if (!tools.some((tool) => tool === 'Bash' || tool === 'bash')) return null;
      return issue('Unrestricted Bash access', 'Replace "Bash" with "Bash(git:*)" or specific scope');
    },
  },
  missing_role: {
    group: 'structureIssues',
    certainty: 'HIGH',
    check(content) {
      if (typeof content !== 'string') return null;
      const hasRole = /you are/i.test(content)
        || /you (?:perform|handle|execute|do|manage|coordinate|analyze|review|create|design|implement|validate|update|check|monitor)/i.test(content)
        || /##\s+(?:your\s+)?role|\*\*(?:your\s+)?role\*\*/i.test(content);
      return hasRole ? null : issue('Missing role definition', 'Add role section explaining agent purpose');
    },
  },
  missing_output_format: {
    group: 'structureIssues',
    certainty: 'HIGH',
    check(content) {
      if (typeof content !== 'string') return null;
      const hasFormat = /##\s+output\s+format/i.test(content)
        || /##\s+format/i.test(content)
        || /##\s+response/i.test(content);
      return hasFormat ? null : issue(
        'Missing output format specification',
        'Add section specifying expected output format',
      );
    },
  },
  missing_constraints: {
    group: 'structureIssues',
    certainty: 'HIGH',
    check(content) {
      if (typeof content !== 'string') return null;
      const hasConstraints = /#{2,3}\s+constraints/i.test(content)
        || /#{2,3}\s+(?:what\s+)?(?:this\s+agent\s+)?(?:you\s+)?(?:must\s+)?not\s+do/i.test(content)
        || /#{2,3}\s+rules/i.test(content)
        || /#{2,3}\s+workflow\s+gates/i.test(content);
      return hasConstraints ? null : issue(
        'Missing constraints section',
        'Add section defining agent limitations and boundaries',
      );
    },
  },
  missing_xml_structure: {
    group: 'xmlIssues',
    certainty: 'MEDIUM',
    check(content) {
      if (typeof content !== 'string') return null;
      const sections = (content.match(/##\s+/g) || []).length;
      const mixesListsAndCode = /^\s*[-*]\s+/m.test(content) && content.includes('```');
      if (/<\w+>/.test(content) || (sections < 5 && !mixesListsAndCode)) return null;
      return issue(
        'Complex prompt without XML structure',
        'Consider using XML tags for key sections (e.g., <rules>, <examples>)',
      );
    },
  },
  unnecessary_cot: {
    group: 'cotIssues',
    certainty: 'MEDIUM',
    check(content) {
      if (typeof content !== 'string' || !/step[- ]by[- ]step/i.test(content) || content.includes('<thinking>')) return null;
      const words = content.split(/\s+/).filter(Boolean).length;
      const sections = (content.match(/##\s+/g) || []).length;
      return words < 500 && sections < 4
        ? issue(
          'Unnecessary chain-of-thought for simple task',
          'Remove step-by-step instructions for straightforward operations',
        )
        : null;
    },
  },
  missing_cot: {
    group: 'cotIssues',
    certainty: 'MEDIUM',
    check(content) {
      if (typeof content !== 'string') return null;
      const words = content.split(/\s+/).filter(Boolean).length;
      const sections = (content.match(/##\s+/g) || []).length;
      const isComplex = /analy[sz]e|evaluate|assess|review/i.test(content);
      const hasGuidance = /step[- ]by[- ]step|<thinking>|reasoning|think\s+through/i.test(content);
      return words > 1000 && sections >= 5 && isComplex && !hasGuidance
        ? issue(
          'Complex task without reasoning guidance',
          'Add chain-of-thought instructions or <thinking> tags',
        )
        : null;
    },
  },
  vague_instructions: {
    group: 'antiPatternIssues',
    certainty: 'MEDIUM',
    check(content) {
      if (typeof content !== 'string') return null;
      const fuzzyTerms = [
        'usually', 'sometimes', 'often', 'rarely', 'maybe', 'might', 'could',
        'should probably', 'try to', 'as much as possible', 'if possible',
      ];
      const matches = fuzzyTerms.filter((term) => new RegExp(`\\b${term}`, 'i').test(content));
      return matches.length >= 4
        ? issue(
          `Found vague language: ${matches.slice(0, 3).join(', ')}...`,
          'Replace fuzzy language with clear, definitive instructions',
        )
        : null;
    },
  },
  hardcoded_claude_dir: {
    group: 'crossPlatformIssues',
    certainty: 'HIGH',
    check(content) {
      if (typeof content !== 'string' || !/\.claude\//.test(content) || /AI_STATE_DIR/i.test(content)) return null;
      const interpolations = [...content.matchAll(/\$\{([^}]{0,1000})\}/g)].map((match) => match[1]);
      if (interpolations.some((value) => value.includes('STATE'))) return null;
      return issue(
        'Hardcoded .claude/ directory path',
        'Use AI_STATE_DIR env var or platform detection for cross-platform support',
      );
    },
  },
  claude_md_reference: {
    group: 'crossPlatformIssues',
    certainty: 'MEDIUM',
    check(content) {
      if (typeof content !== 'string' || !/CLAUDE\.md/i.test(content) || /AGENTS\.md/i.test(content)) return null;
      return issue(
        'References CLAUDE.md without AGENTS.md',
        'Also check for AGENTS.md (used by OpenCode/Codex)',
      );
    },
  },
};

const CONTENT_PATTERNS = [
  'missing_frontmatter',
  'missing_role',
  'missing_output_format',
  'missing_constraints',
  'missing_xml_structure',
  'unnecessary_cot',
  'missing_cot',
  'vague_instructions',
  'hardcoded_claude_dir',
  'claude_md_reference',
];

const FRONTMATTER_PATTERNS = [
  'missing_name',
  'missing_description',
  'unrestricted_tools',
  'unrestricted_bash',
];

function parseMarkdownFrontmatter(content) {
  const trimmed = content.trim();
  if (!trimmed.startsWith('---')) return { frontmatter: null, body: content };

  const lines = trimmed.split('\n');
  const closingDelimiter = lines.indexOf('---', 1);
  if (closingDelimiter < 0) return { frontmatter: null, body: content };

  const frontmatter = {};
  for (const line of lines.slice(1, closingDelimiter)) {
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    const key = line.slice(0, colon).trim();
    if (key) frontmatter[key] = line.slice(colon + 1).trim();
  }

  return {
    frontmatter,
    body: lines.slice(closingDelimiter + 1).join('\n'),
  };
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
    crossPlatformIssues: [],
  };
}

function addFinding(result, patternId, input) {
  const pattern = patterns[patternId];
  const matched = pattern.check(input);
  if (!matched) return;

  const finding = { ...matched, file: result.agentPath };
  if (patternId === 'missing_role' || patternId === 'unrestricted_bash') {
    finding.filePath = result.agentPath;
  }
  finding.certainty = pattern.certainty;
  finding.patternId = patternId;
  result[pattern.group].push(finding);
}

function analyzeAgent(agentPath) {
  const result = createAnalysis(agentPath);
  if (!fs.existsSync(agentPath)) {
    result.structureIssues.push({
      issue: 'File not found',
      file: agentPath,
      certainty: 'HIGH',
      patternId: 'file_not_found',
    });
    return result;
  }

  const content = fs.readFileSync(agentPath, 'utf8');
  if (!content) return result;

  const { frontmatter } = parseMarkdownFrontmatter(content);
  result.frontmatter = frontmatter;

  addFinding(result, CONTENT_PATTERNS[0], content);
  if (frontmatter) {
    for (const patternId of FRONTMATTER_PATTERNS) addFinding(result, patternId, frontmatter);
  }
  for (const patternId of CONTENT_PATTERNS.slice(1)) addFinding(result, patternId, content);
  return result;
}

function analyzeAllAgents(agentsDir) {
  if (!fs.existsSync(agentsDir)) return [];
  return fs.readdirSync(agentsDir)
    .filter((name) => name.endsWith('.md') && name !== 'README.md')
    .map((name) => analyzeAgent(path.join(agentsDir, name)));
}

function analyze(options = {}) {
  const { agent, agentsDir = 'plugins/enhance/agents' } = options || {};
  return agent ? analyzeAgent(path.join(agentsDir, agent)) : analyzeAllAgents(agentsDir);
}

const FRONTMATTER_TEMPLATE = [
  '---',
  'name: agent-name',
  'description: Agent description',
  'tools: Read, Glob, Grep',
  'model: sonnet',
  '---',
  '',
  '',
].join('\n');

const ROLE_TEMPLATE = '\n## Your Role\n\nYou are an agent that [describe agent purpose].\n';
const OUTPUT_TEMPLATE = [
  '',
  '',
  '## Output Format',
  '',
  'Respond with:',
  '- [Describe expected format: JSON, markdown, plain text, etc.]',
  '- [Include any specific structure requirements]',
  '',
].join('\n');

function fixMissingFrontmatter(content) {
  return typeof content === 'string' && content.trim()
    ? `${FRONTMATTER_TEMPLATE}${content.trim()}`
    : content;
}

function fixUnrestrictedBash(content) {
  if (typeof content !== 'string') return content;
  const lines = content.split('\n');
  let inFrontmatter = false;
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim() === '---') {
      inFrontmatter = !inFrontmatter;
    } else if (inFrontmatter && lines[index].trim().startsWith('tools:')) {
      lines[index] = lines[index].replace(/\bBash\b(?!\()/g, 'Bash(git:*)');
    }
  }
  return lines.join('\n');
}

function fixMissingRole(content) {
  if (typeof content !== 'string') return content;
  const lines = content.split('\n');
  let insertionIndex = 0;
  if (lines[0].trim() === '---') {
    const closingOffset = lines.slice(1).findIndex((line) => line.trim() === '---');
    if (closingOffset >= 0) insertionIndex = closingOffset + 2;
  }
  lines.splice(insertionIndex, 0, ROLE_TEMPLATE);
  return lines.join('\n');
}

function fixMissingOutputFormat(content) {
  if (typeof content !== 'string' || /##\s*output\s*format/i.test(content) || content.includes('<output_format>')) {
    return content;
  }
  return `${content.trim()}${OUTPUT_TEMPLATE}`;
}

const EXAMPLES_TEMPLATE = [
  '',
  '',
  '## Examples',
  '',
  '<good-example>',
  'Input: [example input]',
  'Output: [example output]',
  '</good-example>',
  '',
  '<bad-example>',
  'Input: [example input]',
  'Output: [what NOT to do]',
  'Why bad: [explanation]',
  '</bad-example>',
  '',
].join('\n');

const VERIFICATION_TEMPLATE = [
  '',
  '',
  '## Verification',
  '',
  'After completing this task:',
  '- [ ] Run relevant tests to verify the change works',
  '- [ ] Check for regressions in related functionality',
  '- [ ] Verify expected output matches: [describe expected result]',
  '',
].join('\n');

function fixMissingExamples(content) {
  if (typeof content !== 'string' || /<example>|##\s*example/i.test(content)) return content;
  return `${content.trim()}${EXAMPLES_TEMPLATE}`;
}

function wrapMarkdownSection(content, headingPattern, tagName) {
  const lines = content.split('\n');
  const start = lines.findIndex((line) => headingPattern.test(line));
  if (start < 0) return content;

  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^#{1,6}\s/.test(lines[index]) || /^---/.test(lines[index])) {
      end = index;
      break;
    }
  }

  const section = lines.slice(start, end);
  lines.splice(start, end - start, `<${tagName}>`, ...section, `</${tagName}>`);
  return lines.join('\n');
}

function fixMissingXmlStructure(content) {
  if (typeof content !== 'string' || /<[a-z_][a-z0-9_-]*>/i.test(content)) return content;
  const withRole = wrapMarkdownSection(
    content,
    /^##[ \t]*(?:your[ \t]+)?role[ \t]*$/i,
    'role',
  );
  return wrapMarkdownSection(
    withRole,
    /^##[ \t]*(?:constraints?|rules?)[ \t]*$/i,
    'constraints',
  );
}

function fixMissingVerificationCriteria(content) {
  if (typeof content !== 'string' || /\bverif|test|validate|expected\s+output/i.test(content)) return content;
  return `${content.trim()}${VERIFICATION_TEMPLATE}`;
}

function fixMissingTriggerPhrase(content) {
  if (typeof content !== 'string') return content;
  const lines = content.split('\n');
  let inFrontmatter = false;
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim() === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    if (!inFrontmatter || !lines[index].trim().startsWith('description:')) continue;
    if (/use when user asks/i.test(lines[index])) return content;
    const match = lines[index].match(/^description:[ \t]*(\S.*)$/);
    if (match) {
      const description = match[1].toLowerCase().replace(/^to\s+/, '');
      lines[index] = `description: Use when user asks to ${description}`;
    }
  }
  return lines.join('\n');
}

const PRESERVED_ACRONYMS = new Set([
  'API', 'JSON', 'XML', 'HTML', 'CSS', 'URL', 'HTTP', 'HTTPS', 'SQL', 'CLI',
  'SDK', 'JWT', 'UUID', 'REST', 'YAML', 'EOF', 'TODO', 'FIXME', 'NOTE',
  'README', 'MCP', 'HIGH', 'MEDIUM', 'LOW',
]);

function protectCodeBlocks(content, transform) {
  const codeBlocks = [];
  const protectedContent = content.replace(/```[\s\S]*?```/g, (block) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(block);
    return placeholder;
  });
  let result = transform(protectedContent);
  codeBlocks.forEach((block, index) => {
    result = result.replace(`__CODE_BLOCK_${index}__`, block);
  });
  return result;
}

function fixAggressiveEmphasis(content) {
  if (typeof content !== 'string') return content;
  return protectCodeBlocks(content, (value) => value
    .replace(/\b[A-Z]{3,}\b/g, (word) => (
      PRESERVED_ACRONYMS.has(word)
        ? word
        : word.charAt(0) + word.slice(1).toLowerCase()
    ))
    .replace(/!{2,}/g, '!'));
}

const AUTO_FIXERS = {
  missing_frontmatter: fixMissingFrontmatter,
  unrestricted_bash: fixUnrestrictedBash,
  missing_role: fixMissingRole,
  missing_output_format: fixMissingOutputFormat,
  missing_examples: fixMissingExamples,
  missing_xml_structure: fixMissingXmlStructure,
  missing_verification_criteria: fixMissingVerificationCriteria,
  aggressive_emphasis: fixAggressiveEmphasis,
  missing_trigger_phrase: fixMissingTriggerPhrase,
};

function collectFindings(analysis) {
  const analyses = Array.isArray(analysis) ? analysis : [analysis];
  const findings = [];
  for (const item of analyses) {
    if (!item || typeof item !== 'object') continue;
    for (const group of ISSUE_GROUPS) {
      if (Array.isArray(item[group])) findings.push(...item[group]);
    }
  }
  return findings.filter((finding) => finding && (finding.filePath || finding.file));
}

function assertNotSymlink(filePath) {
  try {
    if (!fs.lstatSync(filePath).isSymbolicLink()) return;
    const error = new Error('target is a symlink; refusing to follow');
    error.code = 'ESYMLINK_REFUSED';
    throw error;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function applyFixes(analysis) {
  const results = { applied: [], skipped: [], errors: [] };
  const backedUp = new Set();

  for (const finding of collectFindings(analysis)) {
    const filePath = finding.filePath || finding.file;
    if (finding.certainty !== 'HIGH') {
      results.skipped.push({ ...finding, reason: 'Not HIGH certainty' });
      continue;
    }

    const fixer = AUTO_FIXERS[finding.patternId];
    if (!fixer) {
      results.skipped.push({ ...finding, reason: 'No auto-fix available for this pattern' });
      continue;
    }
    if (!fs.existsSync(filePath)) {
      results.errors.push({ filePath, error: 'File not found' });
      continue;
    }

    try {
      assertNotSymlink(filePath);
      const original = fs.readFileSync(filePath, 'utf8');
      const fixed = fixer(original);
      if (fixed === original) continue;
      if (!backedUp.has(filePath)) {
        fs.writeFileSync(`${filePath}.backup`, original);
        backedUp.add(filePath);
      }
      fs.writeFileSync(filePath, fixed, 'utf8');
      results.applied.push({ issue: finding.issue, fix: finding.fix, filePath });
    } catch (error) {
      results.errors.push({ filePath, error: error.message });
    }
  }

  return results;
}

function allIssues(analysis) {
  return ISSUE_GROUPS.flatMap((group) => Array.isArray(analysis[group]) ? analysis[group] : []);
}

function countCertainty(issues, certainty) {
  return issues.filter((finding) => finding.certainty === certainty).length;
}

function appendIssueSection(lines, title, issues) {
  if (!Array.isArray(issues) || !issues.length) return;
  lines.push(
    `### ${title} (${issues.length})`,
    '',
    '| Issue | Fix | Certainty |',
    '|-------|-----|-----------|',
  );
  for (const finding of issues) {
    lines.push(`| ${finding.issue} | ${finding.fix || 'N/A'} | ${finding.certainty} |`);
  }
  lines.push('');
}

function generateAgentReport(analysis) {
  const agentName = analysis.agentName;
  const agentPath = analysis.agentPath;
  const issues = allIssues(analysis);
  const lines = [
    `# Agent Analysis: ${agentName}`,
    '',
    `**File**: ${agentPath}`,
    `**Analyzed**: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    '| Certainty | Count |',
    '|-----------|-------|',
    `| HIGH | ${countCertainty(issues, 'HIGH')} |`,
    `| MEDIUM | ${countCertainty(issues, 'MEDIUM')} |`,
    '',
  ];

  appendIssueSection(lines, 'Structure Issues', analysis.structureIssues);
  appendIssueSection(lines, 'Tool Issues', analysis.toolIssues);
  appendIssueSection(lines, 'XML Structure Issues', analysis.xmlIssues);
  appendIssueSection(lines, 'Chain-of-Thought Issues', analysis.cotIssues);
  appendIssueSection(lines, 'Example Issues', analysis.exampleIssues);
  appendIssueSection(lines, 'Anti-Pattern Issues', analysis.antiPatternIssues);
  appendIssueSection(lines, 'Cross-Platform Issues', analysis.crossPlatformIssues);
  return lines.join('\n');
}

function generateAgentSummaryReport(analyses) {
  const combined = analyses.flatMap(allIssues);
  const lines = [
    '# Agent Analysis Summary',
    '',
    `**Analyzed**: ${analyses.length} agents`,
    `**Date**: ${new Date().toISOString()}`,
    '',
    '## Overall',
    '',
    '| Certainty | Count |',
    '|-----------|-------|',
    `| HIGH | ${countCertainty(combined, 'HIGH')} |`,
    `| MEDIUM | ${countCertainty(combined, 'MEDIUM')} |`,
    '',
    '## By Agent',
    '',
    '| Agent | HIGH | MEDIUM | LOW | Total |',
    '|-------|------|--------|-----|-------|',
  ];

  for (const analysis of analyses) {
    const issues = allIssues(analysis);
    lines.push(
      `| ${analysis.agentName} | ${countCertainty(issues, 'HIGH')} | ${countCertainty(issues, 'MEDIUM')} | ${countCertainty(issues, 'LOW')} | ${issues.length} |`,
    );
  }
  lines.push('');
  return lines.join('\n');
}

function generateReport(analysis) {
  return Array.isArray(analysis)
    ? generateAgentSummaryReport(analysis)
    : generateAgentReport(analysis);
}

module.exports = {
  parseMarkdownFrontmatter,
  analyzeAgent,
  analyzeAllAgents,
  analyze,
  applyFixes,
  generateReport,
};

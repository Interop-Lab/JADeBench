/.test(content);
      const hasList = /^[-*]\s{1,1000}[^\n]{1,2000}$/m.test(content);
      const hasXml = /<\w+>[\s\S]{0,50000}?<\/\w+>/.test(content);
      const headingCount = (content.match(/^##\s+/gm) || []).length;
      if (hasCodeBlock && hasList && headingCount > 2 && !hasXml) {
        return {
          issue: 'Uses markdown lists instead of XML for data',
          fix: 'Use XML tags for structured data'
        };
      }
      return null;
    }
  }
};

function getAllPatterns() {
  return agentPatterns;
}

function getPatternsByCategory(category) {
  const result = {};
  for (const [name, pattern] of Object.entries(agentPatterns)) {
    if (pattern.category === category) {
      result[name] = pattern;
    }
  }
  return result;
}

function getAutoFixablePatterns() {
  const result = {};
  for (const [name, pattern] of Object.entries(agentPatterns)) {
    if (pattern.autoFix) {
      result[name] = pattern;
    }
  }
  return result;
}

const atomicWrite = (() => {
  const fs = require('fs');
  const path = require('path');
  const crypto = require('crypto');

  function tempPath(filePath) {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const random = crypto.randomBytes(6).toString('hex');
    return path.join(dir, `.${ext}.${random}.tmp`);
  }

  function writeFileAtomic(filePath, data, options = {}) {
    const { encoding = 'utf8', mode = 0o666 } = options;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempFile = tempPath(filePath);
    try {
      fs.writeFileSync(tempFile, data, { encoding, mode });
      fs.renameSync(tempFile, filePath);
      return true;
    } catch (err) {
      try {
        fs.unlinkSync(tempFile);
      } catch {}
      throw err;
    }
  }

  function writeJsonAtomic(filePath, data, options = {}) {
    const { indent = 2, ...rest } = options;
    const json = JSON.stringify(data, null, indent);
    return writeFileAtomic(filePath, json, rest);
  }

  return {
    writeFileAtomic,
    writeJsonAtomic,
    tempPath
  };
})();

const fixer = (() => {
  const fs = require('fs');
  const path = require('path');
  const { writeFileAtomic } = atomicWrite;

  function readAgentFile(filePath) {
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') return;
      throw err;
    }
    if (content.includes('\0')) {
      const error = new Error('Binary file detected');
      error.code = 'BINARY_FILE';
      throw error;
    }
  }

  function applyFixes(analysisResults, options = {}) {
    const { dryRun = false, backup = true } = options;
    const results = {
      applied: [],
      failed: [],
      skipped: []
    };

    const autoFixableIds = [
      'missing_frontmatter',
      'missing_role',
      'unrestricted_bash',
      'missing_name',
      'missing_description',
      'missing_output_format',
      'missing_constraints',
      'unrestricted_tools',
      'missing_xml_structure'
    ];

    const fixableIssues = analysisResults.filter(issue =>
      issue.category === 'structure' &&
      (issue.autoFix || issue.willApply) &&
      (issue.fix || autoFixableIds.includes(issue.patternId))
    );

    const issuesByFile = new Map();
    for (const issue of fixableIssues) {
      const filePath = issue.filePath || issue.path;
      if (!issuesByFile.has(filePath)) {
        issuesByFile.set(filePath, []);
      }
      issuesByFile.get(filePath).push(issue);
    }

    for (const [filePath, issues] of issuesByFile) {
      try {
        if (!fs.existsSync(filePath)) {
          results.skipped.push({
            filePath,
            reason: 'File not found'
          });
          continue;
        }

        try {
          readAgentFile(filePath);
        } catch (err) {
          if (err.code === 'BINARY_FILE') {
            results.skipped.push({
              filePath,
              reason: 'Binary file'
            });
            continue;
          }
          throw err;
        }

        const originalContent = fs.readFileSync(filePath, 'utf8');
        let content = originalContent;

        if (filePath.endsWith('.json')) {
          content = JSON.parse(originalContent);
        } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
          content = originalContent;
        } else {
          results.skipped.push(...issues.map(issue => ({
            ...issue,
            reason: 'Unsupported file type'
          })));
          continue;
        }

        let modified = content;
        const appliedIssues = [];

        for (const issue of issues) {
          try {
            if (filePath.endsWith('.json')) {
              if (issue.patternId === 'missing_frontmatter') {
                modified = addFrontmatter(modified);
              } else if (issue.patternId === 'missing_name') {
                modified = addName(modified);
              } else if (issue.patternId === 'missing_description') {
                modified = addDescription(modified);
              } else if (issue.patternId === 'missing_role') {
                modified = addRole(modified);
              } else if (issue.patternId === 'missing_output_format') {
                modified = addOutputFormat(modified);
              } else if (issue.patternId === 'missing_constraints') {
                modified = addConstraints(modified);
              } else if (issue.patternId === 'unrestricted_tools') {
                modified = restrictTools(modified);
              } else if (issue.patternId === 'unrestricted_bash') {
                modified = restrictBash(modified);
              } else if (issue.patternId === 'missing_xml_structure') {
                modified = addXmlStructure(modified);
              } else if (issue.patternId === 'unnecessary_cot') {
                modified = removeCot(modified);
              } else if (issue.patternId === 'missing_cot') {
                modified = addCot(modified);
              } else if (issue.patternId === 'example_count_suboptimal') {
                modified = adjustExamples(modified);
              } else if (issue.patternId === 'vague_instructions') {
                modified = clarifyInstructions(modified);
              } else if (issue.patternId === 'prompt_bloat') {
                modified = shortenPrompt(modified);
              } else if (issue.patternId === 'hardcoded_claude_dir') {
                modified = fixClaudeDir(modified);
              } else if (issue.patternId === 'claude_md_reference') {
                modified = fixClaudeMdReference(modified);
              } else if (issue.patternId === 'no_xml_for_data') {
                modified = addXmlForData(modified);
              } else {
                continue;
              }
            } else {
              if (issue.fix && typeof issue.fix === 'function') {
                modified = issue.fix(modified);
              } else if (issue.fix && typeof issue.fix === 'string') {
                modified = applyTextFix(modified, issue.fix);
              } else {
                continue;
              }
            }

            appliedIssues.push({
              patternId: issue.patternId,
              issue: issue.issue,
              filePath
            });
          } catch (err) {
            results.failed.push({
              patternId: issue.patternId,
              filePath,
              error: err.message
            });
          }
        }

        if (!dryRun && appliedIssues.length > 0) {
          if (backup) {
            const backupPath = filePath + '.bak';
            readAgentFile(backupPath);
            fs.writeFileSync(backupPath, originalContent, 'utf8');
          }

          let output;
          if (filePath.endsWith('.json')) {
            output = JSON.stringify(modified, null, 2);
          } else {
            output = modified;
          }

          readAgentFile(filePath);
          writeFileAtomic(filePath, output);
        }

        results.applied.push(...appliedIssues);
      } catch (err) {
        results.failed.push({
          filePath,
          error: err.message
        });
      }
    }

    const skipped = analysisResults.filter(issue =>
      issue.category !== 'structure' ||
      !autoFixableIds.includes(issue.patternId)
    ).map(issue => ({
      ...issue,
      reason: issue.category !== 'structure' ? 'Non-structural issue' : 'Not auto-fixable'
    }));

    results.skipped.push(...skipped);
    return results;
  }

  function addFrontmatter(content) {
    return `---\nname: agent\ndescription: Agent description\n---\n\n${content}`;
  }

  function addName(frontmatter) {
    return { ...frontmatter, name: 'agent' };
  }

  function addDescription(frontmatter) {
    return { ...frontmatter, description: 'Agent description' };
  }

  function addRole(content) {
    return `## Role\nYou are a helpful assistant.\n\n${content}`;
  }

  function addOutputFormat(content) {
    return `${content}\n\n## Output Format\nProvide your response in markdown format.\n`;
  }

  function addConstraints(content) {
    return `${content}\n\n## Constraints\n- Do not provide false information.\n- Follow the user's instructions carefully.\n`;
  }

  function restrictTools(frontmatter) {
    return { ...frontmatter, tools: ['read', 'write'] };
  }

  function restrictBash(frontmatter) {
    return { ...frontmatter, tools: ['read', 'write'] };
  }

  function addXmlStructure(content) {
    return `${content}\n\n## Output Format\nUse XML tags for structured data.\n`;
  }

  function removeCot(content) {
    return content.replace(/step[- ]by[- ]step/gi, '').replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
  }

  function addCot(content) {
    return `${content}\n\n## Instructions\nThink through the problem step by step before responding.\n`;
  }

  function adjustExamples(content) {
    return content;
  }

  function clarifyInstructions(content) {
    return content;
  }

  function shortenPrompt(content) {
    return content;
  }

  function fixClaudeDir(content) {
    return content.replace(/\.claude\//g, '${AI_STATE_DIR}/');
  }

  function fixClaudeMdReference(content) {
    return content.replace(/CLAUDE\.md/gi, 'AGENTS.md');
  }

  function addXmlForData(content) {
    return content;
  }

  function applyTextFix(content, fix) {
    return content;
  }

  function setNestedValue(obj, path, value) {
    const parts = path.split('.');
    const clone = structuredClone(obj);
    let current = clone;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (part.includes('[')) {
        const match = part.match(/^((?!__proto__|constructor|prototype)[a-zA-Z_]\w*)\[(\d{1,10})\]$/);
        if (match && match[1] !== '__proto__' && match[1] !== 'constructor' && match[1] !== 'prototype') {
          current = current[match[1]][parseInt(match[2], 10)];
        }
      } else {
        if (!isSafeKey(part)) return clone;
        current = current[part];
      }
    }
    const lastPart = parts[parts.length - 1];
    if (lastPart.includes('[')) {
      const match = lastPart.match(/^((?!__proto__|constructor|prototype)[a-zA-Z_]\w*)\[(\d{1,10})\]$/);
      if (match && match[1] !== '__proto__' && match[1] !== 'constructor' && match[1] !== 'prototype') {
        const key = match[1];
        const index = parseInt(match[2], 10);
        current[key][index] = applyFix(value, current[key][index]);
      }
    } else {
      if (isSafeKey(lastPart) && lastPart !== '__proto__' && lastPart !== 'constructor' && lastPart !== 'prototype') {
        current[lastPart] = applyFix(value, current[lastPart]);
      }
    }
    return clone;
  }

  function isSafeKey(key) {
    return key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
  }

  function applyFix(fix, current) {
    if (typeof fix === 'function') return fix(current);
    return fix;
  }

  function normalizeFrontmatter(frontmatter) {
    if (!frontmatter || typeof frontmatter !== 'object') return frontmatter;
    const result = { ...frontmatter };
    if (result.tools && Array.isArray(result.tools)) {
      result.tools = {};
      for (const [name, tool] of Object.entries(frontmatter.tools)) {
        result.tools[name] = normalizeFrontmatter(tool);
      }
    }
    return result;
  }

  function normalizeTools(tools) {
    if (!tools || typeof tools !== 'object') return tools;
    const result = { ...tools };
    if (result.tools && Array.isArray(result.tools) && !result.tools) {
      result.tools = Object.entries(result.tools)
        .filter(([name, tool]) => tool.name !== undefined)
        .map(([name]) => name);
    }
    return result;
  }

  function withReason(issue, reason) {
    return { ...issue, reason };
  }

  function filterAutoFixable(issues) {
    const result = [];
    for (const issue of issues) {
      if (issue.category === 'structure' && issue.fix) {
        result.push({
          filePath: issue.filePath,
          issue: issue.issue,
          fix: issue.fix || 'Auto-fix',
          willApply: true,
          reason: issue.category === 'structure' ? 'Auto-fixable' : 'Not auto-fixable'
        });
      } else {
        result.push({
          filePath: issue.filePath,
          issue: issue.issue,
          fix: issue.fix || 'Manual fix required',
          willApply: false,
          reason: issue.category === 'structure' ? 'Auto-fixable' : 'Not auto-fixable'
        });
      }
    }
    return result;
  }

  function backupFile(filePath) {
    const backupPath = filePath + '.bak';
    if (!fs.existsSync(backupPath)) return false;
    readAgentFile(backupPath);
    readAgentFile(filePath);
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    readAgentFile(filePath);
    fs.writeFileSync(filePath, backupContent, 'utf8');
    fs.unlinkSync(backupPath);
    return true;
  }

  function countMarkdownFiles(dir) {
    let count = 0;
    function walk(currentDir) {
      let entries;
      try {
        entries = fs.readdirSync(currentDir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          try {
            fs.unlinkSync(fullPath);
            count++;
          } catch (err) {
            console.error('Failed to delete file:', err.message);
          }
        }
      }
    }
    walk(dir);
    return count;
  }

  function addFrontmatterToContent(content) {
    if (!content || typeof content !== 'string') return content;
    if (/##\s*output\s*format/i.test(content) || /<output_format>/i.test(content)) return content;
    const frontmatter = `---\nname: agent\ndescription: Agent description\n---\n\n`;
    return frontmatter + content.trim();
  }

  function addExamples(content) {
    if (!content || typeof content !== 'string') return content;
    if (/<example>|##\s*example/i.test(content)) return content;
    const examples = `## Examples\n<good example>\nUser: Example request\nAssistant: Example response\n</good example>\n`;
    return content.trim() + '\n\n' + examples;
  }

  function wrapSection(content, headingRegex, tagName) {
    const lines = content.split('\n');
    let startIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (startIndex === -1) {
        if (headingRegex.test(lines[i])) {
          startIndex = i;
        }
      } else {
        if (/^#{1,6}\s/.test(lines[i]) || /^---/.test(lines[i])) {
          const before = lines.slice(0, startIndex);
          const section = lines.slice(startIndex, i);
          const after = lines.slice(i);
          return [...before, `<${tagName}>`, ...section, `</${tagName}>`, ...after].join('\n');
        }
      }
    }
    if (startIndex !== -1) {
      const before = lines.slice(0, startIndex);
      const section = lines.slice(startIndex);
      return [...before, `<${tagName}>`, ...section, `</${tagName}>`].join('\n');
    }
    return content;
  }

  function addRoleTags(content) {
    if (!content || typeof content !== 'string') return content;
    if (/<[a-z_][a-z0-9_-]*>/i.test(content)) return content;
    let result = content;
    result = wrapSection(result, /^##[ \t]*(?:your[ \t]+)?role[ \t]*$/im, 'role');
    result = wrapSection(result, /^##[ \t]*(?:constraints?|rules?)[ \t]*$/im, 'constraints');
    return result;
  }

  function addVerification(content) {
    if (!content || typeof content !== 'string') return content;
    if (/\bverif|test|validate|expected\s+output/i.test(content)) return content;
    const verification = `## Verification\n- Test the agent with sample inputs.\n- Validate the output format.\n- Check for edge cases.\n`;
    return content.trim() + '\n\n' + verification;
  }

  function addToolDescription(content) {
    if (!content || typeof content !== 'string') return content;
    const lines = content.split('\n');
    let inTools = false;
    let toolStart = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '## Tools') {
        if (!inTools) {
          inTools = true;
        } else {
          break;
        }
      } else {
        if (inTools && lines[i].startsWith('## ')) {
          toolStart = i;
          break;
        }
      }
    }
    if (toolStart !== -1) {
      const toolLine = lines[toolStart];
      if (!/use when user asks/i.test(toolLine)) {
        const match = toolLine.match(/^description:[ \t]*(\S.*)$/);
        if (match) {
          const description = match[1].trim();
          lines[toolStart] = `description: Use when user asks to ${description.replace(/^to\s+/i, '')}`;
        }
      }
    }
    return lines.join('\n');
  }

  function normalizeAcronyms(content) {
    if (!content || typeof content !== 'string') return content;
    let result = content;
    const codeBlocks = [];
    let counter = 0;
    result = result.replace(/

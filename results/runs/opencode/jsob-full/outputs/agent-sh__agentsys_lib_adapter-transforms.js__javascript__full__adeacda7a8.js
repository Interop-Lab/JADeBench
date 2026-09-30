'use strict';

/**
 * Content transformations used when installing Claude-style plugins into
 * OpenCode, Codex, Cursor, and Kiro.
 */

const COMMAND_PREFIXES =
  /(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g;

function replacePluginRoot(content, pluginInstallPath) {
  if (!pluginInstallPath) return content;
  return content
    .replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath)
    .replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath)
    .replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath)
    .replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
}

function removeCommandPrefixes(content) {
  return content.replace(COMMAND_PREFIXES, '$1');
}

function parseFrontmatter(content) {
  if (!content || !content.startsWith('---')) return { attributes: {}, body: content };
  const end = content.indexOf('\n---', 3);
  if (end < 0) return { attributes: {}, body: content };

  const attributes = {};
  const lines = content.substring(4, end).split('\n');
  let listKey = null;
  for (const line of lines) {
    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && listKey) {
      (attributes[listKey] ||= []).push(listItem[1].trim());
      continue;
    }
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    if (!value) {
      attributes[key] = [];
      listKey = key;
    } else {
      value = value.replace(/^(["'])(.*)\1$/, '$2');
      attributes[key] = value;
      listKey = null;
    }
  }
  return {
    attributes,
    body: content.substring(end + 4).replace(/^\n/, ''),
  };
}

function escapeYamlString(value = '') {
  return String(value)
    .replace(/[\x00-\x1f\x7f]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

function transformBodyForOpenCode(content, pluginInstallPath) {
  let result = content
    .replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, '${PLUGIN_ROOT}')
    .replace(/\$CLAUDE_PLUGIN_ROOT/g, '$PLUGIN_ROOT');

  // References in explanatory passages specifically discussing Claude Code
  // are left alone; ordinary configuration paths are converted.
  const outsideClaudeCodeExplanation = (match, offset) => {
    const nearby = content.substring(Math.max(0, offset - 100), offset + match.length + 100);
    return /Claude Code:/.test(nearby) ? match : match.replace('.claude', '.opencode');
  };
  result = result
    .replace(/\.claude\//g, outsideClaudeCodeExplanation)
    .replace(/\.claude'/g, outsideClaudeCodeExplanation)
    .replace(/\.claude"/g, outsideClaudeCodeExplanation)
    .replace(/\.claude`/g, outsideClaudeCodeExplanation);

  // Keep the argument for API compatibility. Discovery in the bundled source
  // uses it only for optional command/agent rewrites.
  void pluginInstallPath;
  return result;
}

function transformCommandFrontmatterForOpenCode(content) {
  if (!content.startsWith('---')) return content;
  const { attributes, body } = parseFrontmatter(content);
  let frontmatter = '---\n';
  if (attributes.description) frontmatter += `description: ${attributes.description}\n`;
  frontmatter += 'agent: general\n---\n';
  return frontmatter + body;
}

function transformAgentFrontmatterForOpenCode(content, options = {}) {
  if (!content.startsWith('---')) return content;
  const { attributes, body } = parseFrontmatter(content);
  const tools = Array.isArray(attributes.tools)
    ? attributes.tools.join(' ').toLowerCase()
    : String(attributes.tools || '').toLowerCase();
  const allowed = name => tools.includes(name);

  let result = '---\n';
  if (attributes.name) result += `name: ${attributes.name}\n`;
  if (attributes.description) result += `description: ${attributes.description}\n`;
  result += 'mode: subagent\n';
  if (attributes.model && !options.stripModels) {
    const models = { haiku: 'anthropic/claude-haiku-4-5', sonnet: 'anthropic/claude-sonnet-4-5', opus: 'anthropic/claude-opus-4-5' };
    result += `model: ${models[attributes.model] || attributes.model}\n`;
  }
  if (attributes.tools) {
    result += 'permission:\n';
    result += `  read: ${allowed('read') ? 'allow' : 'deny'}\n`;
    result += `  edit: ${allowed('edit') || allowed('write') ? 'allow' : 'deny'}\n`;
    result += `  bash: ${allowed('bash') ? 'allow' : 'deny'}\n`;
    result += `  glob: ${allowed('glob') ? 'allow' : 'deny'}\n`;
    result += `  grep: ${allowed('grep') ? 'allow' : 'deny'}\n`;
  }
  return `${result}---\n${body}`;
}

function transformSkillBodyForOpenCode(content, pluginInstallPath) {
  return transformBodyForOpenCode(content, pluginInstallPath);
}

function transformForCodex(content, options = {}) {
  const { skillName = '', description = '', pluginInstallPath = '' } = options;
  const escapedDescription = escapeYamlString(description);
  if (content.startsWith('---')) {
    content = content.replace(
      /^---\n[\s\S]*?\n---\n/,
      `---\nname: ${skillName}\ndescription: "${escapedDescription}"\n---\n`,
    );
  }
  content = replacePluginRoot(content, pluginInstallPath)
    .replace(/AskUserQuestion/g, 'request_user_input')
    .replace(/^[ \t]*multiSelect:.*\n?/gm, '')
    .replace(
      /^([ \t]*request_user_input:\s*)$/gm,
      '$1\n> **Codex**: Each question MUST include a unique `id` field (e.g., `id: "q1"`).',
    );
  return content;
}

function transformRuleForCursor(content, options = {}) {
  const description = escapeYamlString(options.description || '');
  const globs = options.globs;
  const alwaysApply = options.alwaysApply === undefined ? true : options.alwaysApply;
  const body = content.startsWith('---') ? content.replace(/^---\n[\s\S]*?\n---\n?/, '') : content;
  let frontmatter = `---\ndescription: "${description}"\n`;
  if (globs !== undefined) frontmatter += `globs: ${JSON.stringify(globs)}\n`;
  frontmatter += `alwaysApply: ${alwaysApply}\n---\n`;
  return frontmatter + replacePluginRoot(body, options.pluginInstallPath);
}

function transformSkillForCursor(content, { pluginInstallPath } = {}) {
  return removeCommandPrefixes(replacePluginRoot(content, pluginInstallPath));
}

function transformCommandForCursor(content, { pluginInstallPath } = {}) {
  if (content.startsWith('---')) content = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  content = replacePluginRoot(content, pluginInstallPath)
    .replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, '')
    .replace(/require\s*\(['"][^'"]+['"]\)/g, '')
    .replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, task => {
      const match = task.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
      return match ? `Run the \`${match[1]}\` subagent.` : '';
    });
  return removeCommandPrefixes(content);
}

const transformForCursor = transformRuleForCursor;

function transformSkillForKiro(content, { pluginInstallPath } = {}) {
  return removeCommandPrefixes(replacePluginRoot(content, pluginInstallPath));
}

function transformCommandForKiro(content, options = {}) {
  const body = content.startsWith('---') ? content.replace(/^---\n[\s\S]*?\n---\n?/, '') : content;
  let frontmatter = '---\ninclusion: manual\n';
  if (options.name) frontmatter += `name: "${escapeYamlString(options.name)}"\n`;
  if (options.description) frontmatter += `description: "${escapeYamlString(options.description)}"\n`;
  return `${frontmatter}---\n${removeCommandPrefixes(replacePluginRoot(body, options.pluginInstallPath))}`;
}

function kiroTools(value) {
  const text = (Array.isArray(value) ? value.join(' ') : String(value || '')).toLowerCase();
  const tools = [];
  if (/read|glob|grep/.test(text)) tools.push('read');
  if (/write|edit/.test(text)) tools.push('write');
  if (/bash|shell/.test(text)) tools.push('shell');
  if (/web|fetch|search/.test(text)) tools.push('web');
  return [...new Set(tools)];
}

function transformAgentForKiro(content, { pluginInstallPath } = {}) {
  const { attributes, body } = parseFrontmatter(content);
  const result = {
    name: attributes.name || '',
    description: attributes.description || '',
    prompt: removeCommandPrefixes(replacePluginRoot(body, pluginInstallPath)).trim(),
  };
  result.tools = kiroTools(attributes.tools);
  if (!result.tools.length) result.tools = ['read'];
  result.resources = ['file://.kiro/prompts/**/*.md'];
  return JSON.stringify(result, null, 2);
}

function generateCombinedReviewerAgent(reviewers, name, description) {
  const reviews = reviewers
    .map(reviewer => `## ${reviewer.name} Review\n\nFocus: ${reviewer.focus}`)
    .join('\n\n---\n\n');
  return JSON.stringify({
    name,
    description,
    prompt: 'You are a combined code reviewer covering multiple review passes in a single session.\n\n' +
      reviews +
      '\n\nFor each file you review, check ALL of the above review dimensions. Return findings as a JSON array with objects containing: pass (which review), file, line, severity (critical/high/medium/low), description, suggestion.',
    tools: ['read'],
    resources: ['file://.kiro/prompts/**/*.md'],
  }, null, 2);
}

module.exports = {
  transformBodyForOpenCode,
  transformCommandFrontmatterForOpenCode,
  transformAgentFrontmatterForOpenCode,
  transformSkillBodyForOpenCode,
  transformForCodex,
  transformRuleForCursor,
  transformSkillForCursor,
  transformCommandForCursor,
  transformForCursor,
  transformSkillForKiro,
  transformCommandForKiro,
  transformAgentForKiro,
  generateCombinedReviewerAgent,
};

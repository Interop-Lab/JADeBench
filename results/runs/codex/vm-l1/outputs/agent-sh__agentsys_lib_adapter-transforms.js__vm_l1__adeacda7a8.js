'use strict';

const path = require('path');

function splitFrontmatter(source) {
  if (!source.startsWith('---\n')) return { attributes: {}, body: source, found: false };
  const delimiter = source.startsWith('---', 4) ? 4 : source.indexOf('\n---', 4) + 1;
  if (delimiter < 4) return { attributes: {}, body: source, found: false };
  const attributes = {};
  const lines = source.slice(4, delimiter).replace(/\n$/, '').split('\n');
  for (let index = 0; index < lines.length; index++) {
    const match = /^([^:#][^:]*):(?:\s*(.*))?$/.exec(lines[index]);
    if (!match) continue;
    const key = match[1].trim();
    const rawValue = match[2] ?? '';
    attributes[key] = parseScalar(rawValue);
  }
  return { attributes, body: source.slice(delimiter + 3).replace(/^\n/, ''), found: true };
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed.slice(1, -1).split(',').map(item => unquote(item.trim())).filter(Boolean);
  }
  return unquote(trimmed);
}

function unquote(value) {
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function frontmatter(lines, body) {
  return `---\n${lines.filter(Boolean).join('\n')}\n---\n${body}`;
}

function quote(value) {
  return `"${value.replace(/"/g, '\\"')}"`;
}

function list(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

function replacePluginRoot(body, pluginInstallPath) {
  return body.replace(/\$\{?CLAUDE_PLUGIN_ROOT\}?/g, String(pluginInstallPath));
}

function transformBodyForOpenCode(body, sourcePath) {
  if (sourcePath !== undefined) path.dirname(sourcePath);
  return body
    .replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, '${PLUGIN_ROOT}')
    .replace(/\$CLAUDE_PLUGIN_ROOT/g, '$PLUGIN_ROOT');
}

function transformCommandFrontmatterForOpenCode(source) {
  const { attributes, body, found } = splitFrontmatter(source);
  if (!found) return source;
  const lines = [];
  if (attributes.description) lines.push(`description: ${attributes.description}`);
  lines.push('agent: general');
  return frontmatter(lines, body);
}

const openCodeModels = {
  haiku: 'anthropic/claude-haiku-3-5',
  sonnet: 'anthropic/claude-sonnet-4',
  opus: 'anthropic/claude-opus-4',
};

function transformAgentFrontmatterForOpenCode(source, options = {}) {
  const { attributes, body, found } = splitFrontmatter(source);
  if (!found) return source;
  const lines = [];
  if (attributes.name) lines.push(`name: ${attributes.name}`);
  if (attributes.description) lines.push(`description: ${attributes.description}`);
  lines.push('mode: subagent');
  if (options.stripModels === false && attributes.model) {
    lines.push(`model: ${openCodeModels[attributes.model] || attributes.model}`);
  }
  const tools = list(attributes.tools);
  if (tools.length) {
    const allows = new Set(tools);
    lines.push('permission:');
    lines.push(`  read: ${allows.has('Read') ? 'allow' : 'deny'}`);
    lines.push(`  edit: ${allows.has('Write') || allows.has('Edit') ? 'allow' : 'deny'}`);
    lines.push(`  bash: ${allows.has('Bash') ? 'allow' : 'deny'}`);
    lines.push(`  glob: ${allows.has('Glob') ? 'allow' : 'deny'}`);
    lines.push(`  grep: ${allows.has('Grep') ? 'allow' : 'deny'}`);
  }
  return frontmatter(lines, body);
}

function transformSkillBodyForOpenCode(body, sourcePath) {
  return transformBodyForOpenCode(body, sourcePath);
}

function transformForCodex(source, { skillName, description, pluginInstallPath }) {
  const { body } = splitFrontmatter(source);
  return frontmatter([
    `name: ${skillName}`,
    `description: ${quote(description)}`,
  ], replacePluginRoot(body, pluginInstallPath));
}

function transformRuleForCursor(source, {
  description = '',
  pluginInstallPath,
  globs,
  alwaysApply = true,
}) {
  const { body } = splitFrontmatter(source);
  const lines = [`description: ${quote(description)}`];
  if (Array.isArray(globs)) lines.push(`globs: [${globs.map(quote).join(',')}]`);
  else if (globs !== undefined) lines.push(`globs: ${quote(globs)}`);
  lines.push(`alwaysApply: ${alwaysApply}`);
  return frontmatter(lines, replacePluginRoot(body, pluginInstallPath));
}

function transformSkillForCursor(source, { pluginInstallPath }) {
  return replacePluginRoot(source, pluginInstallPath);
}

function transformCommandForCursor(source, { pluginInstallPath }) {
  const { body } = splitFrontmatter(source);
  return replacePluginRoot(body, pluginInstallPath);
}

function transformSkillForKiro(source, { pluginInstallPath }) {
  return replacePluginRoot(source, pluginInstallPath);
}

function transformCommandForKiro(source, {
  pluginInstallPath,
  name,
  description,
}) {
  const { body } = splitFrontmatter(source);
  const lines = ['inclusion: manual'];
  if (name !== undefined) lines.push(`name: ${quote(name)}`);
  if (description !== undefined) lines.push(`description: ${quote(description)}`);
  return frontmatter(lines, replacePluginRoot(body, pluginInstallPath));
}

function transformAgentForKiro(source, { pluginInstallPath } = {}) {
  const { attributes, body } = splitFrontmatter(source);
  const sourceTools = list(attributes.tools);
  const tools = ['read'];
  if (sourceTools.includes('Write') || sourceTools.includes('Edit')) tools.push('write');
  if (sourceTools.includes('Bash')) tools.push('shell');
  return JSON.stringify({
    name: attributes.name || '',
    description: attributes.description || '',
    prompt: replacePluginRoot(body, pluginInstallPath),
    tools,
    resources: ['file://.kiro/prompts/**/*.md'],
  }, null, 2);
}

function generateCombinedReviewerAgent(reviewPasses, name, description) {
  const sections = reviewPasses.map(review =>
    `## ${review.name} Review\n\nFocus: ${review.focus}`,
  ).join('\n\n---\n\n');
  return JSON.stringify({
    ...(name !== undefined ? { name } : {}),
    ...(description !== undefined ? { description } : {}),
    prompt: `You are a combined code reviewer covering multiple review passes in a single session.\n\n${sections}\n\nFor each file you review, check ALL of the above review dimensions. Return findings as a JSON array with objects containing: pass (which review), file, line, severity (critical/high/medium/low), description, suggestion.`,
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
  transformForCursor: transformRuleForCursor,
  transformSkillForKiro,
  transformCommandForKiro,
  transformAgentForKiro,
  generateCombinedReviewerAgent,
};

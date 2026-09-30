'use strict';

function splitFrontmatter(content) {
  const lfMatch = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(content);
  const crlfMatch = /^---\r\n([\s\S]*?)\r\n---\r\n([\s\S]*)$/.exec(content);
  const match = lfMatch || crlfMatch;
  if (!match) return { hasFrontmatter: false, raw: '', attributes: {}, body: content };

  const attributes = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator < 0 || /^\s/.test(line)) continue;
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    if (!rawValue) {
      attributes[key] = [];
    } else if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      attributes[key] = rawValue.slice(1, -1).split(',').map(value => value.trim()).filter(Boolean);
    } else if ((rawValue.startsWith('"') && rawValue.endsWith('"')) ||
               (rawValue.startsWith("'") && rawValue.endsWith("'"))) {
      attributes[key] = rawValue.slice(1, -1);
    } else {
      attributes[key] = rawValue;
    }
  }
  return { hasFrontmatter: true, raw: match[1], attributes, body: match[2] };
}

function rawFrontmatterValue(raw, key) {
  const match = raw.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  return match && match[1].trim();
}

function yamlQuote(value) {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function formatFrontmatter(lines, body, blankLine = false) {
  return `---\n${lines.join('\n')}\n---\n${blankLine ? '\n' : ''}${body}`;
}

function transformBodyForOpenCode(content, sourcePath) {
  void sourcePath;
  return content
    .replaceAll('${CLAUDE_PLUGIN_ROOT}', '${PLUGIN_ROOT}')
    .replaceAll('$CLAUDE_PLUGIN_ROOT', '$PLUGIN_ROOT');
}

function transformCommandFrontmatterForOpenCode(content) {
  const parsed = splitFrontmatter(content);
  if (!parsed.hasFrontmatter && content === '---\n---\n') {
    return formatFrontmatter(['agent: general'], '');
  }
  if (!parsed.hasFrontmatter || content.includes('\r\n')) return content;
  const lines = [];
  const description = rawFrontmatterValue(parsed.raw, 'description');
  if (description) lines.push(`description: ${description}`);
  lines.push('agent: general');
  return formatFrontmatter(lines, parsed.body);
}

function parseTools(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value).replace(/^\[|\]$/g, '').split(',').map(tool => tool.trim()).filter(Boolean);
}

function transformAgentFrontmatterForOpenCode(content, fallbackName) {
  void fallbackName;
  const parsed = splitFrontmatter(content);
  if (!parsed.hasFrontmatter && content === '---\n---\n') {
    return formatFrontmatter(['mode: subagent'], '');
  }
  if (!parsed.hasFrontmatter || content.includes('\r\n')) return content;

  const lines = [];
  const name = rawFrontmatterValue(parsed.raw, 'name');
  const description = rawFrontmatterValue(parsed.raw, 'description');
  if (name) lines.push(`name: ${name}`);
  if (description) lines.push(`description: ${description}`);
  lines.push('mode: subagent');

  const tools = parseTools(parsed.attributes.tools).map(tool => tool.toLowerCase());
  if (tools.length) {
    lines.push('permission:');
    lines.push(`  read: ${tools.includes('read') ? 'allow' : 'deny'}`);
    lines.push(`  edit: ${tools.some(tool => ['edit', 'write', 'notebookedit'].includes(tool)) ? 'allow' : 'deny'}`);
    lines.push(`  bash: ${tools.includes('bash') ? 'allow' : 'ask'}`);
    lines.push(`  glob: ${tools.includes('glob') ? 'allow' : 'deny'}`);
    lines.push(`  grep: ${tools.includes('grep') ? 'allow' : 'deny'}`);
  }
  return formatFrontmatter(lines, parsed.body);
}

function transformSkillBodyForOpenCode(content, sourcePath) {
  return transformBodyForOpenCode(content, sourcePath);
}

function transformForCodex(content, { skillName, description, pluginInstallPath }) {
  const quotedDescription = yamlQuote(description);
  const parsed = splitFrontmatter(content);
  if (content.startsWith('---') && !parsed.hasFrontmatter) return content;
  if (parsed.hasFrontmatter && content.includes('\r\n')) return content;
  if (parsed.hasFrontmatter && !parsed.raw.trim()) return content;
  return formatFrontmatter([
    `name: ${skillName}`,
    `description: ${quotedDescription}`,
  ], replacePluginRoot(parsed.body, pluginInstallPath), !parsed.hasFrontmatter);
}

function transformRuleForCursor(content, { description, globs, alwaysApply = true, pluginInstallPath }) {
  const parsed = splitFrontmatter(content);
  const body = replacePluginRoot(
    parsed.hasFrontmatter && parsed.raw.trim() && !content.includes('\r\n') ? parsed.body : content,
    pluginInstallPath,
  );
  const lines = [`description: ${yamlQuote(description || '')}`];
  if (globs !== undefined && globs !== null && globs !== false && globs !== 0 && globs !== '') {
    lines.push(`globs: ${Array.isArray(globs) ? `[${globs.map(yamlQuote).join(',')}]` : yamlQuote(globs)}`);
  }
  lines.push(`alwaysApply: ${Boolean(alwaysApply)}`);
  return formatFrontmatter(lines, body);
}

function replacePluginRoot(content, pluginInstallPath) {
  return content
    .replaceAll('${CLAUDE_PLUGIN_ROOT}', pluginInstallPath)
    .replaceAll('$CLAUDE_PLUGIN_ROOT', pluginInstallPath);
}

function transformSkillForCursor(content, options) {
  const { pluginInstallPath } = options;
  return replacePluginRoot(content, pluginInstallPath);
}

function transformCommandForCursor(content, options) {
  const { pluginInstallPath } = options;
  const parsed = splitFrontmatter(content);
  const body = parsed.hasFrontmatter && parsed.raw.trim() && !content.includes('\r\n') ? parsed.body : content;
  return replacePluginRoot(body, pluginInstallPath);
}

function transformSkillForKiro(content, options) {
  const { pluginInstallPath } = options;
  return replacePluginRoot(content, pluginInstallPath);
}

function transformCommandForKiro(content, options) {
  const { pluginInstallPath, name, description } = options;
  const parsed = splitFrontmatter(content);
  const body = parsed.hasFrontmatter && parsed.raw.trim() && !content.includes('\r\n') ? parsed.body : content;
  const lines = ['inclusion: manual'];
  if (name) lines.push(`name: ${yamlQuote(name)}`);
  if (description) lines.push(`description: ${yamlQuote(description)}`);
  return formatFrontmatter(lines, replacePluginRoot(body, pluginInstallPath));
}

function mapKiroTools(value) {
  const mapped = [];
  for (const tool of parseTools(value).map(tool => tool.toLowerCase())) {
    let kiroTool;
    if (['read', 'glob', 'grep'].includes(tool)) kiroTool = 'read';
    else if (['write', 'edit', 'notebookedit'].includes(tool)) kiroTool = 'write';
    else if (['bash', 'webfetch', 'websearch', 'task'].includes(tool)) kiroTool = 'shell';
    if (kiroTool && !mapped.includes(kiroTool)) mapped.push(kiroTool);
  }
  return mapped.length ? mapped : ['read'];
}

function transformAgentForKiro(content, options) {
  const parsed = splitFrontmatter(content);
  const emptyFrontmatter = content === '---\n---\n';
  const attributes = parsed.attributes;
  const pluginInstallPath = options && typeof options === 'object' ? options.pluginInstallPath : undefined;
  const rawPrompt = emptyFrontmatter ? '' : parsed.body.trim();
  const prompt = pluginInstallPath ? replacePluginRoot(rawPrompt, pluginInstallPath) : rawPrompt;
  return JSON.stringify({
    name: attributes.name === undefined ? '' : attributes.name,
    description: attributes.description === undefined ? '' : attributes.description,
    prompt,
    tools: mapKiroTools(attributes.tools),
    resources: ['file://.kiro/prompts/**/*.md'],
  }, null, 2);
}

function generateCombinedReviewerAgent(reviewPasses, name, description) {
  const sections = reviewPasses.map(reviewPass =>
    `## ${reviewPass.name} Review\n\nFocus: ${reviewPass.focus}`
  );
  const prompt = [
    'You are a combined code reviewer covering multiple review passes in a single session.',
    sections.join('\n\n---\n\n'),
    'For each file you review, check ALL of the above review dimensions. Return findings as a JSON array with objects containing: pass (which review), file, line, severity (critical/high/medium/low), description, suggestion.',
  ].join('\n\n');
  return JSON.stringify({
    name,
    description,
    prompt,
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

'use strict';

const NAMESPACED_COMMAND = /(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g;
const PLUGIN_ROOT_PATTERNS = [
  /\$\{CLAUDE_PLUGIN_ROOT\}/g,
  /\$CLAUDE_PLUGIN_ROOT/g,
  /\$\{PLUGIN_ROOT\}/g,
  /\$PLUGIN_ROOT/g,
];

function replacePluginRoot(source, pluginInstallPath) {
  for (const pattern of PLUGIN_ROOT_PATTERNS) {
    source = source.replace(pattern, () => pluginInstallPath);
  }
  return source;
}

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)^---\n?/m);
  if (!match) return null;

  const fields = {};
  for (const line of match[1].trim().split('\n')) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return { fields, body: source.slice(match[0].length) };
}

function quoteYaml(value) {
  const sanitized = String(value ?? '').replace(/[\x00-\x1f\x7f]/g, ' ');
  return JSON.stringify(sanitized);
}

function transformBodyForOpenCode(body, pluginInstallPath) {
  body = replacePluginRoot(body, pluginInstallPath);
  body = body.replace(/\.claude\//g, '.opencode/');
  body = body.replace(/\.claude'/g, ".opencode'");
  body = body.replace(/\.claude"/g, '.opencode"');
  body = body.replace(/\.claude`/g, '.opencode`');
  body = body.replace(/\.claude\b/g, '.opencode');
  return body.replace(NAMESPACED_COMMAND, '$1');
}

function transformCommandFrontmatterForOpenCode(source) {
  const parsed = parseFrontmatter(source);
  if (!parsed) return source;

  const lines = [];
  for (const [key, value] of Object.entries(parsed.fields)) {
    if (key === 'allowed-tools') {
      lines.push(`tools: ${value}`);
    } else if (key !== 'name') {
      lines.push(`${key}: ${value}`);
    }
  }
  return `---\n${lines.join('\n')}\n---\n${parsed.body}`;
}

function transformAgentFrontmatterForOpenCode(source, options = {}) {
  const parsed = parseFrontmatter(source);
  if (!parsed) return source;

  const { stripModels = true } = options;
  const lines = [];
  for (const [key, value] of Object.entries(parsed.fields)) {
    if (stripModels && key === 'model') continue;
    lines.push(`${key}: ${value}`);
  }
  return `---\n${lines.join('\n')}\n---\n${parsed.body}`;
}

function transformSkillBodyForOpenCode(body, pluginInstallPath) {
  return transformBodyForOpenCode(body, pluginInstallPath);
}

function transformForCodex(source, options) {
  const { skillName, description = '', pluginInstallPath } = options;
  const frontmatter = `---\nname: ${skillName}\ndescription: ${quoteYaml(description)}\n---\n`;

  if (source.startsWith('---')) {
    source = source.replace(/^---\n[\s\S]*?\n---\n/, frontmatter);
  } else {
    source = `${frontmatter}\n${source}`;
  }

  source = replacePluginRoot(source, pluginInstallPath);
  source = source.replace(NAMESPACED_COMMAND, '$1');
  source = source.replace(/\bAskUserQuestion\b/g, 'request_user_input');
  source = source.replace(
    /(request_user_input[^\n]*\n)/g,
    '$1\n> **Codex**: Each question MUST include a unique `id` field (e.g., `id: "q1"`).\n',
  );
  return source;
}

function transformRuleForCursor(source, options) {
  const {
    description = '',
    pluginInstallPath,
    globs = '',
    alwaysApply = false,
  } = options;

  let frontmatter = `description: ${quoteYaml(description)}\n`;
  if (globs) frontmatter += `globs: ${JSON.stringify(globs)}\n`;
  frontmatter += `alwaysApply: ${Boolean(alwaysApply)}\n`;

  source = source.replace(/^---\n[\s\S]*?\n---\n?/, '');
  source = replacePluginRoot(source, pluginInstallPath);
  source = source.replace(NAMESPACED_COMMAND, '$1');
  return `---\n${frontmatter}---\n\n${source}`;
}

function transformSkillForCursor(source, { pluginInstallPath }) {
  source = replacePluginRoot(source, pluginInstallPath);
  return source.replace(NAMESPACED_COMMAND, '$1');
}

function transformCommandForCursor(source, { pluginInstallPath }) {
  source = source.replace(/^---\n[\s\S]*?\n---\n?/, '');
  source = replacePluginRoot(source, pluginInstallPath);
  source = source.replace(
    /(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\([^\n]+\);?\n?/g,
    '',
  );
  return source.replace(NAMESPACED_COMMAND, '$1');
}

function transformSkillForKiro(source, { pluginInstallPath }) {
  source = replacePluginRoot(source, pluginInstallPath);
  return source.replace(NAMESPACED_COMMAND, '$1');
}

function transformCommandForKiro(source, options) {
  const { pluginInstallPath } = options;
  const parsed = parseFrontmatter(source);
  const body = parsed ? parsed.body : source;
  return replacePluginRoot(body, pluginInstallPath).replace(NAMESPACED_COMMAND, '$1');
}

function transformAgentForKiro(source, options) {
  const { pluginInstallPath } = options;
  const parsed = parseFrontmatter(source);
  const fields = parsed?.fields ?? {};
  const body = replacePluginRoot(parsed?.body ?? source, pluginInstallPath).replace(
    NAMESPACED_COMMAND,
    '$1',
  );

  const name = fields.name || options.name || 'agent';
  const description = fields.description || options.description || '';
  const model = fields.model || options.model;
  const tools = fields.tools || options.tools;

  const metadata = [`name: ${name}`, `description: ${quoteYaml(description)}`];
  if (model) metadata.push(`model: ${model}`);
  if (tools) metadata.push(`tools: ${tools}`);
  return `---\n${metadata.join('\n')}\n---\n\n${body}`;
}

function generateCombinedReviewerAgent(reviewers, name, description) {
  const reviewerSections = reviewers
    .map((reviewer) => `## ${reviewer.name} Review\n\nFocus: ${reviewer.focus}`)
    .join('\n\n---\n\n');

  return JSON.stringify(
    {
      name,
      description,
      prompt: [
        'You are a combined review agent. Review the supplied work from each perspective below.',
        reviewerSections,
        'Synthesize the findings, remove duplicates, and prioritize concrete, actionable issues.',
      ].join('\n\n'),
      tools: ['read'],
      resources: ['file://.kiro/prompts/**/*.md'],
    },
    null,
    2,
  );
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

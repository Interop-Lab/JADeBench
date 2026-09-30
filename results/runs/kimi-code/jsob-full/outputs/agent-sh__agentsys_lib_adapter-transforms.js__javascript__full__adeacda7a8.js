'use strict';

const fs = require('fs');
const path = require('path');

let discoveryCache = null;
let cachedRoot = null;

function parseFrontmatter(content) {
  if (!content || !content.startsWith('---')) return {};
  const end = content.indexOf('\n---', 3);
  if (end === -1) return {};

  const result = Object.create(null);
  let listKey = null;
  let list = null;
  for (const line of content.substring(3, end).split('\n')) {
    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && listKey && list) {
      list.push(unquote(listItem[1].trim()));
      continue;
    }

    const separator = line.indexOf(':');
    if (separator <= 0) continue;
    if (listKey && list) result[listKey] = list;

    const key = line.substring(0, separator).trim();
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      listKey = null;
      list = null;
      continue;
    }

    const value = line.substring(separator + 1).trim();
    if (!value) {
      listKey = key;
      list = [];
    } else {
      result[key] = unquote(value);
      listKey = null;
      list = null;
    }
  }
  if (listKey && list) result[listKey] = list;
  return result;
}

function unquote(value) {
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function isValidPluginName(name) {
  return /^[a-z0-9][a-z0-9-]*$/.test(name);
}

function pluginsDirectory(root) {
  return path.join(root || path.resolve(__dirname, '..', '..'), 'plugins');
}

function getCached(root) {
  const resolvedRoot = root || path.resolve(__dirname, '..', '..');
  return discoveryCache && cachedRoot === resolvedRoot ? discoveryCache : null;
}

function cacheResult(root, key, value) {
  const resolvedRoot = root || path.resolve(__dirname, '..', '..');
  if (!discoveryCache || cachedRoot !== resolvedRoot) {
    discoveryCache = {};
    cachedRoot = resolvedRoot;
  }
  discoveryCache[key] = value;
}

function discoverPlugins(root) {
  const cached = getCached(root);
  if (cached?.plugins) return cached.plugins;
  const directory = pluginsDirectory(root);
  if (!fs.existsSync(directory)) return [];
  const plugins = fs.readdirSync(directory)
    .filter(name => isValidPluginName(name) && fs.existsSync(path.join(directory, name, '.claude-plugin', 'plugin.json')))
    .sort();
  cacheResult(root, 'plugins', plugins);
  return plugins;
}

function discoverMarkdownFiles(root, subdirectory) {
  const cached = getCached(root);
  if (cached?.[subdirectory]) return cached[subdirectory];
  const base = pluginsDirectory(root);
  const entries = [];
  for (const plugin of discoverPlugins(root)) {
    const directory = path.join(base, plugin, subdirectory);
    if (!fs.existsSync(directory)) continue;
    for (const file of fs.readdirSync(directory).filter(file => file.endsWith('.md')).sort()) {
      const content = fs.readFileSync(path.join(directory, file), 'utf8');
      entries.push({
        name: file.replace(/\.md$/, ''),
        plugin,
        file,
        frontmatter: parseFrontmatter(content),
      });
    }
  }
  cacheResult(root, subdirectory, entries);
  return entries;
}

function discoverCommands(root) {
  return discoverMarkdownFiles(root, 'commands');
}

function discoverAgents(root) {
  return discoverMarkdownFiles(root, 'agents');
}

function discoverSkills(root) {
  const cached = getCached(root);
  if (cached?.skills) return cached.skills;
  const base = pluginsDirectory(root);
  const skills = [];
  for (const plugin of discoverPlugins(root)) {
    const directory = path.join(base, plugin, 'skills');
    if (!fs.existsSync(directory)) continue;
    for (const name of fs.readdirSync(directory).sort()) {
      const file = path.join(directory, name, 'SKILL.md');
      if (!fs.existsSync(file)) continue;
      skills.push({
        name,
        plugin,
        dir: name,
        frontmatter: parseFrontmatter(fs.readFileSync(file, 'utf8')),
      });
    }
  }
  cacheResult(root, 'skills', skills);
  return skills;
}

function discoverAll(root) {
  return {
    plugins: discoverPlugins(root),
    commands: discoverCommands(root),
    agents: discoverAgents(root),
    skills: discoverSkills(root),
  };
}

function getCommandMappings(root) {
  return discoverCommands(root).map(command => [command.file, command.plugin, command.file]);
}

function getCodexSkillMappings(root) {
  return discoverCommands(root).map(command => [
    command.name,
    command.plugin,
    command.file,
    command.frontmatter['codex-description'] || command.frontmatter.description || '',
  ]);
}

function getCursorRuleMappings(root) {
  return discoverCommands(root).map(command => [
    `agentsys-${command.plugin}-${command.name}`,
    command.plugin,
    command.file,
    command.frontmatter['cursor-description'] ||
      command.frontmatter['codex-description'] ||
      command.frontmatter.description || '',
    command.frontmatter.type || 'command',
    command.frontmatter.globs || '',
  ]);
}

function getKiroSteeringMappings(root) {
  return discoverCommands(root).map(command => [
    command.name,
    command.plugin,
    command.file,
    command.frontmatter['kiro-description'] ||
      command.frontmatter['cursor-description'] ||
      command.frontmatter['codex-description'] ||
      command.frontmatter.description || '',
  ]);
}

function getPluginPrefixRegex(root) {
  const plugins = discoverPlugins(root);
  if (!plugins.length) return /$^/g;
  return new RegExp(`(${plugins.map(escapeRegex).join('|')})`, 'g');
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function invalidateCache() {
  discoveryCache = null;
  cachedRoot = null;
}

const discovery = {
  parseFrontmatter,
  isValidPluginName,
  discoverPlugins,
  discoverCommands,
  discoverAgents,
  discoverSkills,
  discoverAll,
  getCommandMappings,
  getCodexSkillMappings,
  getCursorRuleMappings,
  getKiroSteeringMappings,
  getPluginPrefixRegex,
  invalidateCache,
};

const PLUGIN_COMMAND_PREFIX = /(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g;
const REQUIRE_DECLARATION = /(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g;
const REQUIRE_CALL = /require\s*\(['"][^'"]+['"]\)/g;
const TASK_CALL = /await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g;
const KIRO_REVIEW_PHASE = '**Review phase (Kiro - max 4 agents, fallback to 2 sequential):**\n\n' +
  'Try delegating to these subagents (experimental parallel spawning):\n\n';
const KIRO_REVIEW_FALLBACK = '\n\nIf parallel spawning is unavailable, run 2 combined reviewers sequentially:\n' +
  '1. Delegate to the `reviewer-quality-security` subagent (code quality + security)\n' +
  '2. Then delegate to the `reviewer-perf-test` subagent (performance + test coverage)\n\n' +
  'Aggregate all findings from whichever execution path succeeded.';
const OPEN_CODE_POLICY_SELECTION = `
## Phase 1: Policy Selection (Built-in Options)

Ask the user these questions using AskUserQuestion:

**Question 1 - Source**: "Where should I look for tasks?"
- GitHub Issues - Use \`gh issue list\` to find issues
- GitHub Projects - Issues from a GitHub Project board
- GitLab Issues - Use \`glab issue list\` to find issues
- Local tasks.md - Read from PLAN.md, tasks.md, or TODO.md in the repository
- Custom - User specifies their own source
- Other - User describes source, you figure it out

If the user selects GitHub Projects, ask two follow-up questions: project number (positive integer from the project URL, e.g. 1, 5, 42) and project owner (@me for your own projects, or the org/username). Pass as responses.project = { number, owner } to parseAndCachePolicy.

**Question 2 - Priority**: "What type of tasks to prioritize?"
- All - Consider all tasks, pick by score
- Bugs - Focus on bug fixes
- Security - Security issues first
- Features - New feature development

**Question 3 - Stop Point**: "How far should I take this task?"
- Merged - Until PR is merged to main
- PR Created - Stop after creating PR
- Implemented - Stop after local implementation
- Deployed - Deploy to staging
- Production - Full production deployment

After the user answers, proceed to Phase 2 with the selected policy.

`;

function replacePluginRoots(content, installPath) {
  return content
    .replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => installPath)
    .replace(/\$CLAUDE_PLUGIN_ROOT/g, () => installPath)
    .replace(/\$\{PLUGIN_ROOT\}/g, () => installPath)
    .replace(/\$PLUGIN_ROOT/g, () => installPath);
}

function stripFrontmatter(content) {
  return content.startsWith('---') ? content.replace(/^---\n[\s\S]*?\n---\n?/, '') : content;
}

function replaceTaskCallForOpenCode(call) {
  const agent = call.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
  return agent ? `Invoke \`@${agent[1]}\` agent` : '*(Task call - use @agent-name syntax)*';
}

function replaceTaskCallForCursor(call) {
  const agent = call.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
  return agent ? `Invoke the ${agent[1]} agent` : '';
}

function replaceTaskCallForKiro(call) {
  const agent = call.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
  if (!agent) return '';
  const prompt = call.match(/prompt:\s*[`"']([\s\S]*?)[`"']/);
  const firstLine = prompt?.[1].replace(/\\n/g, '\n').trim().split('\n')[0];
  return firstLine
    ? `Delegate to the \`${agent[1]}\` subagent:\n> ${firstLine}`
    : `Delegate to the \`${agent[1]}\` subagent.`;
}

function transformBodyForOpenCode(content, root) {
  content = content
    .replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, '${PLUGIN_ROOT}')
    .replace(/\$CLAUDE_PLUGIN_ROOT/g, '$PLUGIN_ROOT');

  for (const quote of ["'", '"', '`']) {
    content = content.replace(new RegExp(`\\.claude${escapeRegex(quote)}`, 'g'), (match, offset) => {
      const context = content.substring(Math.max(0, offset - 60), offset + match.length + 10);
      return /Claude Code:/.test(context) ? match : `.opencode${quote}`;
    });
  }
  content = content.replace(/\.claude\//g, (match, offset) => {
    const context = content.substring(Math.max(0, offset - 60), offset + match.length + 10);
    return /Claude Code:/.test(context) ? match : '.opencode/';
  });

  const plugins = discovery.discoverPlugins(root);
  if (plugins.length) {
    const names = plugins.map(escapeRegex).join('|');
    content = content
      .replace(new RegExp('`(' + names + '):([a-z-]+)`', 'g'), '`$2`')
      .replace(new RegExp(`(${names}):([a-z-]+)`, 'g'), '$2');
  }

  content = content.replace(/```(\w*)\n([\s\S]*?)```/g, (block, language, body) => {
    const normalized = (language || '').toLowerCase();
    if (['bash', 'shell', 'sh'].includes(normalized)) {
      return body.includes('node -e') && body.includes('require(')
        ? '*(Bash command with Node.js require - adapt for OpenCode)*'
        : block;
    }
    if (!language && /^(?:\s*(?:gh|glab|git) |\s*#!)/.test(body)) return block;
    if (!looksLikeJavaScript(body)) return block;

    const notes = [];
    for (const match of body.matchAll(/(?:await\s+)?Task\s*\(\s*\{[^}]*subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["'][^}]*\}\s*\)/gs)) {
      notes.push(`- Invoke \`@${match[1]}\` agent`);
    }
    for (const match of body.matchAll(/startPhase\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) notes.push(`- Phase: ${match[1]}`);
    if (body.includes('AskUserQuestion')) notes.push('- Use AskUserQuestion to request user input');
    if (body.includes('EnterPlanMode')) notes.push('- Use EnterPlanMode for user approval');
    if (body.includes('completePhase')) notes.push('- Call `workflowState.completePhase(result)` to advance workflow state');
    return notes.length ? notes.join('\n') : '*(JavaScript reference - not executable in OpenCode)*';
  });

  content = content
    .replace(/\*\(Reference - adapt for OpenCode\)\*/g, '')
    .replace(/await\s+Task\s*\(\s*\{[\s\S]*?\}\s*\);?/g, replaceTaskCallForOpenCode)
    .replace(REQUIRE_DECLARATION, '')
    .replace(REQUIRE_CALL, '');

  if (content.includes('agent')) {
    const note = '\n> **OpenCode Note**: Invoke agents using `@agent-name` syntax.\n' +
      '> Available agents: task-discoverer, exploration-agent, planning-agent,\n' +
      '> implementation-agent, deslop-agent, delivery-validator, sync-docs-agent, consult-agent\n' +
      '> Example: `@exploration-agent analyze the codebase`\n\n';
    content = content.replace(/^(---\n[\s\S]*?---\n)/, `$1${note}`);
  }
  if (content.includes('Master Workflow Orchestrator') && content.includes('No Shortcuts Policy')) {
    content = content.replace(
      /(Example:.*analyze the codebase`\n\n)/,
      '$1' + OPEN_CODE_POLICY_SELECTION,
    );
  }
  return content;
}

function looksLikeJavaScript(body) {
  return body.includes('require(') ||
    /^\s*(?:const|let)\s+[a-zA-Z_$[{]/m.test(body) ||
    body.includes('function ') || body.includes('=>') ||
    body.includes('async ') || body.includes('await ') ||
    body.includes('completePhase');
}

function parseSimpleFrontmatterBlock(block) {
  const values = {};
  for (const line of block.trim().split('\n')) {
    const separator = line.indexOf(':');
    if (separator > 0) values[line.substring(0, separator).trim()] = line.substring(separator + 1).trim();
  }
  return values;
}

function transformCommandFrontmatterForOpenCode(content) {
  return content.replace(/^---\n([\s\S]*?)^---/m, (_match, block) => {
    const values = parseSimpleFrontmatterBlock(block);
    return `---\n${values.description ? `description: ${values.description}\n` : ''}agent: general\n---`;
  });
}

function transformAgentFrontmatterForOpenCode(content, options = {}) {
  const { stripModels = true } = options;
  return content.replace(/^---\n([\s\S]*?)^---/m, (_match, block) => {
    const values = parseSimpleFrontmatterBlock(block);
    let frontmatter = '---\n';
    if (values.name) frontmatter += `name: ${values.name}\n`;
    if (values.description) frontmatter += `description: ${values.description}\n`;
    frontmatter += 'mode: subagent\n';
    if (values.model && !stripModels) {
      const models = {
        sonnet: 'anthropic/claude-sonnet-4',
        opus: 'anthropic/claude-opus-4',
        haiku: 'anthropic/claude-haiku-3-5',
      };
      frontmatter += `model: ${models[values.model] || values.model}\n`;
    }
    if (values.tools) {
      const tools = values.tools.toLowerCase();
      frontmatter += 'permission:\n';
      frontmatter += `  read: ${tools.includes('read') ? 'allow' : 'deny'}\n`;
      frontmatter += `  edit: ${tools.includes('edit') || tools.includes('write') ? 'allow' : 'deny'}\n`;
      frontmatter += `  bash: ${tools.includes('bash') ? 'allow' : 'ask'}\n`;
      frontmatter += `  glob: ${tools.includes('glob') ? 'allow' : 'deny'}\n`;
      frontmatter += `  grep: ${tools.includes('grep') ? 'allow' : 'deny'}\n`;
    }
    return `${frontmatter}---`;
  });
}

function transformSkillBodyForOpenCode(content, root) {
  return transformBodyForOpenCode(content, root);
}

function transformForCodex(content, options) {
  const { skillName, description, pluginInstallPath } = options;
  const escapedDescription = description.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const frontmatter = `---\nname: ${skillName}\ndescription: "${escapedDescription}"\n---\n`;
  content = content.startsWith('---')
    ? content.replace(/^---\n[\s\S]*?\n---\n/, frontmatter)
    : `${frontmatter}\n${content}`;
  return replacePluginRoots(content, pluginInstallPath)
    .replace(/AskUserQuestion/g, 'request_user_input')
    .replace(/^[ \t]*multiSelect:.*\n?/gm, '')
    .replace(/^([ \t]*request_user_input:\s*)$/gm,
      '$1\n> **Codex**: Each question MUST include a unique `id` field (e.g., `id: "q1"`).');
}

function transformRuleForCursor(content, options) {
  const { description = '', pluginInstallPath, globs = '', alwaysApply = true } = options;
  const cleanDescription = description.replace(/[\x00-\x1f\x7f]/g, ' ')
    .replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  let frontmatter = `---\ndescription: "${cleanDescription}"\n`;
  if (globs) frontmatter += `globs: ${JSON.stringify(globs)}\n`;
  frontmatter += `alwaysApply: ${alwaysApply}\n---\n`;
  content = `${frontmatter}${stripFrontmatter(content)}`;
  return replacePluginRoots(content, pluginInstallPath)
    .replace(TASK_CALL, replaceTaskCallForCursor)
    .replace(REQUIRE_DECLARATION, '')
    .replace(REQUIRE_CALL, '')
    .replace(PLUGIN_COMMAND_PREFIX, '$1');
}

function transformSkillForCursor(content, { pluginInstallPath }) {
  return replacePluginRoots(content, pluginInstallPath).replace(PLUGIN_COMMAND_PREFIX, '$1');
}

function transformCommandForCursor(content, { pluginInstallPath }) {
  return replacePluginRoots(stripFrontmatter(content), pluginInstallPath)
    .replace(REQUIRE_DECLARATION, '')
    .replace(REQUIRE_CALL, '')
    .replace(TASK_CALL, replaceTaskCallForCursor)
    .replace(PLUGIN_COMMAND_PREFIX, '$1');
}

function transformSkillForKiro(content, { pluginInstallPath }) {
  return replacePluginRoots(content, pluginInstallPath).replace(PLUGIN_COMMAND_PREFIX, '$1');
}

function transformCommandForKiro(content, { pluginInstallPath, name = '', description = '' }) {
  content = stripFrontmatter(content);
  const cleanDescription = description.replace(/[\x00-\x1f\x7f]/g, ' ')
    .replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  let frontmatter = '---\ninclusion: manual\n';
  if (name) frontmatter += `name: "${name}"\n`;
  if (description) frontmatter += `description: "${cleanDescription}"\n`;
  frontmatter += '---\n';

  content = replacePluginRoots(`${frontmatter}${content}`, pluginInstallPath)
    .replace(REQUIRE_DECLARATION, '')
    .replace(REQUIRE_CALL, '')
    .replace(/^```(?:javascript|js)?\n([\s\S]*?)^```$/gm, (block, body) => {
      if (!body.includes('Promise.all') || !body.includes('Task(')) return block;
      const delegates = [...body.matchAll(/Task\s*\(\s*\{[\s\S]*?subagent_type:\s*['"](?:[^"':]+:)?([^'"]+)['"][\s\S]*?prompt:\s*`([\s\S]*?)`/gs)]
        .map(match => `Delegate to the \`${match[1]}\` subagent:\n> ${(match[2].split('\n').find(line => line.trim()) || '').trim()}`);
      if (!delegates.length) return block;
      let replacement = delegates.join('\n\n');
      const reviewRelated = delegates.some(delegate => /review|quality|security|performance|test|coverage/i.test(delegate));
      if (delegates.length >= 4 && reviewRelated) replacement = KIRO_REVIEW_PHASE + replacement + KIRO_REVIEW_FALLBACK;
      return replacement;
    })
    .replace(TASK_CALL, replaceTaskCallForKiro)
    .replace(/(?:await\s+)?AskUserQuestion\s*\(\s*\{[\s\S]*?\}\s*\);?/g, formatKiroQuestion)
    .replace(PLUGIN_COMMAND_PREFIX, '$1');
  return content.replace(/((?:Delegate to the `[^`]*` subagent[^\n]*\n){4,})/g, block => {
    const delegates = block.match(/Delegate to the `([^`]+)` subagent/g) || [];
    const reviewRelated = delegates.some(delegate => /review|quality|security|performance|test|coverage/i.test(delegate));
    return delegates.length >= 4 && reviewRelated ? KIRO_REVIEW_PHASE + block + KIRO_REVIEW_FALLBACK + '\n' : block;
  });
}

function formatKiroQuestion(call) {
  const question = call.match(/question:\s*["'`]([\s\S]*?)["'`]/)?.[1] || 'Please choose:';
  const options = [...call.matchAll(/label:\s*["'`]([^"'`]+)["'`][\s\S]*?description:\s*["'`]([^"'`]+)["'`]/g)];
  if (!options.length) return `**${question}**\n\nReply in chat with your choice.`;
  const list = options.map((option, index) => `${index + 1}. **${option[1]}** - ${option[2]}`).join('\n');
  return `**${question}**\n\n${list}\n\nReply with the number or name of your choice.`;
}

function transformAgentForKiro(content, options = {}) {
  const { pluginInstallPath } = options;
  const frontmatter = parseFrontmatter(content);
  let prompt = stripFrontmatter(content);
  if (pluginInstallPath) prompt = replacePluginRoots(prompt, pluginInstallPath);
  prompt = prompt.replace(PLUGIN_COMMAND_PREFIX, '$1');

  const result = {
    name: frontmatter.name || '',
    description: frontmatter.description || '',
    prompt: prompt.trim(),
  };
  if (frontmatter.tools) {
    const toolText = (Array.isArray(frontmatter.tools) ? frontmatter.tools : [frontmatter.tools])
      .join(' ').toLowerCase();
    const tools = [];
    if (toolText.includes('read')) tools.push('read');
    if (toolText.includes('edit') || toolText.includes('write')) tools.push('write');
    if (toolText.includes('bash') || toolText.includes('shell')) tools.push('shell');
    if (toolText.includes('glob') || toolText.includes('grep')) tools.push('read');
    if (toolText.includes('task') || toolText.includes('agent')) tools.push('shell');
    if (toolText.includes('web') || toolText.includes('fetch')) tools.push('shell');
    if (toolText.includes('notebook')) tools.push('write');
    if (toolText.includes('lsp')) tools.push('read');
    result.tools = [...new Set(tools)];
    if (!result.tools.length) result.tools = ['read'];
  } else {
    result.tools = ['read'];
  }
  result.resources = ['file://.kiro/prompts/**/*.md'];
  return JSON.stringify(result, null, 2);
}

function generateCombinedReviewerAgent(reviewers, name, description) {
  const reviewSections = reviewers
    .map(reviewer => `## ${reviewer.name} Review\n\nFocus: ${reviewer.focus}`)
    .join('\n\n---\n\n');
  return JSON.stringify({
    name,
    description,
    prompt: 'You are a combined code reviewer covering multiple review passes in a single session.\n\n' +
      reviewSections +
      '\n\nFor each file you review, check ALL of the above review dimensions. ' +
      'Return findings as a JSON array with objects containing: pass (which review), file, line, ' +
      'severity (critical/high/medium/low), description, suggestion.',
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

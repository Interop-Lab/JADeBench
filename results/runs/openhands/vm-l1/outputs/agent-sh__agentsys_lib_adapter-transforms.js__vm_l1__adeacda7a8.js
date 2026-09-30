const fs = require('fs');
const path = require('path');

const PLUGIN_NAMESPACE_PATTERN = /(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g;
const REQUIRE_DECLARATION_PATTERN = /(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g;
const REQUIRE_CALL_PATTERN = /require\s*\(['"][^'"]+['"]\)/g;
const TASK_CALL_PATTERN = /await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g;
const KIRO_REVIEW_FALLBACK = '\nIf parallel spawning is unavailable, run 2 combined reviewers sequentially:\n1. Delegate to the `reviewer-quality-security` subagent (code quality + security)\n2. Then delegate to the `reviewer-perf-test` subagent (performance + test coverage)\n\nAggregate all findings from whichever execution path succeeded.\n';

let discoveryCache = null;
let discoveryCacheRoot = null;

function parseFrontmatter(content) {
  if (!content || !content.startsWith('---')) return {};

  const frontmatterEnd = content.indexOf('\n---', 3);
  if (frontmatterEnd === -1) return {};

  const result = {};
  const lines = content.substring(4, frontmatterEnd).split('\n');
  let currentKey = null;
  let currentList = null;

  for (const line of lines) {
    const listItemMatch = line.match(/^\s+-\s+(.+)$/);
    if (listItemMatch && currentKey && currentList) {
      let value = listItemMatch[1].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      currentList.push(value);
      continue;
    }
    if (listItemMatch) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex < 0) continue;

    if (currentKey && currentList) {
      result[currentKey] = currentList;
      currentKey = null;
      currentList = null;
    }

    const key = line.substring(0, colonIndex).trim();
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;

    let value = line.substring(colonIndex + 1).trim();
    if (value === '') {
      currentKey = key;
      currentList = [];
      continue;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }

  if (currentKey && currentList) result[currentKey] = currentList;
  return result;
}

function getPluginsDirectory(rootDirectory) {
  const root = rootDirectory || path.resolve(__dirname, '..', '..');
  return path.join(root, 'plugins');
}

function discoverPlugins(rootDirectory) {
  const root = rootDirectory || path.resolve(__dirname, '..', '..');
  if (discoveryCache && discoveryCacheRoot === root) {
    return discoveryCache.plugins;
  }

  const pluginsDirectory = getPluginsDirectory(root);
  if (!fs.existsSync(pluginsDirectory)) return [];

  const plugins = fs.readdirSync(pluginsDirectory)
    .filter((name) => {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) return false;
      return fs.existsSync(path.join(pluginsDirectory, name, '.claude-plugin', 'plugin.json'));
    })
    .sort();

  discoveryCache = { plugins };
  discoveryCacheRoot = root;
  return plugins;
}

function parseFlatFrontmatter(frontmatter) {
  const values = {};
  for (const line of frontmatter.trim().split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex < 0) continue;
    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();
    values[key] = value;
  }
  return values;
}

function escapeDoubleQuotedYaml(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function replacePluginRootVariables(content, pluginInstallPath) {
  return content
    .replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath)
    .replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath)
    .replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath)
    .replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
}

function replaceClaudeDirectoryReference(body, match, offset, replacement) {
  const context = body.substring(
    Math.max(0, offset - 60),
    offset + match.length + 10,
  );
  return /Claude Code:/.test(context) ? match : replacement;
}

function convertOpenCodeFence(fullMatch, language, code) {
  const normalizedLanguage = (language || '').toLowerCase();
  if (['bash', 'shell', 'sh'].includes(normalizedLanguage)) {
    if (code.includes('node -e') && code.includes('require(')) {
      return '*(Bash command with Node.js require - adapt for OpenCode)*';
    }
    return fullMatch;
  }

  const trimmedCode = code.trim();
  if (
    !language &&
    (trimmedCode.startsWith('gh ') ||
      trimmedCode.startsWith('glab ') ||
      trimmedCode.startsWith('git ') ||
      trimmedCode.startsWith('#!'))
  ) {
    return fullMatch;
  }

  const looksLikeJavaScript =
    code.includes('require(') ||
    code.includes('Task(') ||
    /^\s*const\s+[a-zA-Z_$[{]/m.test(code) ||
    /^\s*let\s+[a-zA-Z_$[{]/m.test(code) ||
    code.includes('function ') ||
    code.includes('=>') ||
    code.includes('async ') ||
    code.includes('await ') ||
    code.includes('completePhase');

  if (!looksLikeJavaScript) return fullMatch;

  let instructions = '';
  const taskMatches = [...code.matchAll(/(?:await\s+)?Task\s*\(\s*\{[^}]*subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["'][^}]*\}\s*\)/gs)];
  for (const taskMatch of taskMatches) {
    instructions += `- Invoke \`@${taskMatch[1]}\` agent\n`;
  }

  const phaseMatches = code.match(/startPhase\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
  if (phaseMatches) {
    for (const phaseMatch of phaseMatches) {
      const phaseName = phaseMatch.match(/['"]([^'"]+)['"]/)[1];
      instructions += `- Phase: ${phaseName}\n`;
    }
  }

  if (code.includes('AskUserQuestion')) {
    instructions += '- Use AskUserQuestion tool for user input\n';
  }
  if (code.includes('EnterPlanMode')) {
    instructions += '- Use EnterPlanMode for user approval\n';
  }
  if (code.includes('completePhase')) {
    instructions += '- Call `workflowState.completePhase(result)` to advance workflow state\n';
  }

  return instructions || '*(JavaScript reference - not executable in OpenCode)*';
}

function convertTaskCallToOpenCode(taskCall) {
  const match = taskCall.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
  return match ? `Invoke \`@${match[1]}\` agent` : '*(Task call - use @agent-name syntax)*';
}

function transformBodyForOpenCode(body, pluginRoot) {
  let transformed = body
    .replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, '${PLUGIN_ROOT}')
    .replace(/\$CLAUDE_PLUGIN_ROOT/g, '$PLUGIN_ROOT');

  transformed = transformed.replace(/\.claude\//g, (match, offset) =>
    replaceClaudeDirectoryReference(transformed, match, offset, '.opencode/'));
  transformed = transformed.replace(/\.claude'/g, (match, offset) =>
    replaceClaudeDirectoryReference(transformed, match, offset, ".opencode'"));
  transformed = transformed.replace(/\.claude"/g, (match, offset) =>
    replaceClaudeDirectoryReference(transformed, match, offset, '.opencode"'));
  transformed = transformed.replace(/\.claude`/g, (match, offset) =>
    replaceClaudeDirectoryReference(transformed, match, offset, '.opencode`'));

  const pluginNames = discoverPlugins(pluginRoot);
  if (pluginNames.length > 0) {
    const pluginAlternation = pluginNames.join('|');
    transformed = transformed
      .replace(new RegExp(`\`(${pluginAlternation}):([a-z-]+)\``, 'g'), '`$2`')
      .replace(new RegExp(`(${pluginAlternation}):([a-z-]+)`, 'g'), '$2');
  }

  transformed = transformed
    .replace(/```(\w*)\n([\s\S]*?)```/g, convertOpenCodeFence)
    .replace(/\*\(Reference - adapt for OpenCode\)\*/g, '')
    .replace(/await\s+Task\s*\(\s*\{[\s\S]*?\}\s*\);?/g, convertTaskCallToOpenCode)
    .replace(REQUIRE_DECLARATION_PATTERN, '')
    .replace(REQUIRE_CALL_PATTERN, '');

  if (transformed.includes('agent')) {
    const agentNote = '\n> **OpenCode Note**: Invoke agents using `@agent-name` syntax.\n> Available agents: task-discoverer, exploration-agent, planning-agent,\n> implementation-agent, deslop-agent, delivery-validator, sync-docs-agent, consult-agent\n> Example: `@exploration-agent analyze the codebase`\n\n';
    transformed = transformed.replace(/^(---\n[\s\S]*?---\n)/, `$1${agentNote}`);
  }

  if (
    transformed.includes('Master Workflow Orchestrator') ||
    transformed.includes('No Shortcuts Policy')
  ) {
    const policySelection = '\n## Phase 1: Policy Selection (Built-in Options)\n\nAsk the user these questions using AskUserQuestion:\n\n**Question 1 - Source**: "Where should I look for tasks?"\n- GitHub Issues - Use `gh issue list` to find issues\n- GitHub Projects - Issues from a GitHub Project board\n- GitLab Issues - Use `glab issue list` to find issues\n- Local tasks.md - Read from PLAN.md, tasks.md, or TODO.md in the repo\n- Custom - User specifies their own source\n- Other - User describes source, you figure it out\n\nIf user selects GitHub Projects, ask two follow-up questions: project number (positive integer from the project URL, e.g. 1, 5, 42) and project owner (@me for your own projects, or the org/username). Pass as responses.project = { number, owner } to parseAndCachePolicy.\n\n**Question 2 - Priority**: "What type of tasks to prioritize?"\n- All - Consider all tasks, pick by score\n- Bugs - Focus on bug fixes\n- Security - Security issues first\n- Features - New feature development\n\n**Question 3 - Stop Point**: "How far should I take this task?"\n- Merged - Until PR is merged to main\n- PR Created - Stop after creating PR\n- Implemented - Stop after local implementation\n- Deployed - Deploy to staging\n- Production - Full production deployment\n\nAfter user answers, proceed to Phase 2 with the selected policy.\n\n';
    if (transformed.includes('OpenCode Note')) {
      transformed = transformed.replace(
        /(Example:.*analyze the codebase\`\n\n)/,
        `$1${policySelection}`,
      );
    }
  }

  return transformed;
}

function transformCommandFrontmatterForOpenCode(content) {
  return content.replace(/^---\n([\s\S]*?)^---/m, (_match, frontmatter) => {
    const values = parseFlatFrontmatter(frontmatter);
    let result = '---\n';
    if (values.description) result += `description: ${values.description}\n`;
    result += 'agent: general\n---';
    return result;
  });
}

function transformAgentFrontmatterForOpenCode(content, options = {}) {
  const { stripModels = true } = options;
  return content.replace(/^---\n([\s\S]*?)^---/m, (_match, frontmatter) => {
    const values = parseFlatFrontmatter(frontmatter);
    let result = '---\n';
    if (values.name) result += `name: ${values.name}\n`;
    if (values.description) result += `description: ${values.description}\n`;
    result += 'mode: subagent\n';

    if (values.model && !stripModels) {
      const modelNames = {
        sonnet: 'anthropic/claude-sonnet-4',
        opus: 'anthropic/claude-opus-4',
        haiku: 'anthropic/claude-haiku-3-5',
      };
      result += `model: ${modelNames[values.model] || values.model}\n`;
    }

    if (values.tools) {
      const tools = values.tools.toLowerCase();
      result += 'permission:\n';
      result += `  read: ${tools.includes('read') ? 'allow' : 'deny'}\n`;
      result += `  edit: ${tools.includes('edit') || tools.includes('write') ? 'allow' : 'deny'}\n`;
      result += `  bash: ${tools.includes('bash') ? 'allow' : 'ask'}\n`;
      result += `  glob: ${tools.includes('glob') ? 'allow' : 'deny'}\n`;
      result += `  grep: ${tools.includes('grep') ? 'allow' : 'deny'}\n`;
    }

    return `${result}---`;
  });
}

function transformSkillBodyForOpenCode(body, pluginRoot) {
  return transformBodyForOpenCode(body, pluginRoot);
}

function transformForCodex(content, options) {
  const { skillName, description, pluginInstallPath } = options;
  const quotedDescription = `"${escapeDoubleQuotedYaml(description)}"`;

  if (content.startsWith('---')) {
    content = content.replace(
      /^---\n[\s\S]*?\n---\n/,
      `---\nname: ${skillName}\ndescription: ${quotedDescription}\n---\n`,
    );
  } else {
    content = `---\nname: ${skillName}\ndescription: ${quotedDescription}\n---\n\n${content}`;
  }

  return content
    .replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, pluginInstallPath)
    .replace(/\$CLAUDE_PLUGIN_ROOT/g, pluginInstallPath)
    .replace(/\$\{PLUGIN_ROOT\}/g, pluginInstallPath)
    .replace(/\$PLUGIN_ROOT/g, pluginInstallPath)
    .replace(/AskUserQuestion/g, 'request_user_input')
    .replace(/^[ \t]*multiSelect:.*\n?/gm, '')
    .replace(
      /^([ \t]*request_user_input:\s*)$/gm,
      '$1\n> **Codex**: Each question MUST include a unique `id` field (e.g., `id: "q1"`).',
    );
}

function transformRuleForCursor(content, options) {
  const {
    pluginInstallPath,
    description = '',
    globs = '',
    alwaysApply = true,
  } = options;

  const sanitizedDescription = description
    .replace(/[\x00-\x1f\x7f]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

  let frontmatter = `---\ndescription: "${sanitizedDescription}"\n`;
  if (globs) frontmatter += `globs: ${JSON.stringify(globs)}\n`;
  frontmatter += `alwaysApply: ${alwaysApply}\n---\n`;

  if (content.startsWith('---')) {
    content = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  }
  content = frontmatter + content;
  content = replacePluginRootVariables(content, pluginInstallPath);

  return content
    .replace(TASK_CALL_PATTERN, (taskCall) => {
      const match = taskCall.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
      return match ? `Invoke the ${match[1]} agent` : '';
    })
    .replace(REQUIRE_DECLARATION_PATTERN, '')
    .replace(REQUIRE_CALL_PATTERN, '')
    .replace(PLUGIN_NAMESPACE_PATTERN, '$1');
}

function transformSkillForCursor(content, options) {
  const { pluginInstallPath } = options;
  return replacePluginRootVariables(content, pluginInstallPath)
    .replace(PLUGIN_NAMESPACE_PATTERN, '$1');
}

function transformCommandForCursor(content, options) {
  const { pluginInstallPath } = options;
  if (content.startsWith('---')) {
    content = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  }

  content = replacePluginRootVariables(content, pluginInstallPath);
  return content
    .replace(REQUIRE_DECLARATION_PATTERN, '')
    .replace(REQUIRE_CALL_PATTERN, '')
    .replace(TASK_CALL_PATTERN, (taskCall) => {
      const match = taskCall.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
      return match ? `Invoke the ${match[1]} agent` : '';
    })
    .replace(PLUGIN_NAMESPACE_PATTERN, '$1');
}

function transformSkillForKiro(content, options) {
  const { pluginInstallPath } = options;
  return replacePluginRootVariables(content, pluginInstallPath)
    .replace(PLUGIN_NAMESPACE_PATTERN, '$1');
}

function convertKiroCodeBlock(fullMatch, code) {
  if (!code.includes('Promise.all') || !code.includes('Task(')) return fullMatch;

  const taskMatches = [...code.matchAll(/Task\s*\(\s*\{[\s\S]*?subagent_type:\s*['"](?:[^"':]+:)?([^'"]+)['"][\s\S]*?prompt:\s*`([\s\S]*?)`/gs)];
  if (taskMatches.length < 2) return fullMatch;

  const delegations = taskMatches.map((match) => {
    const firstPromptLine = match[2].split('\n').find((line) => line.trim()) || '';
    return `Delegate to the \`${match[1]}\` subagent:\n> ${firstPromptLine.trim()}`;
  });
  let replacement = delegations.join('\n\n');
  const hasReviewAgent = delegations.some((line) =>
    /review|quality|security|performance|test|coverage/i.test(line));

  if (delegations.length >= 4 && hasReviewAgent) {
    replacement = `**Review phase (Kiro - max 4 agents, fallback to 2 sequential):**\n\nTry delegating to these subagents (experimental parallel spawning):\n\n${replacement}\n\n${KIRO_REVIEW_FALLBACK.trim()}`;
  }
  return replacement;
}

function convertKiroTaskCall(taskCall) {
  const agentMatch = taskCall.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
  const promptMatch = taskCall.match(/prompt:\s*[`"']([\s\S]*?)[`"']/);
  if (!agentMatch) return '';

  const agentName = agentMatch[1];
  const prompt = promptMatch ? promptMatch[1].replace(/\\n/g, '\n').trim() : '';
  if (prompt) {
    return `Delegate to the \`${agentName}\` subagent:\n> ${prompt.split('\n')[0]}`;
  }
  return `Delegate to the \`${agentName}\` subagent.`;
}

function convertKiroQuestion(questionCall) {
  const questionMatch = questionCall.match(/question:\s*["'`]([\s\S]*?)["'`]/);
  const question = questionMatch ? questionMatch[1] : 'Please choose:';
  const options = [...questionCall.matchAll(/label:\s*["'`]([^"'`]+)["'`][\s\S]*?description:\s*["'`]([^"'`]+)["'`]/g)];

  if (options.length > 0) {
    const optionList = options
      .map((option, index) => `${index + 1}. **${option[1]}** - ${option[2]}`)
      .join('\n');
    return `**${question}**\n\n${optionList}\n\nReply with the number or name of your choice.`;
  }
  return `**${question}**\n\nReply in chat with your choice.`;
}

function normalizeKiroReviewBlock(block) {
  const agents = block.match(/Delegate to the `([^`]+)` subagent/g) || [];
  if (agents.length < 4) return block;
  const hasReviewAgent = agents.some((line) =>
    /review|quality|security|performance|test|coverage/i.test(line));
  if (!hasReviewAgent) return block;
  return `**Review phase (Kiro - max 4 agents, fallback to 2 sequential):**\n\nTry delegating to these subagents (experimental parallel spawning):\n${block}${KIRO_REVIEW_FALLBACK}`;
}

function transformCommandForKiro(content, options) {
  const { pluginInstallPath, name = '', description = '' } = options;
  if (content.startsWith('---')) {
    content = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  }

  const safeDescription = escapeDoubleQuotedYaml(
    description.replace(/[\x00-\x1f\x7f]/g, ' '),
  );
  let frontmatter = '---\ninclusion: manual\n';
  if (name) frontmatter += `name: "${name}"\n`;
  if (description) frontmatter += `description: "${safeDescription}"\n`;
  content = `${frontmatter}---\n${content}`;
  content = replacePluginRootVariables(content, pluginInstallPath);

  return content
    .replace(REQUIRE_DECLARATION_PATTERN, '')
    .replace(REQUIRE_CALL_PATTERN, '')
    .replace(/^```(?:javascript|js)?\n([\s\S]*?)^```$/gm, convertKiroCodeBlock)
    .replace(TASK_CALL_PATTERN, convertKiroTaskCall)
    .replace(/(?:await\s+)?AskUserQuestion\s*\(\s*\{[\s\S]*?\}\s*\);?/g, convertKiroQuestion)
    .replace(PLUGIN_NAMESPACE_PATTERN, '$1')
    .replace(/((?:Delegate to the `[^`]*` subagent[^\n]*\n){4,})/g, normalizeKiroReviewBlock);
}

function transformAgentForKiro(content, options) {
  const { pluginInstallPath } = options || {};
  const frontmatter = parseFrontmatter(content);
  let prompt = content;

  if (content.startsWith('---')) {
    const frontmatterEnd = content.indexOf('\n---', 3);
    if (frontmatterEnd !== -1) {
      prompt = content.substring(frontmatterEnd + 4).replace(/^\n/, '');
    }
  }

  if (pluginInstallPath) {
    prompt = replacePluginRootVariables(prompt, pluginInstallPath);
  }
  prompt = prompt.replace(PLUGIN_NAMESPACE_PATTERN, '$1');

  const agent = {
    name: frontmatter.name || '',
    description: frontmatter.description || '',
    prompt: prompt.trim(),
  };

  if (frontmatter.tools) {
    const toolNames = Array.isArray(frontmatter.tools)
      ? frontmatter.tools.map((tool) => tool.toLowerCase())
      : [frontmatter.tools.toLowerCase()];
    const toolsText = toolNames.join(' ');
    const mappedTools = [];

    if (toolsText.includes('read')) mappedTools.push('read');
    if (toolsText.includes('edit') || toolsText.includes('write')) mappedTools.push('write');
    if (toolsText.includes('bash') || toolsText.includes('shell')) mappedTools.push('shell');
    if (toolsText.includes('glob')) mappedTools.push('read');
    if (toolsText.includes('grep')) mappedTools.push('read');
    if (toolsText.includes('task') || toolsText.includes('agent')) mappedTools.push('shell');
    if (toolsText.includes('web') || toolsText.includes('fetch')) mappedTools.push('shell');
    if (toolsText.includes('notebook')) mappedTools.push('write');
    if (toolsText.includes('lsp')) mappedTools.push('read');

    const uniqueTools = [...new Set(mappedTools)];
    agent.tools = uniqueTools.length > 0 ? uniqueTools : ['read'];
  } else {
    agent.tools = ['read'];
  }

  agent.resources = ['file://.kiro/prompts/**/*.md'];
  return JSON.stringify(agent, null, 2);
}

function generateCombinedReviewerAgent(reviewPasses, name, description) {
  const reviewSections = reviewPasses
    .map((reviewPass) => `## ${reviewPass.name} Review\n\nFocus: ${reviewPass.focus}`)
    .join('\n\n---\n\n');

  const agent = {
    name,
    description,
    prompt: `You are a combined code reviewer covering multiple review passes in a single session.\n\n${reviewSections}\n\nFor each file you review, check ALL of the above review dimensions. Return findings as a JSON array with objects containing: pass (which review), file, line, severity (critical/high/medium/low), description, suggestion.`,
    tools: ['read'],
    resources: ['file://.kiro/prompts/**/*.md'],
  };
  return JSON.stringify(agent, null, 2);
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

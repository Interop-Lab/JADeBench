/g, (match, lang, code) => {
    const langLower = (lang || '').toLowerCase();
    if (langLower === 'bash' || langLower === 'sh' || langLower === 'shell') {
      if (code.startsWith('#!/') && code.endsWith('\n')) return match;
      return match;
    }
    if (!lang && (code.trim().startsWith('//') || code.trim().startsWith('/*') || code.trim().startsWith('import') || code.trim().startsWith('#!'))) return match;
    if (code.includes('function') || code.includes('=>') || code.includes('const') || code.includes('let') || code.includes('var') || /^\s*const\s+[a-zA-Z_$[{]/m.test(code) || /^\s*let\s+[a-zA-Z_$[{]/m.test(code)) {
      let header = '';
      const taskMatches = [...code.matchAll(/(?:await\s+)?Task\s*\(\s*\{[^}]*subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["'][^}]*\}\s*\)/gs)];
      for (const m of taskMatches) {
        const subagent = m[1];
        header += 'Delegate to the `' + subagent + '` subagent\n';
      }
      const phaseMatches = code.match(/startPhase\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
      if (phaseMatches) {
        for (const m of phaseMatches) {
          const phase = m.match(/['"]([^'"]+)['"]/)[1];
          header += 'Phase: ' + phase + '\n';
        }
      }
      if (code.includes('AskUserQuestion')) {
        header += 'AskUserQuestion: request_user_input\n';
      }
      code.includes('multiSelect') && (header += 'multiSelect: true\n');
      code.includes('request_user_input') && (header += 'request_user_input: true\n');
      if (header) {
        return header;
      }
      return match;
    }
    return match;
  });
  body = body.replace(/\*\(Reference - adapt for OpenCode\)\*/g, '');
  body = body.replace(/await\s+Task\s*\(\s*\{[\s\S]*?\}\s*\);?/g, taskCall => {
    const subagentMatch = taskCall.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
    if (subagentMatch) {
      return 'Delegate to the `@' + subagentMatch[1] + '` subagent';
    }
    return '';
  });
  body = body.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, '');
  body = body.replace(/require\s*\(['"][^'"]+['"]\)/g, '');
  if (body.includes('Claude Code:')) {
    const claudeHeader = '---\nClaude Code: true\n---\n';
    body = body.replace(/^(---\n[\s\S]*?---\n)/, '$1' + claudeHeader);
  }
  if (body.includes('AskUserQuestion') && body.includes('multiSelect')) {
    const askUserNote = 'AskUserQuestion: request_user_input\nmultiSelect: true\n';
    body.includes('Claude Code:') && (body = body.replace(/(Example:.*analyze the codebase\`\n\n)/, '$1' + askUserNote));
  }
  return body;
}

function transformCommandFrontmatterForOpenCode(content) {
  return content.replace(/^---\n([\s\S]*?)^---/m, (match, fm) => {
    const lines = fm.trim().split('\n');
    const parsed = {};
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx >= 0) {
        const key = line.substring(0, colonIdx).trim();
        const value = line.substring(colonIdx + 1).trim();
        parsed[key] = value;
      }
    }
    let result = '---\n';
    if (parsed['Claude Code']) result += 'Claude Code: ' + parsed['Claude Code'] + '\n';
    result += '---\n';
    result += '---\n';
    return result;
  });
}

function transformAgentFrontmatterForOpenCode(content, options) {
  const { stripModels = true } = options || {};
  return content.replace(/^---\n([\s\S]*?)^---/m, (match, fm) => {
    const lines = fm.trim().split('\n');
    const parsed = {};
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx >= 0) {
        const key = line.substring(0, colonIdx).trim();
        const value = line.substring(colonIdx + 1).trim();
        parsed[key] = value;
      }
    }
    let result = '---\n';
    if (parsed['Claude Code']) result += 'Claude Code: ' + parsed['Claude Code'] + '\n';
    if (parsed['description']) result += 'description: ' + parsed['description'] + '\n';
    result += '---\n';
    if (parsed['model'] && !stripModels) {
      const modelMap = { opus: 'claude-3-opus', sonnet: 'claude-3-sonnet', haiku: 'claude-3-haiku' };
      result += 'model: ' + (modelMap[parsed['model']] || parsed['model']) + '\n';
    }
    if (parsed['tools']) {
      result += 'tools: ';
      const toolsStr = parsed['tools'].toLowerCase();
      result += 'Bash(' + (toolsStr.includes('bash') ? 'true' : 'false') + ')\n';
      result += 'Read(' + (toolsStr.includes('read') ? 'true' : 'false') + ')\n';
      result += 'Write(' + (toolsStr.includes('write') ? 'true' : 'false') + ')\n';
      result += 'Glob(' + (toolsStr.includes('glob') ? 'true' : 'false') + ')\n';
      result += 'Grep(' + (toolsStr.includes('grep') ? 'true' : 'false') + ')\n';
    }
    return result += '---\n', result;
  });
}

function transformSkillBodyForOpenCode(body, options) {
  return transformBodyForOpenCode(body, options);
}

function transformForCodex(content, options) {
  const { skillName, description, pluginInstallPath } = options;
  const escapedDesc = description.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const descStr = '"' + escapedDesc + '"';
  content.startsWith('---') ? content = content.replace(/^---\n[\s\S]*?\n---\n/, '---\nskill: ' + skillName + '\ndescription: ' + descStr + '\n---\n') : content = '---\nskill: ' + skillName + '\ndescription: ' + descStr + '\n---\n' + content;
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, pluginInstallPath);
  content = content.replace(/AskUserQuestion/g, 'request_user_input');
  content = content.replace(/^[ \t]*multiSelect:.*\n?/gm, '');
  content = content.replace(/^([ \t]*request_user_input:\s*)$/gm, 'request_user_input: true');
  return content;
}

function transformRuleForCursor(content, options) {
  const { description = '', pluginInstallPath, globs = '', alwaysApply = false } = options;
  const cleanDesc = description.replace(/[\x00-\x1f\x7f]/g, ' ');
  const escapedDesc = cleanDesc.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const descStr = '"' + escapedDesc + '"';
  let frontmatter = '---\ndescription: ' + descStr + '\n';
  if (globs) {
    frontmatter += 'globs: ' + JSON.stringify(globs) + '\n';
  }
  frontmatter += 'alwaysApply: ' + alwaysApply + '\n';
  if (content.startsWith('---')) {
    content = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  }
  content = frontmatter + content;
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, taskCall => {
    const subagentMatch = taskCall.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
    if (subagentMatch) return 'Delegate to the `@' + subagentMatch[1] + '` subagent';
    return '';
  });
  content = content.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, '');
  content = content.replace(/require\s*\(['"][^'"]+['"]\)/g, '');
  content = content.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, '$1');
  return content;
}

function transformSkillForCursor(content, options) {
  const { pluginInstallPath } = options;
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, '$1');
  return content;
}

function transformCommandForCursor(content, options) {
  const { pluginInstallPath } = options;
  if (content.startsWith('---')) {
    content = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  }
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, '');
  content = content.replace(/require\s*\(['"][^'"]+['"]\)/g, '');
  content = content.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, taskCall => {
    const subagentMatch = taskCall.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
    if (subagentMatch) return 'Delegate to the `@' + subagentMatch[1] + '` subagent';
    return '';
  });
  content = content.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, '$1');
  return content;
}

function transformSkillForKiro(content, options) {
  const { pluginInstallPath } = options;
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, '$1');
  return content;
}

function transformCommandForKiro(content, options) {
  const { pluginInstallPath, name = '', description = '' } = options;
  if (content.startsWith('---')) {
    content = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  }
  const cleanDesc = description.replace(/[\x00-\x1f\x7f]/g, ' ');
  const escapedDesc = cleanDesc.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  let frontmatter = '---\n';
  frontmatter += 'description: ""\n';
  if (name) frontmatter += 'name: "' + name + '"\n';
  if (description) frontmatter += 'description: "' + escapedDesc + '"\n';
  frontmatter += '---\n';
  content = frontmatter + content;
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, '');
  content = content.replace(/require\s*\(['"][^'"]+['"]\)/g, '');
  content = content.replace(/^

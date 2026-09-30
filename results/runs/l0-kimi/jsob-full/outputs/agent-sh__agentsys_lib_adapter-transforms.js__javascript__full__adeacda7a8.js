const fs = require('fs');
const path = require('path');

let cache = null;
let cacheRoot = null;

function parseFrontmatter(content) {
  if (!content || !content.startsWith('---')) {
    return {};
  }
  
  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) return {};
  
  const frontmatterText = content.substring(3, endIndex);
  const result = {};
  const lines = frontmatterText.split('\n');
  let currentKey = null;
  let currentArray = null;
  
  for (const line of lines) {
    const listMatch = line.match(/^\s+-\s+(.+)$/);
    if (listMatch && currentKey && currentArray) {
      let value = listMatch[1].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      currentArray.push(value);
      continue;
    }
    
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      if (currentKey && currentArray) {
        result[currentKey] = currentArray;
        currentKey = null;
        currentArray = null;
      }
      
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      if (value === '') {
        currentKey = key;
        currentArray = [];
      } else {
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        result[key] = value;
      }
    }
  }
  
  if (currentKey && currentArray) {
    result[currentKey] = currentArray;
  }
  
  return result;
}

function isValidPluginName(name) {
  return /^[a-z0-9][a-z0-9-]*$/.test(name);
}

function resolvePluginRoot(customRoot) {
  if (!customRoot) {
    customRoot = path.resolve(__dirname, '..', '..');
  }
  return path.resolve(customRoot);
}

function getPlugins(root) {
  const cached = getCache(root);
  if (cached && cached.plugins) return cached.plugins;
  
  const pluginRoot = resolvePluginRoot(root);
  if (!fs.existsSync(pluginRoot)) return [];
  
  const entries = fs.readdirSync(pluginRoot);
  const plugins = entries.filter(entry => {
    if (!isValidPluginName(entry)) return false;
    const pluginPath = path.join(pluginRoot, entry, '.claude-plugin');
    return fs.existsSync(pluginPath);
  });
  
  setCache(root, 'plugins', plugins);
  return plugins;
}

function getCommands(root) {
  const cached = getCache(root);
  if (cached && cached.commands) return cached.commands;
  
  const pluginRoot = resolvePluginRoot(root);
  const plugins = getPlugins(root);
  const commands = [];
  
  for (const plugin of plugins) {
    const commandsDir = path.join(pluginRoot, plugin, 'commands');
    if (!fs.existsSync(commandsDir)) continue;
    
    const files = fs.readdirSync(commandsDir)
      .filter(f => f.endsWith('.md'))
      .sort();
    
    for (const file of files) {
      const filePath = path.join(commandsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = parseFrontmatter(content);
      commands.push({
        name: file.replace(/\.md$/, ''),
        plugin: plugin,
        file: file,
        frontmatter: frontmatter
      });
    }
  }
  
  setCache(root, 'commands', commands);
  return commands;
}

function getAgents(root) {
  const cached = getCache(root);
  if (cached && cached.agents) return cached.agents;
  
  const pluginRoot = resolvePluginRoot(root);
  const plugins = getPlugins(root);
  const agents = [];
  
  for (const plugin of plugins) {
    const agentsDir = path.join(pluginRoot, plugin, 'agents');
    if (!fs.existsSync(agentsDir)) continue;
    
    const files = fs.readdirSync(agentsDir)
      .filter(f => f.endsWith('.md'))
      .sort();
    
    for (const file of files) {
      const filePath = path.join(agentsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = parseFrontmatter(content);
      agents.push({
        name: file.replace(/\.md$/, ''),
        plugin: plugin,
        file: file,
        frontmatter: frontmatter
      });
    }
  }
  
  setCache(root, 'agents', agents);
  return agents;
}

function getSkills(root) {
  const cached = getCache(root);
  if (cached && cached.skills) return cached.skills;
  
  const pluginRoot = resolvePluginRoot(root);
  const plugins = getPlugins(root);
  const skills = [];
  
  for (const plugin of plugins) {
    const skillsDir = path.join(pluginRoot, plugin, 'skills');
    if (!fs.existsSync(skillsDir)) continue;
    
    const skillDirs = fs.readdirSync(skillsDir).filter(d => {
      const skillPath = path.join(skillsDir, d);
      return fs.statSync(skillPath).isDirectory();
    });
    
    for (const skillDir of skillDirs) {
      const skillPath = path.join(skillsDir, skillDir);
      const skillFile = path.join(skillPath, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;
      
      const content = fs.readFileSync(skillFile, 'utf-8');
      const frontmatter = parseFrontmatter(content);
      skills.push({
        name: skillDir,
        plugin: plugin,
        file: 'SKILL.md',
        frontmatter: frontmatter
      });
    }
  }
  
  setCache(root, 'skills', skills);
  return skills;
}

function getAll(root) {
  return {
    plugins: getPlugins(root),
    commands: getCommands(root),
    agents: getAgents(root),
    skills: getSkills(root)
  };
}

function getCache(root) {
  const resolvedRoot = root || path.resolve(__dirname, '..', '..');
  if (cache && cacheRoot === resolvedRoot) return cache;
  return null;
}

function setCache(root, key, value) {
  const resolvedRoot = root || path.resolve(__dirname, '..', '..');
  if (!cache || cacheRoot !== resolvedRoot) {
    cache = {};
    cacheRoot = resolvedRoot;
  }
  cache[key] = value;
}

function clearCache() {
  cache = null;
  cacheRoot = null;
}

function getCommandTuples(root) {
  const commands = getCommands(root);
  return commands.map(cmd => [cmd.name, cmd.plugin, cmd.frontmatter]);
}

function getCommandSummaries(root) {
  const commands = getCommands(root);
  return commands.map(cmd => {
    const description = cmd.frontmatter?.description || 
                       cmd.frontmatter?.desc || 
                       cmd.frontmatter?.summary || 
                       cmd.frontmatter?.purpose || '';
    return [cmd.name, cmd.plugin, cmd.file, description];
  });
}

function getAgentTuples(root) {
  const agents = getAgents(root);
  return agents.map(agent => {
    const description = agent.frontmatter?.description || 
                       agent.frontmatter?.desc || 
                       agent.frontmatter?.summary || 
                       agent.frontmatter?.purpose || '';
    const model = agent.frontmatter?.model || 'default';
    const temperature = agent.frontmatter?.temperature || '';
    return [agent.plugin + '-' + agent.name + '-' + agent.file, agent.name, agent.plugin, description, model, temperature];
  });
}

function getCommandRegex(root) {
  const plugins = getPlugins(root);
  if (plugins.length === 0) return /$^/g;
  const escaped = plugins.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp('(' + escaped.join('|') + ')', 'g');
}

function transformBodyForOpenCode(body, pluginInstallPath) {
  const patterns = {
    claudePluginRoot: /\$\{CLAUDE_PLUGIN_ROOT\}/g,
    claudePluginRootDollar: /\$CLAUDE_PLUGIN_ROOT/g,
    pluginRoot: /\$\{PLUGIN_ROOT\}/g,
    pluginRootDollar: /\$PLUGIN_ROOT/g
  };
  
  body = body.replace(patterns.claudePluginRoot, pluginInstallPath);
  body = body.replace(patterns.claudePluginRootDollar, pluginInstallPath);
  body = body.replace(patterns.pluginRoot, pluginInstallPath);
  body = body.replace(patterns.pluginRootDollar, pluginInstallPath);
  
  body = body.replace(/\*\(Reference - adapt for OpenCode\)\*/g, '');
  
  body = body.replace(/await\s+Task\s*\(\s*\{[\s\S]*?\}\s*\);?/g, match => {
    const subagentMatch = match.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
    if (subagentMatch) {
      return `Subagent@${subagentMatch[1]}`;
    }
    return '';
  });
  
  body = body.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, '');
  body = body.replace(/require\s*\(['"][^'"]+['"]\)/g, '');
  
  return body;
}

function transformCommandFrontmatterForOpenCode(frontmatter) {
  const patterns = {
    claudePluginRoot: /\$\{CLAUDE_PLUGIN_ROOT\}/g,
    claudePluginRootDollar: /\$CLAUDE_PLUGIN_ROOT/g,
    pluginRoot: /\$\{PLUGIN_ROOT\}/g,
    pluginRootDollar: /\$PLUGIN_ROOT/g
  };
  
  return frontmatter.replace(/^---\n([\s\S]*?)^---/m, (match, fmContent) => {
    const lines = fmContent.trim().split('\n');
    const result = {};
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        result[key] = value;
      }
    }
    
    let output = '---\n';
    if (result.name) output += `name: ${result.name}\n`;
    if (result.description || result.desc) {
      output += `description: ${result.description || result.desc}\n`;
    }
    output += '---\n';
    
    return output;
  });
}

function transformAgentFrontmatterForOpenCode(frontmatter, options = {}) {
  const { stripModels = false } = options;
  
  return frontmatter.replace(/^---\n([\s\S]*?)^---/m, (match, fmContent) => {
    const lines = fmContent.trim().split('\n');
    const result = {};
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        result[key] = value;
      }
    }
    
    let output = '---\n';
    if (result.name) output += `name: ${result.name}\n`;
    if (result.description || result.desc) {
      output += `description: ${result.description || result.desc}\n`;
    }
    output += '---\n';
    
    if (result.model && !stripModels) {
      const modelMap = {
        'claude-3-opus': 'claude-3-opus-20240229',
        'claude-3-sonnet': 'claude-3-sonnet-20240229',
        'claude-3-haiku': 'claude-3-haiku-20240307'
      };
      output += `model: ${modelMap[result.model] || result.model}\n`;
    }
    
    if (result.temperature) {
      output += `temperature: ${result.temperature}\n`;
    }
    
    return output;
  });
}

function transformSkillBodyForOpenCode(body, pluginInstallPath) {
  return transformBodyForOpenCode(body, pluginInstallPath);
}

function transformForCodex(content, { skillName, description, pluginInstallPath }) {
  const escapedDescription = description.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const quotedDescription = `"${escapedDescription}"`;
  
  if (content.includes('---')) {
    content = content.replace(/^---\n[\s\S]*?\n---\n/, `---\nskill: ${skillName}\ndescription: ${quotedDescription}\n---\n`);
  } else {
    content = `---\nskill: ${skillName}\ndescription: ${quotedDescription}\n---\n` + content;
  }
  
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, pluginInstallPath);
  
  content = content.replace(/AskUserQuestion/g, 'AskUser');
  content = content.replace(/^[ \t]*multiSelect:.*\n?/gm, '');
  content = content.replace(/^([ \t]*request_user_input:\s*)$/gm, 'AskUser');
  
  return content;
}

function transformRuleForCursor(content, { description = '', pluginInstallPath, globs = '', alwaysApply = false }) {
  const sanitizedDescription = description.replace(/[\x00-\x1f\x7f]/g, ' ');
  const escapedDescription = sanitizedDescription.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const quotedDescription = `"${escapedDescription}"`;
  
  let output = `description: ${quotedDescription}\n`;
  if (globs) {
    output += `globs: ${JSON.stringify(globs)}\n`;
  }
  output += `alwaysApply: ${alwaysApply}\n`;
  
  if (content.includes('---')) {
    content = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  }
  
  content = output + content;
  
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  
  content = content.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, match => {
    const subagentMatch = match.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
    if (subagentMatch) {
      return `Subagent@${subagentMatch[1]}`;
    }
    return '';
  });
  
  content = content.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, '');
  content = content.replace(/require\s*\(['"][^'"]+['"]\)/g, '');
  content = content.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, '$1');
  
  return content;
}

function transformSkillForCursor(content, { pluginInstallPath }) {
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, '$1');
  
  return content;
}

function transformCommandForCursor(content, { pluginInstallPath }) {
  if (content.includes('---')) {
    content = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  }
  
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  
  content = content.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, '');
  content = content.replace(/require\s*\(['"][^'"]+['"]\)/g, '');
  
  content = content.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, match => {
    const subagentMatch = match.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
    if (subagentMatch) {
      return `Subagent@${subagentMatch[1]}`;
    }
    return '';
  });
  
  content = content.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, '$1');
  
  return content;
}

function transformSkillForKiro(content, { pluginInstallPath }) {
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, '$1');
  
  return content;
}

function transformCommandForKiro(content, { pluginInstallPath, name = '', description = '' }) {
  if (content.includes('---')) {
    content = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  }
  
  const sanitizedDescription = description.replace(/[\x00-\x1f\x7f]/g, ' ');
  const escapedDescription = sanitizedDescription.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  
  let header = '---\n';
  if (name) header += `name: "${name}"\n`;
  if (description) header += `description: "${escapedDescription}"\n`;
  header += '---\n';
  
  content = header + content;
  
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath);
  content = content.replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath);
  content = content.replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
  
  content = content.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, '');
  content = content.replace(/require\s*\(['"][^'"]+['"]\)/g, '');
  
  content = content.replace(/^

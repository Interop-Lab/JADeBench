var fs = require('fs');
var path = require('path');
var _cache = null;
var _cacheRoot = null;

function parseFrontmatter(content) {
  if (!content || !content.startsWith('---')) {
    return {};
  }
  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) {
    return {};
  }
  const fmText = content.substring(3, endIdx);
  const result = {};
  const lines = fmText.split('\n');
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    const arrayItemMatch = line.match(/^\s+-\s+(.+)$/);
    if (arrayItemMatch && currentKey && currentArray) {
      let value = arrayItemMatch[1].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, -1);
      }
      currentArray.push(value);
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) {
      if (currentKey && currentArray) {
        result[currentKey] = currentArray;
        currentKey = null;
        currentArray = null;
      }
      continue;
    }

    const key = line.substring(0, colonIdx).trim();
    if (key === '' || key === '---' || key === '...') {
      continue;
    }

    let value = line.substring(colonIdx + 1).trim();
    if (value === '') {
      currentKey = key;
      currentArray = [];
    } else {
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, -1);
      }
      result[key] = value;
      currentKey = null;
      currentArray = null;
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

function resolvePluginsDir(rootDir) {
  if (!rootDir) {
    rootDir = path.resolve(__dirname, '..', '..');
  }
  return path.resolve(rootDir, 'plugins');
}

function discoverPlugins(rootDir) {
  const cached = getCache(rootDir);
  if (cached && cached.plugins) {
    return cached.plugins;
  }
  const pluginsDir = resolvePluginsDir(rootDir);
  if (!fs.existsSync(pluginsDir)) {
    return [];
  }
  const entries = fs.readdirSync(pluginsDir);
  const plugins = entries.filter(entry => {
    if (!isValidPluginName(entry)) {
      return false;
    }
    const pluginJsonPath = path.join(pluginsDir, entry, '.claude-plugin', 'plugin.json');
    return fs.existsSync(pluginJsonPath);
  }).sort();
  setCache(rootDir, 'plugins', plugins);
  return plugins;
}

function discoverCommands(rootDir) {
  const cached = getCache(rootDir);
  if (cached && cached.commands) {
    return cached.commands;
  }
  const pluginsDir = resolvePluginsDir(rootDir);
  const plugins = discoverPlugins(rootDir);
  const commands = [];
  for (const plugin of plugins) {
    const commandsDir = path.join(pluginsDir, plugin, 'commands');
    if (!fs.existsSync(commandsDir)) {
      continue;
    }
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md')).sort();
    for (const file of files) {
      const filePath = path.join(commandsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const frontmatter = parseFrontmatter(content);
      commands.push({
        name: file.replace(/\.md$/, ''),
        plugin: plugin,
        file: file,
        frontmatter: frontmatter
      });
    }
  }
  setCache(rootDir, 'commands', commands);
  return commands;
}

function discoverAgents(rootDir) {
  const cached = getCache(rootDir);
  if (cached && cached.agents) {
    return cached.agents;
  }
  const pluginsDir = resolvePluginsDir(rootDir);
  const plugins = discoverPlugins(rootDir);
  const agents = [];
  for (const plugin of plugins) {
    const agentsDir = path.join(pluginsDir, plugin, 'agents');
    if (!fs.existsSync(agentsDir)) {
      continue;
    }
    const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).sort();
    for (const file of files) {
      const filePath = path.join(agentsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const frontmatter = parseFrontmatter(content);
      agents.push({
        name: file.replace(/\.md$/, ''),
        plugin: plugin,
        file: file,
        frontmatter: frontmatter
      });
    }
  }
  setCache(rootDir, 'agents', agents);
  return agents;
}

function discoverSkills(rootDir) {
  const cached = getCache(rootDir);
  if (cached && cached.skills) {
    return cached.skills;
  }
  const pluginsDir = resolvePluginsDir(rootDir);
  const plugins = discoverPlugins(rootDir);
  const skills = [];
  for (const plugin of plugins) {
    const skillsDir = path.join(pluginsDir, plugin, 'skills');
    if (!fs.existsSync(skillsDir)) {
      continue;
    }
    const skillDirs = fs.readdirSync(skillsDir).sort();
    for (const skillDir of skillDirs) {
      const skillPath = path.join(skillsDir, skillDir, 'SKILL.md');
      if (fs.existsSync(skillPath)) {
        const content = fs.readFileSync(skillPath, 'utf8');
        const frontmatter = parseFrontmatter(content);
        const skill = {};
        skill.name = skillDir;
        skill.plugin = plugin;
        skill.file = skillDir;
        skill.frontmatter = frontmatter;
        skills.push(skill);
      }
    }
  }
  setCache(rootDir, 'skills', skills);
  return skills;
}

function getCommandMappings(rootDir) {
  const commands = discoverCommands(rootDir);
  return commands.map(cmd => [cmd.name, cmd.plugin, cmd.file]);
}

function getCodexSkillMappings(rootDir) {
  const commands = discoverCommands(rootDir);
  return commands.map(cmd => {
    const description = cmd.frontmatter.description || cmd.frontmatter['description'] || '';
    return [cmd.name, cmd.plugin, cmd.file, description];
  });
}

function getPluginPrefixRegex(rootDir) {
  const plugins = discoverPlugins(rootDir);
  if (plugins.length === 0) {
    return /$^/g;
  }
  const escaped = plugins.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp('(' + escaped.join('|') + ')', 'g');
}

function discoverAll(rootDir) {
  return {
    plugins: discoverPlugins(rootDir),
    commands: discoverCommands(rootDir),
    agents: discoverAgents(rootDir),
    skills: discoverSkills(rootDir)
  };
}

function getCache(rootDir) {
  const resolvedRoot = rootDir || path.resolve(__dirname, '..', '..');
  if (_cache && _cacheRoot === resolvedRoot) {
    return _cache;
  }
  return null;
}

function setCache(rootDir, key, value) {
  const resolvedRoot = rootDir || path.resolve(__dirname, '..', '..');
  if (!_cache || _cacheRoot !== resolvedRoot) {
    _cache = {};
    _cacheRoot = resolvedRoot;
  }
  _cache[key] = value;
}

function invalidateCache() {
  _cache = null;
  _cacheRoot = null;
}

function getCursorRuleMappings(rootDir) {
  const commands = discoverCommands(rootDir);
  return commands.map(cmd => {
    const description = cmd.frontmatter.description || cmd.frontmatter['description'] || cmd.frontmatter['short-description'] || '';
    const title = cmd.frontmatter.title || '';
    const category = cmd.frontmatter.category || '';
    return ['cursor-' + cmd.name + '-' + cmd.plugin, cmd.name, cmd.plugin, description, title, category];
  });
}

function getKiroSteeringMappings(rootDir) {
  const commands = discoverCommands(rootDir);
  return commands.map(cmd => {
    const description = cmd.frontmatter.description || cmd.frontmatter['description'] || cmd.frontmatter['short-description'] || cmd.frontmatter['short_description'] || '';
    return [cmd.name, cmd.plugin, cmd.file, description];
  });
}

const exportsObj = {};
exportsObj.parseFrontmatter = parseFrontmatter;
exportsObj.isValidPluginName = isValidPluginName;
exportsObj.discoverPlugins = discoverPlugins;
exportsObj.discoverCommands = discoverCommands;
exportsObj.discoverAgents = discoverAgents;
exportsObj.discoverSkills = discoverSkills;
exportsObj.discoverAll = discoverAll;
exportsObj.getCommandMappings = getCommandMappings;
exportsObj.getCodexSkillMappings = getCodexSkillMappings;
exportsObj.getCursorRuleMappings = getCursorRuleMappings;
exportsObj.getKiroSteeringMappings = getKiroSteeringMappings;
exportsObj.getPluginPrefixRegex = getPluginPrefixRegex;
exportsObj.invalidateCache = invalidateCache;
module.exports = exportsObj;

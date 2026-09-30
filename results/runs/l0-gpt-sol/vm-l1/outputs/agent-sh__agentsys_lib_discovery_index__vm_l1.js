const fs = require('fs');
const path = require('path');

let _cache = null;
let _cacheRoot = null;

function parseFrontmatter(content) {
  if (typeof content !== 'string') {
    return {};
  }

  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!match) {
    return {};
  }

  const result = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator < 0) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    if (!key) {
      continue;
    }

    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else if (value === 'true' || value === 'false') {
      value = value === 'true';
    } else if (value === 'null') {
      value = null;
    } else if (/^-?\d+(?:\.\d+)?$/.test(value)) {
      value = Number(value);
    } else if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
        .map(item => {
          if (
            (item.startsWith('"') && item.endsWith('"')) ||
            (item.startsWith("'") && item.endsWith("'"))
          ) {
            return item.slice(1, -1);
          }
          return item;
        });
    }

    result[key] = value;
  }

  return result;
}

function isValidPluginName(name) {
  return typeof name === 'string' && /^[A-Za-z0-9_-]+$/.test(name);
}

function resolvePluginsDir(root) {
  const base = root ? path.resolve(root) : process.cwd();
  const candidates = [
    path.join(base, 'plugins'),
    path.join(base, '.claude', 'plugins'),
    path.join(__dirname, 'plugins')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
  }

  return candidates[0];
}

function readFiles(directory, extension) {
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
    return [];
  }

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && (!extension || entry.name.endsWith(extension)))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(entry => {
      const filePath = path.join(directory, entry.name);
      const content = fs.readFileSync(filePath, 'utf8');
      return {
        name: entry.name.replace(/\.[^.]+$/, ''),
        file: entry.name,
        path: filePath,
        content,
        frontmatter: parseFrontmatter(content)
      };
    });
}

function normalizePlugin(plugin) {
  if (typeof plugin === 'string') {
    const pluginPath = path.resolve(plugin);
    return {
      name: path.basename(pluginPath),
      path: pluginPath
    };
  }

  return plugin;
}

function discoverPlugins(root) {
  const pluginsDir = root ? resolvePluginsDir(root) : resolvePluginsDir();
  if (!fs.existsSync(pluginsDir) || !fs.statSync(pluginsDir).isDirectory()) {
    return [];
  }

  const plugins = [];

  for (const entry of fs.readdirSync(pluginsDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory() || !isValidPluginName(entry.name)) {
      continue;
    }

    const pluginPath = path.join(pluginsDir, entry.name);
    const manifestPath = path.join(pluginPath, '.claude-plugin', 'plugin.json');

    if (!fs.existsSync(manifestPath)) {
      continue;
    }

    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      continue;
    }

    plugins.push({
      name: entry.name,
      path: pluginPath,
      manifest,
      manifestPath
    });
  }

  return plugins;
}

function discoverCommands(plugin) {
  const normalized = normalizePlugin(plugin);
  if (!normalized || !normalized.path) {
    return [];
  }

  const directory = path.join(normalized.path, 'commands');
  return readFiles(directory, '.md').map(command => ({
    ...command,
    plugin: normalized.name,
    pluginPath: normalized.path,
    command: command.name
  }));
}

function discoverAgents(plugin) {
  const normalized = normalizePlugin(plugin);
  if (!normalized || !normalized.path) {
    return [];
  }

  const directory = path.join(normalized.path, 'agents');
  return readFiles(directory, '.md').map(agent => ({
    ...agent,
    plugin: normalized.name,
    pluginPath: normalized.path,
    agent: agent.name
  }));
}

function discoverSkills(plugin) {
  const normalized = normalizePlugin(plugin);
  if (!normalized || !normalized.path) {
    return [];
  }

  const directory = path.join(normalized.path, 'skills');
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
    return [];
  }

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && isValidPluginName(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(entry => {
      const skillDirectory = path.join(directory, entry.name);
      const skillPath = path.join(skillDirectory, 'SKILL.md');

      if (!fs.existsSync(skillPath) || !fs.statSync(skillPath).isFile()) {
        return null;
      }

      const content = fs.readFileSync(skillPath, 'utf8');
      return {
        name: entry.name,
        skill: entry.name,
        path: skillPath,
        directory: skillDirectory,
        content,
        frontmatter: parseFrontmatter(content),
        plugin: normalized.name,
        pluginPath: normalized.path
      };
    })
    .filter(Boolean);
}

function discoverAll(root) {
  const pluginsDir = root ? resolvePluginsDir(root) : resolvePluginsDir();
  const plugins = discoverPlugins(pluginsDir);

  const result = {
    plugins,
    commands: [],
    agents: [],
    skills: []
  };

  for (const plugin of plugins) {
    result.commands.push(...discoverCommands(plugin));
    result.agents.push(...discoverAgents(plugin));
    result.skills.push(...discoverSkills(plugin));
  }

  return result;
}

function getCommandMappings(discovery) {
  const data = discovery && discovery.commands ? discovery : discoverAll(discovery);
  const mappings = {};

  for (const command of data.commands || []) {
    const key = command.plugin
      ? `${command.plugin}:${command.command}`
      : command.command;
    mappings[key] = command.path;
  }

  return mappings;
}

function getCodexSkillMappings(discovery) {
  const data = discovery && discovery.skills ? discovery : discoverAll(discovery);
  const mappings = {};

  for (const skill of data.skills || []) {
    const key = skill.plugin
      ? `${skill.plugin}:${skill.skill}`
      : skill.skill;
    mappings[key] = skill.path;
  }

  return mappings;
}

function getPluginPrefixRegex(discovery) {
  const data = discovery && discovery.plugins ? discovery : discoverAll(discovery);
  const names = (data.plugins || [])
    .map(plugin => plugin.name)
    .filter(isValidPluginName)
    .sort((a, b) => b.length - a.length)
    .map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  return new RegExp(`^@(?:${names.join('|')})(?::|/)`, 'i');
}

function getCursorRuleMappings(discovery) {
  const data = discovery && discovery.skills ? discovery : discoverAll(discovery);
  const mappings = {};

  for (const skill of data.skills || []) {
    const frontmatter = skill.frontmatter || {};
    const cursorName = frontmatter.name || skill.skill;
    mappings[cursorName] = skill.path;
  }

  return mappings;
}

function getKiroSteeringMappings(discovery) {
  const data = discovery && discovery.skills ? discovery : discoverAll(discovery);
  const mappings = {};

  for (const skill of data.skills || []) {
    const frontmatter = skill.frontmatter || {};
    const steeringName = frontmatter.name || skill.skill;
    mappings[steeringName] = skill.path;
  }

  return mappings;
}

function getCache() {
  return _cache;
}

function setCache(value, root, rootPath) {
  _cache = value;
  _cacheRoot = rootPath || root || null;
  return _cache;
}

function invalidateCache() {
  _cache = null;
  _cacheRoot = null;
}

module.exports = {
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
  invalidateCache
};

/**
 * Plugin Discovery Module
 *
 * Convention-based filesystem scanning to discover plugins, commands,
 * agents, and skills. Replaces all hardcoded registration lists.
 *
 * Convention:
 * - plugins/<name>/.claude-plugin/plugin.json -> plugin
 * - plugins/<name>/commands/*.md -> commands
 * - plugins/<name>/agents/*.md -> agents
 * - plugins/<name>/skills/<skill>/SKILL.md -> skills
 *
 * @module discovery
 * @author Avi Fenesh
 * @license MIT
 */
const fs = require('fs');
const path = require('path');

let _cache = null;
let _cacheRoot = null;

function parseFrontmatter(content) {
  const result = { data: {}, content: '' };
  if (typeof content !== 'string') return result;
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    result.content = content;
    return result;
  }
  result.content = content.slice(match[0].length);
  const lines = match[1].split(/\r?\n/);
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result.data[key] = value;
  }
  return result;
}

function isValidPluginName(name) {
  return typeof name === 'string' && /^[a-zA-Z0-9_-]+$/.test(name);
}

function resolvePluginsDir(rootDir) {
  const base = rootDir || process.cwd();
  const candidates = [
    path.join(base, 'plugins'),
    path.join(base, '.claude', 'plugins'),
    path.join(base, '.claude-plugin', 'plugins')
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        return candidate;
      }
    } catch (_) {}
  }
  return candidates[0];
}

function discoverPlugins(rootDir) {
  const pluginsDir = resolvePluginsDir(rootDir);
  const plugins = [];
  let entries = [];
  try {
    entries = fs.readdirSync(pluginsDir);
  } catch (_) {
    return plugins;
  }
  for (const entry of entries) {
    if (!isValidPluginName(entry)) continue;
    const pluginJsonPath = path.join(pluginsDir, entry, '.claude-plugin', 'plugin.json');
    try {
      if (!fs.existsSync(pluginJsonPath)) continue;
      const raw = fs.readFileSync(pluginJsonPath, 'utf8');
      const plugin = JSON.parse(raw);
      plugin.name = plugin.name || entry;
      plugin.path = path.join(pluginsDir, entry);
      plugins.push(plugin);
    } catch (_) {}
  }
  return plugins;
}

function discoverCommands(rootDir) {
  const pluginsDir = resolvePluginsDir(rootDir);
  const commands = [];
  let entries = [];
  try {
    entries = fs.readdirSync(pluginsDir);
  } catch (_) {
    return commands;
  }
  for (const entry of entries) {
    if (!isValidPluginName(entry)) continue;
    const commandsDir = path.join(pluginsDir, entry, 'commands');
    let files = [];
    try {
      files = fs.readdirSync(commandsDir);
    } catch (_) {
      continue;
    }
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const filePath = path.join(commandsDir, file);
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = parseFrontmatter(raw);
        commands.push({
          name: file.replace(/\.md$/, ''),
          plugin: entry,
          path: filePath,
          frontmatter: parsed.data,
          content: parsed.content
        });
      } catch (_) {}
    }
  }
  return commands;
}

function discoverAgents(rootDir) {
  const pluginsDir = resolvePluginsDir(rootDir);
  const agents = [];
  let entries = [];
  try {
    entries = fs.readdirSync(pluginsDir);
  } catch (_) {
    return agents;
  }
  for (const entry of entries) {
    if (!isValidPluginName(entry)) continue;
    const agentsDir = path.join(pluginsDir, entry, 'agents');
    let files = [];
    try {
      files = fs.readdirSync(agentsDir);
    } catch (_) {
      continue;
    }
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const filePath = path.join(agentsDir, file);
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = parseFrontmatter(raw);
        agents.push({
          name: file.replace(/\.md$/, ''),
          plugin: entry,
          path: filePath,
          frontmatter: parsed.data,
          content: parsed.content
        });
      } catch (_) {}
    }
  }
  return agents;
}

function discoverSkills(rootDir) {
  const pluginsDir = resolvePluginsDir(rootDir);
  const skills = [];
  let entries = [];
  try {
    entries = fs.readdirSync(pluginsDir);
  } catch (_) {
    return skills;
  }
  for (const entry of entries) {
    if (!isValidPluginName(entry)) continue;
    const skillsDir = path.join(pluginsDir, entry, 'skills');
    let skillNames = [];
    try {
      skillNames = fs.readdirSync(skillsDir);
    } catch (_) {
      continue;
    }
    for (const skillName of skillNames) {
      const skillFile = path.join(skillsDir, skillName, 'SKILL.md');
      try {
        if (!fs.existsSync(skillFile)) continue;
        const raw = fs.readFileSync(skillFile, 'utf8');
        const parsed = parseFrontmatter(raw);
        skills.push({
          name: skillName,
          plugin: entry,
          path: skillFile,
          frontmatter: parsed.data,
          content: parsed.content
        });
      } catch (_) {}
    }
  }
  return skills;
}

function getCommandMappings(rootDir) {
  const commands = discoverCommands(rootDir);
  const mappings = {};
  for (const command of commands) {
    const prefix = command.plugin;
    mappings[`${prefix}:${command.name}`] = command;
    mappings[command.name] = command;
  }
  return mappings;
}

function getCodexSkillMappings(rootDir) {
  const skills = discoverSkills(rootDir);
  const mappings = {};
  for (const skill of skills) {
    mappings[`${skill.plugin}:${skill.name}`] = skill;
    mappings[skill.name] = skill;
  }
  return mappings;
}

function getPluginPrefixRegex(rootDir) {
  const plugins = discoverPlugins(rootDir);
  const names = plugins.map((plugin) => plugin.name).filter(Boolean);
  if (names.length === 0) return null;
  const escaped = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`^(${escaped.join('|')}):`);
}

function discoverAll(rootDir) {
  return {
    plugins: discoverPlugins(rootDir),
    commands: discoverCommands(rootDir),
    agents: discoverAgents(rootDir),
    skills: discoverSkills(rootDir)
  };
}

function getCache() {
  return _cache;
}

function setCache(root, value) {
  _cacheRoot = root;
  _cache = value;
}

function invalidateCache() {
  _cache = null;
  _cacheRoot = null;
}

function getCursorRuleMappings(rootDir) {
  const pluginsDir = resolvePluginsDir(rootDir);
  const mappings = {};
  let entries = [];
  try {
    entries = fs.readdirSync(pluginsDir);
  } catch (_) {
    return mappings;
  }
  for (const entry of entries) {
    if (!isValidPluginName(entry)) continue;
    const rulesDir = path.join(pluginsDir, entry, 'rules');
    let files = [];
    try {
      files = fs.readdirSync(rulesDir);
    } catch (_) {
      continue;
    }
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const filePath = path.join(rulesDir, file);
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = parseFrontmatter(raw);
        mappings[`${entry}:${file.replace(/\.md$/, '')}`] = {
          name: file.replace(/\.md$/, ''),
          plugin: entry,
          path: filePath,
          frontmatter: parsed.data,
          content: parsed.content
        };
      } catch (_) {}
    }
  }
  return mappings;
}

function getKiroSteeringMappings(rootDir) {
  const pluginsDir = resolvePluginsDir(rootDir);
  const mappings = {};
  let entries = [];
  try {
    entries = fs.readdirSync(pluginsDir);
  } catch (_) {
    return mappings;
  }
  for (const entry of entries) {
    if (!isValidPluginName(entry)) continue;
    const steeringDir = path.join(pluginsDir, entry, 'steering');
    let files = [];
    try {
      files = fs.readdirSync(steeringDir);
    } catch (_) {
      continue;
    }
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const filePath = path.join(steeringDir, file);
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = parseFrontmatter(raw);
        mappings[`${entry}:${file.replace(/\.md$/, '')}`] = {
          name: file.replace(/\.md$/, ''),
          plugin: entry,
          path: filePath,
          frontmatter: parsed.data,
          content: parsed.content
        };
      } catch (_) {}
    }
  }
  return mappings;
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

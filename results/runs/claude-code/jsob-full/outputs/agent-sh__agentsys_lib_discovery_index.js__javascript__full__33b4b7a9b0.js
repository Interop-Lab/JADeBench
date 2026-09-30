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

let cache = null;
let cacheRoot = null;

function unquote(value) {
  const isDoubleQuoted = value.startsWith('"') && value.endsWith('"');
  const isSingleQuoted = value.startsWith("'") && value.endsWith("'");
  return isDoubleQuoted || isSingleQuoted ? value.slice(1, -1) : value;
}

function parseFrontmatter(content) {
  if (!content || !content.startsWith('---')) return {};

  const end = content.indexOf('\n---', 3);
  if (end === -1) return {};

  const result = {};
  const lines = content.substring(3, end).split('\n');
  let arrayKey = null;
  let arrayValue = null;

  for (const line of lines) {
    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && arrayKey && arrayValue) {
      arrayValue.push(unquote(listItem[1].trim()));
      continue;
    }

    const colon = line.indexOf(':');
    if (colon <= 0) continue;

    if (arrayKey && arrayValue) {
      result[arrayKey] = arrayValue;
      arrayKey = null;
      arrayValue = null;
    }

    const key = line.substring(0, colon).trim();
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    const value = line.substring(colon + 1).trim();
    if (value === '') {
      arrayKey = key;
      arrayValue = [];
    } else {
      result[key] = unquote(value);
    }
  }

  if (arrayKey && arrayValue) result[arrayKey] = arrayValue;
  return result;
}

function isValidPluginName(name) {
  return /^[a-z0-9][a-z0-9-]*$/.test(name);
}

function projectRoot(root) {
  return root || path.resolve(__dirname, '..', '..');
}

function resolvePluginsDir(root) {
  return path.join(projectRoot(root), 'plugins');
}

function getCache(root) {
  const rootPath = projectRoot(root);
  return cache && cacheRoot === rootPath ? cache : null;
}

function setCache(root, key, value) {
  const rootPath = projectRoot(root);
  if (!cache || cacheRoot !== rootPath) {
    cache = {};
    cacheRoot = rootPath;
  }
  cache[key] = value;
}

function invalidateCache() {
  cache = null;
  cacheRoot = null;
}

function discoverPlugins(root) {
  const cached = getCache(root);
  if (cached && cached.plugins) return cached.plugins;

  const pluginsDir = resolvePluginsDir(root);
  if (!fs.existsSync(pluginsDir)) return [];

  const plugins = fs.readdirSync(pluginsDir)
    .filter((pluginName) => {
      if (!isValidPluginName(pluginName)) return false;
      const manifest = path.join(
        pluginsDir,
        pluginName,
        '.claude-plugin',
        'plugin.json',
      );
      return fs.existsSync(manifest);
    })
    .sort();

  setCache(root, 'plugins', plugins);
  return plugins;
}

function discoverCommands(root) {
  const cached = getCache(root);
  if (cached && cached.commands) return cached.commands;

  const pluginsDir = resolvePluginsDir(root);
  const commands = [];

  for (const plugin of discoverPlugins(root)) {
    const commandsDir = path.join(pluginsDir, plugin, 'commands');
    if (!fs.existsSync(commandsDir)) continue;

    const files = fs.readdirSync(commandsDir)
      .filter((file) => file.endsWith('.md'))
      .sort();

    for (const file of files) {
      const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');
      commands.push({
        name: file.replace(/\.md$/, ''),
        plugin,
        file,
        frontmatter: parseFrontmatter(content),
      });
    }
  }

  setCache(root, 'commands', commands);
  return commands;
}

function discoverAgents(root) {
  const cached = getCache(root);
  if (cached && cached.agents) return cached.agents;

  const pluginsDir = resolvePluginsDir(root);
  const agents = [];

  for (const plugin of discoverPlugins(root)) {
    const agentsDir = path.join(pluginsDir, plugin, 'agents');
    if (!fs.existsSync(agentsDir)) continue;

    const files = fs.readdirSync(agentsDir)
      .filter((file) => file.endsWith('.md'))
      .sort();

    for (const file of files) {
      const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
      agents.push({
        name: file.replace(/\.md$/, ''),
        plugin,
        file,
        frontmatter: parseFrontmatter(content),
      });
    }
  }

  setCache(root, 'agents', agents);
  return agents;
}

function discoverSkills(root) {
  const cached = getCache(root);
  if (cached && cached.skills) return cached.skills;

  const pluginsDir = resolvePluginsDir(root);
  const skills = [];

  for (const plugin of discoverPlugins(root)) {
    const skillsDir = path.join(pluginsDir, plugin, 'skills');
    if (!fs.existsSync(skillsDir)) continue;

    for (const skillName of fs.readdirSync(skillsDir).sort()) {
      const skillFile = path.join(skillsDir, skillName, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;

      const content = fs.readFileSync(skillFile, 'utf8');
      skills.push({
        name: skillName,
        plugin,
        dir: skillName,
        frontmatter: parseFrontmatter(content),
      });
    }
  }

  setCache(root, 'skills', skills);
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
  return discoverCommands(root).map((command) => [
    command.file,
    command.plugin,
    command.file,
  ]);
}

function getCursorRuleMappings(root) {
  return discoverCommands(root).map((command) => {
    const description = command.frontmatter['cursor-description']
      || command.frontmatter['codex-description']
      || command.frontmatter.description
      || '';
    const type = command.frontmatter.type || 'command';
    const globs = command.frontmatter.globs || '';

    return [
      `agentsys-${command.plugin}-${command.name}`,
      command.plugin,
      command.file,
      description,
      type,
      globs,
    ];
  });
}

function getKiroSteeringMappings(root) {
  return discoverCommands(root).map((command) => {
    const description = command.frontmatter['kiro-description']
      || command.frontmatter['cursor-description']
      || command.frontmatter['codex-description']
      || command.frontmatter.description
      || '';
    return [command.name, command.plugin, command.file, description];
  });
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
  getCursorRuleMappings,
  getKiroSteeringMappings,
  invalidateCache,
};

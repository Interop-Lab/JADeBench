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

var fs = require('fs');
var path = require('path');

var _cache = null;
var _cacheRoot = null;

function parseFrontmatter(content) {
  if (!content || typeof content !== 'string') {
    return { frontmatter: null, body: content };
  }

  var frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!frontmatterMatch) {
    return { frontmatter: null, body: content };
  }

  var frontmatterText = frontmatterMatch[1];
  var body = content.slice(frontmatterMatch[0].length);
  var frontmatter = {};

  var lines = frontmatterText.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      var key = match[1];
      var value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }

  return { frontmatter: frontmatter, body: body };
}

function isValidPluginName(name) {
  if (!name || typeof name !== 'string') {
    return false;
  }
  return /^[a-z0-9-]+$/.test(name);
}

function resolvePluginsDir(rootDir) {
  if (!rootDir) {
    rootDir = process.cwd();
  }
  return path.join(rootDir, 'plugins');
}

function discoverPlugins(rootDir) {
  var pluginsDir = resolvePluginsDir(rootDir);

  if (!fs.existsSync(pluginsDir)) {
    return [];
  }

  var entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
  var plugins = [];

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    if (!entry.isDirectory()) {
      continue;
    }

    var pluginName = entry.name;
    if (!isValidPluginName(pluginName)) {
      continue;
    }

    var pluginJsonPath = path.join(pluginsDir, pluginName, '.claude-plugin', 'plugin.json');
    if (!fs.existsSync(pluginJsonPath)) {
      continue;
    }

    try {
      var pluginConfig = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
      plugins.push({
        name: pluginName,
        path: path.join(pluginsDir, pluginName),
        config: pluginConfig
      });
    } catch (e) {
      // Skip invalid plugin.json
    }
  }

  return plugins;
}

function discoverCommands(rootDir) {
  var pluginsDir = resolvePluginsDir(rootDir);

  if (!fs.existsSync(pluginsDir)) {
    return [];
  }

  var entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
  var commands = [];

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    if (!entry.isDirectory()) {
      continue;
    }

    var pluginName = entry.name;
    if (!isValidPluginName(pluginName)) {
      continue;
    }

    var commandsDir = path.join(pluginsDir, pluginName, 'commands');
    if (!fs.existsSync(commandsDir)) {
      continue;
    }

    var commandFiles = fs.readdirSync(commandsDir);
    for (var j = 0; j < commandFiles.length; j++) {
      var file = commandFiles[j];
      if (!file.endsWith('.md')) {
        continue;
      }

      var commandPath = path.join(commandsDir, file);
      var content = fs.readFileSync(commandPath, 'utf8');
      var parsed = parseFrontmatter(content);
      var commandName = path.basename(file, '.md');

      commands.push({
        plugin: pluginName,
        name: commandName,
        path: commandPath,
        frontmatter: parsed.frontmatter,
        body: parsed.body
      });
    }
  }

  return commands;
}

function discoverAgents(rootDir) {
  var pluginsDir = resolvePluginsDir(rootDir);

  if (!fs.existsSync(pluginsDir)) {
    return [];
  }

  var entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
  var agents = [];

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    if (!entry.isDirectory()) {
      continue;
    }

    var pluginName = entry.name;
    if (!isValidPluginName(pluginName)) {
      continue;
    }

    var agentsDir = path.join(pluginsDir, pluginName, 'agents');
    if (!fs.existsSync(agentsDir)) {
      continue;
    }

    var agentFiles = fs.readdirSync(agentsDir);
    for (var j = 0; j < agentFiles.length; j++) {
      var file = agentFiles[j];
      if (!file.endsWith('.md')) {
        continue;
      }

      var agentPath = path.join(agentsDir, file);
      var content = fs.readFileSync(agentPath, 'utf8');
      var parsed = parseFrontmatter(content);
      var agentName = path.basename(file, '.md');

      agents.push({
        plugin: pluginName,
        name: agentName,
        path: agentPath,
        frontmatter: parsed.frontmatter,
        body: parsed.body
      });
    }
  }

  return agents;
}

function discoverSkills(rootDir) {
  var pluginsDir = resolvePluginsDir(rootDir);

  if (!fs.existsSync(pluginsDir)) {
    return [];
  }

  var entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
  var skills = [];

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    if (!entry.isDirectory()) {
      continue;
    }

    var pluginName = entry.name;
    if (!isValidPluginName(pluginName)) {
      continue;
    }

    var skillsDir = path.join(pluginsDir, pluginName, 'skills');
    if (!fs.existsSync(skillsDir)) {
      continue;
    }

    var skillEntries = fs.readdirSync(skillsDir, { withFileTypes: true });
    for (var j = 0; j < skillEntries.length; j++) {
      var skillEntry = skillEntries[j];
      if (!skillEntry.isDirectory()) {
        continue;
      }

      var skillName = skillEntry.name;
      var skillMdPath = path.join(skillsDir, skillName, 'SKILL.md');
      if (!fs.existsSync(skillMdPath)) {
        continue;
      }

      var content = fs.readFileSync(skillMdPath, 'utf8');
      var parsed = parseFrontmatter(content);

      skills.push({
        plugin: pluginName,
        name: skillName,
        path: skillMdPath,
        frontmatter: parsed.frontmatter,
        body: parsed.body
      });
    }
  }

  return skills;
}

function getCommandMappings(rootDir) {
  var commands = discoverCommands(rootDir);
  var mappings = {};

  for (var i = 0; i < commands.length; i++) {
    var cmd = commands[i];
    var prefix = cmd.plugin + ':';
    var fullName = prefix + cmd.name;
    mappings[fullName] = {
      plugin: cmd.plugin,
      name: cmd.name,
      path: cmd.path,
      frontmatter: cmd.frontmatter,
      body: cmd.body
    };
  }

  return mappings;
}

function getCodexSkillMappings(rootDir) {
  var skills = discoverSkills(rootDir);
  var mappings = {};

  for (var i = 0; i < skills.length; i++) {
    var skill = skills[i];
    var fullName = skill.plugin + ':' + skill.name;
    mappings[fullName] = {
      plugin: skill.plugin,
      name: skill.name,
      path: skill.path,
      frontmatter: skill.frontmatter,
      body: skill.body
    };
  }

  return mappings;
}

function getPluginPrefixRegex() {
  return /^([a-z0-9-]+):(.+)$/;
}

function discoverAll(rootDir) {
  if (_cache && _cacheRoot === rootDir) {
    return _cache;
  }

  var result = {
    plugins: discoverPlugins(rootDir),
    commands: discoverCommands(rootDir),
    agents: discoverAgents(rootDir),
    skills: discoverSkills(rootDir)
  };

  _cache = result;
  _cacheRoot = rootDir;

  return result;
}

function getCache() {
  return _cache;
}

function setCache(cache, rootDir) {
  _cache = cache;
  _cacheRoot = rootDir;
}

function invalidateCache() {
  _cache = null;
  _cacheRoot = null;
}

function getCursorRuleMappings(rootDir) {
  var plugins = discoverPlugins(rootDir);
  var mappings = {};

  for (var i = 0; i < plugins.length; i++) {
    var plugin = plugins[i];
    var cursorRulesPath = path.join(plugin.path, '.cursor', 'rules');
    if (!fs.existsSync(cursorRulesPath)) {
      continue;
    }

    var ruleFiles = fs.readdirSync(cursorRulesPath);
    for (var j = 0; j < ruleFiles.length; j++) {
      var file = ruleFiles[j];
      if (!file.endsWith('.md')) {
        continue;
      }

      var rulePath = path.join(cursorRulesPath, file);
      var content = fs.readFileSync(rulePath, 'utf8');
      var parsed = parseFrontmatter(content);
      var ruleName = path.basename(file, '.md');

      mappings[plugin.name + ':' + ruleName] = {
        plugin: plugin.name,
        name: ruleName,
        path: rulePath,
        frontmatter: parsed.frontmatter,
        body: parsed.body
      };
    }
  }

  return mappings;
}

function getKiroSteeringMappings(rootDir) {
  var plugins = discoverPlugins(rootDir);
  var mappings = {};

  for (var i = 0; i < plugins.length; i++) {
    var plugin = plugins[i];
    var steeringPath = path.join(plugin.path, '.kiro', 'steering');
    if (!fs.existsSync(steeringPath)) {
      continue;
    }

    var steeringFiles = fs.readdirSync(steeringPath);
    for (var j = 0; j < steeringFiles.length; j++) {
      var file = steeringFiles[j];
      if (!file.endsWith('.md')) {
        continue;
      }

      var filePath = path.join(steeringPath, file);
      var content = fs.readFileSync(filePath, 'utf8');
      var parsed = parseFrontmatter(content);
      var name = path.basename(file, '.md');

      mappings[plugin.name + ':' + name] = {
        plugin: plugin.name,
        name: name,
        path: filePath,
        frontmatter: parsed.frontmatter,
        body: parsed.body
      };
    }
  }

  return mappings;
}

module.exports = {
  parseFrontmatter: parseFrontmatter,
  isValidPluginName: isValidPluginName,
  discoverPlugins: discoverPlugins,
  discoverCommands: discoverCommands,
  discoverAgents: discoverAgents,
  discoverSkills: discoverSkills,
  discoverAll: discoverAll,
  getCommandMappings: getCommandMappings,
  getCodexSkillMappings: getCodexSkillMappings,
  getCursorRuleMappings: getCursorRuleMappings,
  getKiroSteeringMappings: getKiroSteeringMappings,
  getPluginPrefixRegex: getPluginPrefixRegex,
  invalidateCache: invalidateCache
};

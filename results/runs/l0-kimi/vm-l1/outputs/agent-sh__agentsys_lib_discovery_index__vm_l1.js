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
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, body: content };
  }
  
  const frontmatterText = match[1];
  const body = match[2];
  const frontmatter = {};
  
  const lines = frontmatterText.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      frontmatter[key] = value;
    }
  }
  
  return { frontmatter, body };
}

function isValidPluginName(name) {
  return /^[a-z0-9-]+$/.test(name) && name.length > 0;
}

function resolvePluginsDir(cwd) {
  const pluginsDir = path.join(cwd, 'plugins');
  if (!fs.existsSync(pluginsDir)) {
    return null;
  }
  return pluginsDir;
}

function discoverPlugins(pluginsDir) {
  if (!pluginsDir || !fs.existsSync(pluginsDir)) {
    return [];
  }
  
  const plugins = [];
  const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const pluginName = entry.name;
    if (!isValidPluginName(pluginName)) continue;
    
    const pluginDir = path.join(pluginsDir, pluginName);
    const pluginJsonPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
    
    if (!fs.existsSync(pluginJsonPath)) continue;
    
    try {
      const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
      plugins.push({
        name: pluginName,
        path: pluginDir,
        ...pluginJson
      });
    } catch (e) {
      // Skip invalid plugin.json
    }
  }
  
  return plugins;
}

function discoverCommands(pluginsDir) {
  if (!pluginsDir || !fs.existsSync(pluginsDir)) {
    return [];
  }
  
  const commands = [];
  const plugins = discoverPlugins(pluginsDir);
  
  for (const plugin of plugins) {
    const commandsDir = path.join(plugin.path, 'commands');
    if (!fs.existsSync(commandsDir)) continue;
    
    const files = fs.readdirSync(commandsDir);
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const commandName = file.slice(0, -3);
      const filePath = path.join(commandsDir, file);
      
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(content);
        
        commands.push({
          name: commandName,
          plugin: plugin.name,
          path: filePath,
          description: frontmatter.description || '',
          pattern: frontmatter.pattern || null,
          handler: frontmatter.handler || null,
          body: body
        });
      } catch (e) {
        // Skip invalid command files
      }
    }
  }
  
  return commands;
}

function discoverAgents(pluginsDir) {
  if (!pluginsDir || !fs.existsSync(pluginsDir)) {
    return [];
  }
  
  const agents = [];
  const plugins = discoverPlugins(pluginsDir);
  
  for (const plugin of plugins) {
    const agentsDir = path.join(plugin.path, 'agents');
    if (!fs.existsSync(agentsDir)) continue;
    
    const files = fs.readdirSync(agentsDir);
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const agentName = file.slice(0, -3);
      const filePath = path.join(agentsDir, file);
      
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(content);
        
        agents.push({
          name: agentName,
          plugin: plugin.name,
          path: filePath,
          description: frontmatter.description || '',
          model: frontmatter.model || null,
          systemPrompt: body
        });
      } catch (e) {
        // Skip invalid agent files
      }
    }
  }
  
  return agents;
}

function discoverSkills(pluginsDir) {
  if (!pluginsDir || !fs.existsSync(pluginsDir)) {
    return [];
  }
  
  const skills = [];
  const plugins = discoverPlugins(pluginsDir);
  
  for (const plugin of plugins) {
    const skillsDir = path.join(plugin.path, 'skills');
    if (!fs.existsSync(skillsDir)) continue;
    
    const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true });
    for (const skillDir of skillDirs) {
      if (!skillDir.isDirectory()) continue;
      
      const skillName = skillDir.name;
      const skillPath = path.join(skillsDir, skillName);
      const skillMdPath = path.join(skillPath, 'SKILL.md');
      
      if (!fs.existsSync(skillMdPath)) continue;
      
      try {
        const content = fs.readFileSync(skillMdPath, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(content);
        
        skills.push({
          name: skillName,
          plugin: plugin.name,
          path: skillPath,
          description: frontmatter.description || '',
          codex: frontmatter.codex || null,
          rules: frontmatter.rules || null,
          body: body
        });
      } catch (e) {
        // Skip invalid skill files
      }
    }
  }
  
  return skills;
}

function getCommandMappings(pluginsDir) {
  const commands = discoverCommands(pluginsDir);
  const mappings = {};
  
  for (const command of commands) {
    if (command.pattern) {
      mappings[command.name] = {
        pattern: command.pattern,
        handler: command.handler,
        plugin: command.plugin
      };
    }
  }
  
  return mappings;
}

function getCodexSkillMappings(pluginsDir) {
  const skills = discoverSkills(pluginsDir);
  const mappings = {};
  
  for (const skill of skills) {
    if (skill.codex) {
      mappings[skill.name] = {
        codex: skill.codex,
        plugin: skill.plugin,
        path: skill.path
      };
    }
  }
  
  return mappings;
}

function getPluginPrefixRegex(pluginsDir) {
  const plugins = discoverPlugins(pluginsDir);
  const prefixes = plugins.map(p => p.name).filter(Boolean);
  
  if (prefixes.length === 0) {
    return null;
  }
  
  const escaped = prefixes.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`^(${escaped.join('|')})`);
}

function discoverAll(pluginsDir) {
  return {
    plugins: discoverPlugins(pluginsDir),
    commands: discoverCommands(pluginsDir),
    agents: discoverAgents(pluginsDir),
    skills: discoverSkills(pluginsDir)
  };
}

function getCache(rootPath) {
  if (_cache && _cacheRoot === rootPath) {
    return _cache;
  }
  return null;
}

function setCache(rootPath, data, ttl = 300000) {
  _cacheRoot = rootPath;
  _cache = {
    data,
    timestamp: Date.now(),
    ttl
  };
}

function invalidateCache() {
  _cache = null;
  _cacheRoot = null;
}

function getCursorRuleMappings(pluginsDir) {
  const skills = discoverSkills(pluginsDir);
  const mappings = {};
  
  for (const skill of skills) {
    if (skill.rules) {
      const rulesPath = path.join(skill.path, skill.rules);
      if (fs.existsSync(rulesPath)) {
        try {
          const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
          mappings[skill.name] = {
            rules: rulesContent,
            plugin: skill.plugin
          };
        } catch (e) {
          // Skip invalid rules files
        }
      }
    }
  }
  
  return mappings;
}

function getKiroSteeringMappings(pluginsDir) {
  const skills = discoverSkills(pluginsDir);
  const mappings = {};
  
  for (const skill of skills) {
    const steeringPath = path.join(skill.path, '.kiro', 'steering.md');
    if (fs.existsSync(steeringPath)) {
      try {
        const steeringContent = fs.readFileSync(steeringPath, 'utf-8');
        mappings[skill.name] = {
          steering: steeringContent,
          plugin: skill.plugin
        };
      } catch (e) {
        // Skip invalid steering files
      }
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

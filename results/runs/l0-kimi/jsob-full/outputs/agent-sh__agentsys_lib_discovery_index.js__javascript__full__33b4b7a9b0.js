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
var fs = require('fs'), path = require('path'), _cache = null;
var _cacheRoot = null;

function parseFrontmatter(content) {
    if (!content || !content.startsWith('---')) {
        return {};
    }
    const endIndex = content.indexOf('---', 3);
    if (endIndex === -1) {
        return {};
    }
    const frontmatterText = content.substring(3, endIndex);
    const result = {};
    const lines = frontmatterText.split('\n');
    let currentKey = null;
    let currentArray = null;

    for (const line of lines) {
        const listMatch = line.match(/^\s+-\s+(.+)$/);
        if (listMatch && currentKey && currentArray) {
            let value = listMatch[1].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            currentArray.push(value);
            continue;
        }

        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) {
            if (currentKey && currentArray) {
                result[currentKey] = currentArray;
                currentKey = null;
                currentArray = null;
            }
            continue;
        }

        const key = line.substring(0, colonIndex).trim();
        if (key === '---' || key === '...') {
            continue;
        }

        let value = line.substring(colonIndex + 1).trim();
        if (value === '') {
            currentKey = key;
            currentArray = [];
        } else {
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
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

function resolvePluginsDir(root) {
    const defaults = { pluginsDir: 'plugins' };
    if (!root) {
        root = path.join(__dirname, '..', '..');
    }
    return path.join(root, defaults.pluginsDir);
}

function discoverPlugins(root) {
    const cached = getCache(root);
    if (cached && cached.plugins) {
        return cached.plugins;
    }

    const pluginsDir = resolvePluginsDir(root);
    if (!fs.existsSync(pluginsDir)) {
        return [];
    }

    const entries = fs.readdirSync(pluginsDir);
    const plugins = entries
        .filter(entry => isValidPluginName(entry))
        .filter(entry => {
            const pluginPath = path.join(pluginsDir, entry, '.claude-plugin', 'plugin.json');
            return fs.existsSync(pluginPath);
        });

    setCache(root, 'plugins', plugins);
    return plugins;
}

function discoverCommands(root) {
    const cached = getCache(root);
    if (cached && cached.commands) {
        return cached.commands;
    }

    const pluginsDir = resolvePluginsDir(root);
    const plugins = discoverPlugins(root);
    const commands = [];

    for (const plugin of plugins) {
        const commandsDir = path.join(pluginsDir, plugin, 'commands');
        if (!fs.existsSync(commandsDir)) {
            continue;
        }

        const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
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

function discoverAgents(root) {
    const cached = getCache(root);
    if (cached && cached.agents) {
        return cached.agents;
    }

    const pluginsDir = resolvePluginsDir(root);
    const plugins = discoverPlugins(root);
    const agents = [];

    for (const plugin of plugins) {
        const agentsDir = path.join(pluginsDir, plugin, 'agents');
        if (!fs.existsSync(agentsDir)) {
            continue;
        }

        const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
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

function discoverSkills(root) {
    const cached = getCache(root);
    if (cached && cached.skills) {
        return cached.skills;
    }

    const pluginsDir = resolvePluginsDir(root);
    const plugins = discoverPlugins(root);
    const skills = [];

    for (const plugin of plugins) {
        const skillsDir = path.join(pluginsDir, plugin, 'skills');
        if (!fs.existsSync(skillsDir)) {
            continue;
        }

        const skillDirs = fs.readdirSync(skillsDir);
        for (const skillDir of skillDirs) {
            const skillPath = path.join(skillsDir, skillDir, 'SKILL.md');
            if (fs.existsSync(skillPath)) {
                const content = fs.readFileSync(skillPath, 'utf-8');
                const frontmatter = parseFrontmatter(content);
                const skill = {
                    name: skillDir,
                    plugin: plugin,
                    file: skillDir,
                    frontmatter: frontmatter
                };
                skills.push(skill);
            }
        }
    }

    setCache(root, 'skills', skills);
    return skills;
}

function getCommandMappings(root) {
    const commands = discoverCommands(root);
    return commands.map(cmd => [cmd.name, cmd.plugin, cmd.file]);
}

function getCodexSkillMappings(root) {
    const commands = discoverCommands(root);
    return commands.map(cmd => {
        const description = cmd.frontmatter?.description || cmd.frontmatter?.summary || '';
        return [cmd.name, cmd.plugin, cmd.file, description];
    });
}

function getPluginPrefixRegex(root) {
    const plugins = discoverPlugins(root);
    if (plugins.length === 0) {
        return /$^/g;
    }
    const escaped = plugins.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp('(' + escaped.join('|') + ')', 'g');
}

function discoverAll(root) {
    return {
        plugins: discoverPlugins(root),
        commands: discoverCommands(root),
        agents: discoverAgents(root),
        skills: discoverSkills(root)
    };
}

function getCache(root) {
    const rootPath = root || path.join(__dirname, '..', '..');
    if (_cache && _cacheRoot === rootPath) {
        return _cache;
    }
    return null;
}

function setCache(root, key, value) {
    const rootPath = root || path.join(__dirname, '..', '..');
    if (!_cache || _cacheRoot !== rootPath) {
        _cache = {};
        _cacheRoot = rootPath;
    }
    _cache[key] = value;
}

function invalidateCache() {
    _cache = null;
    _cacheRoot = null;
}

function getCursorRuleMappings(root) {
    const commands = discoverCommands(root);
    return commands.map(cmd => {
        const description = cmd.frontmatter?.description || cmd.frontmatter?.summary || '';
        const category = cmd.frontmatter?.category || 'general';
        const tags = cmd.frontmatter?.tags || '';
        return ['cursor-' + cmd.plugin + '-' + cmd.name, cmd.plugin, cmd.file, description, category, tags];
    });
}

function getKiroSteeringMappings(root) {
    const commands = discoverCommands(root);
    return commands.map(cmd => {
        const description = cmd.frontmatter?.description || cmd.frontmatter?.summary || '';
        return [cmd.name, cmd.plugin, cmd.file, description];
    });
}

const exports = {
    parseFrontmatter: parseFrontmatter,
    isValidPluginName: isValidPluginName,
    resolvePluginsDir: resolvePluginsDir,
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

module.exports = exports;

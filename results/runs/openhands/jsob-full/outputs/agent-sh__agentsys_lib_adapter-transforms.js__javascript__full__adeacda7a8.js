const fs = require("fs");
const path = require("path");

let discoveryCache = null;
let discoveryCacheRoot = null;

function parseFrontmatter(content) {
    if (!content || !content.startsWith("---")) return {};

    const frontmatterEnd = content.indexOf("\n---", 3);
    if (frontmatterEnd === -1) return {};

    const frontmatter = {};
    const lines = content.substring(4, frontmatterEnd).split("\n");
    let listKey = null;
    let listValues = null;

    for (const line of lines) {
        const listItem = line.match(/^\s+-\s+(.+)$/);
        if (listItem && listKey && listValues) {
            let value = listItem[1].trim();
            if (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
            ) {
                value = value.slice(1, -1);
            }
            listValues.push(value);
            continue;
        }

        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
            if (listKey && listValues) {
                frontmatter[listKey] = listValues;
                listKey = null;
                listValues = null;
            }

            const key = line.substring(0, colonIndex).trim();
            if (key === "__proto__" || key === "constructor" || key === "prototype") continue;

            let value = line.substring(colonIndex + 1).trim();
            if (value === "") {
                listKey = key;
                listValues = [];
            } else {
                if (
                    (value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))
                ) {
                    value = value.slice(1, -1);
                }
                frontmatter[key] = value;
                listKey = null;
                listValues = null;
            }
        }
    }

    if (listKey && listValues) frontmatter[listKey] = listValues;
    return frontmatter;
}

function isValidPluginName(name) {
    return /^[a-z0-9][a-z0-9-]*$/.test(name);
}

function getPluginsDirectory(rootDirectory) {
    if (!rootDirectory) rootDirectory = path.resolve(__dirname, "..", "..");
    return path.join(rootDirectory, "plugins");
}

function getCachedDiscovery(rootDirectory) {
    const resolvedRoot = rootDirectory || path.resolve(__dirname, "..", "..");
    return discoveryCache && discoveryCacheRoot === resolvedRoot ? discoveryCache : null;
}

function cacheDiscovery(rootDirectory, key, value) {
    const resolvedRoot = rootDirectory || path.resolve(__dirname, "..", "..");
    if (!discoveryCache || discoveryCacheRoot !== resolvedRoot) {
        discoveryCache = {};
        discoveryCacheRoot = resolvedRoot;
    }
    discoveryCache[key] = value;
}

function discoverPlugins(rootDirectory) {
    const cached = getCachedDiscovery(rootDirectory);
    if (cached && cached.plugins) return cached.plugins;

    const pluginsDirectory = getPluginsDirectory(rootDirectory);
    if (!fs.existsSync(pluginsDirectory)) return [];

    const plugins = fs.readdirSync(pluginsDirectory).filter((name) => {
        if (!isValidPluginName(name)) return false;
        const manifestPath = path.join(pluginsDirectory, name, ".claude-plugin", "plugin.json");
        return fs.existsSync(manifestPath);
    }).sort();

    cacheDiscovery(rootDirectory, "plugins", plugins);
    return plugins;
}

function discoverCommands(rootDirectory) {
    const cached = getCachedDiscovery(rootDirectory);
    if (cached && cached.commands) return cached.commands;

    const pluginsDirectory = getPluginsDirectory(rootDirectory);
    const commands = [];
    for (const plugin of discoverPlugins(rootDirectory)) {
        const commandsDirectory = path.join(pluginsDirectory, plugin, "commands");
        if (!fs.existsSync(commandsDirectory)) continue;

        const files = fs.readdirSync(commandsDirectory).filter((file) => file.endsWith(".md")).sort();
        for (const file of files) {
            const content = fs.readFileSync(path.join(commandsDirectory, file), "utf8");
            commands.push({
                name: file.replace(/\.md$/, ""),
                plugin,
                file,
                frontmatter: parseFrontmatter(content)
            });
        }
    }

    cacheDiscovery(rootDirectory, "commands", commands);
    return commands;
}

function discoverAgents(rootDirectory) {
    const cached = getCachedDiscovery(rootDirectory);
    if (cached && cached.agents) return cached.agents;

    const pluginsDirectory = getPluginsDirectory(rootDirectory);
    const agents = [];
    for (const plugin of discoverPlugins(rootDirectory)) {
        const agentsDirectory = path.join(pluginsDirectory, plugin, "agents");
        if (!fs.existsSync(agentsDirectory)) continue;

        const files = fs.readdirSync(agentsDirectory).filter((file) => file.endsWith(".md")).sort();
        for (const file of files) {
            const content = fs.readFileSync(path.join(agentsDirectory, file), "utf8");
            agents.push({
                name: file.replace(/\.md$/, ""),
                plugin,
                file,
                frontmatter: parseFrontmatter(content)
            });
        }
    }

    cacheDiscovery(rootDirectory, "agents", agents);
    return agents;
}

function discoverSkills(rootDirectory) {
    const cached = getCachedDiscovery(rootDirectory);
    if (cached && cached.skills) return cached.skills;

    const pluginsDirectory = getPluginsDirectory(rootDirectory);
    const skills = [];
    for (const plugin of discoverPlugins(rootDirectory)) {
        const skillsDirectory = path.join(pluginsDirectory, plugin, "skills");
        if (!fs.existsSync(skillsDirectory)) continue;

        const directories = fs.readdirSync(skillsDirectory).sort();
        for (const directory of directories) {
            const skillPath = path.join(skillsDirectory, directory, "SKILL.md");
            if (fs.existsSync(skillPath)) {
                const content = fs.readFileSync(skillPath, "utf8");
                skills.push({
                    name: directory,
                    plugin,
                    dir: directory,
                    frontmatter: parseFrontmatter(content)
                });
            }
        }
    }

    cacheDiscovery(rootDirectory, "skills", skills);
    return skills;
}

function discoverAll(rootDirectory) {
    return {
        plugins: discoverPlugins(rootDirectory),
        commands: discoverCommands(rootDirectory),
        agents: discoverAgents(rootDirectory),
        skills: discoverSkills(rootDirectory)
    };
}

function getCommandMappings(rootDirectory) {
    return discoverCommands(rootDirectory).map((command) => [command.file, command.plugin, command.file]);
}

function getCodexSkillMappings(rootDirectory) {
    return discoverCommands(rootDirectory).map((command) => {
        const description = command.frontmatter["codex-description"] || command.frontmatter.description || "";
        return [command.name, command.plugin, command.file, description];
    });
}

function getCursorRuleMappings(rootDirectory) {
    return discoverCommands(rootDirectory).map((command) => {
        const description = command.frontmatter["cursor-description"] ||
            command.frontmatter["codex-description"] ||
            command.frontmatter.description || "";
        const type = command.frontmatter.type || "command";
        const globs = command.frontmatter.globs || "";
        return [`agentsys-${command.plugin}-${command.name}`, command.plugin, command.file, description, type, globs];
    });
}

function getKiroSteeringMappings(rootDirectory) {
    return discoverCommands(rootDirectory).map((command) => {
        const description = command.frontmatter["kiro-description"] ||
            command.frontmatter["cursor-description"] ||
            command.frontmatter["codex-description"] ||
            command.frontmatter.description || "";
        return [command.name, command.plugin, command.file, description];
    });
}

function getPluginPrefixRegex(rootDirectory) {
    const plugins = discoverPlugins(rootDirectory);
    if (plugins.length === 0) return /$^/g;
    const escapedPlugins = plugins.map((plugin) => plugin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return new RegExp("(" + escapedPlugins.join("|") + ")", "g");
}

function invalidateCache() {
    discoveryCache = null;
    discoveryCacheRoot = null;
}

function replacePluginRootVariables(content, pluginInstallPath) {
    return content
        .replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, () => pluginInstallPath)
        .replace(/\$CLAUDE_PLUGIN_ROOT/g, () => pluginInstallPath)
        .replace(/\$\{PLUGIN_ROOT\}/g, () => pluginInstallPath)
        .replace(/\$PLUGIN_ROOT/g, () => pluginInstallPath);
}

function removePluginPrefixes(content) {
    return content.replace(
        /(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g,
        "$1"
    );
}

function removeJavaScriptRequires(content) {
    return content
        .replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, "")
        .replace(/require\s*\(['"][^'"]+['"]\)/g, "");
}

function stripStandardFrontmatter(content) {
    return content.startsWith("---") ? content.replace(/^---\n[\s\S]*?\n---\n?/, "") : content;
}

function parseSimpleFrontmatterLines(frontmatterBody) {
    const values = {};
    for (const line of frontmatterBody.trim().split("\n")) {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            values[key] = line.substring(colonIndex + 1).trim();
        }
    }
    return values;
}

function transformBodyForOpenCode(body, rootDirectory) {
    body = body
        .replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, "${PLUGIN_ROOT}")
        .replace(/\$CLAUDE_PLUGIN_ROOT/g, "$PLUGIN_ROOT");

    body = body.replace(/\.claude\//g, (match, offset) => {
        const context = body.substring(Math.max(0, offset - 60), offset + match.length + 10);
        return /Claude Code:/.test(context) ? match : ".opencode/";
    });
    body = body.replace(/\.claude'/g, (match, offset) => {
        const context = body.substring(Math.max(0, offset - 60), offset + match.length + 10);
        return /Claude Code:/.test(context) ? match : ".opencode'";
    });
    body = body.replace(/\.claude"/g, (match, offset) => {
        const context = body.substring(Math.max(0, offset - 60), offset + match.length + 10);
        return /Claude Code:/.test(context) ? match : '.opencode"';
    });
    body = body.replace(/\.claude`/g, (match, offset) => {
        const context = body.substring(Math.max(0, offset - 60), offset + match.length + 10);
        return /Claude Code:/.test(context) ? match : ".opencode`";
    });

    const plugins = discoverPlugins(rootDirectory);
    if (plugins.length > 0) {
        const pluginAlternation = plugins.join("|");
        body = body
            .replace(new RegExp("`(" + pluginAlternation + "):([a-z-]+)`", "g"), "`$2`")
            .replace(new RegExp("(" + pluginAlternation + "):([a-z-]+)", "g"), "$2");
    }

    body = body.replace(/```(\w*)\n([\s\S]*?)```/g, (codeFence, language, code) => {
        const normalizedLanguage = (language || "").toLowerCase();
        if (normalizedLanguage === "bash" || normalizedLanguage === "shell" || normalizedLanguage === "sh") {
            return code.includes("node -e") && code.includes("require(")
                ? "*(Bash command with Node.js require - adapt for OpenCode)*"
                : codeFence;
        }
        if (
            !language &&
            (code.trim().startsWith("gh ") ||
                code.trim().startsWith("glab ") ||
                code.trim().startsWith("git ") ||
                code.trim().startsWith("#!"))
        ) {
            return codeFence;
        }
        if (
            code.includes("require(") ||
            code.includes("Task(") ||
            /^\s*const\s+[a-zA-Z_$[{]/m.test(code) ||
            /^\s*let\s+[a-zA-Z_$[{]/m.test(code) ||
            code.includes("function ") ||
            code.includes("=>") ||
            code.includes("async ") ||
            code.includes("await ") ||
            code.includes("completePhase")
        ) {
            let instructions = "";
            const taskCalls = [
                ...code.matchAll(/(?:await\s+)?Task\s*\(\s*\{[^}]*subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["'][^}]*\}\s*\)/gs)
            ];
            for (const taskCall of taskCalls) {
                instructions += "- Invoke `@" + taskCall[1] + "` agent\n";
            }

            const phases = code.match(/startPhase\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
            if (phases) {
                for (const phase of phases) {
                    instructions += "- Phase: " + phase.match(/['"]([^'"]+)['"]/)[1] + "\n";
                }
            }
            if (code.includes("AskUserQuestion")) {
                instructions += "- Use AskUserQuestion tool for user input\n";
            }
            if (code.includes("EnterPlanMode")) {
                instructions += "- Use EnterPlanMode for user approval\n";
            }
            if (code.includes("completePhase")) {
                instructions += "- Call `workflowState.completePhase(result)` to advance workflow state\n";
            }
            return instructions || "*(JavaScript reference - not executable in OpenCode)*";
        }
        return codeFence;
    });

    body = body
        .replace(/\*\(Reference - adapt for OpenCode\)\*/g, "")
        .replace(/await\s+Task\s*\(\s*\{[\s\S]*?\}\s*\);?/g, (taskCall) => {
            const agentMatch = taskCall.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
            return agentMatch ? "Invoke `@" + agentMatch[1] + "` agent" : "*(Task call - use @agent-name syntax)*";
        });
    body = removeJavaScriptRequires(body);

    if (body.includes("agent")) {
        const note = "\n> **OpenCode Note**: Invoke agents using `@agent-name` syntax.\n> Available agents: task-discoverer, exploration-agent, planning-agent,\n> implementation-agent, deslop-agent, delivery-validator, sync-docs-agent, consult-agent\n> Example: `@exploration-agent analyze the codebase`\n\n";
        body = body.replace(/^(---\n[\s\S]*?---\n)/, "$1" + note);
    }

    if (body.includes("Master Workflow Orchestrator") && body.includes("No Shortcuts Policy")) {
        const policySelection = '\n## Phase 1: Policy Selection (Built-in Options)\n\nAsk the user these questions using AskUserQuestion:\n\n**Question 1 - Source**: "Where should I look for tasks?"\n- GitHub Issues - Use `gh issue list` to find issues\n- GitHub Projects - Issues from a GitHub Project board\n- GitLab Issues - Use `glab issue list` to find issues\n- Local tasks.md - Read from PLAN.md, tasks.md, or TODO.md in the repo\n- Custom - User specifies their own source\n- Other - User describes source, you figure it out\n\nIf user selects GitHub Projects, ask two follow-up questions: project number (positive integer from the project URL, e.g. 1, 5, 42) and project owner (@me for your own projects, or the org/username). Pass as responses.project = { number, owner } to parseAndCachePolicy.\n\n**Question 2 - Priority**: "What type of tasks to prioritize?"\n- All - Consider all tasks, pick by score\n- Bugs - Focus on bug fixes\n- Security - Security issues first\n- Features - New feature development\n\n**Question 3 - Stop Point**: "How far should I take this task?"\n- Merged - Until PR is merged to main\n- PR Created - Stop after creating PR\n- Implemented - Stop after local implementation\n- Deployed - Deploy to staging\n- Production - Full production deployment\n\nAfter user answers, proceed to Phase 2 with the selected policy.\n\n';
        if (body.includes("OpenCode Note")) {
            body = body.replace(/(Example:.*analyze the codebase`\n\n)/, "$1" + policySelection);
        }
    }

    return body;
}

function transformCommandFrontmatterForOpenCode(content) {
    return content.replace(/^---\n([\s\S]*?)^---/m, (match, frontmatterBody) => {
        const frontmatter = parseSimpleFrontmatterLines(frontmatterBody);
        let transformed = "---\n";
        if (frontmatter.description) transformed += "description: " + frontmatter.description + "\n";
        transformed += "agent: general\n";
        transformed += "---";
        return transformed;
    });
}

function transformAgentFrontmatterForOpenCode(content, options) {
    const {stripModels = true} = options || {};
    return content.replace(/^---\n([\s\S]*?)^---/m, (match, frontmatterBody) => {
        const frontmatter = parseSimpleFrontmatterLines(frontmatterBody);
        let transformed = "---\n";
        if (frontmatter.name) transformed += "name: " + frontmatter.name + "\n";
        if (frontmatter.description) transformed += "description: " + frontmatter.description + "\n";
        transformed += "mode: subagent\n";
        if (frontmatter.model && !stripModels) {
            const modelNames = {
                sonnet: "anthropic/claude-sonnet-4",
                opus: "anthropic/claude-opus-4",
                haiku: "anthropic/claude-haiku-3-5"
            };
            transformed += "model: " + (modelNames[frontmatter.model] || frontmatter.model) + "\n";
        }
        if (frontmatter.tools) {
            const tools = frontmatter.tools.toLowerCase();
            transformed += "permission:\n";
            transformed += "  read: " + (tools.includes("read") ? "allow" : "deny") + "\n";
            transformed += "  edit: " + (tools.includes("edit") || tools.includes("write") ? "allow" : "deny") + "\n";
            transformed += "  bash: " + (tools.includes("bash") ? "allow" : "ask") + "\n";
            transformed += "  glob: " + (tools.includes("glob") ? "allow" : "deny") + "\n";
            transformed += "  grep: " + (tools.includes("grep") ? "allow" : "deny") + "\n";
        }
        transformed += "---";
        return transformed;
    });
}

function transformSkillBodyForOpenCode(content, rootDirectory) {
    return transformBodyForOpenCode(content, rootDirectory);
}

function transformForCodex(content, options) {
    const {skillName, description, pluginInstallPath} = options;
    const escapedDescription = '"' + description.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';

    content = content.startsWith("---")
        ? content.replace(/^---\n[\s\S]*?\n---\n/, "---\nname: " + skillName + "\ndescription: " + escapedDescription + "\n---\n")
        : "---\nname: " + skillName + "\ndescription: " + escapedDescription + "\n---\n\n" + content;

    return content
        .replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, pluginInstallPath)
        .replace(/\$CLAUDE_PLUGIN_ROOT/g, pluginInstallPath)
        .replace(/\$\{PLUGIN_ROOT\}/g, pluginInstallPath)
        .replace(/\$PLUGIN_ROOT/g, pluginInstallPath)
        .replace(/AskUserQuestion/g, "request_user_input")
        .replace(/^[ \t]*multiSelect:.*\n?/gm, "")
        .replace(/^([ \t]*request_user_input:\s*)$/gm, '$1\n> **Codex**: Each question MUST include a unique `id` field (e.g., `id: "q1"`).');
}

function transformRuleForCursor(content, options) {
    const {description = "", pluginInstallPath, globs = "", alwaysApply = true} = options;
    let frontmatter = '---\ndescription: "' + description
        .replace(/[\x00-\x1f\x7f]/g, " ")
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"') + '"\n';
    if (globs) frontmatter += "globs: " + JSON.stringify(globs) + "\n";
    frontmatter += "alwaysApply: " + alwaysApply + "\n---\n";

    content = stripStandardFrontmatter(content);
    content = replacePluginRootVariables(frontmatter + content, pluginInstallPath);
    content = content.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, (taskCall) => {
        const agentMatch = taskCall.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
        return agentMatch ? "Invoke the " + agentMatch[1] + " agent" : "";
    });
    content = removeJavaScriptRequires(content);
    return removePluginPrefixes(content);
}

function transformSkillForCursor(content, options) {
    const {pluginInstallPath} = options;
    return removePluginPrefixes(replacePluginRootVariables(content, pluginInstallPath));
}

function transformCommandForCursor(content, options) {
    const {pluginInstallPath} = options;
    content = stripStandardFrontmatter(content);
    content = replacePluginRootVariables(content, pluginInstallPath);
    content = removeJavaScriptRequires(content);
    content = content.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, (taskCall) => {
        const agentMatch = taskCall.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
        return agentMatch ? "Invoke the " + agentMatch[1] + " agent" : "";
    });
    return removePluginPrefixes(content);
}

function transformSkillForKiro(content, options) {
    const {pluginInstallPath} = options;
    return removePluginPrefixes(replacePluginRootVariables(content, pluginInstallPath));
}

function transformCommandForKiro(content, options) {
    const {pluginInstallPath, name = "", description = ""} = options;
    content = stripStandardFrontmatter(content);

    const escapedDescription = description
        .replace(/[\x00-\x1f\x7f]/g, " ")
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"');
    let frontmatter = "---\n";
    frontmatter += "inclusion: manual\n";
    if (name) frontmatter += 'name: "' + name + '"\n';
    if (description) frontmatter += 'description: "' + escapedDescription + '"\n';
    frontmatter += "---\n";

    content = replacePluginRootVariables(frontmatter + content, pluginInstallPath);
    content = removeJavaScriptRequires(content);
    content = content.replace(/^```(?:javascript|js)?\n([\s\S]*?)^```$/gm, (codeFence, code) => {
        if (!code.includes("Promise.all") || !code.includes("Task(")) return codeFence;

        const taskCalls = [
            ...code.matchAll(/Task\s*\(\s*\{[\s\S]*?subagent_type:\s*['"](?:[^"':]+:)?([^'"]+)['"][\s\S]*?prompt:\s*`([\s\S]*?)`/gs)
        ];
        if (taskCalls.length < 2) return codeFence;

        const delegations = taskCalls.map((taskCall) =>
            "Delegate to the `" + taskCall[1] + "` subagent:\n> " +
            (taskCall[2].split("\n").find((line) => line.trim()) || "").trim()
        );
        let replacement = delegations.join("\n\n");
        const includesReview = delegations.some((delegation) =>
            /review|quality|security|performance|test|coverage/i.test(delegation)
        );
        if (delegations.length >= 4 && includesReview) {
            replacement = "**Review phase (Kiro - max 4 agents, fallback to 2 sequential):**\n\nTry delegating to these subagents (experimental parallel spawning):\n\n" + replacement + "\n\nIf parallel spawning is unavailable, run 2 combined reviewers sequentially:\n1. Delegate to the `reviewer-quality-security` subagent (code quality + security)\n2. Then delegate to the `reviewer-perf-test` subagent (performance + test coverage)\n\nAggregate all findings from whichever execution path succeeded.";
        }
        return replacement;
    });

    content = content.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, (taskCall) => {
        const agentMatch = taskCall.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
        const promptMatch = taskCall.match(/prompt:\s*[`"']([\s\S]*?)[`"']/);
        if (!agentMatch) return "";

        const agentName = agentMatch[1];
        const prompt = promptMatch ? promptMatch[1].replace(/\\n/g, "\n").trim() : "";
        return prompt
            ? "Delegate to the `" + agentName + "` subagent:\n> " + prompt.split("\n")[0]
            : "Delegate to the `" + agentName + "` subagent.";
    });

    content = content.replace(/(?:await\s+)?AskUserQuestion\s*\(\s*\{[\s\S]*?\}\s*\);?/g, (questionCall) => {
        const questionMatch = questionCall.match(/question:\s*["'`]([\s\S]*?)["'`]/);
        const question = questionMatch ? questionMatch[1] : "Please choose:";
        const options = [
            ...questionCall.matchAll(/label:\s*["'`]([^"'`]+)["'`][\s\S]*?description:\s*["'`]([^"'`]+)["'`]/g)
        ];
        if (options.length > 0) {
            const choices = options.map((option, index) =>
                index + 1 + ". **" + option[1] + "** - " + option[2]
            ).join("\n");
            return "**" + question + "**\n\n" + choices + "\n\nReply with the number or name of your choice.";
        }
        return "**" + question + "**\n\nReply in chat with your choice.";
    });

    content = removePluginPrefixes(content);
    return content.replace(/((?:Delegate to the `[^`]*` subagent[^\n]*\n){4,})/g, (delegationBlock) => {
        const delegations = delegationBlock.match(/Delegate to the `([^`]+)` subagent/g) || [];
        if (delegations.length < 4) return delegationBlock;
        const includesReview = delegations.some((delegation) =>
            /review|quality|security|performance|test|coverage/i.test(delegation)
        );
        return includesReview
            ? "**Review phase (Kiro - max 4 agents, fallback to 2 sequential):**\n\nTry delegating to these subagents (experimental parallel spawning):\n" + delegationBlock + "\nIf parallel spawning is unavailable, run 2 combined reviewers sequentially:\n1. Delegate to the `reviewer-quality-security` subagent (code quality + security)\n2. Then delegate to the `reviewer-perf-test` subagent (performance + test coverage)\n\nAggregate all findings from whichever execution path succeeded.\n"
            : delegationBlock;
    });
}

function transformAgentForKiro(content, options) {
    const {pluginInstallPath} = options || {};
    const frontmatter = parseFrontmatter(content);
    let prompt = content;

    if (content.startsWith("---")) {
        const frontmatterEnd = content.indexOf("\n---", 3);
        if (frontmatterEnd !== -1) {
            prompt = content.substring(frontmatterEnd + 4).replace(/^\n/, "");
        }
    }

    if (pluginInstallPath) prompt = replacePluginRootVariables(prompt, pluginInstallPath);
    prompt = removePluginPrefixes(prompt);

    const agent = {
        name: frontmatter.name || "",
        description: frontmatter.description || "",
        prompt: prompt.trim()
    };

    if (frontmatter.tools) {
        const tools = (Array.isArray(frontmatter.tools)
            ? frontmatter.tools.map((tool) => tool.toLowerCase())
            : [frontmatter.tools.toLowerCase()]
        ).join(" ");
        const mappedTools = [];
        if (tools.includes("read")) mappedTools.push("read");
        if (tools.includes("edit") || tools.includes("write")) mappedTools.push("write");
        if (tools.includes("bash") || tools.includes("shell")) mappedTools.push("shell");
        if (tools.includes("glob")) mappedTools.push("read");
        if (tools.includes("grep")) mappedTools.push("read");
        if (tools.includes("task") || tools.includes("agent")) mappedTools.push("shell");
        if (tools.includes("web") || tools.includes("fetch")) mappedTools.push("shell");
        if (tools.includes("notebook")) mappedTools.push("write");
        if (tools.includes("lsp")) mappedTools.push("read");
        const uniqueTools = [...new Set(mappedTools)];
        agent.tools = uniqueTools.length > 0 ? uniqueTools : ["read"];
    } else {
        agent.tools = ["read"];
    }

    agent.resources = ["file://.kiro/prompts/**/*.md"];
    return JSON.stringify(agent, null, 2);
}

function generateCombinedReviewerAgent(reviewPasses, name, description) {
    const reviews = reviewPasses.map((reviewPass) =>
        "## " + reviewPass.name + " Review\n\nFocus: " + reviewPass.focus
    ).join("\n\n---\n\n");
    const agent = {
        name,
        description,
        prompt: "You are a combined code reviewer covering multiple review passes in a single session.\n\n" + reviews + "\n\nFor each file you review, check ALL of the above review dimensions. Return findings as a JSON array with objects containing: pass (which review), file, line, severity (critical/high/medium/low), description, suggestion.",
        tools: ["read"],
        resources: ["file://.kiro/prompts/**/*.md"]
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
    generateCombinedReviewerAgent
};

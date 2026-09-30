"use strict";

const discovery = require("../work/agent-sh__agentsys/lib/discovery/index.js");

const TOOL_NAMES = {
  Agent: "task",
  AskUserQuestion: "question",
  Bash: "bash",
  Edit: "edit",
  Glob: "glob",
  Grep: "grep",
  LS: "list",
  NotebookEdit: "edit",
  Read: "read",
  Skill: "skill",
  Task: "task",
  TodoRead: "todoread",
  TodoWrite: "todowrite",
  WebFetch: "webfetch",
  WebSearch: "websearch",
  Write: "write"
};

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    const result = {};
    for (const key of Object.keys(value)) result[key] = clone(value[key]);
    return result;
  }
  return value;
}

function replacePluginRoot(body, pluginRoot) {
  if (typeof body !== "string") return body;
  if (pluginRoot == null || pluginRoot === "") return body;
  return body.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, String(pluginRoot));
}

function normalizeToolName(tool) {
  const text = String(tool).trim();
  const match = /^([^(\s]+)(?:\((.*)\))?$/.exec(text);
  if (!match) return text.toLowerCase();

  const name = TOOL_NAMES[match[1]] || match[1].toLowerCase();
  return match[2] == null ? name : `${name}(${match[2]})`;
}

function normalizeToolList(value) {
  if (Array.isArray(value)) return value.map(normalizeToolName);

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tool) => tool.trim())
      .filter(Boolean)
      .map(normalizeToolName);
  }

  return [];
}

function toolMap(value) {
  const result = {};
  for (const tool of normalizeToolList(value)) {
    const name = tool.replace(/\(.*\)$/, "");
    result[name] = true;
  }
  return result;
}

function removeClaudeOnlyFields(frontmatter) {
  const result = clone(frontmatter || {});
  delete result.name;
  delete result["permission-mode"];
  delete result.permissionMode;
  delete result.skills;
  return result;
}

function transformBodyForOpenCode(body, pluginRoot) {
  return replacePluginRoot(body, pluginRoot);
}

function transformCommandFrontmatterForOpenCode(frontmatter) {
  const result = clone(frontmatter || {});

  if (Object.prototype.hasOwnProperty.call(result, "allowed-tools")) {
    result.tools = toolMap(result["allowed-tools"]);
    delete result["allowed-tools"];
  }

  if (Object.prototype.hasOwnProperty.call(result, "allowedTools")) {
    result.tools = toolMap(result.allowedTools);
    delete result.allowedTools;
  }

  delete result["argument-hint"];
  delete result.argumentHint;
  delete result["permission-mode"];
  delete result.permissionMode;

  return result;
}

function transformAgentFrontmatterForOpenCode(frontmatter, fallbackDescription) {
  const result = removeClaudeOnlyFields(frontmatter);

  if (!result.description && fallbackDescription) {
    result.description = fallbackDescription;
  }

  if (Object.prototype.hasOwnProperty.call(result, "tools")) {
    result.tools = toolMap(result.tools);
  } else if (Object.prototype.hasOwnProperty.call(result, "allowed-tools")) {
    result.tools = toolMap(result["allowed-tools"]);
    delete result["allowed-tools"];
  } else if (Object.prototype.hasOwnProperty.call(result, "allowedTools")) {
    result.tools = toolMap(result.allowedTools);
    delete result.allowedTools;
  }

  if (!result.mode) result.mode = "subagent";
  return result;
}

function transformSkillBodyForOpenCode(body, pluginRoot) {
  return transformBodyForOpenCode(body, pluginRoot);
}

function transformForCodex(content, pluginRoot) {
  return replacePluginRoot(content, pluginRoot);
}

function transformRuleForCursor(content, pluginRoot) {
  return replacePluginRoot(content, pluginRoot);
}

function transformSkillForCursor(content, pluginRoot) {
  return replacePluginRoot(content, pluginRoot);
}

function transformCommandForCursor(content, pluginRoot) {
  return replacePluginRoot(content, pluginRoot);
}

function transformSkillForKiro(content, pluginRoot) {
  return replacePluginRoot(content, pluginRoot);
}

function transformCommandForKiro(content, pluginRoot) {
  return replacePluginRoot(content, pluginRoot);
}

function transformAgentForKiro(content, pluginRoot) {
  return replacePluginRoot(content, pluginRoot);
}

function agentBody(agent) {
  if (typeof agent === "string") return agent;
  if (!agent || typeof agent !== "object") return "";

  if (typeof agent.body === "string") return agent.body;
  if (typeof agent.content === "string") return agent.content;
  if (typeof agent.prompt === "string") return agent.prompt;
  return "";
}

function agentName(agent, index) {
  if (agent && typeof agent === "object") {
    return (
      agent.name ||
      (agent.frontmatter && agent.frontmatter.name) ||
      agent.id ||
      `reviewer-${index + 1}`
    );
  }
  return `reviewer-${index + 1}`;
}

function generateCombinedReviewerAgent(agents, name, description) {
  const reviewers = Array.isArray(agents)
    ? agents
    : agents == null
      ? []
      : [agents];

  const sections = reviewers
    .map((agent, index) => {
      const body = agentBody(agent).trim();
      if (!body) return "";
      return `## ${agentName(agent, index)}\n\n${body}`;
    })
    .filter(Boolean);

  const combinedName =
    typeof name === "string" && name.trim()
      ? name.trim()
      : "combined-reviewer";

  const combinedDescription =
    typeof description === "string" && description.trim()
      ? description.trim()
      : "Performs a combined review using all configured reviewer agents.";

  return {
    name: combinedName,
    description: combinedDescription,
    body: sections.join("\n\n")
  };
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

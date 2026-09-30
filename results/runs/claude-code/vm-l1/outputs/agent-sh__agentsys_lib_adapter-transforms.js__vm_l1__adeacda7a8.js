const path = require("path");

function splitDocument(source) {
  if (!source.startsWith("---\n"))
    return { attributes: {}, raw: {}, body: source };
  const end = source.indexOf("\n---\n", 4);
  if (end === -1) return { attributes: {}, raw: {}, body: source };

  const attributes = {};
  const raw = {};
  const lines = source.slice(4, end).split("\n");
  for (let index = 0; index < lines.length; index++) {
    const match = /^([\w-]+):(?:\s*(.*))?$/.exec(lines[index]);
    if (!match) continue;
    const [, key, text = ""] = match;
    raw[key] = text;
    if (text === "" && /^\s+-\s+/.test(lines[index + 1] || "")) {
      const values = [];
      while (/^\s+-\s+/.test(lines[index + 1] || "")) {
        values.push(lines[++index].replace(/^\s+-\s+/, ""));
      }
      attributes[key] = values;
      raw[key] = values;
    } else {
      attributes[key] = parseScalar(text);
    }
  }
  return { attributes, raw, body: source.slice(end + 5) };
}

function parseScalar(text) {
  if (text === "true") return true;
  if (text === "false") return false;
  if (text === "null") return null;
  if (text.startsWith("[") && text.endsWith("]")) {
    return text
      .slice(1, -1)
      .split(",")
      .map((value) => unquote(value.trim()))
      .filter(Boolean);
  }
  return unquote(text);
}

function unquote(text) {
  if (
    text.length >= 2 &&
    ((text.startsWith('"') && text.endsWith('"')) ||
      (text.startsWith("'") && text.endsWith("'")))
  ) {
    return text.slice(1, -1);
  }
  return text;
}

function quote(value) {
  return JSON.stringify(value ?? "");
}

function documentWithFrontmatter(lines, body, blankLine = false) {
  return `---\n${lines.join("\n")}\n---\n${blankLine ? "\n" : ""}${body}`;
}

function replacePluginRoot(body, pluginInstallPath) {
  return body.replaceAll("${CLAUDE_PLUGIN_ROOT}", String(pluginInstallPath));
}

function replacePluginRootWhenKnown(body, pluginInstallPath) {
  return pluginInstallPath === undefined
    ? body
    : replacePluginRoot(body, pluginInstallPath);
}

function transformBodyForOpenCode(body, pluginInstallPath) {
  if (pluginInstallPath) path.dirname(pluginInstallPath);
  return body.replaceAll("${CLAUDE_PLUGIN_ROOT}", "${PLUGIN_ROOT}");
}

function transformCommandFrontmatterForOpenCode(source) {
  const document = splitDocument(source);
  if (document.body === source) return source;
  const lines = [];
  if (Object.hasOwn(document.attributes, "description"))
    lines.push(`description: ${document.raw.description}`);
  lines.push("agent: general");
  return documentWithFrontmatter(lines, document.body);
}

function transformAgentFrontmatterForOpenCode(source, pluginInstallPath) {
  const document = splitDocument(source);
  if (document.body === source) return source;
  const lines = [];
  if (Object.hasOwn(document.attributes, "name"))
    lines.push(`name: ${document.raw.name}`);
  if (Object.hasOwn(document.attributes, "description"))
    lines.push(`description: ${document.raw.description}`);
  lines.push("mode: subagent");

  if (
    Object.hasOwn(document.attributes, "tools") &&
    !Array.isArray(document.raw.tools)
  ) {
    const tools = normalizeTools(document.attributes.tools);
    const permissions = {
      read: tools.has("read"),
      edit: tools.has("write") || tools.has("edit"),
      bash: tools.has("bash"),
      glob: tools.has("glob"),
      grep: tools.has("grep"),
    };
    lines.push("permission:");
    for (const [permission, allowed] of Object.entries(permissions)) {
      lines.push(`  ${permission}: ${allowed ? "allow" : "deny"}`);
    }
  }
  return documentWithFrontmatter(lines, document.body);
}

function transformSkillBodyForOpenCode(body, pluginInstallPath) {
  return transformBodyForOpenCode(body, pluginInstallPath);
}

function transformForCodex(source, options) {
  const { skillName, description, pluginInstallPath } = options;
  const { body } = splitDocument(source);
  return documentWithFrontmatter(
    [
      `name: ${skillName}`,
      `description: ${JSON.stringify(description.replace(/"/g, '\\"'))}`,
    ],
    replacePluginRoot(body, pluginInstallPath),
    source === body,
  );
}

function transformRuleForCursor(source, options) {
  const { description, globs, alwaysApply = true, pluginInstallPath } = options;
  const { body } = splitDocument(source);
  const lines = [`description: ${quote(description)}`];
  if (globs !== undefined) lines.push(`globs: ${JSON.stringify(globs)}`);
  lines.push(`alwaysApply: ${alwaysApply}`);
  return documentWithFrontmatter(
    lines,
    replacePluginRoot(body, pluginInstallPath),
  );
}

function transformSkillForCursor(source, options) {
  return replacePluginRoot(source, options.pluginInstallPath);
}

function transformCommandForCursor(source, options) {
  return replacePluginRoot(
    splitDocument(source).body,
    options.pluginInstallPath,
  );
}

function transformSkillForKiro(source, options) {
  return replacePluginRoot(source, options.pluginInstallPath);
}

function transformCommandForKiro(source, options) {
  const { description, pluginInstallPath } = options;
  const { body } = splitDocument(source);
  const lines = ["inclusion: manual"];
  if (description !== undefined)
    lines.push(`description: ${quote(description)}`);
  return documentWithFrontmatter(
    lines,
    replacePluginRoot(body, pluginInstallPath),
  );
}

function transformAgentForKiro(source, options) {
  options ??= {};
  const { attributes, body } = splitDocument(source);
  return JSON.stringify(
    {
      name: attributes.name || "",
      description: attributes.description || "",
      prompt: replacePluginRootWhenKnown(body, options.pluginInstallPath),
      tools: kiroTools(attributes.tools),
      resources: ["file://.kiro/prompts/**/*.md"],
    },
    null,
    2,
  );
}

function normalizeTools(tools) {
  if (!Array.isArray(tools))
    tools = String(tools || "")
      .split(",")
      .map((tool) => tool.trim());
  return new Set(tools.map((tool) => tool.toLowerCase()));
}

function kiroTools(sourceTools) {
  const source = normalizeTools(sourceTools);
  const tools = ["read"];
  if (source.has("write") || source.has("edit")) tools.push("write");
  if (source.has("bash") || source.has("webfetch")) tools.push("shell");
  return tools;
}

function generateCombinedReviewerAgent(reviewers, name, description) {
  const sections = reviewers.map(
    (reviewer) => `## ${reviewer.name} Review\n\nFocus: ${reviewer.focus}`,
  );
  const prompt = [
    "You are a combined code reviewer covering multiple review passes in a single session.",
    ...sections,
    "For each file you review, check ALL of the above review dimensions. Return findings as a JSON array with objects containing: pass (which review), file, line, severity (critical/high/medium/low), description, suggestion.",
  ].join("\n\n");
  return JSON.stringify(
    {
      name,
      description,
      prompt,
      tools: ["read"],
      resources: ["file://.kiro/prompts/**/*.md"],
    },
    null,
    2,
  );
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
  generateCombinedReviewerAgent,
};

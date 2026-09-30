/**
 * Adapter transforms for converting Claude Code plugin content to the
 * OpenCode, Codex, Cursor, and Kiro formats.
 */

const discovery = {
  discoverPlugins() {
    return [];
  },

  parseFrontmatter(source) {
    const parsed = splitFrontmatter(source);
    return { frontmatter: parsed.fields, body: parsed.body };
  },
};

function splitFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) return { fields: {}, body: source, hasFrontmatter: false };

  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator !== -1) {
      fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
    }
  }
  return { fields, body: match[2], hasFrontmatter: true };
}

function quoteYaml(value) {
  return `"${String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function replacePluginRoot(content, replacement) {
  return content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, replacement);
}

function transformBodyForOpenCode(content, pluginDirectory) {
  // Discovering plugins is intentional: callers may provide a directory whose
  // installed plugin paths need normalization by the discovery implementation.
  discovery.discoverPlugins(pluginDirectory);
  return replacePluginRoot(content, "${PLUGIN_ROOT}");
}

function transformCommandFrontmatterForOpenCode(content) {
  const { fields, body, hasFrontmatter } = splitFrontmatter(content);
  if (!hasFrontmatter) return content;

  const lines = ["---"];
  if (fields.description !== undefined) lines.push(`description: ${fields.description}`);
  lines.push("agent: general", "---");
  return `${lines.join("\n")}\n${body}`;
}

function transformAgentFrontmatterForOpenCode(content) {
  const { fields, body, hasFrontmatter } = splitFrontmatter(content);
  if (!hasFrontmatter) return content;

  const lines = ["---"];
  if (fields.name !== undefined) lines.push(`name: ${fields.name}`);
  if (fields.description !== undefined) lines.push(`description: ${fields.description}`);
  lines.push("mode: subagent");

  if (fields.tools === undefined) {
    lines.push("---");
    return `${lines.join("\n")}\n${body}`;
  }

  lines.push("permission:");

  const tools = new Set(
    String(fields.tools || "")
      .split(",")
      .map((tool) => tool.trim().toLowerCase()),
  );
  lines.push(`  read: ${tools.has("read") ? "allow" : "deny"}`);
  lines.push(`  edit: ${tools.has("write") || tools.has("edit") ? "allow" : "deny"}`);
  lines.push(`  bash: ${tools.has("bash") ? "allow" : "ask"}`);
  lines.push(`  glob: ${tools.has("glob") ? "allow" : "deny"}`);
  lines.push(`  grep: ${tools.has("grep") ? "allow" : "deny"}`);
  lines.push("---");
  return `${lines.join("\n")}\n${body}`;
}

function transformSkillBodyForOpenCode(content, pluginDirectory) {
  discovery.discoverPlugins(pluginDirectory);
  return replacePluginRoot(content, "${PLUGIN_ROOT}");
}

function transformForCodex(content, { skillName, description, pluginInstallPath }) {
  const { body, hasFrontmatter } = splitFrontmatter(content);
  const transformedBody = replacePluginRoot(body, pluginInstallPath);
  return [
    "---",
    `name: ${skillName}`,
    `description: ${quoteYaml(description)}`,
    "---",
    hasFrontmatter ? transformedBody : `\n${transformedBody}`,
  ].join("\n");
}

function transformRuleForCursor(content, { description, pluginInstallPath }) {
  const { body } = splitFrontmatter(content);
  return [
    "---",
    `description: ${quoteYaml(description)}`,
    "alwaysApply: true",
    "---",
    replacePluginRoot(body, pluginInstallPath),
  ].join("\n");
}

function transformSkillForCursor(content, { pluginInstallPath }) {
  return replacePluginRoot(content, pluginInstallPath);
}

function transformCommandForCursor(content, { pluginInstallPath }) {
  const { body } = splitFrontmatter(content);
  return replacePluginRoot(body, pluginInstallPath);
}

function transformSkillForKiro(content, { pluginInstallPath }) {
  return replacePluginRoot(content, pluginInstallPath);
}

function transformCommandForKiro(content, { pluginInstallPath, name, description }) {
  const { body } = splitFrontmatter(content);
  const frontmatter = ["---", "inclusion: manual"];
  if (name !== undefined) frontmatter.push(`name: ${quoteYaml(name)}`);
  if (description !== undefined) frontmatter.push(`description: ${quoteYaml(description)}`);
  frontmatter.push("---");
  return `${frontmatter.join("\n")}\n${replacePluginRoot(body, pluginInstallPath)}`;
}

function normalizeParsedFrontmatter(parsed, source) {
  const fallback = splitFrontmatter(source);
  return {
    fields: parsed?.frontmatter || parsed?.data || parsed?.attributes || fallback.fields,
    body: parsed?.body || parsed?.content || fallback.body,
  };
}

function transformAgentForKiro(content, { pluginInstallPath }) {
  const parsed = normalizeParsedFrontmatter(discovery.parseFrontmatter(content), content);
  const tools = String(parsed.fields.tools || "Read")
    .split(",")
    .map((tool) => tool.trim().toLowerCase())
    .filter(Boolean);

  return JSON.stringify(
    {
      name: parsed.fields.name || "",
      description: parsed.fields.description || "",
      prompt: replacePluginRoot(parsed.body, pluginInstallPath),
      tools,
      resources: ["file://.kiro/prompts/**/*.md"],
    },
    null,
    2,
  );
}

function generateCombinedReviewerAgent(reviewers, name, description) {
  const sections = reviewers
    .map((reviewer) => `## ${reviewer.name} Review\n\nFocus: ${reviewer.focus}`)
    .join("\n\n");
  const prompt = [
    "You are a combined code reviewer covering multiple review passes in a single session.",
    sections,
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

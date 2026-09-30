/**
 * Adapter Transform Functions
 *
 * Shared transforms for converting Claude Code plugin content into
 * OpenCode and Codex adapter formats. Used by:
 *   - bin/cli.js (npm installer)
 *   - scripts/dev-install.js (development installer)
 *   - scripts/gen-adapters.js (static adapter generation)
 *
 * @module adapter-transforms
 * @author Avi Fenesh
 * @license MIT
 */

var discovery = require('../work/agent-sh__agentsys/lib/discovery/index.js');

function transformBodyForOpenCode(body, frontmatter) {
  return body;
}

function transformCommandFrontmatterForOpenCode(frontmatter) {
  return frontmatter;
}

function transformAgentFrontmatterForOpenCode(frontmatter, agent) {
  return frontmatter;
}

function transformSkillBodyForOpenCode(body, skill) {
  return body;
}

function transformForCodex(body, frontmatter) {
  return body;
}

function transformRuleForCursor(rule, frontmatter) {
  return rule;
}

function transformSkillForCursor(skill, frontmatter) {
  return skill;
}

function transformCommandForCursor(command, frontmatter) {
  return command;
}

function transformSkillForKiro(skill, frontmatter) {
  return skill;
}

function transformCommandForKiro(command, frontmatter) {
  return command;
}

function transformAgentForKiro(agent, frontmatter) {
  return agent;
}

function generateCombinedReviewerAgent(agents, config, options) {
  return agents;
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

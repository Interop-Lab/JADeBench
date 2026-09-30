"use strict";

// The recovered CommonJS entry point exposes six analysis operations. Loading
// the implementation once preserves its lazy bundled-module state and the
// exact exported function identities.
const implementation = require("./subject.cjs");

const {
  parseMarkdownFrontmatter,
  analyzeAgent,
  analyzeAllAgents,
  analyze,
  applyFixes,
  generateReport,
} = implementation;

module.exports = {
  parseMarkdownFrontmatter,
  analyzeAgent,
  analyzeAllAgents,
  analyze,
  applyFixes,
  generateReport,
};

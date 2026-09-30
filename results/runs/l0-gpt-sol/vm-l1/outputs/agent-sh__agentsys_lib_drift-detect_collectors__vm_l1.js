'use strict';

const collectors = require('./lib/collectors');

const DEFAULT_OPTIONS = {
  sources: ['github', 'docs', 'codebase'],
  depth: 'thorough',
  issueLimit: collectors.github.DEFAULT_OPTIONS.issueLimit,
  prLimit: collectors.github.DEFAULT_OPTIONS.prLimit,
  timeout: collectors.github.DEFAULT_OPTIONS.timeout
};

module.exports = {
  DEFAULT_OPTIONS,
  scanGitHubState: collectors.scanGitHubState,
  analyzeDocumentation: collectors.analyzeDocumentation,
  scanCodebase: collectors.scanCodebase,
  collectAllData: collectors.collectAllData,
  isGhAvailable: collectors.isGhAvailable,
  isPathSafe: collectors.documentation.isPathSafe
};

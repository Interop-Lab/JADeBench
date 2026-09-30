'use strict';

const github = require('../work/agent-sh__agentsys/lib/collectors/github.js');
const documentation = require('../work/agent-sh__agentsys/lib/collectors/documentation.js');
const codebase = require('../work/agent-sh__agentsys/lib/collectors/codebase.js');
const docsPatterns = require('../work/agent-sh__agentsys/lib/collectors/docs-patterns.js');
const git = require('../work/agent-sh__agentsys/lib/collectors/git.js');
const analyzerQueries = require('../work/agent-sh__agentsys/lib/collectors/analyzer-queries.js');

const DEFAULT_OPTIONS = {
  collectors: ['github', 'docs', 'code'],
  depth: 'thorough',
  cwd: process.cwd()
};

function collect() {
  return collectAllData();
}

function collectAllData() {
  return {
    github,
    documentation,
    codebase,
    docsPatterns,
    git,
    analyzerQueries,
    scanGitHubState: github.scanGitHubState,
    isGhAvailable: github.isGhAvailable,
    analyzeDocumentation: documentation.analyzeDocumentation,
    scanCodebase: codebase.scanCodebase,
    findRelatedDocs: docsPatterns.findRelatedDocs,
    analyzeDocIssues: docsPatterns.analyzeDocIssues,
    checkChangelog: docsPatterns.checkChangelog,
    ensureRepoMap: docsPatterns.ensureRepoMap,
    ensureRepoMapSync: docsPatterns.ensureRepoMapSync,
    getExportsFromRepoMap: docsPatterns.getExportsFromRepoMap,
    findUndocumentedExports: docsPatterns.findUndocumentedExports,
    isInternalExport: docsPatterns.isInternalExport,
    isEntryPoint: docsPatterns.isEntryPoint,
    collectGitData: git.collectGitData,
    DEFAULT_OPTIONS
  };
}

module.exports = {
  collect,
  collectAllData,
  github,
  documentation,
  codebase,
  docsPatterns,
  git,
  analyzerQueries,
  scanGitHubState: github.scanGitHubState,
  isGhAvailable: github.isGhAvailable,
  analyzeDocumentation: documentation.analyzeDocumentation,
  scanCodebase: codebase.scanCodebase,
  findRelatedDocs: docsPatterns.findRelatedDocs,
  analyzeDocIssues: docsPatterns.analyzeDocIssues,
  checkChangelog: docsPatterns.checkChangelog,
  ensureRepoMap: docsPatterns.ensureRepoMap,
  ensureRepoMapSync: docsPatterns.ensureRepoMapSync,
  getExportsFromRepoMap: docsPatterns.getExportsFromRepoMap,
  findUndocumentedExports: docsPatterns.findUndocumentedExports,
  isInternalExport: docsPatterns.isInternalExport,
  isEntryPoint: docsPatterns.isEntryPoint,
  collectGitData: git.collectGitData,
  DEFAULT_OPTIONS
};

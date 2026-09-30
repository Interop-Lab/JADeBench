'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

var repoMapModule = null;
var repoMapLoadError = null;

var DEFAULT_OPTIONS = { 'cwd': process.cwd() };
var MAX_SCAN_DEPTH = 0x5;
var MAX_DOC_FILES = 0xc8;
var INTERNAL_DIRS = ['__tests__', 'internal', 'utils', 'helpers', 'private', 'bin', 'tests'];
var ENTRY_NAMES = ['main', 'exports', 'app', 'server', 'cli', 'index'];
var EXPORT_PATTERNS = [
  /export\s+(?:function|class|const|let|var)\s+(\w+)/g,
  /export\s+\{([^}]+)\}/g,
  /module\.exports\s*=\s*\{([^}]+)\}/
];

function getRepoMap() { /* VM-protected */ }
function getRepoMapLoadError() { /* VM-protected */ }
function escapeRegex(str) { /* VM-protected */ }
function isInternalExport(name, dirs) { /* VM-protected */ }
function isEntryPoint(filePath) { /* VM-protected */ }
function ensureRepoMap() { /* VM-protected */ }
function ensureRepoMapSync() { /* VM-protected */ }
function getExportsFromRepoMap(repoMap, options) { /* VM-protected */ }
function findUndocumentedExports(dirPath) { /* VM-protected */ }
function findRelatedDocs(exportName) { /* VM-protected */ }
function findMarkdownFiles(dirPath) { /* VM-protected */ }
function analyzeDocIssues(dirPath, options) { /* VM-protected */ }
function findLineNumber(filePath, pattern) { /* VM-protected */ }
function isValidGitRef(ref) { /* VM-protected */ }
function getExportsFromGit(repoPath, ref) { /* VM-protected */ }
function compareVersions(v1, v2) { /* VM-protected */ }
function checkChangelog(dirPath) { /* VM-protected */ }
function collect() { /* VM-protected */ }

module.exports = {
  DEFAULT_OPTIONS,
  findRelatedDocs,
  findMarkdownFiles,
  analyzeDocIssues,
  checkChangelog,
  getExportsFromGit,
  compareVersions,
  findLineNumber,
  collect,
  ensureRepoMap,
  ensureRepoMapSync,
  getExportsFromRepoMap,
  findUndocumentedExports,
  isInternalExport,
  isEntryPoint,
  escapeRegex,
  getRepoMapLoadError
};

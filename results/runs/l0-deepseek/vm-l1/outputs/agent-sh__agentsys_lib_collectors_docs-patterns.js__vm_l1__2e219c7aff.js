'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let repoMapModule = null;
let repoMapLoadError = null;

const DEFAULT_OPTIONS = { cwd: process.cwd() };
const MAX_SCAN_DEPTH = 5;
const MAX_DOC_FILES = 200;
const INTERNAL_DIRS = ['internal', 'private', 'utils', 'helpers', 'shared', 'test', 'tests'];
const ENTRY_NAMES = ['main', 'exports', 'app', 'server', 'cli', 'bin'];
const EXPORT_PATTERNS = [
  /export\s+(?:function|class|const|let|var)\s+(\w+)/g,
  /export\s+\{([^}]+)\}/g,
  /module\.exports\s*=\s*\{([^}]+)\}/
];

function getRepoMap() {
  if (repoMapModule) return repoMapModule;
  if (repoMapLoadError) throw repoMapLoadError;
  try {
    repoMapModule = require_repo_map;
    return repoMapModule;
  } catch (error) {
    repoMapLoadError = error;
    throw error;
  }
}

function getRepoMapLoadError() {
  return repoMapLoadError;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isInternalExport(filePath, exportName) {
  const relative = path.relative(DEFAULT_OPTIONS.cwd, filePath);
  const parts = relative.split(path.sep);
  if (parts.some(part => INTERNAL_DIRS.includes(part))) return true;
  if (exportName.startsWith('_')) return true;
  return false;
}

function isEntryPoint(filePath) {
  const base = path.basename(filePath, path.extname(filePath));
  return ENTRY_NAMES.includes(base);
}

function ensureRepoMap() {
  return getRepoMap();
}

function ensureRepoMapSync() {
  return getRepoMap();
}

function getExportsFromRepoMap(repoMap, filePath) {
  if (!repoMap || !repoMap.files) return [];
  const file = repoMap.files[filePath];
  if (!file) return [];
  return file.exports || [];
}

function findUndocumentedExports(filePath) {
  const repoMap = getRepoMap();
  const exports = getExportsFromRepoMap(repoMap, filePath);
  const source = fs.readFileSync(filePath, 'utf8');
  const documented = new Set();
  for (const pattern of EXPORT_PATTERNS) {
    let match;
    while ((match = pattern.exec(source)) !== null) {
      const names = match[1] || match[2] || '';
      names.split(',').forEach(name => {
        name = name.trim();
        if (name) documented.add(name);
      });
    }
  }
  return exports.filter(exp => !documented.has(exp));
}

function findRelatedDocs(filePath) {
  const repoMap = getRepoMap();
  const base = path.basename(filePath, path.extname(filePath));
  const dir = path.dirname(filePath);
  const candidates = [];
  for (const file of Object.keys(repoMap.files || {})) {
    if (file === filePath) continue;
    if (path.extname(file) !== '.md') continue;
    const fileBase = path.basename(file, '.md');
    if (fileBase === base || fileBase.includes(base) || base.includes(fileBase)) {
      candidates.push(file);
    }
  }
  return candidates;
}

function findMarkdownFiles(rootDir) {
  const results = [];
  const stack = [{ dir: rootDir, depth: 0 }];
  while (stack.length && results.length < MAX_DOC_FILES) {
    const { dir, depth } = stack.pop();
    if (depth > MAX_SCAN_DEPTH) continue;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (results.length >= MAX_DOC_FILES) break;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!INTERNAL_DIRS.includes(entry.name)) {
          stack.push({ dir: fullPath, depth: depth + 1 });
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function analyzeDocIssues(filePath, docPath) {
  const issues = [];
  const source = fs.readFileSync(filePath, 'utf8');
  const doc = fs.readFileSync(docPath, 'utf8');
  const exports = getExportsFromRepoMap(getRepoMap(), filePath);
  for (const exp of exports) {
    if (!doc.includes(exp)) {
      issues.push({ type: 'missing-export', export: exp });
    }
  }
  return issues;
}

function findLineNumber(filePath, searchText) {
  const source = fs.readFileSync(filePath, 'utf8');
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchText)) return i + 1;
  }
  return -1;
}

function isValidGitRef(ref) {
  return /^[a-zA-Z0-9._/-]+$/.test(ref);
}

function getExportsFromGit(filePath, gitRef) {
  if (!isValidGitRef(gitRef)) throw new Error('Invalid git ref');
  const output = execFileSync('git', ['show', `${gitRef}:${filePath}`], {
    cwd: DEFAULT_OPTIONS.cwd,
    encoding: 'utf8'
  });
  const exports = [];
  for (const pattern of EXPORT_PATTERNS) {
    let match;
    while ((match = pattern.exec(output)) !== null) {
      const names = match[1] || match[2] || '';
      names.split(',').forEach(name => {
        name = name.trim();
        if (name) exports.push(name);
      });
    }
  }
  return exports;
}

function compareVersions(a, b) {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

function checkChangelog(changelogPath) {
  if (!fs.existsSync(changelogPath)) return false;
  const content = fs.readFileSync(changelogPath, 'utf8');
  return content.length > 0;
}

function collect() {
  const repoMap = getRepoMap();
  const files = Object.keys(repoMap.files || {});
  const result = [];
  for (const file of files) {
    if (isEntryPoint(file)) {
      result.push(file);
    }
  }
  return result;
}

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

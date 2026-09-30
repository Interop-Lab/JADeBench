'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DEFAULT_OPTIONS = { cwd: process.cwd() };
const MAX_SCAN_DEPTH = 5;
const MAX_DOC_FILES = 200;
const INTERNAL_DIRS = ['internal', 'private', 'utils', 'helpers', '__tests__', 'test', 'tests'];
const ENTRY_NAMES = ['index', 'main', 'app', 'server', 'cli', 'bin'];
const EXPORT_PATTERNS = [
  /export\s+(?:function|class|const|let|var)\s+(\w+)/g,
  /export\s+\{([^}]+)\}/g,
  /module\.exports\s*=\s*\{([^}]+)\}/,
];

let repoMapModule = null;
let repoMapLoadError = null;

function getRepoMap() {
  if (repoMapModule || repoMapLoadError) return repoMapModule;
  try {
    repoMapModule = require('./repo-map');
  } catch (error) {
    repoMapLoadError = error instanceof Error
      ? error
      : new Error(`Failed to load repo-map module: ${String(error)}`);
  }
  return repoMapModule;
}

function getRepoMapLoadError() {
  return repoMapLoadError;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isInternalExport(name, filePath = '') {
  if (name.startsWith('_')) return true;
  const parts = filePath.replace(/\\/g, '/').toLowerCase().split('/');
  return INTERNAL_DIRS.some(directory => parts.includes(directory));
}

function isEntryPoint(filePath) {
  const baseName = path.basename(filePath).replace(/\.[^.]+$/, '').toLowerCase();
  return ENTRY_NAMES.includes(baseName);
}

async function ensureRepoMap() {
  const repoMap = getRepoMap();
  if (!repoMap) return { available: false, map: null, fallbackReason: 'repo-map-module-not-found' };
  try {
    const exists = typeof repoMap.exists === 'function' && await repoMap.exists();
    if (!exists && typeof repoMap.init === 'function') await repoMap.init();
    const map = typeof repoMap.load === 'function' ? await repoMap.load() : null;
    return map
      ? { available: true, map, fallbackReason: null }
      : { available: false, map: null, fallbackReason: 'repo-map-not-initialized' };
  } catch (error) {
    return { available: false, map: null, fallbackReason: error.message };
  }
}

function ensureRepoMapSync() {
  const repoMap = getRepoMap();
  if (!repoMap) return { available: false, map: null, fallbackReason: 'repo-map-module-not-found' };
  try {
    const exists = typeof repoMap.existsSync === 'function' && repoMap.existsSync();
    if (!exists) return { available: false, map: null, fallbackReason: 'repo-map-not-initialized' };
    const map = typeof repoMap.loadSync === 'function' ? repoMap.loadSync() : null;
    return map
      ? { available: true, map, fallbackReason: null }
      : { available: false, map: null, fallbackReason: 'repo-map-not-initialized' };
  } catch (error) {
    return { available: false, map: null, fallbackReason: error.message };
  }
}

function normalizePath(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.startsWith('./') ? normalized.slice(2) : normalized;
}

function mapFiles(repoMap) {
  if (Array.isArray(repoMap.files)) return repoMap.files;
  if (repoMap.files && typeof repoMap.files === 'object') {
    return Object.entries(repoMap.files).map(([file, details]) => ({ file, ...details }));
  }
  return [];
}

function getExportsFromRepoMap(repoMap, requestedFile) {
  if (!repoMap) return [];
  const normalizedFile = normalizePath(requestedFile);
  const record = mapFiles(repoMap).find(item => {
    const itemPath = typeof item === 'string' ? item : item.file || item.path || '';
    return normalizePath(itemPath) === normalizedFile;
  });
  if (!record || typeof record === 'string') return [];
  if (Array.isArray(record.exports)) return record.exports;
  return (record.symbols || [])
    .filter(symbol => symbol.exported || symbol.isExport || symbol.kind === 'export')
    .map(symbol => typeof symbol === 'string' ? { name: symbol } : symbol);
}

function findMarkdownFiles(root) {
  const ignoredDirectories = new Set([
    'node_modules', 'dist', 'build', '.git', 'coverage', 'vendor',
  ]);
  const files = [];

  function scan(directory, depth) {
    if (depth > MAX_SCAN_DEPTH || files.length >= MAX_DOC_FILES) return;
    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (files.length >= MAX_DOC_FILES) break;
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) scan(fullPath, depth + 1);
      else if (/\.md(?:own)?$/i.test(entry.name)) files.push(normalizePath(path.relative(root, fullPath)));
    }
  }

  scan(root, 0);
  return files;
}

function findUndocumentedExports(options = {}) {
  const cwd = options.cwd || process.cwd();
  const status = options.repoMapStatus || ensureRepoMapSync();
  if (!status.available || !status.map) return [];
  const documentation = findMarkdownFiles(cwd)
    .map(file => fs.readFileSync(path.join(cwd, file), 'utf8'))
    .join('\n');
  const issues = [];
  for (const record of mapFiles(status.map)) {
    const file = normalizePath(typeof record === 'string' ? record : record.file || record.path || '');
    for (const exported of getExportsFromRepoMap(status.map, file)) {
      const name = typeof exported === 'string' ? exported : exported.name;
      if (!name || isInternalExport(name, file) || isEntryPoint(file)) continue;
      if (new RegExp(`\\b${escapeRegex(name)}\\b`).test(documentation)) continue;
      issues.push({
        type: 'undocumented-export', severity: 'low', file,
        line: exported.line || 0, kind: 'export', certainty: 'MEDIUM',
        message: `Export '${name}' in ${file} is not mentioned in any documentation`,
        suggestion: `Document ${name} in a relevant Markdown file`,
      });
    }
  }
  return issues;
}

function findRelatedDocs(sourceFile, options = {}) {
  const cwd = options.cwd || process.cwd();
  const normalizedSource = normalizePath(sourceFile);
  const baseName = path.basename(normalizedSource).replace(/\.[^.]+$/, '');
  return findMarkdownFiles(cwd).filter(markdownFile => {
    try {
      const text = fs.readFileSync(path.join(cwd, markdownFile), 'utf8');
      return text.includes(normalizedSource) || new RegExp(`\\b${escapeRegex(baseName)}\\b`, 'i').test(text);
    } catch {
      return false;
    }
  });
}

function findLineNumber(content, searchText) {
  const index = content.indexOf(searchText);
  return index < 0 ? 0 : content.slice(0, index).split('\n').length;
}

function isValidGitRef(ref) {
  return typeof ref === 'string' &&
    /^(?:HEAD(?:~\d+|\^\d*)?|[A-Za-z0-9][A-Za-z0-9._/-]*)$/.test(ref) &&
    !ref.includes('..') && !ref.includes('@{') && !ref.endsWith('/') && !ref.endsWith('.');
}

function extractExports(source) {
  const names = new Set();
  for (const pattern of EXPORT_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of source.matchAll(pattern)) {
      if (pattern === EXPORT_PATTERNS[0]) names.add(match[1]);
      else for (const item of match[1].split(',')) {
        const name = item.trim().split(/\s+as\s+|:/)[0].trim();
        if (/^[$A-Z_a-z][$\w]*$/.test(name)) names.add(name);
      }
    }
  }
  for (const match of source.matchAll(/(?:module\.)?exports\.(\w+)\s*=/g)) names.add(match[1]);
  return [...names].map(name => ({ name }));
}

function getExportsFromGit(file, ref = 'HEAD', cwd = process.cwd()) {
  if (!isValidGitRef(ref)) return [];
  const relativeFile = normalizePath(path.relative(cwd, path.resolve(cwd, file)));
  if (!relativeFile || relativeFile.startsWith('../')) return [];
  try {
    const source = execFileSync('git', ['show', `${ref}:${relativeFile}`], {
      cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    });
    return extractExports(source);
  } catch {
    return [];
  }
}

function compareVersions(left, right) {
  const leftParts = String(left).split('.').map(part => Number.parseInt(part, 10) || 0);
  const rightParts = String(right).split('.').map(part => Number.parseInt(part, 10) || 0);
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index++) {
    const difference = (leftParts[index] || 0) - (rightParts[index] || 0);
    if (difference) return difference > 0 ? 1 : -1;
  }
  return 0;
}

function analyzeDocIssues(markdownFile, options = {}) {
  const cwd = options.cwd || process.cwd();
  const absoluteFile = path.isAbsolute(markdownFile) ? markdownFile : path.join(cwd, markdownFile);
  let content;
  try {
    content = fs.readFileSync(absoluteFile, 'utf8');
  } catch (error) {
    return [{ type: 'read-error', severity: 'high', file: markdownFile, line: 0, message: error.message }];
  }
  const issues = [];
  for (const block of content.match(/```[\s\S]*?```/g) || []) {
    for (const match of block.matchAll(/import .* from ['"]([^'"]+)['"]/g)) {
      const importPath = match[1];
      if (!importPath.startsWith('.')) continue;
      const resolved = path.resolve(path.dirname(absoluteFile), importPath);
      const candidates = [resolved, `${resolved}.js`, `${resolved}.ts`, path.join(resolved, 'index.js')];
      if (candidates.some(candidate => fs.existsSync(candidate))) continue;
      issues.push({
        type: 'code-example', severity: 'medium', file: markdownFile,
        line: findLineNumber(content, match[0]), current: importPath,
        message: `Import path '${importPath}' could not be resolved`,
        suggestion: 'Verify import path is still valid',
      });
    }
  }
  const status = options.repoMapStatus || ensureRepoMapSync();
  const sourceFile = options.sourceFile || markdownFile;
  const current = status.available
    ? getExportsFromRepoMap(status.map, sourceFile)
    : getExportsFromGit(sourceFile, 'HEAD', cwd);
  const currentNames = new Set(current.map(item => typeof item === 'string' ? item : item.name));
  for (const previous of getExportsFromGit(sourceFile, 'HEAD~1', cwd)) {
    const name = typeof previous === 'string' ? previous : previous.name;
    if (!name || currentNames.has(name) || !new RegExp(`\\b${escapeRegex(name)}\\b`).test(content)) continue;
    issues.push({
      type: 'removed-export', severity: 'high', file: markdownFile,
      line: findLineNumber(content, name), reference: name,
      message: `'${name}' was removed or renamed`, suggestion: 'Update or remove this reference',
      detectionMethod: status.available ? 'repo-map' : 'regex',
    });
  }
  try {
    const version = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')).version;
    for (const match of content.matchAll(/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi)) {
      if (compareVersions(match[1], version) >= 0) continue;
      issues.push({
        type: 'outdated-version', severity: 'low', file: markdownFile,
        line: findLineNumber(content, match[0]), current: match[1], expected: version,
        message: `Update version from ${match[1]} to ${version}`,
        suggestion: `Replace ${match[1]} with ${version}`,
      });
    }
  } catch {}
  return issues;
}

function checkChangelog(options = {}) {
  const cwd = options.cwd || DEFAULT_OPTIONS.cwd;
  const changelogPath = path.join(cwd, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) return { exists: false };
  let changelog;
  try {
    changelog = fs.readFileSync(changelogPath, 'utf8');
  } catch {
    return { exists: true, error: 'Could not read CHANGELOG.md' };
  }
  let commits = [];
  try {
    const log = execFileSync('git', ['log', '--oneline', '-10', 'HEAD'], {
      cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    commits = log ? log.split('\n') : [];
  } catch {}
  const undocumented = commits
    .filter(commit => /^(feat|fix|breaking)/i.test(commit.substring(8)))
    .filter(commit => !changelog.includes(commit.substring(8)));
  return {
    exists: true,
    hasUnreleased: changelog.includes('## [Unreleased]'),
    documented: commits.length - undocumented.length,
    undocumented,
    suggestion: undocumented.length ? `${undocumented.length} commits may need CHANGELOG entries` : '',
  };
}

async function collect(options = {}) {
  const cwd = options.cwd || DEFAULT_OPTIONS.cwd;
  const repoMapStatus = await ensureRepoMap();
  const markdownFiles = findMarkdownFiles(cwd);
  const issues = findUndocumentedExports({ cwd, repoMapStatus });
  for (const markdownFile of markdownFiles) {
    issues.push(...analyzeDocIssues(markdownFile, { cwd, repoMapStatus }));
  }
  return {
    cwd, markdownFiles, issues, changelog: checkChangelog({ cwd }),
    repoMap: { available: repoMapStatus.available, fallbackReason: repoMapStatus.fallbackReason },
  };
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
  getRepoMapLoadError,
};

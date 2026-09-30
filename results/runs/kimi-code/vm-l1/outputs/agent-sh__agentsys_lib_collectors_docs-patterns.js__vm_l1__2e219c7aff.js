'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DEFAULT_OPTIONS = {
  cwd: process.cwd(),
};

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
  if (repoMapModule) return repoMapModule;
  try {
    repoMapModule = require('../repo-map');
    return repoMapModule;
  } catch (error) {
    repoMapLoadError = error;
    return undefined;
  }
}

function getRepoMapLoadError() {
  return repoMapLoadError?.message;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isInternalExport(name, file = '') {
  if (name.startsWith('_')) return true;
  const normalized = file.toLowerCase();
  if (INTERNAL_DIRS.some((directory) => normalized.includes(`/${directory}/`) || normalized.includes(`\\${directory}\\`))) return true;
  return /\.(test|spec)\.[jt]sx?$/.test(normalized);
}

function isEntryPoint(file) {
  const name = path.basename(file).replace(/\.[^.]+$/, '').toLowerCase();
  return ENTRY_NAMES.includes(name);
}

function ensureRepoMapSync(options = {}) {
  const cwd = options.cwd || process.cwd();
  const module = getRepoMap();
  if (!module) return { available: false, map: null, fallbackReason: 'repo-map-module-not-found' };
  try {
    if (typeof module.exists === 'function' && module.exists(cwd)) {
      return { available: true, map: module.load(cwd) };
    }
    return { available: false, map: null, fallbackReason: 'repo-map-not-initialized' };
  } catch (error) {
    return { available: false, map: null, fallbackReason: error.message };
  }
}

async function ensureRepoMap(options = {}) {
  const cwd = options.cwd || process.cwd();
  const module = getRepoMap();
  if (!module) return { available: false, map: null, fallbackReason: 'repo-map-module-not-found' };
  try {
    if (typeof module.exists === 'function' && module.exists(cwd)) {
      return { available: true, map: await module.load(cwd) };
    }
    if (typeof module.init === 'function') {
      const result = await module.init({ cwd, force: false });
      return result && result.success
        ? { available: true, map: await module.load(cwd) }
        : { available: false, map: null, fallbackReason: result?.error || 'init-failed' };
    }
    return { available: false, map: null, fallbackReason: 'repo-map-not-initialized' };
  } catch (error) {
    return { available: false, map: null, fallbackReason: error.message };
  }
}

function getExportsFromRepoMap(repoMap) {
  if (!repoMap || !repoMap.files) return [];
  const exports = [];
  for (const [file, details] of Object.entries(repoMap.files)) {
    const normalizedFile = file.replace(/\\/g, '/').replace(/^\.\//, '');
    for (const symbol of details.symbols || details.exports || []) {
      exports.push(typeof symbol === 'string' ? { name: symbol, file: normalizedFile } : { ...symbol, file: normalizedFile });
    }
  }
  return exports;
}

function findMarkdownFiles(root, ignoredDirectories = INTERNAL_DIRS) {
  const files = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && ignoredDirectories.includes(entry.name)) continue;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (/\.mdx?$/i.test(entry.name)) files.push(path.relative(root, fullPath).replace(/\\/g, '/'));
    }
  }
  visit(root);
  return files;
}

function findUndocumentedExports(options = {}) {
  const cwd = options.cwd || DEFAULT_OPTIONS.cwd;
  const status = options.repoMapStatus || ensureRepoMapSync({ cwd });
  if (!status.available || !status.map) return [];
  const markdownFiles = findMarkdownFiles(cwd);
  const documentation = markdownFiles.map((file) => fs.readFileSync(path.join(cwd, file), 'utf8')).join('\n');
  return getExportsFromRepoMap(status.map)
    .filter((item) => item.name && !isInternalExport(item.name, item.file) && isEntryPoint(item.file))
    .filter((item) => !new RegExp(`\\b${escapeRegex(item.name)}\\b`).test(documentation))
    .map((item) => ({
      type: 'undocumented-export',
      severity: 'low',
      file: item.file,
      line: item.line,
      kind: 'export',
      export: item.name,
      certainty: 'MEDIUM',
      message: `Export '${item.name}' in ${item.file} is not mentioned in any documentation`,
      suggestion: `Document ${item.name} in the relevant Markdown file`,
    }));
}

function findRelatedDocs(changedFiles, options = {}) {
  const cwd = options.cwd || DEFAULT_OPTIONS.cwd;
  const markdownFiles = findMarkdownFiles(cwd);
  const related = [];
  for (const doc of markdownFiles) {
    const content = fs.readFileSync(path.join(cwd, doc), 'utf8');
    const docDirectory = path.dirname(doc);
    for (const changedFile of changedFiles) {
      const normalized = changedFile.replace(/\\/g, '/');
      const basename = path.basename(normalized).replace(/\.[^.]+$/, '');
      const relative = path.relative(docDirectory, normalized).replace(/\\/g, '/');
      const references = [normalized, `./${relative}`, basename];
      const referenceTypes = [];
      if (references.some((value) => value && content.includes(value))) referenceTypes.push('filename');
      if (content.includes(`from '${basename}'`) || content.includes(`from "${basename}"`)) referenceTypes.push('import');
      if (content.includes(`require('${basename}')`) || content.includes(`require("${basename}")`)) referenceTypes.push('require');
      if (referenceTypes.length) related.push({ doc, referencedFile: normalized, referenceTypes });
    }
  }
  return related;
}

function findLineNumber(content, searchText) {
  const index = content.indexOf(searchText);
  if (index === -1) return 0;
  return content.substring(0, index).split('\n').length;
}

function isValidGitRef(ref) {
  return typeof ref === 'string' && /^[a-zA-Z0-9_./-]+(?:[~^][0-9]+)?$/.test(ref);
}

function getExportsFromGit(ref, file) {
  if (!isValidGitRef(ref)) return [];
  let source;
  try {
    source = execFileSync('git', ['show', `${file}:${ref}`], {
      cwd: DEFAULT_OPTIONS.cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch {
    return [];
  }

  const names = [];
  for (const pattern of EXPORT_PATTERNS) {
    pattern.lastIndex = 0;
    for (let match; (match = pattern.exec(source)); ) {
      names.push(...match[1].split(',').map((entry) => entry.trim().split(/\s+as\s+/).pop().split(':')[0].trim()).filter(Boolean));
    }
  }
  return [...new Set(names)];
}

function compareVersions(first, second) {
  const left = first.split('.').map(Number);
  const right = second.split('.').map(Number);
  for (let index = 0; index < 3; index++) {
    if ((left[index] || 0) > (right[index] || 0)) return 1;
    if ((left[index] || 0) < (right[index] || 0)) return -1;
  }
  return 0;
}

function checkChangelog(options = {}) {
  const cwd = options.cwd || DEFAULT_OPTIONS.cwd;
  const changelogPath = path.join(cwd, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) return { exists: false, error: 'Could not read CHANGELOG.md' };
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  let commits = [];
  try {
    commits = execFileSync('git', ['log', '--oneline', '-10', 'HEAD'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
      .trim().split('\n').filter(Boolean);
  } catch {}
  const undocumented = commits.filter((commit) => /\s(feat|fix|breaking)[(:]/i.test(commit) && !changelog.includes(commit.substring(commit.indexOf(' ') + 1)));
  return {
    exists: true,
    hasUnreleased: changelog.includes('## [Unreleased]'),
    documented: commits.filter((commit) => !undocumented.includes(commit)),
    undocumented,
    suggestion: undocumented.length ? `${undocumented.length} commits may need CHANGELOG entries` : undefined,
  };
}

function analyzeDocIssues(options = {}, context = {}) {
  const cwd = options.cwd || DEFAULT_OPTIONS.cwd;
  const issues = [];
  const markdownFiles = findMarkdownFiles(cwd);
  for (const file of markdownFiles) {
    const content = fs.readFileSync(path.join(cwd, file), 'utf8');
    for (const match of content.matchAll(/import .* from ['"]([^'"]+)['"]/g)) {
      issues.push({ type: 'code-example', severity: 'medium', file, line: findLineNumber(content, match[0]), current: match[1], suggestion: 'Verify import path is still valid' });
    }
  }
  const repoMapStatus = context.repoMapStatus || ensureRepoMapSync({ cwd });
  issues.push(...findUndocumentedExports({ cwd, repoMapStatus }));
  return issues;
}

async function collect(options = {}) {
  const cwd = options.cwd || DEFAULT_OPTIONS.cwd;
  const changedFiles = options.changedFiles || [];
  const repoMapStatus = ensureRepoMapSync({ cwd });
  const relatedDocs = findRelatedDocs(changedFiles, { cwd });
  const changelog = checkChangelog({ cwd });
  const markdownFiles = findMarkdownFiles(cwd);
  const undocumentedExports = findUndocumentedExports({ cwd, repoMapStatus });
  return {
    relatedDocs,
    changelog,
    markdownFiles,
    repoMap: {
      available: repoMapStatus.available,
      fallbackReason: repoMapStatus.fallbackReason,
      stats: repoMapStatus.available ? repoMapStatus.stats : null,
    },
    undocumentedExports,
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

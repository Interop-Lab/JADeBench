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
  return repoMapModule;
}

function getRepoMapLoadError() {
  return repoMapLoadError;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isInternalExport(exportName, filePath) {
  if (String(exportName).startsWith('_')) return true;
  const segments = String(filePath).split(/[\\/]+/);
  return segments.some(segment => INTERNAL_DIRS.includes(segment));
}

function isEntryPoint(filePath) {
  const baseName = path.basename(String(filePath), path.extname(String(filePath)));
  return ENTRY_NAMES.includes(baseName);
}

function loadRepoMap() {
  if (repoMapModule) return repoMapModule;
  try {
    repoMapModule = require('./repo-map');
  } catch (error) {
    repoMapLoadError = error;
  }
  return repoMapModule;
}

async function ensureRepoMap() {
  const map = loadRepoMap();
  return map
    ? { available: true, map, fallbackReason: null }
    : { available: false, map: null, fallbackReason: 'repo-map-module-not-found' };
}

function ensureRepoMapSync() {
  const map = loadRepoMap();
  return map
    ? { available: true, map, fallbackReason: null }
    : { available: false, map: null, fallbackReason: 'repo-map-module-not-found' };
}

function normalizeExport(item, file) {
  if (typeof item === 'string') return { name: item, file };
  if (!item || typeof item !== 'object') return null;
  const name = item.name || item.exportName || item.symbol;
  return name ? { ...item, name, file: item.file || item.path || file } : null;
}

function getExportsFromRepoMap(repoMap, options = {}) {
  if (!repoMap) return null;
  const files = repoMap.files || repoMap.entries || repoMap.modules;
  if (!files) return null;

  const exports = [];
  const entries = Array.isArray(files) ? files : Object.values(files);
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const file = entry.path || entry.file || entry.name;
    for (const item of entry.exports || entry.symbols || []) {
      const normalized = normalizeExport(item, file);
      if (normalized && !isInternalExport(normalized.name, normalized.file || '')) exports.push(normalized);
    }
  }
  return exports;
}

function walkMarkdownFiles(root, directory, depth, results) {
  if (depth > MAX_SCAN_DEPTH || results.length >= MAX_DOC_FILES) return;
  let entries;
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    return;
  }

  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    if (results.length >= MAX_DOC_FILES) break;
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walkMarkdownFiles(root, absolute, depth + 1, results);
    else if (/\.md(?:own)?$/i.test(entry.name)) results.push(path.relative(root, absolute) || entry.name);
  }
}

function findMarkdownFiles(cwd = DEFAULT_OPTIONS.cwd) {
  const root = path.resolve(String(cwd));
  const results = [];
  walkMarkdownFiles(root, root, 0, results);
  return results;
}

function findRelatedDocs(referencedFiles, options = {}) {
  const files = Array.from(referencedFiles || []);
  const cwd = path.resolve(options.cwd || DEFAULT_OPTIONS.cwd);
  const markdownFiles = options.markdownFiles || findMarkdownFiles(cwd);
  const related = [];

  for (const referencedFile of files) {
    const normalized = String(referencedFile).replace(/\\/g, '/');
    const fileName = path.posix.basename(normalized);
    const stem = fileName.replace(/\.[^.]+$/, '');
    for (const doc of markdownFiles) {
      let content;
      try {
        content = fs.readFileSync(path.resolve(cwd, doc), 'utf8');
      } catch {
        continue;
      }
      const referenceTypes = [];
      if (fileName && new RegExp(`(?:^|[^\\w])${escapeRegex(fileName)}(?:$|[^\\w])`, 'i').test(content)) {
        referenceTypes.push('filename');
      }
      if (normalized && content.replace(/\\/g, '/').includes(normalized)) referenceTypes.push('full-path');
      if (!referenceTypes.length && stem && new RegExp(`\\b${escapeRegex(stem)}\\b`, 'i').test(content)) {
        referenceTypes.push('filename');
      }
      if (referenceTypes.length) related.push({ doc, referencedFile, referenceTypes });
    }
  }
  return related;
}

function analyzeDocIssues(markdownFiles, options = {}) {
  const cwd = path.resolve(options.cwd || (typeof options === 'string' ? options : DEFAULT_OPTIONS.cwd));
  const issues = [];
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;

  for (const doc of markdownFiles || []) {
    const absolute = path.resolve(cwd, doc);
    let content;
    try {
      content = fs.readFileSync(absolute, 'utf8');
    } catch {
      continue;
    }
    linkPattern.lastIndex = 0;
    let match;
    while ((match = linkPattern.exec(content))) {
      const target = match[1].trim().split(/[?#]/)[0];
      if (!target || /^(?:[a-z]+:|#)/i.test(target)) continue;
      const resolved = path.resolve(path.dirname(absolute), decodeURI(target));
      if (!fs.existsSync(resolved)) {
        issues.push({ file: doc, line: findLineNumber(content, match[0]), link: match[1], type: 'broken-link' });
      }
    }
  }
  return issues;
}

function findLineNumber(content, search) {
  const index = String(content).indexOf(String(search));
  return index < 0 ? 0 : String(content).slice(0, index).split('\n').length;
}

function isValidGitRef(ref) {
  return typeof ref === 'string' && ref.length > 0 && !ref.startsWith('-') && !/[\0\s~^:?*\[\\]/.test(ref) && !ref.includes('..');
}

function parseExports(source, file) {
  const found = [];
  for (const pattern of EXPORT_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(source))) {
      if (!match[1]) continue;
      if (!match[1].includes(',')) found.push({ name: match[1].trim(), file });
      else {
        for (const part of match[1].split(',')) {
          const name = part.trim().split(/\s+as\s+|\s*:\s*/)[0];
          if (name) found.push({ name, file });
        }
      }
      if (!pattern.global) break;
    }
  }
  return found;
}

function getExportsFromGit(cwd = DEFAULT_OPTIONS.cwd, ref = 'HEAD') {
  if (!isValidGitRef(ref)) return [];
  try {
    const names = execFileSync('git', ['ls-tree', '-r', '--name-only', ref], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).split(/\r?\n/).filter(file => /\.(?:[cm]?[jt]sx?)$/i.test(file));
    const exports = [];
    for (const file of names) {
      if (isInternalExport('', file)) continue;
      const source = execFileSync('git', ['show', `${ref}:${file}`], {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      exports.push(...parseExports(source, file));
    }
    return exports;
  } catch {
    return [];
  }
}

function compareVersions(left, right) {
  const leftParts = String(left).split('.').map(part => parseInt(part, 10) || 0);
  const rightParts = String(right).split('.').map(part => parseInt(part, 10) || 0);
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index++) {
    if ((leftParts[index] || 0) > (rightParts[index] || 0)) return 1;
    if ((leftParts[index] || 0) < (rightParts[index] || 0)) return -1;
  }
  return 0;
}

function checkChangelog(markdownFiles, options = {}) {
  const cwd = path.resolve(options.cwd || DEFAULT_OPTIONS.cwd);
  const changelog = Array.from(markdownFiles || []).find(file => /(?:^|[\\/])changelog\.md$/i.test(file));
  if (!changelog) return { exists: false };

  let content;
  try {
    content = fs.readFileSync(path.resolve(cwd, changelog), 'utf8');
  } catch {
    return { exists: false };
  }
  const documented = [];
  const versionPattern = /^#{1,3}\s*\[?v?(\d+(?:\.\d+){1,3})\]?/gim;
  let match;
  while ((match = versionPattern.exec(content))) documented.push(match[1]);
  const expected = options.versions || options.expectedVersions || [];
  const undocumented = expected.filter(version => !documented.includes(String(version).replace(/^v/, '')));
  return {
    exists: true,
    hasUnreleased: /^#{1,3}\s*\[?unreleased\]?/im.test(content),
    documented,
    undocumented,
    suggestion: undocumented.length ? `Document ${undocumented.join(', ')} in ${changelog}` : null,
  };
}

function findUndocumentedExports(exports, markdownFiles, options = {}) {
  if (!Array.isArray(exports) || !Array.isArray(markdownFiles)) return [];
  const cwd = path.resolve(options.cwd || DEFAULT_OPTIONS.cwd);
  const documentation = markdownFiles.map(file => {
    try { return fs.readFileSync(path.resolve(cwd, file), 'utf8'); } catch { return ''; }
  }).join('\n');
  return exports.filter(item => {
    const normalized = normalizeExport(item);
    return normalized && !isInternalExport(normalized.name, normalized.file || '') &&
      !new RegExp(`\\b${escapeRegex(normalized.name)}\\b`).test(documentation);
  });
}

async function collect(options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const markdownFiles = findMarkdownFiles(settings.cwd);
  const repoMapStatus = await ensureRepoMap();
  let exports = repoMapStatus.available ? getExportsFromRepoMap(repoMapStatus.map, settings) : null;
  if (!exports) exports = settings.ref ? getExportsFromGit(settings.cwd, settings.ref) : [];
  return {
    relatedDocs: findRelatedDocs(settings.files || [], { ...settings, markdownFiles }),
    changelog: checkChangelog(markdownFiles, settings),
    markdownFiles,
    repoMap: {
      available: repoMapStatus.available,
      fallbackReason: repoMapStatus.fallbackReason,
      stats: repoMapStatus.map && repoMapStatus.map.stats || null,
    },
    undocumentedExports: findUndocumentedExports(exports, markdownFiles, settings),
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

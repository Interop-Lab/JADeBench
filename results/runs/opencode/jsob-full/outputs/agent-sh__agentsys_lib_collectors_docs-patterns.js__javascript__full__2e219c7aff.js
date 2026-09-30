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
  /export\s+(?:async\s+)?(?:function|class|const|let|var)\s+(\w+)/g,
  /export\s*\{([^}]+)\}/g,
  /module\.exports\s*=\s*\{([^}]+)\}/g,
];

let repoMapModule = null;
let repoMapLoadError = null;

function getRepoMap() {
  // The original artifact embeds repo-map. It is deliberately optional: all
  // analysis routines retain their regex/filesystem fallback without it.
  if (!repoMapModule && !repoMapLoadError) repoMapLoadError = 'Failed to load repo-map module';
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
  const normalized = filePath.toLowerCase().replaceAll('\\', '/');
  if (INTERNAL_DIRS.some((directory) => normalized.includes(`/${directory}/`))) return true;
  return /\.(test|spec)\.[jt]sx?$/.test(normalized);
}

function isEntryPoint(filePath) {
  const name = path.basename(filePath).replace(/\.[^.]+$/, '').toLowerCase();
  return ENTRY_NAMES.includes(name);
}

function repoMapUnavailable(reason = getRepoMapLoadError()) {
  return { available: false, map: null, fallbackReason: reason || 'repo-map-module-not-found' };
}

async function ensureRepoMap(options = {}) {
  const cwd = options.cwd || process.cwd();
  const repoMap = getRepoMap();
  if (!repoMap) return repoMapUnavailable();

  try {
    if (repoMap.exists?.(cwd)) {
      return { available: true, map: await repoMap.load(cwd), fallbackReason: null };
    }
    if (options.initializeRepoMap === false) return repoMapUnavailable('repo-map-not-initialized');
    await repoMap.init?.(cwd, options);
    return { available: true, map: await repoMap.load(cwd), fallbackReason: null };
  } catch (error) {
    return repoMapUnavailable(error.message);
  }
}

function ensureRepoMapSync(options = {}) {
  const cwd = options.cwd || process.cwd();
  const repoMap = getRepoMap();
  if (!repoMap) return repoMapUnavailable();

  try {
    if (!repoMap.exists?.(cwd)) return repoMapUnavailable('repo-map-not-initialized');
    const map = repoMap.load(cwd);
    if (map && typeof map.then === 'function') {
      return repoMapUnavailable('repo-map-sync-load-unavailable');
    }
    return { available: true, map, fallbackReason: null };
  } catch (error) {
    return repoMapUnavailable(error.message);
  }
}

function getExportsFromRepoMap(repoMap, changedFiles = []) {
  if (!repoMap?.files) return [];
  const changed = new Set(changedFiles.map((file) => file.replaceAll('\\', '/').replace(/^\.\//, '')));
  const exports = [];
  for (const [file, details] of Object.entries(repoMap.files)) {
    const normalized = file.replaceAll('\\', '/').replace(/^\.\//, '');
    if (changed.size && !changed.has(normalized)) continue;
    for (const symbol of details.symbols || []) {
      if (symbol.exported || symbol.isExport || symbol.kind === 'export') {
        exports.push({ name: symbol.name, file: normalized, kind: symbol.kind });
      }
    }
    for (const item of details.exports || []) {
      exports.push(typeof item === 'string' ? { name: item, file: normalized } : { file: normalized, ...item });
    }
  }
  return exports;
}

function findLineNumber(content, text) {
  const index = content.indexOf(text);
  return index < 0 ? null : content.slice(0, index).split('\n').length;
}

function documentationMentions(name, markdownFiles, cwd) {
  const pattern = new RegExp(`\\b${escapeRegex(name)}\\b`);
  return markdownFiles.some((file) => {
    try {
      return pattern.test(fs.readFileSync(path.join(cwd, file), 'utf8'));
    } catch {
      return false;
    }
  });
}

function findUndocumentedExports(changedFiles, options = {}) {
  const cwd = options.cwd || process.cwd();
  const markdownFiles = options.markdownFiles || findMarkdownFiles(cwd);
  const status = options.repoMapStatus || ensureRepoMapSync(options);
  if (!status.available || !status.map) return [];

  return getExportsFromRepoMap(status.map, changedFiles)
    .filter((item) => item.name && !isInternalExport(item.name, item.file))
    .filter((item) => !documentationMentions(item.name, markdownFiles, cwd))
    .map((item) => ({
      type: 'undocumented-export',
      severity: isEntryPoint(item.file) ? 'high' : 'medium',
      file: item.file,
      line: item.line || null,
      export: item.name,
      kind: item.kind,
      certainty: 'repo-map',
      suggestion: `Export '${item.name}' in ${item.file} is not mentioned in any documentation`,
    }));
}

function findMarkdownFiles(root) {
  const results = [];
  const ignored = new Set(['node_modules', 'dist', 'build', '.git', 'coverage', 'vendor', '.codex']);

  function scan(directory, depth) {
    if (depth > MAX_SCAN_DEPTH || results.length >= MAX_DOC_FILES) return;
    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (results.length >= MAX_DOC_FILES) break;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!ignored.has(entry.name) && !entry.name.startsWith('.')) scan(fullPath, depth + 1);
      } else if (entry.isFile() && /\.md$/i.test(entry.name)) {
        results.push(path.relative(root, fullPath));
      }
    }
  }

  scan(root, 0);
  return results;
}

function referencedPaths(content) {
  const references = new Set();
  const patterns = [
    /(?:from\s+|import\s*)["']([^"']+)["']/g,
    /require\(\s*["']([^"']+)["']\s*\)/g,
    /\[[^\]]*\]\(([^)#\s]+)(?:#[^)]*)?\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) references.add(match[1]);
  }
  return references;
}

function resolveReference(documentPath, reference, cwd) {
  if (/^(?:https?:|mailto:|#)/i.test(reference)) return null;
  const clean = decodeURIComponent(reference.split('#')[0].split('?')[0]);
  return path.resolve(path.dirname(path.join(cwd, documentPath)), clean);
}

function findRelatedDocs(changedFiles, options = {}) {
  const cwd = options.cwd || process.cwd();
  const limit = options.limit || MAX_DOC_FILES;
  const docs = options.markdownFiles || findMarkdownFiles(cwd);
  const normalizedChanges = changedFiles.map((file) => file.replaceAll('\\', '/'));
  const issues = [];

  for (const document of docs.slice(0, limit)) {
    let content;
    try {
      content = fs.readFileSync(path.join(cwd, document), 'utf8');
    } catch {
      continue;
    }
    for (const reference of referencedPaths(content)) {
      const resolved = resolveReference(document, reference, cwd);
      if (!resolved) continue;
      const relative = path.relative(cwd, resolved).replaceAll('\\', '/');
      if (!normalizedChanges.some((file) => file === relative || file.startsWith(`${relative}/`))) continue;
      issues.push({
        type: 'code-example',
        severity: 'medium',
        file: document,
        line: findLineNumber(content, reference),
        current: reference,
        referencedFile: relative,
        suggestion: 'Verify import path is still valid',
      });
    }
  }
  return issues;
}

function parseExports(source, file) {
  const exports = [];
  for (const pattern of EXPORT_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of source.matchAll(pattern)) {
      if (pattern === EXPORT_PATTERNS[0]) exports.push({ name: match[1], file });
      else {
        for (const item of match[1].split(',')) {
          const name = item.trim().split(/\s+as\s+/).pop().split(':')[0].trim();
          if (/^[A-Za-z_$][\w$]*$/.test(name)) exports.push({ name, file });
        }
      }
    }
  }
  return exports;
}

function isValidGitRef(ref) {
  return typeof ref === 'string' && ref.length > 0 && ref.length < 256 &&
    /^[A-Za-z0-9._~^:/-]+$/.test(ref) && !ref.startsWith('-') && !ref.includes('..');
}

function getExportsFromGit(ref, options = {}) {
  const cwd = options.cwd || process.cwd();
  if (!isValidGitRef(ref)) return [];
  const files = options.files || options.changedFiles || [];
  const exports = [];
  for (const file of files) {
    try {
      const source = execFileSync('git', ['show', `${ref}:${file}`], {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      exports.push(...parseExports(source, file));
    } catch {
      // A deleted, binary, or absent file has no exports at this revision.
    }
  }
  return exports;
}

function compareVersions(left, right) {
  const a = String(left).split('.').map((part) => Number.parseInt(part, 10) || 0);
  const b = String(right).split('.').map((part) => Number.parseInt(part, 10) || 0);
  for (let index = 0; index < Math.max(a.length, b.length); index++) {
    if ((a[index] || 0) > (b[index] || 0)) return 1;
    if ((a[index] || 0) < (b[index] || 0)) return -1;
  }
  return 0;
}

function analyzeDocIssues(changedFiles, markdownFiles, options = {}) {
  const cwd = options.cwd || process.cwd();
  const documents = markdownFiles || findMarkdownFiles(cwd);
  const issues = [...findRelatedDocs(changedFiles, { ...options, markdownFiles: documents })];

  for (const document of documents) {
    let content;
    try {
      content = fs.readFileSync(path.join(cwd, document), 'utf8');
    } catch {
      continue;
    }
    for (const reference of referencedPaths(content)) {
      const resolved = resolveReference(document, reference, cwd);
      if (resolved && !fs.existsSync(resolved)) {
        issues.push({
          type: 'stale-docs',
          severity: 'medium',
          file: document,
          line: findLineNumber(content, reference),
          current: reference,
          suggestion: 'Verify import path is still valid',
        });
      }
    }

    const packagePath = path.join(cwd, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        const packageVersion = JSON.parse(fs.readFileSync(packagePath, 'utf8')).version;
        for (const match of content.matchAll(/\bv?(\d+\.\d+\.\d+)\b/g)) {
          if (packageVersion && compareVersions(match[1], packageVersion) < 0) {
            issues.push({
              type: 'outdated-version',
              severity: 'low',
              file: document,
              line: findLineNumber(content, match[0]),
              current: match[1],
              expected: packageVersion,
              suggestion: `Update version from ${match[1]} to ${packageVersion}`,
            });
          }
        }
      } catch {}
    }
  }

  const previousExports = getExportsFromGit(options.baseRef || 'HEAD~1', { cwd, files: changedFiles });
  const currentNames = new Set();
  for (const file of changedFiles) {
    try {
      for (const item of parseExports(fs.readFileSync(path.join(cwd, file), 'utf8'), file)) currentNames.add(item.name);
    } catch {}
  }
  for (const item of previousExports) {
    if (!currentNames.has(item.name)) {
      issues.push({
        type: 'removed-export',
        severity: 'high',
        file: item.file,
        current: item.name,
        detectionMethod: 'regex',
        suggestion: `'${item.name}' was removed or renamed`,
      });
    }
  }
  return issues;
}

function checkChangelog(changedFiles, options = {}) {
  const cwd = options.cwd || process.cwd();
  const changelogPath = path.join(cwd, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) {
    return { exists: false, hasUnreleased: false, documented: [], undocumented: [], suggestion: null };
  }

  let content;
  try {
    content = fs.readFileSync(changelogPath, 'utf8');
  } catch (error) {
    return { exists: true, error: error.message, hasUnreleased: false, documented: [], undocumented: [] };
  }

  const hasUnreleased = /##\s*\[?Unreleased\]?/i.test(content);
  const documented = [];
  const undocumented = [];
  let commits = [];
  try {
    commits = execFileSync('git', ['log', '--oneline', '-10', 'HEAD'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim().split('\n').filter(Boolean);
  } catch {}

  for (const commit of commits) {
    const subject = commit.replace(/^[0-9a-f]+\s+/i, '');
    if (content.includes(subject)) documented.push(subject);
    else if (/^(feat|fix|breaking)/i.test(subject)) undocumented.push(subject);
  }

  return {
    exists: true,
    hasUnreleased,
    documented,
    undocumented,
    suggestion: undocumented.length ? `${undocumented.length} commits may need CHANGELOG entries` : null,
  };
}

function collect(options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const changedFiles = settings.changedFiles || [];
  const repoMapStatus = ensureRepoMapSync(settings);
  return {
    relatedDocs: findRelatedDocs(changedFiles, settings),
    changelog: checkChangelog(changedFiles, settings),
    markdownFiles: findMarkdownFiles(settings.cwd),
    repoMap: {
      available: repoMapStatus.available,
      fallbackReason: repoMapStatus.fallbackReason,
      stats: repoMapStatus.map ? {
        files: Object.keys(repoMapStatus.map.files || {}).length,
        symbols: repoMapStatus.map.stats?.totalSymbols || 0,
      } : null,
    },
    undocumentedExports: repoMapStatus.available
      ? findUndocumentedExports(changedFiles, { ...settings, repoMapStatus })
      : [],
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

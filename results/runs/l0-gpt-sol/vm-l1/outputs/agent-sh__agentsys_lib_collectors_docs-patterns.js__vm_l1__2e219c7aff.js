'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DEFAULT_OPTIONS = { cwd: process.cwd() };
const MAX_SCAN_DEPTH = 5;
const MAX_DOC_FILES = 200;
const INTERNAL_DIRS = [
  'internal',
  'private',
  '__tests__',
  'helpers',
  'utils',
  'test',
  'tests'
];
const ENTRY_NAMES = ['index', 'main', 'app', 'server', 'cli', 'bin'];

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
  const name = String(exportName || '');
  if (
    !name ||
    name.startsWith('_') ||
    name === 'default' ||
    name === '__esModule'
  ) {
    return true;
  }

  if (!filePath) return false;

  const segments = String(filePath)
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .map(segment => segment.toLowerCase());

  return segments.some(segment => INTERNAL_DIRS.includes(segment));
}

function isEntryPoint(filePath) {
  if (!filePath) return false;

  const normalized = String(filePath).replace(/\\/g, '/');
  const extension = path.extname(normalized);
  const basename = path.basename(normalized, extension).toLowerCase();

  return ENTRY_NAMES.includes(basename);
}

function walkSourceFiles(root, options = {}) {
  const maxDepth =
    Number.isInteger(options.maxDepth) && options.maxDepth >= 0
      ? options.maxDepth
      : MAX_SCAN_DEPTH;
  const files = [];
  const ignored = new Set([
    '.git',
    'node_modules',
    'coverage',
    'dist',
    'build',
    '.next',
    '.cache'
  ]);

  function visit(directory, depth) {
    if (depth > maxDepth) return;

    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (ignored.has(entry.name)) continue;

      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath, depth + 1);
      } else if (
        entry.isFile() &&
        /\.(?:[cm]?[jt]sx?)$/i.test(entry.name) &&
        !/\.d\.ts$/i.test(entry.name)
      ) {
        files.push(fullPath);
      }
    }
  }

  visit(root, 0);
  return files;
}

function parseExports(content, filePath) {
  const exports = [];
  const seen = new Set();

  function add(name, line, kind) {
    name = String(name || '').trim();
    if (!name || seen.has(name)) return;
    seen.add(name);
    exports.push({ name, file: filePath, line, kind });
  }

  const declarationPattern =
    /\bexport\s+(?:declare\s+)?(?:async\s+)?(function|class|const|let|var|enum|interface|type)\s+([A-Za-z_$][\w$]*)/g;
  let match;

  while ((match = declarationPattern.exec(content))) {
    add(match[2], findLineNumber(content, match.index), match[1]);
  }

  const exportListPattern = /\bexport\s*\{([^}]+)\}/g;
  while ((match = exportListPattern.exec(content))) {
    const line = findLineNumber(content, match.index);
    for (const item of match[1].split(',')) {
      const cleaned = item.trim().replace(/^type\s+/, '');
      if (!cleaned) continue;
      const alias = cleaned.match(
        /^([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/
      );
      if (alias) add(alias[2] || alias[1], line, 'named');
    }
  }

  const commonJsObject = /\bmodule\.exports\s*=\s*\{([\s\S]*?)\}/g;
  while ((match = commonJsObject.exec(content))) {
    const line = findLineNumber(content, match.index);
    for (const item of match[1].split(',')) {
      const property = item
        .trim()
        .match(/^([A-Za-z_$][\w$]*)(?:\s*:|\s*$)/);
      if (property) add(property[1], line, 'commonjs');
    }
  }

  const commonJsProperty =
    /\b(?:module\.)?exports\.([A-Za-z_$][\w$]*)\s*=/g;
  while ((match = commonJsProperty.exec(content))) {
    add(match[1], findLineNumber(content, match.index), 'commonjs');
  }

  if (/\bexport\s+default\b/.test(content)) {
    const index = content.search(/\bexport\s+default\b/);
    add('default', findLineNumber(content, index), 'default');
  }

  return exports;
}

function buildRepoMap(cwd) {
  const root = path.resolve(cwd || process.cwd());
  const files = walkSourceFiles(root);
  const entries = [];

  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    const exports = parseExports(content, file);
    entries.push({
      path: file,
      file,
      relativePath: path.relative(root, file),
      exports
    });
  }

  return {
    cwd: root,
    root,
    files: entries,
    generatedAt: new Date().toISOString()
  };
}

async function ensureRepoMap(options = {}) {
  if (repoMapModule) return repoMapModule;

  const cwd =
    typeof options === 'string'
      ? options
      : options.cwd || DEFAULT_OPTIONS.cwd;

  try {
    repoMapModule = buildRepoMap(cwd);
    repoMapLoadError = null;
    return repoMapModule;
  } catch (error) {
    repoMapLoadError = error;
    throw error;
  }
}

function ensureRepoMapSync(options = {}) {
  if (repoMapModule) return repoMapModule;

  const cwd =
    typeof options === 'string'
      ? options
      : options.cwd || DEFAULT_OPTIONS.cwd;

  try {
    repoMapModule = buildRepoMap(cwd);
    repoMapLoadError = null;
    return repoMapModule;
  } catch (error) {
    repoMapLoadError = error;
    throw error;
  }
}

function normalizeExport(item, fallbackFile) {
  if (typeof item === 'string') {
    return { name: item, file: fallbackFile };
  }

  if (!item || typeof item !== 'object') return null;

  const name =
    item.name ||
    item.exportName ||
    item.symbol ||
    item.identifier ||
    item.label;

  if (!name) return null;

  return {
    ...item,
    name: String(name),
    file:
      item.file ||
      item.path ||
      item.filePath ||
      item.source ||
      fallbackFile
  };
}

function getExportsFromRepoMap(repoMap, options = {}) {
  if (!repoMap) return [];

  const includeInternal = Boolean(options.includeInternal);
  const result = [];
  const seen = new Set();

  function add(item, fallbackFile) {
    const normalized = normalizeExport(item, fallbackFile);
    if (!normalized) return;
    if (
      !includeInternal &&
      isInternalExport(normalized.name, normalized.file)
    ) {
      return;
    }

    const key = `${normalized.file || ''}:${normalized.name}`;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(normalized);
  }

  function inspectFile(file, fallbackPath) {
    if (!file) return;

    const filePath =
      file.file ||
      file.path ||
      file.filePath ||
      file.relativePath ||
      fallbackPath;

    const values =
      file.exports ||
      file.exportedSymbols ||
      file.symbols ||
      file.publicExports;

    if (Array.isArray(values)) {
      values.forEach(value => add(value, filePath));
    } else if (values && typeof values === 'object') {
      for (const [name, value] of Object.entries(values)) {
        if (value && typeof value === 'object') {
          add({ name, ...value }, filePath);
        } else {
          add(name, filePath);
        }
      }
    }
  }

  if (Array.isArray(repoMap)) {
    repoMap.forEach(item => {
      if (typeof item === 'string' || item.name || item.exportName) {
        add(item);
      } else {
        inspectFile(item);
      }
    });
  } else if (typeof repoMap === 'object') {
    if (Array.isArray(repoMap.exports)) {
      repoMap.exports.forEach(item => add(item));
    }

    const files =
      repoMap.files ||
      repoMap.entries ||
      repoMap.modules ||
      repoMap.sources;

    if (Array.isArray(files)) {
      files.forEach(file => inspectFile(file));
    } else if (files && typeof files === 'object') {
      for (const [filePath, file] of Object.entries(files)) {
        inspectFile(file, filePath);
      }
    }
  }

  return result;
}

function findMarkdownFiles(input = DEFAULT_OPTIONS.cwd) {
  const options =
    typeof input === 'string' ? { cwd: input } : input || {};
  const cwd = path.resolve(options.cwd || DEFAULT_OPTIONS.cwd);
  const maxDepth =
    Number.isInteger(options.maxDepth) && options.maxDepth >= 0
      ? options.maxDepth
      : MAX_SCAN_DEPTH;
  const maxFiles =
    Number.isInteger(options.maxFiles) && options.maxFiles >= 0
      ? options.maxFiles
      : MAX_DOC_FILES;
  const result = [];
  const ignored = new Set([
    '.git',
    'node_modules',
    'coverage',
    'dist',
    'build',
    '.next',
    '.cache'
  ]);

  function visit(directory, depth) {
    if (depth > maxDepth || result.length >= maxFiles) return;

    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }

    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      if (result.length >= maxFiles) break;
      if (ignored.has(entry.name)) continue;

      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath, depth + 1);
      } else if (entry.isFile() && /\.md(?:own)?$/i.test(entry.name)) {
        result.push(fullPath);
      }
    }
  }

  visit(cwd, 0);
  return result;
}

function findRelatedDocs(input) {
  const options =
    typeof input === 'string'
      ? { name: input }
      : input || {};

  const name =
    options.name ||
    options.exportName ||
    options.symbol ||
    options.identifier ||
    '';
  if (!name) return [];

  const cwd = path.resolve(options.cwd || DEFAULT_OPTIONS.cwd);
  const markdownFiles =
    options.markdownFiles ||
    options.docs ||
    findMarkdownFiles({
      cwd,
      maxDepth: options.maxDepth,
      maxFiles: options.maxFiles
    });

  const exact = new RegExp(`\\b${escapeRegex(name)}\\b`, 'i');
  const related = [];

  for (const file of markdownFiles) {
    let content;
    try {
      content =
        typeof file === 'string'
          ? fs.readFileSync(file, 'utf8')
          : String(file.content || '');
    } catch {
      continue;
    }

    const filePath =
      typeof file === 'string' ? file : file.file || file.path;

    const match = exact.exec(content);
    if (!match) continue;

    related.push({
      file: filePath,
      path: filePath,
      line: findLineNumber(content, match.index),
      excerpt: content
        .split(/\r?\n/)
        [findLineNumber(content, match.index) - 1]
        .trim()
    });
  }

  return related;
}

function findUndocumentedExports(input = {}) {
  const options = Array.isArray(input) ? { exports: input } : input || {};
  const cwd = path.resolve(options.cwd || DEFAULT_OPTIONS.cwd);
  const repoMap = options.repoMap || repoMapModule || ensureRepoMapSync({ cwd });
  const exports = options.exports || getExportsFromRepoMap(repoMap, options);
  const markdownFiles =
    options.markdownFiles || options.docs || findMarkdownFiles({ cwd });

  return exports.filter(exported => {
    const item = normalizeExport(exported);
    if (!item || isInternalExport(item.name, item.file)) return false;

    return (
      findRelatedDocs({
        name: item.name,
        cwd,
        markdownFiles
      }).length === 0
    );
  });
}

function analyzeDocIssues(exportsOrOptions, maybeOptions = {}) {
  let options;
  let exports;

  if (Array.isArray(exportsOrOptions)) {
    exports = exportsOrOptions;
    options = maybeOptions || {};
  } else {
    options = exportsOrOptions || {};
    exports = options.exports;
  }

  const cwd = path.resolve(options.cwd || DEFAULT_OPTIONS.cwd);
  const undocumented = findUndocumentedExports({
    ...options,
    cwd,
    exports
  });

  return undocumented.map(item => ({
    type: 'undocumented-export',
    severity: 'warning',
    name: item.name,
    exportName: item.name,
    file: item.file,
    line: item.line,
    message: `Export "${item.name}" is not documented`
  }));
}

function findLineNumber(content, search) {
  content = String(content == null ? '' : content);

  let index;
  if (typeof search === 'number') {
    index = search;
  } else if (search instanceof RegExp) {
    const match = search.exec(content);
    index = match ? match.index : -1;
  } else {
    index = content.indexOf(String(search));
  }

  if (index < 0) return -1;
  return content.slice(0, index).split(/\r\n|\r|\n/).length;
}

function isValidGitRef(ref) {
  if (typeof ref !== 'string' || ref.length === 0 || ref.length > 255) {
    return false;
  }

  if (
    ref.startsWith('-') ||
    ref.startsWith('/') ||
    ref.endsWith('/') ||
    ref.endsWith('.') ||
    ref.includes('..') ||
    ref.includes('@{') ||
    ref.includes('//') ||
    ref.includes('\\') ||
    /[\x00-\x20\x7f~^:?*\[]/.test(ref)
  ) {
    return false;
  }

  return ref
    .split('/')
    .every(part => part && part !== '.' && part !== '..' && !part.endsWith('.lock'));
}

function getExportsFromGit(cwd, ref = 'HEAD') {
  if (typeof cwd === 'object' && cwd !== null) {
    ref = cwd.ref || cwd.gitRef || 'HEAD';
    cwd = cwd.cwd;
  }

  cwd = path.resolve(cwd || DEFAULT_OPTIONS.cwd);
  if (!isValidGitRef(ref)) {
    throw new TypeError(`Invalid git ref: ${ref}`);
  }

  const output = execFileSync(
    'git',
    ['ls-tree', '-r', '--name-only', ref],
    { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );

  const result = [];
  const seen = new Set();

  for (const relativeFile of output.split(/\r?\n/)) {
    if (
      !relativeFile ||
      !/\.(?:[cm]?[jt]sx?)$/i.test(relativeFile) ||
      /\.d\.ts$/i.test(relativeFile)
    ) {
      continue;
    }

    let content;
    try {
      content = execFileSync(
        'git',
        ['show', `${ref}:${relativeFile}`],
        { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
      );
    } catch {
      continue;
    }

    for (const exported of parseExports(content, relativeFile)) {
      if (isInternalExport(exported.name, relativeFile)) continue;
      const key = `${relativeFile}:${exported.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(exported);
    }
  }

  return result;
}

function compareVersions(left, right) {
  function parse(version) {
    const value = String(version == null ? '' : version)
      .trim()
      .replace(/^[v=]/i, '');
    const [core, prerelease = ''] = value.split('-', 2);
    const numbers = core.split('.').map(part => {
      const match = part.match(/^\d+/);
      return match ? Number(match[0]) : 0;
    });

    while (numbers.length < 3) numbers.push(0);
    return { numbers, prerelease: prerelease.split('.').filter(Boolean) };
  }

  const a = parse(left);
  const b = parse(right);
  const length = Math.max(a.numbers.length, b.numbers.length);

  for (let index = 0; index < length; index++) {
    const av = a.numbers[index] || 0;
    const bv = b.numbers[index] || 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }

  if (!a.prerelease.length && b.prerelease.length) return 1;
  if (a.prerelease.length && !b.prerelease.length) return -1;

  const prereleaseLength = Math.max(
    a.prerelease.length,
    b.prerelease.length
  );

  for (let index = 0; index < prereleaseLength; index++) {
    const av = a.prerelease[index];
    const bv = b.prerelease[index];

    if (av === undefined) return -1;
    if (bv === undefined) return 1;
    if (av === bv) continue;

    const an = /^\d+$/.test(av);
    const bn = /^\d+$/.test(bv);

    if (an && bn) return Number(av) > Number(bv) ? 1 : -1;
    if (an !== bn) return an ? -1 : 1;
    return av > bv ? 1 : -1;
  }

  return 0;
}

function checkChangelog(input = {}) {
  const options =
    typeof input === 'string' ? { cwd: input } : input || {};
  const cwd = path.resolve(options.cwd || DEFAULT_OPTIONS.cwd);

  let version = options.version;
  if (!version) {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')
      );
      version = packageJson.version;
    } catch {
      version = undefined;
    }
  }

  const candidates = options.file
    ? [path.resolve(cwd, options.file)]
    : [
        path.join(cwd, 'CHANGELOG.md'),
        path.join(cwd, 'CHANGES.md'),
        path.join(cwd, 'HISTORY.md')
      ];

  const changelog = candidates.find(file => {
    try {
      return fs.statSync(file).isFile();
    } catch {
      return false;
    }
  });

  if (!changelog) {
    return {
      ok: false,
      valid: false,
      version,
      file: null,
      message: 'No changelog file found'
    };
  }

  const content = fs.readFileSync(changelog, 'utf8');
  const documented =
    !version ||
    new RegExp(
      `(?:^|\\s|\\[|v)${escapeRegex(version)}(?:\\s|$|\\]|\\))`,
      'm'
    ).test(content);

  return {
    ok: documented,
    valid: documented,
    version,
    file: changelog,
    line: version ? findLineNumber(content, version) : -1,
    message: documented
      ? null
      : `Version ${version} is not documented in the changelog`
  };
}

function collect(options = {}) {
  const cwd = path.resolve(options.cwd || DEFAULT_OPTIONS.cwd);
  const repoMap = options.repoMap || ensureRepoMapSync({ cwd });
  const exports = getExportsFromRepoMap(repoMap, options);
  const markdownFiles = findMarkdownFiles({
    cwd,
    maxDepth: options.maxDepth,
    maxFiles: options.maxFiles
  });
  const issues = analyzeDocIssues(exports, {
    ...options,
    cwd,
    markdownFiles
  });
  const changelog = checkChangelog({ ...options, cwd });

  if (!changelog.ok) {
    issues.push({
      type: 'changelog',
      severity: 'warning',
      file: changelog.file,
      line: changelog.line,
      version: changelog.version,
      message: changelog.message
    });
  }

  return {
    cwd,
    exports,
    markdownFiles,
    issues,
    changelog,
    repoMapLoadError
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
  getRepoMapLoadError
};

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let repoMapModule = null;
let repoMapLoadError = null;

const DEFAULT_OPTIONS = {
  cwd: process.cwd()
};

const MAX_SCAN_DEPTH = 5;
const MAX_DOC_FILES = 200;

const INTERNAL_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.cache',
  '.next'
];

const ENTRY_NAMES = [
  'index',
  'main',
  'app',
  'cli',
  'server',
  'mod'
];

const EXPORT_PATTERNS = [
  /export\s+(?:function|class|const|let|var)\s+(\w+)/g,
  /export\s+\{([^}]+)\}/g,
  /module\.exports\s*=\s*\{([^}]+)\}/
];

function getRepoMap() {
  if (!repoMapModule && !repoMapLoadError) {
    try {
      repoMapModule = require('../work/agent-sh__agentsys/lib/repo-map/index.js');
    } catch (error) {
      repoMapLoadError = error && error.message ? error.message : String(error);
      repoMapModule = null;
    }
  }

  return repoMapModule;
}

function getRepoMapLoadError() {
  return repoMapLoadError;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isInternalExport(name, filePath) {
  if (name.includes('_')) {
    return true;
  }

  const normalizedPath = filePath.replace(/\\/g, '/');

  for (const directory of INTERNAL_DIRS) {
    if (
      normalizedPath.includes(`/${directory}/`) ||
      normalizedPath.includes(`\\${directory}\\`)
    ) {
      return true;
    }
  }

  return /\.(test|spec)\.[jt]sx?$/.test(filePath);
}

function isEntryPoint(filePath) {
  const baseName = path
    .basename(filePath)
    .replace(/\.[^.]+$/, '')
    .toLowerCase();

  return ENTRY_NAMES.includes(baseName);
}

async function ensureRepoMap(options = {}) {
  const cwd = options.cwd || process.cwd();
  const repoMap = getRepoMap();

  if (!repoMap) {
    return {
      available: false,
      map: null,
      fallbackReason: repoMapLoadError
    };
  }

  if (typeof repoMap.ensureRepoMap === 'function') {
    return repoMap.ensureRepoMap(options);
  }

  if (typeof repoMap.buildRepoMap === 'function') {
    return repoMap.buildRepoMap(options);
  }

  return {
    available: false,
    map: null,
    fallbackReason: 'Repository map module does not expose a supported builder'
  };
}

function ensureRepoMapSync(options = {}) {
  const cwd = options.cwd || process.cwd();
  const repoMap = getRepoMap();

  if (!repoMap) {
    return {
      available: false,
      map: null,
      fallbackReason: repoMapLoadError
    };
  }

  if (typeof repoMap.ensureRepoMapSync === 'function') {
    return repoMap.ensureRepoMapSync(options);
  }

  if (typeof repoMap.buildRepoMapSync === 'function') {
    return repoMap.buildRepoMapSync(options);
  }

  return {
    available: false,
    map: null,
    fallbackReason: 'Repository map module does not expose a supported synchronous builder'
  };
}

function getExportsFromRepoMap(filePath, repoMap) {
  if (!repoMap || !filePath) {
    return null;
  }

  const normalizedPath = filePath.replace(/\\/g, '/');
  let file = repoMap.files && repoMap.files[normalizedPath];

  if (!file && normalizedPath.startsWith('./')) {
    file = repoMap.files && repoMap.files[normalizedPath.slice(2)];
  }

  if (!file && repoMap.files) {
    const relativePath = normalizedPath.replace(/^\.\//, '');
    file = repoMap.files[relativePath];
  }

  if (!file || !Array.isArray(file.exports)) {
    return null;
  }

  return file.exports.map(entry =>
    typeof entry === 'string' ? entry : entry && (entry.name || entry.export)
  ).filter(Boolean);
}

function findUndocumentedExports(files, options = {}) {
  const repoMapStatus =
    options.repoMapStatus || ensureRepoMapSync({ ...DEFAULT_OPTIONS, ...options });

  if (!repoMapStatus || !repoMapStatus.available || !repoMapStatus.map) {
    return [];
  }

  const repoMap = repoMapStatus.map;
  const markdownFiles = findMarkdownFiles(options.cwd || process.cwd());
  let documentation = '';

  for (const file of markdownFiles) {
    try {
      documentation += fs.readFileSync(
        path.join(options.cwd || process.cwd(), file),
        'utf8'
      ) + '\n';
    } catch {
      // Ignore unreadable documentation files.
    }
  }

  const result = [];

  for (const filePath of files || []) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const entry =
      (repoMap.files && repoMap.files[normalizedPath]) ||
      (repoMap.files && repoMap.files[normalizedPath.replace(/^\.\//, '')]);

    if (!entry || !Array.isArray(entry.exports)) {
      continue;
    }

    for (const exported of entry.exports) {
      const name =
        typeof exported === 'string'
          ? exported
          : exported && (exported.name || exported.export);

      if (!name || isInternalExport(name, normalizedPath) || isEntryPoint(normalizedPath)) {
        continue;
      }

      const pattern = new RegExp(`\\b${escapeRegex(name)}\\b`);
      if (!pattern.test(documentation)) {
        result.push({
          type: 'undocumented-export',
          severity: 'warning',
          file: normalizedPath,
          export: name,
          line: exported && exported.line ? exported.line : 1,
          suggestion: `Document exported symbol "${name}".`
        });
      }
    }
  }

  return result;
}

function findRelatedDocs(files, options = {}) {
  const cwd = options.cwd || process.cwd();
  const markdownFiles = findMarkdownFiles(cwd);
  const related = [];

  for (const file of files || []) {
    const sourceBase = path.basename(file).replace(/\.[^.]+$/, '');
    const sourceName = path.basename(file);

    for (const markdownFile of markdownFiles) {
      let content;
      try {
        content = fs.readFileSync(path.join(cwd, markdownFile), 'utf8');
      } catch {
        continue;
      }

      const markdownBase = path.basename(markdownFile).replace(/\.[^.]+$/, '');

      if (
        content.includes(sourceName) ||
        content.includes(sourceBase) ||
        markdownBase === sourceBase ||
        markdownBase.toLowerCase().includes(sourceBase.toLowerCase())
      ) {
        related.push({
          document: markdownFile,
          source: file
        });
      }
    }
  }

  return related;
}

function findMarkdownFiles(root) {
  const result = [];

  function scan(directory, depth) {
    if (depth > MAX_SCAN_DEPTH || result.length >= MAX_DOC_FILES) {
      return;
    }

    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (result.length >= MAX_DOC_FILES) {
        break;
      }

      if (entry.name.startsWith('.') && entry.name !== '.github') {
        continue;
      }

      if (entry.isDirectory()) {
        if (INTERNAL_DIRS.includes(entry.name)) {
          continue;
        }
        scan(path.join(directory, entry.name), depth + 1);
        continue;
      }

      if (/\.(md|markdown)$/i.test(entry.name)) {
        result.push(path.relative(root, path.join(directory, entry.name)));
      }
    }
  }

  scan(root, 0);
  return result;
}

function findLineNumber(text, fragment) {
  const index = text.indexOf(fragment);
  if (index < 0) {
    return 1;
  }

  return text.slice(0, index).split('\n').length;
}

function compareVersions(left, right) {
  const a = String(left).split('.').map(Number);
  const b = String(right).split('.').map(Number);

  for (let index = 0; index < 3; index++) {
    const av = a[index] || 0;
    const bv = b[index] || 0;

    if (av > bv) return -1;
    if (av < bv) return 1;
  }

  return 0;
}

function analyzeDocIssues(filePath, sourcePath, options = {}) {
  let source;
  try {
    source = fs.readFileSync(path.join(options.cwd || process.cwd(), filePath), 'utf8');
  } catch {
    return [];
  }

  const issues = [];
  const sourceBase = path.basename(sourcePath).replace(/\.[^.]+$/, '');

  for (const pattern of EXPORT_PATTERNS) {
    pattern.lastIndex = 0;
    let match;

    while ((match = pattern.exec(source)) !== null) {
      const names = match[1]
        .split(',')
        .map(value => value.trim().split(/\s+as\s+/)[0].trim())
        .filter(Boolean);

      for (const name of names) {
        if (isInternalExport(name, filePath) || isEntryPoint(filePath)) {
          continue;
        }

        const docs = findRelatedDocs([filePath], options);
        const documented = docs.some(doc => {
          try {
            const text = fs.readFileSync(
              path.join(options.cwd || process.cwd(), doc.document),
              'utf8'
            );
            return new RegExp(`\\b${escapeRegex(name)}\\b`).test(text);
          } catch {
            return false;
          }
        });

        if (!documented) {
          issues.push({
            type: 'undocumented-export',
            severity: 'warning',
            file: filePath,
            export: name,
            line: findLineNumber(source, match[0]),
            suggestion: `Document exported symbol "${name}".`
          });
        }
      }
    }
  }

  return issues;
}

function checkChangelog(root, options = {}) {
  const cwd = root || options.cwd || process.cwd();
  const changelogCandidates = [
    'CHANGELOG.md',
    'CHANGELOG',
    'HISTORY.md',
    'CHANGES.md'
  ];

  let changelogPath = null;
  for (const candidate of changelogCandidates) {
    const candidatePath = path.join(cwd, candidate);
    if (fs.existsSync(candidatePath)) {
      changelogPath = candidatePath;
      break;
    }
  }

  if (!changelogPath) {
    return {
      exists: false,
      hasUnreleased: false,
      documented: [],
      undocumented: [],
      suggestion: null
    };
  }

  let content = '';
  try {
    content = fs.readFileSync(changelogPath, 'utf8');
  } catch {
    return {
      exists: false,
      hasUnreleased: false,
      documented: [],
      undocumented: [],
      suggestion: null
    };
  }

  let commits = [];
  try {
    commits = execFileSync(
      'git',
      ['log', '--pretty=%s', '-20'],
      { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    )
      .trim()
      .split('\n')
      .filter(Boolean);
  } catch {
    commits = [];
  }

  const documented = [];
  const undocumented = [];

  for (const commit of commits) {
    const subject = commit.trim();
    if (!subject) continue;

    if (content.includes(subject) || content.toLowerCase().includes(subject.toLowerCase())) {
      documented.push(subject);
    } else if (/^(feat|fix|breaking)/i.test(subject)) {
      undocumented.push(subject);
    }
  }

  return {
    exists: true,
    hasUnreleased: /^##?\s*\[?unreleased\]?/im.test(content),
    documented,
    undocumented,
    suggestion:
      undocumented.length > 0
        ? `Add ${undocumented.length} unreleased change${undocumented.length === 1 ? '' : 's'} to the changelog.`
        : null
  };
}

function collect(options = {}) {
  const merged = { ...DEFAULT_OPTIONS, ...options };
  const files = options.files || [];

  return {
    relatedDocs: findRelatedDocs(files, merged),
    changelog: checkChangelog(merged.cwd, merged),
    markdownFiles: findMarkdownFiles(merged.cwd),
    repoMap: (() => {
      const status = ensureRepoMapSync(merged);
      return {
        available: !!status.available,
        fallbackReason: status.fallbackReason || null,
        stats: status.map && status.map.stats ? status.map.stats : null
      };
    })(),
    undocumentedExports: findUndocumentedExports(files, merged)
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

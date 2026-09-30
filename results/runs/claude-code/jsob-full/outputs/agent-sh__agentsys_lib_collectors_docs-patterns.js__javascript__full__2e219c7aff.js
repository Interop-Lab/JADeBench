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
  'utils',
  'helpers',
  '__tests__',
  'test',
  'tests',
];
const ENTRY_NAMES = ['index', 'main', 'app', 'server', 'cli', 'bin'];
const EXPORT_PATTERNS = [
  /export\s+(?:function|class|const|let|var)\s+(\w+)/g,
  /export\s+\{([^}]+)\}/g,
  /module\.exports\s*=\s*\{([^}]+)\}/g,
];
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx']);

const repoMaps = new Map();
let repoMapLoadError = null;

function getRepoMapLoadError() {
  return repoMapLoadError;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isInternalExport(name, filePath) {
  if (name.startsWith('_')) return true;

  const normalizedPath = filePath.toLowerCase().replaceAll('\\', '/');
  if (INTERNAL_DIRS.some((directory) => normalizedPath.includes(`/${directory}/`))) {
    return true;
  }

  return /\.(test|spec)\.[jt]sx?$/.test(filePath);
}

function isEntryPoint(filePath) {
  const basename = path.basename(filePath).replace(/\.[^.]+$/, '').toLowerCase();
  return ENTRY_NAMES.includes(basename);
}

function extractExports(source) {
  const exports = [];

  for (const pattern of EXPORT_PATTERNS) {
    const matcher = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = matcher.exec(source)) !== null) {
      if (match[1].includes(',')) {
        const names = match[1]
          .split(',')
          .map((entry) => entry.trim().split(/\s+as\s+/).at(-1).trim())
          .filter((name) => name && /^\w+$/.test(name));
        exports.push(...names);
      } else {
        exports.push(match[1]);
      }
    }
  }

  return [...new Set(exports)];
}

function buildRepoMap(rootDirectory) {
  const files = {};
  let symbolCount = 0;

  function scan(directory, depth = 0) {
    if (depth > MAX_SCAN_DEPTH) return;

    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;

      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.')) scan(absolutePath, depth + 1);
        continue;
      }
      if (!entry.isFile() || !SOURCE_EXTENSIONS.has(path.extname(entry.name))) continue;

      try {
        const source = fs.readFileSync(absolutePath, 'utf8');
        const exportedNames = extractExports(source);
        const relativePath = path.relative(rootDirectory, absolutePath).replaceAll('\\', '/');
        files[relativePath] = {
          symbols: {
            exports: exportedNames.map((name) => ({
              name,
              kind: 'export',
              line: findLineNumber(source, name),
            })),
          },
        };
        symbolCount += exportedNames.length;
      } catch {
        // Files that cannot be read are omitted from the map.
      }
    }
  }

  scan(rootDirectory);
  return { files, meta: { symbolCount } };
}

async function ensureRepoMap(options = {}) {
  const { cwd } = { ...DEFAULT_OPTIONS, ...options };
  const existingMap = repoMaps.get(cwd);
  if (existingMap) {
    return { available: true, map: existingMap, fallbackReason: null };
  }

  try {
    const map = buildRepoMap(cwd);
    repoMaps.set(cwd, map);
    repoMapLoadError = null;
    return { available: true, map, fallbackReason: null };
  } catch (error) {
    repoMapLoadError = error.message;
    return { available: false, map: null, fallbackReason: error.message };
  }
}

function ensureRepoMapSync(options = {}) {
  const { cwd } = { ...DEFAULT_OPTIONS, ...options };
  const map = repoMaps.get(cwd);
  if (map) return { available: true, map, fallbackReason: null };

  return {
    available: false,
    map: null,
    fallbackReason: repoMapLoadError || 'repo-map-not-initialized',
  };
}

function getExportsFromRepoMap(filePath, repoMap) {
  if (!repoMap || !repoMap.files) return null;

  const normalizedPath = filePath.replaceAll('\\', '/');
  const file = repoMap.files[normalizedPath]
    || repoMap.files[normalizedPath.replace(/^\.\//, '')]
    || repoMap.files[`./${normalizedPath}`];

  if (!file?.symbols?.exports) return null;
  return file.symbols.exports.map((entry) => entry.name);
}

function findMarkdownFiles(rootDirectory) {
  const markdownFiles = [];
  const ignoredDirectories = new Set([
    'node_modules',
    'dist',
    'build',
    '.git',
    'coverage',
    'vendor',
  ]);

  function scan(directory, depth = 0) {
    if (depth > MAX_SCAN_DEPTH || markdownFiles.length > MAX_DOC_FILES) return;

    try {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const absolutePath = path.join(directory, entry.name);
        const relativePath = path.relative(rootDirectory, absolutePath);

        if (entry.isDirectory()) {
          if (!ignoredDirectories.has(entry.name) && !entry.name.startsWith('.')) {
            scan(absolutePath, depth + 1);
          }
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          markdownFiles.push(relativePath);
        }
      }
    } catch {
      // Unreadable directories are skipped.
    }
  }

  scan(rootDirectory);
  return markdownFiles;
}

function findRelatedDocs(changedFiles, options = {}) {
  const { cwd } = { ...DEFAULT_OPTIONS, ...options };
  const results = [];

  for (const changedFile of changedFiles) {
    const basename = path.basename(changedFile).replace(/\.[^.]+$/, '');
    const pathWithoutExtension = changedFile.replace(/\.[^.]+$/, '');

    for (const markdownFile of findMarkdownFiles(cwd)) {
      let contents;
      try {
        contents = fs.readFileSync(path.join(cwd, markdownFile), 'utf8');
      } catch {
        continue;
      }

      const reasons = [];
      if (contents.includes(basename)) reasons.push('basename');
      if (contents.includes(changedFile)) reasons.push('path');
      if (
        contents.includes(`'${pathWithoutExtension}'`)
        || contents.includes(`"${pathWithoutExtension}"`)
      ) {
        reasons.push('import-path');
      }
      if (
        contents.includes(`require('${pathWithoutExtension}')`)
        || contents.includes(`require("${pathWithoutExtension}")`)
      ) {
        reasons.push('require-path');
      }
      if (contents.includes(`/${basename}`) || contents.includes(`/${basename}.`)) {
        reasons.push('link');
      }

      if (reasons.length > 0) results.push({ markdownFile, changedFile, reasons });
    }
  }

  return results;
}

function findUndocumentedExports(changedFiles, options = {}) {
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };
  const repoMapStatus = resolvedOptions.repoMapStatus || ensureRepoMapSync(resolvedOptions);
  if (!repoMapStatus.available || !repoMapStatus.map) return [];

  let documentation = '';
  for (const markdownFile of findMarkdownFiles(resolvedOptions.cwd)) {
    try {
      documentation += `${fs.readFileSync(path.join(resolvedOptions.cwd, markdownFile), 'utf8')}\n`;
    } catch {
      // Ignore unreadable documentation files.
    }
  }

  const issues = [];
  for (const changedFile of changedFiles) {
    const normalizedPath = changedFile.replaceAll('\\', '/');
    const file = repoMapStatus.map.files[normalizedPath]
      || repoMapStatus.map.files[normalizedPath.replace(/^\.\//, '')];
    if (!file?.symbols?.exports) continue;

    for (const exportedSymbol of file.symbols.exports) {
      if (isInternalExport(exportedSymbol.name, normalizedPath)) continue;
      if (isEntryPoint(normalizedPath)) continue;
      if (new RegExp(`\\b${escapeRegex(exportedSymbol.name)}\\b`).test(documentation)) continue;

      issues.push({
        type: 'undocumented-export',
        severity: 'low',
        file: normalizedPath,
        name: exportedSymbol.name,
        line: exportedSymbol.line || 0,
        kind: exportedSymbol.kind || 'export',
        certainty: 'MEDIUM',
        suggestion: `Export '${exportedSymbol.name}' in ${normalizedPath} is not mentioned in any documentation`,
      });
    }
  }

  return issues;
}

function findLineNumber(contents, text) {
  const index = contents.indexOf(text);
  if (index === -1) return 0;
  return contents.slice(0, index).split('\n').length;
}

function isValidGitRef(ref) {
  return typeof ref === 'string'
    && ref.length > 0
    && /^[a-zA-Z0-9_./-]+(?:[~^][0-9]+)?$/.test(ref);
}

function getExportsFromGit(filePath, ref, options = {}) {
  const { cwd } = { ...DEFAULT_OPTIONS, ...options };
  if (!isValidGitRef(ref)) return [];

  try {
    const source = execFileSync('git', ['show', `${ref}:${filePath}`], {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return extractExports(source);
  } catch {
    return [];
  }
}

function compareVersions(leftVersion, rightVersion) {
  const left = leftVersion.split('.').map(Number);
  const right = rightVersion.split('.').map(Number);

  for (let index = 0; index < 3; index += 1) {
    const leftPart = left[index] || 0;
    const rightPart = right[index] || 0;
    if (leftPart < rightPart) return -1;
    if (leftPart > rightPart) return 1;
  }

  return 0;
}

function analyzeDocIssues(markdownFile, sourceFile, options = {}) {
  const { cwd } = { ...DEFAULT_OPTIONS, ...options };
  const issues = [];
  let contents;

  try {
    contents = fs.readFileSync(path.join(cwd, markdownFile), 'utf8');
  } catch {
    return issues;
  }

  const fencedBlocks = contents.match(/```[\s\S]*?```/g) || [];
  for (const block of fencedBlocks) {
    for (const match of block.matchAll(/import .* from ['"]([^'"]+)['"]/g)) {
      if (match[1].includes(path.basename(sourceFile.replace(/\.[^.]+$/, '')))) {
        issues.push({
          type: 'code-example',
          severity: 'medium',
          line: findLineNumber(contents, match[0]),
          current: match[1],
          suggestion: 'Verify import path is still valid',
        });
      }
    }
  }

  const repoMapStatus = ensureRepoMapSync({ ...DEFAULT_OPTIONS, ...options });
  let previousExports;
  let currentExports;
  let usedRepoMap = false;

  if (repoMapStatus.available && repoMapStatus.map) {
    currentExports = getExportsFromRepoMap(sourceFile, repoMapStatus.map);
    if (currentExports) {
      previousExports = getExportsFromGit(sourceFile, 'HEAD~1', options);
      usedRepoMap = true;
    }
  }
  if (!usedRepoMap) {
    previousExports = getExportsFromGit(sourceFile, 'HEAD~1', options);
    currentExports = getExportsFromGit(sourceFile, 'HEAD', options);
  }

  for (const removedExport of previousExports.filter((name) => !currentExports.includes(name))) {
    if (contents.includes(removedExport)) {
      issues.push({
        type: 'removed-export',
        severity: 'high',
        reference: removedExport,
        suggestion: `'${removedExport}' was removed or renamed`,
        detectionMethod: usedRepoMap ? 'repo-map' : 'regex',
      });
    }
  }

  try {
    const packageVersion = JSON.parse(
      fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'),
    ).version;
    for (const match of contents.matchAll(/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi)) {
      const documentedVersion = match[1];
      if (
        documentedVersion !== packageVersion
        && compareVersions(documentedVersion, packageVersion) < 0
      ) {
        issues.push({
          type: 'outdated-version',
          severity: 'low',
          line: findLineNumber(contents, match[0]),
          current: documentedVersion,
          expected: packageVersion,
          suggestion: `Update version from ${documentedVersion} to ${packageVersion}`,
        });
      }
    }
  } catch {
    // A missing or invalid package manifest does not prevent other checks.
  }

  return issues;
}

function checkChangelog(changedFiles, options = {}) {
  const { cwd } = { ...DEFAULT_OPTIONS, ...options };
  const changelogPath = path.join(cwd, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) return { exists: false };

  let contents;
  try {
    contents = fs.readFileSync(changelogPath, 'utf8');
  } catch {
    return { exists: false, error: 'Unable to read changelog' };
  }

  const hasUnreleased = contents.includes('Unreleased');
  let subjects = [];
  try {
    subjects = execFileSync('git', ['log', '--pretty=%s', '--no-merges', '-20'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim().split('\n');
  } catch {
    // Changelog presence is still useful outside a Git checkout.
  }

  const documented = [];
  const undocumented = [];
  for (const subject of subjects) {
    if (!subject) continue;
    const summary = subject.substring(0, 72);
    if (contents.includes(summary) || contents.includes(subject.substring(0, 40))) {
      documented.push(summary);
    } else if (/^(feat|fix|breaking)/i.test(summary)) {
      undocumented.push(summary);
    }
  }

  return {
    exists: true,
    hasUnreleased,
    documented,
    undocumented,
    suggestion: undocumented.length > 0
      ? `${undocumented.length} user-facing commits may need changelog entries`
      : null,
  };
}

function collect(options = {}) {
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };
  const changedFiles = resolvedOptions.changedFiles || [];
  const repoMapStatus = ensureRepoMapSync(resolvedOptions);

  return {
    relatedDocs: findRelatedDocs(changedFiles, resolvedOptions),
    changelog: checkChangelog(changedFiles, resolvedOptions),
    markdownFiles: findMarkdownFiles(resolvedOptions.cwd),
    repoMap: {
      available: repoMapStatus.available,
      fallbackReason: repoMapStatus.fallbackReason,
      stats: repoMapStatus.map
        ? {
            files: Object.keys(repoMapStatus.map.files || {}).length,
            symbols: repoMapStatus.map.meta?.symbolCount || 0,
          }
        : null,
    },
    undocumentedExports: repoMapStatus.available
      ? findUndocumentedExports(changedFiles, { ...resolvedOptions, repoMapStatus })
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

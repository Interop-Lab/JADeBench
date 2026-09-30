'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let repoMapModule = null;
let repoMapLoadError = null;

function getRepoMap() {
  if (!repoMapModule && !repoMapLoadError) {
    try {
      repoMapModule = require('./repo-map');
    } catch (error) {
      repoMapLoadError = error.message || 'Failed to load repo-map module';
      repoMapModule = null;
    }
  }
  return repoMapModule;
}

function getRepoMapLoadError() {
  return repoMapLoadError;
}

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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isInternalExport(name, filePath) {
  if (name.startsWith('_')) return true;
  const normalized = filePath.toLowerCase();
  if (INTERNAL_DIRS.some((directory) =>
    normalized.includes(`/${directory}/`) || normalized.includes(`\\${directory}\\`)
  )) return true;
  return /\.(test|spec)\.[jt]sx?$/.test(filePath);
}

function isEntryPoint(filePath) {
  const baseName = path.basename(filePath).replace(/\.[^.]+$/, '').toLowerCase();
  return ENTRY_NAMES.includes(baseName);
}

async function ensureRepoMap(options = {}) {
  const { cwd = process.cwd() } = options;
  const repoMap = getRepoMap();
  if (!repoMap) return { available: false, map: null, fallbackReason: getRepoMapLoadError() };
  try {
    if (repoMap.exists?.(cwd)) return { available: true, map: repoMap.load?.(cwd), fallbackReason: null };
    const result = await repoMap.generate?.(cwd, { quiet: true });
    if (result?.success) return { available: true, map: result.map || repoMap.load?.(cwd), fallbackReason: null };
    return { available: false, map: null, fallbackReason: result?.error || 'Repository map unavailable' };
  } catch (error) {
    return { available: false, map: null, fallbackReason: error.message || 'Repository map unavailable' };
  }
}

function ensureRepoMapSync(options = {}) {
  const { cwd = process.cwd() } = options;
  const repoMap = getRepoMap();
  if (!repoMap) {
    return { available: false, map: null, fallbackReason: 'repo-map-module-not-found' };
  }
  if (repoMap.exists(cwd)) {
    return { available: true, map: repoMap.load(cwd), fallbackReason: null };
  }
  return { available: false, map: null, fallbackReason: 'repo-map-not-initialized' };
}

function getExportsFromRepoMap(filePath, repoMap) {
  if (!repoMap?.files) return null;

  const normalizedPath = filePath.replace(/\\/g, '/');
  const file = repoMap.files[normalizedPath]
    || repoMap.files[normalizedPath.replace(/^\.\//, '')]
    || repoMap.files[`./${normalizedPath}`];

  if (!file?.symbols?.exports) return null;
  return file.symbols.exports.map((exported) => exported.name);
}

function parseExportList(list) {
  return list.split(',').map((item) => item.trim().split(/\s+as\s+/).pop()).filter(Boolean);
}

function findUndocumentedExports(changedFiles = [], options = {}) {
  const cwd = options.cwd || process.cwd();
  const status = options.repoMapStatus || ensureRepoMapSync(options);
  if (!status.available || !status.map) return [];

  const documentation = findMarkdownFiles(cwd).map((file) => {
    try {
      return fs.readFileSync(path.join(cwd, file), 'utf8');
    } catch {
      return '';
    }
  }).join('\n');

  const issues = [];
  for (const changedFile of changedFiles) {
    const normalizedPath = changedFile.replace(/\\/g, '/');
    const file = status.map.files[normalizedPath]
      || status.map.files[normalizedPath.replace(/^\.\//, '')];
    if (!file?.symbols?.exports) continue;

    for (const exported of file.symbols.exports) {
      if (isInternalExport(exported.name, normalizedPath) || isEntryPoint(normalizedPath)) continue;
      if (new RegExp(`\\b${escapeRegex(exported.name)}\\b`).test(documentation)) continue;
      issues.push({
        type: 'undocumented-export',
        severity: 'low',
        file: normalizedPath,
        name: exported.name,
        line: exported.line || 0,
        kind: exported.kind || 'export',
        priority: 'MEDIUM',
        suggestion: `Document '${exported.name}' in ${normalizedPath} or ensure it is mentioned in project documentation`,
      });
    }
  }
  return issues;
}

function findMarkdownFiles(cwd = process.cwd()) {
  const markdownFiles = [];
  const ignoredDirectories = ['node_modules', 'dist', 'build', '.git', 'coverage', 'vendor'];

  function visit(directory, depth = 0) {
    if (depth > MAX_SCAN_DEPTH || markdownFiles.length > MAX_DOC_FILES) return;
    try {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const fullPath = path.join(directory, entry.name);
        const relativePath = path.relative(cwd, fullPath);
        if (entry.isDirectory()) {
          if (!ignoredDirectories.includes(entry.name) && !entry.name.startsWith('.')) {
            visit(fullPath, depth + 1);
          }
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          markdownFiles.push(relativePath);
        }
      }
    } catch {}
  }

  visit(cwd);
  return markdownFiles;
}

function findRelatedDocs(changedFiles = [], options = {}) {
  const cwd = options.cwd || process.cwd();
  const markdownFiles = findMarkdownFiles(cwd);
  const relatedDocs = [];

  for (const changedFile of changedFiles) {
    const baseName = path.basename(changedFile).replace(/\.[^.]+$/, '');
    const pathWithoutExtension = changedFile.replace(/\.[^.]+$/, '');
    for (const doc of markdownFiles) {
      let content;
      try {
        content = fs.readFileSync(path.join(cwd, doc), 'utf8');
      } catch {
        continue;
      }

      const referenceTypes = [];
      if (content.includes(baseName)) referenceTypes.push('filename');
      if (content.includes(changedFile)) referenceTypes.push('full-path');
      if (content.includes(`from '${pathWithoutExtension}'`)
        || content.includes(`from "${pathWithoutExtension}"`)) referenceTypes.push('import');
      if (content.includes(`require('${pathWithoutExtension}')`)
        || content.includes(`require("${pathWithoutExtension}")`)) referenceTypes.push('require');
      if (content.includes(`/${baseName}`) || content.includes(`/${baseName}.`)) {
        referenceTypes.push('url-path');
      }
      if (referenceTypes.length > 0) relatedDocs.push({ doc, referencedFile: changedFile, referenceTypes });
    }
  }
  return relatedDocs;
}

function findLineNumber(content, text) {
  const index = content.indexOf(text);
  return index === -1 ? 0 : content.substring(0, index).split('\n').length;
}

function analyzeDocIssues(docFile, referencedFile, options = {}) {
  const resolved = { ...DEFAULT_OPTIONS, ...options };
  const issues = [];
  let content;
  try {
    content = fs.readFileSync(path.join(resolved.cwd, docFile), 'utf8');
  } catch {
    return issues;
  }

  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  for (const codeBlock of codeBlocks) {
    const imports = /import .* from ['"]([^'"]+)['"]/g;
    let match;
    while ((match = imports.exec(codeBlock)) !== null) {
      const referencedStem = referencedFile.replace(/\.[^.]+$/, '');
      if (match[1].includes(path.basename(referencedStem))) {
        issues.push({
          type: 'code-example',
          severity: 'medium',
          line: findLineNumber(content, match[0]),
          current: match[1],
          suggestion: 'Verify import path is still valid',
        });
      }
    }
  }

  const repoMapStatus = ensureRepoMapSync(resolved);
  let previousExports;
  let currentExports;
  let usedRepoMap = false;
  if (repoMapStatus.available && repoMapStatus.map) {
    const repoMapExports = getExportsFromRepoMap(referencedFile, repoMapStatus.map);
    if (repoMapExports) {
      currentExports = repoMapExports;
      previousExports = getExportsFromGit(referencedFile, 'HEAD~1', resolved);
      usedRepoMap = true;
    }
  }
  if (!usedRepoMap) {
    previousExports = getExportsFromGit(referencedFile, 'HEAD~1', resolved);
    currentExports = getExportsFromGit(referencedFile, 'HEAD', resolved);
  }

  for (const removedExport of previousExports.filter((name) => !currentExports.includes(name))) {
    if (content.includes(removedExport)) {
      issues.push({
        type: 'stale-export',
        severity: 'medium',
        name: removedExport,
        suggestion: `'${removedExport}' may have been removed or renamed`,
        detectionMethod: usedRepoMap ? 'repo-map' : 'regex',
      });
    }
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(resolved.cwd, 'package.json'), 'utf8'));
    for (const match of content.matchAll(/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi)) {
      const documentedVersion = match[1];
      if (documentedVersion !== packageJson.version
        && compareVersions(documentedVersion, packageJson.version) < 0) {
        issues.push({
          type: 'stale-version',
          severity: 'low',
          line: findLineNumber(content, match[0]),
          current: documentedVersion,
          expected: packageJson.version,
          suggestion: `Update version from ${documentedVersion} to ${packageJson.version}`,
        });
      }
    }
  } catch {}

  return issues;
}

function isValidGitRef(ref) {
  return typeof ref === 'string'
    && ref.length > 0
    && /^[a-zA-Z0-9_./-]+(?:[~^][0-9]+)?$/.test(ref);
}

function getExportsFromGit(filePath, ref, options = {}) {
  if (!isValidGitRef(ref)) return [];
  const resolved = { ...DEFAULT_OPTIONS, ...options };

  try {
    const content = execFileSync('git', ['show', `${ref}:${filePath}`], {
      cwd: resolved.cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const exportedNames = [];
    for (const pattern of EXPORT_PATTERNS) {
      const matcher = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = matcher.exec(content)) !== null) {
        if (match[1].includes(',')) {
          exportedNames.push(...parseExportList(match[1]).filter((name) => /^\w+$/.test(name)));
        } else {
          exportedNames.push(match[1]);
        }
      }
    }
    return [...new Set(exportedNames)];
  } catch {
    return [];
  }
}

function compareVersions(firstVersion, secondVersion) {
  const first = firstVersion.split('.').map(Number);
  const second = secondVersion.split('.').map(Number);
  for (let index = 0; index < 3; index++) {
    const firstPart = first[index] || 0;
    const secondPart = second[index] || 0;
    if (firstPart < secondPart) return -1;
    if (firstPart > secondPart) return 1;
  }
  return 0;
}

function checkChangelog(changedFiles = [], options = {}) {
  const cwd = options.cwd || process.cwd();
  const changelogPath = path.join(cwd, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) return { exists: false };

  let content;
  try {
    content = fs.readFileSync(changelogPath, 'utf8');
  } catch {
    return { exists: false, error: 'Could not read CHANGELOG.md' };
  }

  const hasUnreleased = content.includes('## [Unreleased]');
  let commits = [];
  try {
    commits = execFileSync('git', ['log', '--oneline', '-10', 'HEAD'], {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim().split('\n');
  } catch {}

  const documented = [];
  const undocumented = [];
  for (const commit of commits) {
    if (!commit) continue;
    const message = commit.substring(8);
    if (content.includes(message) || content.includes(commit.substring(0, 7))) {
      documented.push(message);
    } else if (/^(feat|fix|breaking)/i.test(message)) {
      undocumented.push(message);
    }
  }
  return {
    exists: true,
    hasUnreleased,
    documented,
    undocumented,
    suggestion: undocumented.length > 0
      ? `${undocumented.length} commits may need CHANGELOG entries`
      : null,
  };
}

function collect(options = {}) {
  const resolved = { ...DEFAULT_OPTIONS, ...options };
  const changedFiles = resolved.changedFiles || [];
  const repoMapStatus = ensureRepoMapSync(resolved);
  return {
    relatedDocs: findRelatedDocs(changedFiles, resolved),
    changelog: checkChangelog(changedFiles, resolved),
    markdownFiles: findMarkdownFiles(resolved.cwd),
    repoMap: {
      available: repoMapStatus.available,
      fallbackReason: repoMapStatus.fallbackReason,
      stats: repoMapStatus.map ? {
        files: Object.keys(repoMapStatus.map.files || {}).length,
        symbols: repoMapStatus.map.stats?.totalSymbols || 0,
      } : null,
    },
    undocumentedExports: repoMapStatus.available
      ? findUndocumentedExports(changedFiles, { ...resolved, repoMapStatus })
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

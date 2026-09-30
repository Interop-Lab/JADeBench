'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DEFAULT_OPTIONS = { cwd: process.cwd() };
const MAX_SCAN_DEPTH = 5;
const MAX_DOC_FILES = 200;
const SKIPPED_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  'vendor',
]);
const INTERNAL_DIRECTORIES = [
  'internal',
  'private',
  'utils',
  'helpers',
  '__tests__',
  'test',
  'tests',
];
const ENTRY_POINT_NAMES = ['index', 'main', 'app', 'server', 'cli', 'bin'];
const EXPORT_PATTERNS = [
  /export\s+(?:function|class|const|let|var)\s+(\w+)/g,
  /export\s+\{([^}]+)\}/g,
  /module\.exports\s*=\s*\{([^}]+)\}/g,
];

let repoMapModule = null;
let repoMapLoadError = null;

function getRepoMap() {
  if (repoMapModule || repoMapLoadError) return repoMapModule;
  try {
    repoMapModule = require('./lib/repo-map');
  } catch {
    // The original bundle embeds this module. Keep its unavailable-state
    // behavior when the recovered source is used without the rest of the tree.
    repoMapModule = { exists: () => false };
  }
  return repoMapModule;
}

function getRepoMapLoadError() {
  return repoMapLoadError;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isInternalExport(exportName, filePath) {
  if (exportName.startsWith('_')) return true;

  const normalizedPath = filePath.toLowerCase().replace(/\\/g, '/');
  if (INTERNAL_DIRECTORIES.some((directory) => normalizedPath.split('/').includes(directory))) {
    return true;
  }

  return /\.(test|spec)\.[jt]sx?$/.test(normalizedPath);
}

function isEntryPoint(filePath) {
  const fileName = path.basename(filePath).replace(/\.[^.]+$/, '').toLowerCase();
  return ENTRY_POINT_NAMES.includes(fileName);
}

async function ensureRepoMap(options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const repoMap = getRepoMap();
  if (!repoMap) {
    return { available: false, map: null, fallbackReason: 'repo-map-module-not-found' };
  }

  try {
    if (repoMap.exists?.(settings.cwd)) {
      return { available: true, map: await repoMap.load(settings.cwd) };
    }

    if (settings.askUser && repoMap.checkAstGrepInstalled) {
      const astGrep = await repoMap.checkAstGrepInstalled();
      if (!astGrep?.found) {
        const answer = await settings.askUser({
          question: 'ast-grep not found. Install for better doc sync accuracy?',
          header: 'ast-grep Required',
          options: [
            { label: 'Yes, show instructions', description: 'Better accuracy with AST-based symbol detection' },
            { label: 'No, use regex fallback', description: 'Less accurate but works without additional install' },
          ],
        });
        if (String(answer).includes('Yes')) {
          return {
            available: false,
            map: null,
            fallbackReason: 'ast-grep-install-pending',
            installInstructions: repoMap.getInstallInstructions?.(),
          };
        }
        return { available: false, map: null, fallbackReason: 'ast-grep-not-installed' };
      }
    }

    const result = await repoMap.init?.(settings.cwd, { force: settings.force });
    if (result?.success || result?.error === 'already exists') {
      return { available: true, map: await repoMap.load(settings.cwd) };
    }
    return { available: false, map: null, fallbackReason: 'init-failed', error: result?.error };
  } catch (error) {
    return { available: false, map: null, fallbackReason: 'init-error', error: error.message };
  }
}

function ensureRepoMapSync(options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const repoMap = getRepoMap();
  if (!repoMap) {
    return { available: false, map: null, fallbackReason: 'repo-map-module-not-found' };
  }

  try {
    if (!repoMap.exists?.(settings.cwd)) {
      return { available: false, map: null, fallbackReason: 'repo-map-not-initialized' };
    }
    return { available: true, map: repoMap.load(settings.cwd) };
  } catch (error) {
    return { available: false, map: null, fallbackReason: 'repo-map-not-initialized', error: error.message };
  }
}

function getExportsFromRepoMap(filePath, repoMap) {
  const normalizedPath = filePath.replace(/\\/g, '/').replace(/^\.\//, '');
  const fileRecord = repoMap?.files instanceof Map
    ? repoMap.files.get(normalizedPath)
    : repoMap?.files?.[normalizedPath];
  const exports = fileRecord?.symbols?.exports;
  if (!exports) return null;
  return exports.map((name) => ({ name, file: normalizedPath }));
}

function findUndocumentedExports(options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const repoMapStatus = ensureRepoMapSync(settings);
  if (!repoMapStatus.available) return [];

  const markdown = findMarkdownFiles(settings.cwd)
    .map((file) => fs.readFileSync(path.join(settings.cwd, file), 'utf8'))
    .join('\n');
  const mapFiles = repoMapStatus.map.files instanceof Map
    ? [...repoMapStatus.map.files.keys()]
    : Object.keys(repoMapStatus.map.files || {});
  const exports = mapFiles.flatMap((file) => getExportsFromRepoMap(file, repoMapStatus.map) || []);

  return exports
    .filter((item) => item?.name)
    .filter((item) => !isInternalExport(item.name, item.file))
    .filter((item) => !isEntryPoint(item.file))
    .filter((item) => !new RegExp(`\\b${escapeRegex(item.name)}\\b`).test(markdown))
    .map((item) => ({
      type: 'undocumented-export',
      severity: 'low',
      file: item.file,
      line: item.line || 0,
      kind: item.kind || 'export',
      certainty: 'MEDIUM',
      message: `Export '${item.name}' in ${item.file} is not mentioned in any documentation`,
      suggestion: null,
    }));
}

function findMarkdownFiles(cwd) {
  const markdownFiles = [];

  function scan(directory, depth) {
    if (depth > MAX_SCAN_DEPTH || markdownFiles.length >= MAX_DOC_FILES) return;
    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (markdownFiles.length >= MAX_DOC_FILES) break;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(entry.name) && !entry.name.startsWith('.')) scan(fullPath, depth + 1);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        markdownFiles.push(path.relative(cwd, fullPath).replace(/\\/g, '/'));
      }
    }
  }

  scan(cwd, 0);
  return markdownFiles;
}

function findRelatedDocs(changedFiles, options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const markdownFiles = findMarkdownFiles(settings.cwd);
  const results = [];

  for (const changedFile of changedFiles) {
    const normalizedFile = changedFile.replace(/\\/g, '/').replace(/^\.\//, '');
    const fileName = path.basename(normalizedFile);
    const stem = fileName.replace(/\.[^.]+$/, '');
    const urlPath = normalizedFile.replace(/\.[^.]+$/, '');

    for (const doc of markdownFiles) {
      const content = fs.readFileSync(path.join(settings.cwd, doc), 'utf8');
      const referenceTypes = [];
      if (content.includes(fileName) || content.includes(stem)) referenceTypes.push('filename');
      if (content.includes(normalizedFile) || content.includes(`from '${urlPath}'`) || content.includes(`from "${urlPath}"`)) {
        referenceTypes.push('full-path');
      }
      if (content.includes(`import ${normalizedFile}`) || content.includes(`require('${normalizedFile}')`) ||
          content.includes(`require("${normalizedFile}")`) || content.includes(urlPath)) {
        referenceTypes.push('url-path');
      }
      if (referenceTypes.length) results.push({ doc, referencedFile: changedFile, referenceTypes });
    }
  }

  return results;
}

function findLineNumber(content, text) {
  const index = content.indexOf(text);
  return index < 0 ? 0 : content.substring(0, index).split('\n').length;
}

function isValidGitRef(reference) {
  return typeof reference === 'string' && /^[a-zA-Z0-9_./-]+(?:[~^][0-9]+)?$/.test(reference);
}

function parseExports(source, file) {
  const found = [];
  for (const pattern of EXPORT_PATTERNS) {
    const matcher = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = matcher.exec(source))) {
      const names = pattern === EXPORT_PATTERNS[0]
        ? [match[1]]
        : match[1].split(',').map((part) => part.trim().split(/\s+as\s+/)[0]).filter((name) => /^\w+$/.test(name));
      for (const name of names) found.push({ name, file });
    }
  }
  return found;
}

function getExportsFromGit(file, reference, options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  if (!isValidGitRef(reference)) return [];
  try {
    const source = execFileSync('git', ['show', `${reference}:${file}`], {
      cwd: settings.cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return parseExports(source, file);
  } catch {
    return [];
  }
}

function compareVersions(left, right) {
  const leftParts = left.split('.').map(Number);
  const rightParts = right.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    const difference = (leftParts[index] || 0) - (rightParts[index] || 0);
    if (difference) return difference > 0 ? 1 : -1;
  }
  return 0;
}

function analyzeDocIssues(markdownFile, options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const issues = [];
  try {
    const content = fs.readFileSync(path.join(settings.cwd, markdownFile), 'utf8');
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    for (const block of codeBlocks) {
      const importPattern = /import .* from ['"]([^'"]+)['"]/g;
      let match;
      while ((match = importPattern.exec(block))) {
        const importedPath = match[1];
        if (importedPath.startsWith('.') && !fs.existsSync(path.resolve(settings.cwd, path.dirname(markdownFile), importedPath))) {
          issues.push({
            type: 'code-example',
            severity: 'medium',
            file: markdownFile,
            line: findLineNumber(content, match[0]),
            current: importedPath,
            suggestion: 'Verify import path is still valid',
          });
        }
      }
    }

    const packageFile = path.join(settings.cwd, 'package.json');
    if (fs.existsSync(packageFile)) {
      const packageVersion = JSON.parse(fs.readFileSync(packageFile, 'utf8')).version;
      for (const match of content.matchAll(/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi)) {
        if (compareVersions(match[1], packageVersion) < 0) {
          issues.push({
            type: 'outdated-version',
            severity: 'low',
            file: markdownFile,
            line: findLineNumber(content, match[0]),
            current: match[1],
            expected: packageVersion,
            suggestion: `Update version from ${match[1]} to ${packageVersion}`,
          });
        }
      }
    }
  } catch {
    return [];
  }

  return issues;
}

function checkChangelog(changedFiles, options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const changelogPath = path.join(settings.cwd, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) return { exists: false };

  let changelog;
  try {
    changelog = fs.readFileSync(changelogPath, 'utf8');
  } catch {
    return { exists: true, error: 'Could not read CHANGELOG.md' };
  }

  let commits = [];
  try {
    commits = execFileSync('git', ['log', '--oneline', '-10', 'HEAD'], {
      cwd: settings.cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim().split('\n').filter(Boolean);
  } catch {
    commits = [];
  }

  const relevantCommits = commits.filter((commit) => /^(?:[a-f0-9]+\s+)?(feat|fix|breaking)/i.test(commit));
  const documented = relevantCommits.filter((commit) => changelog.includes(commit.substring(0, 8)));
  const undocumented = relevantCommits.filter((commit) => !documented.includes(commit));
  return {
    exists: true,
    hasUnreleased: changelog.includes('## [Unreleased]'),
    documented,
    undocumented,
    suggestion: undocumented.length ? `${undocumented.length} commits may need CHANGELOG entries` : null,
  };
}

function collect(options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const changedFiles = settings.changedFiles || [];
  const repoMapStatus = ensureRepoMapSync(settings);
  const markdownFiles = findMarkdownFiles(settings.cwd);
  const map = repoMapStatus.map;

  return {
    relatedDocs: findRelatedDocs(changedFiles, settings),
    changelog: checkChangelog(changedFiles, settings),
    markdownFiles,
    repoMap: {
      available: repoMapStatus.available,
      fallbackReason: repoMapStatus.fallbackReason,
      stats: map ? {
        files: Object.keys(map.files || {}).length,
        totalSymbols: Object.values(map.files || {}).reduce((total, file) => total + (file.symbols?.length || 0), 0),
      } : null,
    },
    undocumentedExports: findUndocumentedExports(settings),
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

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
  /module\.exports\s*=\s*\{([^}]+)\}/g,
];

let repoMapModule = null;
let repoMapLoadError = null;

function getRepoMap() {
  if (!repoMapModule && !repoMapLoadError) {
    try {
      repoMapModule = typeof require_repo_map === 'function' ? require_repo_map() : null;
      if (!repoMapModule) repoMapLoadError = 'Failed to load repo-map module';
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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isInternalExport(name, filePath) {
  if (name.startsWith('_')) return true;
  const normalizedPath = filePath.toLowerCase();
  if (INTERNAL_DIRS.some(directory =>
    normalizedPath.includes(`/${directory}/`) || normalizedPath.includes(`\\${directory}\\`)
  )) return true;
  return /\.(test|spec)\.[jt]sx?$/.test(filePath);
}

function isEntryPoint(filePath) {
  const name = path.basename(filePath).replace(/\.[^.]+$/, '').toLowerCase();
  return ENTRY_NAMES.includes(name);
}

function unavailableRepoMap(fallbackReason) {
  return { available: false, map: null, fallbackReason };
}

async function ensureRepoMap(options = {}) {
  const { cwd = process.cwd(), askUser } = options;
  const repoMap = getRepoMap();
  if (!repoMap) return unavailableRepoMap('repo-map-module-not-found');

  if (repoMap.exists(cwd)) {
    return { available: true, map: repoMap.load(cwd), fallbackReason: null };
  }

  const astGrep = await repoMap.checkAstGrepInstalled();
  if (!astGrep.found) {
    if (askUser) {
      const answer = await askUser({
        question: 'ast-grep not found. Install for better doc sync accuracy?',
        header: 'ast-grep Required',
        options: [
          { label: 'Yes, show instructions', description: 'Better accuracy with AST-based symbol detection' },
          { label: 'No, use regex fallback', description: 'Less accurate but works without additional install' },
        ],
      });
      if (answer && answer.includes('Yes')) {
        return {
          ...unavailableRepoMap('ast-grep-install-pending'),
          installInstructions: repoMap.getInstallInstructions(),
        };
      }
    }
    return unavailableRepoMap('ast-grep-not-installed');
  }

  try {
    const result = await repoMap.init(cwd, { force: false });
    if (result.success) return { available: true, map: result.map, fallbackReason: null };
    if (result.error && result.error.includes('already exists')) {
      return { available: true, map: repoMap.load(cwd), fallbackReason: null };
    }
    return unavailableRepoMap(result.error || 'init-failed');
  } catch (error) {
    return unavailableRepoMap(error.message || 'init-error');
  }
}

function ensureRepoMapSync(options = {}) {
  const { cwd = process.cwd() } = options;
  const repoMap = getRepoMap();
  if (!repoMap) return unavailableRepoMap('repo-map-module-not-found');
  if (repoMap.exists(cwd)) {
    return { available: true, map: repoMap.load(cwd), fallbackReason: null };
  }
  return unavailableRepoMap('repo-map-not-initialized');
}

function getExportsFromRepoMap(filePath, repoMap) {
  if (!repoMap || !repoMap.files) return null;
  const normalizedPath = filePath.replace(/\\/g, '/');
  const file = repoMap.files[normalizedPath]
    || repoMap.files[normalizedPath.replace(/^\.\//, '')]
    || repoMap.files[`./${normalizedPath}`];
  if (!file || !file.symbols || !file.symbols.exports) return null;
  return file.symbols.exports.map(exportedSymbol => exportedSymbol.name);
}

function findUndocumentedExports(changedFiles, options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const status = settings.repoMapStatus || ensureRepoMapSync(settings);
  if (!status.available || !status.map) return [];

  const documentation = findMarkdownFiles(settings.cwd)
    .map(file => {
      try { return fs.readFileSync(path.join(settings.cwd, file), 'utf8'); }
      catch { return ''; }
    })
    .join('\n');
  const issues = [];

  for (const changedFile of changedFiles) {
    const normalizedPath = changedFile.replace(/\\/g, '/');
    const file = status.map.files[normalizedPath]
      || status.map.files[normalizedPath.replace(/^\.\//, '')];
    const exports = file?.symbols?.exports;
    if (!exports) continue;

    for (const exportedSymbol of exports) {
      if (isInternalExport(exportedSymbol.name, normalizedPath) || isEntryPoint(normalizedPath)) continue;
      if (!new RegExp(`\\b${escapeRegex(exportedSymbol.name)}\\b`).test(documentation)) {
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
  }
  return issues;
}

function findRelatedDocs(changedFiles, options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const related = [];

  for (const document of findMarkdownFiles(settings.cwd)) {
    let content;
    try { content = fs.readFileSync(path.join(settings.cwd, document), 'utf8'); }
    catch { continue; }

    for (const changedFile of changedFiles) {
      const normalizedFile = changedFile.replace(/\\/g, '/');
      const baseName = path.basename(normalizedFile);
      const stem = baseName.replace(/\.[^.]+$/, '');
      const referenceTypes = [];
      if (content.includes(normalizedFile) || content.includes(changedFile)) referenceTypes.push('full-path');
      if (content.includes(baseName)) referenceTypes.push('filename');
      if (content.includes(`/${stem}`) || content.includes(`/${baseName}`)) referenceTypes.push('url-path');
      if (content.includes(`require('${stem}`) || content.includes(`require("${stem}`)) referenceTypes.push('require');
      if (new RegExp(`from ['"][^'"]*${escapeRegex(stem)}`).test(content)) referenceTypes.push('import');
      if (referenceTypes.length) related.push({ doc: document, referencedFile: changedFile, referenceTypes });
    }
  }
  return related;
}

function findMarkdownFiles(cwd) {
  const files = [];
  const ignored = new Set(['.git', '.codex', 'node_modules', 'vendor', 'dist', 'build', 'coverage']);

  function scan(directory, depth) {
    if (depth > MAX_SCAN_DEPTH || files.length >= MAX_DOC_FILES) return;
    let entries;
    try { entries = fs.readdirSync(directory, { withFileTypes: true }); }
    catch { return; }

    for (const entry of entries) {
      if (files.length >= MAX_DOC_FILES) break;
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!ignored.has(entry.name)) scan(absolutePath, depth + 1);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        files.push(path.relative(cwd, absolutePath));
      }
    }
  }

  scan(cwd, 0);
  return files;
}

function findLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

function isValidGitRef(ref) {
  return typeof ref === 'string'
    && ref.length > 0
    && ref.length < 256
    && !ref.startsWith('-')
    && !/[\s~^:?*[\\]/.test(ref)
    && !ref.includes('..')
    && !ref.includes('@{');
}

function getExportsFromGit(filePath, ref, options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  if (!isValidGitRef(ref)) return [];
  let source;
  try {
    source = execFileSync('git', ['show', `${ref}:${filePath.replace(/\\/g, '/')}`], {
      cwd: settings.cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch {
    return [];
  }

  const names = [];
  for (const pattern of EXPORT_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(source)) !== null) {
      if (pattern === EXPORT_PATTERNS[0]) {
        names.push(match[1]);
      } else {
        for (const item of match[1].split(',')) {
          const name = item.trim().split(/\s+as\s+/)[1] || item.trim().split(/\s+as\s+/)[0];
          if (name) names.push(name.replace(/\s*:.*$/, '').trim());
        }
      }
    }
  }
  return [...new Set(names)];
}

function compareVersions(firstVersion, secondVersion) {
  const first = firstVersion.split('.').map(Number);
  const second = secondVersion.split('.').map(Number);
  for (let index = 0; index < 3; index++) {
    if ((first[index] || 0) < (second[index] || 0)) return -1;
    if ((first[index] || 0) > (second[index] || 0)) return 1;
  }
  return 0;
}

function analyzeDocIssues(documentPath, content, options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const issues = [];
  const repoMapStatus = settings.repoMapStatus || ensureRepoMapSync(settings);
  const normalizedDocument = documentPath.replace(/\\/g, '/');

  for (const match of content.matchAll(/(?:from\s+|require\()['"]([^'"]+)['"]/g)) {
    const importPath = match[1];
    if (!importPath.startsWith('.')) continue;
    const resolved = path.resolve(settings.cwd, path.dirname(normalizedDocument), importPath);
    const candidates = [resolved, `${resolved}.js`, `${resolved}.ts`, path.join(resolved, 'index.js'), path.join(resolved, 'index.ts')];
    if (!candidates.some(candidate => fs.existsSync(candidate))) {
      issues.push({
        type: 'code-example',
        severity: 'medium',
        line: findLineNumber(content, match.index),
        current: match[0],
        suggestion: 'Verify import path is still valid',
      });
    }
  }

  const currentExports = repoMapStatus.available
    ? getExportsFromRepoMap(settings.sourceFile || '', repoMapStatus.map)
    : null;
  if (settings.sourceFile) {
    const previousExports = currentExports || getExportsFromGit(settings.sourceFile, 'HEAD~1', settings);
    const latestExports = currentExports || getExportsFromGit(settings.sourceFile, 'HEAD', settings);
    for (const name of previousExports.filter(name => !latestExports.includes(name))) {
      if (content.includes(name)) {
        issues.push({
          type: 'removed-export',
          severity: 'high',
          reference: name,
          suggestion: `'${name}' was removed or renamed`,
          detectionMethod: currentExports ? 'repo-map' : 'regex',
        });
      }
    }
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(settings.cwd, 'package.json'), 'utf8'));
    for (const match of content.matchAll(/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi)) {
      if (match[1] !== packageJson.version && compareVersions(match[1], packageJson.version) < 0) {
        issues.push({
          type: 'outdated-version',
          severity: 'low',
          line: findLineNumber(content, match.index),
          current: match[1],
          expected: packageJson.version,
          suggestion: `Update version from ${match[1]} to ${packageJson.version}`,
        });
      }
    }
  } catch {}

  return issues;
}

function checkChangelog(changedFiles, options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const changelogPath = path.join(settings.cwd, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) return { exists: false };

  let changelog;
  try { changelog = fs.readFileSync(changelogPath, 'utf8'); }
  catch { return { exists: false, error: 'Could not read CHANGELOG.md' }; }

  let commits = [];
  try {
    commits = execFileSync('git', ['log', '--oneline', '-10', 'HEAD'], {
      cwd: settings.cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim().split('\n');
  } catch {}

  const documented = [];
  const undocumented = [];
  for (const commit of commits) {
    if (!commit) continue;
    const subject = commit.substring(8);
    const hash = commit.substring(0, 7);
    if (changelog.includes(subject) || changelog.includes(hash)) documented.push(subject);
    else if (/^(feat|fix|breaking)/i.test(subject)) undocumented.push(subject);
  }

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
  const repoMap = ensureRepoMapSync(settings);
  return {
    relatedDocs: findRelatedDocs(changedFiles, settings),
    changelog: checkChangelog(changedFiles, settings),
    markdownFiles: findMarkdownFiles(settings.cwd),
    repoMap: {
      available: repoMap.available,
      fallbackReason: repoMap.fallbackReason,
      stats: repoMap.map ? {
        files: Object.keys(repoMap.map.files || {}).length,
        symbols: repoMap.map.stats?.totalSymbols || 0,
      } : null,
    },
    undocumentedExports: repoMap.available
      ? findUndocumentedExports(changedFiles, { ...settings, repoMapStatus: repoMap })
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

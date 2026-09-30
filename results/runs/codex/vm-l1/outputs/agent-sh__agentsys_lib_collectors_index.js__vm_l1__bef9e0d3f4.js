'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const childProcess = require('child_process');

const DEFAULT_OPTIONS = {
  collectors: ['github', 'docs', 'code'],
  depth: 'thorough',
  cwd: process.cwd()
};
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.rs', '.go', '.py', '.java']);
const EXCLUDE_DIRS = new Set(['node_modules', 'vendor', 'dist', 'build', 'out', 'target', '.git', '.svn', '.hg', '__pycache__', '.pytest_cache', 'coverage', '.nyc_output', '.next', '.nuxt', '.cache']);

function isPathSafe(filePath, root = process.cwd()) {
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(root, filePath);
  return resolvedPath === resolvedRoot || resolvedPath.startsWith(`${resolvedRoot}${path.sep}`);
}

function safeReadFile(filePath, options = {}) {
  const root = options.root || process.cwd();
  if (!isPathSafe(filePath, root)) throw new Error(`Path escapes repository: ${filePath}`);
  const limit = options.maxBytes || 2 * 1024 * 1024;
  return fs.readFileSync(path.resolve(root, filePath), { encoding: 'utf8', flag: 'r' }).slice(0, limit);
}

function readFileWithLimit(filePath, maxBytes = 2 * 1024 * 1024) {
  return safeReadFile(filePath, { maxBytes });
}

function extractCheckboxes(markdown) {
  return [...markdown.matchAll(/^\s*[-*+]\s+\[([ xX])\]\s+(.+)$/gm)].map(match => ({
    checked: match[1].toLowerCase() === 'x',
    text: match[2].trim()
  }));
}

function extractPlans(markdown) {
  return markdown.split(/\r?\n/).filter(line => /^\s*(?:[-*+]\s+|\d+[.)]\s+)/.test(line)).map(line => line.trim());
}

function extractFeatures(markdown) {
  const features = [];
  for (const match of markdown.matchAll(/^[-*]\s+\*{0,2}([^\n]+?)\*{0,2}(?:\s+[-–]\s+(.+))?$/gm)) {
    const name = match[1].trim();
    if (name.length <= 200) features.push({ name, description: match[2]?.trim() || '' });
  }
  return [...new Map(features.map(feature => [feature.name.toLowerCase(), feature])).values()].slice(0, 80);
}

function analyzeMarkdownFile(filePath, root = process.cwd()) {
  const content = safeReadFile(filePath, { root });
  const headings = [...content.matchAll(/^##?\s+(.+)$/gm)].map(match => match[1].trim());
  const codeBlocks = (content.match(/^```/gm) || []).length / 2;
  return {
    path: filePath,
    headings,
    sections: headings.length,
    checkboxes: extractCheckboxes(content),
    plans: extractPlans(content),
    features: extractFeatures(content),
    codeBlocks,
    wordCount: content.trim() ? content.trim().split(/\s+/).length : 0,
    hasInstallation: /(^|\n)##?\s+.*(?:install|setup|getting started)/i.test(content),
    hasUsage: /(^|\n)##?\s+.*(?:usage|how to|example)/i.test(content),
    hasApi: /(^|\n)##?\s+.*(?:api|reference|methods)/i.test(content),
    hasTesting: /(^|\n)##?\s+.*(?:test|spec|coverage)/i.test(content)
  };
}

function identifyDocGaps(files) {
  const gaps = [];
  for (const document of files) {
    if (!document.hasInstallation) gaps.push({ file: document.path, type: 'missing-section', section: 'Installation', severity: 'high' });
    if (!document.hasUsage) gaps.push({ file: document.path, type: 'missing-section', section: 'Usage', severity: 'medium' });
  }
  return gaps;
}

function analyzeDocumentation(options = {}) {
  const root = path.resolve(options.cwd || DEFAULT_OPTIONS.cwd);
  const documents = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.') && entry.name !== '.github') continue;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (/\.md$/i.test(entry.name)) documents.push(analyzeMarkdownFile(path.relative(root, fullPath), root));
    }
  }
  visit(root);
  return { files: documents, gaps: identifyDocGaps(documents), depth: options.depth || DEFAULT_OPTIONS.depth };
}

function shouldExclude(relativePath) {
  return relativePath.split(/[\\/]/).some(part => EXCLUDE_DIRS.has(part));
}

function extractSymbols(content, extension) {
  const symbols = [];
  const patterns = [/\b(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g, /\b(?:class|interface|struct|enum|trait)\s+([A-Za-z_$][\w$]*)/g, /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g];
  for (const pattern of patterns) for (const match of content.matchAll(pattern)) symbols.push({ name: match[1], kind: 'symbol', line: content.slice(0, match.index).split('\n').length, extension });
  return symbols;
}

function scanFileSymbols(filePath, root = process.cwd()) {
  const extension = path.extname(filePath);
  return extractSymbols(safeReadFile(filePath, { root }), extension);
}

function scanDirectory(directory, options = {}) {
  const root = path.resolve(directory);
  const files = [];
  function visit(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      const relativePath = path.relative(root, fullPath);
      if (shouldExclude(relativePath)) continue;
      if (entry.isDirectory()) visit(fullPath);
      else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) files.push(relativePath);
    }
  }
  visit(root);
  return files.map(filePath => ({ path: filePath, symbols: scanFileSymbols(filePath, root) }));
}

function scanCodebase(options = {}) {
  const root = path.resolve(options.cwd || DEFAULT_OPTIONS.cwd);
  const files = scanDirectory(root, options);
  return { root, files, symbols: files.flatMap(file => file.symbols) };
}

function detectFrameworks() { return []; }
function detectTestFramework() { return null; }
function detectHealth(codebase) { return { files: codebase.files.length, symbols: codebase.symbols.length }; }
function findImplementedFeatures(codebase) { return codebase.symbols.map(symbol => symbol.name); }
function compareVersions(left, right) { return left === right ? 0 : left < right ? -1 : 1; }

function getStateDir() { return process.env.AGENT_ANALYZER_STATE_DIR || path.join(os.homedir(), '.cache', 'agent-analyzer'); }
function getStateDirPath() { const directory = getStateDir(); fs.mkdirSync(directory, { recursive: true }); return directory; }
function getPlatformName() { return process.platform; }
function clearCache() { fs.rmSync(getStateDirPath(), { recursive: true, force: true }); }
function getTempPath(name = 'agent-analyzer') { return path.join(os.tmpdir(), `${name}-${process.pid}`); }
function writeFileAtomic(filePath, content) { const temporary = `${filePath}.${process.pid}.tmp`; fs.writeFileSync(temporary, content); fs.renameSync(temporary, filePath); }
function writeJsonAtomic(filePath, value) { writeFileAtomic(filePath, JSON.stringify(value, null, 2)); }

function getMapPath(cwd = process.cwd()) { return path.join(getStateDirPath(), `${crypto.createHash('sha1').update(path.resolve(cwd)).digest('hex')}.json`); }
function load(cwd) { const filePath = getMapPath(cwd); return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : null; }
function save(value, cwd) { const filePath = getMapPath(cwd); writeJsonAtomic(filePath, value); return value; }
function exists(cwd) { return fs.existsSync(getMapPath(cwd)); }
function getStatus(cwd) { return { exists: exists(cwd), path: getMapPath(cwd) }; }
function getPath(cwd) { return getMapPath(cwd); }
function markStale(cwd) { fs.writeFileSync(`${getMapPath(cwd)}.stale`, '1'); }
function isMarkedStale(cwd) { return fs.existsSync(`${getMapPath(cwd)}.stale`); }
function clearStale(cwd) { fs.rmSync(`${getMapPath(cwd)}.stale`, { force: true }); }

function isInternalExport(name) { return name.startsWith('_') || name.startsWith('#'); }
function isEntryPoint(name) { return /(?:^|[/\\])(index|main|app|server|cli|bin)(?:\.[^/\\]+)?$/.test(name); }
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function getExportsFromRepoMap(repoMap) { return repoMap?.exports || []; }
function findUndocumentedExports(exportsList, documented = []) { const names = new Set(documented); return exportsList.filter(name => !names.has(name) && !isInternalExport(name)); }
function findRelatedDocs(filePath, documents = []) { const base = path.basename(filePath, path.extname(filePath)).toLowerCase(); return documents.filter(document => document.path.toLowerCase().includes(base)); }
function checkChangelog() { return { exists: fs.existsSync(path.join(process.cwd(), 'CHANGELOG.md')) }; }
function ensureRepoMapSync(options = {}) { return exists(options.cwd) ? load(options.cwd) : save(scanCodebase(options), options.cwd); }
function ensureRepoMap(options = {}) { return ensureRepoMapSync(options); }
function analyzeDocIssues(options = {}) { return identifyDocGaps(analyzeDocumentation(options).files); }
function collectGitData() { return { branch: process.env.GIT_BRANCH || null, clean: null }; }
function isGhAvailable() { try { childProcess.execFileSync('gh', ['--version'], { stdio: 'ignore' }); return true; } catch { return false; } }
function scanGitHubState() { return { available: isGhAvailable(), issues: [], pullRequests: [], milestones: [] }; }
function summarizeIssue(issue) { return { number: issue.number, title: issue.title, labels: (issue.labels || []).map(label => label.name || label), body: String(issue.body || '').slice(0, 200) }; }
function summarizePR(pullRequest) { return { number: pullRequest.number, title: pullRequest.title, draft: !!pullRequest.isDraft, body: String(pullRequest.body || '').slice(0, 150) }; }
function categorizeIssues(issues) { return issues.reduce((groups, issue) => { const category = issue.category || 'other'; (groups[category] ||= []).push(issue); return groups; }, {}); }
function findStaleItems(items = []) { return items.filter(item => item.stale || item.archived); }
function extractThemes(items = []) { return [...new Set(items.flatMap(item => item.labels || []))]; }
function findOverdueMilestones() { return []; }

function collect(options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const result = { timestamp: new Date().toISOString(), options: settings };
  if (settings.collectors.includes('github')) result.github = scanGitHubState(settings);
  if (settings.collectors.includes('docs')) result.docs = analyzeDocumentation(settings);
  if (settings.collectors.includes('code')) result.code = scanCodebase(settings);
  return result;
}
function collectAllData(options) { return collect(options); }
function getExportsFromGit() { return []; }
function getRepoMapLoadError() { return null; }
function convertIntelToRepoMap(value) { return value; }
function isEntryPointSymbol(symbol) { return isEntryPoint(symbol.path || symbol.name || ''); }
function getMinimumVersion() { return '0.3.0'; }
function getCommand() { return 'agent-analyzer'; }
function isAvailable() { return false; }
function checkInstalled() { return isAvailable(); }
function checkInstalledSync() { return isAvailable(); }
function meetsMinimumVersion() { return false; }
function getInstallInstructions() { return 'Install agent-analyzer to enable repository intelligence.'; }
function isEnabled() { return false; }
function status() { return { enabled: isEnabled() }; }
function runScan(options) { return collect(options); }
function runUpdate(options) { return collect(options); }

module.exports = {
  collect, collectAllData, DEFAULT_OPTIONS,
  github: { scanGitHubState, isGhAvailable, summarizeIssue, summarizePR, categorizeIssues, findStaleItems, extractThemes, findOverdueMilestones },
  documentation: { analyzeDocumentation, analyzeMarkdownFile, identifyDocGaps },
  codebase: { scanCodebase, scanDirectory, scanFileSymbols, shouldExclude, detectFrameworks, detectTestFramework, detectHealth, findImplementedFeatures },
  docsPatterns: { findRelatedDocs, analyzeDocIssues, checkChangelog, ensureRepoMapSync, getExportsFromRepoMap, findUndocumentedExports, isInternalExport, isEntryPoint },
  git: { collectGitData }, analyzerQueries: {},
  isPathSafe, safeReadFile, readFileWithLimit, extractCheckboxes, extractFeatures, extractPlans,
  getStateDir, getStateDirPath, getPlatformName, clearCache, getTempPath, writeFileAtomic, writeJsonAtomic,
  getMapPath, load, save, exists, getStatus, getPath, markStale, isMarkedStale, clearStale,
  getExportsFromGit, getRepoMapLoadError, convertIntelToRepoMap, isEntryPointSymbol,
  checkInstalled, checkInstalledSync, meetsMinimumVersion, getInstallInstructions, getMinimumVersion, getCommand,
  isAvailable, isEnabled, status, runScan, runUpdate,
  scanGitHubState, isGhAvailable, analyzeDocumentation, scanCodebase,
  findRelatedDocs, analyzeDocIssues, checkChangelog, ensureRepoMap,
  ensureRepoMapSync, getExportsFromRepoMap, findUndocumentedExports,
  isInternalExport, isEntryPoint, collectGitData
};

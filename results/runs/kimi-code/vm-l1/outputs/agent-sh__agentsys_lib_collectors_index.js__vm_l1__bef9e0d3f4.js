'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const SOURCE_EXTENSIONS = {
  js: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
  rust: ['.rs'],
  go: ['.go'],
  python: ['.py'],
  java: ['.java'],
};
const SOURCE_EXTENSION_SET = new Set(Object.values(SOURCE_EXTENSIONS).flat());
const EXCLUDE_DIRS = new Set([
  'node_modules', 'vendor', 'dist', 'build', 'out', 'target', '.git', '.svn', '.hg',
  '__pycache__', '.pytest_cache', 'coverage', '.nyc_output', '.next', '.nuxt', '.cache',
]);
const MARKDOWN_EXTENSIONS = new Set(['.md', '.mdx', '.markdown']);

function mergeOptions(defaults, options) {
  return { ...defaults, ...(options || {}) };
}

function normalizeLabels(labels = []) {
  return labels.map(label => typeof label === 'string' ? label : label && label.name).filter(Boolean);
}

function safeReadFile(file, root = process.cwd()) {
  const resolvedRoot = path.resolve(root);
  const resolvedFile = path.resolve(resolvedRoot, file);
  if (resolvedFile !== resolvedRoot && !resolvedFile.startsWith(`${resolvedRoot}${path.sep}`)) return null;
  try {
    return fs.readFileSync(resolvedFile, 'utf8');
  } catch {
    return null;
  }
}

function walk(root, shouldInclude, maxDepth = Infinity) {
  const files = [];
  let totalDirs = 0;
  function visit(directory, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory() && EXCLUDE_DIRS.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        totalDirs++;
        visit(absolute, depth + 1);
      } else if (entry.isFile() && shouldInclude(absolute)) {
        files.push(absolute);
      }
    }
  }
  visit(root, 0);
  return { files, totalDirs };
}

function words(text) {
  return text.split(/\s+/).length;
}

function execGh(args, options = {}) {
  const settings = mergeOptions(github.DEFAULT_OPTIONS, options);
  return execFileSync('gh', args, {
    cwd: settings.cwd,
    encoding: 'utf8',
    timeout: settings.timeout,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function isGhAvailable(options = {}) {
  try {
    execGh(['auth', 'status'], options);
    return true;
  } catch {
    return false;
  }
}

function summarizeIssue(issue) {
  return {
    number: issue.number,
    title: issue.title,
    labels: normalizeLabels(issue.labels),
    milestone: issue.milestone ? issue.milestone.title : null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    snippet: issue.body ? `${issue.body.slice(0, 200)}${issue.body.length > 200 ? '...' : ''}` : '',
  };
}

function summarizePR(pr) {
  return {
    number: pr.number,
    title: pr.title,
    labels: normalizeLabels(pr.labels),
    isDraft: Boolean(pr.isDraft),
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    files: pr.files || [],
    snippet: pr.body ? `${pr.body.slice(0, 200)}${pr.body.length > 200 ? '...' : ''}` : '',
  };
}

function categorizeIssues(result, issues) {
  for (const issue of issues) {
    const labels = normalizeLabels(issue.labels).map(label => label.toLowerCase());
    const summary = { number: issue.number, title: issue.title };
    if (labels.some(label => label.includes('bug'))) result.categorized.bugs.push(summary);
    else if (labels.some(label => label.includes('feature'))) result.categorized.features.push(summary);
    else if (labels.some(label => label.includes('security'))) result.categorized.security.push(summary);
    else if (labels.some(label => label.includes('enhancement'))) result.categorized.enhancements.push(summary);
    else result.categorized.other.push(summary);
  }
}

function findStaleItems(result, items, staleDays = 90) {
  const now = Date.now();
  for (const item of items) {
    const daysStale = Math.floor((now - Date.parse(item.updatedAt)) / 86400000);
    if (daysStale >= staleDays) result.stale.push({ number: item.number, title: item.title, lastUpdated: item.updatedAt, daysStale });
  }
}

function extractThemes(result, issues) {
  const ignored = new Set(['issue', 'with', 'from', 'that', 'this', 'have', 'when', 'what', 'your', 'into', 'using', 'support', 'update', 'error']);
  const counts = new Map();
  for (const issue of issues) {
    for (const word of (issue.title || '').toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) || []) {
      if (!ignored.has(word)) counts.set(word, (counts.get(word) || 0) + 1);
    }
  }
  result.themes = [...counts].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([word, count]) => ({ word, count }));
}

function findOverdueMilestones(result) {
  const now = Date.now();
  result.overdueMilestones = result.milestones.filter(milestone => milestone.due_on && Date.parse(milestone.due_on) < now && milestone.state === 'open');
}

function parseGhJson(args, settings) {
  const output = execGh(args, settings);
  return output ? JSON.parse(output) : [];
}

function scanGitHubState(options = {}) {
  const settings = mergeOptions(github.DEFAULT_OPTIONS, options);
  if (!isGhAvailable(settings)) return { available: false, error: 'GitHub CLI not available or not authenticated' };
  const errors = [];
  let issues = [], prs = [], milestonePages = [];
  for (const [name, load] of [
    ['issues', () => parseGhJson(['issue', 'list', '--state', 'open', '--json', 'number,title,labels,milestone,createdAt,updatedAt,body', '--limit', String(settings.issueLimit)], settings)],
    ['prs', () => parseGhJson(['pr', 'list', '--state', 'open', '--json', 'number,title,labels,isDraft,createdAt,updatedAt,body,files', '--limit', String(settings.prLimit)], settings)],
    ['milestones', () => parseGhJson(['api', 'repos/{owner}/{repo}/milestones', '--paginate', '--slurp'], settings)],
  ]) {
    try {
      const value = load();
      if (name === 'issues') issues = value;
      else if (name === 'prs') prs = value;
      else milestonePages = value;
    } catch (error) {
      errors.push({ collector: name, error: error.message });
    }
  }
  const milestones = milestonePages.flat().slice(0, settings.milestoneLimit).map(({ title, state, due_on, open_issues, closed_issues }) => ({ title, state, due_on, open_issues, closed_issues }));
  const result = {
    available: true,
    partial: errors.length > 0,
    errors,
    summary: { issueCount: issues.length, prCount: prs.length, milestoneCount: milestones.length },
    issues: issues.map(summarizeIssue),
    prs: prs.map(summarizePR),
    milestones,
    overdueMilestones: [],
    pagination: {
      issues: { requestedLimit: settings.issueLimit, fetchedCount: issues.length, hasMore: issues.length >= settings.issueLimit },
      prs: { requestedLimit: settings.prLimit, fetchedCount: prs.length, hasMore: prs.length >= settings.prLimit },
      milestones: { requestedLimit: settings.milestoneLimit, fetchedCount: milestones.length, hasMore: milestones.length >= settings.milestoneLimit },
    },
    categorized: { bugs: [], features: [], security: [], enhancements: [], other: [] },
    stale: [],
    themes: [],
  };
  categorizeIssues(result, issues);
  findStaleItems(result, issues);
  extractThemes(result, issues);
  findOverdueMilestones(result);
  return result;
}

const github = {
  DEFAULT_OPTIONS: { issueLimit: 100, prLimit: 50, milestoneLimit: 100, timeout: 10000, cwd: process.cwd() },
  scanGitHubState, isGhAvailable, execGh, summarizeIssue, summarizePR, categorizeIssues,
  findStaleItems, extractThemes, findOverdueMilestones,
};

function isPathSafe(file, root = process.cwd()) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, file);
  return resolved === resolvedRoot || resolved.startsWith(`${resolvedRoot}${path.sep}`);
}

function extractCheckboxes(target, file = '') {
  const content = typeof target === 'string' ? target : typeof file === 'string' ? file : '';
  const fileName = typeof target === 'string' ? file : '';
  const matches = [...content.matchAll(/^\s*[-*]\s+\[([ xX])\]\s+(.+)$/gm)].map(match => ({
    checked: match[1].toLowerCase() === 'x', text: match[2].trim(), file: fileName,
  }));
  if (target && typeof target === 'object' && !Array.isArray(target)) {
    target.total = (target.total || 0) + matches.length;
    target.checked = (target.checked || 0) + matches.filter(item => item.checked).length;
    target.unchecked = (target.unchecked || 0) + matches.filter(item => !item.checked).length;
  }
  return matches;
}

function extractSectionItems(content, headings, file) {
  const lines = content.split(/\r?\n/);
  const found = [];
  let active = false;
  for (let index = 0; index < lines.length; index++) {
    const heading = lines[index].match(/^#{1,6}\s+(.+)/);
    if (heading) active = headings.test(heading[1]);
    else if (active) {
      const item = lines[index].match(/^\s*[-*]\s+(.+)/);
      if (item) found.push({ text: item[1].trim(), file, line: index + 1 });
    }
  }
  return found;
}

function extractFeatures(target, content, file = '') {
  if (typeof target === 'string') return extractSectionItems(target, /feature|capabilit/i, content || '');
  const found = extractSectionItems(content || '', /feature|capabilit/i, file);
  if (target && Array.isArray(target.features)) target.features.push(...found);
  return found;
}

function extractPlans(target, content, file = '') {
  if (typeof target === 'string') return extractSectionItems(target, /roadmap|plan|todo|next/i, content || '');
  const found = extractSectionItems(content || '', /roadmap|plan|todo|next/i, file);
  if (target && Array.isArray(target.plans)) target.plans.push(...found);
  return found;
}

function analyzeMarkdownFile(file, options = {}) {
  const root = options.cwd || process.cwd();
  const content = safeReadFile(file, root);
  if (content === null) return null;
  const sections = [...content.matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => match[1].trim());
  return {
    path: path.relative(root, path.resolve(root, file)),
    sectionCount: sections.length,
    sections,
    hasInstallation: /(^|\n)#{1,6}\s+.*install/im.test(content),
    hasUsage: /(^|\n)#{1,6}\s+.*usage/im.test(content),
    hasApi: /(^|\n)#{1,6}\s+.*api/im.test(content),
    hasTesting: /(^|\n)#{1,6}\s+.*test/im.test(content),
    codeBlocks: (content.match(/```/g) || []).length >> 1,
    wordCount: words(content),
  };
}

function identifyDocGaps(files) {
  const names = files instanceof Map ? [...files.keys()] : Array.isArray(files) ? files : Object.keys(files || {});
  const lower = names.map(name => path.basename(name).toLowerCase());
  const gaps = [];
  if (!lower.includes('readme.md')) gaps.push({ type: 'missing', file: 'README.md', severity: 'high' });
  if (!lower.includes('changelog.md')) gaps.push({ type: 'missing', file: 'CHANGELOG.md', severity: 'low' });
  return gaps;
}

async function analyzeDocumentation(options = {}) {
  const settings = mergeOptions(documentation.DEFAULT_OPTIONS, options);
  const root = path.resolve(settings.cwd);
  const { files } = walk(root, file => MARKDOWN_EXTENSIONS.has(path.extname(file).toLowerCase()) && !['CHECKPOINT.md', 'TASK.md'].includes(path.basename(file)), settings.depth === 'quick' ? 2 : Infinity);
  const result = { summary: { fileCount: files.length, totalWords: 0 }, files: {}, features: [], plans: [], checkboxes: { total: 0, checked: 0, unchecked: 0 } };
  for (const absolute of files) {
    const relative = path.relative(root, absolute);
    const content = safeReadFile(relative, root);
    const analysis = analyzeMarkdownFile(relative, settings);
    if (!analysis || content === null) continue;
    result.files[relative] = analysis;
    result.summary.totalWords += analysis.wordCount;
    result.features.push(...extractFeatures(content, relative));
    result.plans.push(...extractPlans(content, relative));
    const boxes = extractCheckboxes(content, relative);
    result.checkboxes.total += boxes.length;
    result.checkboxes.checked += boxes.filter(item => item.checked).length;
    result.checkboxes.unchecked += boxes.filter(item => !item.checked).length;
  }
  result.gaps = identifyDocGaps(result.files);
  return result;
}

const documentation = {
  DEFAULT_OPTIONS: { depth: 'thorough', cwd: process.cwd() },
  analyzeDocumentation, analyzeMarkdownFile, safeReadFile, isPathSafe, extractCheckboxes,
  extractFeatures, extractPlans, identifyDocGaps,
};

function shouldExclude(file) {
  return String(file).split(/[\\/]/).some(part => EXCLUDE_DIRS.has(part));
}

function extractSymbols(content) {
  const functions = [...content.matchAll(/(?:export\s+)?(?:async\s+)?function\s+([\w$]+)/g)].map(match => match[1]);
  const classes = [...content.matchAll(/(?:export\s+)?class\s+([\w$]+)/g)].map(match => match[1]);
  const exports = [...content.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+([\w$]+)/g)].map(match => match[1]);
  for (const match of content.matchAll(/module\.exports\s*=\s*\{([^}]*)\}/g)) {
    for (const property of match[1].split(',')) {
      const name = property.trim().split(/\s*:\s*/)[0];
      if (/^[\w$]+$/.test(name)) exports.push(name);
    }
  }
  return { functions: [...new Set(functions)], classes: [...new Set(classes)], exports: [...new Set(exports)] };
}

function scanFileSymbols(file, root = process.cwd()) {
  const content = safeReadFile(file, root);
  return content === null ? null : extractSymbols(content);
}

function scanDirectory(directory, root = process.cwd(), depth = Infinity, result = []) {
  const absolute = path.resolve(root, directory);
  const scanned = walk(absolute, file => SOURCE_EXTENSION_SET.has(path.extname(file).toLowerCase()), depth);
  result.push(...scanned.files.map(file => path.relative(root, file)));
  return result;
}

function packageNames(packageJson = {}) {
  return new Set([...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.devDependencies || {})]);
}

function detectFrameworks(target, packageJson = {}, files = []) {
  if (!Array.isArray(target)) files = packageJson || [], packageJson = target || {}, target = [];
  const names = packageNames(packageJson);
  const candidates = [['react', 'React'], ['next', 'Next.js'], ['vue', 'Vue'], ['@angular/core', 'Angular'], ['express', 'Express'], ['fastify', 'Fastify'], ['svelte', 'Svelte'], ['nestjs', 'NestJS'], ['django', 'Django'], ['flask', 'Flask']];
  const found = candidates.filter(([dependency]) => names.has(dependency)).map(([, name]) => name);
  target.push(...found.filter(name => !target.includes(name)));
  return target;
}

function detectTestFramework(target, packageJson = {}, files = []) {
  if (!Array.isArray(target)) files = packageJson || [], packageJson = target || {}, target = [];
  const names = packageNames(packageJson);
  const framework = ['vitest', 'jest', 'mocha', 'ava', 'tap', 'pytest'].find(name => names.has(name) || files.some(file => file.includes(name))) || null;
  if (Array.isArray(target) && framework) target.push(framework);
  return framework;
}

function detectHealth(root, packageJson = {}, files = []) {
  if (typeof root !== 'string') files = packageJson || [], packageJson = root || {}, root = process.cwd();
  const scripts = packageJson.scripts || {};
  return {
    hasTests: Boolean(scripts.test) || files.some(file => /(?:^|\/)(?:test|tests|__tests__)(?:\/|$)/.test(file)),
    hasLinting: Boolean(scripts.lint) || files.some(file => /eslint|biome|prettier/.test(file)),
    hasCi: files.some(file => /(?:^|\/)\.github\/workflows\//.test(file) || /\.gitlab-ci\.yml$/.test(file)),
    hasReadme: files.some(file => /(?:^|\/)readme\.md$/i.test(file)),
  };
}

function findImplementedFeatures(target, files = []) {
  if (!Array.isArray(target)) files = target || [], target = [];
  const features = files.filter(file => SOURCE_EXTENSION_SET.has(path.extname(file))).map(file => path.basename(file, path.extname(file))).filter(name => !/^(index|main|app|mod)$/.test(name));
  target.push(...new Set(features));
  return target;
}

async function scanCodebase(options = {}) {
  const settings = mergeOptions(codebase.DEFAULT_OPTIONS, options);
  const root = path.resolve(settings.cwd);
  const scanned = walk(root, () => true, settings.depth === 'quick' ? 2 : Infinity);
  const relativeFiles = scanned.files.map(file => path.relative(root, file));
  let packageJson = {};
  const packageText = safeReadFile('package.json', root);
  if (packageText) try { packageJson = JSON.parse(packageText); } catch {}
  const sourceFiles = relativeFiles.filter(file => SOURCE_EXTENSION_SET.has(path.extname(file).toLowerCase()));
  const symbols = {};
  if (settings.depth !== 'quick') {
    for (const file of sourceFiles) {
      const found = scanFileSymbols(file, root);
      if (found && (found.functions.length || found.classes.length || found.exports.length)) symbols[file] = found;
    }
  }
  const fileStats = {};
  for (const file of relativeFiles) {
    const extension = path.extname(file) || 'no-ext';
    fileStats[extension] = (fileStats[extension] || 0) + 1;
  }
  return {
    summary: { totalDirs: scanned.totalDirs, totalFiles: relativeFiles.length },
    topLevelDirs: fs.readdirSync(root, { withFileTypes: true }).filter(entry => entry.isDirectory() && !EXCLUDE_DIRS.has(entry.name)).map(entry => entry.name),
    frameworks: detectFrameworks(packageJson, relativeFiles),
    testFramework: detectTestFramework(packageJson, relativeFiles),
    hasTypeScript: relativeFiles.some(file => /\.tsx?$/.test(file)),
    implementedFeatures: findImplementedFeatures(sourceFiles),
    symbols,
    health: detectHealth(root, packageJson, relativeFiles),
    fileStats,
  };
}

const codebase = {
  DEFAULT_OPTIONS: { depth: 'thorough', cwd: process.cwd() }, EXCLUDE_DIRS: [...EXCLUDE_DIRS],
  SOURCE_EXTENSIONS, scanCodebase, detectFrameworks, detectTestFramework,
  detectHealth, findImplementedFeatures, extractSymbols, scanFileSymbols, scanDirectory,
  shouldExclude, safeReadFile,
};

function findMarkdownFiles(root = process.cwd()) {
  return walk(path.resolve(root), file => MARKDOWN_EXTENSIONS.has(path.extname(file).toLowerCase())).files;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findLineNumber(content, search) {
  const index = content.indexOf(search);
  return index < 0 ? 0 : content.slice(0, index).split(/\r?\n/).length;
}

function compareVersions(left, right) {
  const a = String(left).split('.').map(Number);
  const b = String(right).split('.').map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index++) {
    const difference = (a[index] || 0) - (b[index] || 0);
    if (difference) return Math.sign(difference);
  }
  return 0;
}

function isInternalExport(name, metadata = {}) {
  return Boolean(metadata.internal || metadata.private || String(name).startsWith('_'));
}

function isEntryPoint(file) {
  const normalized = String(file).replace(/\\/g, '/');
  return /(?:^|\/)(?:index|main|mod)\.[^.]+$/.test(normalized) || /(?:^|\/)package\.json$/.test(normalized);
}

function getExportsFromGit(root = process.cwd(), revision = 'HEAD') {
  try {
    const output = execFileSync('git', ['show', `${revision}:package.json`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return JSON.parse(output).exports || {};
  } catch {
    return {};
  }
}

function getExportsFromRepoMap(map, file) {
  const data = typeof map === 'string' ? JSON.parse(fs.readFileSync(map, 'utf8')) : map || {};
  const symbols = data.symbols || data.exports || [];
  return Array.isArray(symbols) ? symbols.filter(symbol => !file || symbol.file === file) : symbols[file] || [];
}

function findUndocumentedExports(exportsList, documented = []) {
  const docs = new Set((documented || []).map(item => typeof item === 'string' ? item : item.name));
  return (exportsList || []).filter(item => !docs.has(typeof item === 'string' ? item : item.name));
}

function findRelatedDocs(symbol, options = {}) {
  const root = options.cwd || process.cwd();
  const expression = new RegExp(`\\b${escapeRegex(typeof symbol === 'string' ? symbol : symbol.name)}\\b`, 'i');
  return findMarkdownFiles(root).flatMap(file => {
    const content = safeReadFile(path.relative(root, file), root);
    return content && expression.test(content) ? [{ file: path.relative(root, file), line: findLineNumber(content, content.match(expression)[0]) }] : [];
  });
}

function analyzeDocIssues(codeResult, docsResult) {
  return { undocumentedExports: findUndocumentedExports(Object.values(codeResult.symbols || {}).flatMap(item => item.exports || []), docsResult.features || []), gaps: docsResult.gaps || [] };
}

function checkChangelog(options = {}) {
  const root = typeof options === 'string' ? options : options.cwd || process.cwd();
  const content = safeReadFile('CHANGELOG.md', root);
  return { exists: content !== null, path: path.join(root, 'CHANGELOG.md'), content };
}

let repoMapLoadError = null;
function resolveStateDir(root = process.cwd()) { return path.join(path.resolve(root), '.claude'); }
function resolveMapFile(root = process.cwd()) { return path.join(resolveStateDir(root), 'repo-intel.json'); }
function ensureRepoMapSync(options = {}) {
  const file = resolveMapFile(options.cwd || process.cwd());
  if (fs.existsSync(file)) return file;
  repoMapLoadError = new Error(`Repository map not found: ${file}`);
  return null;
}
async function ensureRepoMap(options = {}) { return ensureRepoMapSync(options); }
function getRepoMapLoadError() { return repoMapLoadError; }

async function collectDocPatterns(options = {}) {
  const [docs, code] = await Promise.all([analyzeDocumentation(options), scanCodebase(options)]);
  return { relatedDocs: [], issues: analyzeDocIssues(code, docs), changelog: checkChangelog(options) };
}

const docsPatterns = {
  DEFAULT_OPTIONS: { cwd: process.cwd() }, findRelatedDocs, findMarkdownFiles, analyzeDocIssues,
  checkChangelog, getExportsFromGit, compareVersions, findLineNumber, collect: collectDocPatterns,
  ensureRepoMap, ensureRepoMapSync, getExportsFromRepoMap, findUndocumentedExports,
  isInternalExport, isEntryPoint, escapeRegex, getRepoMapLoadError,
};

function collectGitData(options = {}) {
  const settings = mergeOptions(git.DEFAULT_OPTIONS, options);
  try {
    const run = args => execFileSync('git', args, { cwd: settings.cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    const branch = run(['rev-parse', '--abbrev-ref', 'HEAD']);
    const status = run(['status', '--short']).split('\n').filter(Boolean);
    const log = run(['log', `-${settings.top}`, '--date=iso', '--pretty=format:%H%x09%an%x09%ad%x09%s']).split('\n').filter(Boolean).map(line => {
      const [hash, author, date, ...subject] = line.split('\t');
      return { hash, author, date, subject: subject.join('\t') };
    });
    return { available: true, branch, clean: status.length === 0, status, commits: log };
  } catch (error) {
    return { available: false, error: error.message };
  }
}
const git = { collectGitData, DEFAULT_OPTIONS: { top: 20, adjustForAi: false, cwd: process.cwd() } };

const DEFAULT_DOC_DRIFT_IGNORE = [
  /(^|\/)versioned_docs\//,
  /(^|\/)versioned_sidebars\//,
  /(^|\/)tests\/fixtures\//,
  /(^|\/)__fixtures__\//,
  /(^|\/)generated\//,
  /\.generated\.md$/,
  /(^|\/)CHANGELOG\.md$/i,
  /(^|\/)node_modules\//,
  /(^|\/)target\//,
  /(^|\/)dist\//,
  /(^|\/)build\//,
];
function isEntryPointSymbol(symbol, entryPoints = [], options = {}) {
  const name = typeof symbol === 'string' ? symbol : symbol.name || '';
  const file = typeof symbol === 'string' ? '' : symbol.file || symbol.path || '';
  return entryPoints.some(entry => typeof entry === 'string' ? entry === name : entry.name === name && (!entry.file || entry.file === file)) || (options.entryPointSet instanceof Set && options.entryPointSet.has(name));
}
function collectAnalyzerQueries(options = {}) {
  const cwd = options.cwd || process.cwd();
  const mapFile = resolveMapFile(cwd);
  if (!fs.existsSync(mapFile)) return { available: false, reason: 'repo-intel-map-missing', queryErrors: [], mapFile, staleDocs: null, staleDocsByKey: null, staleDocsByDoc: null, docDrift: null, docDriftAll: null, entryPoints: null, entryPointSet: null, entryPointSymbols: null, slopFixes: null, orphanExports: null, passthroughWrappers: null, alwaysTrueConditions: null, commentedOutCode: null, staleSuppressions: null };
  try { return { available: true, mapFile, data: JSON.parse(fs.readFileSync(mapFile, 'utf8')), queryErrors: [] }; }
  catch (error) { return { available: false, reason: 'repo-intel-map-invalid', mapFile, queryErrors: [error.message] }; }
}
const analyzerQueries = { DEFAULT_OPTIONS: { cwd: process.cwd() }, DEFAULT_DOC_DRIFT_IGNORE, collect: collectAnalyzerQueries, isEntryPointSymbol, resolveMapFile, resolveStateDir };

const DEFAULT_OPTIONS = { collectors: ['github', 'docs', 'code'], depth: 'thorough', cwd: process.cwd() };
async function collect(options = {}) {
  const settings = mergeOptions(DEFAULT_OPTIONS, options);
  const requested = new Set(settings.collectors);
  const result = {
    timestamp: new Date().toISOString(),
    options: settings,
    github: null,
    docs: null,
    code: null,
    docsPatterns: null,
    git: null,
    analyzer: null,
  };
  if (requested.has('github')) result.github = scanGitHubState(settings);
  if (requested.has('docs')) result.docs = await analyzeDocumentation(settings);
  if (requested.has('code')) result.code = await scanCodebase(settings);
  if (requested.has('docsPatterns')) result.docsPatterns = await collectDocPatterns(settings);
  if (requested.has('git')) result.git = collectGitData(settings);
  if (requested.has('analyzer')) result.analyzer = collectAnalyzerQueries(settings);
  return result;
}
async function collectAllData(options = {}) {
  return collect(options);
}

module.exports = {
  collect, collectAllData, github, documentation, codebase, docsPatterns, git, analyzerQueries,
  scanGitHubState, isGhAvailable, analyzeDocumentation, scanCodebase, findRelatedDocs,
  analyzeDocIssues, checkChangelog, ensureRepoMap, ensureRepoMapSync, getExportsFromRepoMap,
  findUndocumentedExports, isInternalExport, isEntryPoint, collectGitData, DEFAULT_OPTIONS,
};

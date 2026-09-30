'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SOURCE_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.rs', '.go', '.py', '.java',
]);
const EXCLUDED_DIRECTORIES = new Set([
  'node_modules', 'vendor', 'dist', 'build', 'out', 'target', '.git', '.svn',
  '.hg', '__pycache__', '.pytest_cache', 'coverage', '.nyc_output', '.next',
  '.nuxt', '.cache',
]);
const INTERNAL_PATH_PARTS = new Set([
  'internal', 'private', 'utils', 'helpers', '__tests__', 'test', 'tests',
]);

function run(command, args, options = {}) {
  try {
    return execFileSync(command, args, {
      cwd: options.cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: options.timeout || 30_000,
      maxBuffer: 10 * 1024 * 1024,
    }).trim();
  } catch {
    return '';
  }
}

function isPathSafe(root, candidate) {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(candidate);
  return resolvedCandidate === resolvedRoot || resolvedCandidate.startsWith(`${resolvedRoot}${path.sep}`);
}

function safeReadFile(filename, root = path.dirname(filename), limit = 2 * 1024 * 1024) {
  if (!isPathSafe(root, filename)) return null;
  try {
    const stat = fs.statSync(filename);
    if (!stat.isFile() || stat.size > limit) return null;
    return fs.readFileSync(filename, 'utf8');
  } catch {
    return null;
  }
}

function walkFiles(root, predicate, depth = 'normal') {
  const maximumDepth = depth === 'thorough' ? 12 : depth === 'shallow' ? 2 : 6;
  const files = [];
  function visit(directory, level) {
    if (level > maximumDepth) return;
    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory() && EXCLUDED_DIRECTORIES.has(entry.name)) continue;
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(filename, level + 1);
      else if (entry.isFile() && predicate(filename)) files.push(filename);
    }
  }
  visit(path.resolve(root), 0);
  return files;
}

function isGhAvailable() {
  return Boolean(run('gh', ['--version'], { timeout: 5_000 }));
}

function ghJson(cwd, args, fallback = []) {
  const output = run('gh', args, { cwd });
  if (!output) return fallback;
  try { return JSON.parse(output); } catch { return fallback; }
}

function categorizeIssues(issues) {
  const categories = {};
  for (const issue of issues) {
    const labels = (issue.labels || []).map(label => typeof label === 'string' ? label : label.name);
    const category = labels[0] || 'unlabeled';
    (categories[category] ||= []).push(issue);
  }
  return categories;
}

function findStaleItems(items, staleDays = 90) {
  const cutoff = Date.now() - staleDays * 86_400_000;
  return items.filter(item => Date.parse(item.updatedAt || item.updated_at || 0) < cutoff);
}

function extractThemes(items) {
  const counts = new Map();
  for (const item of items) {
    const words = String(item.title || '').toLowerCase().match(/[a-z][a-z-]{3,}/g) || [];
    for (const word of words) counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]).slice(0, 20)
    .map(([theme, count]) => ({ theme, count }));
}

function findOverdueMilestones(milestones) {
  const now = Date.now();
  return milestones.filter(item => item.dueOn && Date.parse(item.dueOn) < now && item.state !== 'CLOSED');
}

function scanGitHubState(options = {}) {
  const cwd = options.cwd || process.cwd();
  if (!isGhAvailable()) return { available: false, issues: [], pullRequests: [], milestones: [] };
  const issueLimit = options.issueLimit || 100;
  const prLimit = options.prLimit || 100;
  const milestoneLimit = options.milestoneLimit || 100;
  const issues = ghJson(cwd, ['issue', 'list', '--state', 'all', '--limit', String(issueLimit), '--json',
    'number,title,state,labels,createdAt,updatedAt,closedAt,author,milestone,url']);
  const pullRequests = ghJson(cwd, ['pr', 'list', '--state', 'all', '--limit', String(prLimit), '--json',
    'number,title,state,labels,createdAt,updatedAt,closedAt,author,milestone,url,isDraft']);
  const milestones = ghJson(cwd, ['api', '--paginate', `repos/{owner}/{repo}/milestones?state=all&per_page=${milestoneLimit}`]);
  return {
    available: true,
    issues,
    pullRequests,
    milestones,
    issueCategories: categorizeIssues(issues),
    staleIssues: findStaleItems(issues, options.staleDays),
    stalePullRequests: findStaleItems(pullRequests, options.staleDays),
    themes: extractThemes([...issues, ...pullRequests]),
    overdueMilestones: findOverdueMilestones(milestones),
  };
}

function analyzeMarkdownFile(filename, root) {
  const text = safeReadFile(filename, root);
  if (text == null) return null;
  const headings = [...text.matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => match[1].trim());
  const links = [...text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map(match => match[1]);
  const checkboxes = [...text.matchAll(/^\s*[-*]\s+\[([ xX])\]\s*(.+)$/gm)].map(match => ({
    checked: match[1].toLowerCase() === 'x', text: match[2].trim(),
  }));
  return { path: path.relative(root, filename), headings, links, checkboxes, size: Buffer.byteLength(text) };
}

function analyzeDocumentation(options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const files = walkFiles(cwd, filename => /(?:^|\/)(?:readme|changelog)[^/]*\.md$/i.test(filename)
    || /\.(?:md|mdx)$/i.test(filename), options.depth);
  const documents = files.map(filename => analyzeMarkdownFile(filename, cwd)).filter(Boolean);
  const todos = documents.flatMap(document => document.checkboxes
    .filter(item => !item.checked).map(item => ({ ...item, path: document.path })));
  return {
    files: documents,
    fileCount: documents.length,
    uncheckedTasks: todos,
    gaps: documents.filter(document => document.headings.length === 0).map(document => document.path),
  };
}

function detectFrameworks(root) {
  const packageText = safeReadFile(path.join(root, 'package.json'), root);
  if (!packageText) return [];
  try {
    const pkg = JSON.parse(packageText);
    const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
    return ['react', 'vue', 'svelte', 'next', 'nuxt', 'express', 'fastify', 'nest'].filter(name => dependencies[name]);
  } catch { return []; }
}

function detectTestFramework(root) {
  const packageText = safeReadFile(path.join(root, 'package.json'), root);
  if (!packageText) return null;
  return ['vitest', 'jest', 'mocha', 'ava', 'tap'].find(name => packageText.includes(`"${name}"`)) || null;
}

function extractSymbols(text, filename) {
  const symbols = [];
  const patterns = [
    /\b(?:export\s+)?(?:async\s+)?function\s+(\w+)/g,
    /\b(?:export\s+)?class\s+(\w+)/g,
    /\bexport\s+(?:const|let|var)\s+(\w+)/g,
  ];
  for (const expression of patterns) {
    for (const match of text.matchAll(expression)) symbols.push({ name: match[1], file: filename });
  }
  return symbols;
}

function scanCodebase(options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const files = walkFiles(cwd, filename => SOURCE_EXTENSIONS.has(path.extname(filename).toLowerCase()), options.depth);
  const languages = {};
  const symbols = [];
  let lines = 0;
  for (const filename of files) {
    const extension = path.extname(filename).toLowerCase();
    languages[extension.slice(1)] = (languages[extension.slice(1)] || 0) + 1;
    const text = safeReadFile(filename, cwd);
    if (text == null) continue;
    lines += text.split('\n').length;
    symbols.push(...extractSymbols(text, path.relative(cwd, filename)));
  }
  return {
    files: files.map(filename => path.relative(cwd, filename)),
    fileCount: files.length,
    lines,
    languages,
    frameworks: detectFrameworks(cwd),
    testFramework: detectTestFramework(cwd),
    symbols,
    health: { hasTests: files.some(file => /(?:^|\/)(?:test|tests|__tests__)(?:\/|$)|\.(?:test|spec)\./.test(file)) },
  };
}

function isInternalExport(item) {
  const filename = typeof item === 'string' ? item : item.file || item.path || '';
  return filename.split(/[\\/]/).some(part => INTERNAL_PATH_PARTS.has(part)) || /^_/.test(item.name || '');
}

function isEntryPoint(item) {
  const filename = typeof item === 'string' ? item : item.file || item.path || '';
  return /(?:^|\/)(?:index|main|app|server|cli|bin)\.[^.]+$/.test(filename.replaceAll('\\', '/'));
}

function findMarkdownFiles(options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  return walkFiles(cwd, file => /\.(?:md|mdx)$/i.test(file), options.depth).map(file => path.relative(cwd, file));
}

function findLineNumber(text, needle) {
  const index = text.indexOf(needle);
  return index < 0 ? -1 : text.slice(0, index).split('\n').length;
}

function getExportsFromGit(options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const files = run('git', ['ls-files'], { cwd }).split('\n').filter(Boolean)
    .filter(file => SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()));
  return files.flatMap(file => extractSymbols(safeReadFile(path.join(cwd, file), cwd) || '', file));
}

function getExportsFromRepoMap(repoMap) {
  const map = typeof repoMap === 'string' ? JSON.parse(fs.readFileSync(repoMap, 'utf8')) : repoMap;
  const symbols = map && (map.symbols || map.exports || map.data?.symbols);
  return Array.isArray(symbols) ? symbols.filter(symbol => symbol.exported !== false) : [];
}

function findUndocumentedExports(exportsList, documentation = '') {
  const documentedText = typeof documentation === 'string' ? documentation : JSON.stringify(documentation);
  return exportsList.filter(item => !isInternalExport(item) && !new RegExp(`\\b${String(item.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(documentedText));
}

function findRelatedDocs(symbol, options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  return findMarkdownFiles(options).filter(file => {
    const text = safeReadFile(path.join(cwd, file), cwd) || '';
    return new RegExp(`\\b${String(symbol).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text);
  });
}

function analyzeDocIssues(options = {}) {
  const documentation = analyzeDocumentation(options);
  const exportsList = getExportsFromGit(options);
  return {
    undocumentedExports: findUndocumentedExports(exportsList, documentation),
    emptyDocuments: documentation.gaps,
    uncheckedTasks: documentation.uncheckedTasks,
  };
}

function checkChangelog(options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const filename = ['CHANGELOG.md', 'Changelog.md', 'changelog.md'].map(name => path.join(cwd, name)).find(fs.existsSync);
  return filename ? { exists: true, path: path.relative(cwd, filename), content: safeReadFile(filename, cwd) } : { exists: false };
}

function collectGitData(options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const branch = run('git', ['branch', '--show-current'], { cwd });
  const status = run('git', ['status', '--short'], { cwd });
  const log = run('git', ['log', '--date=iso-strict', '--pretty=format:%H%x09%an%x09%ad%x09%s', '-n', String(options.limit || 100)], { cwd });
  const commits = log ? log.split('\n').map(line => {
    const [hash, author, date, ...subject] = line.split('\t');
    return { hash, author, date, subject: subject.join('\t') };
  }) : [];
  return { available: Boolean(branch || commits.length), branch, dirty: Boolean(status), changes: status ? status.split('\n') : [], commits };
}

const DEFAULT_DOC_DRIFT_IGNORE = [
  /(^|\/)versioned_docs\//i, /(^|\/)versioned_sidebars\//i,
  /(^|\/)tests\/fixtures\//i, /(^|\/)__fixtures__\//i,
  /(^|\/)generated\//i, /\.generated\.md$/i, /(^|\/)CHANGELOG\.md$/i,
  /(^|\/)node_modules\//i, /(^|\/)target\//i, /(^|\/)dist\//i, /(^|\/)build\//i,
];

function collectAnalyzerQueries(options = {}) {
  const files = getExportsFromGit(options).filter(symbol => !isInternalExport(symbol));
  return {
    entryPoints: files.filter(isEntryPoint),
    staleDocs: findMarkdownFiles(options).filter(file => !DEFAULT_DOC_DRIFT_IGNORE.some(pattern => pattern.test(file))),
    undocumentedExports: findUndocumentedExports(files, analyzeDocumentation(options)),
  };
}

function ensureRepoMapSync(options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const candidates = [path.join(cwd, '.agent', 'repo-map.json'), path.join(cwd, 'repo-map.json')];
  return candidates.find(fs.existsSync) || null;
}

async function ensureRepoMap(options = {}) { return ensureRepoMapSync(options); }

const github = { scanGitHubState, isGhAvailable, categorizeIssues, findStaleItems, extractThemes, findOverdueMilestones };
const documentation = { analyzeDocumentation, analyzeMarkdownFile };
const codebase = { scanCodebase, detectFrameworks, detectTestFramework, extractSymbols };
const docsPatterns = {
  analyzeDocIssues, findRelatedDocs, checkChangelog, ensureRepoMap, ensureRepoMapSync,
  getExportsFromRepoMap, findUndocumentedExports, isInternalExport, isEntryPoint,
};
const git = { collectGitData };
const analyzerQueries = { collect: collectAnalyzerQueries, isEntryPointSymbol: isEntryPoint };

const DEFAULT_OPTIONS = { collectors: ['github', 'docs', 'code'], depth: 'normal', cwd: process.cwd() };

async function collect(options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const selected = Array.isArray(settings.collectors) ? settings.collectors : DEFAULT_OPTIONS.collectors;
  const result = { timestamp: new Date().toISOString(), options: settings };
  if (selected.includes('github')) result.github = scanGitHubState(settings);
  if (selected.includes('docs') || selected.includes('documentation')) result.docs = analyzeDocumentation(settings);
  if (selected.includes('code') || selected.includes('codebase')) result.code = scanCodebase(settings);
  if (selected.includes('docs-patterns')) result.docsPatterns = analyzeDocIssues(settings);
  if (selected.includes('git')) result.git = collectGitData(settings);
  if (selected.includes('analyzer')) result.analyzer = collectAnalyzerQueries(settings);
  return result;
}

async function collectAllData(options = {}) {
  const data = await collect({
    ...options,
    collectors: options.collectors || ['github', 'docs', 'code', 'docs-patterns', 'git', 'analyzer'],
  });
  return { ...data, sources: Object.keys(data).filter(key => !['timestamp', 'options'].includes(key)) };
}

module.exports = {
  collect,
  collectAllData,
  github,
  documentation,
  codebase,
  docsPatterns,
  git,
  analyzerQueries,
  scanGitHubState,
  isGhAvailable,
  analyzeDocumentation,
  scanCodebase,
  findRelatedDocs,
  analyzeDocIssues,
  checkChangelog,
  ensureRepoMap,
  ensureRepoMapSync,
  getExportsFromRepoMap,
  findUndocumentedExports,
  isInternalExport,
  isEntryPoint,
  collectGitData,
  DEFAULT_OPTIONS,
};

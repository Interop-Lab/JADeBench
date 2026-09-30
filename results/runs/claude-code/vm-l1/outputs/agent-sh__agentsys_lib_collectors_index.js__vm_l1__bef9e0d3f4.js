'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const EXCLUDE_DIRS = new Set([
  'node_modules', 'vendor', 'dist', 'build', 'out', 'target', '.git', '.svn',
  '.hg', '__pycache__', '.pytest_cache', 'coverage', '.nyc_output', '.next',
  '.nuxt', '.cache',
]);
const SOURCE_EXTENSIONS = {
  js: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'], rust: ['.rs'],
  go: ['.go'], python: ['.py'], java: ['.java'],
};
const DEFAULT_DOC_DRIFT_IGNORE = [
  /(^|\/)versioned_docs\//, /(^|\/)versioned_sidebars\//,
  /(^|\/)tests\/fixtures\//, /(^|\/)__fixtures__\//, /(^|\/)generated\//,
  /\.generated\.md$/, /(^|\/)CHANGELOG\.md$/i, /(^|\/)node_modules\//,
  /(^|\/)target\//, /(^|\/)dist\//, /(^|\/)build\//,
];
const DEFAULT_OPTIONS = { collectors: ['github', 'docs', 'code'], depth: 'thorough', cwd: process.cwd() };

function options(defaults, supplied) { return { ...defaults, ...(supplied || {}) }; }
function walk(root, accept, found = []) {
  let entries;
  try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { return found; }
  for (const entry of entries) {
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) { if (!EXCLUDE_DIRS.has(entry.name)) walk(file, accept, found); }
    else if (accept(file)) found.push(file);
  }
  return found;
}
function isPathSafe(file, root) {
  const base = path.resolve(root), resolved = path.resolve(base, file);
  return resolved === base || resolved.startsWith(`${base}${path.sep}`);
}
function safeReadFile(file, root) {
  if (!isPathSafe(file, root)) return null;
  try { return fs.readFileSync(path.resolve(root, file), 'utf8'); } catch { return null; }
}
function readFileWithLimit(file, limit = 1024 * 1024) {
  try { return fs.statSync(file).size <= limit ? fs.readFileSync(file, 'utf8') : null; } catch { return null; }
}

const github = (() => {
  const DEFAULT_OPTIONS = { issueLimit: 100, prLimit: 50, milestoneLimit: 100, timeout: 10000, cwd: process.cwd() };
  function execGh(args, supplied = {}) {
    const config = options(DEFAULT_OPTIONS, supplied);
    return execFileSync('gh', args, { cwd: config.cwd, timeout: config.timeout, encoding: 'utf8' });
  }
  function isGhAvailable() { try { execGh(['--version']); return true; } catch { return false; } }
  function labels(items) { return Array.isArray(items) ? items.map(x => typeof x === 'string' ? x : x?.name).filter(Boolean) : []; }
  function summarizeIssue(issue) {
    return { number: issue.number, title: issue.title, labels: labels(issue.labels), milestone: issue.milestone || null,
      createdAt: issue.createdAt, updatedAt: issue.updatedAt, author: issue.author?.login,
      comments: issue.comments?.totalCount, snippet: (issue.body || '').slice(0, 500) };
  }
  function summarizePR(pr) {
    return { number: pr.number, title: pr.title, labels: labels(pr.labels), author: pr.author?.login,
      isDraft: pr.isDraft, mergeable: pr.mergeable, files: pr.files || [], snippet: (pr.body || '').slice(0, 500) };
  }
  function categorizeIssues(issues, categories) {
    const result = Object.fromEntries([...categories].map(name => [name, []])); result.other = [];
    for (const issue of issues) {
      const issueLabels = labels(issue.labels).map(x => x.toLowerCase());
      const category = [...categories].find(x => issueLabels.includes(x.toLowerCase()));
      result[category || 'other'].push(issue);
    }
    return result;
  }
  function findStaleItems(items, days, now) {
    const cutoff = new Date(now === undefined ? Date.now() : now).getTime() - days * 86400000;
    return items.filter(item => new Date(item.updatedAt || item.createdAt).getTime() < cutoff);
  }
  function extractThemes(items, limit) {
    const counts = new Map();
    for (const item of items) for (const label of labels(item.labels)) counts.set(label, (counts.get(label) || 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, count]) => ({ name, count }));
  }
  function findOverdueMilestones(items) { return items.filter(x => x.dueOn && Date.parse(x.dueOn) < Date.now() && x.state !== 'CLOSED'); }
  function scanGitHubState(supplied = {}) {
    const config = options(DEFAULT_OPTIONS, supplied);
    if (!isGhAvailable()) return { available: false, issues: [], pullRequests: [], milestones: [] };
    try {
      const issues = JSON.parse(execGh(['issue', 'list', '--limit', String(config.issueLimit), '--json', 'number,title,body,labels,milestone,createdAt,updatedAt,author,comments'], config));
      const prs = JSON.parse(execGh(['pr', 'list', '--limit', String(config.prLimit), '--json', 'number,title,body,labels,author,isDraft,mergeable,files'], config));
      return { available: true, issues: issues.map(summarizeIssue), pullRequests: prs.map(summarizePR), themes: extractThemes(issues, 10) };
    } catch (error) { return { available: true, error: error.message, issues: [], pullRequests: [] }; }
  }
  return { DEFAULT_OPTIONS, scanGitHubState, isGhAvailable, execGh, summarizeIssue, summarizePR,
    categorizeIssues, findStaleItems, extractThemes, findOverdueMilestones };
})();

const documentation = (() => {
  const DEFAULT_OPTIONS = { depth: 'thorough', cwd: process.cwd() };
  function extractCheckboxes(lines, file) {
    const result = { checked: [], unchecked: [] };
    lines.forEach((line, index) => { const match = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.+)/); if (match)
      result[match[1].toLowerCase() === 'x' ? 'checked' : 'unchecked'].push({ text: match[2], file, line: index + 1 }); });
    return result;
  }
  function sectionItems(lines, pattern, file) {
    const result = []; let active = false;
    lines.forEach((line, index) => { const heading = line.match(/^#{1,6}\s+(.+)/); if (heading) active = pattern.test(heading[1]);
      else if (active) { const item = line.match(/^\s*[-*]\s+(?:\[[ xX]\]\s*)?(.+)/); if (item) result.push({ text: item[1], file, line: index + 1 }); } });
    return result;
  }
  const extractFeatures = (lines, file) => sectionItems(lines, /features?|capabilities|highlights/i, file);
  const extractPlans = (lines, file) => sectionItems(lines, /roadmap|plans?|todo|future/i, file);
  function analyzeMarkdownFile(file, root) {
    const content = safeReadFile(file, root); if (content === null) return null; const lines = content.split(/\r?\n/);
    return { path: path.relative(root, path.resolve(root, file)), wordCount: content.trim() ? content.trim().split(/\s+/).length : 0,
      headings: lines.flatMap((line, i) => { const m = line.match(/^(#{1,6})\s+(.+)/); return m ? [{ level: m[1].length, text: m[2], line: i + 1 }] : []; }),
      checkboxes: extractCheckboxes(lines, file), features: extractFeatures(lines, file), plans: extractPlans(lines, file) };
  }
  function identifyDocGaps(files) {
    const names = new Set(files.map(x => path.basename(x.path).toLowerCase())), gaps = [];
    if (!names.has('readme.md')) gaps.push({ type: 'missing', file: 'README.md' });
    if (![...names].some(x => x.includes('contribut'))) gaps.push({ type: 'missing', file: 'CONTRIBUTING.md' });
    if (![...names].some(x => x.includes('changelog'))) gaps.push({ type: 'missing', file: 'CHANGELOG.md' });
    return gaps.concat(files.filter(x => x.wordCount < 20).map(x => ({ type: 'thin', file: x.path })));
  }
  function analyzeDocumentation(supplied = {}) {
    const config = options(DEFAULT_OPTIONS, supplied);
    const files = walk(config.cwd, file => /\.mdx?$/i.test(file)).map(file => analyzeMarkdownFile(file, config.cwd)).filter(Boolean);
    return { files, gaps: identifyDocGaps(files) };
  }
  return { DEFAULT_OPTIONS, analyzeDocumentation, analyzeMarkdownFile, safeReadFile, isPathSafe,
    extractCheckboxes, extractFeatures, extractPlans, identifyDocGaps };
})();

const codebase = (() => {
  const DEFAULT_OPTIONS = { depth: 'thorough', cwd: process.cwd() };
  const shouldExclude = file => file.split(/[\\/]/).some(part => EXCLUDE_DIRS.has(part));
  function extractSymbols(source) {
    const functions = [...source.matchAll(/\b(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>)/g)].map(x => x[1] || x[2]);
    const classes = [...source.matchAll(/\bclass\s+(\w+)/g)].map(x => x[1]);
    const exports = [...source.matchAll(/\bexport\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+(\w+)/g)].map(x => x[1]);
    return { functions: [...new Set(functions)], classes: [...new Set(classes)], exports: [...new Set(exports)] };
  }
  function scanFileSymbols(file, root) { const source = safeReadFile(file, root); return source === null ? null : { file: path.relative(root, file), ...extractSymbols(source) }; }
  function scanDirectory(directory, root, depth, result) {
    result ||= [];
    if (depth < 0 || shouldExclude(path.relative(root, directory))) return result;
    let entries; try { entries = fs.readdirSync(directory, { withFileTypes: true }); } catch { return result; }
    for (const entry of entries) { const file = path.join(directory, entry.name); if (entry.isDirectory()) scanDirectory(file, root, depth - 1, result);
      else if (Object.values(SOURCE_EXTENSIONS).flat().includes(path.extname(file))) { const item = scanFileSymbols(file, root); if (item) result.push(item); } }
    return result;
  }
  function detectFrameworks(files, pkg) { pkg ||= {}; const deps = { ...pkg.dependencies, ...pkg.devDependencies }; return ['react','vue','svelte','next','nuxt','express','fastify','nestjs'].filter(x => deps[x]); }
  function detectTestFramework(files, pkg) { pkg ||= {}; const text = JSON.stringify(pkg); return ['jest','vitest','mocha','ava','tap','pytest'].filter(x => text.includes(x)); }
  function detectHealth(files, pkg) { const names = files.map(x => x.toLowerCase()); return { hasReadme: names.some(x => /(^|\/)readme\.md$/.test(x)), hasTests: names.some(x => /(^|\/)(test|tests|__tests__)(\/|$)/.test(x)), hasLicense: names.some(x => /(^|\/)license/.test(x)), hasPackageMetadata: Boolean(pkg) }; }
  function findImplementedFeatures(files, symbols) { return symbols.flatMap(file => [...file.functions, ...file.classes].map(name => ({ name, file: file.file }))); }
  function scanCodebase(supplied = {}) {
    const config = options(DEFAULT_OPTIONS, supplied), files = walk(config.cwd, () => true).map(x => path.relative(config.cwd, x)); let pkg = null;
    try { pkg = JSON.parse(fs.readFileSync(path.join(config.cwd, 'package.json'), 'utf8')); } catch {}
    const symbols = scanDirectory(config.cwd, config.cwd, config.depth === 'thorough' ? Infinity : 4);
    return { frameworks: detectFrameworks(files, pkg || {}), testFrameworks: detectTestFramework(files, pkg || {}), health: detectHealth(files, pkg), symbols, features: findImplementedFeatures(files, symbols) };
  }
  return { DEFAULT_OPTIONS, EXCLUDE_DIRS, SOURCE_EXTENSIONS, scanCodebase, detectFrameworks, detectTestFramework,
    detectHealth, findImplementedFeatures, extractSymbols, scanFileSymbols, scanDirectory, shouldExclude, safeReadFile };
})();

const docsPatterns = (() => {
  const DEFAULT_OPTIONS = { cwd: process.cwd() }; let repoMapLoadError = null;
  const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const isInternalExport = (name, file) => name.startsWith('_') || /(^|\/)(internal|private|utils|helpers|__tests__|tests?)(\/|$)/i.test(file);
  function isEntryPoint(file) { return ['index','main','app','server','cli','bin'].includes(path.basename(file, path.extname(file)).toLowerCase()) || /(^|\/)bin\//.test(file); }
  const findMarkdownFiles = root => walk(root, file => /\.mdx?$/i.test(file));
  function findLineNumber(content, needle) { const index = content.split(/\r?\n/).findIndex(line => line.includes(needle)); return index < 0 ? 0 : index + 1; }
  function compareVersions(a, b) { const left = a.split('.').map(Number), right = b.split('.').map(Number); for (let i = 0; i < Math.max(left.length, right.length); i++) if ((left[i] || 0) !== (right[i] || 0)) return (left[i] || 0) > (right[i] || 0) ? 1 : -1; return 0; }
  function ensureRepoMapSync(supplied = {}) { const cwd = supplied.cwd || process.cwd(); for (const file of [path.join(cwd, '.agent/repo-map.json'), path.join(cwd, 'repo-map.json')]) try { repoMapLoadError = null; return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (error) { repoMapLoadError = error; } return null; }
  async function ensureRepoMap(supplied = {}) { return ensureRepoMapSync(supplied); }
  function getExportsFromRepoMap(map, file) { const files = map && (map.files || map.symbols || map), record = Array.isArray(files) ? files.find(x => x.path === file || x.file === file) : files?.[file]; return (record?.exports || record?.symbols || []).map(x => typeof x === 'string' ? { name: x, file } : x); }
  const findUndocumentedExports = items => items.filter(x => !x.documented && !isInternalExport(x.name, x.file || ''));
  function findRelatedDocs(symbol) { const query = typeof symbol === 'object' ? symbol : { name: symbol }, root = query.cwd || process.cwd(), pattern = new RegExp(`\\b${escapeRegex(query.name)}\\b`, 'i'); return findMarkdownFiles(root).flatMap(file => { const text = readFileWithLimit(file); return text && pattern.test(text) ? [{ file: path.relative(root, file), line: findLineNumber(text, query.name) }] : []; }); }
  function analyzeDocIssues(exports, docs) { docs ||= []; const names = new Set(docs.flatMap(x => x.symbols || [])); return exports.filter(x => !names.has(x.name) && !isInternalExport(x.name, x.file || '')); }
  function checkChangelog(supplied) { supplied ||= {}; const cwd = supplied.cwd || process.cwd(), file = ['CHANGELOG.md','HISTORY.md','CHANGES.md'].find(x => fs.existsSync(path.join(cwd, x))); return { exists: Boolean(file), file: file || null }; }
  function getExportsFromGit(file, supplied) { supplied ||= {}; try { const text = execFileSync('git', ['show', `HEAD:${file}`], { cwd: supplied.cwd || process.cwd(), encoding: 'utf8' }); return codebase.extractSymbols(text).exports.map(name => ({ name, file })); } catch { return []; } }
  const collect = (supplied = {}) => ({ repoMap: ensureRepoMapSync(supplied), changelog: checkChangelog(supplied) });
  return { DEFAULT_OPTIONS, findRelatedDocs, findMarkdownFiles, analyzeDocIssues, checkChangelog, getExportsFromGit,
    compareVersions, findLineNumber, collect, ensureRepoMap, ensureRepoMapSync, getExportsFromRepoMap,
    findUndocumentedExports, isInternalExport, isEntryPoint, escapeRegex, getRepoMapLoadError: () => repoMapLoadError };
})();

const git = (() => {
  const DEFAULT_OPTIONS = { top: 20, adjustForAi: false, cwd: process.cwd() };
  function collectGitData(supplied = {}) { const config = options(DEFAULT_OPTIONS, supplied); try { const text = execFileSync('git', ['log', `-${config.top}`, '--date=iso', '--pretty=format:%H%x09%an%x09%ad%x09%s'], { cwd: config.cwd, encoding: 'utf8' }); return { available: true, commits: text.split('\n').filter(Boolean).map(line => { const [hash, author, date, ...subject] = line.split('\t'); return { hash, author, date, subject: subject.join('\t') }; }) }; } catch (error) { return { available: false, commits: [], error: error.message }; } }
  return { collectGitData, DEFAULT_OPTIONS };
})();

const analyzerQueries = (() => {
  const DEFAULT_OPTIONS = { cwd: process.cwd() };
  const resolveStateDir = supplied => path.join(typeof supplied === 'string' ? supplied : supplied?.cwd || process.cwd(), '.agent');
  const resolveMapFile = supplied => path.join(resolveStateDir(supplied), 'repo-map.json');
  const isEntryPointSymbol = (symbol, file, project) => Boolean(symbol && docsPatterns.isEntryPoint(file) && project?.entryPoints?.includes(file));
  function collect(supplied = {}) { const mapFile = resolveMapFile(supplied); try { return { available: true, mapFile, data: JSON.parse(fs.readFileSync(mapFile, 'utf8')) }; } catch (error) { return { available: false, mapFile, error: error.message }; } }
  return { DEFAULT_OPTIONS, DEFAULT_DOC_DRIFT_IGNORE, collect, isEntryPointSymbol, resolveMapFile, resolveStateDir };
})();

function collect(supplied = {}) {
  const config = options(DEFAULT_OPTIONS, supplied), selected = Array.isArray(config.collectors) ? config.collectors : DEFAULT_OPTIONS.collectors;
  const result = { timestamp: new Date().toISOString(), options: config };
  if (selected.includes('github')) result.github = github.scanGitHubState(config);
  if (selected.includes('docs')) result.docs = documentation.analyzeDocumentation(config);
  if (selected.includes('code')) result.code = codebase.scanCodebase(config);
  if (selected.includes('docs-patterns')) result.docsPatterns = docsPatterns.collect(config);
  if (selected.includes('git')) result.git = git.collectGitData(config);
  if (selected.includes('analyzer')) result.analyzer = analyzerQueries.collect(config);
  return result;
}
function collectAllData(supplied = {}) { return { github: github.scanGitHubState(supplied), docs: documentation.analyzeDocumentation(supplied), code: codebase.scanCodebase(supplied), sources: [...DEFAULT_OPTIONS.collectors], collectors: collect(supplied) }; }

module.exports = {
  collect, collectAllData, github, documentation, codebase, docsPatterns, git, analyzerQueries,
  scanGitHubState: github.scanGitHubState, isGhAvailable: github.isGhAvailable,
  analyzeDocumentation: documentation.analyzeDocumentation, scanCodebase: codebase.scanCodebase,
  findRelatedDocs: docsPatterns.findRelatedDocs, analyzeDocIssues: docsPatterns.analyzeDocIssues,
  checkChangelog: docsPatterns.checkChangelog, ensureRepoMap: docsPatterns.ensureRepoMap,
  ensureRepoMapSync: docsPatterns.ensureRepoMapSync, getExportsFromRepoMap: docsPatterns.getExportsFromRepoMap,
  findUndocumentedExports: docsPatterns.findUndocumentedExports, isInternalExport: docsPatterns.isInternalExport,
  isEntryPoint: docsPatterns.isEntryPoint, collectGitData: git.collectGitData, DEFAULT_OPTIONS,
};

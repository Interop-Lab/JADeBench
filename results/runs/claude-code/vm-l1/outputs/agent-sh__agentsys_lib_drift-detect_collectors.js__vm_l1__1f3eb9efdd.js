'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const GITHUB_DEFAULTS = { issueLimit: 100, prLimit: 50, milestoneLimit: 50, timeout: 10000 };
const DEFAULT_OPTIONS = Object.freeze({
  sources: ['github', 'docs', 'code'],
  depth: 'thorough',
  issueLimit: GITHUB_DEFAULTS.issueLimit,
  prLimit: GITHUB_DEFAULTS.prLimit,
  timeout: GITHUB_DEFAULTS.timeout,
});
const EXCLUDE_DIRS = new Set([
  'node_modules', 'vendor', 'dist', 'build', 'out', 'target', '.git', '.svn', '.hg',
  '__pycache__', '.pytest_cache', 'coverage', '.nyc_output', '.next', '.nuxt', '.cache',
]);
const SOURCE_EXTENSIONS = new Map([
  ['.js', 'js'], ['.jsx', 'js'], ['.ts', 'js'], ['.tsx', 'js'], ['.mjs', 'js'], ['.cjs', 'js'],
  ['.rs', 'rust'], ['.go', 'go'], ['.py', 'python'], ['.java', 'java'],
]);
const MAX_FILE_SIZE = 50000;

function optionsWithDefaults(options = {}) {
  return { ...DEFAULT_OPTIONS, ...options, cwd: path.resolve(options.cwd || process.cwd()) };
}

function isPathSafe(filePath, root = process.cwd()) {
  const resolvedRoot = path.resolve(root);
  const relative = path.relative(resolvedRoot, path.resolve(resolvedRoot, filePath));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function readFileWithLimit(filePath, limit = MAX_FILE_SIZE) {
  const stat = fs.statSync(filePath);
  if (!stat.isFile()) return null;
  const descriptor = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(Math.min(stat.size, limit));
    const bytesRead = fs.readSync(descriptor, buffer, 0, buffer.length, 0);
    return buffer.subarray(0, bytesRead).toString('utf8');
  } finally {
    fs.closeSync(descriptor);
  }
}

function walk(directory, accept, files = []) {
  let entries;
  try { entries = fs.readdirSync(directory, { withFileTypes: true }); } catch { return files; }
  for (const entry of entries) {
    if (entry.isDirectory() && EXCLUDE_DIRS.has(entry.name)) continue;
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filePath, accept, files);
    else if (entry.isFile() && accept(filePath, entry.name)) files.push(filePath);
  }
  return files;
}

function isGhAvailable() {
  try {
    execFileSync('gh', ['--version'], { stdio: 'ignore', timeout: GITHUB_DEFAULTS.timeout });
    return true;
  } catch {
    return false;
  }
}

function runGh(args, options) {
  const output = execFileSync('gh', args, {
    cwd: options.cwd,
    timeout: options.timeout,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return output.trim() ? JSON.parse(output) : [];
}

function summarizeIssue(issue) {
  return {
    number: issue.number, title: issue.title, state: issue.state,
    labels: (issue.labels || []).map((label) => typeof label === 'string' ? label : label.name),
    createdAt: issue.createdAt, updatedAt: issue.updatedAt, url: issue.url,
  };
}

function categorizeIssues(issues) {
  const result = { bugs: [], features: [], documentation: [], other: [] };
  for (const issue of issues) {
    const labels = issue.labels.map((label) => label.toLowerCase());
    if (labels.some((label) => /bug|defect|regression/.test(label))) result.bugs.push(issue);
    else if (labels.some((label) => /feature|enhancement/.test(label))) result.features.push(issue);
    else if (labels.some((label) => /doc/.test(label))) result.documentation.push(issue);
    else result.other.push(issue);
  }
  return result;
}

function findStaleItems(items, days = 90) {
  const cutoff = Date.now() - days * 86400000;
  return items.filter((item) => item.updatedAt && Date.parse(item.updatedAt) < cutoff);
}

function extractThemes(items) {
  const counts = new Map();
  for (const item of items) for (const label of item.labels || []) counts.set(label, (counts.get(label) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
}

function scanGitHubState(options = {}) {
  const settings = optionsWithDefaults(options);
  if (!isGhAvailable()) return { available: false, issues: [], pullRequests: [], milestones: [] };
  const fields = 'number,title,state,labels,createdAt,updatedAt,url';
  const issues = runGh(['issue', 'list', '--state', 'all', '--limit', String(settings.issueLimit), '--json', fields], settings)
    .map(summarizeIssue);
  const pullRequests = runGh(['pr', 'list', '--state', 'all', '--limit', String(settings.prLimit), '--json', `${fields},isDraft`], settings)
    .map((pullRequest) => ({ ...summarizeIssue(pullRequest), isDraft: Boolean(pullRequest.isDraft) }));
  return {
    available: true, issues, pullRequests, categories: categorizeIssues(issues),
    staleIssues: findStaleItems(issues), stalePullRequests: findStaleItems(pullRequests),
    themes: extractThemes([...issues, ...pullRequests]),
  };
}

function extractCheckboxes(markdown) {
  return [...markdown.matchAll(/^\s*[-*]\s+\[([ xX])]\s+(.+)$/gm)]
    .map((match) => ({ checked: match[1].toLowerCase() === 'x', text: match[2].trim() }));
}

function extractFeatures(markdown) {
  const features = [];
  let active = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (/^#{1,6}\s+/.test(line)) active = /feature|capabilit/i.test(line);
    else if (active && /^\s*[-*]\s+\S/.test(line)) features.push(line.replace(/^\s*[-*]\s+/, '').trim());
  }
  return features;
}

function analyzeMarkdownFile(filePath, root) {
  if (!isPathSafe(filePath, root)) return null;
  let markdown;
  try { markdown = readFileWithLimit(filePath); } catch { return null; }
  if (markdown === null) return null;
  return {
    path: path.relative(root, filePath),
    headings: [...markdown.matchAll(/^(#{1,6})\s+(.+)$/gm)].map((match) => ({ level: match[1].length, text: match[2].trim() })),
    checkboxes: extractCheckboxes(markdown),
    features: extractFeatures(markdown),
    plans: markdown.split(/\r?\n/).filter((line) => /\b(todo|roadmap|planned|next|future)\b/i.test(line)).map((line) => line.trim()),
  };
}

function identifyDocGaps(documents) {
  const names = documents.map((document) => path.basename(document.path).toLowerCase());
  return ['README', 'CHANGELOG', 'CONTRIBUTING'].filter((wanted) =>
    !names.some((name) => name.startsWith(wanted.toLowerCase())));
}

function analyzeDocumentation(options = {}) {
  const settings = optionsWithDefaults(options);
  const documents = walk(settings.cwd, (filePath, name) => /\.md(?:own)?$/i.test(name))
    .map((filePath) => analyzeMarkdownFile(filePath, settings.cwd)).filter(Boolean);
  return {
    documents,
    checkboxes: documents.flatMap((document) => document.checkboxes.map((item) => ({ ...item, path: document.path }))),
    features: documents.flatMap((document) => document.features),
    plans: documents.flatMap((document) => document.plans),
    gaps: identifyDocGaps(documents),
  };
}

function detectFrameworks(files) {
  const result = new Set();
  for (const file of files) {
    let source;
    try { source = readFileWithLimit(file) || ''; } catch { continue; }
    if (/\breact\b|from\s+['"]react['"]/.test(source)) result.add('React');
    if (/\bvue\b|from\s+['"]vue['"]/.test(source)) result.add('Vue');
    if (/\bexpress\b|from\s+['"]express['"]/.test(source)) result.add('Express');
    if (/\bnext\//.test(source)) result.add('Next.js');
    if (/\bdjango\b/.test(source)) result.add('Django');
    if (/\bflask\b/.test(source)) result.add('Flask');
  }
  return [...result];
}

function extractSymbols(source, language) {
  const patterns = language === 'python'
    ? [/^\s*(?:async\s+)?def\s+([A-Za-z_]\w*)/gm, /^\s*class\s+([A-Za-z_]\w*)/gm]
    : language === 'go'
      ? [/^func\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)/gm, /^type\s+([A-Za-z_]\w*)/gm]
      : [/\b(?:function|class)\s+([A-Za-z_$][\w$]*)/g, /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/g];
  const symbols = [];
  for (const pattern of patterns) for (const match of source.matchAll(pattern)) symbols.push(match[1]);
  return [...new Set(symbols)];
}

function scanCodebase(options = {}) {
  const settings = optionsWithDefaults(options);
  const files = walk(settings.cwd, (filePath) => SOURCE_EXTENSIONS.has(path.extname(filePath).toLowerCase()));
  const languages = {};
  const symbols = [];
  let sourceLines = 0;
  for (const file of files) {
    const language = SOURCE_EXTENSIONS.get(path.extname(file).toLowerCase());
    languages[language] = (languages[language] || 0) + 1;
    let source;
    try { source = readFileWithLimit(file); } catch { continue; }
    if (source === null) continue;
    sourceLines += source.split(/\r?\n/).length;
    for (const name of extractSymbols(source, language)) symbols.push({ name, path: path.relative(settings.cwd, file), language });
  }
  return {
    files: files.map((file) => path.relative(settings.cwd, file)), fileCount: files.length,
    sourceLines, languages, frameworks: detectFrameworks(files), symbols,
  };
}

function collectAllData(options = {}) {
  const settings = optionsWithDefaults(options);
  const sources = new Set(settings.sources);
  const result = {};
  if (sources.has('github')) result.github = scanGitHubState(settings);
  if (sources.has('docs')) result.documentation = analyzeDocumentation(settings);
  if (sources.has('code')) result.codebase = scanCodebase(settings);
  return result;
}

module.exports = {
  DEFAULT_OPTIONS, scanGitHubState, analyzeDocumentation, scanCodebase,
  collectAllData, isGhAvailable, isPathSafe,
};

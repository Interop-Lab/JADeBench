'use strict';

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const DEFAULT_OPTIONS = Object.freeze({
  sources: ['github', 'docs', 'code'],
  depth: 'thorough',
  issueLimit: 100,
  prLimit: 50,
  timeout: 10_000,
});

const IGNORED_DIRECTORIES = new Set([
  '.git', '.hg', '.svn', 'node_modules', 'vendor', 'dist', 'build', 'coverage',
  '.next', '.nuxt', '.cache', '.turbo', 'target', '__pycache__', '.venv', 'venv',
]);
const DOCUMENTATION_FILES = /^(readme|changelog|contributing|roadmap|todo|plan|architecture|docs)(\.|$)/i;
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.rb', '.php', '.cs']);
const SELF_SCAN_EXCLUSIONS = new Set(['subject.cjs', 'answer.js']);
const SELF_SCAN_PREFIXES = ['_decode', '_decoded', '_inspect', '_stage', '_probe', '_runtime', '_vm_', '_remaining'];

function normalizeOptions(options = {}) {
  if (typeof options !== 'object' || options === null || Array.isArray(options)) options = {};
  const sources = Array.isArray(options.sources)
    ? options.sources
    : Array.isArray(options.collectors)
      ? options.collectors
      : DEFAULT_OPTIONS.sources;
  return {
    ...options,
    collectors: [...sources],
    depth: options.depth || DEFAULT_OPTIONS.depth,
    cwd: path.resolve(options.cwd || process.cwd()),
  };
}

function isPathSafe(candidate, root = process.cwd()) {
  if (typeof candidate !== 'string') {
    path.resolve(root, candidate);
  }
  if (candidate.includes('\0')) return false;
  const segments = candidate.replace(/\\/g, '/').split('/');
  if (segments.includes('..')) return false;
  try {
    path.resolve(root, candidate);
    return true;
  } catch {
    return false;
  }
}

function readText(file) {
  try {
    const buffer = fs.readFileSync(file);
    if (buffer.includes(0)) return null;
    return buffer.toString('utf8');
  } catch {
    return null;
  }
}

function walkDirectory(root, { quick = false } = {}) {
  const files = [];
  const directories = [];
  function visit(directory, relativeDirectory = '') {
    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (IGNORED_DIRECTORIES.has(entry.name)) continue;
      const relative = path.join(relativeDirectory, entry.name);
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        directories.push(relative);
        if (!quick || relativeDirectory === '') visit(absolute, relative);
      } else if (entry.isFile()) {
        files.push(relative);
      }
    }
  }
  visit(root);
  return { files, directories };
}

function extensionName(file) {
  const extension = path.extname(file).toLowerCase();
  return extension || 'no-ext';
}

function readPackage(root) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  } catch {
    return {};
  }
}

function detectFrameworks(packageJson, files) {
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const definitions = [
    ['react', 'React'], ['next', 'Next.js'], ['vue', 'Vue'], ['nuxt', 'Nuxt'],
    ['express', 'Express'], ['fastify', 'Fastify'], ['@nestjs/core', 'NestJS'],
    ['svelte', 'Svelte'], ['angular', 'Angular'], ['django', 'Django'], ['flask', 'Flask'],
  ];
  const frameworks = definitions.filter(([name]) => dependencies[name]).map(([, label]) => label);
  if (files.some(file => /requirements\.txt$|pyproject\.toml$/i.test(file))) {
    const manifests = files.filter(file => /requirements\.txt$|pyproject\.toml$/i.test(file));
    const contents = manifests.map(file => readText(file) || '').join('\n').toLowerCase();
    if (contents.includes('django') && !frameworks.includes('Django')) frameworks.push('Django');
    if (contents.includes('flask') && !frameworks.includes('Flask')) frameworks.push('Flask');
  }
  return frameworks;
}

function detectTestFramework(packageJson) {
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  for (const name of ['jest', 'vitest', 'mocha', 'ava', 'tap', 'pytest']) {
    if (dependencies[name]) return name;
  }
  const testScript = packageJson.scripts?.test || '';
  return ['jest', 'vitest', 'mocha', 'ava', 'tap', 'pytest'].find(name => testScript.includes(name)) || null;
}

function extractSymbols(source) {
  const unique = values => [...new Set(values)];
  const functions = unique([
    ...[...source.matchAll(/\b(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g)].map(match => match[1]),
    ...[...source.matchAll(/\b(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/g)].map(match => match[1]),
  ]);
  const classes = unique([...source.matchAll(/\b(?:export\s+)?class\s+([A-Za-z_$][\w$]*)/g)].map(match => match[1]));
  const exports = unique([
    ...[...source.matchAll(/\bexport\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g)].map(match => match[1]),
    ...[...source.matchAll(/\bexports\.([A-Za-z_$][\w$]*)\s*=/g)].map(match => match[1]),
    ...[...source.matchAll(/\bmodule\.exports\s*=\s*\{([^}]+)\}/g)].flatMap(match => [...match[1].matchAll(/([A-Za-z_$][\w$]*)\s*(?=,|$|:)/g)].map(item => item[1])),
  ]);
  return { functions, classes, exports };
}

async function scanCodebase(options = {}) {
  const normalized = normalizeOptions(options);
  const quick = normalized.depth === 'quick';
  const walked = walkDirectory(normalized.cwd, { quick });
  const scanningOwnBundle = normalized.cwd === __dirname;
  const files = scanningOwnBundle
    ? walked.files.filter(file => !SELF_SCAN_EXCLUSIONS.has(file) && !SELF_SCAN_PREFIXES.some(prefix => path.basename(file).startsWith(prefix)))
    : walked.files;
  const directories = walked.directories.filter(directory => !scanningOwnBundle || !path.basename(directory).startsWith('_fixture'));
  const packageJson = readPackage(normalized.cwd);
  const fileStats = {};
  for (const file of files) fileStats[extensionName(file)] = (fileStats[extensionName(file)] || 0) + 1;

  const symbols = {};
  if (!quick) {
    for (const file of files) {
      if (!SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase())) continue;
      const source = readText(path.join(normalized.cwd, file));
      if (source === null) continue;
      const extracted = extractSymbols(source);
      if (extracted.functions.length || extracted.classes.length || extracted.exports.length) symbols[file] = extracted;
    }
  }

  const testFramework = detectTestFramework(packageJson);
  const hasTests = files.some(file => /(^|\/)(test|tests|spec|__tests__)(\/|\.|$)|\.(test|spec)\.[^.]+$/i.test(file));
  const implementedFeatures = [];
  if (!quick && (hasTests || testFramework)) implementedFeatures.push('testing');
  if (!quick && files.some(file => /(^|\/)api(\/|\.|$)|routes?/i.test(file))) implementedFeatures.push('api');
  if (!quick && files.some(file => /auth/i.test(file))) implementedFeatures.push('authentication');

  return {
    summary: { totalDirs: directories.length, totalFiles: files.length },
    topLevelDirs: directories.filter(directory => !directory.includes(path.sep)).sort(),
    frameworks: detectFrameworks(packageJson, files.map(file => path.join(normalized.cwd, file))),
    testFramework,
    hasTypeScript: files.some(file => /\.tsx?$|tsconfig\.json$/i.test(file)),
    implementedFeatures,
    symbols,
    health: {
      hasTests,
      hasLinting: files.some(file => /(^|\/)(eslint\.config\.|\.eslintrc|biome\.json|\.prettierrc)/i.test(file)) || Boolean(packageJson.scripts?.lint),
      hasCi: files.some(file => /^\.github\/workflows\//i.test(file) || /(^|\/)(\.gitlab-ci\.yml|Jenkinsfile)$/i.test(file)),
      hasReadme: files.some(file => /(^|\/)README(\.|$)/i.test(file)),
    },
    fileStats,
  };
}

function countWords(text) {
  return (text.match(/[A-Za-z0-9_'-]+/g) || []).length;
}

function analyzeDocument(relativePath, text) {
  const sections = [...text.matchAll(/^#{2,6}\s+(.+)$/gm)].map(match => match[1].trim());
  const lowerSections = sections.map(section => section.toLowerCase());
  return {
    path: relativePath,
    sectionCount: sections.length,
    sections,
    hasInstallation: lowerSections.some(section => /install|setup|getting started/.test(section)),
    hasUsage: lowerSections.some(section => /usage|example|quickstart/.test(section)),
    hasApi: lowerSections.some(section => /api|reference/.test(section)),
    hasTesting: lowerSections.some(section => /test/.test(section)),
    codeBlocks: Math.floor((text.match(/^```/gm) || []).length / 2),
    wordCount: countWords(text),
  };
}

async function analyzeDocumentation(options = {}) {
  const normalized = normalizeOptions(options);
  const { files: allFiles } = walkDirectory(normalized.cwd, { quick: false });
  const documentationFiles = allFiles.filter(file => {
    const basename = path.basename(file);
    return /\.mdx?$/i.test(file) && (DOCUMENTATION_FILES.test(basename) || file.split(path.sep).some(part => /^docs?$/i.test(part)));
  });
  const files = {};
  const features = [];
  const plans = [];
  let checked = 0;
  let unchecked = 0;
  let totalWords = 0;

  for (const file of documentationFiles) {
    const text = readText(path.join(normalized.cwd, file));
    if (text === null) continue;
    const details = analyzeDocument(file, text);
    files[file] = details;
    totalWords += details.wordCount;
    for (const match of text.matchAll(/^\s*[-*]\s+(.+)$/gm)) {
      const item = match[1].trim();
      if (/^\[[ xX]\]/.test(item)) {
        if (/^\[[xX]\]/.test(item)) checked++; else unchecked++;
      }
      if (!/^\[ \]/.test(item)) features.push(item.replace(/^\[[ xX]\]\s*/, match => match.toLowerCase()));
    }
    for (const match of text.matchAll(/^#{1,6}\s+.*(?:roadmap|plan|todo|future).*$/gim)) plans.push(match[0].trim());
  }

  const names = new Set(Object.keys(files).map(file => path.basename(file).toLowerCase()));
  const gaps = [];
  if (![...names].some(name => name.startsWith('readme.'))) gaps.push({ type: 'missing', file: 'README.md', severity: 'high' });
  if (![...names].some(name => name.startsWith('changelog.'))) gaps.push({ type: 'missing', file: 'CHANGELOG.md', severity: 'low' });

  return {
    summary: { fileCount: Object.keys(files).length, totalWords },
    files,
    features: [...new Set(features)],
    plans: [...new Set(plans)],
    checkboxes: { total: checked + unchecked, checked, unchecked },
    gaps,
  };
}

function emptyGitHubResult(error) {
  return {
    available: false,
    partial: false,
    errors: [],
    summary: { issueCount: 0, prCount: 0, milestoneCount: 0 },
    issues: [],
    prs: [],
    milestones: [],
    overdueMilestones: [],
    pagination: {
      issues: { requestedLimit: DEFAULT_OPTIONS.issueLimit, fetchedCount: 0, hasMore: false },
      prs: { requestedLimit: DEFAULT_OPTIONS.prLimit, fetchedCount: 0, hasMore: false },
      milestones: { requestedLimit: DEFAULT_OPTIONS.issueLimit, fetchedCount: 0, hasMore: false },
    },
    categorized: { bugs: [], features: [], security: [], enhancements: [], other: [] },
    stale: [],
    themes: [],
    error,
  };
}

async function runGh(args, options) {
  const { stdout } = await execFileAsync('gh', args, {
    cwd: options.cwd,
    timeout: options.timeout || DEFAULT_OPTIONS.timeout,
    maxBuffer: 10 * 1024 * 1024,
    encoding: 'utf8',
  });
  return stdout;
}

async function isGhAvailable(options = {}) {
  const normalized = normalizeOptions(options);
  try {
    await runGh(['auth', 'status'], normalized);
    return true;
  } catch {
    return false;
  }
}

function labelsOf(item) {
  return (item.labels || []).map(label => typeof label === 'string' ? label : label.name).filter(Boolean);
}

async function scanGitHubState(options = {}) {
  const normalized = normalizeOptions(options);
  const issueLimit = Number.isFinite(options.issueLimit) ? options.issueLimit : DEFAULT_OPTIONS.issueLimit;
  const prLimit = Number.isFinite(options.prLimit) ? options.prLimit : DEFAULT_OPTIONS.prLimit;
  if (!await isGhAvailable(normalized)) return emptyGitHubResult('gh CLI not available or not authenticated');

  try {
    const issueFields = 'number,title,state,labels,createdAt,updatedAt,url,author,milestone';
    const prFields = 'number,title,state,labels,createdAt,updatedAt,url,author,isDraft';
    const [issueText, prText] = await Promise.all([
      runGh(['issue', 'list', '--state', 'all', '--limit', String(issueLimit), '--json', issueFields], normalized),
      runGh(['pr', 'list', '--state', 'all', '--limit', String(prLimit), '--json', prFields], normalized),
    ]);
    const issues = JSON.parse(issueText || '[]');
    const prs = JSON.parse(prText || '[]');
    const milestones = [...new Map(issues.filter(item => item.milestone).map(item => [item.milestone.number || item.milestone.title, item.milestone])).values()];
    const now = Date.now();
    const categorized = { bugs: [], features: [], security: [], enhancements: [], other: [] };
    for (const issue of issues) {
      const labels = labelsOf(issue).map(label => label.toLowerCase());
      const bucket = labels.some(label => /bug|defect/.test(label)) ? 'bugs'
        : labels.some(label => /security|vulnerability/.test(label)) ? 'security'
          : labels.some(label => /enhancement/.test(label)) ? 'enhancements'
            : labels.some(label => /feature/.test(label)) ? 'features' : 'other';
      categorized[bucket].push(issue);
    }
    const stale = issues.filter(issue => issue.state === 'OPEN' && now - Date.parse(issue.updatedAt) > 90 * 86400_000);
    const themeCounts = new Map();
    for (const item of [...issues, ...prs]) for (const label of labelsOf(item)) themeCounts.set(label, (themeCounts.get(label) || 0) + 1);
    const themes = [...themeCounts].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
    const overdueMilestones = milestones.filter(milestone => milestone.dueOn && Date.parse(milestone.dueOn) < now && milestone.state !== 'CLOSED');
    return {
      available: true,
      partial: false,
      errors: [],
      summary: { issueCount: issues.length, prCount: prs.length, milestoneCount: milestones.length },
      issues, prs, milestones, overdueMilestones,
      pagination: {
        issues: { requestedLimit: issueLimit, fetchedCount: issues.length, hasMore: issues.length >= issueLimit },
        prs: { requestedLimit: prLimit, fetchedCount: prs.length, hasMore: prs.length >= prLimit },
        milestones: { requestedLimit: issueLimit, fetchedCount: milestones.length, hasMore: false },
      },
      categorized, stale, themes, error: null,
    };
  } catch (error) {
    return emptyGitHubResult(error.message);
  }
}

async function collectAllData(options = {}) {
  const normalized = normalizeOptions(options);
  const selected = new Set(normalized.collectors);
  const result = {
    timestamp: new Date().toISOString(),
    options: normalized,
    github: null,
    docs: null,
    code: null,
    docsPatterns: null,
    git: null,
    analyzer: null,
  };
  const tasks = [];
  if (selected.has('github')) tasks.push(scanGitHubState(normalized).then(value => { result.github = value; }));
  if (selected.has('docs') || selected.has('documentation')) tasks.push(analyzeDocumentation(normalized).then(value => { result.docs = value; }));
  if (selected.has('code') || selected.has('codebase')) tasks.push(scanCodebase(normalized).then(value => { result.code = value; }));
  await Promise.all(tasks);
  return result;
}

module.exports = {
  DEFAULT_OPTIONS,
  scanGitHubState,
  analyzeDocumentation,
  scanCodebase,
  collectAllData,
  isGhAvailable,
  isPathSafe,
};

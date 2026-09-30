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
  js: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
  rust: ['.rs'],
  go: ['.go'],
  python: ['.py'],
  java: ['.java'],
};

const SOURCE_EXTENSION_SET = new Set(Object.values(SOURCE_EXTENSIONS).flat());

const DEFAULT_OPTIONS = {
  sources: ['github', 'docs', 'code'],
  depth: 'thorough',
  issueLimit: 100,
  prLimit: 50,
  timeout: 10000,
};

function isPathSafe(candidatePath, rootPath) {
  if (!path.isAbsolute(candidatePath) || !path.isAbsolute(rootPath)) return false;
  const relativePath = path.relative(path.resolve(rootPath), path.resolve(candidatePath));
  return relativePath === '' || (!relativePath.startsWith(`..${path.sep}`) && relativePath !== '..' && !path.isAbsolute(relativePath));
}

function safeReadFile(filePath, rootPath, maximumBytes = 50000) {
  if (!isPathSafe(filePath, rootPath)) return null;
  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile() || stats.size > maximumBytes) return null;
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function shouldExclude(name) {
  return EXCLUDE_DIRS.has(name);
}

function scanDirectory(rootPath) {
  const files = [];
  let totalDirs = 0;

  function visit(directoryPath) {
    totalDirs += 1;
    let entries;
    try {
      entries = fs.readdirSync(directoryPath, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const entryPath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) {
        if (!shouldExclude(entry.name)) visit(entryPath);
      } else if (entry.isFile()) {
        files.push(entryPath);
      }
    }
  }

  visit(rootPath);
  return { files, totalDirs };
}

function extractCheckboxes(content) {
  const matches = [...content.matchAll(/^\s*[-*]\s+\[([ xX])\]\s+(.+)$/gm)];
  const checked = matches.filter(match => match[1].toLowerCase() === 'x').length;
  return { total: matches.length, checked, unchecked: matches.length - checked };
}

function analyzeMarkdownFile(filePath, rootPath) {
  const content = safeReadFile(filePath, rootPath);
  if (content === null) return null;
  const relativePath = path.relative(rootPath, filePath).split(path.sep).join('/');
  const sections = [...content.matchAll(/^#{2,6}\s+(.+?)\s*$/gm)].map(match => match[1]);
  const headings = [...content.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)].map(match => match[1].toLowerCase());
  return {
    path: relativePath,
    sectionCount: sections.length,
    sections,
    hasInstallation: headings.some(heading => /install|setup|getting started/.test(heading)),
    hasUsage: headings.some(heading => /usage|example|quickstart/.test(heading)),
    hasApi: headings.some(heading => /api|reference/.test(heading)),
    hasTesting: headings.some(heading => /test/.test(heading)),
    codeBlocks: Math.floor((content.match(/^```/gm) || []).length / 2),
    wordCount: content.split(/\s+/).length,
  };
}

function extractFeatures(content) {
  return [...content.matchAll(/^\s*[-*]\s+\[ \]\s+(.+)$/gm)].map(match => `[ ] ${match[1].trim()}`);
}

function extractPlans(content) {
  const plans = [];
  for (const match of content.matchAll(/\bTODO\s*:?\s*(.+)$/gim)) plans.push(match[1].trim());
  for (const match of content.matchAll(/^#{2,6}\s+(.+?)\s*$/gm)) {
    if (/roadmap|plan|future/i.test(match[1])) plans.push(match[0].trim());
  }
  return plans;
}

function identifyDocGaps(files) {
  const gaps = [];
  const readme = files['README.md'] || files['readme.md'];
  if (!readme) {
    gaps.push({ type: 'missing', file: 'README.md', severity: 'high' });
  } else {
    if (!readme.hasInstallation) gaps.push({ type: 'missing-section', file: 'README.md', section: 'Installation', severity: 'medium' });
    if (!readme.hasUsage) gaps.push({ type: 'missing-section', file: 'README.md', section: 'Usage', severity: 'medium' });
  }
  if (!files['CHANGELOG.md'] && !files['changelog.md']) gaps.push({ type: 'missing', file: 'CHANGELOG.md', severity: 'low' });
  return gaps;
}

async function analyzeDocumentation(options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const { files: allFiles } = scanDirectory(cwd);
  const markdownFiles = allFiles.filter(filePath => path.extname(filePath).toLowerCase() === '.md');
  const files = {};
  const features = [];
  const plans = [];
  const checkboxes = { total: 0, checked: 0, unchecked: 0 };

  for (const filePath of markdownFiles) {
    const analysis = analyzeMarkdownFile(filePath, cwd);
    const content = safeReadFile(filePath, cwd);
    if (!analysis || content === null) continue;
    files[analysis.path] = analysis;
    features.push(...extractFeatures(content));
    plans.push(...extractPlans(content));
    const fileCheckboxes = extractCheckboxes(content);
    checkboxes.total += fileCheckboxes.total;
    checkboxes.checked += fileCheckboxes.checked;
    checkboxes.unchecked += fileCheckboxes.unchecked;
  }

  return {
    summary: {
      fileCount: Object.keys(files).length,
      totalWords: Object.values(files).reduce((total, file) => total + file.wordCount, 0),
    },
    files,
    features,
    plans,
    checkboxes,
    gaps: identifyDocGaps(files),
  };
}

function readPackageJson(cwd) {
  try {
    return JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
  } catch {
    return {};
  }
}

function detectFrameworks(cwd) {
  const packageJson = readPackageJson(cwd);
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const frameworks = [];
  const candidates = [
    ['react', 'React'], ['next', 'Next.js'], ['vue', 'Vue'], ['nuxt', 'Nuxt'],
    ['@angular/core', 'Angular'], ['svelte', 'Svelte'], ['express', 'Express'],
    ['fastify', 'Fastify'], ['nestjs', 'NestJS'],
  ];
  for (const [dependency, name] of candidates) if (dependencies[dependency]) frameworks.push(name);
  if (fs.existsSync(path.join(cwd, 'Cargo.toml'))) frameworks.push('Rust');
  if (fs.existsSync(path.join(cwd, 'go.mod'))) frameworks.push('Go');
  if (fs.existsSync(path.join(cwd, 'requirements.txt')) || fs.existsSync(path.join(cwd, 'pyproject.toml'))) frameworks.push('Python');
  return frameworks;
}

function detectTestFramework(cwd, files) {
  const packageJson = readPackageJson(cwd);
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  for (const name of ['vitest', 'jest', 'mocha', 'ava', 'tap']) if (dependencies[name]) return name;
  if (files.some(file => /(^|\/)(test|tests|__tests__)(\/|$)/i.test(path.relative(cwd, file).split(path.sep).join('/')))) return 'unknown';
  return null;
}

function extractSymbols(content) {
  const functions = new Set();
  const classes = new Set();
  const exports = new Set();
  for (const match of content.matchAll(/\b(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g)) functions.add(match[1]);
  for (const match of content.matchAll(/\bclass\s+([A-Za-z_$][\w$]*)/g)) classes.add(match[1]);
  for (const match of content.matchAll(/\bexport\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g)) exports.add(match[1]);
  for (const match of content.matchAll(/\bexports\.([A-Za-z_$][\w$]*)\s*=/g)) exports.add(match[1]);
  for (const match of content.matchAll(/\bmodule\.exports\s*=\s*\{([^}]+)\}/gs)) {
    for (const item of match[1].split(',')) {
      const name = item.trim().split(/\s*:\s*/)[0];
      if (/^[A-Za-z_$][\w$]*$/.test(name)) exports.add(name);
    }
  }
  return { functions: [...functions], classes: [...classes], exports: [...exports] };
}

function detectHealth(cwd, files) {
  const names = new Set(files.map(file => path.relative(cwd, file).split(path.sep).join('/').toLowerCase()));
  return {
    hasTests: [...names].some(name => /(^|\/)(test|tests|__tests__)(\/|$)|\.(test|spec)\.[^.]+$/.test(name)),
    hasLinting: [...names].some(name => /(^|\/)(eslint\.config\.|\.eslintrc|biome\.json|ruff\.toml)/.test(name)),
    hasCi: [...names].some(name => name.startsWith('.github/workflows/') || name === '.gitlab-ci.yml'),
    hasReadme: [...names].some(name => /(^|\/)readme\.md$/.test(name)),
  };
}

async function scanCodebase(options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const { files, totalDirs } = scanDirectory(cwd);
  const fileStats = {};
  const symbols = {};
  for (const filePath of files) {
    const extension = path.extname(filePath).toLowerCase();
    fileStats[extension] = (fileStats[extension] || 0) + 1;
    if (!SOURCE_EXTENSION_SET.has(extension)) continue;
    const content = safeReadFile(filePath, cwd);
    if (content === null) continue;
    const extracted = extractSymbols(content);
    if (extracted.functions.length || extracted.classes.length || extracted.exports.length) {
      symbols[path.relative(cwd, filePath).split(path.sep).join('/')] = extracted;
    }
  }
  let topLevelDirs = [];
  try {
    topLevelDirs = fs.readdirSync(cwd, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && !shouldExclude(entry.name))
      .map(entry => entry.name)
      .sort();
  } catch {}
  const implementedFeatures = topLevelDirs.filter(name => !['src', 'lib', 'test', 'tests', '__tests__'].includes(name));
  return {
    summary: { totalDirs, totalFiles: files.length },
    topLevelDirs,
    frameworks: detectFrameworks(cwd),
    testFramework: detectTestFramework(cwd, files),
    hasTypeScript: files.some(file => ['.ts', '.tsx'].includes(path.extname(file).toLowerCase())),
    implementedFeatures,
    symbols,
    health: detectHealth(cwd, files),
    fileStats,
  };
}

function isGhAvailable(options = {}) {
  try {
    execFileSync('gh', ['auth', 'status'], {
      cwd: path.resolve(options.cwd || process.cwd()),
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: options.timeout || 5000,
    });
    return true;
  } catch {
    return false;
  }
}

function emptyGitHubResult(options, error) {
  const issueLimit = options.issueLimit ?? 100;
  const prLimit = options.prLimit ?? 50;
  const milestoneLimit = options.milestoneLimit ?? 100;
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
      issues: { requestedLimit: issueLimit, fetchedCount: 0, hasMore: false },
      prs: { requestedLimit: prLimit, fetchedCount: 0, hasMore: false },
      milestones: { requestedLimit: milestoneLimit, fetchedCount: 0, hasMore: false },
    },
    categorized: { bugs: [], features: [], security: [], enhancements: [], other: [] },
    stale: [],
    themes: [],
    error,
  };
}

function runGhJson(args, options) {
  const output = execFileSync('gh', args, {
    cwd: path.resolve(options.cwd || process.cwd()),
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: options.timeout || 10000,
  });
  return JSON.parse(output);
}

function labelNames(item) {
  return (item.labels || []).map(label => typeof label === 'string' ? label : label.name).filter(Boolean);
}

function categorizeIssues(issues) {
  const categorized = { bugs: [], features: [], security: [], enhancements: [], other: [] };
  for (const issue of issues) {
    const text = `${issue.title || ''} ${labelNames(issue).join(' ')}`.toLowerCase();
    if (/security|vulnerab|cve/.test(text)) categorized.security.push(issue);
    else if (/bug|defect|regression|fix/.test(text)) categorized.bugs.push(issue);
    else if (/feature|request/.test(text)) categorized.features.push(issue);
    else if (/enhancement|improvement/.test(text)) categorized.enhancements.push(issue);
    else categorized.other.push(issue);
  }
  return categorized;
}

function extractThemes(items) {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'for', 'in', 'on', 'at', 'with', 'and', 'or', 'of']);
  const counts = {};
  for (const item of items) {
    for (const word of String(item.title || '').toLowerCase().split(/\s+/)) {
      const normalized = word.replace(/[^a-z0-9_-]/g, '');
      if (normalized.length < 3 || stopWords.has(normalized)) continue;
      counts[normalized] = (counts[normalized] || 0) + 1;
    }
  }
  return Object.entries(counts).filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([word, count]) => ({ word, count }));
}

async function scanGitHubState(options = {}) {
  const normalizedOptions = { ...DEFAULT_OPTIONS, ...options };
  if (!isGhAvailable(normalizedOptions)) return emptyGitHubResult(normalizedOptions, 'gh CLI not available or not authenticated');
  try {
    const issueFields = 'number,title,state,labels,assignees,createdAt,updatedAt,url,milestone';
    const prFields = 'number,title,state,labels,assignees,createdAt,updatedAt,url,isDraft,author';
    const issues = runGhJson(['issue', 'list', '--state', 'all', '--limit', String(normalizedOptions.issueLimit), '--json', issueFields], normalizedOptions);
    const prs = runGhJson(['pr', 'list', '--state', 'all', '--limit', String(normalizedOptions.prLimit), '--json', prFields], normalizedOptions);
    const now = Date.now();
    const stale = [...issues, ...prs].filter(item => item.updatedAt && now - Date.parse(item.updatedAt) > 30 * 24 * 60 * 60 * 1000);
    return {
      ...emptyGitHubResult(normalizedOptions),
      available: true,
      summary: { issueCount: issues.length, prCount: prs.length, milestoneCount: 0 },
      issues,
      prs,
      pagination: {
        issues: { requestedLimit: normalizedOptions.issueLimit, fetchedCount: issues.length, hasMore: issues.length >= normalizedOptions.issueLimit },
        prs: { requestedLimit: normalizedOptions.prLimit, fetchedCount: prs.length, hasMore: prs.length >= normalizedOptions.prLimit },
        milestones: { requestedLimit: normalizedOptions.milestoneLimit || 100, fetchedCount: 0, hasMore: false },
      },
      categorized: categorizeIssues(issues),
      stale,
      themes: extractThemes([...issues, ...prs]),
      error: undefined,
    };
  } catch (error) {
    return emptyGitHubResult(normalizedOptions, error.message);
  }
}

async function collectAllData(options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const collectors = options.sources || options.collectors || DEFAULT_OPTIONS.sources;
  const normalizedOptions = { collectors, depth: options.depth || DEFAULT_OPTIONS.depth, cwd, ...options };
  const result = {
    timestamp: new Date().toISOString(),
    options: normalizedOptions,
    github: null,
    docs: null,
    code: null,
    docsPatterns: null,
    git: null,
    analyzer: null,
  };
  if (collectors.includes('github')) result.github = await scanGitHubState(normalizedOptions);
  if (collectors.includes('docs')) result.docs = await analyzeDocumentation(normalizedOptions);
  if (collectors.includes('code')) result.code = await scanCodebase(normalizedOptions);
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

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const GITHUB_DEFAULTS = Object.freeze({
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10_000,
});

const DEFAULT_OPTIONS = Object.freeze({
  sources: Object.freeze(['github', 'docs', 'code']),
  depth: 'thorough',
  issueLimit: GITHUB_DEFAULTS.issueLimit,
  prLimit: GITHUB_DEFAULTS.prLimit,
  timeout: GITHUB_DEFAULTS.timeout,
});

function isPathSafe(filePath, rootDirectory = process.cwd()) {
  const root = path.resolve(rootDirectory);
  const resolved = path.resolve(root, filePath);
  return resolved === root || resolved.startsWith(root + path.sep);
}

function safeReadFile(filePath, rootDirectory = process.cwd()) {
  if (!isPathSafe(filePath, rootDirectory)) return null;
  try {
    return fs.readFileSync(path.resolve(rootDirectory, filePath), 'utf8');
  } catch {
    return null;
  }
}

function isGhAvailable() {
  try {
    execFileSync('gh', ['auth', 'status'], {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 5_000,
    });
    return true;
  } catch {
    return false;
  }
}

function execGh(args, options = {}) {
  try {
    const output = execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: options.timeout ?? GITHUB_DEFAULTS.timeout,
      cwd: options.cwd,
    });
    try {
      return { ok: true, data: JSON.parse(output) };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'parse',
          message: 'Failed to parse gh output as JSON: ' + error.message,
          raw: output.slice(0, 500),
        },
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        type: error.killed ? 'timeout' : 'process',
        message: error.message,
        status: error.status ?? error.exitCode ?? null,
        stderr: String(error.stderr || '').trim(),
      },
    };
  }
}

function labelNames(item) {
  return (item.labels || []).map((label) => typeof label === 'string' ? label : label.name);
}

function summarizeIssue(issue) {
  const body = issue.body
    ? issue.body.slice(0, 200).replace(/\n/g, ' ').trim() + (issue.body.length > 200 ? '...' : '')
    : '';
  return {
    number: issue.number,
    title: issue.title,
    labels: labelNames(issue),
    milestone: issue.milestone?.title || null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    snippet: body,
  };
}

function summarizePR(pullRequest) {
  const body = pullRequest.body
    ? pullRequest.body.slice(0, 150).replace(/\n/g, ' ').trim() + (pullRequest.body.length > 150 ? '...' : '')
    : '';
  return {
    number: pullRequest.number,
    title: pullRequest.title,
    labels: labelNames(pullRequest),
    isDraft: pullRequest.isDraft,
    createdAt: pullRequest.createdAt,
    updatedAt: pullRequest.updatedAt,
    files: pullRequest.files || [],
    snippet: body,
  };
}

const ISSUE_CATEGORIES = {
  bugs: ['bug', 'type: bug'],
  features: ['feature', 'type: feature'],
  enhancements: ['enhancement'],
  security: ['security', 'type: security'],
};

function categorizeIssues(issues) {
  const result = Object.fromEntries(Object.keys(ISSUE_CATEGORIES).map((category) => [category, []]));
  result.other = [];
  for (const issue of issues) {
    const labels = labelNames(issue).map((label) => label.toLowerCase());
    let categorized = false;
    for (const [category, patterns] of Object.entries(ISSUE_CATEGORIES)) {
      if (patterns.some((pattern) => labels.includes(pattern))) {
        result[category].push({ number: issue.number, title: issue.title });
        categorized = true;
        break;
      }
    }
    if (!categorized) result.other.push({ number: issue.number, title: issue.title });
  }
  return result;
}

function findStaleItems(items, days = 30) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  return items
    .filter((item) => item.updatedAt && new Date(item.updatedAt) < threshold)
    .map((item) => ({
      number: item.number,
      title: item.title,
      lastUpdated: item.updatedAt,
      daysStale: Math.floor((Date.now() - new Date(item.updatedAt)) / 86_400_000),
    }));
}

function extractThemes(items) {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'for', 'in', 'on', 'at', 'with', 'and', 'or', 'of']);
  const counts = new Map();
  for (const item of items) {
    for (const word of (item.title || '').toLowerCase().split(/\s+/)) {
      if (word.length > 3 && !stopWords.has(word)) counts.set(word, (counts.get(word) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

function findOverdueMilestones(milestones) {
  const now = new Date();
  return milestones.filter((milestone) =>
    milestone.due_on && milestone.state !== 'closed' && new Date(milestone.due_on) < now);
}

function scanGitHubState(options = {}) {
  const settings = { ...GITHUB_DEFAULTS, cwd: process.cwd(), ...options };
  const result = {
    available: false,
    partial: false,
    errors: [],
    summary: { issueCount: 0, prCount: 0, milestoneCount: 0 },
    issues: [],
    prs: [],
    milestones: [],
    overdueMilestones: [],
    pagination: {
      issues: { requestedLimit: settings.issueLimit, fetchedCount: 0, hasMore: false },
      prs: { requestedLimit: settings.prLimit, fetchedCount: 0, hasMore: false },
      milestones: { requestedLimit: settings.milestoneLimit, fetchedCount: 0, hasMore: false },
    },
    categorized: { bugs: [], features: [], enhancements: [], security: [], other: [] },
    stale: [],
    themes: [],
  };
  if (!isGhAvailable()) {
    result.errors.push('gh CLI not available or not authenticated');
    return result;
  }
  result.available = true;
  const requests = {
    issues: ['issue', 'list', '--state', 'open', '--json', 'number,title,labels,milestone,createdAt,updatedAt,body', '--limit', String(settings.issueLimit)],
    prs: ['pr', 'list', '--state', 'open', '--json', 'number,title,labels,isDraft,createdAt,updatedAt,body', '--limit', String(settings.prLimit)],
    milestones: ['api', 'repos/{owner}/{repo}/milestones', '--paginate', '-f', 'state=open', '-f', 'per_page=' + Math.min(settings.milestoneLimit, 100)],
  };
  for (const [kind, args] of Object.entries(requests)) {
    const response = execGh(args, settings);
    if (!response.ok) {
      result.partial = true;
      result.errors.push(response.error);
      continue;
    }
    const rows = Array.isArray(response.data) ? response.data : [];
    result.pagination[kind].fetchedCount = rows.length;
    result.pagination[kind].hasMore = rows.length >= result.pagination[kind].requestedLimit;
    result[kind] = kind === 'issues' ? rows.map(summarizeIssue)
      : kind === 'prs' ? rows.map(summarizePR)
      : rows.map(({ title, state, due_on, open_issues, closed_issues }) => ({ title, state, due_on, open_issues, closed_issues }));
  }
  result.summary = {
    issueCount: result.issues.length,
    prCount: result.prs.length,
    milestoneCount: result.milestones.length,
  };
  result.categorized = categorizeIssues(result.issues);
  result.stale = findStaleItems([...result.issues, ...result.prs]);
  result.themes = extractThemes([...result.issues, ...result.prs]);
  result.overdueMilestones = findOverdueMilestones(result.milestones);
  return result;
}

function analyzeMarkdownFile(content) {
  const sections = [...content.matchAll(/^##\s{1,1000}(.+)$/gm)].slice(0, 10).map((match) => match[1].replace(/^##\s+/, '').toLowerCase()).join(' ');
  return {
    path: null,
    wordCount: content.split(/\s+/).filter(Boolean).length,
    sectionCount: sections ? sections.split(' ').length : 0,
    sections,
    hasInstallation: /install|setup|getting.started/i.test(content),
    hasUsage: /usage|how.to|example/i.test(content),
    hasApi: /api|reference|methods/i.test(content),
    hasTesting: /test|spec|coverage/i.test(content),
    codeBlocks: Math.floor((content.match(/\x60\x60\x60/g) || []).length / 2),
  };
}

function extractCheckboxes(content) {
  const checked = (content.match(/^[-*]\s+\[x\]/gim) || []).length;
  const unchecked = (content.match(/^[-*]\s+\[\s\]/gim) || []).length;
  return { total: checked + unchecked, checked, unchecked };
}

function extractFeatures(content) {
  const features = [];
  const pattern = /^[-*]\s{1,100}\*{0,2}([^\n]{1,2000}?)\*{0,2}(?:\s{0,100}[-–]\s{0,100}([^\n]{1,2000}))?$/gm;
  for (let match; (match = pattern.exec(content)) && features.length < 20;) {
    const value = match[1].trim().slice(0, 80);
    if (value.length >= 5) features.push(value);
  }
  return [...new Set(features)].slice(0, 20);
}

function extractPlans(content) {
  const plans = [];
  for (const match of content.matchAll(/(?:TODO|FIXME|PLAN):\s*(.+)/gi)) plans.push(match[1].slice(0, 100));
  if (/^##\s+(?:Roadmap|Future|Planned|Coming Soon)/gim.test(content)) plans.push('Roadmap section present');
  return plans.slice(0, 15);
}

function identifyDocGaps(files) {
  const gaps = [];
  const readme = files['README.md'];
  if (!readme) gaps.push({ type: 'missing', file: 'README.md', severity: 'high' });
  else {
    if (!readme.hasInstallation) gaps.push({ type: 'missing-section', file: 'README.md', section: 'Installation', severity: 'medium' });
    if (!readme.hasUsage) gaps.push({ type: 'missing-section', file: 'README.md', section: 'Usage', severity: 'medium' });
  }
  if (!files['CHANGELOG.md']) gaps.push({ type: 'missing', file: 'CHANGELOG.md', severity: 'low' });
  return gaps;
}

function analyzeDocumentation(options = {}) {
  if (typeof options === 'string') options = { cwd: options };
  const settings = { depth: 'thorough', cwd: process.cwd(), ...options };
  const result = {
    summary: { fileCount: 0, totalWords: 0 }, files: {}, features: [], plans: [],
    checkboxes: { total: 0, checked: 0, unchecked: 0 }, gaps: [],
  };
  const candidates = ['README.md', 'PLAN.md', 'CLAUDE.md', 'AGENTS.md', 'CONTRIBUTING.md', 'CHANGELOG.md', 'docs/README.md', 'docs/PLAN.md'];
  if (settings.depth === 'thorough') {
    const docsDirectory = path.join(settings.cwd, 'docs');
    try {
      candidates.push(...fs.readdirSync(docsDirectory).filter((name) => name.endsWith('.md')).slice(0, 5).map((name) => 'docs/' + name));
    } catch {}
  }
  for (const relativePath of [...new Set(candidates)]) {
    const content = safeReadFile(relativePath, settings.cwd);
    if (content == null) continue;
    const analysis = analyzeMarkdownFile(content);
    analysis.path = relativePath;
    result.files[relativePath] = analysis;
    result.summary.fileCount++;
    result.summary.totalWords += analysis.wordCount;
    result.features.push(...extractFeatures(content));
    result.plans.push(...extractPlans(content));
    const boxes = extractCheckboxes(content);
    result.checkboxes.total += boxes.total;
    result.checkboxes.checked += boxes.checked;
    result.checkboxes.unchecked += boxes.unchecked;
  }
  result.features = [...new Set(result.features)].slice(0, 20);
  result.plans = [...new Set(result.plans)].slice(0, 15);
  result.gaps = identifyDocGaps(result.files);
  return result;
}

const EXCLUDE_DIRS = new Set(['node_modules', 'vendor', 'dist', 'build', 'out', 'target', '.git', '.svn', '.hg', '__pycache__', '.pytest_cache', 'coverage', '.nyc_output', '.next', '.nuxt', '.cache']);
const SOURCE_EXTENSIONS = Object.freeze({ '.js': 'js', '.jsx': 'js', '.ts': 'js', '.tsx': 'js', '.mjs': 'js', '.cjs': 'js', '.rs': 'rust', '.go': 'go', '.py': 'python', '.java': 'java' });

function shouldExclude(filePath) {
  return filePath.split(/[\\/]/).filter(Boolean).some((part) => EXCLUDE_DIRS.has(part));
}

function detectFrameworks(fileName, content) {
  void fileName;
  let manifest;
  try { manifest = JSON.parse(content); } catch { return []; }
  const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
  const known = { react: 'React', next: 'Next.js', vue: 'Vue.js', nuxt: 'Nuxt', angular: 'Angular', express: 'Express', fastify: 'Fastify', koa: 'Koa', nestjs: 'NestJS' };
  return [...new Set(Object.entries(known).filter(([dependency]) => dependency in dependencies).map(([, name]) => name))];
}

function detectTestFramework(fileName, content) {
  void fileName;
  let manifest;
  try { manifest = JSON.parse(content); } catch { return null; }
  const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
  return ['jest', 'mocha', 'vitest', 'ava', 'tap', 'jasmine'].find((name) => name in dependencies) || null;
}

function extractSymbols(content) {
  const symbols = { functions: [], classes: [], exports: [] };
  const collect = (pattern, target) => { for (const match of content.matchAll(pattern)) target.push(match[1]); };
  collect(/(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g, symbols.functions);
  collect(/(?:const|let)\s{1,1000}([A-Za-z_$][\w$]*)\s{0,1000}=\s{0,1000}(?:async\s{0,1000})?\([^)]{0,2000}\)\s{0,1000}=>/g, symbols.functions);
  collect(/class\s+([A-Za-z_$][\w$]*)/g, symbols.classes);
  collect(/export\s+(?:(?:async\s+)?function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g, symbols.exports);
  const commonJs = content.match(/module\.exports\s{0,1000}=\s{0,1000}\{([^}]{1,100000})\}/);
  if (commonJs) symbols.exports.push(...commonJs[1].split(',').map((item) => item.trim().split(':')[0]).filter((name) => /^[A-Za-z_$][\w$]*$/.test(name)));
  for (const key of Object.keys(symbols)) symbols[key] = [...new Set(symbols[key])];
  return symbols;
}

function scanCodebase(options = {}) {
  if (typeof options === 'string') options = { cwd: options };
  const settings = { depth: 'thorough', cwd: process.cwd(), ...options };
  const result = {
    summary: { totalDirs: 1, totalFiles: 0 }, topLevelDirs: [], frameworks: [], testFramework: null,
    hasTypeScript: false, implementedFeatures: [], symbols: {},
    health: { hasTests: false, hasLinting: false, hasCi: false, hasReadme: false }, fileStats: {},
  };
  const root = path.resolve(settings.cwd);
  const maxDepth = settings.depth === 'thorough' ? 4 : 2;
  function visit(directory, depth) {
    let entries;
    try { entries = fs.readdirSync(directory, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      const fullPath = path.join(directory, entry.name);
      const relativePath = path.relative(root, fullPath).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        result.summary.totalDirs++;
        if (depth === 0) result.topLevelDirs.push(entry.name);
        if (depth < maxDepth) visit(fullPath, depth + 1);
        continue;
      }
      if (!entry.isFile()) continue;
      result.summary.totalFiles++;
      const extension = path.extname(entry.name).toLowerCase() || 'no-ext';
      result.fileStats[extension] = (result.fileStats[extension] || 0) + 1;
      if (['.ts', '.tsx'].includes(extension)) result.hasTypeScript = true;
      if (/\.(test|spec)\./.test(entry.name)) result.health.hasTests = true;
      if (!(extension in SOURCE_EXTENSIONS)) continue;
      let content;
      try {
        const stat = fs.statSync(fullPath);
        if (!stat.isFile() || stat.size > 50_000) continue;
        content = fs.readFileSync(fullPath, 'utf8');
      } catch { continue; }
      const symbols = extractSymbols(content);
      if (symbols.functions.length || symbols.classes.length || symbols.exports.length) result.symbols[relativePath] = symbols;
    }
  }
  visit(root, 0);
  const packageJson = safeReadFile('package.json', root);
  if (packageJson) {
    result.frameworks = detectFrameworks('package.json', packageJson);
    result.testFramework = detectTestFramework('package.json', packageJson);
    if (result.testFramework) result.health.hasTests = true;
  }
  result.health.hasReadme = fs.existsSync(path.join(root, 'README.md'));
  result.health.hasLinting = ['.eslintrc', '.eslintrc.js', '.eslintrc.json', 'eslint.config.js', 'biome.json'].some((name) => fs.existsSync(path.join(root, name)));
  result.health.hasCi = ['.github/workflows', '.gitlab-ci.yml', '.circleci', 'Jenkinsfile', '.travis.yml'].some((name) => fs.existsSync(path.join(root, name)));
  const lowerPaths = [...result.topLevelDirs, ...Object.keys(result.symbols)].map((name) => name.toLowerCase());
  const featureGroups = {
    authentication: ['auth', 'login', 'session', 'jwt', 'oauth'], api: ['routes', 'controllers', 'handlers', 'endpoints', 'api'],
    database: ['models', 'schemas', 'migrations', 'seeds', 'database'], ui: ['components', 'views', 'pages', 'layouts', 'ui'],
    testing: ['__tests__', 'test', 'spec', '.test.', '.spec.'], documentation: ['docs', 'documentation', 'wiki'],
  };
  result.implementedFeatures = Object.entries(featureGroups).filter(([, terms]) => lowerPaths.some((name) => terms.some((term) => name.includes(term)))).map(([name]) => name);
  return result;
}

async function collectAllData(options = {}) {
  const requestedSources = options.sources || options.collectors || DEFAULT_OPTIONS.sources;
  const settings = { ...DEFAULT_OPTIONS, cwd: process.cwd(), ...options, collectors: requestedSources };
  const output = { timestamp: new Date().toISOString(), options: settings, github: null, docs: null, code: null, docsPatterns: null, git: null, analyzer: null };
  if (requestedSources.includes('github')) output.github = scanGitHubState(settings);
  if (requestedSources.includes('docs')) output.docs = analyzeDocumentation(settings);
  if (requestedSources.includes('code')) output.code = scanCodebase(settings);
  return output;
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

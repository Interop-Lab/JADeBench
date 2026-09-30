'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const childProcess = require('child_process');
const { promisify } = require('util');

const execFile = promisify(childProcess.execFile);
const execFileSync = childProcess.execFileSync;

const GITHUB_DEFAULT_OPTIONS = {
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10000,
  cwd: process.cwd()
};

function runGhJson(args, options = {}) {
  try {
    const output = execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: options.timeout || GITHUB_DEFAULT_OPTIONS.timeout,
      cwd: options.cwd || GITHUB_DEFAULT_OPTIONS.cwd
    });

    try {
      return { ok: true, data: JSON.parse(output) };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: `Failed to parse gh JSON output: ${error.message}`,
          raw: output.slice(0, 1000)
        }
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        type: error.code ? 'command_error' : 'execution_error',
        message: error.message,
        exitCode: error.status ?? null,
        stderr: error.stderr ? String(error.stderr).trim() : ''
      }
    };
  }
}

function runGhJsonOrNull(args, options = {}) {
  const result = runGhJson(args, options);
  return result.ok ? result.data : null;
}

function checkGhAvailable() {
  try {
    execFileSync('gh', ['--version'], {
      encoding: 'utf8',
      stdio: 'ignore',
      timeout: 5000
    });
    return true;
  } catch {
    return false;
  }
}

function normalizeIssue(issue) {
  const body = issue.body || '';
  return {
    number: issue.number,
    title: issue.title,
    labels: (issue.labels || []).map(label => label.name || label),
    milestone: issue.milestone?.title || issue.milestone || null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    snippet: body
      ? body.slice(0, 120).replace(/\n/g, ' ').trim() +
        (body.length > 120 ? '…' : '')
      : ''
  };
}

function normalizePullRequest(pr) {
  const body = pr.body || '';
  return {
    number: pr.number,
    title: pr.title,
    labels: (pr.labels || []).map(label => label.name || label),
    isDraft: pr.isDraft,
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    files: pr.files || [],
    snippet: body
      ? body.slice(0, 120).replace(/\n/g, ' ').trim() +
        (body.length > 120 ? '…' : '')
      : ''
  };
}

function categorizeIssues(result, issues) {
  const categories = {
    bug: 'bugs',
    enhancement: 'enhancements',
    feature: 'enhancements',
    documentation: 'documentation',
    docs: 'documentation',
    question: 'questions',
    help: 'questions'
  };

  const patterns = Object.entries(categories).map(([name, category]) => ({
    regex: new RegExp(`(^|[\\s:_-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s:_-]|$)`, 'i'),
    category
  }));

  if (!result.labelDistribution) {
    result.labelDistribution = {
      bugs: [],
      enhancements: [],
      documentation: [],
      questions: [],
      other: []
    };
  }

  for (const issue of issues) {
    const labels = (issue.labels || []).map(label =>
      String(label.name || label).toLowerCase()
    );
    const item = { number: issue.number, title: issue.title };
    let matched = false;

    for (const { regex, category } of patterns) {
      if (labels.some(label => regex.test(label))) {
        result.labelDistribution[category].push(item);
        matched = true;
        break;
      }
    }

    if (!matched) result.labelDistribution.other.push(item);
  }
}

function detectStaleIssues(result, issues, days = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  if (!result.staleIssues) result.staleIssues = [];

  for (const issue of issues) {
    const updated = new Date(issue.updatedAt);
    if (updated < cutoff) {
      result.staleIssues.push({
        number: issue.number,
        title: issue.title,
        lastUpdated: issue.updatedAt,
        daysStale: Math.floor((Date.now() - updated) / 86400000)
      });
    }
  }
}

function extractIssueThemes(result, issues) {
  const counts = Object.create(null);
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'to', 'for', 'in', 'on', 'at',
    'with', 'and', 'or', 'of', 'from', 'this', 'that', 'not'
  ]);

  for (const issue of issues) {
    const words = String(issue.title || '').toLowerCase().split(/\s+/);
    for (const word of words) {
      const clean = word.replace(/[^a-z0-9_-]/g, '');
      if (clean.length > 2 && !stopWords.has(clean)) {
        counts[clean] = (counts[clean] || 0) + 1;
      }
    }
  }

  result.themes = Object.entries(counts)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

function filterFutureMilestones(result) {
  const now = new Date();
  result.futureMilestones = (result.milestones || []).filter(milestone => {
    if (!milestone.due_on || milestone.state !== 'open') return false;
    return new Date(milestone.due_on) > now;
  });
}

function collectGithub(options = {}) {
  const config = { ...GITHUB_DEFAULT_OPTIONS, ...options };

  const result = {
    available: false,
    authenticated: false,
    errors: [],
    counts: {
      issueCount: 0,
      prCount: 0,
      milestoneCount: 0
    },
    issues: [],
    pullRequests: [],
    milestones: [],
    staleIssues: [],
    labelDistribution: {
      bugs: [],
      enhancements: [],
      documentation: [],
      questions: [],
      other: []
    },
    themes: [],
    futureMilestones: []
  };

  if (!checkGhAvailable()) {
    result.error = 'GitHub CLI is not available';
    return result;
  }

  result.available = true;

  const issuesResult = runGhJson([
    'issue', 'list',
    '--state', 'open',
    '--json', 'number,title,labels,milestone,createdAt,updatedAt,body',
    '--limit', String(config.issueLimit)
  ], config);

  if (issuesResult.ok && Array.isArray(issuesResult.data)) {
    const issues = issuesResult.data;
    result.issues = issues.map(normalizeIssue);
    result.counts.issueCount = issues.length;
    result.authenticated = true;
    categorizeIssues(result, issues);
    detectStaleIssues(result, issues, 90);
    extractIssueThemes(result, issues);
  } else if (!issuesResult.ok) {
    result.errors.push({ source: 'issues', ...issuesResult.error });
  }

  const prsResult = runGhJson([
    'pr', 'list',
    '--state', 'open',
    '--json', 'number,title,labels,isDraft,createdAt,updatedAt,body,files',
    '--limit', String(config.prLimit)
  ], config);

  if (prsResult.ok && Array.isArray(prsResult.data)) {
    const prs = prsResult.data;
    result.pullRequests = prs.map(normalizePullRequest);
    result.counts.prCount = prs.length;
    result.authenticated = true;
  } else if (!prsResult.ok) {
    result.errors.push({ source: 'pullRequests', ...prsResult.error });
  }

  const milestonesResult = runGhJson([
    'api',
    'repos/{owner}/{repo}/milestones',
    '--paginate'
  ], config);

  if (milestonesResult.ok && Array.isArray(milestonesResult.data)) {
    const flattened = milestonesResult.data.flatMap(value =>
      Array.isArray(value) ? value : []
    );
    const source = flattened.length ? flattened : milestonesResult.data;

    result.milestones = source.slice(0, config.milestoneLimit).map(item => ({
      title: item.title,
      state: item.state,
      due_on: item.due_on,
      open_issues: item.open_issues,
      closed_issues: item.closed_issues
    }));
    result.counts.milestoneCount = source.length;
    filterFutureMilestones(result);
  } else if (!milestonesResult.ok) {
    result.errors.push({ source: 'milestones', ...milestonesResult.error });
  }

  result.partial = result.errors.length > 0;
  if (result.available && !result.authenticated) {
    result.error = 'Unable to collect GitHub data';
  }

  return result;
}

const DOCUMENTATION_DEFAULT_OPTIONS = {
  depth: 3,
  cwd: process.cwd()
};

const DOCUMENTATION_FILES = [
  'README.md',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'ROADMAP.md',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md',
  'ARCHITECTURE.md',
  'docs/README.md'
];

function isSafePath(relativePath, cwd) {
  const resolved = path.resolve(cwd, relativePath);
  return resolved.startsWith(path.resolve(cwd));
}

function readFileSafe(relativePath, cwd) {
  const resolved = path.resolve(cwd, relativePath);
  if (!isSafePath(relativePath, cwd)) return null;

  try {
    return fs.readFileSync(resolved, 'utf8');
  } catch {
    return null;
  }
}

function analyzeReadme(contents, filePath) {
  const headings = contents.match(/^##\s{1,1000}(.+)$/gm) || [];
  const sections = headings.slice(0, 20).map(line => line.replace(/^##\s+/, ''));
  const normalized = sections.map(section => section.toLowerCase()).join(' ');

  return {
    path: filePath,
    sectionCount: headings.length,
    sections,
    hasInstallation: /install|setup|getting.started/i.test(normalized),
    hasUsage: /usage|how.to|example/i.test(normalized),
    hasApi: /api|reference|methods/i.test(normalized),
    hasTesting: /test|spec|coverage/i.test(normalized),
    codeBlocks: Math.floor(((contents.match(/```/g) || []).length) / 2),
    wordCount: contents.split(/\s+/).filter(Boolean).length
  };
}

function extractTasks(result, contents) {
  const completed = (contents.match(/^[-*]\s+\[x\]/gim) || []).length;
  const pending = (contents.match(/^[-*]\s+\[\s\]/gim) || []).length;

  result.tasks.completed += completed;
  result.tasks.pending += pending;
  result.tasks.total += completed + pending;
}

function extractGlossary(result, contents) {
  const pattern = /^[-*]\s{1,100}\*{0,2}([^\n]{1,2000}?)\*{0,2}(?:\s{0,100}[-–]\s{0,100}([^\n]{1,2000}))?$/gm;
  let match;

  while ((match = pattern.exec(contents)) !== null && result.glossary.length < 50) {
    const term = match[1].trim();
    if (term.length > 1 && term.length < 80) result.glossary.push(term);
  }

  result.glossary = [...new Set(result.glossary)].slice(0, 50);
}

function extractRoadmap(result, contents) {
  const patterns = [
    /(?:TODO|FIXME|PLAN):\s*(.+)/gi,
    /^##\s+(?:Roadmap|Future|Planned|Coming Soon)/gim
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(contents)) !== null && result.roadmap.length < 50) {
      result.roadmap.push((match[1] || match[0]).trim().slice(0, 500));
    }
  }
}

function validateDocumentation(result) {
  const readme = result.files['README.md'];

  if (!readme) {
    result.issues.push({
      type: 'missing_readme',
      severity: 'warning',
      message: 'README.md was not found'
    });
  } else {
    if (!readme.hasInstallation) {
      result.issues.push({
        type: 'missing_installation',
        severity: 'info',
        message: 'README has no installation or setup section'
      });
    }
    if (!readme.hasUsage) {
      result.issues.push({
        type: 'missing_usage',
        severity: 'info',
        message: 'README has no usage or examples section'
      });
    }
  }

  if (!result.glossary.length) {
    result.issues.push({
      type: 'missing_glossary',
      severity: 'info',
      message: 'No glossary terms were detected'
    });
  }
}

function collectDocumentation(options = {}) {
  const config = { ...DOCUMENTATION_DEFAULT_OPTIONS, ...options };
  const cwd = config.cwd;

  const result = {
    counts: {
      fileCount: 0,
      wordCount: 0
    },
    files: {},
    glossary: [],
    roadmap: [],
    tasks: {
      completed: 0,
      pending: 0,
      total: 0
    },
    issues: []
  };

  for (const file of DOCUMENTATION_FILES) {
    const contents = readFileSafe(file, cwd);
    if (contents == null) continue;

    const analysis = analyzeReadme(contents, file);
    result.files[file] = analysis;
    result.counts.wordCount += analysis.wordCount;
    extractTasks(result, contents);
    extractGlossary(result, contents);
    extractRoadmap(result, contents);
  }

  if (config.depth > 1) {
    const docsDir = path.join(cwd, 'docs');
    if (fs.existsSync(docsDir)) {
      try {
        const files = fs.readdirSync(docsDir)
          .filter(name => name.endsWith('.md') && !DOCUMENTATION_FILES.includes(`docs/${name}`))
          .slice(0, 50);

        for (const name of files) {
          const relative = `docs/${name}`;
          const contents = readFileSafe(relative, cwd);
          if (contents == null) continue;
          const analysis = analyzeReadme(contents, relative);
          result.files[relative] = analysis;
          result.counts.wordCount += analysis.wordCount;
        }
      } catch {
        // Ignore unreadable documentation directories.
      }
    }
  }

  result.counts.fileCount = Object.keys(result.files).length;
  validateDocumentation(result);
  return result;
}

const IGNORED_DIRECTORIES = [
  'node_modules', '.git', 'dist', 'build', 'target', 'coverage',
  '.next', '.cache', 'vendor', 'tmp', 'temp', '__pycache__'
];

const LANGUAGE_EXTENSIONS = {
  js: ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'],
  python: ['.py'],
  go: ['.go'],
  rust: ['.rs'],
  java: ['.java']
};

const CODEBASE_DEFAULT_OPTIONS = {
  depth: 3,
  cwd: process.cwd()
};

const MAX_SOURCE_SIZE = 200000;

function readFileWithLimit(filePath, limit, encoding = 'utf8') {
  const descriptor = fs.openSync(filePath, 'r');
  try {
    const stats = fs.fstatSync(descriptor);

    if (!stats.isFile()) {
      const error = new Error(`Not a regular file: ${filePath}`);
      error.code = 'ENOTFILE';
      throw error;
    }

    if (typeof limit === 'number' && stats.size > limit) {
      const error = new Error(`File size ${stats.size} exceeds limit ${limit}`);
      error.code = 'EFBIG';
      throw error;
    }

    return fs.readFileSync(descriptor, encoding);
  } finally {
    fs.closeSync(descriptor);
  }
}

function isIgnoredPath(filePath, ignored = IGNORED_DIRECTORIES) {
  return filePath.split(/[\\/]/).some(part => ignored.includes(part));
}

function safeReadFile(relativePath, cwd) {
  const resolved = path.resolve(cwd, relativePath);
  if (!resolved.startsWith(path.resolve(cwd))) return null;
  try {
    return fs.readFileSync(resolved, 'utf8');
  } catch {
    return null;
  }
}

function detectLanguage(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  for (const [language, extensions] of Object.entries(LANGUAGE_EXTENSIONS)) {
    if (extensions.includes(extension)) return language;
  }
  return 'unknown';
}

function extractSymbols(contents) {
  const result = {
    functions: [],
    classes: [],
    exports: []
  };

  const functionPattern = /(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  const arrowPattern = /(?:const|let)\s{1,1000}([a-zA-Z_$][a-zA-Z0-9_$]*)\s{0,1000}=\s{0,1000}(?:async\s{0,1000})?\([^)]{0,2000}\)\s{0,1000}=>/g;
  const classPattern = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  const exportPattern = /export\s+(?:(?:async\s+)?function|class|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;

  let match;
  while ((match = functionPattern.exec(contents)) !== null) result.functions.push(match[1]);
  while ((match = arrowPattern.exec(contents)) !== null) result.functions.push(match[1]);
  while ((match = classPattern.exec(contents)) !== null) result.classes.push(match[1]);
  while ((match = exportPattern.exec(contents)) !== null) result.exports.push(match[1]);

  const commonJs = contents.match(/module\.exports\s{0,1000}=\s{0,1000}\{([^}]{1,100000})\}/);
  if (commonJs) {
    const names = commonJs[1]
      .split(',')
      .map(item => item.trim().split(':')[0].trim())
      .filter(name => name && /^[a-zA-Z_$]/.test(name));
    result.exports.push(...names);
  }

  result.functions = [...new Set(result.functions)];
  result.classes = [...new Set(result.classes)];
  result.exports = [...new Set(result.exports)];
  return result;
}

function detectProjectFeatures(result, packageJson) {
  const dependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {})
  };

  const mappings = {
    react: 'react',
    vue: 'vue',
    angular: '@angular/core',
    express: 'express',
    fastify: 'fastify',
    nest: '@nestjs/core',
    next: 'next',
    jest: 'jest',
    vitest: 'vitest',
    typescript: 'typescript'
  };

  for (const [feature, dependency] of Object.entries(mappings)) {
    if (dependencies[dependency]) result.frameworks.push(feature);
  }

  result.frameworks = [...new Set(result.frameworks)];
}

function scanDirectory(result, cwd, relativePath, maxDepth, depth = 0) {
  if (depth > maxDepth) return;

  const directory = path.join(cwd, relativePath);
  if (!fs.existsSync(directory)) return;

  try {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
      const childRelative = relativePath
        ? `${relativePath}/${entry.name}`
        : entry.name;

      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.includes(entry.name)) {
          scanDirectory(result, cwd, childRelative, maxDepth, depth + 1);
        }
        continue;
      }

      if (!entry.isFile()) continue;

      const language = detectLanguage(entry.name);
      if (language === 'unknown') continue;
      if (entry.name.endsWith('.min.js') || entry.name.endsWith('.map')) continue;

      try {
        const contents = readFileWithLimit(path.join(cwd, childRelative), MAX_SOURCE_SIZE);
        const symbols = extractSymbols(contents);

        if (symbols.functions.length || symbols.classes.length || symbols.exports.length) {
          result.files[childRelative] = {
            language,
            symbols
          };
        }
      } catch {
        // Ignore unreadable, binary, or oversized source files.
      }
    }
  } catch {
    // Ignore inaccessible directories.
  }
}

function collectCodebase(options = {}) {
  const config = { ...CODEBASE_DEFAULT_OPTIONS, ...options };
  const cwd = config.cwd;

  const result = {
    stats: {
      totalFiles: 0,
      totalSymbols: 0
    },
    packageManagers: [],
    frameworks: [],
    primaryLanguage: null,
    hasTests: false,
    hasTypeScript: false,
    hasDocker: false,
    hasCi: false,
    files: {},
    languages: {}
  };

  const packageContents = safeReadFile('package.json', cwd);
  if (packageContents) {
    try {
      const packageJson = JSON.parse(packageContents);
      detectProjectFeatures(result, packageJson);
    } catch {
      // Ignore invalid package metadata.
    }
  }

  result.hasTypeScript = fs.existsSync(path.join(cwd, 'tsconfig.json'));
  result.hasDocker = fs.existsSync(path.join(cwd, 'Dockerfile'));

  result.hasTests = [
    'test', 'tests', '__tests__', 'spec'
  ].some(name => fs.existsSync(path.join(cwd, name)));

  result.hasCi = [
    '.github/workflows', '.gitlab-ci.yml', 'circle.yml', '.circleci'
  ].some(name => fs.existsSync(path.join(cwd, name)));

  const managers = [
    ['npm', 'package-lock.json'],
    ['yarn', 'yarn.lock'],
    ['pnpm', 'pnpm-lock.yaml'],
    ['bun', 'bun.lockb'],
    ['cargo', 'Cargo.lock'],
    ['go', 'go.mod']
  ];

  for (const [manager, marker] of managers) {
    if (fs.existsSync(path.join(cwd, marker))) result.packageManagers.push(manager);
  }

  scanDirectory(result, cwd, '', config.depth > 1 ? config.depth : 1);

  for (const file of Object.keys(result.files)) {
    const language = result.files[file].language;
    result.languages[language] = (result.languages[language] || 0) + 1;
  }

  result.stats.totalFiles = Object.keys(result.files).length;
  result.stats.totalSymbols = Object.values(result.files).reduce((total, file) => {
    const symbols = file.symbols;
    return total +
      symbols.functions.length +
      symbols.classes.length +
      symbols.exports.length;
  }, 0);

  result.primaryLanguage = Object.entries(result.languages)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return result;
}

const DOCS_PATTERN_DEFAULT_OPTIONS = {
  cwd: process.cwd()
};

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function lineNumberAt(contents, index) {
  if (index < 0) return 0;
  return contents.slice(0, index).split('\n').length;
}

function isTestOrGeneratedPath(filePath) {
  if (String(filePath).startsWith('_')) return true;

  const normalized = String(filePath).toLowerCase();
  const ignored = [
    'node_modules', 'dist', 'build', 'target', 'generated',
    'versioned_docs', 'versioned_sidebars', 'tests/fixtures', '__fixtures__'
  ];

  if (ignored.some(name =>
    normalized.includes(`/${name}/`) || normalized.includes(`\\${name}\\`)
  )) return true;

  return /\.(test|spec)\.[jt]sx?$/.test(filePath);
}

function isCodeFile(filePath) {
  return ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.py', '.go', '.rs', '.java']
    .includes(path.extname(filePath).toLowerCase());
}

function findMarkdownFiles(cwd, maxDepth = 3, maxFiles = 100) {
  const result = [];

  function walk(directory, depth = 0) {
    if (depth > maxDepth || result.length >= maxFiles) return;

    try {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (result.length >= maxFiles) break;
        const absolute = path.join(directory, entry.name);
        const relative = path.relative(cwd, absolute).replace(/\\/g, '/');

        if (entry.isDirectory()) {
          if (!IGNORED_DIRECTORIES.includes(entry.name) && !entry.name.startsWith('.')) {
            walk(absolute, depth + 1);
          }
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
          result.push(relative);
        }
      }
    } catch {
      // Ignore inaccessible directories.
    }
  }

  walk(cwd);
  return result;
}

function compareVersions(left, right) {
  const a = String(left).split('.').map(Number);
  const b = String(right).split('.').map(Number);

  for (let index = 0; index < 3; index++) {
    const av = a[index] || 0;
    const bv = b[index] || 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

function analyzeDocumentationPatterns(options = {}) {
  const config = { ...DOCS_PATTERN_DEFAULT_OPTIONS, ...options };
  const cwd = config.cwd;
  const markdownFiles = findMarkdownFiles(cwd, config.depth || 3);
  const relatedDocs = [];
  const undocumentedExports = [];

  let combinedDocs = '';
  for (const file of markdownFiles) {
    try {
      combinedDocs += fs.readFileSync(path.join(cwd, file), 'utf8') + '\n';
    } catch {
      // Ignore unreadable documentation.
    }
  }

  const codeFiles = [];
  function walk(directory, depth = 0) {
    if (depth > (config.depth || 3)) return;
    try {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const absolute = path.join(directory, entry.name);
        const relative = path.relative(cwd, absolute).replace(/\\/g, '/');

        if (entry.isDirectory()) {
          if (!IGNORED_DIRECTORIES.includes(entry.name) && !entry.name.startsWith('.')) {
            walk(absolute, depth + 1);
          }
        } else if (entry.isFile() && isCodeFile(relative) && !isTestOrGeneratedPath(relative)) {
          codeFiles.push(relative);
        }
      }
    } catch {
      // Ignore inaccessible directories.
    }
  }
  walk(cwd);

  for (const file of codeFiles) {
    let contents;
    try {
      contents = readFileWithLimit(path.join(cwd, file), MAX_SOURCE_SIZE);
    } catch {
      continue;
    }

    const symbols = extractSymbols(contents);
    for (const name of symbols.exports) {
      const documented = new RegExp(`\\b${escapeRegex(name)}\\b`).test(combinedDocs);
      if (!documented) {
        undocumentedExports.push({
          type: 'undocumented_export',
          severity: 'info',
          file,
          name,
          line: lineNumberAt(contents, contents.indexOf(name)),
          suggestion: `Document ${name} exported from ${file}.`
        });
      }
    }
  }

  for (const doc of markdownFiles) {
    let contents;
    try {
      contents = fs.readFileSync(path.join(cwd, doc), 'utf8');
    } catch {
      continue;
    }

    for (const file of codeFiles) {
      const basename = path.basename(file).replace(/\.[^.]+$/, '');
      if (contents.includes(basename) || contents.includes(file)) {
        relatedDocs.push({ documentation: doc, source: file });
      }
    }
  }

  const changelogPath = path.join(cwd, 'CHANGELOG.md');
  let changelog = { exists: false };
  if (fs.existsSync(changelogPath)) {
    try {
      const contents = fs.readFileSync(changelogPath, 'utf8');
      changelog = {
        exists: true,
        hasUnreleased: /unreleased/i.test(contents),
        documented: [],
        undocumented: [],
        suggestion: null
      };
    } catch {
      changelog = { exists: false };
    }
  }

  return {
    relatedDocs,
    changelog,
    markdownFiles,
    repoMap: {
      available: false,
      fallbackReason: 'Repository analyzer data is unavailable',
      stats: null
    },
    undocumentedExports
  };
}

function checkDocumentationPatterns(options = {}) {
  return analyzeDocumentationPatterns(options);
}

function findRelatedDocs(files, options = {}) {
  return analyzeDocumentationPatterns({
    ...options,
    relatedFiles: files
  }).relatedDocs;
}

function findUndocumentedExports(files, options = {}) {
  return analyzeDocumentationPatterns({
    ...options,
    relatedFiles: files
  }).undocumentedExports;
}

const GIT_DEFAULT_OPTIONS = {
  top: 20,
  adjustForAi: false,
  cwd: process.cwd()
};

function collectGit(options = {}) {
  const config = { ...GIT_DEFAULT_OPTIONS, ...options };
  const cwd = config.cwd || process.cwd();

  try {
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd,
      encoding: 'utf8',
      stdio: 'ignore'
    });
  } catch (error) {
    return {
      available: false,
      error: `Git repository unavailable: ${error.message}`
    };
  }

  let branch = null;
  let totalCommits = 0;
  let contributors = [];
  let hotspots = [];
  let releaseInfo = { tagCount: 0, lastRelease: null, cadence: null };

  try {
    branch = execFileSync('git', ['branch', '--show-current'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim() || null;
  } catch {}

  try {
    totalCommits = Number(execFileSync('git', ['rev-list', '--count', 'HEAD'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()) || 0;
  } catch {}

  try {
    const output = execFileSync('git', ['shortlog', '-sne', 'HEAD'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });

    contributors = output.trim().split(/\r?\n/).filter(Boolean).map(line => {
      const match = line.trim().match(/^(\d+)\s+(.+)$/);
      return {
        name: match ? match[2] : line.trim(),
        commits: match ? Number(match[1]) : 0,
        firstSeen: null,
        lastSeen: null
      };
    }).sort((a, b) => b.commits - a.commits);
  } catch {}

  try {
    const output = execFileSync('git', [
      'log', '--numstat', '--format=', '--no-renames'
    ], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });

    const files = Object.create(null);
    for (const line of output.split(/\r?\n/)) {
      const match = line.match(/^(\d+|-)\s+(\d+|-)\s+(.+)$/);
      if (!match) continue;
      const file = match[3];
      const additions = match[1] === '-' ? 0 : Number(match[1]);
      const deletions = match[2] === '-' ? 0 : Number(match[2]);
      files[file] = (files[file] || 0) + additions + deletions;
    }

    hotspots = Object.entries(files)
      .map(([filePath, changes]) => ({
        path: filePath,
        changes,
        recentChanges: changes,
        authors: 0,
        lastChanged: null
      }))
      .sort((a, b) => b.changes - a.changes)
      .slice(0, config.top);
  } catch {}

  try {
    const tags = execFileSync('git', ['tag', '--sort=-creatordate'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim().split(/\r?\n/).filter(Boolean);

    releaseInfo = {
      tagCount: tags.length,
      lastRelease: tags[0] || null,
      cadence: null
    };
  } catch {}

  const totalContributorCommits = contributors.reduce(
    (sum, contributor) => sum + contributor.commits,
    0
  );

  let cumulative = 0;
  let busFactor = 0;
  for (const contributor of contributors) {
    cumulative += contributor.commits;
    busFactor++;
    if (cumulative > totalContributorCommits * 0.8) break;
  }

  return {
    available: true,
    health: {
      active: contributors.length > 0,
      busFactor,
      aiRatio: 0,
      totalCommits,
      totalContributors: contributors.length
    },
    hotspots,
    contributors: contributors.slice(0, 10),
    aiAttribution: {
      ratio: 0,
      attributed: 0,
      heuristic: 0,
      none: totalCommits,
      confidence: 'low',
      tools: {}
    },
    busFactor,
    conventions: {
      branch,
      config: {},
      hooks: false
    },
    releaseInfo
  };
}

const ANALYZER_QUERY_DEFAULT_OPTIONS = {
  cwd: process.cwd()
};

const ANALYZER_EXCLUDES = [
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
  /(^|\/)build\//
];

function findAnalyzerBinary() {
  try {
    const candidate = path.join(
      os.homedir(),
      '.cache',
      'agent-analyzer',
      process.platform === 'win32' ? 'agent-analyzer.exe' : 'agent-analyzer'
    );
    return fs.existsSync(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

function runAnalyzerQuery(args, options = {}) {
  const binary = options.binary || findAnalyzerBinary();
  if (!binary) return null;

  try {
    const output = execFileSync(binary, args, {
      cwd: options.cwd || process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: options.timeout || 10000
    });
    return JSON.parse(output);
  } catch {
    return null;
  }
}

function collectAnalyzerQueries(options = {}) {
  const config = { ...ANALYZER_QUERY_DEFAULT_OPTIONS, ...options };
  const binary = findAnalyzerBinary();

  const result = {
    available: false,
    error: null,
    failedQueries: [],
    binary,
    symbols: null,
    imports: null,
    references: null,
    dependencies: null,
    architecture: null
  };

  if (!binary) {
    result.error = 'Repository analyzer is not installed';
    return result;
  }

  result.available = true;

  const query = (name, args) => {
    const value = runAnalyzerQuery(args, config);
    if (value == null) result.failedQueries.push(name);
    return value;
  };

  result.symbols = query('symbols', ['symbols', '--json', config.cwd]);
  result.imports = query('imports', ['imports', '--json', config.cwd]);
  result.references = query('references', ['references', '--json', config.cwd]);
  result.dependencies = query('dependencies', ['dependencies', '--json', config.cwd]);
  result.architecture = query('architecture', ['architecture', '--json', config.cwd]);

  if (result.failedQueries.length) {
    result.available = result.failedQueries.length < 5;
    result.error = result.available ? null : 'All analyzer queries failed';
  }

  return result;
}

const DEFAULT_OPTIONS = {
  collectors: ['github', 'docs', 'code'],
  depth: 3,
  cwd: process.cwd()
};

function collect(options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const collectors = Array.isArray(config.collectors)
    ? config.collectors
    : DEFAULT_OPTIONS.collectors;

  const result = {
    timestamp: new Date().toISOString(),
    options: config,
    github: null,
    docs: null,
    code: null,
    docsPatterns: null,
    git: null,
    analyzer: null
  };

  if (collectors.includes('analyzer')) {
    result.analyzer = collectAnalyzerQueries(config);
    config.analyzer = result.analyzer;
  }

  if (collectors.includes('github')) {
    result.github = collectGithub(config);
  }

  if (collectors.includes('docs') || collectors.includes('documentation')) {
    result.docs = collectDocumentation(config);
  }

  if (collectors.includes('code') || collectors.includes('codebase')) {
    result.code = collectCodebase(config);
  }

  if (collectors.includes('docsPatterns') || collectors.includes('docs-patterns')) {
    result.docsPatterns = analyzeDocumentationPatterns(config);
  }

  if (collectors.includes('git')) {
    result.git = collectGit(config);
  }

  return result;
}

function collectAllData(options = {}) {
  const collectors = options.all
    ? ['github', 'docs', 'code']
    : options.collectors || ['github', 'docs', 'code'];

  return collect({ ...options, collectors });
}

const github = {
  DEFAULT_OPTIONS: GITHUB_DEFAULT_OPTIONS,
  collectGithub,
  checkGhAvailable,
  runGhJson,
  runGhJsonOrNull,
  normalizeIssue,
  normalizePullRequest,
  normalizePr: normalizePullRequest,
  categorizeIssues,
  detectStaleIssues,
  detectStale: detectStaleIssues,
  extractIssueThemes,
  extractThemes: extractIssueThemes,
  filterFutureMilestones,
  filterMilestones: filterFutureMilestones
};

const documentation = {
  DEFAULT_OPTIONS: DOCUMENTATION_DEFAULT_OPTIONS,
  collectDocumentation,
  analyzeReadme,
  readFileSafe,
  isSafePath,
  isSafe: isSafePath,
  extractTasks,
  extractGlossary,
  extractRoadmap,
  validateDocumentation,
  validateDocs: validateDocumentation
};

const codebase = {
  DEFAULT_OPTIONS: CODEBASE_DEFAULT_OPTIONS,
  IGNORED_DIRECTORIES,
  IGNORED_DIRS: IGNORED_DIRECTORIES,
  LANGUAGE_EXTENSIONS,
  collectCodebase,
  detectLanguage,
  extractSymbols,
  detectProjectFeatures,
  scanDirectory,
  isIgnoredPath,
  safeReadFile,
  readFileWithLimit
};

const docsPatterns = {
  DEFAULT_OPTIONS: DOCS_PATTERN_DEFAULT_OPTIONS,
  analyzeDocumentationPatterns,
  checkDocumentationPatterns,
  findRelatedDocs,
  findUndocumentedExports,
  findMarkdownFiles,
  compareVersions,
  lineNumberAt,
  escapeRegex,
  isCodeFile,
  isTestOrGeneratedPath
};

const git = {
  DEFAULT_OPTIONS: GIT_DEFAULT_OPTIONS,
  collectGit
};

const analyzerQueries = {
  DEFAULT_OPTIONS: ANALYZER_QUERY_DEFAULT_OPTIONS,
  EXCLUDES: ANALYZER_EXCLUDES,
  collectAnalyzerQueries,
  findAnalyzerBinary,
  runAnalyzerQuery
};

module.exports = {
  collect,
  collectAllData,
  github,
  documentation,
  codebase,
  docsPatterns,
  git,
  analyzerQueries,
  collectGithub,
  checkGhAvailable,
  collectDocumentation,
  collectCodebase,
  analyzeDocumentationPatterns,
  checkDocumentationPatterns,
  findRelatedDocs,
  findUndocumentedExports,
  collectGit,
  collectAnalyzerQueries,
  DEFAULT_OPTIONS
};

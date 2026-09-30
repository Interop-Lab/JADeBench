'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const GITHUB_DEFAULT_CONFIG = {
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10000,
  cwd: process.cwd()
};

const DOCUMENTATION_DEFAULT_CONFIG = {
  depth: 3,
  cwd: process.cwd()
};

const CODEBASE_DEFAULT_CONFIG = {
  depth: 4,
  cwd: process.cwd()
};

const DEFAULT_OPTIONS = {
  collectors: ['github', 'docs', 'code'],
  depth: 'standard',
  issueLimit: GITHUB_DEFAULT_CONFIG.issueLimit,
  docsDepth: DOCUMENTATION_DEFAULT_CONFIG.depth,
  codeDepth: CODEBASE_DEFAULT_CONFIG.depth
};

function runGh(args, options = {}) {
  try {
    const output = execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: options.timeout || GITHUB_DEFAULT_CONFIG.timeout,
      cwd: options.cwd || GITHUB_DEFAULT_CONFIG.cwd
    });

    try {
      return { ok: true, data: JSON.parse(output) };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'parse',
          message: `Failed to parse GitHub CLI output: ${error.message}`,
          raw: output.slice(0, 1000)
        }
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        type: error.code === 'ETIMEDOUT' ? 'timeout' : 'command',
        message: error.message,
        exitCode: error.status ?? null,
        stderr: error.stderr ? String(error.stderr).trim() : ''
      }
    };
  }
}

function isGhAvailable() {
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
      ? body.slice(0, 200).replace(/\n/g, ' ').trim() + (body.length > 200 ? '…' : '')
      : ''
  };
}

function normalizePR(pr) {
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
      ? body.slice(0, 200).replace(/\n/g, ' ').trim() + (body.length > 200 ? '…' : '')
      : ''
  };
}

function classifyIssues(result, issues) {
  const categories = {
    bug: 'bugs',
    defect: 'bugs',
    regression: 'bugs',
    feature: 'features',
    enhancement: 'features',
    documentation: 'documentation',
    docs: 'documentation',
    security: 'security',
    performance: 'performance',
    question: 'questions',
    help: 'questions'
  };

  result.issueCategories ||= {};
  for (const category of new Set(Object.values(categories))) {
    result.issueCategories[category] ||= [];
  }
  result.issueCategories.other ||= [];

  for (const issue of issues) {
    const labels = (issue.labels || []).map(label =>
      String(label.name || label).toLowerCase()
    );
    const summary = { number: issue.number, title: issue.title };
    let matched = false;

    for (const [labelName, category] of Object.entries(categories)) {
      const expression = new RegExp(`(^|[^a-z0-9])${escapeRegExp(labelName)}([^a-z0-9]|$)`, 'i');
      if (labels.some(label => expression.test(label))) {
        result.issueCategories[category].push(summary);
        matched = true;
        break;
      }
    }

    if (!matched) result.issueCategories.other.push(summary);
  }
}

function findStaleIssues(result, issues, days = 30) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  result.staleIssues ||= [];

  for (const issue of issues) {
    const updated = new Date(issue.updatedAt);
    if (updated < threshold) {
      result.staleIssues.push({
        number: issue.number,
        title: issue.title,
        lastUpdated: issue.updatedAt,
        daysStale: Math.floor((Date.now() - updated.getTime()) / 86400000)
      });
    }
  }
}

function extractTopWords(result, issues) {
  const ignored = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'in', 'is', 'it', 'of', 'on', 'or', 'that', 'the', 'this', 'to',
    'with'
  ]);
  const counts = Object.create(null);

  for (const issue of issues) {
    for (const word of String(issue.title || '').toLowerCase().split(/\s+/)) {
      const normalized = word.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
      if (normalized.length > 2 && !ignored.has(normalized)) {
        counts[normalized] = (counts[normalized] || 0) + 1;
      }
    }
  }

  result.topWords = Object.entries(counts)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
}

function enrichMilestones(result) {
  const now = new Date();
  result.overdueMilestones = (result.milestones || []).filter(milestone => {
    if (!milestone.due_on || milestone.state === 'closed') return false;
    return new Date(milestone.due_on) < now;
  });
}

function collectGitHub(options = {}) {
  const config = { ...GITHUB_DEFAULT_CONFIG, ...options };
  const result = {
    available: false,
    authenticated: false,
    errors: [],
    counts: {
      issues: 0,
      pullRequests: 0,
      milestones: 0
    },
    issues: [],
    pullRequests: [],
    milestones: [],
    staleIssues: [],
    overdueMilestones: [],
    issueCategories: {},
    topWords: []
  };

  if (!isGhAvailable()) {
    result.errors.push({
      source: 'github',
      type: 'unavailable',
      message: 'GitHub CLI is not available'
    });
    return result;
  }

  result.available = true;

  try {
    execFileSync('gh', ['auth', 'status'], {
      stdio: 'ignore',
      timeout: 5000,
      cwd: config.cwd
    });
    result.authenticated = true;
  } catch {
    result.authenticated = false;
  }

  const issuesResponse = runGh([
    'issue', 'list',
    '--state', 'open',
    '--json', 'number,title,labels,milestone,createdAt,updatedAt,body',
    '--limit', String(config.issueLimit)
  ], config);

  if (issuesResponse.ok && Array.isArray(issuesResponse.data)) {
    const issues = issuesResponse.data;
    result.issues = issues.map(normalizeIssue);
    result.counts.issues = issues.length;
    classifyIssues(result, issues);
    findStaleIssues(result, issues, 30);
    extractTopWords(result, issues);
  } else if (!issuesResponse.ok) {
    result.errors.push({ source: 'issues', ...issuesResponse.error });
  }

  const prsResponse = runGh([
    'pr', 'list',
    '--state', 'open',
    '--json', 'number,title,labels,isDraft,createdAt,updatedAt,files,body',
    '--limit', String(config.prLimit)
  ], config);

  if (prsResponse.ok && Array.isArray(prsResponse.data)) {
    result.pullRequests = prsResponse.data.map(normalizePR);
    result.counts.pullRequests = prsResponse.data.length;
  } else if (!prsResponse.ok) {
    result.errors.push({ source: 'pullRequests', ...prsResponse.error });
  }

  const milestonesResponse = runGh([
    'api',
    'repos/{owner}/{repo}/milestones',
    '--paginate'
  ], config);

  if (milestonesResponse.ok && Array.isArray(milestonesResponse.data)) {
    const milestones = milestonesResponse.data.flatMap(item =>
      Array.isArray(item) ? item : [item]
    );
    result.milestones = milestones
      .slice(0, config.milestoneLimit)
      .map(milestone => ({
        title: milestone.title,
        state: milestone.state,
        due_on: milestone.due_on,
        open_issues: milestone.open_issues,
        closed_issues: milestone.closed_issues
      }));
    result.counts.milestones = result.milestones.length;
    enrichMilestones(result);
  } else if (!milestonesResponse.ok) {
    result.errors.push({ source: 'milestones', ...milestonesResponse.error });
  }

  return result;
}

function isPathInside(file, root) {
  const relative = path.relative(root, file);
  return relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative);
}

function readDocFile(relativePath, cwd) {
  const fullPath = path.resolve(cwd, relativePath);
  if (!isPathInside(fullPath, path.resolve(cwd))) return null;
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch {
    return null;
  }
}

function analyzeMarkdown(content, filePath) {
  const headings = content.match(/^##\s{1,1000}(.+)$/gm) || [];
  const sections = headings
    .slice(0, 50)
    .map(heading => heading.replace(/^##\s+/, ''));
  const searchable = sections.map(section => section.toLowerCase()).join(' ');

  return {
    path: filePath,
    sectionCount: headings.length,
    sections,
    hasInstallation: /install|setup|getting.started/i.test(searchable),
    hasUsage: /usage|how.to|example/i.test(searchable),
    hasApi: /api|reference|methods/i.test(searchable),
    hasTesting: /test|spec|coverage/i.test(searchable),
    codeBlocks: Math.floor(((content.match(/```/g) || []).length) / 2),
    wordCount: content.split(/\s+/).filter(Boolean).length
  };
}

function extractTaskStats(result, content) {
  const completed = (content.match(/^[-*]\s+\[x\]/gim) || []).length;
  const pending = (content.match(/^[-*]\s+\[\s\]/gim) || []).length;
  result.tasks ||= { completed: 0, pending: 0, total: 0 };
  result.tasks.completed += completed;
  result.tasks.pending += pending;
  result.tasks.total += completed + pending;
}

function extractHighlights(result, content) {
  result.highlights ||= [];
  const expression = /^[-*]\s{1,100}\*{0,2}([^\n]{1,2000}?)\*{0,2}(?:\s{0,100}[-–]\s{0,100}([^\n]{1,2000}))?$/gm;
  let match;
  while ((match = expression.exec(content)) !== null && result.highlights.length < 50) {
    const value = match[1].trim();
    if (value.length >= 3 && value.length <= 200) result.highlights.push(value);
  }
  result.highlights = [...new Set(result.highlights)].slice(0, 50);
}

function extractRoadmap(result, content) {
  result.roadmap ||= [];
  const expressions = [
    /(?:TODO|FIXME|PLAN):\s*(.+)/gi,
    /^##\s+(?:Roadmap|Future|Planned|Coming Soon)/gim
  ];

  for (const expression of expressions) {
    let match;
    while ((match = expression.exec(content)) !== null && result.roadmap.length < 25) {
      result.roadmap.push((match[1] || match[0]).slice(0, 300));
    }
  }
}

function listMarkdownFiles(cwd, maxDepth = 3) {
  const files = [];
  const ignored = new Set([
    '.git', 'node_modules', 'dist', 'build', 'target',
    'coverage', '.next', '.cache'
  ]);

  function visit(directory, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (ignored.has(entry.name)) continue;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath, depth + 1);
      } else if (entry.isFile() && /\.mdx?$/i.test(entry.name)) {
        files.push(path.relative(cwd, fullPath).replace(/\\/g, '/'));
      }
    }
  }

  visit(cwd, 0);
  return files;
}

function collectDocumentation(options = {}) {
  const config = { ...DOCUMENTATION_DEFAULT_CONFIG, ...options };
  const preferred = [
    'README.md',
    'CONTRIBUTING.md',
    'CHANGELOG.md',
    'SECURITY.md',
    'CODE_OF_CONDUCT.md',
    'ROADMAP.md',
    'docs/README.md',
    'docs/index.md'
  ];

  const result = {
    stats: { fileCount: 0, totalWords: 0 },
    files: {},
    highlights: [],
    roadmap: [],
    tasks: { completed: 0, pending: 0, total: 0 },
    markdownFiles: []
  };

  const files = [...new Set([
    ...preferred,
    ...(config.depth > 1 ? listMarkdownFiles(config.cwd, config.depth) : [])
  ])];

  for (const relativePath of files) {
    const content = readDocFile(relativePath, config.cwd);
    if (content == null) continue;
    const analysis = analyzeMarkdown(content, relativePath);
    result.files[relativePath] = analysis;
    result.stats.totalWords += analysis.wordCount;
    extractTaskStats(result, content);
    extractHighlights(result, content);
    extractRoadmap(result, content);
  }

  result.stats.fileCount = Object.keys(result.files).length;
  result.markdownFiles = Object.keys(result.files);
  return result;
}

function readFileWithLimit(filePath, limit, encoding = 'utf8') {
  const descriptor = fs.openSync(filePath, 'r');
  try {
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) {
      const error = new Error(`Not a regular file: ${filePath}`);
      error.code = 'ENOTFILE';
      throw error;
    }
    if (typeof limit === 'number' && stat.size > limit) {
      const error = new Error(`File exceeds size limit (${stat.size} > ${limit}): ${filePath}`);
      error.code = 'EFBIG';
      throw error;
    }
    return fs.readFileSync(descriptor, encoding);
  } finally {
    fs.closeSync(descriptor);
  }
}

function extractSymbols(source) {
  const result = { functions: [], classes: [], exports: [] };
  let match;

  const functionPattern = /(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  while ((match = functionPattern.exec(source)) !== null) {
    result.functions.push(match[1]);
  }

  const arrowPattern = /(?:const|let)\s{1,1000}([a-zA-Z_$][a-zA-Z0-9_$]*)\s{0,1000}=\s{0,1000}(?:async\s{0,1000})?\([^)]{0,2000}\)\s{0,1000}=>/g;
  while ((match = arrowPattern.exec(source)) !== null) {
    result.functions.push(match[1]);
  }

  const classPattern = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  while ((match = classPattern.exec(source)) !== null) {
    result.classes.push(match[1]);
  }

  const exportPattern = /export\s+(?:(?:async\s+)?function|class|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  while ((match = exportPattern.exec(source)) !== null) {
    result.exports.push(match[1]);
  }

  const commonJsPattern = /module\.exports\s{0,1000}=\s{0,1000}\{([^}]{1,100000})\}/;
  const commonJsMatch = source.match(commonJsPattern);
  if (commonJsMatch) {
    const names = commonJsMatch[1]
      .split(',')
      .map(part => part.trim().split(':')[0].trim())
      .filter(name => name && /^[a-zA-Z_$]/.test(name));
    result.exports.push(...names);
  }

  result.functions = [...new Set(result.functions)];
  result.classes = [...new Set(result.classes)];
  result.exports = [...new Set(result.exports)];
  return result;
}

const DEFAULT_IGNORED_DIRECTORIES = [
  '.git', 'node_modules', 'vendor', 'dist', 'build', 'target',
  'coverage', '.next', '.cache', '__pycache__', '.venv', 'venv'
];

const LANGUAGE_EXTENSIONS = {
  js: ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'],
  py: ['.py'],
  go: ['.go'],
  rust: ['.rs'],
  java: ['.java'],
  ruby: ['.rb']
};

function collectCodebase(options = {}) {
  const config = { ...CODEBASE_DEFAULT_CONFIG, ...options };
  const result = {
    stats: { totalFiles: 0, totalSymbols: 0 },
    files: {},
    languages: {},
    exports: [],
    entryPoints: [],
    structure: {},
    flags: {
      hasPackageJson: fs.existsSync(path.join(config.cwd, 'package.json')),
      hasTesting: false,
      hasTypeScript: false,
      hasDocker: false
    }
  };

  const extensions = new Set(Object.values(LANGUAGE_EXTENSIONS).flat());
  const maxFiles = options.maxFiles || 500;
  const maxFileSize = options.maxFileSize || 1024 * 1024;

  function visit(directory, relativeDirectory, depth) {
    if (depth > config.depth || result.stats.totalFiles >= maxFiles) return;

    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }

    const directoryInfo = { directories: [], fileCount: 0 };
    result.structure[relativeDirectory || '.'] = directoryInfo;

    for (const entry of entries) {
      if (result.stats.totalFiles >= maxFiles) break;
      const fullPath = path.join(directory, entry.name);
      const relativePath = relativeDirectory
        ? `${relativeDirectory}/${entry.name}`
        : entry.name;

      if (entry.isDirectory()) {
        if (DEFAULT_IGNORED_DIRECTORIES.includes(entry.name)) continue;
        directoryInfo.directories.push(entry.name);
        visit(fullPath, relativePath, depth + 1);
        continue;
      }

      if (!entry.isFile()) continue;
      const extension = path.extname(entry.name).toLowerCase();
      if (!extensions.has(extension) || entry.name.endsWith('.min.js')) continue;

      try {
        const source = readFileWithLimit(fullPath, maxFileSize);
        const symbols = extractSymbols(source);
        if (!symbols.functions.length && !symbols.classes.length && !symbols.exports.length) {
          continue;
        }

        result.files[relativePath] = symbols;
        result.stats.totalFiles++;
        result.stats.totalSymbols +=
          symbols.functions.length + symbols.classes.length + symbols.exports.length;
        result.exports.push(...symbols.exports.map(name => ({
          name,
          path: relativePath
        })));
        directoryInfo.fileCount++;

        const language = Object.entries(LANGUAGE_EXTENSIONS)
          .find(([, values]) => values.includes(extension))?.[0] || 'other';
        result.languages[language] = (result.languages[language] || 0) + 1;

        if (/[\\/]tests?[\\/]|\.test\.[jt]sx?$|\.spec\.[jt]sx?$/.test(relativePath)) {
          result.flags.hasTesting = true;
        }
        if (extension === '.ts' || extension === '.tsx') result.flags.hasTypeScript = true;
      } catch {
        // Ignore unreadable, oversized, or transient files.
      }
    }
  }

  visit(config.cwd, '', 0);

  for (const candidate of [
    'index.js', 'index.ts', 'src/index.js', 'src/index.ts',
    'main.js', 'main.ts', 'app.js', 'app.ts'
  ]) {
    if (fs.existsSync(path.join(config.cwd, candidate))) result.entryPoints.push(candidate);
  }

  result.flags.hasDocker =
    fs.existsSync(path.join(config.cwd, 'Dockerfile')) ||
    fs.existsSync(path.join(config.cwd, 'docker-compose.yml'));

  result.exports = result.exports.slice(0, 100);
  return result;
}

function collectGit(options = {}) {
  const config = {
    top: 20,
    adjustForAi: false,
    cwd: process.cwd(),
    ...options
  };

  try {
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd: config.cwd,
      stdio: 'ignore'
    });
  } catch (error) {
    return {
      available: false,
      error: `Git repository is not available: ${error.message}`
    };
  }

  try {
    const branch = execFileSync('git', ['branch', '--show-current'], {
      cwd: config.cwd,
      encoding: 'utf8'
    }).trim();

    const commit = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: config.cwd,
      encoding: 'utf8'
    }).trim();

    const shortLog = execFileSync('git', [
      'shortlog', '-sne', '--all'
    ], {
      cwd: config.cwd,
      encoding: 'utf8'
    }).trim();

    const contributors = shortLog
      ? shortLog.split(/\r?\n/).map(line => {
          const match = line.trim().match(/^(\d+)\s+(.+)$/);
          return match
            ? { name: match[2], commits: Number(match[1]) }
            : { name: line.trim(), commits: 0 };
        }).sort((a, b) => b.commits - a.commits)
      : [];

    const hotspotsOutput = execFileSync('git', [
      'log', '--all', '--name-only', '--pretty=format:'
    ], {
      cwd: config.cwd,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024
    });

    const counts = Object.create(null);
    for (const file of hotspotsOutput.split(/\r?\n/)) {
      if (file) counts[file] = (counts[file] || 0) + 1;
    }

    const hotspots = Object.entries(counts)
      .map(([file, changes]) => ({ path: file, changes }))
      .sort((a, b) => b.changes - a.changes)
      .slice(0, config.top);

    const totalCommits = contributors.reduce((sum, item) => sum + item.commits, 0);
    let accumulated = 0;
    let busFactor = 0;
    for (const contributor of contributors) {
      accumulated += contributor.commits;
      busFactor++;
      if (accumulated >= totalCommits * 0.8) break;
    }

    return {
      available: true,
      branch,
      commit,
      health: {
        active: contributors.length > 0,
        busFactor,
        totalCommits,
        totalContributors: contributors.length
      },
      hotspots,
      contributors: contributors.slice(0, 20),
      busFactor
    };
  } catch (error) {
    return {
      available: false,
      error: error.message
    };
  }
}

function collectAnalyzerQueries(options = {}) {
  return {
    available: false,
    error: 'Analyzer binary is not available',
    cwd: options.cwd || process.cwd(),
    errors: []
  };
}

function collectAll(options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const selected = Array.isArray(config.collectors)
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

  if (selected.includes('analyzer')) {
    result.analyzer = collectAnalyzerQueries(config);
    config.analyzer = result.analyzer;
  }
  if (selected.includes('github')) result.github = collectGitHub(config);
  if (selected.includes('docs')) result.docs = collectDocumentation(config);
  if (selected.includes('code')) result.code = collectCodebase(config);
  if (selected.includes('docsPatterns')) result.docsPatterns = collectDocsPatterns(config);
  if (selected.includes('git')) result.git = collectGit(config);

  return result;
}

function collect(options = {}) {
  const collectors = options.collectors || options.depth
    ? options.collectors || DEFAULT_OPTIONS.collectors
    : DEFAULT_OPTIONS.collectors;
  return collectAll({ ...options, collectors });
}

function collectDocsPatterns(options = {}) {
  const cwd = options.cwd || process.cwd();
  const markdownFiles = listMarkdownFiles(cwd, options.depth || 3);
  return {
    relatedDocs: findRelatedDocs(markdownFiles, options),
    changelog: analyzeChangelog(markdownFiles, options),
    markdownFiles,
    undocumentedExports: []
  };
}

function findRelatedDocs(files, options = {}) {
  const cwd = options.cwd || process.cwd();
  const results = [];

  for (const file of files) {
    const content = readDocFile(file, cwd);
    if (content == null) continue;
    const links = [];
    const expression = /\[[^\]]+\]\(([^)]+)\)/g;
    let match;
    while ((match = expression.exec(content)) !== null) links.push(match[1]);
    results.push({ path: file, links });
  }

  return results;
}

function analyzeChangelog(files, options = {}) {
  const cwd = options.cwd || process.cwd();
  const changelog = files.find(file => /(^|\/)CHANGELOG\.md$/i.test(file));
  if (!changelog) return { exists: false };

  const content = readDocFile(changelog, cwd) || '';
  return {
    exists: true,
    hasUnreleased: /(^|\n)##\s+\[?Unreleased\]?/i.test(content),
    path: changelog
  };
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  DEFAULT_OPTIONS,
  collect,
  collectAll,
  collectCollectors: collectAll,

  github: {
    DEFAULT_CONFIG: GITHUB_DEFAULT_CONFIG,
    collectGitHub,
    isGhAvailable,
    runGh,
    normalizeIssue,
    normalizePR,
    classifyIssues,
    findStaleIssues,
    extractTopWords,
    enrichMilestones
  },
  documentation: {
    DEFAULT_CONFIG: DOCUMENTATION_DEFAULT_CONFIG,
    collectDocumentation,
    analyzeMarkdown,
    readDocFile,
    extractTaskStats,
    extractHighlights,
    extractRoadmap,
    listMarkdownFiles
  },
  codebase: {
    DEFAULT_CONFIG: CODEBASE_DEFAULT_CONFIG,
    collectCodebase,
    extractSymbols,
    readFileWithLimit,
    DEFAULT_IGNORED_DIRECTORIES,
    LANGUAGE_EXTENSIONS
  },
  docsPatterns: {
    collectDocsPatterns,
    findRelatedDocs,
    analyzeChangelog
  },
  git: {
    collectGit
  },
  analyzerQueries: {
    collectAnalyzerQueries
  },

  collectGitHub,
  collectDocumentation,
  collectCodebase,
  collectDocsPatterns,
  collectGit,
  collectAnalyzerQueries,
  isGhAvailable,
  runGh,
  normalizeIssue,
  normalizePR,
  classifyIssues,
  findStaleIssues,
  extractTopWords,
  enrichMilestones,
  analyzeMarkdown,
  readDocFile,
  extractTaskStats,
  extractHighlights,
  extractRoadmap,
  listMarkdownFiles,
  extractSymbols,
  readFileWithLimit,
  findRelatedDocs,
  analyzeChangelog,
  escapeRegExp
};

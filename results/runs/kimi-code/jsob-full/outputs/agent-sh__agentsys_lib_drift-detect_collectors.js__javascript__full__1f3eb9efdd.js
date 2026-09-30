'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const GITHUB_DEFAULTS = {
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10_000,
  cwd: process.cwd(),
};

const DOCUMENTATION_DEFAULTS = {
  depth: 'thorough',
  cwd: process.cwd(),
};

const CODEBASE_DEFAULTS = {
  depth: 'thorough',
  cwd: process.cwd(),
};

const DEFAULT_OPTIONS = {
  sources: ['github', 'docs', 'code'],
  depth: 'thorough',
  issueLimit: GITHUB_DEFAULTS.issueLimit,
  prLimit: GITHUB_DEFAULTS.prLimit,
  timeout: GITHUB_DEFAULTS.timeout,
};

const EXCLUDED_DIRECTORIES = new Set([
  'node_modules',
  'vendor',
  'dist',
  'build',
  'out',
  'target',
  '.git',
  '.svn',
  '.hg',
  '__pycache__',
  '.pytest_cache',
  'coverage',
  '.nyc_output',
  '.next',
  '.nuxt',
  '.cache',
]);

const SOURCE_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.rs', '.go', '.py', '.java',
]);

function isPathSafe(relativePath, rootDirectory) {
  const root = path.resolve(rootDirectory);
  const candidate = path.resolve(root, relativePath);
  return candidate === root || candidate.startsWith(`${root}${path.sep}`);
}

function readTextFile(relativePath, rootDirectory) {
  if (!isPathSafe(relativePath, rootDirectory)) return null;
  try {
    return fs.readFileSync(path.resolve(rootDirectory, relativePath), 'utf8');
  } catch {
    return null;
  }
}

function runGitHubCli(args, options = {}) {
  try {
    const output = execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: options.timeout || GITHUB_DEFAULTS.timeout,
      cwd: options.cwd || GITHUB_DEFAULTS.cwd,
    });
    try {
      return { ok: true, data: JSON.parse(output) };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'parse',
          message: `Failed to parse gh output as JSON: ${error.message}`,
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
        exitCode: error.status ?? null,
        stderr: error.stderr ? String(error.stderr).trim() : '',
      },
    };
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

function summarizeIssue(issue) {
  return {
    number: issue.number,
    title: issue.title,
    labels: (issue.labels || []).map((label) => label.name || label),
    milestone: issue.milestone?.title || issue.milestone || null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    snippet: summarizeBody(issue.body, 200),
  };
}

function summarizePullRequest(pullRequest) {
  return {
    number: pullRequest.number,
    title: pullRequest.title,
    labels: (pullRequest.labels || []).map((label) => label.name || label),
    isDraft: pullRequest.isDraft,
    createdAt: pullRequest.createdAt,
    updatedAt: pullRequest.updatedAt,
    files: pullRequest.files || [],
    snippet: summarizeBody(pullRequest.body, 150),
  };
}

function summarizeBody(body, limit) {
  if (!body) return '';
  const summary = body.slice(0, limit).replace(/\n/g, ' ').trim();
  return body.length > limit ? `${summary}...` : summary;
}

function categorizeIssues(result, issues) {
  const categoryLabels = {
    bug: 'bugs',
    'type: bug': 'bugs',
    feature: 'features',
    'type: feature': 'features',
    enhancement: 'enhancements',
    security: 'security',
    'type: security': 'security',
  };
  const matchers = Object.entries(categoryLabels).map(([label, category]) => ({
    regex: new RegExp(`(^|[^a-z])${escapeRegex(label)}([^a-z]|$)`, 'i'),
    category,
  }));

  for (const issue of issues) {
    const labels = (issue.labels || []).map((label) => (label.name || label).toLowerCase());
    const summary = { number: issue.number, title: issue.title };
    const match = matchers.find(({ regex }) => labels.some((label) => regex.test(label)));
    result.categorized[match ? match.category : 'other'].push(summary);
  }
}

function findStaleIssues(result, issues, ageInDays) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - ageInDays);
  for (const issue of issues) {
    const updatedAt = new Date(issue.updatedAt);
    if (updatedAt < cutoff) {
      result.stale.push({
        number: issue.number,
        title: issue.title,
        lastUpdated: issue.updatedAt,
        daysStale: Math.floor((Date.now() - updatedAt) / 86_400_000),
      });
    }
  }
}

function extractIssueThemes(result, issues) {
  const ignoredWords = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'for', 'in', 'on', 'at', 'with', 'and', 'or', 'of']);
  const counts = {};
  for (const issue of issues) {
    for (const word of (issue.title || '').toLowerCase().split(/\s+/)) {
      if (word.length > 3 && !ignoredWords.has(word)) counts[word] = (counts[word] || 0) + 1;
    }
  }
  result.themes = Object.entries(counts)
    .filter(([, count]) => count > 1)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

function findOverdueMilestones(result) {
  const now = new Date();
  result.overdueMilestones = result.milestones.filter(
    (milestone) => milestone.due_on && milestone.state !== 'closed' && new Date(milestone.due_on) < now,
  );
}

function scanGitHubState(options = {}) {
  const settings = { ...GITHUB_DEFAULTS, ...options };
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
    categorized: { bugs: [], features: [], security: [], enhancements: [], other: [] },
    stale: [],
    themes: [],
  };

  if (!isGhAvailable()) {
    result.error = 'gh CLI not available or not authenticated';
    return result;
  }
  result.available = true;

  const issuesResponse = runGitHubCli([
    'issue', 'list', '--state', 'open', '--json',
    'number,title,labels,milestone,createdAt,updatedAt,body', '--limit', String(settings.issueLimit),
  ], settings);
  if (issuesResponse.ok && Array.isArray(issuesResponse.data)) {
    const issues = issuesResponse.data;
    result.issues = issues.map(summarizeIssue);
    result.summary.issueCount = issues.length;
    result.pagination.issues.fetchedCount = issues.length;
    result.pagination.issues.hasMore = settings.issueLimit > 0 && issues.length >= settings.issueLimit;
    categorizeIssues(result, issues);
    findStaleIssues(result, issues, 90);
    extractIssueThemes(result, issues);
  } else if (!issuesResponse.ok) {
    result.errors.push({ source: 'issues', ...issuesResponse.error });
  }

  const pullsResponse = runGitHubCli([
    'pr', 'list', '--state', 'open', '--json',
    'number,title,labels,isDraft,createdAt,updatedAt,body,files', '--limit', String(settings.prLimit),
  ], settings);
  if (pullsResponse.ok && Array.isArray(pullsResponse.data)) {
    const pulls = pullsResponse.data;
    result.prs = pulls.map(summarizePullRequest);
    result.summary.prCount = pulls.length;
    result.pagination.prs.fetchedCount = pulls.length;
    result.pagination.prs.hasMore = settings.prLimit > 0 && pulls.length >= settings.prLimit;
  } else if (!pullsResponse.ok) {
    result.errors.push({ source: 'prs', ...pullsResponse.error });
  }

  const milestonesResponse = runGitHubCli([
    'api', 'repos/{owner}/{repo}/milestones', '--paginate', '--slurp',
  ], settings);
  if (milestonesResponse.ok && Array.isArray(milestonesResponse.data)) {
    const milestones = milestonesResponse.data
      .flatMap((page) => Array.isArray(page) ? page : [])
      .map((milestone) => ({
        title: milestone.title,
        state: milestone.state,
        due_on: milestone.due_on,
        open_issues: milestone.open_issues,
        closed_issues: milestone.closed_issues,
      }));
    result.pagination.milestones.fetchedCount = milestones.length;
    result.pagination.milestones.hasMore = settings.milestoneLimit > 0 && milestones.length > settings.milestoneLimit;
    result.milestones = milestones.slice(0, settings.milestoneLimit);
    result.summary.milestoneCount = result.milestones.length;
    findOverdueMilestones(result);
  } else if (!milestonesResponse.ok) {
    result.errors.push({ source: 'milestones', ...milestonesResponse.error });
  }

  result.partial = result.errors.length > 0;
  if (result.partial) result.error = 'Partial GitHub data collected';
  return result;
}

function analyzeMarkdownFile(contents, relativePath) {
  const headings = contents.match(/^##\s{1,1000}(.+)$/gm) || [];
  const sections = headings.slice(0, 10).map((heading) => heading.replace(/^##\s+/, ''));
  const sectionNames = sections.map((section) => section.toLowerCase()).join(' ');
  return {
    path: relativePath,
    sectionCount: headings.length,
    sections,
    hasInstallation: /install|setup|getting.started/i.test(sectionNames),
    hasUsage: /usage|how.to|example/i.test(sectionNames),
    hasApi: /api|reference|methods/i.test(sectionNames),
    hasTesting: /test|spec|coverage/i.test(sectionNames),
    codeBlocks: Math.floor((contents.match(/```/g) || []).length / 2),
    wordCount: contents.split(/\s+/).length,
  };
}

function extractCheckboxes(result, contents) {
  const checked = (contents.match(/^[-*]\s+\[x\]/gim) || []).length;
  const unchecked = (contents.match(/^[-*]\s+\[\s\]/gim) || []).length;
  result.checkboxes.checked += checked;
  result.checkboxes.unchecked += unchecked;
  result.checkboxes.total += checked + unchecked;
}

function extractFeatures(result, contents) {
  const featurePattern = /^[-*]\s{1,100}\*{0,2}([^\n]{1,2000}?)\*{0,2}(?:\s{0,100}[-–]\s{0,100}([^\n]{1,2000}))?$/gm;
  let match;
  while ((match = featurePattern.exec(contents)) !== null && result.features.length < 20) {
    const feature = match[1].trim();
    if (feature.length > 5 && feature.length < 80) result.features.push(feature);
  }
  result.features = [...new Set(result.features)].slice(0, 20);
}

function extractPlans(result, contents) {
  const patterns = [/(?:TODO|FIXME|PLAN):\s*(.+)/gi, /^##\s+(?:Roadmap|Future|Planned|Coming Soon)/gim];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(contents)) !== null && result.plans.length < 15) {
      result.plans.push((match[1] || match[0]).slice(0, 100));
    }
  }
}

function identifyDocumentationGaps(result) {
  const readme = result.files['README.md'];
  if (!readme) {
    result.gaps.push({ type: 'missing', file: 'README.md', severity: 'high' });
  } else {
    if (!readme.hasInstallation) {
      result.gaps.push({ type: 'missing-section', file: 'README.md', section: 'Installation', severity: 'medium' });
    }
    if (!readme.hasUsage) {
      result.gaps.push({ type: 'missing-section', file: 'README.md', section: 'Usage', severity: 'medium' });
    }
  }
  if (!result.files['CHANGELOG.md']) {
    result.gaps.push({ type: 'missing', file: 'CHANGELOG.md', severity: 'low' });
  }
}

function analyzeDocumentation(options = {}) {
  const settings = { ...DOCUMENTATION_DEFAULTS, ...options };
  const result = {
    summary: { fileCount: 0, totalWords: 0 },
    files: {},
    features: [],
    plans: [],
    checkboxes: { total: 0, checked: 0, unchecked: 0 },
    gaps: [],
  };
  const standardFiles = [
    'README.md', 'PLAN.md', 'CLAUDE.md', 'AGENTS.md', 'CONTRIBUTING.md', 'CHANGELOG.md',
    'docs/README.md', 'docs/PLAN.md',
  ];

  for (const relativePath of standardFiles) {
    const contents = readTextFile(relativePath, settings.cwd);
    if (!contents) continue;
    const analysis = analyzeMarkdownFile(contents, relativePath);
    result.files[relativePath] = analysis;
    result.summary.totalWords += analysis.wordCount;
    extractCheckboxes(result, contents);
    extractFeatures(result, contents);
    extractPlans(result, contents);
  }

  if (settings.depth === 'thorough') {
    const docsDirectory = path.join(settings.cwd, 'docs');
    if (fs.existsSync(docsDirectory)) {
      try {
        const additionalFiles = fs.readdirSync(docsDirectory)
          .filter((name) => name.endsWith('.md') && !standardFiles.includes(`docs/${name}`))
          .slice(0, 5);
        for (const name of additionalFiles) {
          const relativePath = `docs/${name}`;
          const contents = readTextFile(relativePath, settings.cwd);
          if (!contents) continue;
          const analysis = analyzeMarkdownFile(contents, relativePath);
          result.files[relativePath] = analysis;
          result.summary.totalWords += analysis.wordCount;
        }
      } catch {}
    }
  }

  result.summary.fileCount = Object.keys(result.files).length;
  identifyDocumentationGaps(result);
  return result;
}

function detectFrameworks(result, packageManifest) {
  const dependencies = { ...packageManifest.dependencies, ...packageManifest.devDependencies };
  const frameworks = {
    react: 'React',
    'react-dom': 'React',
    next: 'Next.js',
    vue: 'Vue.js',
    nuxt: 'Nuxt',
    angular: 'Angular',
    express: 'Express',
    fastify: 'Fastify',
    koa: 'Koa',
    nestjs: 'NestJS',
  };
  for (const [dependency, framework] of Object.entries(frameworks)) {
    if (dependencies[dependency]) result.frameworks.push(framework);
  }
  result.frameworks = [...new Set(result.frameworks)];
}

function detectTestFramework(result, packageManifest) {
  const dependencies = { ...packageManifest.dependencies, ...packageManifest.devDependencies };
  for (const framework of ['jest', 'mocha', 'vitest', 'ava', 'tap', 'jasmine']) {
    if (dependencies[framework]) {
      result.testFramework = framework;
      result.health.hasTests = true;
      break;
    }
  }
}

function extractSymbols(contents) {
  const symbols = { functions: [], classes: [], exports: [] };
  collectMatches(symbols.functions, contents, /(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g);
  collectMatches(symbols.functions, contents, /(?:const|let)\s{1,1000}([a-zA-Z_$][a-zA-Z0-9_$]*)\s{0,1000}=\s{0,1000}(?:async\s{0,1000})?\([^)]{0,2000}\)\s{0,1000}=>/g);
  collectMatches(symbols.classes, contents, /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
  collectMatches(symbols.exports, contents, /export\s+(?:(?:async\s+)?function|class|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
  const commonJsExport = contents.match(/module\.exports\s{0,1000}=\s{0,1000}\{([^}]{1,100000})\}/);
  if (commonJsExport) {
    const names = commonJsExport[1].split(',').map((entry) => entry.trim().split(':')[0].trim());
    symbols.exports.push(...names.filter((name) => name && /^[a-zA-Z_$]/.test(name)));
  }
  symbols.functions = [...new Set(symbols.functions)];
  symbols.classes = [...new Set(symbols.classes)];
  symbols.exports = [...new Set(symbols.exports)];
  return symbols;
}

function collectMatches(destination, contents, pattern) {
  let match;
  while ((match = pattern.exec(contents)) !== null) destination.push(match[1]);
}

function scanDirectory(rootDirectory, relativeDirectory, result, maximumDepth, depth = 0) {
  if (depth >= maximumDepth) return;
  const directory = path.join(rootDirectory, relativeDirectory);
  if (!fs.existsSync(directory)) return;
  try {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    const directories = [];
    const files = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRECTORIES.has(entry.name)) directories.push(entry.name);
      } else {
        files.push(entry.name);
      }
    }
    result.structure[relativeDirectory || '.'] = { dirs: directories, fileCount: files.length };
    for (const file of files) {
      const extension = path.extname(file).toLowerCase() || 'no-ext';
      result.fileStats[extension] = (result.fileStats[extension] || 0) + 1;
    }
    for (const child of directories) {
      scanDirectory(rootDirectory, path.join(relativeDirectory, child), result, maximumDepth, depth + 1);
    }
  } catch {}
}

function scanFileSymbols(rootDirectory, topLevelDirectories) {
  const symbols = {};
  let filesScanned = 0;
  const maximumFiles = 40;

  function visit(directory, relativeDirectory = '', depth = 0) {
    if (filesScanned >= maximumFiles || depth > 2 || !fs.existsSync(directory)) return;
    try {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (filesScanned >= maximumFiles) break;
        const absolutePath = path.join(directory, entry.name);
        const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          if (!['node_modules', '__tests__', 'test', 'tests', 'dist', 'build'].includes(entry.name)) {
            visit(absolutePath, relativePath, depth + 1);
          }
        } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name)) && !entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
          try {
            const stat = fs.statSync(absolutePath);
            if (stat.size > 50_000) continue;
            const analysis = extractSymbols(fs.readFileSync(absolutePath, 'utf8'));
            if (analysis.functions.length || analysis.classes.length || analysis.exports.length) {
              symbols[relativePath] = analysis;
              filesScanned++;
            }
          } catch {}
        }
      }
    } catch {}
  }

  for (const directory of topLevelDirectories.filter((name) => ['lib', 'src', 'app', 'pages', 'components', 'utils', 'services', 'api'].includes(name))) {
    if (filesScanned >= maximumFiles) break;
    visit(path.join(rootDirectory, directory), directory);
  }
  return symbols;
}

function detectRepositoryHealth(result, rootDirectory) {
  result.health.hasReadme = fs.existsSync(path.join(rootDirectory, 'README.md'));
  result.health.hasLinting = ['.eslintrc', '.eslintrc.js', '.eslintrc.json', 'eslint.config.js', 'biome.json']
    .some((name) => fs.existsSync(path.join(rootDirectory, name)));
  result.health.hasCi = ['.github/workflows', '.gitlab-ci.yml', '.circleci', 'Jenkinsfile', '.travis.yml']
    .some((name) => fs.existsSync(path.join(rootDirectory, name)));
  result.health.hasTests ||= ['tests', '__tests__', 'test', 'spec']
    .some((name) => fs.existsSync(path.join(rootDirectory, name)));
}

function findImplementedFeatures(result) {
  const featureTerms = {
    authentication: ['auth', 'login', 'session', 'jwt', 'oauth'],
    api: ['routes', 'controllers', 'handlers', 'endpoints'],
    database: ['models', 'schemas', 'migrations', 'seeds'],
    ui: ['components', 'views', 'pages', 'layouts'],
    testing: ['__tests__', 'test', 'spec', '.test.', '.spec.'],
    docs: ['docs', 'documentation', 'wiki'],
  };
  const paths = Object.keys(result.structure).map((entry) => entry.toLowerCase());
  for (const [feature, terms] of Object.entries(featureTerms)) {
    if (terms.some((term) => paths.some((entry) => entry.includes(term)))) result.implementedFeatures.push(feature);
  }
}

function scanCodebase(options = {}) {
  const settings = { ...CODEBASE_DEFAULTS, ...options };
  const result = {
    summary: { totalDirs: 0, totalFiles: 0 },
    topLevelDirs: [],
    frameworks: [],
    testFramework: null,
    hasTypeScript: false,
    implementedFeatures: [],
    symbols: {},
    health: { hasTests: false, hasLinting: false, hasCi: false, hasReadme: false },
    fileStats: {},
  };

  const packageContents = readTextFile('package.json', settings.cwd);
  if (packageContents) {
    try {
      const packageManifest = JSON.parse(packageContents);
      detectFrameworks(result, packageManifest);
      detectTestFramework(result, packageManifest);
    } catch {}
  }
  result.hasTypeScript = fs.existsSync(path.join(settings.cwd, 'tsconfig.json'));

  const directoryScan = { structure: {}, fileStats: result.fileStats };
  scanDirectory(settings.cwd, '', directoryScan, settings.depth === 'thorough' ? 3 : 2);
  result.summary.totalDirs = Object.keys(directoryScan.structure).length;
  result.summary.totalFiles = Object.values(directoryScan.structure)
    .reduce((total, entry) => total + (entry.fileCount || 0), 0);
  result.topLevelDirs = directoryScan.structure['.']?.dirs || [];
  detectRepositoryHealth(result, settings.cwd);

  if (settings.depth === 'thorough') {
    result.structure = directoryScan.structure;
    findImplementedFeatures(result);
    result.symbols = scanFileSymbols(settings.cwd, result.topLevelDirs);
  }

  result.fileStats = Object.fromEntries(
    Object.entries(result.fileStats).sort((left, right) => right[1] - left[1]).slice(0, 10),
  );
  return result;
}

function findMarkdownFiles(rootDirectory) {
  const markdownFiles = [];
  const excluded = new Set(['node_modules', 'dist', 'build', '.git', 'coverage', 'vendor']);

  function visit(directory, depth = 0) {
    if (depth > 5 || markdownFiles.length > 200) return;
    try {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const absolutePath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          if (!excluded.has(entry.name) && !entry.name.startsWith('.')) visit(absolutePath, depth + 1);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          markdownFiles.push(path.relative(rootDirectory, absolutePath));
        }
      }
    } catch {}
  }

  visit(rootDirectory);
  return markdownFiles;
}

function findRelatedDocs(changedFiles, options = {}) {
  const rootDirectory = options.cwd || process.cwd();
  const relatedDocuments = [];
  const markdownFiles = findMarkdownFiles(rootDirectory);
  for (const changedFile of changedFiles) {
    const fileName = path.basename(changedFile).replace(/\.[^.]+$/, '');
    const extensionlessPath = changedFile.replace(/\.[^.]+$/, '');
    for (const document of markdownFiles) {
      let contents;
      try {
        contents = fs.readFileSync(path.join(rootDirectory, document), 'utf8');
      } catch {
        continue;
      }
      const referenceTypes = [];
      if (contents.includes(fileName)) referenceTypes.push('filename');
      if (contents.includes(changedFile)) referenceTypes.push('full-path');
      if (contents.includes(`from '${extensionlessPath}'`) || contents.includes(`from "${extensionlessPath}"`)) referenceTypes.push('import');
      if (contents.includes(`require('${extensionlessPath}')`) || contents.includes(`require("${extensionlessPath}")`)) referenceTypes.push('require');
      if (contents.includes(`/${fileName}`) || contents.includes(`/${fileName}.`)) referenceTypes.push('url-path');
      if (referenceTypes.length) relatedDocuments.push({ document, referencedFile: changedFile, referenceTypes });
    }
  }
  return relatedDocuments;
}

function checkChangelog(options = {}) {
  const rootDirectory = options.cwd || process.cwd();
  const changelogPath = path.join(rootDirectory, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) return { exists: false };
  let contents;
  try {
    contents = fs.readFileSync(changelogPath, 'utf8');
  } catch {
    return { exists: false, error: 'Could not read CHANGELOG.md' };
  }
  let recentCommits = [];
  try {
    recentCommits = execFileSync('git', ['log', '--oneline', '-10', 'HEAD'], {
      cwd: rootDirectory,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim().split('\n');
  } catch {}
  const documented = [];
  const undocumented = [];
  for (const commit of recentCommits) {
    if (!commit) continue;
    const message = commit.substring(8);
    if (contents.includes(message) || contents.includes(commit.substring(0, 7))) documented.push(message);
    else if (/^(feat|fix|breaking)/i.test(message)) undocumented.push(message);
  }
  return {
    exists: true,
    hasUnreleased: contents.includes('## [Unreleased]'),
    documented,
    undocumented,
    suggestion: undocumented.length ? `${undocumented.length} commits may need CHANGELOG entries` : null,
  };
}

function resolveRepoStateDirectory(rootDirectory) {
  for (const directory of ['.claude', '.opencode', '.codex']) {
    if (fs.existsSync(path.join(rootDirectory, directory))) return directory;
  }
  return '.claude';
}

function resolveRepoMapFile(rootDirectory) {
  return path.join(rootDirectory, resolveRepoStateDirectory(rootDirectory), 'repo-intel.json');
}

function loadRepoMap(rootDirectory) {
  const mapFile = resolveRepoMapFile(rootDirectory);
  if (!fs.existsSync(mapFile)) return { available: false, map: null, fallbackReason: 'repo-map-not-initialized' };
  try {
    return { available: true, map: JSON.parse(fs.readFileSync(mapFile, 'utf8')), fallbackReason: null };
  } catch {
    return { available: false, map: null, fallbackReason: 'repo-map-load-failed' };
  }
}

function isInternalExport(name, filePath) {
  if (name.startsWith('_')) return true;
  const normalizedPath = filePath.toLowerCase().replace(/\\/g, '/');
  const internalDirectories = ['internal', 'private', 'utils', 'helpers', '__tests__', 'test', 'tests'];
  if (internalDirectories.some((directory) => normalizedPath.includes(`/${directory}/`))) return true;
  return /\.(test|spec)\.[jt]sx?$/.test(filePath);
}

function isEntryPoint(filePath) {
  return ['index', 'main', 'app', 'server', 'cli', 'bin']
    .includes(path.basename(filePath).replace(/\.[^.]+$/, '').toLowerCase());
}

function findUndocumentedExports(changedFiles, options = {}) {
  const rootDirectory = options.cwd || process.cwd();
  const repoMapStatus = options.repoMapStatus || loadRepoMap(rootDirectory);
  if (!repoMapStatus.available || !repoMapStatus.map) return [];
  const documentation = findMarkdownFiles(rootDirectory)
    .map((file) => readTextFile(file, rootDirectory) || '')
    .join('\n');
  const findings = [];
  for (const changedFile of changedFiles) {
    const normalizedPath = changedFile.replace(/\\/g, '/').replace(/^\.\//, '');
    const file = repoMapStatus.map.files?.[normalizedPath] || repoMapStatus.map.files?.[`./${normalizedPath}`];
    for (const exportedSymbol of file?.symbols?.exports || []) {
      if (isInternalExport(exportedSymbol.name, normalizedPath) || isEntryPoint(normalizedPath)) continue;
      if (!new RegExp(`\\b${escapeRegex(exportedSymbol.name)}\\b`).test(documentation)) {
        findings.push({
          type: 'undocumented-export',
          severity: 'low',
          file: normalizedPath,
          name: exportedSymbol.name,
          line: exportedSymbol.line || 0,
          kind: exportedSymbol.kind || 'export',
          certainty: 'MEDIUM',
          suggestion: `Export '${exportedSymbol.name}' in ${normalizedPath} is not mentioned in any documentation`,
        });
      }
    }
  }
  return findings;
}

function collectDocumentationPatterns(options = {}) {
  const settings = { cwd: process.cwd(), ...options };
  const changedFiles = settings.changedFiles || [];
  const repoMap = loadRepoMap(settings.cwd);
  return {
    relatedDocs: findRelatedDocs(changedFiles, settings),
    changelog: checkChangelog(settings),
    markdownFiles: findMarkdownFiles(settings.cwd),
    repoMap: {
      available: repoMap.available,
      fallbackReason: repoMap.fallbackReason,
      stats: repoMap.map ? {
        files: Object.keys(repoMap.map.files || {}).length,
        symbols: repoMap.map.stats?.totalSymbols || 0,
      } : null,
    },
    undocumentedExports: repoMap.available
      ? findUndocumentedExports(changedFiles, { ...settings, repoMapStatus: repoMap })
      : [],
  };
}

function getAnalyzerRunner(options = {}) {
  if (options.analyzer && typeof options.analyzer.runAnalyzer === 'function') return options.analyzer;
  if (typeof options.runAnalyzer === 'function') return { runAnalyzer: options.runAnalyzer };
  try {
    const agentsys = require('../agentsys').get();
    if (agentsys?.binary) return agentsys.binary;
  } catch {}
  return null;
}

function collectGitData(options = {}) {
  const settings = { top: 20, adjustForAi: false, cwd: process.cwd(), ...options };
  const analyzer = getAnalyzerRunner(settings);
  if (!analyzer) return { available: false, error: 'Binary not available: analyzer binary unavailable' };
  let analysis;
  try {
    analysis = JSON.parse(analyzer.runAnalyzer(['repo-intel', 'init', settings.cwd]));
  } catch (error) {
    return { available: false, error: `Git analysis failed: ${error.message}` };
  }
  const fileActivity = analysis.fileActivity || {};
  const contributors = Object.entries(analysis.contributors?.humans || {})
    .map(([name, details]) => ({
      name,
      commits: details.commitCount || 0,
      firstSeen: details.firstSeen || null,
      lastSeen: details.lastSeen || null,
    }))
    .sort((left, right) => right.commits - left.commits);
  const totalContributorCommits = contributors.reduce((total, contributor) => total + contributor.commits, 0);
  let accumulatedCommits = 0;
  let busFactor = 0;
  for (const contributor of contributors) {
    accumulatedCommits += contributor.commits;
    busFactor++;
    if (accumulatedCommits >= totalContributorCommits * 0.8) break;
  }
  const aiAttribution = analysis.aiAttribution || {};
  const totalCommits = analysis.git?.totalCommitsAnalyzed || totalContributorCommits;
  const aiCommits = (aiAttribution.attributed || 0) + (aiAttribution.heuristic || 0);
  const aiRatio = totalCommits > 0 ? Math.round((aiCommits / totalCommits) * 100) / 100 : 0;
  const releases = analysis.releases || {};
  return {
    available: true,
    health: {
      active: contributors.length > 0,
      busFactor,
      aiRatio,
      totalCommits,
      totalContributors: contributors.length,
    },
    hotspots: Object.entries(fileActivity)
      .map(([filePath, details]) => ({
        path: filePath,
        changes: details.totalChanges || 0,
        recentChanges: details.recentChanges || 0,
        authors: details.authors ? Object.keys(details.authors).length : 0,
        lastChanged: details.lastChanged || null,
      }))
      .sort((left, right) => right.changes - left.changes)
      .slice(0, settings.top),
    contributors: contributors.slice(0, 10),
    aiAttribution: {
      ratio: aiRatio,
      attributed: aiAttribution.attributed || 0,
      heuristic: aiAttribution.heuristic || 0,
      none: aiAttribution.none || 0,
      confidence: aiAttribution.confidence || 'low',
      tools: aiAttribution.tools || {},
    },
    busFactor,
    conventions: {
      style: analysis.conventions?.style || null,
      prefixes: analysis.conventions?.prefixes || {},
      usesScopes: analysis.conventions?.usesScopes || false,
    },
    releaseInfo: {
      tagCount: releases.tags?.length || 0,
      lastRelease: releases.tags?.length ? releases.tags[releases.tags.length - 1] : null,
      cadence: releases.cadence || null,
    },
  };
}

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

function emptyAnalyzerResult(rootDirectory, reason) {
  return {
    available: false,
    reason,
    queryErrors: [],
    mapFile: resolveRepoMapFile(rootDirectory),
    staleDocs: null,
    staleDocsByKey: null,
    staleDocsByDoc: null,
    docDrift: null,
    docDriftAll: null,
    entryPoints: null,
    entryPointSet: null,
    entryPointSymbols: null,
    slopFixes: null,
    orphanExports: null,
    passthroughWrappers: null,
    alwaysTrueConditions: null,
    commentedOutCode: null,
    staleSuppressions: null,
  };
}

function collectAnalyzerQueries(options = {}) {
  const settings = { cwd: process.cwd(), ...options };
  const analyzer = getAnalyzerRunner(settings);
  if (!analyzer) return emptyAnalyzerResult(settings.cwd, 'analyzer-binary-unavailable');
  const mapFile = resolveRepoMapFile(settings.cwd);
  if (!fs.existsSync(mapFile)) return emptyAnalyzerResult(settings.cwd, 'repo-intel-map-missing');
  const queryErrors = [];
  function query(name, args) {
    try {
      return JSON.parse(analyzer.runAnalyzer(args));
    } catch {
      queryErrors.push(name);
      return null;
    }
  }
  const staleDocs = asArray(query('stale-docs', [
    'repo-intel', 'query', 'stale-docs', '--top', String(settings.staleDocsTop ?? 500),
    '--map-file', mapFile, settings.cwd,
  ]));
  const docDriftAll = asArray(query('doc-drift', [
    'repo-intel', 'query', 'doc-drift', '--top', String(settings.docDriftTop ?? 50),
    '--map-file', mapFile, settings.cwd,
  ]));
  const entryPoints = asArray(query('entry-points', [
    'repo-intel', 'query', 'entry-points', '--map-file', mapFile, settings.cwd,
  ]));
  const slopResult = query('slop-fixes', [
    'repo-intel', 'query', 'slop-fixes', '--map-file', mapFile, settings.cwd,
  ]);
  const slopFixes = Array.isArray(slopResult) ? slopResult : asArray(slopResult?.fixes);
  const staleDocsByKey = new Map();
  const staleDocsByDoc = new Map();
  for (const finding of staleDocs) {
    finding.doc = normalizePath(finding.doc);
    staleDocsByKey.set(`${finding.doc}:${finding.line}:${finding.reference}`, finding);
    if (!staleDocsByDoc.has(finding.doc)) staleDocsByDoc.set(finding.doc, []);
    staleDocsByDoc.get(finding.doc).push(finding);
  }
  const entryPointSet = new Set();
  const entryPointSymbols = new Set();
  for (const entryPoint of entryPoints) {
    const normalizedPath = normalizePath(entryPoint.path);
    if (normalizedPath) entryPointSet.add(normalizedPath);
    if (entryPoint.name && normalizedPath) entryPointSymbols.add(`${normalizedPath}:${entryPoint.name}`);
  }
  const ignorePatterns = settings.docDriftIgnore || DEFAULT_DOC_DRIFT_IGNORE;
  const docDrift = docDriftAll.filter((finding) => !ignorePatterns.some((pattern) => pattern.test(normalizePath(finding.path))));
  const categories = {
    'orphan-export': 'orphanExports',
    'passthrough-wrapper': 'passthroughWrappers',
    'always-true-condition': 'alwaysTrueConditions',
    'commented-out-code': 'commentedOutCode',
    'stale-suppression': 'staleSuppressions',
  };
  const grouped = {
    orphanExports: [],
    passthroughWrappers: [],
    alwaysTrueConditions: [],
    commentedOutCode: [],
    staleSuppressions: [],
  };
  for (const finding of slopFixes) {
    const destination = categories[finding.category];
    if (destination) grouped[destination].push(finding);
  }
  const available = queryErrors.length < 4;
  return {
    available,
    reason: available ? null : 'all-queries-failed',
    queryErrors,
    mapFile,
    staleDocs,
    staleDocsByKey,
    staleDocsByDoc,
    docDrift,
    docDriftAll,
    entryPoints,
    entryPointSet,
    entryPointSymbols,
    slopFixes,
    ...grouped,
  };
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizePath(value) {
  return (value || '').replace(/\\/g, '/');
}

function collectAllData(options = {}) {
  const sources = options.sources || options.collectors || DEFAULT_OPTIONS.sources;
  const settings = { ...DEFAULT_OPTIONS, ...options, collectors: sources };
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
  if (sources.includes('analyzer')) {
    result.analyzer = collectAnalyzerQueries(settings);
    settings.analyzer = result.analyzer;
  }
  if (sources.includes('github')) result.github = scanGitHubState(settings);
  if (sources.includes('docs')) result.docs = analyzeDocumentation(settings);
  if (sources.includes('code')) result.code = scanCodebase(settings);
  if (sources.includes('docs-patterns')) result.docsPatterns = collectDocumentationPatterns(settings);
  if (sources.includes('git')) result.git = collectGitData(settings);
  return result;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

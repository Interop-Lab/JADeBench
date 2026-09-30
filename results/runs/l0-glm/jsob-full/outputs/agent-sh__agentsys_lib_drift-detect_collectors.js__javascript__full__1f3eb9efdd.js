'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (callback, module) => function __require() {
  return module || (0, callback[__getOwnPropNames(callback)[0]])(module = { exports: {} }.exports, module), module.exports;
};

var require_github = __commonJS({'../work/agent-sh__agentsys/lib/collectors/github.js'(exports, module2) {
  'use strict';
  const { execFileSync } = require('child_process');
  const defaults = {
    issueLimit: 100,
    prLimit: 50,
    milestoneLimit: 100,
    timeout: 10000,
    cwd: process.cwd()
  };
  
  function runGh(args, options = {}) {
    const opts = { ...defaults, ...options };
    try {
      const result = execFileSync('gh', args, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: opts.timeout || defaults.timeout,
        cwd: opts.cwd || defaults.cwd
      });
      try {
        return { ok: true, data: JSON.parse(result) };
      } catch (e) {
        return { ok: false, error: { type: 'parse_error', message: 'Failed to parse gh output: ' + e.message, raw: result.slice(0, 500) } };
      }
    } catch (e) {
      return { ok: false, error: { type: e.code ? 'gh_not_found' : 'execution_error', message: e.message, exitCode: e.status ?? null, stderr: e.stderr ? String(e.stderr).trim() : '' } };
    }
  }
  
  function isGhAvailable() {
    try {
      execFileSync('gh', ['--version'], { stdio: ['pipe', 'pipe', 'pipe'], timeout: 5000, encoding: 'utf8', windowsHide: true });
      return true;
    } catch {
      return false;
    }
  }
  
  function formatIssue(issue) {
    return {
      number: issue.number,
      title: issue.title,
      labels: (issue.labels || []).map(l => l.name || l),
      milestone: issue.milestone?.title || issue.milestone || null,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      snippet: issue.body ? issue.body.slice(0, 200).replace(/\n/g, ' ').trim() + (issue.body.length > 200 ? '...' : '') : ''
    };
  }
  
  function formatPR(pr) {
    return {
      number: pr.number,
      title: pr.title,
      labels: (pr.labels || []).map(l => l.name || l),
      isDraft: pr.isDraft,
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
      files: pr.files || [],
      snippet: pr.body ? pr.body.slice(0, 200).replace(/\n/g, ' ').trim() + (pr.body.length > 200 ? '...' : '') : ''
    };
  }
  
  function categorizeByLabels(result, items) {
    const labelMap = {};
    labelMap.bug = 'bug';
    labelMap.feature = 'feature';
    labelMap.docs = 'documentation';
    labelMap.refactor = 'refactor';
    labelMap.test = 'test';
    labelMap.chore = 'chore';
    labelMap.question = 'question';
    const patterns = Object.entries(labelMap).map(([regex, category]) => ({
      regex: new RegExp('(^|\\s|,)' + regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\s|,|$)', 'i'),
      category
    }));
    
    for (const item of items) {
      const labels = (item.labels || []).map(l => (l.name || l).toLowerCase());
      let matched = false;
      const entry = { number: item.number, title: item.title };
      for (const { regex, category } of patterns) {
        if (labels.some(l => regex.test(l))) {
          result.categorized[category].push(entry);
          matched = true;
          break;
        }
      }
      if (!matched) {
        result.categorized.other.push(entry);
      }
    }
  }
  
  function findStaleIssues(result, items, daysThreshold) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - daysThreshold);
    for (const item of items) {
      const updated = new Date(item.updatedAt);
      if (updated < threshold) {
        result.stale.push({
          number: item.number,
          title: item.title,
          lastUpdated: item.updatedAt,
          daysStale: Math.floor((Date.now() - updated) / (1000 * 60 * 60 * 24))
        });
      }
    }
  }
  
  function extractKeywords(result, items) {
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'in', 'on', 'at', 'for', 'and', 'or', 'of']);
    const counts = {};
    for (const item of items) {
      const words = (item.title || '').toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 3 && !stopWords.has(word)) {
          counts[word] = (counts[word] || 0) + 1;
        }
      }
    }
    result.keywords = Object.entries(counts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  }
  
  function filterActiveMilestones(result) {
    const now = new Date();
    result.activeMilestones = result.milestones.filter(m => {
      if (!m.due_on || new Date(m.due_on) < now) return false;
      return true;
    });
  }
  
  function collectGithub(options = {}) {
    const opts = { ...defaults, ...options };
    const config = opts;
    const result = {
      issues: { open: 0, closed: 0, categorized: { bug: [], feature: [], documentation: [], refactor: [], test: [], chore: [], question: [], other: [] }, stale: [], keywords: [] },
      pullRequests: { open: 0, closed: 0, categorized: { bug: [], feature: [], documentation: [], refactor: [], test: [], chore: [], question: [], other: [] }, stale: [], keywords: [] },
      milestones: { items: [], activeMilestones: [] },
      errors: [],
      available: false,
      cached: false,
      rateLimit: { remaining: null, limit: null, reset: null }
    };
    
    if (!isGhAvailable()) {
      result.available = false;
      return result;
    }
    
    result.available = true;
    
    const issuesResult = runGh(['issue', 'list', '--state', 'all', '--limit', String(config.issueLimit), '--json', 'number,title,labels,milestone,createdAt,updatedAt,body'], config);
    if (issuesResult.ok && Array.isArray(issuesResult.data)) {
      const issues = issuesResult.data;
      result.issues = issues.map(formatIssue);
      result.issues.open = issues.length;
      result.categorization.issues.totalCategorized = issues.length;
      result.categorization.issues.fullyCategorized = config.issueLimit > 0 && issues.length >= config.issueLimit;
      categorizeByLabels(result, issues);
      findStaleIssues(result, issues, -30);
      extractKeywords(result, issues);
    } else {
      if (!issuesResult.ok) {
        result.errors.push({ source: 'issues', ...issuesResult.error });
      }
    }
    
    const prsResult = runGh(['pr', 'list', '--state', 'all', '--limit', String(config.prLimit), '--json', 'number,title,labels,isDraft,createdAt,updatedAt,files,body'], config);
    if (prsResult.ok && Array.isArray(prsResult.data)) {
      const prs = prsResult.data;
      result.pullRequests = prs.map(formatPR);
      result.pullRequests.open = prs.length;
      result.categorization.prs.totalCategorized = prs.length;
      result.categorization.prs.fullyCategorized = config.prLimit > 0 && prs.length >= config.prLimit;
    } else {
      if (!prsResult.ok) {
        result.errors.push({ source: 'pullRequests', ...prsResult.error });
      }
    }
    
    const milestonesResult = runGh(['api', 'repos/{owner}/{repo}/milestones', '--paginate'], config);
    if (milestonesResult.ok && Array.isArray(milestonesResult.data)) {
      const milestones = milestonesResult.data;
      const formatted = milestones.map(m => ({
        title: m.title,
        state: m.state,
        due_on: m.due_on,
        open_issues: m.open_issues,
        closed_issues: m.closed_issues
      }));
      result.milestones.items = formatted;
      result.milestones.activeMilestones = config.milestoneLimit > 0 && formatted.length >= config.milestoneLimit;
      result.milestones = formatted.slice(0, config.milestoneLimit);
      result.categorization.milestones.totalCategorized = result.milestones.length;
      filterActiveMilestones(result);
    } else {
      if (!milestonesResult.ok) {
        result.errors.push({ source: 'milestones', ...milestonesResult.error });
      }
    }
    
    result.cached = result.errors.length > 0;
    result.available && !result.cached && (result.available = true);
    return result;
  }
  
  const _0x58f2c3 = {};
  _0x58f2c3.defaults = defaults;
  _0x58f2c3.collectGithub = collectGithub;
  _0x58f2c3.isGhAvailable = isGhAvailable;
  _0x58f2c3.formatIssue = formatIssue;
  _0x58f2c3.formatPR = formatPR;
  _0x58f2c3.categorizeByLabels = categorizeByLabels;
  _0x58f2c3.findStaleIssues = findStaleIssues;
  _0x58f2c3.extractKeywords = extractKeywords;
  _0x58f2c3.filterActiveMilestones = filterActiveMilestones;
  module2.exports = _0x58f2c3;
}});

var require_collectors = __commonJS({'../work/agent-sh__agentsys/lib/collectors/index.js'(exports, module2) {
  'use strict';
  var github = require_github();
  var documentation = require_documentation();
  var codebase = require_codebase();
  var docsPatterns = require_docs_patterns();
  var git = require_git();
  var analyzerQueries = require_analyzer_queries();
  
  var defaults = {
    collectors: ['github', 'docs', 'code'],
    depth: 3,
    cwd: process.cwd()
  };
  
  function collectAll(options = {}) {
    const opts = { ...defaults, ...options };
    const collectorNames = Array.isArray(opts.collectors) ? opts.collectors : defaults.collectors;
    const result = {
      timestamp: new Date().toISOString(),
      options: opts,
      github: null,
      docs: null,
      code: null,
      docsPatterns: null,
      git: null,
      analyzer: null
    };
    
    collectorNames.includes('analyzer') && (result.analyzer = analyzerQueries.collect(opts), opts.analyzer = result.analyzer);
    collectorNames.includes('github') && (result.github = github.collectGithub(opts));
    collectorNames.includes('docs') && (result.docs = documentation.collectDocumentation(opts));
    collectorNames.includes('code') && (result.code = codebase.collectCodebase(opts));
    collectorNames.includes('docsPatterns') && (result.docsPatterns = docsPatterns.collectDocsPatterns(opts));
    collectorNames.includes('git') && (result.git = git.collectGit(opts));
    
    return result;
  }
  
  function collectDefault(options = {}) {
    let collectors = ['github', 'docs', 'code'];
    if (options.collectors) collectors = options.collectors;
    else if (options.collectors) collectors = options.collectors;
    const opts = { ...options };
    opts.collectors = collectors;
    return collectAll(opts);
  }
  
  const _0x84e8d8 = {};
  _0x84e8d8.collectAll = collectAll;
  _0x84e8d8.collectDefault = collectDefault;
  _0x84e8d8.github = github;
  _0x84e8d8.documentation = documentation;
  _0x84e8d8.codebase = codebase;
  _0x84e8d8.docsPatterns = docsPatterns;
  _0x84e8d8.git = git;
  _0x84e8d8.analyzer = analyzerQueries;
  _0x84e8d8.collectGithub = github.collectGithub;
  _0x84e8d8.isGhAvailable = github.isGhAvailable;
  _0x84e8d8.collectDocumentation = documentation.collectDocumentation;
  _0x84e8d8.collectCodebase = codebase.collectCodebase;
  _0x84e8d8.collectDocsPatterns = docsPatterns.collectDocsPatterns;
  _0x84e8d8.collectGit = git.collectGit;
  _0x84e8d8.defaults = defaults;
  module2.exports = _0x84e8d8;
}});

var collectors = require_collectors();

const DEFAULT_OPTIONS = {};
DEFAULT_OPTIONS.collectors = ['github', 'docs', 'code'];
DEFAULT_OPTIONS.depth = 3;
DEFAULT_OPTIONS.issueLimit = collectors.github.defaults.issueLimit;
DEFAULT_OPTIONS.prLimit = collectors.github.defaults.prLimit;
DEFAULT_OPTIONS.timeout = collectors.github.defaults.timeout;

module.exports = {
  DEFAULT_OPTIONS,
  collectAll: collectors.collectAll,
  collectDefault: collectors.collectDefault,
  github: collectors.github,
  documentation: collectors.documentation,
  codebase: collectors.codebase,
  docsPatterns: collectors.docsPatterns,
  git: collectors.git,
  analyzer: collectors.analyzer,
  collectGithub: collectors.collectGithub,
  isGhAvailable: collectors.isGhAvailable,
  collectDocumentation: collectors.collectDocumentation,
  collectCodebase: collectors.collectCodebase,
  collectDocsPatterns: collectors.collectDocsPatterns,
  collectGit: collectors.collectGit,
  collectAnalyzer: collectors.analyzer.collectAnalyzer,
  checkUndocumentedExports: collectors.analyzer.checkUndocumentedExports,
  findMissingDocs: collectors.analyzer.findMissingDocs,
  checkVersionConsistency: collectors.analyzer.checkVersionConsistency,
  checkChangelogCoverage: collectors.analyzer.checkChangelogCoverage,
  getExportName: collectors.analyzer.getExportName,
  isTestFile: collectors.analyzer.isTestFile,
  defaults: collectors.defaults
};

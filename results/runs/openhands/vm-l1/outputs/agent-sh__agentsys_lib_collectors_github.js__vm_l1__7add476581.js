'use strict';

const { execFileSync } = require('child_process');

const DEFAULT_OPTIONS = {
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10_000,
  cwd: process.cwd(),
};

function execGhWithResult(args, options = {}) {
  try {
    const raw = execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: options.timeout || DEFAULT_OPTIONS.timeout,
      cwd: options.cwd || DEFAULT_OPTIONS.cwd,
    });

    try {
      return {
        ok: true,
        data: JSON.parse(raw),
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'parse',
          message: `Failed to parse gh output as JSON: ${error.message}`,
          raw: raw.slice(0, 500),
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

function execGh(args, options = {}) {
  const result = execGhWithResult(args, options);
  return result.ok ? result.data : null;
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
    snippet: issue.body
      ? issue.body.slice(0, 200).replace(/\n/g, ' ').trim() +
        (issue.body.length > 200 ? '...' : '')
      : '',
  };
}

function summarizePR(pullRequest) {
  return {
    number: pullRequest.number,
    title: pullRequest.title,
    labels: (pullRequest.labels || []).map((label) => label.name || label),
    isDraft: pullRequest.isDraft,
    createdAt: pullRequest.createdAt,
    updatedAt: pullRequest.updatedAt,
    files: pullRequest.files || [],
    snippet: pullRequest.body
      ? pullRequest.body.slice(0, 150).replace(/\n/g, ' ').trim() +
        (pullRequest.body.length > 150 ? '...' : '')
      : '',
  };
}

function categorizeIssues(report, issues) {
  const categoryByLabel = {
    bug: 'bugs',
    'type: bug': 'bugs',
    feature: 'features',
    'type: feature': 'features',
    enhancement: 'enhancements',
    security: 'security',
    'type: security': 'security',
  };
  const categoryPatterns = Object.entries(categoryByLabel).map(
    ([label, category]) => ({
      regex: new RegExp(
        `(^|[^a-z])${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`,
        'i',
      ),
      category,
    }),
  );

  for (const issue of issues) {
    const labels = (issue.labels || []).map((label) =>
      (label.name || label).toLowerCase(),
    );
    const summary = { number: issue.number, title: issue.title };
    let categorized = false;

    for (const { regex, category } of categoryPatterns) {
      if (labels.some((label) => regex.test(label))) {
        report.categorized[category].push(summary);
        categorized = true;
        break;
      }
    }

    if (!categorized) report.categorized.other.push(summary);
  }
}

function findStaleItems(report, items, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  for (const item of items) {
    const updatedAt = new Date(item.updatedAt);
    if (updatedAt < cutoff) {
      report.stale.push({
        number: item.number,
        title: item.title,
        lastUpdated: item.updatedAt,
        daysStale: Math.floor(
          (Date.now() - updatedAt) / (1_000 * 60 * 60 * 24),
        ),
      });
    }
  }
}

function extractThemes(report, items) {
  const counts = {};
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'is',
    'are',
    'to',
    'for',
    'in',
    'on',
    'at',
    'with',
    'and',
    'or',
    'of',
  ]);

  for (const item of items) {
    const words = (item.title || '').toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && !stopWords.has(word)) {
        counts[word] = (counts[word] || 0) + 1;
      }
    }
  }

  report.themes = Object.entries(counts)
    .filter(([, count]) => count > 1)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

function findOverdueMilestones(report) {
  const now = new Date();
  report.overdueMilestones = report.milestones.filter((milestone) => {
    if (!milestone.due_on || milestone.state === 'closed') return false;
    return new Date(milestone.due_on) < now;
  });
}

function createInitialReport(options) {
  return {
    available: false,
    partial: false,
    errors: [],
    summary: {
      issueCount: 0,
      prCount: 0,
      milestoneCount: 0,
    },
    issues: [],
    prs: [],
    milestones: [],
    overdueMilestones: [],
    pagination: {
      issues: {
        requestedLimit: options.issueLimit,
        fetchedCount: 0,
        hasMore: false,
      },
      prs: {
        requestedLimit: options.prLimit,
        fetchedCount: 0,
        hasMore: false,
      },
      milestones: {
        requestedLimit: options.milestoneLimit,
        fetchedCount: 0,
        hasMore: false,
      },
    },
    categorized: {
      bugs: [],
      features: [],
      security: [],
      enhancements: [],
      other: [],
    },
    stale: [],
    themes: [],
  };
}

function addResultError(report, source, result) {
  if (!result.ok) report.errors.push({ source, ...result.error });
}

function scanGitHubState(options = {}) {
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };
  const report = createInitialReport(resolvedOptions);

  if (!isGhAvailable()) {
    report.error = 'gh CLI not available or not authenticated';
    return report;
  }
  report.available = true;

  const issueResult = execGhWithResult(
    [
      'issue',
      'list',
      '--state',
      'open',
      '--json',
      'number,title,labels,milestone,createdAt,updatedAt,body',
      '--limit',
      String(resolvedOptions.issueLimit),
    ],
    resolvedOptions,
  );
  if (issueResult.ok && Array.isArray(issueResult.data)) {
    const issues = issueResult.data;
    report.issues = issues.map(summarizeIssue);
    report.summary.issueCount = issues.length;
    report.pagination.issues.fetchedCount = issues.length;
    report.pagination.issues.hasMore =
      resolvedOptions.issueLimit > 0 &&
      issues.length >= resolvedOptions.issueLimit;
    categorizeIssues(report, issues);
    findStaleItems(report, issues, 90);
    extractThemes(report, issues);
  } else {
    addResultError(report, 'issues', issueResult);
  }

  const pullRequestResult = execGhWithResult(
    [
      'pr',
      'list',
      '--state',
      'open',
      '--json',
      'number,title,labels,isDraft,createdAt,updatedAt,body,files',
      '--limit',
      String(resolvedOptions.prLimit),
    ],
    resolvedOptions,
  );
  if (pullRequestResult.ok && Array.isArray(pullRequestResult.data)) {
    const pullRequests = pullRequestResult.data;
    report.prs = pullRequests.map(summarizePR);
    report.summary.prCount = pullRequests.length;
    report.pagination.prs.fetchedCount = pullRequests.length;
    report.pagination.prs.hasMore =
      resolvedOptions.prLimit > 0 &&
      pullRequests.length >= resolvedOptions.prLimit;
  } else {
    addResultError(report, 'prs', pullRequestResult);
  }

  const milestoneResult = execGhWithResult(
    ['api', 'repos/{owner}/{repo}/milestones', '--paginate', '--slurp'],
    resolvedOptions,
  );
  if (milestoneResult.ok && Array.isArray(milestoneResult.data)) {
    const milestones = milestoneResult.data
      .flatMap((page) => (Array.isArray(page) ? page : []))
      .map((milestone) => ({
        title: milestone.title,
        state: milestone.state,
        due_on: milestone.due_on,
        open_issues: milestone.open_issues,
        closed_issues: milestone.closed_issues,
      }));

    report.pagination.milestones.fetchedCount = milestones.length;
    report.pagination.milestones.hasMore =
      resolvedOptions.milestoneLimit > 0 &&
      milestones.length > resolvedOptions.milestoneLimit;
    report.milestones = milestones.slice(0, resolvedOptions.milestoneLimit);
    report.summary.milestoneCount = report.milestones.length;
    findOverdueMilestones(report);
  } else {
    addResultError(report, 'milestones', milestoneResult);
  }

  report.partial = report.errors.length > 0;
  if (report.partial && !report.error) {
    report.error = 'Partial GitHub data collected';
  }
  return report;
}

globalThis.scanGitHubState = scanGitHubState;
globalThis.findOverdueMilestones = findOverdueMilestones;
globalThis.extractThemes = extractThemes;
globalThis.findStaleItems = findStaleItems;
globalThis.categorizeIssues = categorizeIssues;
globalThis.summarizePR = summarizePR;
globalThis.summarizeIssue = summarizeIssue;
globalThis.isGhAvailable = isGhAvailable;
globalThis.execGhWithResult = execGhWithResult;
globalThis.execGh = execGh;
globalThis.execFileSync = execFileSync;
globalThis.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = {
  DEFAULT_OPTIONS,
  scanGitHubState,
  isGhAvailable,
  execGh,
  summarizeIssue,
  summarizePR,
  categorizeIssues,
  findStaleItems,
  extractThemes,
  findOverdueMilestones,
};

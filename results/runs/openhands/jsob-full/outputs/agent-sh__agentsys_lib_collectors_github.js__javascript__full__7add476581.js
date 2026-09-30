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
    const output = execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: options.timeout || DEFAULT_OPTIONS.timeout,
      cwd: options.cwd || DEFAULT_OPTIONS.cwd,
    });

    try {
      return {
        ok: true,
        data: JSON.parse(output),
      };
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
    snippet: issue.body
      ? issue.body.slice(0, 200).replace(/\n/g, ' ').trim()
        + (issue.body.length > 200 ? '...' : '')
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
      ? pullRequest.body.slice(0, 150).replace(/\n/g, ' ').trim()
        + (pullRequest.body.length > 150 ? '...' : '')
      : '',
  };
}

function categorizeIssues(result, issues) {
  const labelCategories = {
    bug: 'bugs',
    'type: bug': 'bugs',
    feature: 'features',
    'type: feature': 'features',
    enhancement: 'enhancements',
    security: 'security',
    'type: security': 'security',
  };
  const categoryMatchers = Object.entries(labelCategories).map(([label, category]) => ({
    regex: new RegExp(
      '(^|[^a-z])' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z]|$)',
      'i',
    ),
    category,
  }));

  for (const issue of issues) {
    const labels = (issue.labels || []).map((label) => (label.name || label).toLowerCase());
    const summary = {
      number: issue.number,
      title: issue.title,
    };
    let categorized = false;

    for (const { regex, category } of categoryMatchers) {
      if (labels.some((label) => regex.test(label))) {
        result.categorized[category].push(summary);
        categorized = true;
        break;
      }
    }

    if (!categorized) {
      result.categorized.other.push(summary);
    }
  }
}

function findStaleItems(result, items, staleAfterDays) {
  const staleBefore = new Date();
  staleBefore.setDate(staleBefore.getDate() - staleAfterDays);

  for (const item of items) {
    const updatedAt = new Date(item.updatedAt);
    if (updatedAt < staleBefore) {
      result.stale.push({
        number: item.number,
        title: item.title,
        lastUpdated: item.updatedAt,
        daysStale: Math.floor((Date.now() - updatedAt) / (1_000 * 60 * 60 * 24)),
      });
    }
  }
}

function extractThemes(result, issues) {
  const wordCounts = {};
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'to', 'for', 'in', 'on', 'at', 'with', 'and', 'or', 'of',
  ]);

  for (const issue of issues) {
    const words = (issue.title || '').toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && !stopWords.has(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    }
  }

  result.themes = Object.entries(wordCounts)
    .filter(([, count]) => count > 1)
    .sort((first, second) => second[1] - first[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

function findOverdueMilestones(result) {
  const now = new Date();
  result.overdueMilestones = result.milestones.filter((milestone) => (
    milestone.due_on
    && milestone.state !== 'closed'
    && new Date(milestone.due_on) < now
  ));
}

function scanGitHubState(options = {}) {
  const settings = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  const issuePagination = {
    requestedLimit: settings.issueLimit,
    fetchedCount: 0,
    hasMore: false,
  };
  const pullRequestPagination = {
    requestedLimit: settings.prLimit,
    fetchedCount: 0,
    hasMore: false,
  };
  const milestonePagination = {
    requestedLimit: settings.milestoneLimit,
    fetchedCount: 0,
    hasMore: false,
  };
  const pagination = {
    issues: issuePagination,
    prs: pullRequestPagination,
    milestones: milestonePagination,
  };
  const result = {
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
  };
  result.pagination = pagination;
  result.categorized = {
    bugs: [],
    features: [],
    security: [],
    enhancements: [],
    other: [],
  };
  result.stale = [];
  result.themes = [];

  if (!isGhAvailable()) {
    result.error = 'gh CLI not available or not authenticated';
    return result;
  }

  result.available = true;

  const issuesResponse = execGhWithResult([
    'issue',
    'list',
    '--state',
    'open',
    '--json',
    'number,title,labels,milestone,createdAt,updatedAt,body',
    '--limit',
    String(settings.issueLimit),
  ], settings);

  if (issuesResponse.ok && Array.isArray(issuesResponse.data)) {
    const issues = issuesResponse.data;
    result.issues = issues.map(summarizeIssue);
    result.summary.issueCount = issues.length;
    result.pagination.issues.fetchedCount = issues.length;
    result.pagination.issues.hasMore = settings.issueLimit > 0
      && issues.length >= settings.issueLimit;
    categorizeIssues(result, issues);
    findStaleItems(result, issues, 90);
    extractThemes(result, issues);
  } else if (!issuesResponse.ok) {
    result.errors.push({
      source: 'issues',
      ...issuesResponse.error,
    });
  }

  const pullRequestsResponse = execGhWithResult([
    'pr',
    'list',
    '--state',
    'open',
    '--json',
    'number,title,labels,isDraft,createdAt,updatedAt,body,files',
    '--limit',
    String(settings.prLimit),
  ], settings);

  if (pullRequestsResponse.ok && Array.isArray(pullRequestsResponse.data)) {
    const pullRequests = pullRequestsResponse.data;
    result.prs = pullRequests.map(summarizePR);
    result.summary.prCount = pullRequests.length;
    result.pagination.prs.fetchedCount = pullRequests.length;
    result.pagination.prs.hasMore = settings.prLimit > 0
      && pullRequests.length >= settings.prLimit;
  } else if (!pullRequestsResponse.ok) {
    result.errors.push({
      source: 'prs',
      ...pullRequestsResponse.error,
    });
  }

  const milestonesResponse = execGhWithResult([
    'api',
    'repos/{owner}/{repo}/milestones',
    '--paginate',
    '--slurp',
  ], settings);

  if (milestonesResponse.ok && Array.isArray(milestonesResponse.data)) {
    const milestones = milestonesResponse.data
      .flatMap((page) => (Array.isArray(page) ? page : []))
      .map((milestone) => ({
        title: milestone.title,
        state: milestone.state,
        due_on: milestone.due_on,
        open_issues: milestone.open_issues,
        closed_issues: milestone.closed_issues,
      }));
    result.pagination.milestones.fetchedCount = milestones.length;
    result.pagination.milestones.hasMore = settings.milestoneLimit > 0
      && milestones.length > settings.milestoneLimit;
    result.milestones = milestones.slice(0, settings.milestoneLimit);
    result.summary.milestoneCount = result.milestones.length;
    findOverdueMilestones(result);
  } else if (!milestonesResponse.ok) {
    result.errors.push({
      source: 'milestones',
      ...milestonesResponse.error,
    });
  }

  result.partial = result.errors.length > 0;
  if (result.partial && !result.error) {
    result.error = 'Partial GitHub data collected';
  }
  return result;
}

function execGh(args, options = {}) {
  const response = execGhWithResult(args, options);
  return response.ok ? response.data : null;
}

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

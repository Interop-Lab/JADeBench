'use strict';

const { execFileSync } = require('child_process');

const DEFAULT_OPTIONS = {
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10000,
  cwd: process.cwd()
};

function execGh(args, options = {}) {
  const result = execGhWithResult(args, options);
  return result.ok ? result.data : null;
}

function execGhWithResult(args, options = {}) {
  try {
    const output = execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: options.timeout || DEFAULT_OPTIONS.timeout,
      cwd: options.cwd || DEFAULT_OPTIONS.cwd
    });

    try {
      return {
        ok: true,
        data: JSON.parse(output)
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: `Failed to parse GitHub CLI output: ${error.message}`,
          raw: output.slice(0, 500)
        }
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        type: error.killed ? 'timeout' : 'execution_error',
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

function makeSnippet(body, limit) {
  if (!body) {
    return '';
  }

  const snippet = body.slice(0, limit).replace(/\n/g, ' ').trim();
  return snippet + (body.length > limit ? '…' : '');
}

function summarizeIssue(issue) {
  return {
    number: issue.number,
    title: issue.title,
    labels: (issue.labels || []).map(label => label.name || label),
    milestone: issue.milestone?.title || issue.milestone || null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    snippet: makeSnippet(issue.body, 200)
  };
}

function summarizePR(pr) {
  return {
    number: pr.number,
    title: pr.title,
    labels: (pr.labels || []).map(label => label.name || label),
    isDraft: pr.isDraft,
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    files: pr.files || [],
    snippet: makeSnippet(pr.body, 150)
  };
}

function categorizeIssues(result, issues) {
  const labelCategories = {
    bug: 'bugs',
    enhancement: 'features',
    feature: 'features',
    documentation: 'documentation',
    docs: 'documentation',
    dependencies: 'maintenance',
    maintenance: 'maintenance'
  };

  const patterns = Object.entries(labelCategories).map(([label, category]) => ({
    regex: new RegExp(
      `(^|[\\s:/_-])${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s:/_-]|$)`,
      'i'
    ),
    category
  }));

  for (const issue of issues) {
    const labels = (issue.labels || []).map(label =>
      (label.name || label).toLowerCase()
    );

    const summary = {
      number: issue.number,
      title: issue.title
    };

    let categorized = false;

    for (const { regex, category } of patterns) {
      if (labels.some(label => regex.test(label))) {
        result.categorization[category].push(summary);
        categorized = true;
        break;
      }
    }

    if (!categorized) {
      result.categorization.other.push(summary);
    }
  }
}

function findStaleItems(result, items, staleDays) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - staleDays);

  for (const item of items) {
    const updatedAt = new Date(item.updatedAt);

    if (updatedAt < cutoff) {
      result.staleItems.push({
        number: item.number,
        title: item.title,
        lastUpdated: item.updatedAt,
        daysStale: Math.floor(
          (Date.now() - updatedAt) / (1000 * 60 * 60 * 24)
        )
      });
    }
  }
}

function extractThemes(result, items) {
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
    'of'
  ]);

  for (const item of items) {
    const words = (item.title || '').toLowerCase().split(/\s+/);

    for (const word of words) {
      if (word.length > 3 && !stopWords.has(word)) {
        counts[word] = (counts[word] || 0) + 1;
      }
    }
  }

  result.themes = Object.entries(counts)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

function findOverdueMilestones(result) {
  const now = new Date();

  result.overdueMilestones = result.milestones.filter(milestone => {
    if (!milestone.due_on || milestone.state === 'closed') {
      return false;
    }

    return new Date(milestone.due_on) < now;
  });
}

function scanGitHubState(options = {}) {
  const settings = {
    ...DEFAULT_OPTIONS,
    ...options
  };

  const counts = {
    issueCount: 0,
    prCount: 0,
    milestoneCount: 0
  };

  const pagination = {
    issues: {
      requestedLimit: settings.issueLimit,
      returnedCount: 0,
      truncated: false
    },
    pullRequests: {
      requestedLimit: settings.prLimit,
      returnedCount: 0,
      truncated: false
    },
    milestones: {
      requestedLimit: settings.milestoneLimit,
      returnedCount: 0,
      truncated: false
    }
  };

  const result = {
    available: false,
    partial: false,
    errors: [],
    counts,
    issues: [],
    pullRequests: [],
    milestones: [],
    overdueMilestones: [],
    pagination,
    categorization: {
      bugs: [],
      features: [],
      documentation: [],
      maintenance: [],
      other: []
    },
    staleItems: [],
    themes: []
  };

  if (!isGhAvailable()) {
    result.error = 'GitHub CLI is not available';
    return result;
  }

  result.available = true;

  const issuesResult = execGhWithResult(
    [
      'issue',
      'list',
      '--state',
      'open',
      '--json',
      'number,title,labels,milestone,createdAt,updatedAt,body',
      '--limit',
      String(settings.issueLimit)
    ],
    settings
  );

  if (issuesResult.ok && Array.isArray(issuesResult.data)) {
    const issues = issuesResult.data;

    result.issues = issues.map(summarizeIssue);
    result.counts.issueCount = issues.length;
    result.pagination.issues.returnedCount = issues.length;
    result.pagination.issues.truncated =
      settings.issueLimit > 0 && issues.length >= settings.issueLimit;

    categorizeIssues(result, issues);
    findStaleItems(result, issues, 90);
    extractThemes(result, issues);
  } else if (!issuesResult.ok) {
    result.errors.push({
      source: 'issues',
      ...issuesResult.error
    });
  }

  const pullRequestsResult = execGhWithResult(
    [
      'pr',
      'list',
      '--state',
      'open',
      '--json',
      'number,title,labels,isDraft,createdAt,updatedAt,files,body',
      '--limit',
      String(settings.prLimit)
    ],
    settings
  );

  if (pullRequestsResult.ok && Array.isArray(pullRequestsResult.data)) {
    const pullRequests = pullRequestsResult.data;

    result.pullRequests = pullRequests.map(summarizePR);
    result.counts.prCount = pullRequests.length;
    result.pagination.pullRequests.returnedCount = pullRequests.length;
    result.pagination.pullRequests.truncated =
      settings.prLimit > 0 && pullRequests.length >= settings.prLimit;
  } else if (!pullRequestsResult.ok) {
    result.errors.push({
      source: 'pullRequests',
      ...pullRequestsResult.error
    });
  }

  const milestonesResult = execGhWithResult(
    [
      'api',
      'repos/{owner}/{repo}/milestones?state=all&per_page=100',
      '--paginate',
      '--slurp'
    ],
    settings
  );

  if (milestonesResult.ok && Array.isArray(milestonesResult.data)) {
    const rawMilestones = milestonesResult.data.flatMap(page =>
      Array.isArray(page) ? page : []
    );

    const milestones = rawMilestones.map(milestone => ({
      title: milestone.title,
      state: milestone.state,
      due_on: milestone.due_on,
      open_issues: milestone.open_issues,
      closed_issues: milestone.closed_issues
    }));

    result.pagination.milestones.returnedCount = milestones.length;
    result.pagination.milestones.truncated =
      settings.milestoneLimit > 0 &&
      milestones.length >= settings.milestoneLimit;

    result.milestones = milestones.slice(0, settings.milestoneLimit);
    result.counts.milestoneCount = result.milestones.length;

    findOverdueMilestones(result);
  } else if (!milestonesResult.ok) {
    result.errors.push({
      source: 'milestones',
      ...milestonesResult.error
    });
  }

  result.partial = result.errors.length > 0;

  if (result.available && !result.partial) {
    result.status = 'complete';
  }

  return result;
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
  findOverdueMilestones
};

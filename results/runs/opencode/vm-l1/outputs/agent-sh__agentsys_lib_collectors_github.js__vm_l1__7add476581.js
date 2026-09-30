'use strict';

const { execFileSync } = require('child_process');

const DEFAULT_OPTIONS = {
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10_000,
  cwd: process.cwd(),
};

function execGhWithResult(args) {
  try {
    const raw = execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: DEFAULT_OPTIONS.timeout,
      cwd: DEFAULT_OPTIONS.cwd,
    });

    try {
      return { ok: true, data: JSON.parse(raw), raw };
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
        type: 'process',
        message: error.message,
        killed: error.killed,
        exitCode: error.status,
        stderr: String(error.stderr || '').trim(),
      },
    };
  }
}

function execGh(args) {
  const result = execGhWithResult(args);
  if (!result.ok) throw result.error;
  return result.data;
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

function labelNames(labels = []) {
  return labels.map(label => label.name);
}

function makeSnippet(body, maximumLength) {
  if (!body) return '';
  const snippet = body.slice(0, maximumLength).replace(/\n/g, ' ').trim();
  return body.length > maximumLength ? `${snippet}...` : snippet;
}

function summarizeIssue(issue) {
  return {
    number: issue.number,
    title: issue.title,
    labels: labelNames(issue.labels),
    milestone: issue.milestone,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    snippet: makeSnippet(issue.body, 200),
  };
}

function summarizePR(pullRequest) {
  return {
    number: pullRequest.number,
    title: pullRequest.title,
    labels: labelNames(pullRequest.labels),
    isDraft: pullRequest.isDraft,
    createdAt: pullRequest.createdAt,
    updatedAt: pullRequest.updatedAt,
    files: pullRequest.files,
    snippet: makeSnippet(pullRequest.body, 150),
  };
}

const DEFAULT_CATEGORIES = {
  bugs: ['bug', 'type: bug'],
  features: ['feature', 'type: feature'],
  enhancements: ['enhancement'],
  security: ['security', 'type: security'],
};

function categorizeIssues(issues, categories = DEFAULT_CATEGORIES) {
  const categorized = Object.fromEntries(
    Object.entries(categories).map(([category]) => [category, []]),
  );
  categorized.other = [];

  const matchers = Object.entries(categories).map(([category, terms]) => ({
    category,
    regex: new RegExp(
      `(^|[^a-z])(${terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})([^a-z]|$)`,
      'i',
    ),
  }));

  for (const issue of issues) {
    const labels = labelNames(issue.labels).map(name => name.toLowerCase());
    const text = `${issue.title} ${labels.join(' ')}`;
    const match = matchers.find(({ regex }) => regex.test(text));
    categorized[match ? match.category : 'other'].push(issue);
  }

  return { categorized };
}

function findStaleItems(items, days, now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  const stale = [];

  for (const item of items) {
    if (new Date(item.updatedAt) < cutoff) {
      stale.push({
        number: item.number,
        title: item.title,
        lastUpdated: item.updatedAt,
        daysStale: Math.floor((now - new Date(item.updatedAt)) / (1000 * 60 * 60 * 24)),
      });
    }
  }

  return { stale };
}

const THEME_STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'to', 'for', 'in', 'on', 'at', 'with', 'and', 'or', 'of',
]);

function extractThemes(items, limit = 10) {
  const counts = {};
  for (const item of items) {
    for (const word of (item.title || '').toLowerCase().split(/\s+/)) {
      if (word.length > 3 && !THEME_STOP_WORDS.has(word)) {
        counts[word] = (counts[word] || 0) + 1;
      }
    }
  }

  const themes = Object.entries(counts)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));

  return { themes };
}

function findOverdueMilestones(milestones) {
  const now = new Date();
  const overdueMilestones = milestones.filter(milestone => (
    milestone.due_on && milestone.state !== 'closed' && new Date(milestone.due_on) < now
  ));
  return { overdueMilestones };
}

function emptyScanResult(options) {
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
      issues: { requestedLimit: options.issueLimit, fetchedCount: 0, hasMore: false },
      prs: { requestedLimit: options.prLimit, fetchedCount: 0, hasMore: false },
      milestones: { requestedLimit: options.milestoneLimit, fetchedCount: 0, hasMore: false },
    },
    categorized: { bugs: [], features: [], security: [], enhancements: [], other: [] },
    stale: [],
    themes: [],
  };
}

function recordFailure(result, source, error) {
  result.partial = true;
  result.errors.push({ source, ...error });
}

function scanGitHubState() {
  const options = DEFAULT_OPTIONS;
  const result = emptyScanResult(options);

  if (!isGhAvailable()) {
    result.errors.push('gh CLI not available or not authenticated');
    return result;
  }
  result.available = true;

  const issueResult = execGhWithResult([
    'issue', 'list', '--state', 'open', '--json',
    'number,title,labels,milestone,createdAt,updatedAt,body',
    '--limit', String(options.issueLimit + 1),
  ]);
  if (issueResult.ok && Array.isArray(issueResult.data)) {
    result.pagination.issues.fetchedCount = issueResult.data.length;
    result.pagination.issues.hasMore = issueResult.data.length > options.issueLimit;
    const issues = issueResult.data.slice(0, options.issueLimit);
    result.issues = issues.map(summarizeIssue);
    result.summary.issueCount = result.issues.length;
    Object.assign(result, categorizeIssues(issues));
    Object.assign(result, findStaleItems(issues, 90));
    Object.assign(result, extractThemes(issues));
  } else {
    recordFailure(result, 'issues', issueResult.error);
  }

  const prResult = execGhWithResult([
    'pr', 'list', '--state', 'open', '--json',
    'number,title,labels,isDraft,createdAt,updatedAt,body,files',
    '--limit', String(options.prLimit + 1),
  ]);
  if (prResult.ok && Array.isArray(prResult.data)) {
    result.pagination.prs.fetchedCount = prResult.data.length;
    result.pagination.prs.hasMore = prResult.data.length > options.prLimit;
    result.prs = prResult.data.slice(0, options.prLimit).map(summarizePR);
    result.summary.prCount = result.prs.length;
  } else {
    recordFailure(result, 'prs', prResult.error);
  }

  const milestoneResult = execGhWithResult([
    'api', 'repos/{owner}/{repo}/milestones', '--paginate', '--slurp',
  ]);
  if (milestoneResult.ok && Array.isArray(milestoneResult.data)) {
    const milestones = milestoneResult.data.flatMap(page => Array.isArray(page) ? page : [page]);
    result.pagination.milestones.fetchedCount = milestones.length;
    result.pagination.milestones.hasMore = milestones.length > options.milestoneLimit;
    result.milestones = milestones.slice(0, options.milestoneLimit).map(milestone => ({
      title: milestone.title,
      state: milestone.state,
      due_on: milestone.due_on,
      open_issues: milestone.open_issues,
      closed_issues: milestone.closed_issues,
    }));
    result.summary.milestoneCount = result.milestones.length;
    Object.assign(result, findOverdueMilestones(result.milestones));
  } else {
    recordFailure(result, 'milestones', milestoneResult.error);
  }

  if (result.partial) result.errors.push({ source: 'scan', error: 'Partial GitHub data collected' });
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
  findOverdueMilestones,
};

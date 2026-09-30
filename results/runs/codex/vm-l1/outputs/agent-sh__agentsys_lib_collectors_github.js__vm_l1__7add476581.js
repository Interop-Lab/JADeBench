'use strict';

const { execFileSync } = require('child_process');

const DEFAULT_OPTIONS = {
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10000,
  cwd: process.cwd(),
};

function execGh(args) {
  const result = execGhWithResult(args);
  return result.ok ? result.data : null;
}

function execGhWithResult(args) {
  try {
    const output = execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: DEFAULT_OPTIONS.timeout,
      cwd: DEFAULT_OPTIONS.cwd,
    });

    try {
      return { ok: true, data: JSON.parse(output) };
    } catch (error) {
      return {
        ok: false,
        type: 'parse',
        message: `Failed to parse gh output as JSON: ` + error.message,
        raw: output.slice(0, 500),
      };
    }
  } catch (error) {
    return {
      ok: false,
      type: error.killed ? 'timeout' : 'process',
      message: error.message,
      exitCode: error.status,
      stderr: String(error.stderr || '').trim(),
    };
  }
}

function isGhAvailable() {
  try {
    execFileSync('gh', ['auth', 'status'], {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

function summarizeIssue(issue) {
  const snippet = issue.body
    ? issue.body.slice(0, 200).replace(/\n/g, ' ').trim() + (issue.body.length > 200 ? '...' : '')
    : '';

  return {
    number: issue.number,
    title: issue.title,
    labels: issue.labels?.map((label) => label.name) || [],
    milestone: issue.milestone ? issue.milestone.title : null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    snippet,
  };
}

function summarizePR(pr) {
  const snippet = pr.body
    ? pr.body.slice(0, 150).replace(/\n/g, ' ').trim() + (pr.body.length > 150 ? '...' : '')
    : '';

  return {
    number: pr.number,
    title: pr.title,
    labels: pr.labels?.map((label) => label.name) || [],
    isDraft: pr.isDraft,
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    files: pr.files || [],
    snippet,
  };
}

function categorizeIssues(result, issues) {
  const categories = {
    bugs: ['bug', 'type: bug'],
    features: ['feature', 'type: feature'],
    enhancements: ['enhancement'],
    security: ['security', 'type: security'],
  };

  const patterns = Object.entries(categories).flatMap(([category, labels]) =>
    labels.map((label) => ({
      regex: new RegExp(`(^|[^a-z])` + label.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&') + `([^a-z]|$)`, 'i'),
      category,
    })),
  );

  for (const issue of issues) {
    const match = patterns.find(({ regex }) => issue.labels.some((label) => regex.test(label)));
    const category = match ? match.category : 'other';
    result.categorized[category].push({ number: issue.number, title: issue.title });
  }
}

function findStaleItems(result, items, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  for (const item of items) {
    const updatedAt = new Date(item.updatedAt);
    if (updatedAt < cutoff) {
      result.stale.push({
        number: item.number,
        title: item.title,
        lastUpdated: item.updatedAt,
        daysStale: Math.floor((Date.now() - updatedAt) / 1000 / 60 / 60 / 24),
      });
    }
  }
}

function extractThemes(result, issues) {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'for', 'in', 'on', 'at', 'with', 'and', 'or', 'of']);
  const counts = {};

  for (const issue of issues) {
    for (const word of (issue.title || '').toLowerCase().split(/\s+/)) {
      if (word.length > 3 && !stopWords.has(word)) counts[word] = (counts[word] || 0) + 1;
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

function createResult() {
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
      issues: { requestedLimit: DEFAULT_OPTIONS.issueLimit, fetchedCount: 0, hasMore: false },
      prs: { requestedLimit: DEFAULT_OPTIONS.prLimit, fetchedCount: 0, hasMore: false },
      milestones: { requestedLimit: DEFAULT_OPTIONS.milestoneLimit, fetchedCount: 0, hasMore: false },
    },
    categorized: { bugs: [], features: [], security: [], enhancements: [], other: [] },
    stale: [],
    themes: [],
  };
}

function addError(result, source, error) {
  result.partial = true;
  result.errors.push({ source, type: error.type, message: error.message, exitCode: error.exitCode, stderr: error.stderr, raw: error.raw });
  for (const key of Object.keys(result.errors[result.errors.length - 1])) {
    if (result.errors[result.errors.length - 1][key] === undefined) delete result.errors[result.errors.length - 1][key];
  }
}

function scanGitHubState() {
  const result = createResult();
  if (!isGhAvailable()) {
    result.error = 'gh CLI not available or not authenticated';
    return result;
  }

  result.available = true;

  const issues = execGhWithResult([
    'issue', 'list', '--state', 'open', '--json',
    'number,title,labels,milestone,createdAt,updatedAt,body',
    '--limit', String(DEFAULT_OPTIONS.issueLimit),
  ]);
  if (issues.ok) {
    if (Array.isArray(issues.data)) result.issues = issues.data.map(summarizeIssue);
  } else {
    addError(result, 'issues', issues);
  }
  result.summary.issueCount = result.issues.length;
  result.pagination.issues.fetchedCount = result.issues.length;
  result.pagination.issues.hasMore = result.issues.length >= DEFAULT_OPTIONS.issueLimit;
  categorizeIssues(result, result.issues);
  findStaleItems(result, result.issues, 90);
  extractThemes(result, result.issues);

  const prs = execGhWithResult([
    'pr', 'list', '--state', 'open', '--json',
    'number,title,labels,isDraft,createdAt,updatedAt,body,files',
    '--limit', String(DEFAULT_OPTIONS.prLimit),
  ]);
  if (prs.ok) {
    if (Array.isArray(prs.data)) result.prs = prs.data.map(summarizePR);
  } else {
    addError(result, 'prs', prs);
  }
  result.summary.prCount = result.prs.length;
  result.pagination.prs.fetchedCount = result.prs.length;
  result.pagination.prs.hasMore = result.prs.length >= DEFAULT_OPTIONS.prLimit;

  const milestones = execGhWithResult([
    'api', 'repos/{owner}/{repo}/milestones', '--paginate', '--slurp',
  ]);
  if (milestones.ok) {
    if (Array.isArray(milestones.data)) {
      result.milestones = milestones.data
        .flatMap((page) => Array.isArray(page) ? page : [])
        .slice(0, DEFAULT_OPTIONS.milestoneLimit)
        .map((milestone) => ({
          title: milestone.title,
          state: milestone.state,
          due_on: milestone.due_on,
          open_issues: milestone.open_issues,
          closed_issues: milestone.closed_issues,
        }));
    }
  } else {
    addError(result, 'milestones', milestones);
  }
  result.summary.milestoneCount = result.milestones.length;
  result.pagination.milestones.fetchedCount = result.milestones.length;
  result.pagination.milestones.hasMore = result.milestones.length >= DEFAULT_OPTIONS.milestoneLimit;
  findOverdueMilestones(result);

  if (result.partial) result.error = 'Partial GitHub data collected';
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

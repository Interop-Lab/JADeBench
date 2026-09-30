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
  if (!result.ok) throw result.error;
  return result.data;
}

function execGhWithResult(args) {
  try {
    const output = execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: DEFAULT_OPTIONS.timeout,
      cwd: DEFAULT_OPTIONS.cwd,
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
        exitCode: error.status,
        stderr: String(error.stderr || '').trim(),
      },
    };
  }
}

function isGhAvailable() {
  try {
    execFileSync('gh', ['auth', 'status'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

function summarizeIssue(issue) {
  const body = issue.body || '';
  const snippet = body.slice(0, 200).replace(/\n/g, ' ').trim();
  return {
    number: issue.number,
    title: issue.title,
    labels: issue.labels.map((label) => label.name),
    milestone: issue.milestone ? issue.milestone.title : null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    snippet: snippet.length < body.length ? `${snippet}...` : snippet,
  };
}

function summarizePR(pr) {
  const body = pr.body || '';
  const snippet = body.slice(0, 150).replace(/\n/g, ' ').trim();
  return {
    number: pr.number,
    title: pr.title,
    labels: pr.labels.map((label) => label.name),
    isDraft: pr.isDraft,
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    files: pr.files,
    snippet: snippet.length < body.length ? `${snippet}...` : snippet,
  };
}

function categorizeIssues(issues, categoryPatterns) {
  const patterns = categoryPatterns || {
    bugs: ['bug', 'type: bug'],
    features: ['feature', 'type: feature'],
    enhancements: ['enhancement'],
    security: ['security', 'type: security'],
  };
  const matchers = Object.entries(patterns).flatMap(([category, terms]) => (
    terms.map((term) => ({
      category,
      regex: new RegExp(
        `(^|[^a-z])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`,
        'i',
      ),
    }))
  ));
  const categorized = Object.fromEntries(
    Object.keys(patterns).map((category) => [category, []]),
  );
  categorized.other = [];

  for (const issue of issues) {
    const labels = (issue.labels || []).map((label) => (
      typeof label === 'string' ? label.toLowerCase() : label.name.toLowerCase()
    ));
    const matcher = matchers.find(({ regex }) => (
      regex.test(issue.title) || labels.some((label) => regex.test(label))
    ));
    categorized[matcher ? matcher.category : 'other'].push(issue);
  }
  return categorized;
}

function findStaleItems(items, daysStale) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysStale);
  return items
    .filter((item) => new Date(item.updatedAt) < cutoff)
    .map((item) => ({
      number: item.number,
      title: item.title,
      lastUpdated: item.updatedAt,
      daysStale: Math.floor((Date.now() - new Date(item.updatedAt)) / (1000 * 60 * 60 * 24)),
    }));
}

function extractThemes(items, limit) {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'to', 'for', 'in', 'on', 'at',
    'with', 'and', 'or', 'of',
  ]);
  const frequencies = {};
  for (const item of items) {
    const words = (item.title || '')
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length >= 3 && !stopWords.has(word));
    for (const word of words) frequencies[word] = (frequencies[word] || 0) + 1;
  }
  return Object.entries(frequencies)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit || 10)
    .map(([theme, count]) => ({ theme, count }));
}

function findOverdueMilestones(milestones) {
  const now = new Date();
  return milestones.filter((milestone) => (
    milestone.due_on && milestone.state !== 'closed' && new Date(milestone.due_on) < now
  ));
}

function scanGitHubState() {
  const result = {
    available: false,
    partial: false,
    errors: [],
    issueCount: 0,
    prCount: 0,
    milestoneCount: 0,
    summary: { issues: [], prs: [], milestones: [], overdueMilestones: [] },
    pagination: {
      issues: { requestedLimit: DEFAULT_OPTIONS.issueLimit, fetchedCount: 0, hasMore: false },
      prs: { requestedLimit: DEFAULT_OPTIONS.prLimit, fetchedCount: 0, hasMore: false },
      milestones: { requestedLimit: DEFAULT_OPTIONS.milestoneLimit, fetchedCount: 0, hasMore: false },
    },
    categorized: { bugs: [], features: [], security: [], enhancements: [], other: [] },
    stale: [],
    themes: [],
  };

  if (!isGhAvailable()) {
    result.errors.push({ source: 'gh', error: 'gh CLI not available or not authenticated' });
    return result;
  }
  result.available = true;

  const issueResult = execGhWithResult([
    'issue', 'list', '--state', 'open',
    '--json', 'number,title,labels,milestone,createdAt,updatedAt,body',
    '--limit', String(DEFAULT_OPTIONS.issueLimit),
  ]);
  if (issueResult.ok && Array.isArray(issueResult.data)) {
    result.summary.issues = issueResult.data.map(summarizeIssue);
    result.issueCount = result.summary.issues.length;
    result.pagination.issues.fetchedCount = result.issueCount;
    result.pagination.issues.hasMore = result.issueCount >= DEFAULT_OPTIONS.issueLimit;
    result.categorized = categorizeIssues(result.summary.issues);
    result.stale = findStaleItems(result.summary.issues, 90);
    result.themes = extractThemes(result.summary.issues, 10);
  } else {
    result.partial = true;
    result.errors.push({ source: 'issues', error: issueResult.error });
  }

  const prResult = execGhWithResult([
    'pr', 'list', '--state', 'open',
    '--json', 'number,title,labels,isDraft,createdAt,updatedAt,body,files',
    '--limit', String(DEFAULT_OPTIONS.prLimit),
  ]);
  if (prResult.ok && Array.isArray(prResult.data)) {
    result.summary.prs = prResult.data.map(summarizePR);
    result.prCount = result.summary.prs.length;
    result.pagination.prs.fetchedCount = result.prCount;
    result.pagination.prs.hasMore = result.prCount >= DEFAULT_OPTIONS.prLimit;
  } else {
    result.partial = true;
    result.errors.push({ source: 'prs', error: prResult.error });
  }

  const milestoneResult = execGhWithResult([
    'api', 'repos/{owner}/{repo}/milestones', '--paginate', '--slurp',
  ]);
  if (milestoneResult.ok && Array.isArray(milestoneResult.data)) {
    const milestones = milestoneResult.data
      .flatMap((page) => page)
      .slice(0, DEFAULT_OPTIONS.milestoneLimit)
      .map((milestone) => ({
        title: milestone.title,
        state: milestone.state,
        due_on: milestone.due_on,
        open_issues: milestone.open_issues,
        closed_issues: milestone.closed_issues,
      }));
    result.summary.milestones = milestones;
    result.milestoneCount = milestones.length;
    result.pagination.milestones.fetchedCount = result.milestoneCount;
    result.pagination.milestones.hasMore = result.milestoneCount >= DEFAULT_OPTIONS.milestoneLimit;
    result.summary.overdueMilestones = findOverdueMilestones(milestones);
  } else {
    result.partial = true;
    result.errors.push({ source: 'milestones', error: milestoneResult.error });
  }

  if (result.partial) {
    result.errors.push({ source: 'scan', error: 'Partial GitHub data collected' });
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
  findOverdueMilestones,
};

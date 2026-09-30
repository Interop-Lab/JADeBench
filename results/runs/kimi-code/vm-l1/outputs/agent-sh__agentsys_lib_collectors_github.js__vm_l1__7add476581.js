'use strict';

const { execFileSync } = require('child_process');

const DEFAULT_OPTIONS = {
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10_000,
  cwd: process.cwd(),
};

const CATEGORY_RULES = {
  bugs: ['bug', 'type: bug'],
  features: ['feature', 'type: feature'],
  enhancements: ['enhancement'],
  security: ['security', 'type: security'],
};

function execGhWithResult(args, options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  try {
    const output = execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: settings.timeout,
      cwd: settings.cwd,
    });
    try {
      return { ok: true, data: JSON.parse(output) };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'parse',
          message: `Failed to parse gh output as JSON: ${error.message}`,
          raw: String(output).slice(0, 500),
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

function labelNames(item) {
  return (item.labels || []).map((label) => label.name || label);
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
    labels: labelNames(issue),
    milestone: issue.milestone?.title || issue.milestone || null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    snippet: makeSnippet(issue.body, 200),
  };
}

function summarizePR(pr) {
  return {
    number: pr.number,
    title: pr.title,
    labels: labelNames(pr),
    isDraft: pr.isDraft,
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    files: pr.files || [],
    snippet: makeSnippet(pr.body, 150),
  };
}

function createCategoryMatchers() {
  return Object.entries(CATEGORY_RULES).flatMap(([category, labels]) =>
    labels.map((label) => ({
      regex: new RegExp(`(^|[^a-z])${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i'),
      category,
    })),
  );
}

function categorizeIssues(state, issues, matchers = createCategoryMatchers()) {
  for (const issue of issues) {
    const labels = labelNames(issue);
    const summary = { number: issue.number, title: issue.title };
    const match = matchers.find(({ regex }) => labels.some((label) => regex.test(label)));
    state.categorized[match?.category || 'other'].push(summary);
  }
}

function findStaleItems(state, items, staleDays = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - staleDays);
  for (const item of items) {
    const updatedAt = new Date(item.updatedAt);
    if (updatedAt < cutoff) {
      state.stale.push({
        number: item.number,
        title: item.title,
        lastUpdated: item.updatedAt,
        daysStale: Math.floor((Date.now() - updatedAt.getTime()) / (1_000 * 60 * 60 * 24)),
      });
    }
  }
}

const THEME_STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'to', 'for', 'in', 'on', 'at', 'with', 'and', 'or', 'of',
]);

function extractThemes(state, items) {
  const counts = {};
  for (const item of items) {
    const words = (item.title || '').toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length >= 3 && !THEME_STOP_WORDS.has(word)) {
        counts[word] = (counts[word] || 0) + 1;
      }
    }
  }
  state.themes = Object.entries(counts)
    .filter(([, count]) => count > 1)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

function findOverdueMilestones(state) {
  const now = new Date();
  state.overdueMilestones = state.milestones.filter((milestone) =>
    milestone.due_on && milestone.state !== 'closed' && new Date(milestone.due_on) < now,
  );
}

function createState(options) {
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

function scanGitHubState(options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const state = createState(settings);
  state.available = isGhAvailable();
  if (!state.available) {
    state.error = 'gh CLI not available or not authenticated';
    return state;
  }

  const issueResult = execGhWithResult([
    'issue', 'list', '--state', 'open', '--json',
    'number,title,labels,milestone,createdAt,updatedAt,body',
    '--limit', String(settings.issueLimit),
  ], settings);
  if (issueResult.ok && Array.isArray(issueResult.data)) {
    state.issues = issueResult.data.map(summarizeIssue);
    state.summary.issueCount = state.issues.length;
    state.pagination.issues.fetchedCount = state.issues.length;
    state.pagination.issues.hasMore = settings.issueLimit > 0 && state.issues.length >= settings.issueLimit;
    categorizeIssues(state, issueResult.data);
    findStaleItems(state, issueResult.data, 90);
    extractThemes(state, issueResult.data);
  } else if (!issueResult.ok) {
    state.partial = true;
    state.errors.push({ source: 'issues', ...issueResult.error });
  }

  const prResult = execGhWithResult([
    'pr', 'list', '--state', 'open', '--json',
    'number,title,labels,isDraft,createdAt,updatedAt,body,files',
    '--limit', String(settings.prLimit),
  ], settings);
  if (prResult.ok && Array.isArray(prResult.data)) {
    state.prs = prResult.data.map(summarizePR);
    state.summary.prCount = state.prs.length;
    state.pagination.prs.fetchedCount = state.prs.length;
    state.pagination.prs.hasMore = settings.prLimit > 0 && state.prs.length >= settings.prLimit;
  } else if (!prResult.ok) {
    state.partial = true;
    state.errors.push({ source: 'prs', ...prResult.error });
  }

  const milestoneResult = execGhWithResult([
    'api', 'repos/{owner}/{repo}/milestones', '--paginate', '--slurp',
  ], settings);
  if (milestoneResult.ok && Array.isArray(milestoneResult.data)) {
    const milestones = milestoneResult.data.flatMap((page) => page).map((milestone) => ({
      title: milestone.title,
      state: milestone.state,
      due_on: milestone.due_on,
      open_issues: milestone.open_issues,
      closed_issues: milestone.closed_issues,
    }));
    state.pagination.milestones.fetchedCount = milestones.length;
    state.pagination.milestones.hasMore = settings.milestoneLimit > 0
      && milestones.length >= settings.milestoneLimit;
    state.milestones = milestones.slice(0, settings.milestoneLimit);
    state.summary.milestoneCount = state.milestones.length;
    findOverdueMilestones(state);
  } else if (!milestoneResult.ok) {
    state.partial = true;
    state.errors.push({ source: 'milestones', ...milestoneResult.error });
  }

  if (state.partial) state.error = 'Partial GitHub data collected';
  return state;
}

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

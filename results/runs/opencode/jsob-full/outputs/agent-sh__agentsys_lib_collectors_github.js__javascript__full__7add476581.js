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
      return { ok: true, data: JSON.parse(output) };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: `Failed to parse gh output: ${error.message}`,
          raw: output.slice(0, 500),
        },
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        type: error.code ? 'command_error' : 'unknown_error',
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
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

function makeSnippet(body) {
  if (!body) return '';
  const snippet = body.slice(0, 200).replace(/\n/g, ' ').trim();
  return snippet + (body.length > 200 ? '...' : '');
}

function summarizeIssue(issue) {
  return {
    number: issue.number,
    title: issue.title,
    labels: (issue.labels || []).map(label => label.name || label),
    milestone: issue.milestone?.title || issue.milestone || null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    snippet: makeSnippet(issue.body),
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
    snippet: makeSnippet(pr.body),
  };
}

function categorizeIssues(state, issues) {
  const categories = {
    bug: 'bugs',
    feature: 'features',
    security: 'security',
    enhancement: 'enhancements',
  };
  const matchers = Object.entries(categories).map(([label, category]) => ({
    regex: new RegExp(`(^|[: /_-])${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([: /_-]|$)`, 'i'),
    category,
  }));

  for (const issue of issues) {
    const labels = (issue.labels || []).map(label => (label.name || label).toLowerCase());
    const summary = { number: issue.number, title: issue.title };
    let categorized = false;

    for (const { regex, category } of matchers) {
      if (labels.some(label => regex.test(label))) {
        state.categorized[category].push(summary);
        categorized = true;
        break;
      }
    }
    if (!categorized) state.categorized.other.push(summary);
  }
}

function findStaleItems(state, issues, staleDays) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - staleDays);

  for (const issue of issues) {
    const updated = new Date(issue.updatedAt);
    if (updated < cutoff) {
      state.stale.push({
        number: issue.number,
        title: issue.title,
        lastUpdated: issue.updatedAt,
        daysStale: Math.floor((Date.now() - updated) / (24 * 60 * 60 * 1000)),
      });
    }
  }
}

function extractThemes(state, issues) {
  const counts = {};
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'to', 'for', 'in', 'on', 'at', 'with', 'and', 'or', 'of',
  ]);

  for (const issue of issues) {
    const words = (issue.title || '').toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && !stopWords.has(word)) counts[word] = (counts[word] || 0) + 1;
    }
  }

  state.themes = Object.entries(counts)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

function findOverdueMilestones(state) {
  const now = new Date();
  state.overdueMilestones = state.milestones.filter(
    milestone => milestone.due_on && milestone.state === 'open' && new Date(milestone.due_on) < now,
  );
}

function scanGitHubState(options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const state = {
    available: isGhAvailable(),
    partial: false,
    errors: [],
    summary: { issueCount: 0, prCount: 0, milestoneCount: 0 },
    issues: [],
    prs: [],
    milestones: [],
    overdueMilestones: [],
    pagination: {
      issues: { requestedLimit: config.issueLimit, fetchedCount: 0, hasMore: false },
      prs: { requestedLimit: config.prLimit, fetchedCount: 0, hasMore: false },
      milestones: { requestedLimit: config.milestoneLimit, fetchedCount: 0, hasMore: false },
    },
    categorized: { bugs: [], features: [], security: [], enhancements: [], other: [] },
    stale: [],
    themes: [],
  };

  if (!state.available) return state;

  const issueResult = execGhWithResult([
    'issue', 'list', '--state', 'open', '--json',
    'number,title,labels,milestone,createdAt,updatedAt,body', '--limit', String(config.issueLimit),
  ], config);
  const prResult = execGhWithResult([
    'pr', 'list', '--state', 'open', '--json',
    'number,title,labels,isDraft,createdAt,updatedAt,body,files', '--limit', String(config.prLimit),
  ], config);
  const milestoneResult = execGhWithResult([
    'api', 'repos/{owner}/{repo}/milestones', '--paginate', '--slurp',
  ], config);

  const rawIssues = issueResult.ok ? issueResult.data : [];
  const rawPRs = prResult.ok ? prResult.data : [];
  const milestonePages = milestoneResult.ok ? milestoneResult.data : [];
  const rawMilestones = Array.isArray(milestonePages[0]) ? milestonePages.flat() : milestonePages;

  for (const [source, result] of [['issues', issueResult], ['prs', prResult], ['milestones', milestoneResult]]) {
    if (!result.ok) {
      state.partial = true;
      state.errors.push({ source, ...result.error });
    }
  }

  state.issues = rawIssues.map(summarizeIssue);
  state.prs = rawPRs.map(summarizePR);
  state.milestones = rawMilestones.slice(0, config.milestoneLimit).map(milestone => ({
    title: milestone.title,
    state: milestone.state,
    due_on: milestone.due_on,
    open_issues: milestone.open_issues,
    closed_issues: milestone.closed_issues,
  }));

  state.summary.issueCount = state.issues.length;
  state.summary.prCount = state.prs.length;
  state.summary.milestoneCount = state.milestones.length;
  state.pagination.issues.fetchedCount = state.issues.length;
  state.pagination.issues.hasMore = state.issues.length >= config.issueLimit;
  state.pagination.prs.fetchedCount = state.prs.length;
  state.pagination.prs.hasMore = state.prs.length >= config.prLimit;
  state.pagination.milestones.fetchedCount = state.milestones.length;
  state.pagination.milestones.hasMore = rawMilestones.length > config.milestoneLimit;

  categorizeIssues(state, rawIssues);
  findStaleItems(state, rawIssues, config.staleDays || 30);
  extractThemes(state, rawIssues);
  findOverdueMilestones(state);
  return state;
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

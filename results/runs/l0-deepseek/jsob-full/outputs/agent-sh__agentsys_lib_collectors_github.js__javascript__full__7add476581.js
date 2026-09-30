'use strict';

var { execFileSync } = require('child_process');

var DEFAULT_OPTIONS = {
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
    const stdout = execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: options.timeout || DEFAULT_OPTIONS.timeout,
      cwd: options.cwd || DEFAULT_OPTIONS.cwd
    });
    try {
      return { ok: true, data: JSON.parse(stdout) };
    } catch (parseError) {
      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: 'Failed to parse gh output: ' + parseError.message,
          raw: stdout.slice(0, 500)
        }
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        type: error.code ? 'gh_error' : 'exec_error',
        message: error.message,
        exitCode: error.code ?? null,
        stderr: error.stderr ? String(error.stderr).slice(0, 500) : ''
      }
    };
  }
}

function isGhAvailable() {
  try {
    execFileSync('gh', ['--version'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000
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
    labels: (issue.labels || []).map(label => label.name || label),
    milestone: issue.milestone?.title || issue.milestone || null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    snippet: issue.body
      ? (issue.body.slice(0, 120).replace(/\n/g, ' ') + (issue.body.length > 120 ? '...' : ''))
      : ''
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
    snippet: pr.body
      ? (pr.body.slice(0, 120).replace(/\n/g, ' ') + (pr.body.length > 120 ? '...' : ''))
      : ''
  };
}

function categorizeIssues(state, issues) {
  const categories = {
    bug: 'bug',
    feature: 'feature',
    documentation: 'documentation',
    question: 'question',
    enhancement: 'enhancement',
    help_wanted: 'help wanted',
    good_first_issue: 'good first issue'
  };

  const patterns = Object.entries(categories).map(([category, label]) => ({
    regex: new RegExp('(?:^|[\\s-])' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:$|[\\s-])', 'i'),
    category
  }));

  for (const issue of issues) {
    const labels = (issue.labels || []).map(label => (label.name || label).toLowerCase());
    let matched = false;
    const summary = { number: issue.number, title: issue.title };

    for (const { regex, category } of patterns) {
      if (labels.some(label => regex.test(label))) {
        state.categorizedIssues[category].push(summary);
        matched = true;
        break;
      }
    }

    if (!matched) {
      state.categorizedIssues.uncategorized.push(summary);
    }
  }
}

function findStaleItems(state, items, daysThreshold) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysThreshold);

  for (const item of items) {
    const updated = new Date(item.updatedAt);
    if (updated < cutoff) {
      state.staleItems.push({
        number: item.number,
        title: item.title,
        lastUpdated: item.updatedAt,
        daysStale: Math.floor((Date.now() - updated) / (1000 * 60 * 60 * 24))
      });
    }
  }
}

function extractThemes(state, items) {
  const themes = {};
  const stopWords = new Set(['the', 'a', 'an', 'is', 'and', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'or', 'of']);

  for (const item of items) {
    const words = (item.title || '').toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 2 && !stopWords.has(word)) {
        themes[word] = (themes[word] || 0) + 1;
      }
    }
  }

  state.themes = Object.entries(themes)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

function findOverdueMilestones(state) {
  const now = new Date();
  state.overdueMilestones = state.milestones.filter(milestone => {
    if (!milestone.due_on || milestone.state !== 'open') return false;
    return new Date(milestone.due_on) < now;
  });
}

function scanGitHubState(options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const opts = config;

  const counts = { issues: 0, prs: 0, milestones: 0 };
  const issueState = { totalCount: opts.issueLimit, fetchedCount: 0, hasMore: false };
  const prState = { totalCount: opts.prLimit, fetchedCount: 0, hasMore: false };
  const milestoneState = { totalCount: opts.milestoneLimit, fetchedCount: 0, hasMore: false };

  const pagination = {
    issues: issueState,
    prs: prState,
    milestones: milestoneState
  };

  const categorized = {
    bug: [],
    feature: [],
    documentation: [],
    question: [],
    enhancement: [],
    help_wanted: [],
    good_first_issue: [],
    uncategorized: []
  };

  const state = {
    ghAvailable: false,
    scanComplete: false,
    errors: [],
    counts,
    issues: [],
    prs: [],
    staleItems: [],
    overdueMilestones: [],
    pagination,
    categorizedIssues: categorized,
    themes: [],
    milestones: []
  };

  if (!isGhAvailable()) {
    state.ghAvailable = false;
    return state;
  }

  state.ghAvailable = true;

  const issueResult = execGhWithResult(
    ['issue', 'list', '--state', 'all', '--json', 'number,title,labels,milestone,createdAt,updatedAt,body', '--limit', String(opts.issueLimit)],
    opts
  );

  if (issueResult.ok && Array.isArray(issueResult.data)) {
    const issues = issueResult.data;
    state.issues = issues.map(summarizeIssue);
    state.counts.issues = issues.length;
    state.pagination.issues.fetchedCount = issues.length;
    state.pagination.issues.hasMore = opts.issueLimit > 0 && issues.length >= opts.issueLimit;
    categorizeIssues(state, issues);
    findStaleItems(state, issues, 30);
    extractThemes(state, issues);
  } else if (!issueResult.ok) {
    state.errors.push({ source: 'issues', ...issueResult.error });
  }

  const prResult = execGhWithResult(
    ['pr', 'list', '--state', 'all', '--json', 'number,title,labels,isDraft,createdAt,updatedAt,body,files', '--limit', String(opts.prLimit)],
    opts
  );

  if (prResult.ok && Array.isArray(prResult.data)) {
    const prs = prResult.data;
    state.prs = prs.map(summarizePR);
    state.counts.prs = prs.length;
    state.pagination.prs.fetchedCount = prs.length;
    state.pagination.prs.hasMore = opts.prLimit > 0 && prs.length >= opts.prLimit;
  } else if (!prResult.ok) {
    state.errors.push({ source: 'prs', ...prResult.error });
  }

  const milestoneResult = execGhWithResult(
    ['milestone', 'list', '--state', 'all', '--json', 'title,state,due_on,open_issues,closed_issues'],
    opts
  );

  if (milestoneResult.ok && Array.isArray(milestoneResult.data)) {
    const milestones = milestoneResult.data;
    const normalized = milestones.map(milestone => Array.isArray(milestone) ? milestone : []);
    const mapped = normalized.map(milestone => ({
      title: milestone.title,
      state: milestone.state,
      due_on: milestone.due_on,
      open_issues: milestone.open_issues,
      closed_issues: milestone.closed_issues
    }));

    state.milestones = mapped;
    state.pagination.milestones.fetchedCount = mapped.length;
    state.pagination.milestones.hasMore = opts.milestoneLimit > 0 && mapped.length >= opts.milestoneLimit;
    state.overdueMilestones = mapped.slice(0, opts.milestoneLimit);
    findOverdueMilestones(state);
  } else if (!milestoneResult.ok) {
    state.errors.push({ source: 'milestones', ...milestoneResult.error });
  }

  state.scanComplete = true;
  state.counts.milestones = state.milestones.length;
  if (state.ghAvailable && !state.scanComplete) {
    state.scanComplete = true;
  }

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
  findOverdueMilestones
};

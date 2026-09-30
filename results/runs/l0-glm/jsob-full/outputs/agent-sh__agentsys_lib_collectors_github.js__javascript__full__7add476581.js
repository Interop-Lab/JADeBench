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
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: options.timeout || DEFAULT_OPTIONS.timeout,
      cwd: options.cwd || DEFAULT_OPTIONS.cwd
    });
    try {
      return { ok: true, data: JSON.parse(output) };
    } catch (parseError) {
      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: 'Failed to parse gh output: ' + parseError.message,
          raw: output.slice(0, 500)
        }
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        type: error.code ? 'exec_error' : 'unknown_error',
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

function summarizeIssue(issue) {
  return {
    number: issue.number,
    title: issue.title,
    labels: (issue.labels || []).map(label => label.name || label),
    milestone: issue.milestone?.title || issue.milestone || null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    snippet: issue.body ? issue.body.slice(0, 200).replace(/\n/g, ' ').trim() + (issue.body.length > 200 ? '…' : '') : ''
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
    snippet: pr.body ? pr.body.slice(0, 200).replace(/\n/g, ' ').trim() + (pr.body.length > 200 ? '…' : '') : ''
  };
}

function categorizeIssues(state, issues) {
  const labelMap = {
    bug: 'bug',
    enhancement: 'enhancement',
    feature: 'enhancement',
    question: 'question',
    help: 'question',
    documentation: 'documentation',
    docs: 'documentation',
    duplicate: 'duplicate',
    invalid: 'invalid',
    wontfix: 'wontfix',
    stale: 'stale'
  };

  const categories = Object.entries(labelMap).map(([label, category]) => ({
    regex: new RegExp('(^|[-\\s,])' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[-\\s,])', 'i'),
    category: category
  }));

  for (const issue of issues) {
    const labels = (issue.labels || []).map(label => (label.name || label).toLowerCase());
    let matched = false;
    const summary = { number: issue.number, title: issue.title };

    for (const { regex, category } of categories) {
      if (labels.some(label => regex.test(label))) {
        state.categorization[category].push(summary);
        matched = true;
        break;
      }
    }

    if (!matched) {
      state.categorization.other.push(summary);
    }
  }
}

function findStaleItems(state, items, daysThreshold) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - daysThreshold);

  for (const item of items) {
    const updated = new Date(item.updatedAt);
    if (updated < threshold) {
      state.stale.push({
        number: item.number,
        title: item.title,
        lastUpdated: item.updatedAt,
        daysStale: Math.floor((Date.now() - updated) / (1000 * 60 * 60 * 24))
      });
    }
  }
}

function extractThemes(state, items) {
  const wordCounts = {};
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'for', 'in', 'on', 'at', 'and', 'or', 'of']);

  for (const item of items) {
    const words = (item.title || '').toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 2 && !stopWords.has(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    }
  }

  state.themes = Object.entries(wordCounts)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

function findOverdueMilestones(state) {
  const now = new Date();
  state.overdueMilestones = state.milestones.filter(milestone => {
    if (!milestone.due_on || milestone.state === 'closed') return false;
    return new Date(milestone.due_on) < now;
  });
}

function scanGitHubState(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const state = {
    ghAvailable: false,
    errors: [],
    issues: [],
    prs: [],
    milestones: [],
    staleIssues: [],
    stalePRs: [],
    categorization: {
      issues: { limit: opts.issueLimit, count: 0, truncated: false },
      prs: { limit: opts.prLimit, count: 0, truncated: false },
      milestones: { limit: opts.milestoneLimit, count: 0, truncated: false }
    },
    stale: [],
    themes: [],
    summary: {
      totalIssues: 0,
      openIssues: 0,
      totalPRs: 0,
      openPRs: 0,
      totalMilestones: 0,
      overdueMilestones: 0
    }
  };

  if (!isGhAvailable()) {
    state.errors.push('gh CLI not available');
    return state;
  }

  state.ghAvailable = true;

  const issueResult = execGhWithResult(
    ['issue', 'list', '--state', 'open', '--json', 'number,title,labels,milestone,createdAt,updatedAt,body', '--limit', String(opts.issueLimit)],
    opts
  );

  if (issueResult.ok && Array.isArray(issueResult.data)) {
    const issues = issueResult.data;
    state.issues = issues.map(summarizeIssue);
    state.summary.totalIssues = issues.length;
    state.categorization.issues.count = issues.length;
    state.categorization.issues.truncated = opts.issueLimit > 0 && issues.length >= opts.issueLimit;
    categorizeIssues(state, issues);
    findStaleItems(state, issues, 30);
    extractThemes(state, issues);
  } else {
    if (!issueResult.ok) {
      state.errors.push({ source: 'issues', ...issueResult.error });
    }
  }

  const prResult = execGhWithResult(
    ['pr', 'list', '--state', 'open', '--json', 'number,title,labels,isDraft,createdAt,updatedAt,files,body', '--limit', String(opts.prLimit)],
    opts
  );

  if (prResult.ok && Array.isArray(prResult.data)) {
    const prs = prResult.data;
    state.prs = prs.map(summarizePR);
    state.summary.totalPRs = prs.length;
    state.categorization.prs.count = prs.length;
    state.categorization.prs.truncated = opts.prLimit > 0 && prs.length >= opts.prLimit;
  } else {
    if (!prResult.ok) {
      state.errors.push({ source: 'prs', ...prResult.error });
    }
  }

  const milestoneResult = execGhWithResult(
    ['api', '/repos/:owner/:repo/milestones', '--paginate'],
    opts
  );

  if (milestoneResult.ok && Array.isArray(milestoneResult.data)) {
    const milestones = milestoneResult.data;
    const milestoneArrays = milestones.map(item => Array.isArray(item) ? item : []);
    const flatMilestones = milestoneArrays.map(m => ({
      title: m.title,
      state: m.state,
      due_on: m.due_on,
      open_issues: m.open_issues,
      closed_issues: m.closed_issues
    }));
    state.categorization.milestones.count = flatMilestones.length;
    state.categorization.milestones.truncated = opts.milestoneLimit > 0 && flatMilestones.length >= opts.milestoneLimit;
    state.milestones = flatMilestones.slice(0, opts.milestoneLimit);
    state.summary.totalMilestones = state.milestones.length;
    findOverdueMilestones(state);
  } else {
    if (!milestoneResult.ok) {
      state.errors.push({ source: 'milestones', ...milestoneResult.error });
    }
  }

  state.summary.overdueMilestones = state.overdueMilestones.length;
  state.errors.length > 0 && (state.hasErrors = true);

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

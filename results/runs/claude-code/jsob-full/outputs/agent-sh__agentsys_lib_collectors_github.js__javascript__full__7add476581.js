'use strict';

const { execFileSync } = require('child_process');

const DEFAULT_OPTIONS = {
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10000,
  cwd: process.cwd(),
};

function execGh(args, options = {}) {
  const result = execGhWithResult(args, options);
  return result.ok ? result.data : null;
}

function execGhWithResult(args, options = {}) {
  try {
    const raw = execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: options.timeout || DEFAULT_OPTIONS.timeout,
      cwd: options.cwd || DEFAULT_OPTIONS.cwd,
    });

    try {
      return { ok: true, data: JSON.parse(raw) };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'parse',
          message: `Failed to parse gh output: ${error.message}`,
          raw: raw.slice(0, 500),
        },
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        type: error.signal ? 'timeout' : 'exec',
        message: error.message,
        exitCode: error.status ?? null,
        stderr: error.stderr ? String(error.stderr).trim() : '',
      },
    };
  }
}

function isGhAvailable() {
  try {
    execFileSync('gh', ['--version'], {
      encoding: 'utf8',
      stdio: 'ignore',
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

function makeSnippet(text) {
  if (!text) return '';
  const snippet = text.slice(0, 120).replace(/\n/g, ' ').trim();
  return snippet + (text.length > 120 ? '...' : '');
}

function summarizeIssue(issue) {
  return {
    number: issue.number,
    title: issue.title,
    labels: (issue.labels || []).map((label) => label.name || label),
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
    labels: (pr.labels || []).map((label) => label.name || label),
    isDraft: pr.isDraft,
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    files: pr.files || [],
    snippet: makeSnippet(pr.body),
  };
}

function categorizeIssues(result, issues) {
  const labelCategories = {
    bug: 'bugs',
    enhancement: 'features',
    feature: 'features',
    documentation: 'documentation',
    docs: 'documentation',
    question: 'questions',
    help: 'questions',
  };

  const matchers = Object.entries(labelCategories).map(([label, category]) => ({
    regex: new RegExp(`(^|[\\s:-])${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s:-]|$)`, 'i'),
    category,
  }));

  for (const issue of issues) {
    const labels = (issue.labels || []).map((label) => (label.name || label).toLowerCase());
    const summary = { number: issue.number, title: issue.title };
    let matched = false;

    for (const { regex, category } of matchers) {
      if (labels.some((label) => regex.test(label))) {
        result.categories[category].push(summary);
        matched = true;
        break;
      }
    }

    if (!matched) result.categories.other.push(summary);
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
        daysStale: Math.floor((Date.now() - updatedAt) / (1000 * 60 * 60 * 24)),
      });
    }
  }
}

function extractThemes(result, issues) {
  const wordCounts = {};
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'is',
    'and',
    'to',
    'for',
    'in',
    'on',
    'at',
    'with',
    'from',
    'or',
    'of',
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
    .sort((left, right) => right[1] - left[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

function findOverdueMilestones(result) {
  const now = new Date();
  result.overdueMilestones = result.milestones.filter((milestone) => {
    if (!milestone.due_on || milestone.state === 'closed') return false;
    return new Date(milestone.due_on) < now;
  });
}

function scanGitHubState(options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const result = {
    available: false,
    error: false,
    errors: [],
    counts: {
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
        requestedLimit: config.issueLimit,
        returnedCount: 0,
        truncated: false,
      },
      prs: {
        requestedLimit: config.prLimit,
        returnedCount: 0,
        truncated: false,
      },
      milestones: {
        requestedLimit: config.milestoneLimit,
        returnedCount: 0,
        truncated: false,
      },
    },
    categories: {
      bugs: [],
      features: [],
      documentation: [],
      questions: [],
      other: [],
    },
    stale: [],
    themes: [],
  };

  if (!isGhAvailable()) {
    result.error = 'GitHub CLI not found';
    return result;
  }

  result.available = true;

  const issuesResult = execGhWithResult([
    'issue',
    'list',
    '--state',
    'open',
    '--json',
    'number,title,labels,milestone,createdAt,updatedAt,body',
    '--limit',
    String(config.issueLimit),
  ], config);

  if (issuesResult.ok && Array.isArray(issuesResult.data)) {
    const issues = issuesResult.data;
    result.issues = issues.map(summarizeIssue);
    result.counts.issueCount = issues.length;
    result.pagination.issues.returnedCount = issues.length;
    result.pagination.issues.truncated = config.issueLimit > 0 && issues.length >= config.issueLimit;
    categorizeIssues(result, issues);
    findStaleItems(result, issues, 30);
    extractThemes(result, issues);
  } else if (!issuesResult.ok) {
    result.errors.push({ source: 'issues', ...issuesResult.error });
  }

  const prsResult = execGhWithResult([
    'pr',
    'list',
    '--state',
    'open',
    '--json',
    'number,title,labels,isDraft,createdAt,updatedAt,body,files',
    '--limit',
    String(config.prLimit),
  ], config);

  if (prsResult.ok && Array.isArray(prsResult.data)) {
    const prs = prsResult.data;
    result.prs = prs.map(summarizePR);
    result.counts.prCount = prs.length;
    result.pagination.prs.returnedCount = prs.length;
    result.pagination.prs.truncated = config.prLimit > 0 && prs.length >= config.prLimit;
  } else if (!prsResult.ok) {
    result.errors.push({ source: 'prs', ...prsResult.error });
  }

  const milestonesResult = execGhWithResult([
    'api',
    'repos/:owner/:repo/milestones',
    '--paginate',
    '--slurp',
  ], config);

  if (milestonesResult.ok && Array.isArray(milestonesResult.data)) {
    const pages = milestonesResult.data;
    const flatMilestones = pages.flatMap((page) => (Array.isArray(page) ? page : []));
    const milestones = flatMilestones.map((milestone) => ({
      title: milestone.title,
      state: milestone.state,
      due_on: milestone.due_on,
      open_issues: milestone.open_issues,
      closed_issues: milestone.closed_issues,
    }));

    result.pagination.milestones.returnedCount = milestones.length;
    result.pagination.milestones.truncated = config.milestoneLimit > 0 && milestones.length >= config.milestoneLimit;
    result.milestones = milestones.slice(0, config.milestoneLimit);
    result.counts.milestoneCount = result.milestones.length;
    findOverdueMilestones(result);
  } else if (!milestonesResult.ok) {
    result.errors.push({ source: 'milestones', ...milestonesResult.error });
  }

  result.error = result.errors.length > 0;
  if (result.available && !result.error) result.error = false;
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

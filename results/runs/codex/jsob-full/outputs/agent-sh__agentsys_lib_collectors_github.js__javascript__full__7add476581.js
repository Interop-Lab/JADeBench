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
      timeout: 5000,
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
    snippet: summarizeBody(issue.body, 200),
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
    snippet: summarizeBody(pullRequest.body, 150),
  };
}

function summarizeBody(body, limit) {
  if (!body) return '';
  return body.slice(0, limit).replace(/\n/g, ' ').trim() + (body.length > limit ? '...' : '');
}

function categorizeIssues(result, issues) {
  const categoryByLabel = {
    bug: 'bugs',
    'type: bug': 'bugs',
    feature: 'features',
    'type: feature': 'features',
    enhancement: 'enhancements',
    security: 'security',
    'type: security': 'security',
  };
  const matchers = Object.entries(categoryByLabel).map(([label, category]) => ({
    regex: new RegExp(`(^|[^a-z])${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i'),
    category,
  }));

  for (const issue of issues) {
    const labels = (issue.labels || []).map((label) => (label.name || label).toLowerCase());
    const summary = { number: issue.number, title: issue.title };
    let categorized = false;

    for (const { regex, category } of matchers) {
      if (labels.some((label) => regex.test(label))) {
        result.categorized[category].push(summary);
        categorized = true;
        break;
      }
    }

    if (!categorized) result.categorized.other.push(summary);
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

function extractThemes(result, items) {
  const counts = {};
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'for', 'in', 'on', 'at', 'with', 'and', 'or', 'of']);

  for (const item of items) {
    const words = (item.title || '').toLowerCase().split(/\s+/);
    for (const word of words) {
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
  result.overdueMilestones = result.milestones.filter((milestone) => {
    if (!milestone.due_on || milestone.state === 'closed') return false;
    return new Date(milestone.due_on) < now;
  });
}

function scanGitHubState(options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const result = {
    available: false,
    partial: false,
    errors: [],
    summary: { issueCount: 0, prCount: 0, milestoneCount: 0 },
    issues: [],
    prs: [],
    milestones: [],
    overdueMilestones: [],
    pagination: {
      issues: { requestedLimit: settings.issueLimit, fetchedCount: 0, hasMore: false },
      prs: { requestedLimit: settings.prLimit, fetchedCount: 0, hasMore: false },
      milestones: { requestedLimit: settings.milestoneLimit, fetchedCount: 0, hasMore: false },
    },
    categorized: { bugs: [], features: [], security: [], enhancements: [], other: [] },
    stale: [],
    themes: [],
  };

  if (!isGhAvailable()) {
    result.error = 'gh CLI not available or not authenticated';
    return result;
  }
  result.available = true;

  const issueResult = execGhWithResult([
    'issue', 'list', '--state', 'open', '--json',
    'number,title,labels,milestone,createdAt,updatedAt,body',
    '--limit', String(settings.issueLimit),
  ], settings);
  if (issueResult.ok && Array.isArray(issueResult.data)) {
    result.issues = issueResult.data.map(summarizeIssue);
    result.summary.issueCount = issueResult.data.length;
    result.pagination.issues.fetchedCount = issueResult.data.length;
    result.pagination.issues.hasMore = settings.issueLimit > 0 && issueResult.data.length >= settings.issueLimit;
    categorizeIssues(result, issueResult.data);
    findStaleItems(result, issueResult.data, 90);
    extractThemes(result, issueResult.data);
  } else if (!issueResult.ok) {
    result.errors.push({ source: 'issues', ...issueResult.error });
  }

  const prResult = execGhWithResult([
    'pr', 'list', '--state', 'open', '--json',
    'number,title,labels,isDraft,createdAt,updatedAt,body,files',
    '--limit', String(settings.prLimit),
  ], settings);
  if (prResult.ok && Array.isArray(prResult.data)) {
    result.prs = prResult.data.map(summarizePR);
    result.summary.prCount = prResult.data.length;
    result.pagination.prs.fetchedCount = prResult.data.length;
    result.pagination.prs.hasMore = settings.prLimit > 0 && prResult.data.length >= settings.prLimit;
  } else if (!prResult.ok) {
    result.errors.push({ source: 'prs', ...prResult.error });
  }

  const milestoneResult = execGhWithResult([
    'api', 'repos/{owner}/{repo}/milestones', '--paginate', '--slurp',
  ], settings);
  if (milestoneResult.ok && Array.isArray(milestoneResult.data)) {
    const milestones = milestoneResult.data
      .flatMap((page) => (Array.isArray(page) ? page : []))
      .map((milestone) => ({
        title: milestone.title,
        state: milestone.state,
        due_on: milestone.due_on,
        open_issues: milestone.open_issues,
        closed_issues: milestone.closed_issues,
      }));
    result.pagination.milestones.fetchedCount = milestones.length;
    result.pagination.milestones.hasMore = settings.milestoneLimit > 0 && milestones.length > settings.milestoneLimit;
    result.milestones = milestones.slice(0, settings.milestoneLimit);
    result.summary.milestoneCount = result.milestones.length;
    findOverdueMilestones(result);
  } else if (!milestoneResult.ok) {
    result.errors.push({ source: 'milestones', ...milestoneResult.error });
  }

  result.partial = result.errors.length > 0;
  if (result.partial && !result.error) result.error = 'Partial GitHub data collected';
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

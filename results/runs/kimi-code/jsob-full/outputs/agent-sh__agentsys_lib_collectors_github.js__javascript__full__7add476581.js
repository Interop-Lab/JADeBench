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

function summarizeBody(body, limit) {
  if (!body) return '';
  const snippet = body.slice(0, limit).replace(/\n/g, ' ').trim();
  return snippet + (body.length > limit ? '...' : '');
}

function summarizeIssue(issue) {
  return {
    number: issue.number,
    title: issue.title,
    labels: (issue.labels || []).map(label => label.name || label),
    milestone: issue.milestone?.title || issue.milestone || null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    snippet: summarizeBody(issue.body, 200),
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
    snippet: summarizeBody(pr.body, 150),
  };
}

function categorizeIssues(result, issues) {
  const labelCategories = {
    bug: 'bugs',
    'type: bug': 'bugs',
    feature: 'features',
    'type: feature': 'features',
    enhancement: 'enhancements',
    security: 'security',
    'type: security': 'security',
  };
  const matchers = Object.entries(labelCategories).map(([label, category]) => ({
    regex: new RegExp(`(^|[^a-z])${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i'),
    category,
  }));

  for (const issue of issues) {
    const labels = (issue.labels || []).map(label => (label.name || label).toLowerCase());
    const summary = { number: issue.number, title: issue.title };
    const match = matchers.find(({ regex }) => labels.some(label => regex.test(label)));
    result.categorized[match ? match.category : 'other'].push(summary);
  }
}

function findStaleItems(result, issues, staleDays) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - staleDays);
  for (const issue of issues) {
    const updated = new Date(issue.updatedAt);
    if (updated < cutoff) {
      result.stale.push({
        number: issue.number,
        title: issue.title,
        lastUpdated: issue.updatedAt,
        daysStale: Math.floor((Date.now() - updated) / (24 * 60 * 60 * 1000)),
      });
    }
  }
}

function extractThemes(result, issues) {
  const counts = {};
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'it', 'to', 'for', 'in', 'on', 'at', 'with', 'and', 'or', 'of',
  ]);
  for (const issue of issues) {
    const words = (issue.title || '').toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && !stopWords.has(word)) counts[word] = (counts[word] || 0) + 1;
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
  result.overdueMilestones = result.milestones.filter(milestone =>
    milestone.due_on && milestone.state !== 'closed' && new Date(milestone.due_on) < now,
  );
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

  const issuesResponse = execGhWithResult([
    'issue', 'list', '--state', 'open', '--json',
    'number,title,labels,milestone,createdAt,updatedAt,body',
    '--limit', String(settings.issueLimit),
  ], settings);
  if (issuesResponse.ok && Array.isArray(issuesResponse.data)) {
    const issues = issuesResponse.data;
    result.issues = issues.map(summarizeIssue);
    result.summary.issueCount = issues.length;
    result.pagination.issues.fetchedCount = issues.length;
    result.pagination.issues.hasMore = settings.issueLimit > 0 && issues.length >= settings.issueLimit;
    categorizeIssues(result, issues);
    findStaleItems(result, issues, 90);
    extractThemes(result, issues);
  } else if (!issuesResponse.ok) {
    result.errors.push({ source: 'issues', ...issuesResponse.error });
  }

  const prsResponse = execGhWithResult([
    'pr', 'list', '--state', 'open', '--json',
    'number,title,labels,isDraft,createdAt,updatedAt,body,files',
    '--limit', String(settings.prLimit),
  ], settings);
  if (prsResponse.ok && Array.isArray(prsResponse.data)) {
    const prs = prsResponse.data;
    result.prs = prs.map(summarizePR);
    result.summary.prCount = prs.length;
    result.pagination.prs.fetchedCount = prs.length;
    result.pagination.prs.hasMore = settings.prLimit > 0 && prs.length >= settings.prLimit;
  } else if (!prsResponse.ok) {
    result.errors.push({ source: 'prs', ...prsResponse.error });
  }

  const milestonesResponse = execGhWithResult([
    'api', 'repos/{owner}/{repo}/milestones', '--paginate', '--slurp',
  ], settings);
  if (milestonesResponse.ok && Array.isArray(milestonesResponse.data)) {
    const milestones = milestonesResponse.data
      .flatMap(page => Array.isArray(page) ? page : [])
      .map(milestone => ({
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
  } else if (!milestonesResponse.ok) {
    result.errors.push({ source: 'milestones', ...milestonesResponse.error });
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

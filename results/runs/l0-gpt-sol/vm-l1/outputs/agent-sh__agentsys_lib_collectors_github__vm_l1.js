'use strict';

const { execFileSync } = require('child_process');

const DEFAULT_OPTIONS = {
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10000,
  cwd: process.cwd()
};

function normalizeOptions(options) {
  return { ...DEFAULT_OPTIONS, ...(options || {}) };
}

function execGh(args, options) {
  const config = normalizeOptions(options);
  const command = Array.isArray(args) ? args : [String(args)];
  return execFileSync('gh', command, {
    cwd: config.cwd,
    timeout: config.timeout,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
}

function execGhWithResult(args, options) {
  const config = normalizeOptions(options);
  const command = Array.isArray(args) ? args : [String(args)];

  try {
    const stdout = execFileSync('gh', command, {
      cwd: config.cwd,
      timeout: config.timeout,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });

    return {
      ok: true,
      status: 0,
      stdout: stdout.trim(),
      stderr: ''
    };
  } catch (error) {
    return {
      ok: false,
      status: typeof error.status === 'number' ? error.status : 1,
      stdout: error.stdout ? String(error.stdout).trim() : '',
      stderr: error.stderr ? String(error.stderr).trim() : String(error.message || error)
    };
  }
}

function isGhAvailable(options) {
  return execGhWithResult(['--version'], options).ok;
}

function summarizeIssue(issue) {
  if (!issue || typeof issue !== 'object') {
    return issue;
  }

  return {
    number: issue.number,
    title: issue.title,
    state: issue.state,
    url: issue.url,
    author: issue.author && (issue.author.login || issue.author.name || issue.author),
    assignees: Array.isArray(issue.assignees)
      ? issue.assignees.map(person => person && (person.login || person.name || person))
      : [],
    labels: Array.isArray(issue.labels)
      ? issue.labels.map(label => label && (label.name || label))
      : [],
    milestone: issue.milestone
      ? issue.milestone.title || issue.milestone
      : null,
    comments: issue.comments,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    body: issue.body
  };
}

function summarizePR(pullRequest) {
  if (!pullRequest || typeof pullRequest !== 'object') {
    return pullRequest;
  }

  return {
    number: pullRequest.number,
    title: pullRequest.title,
    state: pullRequest.state,
    isDraft: Boolean(pullRequest.isDraft),
    mergedAt: pullRequest.mergedAt || null,
    url: pullRequest.url,
    author: pullRequest.author &&
      (pullRequest.author.login || pullRequest.author.name || pullRequest.author),
    assignees: Array.isArray(pullRequest.assignees)
      ? pullRequest.assignees.map(person => person && (person.login || person.name || person))
      : [],
    reviewers: Array.isArray(pullRequest.reviewers)
      ? pullRequest.reviewers.map(person => person && (person.login || person.name || person))
      : [],
    labels: Array.isArray(pullRequest.labels)
      ? pullRequest.labels.map(label => label && (label.name || label))
      : [],
    comments: pullRequest.comments,
    reviews: pullRequest.reviews,
    createdAt: pullRequest.createdAt,
    updatedAt: pullRequest.updatedAt,
    body: pullRequest.body
  };
}

function categorizeIssues(issues, categories) {
  const items = Array.isArray(issues) ? issues : [];
  const rules = categories && typeof categories === 'object'
    ? categories
    : {
        bug: ['bug'],
        feature: ['feature', 'enhancement'],
        documentation: ['documentation', 'docs'],
        maintenance: ['maintenance', 'chore']
      };

  const result = {};
  Object.keys(rules).forEach(category => {
    result[category] = [];
  });
  result.other = [];

  for (const issue of items) {
    const labels = Array.isArray(issue && issue.labels)
      ? issue.labels.map(label => String(label && (label.name || label)).toLowerCase())
      : [];

    let category = null;
    for (const name of Object.keys(rules)) {
      const candidates = Array.isArray(rules[name]) ? rules[name] : [rules[name]];
      if (candidates.some(label => labels.includes(String(label).toLowerCase()))) {
        category = name;
        break;
      }
    }

    (category ? result[category] : result.other).push(issue);
  }

  return result;
}

function findStaleItems(items, days = 30, now = new Date()) {
  const list = Array.isArray(items) ? items : [];
  const cutoff = new Date(now).getTime() - Number(days) * 86400000;

  return list.filter(item => {
    const timestamp = item && (item.updatedAt || item.updated_at || item.createdAt || item.created_at);
    if (!timestamp) {
      return false;
    }
    const time = new Date(timestamp).getTime();
    return Number.isFinite(time) && time < cutoff;
  });
}

function extractThemes(items, limit = 10) {
  const list = Array.isArray(items) ? items : [];
  const counts = new Map();

  for (const item of list) {
    const labels = Array.isArray(item && item.labels)
      ? item.labels
      : [];
    for (const label of labels) {
      const name = String(label && (label.name || label)).trim();
      if (name) {
        counts.set(name, (counts.get(name) || 0) + 1);
      }
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, Math.max(0, Number(limit)))
    .map(([name, count]) => ({ name, count }));
}

function findOverdueMilestones(milestones, now = new Date()) {
  const list = Array.isArray(milestones) ? milestones : [];
  const currentTime = new Date(now).getTime();

  return list.filter(milestone => {
    if (!milestone || milestone.state === 'closed' || !milestone.dueOn) {
      return false;
    }
    const due = new Date(milestone.dueOn).getTime();
    return Number.isFinite(due) && due < currentTime;
  });
}

function parseJsonOutput(output) {
  if (!output) {
    return [];
  }
  const value = JSON.parse(output);
  return value == null ? [] : value;
}

function scanGitHubState(options) {
  const config = normalizeOptions(options);
  const jsonFields = [
    'number',
    'title',
    'state',
    'url',
    'body',
    'author',
    'assignees',
    'labels',
    'milestone',
    'comments',
    'reviews',
    'reviewers',
    'isDraft',
    'mergedAt',
    'createdAt',
    'updatedAt'
  ].join(',');

  const issuesResult = execGhWithResult([
    'issue',
    'list',
    '--limit',
    String(config.issueLimit),
    '--state',
    'all',
    '--json',
    jsonFields
  ], config);

  const prsResult = execGhWithResult([
    'pr',
    'list',
    '--limit',
    String(config.prLimit),
    '--state',
    'all',
    '--json',
    jsonFields
  ], config);

  const milestonesResult = execGhWithResult([
    'api',
    'repos/{owner}/{repo}/milestones',
    '--paginate',
    '-f',
    'state=all',
    '-f',
    `per_page=${config.milestoneLimit}`
  ], config);

  let issues = [];
  let pullRequests = [];
  let milestones = [];

  if (issuesResult.ok && issuesResult.stdout) {
    issues = parseJsonOutput(issuesResult.stdout);
  }
  if (prsResult.ok && prsResult.stdout) {
    pullRequests = parseJsonOutput(prsResult.stdout);
  }
  if (milestonesResult.ok && milestonesResult.stdout) {
    milestones = parseJsonOutput(milestonesResult.stdout);
  }

  return {
    issues,
    pullRequests,
    milestones,
    staleIssues: findStaleItems(issues, config.staleDays),
    overdueMilestones: findOverdueMilestones(milestones),
    available: issuesResult.ok || prsResult.ok || milestonesResult.ok
  };
}

globalThis.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
globalThis.execGh = execGh;
globalThis.execGhWithResult = execGhWithResult;
globalThis.isGhAvailable = isGhAvailable;
globalThis.summarizeIssue = summarizeIssue;
globalThis.summarizePR = summarizePR;
globalThis.categorizeIssues = categorizeIssues;
globalThis.findStaleItems = findStaleItems;
globalThis.extractThemes = extractThemes;
globalThis.findOverdueMilestones = findOverdueMilestones;
globalThis.scanGitHubState = scanGitHubState;
globalThis.execFileSync = execFileSync;

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

'use strict';

const { execFileSync } = require('child_process');

const DEFAULT_OPTIONS = {
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10000,
  cwd: process.cwd()
};

function execGh(args) {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    timeout: DEFAULT_OPTIONS.timeout,
    cwd: DEFAULT_OPTIONS.cwd
  });
}

function execGhWithResult(args) {
  const stdout = execGh(args);
  return { stdout, success: true };
}

function isGhAvailable() {
  try {
    execFileSync('gh', ['--version'], { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function summarizeIssue(issue) {
  const title = issue.title || '';
  const body = issue.body || '';
  const labels = (issue.labels || []).map(l => l.name).join(', ');
  return `Issue #${issue.number}: ${title}\nLabels: ${labels || 'none'}\n${body.slice(0, 200)}`;
}

function summarizePR(pr) {
  const title = pr.title || '';
  const body = pr.body || '';
  const labels = (pr.labels || []).map(l => l.name).join(', ');
  return `PR #${pr.number}: ${title}\nLabels: ${labels || 'none'}\n${body.slice(0, 200)}`;
}

function categorizeIssues(issues, categories) {
  const result = {};
  for (const category of categories) {
    result[category] = [];
  }
  result['uncategorized'] = [];

  for (const issue of issues) {
    const labels = (issue.labels || []).map(l => l.name.toLowerCase());
    let matched = false;
    for (const category of categories) {
      if (labels.includes(category.toLowerCase())) {
        result[category].push(issue);
        matched = true;
        break;
      }
    }
    if (!matched) {
      result['uncategorized'].push(issue);
    }
  }
  return result;
}

function findStaleItems(items, staleDays, now = new Date()) {
  const threshold = now.getTime() - staleDays * 24 * 60 * 60 * 1000;
  return items.filter(item => {
    const updated = new Date(item.updated_at || item.updatedAt || 0).getTime();
    return updated < threshold;
  });
}

function extractThemes(items, topN = 10) {
  const wordCounts = {};
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could', 'this', 'that', 'these', 'those', 'it', 'its', 'as', 'by', 'from', 'up', 'down', 'out', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'don', 'now']);

  for (const item of items) {
    const text = `${item.title || ''} ${item.body || ''}`.toLowerCase();
    const words = text.split(/[^a-z0-9]+/).filter(w => w.length > 2 && !stopWords.has(w));
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }

  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
}

function findOverdueMilestones(milestones, now = new Date()) {
  return milestones.filter(milestone => {
    if (!milestone.due_on && !milestone.dueOn) return false;
    const due = new Date(milestone.due_on || milestone.dueOn);
    return due < now && milestone.state === 'open';
  });
}

function scanGitHubState() {
  const issues = JSON.parse(execGh(['issue', 'list', '--state', 'all', '--limit', String(DEFAULT_OPTIONS.issueLimit), '--json', 'number,title,body,labels,state,updated_at']));
  const prs = JSON.parse(execGh(['pr', 'list', '--state', 'all', '--limit', String(DEFAULT_OPTIONS.prLimit), '--json', 'number,title,body,labels,state,updated_at']));
  const milestones = JSON.parse(execGh(['milestone', 'list', '--limit', String(DEFAULT_OPTIONS.milestoneLimit), '--json', 'number,title,due_on,state']));

  return {
    issues,
    prs,
    milestones,
    staleIssues: findStaleItems(issues, 30),
    stalePRs: findStaleItems(prs, 14),
    overdueMilestones: findOverdueMilestones(milestones),
    themes: extractThemes([...issues, ...prs], 10)
  };
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

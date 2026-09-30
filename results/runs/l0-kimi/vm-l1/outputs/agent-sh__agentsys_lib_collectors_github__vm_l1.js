'use strict';
const {execFileSync} = require('child_process');

const DEFAULT_OPTIONS = {
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10000,
  cwd: process.cwd()
};

function execGh(args) {
  'use strict';
  return execFileSync('gh', args, {
    encoding: 'utf8',
    timeout: DEFAULT_OPTIONS.timeout,
    cwd: DEFAULT_OPTIONS.cwd
  }).trim();
}

function execGhWithResult(args) {
  'use strict';
  try {
    return {success: true, output: execGh(args)};
  } catch (e) {
    return {success: false, error: e.message};
  }
}

function isGhAvailable() {
  'use strict';
  try {
    execGh(['--version']);
    return true;
  } catch {
    return false;
  }
}

function summarizeIssue(issue) {
  'use strict';
  return {
    number: issue.number,
    title: issue.title,
    state: issue.state,
    author: issue.author?.login,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    labels: issue.labels?.map(l => l.name) || [],
    comments: issue.commentsCount || 0
  };
}

function summarizePR(pr) {
  'use strict';
  return {
    number: pr.number,
    title: pr.title,
    state: pr.state,
    author: pr.author?.login,
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    merged: pr.merged,
    draft: pr.draft,
    reviewDecision: pr.reviewDecision,
    checksStatus: pr.checksStatus
  };
}

function categorizeIssues(issues, categories) {
  'use strict';
  const result = {};
  for (const cat of categories) {
    result[cat] = [];
  }
  result.other = [];
  
  for (const issue of issues) {
    const labels = issue.labels?.map(l => l.name.toLowerCase()) || [];
    let matched = false;
    for (const cat of categories) {
      if (labels.some(l => l.includes(cat.toLowerCase()))) {
        result[cat].push(summarizeIssue(issue));
        matched = true;
        break;
      }
    }
    if (!matched) {
      result.other.push(summarizeIssue(issue));
    }
  }
  return result;
}

function findStaleItems(items, daysThreshold, type = 'issue') {
  'use strict';
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - daysThreshold);
  
  return items.filter(item => {
    const updated = new Date(item.updatedAt);
    return updated < threshold;
  }).map(item => type === 'pr' ? summarizePR(item) : summarizeIssue(item));
}

function extractThemes(items, minFrequency = 2) {
  'use strict';
  const wordFreq = {};
  const stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'with', 'without', 'from', 'by', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'within', 'fix', 'bug', 'feature', 'add', 'update', 'remove', 'delete', 'create', 'new']);
  
  for (const item of items) {
    const words = (item.title + ' ' + (item.body || ''))
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w));
    
    for (const word of words) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }
  
  return Object.entries(wordFreq)
    .filter(([, count]) => count >= minFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({theme: word, frequency: count}));
}

function findOverdueMilestones(milestones) {
  'use strict';
  const now = new Date();
  return milestones
    .filter(m => m.dueOn && new Date(m.dueOn) < now && m.state === 'open')
    .map(m => ({
      number: m.number,
      title: m.title,
      dueOn: m.dueOn,
      openIssues: m.openIssues?.totalCount || 0,
      openPRs: m.openPRs?.totalCount || 0
    }));
}

function scanGitHubState() {
  'use strict';
  if (!isGhAvailable()) {
    throw new Error('GitHub CLI (gh) is not available');
  }
  
  const result = {
    timestamp: new Date().toISOString(),
    repo: execGh(['repo', 'view', '--json', 'nameWithOwner']).trim(),
    issues: [],
    pullRequests: [],
    milestones: []
  };
  
  try {
    const issuesJson = execGh(['issue', 'list', '--limit', String(DEFAULT_OPTIONS.issueLimit), '--json', 'number,title,state,author,createdAt,updatedAt,labels,commentsCount']);
    result.issues = JSON.parse(issuesJson);
  } catch (e) {
    result.issuesError = e.message;
  }
  
  try {
    const prsJson = execGh(['pr', 'list', '--limit', String(DEFAULT_OPTIONS.prLimit), '--json', 'number,title,state,author,createdAt,updatedAt,merged,draft,reviewDecision,checksStatus']);
    result.pullRequests = JSON.parse(prsJson);
  } catch (e) {
    result.prsError = e.message;
  }
  
  try {
    const milestonesJson = execGh(['api', 'repos/{owner}/{repo}/milestones', '--paginate', '--jq', '.[] | {number: .number, title: .title, state: .state, dueOn: .due_on, openIssues: .open_issues, closedIssues: .closed_issues}']);
    result.milestones = milestonesJson ? JSON.parse('[' + milestonesJson.replace(/\n/g, ',').replace(/,$/, '') + ']') : [];
  } catch (e) {
    result.milestonesError = e.message;
  }
  
  return result;
}

module.exports = {
  DEFAULT_OPTIONS,
  scanGitHubState,
  isGhAvailable,
  execGh,
  execGhWithResult,
  summarizeIssue,
  summarizePR,
  categorizeIssues,
  findStaleItems,
  extractThemes,
  findOverdueMilestones
};

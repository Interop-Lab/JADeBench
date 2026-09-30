'use strict';

var { execFileSync } = require('child_process');

var DEFAULT_OPTIONS = {
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10000,
  cwd: process.cwd()
};

function execGh(args) {
  'use strict';
  try {
    return execFileSync('gh', args, {
      encoding: 'utf8',
      timeout: DEFAULT_OPTIONS.timeout,
      cwd: DEFAULT_OPTIONS.cwd
    }).trim();
  } catch (e) {
    return null;
  }
}

function execGhWithResult(args) {
  'use strict';
  try {
    var output = execFileSync('gh', args, {
      encoding: 'utf8',
      timeout: DEFAULT_OPTIONS.timeout,
      cwd: DEFAULT_OPTIONS.cwd
    }).trim();
    return { success: true, output: output };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function isGhAvailable() {
  'use strict';
  try {
    execFileSync('gh', ['--version'], {
      encoding: 'utf8',
      timeout: DEFAULT_OPTIONS.timeout,
      cwd: DEFAULT_OPTIONS.cwd
    });
    return true;
  } catch (e) {
    return false;
  }
}

function summarizeIssue(issue) {
  'use strict';
  return {
    number: issue.number,
    title: issue.title,
    state: issue.state,
    author: issue.author ? issue.author.login : null,
    labels: (issue.labels || []).map(function (l) { return l.name; }),
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    comments: issue.comments || 0,
    url: issue.url
  };
}

function summarizePR(pr) {
  'use strict';
  return {
    number: pr.number,
    title: pr.title,
    state: pr.state,
    author: pr.author ? pr.author.login : null,
    labels: (pr.labels || []).map(function (l) { return l.name; }),
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    comments: pr.comments || 0,
    reviews: pr.reviews || 0,
    additions: pr.additions || 0,
    deletions: pr.deletions || 0,
    merged: pr.merged || false,
    mergeable: pr.mergeable,
    url: pr.url
  };
}

function categorizeIssues(issues, categories) {
  'use strict';
  var result = {};
  for (var key in categories) {
    result[key] = [];
  }
  result.uncategorized = [];
  for (var i = 0; i < issues.length; i++) {
    var issue = issues[i];
    var matched = false;
    var labels = (issue.labels || []).map(function (l) { return l.name; });
    for (var cat in categories) {
      var patterns = categories[cat];
      for (var j = 0; j < patterns.length; j++) {
        if (labels.indexOf(patterns[j]) !== -1) {
          result[cat].push(issue);
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
    if (!matched) {
      result.uncategorized.push(issue);
    }
  }
  return result;
}

function findStaleItems(items, daysThreshold, referenceDate) {
  'use strict';
  var threshold = daysThreshold || 30;
  var ref = referenceDate ? new Date(referenceDate) : new Date();
  var stale = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var updated = item.updatedAt || item.updated_at;
    if (updated) {
      var updatedDate = new Date(updated);
      var diffDays = (ref - updatedDate) / (1000 * 60 * 60 * 24);
      if (diffDays > threshold) {
        stale.push(item);
      }
    }
  }
  return stale;
}

function extractThemes(items, options) {
  'use strict';
  var opts = options || {};
  var minFrequency = opts.minFrequency || 2;
  var labelFreq = {};
  for (var i = 0; i < items.length; i++) {
    var labels = items[i].labels || [];
    for (var j = 0; j < labels.length; j++) {
      var name = labels[j].name || labels[j];
      labelFreq[name] = (labelFreq[name] || 0) + 1;
    }
  }
  var themes = [];
  for (var label in labelFreq) {
    if (labelFreq[label] >= minFrequency) {
      themes.push({ label: label, count: labelFreq[label] });
    }
  }
  themes.sort(function (a, b) { return b.count - a.count; });
  return themes;
}

function findOverdueMilestones(milestones) {
  'use strict';
  var now = new Date();
  var overdue = [];
  for (var i = 0; i < milestones.length; i++) {
    var m = milestones[i];
    if (m.dueOn && m.state === 'OPEN') {
      var due = new Date(m.dueOn);
      if (due < now) {
        overdue.push(m);
      }
    }
  }
  return overdue;
}

function scanGitHubState() {
  'use strict';
  var available = isGhAvailable();
  if (!available) {
    return {
      available: false,
      issues: [],
      prs: [],
      milestones: [],
      staleIssues: [],
      stalePRs: [],
      overdueMilestones: [],
      themes: []
    };
  }
  var issuesRaw = execGh(['issue', 'list', '--limit', String(DEFAULT_OPTIONS.issueLimit), '--json', 'number,title,state,author,labels,createdAt,updatedAt,comments,url']);
  var prsRaw = execGh(['pr', 'list', '--limit', String(DEFAULT_OPTIONS.prLimit), '--json', 'number,title,state,author,labels,createdAt,updatedAt,comments,reviews,additions,deletions,merged,mergeable,url']);
  var milestonesRaw = execGh(['api', 'repos/:owner/:repo/milestones', '--paginate']);

  var issues = issuesRaw ? JSON.parse(issuesRaw) : [];
  var prs = prsRaw ? JSON.parse(prsRaw) : [];
  var milestones = milestonesRaw ? JSON.parse(milestonesRaw) : [];

  var summarizedIssues = issues.map(summarizeIssue);
  var summarizedPRs = prs.map(summarizePR);

  var staleIssues = findStaleItems(summarizedIssues, 30);
  var stalePRs = findStaleItems(summarizedPRs, 30);
  var overdueMilestones = findOverdueMilestones(milestones);
  var themes = extractThemes(summarizedIssues.concat(summarizedPRs));

  return {
    available: true,
    issues: summarizedIssues,
    prs: summarizedPRs,
    milestones: milestones,
    staleIssues: staleIssues,
    stalePRs: stalePRs,
    overdueMilestones: overdueMilestones,
    themes: themes
  };
}

module.exports = {
  DEFAULT_OPTIONS: DEFAULT_OPTIONS,
  scanGitHubState: scanGitHubState,
  isGhAvailable: isGhAvailable,
  execGh: execGh,
  summarizeIssue: summarizeIssue,
  summarizePR: summarizePR,
  categorizeIssues: categorizeIssues,
  findStaleItems: findStaleItems,
  extractThemes: extractThemes,
  findOverdueMilestones: findOverdueMilestones
};

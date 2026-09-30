'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames, __commonJS = (obj, exports) => function require() {
  const exportsObj = {};
  return exportsObj.default = {}, (exports || (exportsObj[__getOwnPropNames(exports)[0]] = exports)), exportsObj.default;
}, require_github = __commonJS({'../work/agent-sh__agentsys/lib/collectors/github.js'(module, exports) {
  'use strict';
  var { execFileSync: execFileSync } = require('child_process'), defaults = {'issueLimit': 100, 'prLimit': 50, 'milestoneLimit': 100, 'timeout': 10000, 'cwd': process.cwd()};
  function runGh(args, options = {}) {
    const result = execGhRaw(args, options);
    return result['ok'] ? result['data'] : null;
  }
  function execGhRaw(args, options = {}) {
    try {
      const stdout = execFileSync('gh', args, {'encoding': 'utf8', 'stdio': ['ignore', 'pipe', 'pipe'], 'timeout': options['timeout'] || defaults['timeout'], 'cwd': options['cwd'] || defaults['cwd']});
      try {
        return {'ok': true, 'data': JSON.parse(stdout)};
      } catch (e) {
        return {'ok': false, 'error': {'type': 'parse_error', 'message': 'Failed to parse gh CLI output: ' + e['message'], 'raw': stdout.slice(0, 500)}};
      }
    } catch (e) {
      return {'ok': false, 'error': {'type': e['code'] ? 'cli_error' : 'exec_error', 'message': e['message'], 'exitCode': e['status'] ?? null, 'stderr': e['stderr'] ? String(e['stderr']).trim() : ''}};
    }
  }
  function checkGhAvailable() {
    try {
      execFileSync('gh', ['--version'], {'stdio': 'ignore', 'timeout': 5000});
      return true;
    } catch {
      return false;
    }
  }
  function formatIssue(issue) {
    return {'number': issue['number'], 'title': issue['title'], 'labels': (issue['labels'] || []).map(label => label['name'] || label), 'milestone': issue['milestone']?.['title'] || issue['milestone'] || null, 'createdAt': issue['createdAt'], 'updatedAt': issue['updatedAt'], 'snippet': issue['body'] ? (issue['body'].slice(0, 200).replace(/\n/g, ' ').trim(), issue['body'].length > 200 ? '...' : '') : ''};
  }
  function formatPR(pr) {
    return {'number': pr['number'], 'title': pr['title'], 'labels': (pr['labels'] || []).map(label => label['name'] || label), 'isDraft': pr['isDraft'], 'createdAt': pr['createdAt'], 'updatedAt': pr['updatedAt'], 'files': pr['files'] || [], 'snippet': pr['body'] ? (pr['body'].slice(0, 200).replace(/\n/g, ' ').trim(), pr['body'].length > 200 ? '...' : '') : ''};
  }
  function categorizeByLabels(result, items) {
    const labelMap = {'bug': 'bugs', 'enhancement': 'features', 'question': 'questions', 'good first issue': 'goodFirstIssues', 'help wanted': 'helpWanted'};
    const patterns = Object.entries(labelMap).map(([label, category]) => ({'regex': new RegExp('(^|\\s)' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|\\s)', 'i'), 'category': category}));
    for (const item of items) {
      const labels = (item['labels'] || []).map(label => (label['name'] || label).toLowerCase());
      let matched = false;
      const summary = {'number': item['number'], 'title': item['title']};
      for (const {regex, category} of patterns) {
        if (labels.some(label => regex.test(label))) {
          result['byLabel'][category].push(summary);
          matched = true;
          break;
        }
      }
      !matched && result['byLabel']['other'].push(summary);
    }
  }
  function addStaleness(result, items, daysThreshold) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - daysThreshold);
    for (const item of items) {
      const updated = new Date(item['updatedAt']);
      if (updated < threshold) {
        result['stale'].push({'number': item['number'], 'title': item['title'], 'lastUpdated': item['updatedAt'], 'daysStale': Math.floor((Date.now() - updated) / (1000 * 60 * 60 * 24))});
      }
    }
  }
  function extractKeywords(result, items) {
    const counts = {}, stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'in', 'on', 'at', 'for', 'of', 'or', 'and']);
    for (const item of items) {
      const words = (item['title'] || '').toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 3 && !stopWords.has(word)) {
          counts[word] = (counts[word] || 0) + 1;
        }
      }
    }
    result['keywords'] = Object.entries(counts).filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([word, count]) => ({'word': word, 'count': count}));
  }
  function filterActiveMilestones(result) {
    result['milestones']['active'] = result['milestones']['all'].filter(milestone => {
      if (!milestone['state'] || milestone['state'] === 'CLOSED') return false;
      return new Date(milestone['dueOn']) > new Date();
    });
  }
  function collect(options = {}) {
    const opts = {...defaults, ...options}, config = opts;
    const result = {'available': false, 'issues': [], 'pullRequests': [], 'milestones': {'all': [], 'active': []}, 'byLabel': {'bugs': [], 'features': [], 'questions': [], 'goodFirstIssues': [], 'helpWanted': [], 'other': []}, 'stale': [], 'keywords': [], 'errors': []};
    if (!checkGhAvailable()) {
      result['errors'].push({'source': 'github', 'message': 'gh CLI not available'});
      return result;
    }
    result['available'] = true;
    const issuesResult = runGh(['issue', 'list', '--state', 'all', '--json', 'number,title,labels,milestone,createdAt,updatedAt,body', '--limit', String(config['issueLimit'])], config);
    if (issuesResult['ok'] && Array.isArray(issuesResult['data'])) {
      const issues = issuesResult['data'];
      result['issues'] = issues.map(formatIssue);
      result['byLabel']['total'] = issues.length;
      result['byLabel']['openCount'] = issues.filter(i => i['state'] === 'OPEN').length;
      categorizeByLabels(result, issues);
      addStaleness(result, issues, 30);
      extractKeywords(result, issues);
    } else {
      if (!issuesResult['ok']) {
        result['errors'].push({'source': 'issues', ...issuesResult['error']});
      }
    }
    const prsResult = runGh(['pr', 'list', '--state', 'all', '--json', 'number,title,labels,isDraft,createdAt,updatedAt,files,body', '--limit', String(config['prLimit'])], config);
    if (prsResult['ok'] && Array.isArray(prsResult['data'])) {
      const prs = prsResult['data'];
      result['pullRequests'] = prs.map(formatPR);
      result['byLabel']['prTotal'] = prs.length;
      result['byLabel']['prOpenCount'] = prs.filter(pr => pr['state'] === 'OPEN').length;
    } else {
      if (!prsResult['ok']) {
        result['errors'].push({'source': 'pullRequests', ...prsResult['error']});
      }
    }
    const milestonesResult = runGh(['api', 'repos/{owner}/{repo}/milestones', '--paginate'], config);
    if (milestonesResult['ok'] && Array.isArray(milestonesResult['data'])) {
      const milestones = milestonesResult['data'].map(item => Array.isArray(item) ? item : []).map(m => ({'title': m['title'], 'state': m['state'], 'due_on': m['due_on'], 'open_issues': m['open_issues'], 'closed_issues': m['closed_issues']}));
      result['milestones']['all'] = milestones;
      result['milestones']['active'] = milestones.filter(m => m['state'] === 'open' && m['open_issues'] > 0);
      result['milestones'] = milestones.slice(0, config['milestoneLimit']);
      result['milestones']['active'] = result['milestones'].filter(m => m['state'] === 'open');
      filterActiveMilestones(result);
    } else {
      if (!milestonesResult['ok']) {
        result['errors'].push({'source': 'milestones', ...milestonesResult['error']});
      }
    }
    result['totalItems'] = result['issues'].length + result['pullRequests'].length;
    if (result['available'] && !result['totalItems']) {
      result['errors'].push({'source': 'github', 'message': 'No data collected'});
    }
    return result;
  }
  const _exports = {};
  _exports['defaults'] = defaults;
  _exports['collect'] = collect;
  _exports['checkGhAvailable'] = checkGhAvailable;
  _exports['runGh'] = runGh;
  _exports['formatIssue'] = formatIssue;
  _exports['formatPR'] = formatPR;
  _exports['categorizeByLabels'] = categorizeByLabels;
  _exports['addStaleness'] = addStaleness;
  _exports['extractKeywords'] = extractKeywords;
  _exports['filterActiveMilestones'] = filterActiveMilestones;
  exports['default'] = _exports;
}}), require_documentation = __commonJS({'../work/agent-sh__agentsys/lib/collectors/documentation.js'(module, exports) {
  'use strict';
  var fs = require('fs'), path = require('path'), defaults = {'depth': 3, 'cwd': process.cwd()};
  function findReadme(dir, filename) {
    const candidates = [filename, filename.toUpperCase(), 'README.md', 'readme.md', 'Readme.md'];
    for (const candidate of candidates) {
      const fullPath = path.join(dir, candidate);
      if (fs.existsSync(fullPath)) return candidate;
    }
    return null;
  }
  function readFile(filePath, filename) {
    const fullPath = path.join(filePath, filename);
    if (!fs.existsSync(fullPath)) return null;
    try {
      return fs.readFileSync(fullPath, 'utf8');
    } catch {
      return null;
    }
  }
  function analyzeReadme(content, filename) {
    const headings = content.match(/^##\s{1,1000}(.+)$/gm) || [], titles = headings.slice(0, 50).map(h => h.replace(/^##\s+/, '')), combined = titles.map(t => t.toLowerCase()).join(' ');
    return {'path': filename, 'sectionCount': headings.length, 'sections': titles, 'hasInstallation': /install|setup|getting.started/i.test(combined), 'hasUsage': /usage|how.to|example/i.test(combined), 'hasApi': /api|reference|methods/i.test(combined), 'hasTesting': /test|spec|coverage/i.test(combined), 'codeBlocks': Math.floor((content.match(/

'use strict';
const {execFileSync} = require('child_process');

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
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
            timeout: options.timeout || DEFAULT_OPTIONS.timeout,
            cwd: options.cwd || DEFAULT_OPTIONS.cwd
        });
        try {
            return {ok: true, data: JSON.parse(output)};
        } catch (e) {
            return {
                ok: false,
                error: {
                    type: 'parse',
                    message: 'Failed to parse gh output: ' + e.message,
                    raw: output.slice(0, 1000)
                }
            };
        }
    } catch (error) {
        return {
            ok: false,
            error: {
                type: error.code ? 'exec' : 'unknown',
                message: error.message,
                exitCode: error.exitCode ?? null,
                stderr: error.stderr ? String(error.stderr).trim() : ''
            }
        };
    }
}

function isGhAvailable() {
    try {
        execFileSync('gh', ['--version'], {
            encoding: 'utf-8',
            stdio: 'pipe',
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
        labels: (issue.labels || []).map(l => l.name || l),
        milestone: issue.milestone?.title || issue.milestone || null,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
        snippet: issue.body ? issue.body.slice(0, 200).replace(/\n/g, ' ').trim() + (issue.body.length > 200 ? '...' : '') : ''
    };
}

function summarizePR(pr) {
    return {
        number: pr.number,
        title: pr.title,
        labels: (pr.labels || []).map(l => l.name || l),
        isDraft: pr.isDraft,
        createdAt: pr.createdAt,
        updatedAt: pr.updatedAt,
        files: pr.files || [],
        snippet: pr.body ? pr.body.slice(0, 200).replace(/\n/g, ' ').trim() + (pr.body.length > 200 ? '...' : '') : ''
    };
}

function categorizeIssues(result, issues) {
    const categories = {
        bug: 'Bugs',
        feature: 'Features',
        enhancement: 'Enhancements',
        docs: 'Documentation',
        question: 'Questions',
        other: 'Other'
    };
    const patterns = Object.entries(categories).map(([key, category]) => ({
        regex: new RegExp(`(^|[\\s\\]])${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[\\s\\[])`, 'i'),
        category
    }));
    
    for (const issue of issues) {
        const labels = (issue.labels || []).map(l => (l.name || l).toLowerCase());
        let matched = false;
        const item = {number: issue.number, title: issue.title};
        
        for (const {regex, category} of patterns) {
            if (labels.some(l => regex.test(l))) {
                result.categorized[category].push(item);
                matched = true;
                break;
            }
        }
        if (!matched) {
            result.categorized.Other.push(item);
        }
    }
}

function findStaleItems(result, items, daysThreshold) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysThreshold);
    
    for (const item of items) {
        const updated = new Date(item.updatedAt);
        if (updated < cutoff) {
            result.stale.push({
                number: item.number,
                title: item.title,
                lastUpdated: item.updatedAt,
                daysStale: Math.floor((Date.now() - updated) / (1000 * 60 * 60 * 24))
            });
        }
    }
}

function extractThemes(result, items) {
    const themes = {};
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'be', 'in', 'on', 'at', 'for', 'and', 'or', 'of']);
    
    for (const item of items) {
        const words = (item.title || '').toLowerCase().split(/\s+/);
        for (const word of words) {
            if (word.length > 3 && !stopWords.has(word)) {
                themes[word] = (themes[word] || 0) + 1;
            }
        }
    }
    
    result.themes = Object.entries(themes)
        .filter(([, count]) => count > 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({word, count}));
}

function findOverdueMilestones(result) {
    const now = new Date();
    result.milestones.overdue = result.milestones.all.filter(m => {
        if (!m.due_on || m.state === 'closed') return false;
        return new Date(m.due_on) < now;
    });
}

function scanGitHubState(options = {}) {
    const opts = {...DEFAULT_OPTIONS, ...options};
    
    const limits = {
        issues: opts.issueLimit,
        prs: opts.prLimit,
        milestones: opts.milestoneLimit
    };
    
    const categorized = {
        Bugs: [],
        Features: [],
        Enhancements: [],
        Documentation: [],
        Questions: [],
        Other: []
    };
    
    const summary = {
        issues: [],
        prs: [],
        milestones: {all: [], overdue: []},
        stale: [],
        themes: [],
        categorized,
        limits,
        errors: []
    };
    
    const result = {
        ok: false,
        available: false,
        summary,
        issues: [],
        prs: [],
        milestones: [],
        stale: [],
        themes: [],
        categorized
    };
    
    if (!isGhAvailable()) {
        result.error = 'GitHub CLI not available';
        return result;
    }
    
    result.available = true;
    
    const issuesRes = execGhWithResult([
        'issue', 'list', '--state', 'open', '--json',
        'number,title,labels,milestone,createdAt,updatedAt,body',
        '--limit', String(opts.issueLimit)
    ], opts);
    
    if (issuesRes.ok && Array.isArray(issuesRes.data)) {
        const issues = issuesRes.data;
        result.issues = issues.map(summarizeIssue);
        result.summary.issues.count = issues.length;
        result.summary.limits.issues.reached = opts.issueLimit > 0 && issues.length >= opts.issueLimit;
        categorizeIssues(result, issues);
        findStaleItems(result, issues, 30);
        extractThemes(result, issues);
    } else if (!issuesRes.ok) {
        result.errors.push({source: 'issues', ...issuesRes.error});
    }
    
    const prsRes = execGhWithResult([
        'pr', 'list', '--state', 'open', '--json',
        'number,title,labels,isDraft,createdAt,updatedAt,files,body',
        '--limit', String(opts.prLimit)
    ], opts);
    
    if (prsRes.ok && Array.isArray(prsRes.data)) {
        const prs = prsRes.data;
        result.prs = prs.map(summarizePR);
        result.summary.prs.count = prs.length;
        result.summary.limits.prs.reached = opts.prLimit > 0 && prs.length >= opts.prLimit;
    } else if (!prsRes.ok) {
        result.errors.push({source: 'prs', ...prsRes.error});
    }
    
    const milestonesRes = execGhWithResult([
        'api', 'repos/{owner}/{repo}/milestones', '--jq', '.'
    ], opts);
    
    if (milestonesRes.ok && Array.isArray(milestonesRes.data)) {
        const milestones = milestonesRes.data;
        const validMilestones = milestones.filter(m => Array.isArray(m) ? m : []);
        const formatted = validMilestones.map(m => ({
            title: m.title,
            state: m.state,
            due_on: m.due_on,
            open_issues: m.open_issues,
            closed_issues: m.closed_issues
        }));
        
        result.summary.milestones.all = formatted.slice(0, opts.milestoneLimit);
        result.summary.limits.milestones.reached = opts.milestoneLimit > 0 && formatted.length >= opts.milestoneLimit;
        result.milestones = formatted.slice(0, opts.milestoneLimit);
        result.summary.milestones.overdue = result.milestones;
        findOverdueMilestones(result);
    } else if (!milestonesRes.ok) {
        result.errors.push({source: 'milestones', ...milestonesRes.error});
    }
    
    result.ok = result.errors.length === 0;
    result.available && !result.ok && (result.error = result.errors[0]?.message);
    
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
    findOverdueMilestones
};

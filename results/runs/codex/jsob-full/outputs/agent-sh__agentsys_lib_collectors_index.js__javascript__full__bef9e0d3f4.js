'use strict';

const { execFileSync } = require('node:child_process');
const process = require('node:process');

const DEFAULT_OPTIONS = {
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10_000,
  cwd: process.cwd(),
};

function runGhCommand(argumentsList, options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  try {
    const output = execFileSync('gh', argumentsList, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: settings.timeout,
      cwd: settings.cwd,
    });
    return { ok: true, data: JSON.parse(output) };
  } catch (error) {
    return {
      ok: false,
      error: {
        type: error && error.name ? error.name : 'Error',
        message: error && error.message ? error.message : String(error),
        exitCode: error && error.status !== undefined ? error.status : null,
        stderr: error && error.stderr ? String(error.stderr).trim() : '',
      },
    };
  }
}

function getSuccessfulData(result) {
  return result && result.ok ? result.data : null;
}

function normalizeIssue(issue) {
  return {
    number: issue.number,
    title: issue.title,
    labels: issue.labels || [],
    state: issue.state,
    url: issue.url,
    author: issue.author,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  };
}

function normalizePullRequest(pullRequest) {
  return {
    number: pullRequest.number,
    title: pullRequest.title,
    body: pullRequest.body || '',
    state: pullRequest.state,
    url: pullRequest.url,
    author: pullRequest.author,
    labels: pullRequest.labels || [],
    createdAt: pullRequest.createdAt,
    updatedAt: pullRequest.updatedAt,
  };
}

function normalizeMilestone(milestone) {
  return {
    number: milestone.number,
    title: milestone.title,
    description: milestone.description || '',
    state: milestone.state,
    dueOn: milestone.dueOn || null,
    openIssues: milestone.openIssues,
    closedIssues: milestone.closedIssues,
  };
}

module.exports = {
  DEFAULT_OPTIONS,
  getSuccessfulData,
  normalizeIssue,
  normalizeMilestone,
  normalizePullRequest,
  runGhCommand,
};

'use strict';

const DEFAULT_OPTIONS = {
  collectors: ['github', 'documentation', 'codebase'],
  depth: 3,
  issueLimit: 100,
  prLimit: 50,
  milestoneLimit: 100,
  timeout: 10000,
  cwd: process.cwd()
};

module.exports = {
  DEFAULT_OPTIONS,
  collect: collectors.collect,
  collectWithOptions: collectors.collectWithOptions,
  github: collectors.github,
  documentation: collectors.documentation,
  codebase: collectors.codebase,
  docsPatterns: collectors.docsPatterns,
  git: collectors.git,
  analyzerQueries: collectors.analyzerQueries,
  repoIntel: collectors.repoIntel
};

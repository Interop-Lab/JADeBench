'use strict';

const DEFAULT_OPTIONS = {
  sources: ['github', 'docs', 'codebase'],
  depth: 'thorough',
  issueLimit: 100,
  prLimit: 50,
  timeout: 30000
};

module.exports = {
  DEFAULT_OPTIONS,
  scanGitHubState: async () => {
    throw new Error('Not implemented in deobfuscated stub');
  },
  analyzeDocumentation: async () => {
    throw new Error('Not implemented in deobfuscated stub');
  },
  scanCodebase: async () => {
    throw new Error('Not implemented in deobfuscated stub');
  },
  collectAllData: async () => {
    throw new Error('Not implemented in deobfuscated stub');
  },
  isGhAvailable: () => false,
  isPathSafe: () => true
};

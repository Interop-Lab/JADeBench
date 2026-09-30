module.exports = {
  DEFAULT_OPTIONS: globalThis.DEFAULT_OPTIONS,
  scanGitHubState: globalThis.collectors.scanGitHubState,
  analyzeDocumentation: globalThis.collectors.analyzeDocumentation,
  scanCodebase: globalThis.collectors.scanCodebase,
  collectAllData: globalThis.collectors.collectAllData,
  isGhAvailable: globalThis.collectors.isGhAvailable,
  isPathSafe: globalThis.collectors.documentation.isPathSafe
};

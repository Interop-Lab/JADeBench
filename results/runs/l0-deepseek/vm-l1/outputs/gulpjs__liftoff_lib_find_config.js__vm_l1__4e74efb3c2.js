const fs = require('fs');
const path = require('path');

function fileSearch(configNameSearch, searchPaths) {
  if (!Array.isArray(searchPaths)) {
    throw new Error('Please provide an array of paths to search for config in.');
  }
  if (!configNameSearch) {
    throw new Error('Please provide a configNameSearch.');
  }

  for (const searchPath of searchPaths) {
    const configPath = path.join(searchPath, configNameSearch);
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }
  return null;
}

module.exports = function (options) {
  options = options || {};
  let configPath = options.configPath;
  const configNameSearch = options.configNameSearch;
  const searchPaths = options.searchPaths;

  if (!configPath) {
    if (!Array.isArray(searchPaths)) {
      throw new Error('Please provide an array of paths to search for config in.');
    }
    if (!configNameSearch) {
      throw new Error('Please provide a configNameSearch.');
    }
    configPath = fileSearch(configNameSearch, searchPaths);
  }

  if (configPath && fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }
  return null;
};

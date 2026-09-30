const fs = require('fs');
const path = require('path');
const findUp = require('findup-sync');

function searchForConfig(configNameSearch, searchPaths) {
  let configPath;

  for (const searchPath of searchPaths) {
    if (configPath) {
      break;
    }

    configPath = findUp(configNameSearch, {
      cwd: searchPath,
      nocase: true,
    });
  }

  return configPath;
}

module.exports = function findConfig(options) {
  options = options || {};

  const searchPaths = options.searchPaths;
  const configNameSearch = options.configNameSearch;
  let configPath = options.configPath;

  if (!configPath) {
    if (!Array.isArray(searchPaths)) {
      throw new Error('Please provide an array of paths to search for config in.');
    }
    if (!configNameSearch) {
      throw new Error('Please provide a configNameSearch.');
    }

    configPath = searchForConfig(configNameSearch, searchPaths);
  }

  if (configPath && fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }

  return null;
};

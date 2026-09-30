const fs = require('fs');
const path = require('path');
const findUpSync = require('findup-sync');

function searchForConfig(configNameSearch, searchPaths) {
  let configPath;

  for (let index = 0; index < searchPaths.length; index += 1) {
    if (configPath) {
      break;
    }

    configPath = findUpSync(configNameSearch, {
      cwd: searchPaths[index],
      nocase: true,
    });
  }

  return configPath;
}

module.exports = function resolveConfigPath(options) {
  options = options || {};

  const configNameSearch = options.configNameSearch;
  let configPath = options.configPath;
  const searchPaths = options.searchPaths;

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

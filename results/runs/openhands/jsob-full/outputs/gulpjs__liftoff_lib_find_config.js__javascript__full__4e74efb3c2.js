const fs = require('fs');
const path = require('path');
const findUp = require('findup-sync');

const MISSING_SEARCH_PATHS_MESSAGE =
  'Please provide an array of paths to search for config in.';
const MISSING_CONFIG_NAME_MESSAGE = 'Please provide a configNameSearch.';

function findConfigFile(configNameSearch, searchPaths) {
  let configPath;

  for (let index = 0; index < searchPaths.length; index += 1) {
    if (configPath) {
      break;
    }

    configPath = findUp(configNameSearch, {
      cwd: searchPaths[index],
      nocase: true,
    });
  }

  return configPath;
}

module.exports = function (options) {
  options = options || {};

  const configNameSearch = options.configNameSearch;
  let configPath = options.configPath;
  const searchPaths = options.searchPaths;

  if (!configPath) {
    if (!Array.isArray(searchPaths)) {
      throw new Error(MISSING_SEARCH_PATHS_MESSAGE);
    }
    if (!configNameSearch) {
      throw new Error(MISSING_CONFIG_NAME_MESSAGE);
    }

    configPath = findConfigFile(configNameSearch, searchPaths);
  }

  if (configPath && fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }

  return null;
};

'use strict';

const fs = require('fs');
const path = require('path');
const findUp = require('findup-sync');

function findConfigFile(configNameSearch, searchPaths) {
  for (const searchPath of searchPaths) {
    const configPath = findUp(configNameSearch, {
      cwd: searchPath,
      nocase: true,
    });

    if (configPath) {
      return configPath;
    }
  }

  return undefined;
}

module.exports = function findConfig(options = {}) {
  const { configNameSearch, configPath, searchPaths } = options;
  let foundConfigPath = configPath;

  if (!foundConfigPath) {
    if (!Array.isArray(searchPaths)) {
      throw new Error('Please provide an array of paths to search for config in.');
    }
    if (!configNameSearch) {
      throw new Error('Please provide a configNameSearch.');
    }

    foundConfigPath = findConfigFile(configNameSearch, searchPaths);
  }

  if (foundConfigPath && fs.existsSync(foundConfigPath)) {
    return path.resolve(foundConfigPath);
  }

  return null;
};

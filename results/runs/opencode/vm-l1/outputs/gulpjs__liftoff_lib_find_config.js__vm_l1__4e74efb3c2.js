"use strict";

const fs = require("fs");
const path = require("path");
const findUp = require("findup-sync");

/**
 * Search for a configuration name from each candidate directory.
 *
 * `findup-sync` also checks parent directories, so the first search path with
 * a match wins.
 */
function findConfig(configNameSearch, searchPaths) {
  for (const searchPath of searchPaths) {
    const configPath = findUp(configNameSearch, { cwd: searchPath });
    if (configPath) {
      return configPath;
    }
  }

  return null;
}

/**
 * Resolve a tool's configuration file.
 *
 * Callers may provide `configPath` directly. Otherwise they must provide a
 * a filename/pattern and an ordered array of locations to search.
 */
module.exports = function resolveConfig(options) {
  options = options || {};

  const configNameSearch = options.configNameSearch;
  let configPath = options.configPath;
  const searchPaths = options.searchPaths;

  if (!configPath) {
    if (!Array.isArray(searchPaths)) {
      throw new Error("Please provide an array of paths to search for config in.");
    }
    if (!configNameSearch) {
      throw new Error("Please provide a configNameSearch.");
    }

    configPath = findConfig(configNameSearch, searchPaths);
  }

  if (configPath && fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }

  return null;
};

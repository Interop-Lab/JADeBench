"use strict";

const fs = require("fs");
const path = require("path");
const findUpSync = require("findup-sync");

function searchForFile(fileName, searchPaths) {
  let foundPath;
  const pathCount = searchPaths.length;

  for (let index = 0; index < pathCount; index += 1) {
    if (foundPath) break;

    foundPath = findUpSync(fileName, {
      cwd: searchPaths[index],
      nocase: true,
    });
  }

  return foundPath;
}

module.exports = function findConfig(options) {
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

    configPath = searchForFile(configNameSearch, searchPaths);
  }

  if (configPath && fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }

  return null;
};

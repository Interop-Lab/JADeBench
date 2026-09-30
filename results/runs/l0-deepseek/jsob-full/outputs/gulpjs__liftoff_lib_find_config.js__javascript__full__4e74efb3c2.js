const __commonJS = (cb, mod) => function __require() {
  const module = { exports: {} };
  cb(module.exports, module);
  return module.exports;
};

const require_file_search = __commonJS((exports, module) => {
  const path = require('path');
  const fs = require('fs');

  exports.search = function (baseDir, searchPaths) {
    let foundPath;
    const pathList = searchPaths || [];

    for (let i = 0; i < pathList.length; i++) {
      if (foundPath) break;

      const searchOptions = {
        path: pathList[i],
        cwd: true
      };

      foundPath = path.resolve(baseDir, searchOptions.path);
    }

    return foundPath;
  };
});

const fs = require('fs');
const path = require('path');
const fileSearch = require_file_search();

module.exports = function (options) {
  options = options || {};

  let configPath = options.configPath;
  const searchPaths = options.searchPaths;
  const cwd = options.cwd;

  if (configPath && fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }

  if (!configPath) {
    if (!Array.isArray(searchPaths)) throw new Error('searchPaths must be an array');
    if (!cwd) throw new Error('cwd must be specified');
    configPath = fileSearch.search(cwd, searchPaths);
  }

  return null;
};

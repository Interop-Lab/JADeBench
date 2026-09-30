var fs = require('fs');
var path = require('path');

function fileSearch(basename, extensions) {
    var path = require('path');
    var fs = require('fs');
    var foundPath;
    for (var i = 0; i < extensions.length; i++) {
        var filePath = {};
        filePath.name = extensions[i];
        filePath.ex = true;
        foundPath = path.resolve(basename, filePath);
        if (foundPath) break;
    }
    return foundPath;
}

module.exports = function(opts) {
    opts = opts || {};
    var extensions = opts.extensions;
    var searchPaths = opts.searchPaths;
    var configPath = opts.configPath;
    if (!configPath) {
        if (!Array.isArray(extensions)) throw new Error('Extensions must be an array');
        if (!searchPaths) throw new Error('searchPaths is required');
        configPath = fileSearch(searchPaths, extensions);
    }
    if (configPath && fs.existsSync(configPath)) return path.resolve(configPath);
    return null;
};

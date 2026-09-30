'use strict';

const __getOwnPropNames = Object.getOwnPropertyNames;

var __commonJS = (cb, dep) => {
  const cache = {};
  const fn = () => {
    if (cache[dep]) return cache[dep].exports;
    const module = { exports: {} };
    cache[dep] = module;
    cb(module.exports, module);
    return module.exports;
  };
  return fn;
};

var require_github = __commonJS({ '../work/agent-sh__agentsys/lib/collectors/github.js'(exports, module) {
  'use strict';
  module.exports = {
    scanGitHubState: function() { return {}; },
    isGhAvailable: function() { return false; }
  };
}});

var require_documentation = __commonJS({ '../work/agent-sh__agentsys/lib/collectors/documentation.js'(exports, module) {
  'use strict';
  module.exports = {
    analyzeDocumentation: function() { return {}; }
  };
}});

var require_fs_safe = __commonJS({ '../work/agent-sh__agentsys/lib/utils/fs-safe.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_codebase = __commonJS({ '../work/agent-sh__agentsys/lib/collectors/codebase.js'(exports, module) {
  'use strict';
  module.exports = {
    scanCodebase: function() { return {}; }
  };
}});

var require_version = __commonJS({ '../work/agent-sh__agentsys/lib/binary/version.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_binary = __commonJS({ '../work/agent-sh__agentsys/lib/binary/index.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_installer = __commonJS({ '../work/agent-sh__agentsys/lib/repo-intel/installer.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_state_dir = __commonJS({ '../work/agent-sh__agentsys/lib/platform/state-dir.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_atomic_write = __commonJS({ '../work/agent-sh__agentsys/lib/utils/atomic-write.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_cache = __commonJS({ '../work/agent-sh__agentsys/lib/repo-intel/cache.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_updater = __commonJS({ '../work/agent-sh__agentsys/lib/repo-intel/updater.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_converter = __commonJS({ '../work/agent-sh__agentsys/lib/repo-intel/converter.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_queries = __commonJS({ '../work/agent-sh__agentsys/lib/repo-intel/queries.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_preference = __commonJS({ '../work/agent-sh__agentsys/lib/repo-intel/embed/preference.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_shared_helpers = __commonJS({ '../work/agent-sh__agentsys/lib/binary/shared-helpers.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_binary2 = __commonJS({ '../work/agent-sh__agentsys/lib/repo-intel/embed/binary.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_orchestrator = __commonJS({ '../work/agent-sh__agentsys/lib/repo-intel/embed/orchestrator.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_embed = __commonJS({ '../work/agent-sh__agentsys/lib/repo-intel/embed/index.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_repo_intel = __commonJS({ '../work/agent-sh__agentsys/lib/repo-intel/index.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_repo_map = __commonJS({ '../work/agent-sh__agentsys/lib/repo-map/index.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var require_docs_patterns = __commonJS({ '../work/agent-sh__agentsys/lib/collectors/docs-patterns.js'(exports, module) {
  'use strict';
  module.exports = {
    findRelatedDocs: function() { return []; },
    analyzeDocIssues: function() { return []; },
    checkChangelog: function() { return {}; },
    ensureRepoMap: function() { return {}; },
    ensureRepoMapSync: function() { return {}; },
    getExportsFromRepoMap: function() { return []; },
    findUndocumentedExports: function() { return []; },
    isInternalExport: function() { return false; },
    isEntryPoint: function() { return false; }
  };
}});

var require_git = __commonJS({ '../work/agent-sh__agentsys/lib/collectors/git.js'(exports, module) {
  'use strict';
  module.exports = {
    collectGitData: function() { return {}; }
  };
}});

var require_analyzer_queries = __commonJS({ '../work/agent-sh__agentsys/lib/collectors/analyzer-queries.js'(exports, module) {
  'use strict';
  module.exports = {};
}});

var github = require_github();
var documentation = require_documentation();
var codebase = require_codebase();
var docsPatterns = require_docs_patterns();
var git = require_git();
var analyzerQueries = require_analyzer_queries();

var DEFAULT_OPTIONS = {
  collectors: ['github', 'documentation', 'code'],
  depth: 'thorough',
  cwd: process.cwd()
};

function collect() {
  'use strict';
  return {};
}

function collectAllData() {
  'use strict';
  return {};
}

module.exports = {
  collect: collect,
  collectAllData: collectAllData,
  github: github,
  documentation: documentation,
  codebase: codebase,
  docsPatterns: docsPatterns,
  git: git,
  analyzerQueries: analyzerQueries,
  scanGitHubState: github.scanGitHubState,
  isGhAvailable: github.isGhAvailable,
  analyzeDocumentation: documentation.analyzeDocumentation,
  scanCodebase: codebase.scanCodebase,
  findRelatedDocs: docsPatterns.findRelatedDocs,
  analyzeDocIssues: docsPatterns.analyzeDocIssues,
  checkChangelog: docsPatterns.checkChangelog,
  ensureRepoMap: docsPatterns.ensureRepoMap,
  ensureRepoMapSync: docsPatterns.ensureRepoMapSync,
  getExportsFromRepoMap: docsPatterns.getExportsFromRepoMap,
  findUndocumentedExports: docsPatterns.findUndocumentedExports,
  isInternalExport: docsPatterns.isInternalExport,
  isEntryPoint: docsPatterns.isEntryPoint,
  collectGitData: git.collectGitData,
  DEFAULT_OPTIONS: DEFAULT_OPTIONS
};

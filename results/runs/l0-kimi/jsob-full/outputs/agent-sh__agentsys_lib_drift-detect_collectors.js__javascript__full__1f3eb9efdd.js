'use strict';

const __getOwnPropNames = Object.getOwnPropertyNames;
const __commonJS = (cb, mod) => function __require() {
  const m = {};
  return mod || (0, cb[__getOwnPropNames(cb)[0]])(m, m), m.exports;
};

const require_github = __commonJS({
  '../work/agent-sh__agentsys/lib/collectors/github.js'(exports, module) {
    'use strict';
    
    const binary = require_binary();
    const DEFAULT_OPTIONS = {
      top: 20,
      adjustForAi: false,
      cwd: process.cwd()
    };
    
    function collectGitHubData(options = {}) {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      const cwd = opts.cwd || process.cwd();
      
      try {
        binary.checkSync();
      } catch (err) {
        return {
          success: false,
          error: 'Failed to check git binary: ' + err.message
        };
      }
      
      let result;
      try {
        const output = binary.execSync(['log', '--format=%H|%an|%ae|%at|%s', cwd]);
        result = JSON.parse(output);
      } catch (err) {
        return {
          success: false,
          error: 'Failed to parse git log: ' + err.message
        };
      }
      
      const files = result.files || {};
      const authors = result.authors || {};
      const aiAttribution = result.aiAttribution || {};
      const conventions = result.conventions || {};
      const releases = result.releases || {};
      
      const fileStats = Object.entries(files)
        .map(([path, data]) => ({
          path,
          changes: data.changes || 0,
          recentChanges: data.recentChanges || 0,
          authors: data.authors ? Object.keys(data.authors).length : 0,
          lastChanged: data.lastChanged || null
        }))
        .sort((a, b) => b.changes - a.changes)
        .slice(0, opts.top);
      
      const authorList = Object.entries(authors)
        .map(([name, data]) => ({
          name,
          commits: data.commits || 0,
          firstSeen: data.firstSeen || null,
          lastSeen: data.lastSeen || null
        }))
        .sort((a, b) => b.commits - a.commits);
      
      const totalCommits = authorList.reduce((sum, a) => sum + a.commits, 0);
      let busFactor = 0;
      let cumulative = 0;
      for (const author of authorList) {
        cumulative += author.commits;
        busFactor++;
        if (cumulative >= totalCommits * 0.8) break;
      }
      
      const aiRatio = (aiAttribution.attributed || 0) / (aiAttribution.total || 1);
      const normalizedAiRatio = totalCommits > 0 ? aiRatio : 0;
      
      const conventionData = {
        message: conventions.message || null,
        structure: conventions.structure || {},
        hasReleases: conventions.hasReleases || false
      };
      
      return {
        available: true,
        health: {
          active: authorList.length > 0,
          busFactor,
          aiRatio: Math.min(normalizedAiRatio, 1),
          totalCommits,
          totalContributors: authorList.length
        },
        hotspots: fileStats,
        contributors: authorList.slice(0, 10),
        aiAttribution: {
          ratio: Math.min(normalizedAiRatio, 1),
          attributed: aiAttribution.attributed || 0,
          heuristic: aiAttribution.heuristic || 0,
          none: aiAttribution.none || 0,
          confidence: aiAttribution.confidence || 'low',
          tools: aiAttribution.tools || {}
        },
        busFactor,
        conventions: conventionData,
        releaseInfo: {
          tagCount: releases.tags ? releases.tags.length : 0,
          lastRelease: releases.latest && releases.latest.date ? releases.latest.date : null,
          cadence: releases.cadence || null
        }
      };
    }
    
    module.exports = {
      collect: collectGitHubData,
      DEFAULT_OPTIONS
    };
  }
});

const require_git = __commonJS({
  '../work/agent-sh__agentsys/lib/collectors/git.js'(exports, module) {
    'use strict';
    
    const binary = require_binary();
    const DEFAULT_OPTIONS = {
      top: 20,
      adjustForAi: false,
      cwd: process.cwd()
    };
    
    function collectGitData(options = {}) {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      const cwd = opts.cwd || process.cwd();
      
      try {
        binary.checkSync();
      } catch (err) {
        return {
          success: false,
          error: 'Failed to check git binary: ' + err.message
        };
      }
      
      let result;
      try {
        const output = binary.execSync(['log', '--format=%H|%an|%ae|%at|%s', cwd]);
        result = JSON.parse(output);
      } catch (err) {
        return {
          success: false,
          error: 'Failed to parse git log: ' + err.message
        };
      }
      
      const files = result.files || {};
      const authors = result.authors || {};
      const aiAttribution = result.aiAttribution || {};
      const conventions = result.conventions || {};
      const releases = result.releases || {};
      
      const fileStats = Object.entries(files)
        .map(([path, data]) => ({
          path,
          changes: data.changes || 0,
          recentChanges: data.recentChanges || 0,
          authors: data.authors ? Object.keys(data.authors).length : 0,
          lastChanged: data.lastChanged || null
        }))
        .sort((a, b) => b.changes - a.changes)
        .slice(0, opts.top);
      
      const authorList = Object.entries(authors)
        .map(([name, data]) => ({
          name,
          commits: data.commits || 0,
          firstSeen: data.firstSeen || null,
          lastSeen: data.lastSeen || null
        }))
        .sort((a, b) => b.commits - a.commits);
      
      const totalCommits = authorList.reduce((sum, a) => sum + a.commits, 0);
      let busFactor = 0;
      let cumulative = 0;
      for (const author of authorList) {
        cumulative += author.commits;
        busFactor++;
        if (cumulative >= totalCommits * 0.8) break;
      }
      
      const aiRatio = (aiAttribution.attributed || 0) / (aiAttribution.total || 1);
      const normalizedAiRatio = totalCommits > 0 ? aiRatio : 0;
      
      const conventionData = {
        message: conventions.message || null,
        structure: conventions.structure || {},
        hasReleases: conventions.hasReleases || false
      };
      
      return {
        available: true,
        health: {
          active: authorList.length > 0,
          busFactor,
          aiRatio: Math.min(normalizedAiRatio, 1),
          totalCommits,
          totalContributors: authorList.length
        },
        hotspots: fileStats,
        contributors: authorList.slice(0, 10),
        aiAttribution: {
          ratio: Math.min(normalizedAiRatio, 1),
          attributed: aiAttribution.attributed || 0,
          heuristic: aiAttribution.heuristic || 0,
          none: aiAttribution.none || 0,
          confidence: aiAttribution.confidence || 'low',
          tools: aiAttribution.tools || {}
        },
        busFactor,
        conventions: conventionData,
        releaseInfo: {
          tagCount: releases.tags ? releases.tags.length : 0,
          lastRelease: releases.latest && releases.latest.date ? releases.latest.date : null,
          cadence: releases.cadence || null
        }
      };
    }
    
    module.exports = {
      collect: collectGitData,
      DEFAULT_OPTIONS
    };
  }
});

const require_analyzer_queries = __commonJS({
  '../work/agent-sh__agentsys/lib/collectors/analyzer-queries.js'(exports, module) {
    'use strict';
    
    const fs = require('fs');
    const path = require('path');
    const DEFAULT_CWD = { cwd: process.cwd() };
    const EXCLUDE_PATTERNS = [
      /(^|\/)versioned_docs\//,
      /(^|\/)versioned_sidebars\//,
      /(^|\/)tests\/fixtures\//,
      /(^|\/)__fixtures__\//,
      /(^|\/)generated\//,
      /\.generated\.md$/,
      /(^|\/)CHANGELOG\.md$/i,
      /(^|\/)node_modules\//,
      /(^|\/)target\//,
      /(^|\/)dist\//,
      /(^|\/)build\//
    ];
    
    function findConfigFile(startPath) {
      for (const name of ['.analyzer.json', 'analyzer.json', '.analyzer.config.json']) {
        if (fs.existsSync(path.join(startPath, name))) {
          return name;
        }
      }
      return null;
    }
    
    function resolveConfigPath(configPath) {
      if (!configPath) return null;
      return path.resolve(configPath);
    }
    
    function normalizePath(p) {
      return path.normalize(p).replace(/\\/g, '/');
    }
    
    function loadConfig(configPath) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(content);
      } catch {
        return null;
      }
    }
    
    function ensureArray(val) {
      return Array.isArray(val) ? val : [];
    }
    
    function collectAnalyzerData(options = {}) {
      const opts = { ...DEFAULT_CWD, ...options };
      const cwd = opts.cwd || process.cwd();
      const configPath = resolveConfigPath(opts.configPath);
      
      const result = {
        success: false,
        error: null,
        configPath: configPath,
        cwd: cwd,
        queries: [],
        rules: null,
        patterns: null,
        excludePatterns: null,
        milestones: null,
        labels: null,
        issues: null,
        pullRequests: null,
        discussions: null,
        releases: null,
        tags: null,
        branches: null,
        commits: null,
        contributors: null,
        files: null,
        dependencies: null,
        devDependencies: null,
        peerDependencies: null,
        optionalDependencies: null,
        bundledDependencies: null
      };
      
      const binary = findBinary();
      if (!binary) {
        result.error = 'Binary not found';
        return result;
      }
      
      if (!fs.existsSync(cwd)) {
        result.error = 'Directory not found';
        return result;
      }
      
      const top = opts.top || 20;
      const maxResults = opts.maxResults || 100;
      const errors = [];
      
      const runQuery = (name, args) => {
        try {
          const output = loadConfig(binary, args);
          if (output !== null) {
            errors.push(name);
          }
          return output;
        } catch {
          return null;
        }
      };
      
      const queries = ensureArray(runQuery('queries', ['queries', 'list', '--json', String(top), '--cwd', cwd]));
      const rules = ensureArray(runQuery('rules', ['rules', 'list', '--json', String(maxResults), '--cwd', cwd]));
      const patterns = ensureArray(runQuery('patterns', ['patterns', 'list', '--json', '--cwd', cwd]));
      const milestones = runQuery('milestones', ['milestones', 'list', '--json', '--cwd', cwd]);
      const milestonesArray = Array.isArray(milestones) ? milestones : ensureArray(milestones?.items);
      
      const fileMap = new Map();
      const ruleMap = new Map();
      
      for (const query of queries) {
        const normalized = normalizePath(query.path);
        query.normalizedPath = normalized;
        const key = normalized + ':' + query.type + ':' + query.name;
        fileMap.set(key, query);
        if (!ruleMap.has(normalized)) {
          ruleMap.set(normalized, []);
        }
        ruleMap.get(normalized).push(query);
      }
      
      const patternSet = new Set();
      const patternFiles = new Set();
      
      for (const pattern of patterns) {
        const normalized = normalizePath(pattern.path);
        if (normalized) patternSet.add(normalized);
        if (pattern.files && normalized) {
          patternFiles.add(normalized + ':' + pattern.files);
        }
      }
      
      const excludePatterns = opts.excludePatterns || EXCLUDE_PATTERNS;
      const filteredRules = rules.filter(rule => {
        const normalized = normalizePath(rule.path);
        return !excludePatterns.some(p => p.test(normalized));
      });
      
      const statusMap = {
        open: 'open',
        closed: 'closed',
        merged: 'merged',
        draft: 'draft'
      };
      
      const openIssues = [];
      const closedIssues = [];
      const openPRs = [];
      const mergedPRs = [];
      const draftPRs = [];
      
      for (const item of milestonesArray) {
        const status = statusMap[item.status];
        if (status) {
          const target = status === 'open' ? openIssues : closedIssues;
          target.push(item);
        }
      }
      
      const hasData = errors.length > 0;
      
      return {
        success: hasData,
        error: hasData ? null : 'No data collected',
        configPath: configPath,
        cwd: cwd,
        queries: queries,
        fileMap: fileMap,
        ruleMap: ruleMap,
        rules: filteredRules,
        allRules: rules,
        patterns: patterns,
        patternSet: patternSet,
        patternFiles: patternFiles,
        milestones: milestonesArray,
        openIssues: openIssues,
        closedIssues: closedIssues,
        openPRs: openPRs,
        mergedPRs: mergedPRs,
        draftPRs: draftPRs
      };
    }
    
    function hasPattern(data, filePath, patternName) {
      if (!data?.patternFiles) return false;
      const normalized = normalizePath(filePath);
      return data.patternFiles.has(normalized + ':' + patternName) || data.patternFiles.has(normalized);
    }
    
    module.exports = {
      DEFAULT_CWD,
      EXCLUDE_PATTERNS,
      collect: collectAnalyzerData,
      findConfig: findConfigFile,
      resolve: resolveConfigPath,
      normalize: normalizePath,
      load: loadConfig,
      hasPattern
    };
  }
});

const require_collectors = __commonJS({
  '../work/agent-sh__agentsys/lib/collectors/index.js'(exports, module) {
    'use strict';
    
    const github = require_github();
    const documentation = require_documentation();
    const codebase = require_codebase();
    const docsPatterns = require_docs_patterns();
    const git = require_git();
    const analyzer = require_analyzer_queries();
    
    const DEFAULT_OPTIONS = {
      collectors: ['github', 'docs', 'code'],
      depth: 'standard',
      cwd: process.cwd()
    };
    
    function collectAll(options = {}) {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      const activeCollectors = Array.isArray(opts.collectors) ? opts.collectors : DEFAULT_OPTIONS.collectors;
      
      const result = {
        timestamp: new Date().toISOString(),
        options: opts,
        github: null,
        docs: null,
        code: null,
        docsPatterns: null,
        git: null,
        analyzer: null
      };
      
      if (activeCollectors.includes('analyzer')) {
        result.analyzer = analyzer.collect(opts);
        opts.analyzer = result.analyzer;
      }
      
      if (activeCollectors.includes('github')) {
        result.github = github.collect(opts);
      }
      
      if (activeCollectors.includes('docs')) {
        result.docs = documentation.collect(opts);
      }
      
      if (activeCollectors.includes('code')) {
        result.code = codebase.collect(opts);
      }
      
      if (activeCollectors.includes('docsPatterns')) {
        result.docsPatterns = docsPatterns.collect(opts);
      }
      
      if (activeCollectors.includes('git')) {
        result.git = git.collect(opts);
      }
      
      return result;
    }
    
    function collectWithDefaults(options = {}) {
      let collectors = ['github', 'docs', 'code'];
      
      if (options.collectors) {
        collectors = options.collectors;
      } else if (options.collectorsList) {
        collectors = options.collectorsList;
      }
      
      const opts = { ...options, collectors };
      return collectAll(opts);
    }
    
    module.exports = {
      collect: collectAll,
      collectWithDefaults,
      github,
      documentation,
      codebase,
      docsPatterns,
      git,
      analyzer,
      DEFAULT_OPTIONS,
      githubCollect: github.collect,
      githubDefaultOptions: github.DEFAULT_OPTIONS,
      documentationCollect: documentation.collect,
      codebaseCollect: codebase.collect,
      docsPatternsCollect: docsPatterns.collect,
      docsPatternsDefaultOptions: docsPatterns.DEFAULT_OPTIONS,
      docsPatternsExcludePatterns: docsPatterns.EXCLUDE_PATTERNS,
      docsPatternsFindConfig: docsPatterns.findConfig,
      docsPatternsResolve: docsPatterns.resolve,
      docsPatternsNormalize: docsPatterns.normalize,
      docsPatternsLoad: docsPatterns.load,
      docsPatternsHasPattern: docsPatterns.hasPattern,
      gitCollect: git.collect
    };
  }
});

const collectors = require_collectors();

const DEFAULT_OPTIONS = {
  collectors: ['github', 'docs', 'code'],
  depth: 'standard',
  cwd: process.cwd(),
  init: collectors.collectors.init,
  run: collectors.collectors.run
};

const moduleExports = {
  DEFAULT_OPTIONS,
  collect: collectors.collect,
  collectWithDefaults: collectors.collectWithDefaults,
  github: collectors.github,
  documentation: collectors.documentation,
  codebase: collectors.codebase,
  docsPatterns: collectors.docsPatterns,
  git: collectors.git,
  analyzer: collectors.analyzer,
  githubCollect: collectors.githubCollect,
  githubDefaultOptions: collectors.githubDefaultOptions,
  documentationCollect: collectors.documentationCollect,
  codebaseCollect: collectors.codebaseCollect,
  docsPatternsCollect: collectors.docsPatternsCollect,
  docsPatternsDefaultOptions: collectors.docsPatternsDefaultOptions,
  docsPatternsExcludePatterns: collectors.docsPatternsExcludePatterns,
  docsPatternsFindConfig: collectors.docsPatternsFindConfig,
  docsPatternsResolve: collectors.docsPatternsResolve,
  docsPatternsNormalize: collectors.docsPatternsNormalize,
  docsPatternsLoad: collectors.docsPatternsLoad,
  docsPatternsHasPattern: collectors.docsPatternsHasPattern,
  gitCollect: collectors.gitCollect
};

module.exports = moduleExports;

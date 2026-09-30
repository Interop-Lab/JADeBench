"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/agent-sh__agentsys/lib/collectors/github.js
var require_github = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/github.js"(exports2, module2) {
    "use strict";
    var { execFileSync } = require("child_process");
    var DEFAULT_OPTIONS2 = {
      issueLimit: 100,
      prLimit: 50,
      milestoneLimit: 100,
      timeout: 1e4,
      cwd: process.cwd()
    };
    function execGh(args, options = {}) {
      const result = execGhWithResult(args, options);
      return result.ok ? result.data : null;
    }
    function execGhWithResult(args, options = {}) {
      try {
        const output = execFileSync("gh", args, {
          encoding: "utf8",
          stdio: "pipe",
          timeout: options.timeout || DEFAULT_OPTIONS2.timeout,
          cwd: options.cwd || DEFAULT_OPTIONS2.cwd
        });
        try {
          return { ok: true, data: JSON.parse(output) };
        } catch (error) {
          return {
            ok: false,
            error: {
              type: "parse",
              message: `Failed to parse gh output as JSON: ${error.message}`,
              raw: output.slice(0, 500)
            }
          };
        }
      } catch (error) {
        return {
          ok: false,
          error: {
            type: error.killed ? "timeout" : "process",
            message: error.message,
            exitCode: error.status ?? null,
            stderr: error.stderr ? String(error.stderr).trim() : ""
          }
        };
      }
    }
    function isGhAvailable() {
      try {
        execFileSync("gh", ["auth", "status"], {
          encoding: "utf8",
          stdio: "pipe",
          timeout: 5e3
        });
        return true;
      } catch {
        return false;
      }
    }
    function summarizeIssue(item) {
      return {
        number: item.number,
        title: item.title,
        labels: (item.labels || []).map((l) => l.name || l),
        milestone: item.milestone?.title || item.milestone || null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        snippet: item.body ? item.body.slice(0, 200).replace(/\n/g, " ").trim() + (item.body.length > 200 ? "..." : "") : ""
      };
    }
    function summarizePR(item) {
      return {
        number: item.number,
        title: item.title,
        labels: (item.labels || []).map((l) => l.name || l),
        isDraft: item.isDraft,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        files: item.files || [],
        snippet: item.body ? item.body.slice(0, 150).replace(/\n/g, " ").trim() + (item.body.length > 150 ? "..." : "") : ""
      };
    }
    function categorizeIssues(result, issues) {
      const labelMap = {
        bug: "bugs",
        "type: bug": "bugs",
        feature: "features",
        "type: feature": "features",
        enhancement: "enhancements",
        security: "security",
        "type: security": "security"
      };
      const labelPatterns = Object.entries(labelMap).map(([pattern, category]) => ({
        regex: new RegExp(`(^|[^a-z])${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "i"),
        category
      }));
      for (const issue of issues) {
        const labels = (issue.labels || []).map((l) => (l.name || l).toLowerCase());
        let categorized = false;
        const ref = { number: issue.number, title: issue.title };
        for (const { regex, category } of labelPatterns) {
          if (labels.some((l) => regex.test(l))) {
            result.categorized[category].push(ref);
            categorized = true;
            break;
          }
        }
        if (!categorized) {
          result.categorized.other.push(ref);
        }
      }
    }
    function findStaleItems(result, items, staleDays) {
      const staleDate = /* @__PURE__ */ new Date();
      staleDate.setDate(staleDate.getDate() - staleDays);
      for (const item of items) {
        const updated = new Date(item.updatedAt);
        if (updated < staleDate) {
          result.stale.push({
            number: item.number,
            title: item.title,
            lastUpdated: item.updatedAt,
            daysStale: Math.floor((Date.now() - updated) / (1e3 * 60 * 60 * 24))
          });
        }
      }
    }
    function extractThemes(result, issues) {
      const words = {};
      const stopWords = /* @__PURE__ */ new Set(["the", "a", "an", "is", "are", "to", "for", "in", "on", "at", "with", "and", "or", "of"]);
      for (const issue of issues) {
        const titleWords = (issue.title || "").toLowerCase().split(/\s+/);
        for (const word of titleWords) {
          if (word.length > 3 && !stopWords.has(word)) {
            words[word] = (words[word] || 0) + 1;
          }
        }
      }
      result.themes = Object.entries(words).filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([word, count]) => ({ word, count }));
    }
    function findOverdueMilestones(result) {
      const now = /* @__PURE__ */ new Date();
      result.overdueMilestones = result.milestones.filter((m) => {
        if (!m.due_on || m.state === "closed") return false;
        return new Date(m.due_on) < now;
      });
    }
    function scanGitHubState(options = {}) {
      const opts = { ...DEFAULT_OPTIONS2, ...options };
      const result = {
        available: false,
        partial: false,
        errors: [],
        summary: { issueCount: 0, prCount: 0, milestoneCount: 0 },
        issues: [],
        prs: [],
        milestones: [],
        overdueMilestones: [],
        pagination: {
          issues: { requestedLimit: opts.issueLimit, fetchedCount: 0, hasMore: false },
          prs: { requestedLimit: opts.prLimit, fetchedCount: 0, hasMore: false },
          milestones: { requestedLimit: opts.milestoneLimit, fetchedCount: 0, hasMore: false }
        },
        categorized: { bugs: [], features: [], security: [], enhancements: [], other: [] },
        stale: [],
        themes: []
      };
      if (!isGhAvailable()) {
        result.error = "gh CLI not available or not authenticated";
        return result;
      }
      result.available = true;
      const issuesResult = execGhWithResult([
        "issue",
        "list",
        "--state",
        "open",
        "--json",
        "number,title,labels,milestone,createdAt,updatedAt,body",
        "--limit",
        String(opts.issueLimit)
      ], opts);
      if (issuesResult.ok && Array.isArray(issuesResult.data)) {
        const issues = issuesResult.data;
        result.issues = issues.map(summarizeIssue);
        result.summary.issueCount = issues.length;
        result.pagination.issues.fetchedCount = issues.length;
        result.pagination.issues.hasMore = opts.issueLimit > 0 && issues.length >= opts.issueLimit;
        categorizeIssues(result, issues);
        findStaleItems(result, issues, 90);
        extractThemes(result, issues);
      } else if (!issuesResult.ok) {
        result.errors.push({ source: "issues", ...issuesResult.error });
      }
      const prsResult = execGhWithResult([
        "pr",
        "list",
        "--state",
        "open",
        "--json",
        "number,title,labels,isDraft,createdAt,updatedAt,body,files",
        "--limit",
        String(opts.prLimit)
      ], opts);
      if (prsResult.ok && Array.isArray(prsResult.data)) {
        const prs = prsResult.data;
        result.prs = prs.map(summarizePR);
        result.summary.prCount = prs.length;
        result.pagination.prs.fetchedCount = prs.length;
        result.pagination.prs.hasMore = opts.prLimit > 0 && prs.length >= opts.prLimit;
      } else if (!prsResult.ok) {
        result.errors.push({ source: "prs", ...prsResult.error });
      }
      const milestonesResult = execGhWithResult([
        "api",
        "repos/{owner}/{repo}/milestones",
        "--paginate",
        "--slurp"
      ], opts);
      if (milestonesResult.ok && Array.isArray(milestonesResult.data)) {
        const pages = milestonesResult.data;
        const allMilestones = pages.flatMap((page) => Array.isArray(page) ? page : []);
        const mappedMilestones = allMilestones.map((milestone) => ({
          title: milestone.title,
          state: milestone.state,
          due_on: milestone.due_on,
          open_issues: milestone.open_issues,
          closed_issues: milestone.closed_issues
        }));
        result.pagination.milestones.fetchedCount = mappedMilestones.length;
        result.pagination.milestones.hasMore = opts.milestoneLimit > 0 && mappedMilestones.length > opts.milestoneLimit;
        result.milestones = mappedMilestones.slice(0, opts.milestoneLimit);
        result.summary.milestoneCount = result.milestones.length;
        findOverdueMilestones(result);
      } else if (!milestonesResult.ok) {
        result.errors.push({ source: "milestones", ...milestonesResult.error });
      }
      result.partial = result.errors.length > 0;
      if (result.partial && !result.error) {
        result.error = "Partial GitHub data collected";
      }
      return result;
    }
    module2.exports = {
      DEFAULT_OPTIONS: DEFAULT_OPTIONS2,
      scanGitHubState,
      isGhAvailable,
      execGh,
      summarizeIssue,
      summarizePR,
      categorizeIssues,
      findStaleItems,
      extractThemes,
      findOverdueMilestones
    };
  }
});

// ../work/agent-sh__agentsys/lib/collectors/documentation.js
var require_documentation = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/documentation.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var DEFAULT_OPTIONS2 = {
      depth: "thorough",
      cwd: process.cwd()
    };
    function isPathSafe(filePath, basePath) {
      const resolved = path.resolve(basePath, filePath);
      return resolved.startsWith(path.resolve(basePath));
    }
    function safeReadFile(filePath, basePath) {
      const fullPath = path.resolve(basePath, filePath);
      if (!isPathSafe(filePath, basePath)) {
        return null;
      }
      try {
        return fs.readFileSync(fullPath, "utf8");
      } catch {
        return null;
      }
    }
    function analyzeMarkdownFile(content, filePath) {
      const sectionMatches = content.match(/^##\s{1,1000}(.+)$/gm) || [];
      const sections = sectionMatches.slice(0, 10).map((s) => s.replace(/^##\s+/, ""));
      const sectionLower = sections.map((s) => s.toLowerCase()).join(" ");
      return {
        path: filePath,
        sectionCount: sectionMatches.length,
        sections,
        hasInstallation: /install|setup|getting.started/i.test(sectionLower),
        hasUsage: /usage|how.to|example/i.test(sectionLower),
        hasApi: /api|reference|methods/i.test(sectionLower),
        hasTesting: /test|spec|coverage/i.test(sectionLower),
        codeBlocks: Math.floor((content.match(/```/g) || []).length / 2),
        wordCount: content.split(/\s+/).length
      };
    }
    function extractCheckboxes(result, content) {
      const checked = (content.match(/^[-*]\s+\[x\]/gim) || []).length;
      const unchecked = (content.match(/^[-*]\s+\[\s\]/gim) || []).length;
      result.checkboxes.checked += checked;
      result.checkboxes.unchecked += unchecked;
      result.checkboxes.total += checked + unchecked;
    }
    function extractFeatures(result, content) {
      const featurePattern = /^[-*]\s{1,100}\*{0,2}([^\n]{1,2000}?)\*{0,2}(?:\s{0,100}[-–]\s{0,100}([^\n]{1,2000}))?$/gm;
      let match;
      while ((match = featurePattern.exec(content)) !== null && result.features.length < 20) {
        const feature = match[1].trim();
        if (feature.length > 5 && feature.length < 80) {
          result.features.push(feature);
        }
      }
      result.features = [...new Set(result.features)].slice(0, 20);
    }
    function extractPlans(result, content) {
      const planPatterns = [
        /(?:TODO|FIXME|PLAN):\s*(.+)/gi,
        /^##\s+(?:Roadmap|Future|Planned|Coming Soon)/gim
      ];
      for (const pattern of planPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null && result.plans.length < 15) {
          const plan = (match[1] || match[0]).slice(0, 100);
          result.plans.push(plan);
        }
      }
    }
    function identifyDocGaps(result) {
      const readme = result.files["README.md"];
      if (!readme) {
        result.gaps.push({ type: "missing", file: "README.md", severity: "high" });
      } else {
        if (!readme.hasInstallation) {
          result.gaps.push({ type: "missing-section", file: "README.md", section: "Installation", severity: "medium" });
        }
        if (!readme.hasUsage) {
          result.gaps.push({ type: "missing-section", file: "README.md", section: "Usage", severity: "medium" });
        }
      }
      if (!result.files["CHANGELOG.md"]) {
        result.gaps.push({ type: "missing", file: "CHANGELOG.md", severity: "low" });
      }
    }
    function analyzeDocumentation(options = {}) {
      const opts = { ...DEFAULT_OPTIONS2, ...options };
      const basePath = opts.cwd;
      const result = {
        summary: { fileCount: 0, totalWords: 0 },
        files: {},
        features: [],
        plans: [],
        checkboxes: { total: 0, checked: 0, unchecked: 0 },
        gaps: []
      };
      const docFiles = [
        "README.md",
        "PLAN.md",
        "CLAUDE.md",
        "AGENTS.md",
        "CONTRIBUTING.md",
        "CHANGELOG.md",
        "docs/README.md",
        "docs/PLAN.md"
      ];
      for (const file of docFiles) {
        const content = safeReadFile(file, basePath);
        if (content) {
          const analysis = analyzeMarkdownFile(content, file);
          result.files[file] = analysis;
          result.summary.totalWords += analysis.wordCount;
          extractCheckboxes(result, content);
          extractFeatures(result, content);
          extractPlans(result, content);
        }
      }
      if (opts.depth === "thorough") {
        const docsDir = path.join(basePath, "docs");
        if (fs.existsSync(docsDir)) {
          try {
            const additionalFiles = fs.readdirSync(docsDir).filter((f) => f.endsWith(".md") && !docFiles.includes(`docs/${f}`));
            for (const file of additionalFiles.slice(0, 5)) {
              const filePath = `docs/${file}`;
              const content = safeReadFile(filePath, basePath);
              if (content) {
                const analysis = analyzeMarkdownFile(content, filePath);
                result.files[filePath] = analysis;
                result.summary.totalWords += analysis.wordCount;
              }
            }
          } catch {
          }
        }
      }
      result.summary.fileCount = Object.keys(result.files).length;
      identifyDocGaps(result);
      return result;
    }
    module2.exports = {
      DEFAULT_OPTIONS: DEFAULT_OPTIONS2,
      analyzeDocumentation,
      analyzeMarkdownFile,
      safeReadFile,
      isPathSafe,
      extractCheckboxes,
      extractFeatures,
      extractPlans,
      identifyDocGaps
    };
  }
});

// ../work/agent-sh__agentsys/lib/utils/fs-safe.js
var require_fs_safe = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/fs-safe.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    function readFileWithLimit(filePath, maxSize, encoding = "utf8") {
      const fd = fs.openSync(filePath, "r");
      try {
        const stat = fs.fstatSync(fd);
        if (!stat.isFile()) {
          const err = new Error(`Not a regular file: ${filePath}`);
          err.code = "ENOTFILE";
          throw err;
        }
        if (typeof maxSize === "number" && stat.size > maxSize) {
          const err = new Error(`File too large: ${stat.size} > ${maxSize} bytes`);
          err.code = "EFBIG";
          throw err;
        }
        return fs.readFileSync(fd, encoding);
      } finally {
        fs.closeSync(fd);
      }
    }
    module2.exports = { readFileWithLimit };
  }
});

// ../work/agent-sh__agentsys/lib/collectors/codebase.js
var require_codebase = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/codebase.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var { readFileWithLimit } = require_fs_safe();
    var DEFAULT_OPTIONS2 = {
      depth: "thorough",
      cwd: process.cwd()
    };
    var MAX_FILE_SIZE = 5e4;
    var EXCLUDE_DIRS = [
      "node_modules",
      "vendor",
      "dist",
      "build",
      "out",
      "target",
      ".git",
      ".svn",
      ".hg",
      "__pycache__",
      ".pytest_cache",
      "coverage",
      ".nyc_output",
      ".next",
      ".nuxt",
      ".cache"
    ];
    var SOURCE_EXTENSIONS = {
      js: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"],
      rust: [".rs"],
      go: [".go"],
      python: [".py"],
      java: [".java"]
    };
    function safeReadFile(filePath, basePath) {
      const fullPath = path.resolve(basePath, filePath);
      const resolvedBase = path.resolve(basePath);
      if (!fullPath.startsWith(resolvedBase)) {
        return null;
      }
      try {
        return fs.readFileSync(fullPath, "utf8");
      } catch {
        return null;
      }
    }
    function shouldExclude(filePath, excludeDirs = EXCLUDE_DIRS) {
      const parts = filePath.split(/[\\/]/);
      return parts.some((part) => excludeDirs.includes(part));
    }
    function detectFrameworks(result, pkgJson) {
      const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
      const frameworkMap = {
        react: "React",
        "react-dom": "React",
        next: "Next.js",
        vue: "Vue.js",
        nuxt: "Nuxt",
        angular: "Angular",
        express: "Express",
        fastify: "Fastify",
        koa: "Koa",
        nestjs: "NestJS"
      };
      for (const [pkgName, framework] of Object.entries(frameworkMap)) {
        if (deps[pkgName]) {
          result.frameworks.push(framework);
        }
      }
      result.frameworks = [...new Set(result.frameworks)];
    }
    function detectTestFramework(result, pkgJson) {
      const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
      const testFrameworks = ["jest", "mocha", "vitest", "ava", "tap", "jasmine"];
      for (const framework of testFrameworks) {
        if (deps[framework]) {
          result.testFramework = framework;
          result.health.hasTests = true;
          break;
        }
      }
    }
    function extractSymbols(content) {
      const symbols = {
        functions: [],
        classes: [],
        exports: []
      };
      const funcPattern = /(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
      let match;
      while ((match = funcPattern.exec(content)) !== null) {
        symbols.functions.push(match[1]);
      }
      const arrowPattern = /(?:const|let)\s{1,1000}([a-zA-Z_$][a-zA-Z0-9_$]*)\s{0,1000}=\s{0,1000}(?:async\s{0,1000})?\([^)]{0,2000}\)\s{0,1000}=>/g;
      while ((match = arrowPattern.exec(content)) !== null) {
        symbols.functions.push(match[1]);
      }
      const classPattern = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      while ((match = classPattern.exec(content)) !== null) {
        symbols.classes.push(match[1]);
      }
      const namedExportPattern = /export\s+(?:(?:async\s+)?function|class|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      while ((match = namedExportPattern.exec(content)) !== null) {
        symbols.exports.push(match[1]);
      }
      const moduleExportsPattern = /module\.exports\s{0,1000}=\s{0,1000}\{([^}]{1,100000})\}/;
      const moduleMatch = content.match(moduleExportsPattern);
      if (moduleMatch) {
        const keys = moduleMatch[1].split(",").map((k) => k.trim().split(":")[0].trim());
        symbols.exports.push(...keys.filter((k) => k && /^[a-zA-Z_$]/.test(k)));
      }
      symbols.functions = [...new Set(symbols.functions)];
      symbols.classes = [...new Set(symbols.classes)];
      symbols.exports = [...new Set(symbols.exports)];
      return symbols;
    }
    function scanFileSymbols(basePath, topLevelDirs) {
      const sourceSymbols = {};
      const sourceDirs = ["lib", "src", "app", "pages", "components", "utils", "services", "api"];
      const dirsToScan = topLevelDirs.filter((d) => sourceDirs.includes(d));
      const allExts = Object.values(SOURCE_EXTENSIONS).flat();
      let filesScanned = 0;
      const maxFiles = 40;
      function scanDir(dirPath, relativePath, depth = 0) {
        if (filesScanned >= maxFiles || depth > 2) return;
        if (!fs.existsSync(dirPath)) return;
        try {
          const entries = fs.readdirSync(dirPath, { withFileTypes: true });
          for (const entry of entries) {
            if (filesScanned >= maxFiles) break;
            const fullPath = path.join(dirPath, entry.name);
            const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
              if (["node_modules", "__tests__", "test", "tests", "dist", "build"].includes(entry.name)) continue;
              scanDir(fullPath, relPath, depth + 1);
            } else if (entry.isFile()) {
              const ext = path.extname(entry.name);
              if (!allExts.includes(ext)) continue;
              if (entry.name.includes(".test.") || entry.name.includes(".spec.")) continue;
              try {
                const content = readFileWithLimit(fullPath, MAX_FILE_SIZE);
                const symbols = extractSymbols(content);
                if (symbols.functions.length || symbols.classes.length || symbols.exports.length) {
                  sourceSymbols[relPath] = symbols;
                  filesScanned++;
                }
              } catch {
              }
            }
          }
        } catch {
        }
      }
      for (const dir of dirsToScan) {
        if (filesScanned >= maxFiles) break;
        scanDir(path.join(basePath, dir), dir);
      }
      return sourceSymbols;
    }
    function scanDirectory(result, basePath, relativePath, maxDepth, depth = 0) {
      if (depth >= maxDepth) return;
      const fullPath = path.join(basePath, relativePath);
      if (!fs.existsSync(fullPath)) return;
      try {
        const entries = fs.readdirSync(fullPath, { withFileTypes: true });
        const dirs = [];
        const files = [];
        for (const entry of entries) {
          if (entry.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(entry.name)) {
              dirs.push(entry.name);
            }
          } else {
            files.push(entry.name);
          }
        }
        const key = relativePath || ".";
        result.structure[key] = { dirs, fileCount: files.length };
        for (const file of files) {
          const ext = path.extname(file).toLowerCase() || "no-ext";
          result.fileStats[ext] = (result.fileStats[ext] || 0) + 1;
        }
        for (const dir of dirs) {
          scanDirectory(result, basePath, path.join(relativePath, dir), maxDepth, depth + 1);
        }
      } catch {
      }
    }
    function detectHealth(result, basePath) {
      result.health.hasReadme = fs.existsSync(path.join(basePath, "README.md"));
      const lintConfigs = [".eslintrc", ".eslintrc.js", ".eslintrc.json", "eslint.config.js", "biome.json"];
      result.health.hasLinting = lintConfigs.some((f) => fs.existsSync(path.join(basePath, f)));
      const ciConfigs = [
        ".github/workflows",
        ".gitlab-ci.yml",
        ".circleci",
        "Jenkinsfile",
        ".travis.yml"
      ];
      result.health.hasCi = ciConfigs.some((f) => fs.existsSync(path.join(basePath, f)));
      const testDirs = ["tests", "__tests__", "test", "spec"];
      result.health.hasTests = result.health.hasTests || testDirs.some((d) => fs.existsSync(path.join(basePath, d)));
    }
    function findImplementedFeatures(result, basePath) {
      const featurePatterns = {
        authentication: ["auth", "login", "session", "jwt", "oauth"],
        api: ["routes", "controllers", "handlers", "endpoints"],
        database: ["models", "schemas", "migrations", "seeds"],
        ui: ["components", "views", "pages", "layouts"],
        testing: ["__tests__", "test", "spec", ".test.", ".spec."],
        docs: ["docs", "documentation", "wiki"]
      };
      for (const [feature, patterns] of Object.entries(featurePatterns)) {
        const found = patterns.some((pattern) => {
          for (const dir of Object.keys(result.structure)) {
            if (dir.toLowerCase().includes(pattern)) {
              return true;
            }
          }
          return false;
        });
        if (found) {
          result.implementedFeatures.push(feature);
        }
      }
    }
    function scanCodebase(options = {}) {
      const opts = { ...DEFAULT_OPTIONS2, ...options };
      const basePath = opts.cwd;
      const result = {
        summary: { totalDirs: 0, totalFiles: 0 },
        topLevelDirs: [],
        frameworks: [],
        testFramework: null,
        hasTypeScript: false,
        implementedFeatures: [],
        symbols: {},
        health: {
          hasTests: false,
          hasLinting: false,
          hasCi: false,
          hasReadme: false
        },
        fileStats: {}
      };
      const internalStructure = {};
      const pkgContent = safeReadFile("package.json", basePath);
      if (pkgContent) {
        try {
          const pkg = JSON.parse(pkgContent);
          detectFrameworks(result, pkg);
          detectTestFramework(result, pkg);
        } catch {
        }
      }
      result.hasTypeScript = fs.existsSync(path.join(basePath, "tsconfig.json"));
      scanDirectory({ structure: internalStructure, fileStats: result.fileStats }, basePath, "", opts.depth === "thorough" ? 3 : 2);
      result.summary.totalDirs = Object.keys(internalStructure).length;
      result.summary.totalFiles = Object.values(internalStructure).reduce((sum, d) => sum + (d.fileCount || 0), 0);
      const rootEntry = internalStructure["."];
      if (rootEntry) {
        result.topLevelDirs = rootEntry.dirs || [];
      }
      detectHealth(result, basePath);
      if (opts.depth === "thorough") {
        findImplementedFeatures({ ...result, structure: internalStructure }, basePath);
        result.symbols = scanFileSymbols(basePath, result.topLevelDirs);
      }
      const sortedStats = Object.entries(result.fileStats).sort((a, b) => b[1] - a[1]).slice(0, 10);
      result.fileStats = Object.fromEntries(sortedStats);
      return result;
    }
    module2.exports = {
      DEFAULT_OPTIONS: DEFAULT_OPTIONS2,
      EXCLUDE_DIRS,
      SOURCE_EXTENSIONS,
      scanCodebase,
      detectFrameworks,
      detectTestFramework,
      detectHealth,
      findImplementedFeatures,
      extractSymbols,
      scanFileSymbols,
      scanDirectory,
      shouldExclude,
      safeReadFile
    };
  }
});

// ../work/agent-sh__agentsys/lib/binary/version.js
var require_version = __commonJS({
  "../work/agent-sh__agentsys/lib/binary/version.js"(exports2, module2) {
    "use strict";
    var ANALYZER_MIN_VERSION = "0.3.0";
    var BINARY_NAME = "agent-analyzer";
    var GITHUB_REPO = "agent-sh/agent-analyzer";
    module2.exports = {
      ANALYZER_MIN_VERSION,
      BINARY_NAME,
      GITHUB_REPO
    };
  }
});

// ../work/agent-sh__agentsys/lib/binary/index.js
var require_binary = __commonJS({
  "../work/agent-sh__agentsys/lib/binary/index.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var os = require("os");
    var https = require("https");
    var cp = require("child_process");
    var crypto = require("crypto");
    var { promisify } = require("util");
    var execFileAsync = promisify(cp.execFile);
    var ANALYZER_MAX_BUFFER = 256 * 1024 * 1024;
    var { ANALYZER_MIN_VERSION, BINARY_NAME, GITHUB_REPO } = require_version();
    var PLATFORM_MAP = {
      "darwin-arm64": "aarch64-apple-darwin",
      "darwin-x64": "x86_64-apple-darwin",
      "linux-x64": "x86_64-unknown-linux-gnu",
      "linux-arm64": "aarch64-unknown-linux-gnu",
      "win32-x64": "x86_64-pc-windows-msvc"
    };
    function getBinaryPath() {
      const ext = process.platform === "win32" ? ".exe" : "";
      return path.join(os.homedir(), ".agent-sh", "bin", BINARY_NAME + ext);
    }
    function getPlatformKey() {
      const key = process.platform + "-" + process.arch;
      return PLATFORM_MAP[key] || null;
    }
    function meetsMinimumVersion(version, minVersion) {
      if (!version) return false;
      const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
      if (!match) return false;
      const parts = match.slice(1).map(Number);
      const req = minVersion.split(".").map(Number);
      if (parts[0] > req[0]) return true;
      if (parts[0] < req[0]) return false;
      if (parts[1] > req[1]) return true;
      if (parts[1] < req[1]) return false;
      return parts[2] >= req[2];
    }
    function getVersion() {
      const binPath = getBinaryPath();
      if (!fs.existsSync(binPath)) return null;
      try {
        const out = cp.execFileSync(binPath, ["--version"], {
          timeout: 5e3,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        const match = out.trim().match(/(\d+\.\d+\.\d+)/);
        return match ? match[1] : out.trim();
      } catch (e) {
        return null;
      }
    }
    function isAvailable() {
      const binPath = getBinaryPath();
      if (!fs.existsSync(binPath)) return false;
      const ver = getVersion();
      return meetsMinimumVersion(ver, ANALYZER_MIN_VERSION);
    }
    async function isAvailableAsync() {
      return isAvailable();
    }
    function buildDownloadUrl(ver, platformKey) {
      const ext = process.platform === "win32" ? ".zip" : ".tar.gz";
      return "https://github.com/" + GITHUB_REPO + "/releases/download/v" + ver + "/" + BINARY_NAME + "-" + platformKey + ext;
    }
    function downloadToBuffer(url) {
      return new Promise(function(resolve, reject) {
        const ghToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        function request(reqUrl, redirectCount) {
          if (redirectCount > 5) {
            reject(new Error("Too many redirects fetching from " + url));
            return;
          }
          const headers = {
            "User-Agent": "agent-core/binary-resolver",
            "Accept": "application/octet-stream"
          };
          if (ghToken) headers["Authorization"] = "Bearer " + ghToken;
          https.get(reqUrl, { headers }, function(res) {
            const sc = res.statusCode;
            if (sc === 301 || sc === 302 || sc === 307 || sc === 308) {
              res.resume();
              request(res.headers.location, redirectCount + 1);
              return;
            }
            if (sc !== 200) {
              res.resume();
              const hint = sc === 403 ? " (rate limited - set GITHUB_TOKEN env var)" : "";
              reject(new Error("HTTP " + sc + hint + " fetching " + reqUrl));
              return;
            }
            const chunks = [];
            res.on("data", function(chunk) {
              chunks.push(chunk);
            });
            res.on("end", function() {
              resolve(Buffer.concat(chunks));
            });
            res.on("error", reject);
          }).on("error", reject);
        }
        request(url, 0);
      });
    }
    function parseSha256Sidecar(body) {
      if (typeof body !== "string") body = String(body || "");
      const match = body.trim().match(/^([A-Fa-f0-9]{64})\b/);
      if (!match) {
        throw new Error("Could not parse SHA-256 digest from sidecar body");
      }
      return match[1].toLowerCase();
    }
    async function downloadSha256(assetUrl) {
      const sidecarUrl = assetUrl + ".sha256";
      const buf = await downloadToBuffer(sidecarUrl);
      return parseSha256Sidecar(buf.toString("utf8"));
    }
    function sha256Hex(buf) {
      return crypto.createHash("sha256").update(buf).digest("hex");
    }
    function verifySha256(buf, expectedHex, filename) {
      const expected = String(expectedHex || "").toLowerCase();
      const actual = sha256Hex(buf);
      if (expected !== actual) {
        throw new Error(
          "SHA-256 verification failed for " + filename + ": expected " + expected + ", got " + actual + ". This could indicate a tampered release. Do not extract."
        );
      }
    }
    function assertSafeArchiveEntry(entry) {
      if (!entry || typeof entry !== "string") {
        throw new Error("Refusing to extract archive with empty entry name");
      }
      const name = entry.replace(/\\/g, "/").trim();
      if (name.length === 0) {
        throw new Error("Refusing to extract archive with empty entry name");
      }
      if (name.startsWith("//")) {
        throw new Error("Refusing to extract archive with UNC entry: " + entry);
      }
      if (name.startsWith("/")) {
        throw new Error("Refusing to extract archive with absolute entry: " + entry);
      }
      if (/^[A-Za-z]:[\\/]/.test(entry)) {
        throw new Error("Refusing to extract archive with Windows absolute entry: " + entry);
      }
      const parts = name.split("/").filter(function(p) {
        return p.length > 0;
      });
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] === "..") {
          throw new Error("Refusing to extract archive with parent-traversal entry: " + entry);
        }
      }
    }
    function listTarGzEntries(buf) {
      return new Promise(function(resolve, reject) {
        const tar = cp.spawn("tar", ["-tz"], { stdio: ["pipe", "pipe", "pipe"] });
        let stdout = "";
        let stderr = "";
        tar.stdout.on("data", function(d) {
          stdout += d;
        });
        tar.stderr.on("data", function(d) {
          stderr += d;
        });
        tar.on("error", reject);
        tar.on("close", function(code) {
          if (code !== 0) {
            reject(new Error("tar -tz listing failed (code " + code + "): " + stderr));
            return;
          }
          const entries = stdout.split(/\r?\n/).filter(function(l) {
            return l.length > 0;
          });
          resolve(entries);
        });
        tar.stdin.write(buf);
        tar.stdin.end();
      });
    }
    function assertInsideRoot(root, candidate) {
      const rootResolved = path.resolve(root) + path.sep;
      const candResolved = path.resolve(candidate);
      if (candResolved !== path.resolve(root) && !candResolved.startsWith(rootResolved)) {
        throw new Error("Extracted path escapes extract root: " + candidate);
      }
    }
    function walkFiles(dir) {
      const out = [];
      const stack = [dir];
      while (stack.length > 0) {
        const cur = stack.pop();
        const st = fs.lstatSync(cur);
        if (st.isSymbolicLink()) {
          throw new Error("Refusing to follow symlink produced by extractor: " + cur);
        }
        if (st.isDirectory()) {
          const names = fs.readdirSync(cur);
          for (let i = 0; i < names.length; i++) {
            stack.push(path.join(cur, names[i]));
          }
        } else if (st.isFile()) {
          out.push(cur);
        }
      }
      return out;
    }
    function rmrf(dir) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch (e) {
      }
    }
    async function extractTarGzToScratch(buf) {
      const entries = await listTarGzEntries(buf);
      for (let i = 0; i < entries.length; i++) {
        assertSafeArchiveEntry(entries[i]);
      }
      const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "agent-analyzer-tar-"));
      try {
        await new Promise(function(resolve, reject) {
          const tar = cp.spawn("tar", ["xz", "-C", scratch], { stdio: ["pipe", "pipe", "pipe"] });
          let stderr = "";
          tar.stderr.on("data", function(d) {
            stderr += d;
          });
          tar.on("error", reject);
          tar.on("close", function(code) {
            if (code !== 0) {
              reject(new Error("tar extraction failed (code " + code + "): " + stderr));
            } else {
              resolve();
            }
          });
          tar.stdin.write(buf);
          tar.stdin.end();
        });
        const files = walkFiles(scratch);
        for (let i = 0; i < files.length; i++) {
          assertInsideRoot(scratch, files[i]);
        }
      } catch (err) {
        rmrf(scratch);
        throw err;
      }
      return scratch;
    }
    var EXTRACT_ZIP_PS1 = [
      '$ErrorActionPreference = "Stop"',
      "$src  = $env:SRC_ZIP",
      "$dest = $env:DEST_DIR",
      "if ([string]::IsNullOrEmpty($src) -or [string]::IsNullOrEmpty($dest)) {",
      '  [Console]::Error.WriteLine("SRC_ZIP and DEST_DIR must both be set"); exit 2',
      "}",
      "Add-Type -AssemblyName System.IO.Compression.FileSystem",
      "$destFull = [System.IO.Path]::GetFullPath($dest)",
      "if (-not $destFull.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {",
      "  $destFull = $destFull + [System.IO.Path]::DirectorySeparatorChar",
      "}",
      "$zip = [System.IO.Compression.ZipFile]::OpenRead($src)",
      "try {",
      "  foreach ($entry in $zip.Entries) {",
      "    $name = $entry.FullName",
      "    if ([string]::IsNullOrEmpty($name)) { continue }",
      '    $norm = $name -replace "\\\\","/"',
      '    if ($norm.StartsWith("/") -or $norm.StartsWith("//")) {',
      '      [Console]::Error.WriteLine("Refusing absolute/UNC entry: " + $name); exit 3',
      "    }",
      '    if ($name -match "^[A-Za-z]:[\\\\/]") {',
      '      [Console]::Error.WriteLine("Refusing Windows-absolute entry: " + $name); exit 3',
      "    }",
      '    foreach ($part in ($norm -split "/")) {',
      '      if ($part -eq "..") {',
      '        [Console]::Error.WriteLine("Refusing parent-traversal entry: " + $name); exit 3',
      "      }",
      "    }",
      "    $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($destFull, $norm))",
      "    if (-not $target.StartsWith($destFull, [System.StringComparison]::OrdinalIgnoreCase)) {",
      '      [Console]::Error.WriteLine("Entry escapes destination: " + $name); exit 3',
      "    }",
      '    if ($entry.FullName.EndsWith("/")) {',
      "      [System.IO.Directory]::CreateDirectory($target) | Out-Null",
      "    } else {",
      "      $parent = [System.IO.Path]::GetDirectoryName($target)",
      "      if ($parent) { [System.IO.Directory]::CreateDirectory($parent) | Out-Null }",
      "      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)",
      "    }",
      "  }",
      "} finally {",
      "  $zip.Dispose()",
      "}"
    ].join("\r\n");
    async function extractZipToScratch(buf) {
      const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "agent-analyzer-zip-"));
      const tmpZip = path.join(scratch, "__archive.zip");
      const scriptDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-analyzer-ps-"));
      const scriptPath = path.join(scriptDir, "extract.ps1");
      try {
        fs.writeFileSync(tmpZip, buf);
        fs.writeFileSync(scriptPath, EXTRACT_ZIP_PS1, "utf8");
        await new Promise(function(resolve, reject) {
          const child = cp.execFile(
            "powershell.exe",
            [
              "-NoProfile",
              "-NonInteractive",
              "-ExecutionPolicy",
              "Bypass",
              "-File",
              scriptPath
            ],
            {
              windowsHide: true,
              env: Object.assign({}, process.env, {
                SRC_ZIP: tmpZip,
                DEST_DIR: scratch
              })
            },
            function(err, _stdout, stderr) {
              if (err) {
                reject(new Error("zip extraction failed: " + (stderr || err.message)));
              } else {
                resolve();
              }
            }
          );
          if (child.stdin) child.stdin.end();
        });
        try {
          fs.unlinkSync(tmpZip);
        } catch (e) {
        }
        const files = walkFiles(scratch);
        for (let i = 0; i < files.length; i++) {
          assertInsideRoot(scratch, files[i]);
        }
      } catch (err) {
        rmrf(scratch);
        throw err;
      } finally {
        rmrf(scriptDir);
      }
      return scratch;
    }
    function findBinaryInScratch(scratch, binaryBaseName) {
      const files = walkFiles(scratch);
      for (let i = 0; i < files.length; i++) {
        if (path.basename(files[i]) === binaryBaseName) {
          assertInsideRoot(scratch, files[i]);
          return files[i];
        }
      }
      return null;
    }
    function defaultGhRunner(filePath, repo) {
      try {
        const stdout = cp.execFileSync(
          "gh",
          ["attestation", "verify", filePath, "--repo", repo, "--format", "json"],
          {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
            timeout: 6e4,
            windowsHide: true
          }
        );
        return { status: 0, stdout: stdout || "", stderr: "" };
      } catch (err) {
        return {
          status: typeof err.status === "number" ? err.status : null,
          stdout: err.stdout ? String(err.stdout) : "",
          stderr: err.stderr ? String(err.stderr) : err.message || ""
        };
      }
    }
    function isGhAvailable(runner) {
      if (typeof runner === "function") {
        try {
          return !!runner();
        } catch (e) {
          return false;
        }
      }
      try {
        cp.execFileSync("gh", ["--version"], {
          stdio: "ignore",
          timeout: 5e3,
          windowsHide: true
        });
        return true;
      } catch (e) {
        return false;
      }
    }
    function verifySlsaAttestation(filePath, options) {
      const opts = options || {};
      const repo = opts.repo || GITHUB_REPO;
      const runner = typeof opts.ghRunner === "function" ? opts.ghRunner : defaultGhRunner;
      const require_ = typeof opts.requireAttestation === "boolean" ? opts.requireAttestation : process.env.AGENT_ANALYZER_REQUIRE_ATTESTATION === "1";
      const ghPresent = isGhAvailable(opts.ghProbe);
      if (!ghPresent) {
        const reason = "`gh` CLI not found on PATH";
        if (require_) {
          return { status: "failed", reason: reason + " (AGENT_ANALYZER_REQUIRE_ATTESTATION=1)" };
        }
        return { status: "skipped", reason };
      }
      const result = runner(filePath, repo);
      if (result && result.status === 0) {
        return { status: "verified" };
      }
      return {
        status: "failed",
        reason: "gh attestation verify exited with status " + (result && result.status !== null ? result.status : "unknown"),
        stderr: result && result.stderr || ""
      };
    }
    async function downloadBinary(ver, options) {
      const opts = options || {};
      const skipChecksum = opts.skipChecksum === true;
      const skipAttestation = opts.skipAttestation === true;
      const platformKey = getPlatformKey();
      if (!platformKey) {
        throw new Error(
          "Unsupported platform: " + process.platform + "-" + process.arch + ". Supported platforms: " + Object.keys(PLATFORM_MAP).join(", ")
        );
      }
      const url = buildDownloadUrl(ver, platformKey);
      const filename = url.substring(url.lastIndexOf("/") + 1);
      process.stderr.write("Downloading " + BINARY_NAME + " v" + ver + " for " + platformKey + "...\n");
      const binPath = getBinaryPath();
      const binDir = path.dirname(binPath);
      fs.mkdirSync(binDir, { recursive: true });
      let buf;
      try {
        buf = await downloadToBuffer(url);
      } catch (err) {
        throw new Error(
          "Failed to download " + BINARY_NAME + ":\n  URL: " + url + "\n  Error: " + err.message + "\n\nTo install manually:\n  1. Download: " + url + "\n  2. Extract the binary to: " + binDir + "\n  3. Ensure it is named: " + path.basename(binPath)
        );
      }
      if (skipChecksum) {
        process.stderr.write(
          "[WARN] skipChecksum=true - SHA-256 verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n"
        );
      } else {
        let expected;
        try {
          expected = await downloadSha256(url);
        } catch (err) {
          throw new Error(
            "Failed to fetch SHA-256 sidecar for " + filename + ":\n  URL: " + url + ".sha256\n  Error: " + err.message + "\n\nThe release may be missing its checksum file. Refusing to install an unverified binary. If this is a legacy release without sidecars, pass { skipChecksum: true } to downloadBinary() (LOCAL DEV ONLY)."
          );
        }
        verifySha256(buf, expected, filename);
      }
      if (skipAttestation) {
        process.stderr.write(
          "[WARN] skipAttestation=true - SLSA verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n"
        );
      } else {
        const attestDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-analyzer-slsa-"));
        const attestFile = path.join(attestDir, filename);
        try {
          fs.writeFileSync(attestFile, buf);
          const result = verifySlsaAttestation(attestFile, {
            repo: GITHUB_REPO,
            requireAttestation: opts.requireAttestation,
            ghRunner: opts.ghRunner,
            ghProbe: opts.ghProbe
          });
          if (result.status === "verified") {
            process.stderr.write("[OK] SLSA attestation verified for " + filename + "\n");
          } else if (result.status === "skipped") {
            process.stderr.write(
              "[WARN] SLSA attestation check skipped: " + result.reason + ". Install the GitHub CLI (`gh`) to enable provenance verification. Set AGENT_ANALYZER_REQUIRE_ATTESTATION=1 to require it.\n"
            );
          } else {
            throw new Error(
              "SLSA attestation verification failed for " + filename + ": " + result.reason + ". Refusing to execute binary." + (result.stderr ? "\n--- gh stderr ---\n" + result.stderr : "")
            );
          }
        } finally {
          rmrf(attestDir);
        }
      }
      const binaryBaseName = path.basename(binPath);
      let scratch;
      try {
        if (process.platform === "win32") {
          scratch = await extractZipToScratch(buf);
        } else {
          scratch = await extractTarGzToScratch(buf);
        }
        const extractedBin = findBinaryInScratch(scratch, binaryBaseName);
        if (!extractedBin) {
          throw new Error(
            'Expected binary "' + binaryBaseName + '" not found inside archive ' + filename + ". Archive layout may have changed."
          );
        }
        fs.copyFileSync(extractedBin, binPath);
      } finally {
        if (scratch) rmrf(scratch);
      }
      if (process.platform !== "win32") {
        fs.chmodSync(binPath, 493);
      }
      const installedVer = getVersion();
      if (!installedVer) {
        throw new Error(
          BINARY_NAME + " was downloaded to " + binPath + " but could not be executed. Check the file is a valid binary for this platform."
        );
      }
      return binPath;
    }
    async function ensureBinary(options) {
      const opts = options || {};
      const targetVer = opts.version || ANALYZER_MIN_VERSION;
      const binPath = getBinaryPath();
      if (fs.existsSync(binPath)) {
        const ver = getVersion();
        if (meetsMinimumVersion(ver, ANALYZER_MIN_VERSION)) {
          return binPath;
        }
      }
      return downloadBinary(targetVer, {
        skipChecksum: opts.skipChecksum === true,
        skipAttestation: opts.skipAttestation === true,
        requireAttestation: opts.requireAttestation,
        ghRunner: opts.ghRunner,
        ghProbe: opts.ghProbe
      });
    }
    function ensureBinarySync(options) {
      const binPath = getBinaryPath();
      if (fs.existsSync(binPath)) {
        const ver = getVersion();
        if (meetsMinimumVersion(ver, ANALYZER_MIN_VERSION)) {
          return binPath;
        }
      }
      const targetVer = options && options.version || ANALYZER_MIN_VERSION;
      const skipChecksum = !!(options && options.skipChecksum);
      const skipAttestation = !!(options && options.skipAttestation);
      const requireAttestation = options && typeof options.requireAttestation === "boolean" ? options.requireAttestation : void 0;
      const selfPath = __filename;
      const ensureOpts = {
        version: targetVer,
        skipChecksum,
        skipAttestation
      };
      if (requireAttestation !== void 0) {
        ensureOpts.requireAttestation = requireAttestation;
      }
      const helperLines = [
        "var b = require(" + JSON.stringify(selfPath) + ");",
        "b.ensureBinary(" + JSON.stringify(ensureOpts) + ")",
        "  .then(function(p) { process.stdout.write(p); })",
        "  .catch(function(e) { process.stderr.write(e.message); process.exit(1); });"
      ];
      try {
        const result = cp.execFileSync(process.execPath, ["-e", helperLines.join("\n")], {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "inherit"],
          timeout: 12e4
        });
        return result.trim() || binPath;
      } catch (err) {
        throw new Error("Failed to ensure binary (sync): " + err.message);
      }
    }
    function runAnalyzer(args, options) {
      const binPath = ensureBinarySync();
      const opts = Object.assign({ encoding: "utf8", windowsHide: true, maxBuffer: ANALYZER_MAX_BUFFER }, options);
      if (!opts.stdio) opts.stdio = ["pipe", "pipe", "pipe"];
      const result = cp.execFileSync(binPath, args, opts);
      return typeof result === "string" ? result : result.toString("utf8");
    }
    async function runAnalyzerAsync(args, options) {
      const binPath = await ensureBinary();
      const opts = Object.assign({ encoding: "utf8", windowsHide: true, maxBuffer: ANALYZER_MAX_BUFFER }, options);
      const result = await execFileAsync(binPath, args, opts);
      return result.stdout;
    }
    module2.exports = {
      ensureBinary,
      ensureBinarySync,
      runAnalyzer,
      runAnalyzerAsync,
      getBinaryPath,
      getVersion,
      getPlatformKey,
      isAvailable,
      isAvailableAsync,
      meetsMinimumVersion,
      buildDownloadUrl,
      PLATFORM_MAP,
      // Exported for tests + advanced consumers
      parseSha256Sidecar,
      verifySha256,
      sha256Hex,
      assertSafeArchiveEntry,
      assertInsideRoot,
      downloadBinary,
      verifySlsaAttestation,
      isGhAvailable,
      // Exported for tests only
      extractTarGzToScratch,
      extractZipToScratch,
      _EXTRACT_ZIP_PS1: EXTRACT_ZIP_PS1
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/installer.js
var require_installer = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/installer.js"(exports2, module2) {
    "use strict";
    var binary = require_binary();
    async function checkInstalled() {
      if (binary.isAvailable()) {
        return { found: true, version: binary.getVersion(), tool: "agent-analyzer" };
      }
      try {
        await binary.ensureBinary();
        return { found: true, version: binary.getVersion(), tool: "agent-analyzer" };
      } catch (e) {
        return { found: false, error: e.message, tool: "agent-analyzer" };
      }
    }
    function checkInstalledSync() {
      if (binary.isAvailable()) {
        return { found: true, version: binary.getVersion(), tool: "agent-analyzer" };
      }
      try {
        binary.ensureBinarySync();
        return { found: true, version: binary.getVersion(), tool: "agent-analyzer" };
      } catch (e) {
        return { found: false, error: e.message, tool: "agent-analyzer" };
      }
    }
    function meetsMinimumVersion() {
      return true;
    }
    function getInstallInstructions() {
      return "agent-analyzer is downloaded automatically on first use from https://github.com/agent-sh/agent-analyzer/releases";
    }
    function getMinimumVersion() {
      return "0.3.0";
    }
    module2.exports = {
      checkInstalled,
      checkInstalledSync,
      meetsMinimumVersion,
      getInstallInstructions,
      getMinimumVersion,
      // Stub: runner.js references this but is no longer the scan path
      getCommand: () => null
    };
  }
});

// ../work/agent-sh__agentsys/lib/platform/state-dir.js
var require_state_dir = __commonJS({
  "../work/agent-sh__agentsys/lib/platform/state-dir.js"(exports2, module2) {
    var fs = require("fs");
    var path = require("path");
    var _cachedStateDirs = /* @__PURE__ */ new Map();
    function isDirectory(targetPath) {
      try {
        return fs.statSync(targetPath).isDirectory();
      } catch {
        return false;
      }
    }
    function getStateDir(basePath = process.cwd()) {
      if (process.env.AI_STATE_DIR) {
        return process.env.AI_STATE_DIR;
      }
      const cacheKey = path.resolve(basePath);
      const cached = _cachedStateDirs.get(cacheKey);
      if (cached) {
        return cached;
      }
      if (process.env.OPENCODE_CONFIG || process.env.OPENCODE_CONFIG_DIR) {
        _cachedStateDirs.set(cacheKey, ".opencode");
        return ".opencode";
      }
      try {
        const opencodePath = path.join(basePath, ".opencode");
        if (isDirectory(opencodePath)) {
          _cachedStateDirs.set(cacheKey, ".opencode");
          return ".opencode";
        }
      } catch {
      }
      if (process.env.CODEX_HOME) {
        _cachedStateDirs.set(cacheKey, ".codex");
        return ".codex";
      }
      try {
        const codexPath = path.join(basePath, ".codex");
        if (isDirectory(codexPath)) {
          _cachedStateDirs.set(cacheKey, ".codex");
          return ".codex";
        }
      } catch {
      }
      _cachedStateDirs.set(cacheKey, ".claude");
      return ".claude";
    }
    function getStateDirPath(basePath = process.cwd()) {
      return path.join(basePath, getStateDir(basePath));
    }
    function getPlatformName(basePath = process.cwd()) {
      const stateDir = getStateDir(basePath);
      if (process.env.AI_STATE_DIR) {
        return "custom";
      }
      switch (stateDir) {
        case ".opencode":
          return "opencode";
        case ".codex":
          return "codex";
        case ".claude":
          return "claude";
        default:
          return "unknown";
      }
    }
    function clearCache() {
      _cachedStateDirs.clear();
    }
    module2.exports = {
      getStateDir,
      getStateDirPath,
      getPlatformName,
      clearCache
    };
  }
});

// ../work/agent-sh__agentsys/lib/utils/atomic-write.js
var require_atomic_write = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/atomic-write.js"(exports2, module2) {
    var fs = require("fs");
    var path = require("path");
    var crypto = require("crypto");
    function getTempPath(targetPath) {
      const dir = path.dirname(targetPath);
      const basename = path.basename(targetPath);
      const randomSuffix = crypto.randomBytes(6).toString("hex");
      return path.join(dir, `.${basename}.${randomSuffix}.tmp`);
    }
    function writeFileAtomic(filePath, content, options = {}) {
      const { encoding = "utf8", mode = 420 } = options;
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tempPath = getTempPath(filePath);
      try {
        fs.writeFileSync(tempPath, content, { encoding, mode });
        fs.renameSync(tempPath, filePath);
        return true;
      } catch (error) {
        try {
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
        } catch {
        }
        throw error;
      }
    }
    function writeJsonAtomic(filePath, data, options = {}) {
      const { indent = 2, ...writeOptions } = options;
      const content = JSON.stringify(data, null, indent);
      return writeFileAtomic(filePath, content, writeOptions);
    }
    module2.exports = {
      writeFileAtomic,
      writeJsonAtomic,
      getTempPath
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/cache.js
var require_cache = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/cache.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var { getStateDirPath } = require_state_dir();
    var { writeJsonAtomic, writeFileAtomic } = require_atomic_write();
    var MAP_FILENAME = "repo-map.json";
    var STALE_FILENAME = "repo-map.stale";
    var INTEL_FILENAME = "repo-intel.json";
    function getMapPath(basePath) {
      return path.join(getStateDirPath(basePath), MAP_FILENAME);
    }
    function getPath(basePath) {
      return path.join(getStateDirPath(basePath), INTEL_FILENAME);
    }
    function getStalePath(basePath) {
      return path.join(getStateDirPath(basePath), STALE_FILENAME);
    }
    function ensureStateDir(basePath) {
      const stateDir = getStateDirPath(basePath);
      if (!fs.existsSync(stateDir)) {
        fs.mkdirSync(stateDir, { recursive: true });
      }
      return stateDir;
    }
    function load(basePath) {
      const mapPath = getMapPath(basePath);
      if (!fs.existsSync(mapPath)) return null;
      try {
        const raw = fs.readFileSync(mapPath, "utf8");
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    function save(basePath, map) {
      ensureStateDir(basePath);
      const mapPath = getMapPath(basePath);
      const output = {
        ...map,
        updated: (/* @__PURE__ */ new Date()).toISOString()
      };
      writeJsonAtomic(mapPath, output);
      clearStale(basePath);
    }
    function exists(basePath) {
      return fs.existsSync(getMapPath(basePath));
    }
    function markStale(basePath) {
      ensureStateDir(basePath);
      writeFileAtomic(getStalePath(basePath), (/* @__PURE__ */ new Date()).toISOString());
    }
    function clearStale(basePath) {
      const stalePath = getStalePath(basePath);
      if (fs.existsSync(stalePath)) {
        fs.unlinkSync(stalePath);
      }
    }
    function isMarkedStale(basePath) {
      return fs.existsSync(getStalePath(basePath));
    }
    function getStatus(basePath) {
      const map = load(basePath);
      if (!map) return null;
      return {
        generated: map.generated,
        updated: map.updated,
        commit: map.git?.commit,
        branch: map.git?.branch,
        files: Object.keys(map.files || {}).length,
        symbols: map.stats?.totalSymbols || 0,
        languages: map.project?.languages || []
      };
    }
    module2.exports = {
      load,
      save,
      exists,
      getStatus,
      getMapPath,
      // getPath -> raw repo-intel.json (embed orchestrator); getStateDirPath
      // re-exported for embed/preference.js. Both delegate to platform/state-dir
      // and match the names the standalone cache exposed.
      getPath,
      getStateDirPath,
      markStale,
      clearStale,
      isMarkedStale
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/updater.js
var require_updater = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/updater.js"(exports2, module2) {
    "use strict";
    var { execFileSync } = require("child_process");
    var cache = require_cache();
    function checkStaleness(basePath, map) {
      const result = {
        isStale: false,
        reason: null,
        commitsBehind: 0,
        suggestFullRebuild: false
      };
      if (!map?.git?.commit) {
        result.isStale = true;
        result.reason = "Missing base commit in repo-map";
        result.suggestFullRebuild = true;
        return result;
      }
      if (cache.isMarkedStale(basePath)) {
        result.isStale = true;
        result.reason = "Marked stale by hook";
      }
      if (!commitExists(basePath, map.git.commit)) {
        result.isStale = true;
        result.reason = "Base commit no longer exists (rebased?)";
        result.suggestFullRebuild = true;
        return result;
      }
      const currentBranch = getCurrentBranch(basePath);
      if (currentBranch && map.git.branch && currentBranch !== map.git.branch) {
        result.isStale = true;
        result.reason = `Branch changed from ${map.git.branch} to ${currentBranch}`;
        result.suggestFullRebuild = true;
      }
      const commitsBehind = getCommitsBehind(basePath, map.git.commit);
      if (commitsBehind > 0) {
        result.isStale = true;
        result.commitsBehind = commitsBehind;
        if (!result.reason) {
          result.reason = `${commitsBehind} commits behind HEAD`;
        }
      }
      return result;
    }
    function isValidCommitHash(commit) {
      return typeof commit === "string" && /^[0-9a-fA-F]{4,40}$/.test(commit);
    }
    function commitExists(basePath, commit) {
      if (!isValidCommitHash(commit)) return false;
      try {
        execFileSync("git", ["cat-file", "-e", commit], { cwd: basePath, stdio: ["pipe", "pipe", "pipe"] });
        return true;
      } catch {
        return false;
      }
    }
    function getCurrentBranch(basePath) {
      try {
        return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
          cwd: basePath,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        }).trim();
      } catch {
        return null;
      }
    }
    function getCommitsBehind(basePath, commit) {
      if (!isValidCommitHash(commit)) return 0;
      try {
        const out = execFileSync("git", ["rev-list", `${commit}..HEAD`, "--count"], {
          cwd: basePath,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        }).trim();
        return Number(out) || 0;
      } catch {
        return 0;
      }
    }
    module2.exports = { checkStaleness };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/converter.js
var require_converter = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/converter.js"(exports2, module2) {
    "use strict";
    var path = require("path");
    var LANGUAGE_BY_EXTENSION = {
      ".js": "javascript",
      ".jsx": "javascript",
      ".mjs": "javascript",
      ".cjs": "javascript",
      ".ts": "typescript",
      ".tsx": "typescript",
      ".mts": "typescript",
      ".cts": "typescript",
      ".py": "python",
      ".pyw": "python",
      ".rs": "rust",
      ".go": "go",
      ".java": "java"
    };
    var CLASS_KINDS = /* @__PURE__ */ new Set(["class", "struct", "interface", "enum", "impl"]);
    var TYPE_KINDS = /* @__PURE__ */ new Set(["trait", "type-alias"]);
    var FUNCTION_LIKE_KINDS = /* @__PURE__ */ new Set(["method", "arrow", "closure"]);
    var CONSTANT_KINDS = /* @__PURE__ */ new Set(["constant", "variable", "const", "field", "property"]);
    function detectLanguage(filePath) {
      return LANGUAGE_BY_EXTENSION[path.extname(filePath).toLowerCase()] || "unknown";
    }
    function detectLanguagesFromFiles(filePaths) {
      const langs = /* @__PURE__ */ new Set();
      for (const fp of filePaths) {
        const lang = detectLanguage(fp);
        if (lang !== "unknown") langs.add(lang);
      }
      return Array.from(langs);
    }
    function convertFile(filePath, fileSym) {
      const exportNames = new Set((fileSym.exports || []).map((e) => e.name));
      const exports3 = (fileSym.exports || []).map((e) => ({
        name: e.name,
        kind: e.kind,
        line: e.line
      }));
      const functions = [];
      const classes = [];
      const types = [];
      const constants = [];
      for (const def of fileSym.definitions || []) {
        const entry = {
          name: def.name,
          kind: def.kind,
          line: def.line,
          exported: exportNames.has(def.name)
        };
        if (def.kind === "function" || FUNCTION_LIKE_KINDS.has(def.kind)) {
          functions.push(entry);
        } else if (CLASS_KINDS.has(def.kind)) {
          classes.push(entry);
        } else if (TYPE_KINDS.has(def.kind)) {
          types.push(entry);
        } else if (CONSTANT_KINDS.has(def.kind)) {
          constants.push(entry);
        } else {
          constants.push(entry);
        }
      }
      const imports = (fileSym.imports || []).map((imp) => ({
        source: imp.from,
        kind: "import",
        names: imp.names || []
      }));
      return {
        language: detectLanguage(filePath),
        symbols: { exports: exports3, functions, classes, types, constants },
        imports
      };
    }
    function convertIntelToRepoMap(intel) {
      const files = {};
      let totalSymbols = 0;
      let totalImports = 0;
      for (const [filePath, fileSym] of Object.entries(intel.symbols || {})) {
        files[filePath] = convertFile(filePath, fileSym);
        const s = files[filePath].symbols;
        totalSymbols += s.functions.length + s.classes.length + s.types.length + s.constants.length;
        totalImports += files[filePath].imports.length;
      }
      return {
        version: "2.0",
        generated: intel.generated || (/* @__PURE__ */ new Date()).toISOString(),
        git: intel.git ? { commit: intel.git.analyzedUpTo } : void 0,
        project: { languages: detectLanguagesFromFiles(Object.keys(files)) },
        stats: {
          totalFiles: Object.keys(files).length,
          totalSymbols,
          totalImports,
          errors: []
        },
        files
      };
    }
    module2.exports = { convertIntelToRepoMap, convertFile, detectLanguage };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/queries.js
var require_queries = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/queries.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var { getStateDir } = require_state_dir();
    var binary = require_binary();
    var RepoIntelMissingError = class extends Error {
      /**
       * @param {string} mapFile - Expected path to the map file
       */
      constructor(mapFile) {
        super(
          `repo-intel map not found at ${mapFile}. Run \`agentsys repo-intel update\` to generate it first.`
        );
        this.name = "RepoIntelMissingError";
        this.code = "REPO_INTEL_MISSING";
        this.mapFile = mapFile;
      }
    };
    var MAP_FILE_NAME = "repo-intel.json";
    function resolveMapFile(cwd) {
      const stateDir = getStateDir(cwd);
      return path.join(cwd, stateDir, MAP_FILE_NAME);
    }
    function requireMapFile(cwd) {
      const mapFile = resolveMapFile(cwd);
      if (!fs.existsSync(mapFile)) {
        throw new RepoIntelMissingError(mapFile);
      }
      return mapFile;
    }
    function runQuery(queryName, extraArgs, cwd) {
      const mapFile = requireMapFile(cwd);
      const args = ["repo-intel", "query", queryName, ...extraArgs, "--map-file", mapFile, cwd];
      let raw;
      try {
        raw = binary.runAnalyzer(args);
      } catch (err) {
        throw new Error(
          `repo-intel query failed [${queryName}]: ${err.message}`,
          { cause: err }
        );
      }
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (_parseErr) {
        const preview = raw.slice(0, 200);
        throw new Error(
          `repo-intel query [${queryName}] returned non-JSON output: ${preview}`
        );
      }
      return parsed;
    }
    function assertString(val, label) {
      if (typeof val !== "string" || val.length === 0) {
        throw new TypeError(`${label} must be a non-empty string`);
      }
    }
    function hotspots(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("hotspots", extra, cwd);
    }
    function coupling(cwd, file, opts = {}) {
      assertString(file, "coupling: file");
      const extra = [file];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("coupling", extra, cwd);
    }
    function busFactor(cwd, opts = {}) {
      const extra = [];
      if (opts.adjustForAi) extra.push("--adjust-for-ai");
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("bus-factor", extra, cwd);
    }
    function testGaps(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      if (opts.minChanges != null) extra.push("--min-changes", String(opts.minChanges));
      return runQuery("test-gaps", extra, cwd);
    }
    function diffRisk(cwd, files) {
      if (!Array.isArray(files)) {
        throw new TypeError("diffRisk: files must be an array of strings");
      }
      if (!files.every((f) => typeof f === "string")) {
        throw new TypeError("diffRisk: all entries in files must be strings");
      }
      const joined = files.join(",");
      if (joined.length > 3e4) {
        throw new RangeError(
          `diffRisk: files argument exceeds 30000 character limit (got ${joined.length})`
        );
      }
      const extra = ["--files", joined];
      return runQuery("diff-risk", extra, cwd);
    }
    function dependents(cwd, symbol, file) {
      assertString(symbol, "dependents: symbol");
      const extra = [symbol];
      if (file != null) {
        assertString(file, "dependents: file");
        extra.push("--file", file);
      }
      return runQuery("dependents", extra, cwd);
    }
    function bugspots(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("bugspots", extra, cwd);
    }
    function health(cwd) {
      return runQuery("health", [], cwd);
    }
    function communities(cwd) {
      return runQuery("communities", [], cwd);
    }
    function boundaries(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("boundaries", extra, cwd);
    }
    function areaOf(cwd, file) {
      assertString(file, "areaOf: file");
      return runQuery("area-of", [file], cwd);
    }
    function communityHealth(cwd, id) {
      if (typeof id !== "number" || !Number.isInteger(id) || id < 0) {
        throw new TypeError(
          "communityHealth: id must be a non-negative integer"
        );
      }
      return runQuery("community-health", [String(id)], cwd);
    }
    function coldspots(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("coldspots", extra, cwd);
    }
    function ownership(cwd, file) {
      assertString(file, "ownership: file");
      return runQuery("ownership", [file], cwd);
    }
    function norms(cwd) {
      return runQuery("norms", [], cwd);
    }
    function areas(cwd) {
      return runQuery("areas", [], cwd);
    }
    function contributors(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("contributors", extra, cwd);
    }
    function releaseInfo(cwd) {
      return runQuery("release-info", [], cwd);
    }
    function fileHistory(cwd, file) {
      assertString(file, "fileHistory: file");
      return runQuery("file-history", [file], cwd);
    }
    function conventions(cwd) {
      return runQuery("conventions", [], cwd);
    }
    function docDrift(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("doc-drift", extra, cwd);
    }
    function onboard(cwd) {
      return runQuery("onboard", [], cwd);
    }
    function canIHelp(cwd) {
      return runQuery("can-i-help", [], cwd);
    }
    function painspots(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("painspots", extra, cwd);
    }
    function entryPoints(cwd, opts = {}) {
      const extra = [];
      if (opts.files) {
        const list = Array.isArray(opts.files) ? opts.files.join(",") : String(opts.files);
        extra.push("--files", list);
      }
      return runQuery("entry-points", extra, cwd);
    }
    function projectInfo(cwd) {
      return runQuery("project-info", [], cwd);
    }
    function symbols(cwd, file) {
      assertString(file, "symbols: file");
      return runQuery("symbols", [file], cwd);
    }
    function staleDocs(cwd, opts = {}) {
      const extra = [];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("stale-docs", extra, cwd);
    }
    function find(cwd, query, opts = {}) {
      assertString(query, "find: query");
      const extra = [query];
      if (opts.limit != null) extra.push("--top", String(opts.limit));
      return runQuery("find", extra, cwd);
    }
    function slopFixes(cwd) {
      return runQuery("slop-fixes", [], cwd);
    }
    function slopTargets(cwd, opts = {}) {
      const extra = [];
      if (opts.top != null) extra.push("--top", String(opts.top));
      return runQuery("slop-targets", extra, cwd);
    }
    function summary(cwd, opts = {}) {
      const mapFile = requireMapFile(cwd);
      const extra = [];
      if (opts.depth != null) extra.push("--depth", String(opts.depth));
      const args = ["repo-intel", "query", "summary", ...extra, "--map-file", mapFile, cwd];
      let raw;
      try {
        raw = binary.runAnalyzer(args).trim();
      } catch (err) {
        throw new Error(`repo-intel query failed [summary]: ${err.message}`, { cause: err });
      }
      if (raw === "null") return null;
      if (opts.depth != null) return raw;
      try {
        return JSON.parse(raw);
      } catch (_parseErr) {
        throw new Error(
          `repo-intel query [summary] returned non-JSON output: ${raw.slice(0, 200)}`
        );
      }
    }
    module2.exports = {
      // Error class
      RepoIntelMissingError,
      // Core queries
      hotspots,
      coupling,
      busFactor,
      testGaps,
      diffRisk,
      dependents,
      bugspots,
      health,
      // Graph queries
      communities,
      boundaries,
      areaOf,
      communityHealth,
      // Activity / git queries
      coldspots,
      ownership,
      norms,
      areas,
      contributors,
      releaseInfo,
      fileHistory,
      conventions,
      docDrift,
      // Narrative / guidance queries
      onboard,
      canIHelp,
      painspots,
      entryPoints,
      projectInfo,
      // AST / symbol queries
      symbols,
      staleDocs,
      find,
      // Deslop-agent queries
      slopFixes,
      slopTargets,
      summary
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/embed/preference.js
var require_preference = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/preference.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var cache = require_cache();
    var VALID_EMBEDDER = ["none", "small", "big"];
    var VALID_DETAIL = ["compact", "balanced", "maximum"];
    function preferencePath(cwd) {
      return path.join(cache.getStateDirPath(cwd), "sources", "preference.json");
    }
    function read(cwd) {
      const p = preferencePath(cwd);
      if (!fs.existsSync(p)) return {};
      try {
        const raw = JSON.parse(fs.readFileSync(p, "utf8"));
        return raw && typeof raw === "object" ? raw : {};
      } catch (e) {
        return {};
      }
    }
    function update(cwd, patch) {
      const current = read(cwd);
      const next = Object.assign({}, current, patch || {});
      const p = preferencePath(cwd);
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, JSON.stringify(next, null, 2));
      return next;
    }
    function reset(cwd) {
      const current = read(cwd);
      delete current.embedder;
      delete current.embedderDetail;
      const p = preferencePath(cwd);
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, JSON.stringify(current, null, 2));
    }
    function hasEmbedderChoice(cwd) {
      const pref = read(cwd);
      return VALID_EMBEDDER.includes(pref.embedder);
    }
    function hasDetailChoice(cwd) {
      const pref = read(cwd);
      return VALID_DETAIL.includes(pref.embedderDetail);
    }
    function detailToCliArg(detail) {
      switch (detail) {
        case "compact":
          return "compact";
        case "maximum":
          return "maximum";
        case "balanced":
        default:
          return "balanced";
      }
    }
    module2.exports = {
      read,
      update,
      reset,
      hasEmbedderChoice,
      hasDetailChoice,
      detailToCliArg,
      preferencePath,
      VALID_EMBEDDER,
      VALID_DETAIL
    };
  }
});

// ../work/agent-sh__agentsys/lib/binary/shared-helpers.js
var require_shared_helpers = __commonJS({
  "../work/agent-sh__agentsys/lib/binary/shared-helpers.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var os = require("os");
    var https = require("https");
    var cp = require("child_process");
    var DEFAULT_DOWNLOAD_TIMEOUT_MS = 3e4;
    var MAX_REDIRECTS = 5;
    function downloadToBuffer(url, options) {
      const opts = options || {};
      const userAgent = opts.userAgent || "agent-sh/binary-resolver";
      const timeoutMs = opts.timeoutMs || DEFAULT_DOWNLOAD_TIMEOUT_MS;
      return new Promise(function(resolve, reject) {
        const ghToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        function request(reqUrl, redirectCount) {
          if (redirectCount > MAX_REDIRECTS) {
            reject(new Error("Too many redirects fetching from " + url));
            return;
          }
          const headers = {
            "User-Agent": userAgent,
            "Accept": "application/octet-stream"
          };
          if (ghToken) headers["Authorization"] = "Bearer " + ghToken;
          const req = https.get(reqUrl, { headers, timeout: timeoutMs }, function(res) {
            const sc = res.statusCode;
            if (sc === 301 || sc === 302 || sc === 307 || sc === 308) {
              res.resume();
              var loc = res.headers.location;
              if (loc && !loc.startsWith("https://")) {
                reject(new Error("Refusing non-HTTPS redirect to " + loc));
                return;
              }
              request(loc, redirectCount + 1);
              return;
            }
            if (sc !== 200) {
              res.resume();
              const hint = sc === 403 ? " (rate limited - set GITHUB_TOKEN env var)" : "";
              reject(new Error("HTTP " + sc + hint + " fetching " + reqUrl));
              return;
            }
            const chunks = [];
            res.on("data", function(chunk) {
              chunks.push(chunk);
            });
            res.on("end", function() {
              resolve(Buffer.concat(chunks));
            });
            res.on("error", reject);
          });
          req.on("error", reject);
          req.on("timeout", function() {
            req.destroy();
            reject(new Error("Timeout (" + timeoutMs + "ms) fetching " + reqUrl));
          });
        }
        request(url, 0);
      });
    }
    function extractTarGz(buf, destDir) {
      return new Promise(function(resolve, reject) {
        const tarDest = process.platform === "win32" ? destDir.replace(/\\/g, "/") : destDir;
        const tar = cp.spawn("tar", ["xz", "-C", tarDest], {
          stdio: ["pipe", "pipe", "pipe"]
        });
        let stderr = "";
        tar.stderr.on("data", function(d) {
          stderr += d;
        });
        tar.stdin.write(buf);
        tar.stdin.end();
        tar.on("close", function(code) {
          if (code !== 0) {
            reject(new Error("tar extraction failed (code " + code + "): " + stderr));
          } else {
            resolve();
          }
        });
        tar.on("error", reject);
      });
    }
    function extractZip(buf, destDir, binaryName) {
      return new Promise(function(resolve, reject) {
        var tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), binaryName + "-"));
        var tmpZip = path.join(tmpDir, "archive.zip");
        fs.writeFileSync(tmpZip, buf);
        var ps = cp.spawn(
          "powershell",
          [
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            "Expand-Archive",
            "-Path",
            tmpZip,
            "-DestinationPath",
            destDir,
            "-Force"
          ],
          { stdio: ["ignore", "pipe", "pipe"] }
        );
        var stderr = "";
        ps.stderr.on("data", function(d) {
          stderr += d;
        });
        ps.on("close", function(code) {
          try {
            fs.rmSync(tmpDir, { recursive: true, force: true });
          } catch (e) {
          }
          if (code !== 0) {
            reject(new Error("zip extraction failed (code " + code + "): " + stderr));
          } else {
            resolve();
          }
        });
        ps.on("error", reject);
      });
    }
    module2.exports = {
      downloadToBuffer,
      extractTarGz,
      extractZip,
      DEFAULT_DOWNLOAD_TIMEOUT_MS
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/embed/binary.js
var require_binary2 = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/binary.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var os = require("os");
    var https = require("https");
    var cp = require("child_process");
    var mainBinary = require_binary();
    var sharedHelpers = require_shared_helpers();
    var EMBED_BINARY_NAME = "agent-analyzer-embed";
    var EMBED_GITHUB_REPO = "agent-sh/agent-analyzer";
    var LATEST_VERSION_TTL_MS = 60 * 60 * 1e3;
    var PLATFORM_MAP = mainBinary.PLATFORM_MAP;
    function getBinaryPath() {
      const ext = process.platform === "win32" ? ".exe" : "";
      return path.join(os.homedir(), ".agent-sh", "bin", EMBED_BINARY_NAME + ext);
    }
    function getBundledOrtName() {
      if (process.platform === "win32") return "onnxruntime.dll";
      if (process.platform === "darwin") return "libonnxruntime.dylib";
      return "libonnxruntime.so";
    }
    function getBundledOrtPath() {
      return path.join(path.dirname(getBinaryPath()), getBundledOrtName());
    }
    function platformBundlesOrt() {
      const key = getPlatformKey();
      return !!key && !key.includes("musl");
    }
    function getPlatformKey() {
      const key = process.platform + "-" + process.arch;
      return PLATFORM_MAP[key] || null;
    }
    function getVersion() {
      const binPath = getBinaryPath();
      if (!fs.existsSync(binPath)) return null;
      try {
        const out = cp.execFileSync(binPath, ["--version"], {
          timeout: 5e3,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        const match = out.trim().match(/(\d+\.\d+\.\d+)/);
        return match ? match[1] : out.trim();
      } catch (e) {
        return null;
      }
    }
    function isAvailable() {
      return fs.existsSync(getBinaryPath());
    }
    var _latestVersionCache = null;
    async function getLatestReleaseVersion() {
      if (_latestVersionCache && Date.now() - _latestVersionCache.fetchedAt < LATEST_VERSION_TTL_MS) {
        return _latestVersionCache.version;
      }
      return new Promise(function(resolve, reject) {
        const ghToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        const headers = {
          "User-Agent": "agent-sh/embed-resolver",
          "Accept": "application/vnd.github+json"
        };
        if (ghToken) headers["Authorization"] = "Bearer " + ghToken;
        const url = "https://api.github.com/repos/" + EMBED_GITHUB_REPO + "/releases/latest";
        const fail = function(msg) {
          reject(new Error(msg + " fetching " + url));
        };
        const req = https.get(url, { headers, timeout: 5e3 }, function(res) {
          if (res.statusCode !== 200) {
            res.resume();
            fail("HTTP " + res.statusCode);
            return;
          }
          const chunks = [];
          res.on("data", function(chunk) {
            chunks.push(chunk);
          });
          res.on("end", function() {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
              const tag = body && body.tag_name || "";
              const version = tag.replace(/^v/, "");
              if (/^\d+\.\d+\.\d+/.test(version)) {
                _latestVersionCache = { version, fetchedAt: Date.now() };
                resolve(version);
              } else {
                fail("No valid release tag");
              }
            } catch (e) {
              fail("Failed to parse release JSON: " + e.message);
            }
          });
          res.on("error", function(e) {
            fail(e.message);
          });
        });
        req.on("error", function(e) {
          fail(e.message);
        });
        req.on("timeout", function() {
          req.destroy();
          fail("Timeout");
        });
      });
    }
    function buildDownloadUrl(ver, platformKey) {
      const ext = process.platform === "win32" ? ".zip" : ".tar.gz";
      return "https://github.com/" + EMBED_GITHUB_REPO + "/releases/download/v" + ver + "/" + EMBED_BINARY_NAME + "-" + platformKey + ext;
    }
    function downloadToBuffer(url) {
      return sharedHelpers.downloadToBuffer(url, { userAgent: "agent-sh/embed-resolver" });
    }
    var extractTarGz = sharedHelpers.extractTarGz;
    var extractZip = sharedHelpers.extractZip;
    async function downloadBinary(ver) {
      const platformKey = getPlatformKey();
      if (!platformKey) {
        throw new Error(
          "Unsupported platform: " + process.platform + "-" + process.arch + ". Supported: " + Object.keys(PLATFORM_MAP).join(", ")
        );
      }
      const url = buildDownloadUrl(ver, platformKey);
      process.stderr.write("Downloading " + EMBED_BINARY_NAME + " v" + ver + " for " + platformKey + "...\n");
      const binPath = getBinaryPath();
      const binDir = path.dirname(binPath);
      fs.mkdirSync(binDir, { recursive: true });
      let buf;
      try {
        buf = await downloadToBuffer(url);
      } catch (err) {
        throw new Error(
          "Failed to download " + EMBED_BINARY_NAME + ":\n  URL: " + url + "\n  Error: " + err.message + "\n\nTo install manually:\n  1. Download: " + url + "\n  2. Extract the binary to: " + binDir + "\n  3. Ensure it is named: " + path.basename(binPath)
        );
      }
      if (process.platform === "win32") {
        await extractZip(buf, binDir, path.basename(binPath));
      } else {
        await extractTarGz(buf, binDir);
      }
      if (process.platform !== "win32") {
        fs.chmodSync(binPath, 493);
      }
      return binPath;
    }
    async function ensureBinary(options) {
      const opts = options || {};
      const binPath = getBinaryPath();
      if (fs.existsSync(binPath)) {
        if (platformBundlesOrt() && !fs.existsSync(getBundledOrtPath())) {
          const targetVer2 = opts.version || await getLatestReleaseVersion();
          return downloadBinary(targetVer2);
        }
        return binPath;
      }
      const targetVer = opts.version || await getLatestReleaseVersion();
      return downloadBinary(targetVer);
    }
    module2.exports = {
      EMBED_BINARY_NAME,
      getBinaryPath,
      getBundledOrtName,
      getBundledOrtPath,
      platformBundlesOrt,
      getVersion,
      getPlatformKey,
      getLatestReleaseVersion,
      isAvailable,
      ensureBinary,
      buildDownloadUrl
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/embed/orchestrator.js
var require_orchestrator = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/orchestrator.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var cp = require("child_process");
    var preference = require_preference();
    var embedBinary = require_binary2();
    var mainBinary = require_binary();
    var cache = require_cache();
    function isEnabled(cwd) {
      const pref = preference.read(cwd);
      return pref.embedder === "small" || pref.embedder === "big";
    }
    async function runScan(cwd) {
      if (!isEnabled(cwd)) {
        return { ran: false, reason: 'embedder preference is "none" or unset' };
      }
      const pref = preference.read(cwd);
      const detail = preference.detailToCliArg(pref.embedderDetail || "balanced");
      const mapFile = cache.getPath(cwd);
      if (!fs.existsSync(mapFile)) {
        return { ran: false, reason: "no repo-intel map found; run `/repo-intel init` first" };
      }
      const start = Date.now();
      const embedBin = await embedBinary.ensureBinary();
      const mainBin = await mainBinary.ensureBinary();
      const result = await streamEmbedToSetEmbeddings(
        embedBin,
        ["scan", cwd, "--variant", pref.embedder, "--detail", detail],
        mainBin,
        mapFile
      );
      return Object.assign({ ran: true, durationMs: Date.now() - start }, result);
    }
    async function runUpdate(cwd) {
      if (!isEnabled(cwd)) {
        return { ran: false, reason: 'embedder preference is "none" or unset' };
      }
      const pref = preference.read(cwd);
      const detail = preference.detailToCliArg(pref.embedderDetail || "balanced");
      const mapFile = cache.getPath(cwd);
      if (!fs.existsSync(mapFile)) {
        return { ran: false, reason: "no repo-intel map; run `/repo-intel init` then `enrich`" };
      }
      const start = Date.now();
      const embedBin = await embedBinary.ensureBinary();
      const mainBin = await mainBinary.ensureBinary();
      const result = await streamEmbedToSetEmbeddings(
        embedBin,
        ["update", cwd, "--map-file", mapFile, "--variant", pref.embedder, "--detail", detail],
        mainBin,
        mapFile
      );
      return Object.assign({ ran: true, durationMs: Date.now() - start }, result);
    }
    function status(cwd) {
      const pref = preference.read(cwd);
      const mapFile = cache.getPath(cwd);
      const sidecarPath = deriveSidecarPath(mapFile);
      return {
        enabled: isEnabled(cwd),
        embedder: pref.embedder,
        embedderDetail: pref.embedderDetail,
        binaryInstalled: embedBinary.isAvailable(),
        ortBundled: !embedBinary.platformBundlesOrt() || fs.existsSync(embedBinary.getBundledOrtPath()),
        sidecarExists: fs.existsSync(sidecarPath),
        sidecarPath
      };
    }
    function streamEmbedToSetEmbeddings(embedBinPath, embedArgs, mainBinPath, mapFile) {
      return new Promise(function(resolve, reject) {
        const embedChild = cp.spawn(embedBinPath, embedArgs, {
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true
        });
        const setChild = cp.spawn(
          mainBinPath,
          ["repo-intel", "set-embeddings", "--map-file", mapFile, "--input", "-"],
          { stdio: ["pipe", "pipe", "pipe"], windowsHide: true }
        );
        let embedExit = null;
        let setExit = null;
        let settled = false;
        let setStdout = "";
        let embedStderr = "";
        let setStderr = "";
        function done(err, value) {
          if (settled) return;
          settled = true;
          if (err) {
            try {
              embedChild.kill("SIGTERM");
            } catch (e) {
            }
            try {
              setChild.kill("SIGTERM");
            } catch (e) {
            }
            reject(err);
          } else {
            resolve(value);
          }
        }
        function maybeFinish() {
          if (settled || embedExit === null || setExit === null) return;
          if (embedExit !== 0) {
            return done(new Error(
              embedBinary.EMBED_BINARY_NAME + " exited " + embedExit + (embedStderr.trim() ? ": " + embedStderr.trim().slice(0, 500) : "")
            ));
          }
          if (setExit !== 0) {
            return done(new Error(
              "agent-analyzer set-embeddings exited " + setExit + (setStderr.trim() ? ": " + setStderr.trim().slice(0, 500) : "")
            ));
          }
          const m = setStdout.match(/(\d+)\s+files?/);
          done(null, { files: m ? parseInt(m[1], 10) : void 0 });
        }
        embedChild.stderr.on("data", function(d) {
          embedStderr += d.toString("utf8");
        });
        setChild.stderr.on("data", function(d) {
          setStderr += d.toString("utf8");
        });
        setChild.stdout.on("data", function(d) {
          setStdout += d.toString("utf8");
        });
        embedChild.stdout.on("error", function(e) {
          done(e);
        });
        setChild.stdin.on("error", function(e) {
          if (e && e.code !== "EPIPE") done(e);
        });
        embedChild.stdout.pipe(setChild.stdin);
        embedChild.on("error", function(e) {
          done(e);
        });
        setChild.on("error", function(e) {
          done(e);
        });
        embedChild.on("close", function(code) {
          embedExit = code;
          maybeFinish();
        });
        setChild.on("close", function(code) {
          setExit = code;
          maybeFinish();
        });
      });
    }
    function deriveSidecarPath(mapFile) {
      if (!mapFile) return "";
      const dir = path.dirname(mapFile);
      const stem = path.basename(mapFile, path.extname(mapFile));
      return path.join(dir, stem + ".embeddings.bin");
    }
    module2.exports = {
      isEnabled,
      runScan,
      runUpdate,
      status,
      // exported for testing the dual-process pipe in isolation
      streamEmbedToSetEmbeddings
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/embed/index.js
var require_embed = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/embed/index.js"(exports2, module2) {
    "use strict";
    var preference = require_preference();
    var binary = require_binary2();
    var orchestrator = require_orchestrator();
    module2.exports = {
      preference,
      binary,
      orchestrator,
      // Convenience re-exports for the common cases.
      isEnabled: orchestrator.isEnabled,
      runScan: orchestrator.runScan,
      runUpdate: orchestrator.runUpdate,
      status: orchestrator.status
    };
  }
});

// ../work/agent-sh__agentsys/lib/repo-intel/index.js
var require_repo_intel = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-intel/index.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var cp = require("child_process");
    var { execFileSync } = cp;
    var installer = require_installer();
    var cache = require_cache();
    var updater = require_updater();
    var converter = require_converter();
    var queries = require_queries();
    var binary = require_binary();
    var { getStateDirPath } = require_state_dir();
    var { writeJsonAtomic } = require_atomic_write();
    var REPO_INTEL_FILENAME = "repo-intel.json";
    function getIntelMapPath(basePath) {
      return path.join(getStateDirPath(basePath), REPO_INTEL_FILENAME);
    }
    async function init(basePath, options = {}) {
      const installed = await installer.checkInstalled();
      if (!installed.found) {
        return {
          success: false,
          error: "agent-analyzer binary unavailable: " + (installed.error || "unknown error"),
          installSuggestion: installer.getInstallInstructions()
        };
      }
      const existing = cache.load(basePath);
      if (existing && !options.force) {
        return {
          success: false,
          error: "Repo map already exists. Use --force to rebuild or update to refresh.",
          existing: cache.getStatus(basePath)
        };
      }
      const startTime = Date.now();
      let intelJson;
      try {
        intelJson = await binary.runAnalyzerAsync(["repo-intel", "init", basePath]);
      } catch (e) {
        return { success: false, error: "agent-analyzer repo-intel init failed: " + e.message };
      }
      let intel;
      try {
        intel = JSON.parse(intelJson);
      } catch (e) {
        return { success: false, error: "Failed to parse repo-intel output: " + e.message };
      }
      const intelPath = getIntelMapPath(basePath);
      try {
        writeJsonAtomic(intelPath, intel);
      } catch {
      }
      const map = converter.convertIntelToRepoMap(intel);
      map.stats.scanDurationMs = Date.now() - startTime;
      cache.save(basePath, map);
      return {
        success: true,
        map,
        summary: {
          files: Object.keys(map.files).length,
          symbols: map.stats.totalSymbols,
          languages: map.project.languages,
          duration: map.stats.scanDurationMs
        }
      };
    }
    async function update(basePath, options = {}) {
      const installed = await installer.checkInstalled();
      if (!installed.found) {
        return {
          success: false,
          error: "agent-analyzer binary unavailable: " + (installed.error || "unknown error"),
          installSuggestion: installer.getInstallInstructions()
        };
      }
      if (!cache.exists(basePath)) {
        return { success: false, error: "No repo map found. Run init first." };
      }
      if (options.full) {
        return init(basePath, { force: true });
      }
      const intelPath = getIntelMapPath(basePath);
      if (!fs.existsSync(intelPath)) {
        return init(basePath, { force: true });
      }
      const startTime = Date.now();
      let intelJson;
      try {
        intelJson = await binary.runAnalyzerAsync([
          "repo-intel",
          "update",
          "--map-file",
          intelPath,
          basePath
        ]);
      } catch (e) {
        return { success: false, error: "agent-analyzer repo-intel update failed: " + e.message };
      }
      let intel;
      try {
        intel = JSON.parse(intelJson);
      } catch (e) {
        return { success: false, error: "Failed to parse repo-intel update output: " + e.message };
      }
      try {
        writeJsonAtomic(intelPath, intel);
      } catch {
      }
      const map = converter.convertIntelToRepoMap(intel);
      map.stats.scanDurationMs = Date.now() - startTime;
      cache.save(basePath, map);
      return {
        success: true,
        map,
        summary: {
          files: Object.keys(map.files).length,
          symbols: map.stats.totalSymbols,
          duration: map.stats.scanDurationMs
        }
      };
    }
    function status(basePath) {
      const map = cache.load(basePath);
      if (!map) {
        return { exists: false };
      }
      const staleness = updater.checkStaleness(basePath, map);
      let branch;
      try {
        branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: basePath, encoding: "utf8" }).trim();
      } catch {
      }
      return {
        exists: true,
        status: {
          generated: map.generated,
          updated: map.updated,
          commit: map.git?.commit,
          branch,
          files: Object.keys(map.files).length,
          symbols: map.stats?.totalSymbols || 0,
          languages: map.project?.languages || [],
          staleness
        }
      };
    }
    function load(basePath) {
      return cache.load(basePath);
    }
    function exists(basePath) {
      return cache.exists(basePath);
    }
    function loadRaw(basePath) {
      const p = getIntelMapPath(basePath);
      if (!fs.existsSync(p)) return null;
      try {
        return JSON.parse(fs.readFileSync(p, "utf8"));
      } catch {
        return null;
      }
    }
    async function runAnalyzerWithStdin(args, stdinJson) {
      const binPath = await binary.ensureBinary();
      return new Promise((resolve, reject) => {
        const proc = cp.spawn(binPath, args, {
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true
        });
        let stdout = "";
        let stderr = "";
        proc.stdout.on("data", (chunk) => {
          stdout += chunk.toString("utf8");
        });
        proc.stderr.on("data", (chunk) => {
          stderr += chunk.toString("utf8");
        });
        proc.on("error", reject);
        proc.on("close", (code) => {
          if (code === 0) {
            resolve({ stdout, stderr });
          } else {
            reject(new Error(
              `agent-analyzer ${args.join(" ")} exited ${code}: ${stderr.trim() || stdout.trim()}`
            ));
          }
        });
        proc.stdin.write(stdinJson);
        proc.stdin.end();
      });
    }
    async function applyDescriptors(basePath, descriptors) {
      if (!descriptors || typeof descriptors !== "object") {
        throw new Error("applyDescriptors requires an object {path: descriptor}");
      }
      const mapFile = getIntelMapPath(basePath);
      if (!fs.existsSync(mapFile)) {
        throw new Error("No repo-intel artifact for " + basePath + "; run init first.");
      }
      await runAnalyzerWithStdin(
        ["repo-intel", "set-descriptors", "--map-file", mapFile, "--input", "-"],
        JSON.stringify(descriptors)
      );
    }
    async function applySummary(basePath, summary) {
      if (!summary || !summary.depth1 || !summary.depth3 || !summary.depth10) {
        throw new Error("applySummary requires {depth1, depth3, depth10, inputHash}");
      }
      const mapFile = getIntelMapPath(basePath);
      if (!fs.existsSync(mapFile)) {
        throw new Error("No repo-intel artifact for " + basePath + "; run init first.");
      }
      await runAnalyzerWithStdin(
        ["repo-intel", "set-summary", "--map-file", mapFile, "--input", "-"],
        JSON.stringify(summary)
      );
    }
    async function checkAstGrepInstalled() {
      return installer.checkInstalled();
    }
    function getInstallInstructions() {
      return installer.getInstallInstructions();
    }
    module2.exports = {
      // Lifecycle (was lib/repo-map)
      init,
      update,
      status,
      load,
      loadRaw,
      exists,
      applyDescriptors,
      applySummary,
      checkAstGrepInstalled,
      getInstallInstructions,
      // Typed query wrappers (read the cached repo-intel.json)
      queries,
      // Submodules for advanced use
      installer,
      cache,
      updater,
      converter
    };
    Object.defineProperty(module2.exports, "embed", {
      enumerable: true,
      get() {
        return require_embed();
      }
    });
  }
});

// ../work/agent-sh__agentsys/lib/repo-map/index.js
var require_repo_map = __commonJS({
  "../work/agent-sh__agentsys/lib/repo-map/index.js"(exports2, module2) {
    "use strict";
    var repoIntel = require_repo_intel();
    module2.exports = {
      init: repoIntel.init,
      update: repoIntel.update,
      status: repoIntel.status,
      load: repoIntel.load,
      exists: repoIntel.exists,
      checkAstGrepInstalled: repoIntel.checkAstGrepInstalled,
      getInstallInstructions: repoIntel.getInstallInstructions,
      installer: repoIntel.installer,
      cache: repoIntel.cache,
      updater: repoIntel.updater
    };
  }
});

// ../work/agent-sh__agentsys/lib/collectors/docs-patterns.js
var require_docs_patterns = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/docs-patterns.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var { execFileSync } = require("child_process");
    var repoMapModule = null;
    var repoMapLoadError = null;
    function getRepoMap() {
      if (!repoMapModule && !repoMapLoadError) {
        try {
          repoMapModule = require_repo_map();
        } catch (err) {
          repoMapLoadError = err.message || "Failed to load repo-map module";
          repoMapModule = null;
        }
      }
      return repoMapModule;
    }
    function getRepoMapLoadError() {
      return repoMapLoadError;
    }
    var DEFAULT_OPTIONS2 = {
      cwd: process.cwd()
    };
    var MAX_SCAN_DEPTH = 5;
    var MAX_DOC_FILES = 200;
    var INTERNAL_DIRS = ["internal", "private", "utils", "helpers", "__tests__", "test", "tests"];
    var ENTRY_NAMES = ["index", "main", "app", "server", "cli", "bin"];
    var EXPORT_PATTERNS = [
      /export\s+(?:function|class|const|let|var)\s+(\w+)/g,
      /export\s+\{([^}]+)\}/g,
      /module\.exports\s*=\s*\{([^}]+)\}/
    ];
    function escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function isInternalExport(name, filePath) {
      if (name.startsWith("_")) return true;
      const pathLower = filePath.toLowerCase();
      for (const dir of INTERNAL_DIRS) {
        if (pathLower.includes(`/${dir}/`) || pathLower.includes(`\\${dir}\\`)) {
          return true;
        }
      }
      if (/\.(test|spec)\.[jt]sx?$/.test(filePath)) return true;
      return false;
    }
    function isEntryPoint(filePath) {
      const basename = path.basename(filePath);
      const nameWithoutExt = basename.replace(/\.[^.]+$/, "").toLowerCase();
      return ENTRY_NAMES.includes(nameWithoutExt);
    }
    async function ensureRepoMap(options = {}) {
      const { cwd = process.cwd(), askUser } = options;
      const repoMap = getRepoMap();
      if (!repoMap) {
        return { available: false, map: null, fallbackReason: "repo-map-module-not-found" };
      }
      if (repoMap.exists(cwd)) {
        const map = repoMap.load(cwd);
        return { available: true, map, fallbackReason: null };
      }
      const installed = await repoMap.checkAstGrepInstalled();
      if (!installed.found) {
        if (askUser) {
          const answer = await askUser({
            question: "ast-grep not found. Install for better doc sync accuracy?",
            header: "ast-grep Required",
            options: [
              { label: "Yes, show instructions", description: "Better accuracy with AST-based symbol detection" },
              { label: "No, use regex fallback", description: "Less accurate but works without additional install" }
            ]
          });
          if (answer && answer.includes("Yes")) {
            const instructions = repoMap.getInstallInstructions();
            return {
              available: false,
              map: null,
              fallbackReason: "ast-grep-install-pending",
              installInstructions: instructions
            };
          }
        }
        return { available: false, map: null, fallbackReason: "ast-grep-not-installed" };
      }
      try {
        const initResult = await repoMap.init(cwd, { force: false });
        if (initResult.success) {
          return { available: true, map: initResult.map, fallbackReason: null };
        }
        if (initResult.error && initResult.error.includes("already exists")) {
          const map = repoMap.load(cwd);
          return { available: true, map, fallbackReason: null };
        }
        return { available: false, map: null, fallbackReason: initResult.error || "init-failed" };
      } catch (err) {
        return { available: false, map: null, fallbackReason: err.message || "init-error" };
      }
    }
    function ensureRepoMapSync(options = {}) {
      const { cwd = process.cwd() } = options;
      const repoMap = getRepoMap();
      if (!repoMap) {
        return { available: false, map: null, fallbackReason: "repo-map-module-not-found" };
      }
      if (repoMap.exists(cwd)) {
        const map = repoMap.load(cwd);
        return { available: true, map, fallbackReason: null };
      }
      return { available: false, map: null, fallbackReason: "repo-map-not-initialized" };
    }
    function getExportsFromRepoMap(filePath, map) {
      if (!map || !map.files) return null;
      const normalizedPath = filePath.replace(/\\/g, "/");
      let fileData = map.files[normalizedPath];
      if (!fileData && normalizedPath.startsWith("./")) {
        fileData = map.files[normalizedPath.slice(2)];
      }
      if (!fileData && !normalizedPath.startsWith("./")) {
        fileData = map.files["./" + normalizedPath];
      }
      if (!fileData || !fileData.symbols || !fileData.symbols.exports) {
        return null;
      }
      return fileData.symbols.exports.map((e) => e.name);
    }
    function findUndocumentedExports(changedFiles, options = {}) {
      const opts = { ...DEFAULT_OPTIONS2, ...options };
      const repoMapStatus = opts.repoMapStatus || ensureRepoMapSync(opts);
      if (!repoMapStatus.available || !repoMapStatus.map) {
        return [];
      }
      const map = repoMapStatus.map;
      const allDocs = findMarkdownFiles(opts.cwd);
      let allDocContent = "";
      for (const doc of allDocs) {
        try {
          allDocContent += fs.readFileSync(path.join(opts.cwd, doc), "utf8") + "\n";
        } catch {
        }
      }
      const issues = [];
      for (const file of changedFiles) {
        const normalizedFile = file.replace(/\\/g, "/");
        const fileData = map.files[normalizedFile] || map.files[normalizedFile.replace(/^\.\//, "")];
        if (!fileData || !fileData.symbols || !fileData.symbols.exports) {
          continue;
        }
        for (const exp of fileData.symbols.exports) {
          if (isInternalExport(exp.name, normalizedFile)) continue;
          if (isEntryPoint(normalizedFile)) continue;
          const namePattern = new RegExp(`\\b${escapeRegex(exp.name)}\\b`);
          if (!namePattern.test(allDocContent)) {
            issues.push({
              type: "undocumented-export",
              severity: "low",
              file: normalizedFile,
              name: exp.name,
              line: exp.line || 0,
              kind: exp.kind || "export",
              certainty: "MEDIUM",
              suggestion: `Export '${exp.name}' in ${normalizedFile} is not mentioned in any documentation`
            });
          }
        }
      }
      return issues;
    }
    function findRelatedDocs(changedFiles, options = {}) {
      const opts = { ...DEFAULT_OPTIONS2, ...options };
      const basePath = opts.cwd;
      const results = [];
      const docFiles = findMarkdownFiles(basePath);
      for (const file of changedFiles) {
        const basename = path.basename(file).replace(/\.[^.]+$/, "");
        const modulePath = file.replace(/\.[^.]+$/, "");
        const dirName = path.dirname(file);
        for (const doc of docFiles) {
          let content;
          try {
            content = fs.readFileSync(path.join(basePath, doc), "utf8");
          } catch {
            continue;
          }
          const references = [];
          if (content.includes(basename)) {
            references.push("filename");
          }
          if (content.includes(file)) {
            references.push("full-path");
          }
          if (content.includes(`from '${modulePath}'`) || content.includes(`from "${modulePath}"`)) {
            references.push("import");
          }
          if (content.includes(`require('${modulePath}')`) || content.includes(`require("${modulePath}")`)) {
            references.push("require");
          }
          if (content.includes(`/${basename}`) || content.includes(`/${basename}.`)) {
            references.push("url-path");
          }
          if (references.length > 0) {
            results.push({
              doc,
              referencedFile: file,
              referenceTypes: references
            });
          }
        }
      }
      return results;
    }
    function findMarkdownFiles(basePath) {
      const files = [];
      const excludeDirs = ["node_modules", "dist", "build", ".git", "coverage", "vendor"];
      function scan(dir, depth = 0) {
        if (depth > MAX_SCAN_DEPTH || files.length > MAX_DOC_FILES) return;
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(basePath, fullPath);
            if (entry.isDirectory()) {
              if (!excludeDirs.includes(entry.name) && !entry.name.startsWith(".")) {
                scan(fullPath, depth + 1);
              }
            } else if (entry.isFile() && entry.name.endsWith(".md")) {
              files.push(relativePath);
            }
          }
        } catch {
        }
      }
      scan(basePath);
      return files;
    }
    function analyzeDocIssues(docPath, changedFile, options = {}) {
      const opts = { ...DEFAULT_OPTIONS2, ...options };
      const basePath = opts.cwd;
      const issues = [];
      let content;
      try {
        content = fs.readFileSync(path.join(basePath, docPath), "utf8");
      } catch {
        return issues;
      }
      const lines = content.split("\n");
      const codeBlockRegex = /```[\s\S]*?```/g;
      const codeBlocks = content.match(codeBlockRegex) || [];
      for (const block of codeBlocks) {
        const importRegex = /import .* from ['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(block)) !== null) {
          const importPath = match[1];
          const changedModulePath = changedFile.replace(/\.[^.]+$/, "");
          if (importPath.includes(path.basename(changedModulePath))) {
            issues.push({
              type: "code-example",
              severity: "medium",
              line: findLineNumber(content, match[0]),
              current: match[0],
              suggestion: "Verify import path is still valid"
            });
          }
        }
      }
      const repoMapStatus = ensureRepoMapSync(opts);
      let oldExports, newExports;
      let usingRepoMap = false;
      if (repoMapStatus.available && repoMapStatus.map) {
        const repoMapExports = getExportsFromRepoMap(changedFile, repoMapStatus.map);
        if (repoMapExports) {
          newExports = repoMapExports;
          oldExports = getExportsFromGit(changedFile, "HEAD~1", opts);
          usingRepoMap = true;
        }
      }
      if (!usingRepoMap) {
        oldExports = getExportsFromGit(changedFile, "HEAD~1", opts);
        newExports = getExportsFromGit(changedFile, "HEAD", opts);
      }
      const removed = oldExports.filter((e) => !newExports.includes(e));
      for (const fn of removed) {
        if (content.includes(fn)) {
          issues.push({
            type: "removed-export",
            severity: "high",
            reference: fn,
            suggestion: `'${fn}' was removed or renamed`,
            detectionMethod: usingRepoMap ? "repo-map" : "regex"
          });
        }
      }
      try {
        const pkgContent = fs.readFileSync(path.join(basePath, "package.json"), "utf8");
        const pkg = JSON.parse(pkgContent);
        const currentVersion = pkg.version;
        const versionMatches = content.matchAll(/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi);
        for (const match of versionMatches) {
          const docVersion = match[1];
          if (docVersion !== currentVersion && compareVersions(docVersion, currentVersion) < 0) {
            issues.push({
              type: "outdated-version",
              severity: "low",
              line: findLineNumber(content, match[0]),
              current: docVersion,
              expected: currentVersion,
              suggestion: `Update version from ${docVersion} to ${currentVersion}`
            });
          }
        }
      } catch {
      }
      return issues;
    }
    function findLineNumber(content, search) {
      const index = content.indexOf(search);
      if (index === -1) return 0;
      return content.substring(0, index).split("\n").length;
    }
    function isValidGitRef(ref) {
      if (typeof ref !== "string" || !ref) return false;
      return /^[a-zA-Z0-9_./-]+(?:[~^][0-9]+)?$/.test(ref);
    }
    function getExportsFromGit(filePath, ref, options = {}) {
      const opts = { ...DEFAULT_OPTIONS2, ...options };
      if (!isValidGitRef(ref)) {
        return [];
      }
      try {
        const content = execFileSync("git", ["show", `${ref}:${filePath}`], {
          cwd: opts.cwd,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        });
        const exports3 = [];
        for (const pattern of EXPORT_PATTERNS) {
          const regex = new RegExp(pattern.source, pattern.flags);
          let match;
          while ((match = regex.exec(content)) !== null) {
            if (match[1].includes(",")) {
              const names = match[1].split(",").map((s) => s.trim().split(/\s+as\s+/)[0].trim());
              exports3.push(...names.filter((n) => n && /^\w+$/.test(n)));
            } else {
              exports3.push(match[1]);
            }
          }
        }
        return [...new Set(exports3)];
      } catch {
        return [];
      }
    }
    function compareVersions(v1, v2) {
      const parts1 = v1.split(".").map(Number);
      const parts2 = v2.split(".").map(Number);
      for (let i = 0; i < 3; i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 < p2) return -1;
        if (p1 > p2) return 1;
      }
      return 0;
    }
    function checkChangelog(changedFiles, options = {}) {
      const opts = { ...DEFAULT_OPTIONS2, ...options };
      const basePath = opts.cwd;
      const changelogPath = path.join(basePath, "CHANGELOG.md");
      if (!fs.existsSync(changelogPath)) {
        return { exists: false };
      }
      let changelog;
      try {
        changelog = fs.readFileSync(changelogPath, "utf8");
      } catch {
        return { exists: false, error: "Could not read CHANGELOG.md" };
      }
      const hasUnreleased = changelog.includes("## [Unreleased]");
      let recentCommits = [];
      try {
        const output = execFileSync("git", ["log", "--oneline", "-10", "HEAD"], {
          cwd: basePath,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"]
        });
        recentCommits = output.trim().split("\n");
      } catch {
      }
      const documented = [];
      const undocumented = [];
      for (const commit of recentCommits) {
        if (!commit) continue;
        const msg = commit.substring(8);
        if (changelog.includes(msg) || changelog.includes(commit.substring(0, 7))) {
          documented.push(msg);
        } else if (msg.match(/^(feat|fix|breaking)/i)) {
          undocumented.push(msg);
        }
      }
      return {
        exists: true,
        hasUnreleased,
        documented,
        undocumented,
        suggestion: undocumented.length > 0 ? `${undocumented.length} commits may need CHANGELOG entries` : null
      };
    }
    function collect2(options = {}) {
      const opts = { ...DEFAULT_OPTIONS2, ...options };
      const changedFiles = opts.changedFiles || [];
      const repoMapStatus = ensureRepoMapSync(opts);
      return {
        relatedDocs: findRelatedDocs(changedFiles, opts),
        changelog: checkChangelog(changedFiles, opts),
        markdownFiles: findMarkdownFiles(opts.cwd),
        // New: repo-map integration
        repoMap: {
          available: repoMapStatus.available,
          fallbackReason: repoMapStatus.fallbackReason,
          stats: repoMapStatus.map ? {
            files: Object.keys(repoMapStatus.map.files || {}).length,
            symbols: repoMapStatus.map.stats?.totalSymbols || 0
          } : null
        },
        // New: undocumented exports detection (pass repoMapStatus to avoid redundant call)
        undocumentedExports: repoMapStatus.available ? findUndocumentedExports(changedFiles, { ...opts, repoMapStatus }) : []
      };
    }
    module2.exports = {
      DEFAULT_OPTIONS: DEFAULT_OPTIONS2,
      findRelatedDocs,
      findMarkdownFiles,
      analyzeDocIssues,
      checkChangelog,
      getExportsFromGit,
      compareVersions,
      findLineNumber,
      collect: collect2,
      // New: repo-map integration
      ensureRepoMap,
      ensureRepoMapSync,
      getExportsFromRepoMap,
      findUndocumentedExports,
      isInternalExport,
      isEntryPoint,
      // Utilities
      escapeRegex,
      // Diagnostic
      getRepoMapLoadError
    };
  }
});

// ../work/agent-sh__agentsys/lib/collectors/git.js
var require_git = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/git.js"(exports2, module2) {
    "use strict";
    var binary = require_binary();
    var DEFAULT_OPTIONS2 = {
      top: 20,
      adjustForAi: false,
      cwd: process.cwd()
    };
    function collectGitData(options = {}) {
      const opts = { ...DEFAULT_OPTIONS2, ...options };
      const cwd = opts.cwd || process.cwd();
      try {
        binary.ensureBinarySync();
      } catch (err) {
        return {
          available: false,
          error: `Binary not available: ${err.message}`
        };
      }
      let map;
      try {
        const json = binary.runAnalyzer(["repo-intel", "init", cwd]);
        map = JSON.parse(json);
      } catch (err) {
        return {
          available: false,
          error: `Git analysis failed: ${err.message}`
        };
      }
      const fileActivity = map.fileActivity || {};
      const contributors = map.contributors || {};
      const aiAttribution = map.aiAttribution || {};
      const conventions = map.conventions || {};
      const releases = map.releases || {};
      const hotspots = Object.entries(fileActivity).map(([path, activity]) => ({
        path,
        changes: activity.totalChanges || 0,
        recentChanges: activity.recentChanges || 0,
        authors: activity.authors ? Object.keys(activity.authors).length : 0,
        lastChanged: activity.lastChanged || null
      })).sort((a, b) => b.changes - a.changes).slice(0, opts.top);
      const humans = contributors.humans || {};
      const humanList = Object.entries(humans).map(([name, data]) => ({
        name,
        commits: data.commitCount || 0,
        firstSeen: data.firstSeen || null,
        lastSeen: data.lastSeen || null
      })).sort((a, b) => b.commits - a.commits);
      const totalCommits = humanList.reduce((sum, c) => sum + c.commits, 0);
      let cumulative = 0;
      let busFactor = 0;
      for (const contributor of humanList) {
        cumulative += contributor.commits;
        busFactor++;
        if (cumulative >= totalCommits * 0.8) break;
      }
      const aiTotal = (aiAttribution.attributed || 0) + (aiAttribution.heuristic || 0);
      const allCommits = map.git?.totalCommitsAnalyzed || totalCommits;
      const aiRatio = allCommits > 0 ? aiTotal / allCommits : 0;
      return {
        available: true,
        health: {
          active: humanList.length > 0,
          busFactor,
          aiRatio: Math.round(aiRatio * 100) / 100,
          totalCommits: allCommits,
          totalContributors: humanList.length
        },
        hotspots,
        contributors: humanList.slice(0, 10),
        aiAttribution: {
          ratio: Math.round(aiRatio * 100) / 100,
          attributed: aiAttribution.attributed || 0,
          heuristic: aiAttribution.heuristic || 0,
          none: aiAttribution.none || 0,
          confidence: aiAttribution.confidence || "low",
          tools: aiAttribution.tools || {}
        },
        busFactor,
        conventions: {
          style: conventions.style || null,
          prefixes: conventions.prefixes || {},
          usesScopes: conventions.usesScopes || false
        },
        releaseInfo: {
          tagCount: releases.tags ? releases.tags.length : 0,
          lastRelease: releases.tags && releases.tags.length > 0 ? releases.tags[releases.tags.length - 1] : null,
          cadence: releases.cadence || null
        }
      };
    }
    module2.exports = {
      collectGitData,
      DEFAULT_OPTIONS: DEFAULT_OPTIONS2
    };
  }
});

// ../work/agent-sh__agentsys/lib/collectors/analyzer-queries.js
var require_analyzer_queries = __commonJS({
  "../work/agent-sh__agentsys/lib/collectors/analyzer-queries.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var DEFAULT_OPTIONS2 = {
      cwd: process.cwd()
    };
    var DEFAULT_DOC_DRIFT_IGNORE = [
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
    function resolveStateDir(cwd) {
      for (const dir of [".claude", ".opencode", ".codex"]) {
        if (fs.existsSync(path.join(cwd, dir))) {
          return dir;
        }
      }
      return ".claude";
    }
    function resolveMapFile(cwd) {
      return path.join(cwd, resolveStateDir(cwd), "repo-intel.json");
    }
    function getBinary() {
      try {
        const { binary } = require("../agentsys").get();
        if (binary) return binary;
      } catch {
      }
      try {
        return require_binary();
      } catch {
        return null;
      }
    }
    function runJson(binary, args) {
      try {
        const out = binary.runAnalyzer(args);
        return JSON.parse(out);
      } catch {
        return null;
      }
    }
    function normalizePath(p) {
      return (p || "").replace(/\\/g, "/");
    }
    function asArray(v) {
      return Array.isArray(v) ? v : [];
    }
    function collect2(options = {}) {
      const opts = { ...DEFAULT_OPTIONS2, ...options };
      const cwd = opts.cwd;
      const mapFile = resolveMapFile(cwd);
      const empty = {
        available: false,
        reason: null,
        queryErrors: [],
        mapFile,
        staleDocs: null,
        staleDocsByKey: null,
        staleDocsByDoc: null,
        docDrift: null,
        docDriftAll: null,
        entryPoints: null,
        entryPointSet: null,
        entryPointSymbols: null,
        slopFixes: null,
        orphanExports: null,
        passthroughWrappers: null,
        alwaysTrueConditions: null,
        commentedOutCode: null,
        staleSuppressions: null
      };
      const binary = getBinary();
      if (!binary) {
        return { ...empty, reason: "analyzer-binary-unavailable" };
      }
      if (!fs.existsSync(mapFile)) {
        return { ...empty, reason: "repo-intel-map-missing" };
      }
      const staleTop = opts.staleDocsTop ?? 500;
      const driftTop = opts.docDriftTop ?? 50;
      const queryErrors = [];
      const runSafe = (queryName, args) => {
        const raw = runJson(binary, args);
        if (raw === null) {
          queryErrors.push(queryName);
        }
        return raw;
      };
      const staleDocs = asArray(runSafe("stale-docs", [
        "repo-intel",
        "query",
        "stale-docs",
        "--top",
        String(staleTop),
        "--map-file",
        mapFile,
        cwd
      ]));
      const docDriftAll = asArray(runSafe("doc-drift", [
        "repo-intel",
        "query",
        "doc-drift",
        "--top",
        String(driftTop),
        "--map-file",
        mapFile,
        cwd
      ]));
      const entryPoints = asArray(runSafe("entry-points", [
        "repo-intel",
        "query",
        "entry-points",
        "--map-file",
        mapFile,
        cwd
      ]));
      const slopRaw = runSafe("slop-fixes", [
        "repo-intel",
        "query",
        "slop-fixes",
        "--map-file",
        mapFile,
        cwd
      ]);
      const slopFixes = Array.isArray(slopRaw) ? slopRaw : asArray(slopRaw?.fixes);
      const staleDocsByKey = /* @__PURE__ */ new Map();
      const staleDocsByDoc = /* @__PURE__ */ new Map();
      for (const entry of staleDocs) {
        const normalizedDoc = normalizePath(entry.doc);
        entry.doc = normalizedDoc;
        const key = `${normalizedDoc}:${entry.line}:${entry.reference}`;
        staleDocsByKey.set(key, entry);
        if (!staleDocsByDoc.has(normalizedDoc)) {
          staleDocsByDoc.set(normalizedDoc, []);
        }
        staleDocsByDoc.get(normalizedDoc).push(entry);
      }
      const entryPointSet = /* @__PURE__ */ new Set();
      const entryPointSymbols = /* @__PURE__ */ new Set();
      for (const ep of entryPoints) {
        const normalizedPath = normalizePath(ep.path);
        if (normalizedPath) entryPointSet.add(normalizedPath);
        if (ep.name && normalizedPath) {
          entryPointSymbols.add(`${normalizedPath}:${ep.name}`);
        }
      }
      const ignore = opts.docDriftIgnore || DEFAULT_DOC_DRIFT_IGNORE;
      const docDrift = docDriftAll.filter((entry) => {
        const p = normalizePath(entry.path);
        return !ignore.some((re) => re.test(p));
      });
      const SLOP_CATEGORY_MAP = {
        "orphan-export": "orphanExports",
        "passthrough-wrapper": "passthroughWrappers",
        "always-true-condition": "alwaysTrueConditions",
        "commented-out-code": "commentedOutCode",
        "stale-suppression": "staleSuppressions"
      };
      const orphanExports = [];
      const passthroughWrappers = [];
      const alwaysTrueConditions = [];
      const commentedOutCode = [];
      const staleSuppressions = [];
      const bucketByKey = {
        orphanExports,
        passthroughWrappers,
        alwaysTrueConditions,
        commentedOutCode,
        staleSuppressions
      };
      for (const fix of slopFixes) {
        const key = SLOP_CATEGORY_MAP[fix.category];
        if (key) bucketByKey[key].push(fix);
      }
      const available = queryErrors.length < 4;
      return {
        available,
        reason: available ? null : "all-queries-failed",
        queryErrors,
        mapFile,
        staleDocs,
        staleDocsByKey,
        staleDocsByDoc,
        docDrift,
        docDriftAll,
        entryPoints,
        entryPointSet,
        entryPointSymbols,
        slopFixes,
        orphanExports,
        passthroughWrappers,
        alwaysTrueConditions,
        commentedOutCode,
        staleSuppressions
      };
    }
    function isEntryPointSymbol(bundle, filePath, symbolName) {
      if (!bundle?.entryPointSymbols) return false;
      const normalized = normalizePath(filePath);
      return bundle.entryPointSymbols.has(`${normalized}:${symbolName}`) || bundle.entryPointSet.has(normalized);
    }
    module2.exports = {
      DEFAULT_OPTIONS: DEFAULT_OPTIONS2,
      DEFAULT_DOC_DRIFT_IGNORE,
      collect: collect2,
      isEntryPointSymbol,
      resolveMapFile,
      resolveStateDir
    };
  }
});

// ../work/agent-sh__agentsys/lib/collectors/index.js
var github = require_github();
var documentation = require_documentation();
var codebase = require_codebase();
var docsPatterns = require_docs_patterns();
var git = require_git();
var analyzerQueries = require_analyzer_queries();
var DEFAULT_OPTIONS = {
  collectors: ["github", "docs", "code"],
  depth: "thorough",
  cwd: process.cwd()
};
function collect(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const collectors = Array.isArray(opts.collectors) ? opts.collectors : DEFAULT_OPTIONS.collectors;
  const data = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    options: opts,
    github: null,
    docs: null,
    code: null,
    docsPatterns: null,
    git: null,
    analyzer: null
  };
  if (collectors.includes("analyzer")) {
    data.analyzer = analyzerQueries.collect(opts);
    opts.analyzer = data.analyzer;
  }
  if (collectors.includes("github")) {
    data.github = github.scanGitHubState(opts);
  }
  if (collectors.includes("docs")) {
    data.docs = documentation.analyzeDocumentation(opts);
  }
  if (collectors.includes("code")) {
    data.code = codebase.scanCodebase(opts);
  }
  if (collectors.includes("docs-patterns")) {
    data.docsPatterns = docsPatterns.collect(opts);
  }
  if (collectors.includes("git")) {
    data.git = git.collectGitData(opts);
  }
  return data;
}
function collectAllData(options = {}) {
  let collectors = ["github", "docs", "code"];
  if (options.sources) {
    collectors = options.sources;
  } else if (options.collectors) {
    collectors = options.collectors;
  }
  return collect({
    ...options,
    collectors
  });
}
module.exports = {
  // Main entry point
  collect,
  collectAllData,
  // Individual collectors
  github,
  documentation,
  codebase,
  docsPatterns,
  git,
  analyzerQueries,
  // Re-export commonly used functions for convenience
  scanGitHubState: github.scanGitHubState,
  isGhAvailable: github.isGhAvailable,
  analyzeDocumentation: documentation.analyzeDocumentation,
  scanCodebase: codebase.scanCodebase,
  findRelatedDocs: docsPatterns.findRelatedDocs,
  analyzeDocIssues: docsPatterns.analyzeDocIssues,
  checkChangelog: docsPatterns.checkChangelog,
  // New: repo-map integration exports
  ensureRepoMap: docsPatterns.ensureRepoMap,
  ensureRepoMapSync: docsPatterns.ensureRepoMapSync,
  getExportsFromRepoMap: docsPatterns.getExportsFromRepoMap,
  findUndocumentedExports: docsPatterns.findUndocumentedExports,
  isInternalExport: docsPatterns.isInternalExport,
  isEntryPoint: docsPatterns.isEntryPoint,
  collectGitData: git.collectGitData,
  // Constants
  DEFAULT_OPTIONS
};

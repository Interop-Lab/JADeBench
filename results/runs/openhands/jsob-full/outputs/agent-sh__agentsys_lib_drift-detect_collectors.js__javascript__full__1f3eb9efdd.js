'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (callback, moduleRecord) => function requireModule() {
  {
    if (!(moduleRecord)) {
      (callback[__getOwnPropNames(callback)[0]])((moduleRecord = {
        exports: {
        }
      }).exports, moduleRecord, );
    }
    return moduleRecord.exports;
  }
};
var require_github = __commonJS({
  '../work/agent-sh__agentsys/lib/collectors/github.js'(githubExports, githubModule) {
    'use strict'; var {
      execFileSync: execFileSync
    }
    = (require)(("child_process")), default_options = {
      issueLimit: 100, prLimit: 50, milestoneLimit: 100, timeout: 10000, cwd: process.cwd()
    }; function execGh(githubValue2, githubValue110 = {
    }) {
      {
        const githubValue1 = (githubHelper1)((githubValue2), (githubValue110)); return githubValue1.ok ? githubValue1.data: null;
      }
    }
    function githubHelper1(githubValue4, githubValue210 = {
    }) {
      try {
        const githubValue3 = (execFileSync)(('gh'), (githubValue4), ({
          encoding: "utf8", stdio: "pipe", timeout: githubValue210.timeout || 10000, cwd: githubValue210.cwd || default_options.cwd
        })); try {
          return {
            ok: true, data: JSON.parse(githubValue3)
          };
        } catch (error) {
          return {
            ok: false, error: {
              type: "parse", message: "Failed to parse gh output as JSON: " + error.message, raw: githubValue3.slice(0, 500)
            }
          };
        }
      } catch (error2) {
        return {
          ok: false, error: {
            type: error2.killed ? "timeout": "process", message: error2.message, exitCode: error2.status ?? null, stderr: error2.stderr ? String(error2.stderr).trim(): ''
          }
        };
      }
    }
    function isGhAvailable() {
      try {
        {
          (execFileSync)(('gh'), (["auth", "status"]), ({
            encoding: "utf8", stdio: "pipe", timeout: 5000
          })); return true;
        }
      } catch {
        return false;
      }
    }
    function summarizeIssue(githubValue5) {
      return {
        number: githubValue5.number, title: githubValue5.title, labels: (githubValue5.labels || []).map(item => item.name || item), milestone: githubValue5.milestone?.title || githubValue5.milestone || null, createdAt: githubValue5.createdAt, updatedAt: githubValue5.updatedAt, snippet: githubValue5.body ? (githubValue5.body.slice(0, 200).replace(/\n/g, '\x20').trim()) + ((githubValue5.body.length) > (200) ? "...": ''): ''
      };
    }
    function summarizePr(githubValue6) {
      return {
        number: githubValue6.number, title: githubValue6.title, labels: (githubValue6.labels || []).map(item2 => item2.name || item2), isDraft: githubValue6.isDraft, createdAt: githubValue6.createdAt, updatedAt: githubValue6.updatedAt, files: githubValue6.files || [], snippet: githubValue6.body ? (githubValue6.body.slice(0, 150).replace(/\n/g, '\x20').trim()) + ((githubValue6.body.length) > (150) ? "...": ''): ''
      };
    }
    function categorizeIssues(githubValue12, githubValue13) {
      const githubValue7 = {
        bug: "bugs", "type: bug": "bugs", feature: "features", "type: feature": "features", enhancement: "enhancements", security: "security", "type: security": "security"
      }; const mappedItems = Object.entries(githubValue7).map(([githubValue37, category]) => ({
        regex: new RegExp("(^|[^a-z])" + githubValue37.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ("([^a-z]|$)"), 'i'), category: category
      })); for (const item3 of githubValue13) {
        {
          const mappedItems2 = (item3.labels || []).map(item4 => (item4.name || item4).toLowerCase()); let githubValue9 = false; const githubValue10 = {
            number: item3.number, title: item3.title
          }; for (const {
            regex: regex, category: category2
          }
          of mappedItems) {
            {
              if (mappedItems2.some(item5 => regex.test(item5))) {
                {
                  githubValue12.categorized[category2].push(githubValue10); githubValue9 = true; break;
                }
              }
            }
          }
          if (!githubValue9) {
            githubValue12.categorized.other.push(githubValue10);
          }
        }
      }
    }
    function findStaleItems(githubValue14, githubValue15, githubValue16) {
      const date = new Date(); date.setDate((date.getDate()) - (githubValue16)); for (const item6 of githubValue15) {
        {
          const date2 = new Date(item6.updatedAt); if ((date2) < (date)) {
            githubValue14.stale.push({
              number: item6.number, title: item6.title, lastUpdated: item6.updatedAt, daysStale: Math.floor(((Date.now()) - (date2)) / (86400000))
            });
          }
        }
      }
    }
    function extractThemes(githubValue18, githubValue19) {
      const githubValue17 = {
      }; const set = new Set(["the", 'a', 'an', 'is', "are", 'to', "for", 'in', 'on', 'at', "with", "and", 'or', 'of']); for (const item7 of githubValue19) {
        const parts = (item7.title || '').toLowerCase().split(/\s+/); for (const part of parts) {
          if ((part.length) > (3) && !set.has(part)) {
            githubValue17[part] = (githubValue17[part] || 0) + (1);
          }
        }
      }
      githubValue18.themes = Object.entries(githubValue17).filter(([, githubValue42]) => githubValue42 > 1).sort((left, right) => right[1] - left[1]).slice(0, 10).map(([word, count]) => ({
        word: word, count: count
      }));
    }
    function findOverdueMilestones(githubValue22) {
      {
        const date3 = new Date(); githubValue22.overdueMilestones = githubValue22.milestones.filter(item8 => {
          const githubValue20 = {
            nGeBt: "Refusing to extract archive with empty entry name"
          }; const githubValue21 = githubValue20; {
            if (!item8.due_on || (item8.state) === ("closed"))return false; return((new Date(item8.due_on))) < ((date3));
          }
        });
      }
    }
    function scanGitHubState(githubValue52 = {
    }) {
      const githubValue23 = {
        GkpnC: "embedder preference is \"none\" or unset"
      }; const githubValue24 = githubValue23, githubValue25 = {
        ...default_options, ...githubValue52
      }, summary = {
        issueCount: 0, prCount: 0, milestoneCount: 0
      }; const issues = {
        requestedLimit: githubValue25.issueLimit, fetchedCount: 0, hasMore: false
      }; const prs = {
        requestedLimit: githubValue25.prLimit, fetchedCount: 0, hasMore: false
      }; const milestones = {
        requestedLimit: githubValue25.milestoneLimit, fetchedCount: 0, hasMore: false
      }; const pagination = {
        issues: issues, prs: prs, milestones: milestones
      }; const categorized = {
        bugs: [], features: [], security: [], enhancements: [], other: []
      }; const githubValue27 = {
        available: false, partial: false, errors: [], summary: summary, issues: [], prs: [], milestones: [], overdueMilestones: [], pagination: pagination, categorized: categorized, stale: [], themes: []
      }; if (!(isGhAvailable)()) {
        {
          githubValue27.error = "gh CLI not available or not authenticated"; return githubValue27;
        }
      }
      githubValue27.available = true; const githubValue29 = (githubHelper1)((["issue", "list", "--state", "open", "--json", "number,title,labels,milestone,createdAt,updatedAt,body", "--limit", String(githubValue25.issueLimit)]), (githubValue25)); if (githubValue29.ok && Array.isArray(githubValue29.data)) {
        const data = githubValue29.data; githubValue27.issues = data.map(summarizeIssue); githubValue27.summary.issueCount = data.length; githubValue27.pagination.issues.fetchedCount = data.length; githubValue27.pagination.issues.hasMore = (githubValue25.issueLimit) > (0) && (data.length) >= (githubValue25.issueLimit); (categorizeIssues)((githubValue27), (data)); (findStaleItems)((githubValue27), (data), (90)); (extractThemes)((githubValue27), (data));
      } else {
        if (!githubValue29.ok) {
          {
            const githubValue30 = {
              source: "issues", ...githubValue29.error
            }; githubValue27.errors.push(githubValue30);
          }
        }
      }
      const githubValue31 = (githubHelper1)((['pr', "list", "--state", "open", "--json", "number,title,labels,isDraft,createdAt,updatedAt,body,files", "--limit", String(githubValue25.prLimit)]), (githubValue25)); if (githubValue31.ok && Array.isArray(githubValue31.data)) {
        const data2 = githubValue31.data; githubValue27.prs = data2.map(summarizePr); githubValue27.summary.prCount = data2.length; githubValue27.pagination.prs.fetchedCount = data2.length; githubValue27.pagination.prs.hasMore = (githubValue25.prLimit) > (0) && (data2.length) >= (githubValue25.prLimit);
      } else {
        if (!githubValue31.ok) {
          const githubValue32 = {
            source: "prs", ...githubValue31.error
          }; githubValue27.errors.push(githubValue32);
        }
      }
      const githubValue33 = (githubHelper1)((["api", "repos/{owner}/{repo}/milestones", "--paginate", "--slurp"]), (githubValue25)); if (githubValue33.ok && Array.isArray(githubValue33.data)) {
        const data3 = githubValue33.data, githubValue35 = data3.flatMap(githubValue34 => Array.isArray(githubValue34) ? githubValue34: []), mappedItems3 = githubValue35.map(item9 => ({
          title: item9.title, state: item9.state, due_on: item9.due_on, open_issues: item9.open_issues, closed_issues: item9.closed_issues
        })); githubValue27.pagination.milestones.fetchedCount = mappedItems3.length; githubValue27.pagination.milestones.hasMore = (githubValue25.milestoneLimit) > (0) && (mappedItems3.length) > (githubValue25.milestoneLimit); githubValue27.milestones = mappedItems3.slice(0, githubValue25.milestoneLimit); githubValue27.summary.milestoneCount = githubValue27.milestones.length; (findOverdueMilestones)((githubValue27));
      } else {
        if (!githubValue33.ok) {
          {
            const githubValue36 = {
              source: "milestones", ...githubValue33.error
            }; githubValue27.errors.push(githubValue36);
          }
        }
      }
      {
        githubValue27.partial = (githubValue27.errors.length) > (0); if (githubValue27.partial && !githubValue27.error) {
          githubValue27.error = "Partial GitHub data collected";
        }
        return githubValue27;
      }
    }
    const githubApi = {
      DEFAULT_OPTIONS: default_options, scanGitHubState: scanGitHubState, isGhAvailable: isGhAvailable
    }; githubApi.execGh = execGh; githubApi.summarizeIssue = summarizeIssue; githubApi.summarizePR = summarizePr; githubApi.categorizeIssues = categorizeIssues; githubApi.findStaleItems = findStaleItems; githubApi.extractThemes = extractThemes; githubApi.findOverdueMilestones = findOverdueMilestones; githubModule.exports = githubApi;
  }
}), require_documentation = __commonJS({
  '../work/agent-sh__agentsys/lib/collectors/documentation.js'(documentationExports, documentationModule) {
    'use strict'; var fs = (require)(('fs')), path = (require)(("path")), default_options2 = {
      depth: "thorough", cwd: process.cwd()
    }; function isPathSafe(documentationValue2, documentationValue3) {
      const documentationValue1 = path.resolve(documentationValue3, documentationValue2); return documentationValue1.startsWith(path.resolve(documentationValue3));
    }
    function safeReadFile(documentationValue5, documentationValue6) {
      const documentationValue4 = path.resolve(documentationValue6, documentationValue5); if (!(isPathSafe)((documentationValue5), (documentationValue6))) {
        return null;
      }
      try {
        return fs.readFileSync(documentationValue4, "utf8");
      } catch {
        return null;
      }
    }
    function analyzeMarkdownFile(documentationValue9, path2) {
      {
        const documentationValue7 = documentationValue9.match(/^##\s{1,1000}(.+)$/gm) || [], sections = documentationValue7.slice(0, 10).map(item10 => item10.replace(/^##\s+/, '')), documentationValue8 = sections.map(item11 => item11.toLowerCase()).join('\x20'); return {
          path: path2, sectionCount: documentationValue7.length, sections: sections, hasInstallation: /install|setup|getting.started/i.test(documentationValue8), hasUsage: /usage|how.to|example/i.test(documentationValue8), hasApi: /api|reference|methods/i.test(documentationValue8), hasTesting: /test|spec|coverage/i.test(documentationValue8), codeBlocks: Math.floor(((documentationValue9.match(/```/g) || []).length) / (2)), wordCount: documentationValue9.split(/\s+/).length
        };
      }
    }
    function extractCheckboxes(documentationValue10, documentationValue11) {
      {
        const checked = (documentationValue11.match(/^[-*]\s+\[x\]/gim) || []).length, unchecked = (documentationValue11.match(/^[-*]\s+\[\s\]/gim) || []).length; documentationValue10.checkboxes.checked += checked; documentationValue10.checkboxes.unchecked += unchecked; documentationValue10.checkboxes.total += (checked) + (unchecked);
      }
    }
    function extractFeatures(documentationValue15, documentationValue16) {
      {
        const documentationValue12 = /^[-*]\s{1,100}\*{0,2}([^\n]{1,2000}?)\*{0,2}(?:\s{0,100}[-–]\s{0,100}([^\n]{1,2000}))?$/gm; let documentationValue13; while ((documentationValue13 = documentationValue12.exec(documentationValue16)) !== (null) && (documentationValue15.features.length) < (20)) {
          const documentationValue14 = documentationValue13[1].trim(); if ((documentationValue14.length) > (5) && (documentationValue14.length) < (80)) {
            documentationValue15.features.push(documentationValue14);
          }
        }
        documentationValue15.features = [...new Set(documentationValue15.features)].slice(0, 20);
      }
    }
    function extractPlans(documentationValue20, documentationValue21) {
      const documentationValue17 = [/(?:TODO|FIXME|PLAN):\s*(.+)/gi, /^##\s+(?:Roadmap|Future|Planned|Coming Soon)/gim]; for (const item12 of documentationValue17) {
        let documentationValue18; while ((documentationValue18 = item12.exec(documentationValue21)) !== (null) && (documentationValue20.plans.length) < (15)) {
          const documentationValue19 = (documentationValue18[1] || documentationValue18[0]).slice(0, 100); documentationValue20.plans.push(documentationValue19);
        }
      }
    }
    function identifyDocGaps(documentationValue27) {
      {
        const documentationValue22 = documentationValue27.files["README.md"]; if (!documentationValue22) {
          {
            const documentationValue23 = {
              type: "missing"
            }; documentationValue23.file = "README.md"; documentationValue23.severity = "high"; documentationValue27.gaps.push(documentationValue23);
          }
        } else {
          if (!documentationValue22.hasInstallation) {
            {
              const documentationValue24 = {
                type: "missing-section"
              }; documentationValue24.file = "README.md"; documentationValue24.section = "Installation"; documentationValue24.severity = "medium"; documentationValue27.gaps.push(documentationValue24);
            }
          }
          if (!documentationValue22.hasUsage) {
            {
              const documentationValue25 = {
                type: "missing-section"
              }; documentationValue25.file = "README.md"; documentationValue25.section = "Usage"; documentationValue25.severity = "medium"; documentationValue27.gaps.push(documentationValue25);
            }
          }
        }
        if (!documentationValue27.files["CHANGELOG.md"]) {
          const documentationValue26 = {
            type: "missing"
          }; documentationValue26.file = "CHANGELOG.md"; documentationValue26.severity = "low"; documentationValue27.gaps.push(documentationValue26);
        }
      }
    }
    function analyzeDocumentation(documentationValue110 = {
    }) {
      const documentationValue28 = {
        ...default_options2, ...documentationValue110
      }, cwd2 = documentationValue28.cwd, summary2 = {
        fileCount: 0
      }; summary2.totalWords = 0; const checkboxes = {
        total: 0, checked: 0, unchecked: 0
      }; const documentationValue30 = {
        summary: summary2, files: {
        }, features: [], plans: [], checkboxes: checkboxes, gaps: []
      }; const documentationValue32 = ["README.md", "PLAN.md", "CLAUDE.md", "AGENTS.md", "CONTRIBUTING.md", "CHANGELOG.md", "docs/README.md", "docs/PLAN.md"]; for (const item13 of documentationValue32) {
        {
          const documentationValue33 = (safeReadFile)((item13), (cwd2)); if (documentationValue33) {
            const documentationValue34 = (analyzeMarkdownFile)((documentationValue33), (item13)); {
            }
            [item13] = documentationValue34; documentationValue30.summary.totalWords += documentationValue34.wordCount; (extractCheckboxes)((documentationValue30), (documentationValue33)); (extractFeatures)((documentationValue30), (documentationValue33)); (extractPlans)((documentationValue30), (documentationValue33));
          }
        }
      }
      if ((documentationValue28.depth) === ("thorough")) {
        {
          const documentationValue35 = path.join(cwd2, "docs"); if (fs.existsSync(documentationValue35))try {
            const filteredItems = fs.readdirSync(documentationValue35).filter(item14 => item14.endsWith(".md") && !documentationValue32.includes("docs/" + item14)); for (const item15 of filteredItems.slice(0, 5)) {
              {
                const documentationValue36 = "docs/" + item15, documentationValue37 = (safeReadFile)((documentationValue36), (cwd2)); if (documentationValue37) {
                  {
                    const documentationValue38 = (analyzeMarkdownFile)((documentationValue37), (documentationValue36)); {
                    }
                    [documentationValue36] = documentationValue38; documentationValue30.summary.totalWords += documentationValue38.wordCount;
                  }
                }
              }
            }
          } catch {
          }
        }
      }
      {
        documentationValue30.summary.fileCount = Object.keys({
        }).length; (identifyDocGaps)((documentationValue30)); return documentationValue30;
      }
    }
    const documentationApi = {
      DEFAULT_OPTIONS: default_options2, analyzeDocumentation: analyzeDocumentation, analyzeMarkdownFile: analyzeMarkdownFile, safeReadFile: safeReadFile, isPathSafe: isPathSafe, extractCheckboxes: extractCheckboxes, extractFeatures: extractFeatures
    }; documentationApi.extractPlans = extractPlans; documentationApi.identifyDocGaps = identifyDocGaps; documentationModule.exports = documentationApi;
  }
}), require_fs_safe = __commonJS({
  '../work/agent-sh__agentsys/lib/utils/fs-safe.js'(fsSafeExports, fsSafeModule) {
    'use strict'; var fs2 = (require)(('fs')); function readFileWithLimit(fsSafeValue3, fsSafeValue4, fsSafeValue12 = "utf8") {
      {
        const fsSafeValue1 = fs2.openSync(fsSafeValue3, 'r'); try {
          {
            const fsSafeValue2 = fs2.fstatSync(fsSafeValue1); if (!fsSafeValue2.isFile()) {
              {
                const error3 = new Error("Not a regular file: " + fsSafeValue3); error3.code = "ENOTFILE"; throw error3;
              }
            }
            if ((typeof fsSafeValue4) === ("number") && (fsSafeValue2.size) > (fsSafeValue4)) {
              {
                const error4 = new Error("File too large: " + fsSafeValue2.size + " > " + fsSafeValue4 + " bytes"); error4.code = "EFBIG"; throw error4;
              }
            }
            return fs2.readFileSync(fsSafeValue1, fsSafeValue12);
          }
        } finally {
          fs2.closeSync(fsSafeValue1);
        }
      }
    }
    const fsSafeApi = {
      readFileWithLimit: readFileWithLimit
    }; fsSafeModule.exports = fsSafeApi;
  }
}), require_codebase = __commonJS({
  '../work/agent-sh__agentsys/lib/collectors/codebase.js'(codebaseExports, codebaseModule) {
    'use strict'; var fs3 = (require)(('fs')), path3 = (require)(("path")); var {
      readFileWithLimit: readFileWithLimit2
    }
    = (require_fs_safe)(), default_options3 = {
      depth: "thorough", cwd: process.cwd()
    }; var codebaseValue1 = 50000, exclude_dirs = ["node_modules", "vendor", "dist", "build", "out", "target", ".git", ".svn", ".hg", "__pycache__", ".pytest_cache", "coverage", ".nyc_output", ".next", ".nuxt", ".cache"]; const codebaseValue2 = {
      js: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"], rust: [".rs"], go: [".go"], python: [".py"], java: [".java"]
    }; function safeReadFile2(codebaseValue7, codebaseValue8) {
      const codebaseValue3 = {
        LHqFm: "no repo-intel map found; run `/repo-intel init` first", KAufP: "custom"
      }; const codebaseValue4 = codebaseValue3; const codebaseValue5 = path3.resolve(codebaseValue8, codebaseValue7), codebaseValue6 = path3.resolve(codebaseValue8); if (!codebaseValue5.startsWith(codebaseValue6)) {
        return null;
      }
      try {
        return fs3.readFileSync(codebaseValue5, "utf8");
      } catch {
        return null;
      }
    }
    function shouldExclude(codebaseValue9, codebaseValue110 = exclude_dirs) {
      {
        const parts2 = codebaseValue9.split(/[\\/]/); return parts2.some(item16 => codebaseValue110.includes(item16));
      }
    }
    function detectFrameworks(codebaseValue14, codebaseValue15) {
      {
        const codebaseValue10 = {
          ...codebaseValue15.dependencies, ...codebaseValue15.devDependencies
        }, codebaseValue12 = {
          react: "React", "react-dom": "React", next: "Next.js", vue: "Vue.js", nuxt: "Nuxt", angular: "Angular", express: "Express", fastify: "Fastify", koa: "Koa", nestjs: "NestJS"
        }; for (const[codebaseValue210, codebaseValue310]of Object.entries(codebaseValue12)) {
          {
            if (codebaseValue10[codebaseValue210]) {
              codebaseValue14.frameworks.push(codebaseValue310);
            }
          }
        }
        codebaseValue14.frameworks = [...new Set(codebaseValue14.frameworks)];
      }
    }
    function detectTestFramework(codebaseValue19, codebaseValue20) {
      const codebaseValue16 = {
        ...codebaseValue20.dependencies, ...codebaseValue20.devDependencies
      }; const codebaseValue18 = ["jest", "mocha", "vitest", "ava", "tap", "jasmine"]; for (const testFramework of codebaseValue18) {
        if (codebaseValue16[testFramework]) {
          codebaseValue19.testFramework = testFramework; codebaseValue19.health.hasTests = true; break;
        }
      }
    }
    function extractSymbols(codebaseValue30) {
      {
        const codebaseValue21 = {
          functions: [], classes: [], exports: []
        }; const codebaseValue23 = /(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g; let codebaseValue24; while ((codebaseValue24 = codebaseValue23.exec(codebaseValue30)) !== (null)) {
          codebaseValue21.functions.push(codebaseValue24[1]);
        }
        const codebaseValue25 = /(?:const|let)\s{1,1000}([a-zA-Z_$][a-zA-Z0-9_$]*)\s{0,1000}=\s{0,1000}(?:async\s{0,1000})?\([^)]{0,2000}\)\s{0,1000}=>/g; while ((codebaseValue24 = codebaseValue25.exec(codebaseValue30)) !== (null)) {
          codebaseValue21.functions.push(codebaseValue24[1]);
        }
        const codebaseValue26 = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g; while ((codebaseValue24 = codebaseValue26.exec(codebaseValue30)) !== (null)) {
          codebaseValue21.classes.push(codebaseValue24[1]);
        }
        const codebaseValue27 = /export\s+(?:(?:async\s+)?function|class|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g; while ((codebaseValue24 = codebaseValue27.exec(codebaseValue30)) !== (null)) {
          codebaseValue21.exports.push(codebaseValue24[1]);
        }
        const codebaseValue28 = /module\.exports\s{0,1000}=\s{0,1000}\{([^}]{1,100000})\}/, codebaseValue29 = codebaseValue30.match(codebaseValue28); if (codebaseValue29) {
          {
            const mappedItems4 = codebaseValue29[1].split(',').map(item17 => item17.trim().split(':')[0].trim()); codebaseValue21.exports.push(...mappedItems4.filter(item18 => item18 && /^[a-zA-Z_$]/.test(item18)));
          }
        }
        {
          codebaseValue21.functions = [...new Set(codebaseValue21.functions)]; codebaseValue21.classes = [...new Set(codebaseValue21.classes)]; codebaseValue21.exports = [...new Set(codebaseValue21.exports)]; return codebaseValue21;
        }
      }
    }
    function scanFileSymbols(codebaseValue45, codebaseValue46) {
      {
        const codebaseValue31 = {
        }, codebaseValue32 = ["lib", "src", "app", "pages", "components", "utils", "services", "api"], filteredItems2 = codebaseValue46.filter(item19 => codebaseValue32.includes(item19)), codebaseValue33 = Object.values(codebaseValue2).flat(); let codebaseValue34 = 0; const codebaseValue35 = 40; function codebaseHelper1(codebaseValue43, codebaseValue44, codebaseValue410 = 0) {
          {
            if ((codebaseValue34) >= (codebaseValue35) || (codebaseValue410) > (2))return; if (!fs3.existsSync(codebaseValue43))return; try {
              {
                const codebaseValue36 = {
                  withFileTypes: true
                }; const codebaseValue37 = fs3.readdirSync(codebaseValue43, codebaseValue36); for (const item20 of codebaseValue37) {
                  {
                    if ((codebaseValue34) >= (codebaseValue35))break; const codebaseValue38 = path3.join(codebaseValue43, item20.name), codebaseValue39 = codebaseValue44 ? codebaseValue44 + '/' + item20.name: item20.name; if (item20.isDirectory()) {
                      {
                        if (["node_modules", "__tests__", "test", "tests", "dist", "build"].includes(item20.name))continue; (codebaseHelper1)((codebaseValue38), (codebaseValue39), ((codebaseValue410) + (1)));
                      }
                    } else {
                      if (item20.isFile()) {
                        const codebaseValue40 = path3.extname(item20.name); if (!codebaseValue33.includes(codebaseValue40))continue; if (item20.name.includes(".test.") || item20.name.includes(".spec."))continue; try {
                          {
                            const codebaseValue41 = (readFileWithLimit2)((codebaseValue38), (codebaseValue1)), codebaseValue42 = (extractSymbols)((codebaseValue41)); if (codebaseValue42.functions.length || codebaseValue42.classes.length || codebaseValue42.exports.length) {
                              codebaseValue31[codebaseValue39] = codebaseValue42; codebaseValue34 ++ ;
                            }
                          }
                        } catch {
                        }
                      }
                    }
                  }
                }
              }
            } catch {
            }
          }
        }
        for (const filteredItem of filteredItems2) {
          if ((codebaseValue34) >= (codebaseValue35))break; (codebaseHelper1)((path3.join(codebaseValue45, filteredItem)), (filteredItem));
        }
        return codebaseValue31;
      }
    }
    function scanDirectory(codebaseValue56, codebaseValue57, codebaseValue58, codebaseValue59, codebaseValue510 = 0) {
      const codebaseValue47 = {
        POWna: "missing", buNnM: "README.md", VHFzI: "high"
      }; const codebaseValue48 = codebaseValue47; {
        if ((codebaseValue510) >= (codebaseValue59))return; const codebaseValue49 = path3.join(codebaseValue57, codebaseValue58); if (!fs3.existsSync(codebaseValue49))return; try {
          {
            const codebaseValue50 = {
              withFileTypes: true
            }; const codebaseValue51 = fs3.readdirSync(codebaseValue49, codebaseValue50), dirs = [], codebaseValue52 = []; for (const item21 of codebaseValue51) {
              item21.isDirectory() ? !exclude_dirs.includes(item21.name) && dirs.push(item21.name): codebaseValue52.push(item21.name);
            }
            const codebaseValue53 = (codebaseValue58) || ('.'), codebaseValue54 = {
              dirs: dirs
            }; codebaseValue54.fileCount = codebaseValue52.length; codebaseValue56.structure[codebaseValue53] = codebaseValue54; for (const item22 of codebaseValue52) {
              const codebaseValue55 = path3.extname(item22).toLowerCase() || "no-ext"; codebaseValue56.fileStats[codebaseValue55] = (codebaseValue56.fileStats[codebaseValue55] || 0) + (1);
            }
            for (const dir of dirs) {
              (scanDirectory)((codebaseValue56), (codebaseValue57), (path3.join(codebaseValue58, dir)), (codebaseValue59), ((codebaseValue510) + (1)));
            }
          }
        } catch {
        }
      }
    }
    function detectHealth(codebaseValue63, codebaseValue64) {
      codebaseValue63.health.hasReadme = fs3.existsSync(path3.join(codebaseValue64, "README.md")); const codebaseValue60 = [".eslintrc", ".eslintrc.js", ".eslintrc.json", "eslint.config.js", "biome.json"]; codebaseValue63.health.hasLinting = codebaseValue60.some(item23 => fs3.existsSync(path3.join(codebaseValue64, item23))); const codebaseValue61 = [".github/workflows", ".gitlab-ci.yml", ".circleci", "Jenkinsfile", ".travis.yml"]; codebaseValue63.health.hasCi = codebaseValue61.some(item24 => fs3.existsSync(path3.join(codebaseValue64, item24))); const codebaseValue62 = ["tests", "__tests__", "test", "spec"]; codebaseValue63.health.hasTests = codebaseValue63.health.hasTests || codebaseValue62.some(item25 => fs3.existsSync(path3.join(codebaseValue64, item25)));
    }
    function findImplementedFeatures(codebaseValue70, codebaseValue71) {
      const codebaseValue65 = {
        AdSNL: "utf8"
      }; const codebaseValue66 = codebaseValue65, codebaseValue67 = {
        authentication: ["auth", "login", "session", "jwt", "oauth"], api: ["routes", "controllers", "handlers", "endpoints"], database: ["models", "schemas", "migrations", "seeds"], ui: ["components", "views", "pages", "layouts"], testing: ["__tests__", "test", "spec", ".test.", ".spec."], docs: ["docs", "documentation", "wiki"]
      }; for (const[codebaseValue610, codebaseValue710]of Object.entries(codebaseValue67)) {
        {
          const codebaseValue69 = codebaseValue710.some(item27 => {
            {
              for (const item26 of Object.keys(codebaseValue70.structure)) {
                {
                  if (item26.toLowerCase().includes(item27))return true;
                }
              }
              return false;
            }
          }); if (codebaseValue69) {
            codebaseValue70.implementedFeatures.push(codebaseValue610);
          }
        }
      }
    }
    function scanCodebase(codebaseValue83 = {
    }) {
      const codebaseValue72 = {
        ...default_options3, ...codebaseValue83
      }, cwd3 = codebaseValue72.cwd, summary3 = {
        totalDirs: 0, totalFiles: 0
      }; const health = {
        hasTests: false, hasLinting: false, hasCi: false, hasReadme: false
      }; const codebaseValue74 = {
        summary: summary3, topLevelDirs: [], frameworks: [], testFramework: null, hasTypeScript: false, implementedFeatures: [], symbols: {
        }, health: health, fileStats: {
        }
      }; const structure = {
      }, codebaseValue76 = (safeReadFile2)(("package.json"), (cwd3)); if (codebaseValue76) {
        try {
          {
            const codebaseValue77 = JSON.parse(codebaseValue76); (detectFrameworks)((codebaseValue74), (codebaseValue77)); (detectTestFramework)((codebaseValue74), (codebaseValue77));
          }
        } catch {
        }
      }
      codebaseValue74.hasTypeScript = fs3.existsSync(path3.join(cwd3, "tsconfig.json")); const codebaseValue78 = {
        structure: structure
      }; codebaseValue78.fileStats = codebaseValue74.fileStats; (scanDirectory)((codebaseValue78), (cwd3), (''), ((codebaseValue72.depth) === ("thorough") ? 3: 2)); codebaseValue74.summary.totalDirs = Object.keys(structure).length; codebaseValue74.summary.totalFiles = Object.values(structure).reduce((item28, codebaseValue79) => item28 + (codebaseValue79.fileCount || 0), 0); const codebaseValue80 = structure['.']; if (codebaseValue80) {
        codebaseValue74.topLevelDirs = codebaseValue80.dirs || [];
      }
      (detectHealth)((codebaseValue74), (cwd3)); if ((codebaseValue72.depth) === ("thorough")) {
        {
          const codebaseValue81 = {
            ...codebaseValue74
          }; codebaseValue81.structure = structure; (findImplementedFeatures)((codebaseValue81), (cwd3)); codebaseValue74.symbols = (scanFileSymbols)((cwd3), (codebaseValue74.topLevelDirs));
        }
      }
      const codebaseValue82 = Object.entries(codebaseValue74.fileStats).sort((left2, right2) => right2[1] - left2[1]).slice(0, 10); {
        codebaseValue74.fileStats = Object.fromEntries(codebaseValue82); return codebaseValue74;
      }
    }
    const codebaseApi = {
      DEFAULT_OPTIONS: default_options3
    }; codebaseApi.EXCLUDE_DIRS = exclude_dirs; codebaseApi.SOURCE_EXTENSIONS = codebaseValue2; codebaseApi.scanCodebase = scanCodebase; codebaseApi.detectFrameworks = detectFrameworks; codebaseApi.detectTestFramework = detectTestFramework; codebaseApi.detectHealth = detectHealth; codebaseApi.findImplementedFeatures = findImplementedFeatures; codebaseApi.extractSymbols = extractSymbols; codebaseApi.scanFileSymbols = scanFileSymbols; codebaseApi.scanDirectory = scanDirectory; codebaseApi.shouldExclude = shouldExclude; codebaseApi.safeReadFile = safeReadFile2; codebaseModule.exports = codebaseApi;
  }
}), require_version = __commonJS({
  '../work/agent-sh__agentsys/lib/binary/version.js'(versionExports, versionModule) {
    'use strict'; const versionValue1 = {
      pzzGn: "2|0|3|4|1"
    }; versionValue1.BJwRX = "0.3.0"; versionValue1.FrWHl = "agent-analyzer"; versionValue1.qhenZ = "agent-sh/agent-analyzer"; const parts3 = versionValue1.pzzGn.split('|'); let versionValue3 = 0; while (true) {
      switch (parts3[versionValue3 ++ ]) {
        case '0': var analyzer_min_version = versionValue1.BJwRX; continue;
        case '1': const versionApi = {
          ANALYZER_MIN_VERSION: analyzer_min_version
        }; versionApi.BINARY_NAME = binary_name; versionApi.GITHUB_REPO = github_repo; versionModule.exports = versionApi; continue;
        case '2': 'use strict'; continue;
        case '3': var binary_name = versionValue1.FrWHl; continue;
        case '4': var github_repo = versionValue1.qhenZ; continue;
      }
      break;
    }
  }
}), require_binary = __commonJS({
  '../work/agent-sh__agentsys/lib/binary/index.js'(binaryIndexExports, binaryIndexModule) {
    'use strict'; var fs4 = (require)(('fs')), path4 = (require)(("path")), os = (require)(('os')), https = (require)(("https")), childProcess = (require)(("child_process")), crypto = (require)(("crypto")), {
      promisify: promisify
    }
    = (require)(("util")), binaryIndexValue1 = (promisify)((childProcess.execFile)), maxBuffer = 268435456, {
      ANALYZER_MIN_VERSION: analyzer_min_version2, BINARY_NAME: binary_name2, GITHUB_REPO: github_repo2
    }
    = (require_version)(); const binaryIndexValue2 = {
      "darwin-arm64": "aarch64-apple-darwin", "darwin-x64": "x86_64-apple-darwin", "linux-x64": "x86_64-unknown-linux-gnu", "linux-arm64": "aarch64-unknown-linux-gnu", "win32-x64": "x86_64-pc-windows-msvc"
    }; function getBinaryPath() {
      const binaryIndexValue3 = (process.platform) === ("win32") ? ".exe": ''; return path4.join(os.homedir(), ".agent-sh", "bin", (binary_name2) + (binaryIndexValue3));
    }
    function getPlatformKey() {
      {
        const binaryIndexValue4 = ((process.platform) + ('-')) + (process.arch); return binaryIndexValue2[binaryIndexValue4] || null;
      }
    }
    function meetsMinimumVersion(binaryIndexValue6, binaryIndexValue7) {
      {
        if (!binaryIndexValue6)return false; const binaryIndexValue5 = binaryIndexValue6.match(/^(\d+)\.(\d+)\.(\d+)/); if (!binaryIndexValue5)return false; const mappedItems5 = binaryIndexValue5.slice(1).map(Number), mappedItems6 = binaryIndexValue7.split('.').map(Number); if ((mappedItems5[0]) > (mappedItems6[0]))return true; if ((mappedItems5[0]) < (mappedItems6[0]))return false; if ((mappedItems5[1]) > (mappedItems6[1]))return true; if ((mappedItems5[1]) < (mappedItems6[1]))return false; return(mappedItems5[2]) >= (mappedItems6[2]);
      }
    }
    function getVersion() {
      {
        const binaryIndexValue8 = (getBinaryPath)(); if (!fs4.existsSync(binaryIndexValue8))return null; try {
          const binaryIndexValue9 = childProcess.execFileSync(binaryIndexValue8, ["--version"], {
            timeout: 5000, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], windowsHide: true
          }), binaryIndexValue10 = binaryIndexValue9.trim().match(/(\d+\.\d+\.\d+)/); return binaryIndexValue10 ? binaryIndexValue10[1]: binaryIndexValue9.trim();
        } catch (error5) {
          return null;
        }
      }
    }
    function isAvailable() {
      {
        const binaryIndexValue11 = (getBinaryPath)(); if (!fs4.existsSync(binaryIndexValue11))return false; const binaryIndexValue12 = (getVersion)(); return(meetsMinimumVersion)((binaryIndexValue12), (analyzer_min_version2));
      }
    }
    async function isAvailableAsync() {
      return(isAvailable)();
    }
    function buildDownloadUrl(binaryIndexValue14, binaryIndexValue15) {
      {
        const binaryIndexValue13 = (process.platform) === ("win32") ? ".zip": ".tar.gz"; return(((((((("https://github.com/") + (github_repo2)) + ("/releases/download/v")) + (binaryIndexValue14)) + ('/')) + (binary_name2)) + ('-')) + (binaryIndexValue15)) + (binaryIndexValue13);
      }
    }
    function binaryIndexHelper2(binaryIndexValue27) {
      return new Promise(function(binaryIndexValue25, binaryIndexValue26) {
        const binaryIndexValue16 = process.env.GITHUB_TOKEN || process.env.GH_TOKEN; function binaryIndexHelper1(binaryIndexValue23, binaryIndexValue24) {
          {
            if ((binaryIndexValue24) > (5)) {
              (binaryIndexValue26)((new Error((("Too many redirects fetching from ")) + ((binaryIndexValue27))))); return;
            }
            const binaryIndexValue17 = {
              "User-Agent": "agent-core/binary-resolver", Accept: "application/octet-stream"
            }; if (binaryIndexValue16)binaryIndexValue17.Authorization = ("Bearer ") + (binaryIndexValue16); const binaryIndexValue18 = {
              headers: binaryIndexValue17
            }; https.get(binaryIndexValue23, binaryIndexValue18, function(binaryIndexValue22) {
              const statusCode = binaryIndexValue22.statusCode; if (((statusCode)) === ((301)) || ((statusCode)) === ((302)) || ((statusCode)) === ((307)) || ((statusCode)) === ((308))) {
                {
                  binaryIndexValue22.resume(); ((binaryIndexHelper1))(((binaryIndexValue22.headers.location)), ((((binaryIndexValue24)) + ((1))))); return;
                }
              }
              if (((statusCode)) !== ((200))) {
                binaryIndexValue22.resume(); const binaryIndexValue19 = ((statusCode)) === ((403)) ? " (rate limited - set GITHUB_TOKEN env var)": ''; ((binaryIndexValue26))(((new Error((((((((("HTTP ")) + ((statusCode)))) + ((binaryIndexValue19)))) + ((" fetching ")))) + ((binaryIndexValue23)))))); return;
              }
              const binaryIndexValue20 = []; binaryIndexValue22.on("data", function(binaryIndexValue21) {
                binaryIndexValue20.push(binaryIndexValue21);
              }); binaryIndexValue22.on("end", function() {
                ((binaryIndexValue25))(((Buffer.concat(binaryIndexValue20))));
              }); binaryIndexValue22.on("error", binaryIndexValue26);
            }).on("error", binaryIndexValue26);
          }
        }
        (binaryIndexHelper1)((binaryIndexValue27), (0));
      });
    }
    function parseSha256Sidecar(binaryIndexValue29) {
      if ((typeof binaryIndexValue29) !== ("string"))binaryIndexValue29 = String((binaryIndexValue29) || ('')); const binaryIndexValue28 = binaryIndexValue29.trim().match(/^([A-Fa-f0-9]{64})\b/); if (!binaryIndexValue28) {
        throw new Error("Could not parse SHA-256 digest from sidecar body");
      }
      return binaryIndexValue28[1].toLowerCase();
    }
    async function binaryIndexHelper3(binaryIndexValue32) {
      const binaryIndexValue30 = (binaryIndexValue32) + (".sha256"); const binaryIndexValue31 = await(binaryIndexHelper2)((binaryIndexValue30)); return(parseSha256Sidecar)((binaryIndexValue31.toString("utf8")));
    }
    function sha256Hex(binaryIndexValue33) {
      return crypto.createHash("sha256").update(binaryIndexValue33).digest("hex");
    }
    function verifySha256(binaryIndexValue36, binaryIndexValue37, binaryIndexValue38) {
      const binaryIndexValue34 = String((binaryIndexValue37) || ('')).toLowerCase(), binaryIndexValue35 = (sha256Hex)((binaryIndexValue36)); if ((binaryIndexValue34) !== (binaryIndexValue35)) {
        throw new Error((((((("SHA-256 verification failed for ") + (binaryIndexValue38)) + (": expected ")) + (binaryIndexValue34)) + (", got ")) + (binaryIndexValue35)) + (". This could indicate a tampered release. Do not extract."));
      }
    }
    function assertSafeArchiveEntry(binaryIndexValue41) {
      {
        if (!binaryIndexValue41 || (typeof binaryIndexValue41) !== ("string")) {
          throw new Error("Refusing to extract archive with empty entry name");
        }
        const binaryIndexValue39 = binaryIndexValue41.replace(/\\/g, '/').trim(); if ((binaryIndexValue39.length) === (0)) {
          throw new Error("Refusing to extract archive with empty entry name");
        }
        if (binaryIndexValue39.startsWith('//'))throw new Error(("Refusing to extract archive with UNC entry: ") + (binaryIndexValue41)); if (binaryIndexValue39.startsWith('/')) {
          throw new Error(("Refusing to extract archive with absolute entry: ") + (binaryIndexValue41));
        }
        if (/^[A-Za-z]:[\\/]/.test(binaryIndexValue41)) {
          throw new Error(("Refusing to extract archive with Windows absolute entry: ") + (binaryIndexValue41));
        }
        const filteredItems3 = binaryIndexValue39.split('/').filter(function(item29) {
          return(item29.length) > (0);
        }); for (let binaryIndexValue40 = 0; (binaryIndexValue40) < (filteredItems3.length); binaryIndexValue40 ++ ) {
          {
            if ((filteredItems3[binaryIndexValue40]) === ('..')) {
              throw new Error(("Refusing to extract archive with parent-traversal entry: ") + (binaryIndexValue41));
            }
          }
        }
      }
    }
    function binaryIndexHelper4(binaryIndexValue52) {
      return new Promise(function(binaryIndexValue50, binaryIndexValue51) {
        const binaryIndexValue42 = {
          lRUYd: "repo-intel", MTCpm: "init"
        }; const binaryIndexValue43 = binaryIndexValue42; {
          const binaryIndexValue44 = childProcess.spawn("tar", ["-tz"], {
            stdio: ["pipe", "pipe", "pipe"]
          }); let binaryIndexValue45 = '', binaryIndexValue46 = ''; binaryIndexValue44.stdout.on("data", function(binaryIndexValue47) {
            binaryIndexValue45 += binaryIndexValue47;
          }); binaryIndexValue44.stderr.on("data", function(binaryIndexValue48) {
            binaryIndexValue46 += binaryIndexValue48;
          }); binaryIndexValue44.on("error", binaryIndexValue51); binaryIndexValue44.on("close", function(binaryIndexValue49) {
            {
              if ((binaryIndexValue49) !== (0)) {
                {
                  (binaryIndexValue51)((new Error((((((("tar -tz listing failed (code ")) + ((binaryIndexValue49)))) + (("): ")))) + ((binaryIndexValue46))))); return;
                }
              }
              const filteredItems4 = binaryIndexValue45.split(/\r?\n/).filter(function(item30) {
                return((item30.length)) > ((0));
              }); (binaryIndexValue50)((filteredItems4));
            }
          }); binaryIndexValue44.stdin.write(binaryIndexValue52); binaryIndexValue44.stdin.end();
        }
      });
    }
    function assertInsideRoot(binaryIndexValue55, binaryIndexValue56) {
      const binaryIndexValue53 = (path4.resolve(binaryIndexValue55)) + (path4.sep), binaryIndexValue54 = path4.resolve(binaryIndexValue56); if ((binaryIndexValue54) !== (path4.resolve(binaryIndexValue55)) && !binaryIndexValue54.startsWith(binaryIndexValue53))throw new Error(("Extracted path escapes extract root: ") + (binaryIndexValue56));
    }
    function binaryIndexHelper5(binaryIndexValue63) {
      {
        const binaryIndexValue57 = [], binaryIndexValue58 = [binaryIndexValue63]; while ((binaryIndexValue58.length) > (0)) {
          {
            const binaryIndexValue59 = binaryIndexValue58.pop(), binaryIndexValue60 = fs4.lstatSync(binaryIndexValue59); if (binaryIndexValue60.isSymbolicLink())throw new Error(("Refusing to follow symlink produced by extractor: ") + (binaryIndexValue59)); if (binaryIndexValue60.isDirectory()) {
              const binaryIndexValue61 = fs4.readdirSync(binaryIndexValue59); for (let binaryIndexValue62 = 0; (binaryIndexValue62) < (binaryIndexValue61.length); binaryIndexValue62 ++ ) {
                binaryIndexValue58.push(path4.join(binaryIndexValue59, binaryIndexValue61[binaryIndexValue62]));
              }
            } else {
              if (binaryIndexValue60.isFile()) {
                binaryIndexValue57.push(binaryIndexValue59);
              }
            }
          }
        }
        return binaryIndexValue57;
      }
    }
    function binaryIndexHelper6(binaryIndexValue65) {
      try {
        {
          const binaryIndexValue64 = {
            recursive: true
          }; binaryIndexValue64.force = true; fs4.rmSync(binaryIndexValue65, binaryIndexValue64);
        }
      } catch (error6) {
      }
    }
    async function extractTarGzToScratch(binaryIndexValue77) {
      const binaryIndexValue66 = await(binaryIndexHelper4)((binaryIndexValue77)); for (let binaryIndexValue67 = 0; (binaryIndexValue67) < (binaryIndexValue66.length); binaryIndexValue67 ++ ) {
        (assertSafeArchiveEntry)((binaryIndexValue66[binaryIndexValue67]));
      }
      const binaryIndexValue68 = fs4.mkdtempSync(path4.join(os.tmpdir(), "agent-analyzer-tar-")); try {
        {
          await new Promise(function(binaryIndexValue73, binaryIndexValue74) {
            {
              const binaryIndexValue69 = childProcess.spawn("tar", ['xz', '-C', binaryIndexValue68], {
                stdio: ["pipe", "pipe", "pipe"]
              }); let binaryIndexValue70 = ''; binaryIndexValue69.stderr.on("data", function(binaryIndexValue71) {
                binaryIndexValue70 += binaryIndexValue71;
              }); binaryIndexValue69.on("error", binaryIndexValue74); binaryIndexValue69.on("close", function(binaryIndexValue72) {
                {
                  if (((binaryIndexValue72)) !== ((0))) {
                    (binaryIndexValue74)((new Error((((((("tar extraction failed (code ")) + ((binaryIndexValue72)))) + (("): ")))) + ((binaryIndexValue70)))));
                  } else {
                    (binaryIndexValue73)();
                  }
                }
              }); binaryIndexValue69.stdin.write(binaryIndexValue77); binaryIndexValue69.stdin.end();
            }
          }); const binaryIndexValue75 = (binaryIndexHelper5)((binaryIndexValue68)); for (let binaryIndexValue76 = 0; (binaryIndexValue76) < (binaryIndexValue75.length); binaryIndexValue76 ++ ) {
            (assertInsideRoot)((binaryIndexValue68), (binaryIndexValue75[binaryIndexValue76]));
          }
        }
      } catch (error7) {
        {
          (binaryIndexHelper6)((binaryIndexValue68)); throw error7;
        }
      }
      return binaryIndexValue68;
    }
    var _extract_zip_ps1 = ["$ErrorActionPreference = \"Stop\"", "$src  = $env:SRC_ZIP", "$dest = $env:DEST_DIR", "if ([string]::IsNullOrEmpty($src) -or [string]::IsNullOrEmpty($dest)) {", "  [Console]::Error.WriteLine(\"SRC_ZIP and DEST_DIR must both be set\"); exit 2", '}', "Add-Type -AssemblyName System.IO.Compression.FileSystem", "$destFull = [System.IO.Path]::GetFullPath($dest)", "if (-not $destFull.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {", "  $destFull = $destFull + [System.IO.Path]::DirectorySeparatorChar", '}', "$zip = [System.IO.Compression.ZipFile]::OpenRead($src)", "try {", "  foreach ($entry in $zip.Entries) {", "    $name = $entry.FullName", "    if ([string]::IsNullOrEmpty($name)) { continue }", "    $norm = $name -replace \"\\\\\",\"/\"", "    if ($norm.StartsWith(\"/\") -or $norm.StartsWith(\"//\")) {", "      [Console]::Error.WriteLine(\"Refusing absolute/UNC entry: \" + $name); exit 3", "    }", "    if ($name -match \"^[A-Za-z]:[\\\\/]\") {", "      [Console]::Error.WriteLine(\"Refusing Windows-absolute entry: \" + $name); exit 3", "    }", "    foreach ($part in ($norm -split \"/\")) {", "      if ($part -eq \"..\") {", "        [Console]::Error.WriteLine(\"Refusing parent-traversal entry: \" + $name); exit 3", "      }", "    }", "    $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($destFull, $norm))", "    if (-not $target.StartsWith($destFull, [System.StringComparison]::OrdinalIgnoreCase)) {", "      [Console]::Error.WriteLine(\"Entry escapes destination: \" + $name); exit 3", "    }", "    if ($entry.FullName.EndsWith(\"/\")) {", "      [System.IO.Directory]::CreateDirectory($target) | Out-Null", "    } else {", "      $parent = [System.IO.Path]::GetDirectoryName($target)", "      if ($parent) { [System.IO.Directory]::CreateDirectory($parent) | Out-Null }", "      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)", "    }", "  }", "} finally {", "  $zip.Dispose()", '}'].join('\x0d\x0a'); async function extractZipToScratch(binaryIndexValue89) {
      {
        const dest_dir = fs4.mkdtempSync(path4.join(os.tmpdir(), "agent-analyzer-zip-")), src_zip = path4.join(dest_dir, "__archive.zip"), binaryIndexValue78 = fs4.mkdtempSync(path4.join(os.tmpdir(), "agent-analyzer-ps-")), binaryIndexValue79 = path4.join(binaryIndexValue78, "extract.ps1"); try {
          {
            fs4.writeFileSync(src_zip, binaryIndexValue89); fs4.writeFileSync(binaryIndexValue79, _extract_zip_ps1, "utf8"); await new Promise(function(binaryIndexValue85, binaryIndexValue86) {
              {
                const binaryIndexValue80 = {
                  SRC_ZIP: src_zip, DEST_DIR: dest_dir
                }; const binaryIndexValue84 = childProcess.execFile("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", binaryIndexValue79], {
                  windowsHide: true, env: Object.assign({
                  }, process.env, binaryIndexValue80)
                }, function(binaryIndexValue81, binaryIndexValue82, binaryIndexValue83) {
                  {
                    if (binaryIndexValue81) {
                      (binaryIndexValue86)((new Error((("zip extraction failed: ")) + ((binaryIndexValue83 || binaryIndexValue81.message)))));
                    } else (binaryIndexValue85)();
                  }
                }); if (binaryIndexValue84.stdin)binaryIndexValue84.stdin.end();
              }
            }); try {
              fs4.unlinkSync(src_zip);
            } catch (error8) {
            }
            const binaryIndexValue87 = (binaryIndexHelper5)((dest_dir)); for (let binaryIndexValue88 = 0; (binaryIndexValue88) < (binaryIndexValue87.length); binaryIndexValue88 ++ ) {
              (assertInsideRoot)((dest_dir), (binaryIndexValue87[binaryIndexValue88]));
            }
          }
        } catch (error9) {
          {
            (binaryIndexHelper6)((dest_dir)); throw error9;
          }
        } finally {
          (binaryIndexHelper6)((binaryIndexValue78));
        }
        return dest_dir;
      }
    }
    function binaryIndexHelper7(binaryIndexValue92, binaryIndexValue93) {
      const binaryIndexValue90 = (binaryIndexHelper5)((binaryIndexValue92)); for (let binaryIndexValue91 = 0; (binaryIndexValue91) < (binaryIndexValue90.length); binaryIndexValue91 ++ ) {
        if ((path4.basename(binaryIndexValue90[binaryIndexValue91])) === (binaryIndexValue93)) {
          {
            (assertInsideRoot)((binaryIndexValue92), (binaryIndexValue90[binaryIndexValue91])); return binaryIndexValue90[binaryIndexValue91];
          }
        }
      }
      return null;
    }
    function binaryIndexHelper8(binaryIndexValue95, binaryIndexValue96) {
      try {
        {
          const binaryIndexValue94 = childProcess.execFileSync('gh', ["attestation", "verify", binaryIndexValue95, "--repo", binaryIndexValue96, "--format", "json"], {
            encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 60000, windowsHide: true
          }); return {
            status: 0, stdout: (binaryIndexValue94) || (''), stderr: ''
          };
        }
      } catch (error10) {
        return {
          status: (typeof error10.status) === ("number") ? error10.status: null, stdout: error10.stdout ? String(error10.stdout): '', stderr: error10.stderr ? String(error10.stderr): error10.message || ''
        };
      }
    }
    function isGhAvailable2(binaryIndexValue97) {
      {
        if ((typeof binaryIndexValue97) === ("function")) {
          try {
            return !!(binaryIndexValue97)();
          } catch (error11) {
            return false;
          }
        }
        try {
          {
            childProcess.execFileSync('gh', ["--version"], {
              stdio: "ignore", timeout: 5000, windowsHide: true
            }); return true;
          }
        } catch (error12) {
          return false;
        }
      }
    }
    function verifySlsaAttestation(binaryIndexValue106, binaryIndexValue107) {
      {
        const binaryIndexValue98 = (binaryIndexValue107) || ({
        }), binaryIndexValue99 = binaryIndexValue98.repo || github_repo2, binaryIndexValue100 = (typeof binaryIndexValue98.ghRunner) === ("function") ? binaryIndexValue98.ghRunner: binaryIndexHelper8, binaryIndexValue101 = (typeof binaryIndexValue98.requireAttestation) === ("boolean") ? binaryIndexValue98.requireAttestation: (process.env.AGENT_ANALYZER_REQUIRE_ATTESTATION) === ('1'), binaryIndexValue102 = (isGhAvailable2)((binaryIndexValue98.ghProbe)); if (!binaryIndexValue102) {
          const reason = "`gh` CLI not found on PATH"; if (binaryIndexValue101)return {
            status: "failed", reason: (reason) + (" (AGENT_ANALYZER_REQUIRE_ATTESTATION=1)")
          }; const binaryIndexValue103 = {
          }; {
            binaryIndexValue103.status = "skipped"; binaryIndexValue103.reason = reason; return binaryIndexValue103;
          }
        }
        const binaryIndexValue104 = (binaryIndexValue100)((binaryIndexValue106), (binaryIndexValue99)); if (binaryIndexValue104 && (binaryIndexValue104.status) === (0)) {
          {
            const binaryIndexValue105 = {
            }; {
              binaryIndexValue105.status = "verified"; return binaryIndexValue105;
            }
          }
        }
        return {
          status: "failed", reason: ("gh attestation verify exited with status ") + (binaryIndexValue104 && (binaryIndexValue104.status) !== (null) ? binaryIndexValue104.status: "unknown"), stderr: binaryIndexValue104 && binaryIndexValue104.stderr || ''
        };
      }
    }
    async function downloadBinary(binaryIndexValue127, binaryIndexValue128) {
      {
        const binaryIndexValue108 = (binaryIndexValue128) || ({
        }), binaryIndexValue109 = (binaryIndexValue108.skipChecksum) === (true), binaryIndexValue110 = (binaryIndexValue108.skipAttestation) === (true), binaryIndexValue111 = (getPlatformKey)(); if (!binaryIndexValue111) {
          throw new Error(((((("Unsupported platform: ") + (process.platform)) + ('-')) + (process.arch)) + (". Supported platforms: ")) + (Object.keys(binaryIndexValue2).join(',\x20')));
        }
        const binaryIndexValue112 = (buildDownloadUrl)((binaryIndexValue127), (binaryIndexValue111)), binaryIndexValue113 = binaryIndexValue112.substring((binaryIndexValue112.lastIndexOf('/')) + (1)); process.stderr.write((((((("Downloading ") + (binary_name2)) + ('\x20v')) + (binaryIndexValue127)) + (" for ")) + (binaryIndexValue111)) + ("...\n")); const binaryIndexValue114 = (getBinaryPath)(), binaryIndexValue115 = path4.dirname(binaryIndexValue114), binaryIndexValue116 = {
          recursive: true
        }; fs4.mkdirSync(binaryIndexValue115, binaryIndexValue116); let binaryIndexValue117; try {
          binaryIndexValue117 = await(binaryIndexHelper2)((binaryIndexValue112));
        } catch (error13) {
          throw new Error(((((((((((("Failed to download ") + (binary_name2)) + (":\n  URL: ")) + (binaryIndexValue112)) + ("\n  Error: ")) + (error13.message)) + ("\n\nTo install manually:\n  1. Download: ")) + (binaryIndexValue112)) + ("\n  2. Extract the binary to: ")) + (binaryIndexValue115)) + ("\n  3. Ensure it is named: ")) + (path4.basename(binaryIndexValue114)));
        }
        if (binaryIndexValue109) {
          process.stderr.write("[WARN] skipChecksum=true - SHA-256 verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n");
        } else {
          let binaryIndexValue118; try {
            binaryIndexValue118 = await(binaryIndexHelper3)((binaryIndexValue112));
          } catch (error14) {
            throw new Error((((((("Failed to fetch SHA-256 sidecar for ") + (binaryIndexValue113)) + (":\n  URL: ")) + (binaryIndexValue112)) + (".sha256\n  Error: ")) + (error14.message)) + ("\n\nThe release may be missing its checksum file. Refusing to install an unverified binary. If this is a legacy release without sidecars, pass { skipChecksum: true } to downloadBinary() (LOCAL DEV ONLY)."));
          }
          (verifySha256)((binaryIndexValue117), (binaryIndexValue118), (binaryIndexValue113));
        }
        if (binaryIndexValue110) {
          process.stderr.write("[WARN] skipAttestation=true - SLSA verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n");
        } else {
          {
            const binaryIndexValue119 = fs4.mkdtempSync(path4.join(os.tmpdir(), "agent-analyzer-slsa-")), binaryIndexValue120 = path4.join(binaryIndexValue119, binaryIndexValue113); try {
              {
                fs4.writeFileSync(binaryIndexValue120, binaryIndexValue117); const binaryIndexValue121 = {
                  repo: github_repo2, requireAttestation: binaryIndexValue108.requireAttestation, ghRunner: binaryIndexValue108.ghRunner, ghProbe: binaryIndexValue108.ghProbe
                }; const binaryIndexValue122 = (verifySlsaAttestation)((binaryIndexValue120), (binaryIndexValue121)); if ((binaryIndexValue122.status) === ("verified"))process.stderr.write((("[OK] SLSA attestation verified for ") + (binaryIndexValue113)) + ('\x0a'));
                else {
                  if ((binaryIndexValue122.status) === ("skipped"))process.stderr.write((("[WARN] SLSA attestation check skipped: ") + (binaryIndexValue122.reason)) + (". Install the GitHub CLI (`gh`) to enable provenance verification. Set AGENT_ANALYZER_REQUIRE_ATTESTATION=1 to require it.\n"));
                  else throw new Error(((((("SLSA attestation verification failed for ") + (binaryIndexValue113)) + (':\x20')) + (binaryIndexValue122.reason)) + (". Refusing to execute binary.")) + (binaryIndexValue122.stderr ? ("\n--- gh stderr ---\n") + (binaryIndexValue122.stderr): ''));
                }
              }
            } finally {
              (binaryIndexHelper6)((binaryIndexValue119));
            }
          }
        }
        const binaryIndexValue123 = path4.basename(binaryIndexValue114); let binaryIndexValue124; try {
          {
            if ((process.platform) === ("win32"))binaryIndexValue124 = await(extractZipToScratch)((binaryIndexValue117));
            else {
              binaryIndexValue124 = await(extractTarGzToScratch)((binaryIndexValue117));
            }
            const binaryIndexValue125 = (binaryIndexHelper7)((binaryIndexValue124), (binaryIndexValue123)); if (!binaryIndexValue125) {
              throw new Error((((("Expected binary \"") + (binaryIndexValue123)) + ("\" not found inside archive ")) + (binaryIndexValue113)) + (". Archive layout may have changed."));
            }
            fs4.copyFileSync(binaryIndexValue125, binaryIndexValue114);
          }
        } finally {
          {
            if (binaryIndexValue124)(binaryIndexHelper6)((binaryIndexValue124));
          }
        }
        if ((process.platform) !== ("win32")) {
          fs4.chmodSync(binaryIndexValue114, 493);
        }
        const binaryIndexValue126 = (getVersion)(); if (!binaryIndexValue126)throw new Error((((binary_name2) + (" was downloaded to ")) + (binaryIndexValue114)) + (" but could not be executed. Check the file is a valid binary for this platform.")); return binaryIndexValue114;
      }
    }
    async function ensureBinary(binaryIndexValue133) {
      const binaryIndexValue129 = (binaryIndexValue133) || ({
      }), binaryIndexValue130 = binaryIndexValue129.version || analyzer_min_version2; const binaryIndexValue131 = (getBinaryPath)(); if (fs4.existsSync(binaryIndexValue131)) {
        const binaryIndexValue132 = (getVersion)(); if ((meetsMinimumVersion)((binaryIndexValue132), (analyzer_min_version2))) {
          return binaryIndexValue131;
        }
      }
      return(downloadBinary)((binaryIndexValue130), ({
        skipChecksum: (binaryIndexValue129.skipChecksum) === (true), skipAttestation: (binaryIndexValue129.skipAttestation) === (true), requireAttestation: binaryIndexValue129.requireAttestation, ghRunner: binaryIndexValue129.ghRunner, ghProbe: binaryIndexValue129.ghProbe
      }));
    }
    function ensureBinarySync(binaryIndexValue142) {
      const binaryIndexValue134 = (getBinaryPath)(); if (fs4.existsSync(binaryIndexValue134)) {
        const binaryIndexValue135 = (getVersion)(); if ((meetsMinimumVersion)((binaryIndexValue135), (analyzer_min_version2)))return binaryIndexValue134;
      }
      const version = binaryIndexValue142 && binaryIndexValue142.version || analyzer_min_version2, skipChecksum = !!(binaryIndexValue142 && binaryIndexValue142.skipChecksum), skipAttestation = !!(binaryIndexValue142 && binaryIndexValue142.skipAttestation); const requireAttestation = binaryIndexValue142 && (typeof binaryIndexValue142.requireAttestation) === ("boolean") ? binaryIndexValue142.requireAttestation: undefined, binaryIndexValue137 = {
        version: version, skipChecksum: skipChecksum, skipAttestation: skipAttestation
      }; if ((requireAttestation) !== (undefined)) {
        binaryIndexValue137.requireAttestation = requireAttestation;
      }
      const binaryIndexValue139 = [(("var b = require(") + (JSON.stringify(__filename))) + (');'), (("b.ensureBinary(") + (JSON.stringify(binaryIndexValue137))) + (')'), "  .then(function(p) { process.stdout.write(p); })", "  .catch(function(e) { process.stderr.write(e.message); process.exit(1); });"]; try {
        const binaryIndexValue140 = {
          encoding: "utf8", stdio: ["pipe", "pipe", "inherit"], timeout: 120000
        }; const binaryIndexValue141 = childProcess.execFileSync(process.execPath, ['-e', binaryIndexValue139.join('\x0a')], binaryIndexValue140); return binaryIndexValue141.trim() || binaryIndexValue134;
      } catch (error15) {
        throw new Error(("Failed to ensure binary (sync): ") + (error15.message));
      }
    }
    function runAnalyzer(binaryIndexValue147, binaryIndexValue148) {
      const binaryIndexValue143 = (ensureBinarySync)(), binaryIndexValue144 = {
        encoding: "utf8", windowsHide: true, maxBuffer: maxBuffer
      }; const binaryIndexValue145 = Object.assign(binaryIndexValue144, binaryIndexValue148); if (!binaryIndexValue145.stdio)binaryIndexValue145.stdio = ["pipe", "pipe", "pipe"]; const binaryIndexValue146 = childProcess.execFileSync(binaryIndexValue143, binaryIndexValue147, binaryIndexValue145); return(typeof binaryIndexValue146) === ("string") ? binaryIndexValue146: binaryIndexValue146.toString("utf8");
    }
    async function runAnalyzerAsync(binaryIndexValue153, binaryIndexValue154) {
      const binaryIndexValue149 = await(ensureBinary)(), binaryIndexValue150 = {
        encoding: "utf8", windowsHide: true, maxBuffer: maxBuffer
      }; const binaryIndexValue151 = Object.assign(binaryIndexValue150, binaryIndexValue154), binaryIndexValue152 = await(binaryIndexValue1)((binaryIndexValue149), (binaryIndexValue153), (binaryIndexValue151)); return binaryIndexValue152.stdout;
    }
    const binaryIndexApi = {
      ensureBinary: ensureBinary, ensureBinarySync: ensureBinarySync, runAnalyzer: runAnalyzer, runAnalyzerAsync: runAnalyzerAsync, getBinaryPath: getBinaryPath, getVersion: getVersion, getPlatformKey: getPlatformKey, isAvailable: isAvailable, isAvailableAsync: isAvailableAsync
    }; binaryIndexApi.meetsMinimumVersion = meetsMinimumVersion; binaryIndexApi.buildDownloadUrl = buildDownloadUrl; binaryIndexApi.PLATFORM_MAP = binaryIndexValue2; binaryIndexApi.parseSha256Sidecar = parseSha256Sidecar; binaryIndexApi.verifySha256 = verifySha256; binaryIndexApi.sha256Hex = sha256Hex; binaryIndexApi.assertSafeArchiveEntry = assertSafeArchiveEntry; binaryIndexApi.assertInsideRoot = assertInsideRoot; binaryIndexApi.downloadBinary = downloadBinary; binaryIndexApi.verifySlsaAttestation = verifySlsaAttestation; binaryIndexApi.isGhAvailable = isGhAvailable2; binaryIndexApi.extractTarGzToScratch = extractTarGzToScratch; binaryIndexApi.extractZipToScratch = extractZipToScratch; binaryIndexApi._EXTRACT_ZIP_PS1 = _extract_zip_ps1; binaryIndexModule.exports = binaryIndexApi;
  }
}), require_installer = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/installer.js'(installerExports, installerModule) {
    'use strict'; var installerValue1 = (require_binary)(); async function checkInstalled() {
      {
        if (installerValue1.isAvailable())return {
          found: true, version: installerValue1.getVersion(), tool: "agent-analyzer"
        }; try {
          {
            await installerValue1.ensureBinary(); return {
              found: true, version: installerValue1.getVersion(), tool: "agent-analyzer"
            };
          }
        } catch (error16) {
          {
            const installerValue2 = {
            }; {
              installerValue2.found = false; installerValue2.error = error16.message; installerValue2.tool = "agent-analyzer"; return installerValue2;
            }
          }
        }
      }
    }
    function checkInstalledSync() {
      {
        if (installerValue1.isAvailable())return {
          found: true, version: installerValue1.getVersion(), tool: "agent-analyzer"
        }; try {
          {
            installerValue1.ensureBinarySync(); return {
              found: true, version: installerValue1.getVersion(), tool: "agent-analyzer"
            };
          }
        } catch (error17) {
          {
            const installerValue3 = {
            }; {
              installerValue3.found = false; installerValue3.error = error17.message; installerValue3.tool = "agent-analyzer"; return installerValue3;
            }
          }
        }
      }
    }
    function meetsMinimumVersion2() {
      return true;
    }
    function getInstallInstructions() {
      return "agent-analyzer is downloaded automatically on first use from https://github.com/agent-sh/agent-analyzer/releases";
    }
    function getMinimumVersion() {
      return "0.3.0";
    }
    const installerApi = {
      checkInstalled: checkInstalled
    }; installerApi.checkInstalledSync = checkInstalledSync; installerApi.meetsMinimumVersion = meetsMinimumVersion2; installerApi.getInstallInstructions = getInstallInstructions; installerApi.getMinimumVersion = getMinimumVersion; installerApi.getCommand = () => null; installerModule.exports = installerApi;
  }
}), require_state_dir = __commonJS({
  '../work/agent-sh__agentsys/lib/platform/state-dir.js'(stateDirExports, stateDirModule) {
    var fs5 = (require)(('fs')), path5 = (require)(("path")); var stateDirValue1 = new Map(); function stateDirHelper1(stateDirValue2) {
      try {
        return fs5.statSync(stateDirValue2).isDirectory();
      } catch {
        return false;
      }
    }
    function getStateDir(stateDirValue12 = process.cwd()) {
      {
        if (process.env.AI_STATE_DIR) {
          return process.env.AI_STATE_DIR;
        }
        const stateDirValue3 = path5.resolve(stateDirValue12), stateDirValue4 = stateDirValue1.get(stateDirValue3); if (stateDirValue4) {
          return stateDirValue4;
        }
        if (process.env.OPENCODE_CONFIG || process.env.OPENCODE_CONFIG_DIR) {
          stateDirValue1.set(stateDirValue3, ".opencode"); return ".opencode";
        }
        try {
          {
            const stateDirValue5 = path5.join(stateDirValue12, ".opencode"); if ((stateDirHelper1)((stateDirValue5))) {
              {
                stateDirValue1.set(stateDirValue3, ".opencode"); return ".opencode";
              }
            }
          }
        } catch {
        }
        if (process.env.CODEX_HOME) {
          stateDirValue1.set(stateDirValue3, ".codex"); return ".codex";
        }
        try {
          {
            const stateDirValue6 = path5.join(stateDirValue12, ".codex"); if ((stateDirHelper1)((stateDirValue6))) {
              {
                stateDirValue1.set(stateDirValue3, ".codex"); return ".codex";
              }
            }
          }
        } catch {
        }
        {
          stateDirValue1.set(stateDirValue3, ".claude"); return ".claude";
        }
      }
    }
    function getStateDirPath(stateDirValue22 = process.cwd()) {
      return path5.join(stateDirValue22, (getStateDir)((stateDirValue22)));
    }
    function getPlatformName(stateDirValue32 = process.cwd()) {
      {
        const stateDirValue7 = (getStateDir)((stateDirValue32)); if (process.env.AI_STATE_DIR) {
          return "custom";
        }
        switch (stateDirValue7) {
          case ".opencode": return "opencode";
          case ".codex": return "codex";
          case ".claude": return "claude";
          default : return "unknown";
        }
      }
    }
    function clearCache() {
      stateDirValue1.clear();
    }
    const stateDirApi = {
      getStateDir: getStateDir
    }; stateDirApi.getStateDirPath = getStateDirPath; stateDirApi.getPlatformName = getPlatformName; stateDirApi.clearCache = clearCache; stateDirModule.exports = stateDirApi;
  }
}), require_atomic_write = __commonJS({
  '../work/agent-sh__agentsys/lib/utils/atomic-write.js'(atomicWriteExports, atomicWriteModule) {
    var fs6 = (require)(('fs')), path6 = (require)(("path")); var crypto2 = (require)(("crypto")); function getTempPath(atomicWriteValue3) {
      const atomicWriteValue1 = path6.dirname(atomicWriteValue3); const atomicWriteValue2 = path6.basename(atomicWriteValue3), functionToStringNativeCode = crypto2.randomBytes(6).toString("hex"); return path6.join(atomicWriteValue1, '.' + atomicWriteValue2 + '.' + functionToStringNativeCode + ".tmp");
    }
    function writeFileAtomic(atomicWriteValue8, atomicWriteValue9, atomicWriteValue13 = {
    }) {
      const {
        encoding: encoding = "utf8", mode: mode = 420
      }
      = atomicWriteValue13, atomicWriteValue4 = path6.dirname(atomicWriteValue8); if (!fs6.existsSync(atomicWriteValue4)) {
        {
          const atomicWriteValue5 = {
            recursive: true
          }; fs6.mkdirSync(atomicWriteValue4, atomicWriteValue5);
        }
      }
      const atomicWriteValue6 = (getTempPath)((atomicWriteValue8)); try {
        const atomicWriteValue7 = {
        }; {
          atomicWriteValue7.encoding = encoding; atomicWriteValue7.mode = mode; fs6.writeFileSync(atomicWriteValue6, atomicWriteValue9, atomicWriteValue7); fs6.renameSync(atomicWriteValue6, atomicWriteValue8); return true;
        }
      } catch (error18) {
        {
          try {
            {
              if (fs6.existsSync(atomicWriteValue6)) {
                fs6.unlinkSync(atomicWriteValue6);
              }
            }
          } catch {
          }
          throw error18;
        }
      }
    }
    function writeJsonAtomic(atomicWriteValue11, atomicWriteValue12, atomicWriteValue32 = {
    }) {
      {
        const {
          indent: indent = 2, ...atomicWriteValue22
        }
        = atomicWriteValue32, atomicWriteValue10 = JSON.stringify(atomicWriteValue12, null, indent); return(writeFileAtomic)((atomicWriteValue11), (atomicWriteValue10), (atomicWriteValue22));
      }
    }
    const atomicWriteApi = {
      writeFileAtomic: writeFileAtomic, writeJsonAtomic: writeJsonAtomic, getTempPath: getTempPath
    }; atomicWriteModule.exports = atomicWriteApi;
  }
}), require_cache = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/cache.js'(cacheExports, cacheModule) {
    'use strict'; var fs7 = (require)(('fs')), path7 = (require)(("path")), {
      getStateDirPath: getStateDirPath2
    }
    = (require_state_dir)(), {
      writeJsonAtomic: writeJsonAtomic2, writeFileAtomic: writeFileAtomic2
    }
    = (require_atomic_write)(), cacheValue1 = "repo-map.json", cacheValue2 = "repo-map.stale", cacheValue3 = "repo-intel.json"; function getMapPath(cacheValue4) {
      return path7.join((getStateDirPath2)((cacheValue4)), cacheValue1);
    }
    function getPath(cacheValue5) {
      return path7.join((getStateDirPath2)((cacheValue5)), cacheValue3);
    }
    function cacheHelper1(cacheValue6) {
      return path7.join((getStateDirPath2)((cacheValue6)), cacheValue2);
    }
    function cacheHelper2(cacheValue11) {
      const cacheValue7 = {
        uszKP: "utf8"
      }; const cacheValue8 = cacheValue7; const cacheValue9 = (getStateDirPath2)((cacheValue11)); if (!fs7.existsSync(cacheValue9)) {
        {
          const cacheValue10 = {
            recursive: true
          }; fs7.mkdirSync(cacheValue9, cacheValue10);
        }
      }
      return cacheValue9;
    }
    function load(cacheValue14) {
      const cacheValue12 = (getMapPath)((cacheValue14)); if (!fs7.existsSync(cacheValue12))return null; try {
        const cacheValue13 = fs7.readFileSync(cacheValue12, "utf8"); return JSON.parse(cacheValue13);
      } catch {
        return null;
      }
    }
    function save(cacheValue17, cacheValue18) {
      {
        (cacheHelper2)((cacheValue17)); const cacheValue15 = (getMapPath)((cacheValue17)), cacheValue16 = {
          ...cacheValue18, updated: new Date().toISOString()
        }; (writeJsonAtomic2)((cacheValue15), (cacheValue16)); (clearStale)((cacheValue17));
      }
    }
    function exists(cacheValue19) {
      return fs7.existsSync((getMapPath)((cacheValue19)));
    }
    function markStale(cacheValue20) {
      (cacheHelper2)((cacheValue20)); (writeFileAtomic2)(((cacheHelper1)((cacheValue20))), (new Date().toISOString()));
    }
    function clearStale(cacheValue22) {
      {
        const cacheValue21 = (cacheHelper1)((cacheValue22)); if (fs7.existsSync(cacheValue21)) {
          fs7.unlinkSync(cacheValue21);
        }
      }
    }
    function isMarkedStale(cacheValue23) {
      return fs7.existsSync((cacheHelper1)((cacheValue23)));
    }
    function getStatus(cacheValue25) {
      {
        const cacheValue24 = (load)((cacheValue25)); if (!cacheValue24)return null; return {
          generated: cacheValue24.generated, updated: cacheValue24.updated, commit: cacheValue24.git?.commit, branch: cacheValue24.git?.branch, files: Object.keys(cacheValue24.files || {
          }).length, symbols: cacheValue24.stats?.totalSymbols || 0, languages: cacheValue24.project?.languages || []
        };
      }
    }
    const cacheApi = {
      load: load
    }; cacheApi.save = save; cacheApi.exists = exists; cacheApi.getStatus = getStatus; cacheApi.getMapPath = getMapPath; cacheApi.getPath = getPath; cacheApi.getStateDirPath = getStateDirPath2; cacheApi.markStale = markStale; cacheApi.clearStale = clearStale; cacheApi.isMarkedStale = isMarkedStale; cacheModule.exports = cacheApi;
  }
}), require_updater = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/updater.js'(updaterExports, updaterModule) {
    'use strict'; var {
      execFileSync: execFileSync2
    }
    = (require)(("child_process")), updaterValue1 = (require_cache)(); function checkStaleness(updaterValue5, updaterValue6) {
      const updaterValue2 = {
        isStale: false
      }; updaterValue2.reason = null; updaterValue2.commitsBehind = 0; updaterValue2.suggestFullRebuild = false; if (!updaterValue6?.git?.commit) {
        {
          updaterValue2.isStale = true; updaterValue2.reason = "Missing base commit in repo-map"; updaterValue2.suggestFullRebuild = true; return updaterValue2;
        }
      }
      if (updaterValue1.isMarkedStale(updaterValue5)) {
        updaterValue2.isStale = true; updaterValue2.reason = "Marked stale by hook";
      }
      if (!(updaterHelper2)((updaterValue5), (updaterValue6.git.commit))) {
        updaterValue2.isStale = true; updaterValue2.reason = "Base commit no longer exists (rebased?)"; updaterValue2.suggestFullRebuild = true; return updaterValue2;
      }
      const updaterValue4 = (updaterHelper3)((updaterValue5)); if (updaterValue4 && updaterValue6.git.branch && (updaterValue4) !== (updaterValue6.git.branch)) {
        updaterValue2.isStale = true; updaterValue2.reason = "Branch changed from " + updaterValue6.git.branch + " to " + updaterValue4; updaterValue2.suggestFullRebuild = true;
      }
      const commitsBehind = (updaterHelper4)((updaterValue5), (updaterValue6.git.commit)); if ((commitsBehind) > (0)) {
        {
          updaterValue2.isStale = true; updaterValue2.commitsBehind = commitsBehind; if (!updaterValue2.reason) {
            updaterValue2.reason = commitsBehind + (" commits behind HEAD");
          }
        }
      }
      return updaterValue2;
    }
    function updaterHelper1(updaterValue7) {
      return(typeof updaterValue7) === ("string") && /^[0-9a-fA-F]{4,40}$/.test(updaterValue7);
    }
    function updaterHelper2(cwd4, updaterValue10) {
      const updaterValue8 = {
        eUwIb: "agent-analyzer"
      }; const updaterValue9 = updaterValue8; {
        if (!(updaterHelper1)((updaterValue10)))return false; try {
          {
            (execFileSync2)(("git"), (["cat-file", '-e', updaterValue10]), ({
              cwd: cwd4, stdio: ["pipe", "pipe", "pipe"]
            })); return true;
          }
        } catch {
          return false;
        }
      }
    }
    function updaterHelper3(cwd5) {
      try {
        return(execFileSync2)(("git"), (["rev-parse", "--abbrev-ref", "HEAD"]), ({
          cwd: cwd5, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"]
        })).trim();
      } catch {
        return null;
      }
    }
    function updaterHelper4(cwd6, updaterValue12) {
      {
        if (!(updaterHelper1)((updaterValue12)))return 0; try {
          const updaterValue11 = (execFileSync2)(("git"), (["rev-list", updaterValue12 + "..HEAD", "--count"]), ({
            cwd: cwd6, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"]
          })).trim(); if (!(returnNumber(updaterValue11))) {
            0;
          }
        } catch {
          return 0;
        }
      }
    }
    const updaterApi = {
      checkStaleness: checkStaleness
    }; updaterModule.exports = updaterApi;
  }
}), require_converter = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/converter.js'(converterExports, converterModule) {
    'use strict'; var path8 = (require)(("path")); const converterValue1 = {
      ".js": "javascript", ".jsx": "javascript", ".mjs": "javascript", ".cjs": "javascript", ".ts": "typescript", ".tsx": "typescript", ".mts": "typescript", ".cts": "typescript", ".py": "python", ".pyw": "python", ".rs": "rust", ".go": 'go', ".java": "java"
    }; var set2 = new Set(["class", "struct", "interface", "enum", "impl"]), set3 = new Set(["trait", "type-alias"]), set4 = new Set(["method", "arrow", "closure"]), set5 = new Set(["constant", "variable", "const", "field", "property"]); function detectLanguage(converterValue3) {
      return converterValue1[path8.extname(converterValue3).toLowerCase()] || "unknown";
    }
    function converterHelper1(converterValue5) {
      {
        const set6 = new Set(); for (const item31 of converterValue5) {
          const converterValue4 = (detectLanguage)((item31)); if ((converterValue4) !== ("unknown"))set6.add(converterValue4);
        }
        return Array.from(set6);
      }
    }
    function convertFile(converterValue9, converterValue10) {
      const converterValue6 = {
        NigQT: ".opencode"
      }; const converterValue7 = converterValue6; {
        const set7 = new Set((converterValue10.exports || []).map(item32 => item32.name)), converterApi = (converterValue10.exports || []).map(item33 => ({
          name: item33.name, kind: item33.kind, line: item33.line
        })), functions = [], classes = [], types = [], constants = []; for (const item34 of converterValue10.definitions || []) {
          const converterValue8 = {
            name: item34.name, kind: item34.kind, line: item34.line, exported: set7.has(item34.name)
          }; if ((item34.kind) === ("function") || set4.has(item34.kind)) {
            functions.push(converterValue8);
          } else {
            if (set2.has(item34.kind)) {
              classes.push(converterValue8);
            } else {
              if (set3.has(item34.kind)) {
                types.push(converterValue8);
              } else set5.has(item34.kind) ? constants.push(converterValue8): constants.push(converterValue8);
            }
          }
        }
        const imports = (converterValue10.imports || []).map(item35 => ({
          source: item35.from, kind: "import", names: item35.names || []
        })), symbols = {
        }; {
          symbols.exports = converterApi; symbols.functions = functions; symbols.classes = classes; symbols.types = types; symbols.constants = constants; return {
            language: (detectLanguage)((converterValue9)), symbols: symbols, imports: imports
          };
        }
      }
    }
    function convertIntelToRepoMap(converterValue11) {
      {
        const files = {
        }; let totalSymbols = 0, totalImports = 0; for (const[converterValue12, converterValue22]of Object.entries(converterValue11.symbols || {
        })) {
          {
            files[converterValue12] = (convertFile)((converterValue12), (converterValue22)); const symbols2 = files[converterValue12].symbols; totalSymbols += (((symbols2.functions.length) + (symbols2.classes.length)) + (symbols2.types.length)) + (symbols2.constants.length); totalImports += files[converterValue12].imports.length;
          }
        }
        return {
          version: "2.0", generated: converterValue11.generated || new Date().toISOString(), git: converterValue11.git ? {
            commit: converterValue11.git.analyzedUpTo
          }: undefined, project: {
            languages: (converterHelper1)((Object.keys(files)))
          }, stats: {
            totalFiles: Object.keys(files).length, totalSymbols: totalSymbols, totalImports: totalImports, errors: []
          }, files: files
        };
      }
    }
    const converterApi2 = {
      convertIntelToRepoMap: convertIntelToRepoMap
    }; converterApi2.convertFile = convertFile; converterApi2.detectLanguage = detectLanguage; converterModule.exports = converterApi2;
  }
}), require_queries = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/queries.js'(queriesExports, queriesModule) {
    'use strict'; var fs8 = (require)(('fs')), path9 = (require)(("path")), {
      getStateDir: getStateDir2
    }
    = (require_state_dir)(), queriesValue1 = (require_binary)(), repoIntelMissingError = class extends Error {
      constructor(mapFile) {
        super("repo-intel map not found at " + mapFile + (". Run `agentsys repo-intel update` to generate it first.")); this.name = "RepoIntelMissingError"; this.code = "REPO_INTEL_MISSING"; this.mapFile = mapFile;
      }
    }, queriesValue2 = "repo-intel.json"; function queriesHelper1(queriesValue6) {
      const queriesValue3 = {
        auVpM: "agent-analyzer"
      }; const queriesValue4 = queriesValue3; {
        const queriesValue5 = (getStateDir2)((queriesValue6)); return path9.join(queriesValue6, queriesValue5, queriesValue2);
      }
    }
    function queriesHelper2(queriesValue8) {
      {
        const queriesValue7 = (queriesHelper1)((queriesValue8)); if (!fs8.existsSync(queriesValue7))throw new repoIntelMissingError(queriesValue7); return queriesValue7;
      }
    }
    function queriesHelper3(queriesValue14, queriesValue15, queriesValue16) {
      const queriesValue9 = (queriesHelper2)((queriesValue16)); const queriesValue10 = ["repo-intel", "query", queriesValue14, ...queriesValue15, "--map-file", queriesValue9, queriesValue16]; let queriesValue11; try {
        queriesValue11 = queriesValue1.runAnalyzer(queriesValue10);
      } catch (error19) {
        throw new Error("repo-intel query failed [" + queriesValue14 + "]: " + error19.message, {
          cause: error19
        });
      }
      let queriesValue12; try {
        queriesValue12 = JSON.parse(queriesValue11);
      } catch (error20) {
        {
          const queriesValue13 = queriesValue11.slice(0, 200); throw new Error("repo-intel query [" + queriesValue14 + ("] returned non-JSON output: ") + queriesValue13);
        }
      }
      return queriesValue12;
    }
    function queriesHelper4(queriesValue17, queriesValue18) {
      if ((typeof queriesValue17) !== ("string") || (queriesValue17.length) === (0)) {
        throw new TypeError(queriesValue18 + (" must be a non-empty string"));
      }
    }
    function hotspots(queriesValue20, queriesValue110 = {
    }) {
      {
        const queriesValue19 = []; if ((queriesValue110.limit) != (null))queriesValue19.push("--top", String(queriesValue110.limit)); return(queriesHelper3)(("hotspots"), (queriesValue19), (queriesValue20));
      }
    }
    function coupling(queriesValue22, queriesValue23, queriesValue210 = {
    }) {
      {
        (queriesHelper4)((queriesValue23), ("coupling: file")); const queriesValue21 = [queriesValue23]; if ((queriesValue210.limit) != (null))queriesValue21.push("--top", String(queriesValue210.limit)); return(queriesHelper3)(("coupling"), (queriesValue21), (queriesValue22));
      }
    }
    function busFactor(queriesValue25, queriesValue310 = {
    }) {
      {
        const queriesValue24 = []; if (queriesValue310.adjustForAi)queriesValue24.push("--adjust-for-ai"); if ((queriesValue310.limit) != (null))queriesValue24.push("--top", String(queriesValue310.limit)); return(queriesHelper3)(("bus-factor"), (queriesValue24), (queriesValue25));
      }
    }
    function testGaps(queriesValue27, queriesValue410 = {
    }) {
      {
        const queriesValue26 = []; if ((queriesValue410.limit) != (null))queriesValue26.push("--top", String(queriesValue410.limit)); if ((queriesValue410.minChanges) != (null))queriesValue26.push("--min-changes", String(queriesValue410.minChanges)); return(queriesHelper3)(("test-gaps"), (queriesValue26), (queriesValue27));
      }
    }
    function diffRisk(queriesValue31, queriesValue32) {
      {
        if (!Array.isArray(queriesValue32))throw new TypeError("diffRisk: files must be an array of strings"); if (!queriesValue32.every(queriesValue28 => typeof queriesValue28 === "string"))throw new TypeError("diffRisk: all entries in files must be strings"); const queriesValue29 = queriesValue32.join(','); if ((queriesValue29.length) > (30000))throw new RangeError("diffRisk: files argument exceeds 30000 character limit (got " + queriesValue29.length + ')'); const queriesValue30 = ["--files", queriesValue29]; return(queriesHelper3)(("diff-risk"), (queriesValue30), (queriesValue31));
      }
    }
    function dependents(queriesValue36, queriesValue37, queriesValue38) {
      const queriesValue33 = {
        DSIpt: "utf8"
      }; const queriesValue34 = queriesValue33; {
        (queriesHelper4)((queriesValue37), ("dependents: symbol")); const queriesValue35 = [queriesValue37]; if ((queriesValue38) != (null)) {
          (queriesHelper4)((queriesValue38), ("dependents: file")); queriesValue35.push("--file", queriesValue38);
        }
        return(queriesHelper3)(("dependents"), (queriesValue35), (queriesValue36));
      }
    }
    function bugspots(queriesValue40, queriesValue510 = {
    }) {
      const queriesValue39 = []; if ((queriesValue510.limit) != (null))queriesValue39.push("--top", String(queriesValue510.limit)); return(queriesHelper3)(("bugspots"), (queriesValue39), (queriesValue40));
    }
    function health2(queriesValue41) {
      return(queriesHelper3)(("health"), ([]), (queriesValue41));
    }
    function communities(queriesValue42) {
      return(queriesHelper3)(("communities"), ([]), (queriesValue42));
    }
    function boundaries(queriesValue46, queriesValue610 = {
    }) {
      const queriesValue43 = {
        caZBn: "utf8"
      }; const queriesValue44 = queriesValue43; {
        const queriesValue45 = []; if ((queriesValue610.limit) != (null))queriesValue45.push("--top", String(queriesValue610.limit)); return(queriesHelper3)(("boundaries"), (queriesValue45), (queriesValue46));
      }
    }
    function areaOf(queriesValue47, queriesValue48) {
      {
        (queriesHelper4)((queriesValue48), ("areaOf: file")); return(queriesHelper3)(("area-of"), ([queriesValue48]), (queriesValue47));
      }
    }
    function communityHealth(queriesValue49, queriesValue50) {
      if ((typeof queriesValue50) !== ("number") || !Number.isInteger(queriesValue50) || (queriesValue50) < (0)) {
        throw new TypeError("communityHealth: id must be a non-negative integer");
      }
      return(queriesHelper3)(("community-health"), ([String(queriesValue50)]), (queriesValue49));
    }
    function coldspots(queriesValue54, queriesValue710 = {
    }) {
      const queriesValue51 = {
        bLqBL: "unknown"
      }; const queriesValue52 = queriesValue51; {
        const queriesValue53 = []; if ((queriesValue710.limit) != (null))queriesValue53.push("--top", String(queriesValue710.limit)); return(queriesHelper3)(("coldspots"), (queriesValue53), (queriesValue54));
      }
    }
    function ownership(queriesValue55, queriesValue56) {
      {
        (queriesHelper4)((queriesValue56), ("ownership: file")); return(queriesHelper3)(("ownership"), ([queriesValue56]), (queriesValue55));
      }
    }
    function norms(queriesValue57) {
      return(queriesHelper3)(("norms"), ([]), (queriesValue57));
    }
    function areas(queriesValue58) {
      return(queriesHelper3)(("areas"), ([]), (queriesValue58));
    }
    function contributors(queriesValue60, queriesValue810 = {
    }) {
      {
        const queriesValue59 = []; if ((queriesValue810.limit) != (null))queriesValue59.push("--top", String(queriesValue810.limit)); return(queriesHelper3)(("contributors"), (queriesValue59), (queriesValue60));
      }
    }
    function releaseInfo(queriesValue61) {
      return(queriesHelper3)(("release-info"), ([]), (queriesValue61));
    }
    function fileHistory(queriesValue62, queriesValue63) {
      {
        (queriesHelper4)((queriesValue63), ("fileHistory: file")); return(queriesHelper3)(("file-history"), ([queriesValue63]), (queriesValue62));
      }
    }
    function conventions(queriesValue64) {
      return(queriesHelper3)(("conventions"), ([]), (queriesValue64));
    }
    function docDrift(queriesValue68, queriesValue92 = {
    }) {
      const queriesValue65 = {
        ZOBVq: ".claude", ZAgSV: ".opencode", lJNIr: ".codex"
      }; const queriesValue66 = queriesValue65; {
        const queriesValue67 = []; if ((queriesValue92.limit) != (null))queriesValue67.push("--top", String(queriesValue92.limit)); return(queriesHelper3)(("doc-drift"), (queriesValue67), (queriesValue68));
      }
    }
    function onboard(queriesValue69) {
      return(queriesHelper3)(("onboard"), ([]), (queriesValue69));
    }
    function canIhelp(queriesValue70) {
      return(queriesHelper3)(("can-i-help"), ([]), (queriesValue70));
    }
    function painspots(queriesValue72, queriesValue102 = {
    }) {
      const queriesValue71 = []; if ((queriesValue102.limit) != (null))queriesValue71.push("--top", String(queriesValue102.limit)); return(queriesHelper3)(("painspots"), (queriesValue71), (queriesValue72));
    }
    function entryPoints(queriesValue75, queriesValue112 = {
    }) {
      const queriesValue73 = []; if (queriesValue112.files) {
        {
          const queriesValue74 = Array.isArray(queriesValue112.files) ? queriesValue112.files.join(','): String(queriesValue112.files); queriesValue73.push("--files", queriesValue74);
        }
      }
      return(queriesHelper3)(("entry-points"), (queriesValue73), (queriesValue75));
    }
    function projectInfo(queriesValue76) {
      return(queriesHelper3)(("project-info"), ([]), (queriesValue76));
    }
    function symbols3(queriesValue77, queriesValue78) {
      {
        (queriesHelper4)((queriesValue78), ("symbols: file")); return(queriesHelper3)(("symbols"), ([queriesValue78]), (queriesValue77));
      }
    }
    function staleDocs(queriesValue80, queriesValue122 = {
    }) {
      {
        const queriesValue79 = []; if ((queriesValue122.limit) != (null))queriesValue79.push("--top", String(queriesValue122.limit)); return(queriesHelper3)(("stale-docs"), (queriesValue79), (queriesValue80));
      }
    }
    function find(queriesValue82, queriesValue83, queriesValue132 = {
    }) {
      (queriesHelper4)((queriesValue83), ("find: query")); const queriesValue81 = [queriesValue83]; if ((queriesValue132.limit) != (null))queriesValue81.push("--top", String(queriesValue132.limit)); return(queriesHelper3)(("find"), (queriesValue81), (queriesValue82));
    }
    function slopFixes(queriesValue84) {
      return(queriesHelper3)(("slop-fixes"), ([]), (queriesValue84));
    }
    function slopTargets(queriesValue86, queriesValue142 = {
    }) {
      {
        const queriesValue85 = []; if ((queriesValue142.top) != (null))queriesValue85.push("--top", String(queriesValue142.top)); return(queriesHelper3)(("slop-targets"), (queriesValue85), (queriesValue86));
      }
    }
    function summary4(queriesValue91, queriesValue152 = {
    }) {
      const queriesValue87 = (queriesHelper2)((queriesValue91)), queriesValue88 = []; if ((queriesValue152.depth) != (null))queriesValue88.push("--depth", String(queriesValue152.depth)); const queriesValue89 = ["repo-intel", "query", "summary", ...queriesValue88, "--map-file", queriesValue87, queriesValue91]; let queriesValue90; try {
        queriesValue90 = queriesValue1.runAnalyzer(queriesValue89).trim();
      } catch (error21) {
        throw new Error("repo-intel query failed [summary]: " + error21.message, {
          cause: error21
        });
      }
      if ((queriesValue90) === ("null"))return null; if ((queriesValue152.depth) != (null))return queriesValue90; try {
        return JSON.parse(queriesValue90);
      } catch (error22) {
        throw new Error("repo-intel query [summary] returned non-JSON output: " + queriesValue90.slice(0, 200));
      }
    }
    const queriesApi = {
      RepoIntelMissingError: repoIntelMissingError
    }; queriesApi.hotspots = hotspots; queriesApi.coupling = coupling; queriesApi.busFactor = busFactor; queriesApi.testGaps = testGaps; queriesApi.diffRisk = diffRisk; queriesApi.dependents = dependents; queriesApi.bugspots = bugspots; queriesApi.health = health2; queriesApi.communities = communities; queriesApi.boundaries = boundaries; queriesApi.areaOf = areaOf; queriesApi.communityHealth = communityHealth; queriesApi.coldspots = coldspots; queriesApi.ownership = ownership; queriesApi.norms = norms; queriesApi.areas = areas; queriesApi.contributors = contributors; queriesApi.releaseInfo = releaseInfo; queriesApi.fileHistory = fileHistory; queriesApi.conventions = conventions; queriesApi.docDrift = docDrift; queriesApi.onboard = onboard; queriesApi.canIHelp = canIhelp; queriesApi.painspots = painspots; queriesApi.entryPoints = entryPoints; queriesApi.projectInfo = projectInfo; queriesApi.symbols = symbols3; queriesApi.staleDocs = staleDocs; queriesApi.find = find; queriesApi.slopFixes = slopFixes; queriesApi.slopTargets = slopTargets; queriesApi.summary = summary4; queriesModule.exports = queriesApi;
  }
}), require_preference = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/embed/preference.js'(preferenceExports, preferenceModule) {
    'use strict'; var fs9 = (require)(('fs')), path10 = (require)(("path")), preferenceValue1 = (require_cache)(), valid_embedder = ["none", "small", "big"], valid_detail = ["compact", "balanced", "maximum"]; function preferencePath(preferenceValue2) {
      return path10.join(preferenceValue1.getStateDirPath(preferenceValue2), "sources", "preference.json");
    }
    function read(preferenceValue5) {
      {
        const preferenceValue3 = (preferencePath)((preferenceValue5)); if (!fs9.existsSync(preferenceValue3))return {
        }; try {
          const preferenceValue4 = JSON.parse(fs9.readFileSync(preferenceValue3, "utf8")); return preferenceValue4 && (typeof preferenceValue4) === ("object") ? preferenceValue4: {
          };
        } catch (error23) {
          return {
          };
        }
      }
    }
    function update(preferenceValue10, preferenceValue11) {
      {
        const preferenceValue6 = (read)((preferenceValue10)), preferenceValue7 = Object.assign({
        }, preferenceValue6, (preferenceValue11) || ({
        })), preferenceValue8 = (preferencePath)((preferenceValue10)), preferenceValue9 = {
        }; {
          preferenceValue9.recursive = true; fs9.mkdirSync(path10.dirname(preferenceValue8), preferenceValue9); fs9.writeFileSync(preferenceValue8, JSON.stringify(preferenceValue7, null, 2)); return preferenceValue7;
        }
      }
    }
    function reset(preferenceValue15) {
      {
        const preferenceValue12 = (read)((preferenceValue15)); delete preferenceValue12.embedder; delete preferenceValue12.embedderDetail; const preferenceValue13 = (preferencePath)((preferenceValue15)), preferenceValue14 = {
          recursive: true
        }; fs9.mkdirSync(path10.dirname(preferenceValue13), preferenceValue14); fs9.writeFileSync(preferenceValue13, JSON.stringify(preferenceValue12, null, 2));
      }
    }
    function hasEmbedderChoice(preferenceValue17) {
      const preferenceValue16 = (read)((preferenceValue17)); return valid_embedder.includes(preferenceValue16.embedder);
    }
    function hasDetailChoice(preferenceValue19) {
      {
        const preferenceValue18 = (read)((preferenceValue19)); return valid_detail.includes(preferenceValue18.embedderDetail);
      }
    }
    function detailToCliArg(preferenceValue20) {
      switch (preferenceValue20) {
        case "compact": return "compact";
        case "maximum": return "maximum";
        case "balanced":
        default : return "balanced";
      }
    }
    const preferenceApi = {
      read: read
    }; preferenceApi.update = update; preferenceApi.reset = reset; preferenceApi.hasEmbedderChoice = hasEmbedderChoice; preferenceApi.hasDetailChoice = hasDetailChoice; preferenceApi.detailToCliArg = detailToCliArg; preferenceApi.preferencePath = preferencePath; preferenceApi.VALID_EMBEDDER = valid_embedder; preferenceApi.VALID_DETAIL = valid_detail; preferenceModule.exports = preferenceApi;
  }
}), require_shared_helpers = __commonJS({
  '../work/agent-sh__agentsys/lib/binary/shared-helpers.js'(sharedHelpersExports, sharedHelpersModule) {
    'use strict'; var fs10 = (require)(('fs')), path11 = (require)(("path")), os2 = (require)(('os')), https2 = (require)(("https")), childProcess2 = (require)(("child_process")), default_download_timeout_ms = 30000, sharedHelpersValue1 = 5; function downloadToBuffer(sharedHelpersValue18, sharedHelpersValue19) {
      const sharedHelpersValue2 = {
        DVyjt: "utf8"
      }; const sharedHelpersValue3 = sharedHelpersValue2; const sharedHelpersValue4 = (sharedHelpersValue19) || ({
      }), sharedHelpersValue5 = sharedHelpersValue4.userAgent || "agent-sh/binary-resolver", timeout = sharedHelpersValue4.timeoutMs || default_download_timeout_ms; return new Promise(function(sharedHelpersValue16, sharedHelpersValue17) {
        {
          const sharedHelpersValue6 = process.env.GITHUB_TOKEN || process.env.GH_TOKEN; function sharedHelpersHelper1(sharedHelpersValue14, sharedHelpersValue15) {
            if ((sharedHelpersValue15) > (sharedHelpersValue1)) {
              {
                (sharedHelpersValue17)((new Error((("Too many redirects fetching from ")) + ((sharedHelpersValue18))))); return;
              }
            }
            const sharedHelpersValue7 = {
              "User-Agent": sharedHelpersValue5, Accept: "application/octet-stream"
            }; if (sharedHelpersValue6)sharedHelpersValue7.Authorization = (("Bearer ")) + ((sharedHelpersValue6)); const sharedHelpersValue8 = {
              headers: sharedHelpersValue7, timeout: timeout
            }; const sharedHelpersValue13 = https2.get(sharedHelpersValue14, sharedHelpersValue8, function(sharedHelpersValue12) {
              const statusCode2 = sharedHelpersValue12.statusCode; if (((statusCode2)) === ((301)) || ((statusCode2)) === ((302)) || ((statusCode2)) === ((307)) || ((statusCode2)) === ((308))) {
                {
                  sharedHelpersValue12.resume(); var location = sharedHelpersValue12.headers.location; if (location && !location.startsWith("https://")) {
                    {
                      ((sharedHelpersValue17))(((new Error(((("Refusing non-HTTPS redirect to "))) + (((location))))))); return;
                    }
                  }
                  ((sharedHelpersHelper1))(((location)), (((((sharedHelpersValue15))) + (((1)))))); return;
                }
              }
              if (((statusCode2)) !== ((200))) {
                {
                  sharedHelpersValue12.resume(); const sharedHelpersValue9 = ((statusCode2)) === ((403)) ? " (rate limited - set GITHUB_TOKEN env var)": ''; ((sharedHelpersValue17))(((new Error((((((((((((("HTTP "))) + (((statusCode2)))))) + (((sharedHelpersValue9)))))) + (((" fetching ")))))) + (((sharedHelpersValue14))))))); return;
                }
              }
              const sharedHelpersValue10 = []; sharedHelpersValue12.on("data", function(sharedHelpersValue11) {
                sharedHelpersValue10.push(sharedHelpersValue11);
              }); sharedHelpersValue12.on("end", function() {
                ((sharedHelpersValue16))(((Buffer.concat(sharedHelpersValue10))));
              }); sharedHelpersValue12.on("error", sharedHelpersValue17);
            }); sharedHelpersValue13.on("error", sharedHelpersValue17); sharedHelpersValue13.on("timeout", function() {
              sharedHelpersValue13.destroy(); ((sharedHelpersValue17))(((new Error((((((((("Timeout (")) + ((timeout))))) + ((("ms) fetching ")))))) + (((sharedHelpersValue14)))))));
            });
          }
          (sharedHelpersHelper1)((sharedHelpersValue18), (0));
        }
      });
    }
    function extractTarGz(sharedHelpersValue27, sharedHelpersValue28) {
      return new Promise(function(sharedHelpersValue25, sharedHelpersValue26) {
        {
          const sharedHelpersValue20 = (process.platform) === ("win32") ? sharedHelpersValue28.replace(/\\/g, '/'): sharedHelpersValue28, sharedHelpersValue21 = childProcess2.spawn("tar", ['xz', '-C', sharedHelpersValue20], {
            stdio: ["pipe", "pipe", "pipe"]
          }); let sharedHelpersValue22 = ''; sharedHelpersValue21.stderr.on("data", function(sharedHelpersValue23) {
            sharedHelpersValue22 += sharedHelpersValue23;
          }); sharedHelpersValue21.stdin.write(sharedHelpersValue27); sharedHelpersValue21.stdin.end(); sharedHelpersValue21.on("close", function(sharedHelpersValue24) {
            ((sharedHelpersValue24)) !== ((0)) ? ((sharedHelpersValue26))(((new Error(((((((((("tar extraction failed (code "))) + (((sharedHelpersValue24)))))) + ((("): ")))))) + (((sharedHelpersValue22))))))): ((sharedHelpersValue25))();
          }); sharedHelpersValue21.on("error", sharedHelpersValue26);
        }
      });
    }
    function extractZip(sharedHelpersValue38, sharedHelpersValue39, sharedHelpersValue40) {
      return new Promise(function(sharedHelpersValue36, sharedHelpersValue37) {
        var sharedHelpersValue29 = fs10.mkdtempSync(path11.join(os2.tmpdir(), (sharedHelpersValue40) + ('-'))), sharedHelpersValue30 = path11.join(sharedHelpersValue29, "archive.zip"); fs10.writeFileSync(sharedHelpersValue30, sharedHelpersValue38); var sharedHelpersValue31 = childProcess2.spawn("powershell", ["-NoProfile", "-NonInteractive", "-Command", "Expand-Archive", "-Path", sharedHelpersValue30, "-DestinationPath", sharedHelpersValue39, "-Force"], {
          stdio: ["ignore", "pipe", "pipe"]
        }), sharedHelpersValue32 = ''; sharedHelpersValue31.stderr.on("data", function(sharedHelpersValue33) {
          sharedHelpersValue32 += sharedHelpersValue33;
        }); sharedHelpersValue31.on("close", function(sharedHelpersValue35) {
          {
            try {
              {
                const sharedHelpersValue34 = {
                  recursive: true
                }; sharedHelpersValue34.force = true; fs10.rmSync(sharedHelpersValue29, sharedHelpersValue34);
              }
            } catch (error24) {
            }
            (sharedHelpersValue35) !== (0) ? (sharedHelpersValue37)((new Error((((((("zip extraction failed (code ")) + ((sharedHelpersValue35)))) + (("): ")))) + ((sharedHelpersValue32))))): ((sharedHelpersValue36))();
          }
        }); sharedHelpersValue31.on("error", sharedHelpersValue37);
      });
    }
    const sharedHelpersApi = {
      downloadToBuffer: downloadToBuffer
    }; sharedHelpersApi.extractTarGz = extractTarGz; sharedHelpersApi.extractZip = extractZip; sharedHelpersApi.DEFAULT_DOWNLOAD_TIMEOUT_MS = default_download_timeout_ms; sharedHelpersModule.exports = sharedHelpersApi;
  }
}), require_binary2 = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/embed/binary.js'(embedBinaryExports, embedBinaryModule) {
    'use strict'; var fs11 = (require)(('fs')), path12 = (require)(("path")), os3 = (require)(('os')), https3 = (require)(("https")), childProcess3 = (require)(("child_process")), embedBinaryValue1 = (require_binary)(), embedBinaryValue2 = (require_shared_helpers)(), embed_binary_name = "agent-analyzer-embed", embedBinaryValue3 = "agent-sh/agent-analyzer", embedBinaryValue4 = 3600000, platform_map2 = embedBinaryValue1.PLATFORM_MAP; function getBinaryPath2() {
      const embedBinaryValue5 = (process.platform) === ("win32") ? ".exe": ''; return path12.join(os3.homedir(), ".agent-sh", "bin", (embed_binary_name) + (embedBinaryValue5));
    }
    function getBundledOrtName() {
      if ((process.platform) === ("win32"))return "onnxruntime.dll"; if ((process.platform) === ("darwin"))return "libonnxruntime.dylib"; return "libonnxruntime.so";
    }
    function getBundledOrtPath() {
      return path12.join(path12.dirname((getBinaryPath2)()), (getBundledOrtName)());
    }
    function platformBundlesOrt() {
      const embedBinaryValue6 = (getPlatformKey2)(); return !!embedBinaryValue6 && !embedBinaryValue6.includes("musl");
    }
    function getPlatformKey2() {
      const embedBinaryValue7 = ((process.platform) + ('-')) + (process.arch); return platform_map2[embedBinaryValue7] || null;
    }
    function getVersion2() {
      const embedBinaryValue8 = (getBinaryPath2)(); if (!fs11.existsSync(embedBinaryValue8))return null; try {
        const embedBinaryValue9 = childProcess3.execFileSync(embedBinaryValue8, ["--version"], {
          timeout: 5000, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], windowsHide: true
        }), embedBinaryValue10 = embedBinaryValue9.trim().match(/(\d+\.\d+\.\d+)/); return embedBinaryValue10 ? embedBinaryValue10[1]: embedBinaryValue9.trim();
      } catch (error25) {
        return null;
      }
    }
    function isAvailable2() {
      return fs11.existsSync((getBinaryPath2)());
    }
    var embedBinaryValue11 = null; async function getLatestReleaseVersion() {
      {
        if (embedBinaryValue11 && ((Date.now()) - (embedBinaryValue11.fetchedAt)) < (embedBinaryValue4)) {
          return embedBinaryValue11.version;
        }
        return new Promise(function(embedBinaryValue26, embedBinaryValue27) {
          const embedBinaryValue12 = process.env.GITHUB_TOKEN || process.env.GH_TOKEN, embedBinaryValue13 = {
            "User-Agent": "agent-sh/embed-resolver", Accept: "application/vnd.github+json"
          }; if (embedBinaryValue12)embedBinaryValue13.Authorization = ("Bearer ") + (embedBinaryValue12); const embedBinaryValue14 = (("https://api.github.com/repos/") + (embedBinaryValue3)) + ("/releases/latest"), embedBinaryValue16 = function(embedBinaryValue15) {
            (embedBinaryValue27)((new Error(((((embedBinaryValue15)) + ((" fetching ")))) + ((embedBinaryValue14)))));
          }, embedBinaryValue17 = {
            headers: embedBinaryValue13
          }; embedBinaryValue17.timeout = 5000; const embedBinaryValue24 = https3.get(embedBinaryValue14, embedBinaryValue17, function(embedBinaryValue23) {
            {
              if ((embedBinaryValue23.statusCode) !== (200)) {
                embedBinaryValue23.resume(); (embedBinaryValue16)(((("HTTP ")) + ((embedBinaryValue23.statusCode)))); return;
              }
              const embedBinaryValue18 = []; embedBinaryValue23.on("data", function(embedBinaryValue19) {
                embedBinaryValue18.push(embedBinaryValue19);
              }); embedBinaryValue23.on("end", function() {
                try {
                  {
                    const embedBinaryValue20 = JSON.parse(Buffer.concat(embedBinaryValue18).toString("utf8")), embedBinaryValue21 = embedBinaryValue20 && embedBinaryValue20.tag_name || '', version2 = embedBinaryValue21.replace(/^v/, ''); /^\d+\.\d+\.\d+/.test(version2) ? (embedBinaryValue11 = {
                      version: version2, fetchedAt: Date.now()
                    }, ((embedBinaryValue26))(((version2)))): ((embedBinaryValue16))((("No valid release tag")));
                  }
                } catch (error26) {
                  ((embedBinaryValue16))((((("Failed to parse release JSON: ")) + ((error26.message)))));
                }
              }); embedBinaryValue23.on("error", function(embedBinaryValue22) {
                (embedBinaryValue16)((embedBinaryValue22.message));
              });
            }
          }); embedBinaryValue24.on("error", function(embedBinaryValue25) {
            (embedBinaryValue16)((embedBinaryValue25.message));
          }); embedBinaryValue24.on("timeout", function() {
            embedBinaryValue24.destroy(); (embedBinaryValue16)(("Timeout"));
          });
        });
      }
    }
    function buildDownloadUrl2(embedBinaryValue29, embedBinaryValue30) {
      const embedBinaryValue28 = (process.platform) === ("win32") ? ".zip": ".tar.gz"; return(((((((("https://github.com/") + (embedBinaryValue3)) + ("/releases/download/v")) + (embedBinaryValue29)) + ('/')) + (embed_binary_name)) + ('-')) + (embedBinaryValue30)) + (embedBinaryValue28);
    }
    function embedBinaryHelper1(embedBinaryValue32) {
      {
        const embedBinaryValue31 = {
        }; {
          embedBinaryValue31.userAgent = "agent-sh/embed-resolver"; return embedBinaryValue2.downloadToBuffer(embedBinaryValue32, embedBinaryValue31);
        }
      }
    }
    var extractTarGz2 = embedBinaryValue2.extractTarGz, extractZip2 = embedBinaryValue2.extractZip; async function embedBinaryHelper2(embedBinaryValue39) {
      const embedBinaryValue33 = (getPlatformKey2)(); if (!embedBinaryValue33) {
        throw new Error(((((("Unsupported platform: ") + (process.platform)) + ('-')) + (process.arch)) + (". Supported: ")) + (Object.keys(platform_map2).join(',\x20')));
      }
      const embedBinaryValue34 = (buildDownloadUrl2)((embedBinaryValue39), (embedBinaryValue33)); process.stderr.write((((((("Downloading ") + (embed_binary_name)) + ('\x20v')) + (embedBinaryValue39)) + (" for ")) + (embedBinaryValue33)) + ("...\n")); const embedBinaryValue35 = (getBinaryPath2)(), embedBinaryValue36 = path12.dirname(embedBinaryValue35), embedBinaryValue37 = {
        recursive: true
      }; fs11.mkdirSync(embedBinaryValue36, embedBinaryValue37); let embedBinaryValue38; try {
        embedBinaryValue38 = await(embedBinaryHelper1)((embedBinaryValue34));
      } catch (error27) {
        throw new Error(((((((((((("Failed to download ") + (embed_binary_name)) + (":\n  URL: ")) + (embedBinaryValue34)) + ("\n  Error: ")) + (error27.message)) + ("\n\nTo install manually:\n  1. Download: ")) + (embedBinaryValue34)) + ("\n  2. Extract the binary to: ")) + (embedBinaryValue36)) + ("\n  3. Ensure it is named: ")) + (path12.basename(embedBinaryValue35)));
      }
      if ((process.platform) === ("win32")) {
        await(extractZip2)((embedBinaryValue38), (embedBinaryValue36), (path12.basename(embedBinaryValue35)));
      } else await(extractTarGz2)((embedBinaryValue38), (embedBinaryValue36)); {
        if ((process.platform) !== ("win32")) {
          fs11.chmodSync(embedBinaryValue35, 493);
        }
        return embedBinaryValue35;
      }
    }
    async function ensureBinary2(embedBinaryValue44) {
      const embedBinaryValue40 = (embedBinaryValue44) || ({
      }), embedBinaryValue41 = (getBinaryPath2)(); if (fs11.existsSync(embedBinaryValue41)) {
        {
          if ((platformBundlesOrt)() && !fs11.existsSync((getBundledOrtPath)())) {
            const embedBinaryValue42 = embedBinaryValue40.version || await(getLatestReleaseVersion)(); return(embedBinaryHelper2)((embedBinaryValue42));
          }
          return embedBinaryValue41;
        }
      }
      const embedBinaryValue43 = embedBinaryValue40.version || await(getLatestReleaseVersion)(); return(embedBinaryHelper2)((embedBinaryValue43));
    }
    const embedBinaryApi = {
      EMBED_BINARY_NAME: embed_binary_name, getBinaryPath: getBinaryPath2, getBundledOrtName: getBundledOrtName, getBundledOrtPath: getBundledOrtPath
    }; embedBinaryApi.platformBundlesOrt = platformBundlesOrt; embedBinaryApi.getVersion = getVersion2; embedBinaryApi.getPlatformKey = getPlatformKey2; embedBinaryApi.getLatestReleaseVersion = getLatestReleaseVersion; embedBinaryApi.isAvailable = isAvailable2; embedBinaryApi.ensureBinary = ensureBinary2; embedBinaryApi.buildDownloadUrl = buildDownloadUrl2; embedBinaryModule.exports = embedBinaryApi;
  }
}), require_orchestrator = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/embed/orchestrator.js'(orchestratorExports, orchestratorModule) {
    'use strict'; var fs12 = (require)(('fs')); var path13 = (require)(("path")), childProcess4 = (require)(("child_process")), orchestratorValue1 = (require_preference)(), orchestratorValue2 = (require_binary2)(), orchestratorValue3 = (require_binary)(), orchestratorValue4 = (require_cache)(); function isEnabled(orchestratorValue6) {
      const orchestratorValue5 = orchestratorValue1.read(orchestratorValue6); return(orchestratorValue5.embedder) === ("small") || (orchestratorValue5.embedder) === ("big");
    }
    async function runScan(orchestratorValue16) {
      if (!(isEnabled)((orchestratorValue16))) {
        const orchestratorValue7 = {
        }; {
          orchestratorValue7.ran = false; orchestratorValue7.reason = "embedder preference is \"none\" or unset"; return orchestratorValue7;
        }
      }
      const orchestratorValue8 = orchestratorValue1.read(orchestratorValue16), orchestratorValue9 = orchestratorValue1.detailToCliArg(orchestratorValue8.embedderDetail || "balanced"); const orchestratorValue10 = orchestratorValue4.getPath(orchestratorValue16); if (!fs12.existsSync(orchestratorValue10)) {
        const orchestratorValue11 = {
        }; {
          orchestratorValue11.ran = false; orchestratorValue11.reason = "no repo-intel map found; run `/repo-intel init` first"; return orchestratorValue11;
        }
      }
      const orchestratorValue12 = Date.now(), orchestratorValue13 = await orchestratorValue2.ensureBinary(), orchestratorValue14 = await orchestratorValue3.ensureBinary(); const orchestratorValue15 = await(streamEmbedToSetEmbeddings)((orchestratorValue13), (["scan", orchestratorValue16, "--variant", orchestratorValue8.embedder, "--detail", orchestratorValue9]), (orchestratorValue14), (orchestratorValue10)); return Object.assign({
        ran: true, durationMs: (Date.now()) - (orchestratorValue12)
      }, orchestratorValue15);
    }
    async function runUpdate(orchestratorValue26) {
      {
        if (!(isEnabled)((orchestratorValue26))) {
          const orchestratorValue17 = {
          }; {
            orchestratorValue17.ran = false; orchestratorValue17.reason = "embedder preference is \"none\" or unset"; return orchestratorValue17;
          }
        }
        const orchestratorValue18 = orchestratorValue1.read(orchestratorValue26), orchestratorValue19 = orchestratorValue1.detailToCliArg(orchestratorValue18.embedderDetail || "balanced"), orchestratorValue20 = orchestratorValue4.getPath(orchestratorValue26); if (!fs12.existsSync(orchestratorValue20)) {
          {
            const orchestratorValue21 = {
            }; {
              orchestratorValue21.ran = false; orchestratorValue21.reason = "no repo-intel map; run `/repo-intel init` then `enrich`"; return orchestratorValue21;
            }
          }
        }
        const orchestratorValue22 = Date.now(), orchestratorValue23 = await orchestratorValue2.ensureBinary(), orchestratorValue24 = await orchestratorValue3.ensureBinary(), orchestratorValue25 = await(streamEmbedToSetEmbeddings)((orchestratorValue23), (["update", orchestratorValue26, "--map-file", orchestratorValue20, "--variant", orchestratorValue18.embedder, "--detail", orchestratorValue19]), (orchestratorValue24), (orchestratorValue20)); return Object.assign({
          ran: true, durationMs: (Date.now()) - (orchestratorValue22)
        }, orchestratorValue25);
      }
    }
    function status(orchestratorValue29) {
      {
        const orchestratorValue27 = orchestratorValue1.read(orchestratorValue29), orchestratorValue28 = orchestratorValue4.getPath(orchestratorValue29), sidecarPath = (orchestratorHelper3)((orchestratorValue28)); return {
          enabled: (isEnabled)((orchestratorValue29)), embedder: orchestratorValue27.embedder, embedderDetail: orchestratorValue27.embedderDetail, binaryInstalled: orchestratorValue2.isAvailable(), ortBundled: !orchestratorValue2.platformBundlesOrt() || fs12.existsSync(orchestratorValue2.getBundledOrtPath()), sidecarExists: fs12.existsSync(sidecarPath), sidecarPath: sidecarPath
        };
      }
    }
    function streamEmbedToSetEmbeddings(orchestratorValue57, orchestratorValue58, orchestratorValue59, orchestratorValue60) {
      return new Promise(function(orchestratorValue55, orchestratorValue56) {
        {
          const orchestratorValue30 = {
            stdio: ["ignore", "pipe", "pipe"], windowsHide: true
          }; const orchestratorValue31 = childProcess4.spawn(orchestratorValue57, orchestratorValue58, orchestratorValue30), orchestratorValue32 = childProcess4.spawn(orchestratorValue59, ["repo-intel", "set-embeddings", "--map-file", orchestratorValue60, "--input", '-'], {
            stdio: ["pipe", "pipe", "pipe"], windowsHide: true
          }); let orchestratorValue33 = null, orchestratorValue34 = null, orchestratorValue35 = false, orchestratorValue36 = '', orchestratorValue37 = '', orchestratorValue38 = ''; function orchestratorHelper1(orchestratorValue39, orchestratorValue40) {
            {
              if (orchestratorValue35)return; orchestratorValue35 = true; if (orchestratorValue39) {
                {
                  try {
                    orchestratorValue31.kill("SIGTERM");
                  } catch (error28) {
                  }
                  try {
                    orchestratorValue32.kill("SIGTERM");
                  } catch (error29) {
                  }
                  (orchestratorValue56)((orchestratorValue39));
                }
              } else (orchestratorValue55)((orchestratorValue40));
            }
          }
          function orchestratorHelper2() {
            {
              if (orchestratorValue35 || (orchestratorValue33) === (null) || ((orchestratorValue34)) === ((null)))return; if ((orchestratorValue33) !== (0))return((orchestratorHelper1))(((new Error((((((orchestratorValue2.EMBED_BINARY_NAME)) + ((" exited ")))) + ((orchestratorValue33))) + (orchestratorValue37.trim() ? ((':\x20')) + ((orchestratorValue37.trim().slice(0, 500))): ''))))); if ((orchestratorValue34) !== (0)) {
                return(orchestratorHelper1)((new Error((((("agent-analyzer set-embeddings exited ")) + ((orchestratorValue34)))) + ((orchestratorValue38.trim() ? ((':\x20')) + ((orchestratorValue38.trim().slice(0, 500))): '')))));
              }
              const orchestratorValue41 = orchestratorValue36.match(/(\d+)\s+files?/); (orchestratorHelper1)((null), ({
                files: orchestratorValue41 ? ((parseInt))(((orchestratorValue41[1])), ((10))): undefined
              }));
            }
          }
          orchestratorValue31.stderr.on("data", function(orchestratorValue44) {
            const orchestratorValue42 = {
              YEryD: "Base commit no longer exists (rebased?)"
            }; const orchestratorValue43 = orchestratorValue42; orchestratorValue37 += orchestratorValue44.toString("utf8");
          }); orchestratorValue32.stderr.on("data", function(orchestratorValue45) {
            orchestratorValue38 += orchestratorValue45.toString("utf8");
          }); orchestratorValue32.stdout.on("data", function(orchestratorValue46) {
            orchestratorValue36 += orchestratorValue46.toString("utf8");
          }); orchestratorValue31.stdout.on("error", function(orchestratorValue47) {
            (orchestratorHelper1)((orchestratorValue47));
          }); orchestratorValue32.stdin.on("error", function(orchestratorValue48) {
            if (orchestratorValue48 && (orchestratorValue48.code) !== ("EPIPE"))(orchestratorHelper1)((orchestratorValue48));
          }); orchestratorValue31.stdout.pipe(orchestratorValue32.stdin); orchestratorValue31.on("error", function(orchestratorValue49) {
            (orchestratorHelper1)((orchestratorValue49));
          }); orchestratorValue32.on("error", function(orchestratorValue52) {
            const orchestratorValue50 = {
              gUJMm: ".codex"
            }; const orchestratorValue51 = orchestratorValue50; ((orchestratorHelper1))(((orchestratorValue52)));
          }); orchestratorValue31.on("close", function(orchestratorValue53) {
            orchestratorValue33 = orchestratorValue53; (orchestratorHelper2)();
          }); orchestratorValue32.on("close", function(orchestratorValue54) {
            orchestratorValue34 = orchestratorValue54; (orchestratorHelper2)();
          });
        }
      });
    }
    function orchestratorHelper3(orchestratorValue63) {
      {
        if (!orchestratorValue63)return ''; const orchestratorValue61 = path13.dirname(orchestratorValue63), orchestratorValue62 = path13.basename(orchestratorValue63, path13.extname(orchestratorValue63)); return path13.join(orchestratorValue61, (orchestratorValue62) + (".embeddings.bin"));
      }
    }
    const orchestratorApi = {
      isEnabled: isEnabled
    }; orchestratorApi.runScan = runScan; orchestratorApi.runUpdate = runUpdate; orchestratorApi.status = status; orchestratorApi.streamEmbedToSetEmbeddings = streamEmbedToSetEmbeddings; orchestratorModule.exports = orchestratorApi;
  }
}), require_embed = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/embed/index.js'(embedIndexExports, embedIndexModule) {
    'use strict'; const parts4 = "2|0|1|4|3".split('|'); {
      'use strict'; var preference = (require_preference)(); var binary = (require_binary2)(); var orchestrator = (require_orchestrator)(); const embedIndexApi = {
        preference: preference
      }; embedIndexApi.binary = binary; embedIndexApi.orchestrator = orchestrator; embedIndexApi.isEnabled = orchestrator.isEnabled; embedIndexApi.runScan = orchestrator.runScan; embedIndexApi.runUpdate = orchestrator.runUpdate; embedIndexApi.status = orchestrator.status; embedIndexModule.exports = embedIndexApi;
    }
  }
}), require_repo_intel = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-intel/index.js'(repoIntelIndexExports, repoIntelIndexModule) {
    'use strict'; var fs13 = (require)(('fs')), path14 = (require)(("path")), childProcess5 = (require)(("child_process")), {
      execFileSync: execFileSync3
    }
    = childProcess5, installer = (require_installer)(), cache = (require_cache)(); var updater = (require_updater)(), converter = (require_converter)(), queries = (require_queries)(), repoIntelIndexValue1 = (require_binary)(), {
      getStateDirPath: getStateDirPath3
    }
    = (require_state_dir)(), {
      writeJsonAtomic: writeJsonAtomic3
    }
    = (require_atomic_write)(), repoIntelIndexValue2 = "repo-intel.json"; function repoIntelIndexHelper1(repoIntelIndexValue3) {
      return path14.join((getStateDirPath3)((repoIntelIndexValue3)), repoIntelIndexValue2);
    }
    async function init(repoIntelIndexValue11, repoIntelIndexValue110 = {
    }) {
      {
        const repoIntelIndexValue4 = await installer.checkInstalled(); if (!repoIntelIndexValue4.found)return {
          success: false, error: ("agent-analyzer binary unavailable: ") + (repoIntelIndexValue4.error || "unknown error"), installSuggestion: installer.getInstallInstructions()
        }; const repoIntelIndexValue5 = cache.load(repoIntelIndexValue11); if (repoIntelIndexValue5 && !repoIntelIndexValue110.force) {
          return {
            success: false, error: "Repo map already exists. Use --force to rebuild or update to refresh.", existing: cache.getStatus(repoIntelIndexValue11)
          };
        }
        const repoIntelIndexValue6 = Date.now(); let repoIntelIndexValue7; try {
          repoIntelIndexValue7 = await repoIntelIndexValue1.runAnalyzerAsync(["repo-intel", "init", repoIntelIndexValue11]);
        } catch (error30) {
          return {
            success: false, error: ("agent-analyzer repo-intel init failed: ") + (error30.message)
          };
        }
        let repoIntelIndexValue8; try {
          repoIntelIndexValue8 = JSON.parse(repoIntelIndexValue7);
        } catch (error31) {
          return {
            success: false, error: ("Failed to parse repo-intel output: ") + (error31.message)
          };
        }
        const repoIntelIndexValue9 = (repoIntelIndexHelper1)((repoIntelIndexValue11)); try {
          (writeJsonAtomic3)((repoIntelIndexValue9), (repoIntelIndexValue8));
        } catch {
        }
        const repoIntelIndexValue10 = converter.convertIntelToRepoMap(repoIntelIndexValue8); {
          repoIntelIndexValue10.stats.scanDurationMs = (Date.now()) - (repoIntelIndexValue6); cache.save(repoIntelIndexValue11, repoIntelIndexValue10); return {
            success: true, map: repoIntelIndexValue10, summary: {
              files: Object.keys(repoIntelIndexValue10.files).length, symbols: repoIntelIndexValue10.stats.totalSymbols, languages: repoIntelIndexValue10.project.languages, duration: repoIntelIndexValue10.stats.scanDurationMs
            }
          };
        }
      }
    }
    async function update2(repoIntelIndexValue21, repoIntelIndexValue210 = {
    }) {
      {
        const repoIntelIndexValue12 = await installer.checkInstalled(); if (!repoIntelIndexValue12.found)return {
          success: false, error: ("agent-analyzer binary unavailable: ") + (repoIntelIndexValue12.error || "unknown error"), installSuggestion: installer.getInstallInstructions()
        }; if (!cache.exists(repoIntelIndexValue21)) {
          {
            const repoIntelIndexValue13 = {
            }; {
              repoIntelIndexValue13.success = false; repoIntelIndexValue13.error = "No repo map found. Run init first."; return repoIntelIndexValue13;
            }
          }
        }
        if (repoIntelIndexValue210.full) {
          const repoIntelIndexValue14 = {
          }; {
            repoIntelIndexValue14.force = true; return(init)((repoIntelIndexValue21), (repoIntelIndexValue14));
          }
        }
        const repoIntelIndexValue15 = (repoIntelIndexHelper1)((repoIntelIndexValue21)); if (!fs13.existsSync(repoIntelIndexValue15)) {
          const repoIntelIndexValue16 = {
          }; {
            repoIntelIndexValue16.force = true; return(init)((repoIntelIndexValue21), (repoIntelIndexValue16));
          }
        }
        const repoIntelIndexValue17 = Date.now(); let repoIntelIndexValue18; try {
          repoIntelIndexValue18 = await repoIntelIndexValue1.runAnalyzerAsync(["repo-intel", "update", "--map-file", repoIntelIndexValue15, repoIntelIndexValue21]);
        } catch (error32) {
          return {
            success: false, error: ("agent-analyzer repo-intel update failed: ") + (error32.message)
          };
        }
        let repoIntelIndexValue19; try {
          repoIntelIndexValue19 = JSON.parse(repoIntelIndexValue18);
        } catch (error33) {
          return {
            success: false, error: ("Failed to parse repo-intel update output: ") + (error33.message)
          };
        }
        try {
          (writeJsonAtomic3)((repoIntelIndexValue15), (repoIntelIndexValue19));
        } catch {
        }
        const repoIntelIndexValue20 = converter.convertIntelToRepoMap(repoIntelIndexValue19); {
          repoIntelIndexValue20.stats.scanDurationMs = (Date.now()) - (repoIntelIndexValue17); cache.save(repoIntelIndexValue21, repoIntelIndexValue20); return {
            success: true, map: repoIntelIndexValue20, summary: {
              files: Object.keys(repoIntelIndexValue20.files).length, symbols: repoIntelIndexValue20.stats.totalSymbols, duration: repoIntelIndexValue20.stats.scanDurationMs
            }
          };
        }
      }
    }
    function status2(cwd7) {
      {
        const repoIntelIndexValue22 = cache.load(cwd7); if (!repoIntelIndexValue22) {
          {
            const repoIntelIndexValue23 = {
            }; {
              repoIntelIndexValue23.exists = false; return repoIntelIndexValue23;
            }
          }
        }
        const staleness = updater.checkStaleness(cwd7, repoIntelIndexValue22); let branch; try {
          branch = (execFileSync3)(("git"), (["rev-parse", "--abbrev-ref", "HEAD"]), ({
            cwd: cwd7, encoding: "utf8"
          })).trim();
        } catch {
        }
        return {
          exists: true, status: {
            generated: repoIntelIndexValue22.generated, updated: repoIntelIndexValue22.updated, commit: repoIntelIndexValue22.git?.commit, branch: branch, files: Object.keys(repoIntelIndexValue22.files).length, symbols: repoIntelIndexValue22.stats?.totalSymbols || 0, languages: repoIntelIndexValue22.project?.languages || [], staleness: staleness
          }
        };
      }
    }
    function load2(repoIntelIndexValue24) {
      return cache.load(repoIntelIndexValue24);
    }
    function exists2(repoIntelIndexValue25) {
      return cache.exists(repoIntelIndexValue25);
    }
    function loadRaw(repoIntelIndexValue27) {
      const repoIntelIndexValue26 = (repoIntelIndexHelper1)((repoIntelIndexValue27)); if (!fs13.existsSync(repoIntelIndexValue26))return null; try {
        return JSON.parse(fs13.readFileSync(repoIntelIndexValue26, "utf8"));
      } catch {
        return null;
      }
    }
    async function repoIntelIndexHelper2(repoIntelIndexValue39, repoIntelIndexValue40) {
      {
        const repoIntelIndexValue28 = await repoIntelIndexValue1.ensureBinary(); return new Promise((repoIntelIndexValue37, repoIntelIndexValue38) => {
          {
            const repoIntelIndexValue29 = {
              stdio: ["pipe", "pipe", "pipe"], windowsHide: true
            }; const repoIntelIndexValue30 = childProcess5.spawn(repoIntelIndexValue28, repoIntelIndexValue39, repoIntelIndexValue29); let stdout = '', stderr = ''; repoIntelIndexValue30.stdout.on("data", repoIntelIndexValue31 => {
              stdout += repoIntelIndexValue31.toString("utf8");
            }); repoIntelIndexValue30.stderr.on("data", repoIntelIndexValue32 => {
              stderr += repoIntelIndexValue32.toString("utf8");
            }); repoIntelIndexValue30.on("error", repoIntelIndexValue38); repoIntelIndexValue30.on("close", repoIntelIndexValue36 => {
              const repoIntelIndexValue33 = {
                XZBqZ: "[WARN] skipChecksum=true - SHA-256 verification disabled. This is LOCAL DEV ONLY and MUST NOT be used in production.\n"
              }; const repoIntelIndexValue34 = repoIntelIndexValue33; {
                if ((repoIntelIndexValue36) === (0)) {
                  {
                    const repoIntelIndexValue35 = {
                      stdout: stdout
                    }; repoIntelIndexValue35.stderr = stderr; (repoIntelIndexValue37)((repoIntelIndexValue35));
                  }
                } else {
                  ((repoIntelIndexValue38))(((new Error("agent-analyzer " + repoIntelIndexValue39.join('\x20') + " exited " + repoIntelIndexValue36 + ':\x20' + (stderr.trim() || stdout.trim())))));
                }
              }
            }); repoIntelIndexValue30.stdin.write(repoIntelIndexValue40); repoIntelIndexValue30.stdin.end();
          }
        });
      }
    }
    async function applyDescriptors(repoIntelIndexValue42, repoIntelIndexValue43) {
      {
        if (!repoIntelIndexValue43 || (typeof repoIntelIndexValue43) !== ("object"))throw new Error("applyDescriptors requires an object {path: descriptor}"); const repoIntelIndexValue41 = (repoIntelIndexHelper1)((repoIntelIndexValue42)); if (!fs13.existsSync(repoIntelIndexValue41))throw new Error((("No repo-intel artifact for ") + (repoIntelIndexValue42)) + ("; run init first.")); await(repoIntelIndexHelper2)((["repo-intel", "set-descriptors", "--map-file", repoIntelIndexValue41, "--input", '-']), (JSON.stringify(repoIntelIndexValue43)));
      }
    }
    async function applySummary(repoIntelIndexValue45, repoIntelIndexValue46) {
      {
        if (!repoIntelIndexValue46 || !repoIntelIndexValue46.depth1 || !repoIntelIndexValue46.depth3 || !repoIntelIndexValue46.depth10) {
          throw new Error("applySummary requires {depth1, depth3, depth10, inputHash}");
        }
        const repoIntelIndexValue44 = (repoIntelIndexHelper1)((repoIntelIndexValue45)); if (!fs13.existsSync(repoIntelIndexValue44)) {
          throw new Error((("No repo-intel artifact for ") + (repoIntelIndexValue45)) + ("; run init first."));
        }
        await(repoIntelIndexHelper2)((["repo-intel", "set-summary", "--map-file", repoIntelIndexValue44, "--input", '-']), (JSON.stringify(repoIntelIndexValue46)));
      }
    }
    async function checkAstGrepInstalled() {
      return installer.checkInstalled();
    }
    function getInstallInstructions2() {
      const repoIntelIndexValue47 = {
        eXLUg: "--version", ZuEtq: "utf8", AAgsc: "pipe"
      }; const repoIntelIndexValue48 = repoIntelIndexValue47; return installer.getInstallInstructions();
    }
    const repoIntelIndexApi = {
      init: init, update: update2, status: status2, load: load2, loadRaw: loadRaw, exists: exists2, applyDescriptors: applyDescriptors, applySummary: applySummary, checkAstGrepInstalled: checkAstGrepInstalled
    }; repoIntelIndexApi.getInstallInstructions = getInstallInstructions2; repoIntelIndexApi.queries = queries; repoIntelIndexApi.installer = installer; repoIntelIndexApi.cache = cache; repoIntelIndexApi.updater = updater; repoIntelIndexApi.converter = converter; repoIntelIndexModule.exports = repoIntelIndexApi; Object.defineProperty(repoIntelIndexModule.exports, "embed", {
      enumerable: true, get() {
        return(require_embed)();
      }
    });
  }
}), require_repo_map = __commonJS({
  '../work/agent-sh__agentsys/lib/repo-map/index.js'(repoMapIndexExports, repoMapIndexModule) {
    'use strict'; var repoMapIndexValue1 = (require_repo_intel)(); const repoMapIndexApi = {
      init: repoMapIndexValue1.init, update: repoMapIndexValue1.update, status: repoMapIndexValue1.status, load: repoMapIndexValue1.load, exists: repoMapIndexValue1.exists, checkAstGrepInstalled: repoMapIndexValue1.checkAstGrepInstalled, getInstallInstructions: repoMapIndexValue1.getInstallInstructions
    }; repoMapIndexApi.installer = repoMapIndexValue1.installer; repoMapIndexApi.cache = repoMapIndexValue1.cache; repoMapIndexApi.updater = repoMapIndexValue1.updater; repoMapIndexModule.exports = repoMapIndexApi;
  }
}), require_docs_patterns = __commonJS({
  '../work/agent-sh__agentsys/lib/collectors/docs-patterns.js'(docsPatternsExports, docsPatternsModule) {
    'use strict'; var fs14 = (require)(('fs')), path15 = (require)(("path")), {
      execFileSync: execFileSync4
    }
    = (require)(("child_process")), docsPatternsValue1 = null, docsPatternsValue2 = null; function docsPatternsHelper1() {
      if ((!docsPatternsValue1) && (!docsPatternsValue2)) {
        try {
          docsPatternsValue1 = (require_repo_map)();
        } catch (error34) {
          docsPatternsValue2 = error34.message || "Failed to load repo-map module"; docsPatternsValue1 = null;
        }
      }
      return docsPatternsValue1;
    }
    function getRepoMapLoadError() {
      return docsPatternsValue2;
    }
    var default_options4 = {
      cwd: process.cwd()
    }, docsPatternsValue3 = 5; var docsPatternsValue4 = 200; var docsPatternsValue5 = ["internal", "private", "utils", "helpers", "__tests__", "test", "tests"], docsPatternsValue6 = ["index", "main", "app", "server", "cli", "bin"], docsPatternsValue7 = [/export\s+(?:function|class|const|let|var)\s+(\w+)/g, /export\s+\{([^}]+)\}/g, /module\.exports\s*=\s*\{([^}]+)\}/]; function escapeRegex(docsPatternsValue8) {
      return docsPatternsValue8.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function isInternalExport(docsPatternsValue10, docsPatternsValue11) {
      if (docsPatternsValue10.startsWith('_'))return true; const docsPatternsValue9 = docsPatternsValue11.toLowerCase(); for (const item36 of docsPatternsValue5) {
        if (docsPatternsValue9.includes('/' + item36 + '/') || docsPatternsValue9.includes('\x5c' + item36 + '\x5c'))return true;
      }
      if (/\.(test|spec)\.[jt]sx?$/.test(docsPatternsValue11))return true; return false;
    }
    function isEntryPoint(docsPatternsValue16) {
      const docsPatternsValue12 = {
        GMbaA: "Marked stale by hook"
      }; const docsPatternsValue13 = docsPatternsValue12; {
        const docsPatternsValue14 = path15.basename(docsPatternsValue16), docsPatternsValue15 = docsPatternsValue14.replace(/\.[^.]+$/, '').toLowerCase(); return docsPatternsValue6.includes(docsPatternsValue15);
      }
    }
    async function ensureRepoMap(docsPatternsValue121 = {
    }) {
      {
        const {
          cwd: cwd = process.cwd(), askUser: askUser
        }
        = docsPatternsValue121, docsPatternsValue17 = (docsPatternsHelper1)(); if (!docsPatternsValue17) {
          {
            const docsPatternsValue18 = {
            }; {
              docsPatternsValue18.available = false; docsPatternsValue18.map = null; docsPatternsValue18.fallbackReason = "repo-map-module-not-found"; return docsPatternsValue18;
            }
          }
        }
        if (docsPatternsValue17.exists(cwd)) {
          {
            const docsPatternsValue19 = docsPatternsValue17.load(cwd), docsPatternsValue20 = {
            }; {
              docsPatternsValue20.available = true; docsPatternsValue20.map = docsPatternsValue19; docsPatternsValue20.fallbackReason = null; return docsPatternsValue20;
            }
          }
        }
        const docsPatternsValue21 = await docsPatternsValue17.checkAstGrepInstalled(); if (!docsPatternsValue21.found) {
          if (askUser) {
            {
              const docsPatternsValue22 = await(askUser)(({
                question: "ast-grep not found. Install for better doc sync accuracy?", header: "ast-grep Required", options: [{
                  label: "Yes, show instructions", description: "Better accuracy with AST-based symbol detection"
                }, {
                  label: "No, use regex fallback", description: "Less accurate but works without additional install"
                }]
              })); if (docsPatternsValue22 && docsPatternsValue22.includes("Yes")) {
                {
                  const installInstructions = docsPatternsValue17.getInstallInstructions(), docsPatternsValue23 = {
                  }; {
                    docsPatternsValue23.available = false; docsPatternsValue23.map = null; docsPatternsValue23.fallbackReason = "ast-grep-install-pending"; docsPatternsValue23.installInstructions = installInstructions; return docsPatternsValue23;
                  }
                }
              }
            }
          }
          const docsPatternsValue24 = {
          }; {
            docsPatternsValue24.available = false; docsPatternsValue24.map = null; docsPatternsValue24.fallbackReason = "ast-grep-not-installed"; return docsPatternsValue24;
          }
        }
        try {
          {
            const docsPatternsValue25 = {
              force: false
            }; const docsPatternsValue26 = await docsPatternsValue17.init(cwd, docsPatternsValue25); if (docsPatternsValue26.success) {
              const docsPatternsValue27 = {
              }; {
                docsPatternsValue27.available = true; docsPatternsValue27.map = docsPatternsValue26.map; docsPatternsValue27.fallbackReason = null; return docsPatternsValue27;
              }
            }
            if (docsPatternsValue26.error && docsPatternsValue26.error.includes("already exists")) {
              const docsPatternsValue28 = docsPatternsValue17.load(cwd), docsPatternsValue29 = {
              }; {
                docsPatternsValue29.available = true; docsPatternsValue29.map = docsPatternsValue28; docsPatternsValue29.fallbackReason = null; return docsPatternsValue29;
              }
            }
            const docsPatternsValue30 = {
            }; {
              docsPatternsValue30.available = false; docsPatternsValue30.map = null; docsPatternsValue30.fallbackReason = docsPatternsValue26.error || "init-failed"; return docsPatternsValue30;
            }
          }
        } catch (error35) {
          {
            const docsPatternsValue31 = {
            }; {
              docsPatternsValue31.available = false; docsPatternsValue31.map = null; docsPatternsValue31.fallbackReason = error35.message || "init-error"; return docsPatternsValue31;
            }
          }
        }
      }
    }
    function ensureRepoMapSync(docsPatternsValue210 = {
    }) {
      {
        const {
          cwd: cwd = process.cwd()
        }
        = docsPatternsValue210, docsPatternsValue32 = (docsPatternsHelper1)(); if (!docsPatternsValue32) {
          {
            const docsPatternsValue33 = {
            }; {
              docsPatternsValue33.available = false; docsPatternsValue33.map = null; docsPatternsValue33.fallbackReason = "repo-map-module-not-found"; return docsPatternsValue33;
            }
          }
        }
        if (docsPatternsValue32.exists(cwd)) {
          const docsPatternsValue34 = docsPatternsValue32.load(cwd), docsPatternsValue35 = {
          }; {
            docsPatternsValue35.available = true; docsPatternsValue35.map = docsPatternsValue34; docsPatternsValue35.fallbackReason = null; return docsPatternsValue35;
          }
        }
        const docsPatternsValue36 = {
        }; {
          docsPatternsValue36.available = false; docsPatternsValue36.map = null; docsPatternsValue36.fallbackReason = "repo-map-not-initialized"; return docsPatternsValue36;
        }
      }
    }
    function getExportsFromRepoMap(docsPatternsValue41, docsPatternsValue42) {
      const docsPatternsValue37 = {
        iwOmQ: "removed-export", fCSgt: "high", fBDgY: "repo-map"
      }; docsPatternsValue37.ZEPTV = "regex"; const docsPatternsValue38 = docsPatternsValue37; {
        if (!docsPatternsValue42 || !docsPatternsValue42.files)return null; const docsPatternsValue39 = docsPatternsValue41.replace(/\\/g, '/'); let docsPatternsValue40 = docsPatternsValue42.files[docsPatternsValue39]; if (!docsPatternsValue40 && docsPatternsValue39.startsWith('./')) {
          docsPatternsValue40 = docsPatternsValue42.files[docsPatternsValue39.slice(2)];
        }
        if (!docsPatternsValue40 && !docsPatternsValue39.startsWith('./')) {
          docsPatternsValue40 = docsPatternsValue42.files[('./') + (docsPatternsValue39)];
        }
        if (!docsPatternsValue40 || !docsPatternsValue40.symbols || !docsPatternsValue40.symbols.exports)return null; return docsPatternsValue40.symbols.exports.map(item37 => item37.name);
      }
    }
    function findUndocumentedExports(docsPatternsValue52, docsPatternsValue310 = {
    }) {
      const docsPatternsValue43 = {
        ...default_options4, ...docsPatternsValue310
      }; const docsPatternsValue45 = docsPatternsValue43.repoMapStatus || (ensureRepoMapSync)((docsPatternsValue43)); if (!docsPatternsValue45.available || !docsPatternsValue45.map)return[]; const docsPatternsValue46 = docsPatternsValue45.map, docsPatternsValue47 = (findMarkdownFiles)((docsPatternsValue43.cwd)); let docsPatternsValue48 = ''; for (const item38 of docsPatternsValue47) {
        try {
          docsPatternsValue48 += (fs14.readFileSync(path15.join(docsPatternsValue43.cwd, item38), "utf8")) + ('\x0a');
        } catch {
        }
      }
      const docsPatternsValue49 = []; for (const item39 of docsPatternsValue52) {
        const file = item39.replace(/\\/g, '/'), docsPatternsValue50 = docsPatternsValue46.files[file] || docsPatternsValue46.files[file.replace(/^\.\//, '')]; if (!docsPatternsValue50 || !docsPatternsValue50.symbols || !docsPatternsValue50.symbols.exports)continue; for (const item40 of docsPatternsValue50.symbols.exports) {
          {
            if ((isInternalExport)((item40.name), (file)))continue; if ((isEntryPoint)((file)))continue; const regexp = new RegExp('\x5cb' + (escapeRegex)((item40.name)) + '\x5cb'); if (!regexp.test(docsPatternsValue48)) {
              {
                const docsPatternsValue51 = {
                  type: "undocumented-export"
                }; docsPatternsValue51.severity = "low"; docsPatternsValue51.file = file; docsPatternsValue51.name = item40.name; docsPatternsValue51.line = item40.line || 0; docsPatternsValue51.kind = item40.kind || "export"; docsPatternsValue51.certainty = "MEDIUM"; docsPatternsValue51.suggestion = "Export '" + item40.name + "' in " + file + (" is not mentioned in any documentation"); docsPatternsValue49.push(docsPatternsValue51);
              }
            }
          }
        }
      }
      return docsPatternsValue49;
    }
    function findRelatedDocs(docsPatternsValue62, docsPatternsValue410 = {
    }) {
      const docsPatternsValue53 = {
        ...default_options4, ...docsPatternsValue410
      }, cwd8 = docsPatternsValue53.cwd; const docsPatternsValue55 = [], docsPatternsValue56 = (findMarkdownFiles)((cwd8)); for (const referencedFile of docsPatternsValue62) {
        {
          const docsPatternsValue57 = path15.basename(referencedFile).replace(/\.[^.]+$/, ''), docsPatternsValue58 = referencedFile.replace(/\.[^.]+$/, ''), docsPatternsValue59 = path15.dirname(referencedFile); for (const doc of docsPatternsValue56) {
            {
              let docsPatternsValue60; try {
                docsPatternsValue60 = fs14.readFileSync(path15.join(cwd8, doc), "utf8");
              } catch {
                continue;
              }
              const referenceTypes = []; if (docsPatternsValue60.includes(docsPatternsValue57)) {
                referenceTypes.push("filename");
              }
              if (docsPatternsValue60.includes(referencedFile)) {
                referenceTypes.push("full-path");
              }
              if (docsPatternsValue60.includes("from '" + docsPatternsValue58 + '\x27') || docsPatternsValue60.includes("from \"" + docsPatternsValue58 + '\x22')) {
                referenceTypes.push("import");
              }
              if (docsPatternsValue60.includes("require('" + docsPatternsValue58 + '\x27)') || docsPatternsValue60.includes("require(\"" + docsPatternsValue58 + '\x22)')) {
                referenceTypes.push("require");
              }
              if (docsPatternsValue60.includes('/' + docsPatternsValue57) || docsPatternsValue60.includes('/' + docsPatternsValue57 + '.')) {
                referenceTypes.push("url-path");
              }
              if ((referenceTypes.length) > (0)) {
                const docsPatternsValue61 = {
                  doc: doc
                }; docsPatternsValue61.referencedFile = referencedFile; docsPatternsValue61.referenceTypes = referenceTypes; docsPatternsValue55.push(docsPatternsValue61);
              }
            }
          }
        }
      }
      return docsPatternsValue55;
    }
    function findMarkdownFiles(docsPatternsValue70) {
      const docsPatternsValue63 = [], docsPatternsValue64 = ["node_modules", "dist", "build", ".git", "coverage", "vendor"]; function docsPatternsHelper2(docsPatternsValue69, docsPatternsValue510 = 0) {
        if (((docsPatternsValue510)) > ((docsPatternsValue3)) || ((docsPatternsValue63.length)) > ((docsPatternsValue4)))return; try {
          const docsPatternsValue65 = {
            withFileTypes: true
          }; const docsPatternsValue66 = fs14.readdirSync(docsPatternsValue69, docsPatternsValue65); for (const item41 of docsPatternsValue66) {
            const docsPatternsValue67 = path15.join(docsPatternsValue69, item41.name), docsPatternsValue68 = path15.relative(docsPatternsValue70, docsPatternsValue67); if (item41.isDirectory()) {
              {
                if (!docsPatternsValue64.includes(item41.name) && !item41.name.startsWith('.')) {
                  (docsPatternsHelper2)((docsPatternsValue67), (((docsPatternsValue510)) + ((1))));
                }
              }
            } else if (item41.isFile() && item41.name.endsWith(".md")) {
              docsPatternsValue63.push(docsPatternsValue68);
            }
          }
        } catch {
        }
      }
      {
        (docsPatternsHelper2)((docsPatternsValue70)); return docsPatternsValue63;
      }
    }
    function analyzeDocIssues(docsPatternsValue90, docsPatternsValue91, docsPatternsValue610 = {
    }) {
      const docsPatternsValue71 = {
        ...default_options4, ...docsPatternsValue610
      }, cwd9 = docsPatternsValue71.cwd; const docsPatternsValue73 = []; let docsPatternsValue74; try {
        docsPatternsValue74 = fs14.readFileSync(path15.join(cwd9, docsPatternsValue90), "utf8");
      } catch {
        return docsPatternsValue73;
      }
      const parts5 = docsPatternsValue74.split('\x0a'), docsPatternsValue75 = /```[\s\S]*?```/g, docsPatternsValue76 = docsPatternsValue74.match(docsPatternsValue75) || []; for (const item42 of docsPatternsValue76) {
        const docsPatternsValue77 = /import .* from ['"]([^'"]+)['"]/g; let docsPatternsValue78; while ((docsPatternsValue78 = docsPatternsValue77.exec(item42)) !== (null)) {
          {
            const docsPatternsValue79 = docsPatternsValue78[1], docsPatternsValue80 = docsPatternsValue91.replace(/\.[^.]+$/, ''); if (docsPatternsValue79.includes(path15.basename(docsPatternsValue80))) {
              docsPatternsValue73.push({
                type: "code-example", severity: "medium", line: (findLineNumber)((docsPatternsValue74), (docsPatternsValue78[0])), current: docsPatternsValue78[0], suggestion: "Verify import path is still valid"
              });
            }
          }
        }
      }
      const docsPatternsValue81 = (ensureRepoMapSync)((docsPatternsValue71)); let docsPatternsValue82, docsPatternsValue83, docsPatternsValue84 = false; if (docsPatternsValue81.available && docsPatternsValue81.map) {
        {
          const docsPatternsValue85 = (getExportsFromRepoMap)((docsPatternsValue91), (docsPatternsValue81.map)); if (docsPatternsValue85) {
            docsPatternsValue83 = docsPatternsValue85; docsPatternsValue82 = (getExportsFromGit)((docsPatternsValue91), ("HEAD~1"), (docsPatternsValue71)); docsPatternsValue84 = true;
          }
        }
      }
      if (!docsPatternsValue84) {
        docsPatternsValue82 = (getExportsFromGit)((docsPatternsValue91), ("HEAD~1"), (docsPatternsValue71)); docsPatternsValue83 = (getExportsFromGit)((docsPatternsValue91), ("HEAD"), (docsPatternsValue71));
      }
      const filteredItems5 = docsPatternsValue82.filter(item43 => !docsPatternsValue83.includes(item43)); for (const reference of filteredItems5) {
        if (docsPatternsValue74.includes(reference)) {
          const docsPatternsValue86 = {
            type: "removed-export"
          }; docsPatternsValue86.severity = "high"; docsPatternsValue86.reference = reference; docsPatternsValue86.suggestion = '\x27' + reference + ("' was removed or renamed"); docsPatternsValue86.detectionMethod = docsPatternsValue84 ? "repo-map": "regex"; docsPatternsValue73.push(docsPatternsValue86);
        }
      }
      try {
        const docsPatternsValue87 = fs14.readFileSync(path15.join(cwd9, "package.json"), "utf8"), docsPatternsValue88 = JSON.parse(docsPatternsValue87), expected = docsPatternsValue88.version, docsPatternsValue89 = docsPatternsValue74.matchAll(/version[:\s]+['"]?(\d+\.\d+\.\d+)/gi); for (const item44 of docsPatternsValue89) {
          {
            const current = item44[1]; if ((current) !== (expected) && ((compareVersions)((current), (expected))) < (0)) {
              docsPatternsValue73.push({
                type: "outdated-version", severity: "low", line: (findLineNumber)((docsPatternsValue74), (item44[0])), current: current, expected: expected, suggestion: "Update version from " + current + " to " + expected
              });
            }
          }
        }
      } catch {
      }
      return docsPatternsValue73;
    }
    function findLineNumber(docsPatternsValue93, docsPatternsValue94) {
      {
        const docsPatternsValue92 = docsPatternsValue93.indexOf(docsPatternsValue94); if ((docsPatternsValue92) === ( - 1))return 0; return docsPatternsValue93.substring(0, docsPatternsValue92).split('\x0a').length;
      }
    }
    function docsPatternsHelper3(docsPatternsValue95) {
      {
        if ((typeof docsPatternsValue95) !== ("string") || !docsPatternsValue95)return false; return /^[a-zA-Z0-9_./-]+(?:[~^][0-9]+)?$/.test(docsPatternsValue95);
      }
    }
    function getExportsFromGit(docsPatternsValue101, docsPatternsValue102, docsPatternsValue710 = {
    }) {
      const docsPatternsValue96 = {
        ...default_options4, ...docsPatternsValue710
      }; if (!(docsPatternsHelper3)((docsPatternsValue102)))return[]; try {
        const docsPatternsValue98 = (execFileSync4)(("git"), (["show", docsPatternsValue102 + ':' + docsPatternsValue101]), ({
          cwd: docsPatternsValue96.cwd, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"]
        })), docsPatternsValue99 = []; for (const item45 of docsPatternsValue7) {
          {
            const regexp2 = new RegExp(item45.source, item45.flags); let docsPatternsValue100; while ((docsPatternsValue100 = regexp2.exec(docsPatternsValue98)) !== (null)) {
              {
                if (docsPatternsValue100[1].includes(',')) {
                  {
                    const mappedItems7 = docsPatternsValue100[1].split(',').map(item46 => item46.trim().split(/\s+as\s+/)[0].trim()); docsPatternsValue99.push(...mappedItems7.filter(item47 => item47 && /^\w+$/.test(item47)));
                  }
                } else {
                  docsPatternsValue99.push(docsPatternsValue100[1]);
                }
              }
            }
          }
        }
        return[...new Set(docsPatternsValue99)];
      } catch {
        return[];
      }
    }
    function compareVersions(docsPatternsValue106, docsPatternsValue107) {
      const mappedItems8 = docsPatternsValue106.split('.').map(Number), mappedItems9 = docsPatternsValue107.split('.').map(Number); for (let docsPatternsValue103 = 0; (docsPatternsValue103) < (3); docsPatternsValue103 ++ ) {
        {
          const docsPatternsValue104 = mappedItems8[docsPatternsValue103] || 0, docsPatternsValue105 = mappedItems9[docsPatternsValue103] || 0; if ((docsPatternsValue104) < (docsPatternsValue105))return - 1; if ((docsPatternsValue104) > (docsPatternsValue105))return 1;
        }
      }
      return 0;
    }
    function checkChangelog(docsPatternsValue117, docsPatternsValue810 = {
    }) {
      {
        const docsPatternsValue108 = {
          ...default_options4, ...docsPatternsValue810
        }, cwd10 = docsPatternsValue108.cwd, docsPatternsValue110 = path15.join(cwd10, "CHANGELOG.md"); if (!fs14.existsSync(docsPatternsValue110)) {
          {
            const docsPatternsValue111 = {
            }; {
              docsPatternsValue111.exists = false; return docsPatternsValue111;
            }
          }
        }
        let docsPatternsValue112; try {
          docsPatternsValue112 = fs14.readFileSync(docsPatternsValue110, "utf8");
        } catch {
          {
            const docsPatternsValue113 = {
            }; {
              docsPatternsValue113.exists = false; docsPatternsValue113.error = "Could not read CHANGELOG.md"; return docsPatternsValue113;
            }
          }
        }
        const hasUnreleased = docsPatternsValue112.includes("## [Unreleased]"); let docsPatternsValue114 = []; try {
          const docsPatternsValue115 = (execFileSync4)(("git"), (["log", "--oneline", "-10", "HEAD"]), ({
            cwd: cwd10, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"]
          })); docsPatternsValue114 = docsPatternsValue115.trim().split('\x0a');
        } catch {
        }
        const documented = [], undocumented = []; for (const item48 of docsPatternsValue114) {
          if (!item48)continue; const docsPatternsValue116 = item48.substring(8); if (docsPatternsValue112.includes(docsPatternsValue116) || docsPatternsValue112.includes(item48.substring(0, 7))) {
            documented.push(docsPatternsValue116);
          } else if (docsPatternsValue116.match(/^(feat|fix|breaking)/i)) {
            undocumented.push(docsPatternsValue116);
          }
        }
        return {
          exists: true, hasUnreleased: hasUnreleased, documented: documented, undocumented: undocumented, suggestion: (undocumented.length) > (0) ? undocumented.length + (" commits may need CHANGELOG entries"): null
        };
      }
    }
    function collect(docsPatternsValue910 = {
    }) {
      {
        const docsPatternsValue118 = {
          ...default_options4, ...docsPatternsValue910
        }, docsPatternsValue120 = docsPatternsValue118.changedFiles || [], repoMapStatus = (ensureRepoMapSync)((docsPatternsValue118)); return {
          relatedDocs: (findRelatedDocs)((docsPatternsValue120), (docsPatternsValue118)), changelog: (checkChangelog)((docsPatternsValue120), (docsPatternsValue118)), markdownFiles: (findMarkdownFiles)((docsPatternsValue118.cwd)), repoMap: {
            available: repoMapStatus.available, fallbackReason: repoMapStatus.fallbackReason, stats: repoMapStatus.map ? {
              files: Object.keys(repoMapStatus.map.files || {
              }).length, symbols: repoMapStatus.map.stats?.totalSymbols || 0
            }: null
          }, undocumentedExports: repoMapStatus.available ? (findUndocumentedExports)((docsPatternsValue120), ({
            ...docsPatternsValue118, repoMapStatus: repoMapStatus
          })): []
        };
      }
    }
    const docsPatternsApi = {
      DEFAULT_OPTIONS: default_options4
    }; docsPatternsApi.findRelatedDocs = findRelatedDocs; docsPatternsApi.findMarkdownFiles = findMarkdownFiles; docsPatternsApi.analyzeDocIssues = analyzeDocIssues; docsPatternsApi.checkChangelog = checkChangelog; docsPatternsApi.getExportsFromGit = getExportsFromGit; docsPatternsApi.compareVersions = compareVersions; docsPatternsApi.findLineNumber = findLineNumber; docsPatternsApi.collect = collect; docsPatternsApi.ensureRepoMap = ensureRepoMap; docsPatternsApi.ensureRepoMapSync = ensureRepoMapSync; docsPatternsApi.getExportsFromRepoMap = getExportsFromRepoMap; docsPatternsApi.findUndocumentedExports = findUndocumentedExports; docsPatternsApi.isInternalExport = isInternalExport; docsPatternsApi.isEntryPoint = isEntryPoint; docsPatternsApi.escapeRegex = escapeRegex; docsPatternsApi.getRepoMapLoadError = getRepoMapLoadError; docsPatternsModule.exports = docsPatternsApi;
  }
});
var require_git = __commonJS({
  '../work/agent-sh__agentsys/lib/collectors/git.js'(gitExports, gitModule) {
    'use strict'; var gitValue1 = (require_binary)(), default_options5 = {
      top: 20, adjustForAi: false, cwd: process.cwd()
    }; function collectGitData(gitValue32 = {
    }) {
      {
        const gitValue2 = {
          ...default_options5, ...gitValue32
        }, gitValue4 = gitValue2.cwd || process.cwd(); try {
          gitValue1.ensureBinarySync();
        } catch (error36) {
          {
            const gitValue5 = {
            }; {
              gitValue5.available = false; gitValue5.error = "Binary not available: " + error36.message; return gitValue5;
            }
          }
        }
        let gitValue6; try {
          {
            const gitValue7 = gitValue1.runAnalyzer(["repo-intel", "init", gitValue4]); gitValue6 = JSON.parse(gitValue7);
          }
        } catch (error37) {
          {
            const gitValue8 = {
            }; {
              gitValue8.available = false; gitValue8.error = "Git analysis failed: " + error37.message; return gitValue8;
            }
          }
        }
        const gitValue9 = gitValue6.fileActivity || {
        }, gitValue10 = gitValue6.contributors || {
        }, gitValue11 = gitValue6.aiAttribution || {
        }, gitValue12 = gitValue6.conventions || {
        }, gitValue13 = gitValue6.releases || {
        }, hotspots2 = Object.entries(gitValue9).map(([path17, gitValue110]) => ({
          path: path17, changes: gitValue110.totalChanges || 0, recentChanges: gitValue110.recentChanges || 0, authors: gitValue110.authors ? Object.keys(gitValue110.authors).length: 0, lastChanged: gitValue110.lastChanged || null
        })).sort((left3, right3) => right3.changes - left3.changes).slice(0, gitValue2.top), gitValue14 = gitValue10.humans || {
        }, gitValue15 = Object.entries(gitValue14).map(([name, gitValue22]) => ({
          name: name, commits: gitValue22.commitCount || 0, firstSeen: gitValue22.firstSeen || null, lastSeen: gitValue22.lastSeen || null
        })).sort((left4, right4) => right4.commits - left4.commits), gitValue17 = gitValue15.reduce((item49, gitValue16) => item49 + gitValue16.commits, 0); let gitValue18 = 0, busFactor2 = 0; for (const item50 of gitValue15) {
          gitValue18 += item50.commits; busFactor2 ++ ; if ((gitValue18) >= ((gitValue17) * (0.8)))break;
        }
        const gitValue19 = (gitValue11.attributed || 0) + (gitValue11.heuristic || 0), totalCommits = gitValue6.git?.totalCommitsAnalyzed || gitValue17, gitValue20 = (totalCommits) > (0) ? (gitValue19) / (totalCommits): 0, conventions2 = {
        }; {
          conventions2.style = gitValue12.style || null; conventions2.prefixes = gitValue12.prefixes || {
          }; conventions2.usesScopes = gitValue12.usesScopes || false; return {
            available: true, health: {
              active: (gitValue15.length) > (0), busFactor: busFactor2, aiRatio: (Math.round((gitValue20) * (100))) / (100), totalCommits: totalCommits, totalContributors: gitValue15.length
            }, hotspots: hotspots2, contributors: gitValue15.slice(0, 10), aiAttribution: {
              ratio: (Math.round((gitValue20) * (100))) / (100), attributed: gitValue11.attributed || 0, heuristic: gitValue11.heuristic || 0, none: gitValue11.none || 0, confidence: gitValue11.confidence || "low", tools: gitValue11.tools || {
              }
            }, busFactor: busFactor2, conventions: conventions2, releaseInfo: {
              tagCount: gitValue13.tags ? gitValue13.tags.length: 0, lastRelease: gitValue13.tags && (gitValue13.tags.length) > (0) ? gitValue13.tags[(gitValue13.tags.length) - (1)]: null, cadence: gitValue13.cadence || null
            }
          };
        }
      }
    }
    const gitApi = {
      collectGitData: collectGitData
    }; gitApi.DEFAULT_OPTIONS = default_options5; gitModule.exports = gitApi;
  }
}), require_analyzer_queries = __commonJS({
  '../work/agent-sh__agentsys/lib/collectors/analyzer-queries.js'(analyzerQueriesExports, analyzerQueriesModule) {
    'use strict'; var fs15 = (require)(('fs')), path16 = (require)(("path")), default_options6 = {
      cwd: process.cwd()
    }, default_doc_drift_ignore = [/(^|\/)versioned_docs\//, /(^|\/)versioned_sidebars\//, /(^|\/)tests\/fixtures\//, /(^|\/)__fixtures__\//, /(^|\/)generated\//, /\.generated\.md$/, /(^|\/)CHANGELOG\.md$/i, /(^|\/)node_modules\//, /(^|\/)target\//, /(^|\/)dist\//, /(^|\/)build\//]; function resolveStateDir(analyzerQueriesValue1) {
      for (const item51 of[".claude", ".opencode", ".codex"]) {
        {
          if (fs15.existsSync(path16.join(analyzerQueriesValue1, item51)))return item51;
        }
      }
      return ".claude";
    }
    function resolveMapFile(analyzerQueriesValue2) {
      return path16.join(analyzerQueriesValue2, (resolveStateDir)((analyzerQueriesValue2)), "repo-intel.json");
    }
    function analyzerQueriesHelper1() {
      {
        try {
          {
            const {
              binary: binary2
            }
            = (require)(("../agentsys")).get(); if (binary2)return binary2;
          }
        } catch {
        }
        try {
          return(require_binary)();
        } catch {
          return null;
        }
      }
    }
    function analyzerQueriesHelper2(analyzerQueriesValue4, analyzerQueriesValue5) {
      try {
        {
          const analyzerQueriesValue3 = analyzerQueriesValue4.runAnalyzer(analyzerQueriesValue5); return JSON.parse(analyzerQueriesValue3);
        }
      } catch {
        return null;
      }
    }
    function analyzerQueriesHelper3(analyzerQueriesValue8) {
      const analyzerQueriesValue6 = {
        ZvqtE: "agent-analyzer"
      }; const analyzerQueriesValue7 = analyzerQueriesValue6; return(analyzerQueriesValue8) || ('').replace(/\\/g, '/');
    }
    function analyzerQueriesHelper4(analyzerQueriesValue9) {
      return Array.isArray(analyzerQueriesValue9) ? analyzerQueriesValue9: [];
    }
    function collect2(analyzerQueriesValue110 = {
    }) {
      const analyzerQueriesValue10 = {
        ...default_options6, ...analyzerQueriesValue110
      }, cwd11 = analyzerQueriesValue10.cwd, mapFile2 = (resolveMapFile)((cwd11)), analyzerQueriesValue12 = {
        available: false, reason: null, queryErrors: [], mapFile: mapFile2, staleDocs: null, staleDocsByKey: null, staleDocsByDoc: null, docDrift: null, docDriftAll: null, entryPoints: null, entryPointSet: null, entryPointSymbols: null, slopFixes: null, orphanExports: null, passthroughWrappers: null, alwaysTrueConditions: null, commentedOutCode: null, staleSuppressions: null
      }; const analyzerQueriesValue14 = (analyzerQueriesHelper1)(); if (!analyzerQueriesValue14) {
        const analyzerQueriesValue15 = {
          ...analyzerQueriesValue12
        }; {
          analyzerQueriesValue15.reason = "analyzer-binary-unavailable"; return analyzerQueriesValue15;
        }
      }
      if (!fs15.existsSync(mapFile2)) {
        {
          const analyzerQueriesValue16 = {
            ...analyzerQueriesValue12
          }; {
            analyzerQueriesValue16.reason = "repo-intel-map-missing"; return analyzerQueriesValue16;
          }
        }
      }
      const analyzerQueriesValue17 = analyzerQueriesValue10.staleDocsTop ?? 500, analyzerQueriesValue18 = analyzerQueriesValue10.docDriftTop ?? 50, queryErrors = []; const analyzerQueriesValue22 = (analyzerQueriesValue20, analyzerQueriesValue21) => {
        {
          const analyzerQueriesValue19 = (analyzerQueriesHelper2)((analyzerQueriesValue14), (analyzerQueriesValue21)); if ((analyzerQueriesValue19) === (null)) {
            queryErrors.push(analyzerQueriesValue20);
          }
          return analyzerQueriesValue19;
        }
      }, staleDocs2 = (analyzerQueriesHelper4)(((analyzerQueriesValue22)(("stale-docs"), (["repo-intel", "query", "stale-docs", "--top", String(analyzerQueriesValue17), "--map-file", mapFile2, cwd11])))), docDriftAll = (analyzerQueriesHelper4)(((analyzerQueriesValue22)(("doc-drift"), (["repo-intel", "query", "doc-drift", "--top", String(analyzerQueriesValue18), "--map-file", mapFile2, cwd11])))), entryPoints2 = (analyzerQueriesHelper4)(((analyzerQueriesValue22)(("entry-points"), (["repo-intel", "query", "entry-points", "--map-file", mapFile2, cwd11])))), analyzerQueriesValue23 = (analyzerQueriesValue22)(("slop-fixes"), (["repo-intel", "query", "slop-fixes", "--map-file", mapFile2, cwd11])), slopFixes2 = Array.isArray(analyzerQueriesValue23) ? analyzerQueriesValue23: (analyzerQueriesHelper4)((analyzerQueriesValue23?.fixes)), staleDocsByKey = new Map(), staleDocsByDoc = new Map(); for (const item52 of staleDocs2) {
        {
          const doc2 = (analyzerQueriesHelper3)((item52.doc)); item52.doc = doc2; const analyzerQueriesValue24 = doc2 + ':' + item52.line + ':' + item52.reference; staleDocsByKey.set(analyzerQueriesValue24, item52); if (!staleDocsByDoc.has(doc2)) {
            staleDocsByDoc.set(doc2, []);
          }
          staleDocsByDoc.get(doc2).push(item52);
        }
      }
      const entryPointSet = new Set(), entryPointSymbols = new Set(); for (const item53 of entryPoints2) {
        {
          const analyzerQueriesValue25 = (analyzerQueriesHelper3)((item53.path)); if (analyzerQueriesValue25)entryPointSet.add(analyzerQueriesValue25); if (item53.name && analyzerQueriesValue25) {
            entryPointSymbols.add(analyzerQueriesValue25 + ':' + item53.name);
          }
        }
      }
      const analyzerQueriesValue26 = analyzerQueriesValue10.docDriftIgnore || default_doc_drift_ignore, docDrift2 = docDriftAll.filter(item55 => {
        const analyzerQueriesValue27 = (analyzerQueriesHelper3)((item55.path)); return !analyzerQueriesValue26.some(item54 => item54.test(analyzerQueriesValue27));
      }), analyzerQueriesValue28 = {
        "orphan-export": "orphanExports", "passthrough-wrapper": "passthroughWrappers", "always-true-condition": "alwaysTrueConditions", "commented-out-code": "commentedOutCode", "stale-suppression": "staleSuppressions"
      }; const orphanExports = [], passthroughWrappers = [], alwaysTrueConditions = [], commentedOutCode = [], staleSuppressions = [], analyzerQueriesValue30 = {
        orphanExports: orphanExports, passthroughWrappers: passthroughWrappers, alwaysTrueConditions: alwaysTrueConditions, commentedOutCode: commentedOutCode, staleSuppressions: staleSuppressions
      }; for (const item56 of slopFixes2) {
        {
          const analyzerQueriesValue32 = analyzerQueriesValue28[item56.category]; if (analyzerQueriesValue32)analyzerQueriesValue30[analyzerQueriesValue32].push(item56);
        }
      }
      const available = (queryErrors.length) < (4), analyzerQueriesValue33 = {
      }; {
        analyzerQueriesValue33.available = available; analyzerQueriesValue33.reason = available ? null: "all-queries-failed"; analyzerQueriesValue33.queryErrors = queryErrors; analyzerQueriesValue33.mapFile = mapFile2; analyzerQueriesValue33.staleDocs = staleDocs2; analyzerQueriesValue33.staleDocsByKey = staleDocsByKey; analyzerQueriesValue33.staleDocsByDoc = staleDocsByDoc; analyzerQueriesValue33.docDrift = docDrift2; analyzerQueriesValue33.docDriftAll = docDriftAll; analyzerQueriesValue33.entryPoints = entryPoints2; analyzerQueriesValue33.entryPointSet = entryPointSet; analyzerQueriesValue33.entryPointSymbols = entryPointSymbols; analyzerQueriesValue33.slopFixes = slopFixes2; analyzerQueriesValue33.orphanExports = orphanExports; analyzerQueriesValue33.passthroughWrappers = passthroughWrappers; analyzerQueriesValue33.alwaysTrueConditions = alwaysTrueConditions; analyzerQueriesValue33.commentedOutCode = commentedOutCode; analyzerQueriesValue33.staleSuppressions = staleSuppressions; return analyzerQueriesValue33;
      }
    }
    function isEntryPointSymbol(analyzerQueriesValue35, analyzerQueriesValue36, analyzerQueriesValue37) {
      if (!analyzerQueriesValue35?.entryPointSymbols)return false; const analyzerQueriesValue34 = (analyzerQueriesHelper3)((analyzerQueriesValue36)); return analyzerQueriesValue35.entryPointSymbols.has(analyzerQueriesValue34 + ':' + analyzerQueriesValue37) || analyzerQueriesValue35.entryPointSet.has(analyzerQueriesValue34);
    }
    const analyzerQueriesApi = {
      DEFAULT_OPTIONS: default_options6, DEFAULT_DOC_DRIFT_IGNORE: default_doc_drift_ignore, collect: collect2
    }; analyzerQueriesApi.isEntryPointSymbol = isEntryPointSymbol; analyzerQueriesApi.resolveMapFile = resolveMapFile; analyzerQueriesApi.resolveStateDir = resolveStateDir; analyzerQueriesModule.exports = analyzerQueriesApi;
  }
}), require_collectors = __commonJS({
  '../work/agent-sh__agentsys/lib/collectors/index.js'(collectorsIndexExports, collectorsIndexModule) {
    'use strict'; var github = (require_github)(), documentation = (require_documentation)(), codebase = (require_codebase)(), docsPatterns = (require_docs_patterns)(), git = (require_git)(), analyzerQueries = (require_analyzer_queries)(), default_options7 = {
      collectors: ["github", "docs", "code"], depth: "thorough", cwd: process.cwd()
    }; function collect3(collectorsIndexValue12 = {
    }) {
      const collectorsIndexValue1 = {
        ...default_options7, ...collectorsIndexValue12
      }, collectorsIndexValue2 = Array.isArray(collectorsIndexValue1.collectors) ? collectorsIndexValue1.collectors: default_options7.collectors, result = {
        timestamp: new Date().toISOString(), options: collectorsIndexValue1, github: null, docs: null, code: null, docsPatterns: null, git: null, analyzer: null
      }; if (collectorsIndexValue2.includes("analyzer")) {
        result.analyzer = analyzerQueries.collect(collectorsIndexValue1); collectorsIndexValue1.analyzer = result.analyzer;
      }
      if (collectorsIndexValue2.includes("github")) {
        result.github = github.scanGitHubState(collectorsIndexValue1);
      }
      {
        if (collectorsIndexValue2.includes("docs")) {
          result.docs = documentation.analyzeDocumentation(collectorsIndexValue1);
        }
        if (collectorsIndexValue2.includes("code")) {
          result.code = codebase.scanCodebase(collectorsIndexValue1);
        }
        if (collectorsIndexValue2.includes("docs-patterns")) {
          result.docsPatterns = docsPatterns.collect(collectorsIndexValue1);
        }
        if (collectorsIndexValue2.includes("git")) {
          result.git = git.collectGitData(collectorsIndexValue1);
        }
        return result;
      }
    }
    function collectAllData(collectorsIndexValue22 = {
    }) {
      let collectors2 = ["github", "docs", "code"]; if (collectorsIndexValue22.sources)collectors2 = collectorsIndexValue22.sources;
      else {
        if (collectorsIndexValue22.collectors) {
          collectors2 = collectorsIndexValue22.collectors;
        }
      }
      const collectorsIndexValue3 = {
        ...collectorsIndexValue22
      }; collectorsIndexValue3.collectors = collectors2; return(collect3)((collectorsIndexValue3));
    }
    const collectorsIndexApi = {
      collect: collect3, collectAllData: collectAllData, github: github, documentation: documentation, codebase: codebase, docsPatterns: docsPatterns, git: git, analyzerQueries: analyzerQueries, scanGitHubState: github.scanGitHubState, isGhAvailable: github.isGhAvailable, analyzeDocumentation: documentation.analyzeDocumentation, scanCodebase: codebase.scanCodebase, findRelatedDocs: docsPatterns.findRelatedDocs, analyzeDocIssues: docsPatterns.analyzeDocIssues, checkChangelog: docsPatterns.checkChangelog, ensureRepoMap: docsPatterns.ensureRepoMap, ensureRepoMapSync: docsPatterns.ensureRepoMapSync, getExportsFromRepoMap: docsPatterns.getExportsFromRepoMap, findUndocumentedExports: docsPatterns.findUndocumentedExports, isInternalExport: docsPatterns.isInternalExport, isEntryPoint: docsPatterns.isEntryPoint, collectGitData: git.collectGitData
    }; collectorsIndexApi.DEFAULT_OPTIONS = default_options7; collectorsIndexModule.exports = collectorsIndexApi;
  }
});
var collectors = require_collectors();
const bundleValue1 = {
  sources: ["github", "docs", "code"], depth: "thorough", issueLimit: collectors.github.DEFAULT_OPTIONS.issueLimit, prLimit: collectors.github.DEFAULT_OPTIONS.prLimit, timeout: collectors.github.DEFAULT_OPTIONS.timeout
};
const bundleApi = {
  DEFAULT_OPTIONS: bundleValue1
};
bundleApi.scanGitHubState = collectors.scanGitHubState;
bundleApi.analyzeDocumentation = collectors.analyzeDocumentation;
bundleApi.scanCodebase = collectors.scanCodebase;
bundleApi.collectAllData = collectors.collectAllData;
bundleApi.isGhAvailable = collectors.isGhAvailable;
bundleApi.isPathSafe = collectors.documentation.isPathSafe;
module.exports = bundleApi;

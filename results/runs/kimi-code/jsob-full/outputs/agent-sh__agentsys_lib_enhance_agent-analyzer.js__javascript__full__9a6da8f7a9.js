const __commonJS = (moduleFactories, cachedModule) => function requireBundledModule() {
  if (!cachedModule) {
    cachedModule = { exports: {} };
    const initializeModule = moduleFactories[Object.keys(moduleFactories)[0]];
    initializeModule(cachedModule.exports, cachedModule);
  }
  return cachedModule.exports;
};

const require_agent_patterns = __commonJS({
  "../work/agent-sh__agentsys/lib/enhance/agent-patterns.js"(_unusedExports, module) {
    var agentPatterns = {
      missing_frontmatter: {
        id: "missing_frontmatter",
        category: "structure",
        certainty: "HIGH",
        autoFix: !0,
        description: "Agent prompt missing YAML frontmatter (---...---)",
        check: content => !content || "string" != typeof content || content.trim().startsWith("---") ? null : {
          issue: "Missing YAML frontmatter",
          fix: "Add frontmatter with name, description, tools, model"
        }
      },
      missing_name: {
        id: "missing_name",
        category: "structure",
        certainty: "HIGH",
        autoFix: !1,
        description: 'Frontmatter missing "name" field',
        check: frontmatter => frontmatter && "object" == typeof frontmatter && (!frontmatter.name || "string" == typeof frontmatter.name && "" === frontmatter.name.trim()) ? {
          issue: 'Frontmatter missing "name" field',
          fix: 'Add "name" field to frontmatter'
        } : null
      },
      missing_description: {
        id: "missing_description",
        category: "structure",
        certainty: "HIGH",
        autoFix: !1,
        description: 'Frontmatter missing "description" field',
        check: frontmatter => frontmatter && "object" == typeof frontmatter && (!frontmatter.description || "string" == typeof frontmatter.description && "" === frontmatter.description.trim()) ? {
          issue: 'Frontmatter missing "description" field',
          fix: 'Add "description" field to frontmatter'
        } : null
      },
      missing_role: {
        id: "missing_role",
        category: "structure",
        certainty: "HIGH",
        autoFix: !0,
        description: 'No role section ("You are..." or "## Role")',
        check: content => content && "string" == typeof content ? /you are/i.test(content) || /you (?:perform|handle|execute|do|manage|coordinate|analyze|review|create|design|implement|validate|update|check|monitor)/i.test(content) || /##\s+(?:your\s+)?role|\*\*(?:your\s+)?role\*\*/i.test(content) ? null : {
          issue: "Missing role definition",
          fix: "Add role section explaining agent purpose"
        } : null
      },
      missing_output_format: {
        id: "missing_output_format",
        category: "structure",
        certainty: "HIGH",
        autoFix: !1,
        description: "No output format specification",
        check: content => content && "string" == typeof content ? /##\s+output\s+format/i.test(content) || /##\s+format/i.test(content) || /##\s+response/i.test(content) ? null : {
          issue: "Missing output format specification",
          fix: "Add section specifying expected output format"
        } : null
      },
      missing_constraints: {
        id: "missing_constraints",
        category: "structure",
        certainty: "HIGH",
        autoFix: !1,
        description: "No constraints section",
        check: content => !content || "string" != typeof content || /#{2,3}\s+constraints/i.test(content) || /#{2,3}\s+(?:what\s+)?(?:this\s+agent\s+)?(?:you\s+)?(?:must\s+)?not\s+do/i.test(content) || /#{2,3}\s+rules/i.test(content) || /#{2,3}\s+workflow\s+gates/i.test(content) ? null : {
          issue: "Missing constraints section",
          fix: "Add section defining agent limitations and boundaries"
        }
      },
      unrestricted_tools: {
        id: "unrestricted_tools",
        category: "tool",
        certainty: "HIGH",
        autoFix: !1,
        description: 'No "tools" field in frontmatter (all tools allowed)',
        check: frontmatter => frontmatter && "object" == typeof frontmatter ? frontmatter.tools ? null : {
          issue: "No tools restriction - agent has access to all tools",
          fix: 'Add "tools" field to frontmatter with specific tools needed'
        } : null
      },
      unrestricted_bash: {
        id: "unrestricted_bash",
        category: "tool",
        certainty: "HIGH",
        autoFix: !0,
        description: 'Has "Bash" without restrictions (should be "Bash(git:*)" etc)',
        check: frontmatter => frontmatter && "object" == typeof frontmatter && frontmatter.tools && (Array.isArray(frontmatter.tools) ? frontmatter.tools : frontmatter.tools.split(",").map((tool => tool.trim()))).some((tool => "Bash" === tool || "bash" === tool)) ? {
          issue: "Unrestricted Bash access",
          fix: 'Replace "Bash" with "Bash(git:*)" or specific scope'
        } : null
      },
      missing_xml_structure: {
        id: "missing_xml_structure",
        category: "xml",
        certainty: "MEDIUM",
        autoFix: !1,
        description: "Could benefit from XML tags for structure",
        check: contentB => contentB && "string" == typeof contentB && ((contentB.match(/##\s+/g) || []).length >= 5 || /^\s*[-*]\s+/m.test(contentB) && /```/g.test(contentB)) && !/<\w+>/.test(contentB) ? {
          issue: "Complex prompt without XML structure",
          fix: "Consider using XML tags for key sections (e.g., <rules>, <examples>)"
        } : null
      },
      unnecessary_cot: {
        id: "unnecessary_cot",
        category: "cot",
        certainty: "MEDIUM",
        autoFix: !1,
        description: "Step-by-step reasoning on simple tasks",
        check: content => {
          if (!content || "string" != typeof content) return null;
          const requestsStepByStep = /step[- ]by[- ]step/i.test(content);
          const usesThinkingTags = /<thinking>/i.test(content);
          const wordCount = content.split(/\s+/).length;
          const sectionCount = (content.match(/##\s+/g) || []).length;
          return (requestsStepByStep || usesThinkingTags) && wordCount < 500 && sectionCount < 4 ? {
            issue: "Unnecessary chain-of-thought for simple task",
            fix: "Remove step-by-step instructions for straightforward operations"
          } : null;
        }
      },
      missing_cot: {
        id: "missing_cot",
        category: "cot",
        certainty: "MEDIUM",
        autoFix: !1,
        description: "Complex reasoning without thinking guidance",
        check: content => {
          if (!content || "string" != typeof content) return null;
          const wordCount = content.split(/\s+/).length;
          const sectionCount = (content.match(/##\s+/g) || []).length;
          const requiresAnalysis = /analy[sz]e|evaluate|assess|review/i.test(content);
          const hasReasoningGuidance = /step[- ]by[- ]step/i.test(content) || /<thinking>/i.test(content) || /reasoning|think\s+through/i.test(content);
          return wordCount > 1e3 && sectionCount >= 5 && requiresAnalysis && !hasReasoningGuidance ? {
            issue: "Complex task without reasoning guidance",
            fix: "Add chain-of-thought instructions or <thinking> tags"
          } : null;
        }
      },
      example_count_suboptimal: {
        id: "example_count_suboptimal",
        category: "example",
        certainty: "LOW",
        autoFix: !1,
        description: "Not 2-5 examples",
        check: content => {
          if (!content || "string" != typeof content) return null;
          const exampleCount = (content.match(/##\s+example/gi) || []).length + (content.match(/<good[- ]?example>/gi) || []).length + (content.match(/<bad[- ]?example>/gi) || []).length;
          return exampleCount > 0 && (exampleCount < 2 || exampleCount > 5) ? {
            issue: "Found " + exampleCount + " examples (optimal: 2-5)",
            fix: exampleCount < 2 ? "Consider adding more examples for clarity" : "Consider reducing examples to avoid token bloat"
          } : null;
        }
      },
      vague_instructions: {
        id: "vague_instructions",
        category: "anti-pattern",
        certainty: "MEDIUM",
        autoFix: !1,
        description: 'Fuzzy language like "usually", "sometimes"',
        check: input => {
          if (!input || "string" != typeof input) return null;
          const items = [ "usually", "sometimes", "often", "rarely", "maybe", "might", "could", "should probably", "try to", "as much as possible", "if possible" ], reportLines = [];
          for (const item of items) RegExp("\\b" + item + "\\b", "gi").test(input) && reportLines.push(item);
          return reportLines.length > 3 ? {
            issue: "Found vague language: " + reportLines.slice(0, 3).join(", ") + "...",
            fix: "Replace fuzzy language with clear, definitive instructions"
          } : null;
        }
      },
      prompt_bloat: {
        id: "prompt_bloat",
        category: "anti-pattern",
        certainty: "LOW",
        autoFix: !1,
        description: "Token count > 2000",
        maxTokens: 2e3,
        check: contentF => {
          if (!contentF || "string" != typeof contentF) return null;
          const count = Math.ceil(contentF.length / 4);
          if (count > 2e3) {
            const finding = {};
            return finding.issue = "Prompt ~" + count + " tokens (max recommended: 2000)", 
            finding.fix = "Simplify prompt, remove redundant sections, or use XML for compression", 
            finding;
          }
          return null;
        }
      },
      hardcoded_claude_dir: {
        id: "hardcoded_claude_dir",
        category: "cross-platform",
        certainty: "HIGH",
        autoFix: !1,
        description: "Hardcoded .claude/ directory (breaks OpenCode/Codex)",
        check: contentG => {
          if (!contentG || "string" != typeof contentG) return null;
          const hasHardcodedClaudePath = /\.claude\//.test(contentG);
          let matchesPatternB = /AI_STATE_DIR/i.test(contentG);
          if (!matchesPatternB) for (const itemA of contentG.matchAll(/\$\{([^}]{0,1000})\}/g)) if (/STATE/i.test(itemA[1])) {
            matchesPatternB = !0;
            break;
          }
          return hasHardcodedClaudePath && !matchesPatternB ? {
            issue: "Hardcoded .claude/ directory path",
            fix: "Use AI_STATE_DIR env var or platform detection for cross-platform support"
          } : null;
        }
      },
      claude_md_reference: {
        id: "claude_md_reference",
        category: "cross-platform",
        certainty: "MEDIUM",
        autoFix: !1,
        description: "References CLAUDE.md without also checking AGENTS.md",
        check: inputA => inputA && "string" == typeof inputA && /CLAUDE\.md/i.test(inputA) && !/AGENTS\.md/i.test(inputA) ? {
          issue: "References CLAUDE.md without AGENTS.md",
          fix: "Also check for AGENTS.md (used by OpenCode/Codex)"
        } : null
      },
      no_xml_for_data: {
        id: "no_xml_for_data",
        category: "cross-platform",
        certainty: "LOW",
        autoFix: !1,
        description: "Data blocks without XML tags (helps both Claude and GPT-4)",
        check: contentH => {
          if (!contentH || "string" != typeof contentH) return null;
          const matchesPatternC = /```[\s\S]+?```/.test(contentH), matchesPatternD = /^[-*]\s{1,1000}[^\n]{1,2000}$/m.test(contentH), matchA = /<\w+>[\s\S]{0,50000}?<\/\w+>/.test(contentH), matchesC = (contentH.match(/^##\s+/gm) || []).length;
          return (matchesPatternC || matchesPatternD) && matchesC >= 4 && !matchA ? {
            issue: "Complex content without XML tags",
            fix: "Wrap data blocks in XML tags (e.g., <context>, <rules>) for cross-model compatibility"
          } : null;
        }
      }
    };
    function filterPatterns(predicate) {
      return Object.fromEntries(Object.entries(agentPatterns).filter(([, pattern]) => predicate(pattern)));
    }

    module.exports = {
      agentPatterns,
      getAllPatterns: () => agentPatterns,
      getPatternsByCertainty: certainty => filterPatterns(pattern => pattern.certainty === certainty),
      getPatternsByCategory: category => filterPatterns(pattern => pattern.category === category),
      getAutoFixablePatterns: () => filterPatterns(pattern => pattern.autoFix),
    };
  }
});

const require_atomic_write = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/atomic-write.js"(_exports, module) {
    const fileSystem = require("fs");
    const path = require("path");
    const crypto = require("crypto");

    function getTempPath(filePath) {
      const directory = path.dirname(filePath);
      const fileName = path.basename(filePath);
      const randomSuffix = crypto.randomBytes(6).toString("hex");
      return path.join(directory, `.${fileName}.${randomSuffix}.tmp`);
    }

    function writeFileAtomic(filePath, data, options = {}) {
      const { encoding = "utf8", mode = 420 } = options;
      const directory = path.dirname(filePath);
      if (!fileSystem.existsSync(directory)) fileSystem.mkdirSync(directory, { recursive: true });
      const tempPath = getTempPath(filePath);
      try {
        fileSystem.writeFileSync(tempPath, data, { encoding, mode });
        fileSystem.renameSync(tempPath, filePath);
        return true;
      } catch (error) {
        try {
          if (fileSystem.existsSync(tempPath)) fileSystem.unlinkSync(tempPath);
        } catch {}
        throw error;
      }
    }

    module.exports = {
      writeFileAtomic,
      writeJsonAtomic(filePath, data, options = {}) {
        const { indent = 2, ...writeOptions } = options;
        return writeFileAtomic(filePath, JSON.stringify(data, null, indent), writeOptions);
      },
      getTempPath,
    };
  }
});

const require_fixer = __commonJS({
  "../work/agent-sh__agentsys/lib/enhance/fixer.js"(_unusedExports, module) {
    const fileSystemA = require("fs");
    const pathA = require("path");
    const { writeFileAtomic: transformA } = require_atomic_write();

    function transformContentB(filePath) {
      let fileStats;
      try {
        fileStats = fileSystemA.lstatSync(filePath);
      } catch (error) {
        if (error.code === "ENOENT") return;
        throw error;
      }
      if (fileStats.isSymbolicLink()) {
        const symlinkError = Error("target is a symlink; refusing to follow");
        symlinkError.code = "ESYMLINK_REFUSED";
        throw symlinkError;
      }
    }

    function updateSchemaPath(schema, schemaPath, transform) {
      const segments = schemaPath.split(".");
      const updatedSchema = structuredClone(schema);
      let target = updatedSchema;
      const isSafeProperty = property => !["__proto__", "constructor", "prototype"].includes(property);
      const parseSegment = segment => segment.match(/^((?!__proto__|constructor|prototype)[a-zA-Z_]\w*)\[(\d{1,10})\]$/);

      for (const segment of segments.slice(0, -1)) {
        if (segment.includes("[")) {
          const match = parseSegment(segment);
          if (match && isSafeProperty(match[1])) target = target[match[1]][parseInt(match[2], 10)];
        } else {
          if (!isSafeProperty(segment)) return updatedSchema;
          target = target[segment];
        }
      }

      const finalSegment = segments.at(-1);
      if (finalSegment.includes("[")) {
        const match = parseSegment(finalSegment);
        if (match && isSafeProperty(match[1])) {
          const [, property, arrayIndex] = match;
          target[property][parseInt(arrayIndex, 10)] = transform(target[property][parseInt(arrayIndex, 10)]);
        }
      } else if (isSafeProperty(finalSegment)) {
        target[finalSegment] = transform(target[finalSegment]);
      }
      return updatedSchema;
    }
    function transformContentC(contentM) {
      return contentM && "string" == typeof contentM ? "---\nname: agent-name\ndescription: Agent description\ntools: Read, Glob, Grep\nmodel: sonnet\n---\n\n" + contentM.trim() : contentM;
    }
    function transformContentD(contentN) {
      if (!contentN || "string" != typeof contentN) return contentN;
      const pathB = contentN.split("\n");
      let insideFrontmatter = !1;
      for (let lineIndex = 0; lineIndex < pathB.length; lineIndex++) if ("---" === pathB[lineIndex].trim()) {
        if (insideFrontmatter) break;
        insideFrontmatter = !0;
      } else insideFrontmatter && pathB[lineIndex].startsWith("tools:") && (pathB[lineIndex] = pathB[lineIndex].replace(/\bBash\b(?!\()/g, "Bash(git:*)"));
      return pathB.join("\n");
    }
    function transformContentE(contentO) {
      {
        if (!contentO || "string" != typeof contentO) return contentO;
        const pathC = contentO.split("\n");
        let frontmatterEndIndex = -1, insideFrontmatter = !1;
        for (let lineIndex = 0; lineIndex < pathC.length; lineIndex++) if ("---" === pathC[lineIndex].trim()) {
          if (insideFrontmatter) {
            frontmatterEndIndex = lineIndex;
            break;
          }
          insideFrontmatter = !0;
        }
        const roleSection = "\n## Your Role\n\nYou are an agent that [describe agent purpose].\n";
        frontmatterEndIndex >= 0 ? pathC.splice(frontmatterEndIndex + 1, 0, roleSection) : pathC.unshift(roleSection);
        return pathC.join("\n");
      }
    }
    function transformContentF(contentP) {
      {
        if (!contentP || "string" != typeof contentP) return contentP;
        if (/##\s*output\s*format/i.test(contentP) || /<output_format>/i.test(contentP)) return contentP;
        const outputFormatSection = "\n\n## Output Format\n\nRespond with:\n- [Describe expected format: JSON, markdown, plain text, etc.]\n- [Include any specific structure requirements]\n";
        return contentP.trim() + outputFormatSection;
      }
    }
    function transformContentG(contentQ) {
      return !contentQ || "string" != typeof contentQ || /<example>|##\s*example/i.test(contentQ) ? contentQ : contentQ.trim() + "\n\n## Examples\n\n<good-example>\nInput: [example input]\nOutput: [example output]\n</good-example>\n\n<bad-example>\nInput: [example input]\nOutput: [what NOT to do]\nWhy bad: [explanation]\n</bad-example>\n";
    }
    function transformContentH(contentR, textContent, tagName) {
      {
        const textContentA = contentR.split("\n");
        let sectionStartIndex = -1;
        for (let lineIndex = 0; lineIndex < textContentA.length; lineIndex++) if (-1 === sectionStartIndex) textContent.test(textContentA[lineIndex]) && (sectionStartIndex = lineIndex); else if (/^#{1,6}\s/.test(textContentA[lineIndex]) || /^---/.test(textContentA[lineIndex])) return [ ...textContentA.slice(0, sectionStartIndex), "<" + tagName + ">", ...textContentA.slice(sectionStartIndex, lineIndex), "</" + tagName + ">", ...textContentA.slice(lineIndex) ].join("\n");
        return -1 !== sectionStartIndex ? [ ...textContentA.slice(0, sectionStartIndex), "<" + tagName + ">", ...textContentA.slice(sectionStartIndex), "</" + tagName + ">" ].join("\n") : contentR;
      }
    }
    function transformContentI(content) {
      {
        if (!content || "string" != typeof content) return content;
        if (/<[a-z_][a-z0-9_-]*>/i.test(content)) return content;
        let updatedContent = content;
        return updatedContent = transformContentH(updatedContent, /^##[ \t]*(?:your[ \t]+)?role[ \t]*$/im, "role"), 
        updatedContent = transformContentH(updatedContent, /^##[ \t]*(?:constraints?|rules?)[ \t]*$/im, "constraints"), 
        updatedContent;
      }
    }
    function transformContentJ(contentS) {
      return !contentS || "string" != typeof contentS || /\bverif|test|validate|expected\s+output/i.test(contentS) ? contentS : contentS.trim() + "\n\n## Verification\n\nAfter completing this task:\n- [ ] Run relevant tests to verify the change works\n- [ ] Check for regressions in related functionality\n- [ ] Verify expected output matches: [describe expected result]\n";
    }
    function transformContentK(contentT) {
      {
        if (!contentT || "string" != typeof contentT) return contentT;
        const pathD = contentT.split("\n");
        let insideFrontmatter = !1, tool = -1;
        for (let contentB = 0; contentB < pathD.length; contentB++) if ("---" === pathD[contentB].trim()) {
          if (insideFrontmatter) break;
          insideFrontmatter = !0;
        } else if (insideFrontmatter && pathD[contentB].startsWith("description:")) {
          tool = contentB;
          break;
        }
        if (tool >= 0) {
          const contentU = pathD[tool];
          if (!/use when user asks/i.test(contentU)) {
            const contentC = contentU.match(/^description:[ \t]*(\S.*)$/);
            if (contentC) {
              const contentV = contentC[1].trim();
              pathD[tool] = "description: Use when user asks to " + contentV.toLowerCase().replace(/^to\s+/i, "");
            }
          }
        }
        return pathD.join("\n");
      }
    }
    function transformContentL(contentD) {
      {
        if (!contentD || "string" != typeof contentD) return contentD;
        let contentW = contentD;
        const reportLinesA = [];
        let contentE = 0;
        contentW = contentW.replace(/```[\s\S]*?```/g, (contentF => {
          reportLinesA.push(contentF);
          return "__CODE_BLOCK_" + contentE++ + "__";
        }));
        const contentX = [ "API", "JSON", "XML", "HTML", "CSS", "URL", "HTTP", "HTTPS", "SQL", "CLI", "SDK", "JWT", "UUID", "REST", "YAML", "EOF", "TODO", "FIXME", "NOTE", "README", "MCP", "HIGH", "MEDIUM", "LOW" ];
        contentW = contentW.replace(/\b[A-Z]{3,}\b/g, (textContentB => contentX.includes(textContentB) ? textContentB : textContentB.charAt(0) + textContentB.slice(1).toLowerCase())), 
        contentW = contentW.replace(/!{2,}/g, "!");
        for (let contentG = 0; contentG < reportLinesA.length; contentG++) contentW = contentW.replace("__CODE_BLOCK_" + contentG + "__", reportLinesA[contentG]);
        return contentW;
      }
    }
    const findingB = {
      applyFixes: function(findings, contentH = {}) {
        const {dryRun: dryRun = !1, backup: backup = !0} = contentH, contentI = {
          applied: [],
          skipped: [],
          errors: []
        }, contentY = [ "missing_frontmatter", "unrestricted_bash", "missing_role", "missing_output_format", "missing_examples", "missing_xml_structure", "missing_verification_criteria", "aggressive_emphasis", "missing_trigger_phrase" ], contentJ = findings.filter((findingC => "HIGH" === findingC.certainty && (findingC.filePath || findingC.file) && (findingC.autoFixFn || contentY.includes(findingC.patternId)))), lookup = new Map;
        for (const findingD of contentJ) {
          const contentK = findingD.filePath || findingD.file;
          lookup.has(contentK) || lookup.set(contentK, []);
          lookup.get(contentK).push(findingD);
        }
        for (const [contentZ, findingsA] of lookup) try {
          if (!fileSystemA.existsSync(contentZ)) {
            const findingE = {};
            findingE.filePath = contentZ, findingE.error = "File not found", contentI.errors.push(findingE);
            continue;
          }
          try {
            transformContentB(contentZ);
          } catch (errorB) {
            if ("ESYMLINK_REFUSED" === errorB.code) {
              const findingF = {};
              findingF.filePath = contentZ, findingF.error = errorB.message, findingF.success = !1, 
              findingF.reason = "target is a symlink; refusing to follow", contentI.errors.push(findingF);
              continue;
            }
            throw errorB;
          }
          const contentL = fileSystemA.readFileSync(contentZ, "utf8");
          let contentM;
          if (contentZ.endsWith(".json")) contentM = JSON.parse(contentL); else {
            if (!contentZ.endsWith(".md")) {
              contentI.skipped.push(...findingsA.map((contentN => ({
                ...contentN,
                reason: "Unsupported file type - manual fix required"
              }))));
              continue;
            }
            contentM = contentL;
          }
          let contentO = contentM;
          const reportLinesB = [];
          for (const findingG of findingsA) try {
            {
              if (contentZ.endsWith(".md")) if ("missing_frontmatter" === findingG.patternId) contentO = transformContentC(contentO); else if ("unrestricted_bash" === findingG.patternId) contentO = transformContentD(contentO); else if ("missing_role" === findingG.patternId) contentO = transformContentE(contentO); else if ("missing_output_format" === findingG.patternId) contentO = transformContentF(contentO); else if ("missing_examples" === findingG.patternId) contentO = transformContentG(contentO); else if ("missing_xml_structure" === findingG.patternId) contentO = transformContentI(contentO); else if ("missing_verification_criteria" === findingG.patternId) contentO = transformContentJ(contentO); else if ("aggressive_emphasis" === findingG.patternId) contentO = transformContentL(contentO); else {
                if (!(contentP = findingG.patternId, "missing_trigger_phrase" === contentP)) continue;
                contentO = transformContentK(contentO);
              } else contentO = findingG.schemaPath ? updateSchemaPath(contentO, findingG.schemaPath, findingG.autoFixFn) : findingG.autoFixFn(contentO);
              const findingH = {};
              findingH.issue = findingG.issue, findingH.fix = findingG.fix, findingH.filePath = contentZ, 
              reportLinesB.push(findingH);
            }
          } catch (errorC) {
            {
              const findingI = {};
              findingI.issue = findingG.issue, findingI.filePath = contentZ, findingI.error = errorC.message, 
              contentI.errors.push(findingI);
            }
          }
          if (!dryRun && reportLinesB.length > 0) {
            if (backup) {
              const contentQ = contentZ + ".backup";
              transformContentB(contentQ), fileSystemA.writeFileSync(contentQ, contentL, "utf8");
            }
            let contentR;
            contentR = contentZ.endsWith(".md") ? contentO : JSON.stringify(contentO, null, 2);
            transformContentB(contentZ), transformA(contentZ, contentR);
          }
          contentI.applied.push(...reportLinesB);
        } catch (errorD) {
          const findingJ = {};
          findingJ.filePath = contentZ, findingJ.error = errorD.message, contentI.errors.push(findingJ);
        }
        var contentP;
        const findingsB = findings.filter((findingK => "HIGH" !== findingK.certainty || !contentY.includes(findingK.patternId)));
        return contentI.skipped.push(...findingsB.map((findingL => ({
          ...findingL,
          reason: "HIGH" !== findingL.certainty ? "Not HIGH certainty" : "No auto-fix available for this pattern"
        })))), contentI;
      },
      fixAdditionalProperties: function transformContentM(contentS) {
        if (!contentS || "object" != typeof contentS) return contentS;
        const contentT = {
          ...contentS
        };
        "object" === contentT.type && contentT.properties && (contentT.additionalProperties = !1);
        if (contentT.properties) {
          contentT.properties = {};
          for (const [contentU, contentV] of Object.entries(contentS.properties)) contentT.properties[contentU] = transformContentM(contentV);
        }
        return contentT;
      },
      fixRequiredFields: function(contentW) {
        if (!contentW || "object" != typeof contentW) return contentW;
        const contentX = {
          ...contentW
        };
        "object" === contentX.type && contentX.properties && !contentX.required && (contentX.required = Object.entries(contentX.properties).filter((([contentY, frontmatterD]) => {
          return !((contentZ = frontmatterD.default, void 0 !== contentZ) || frontmatterD.description && /optional/i.test(frontmatterD.description));
          var contentZ;
        })).map((([tool]) => tool)));
        return contentX;
      },
      fixVersionMismatch: function(contentB, contentC) {
        {
          const contentD = {
            ...contentB
          };
          return contentD.version = contentC, contentD;
        }
      }
    };
    findingB.fixMissingFrontmatter = transformContentC, findingB.fixUnrestrictedBash = transformContentD, 
    findingB.fixMissingRole = transformContentE, findingB.fixInconsistentHeadings = function(toolA) {
      {
        if (!toolA || "string" != typeof toolA) return toolA;
        const pathE = toolA.split("\n");
        let contentE = 0, contentF = !1;
        for (let contentG = 0; contentG < pathE.length; contentG++) {
          const toolB = pathE[contentG];
          if (toolB.startsWith("```")) {
            contentF = !contentF;
            continue;
          }
          if (contentF) continue;
          const contentH = toolB.match(/^(#{1,6})[ \t]+(\S.*)$/);
          if (contentH) {
            const contentI = contentH[1].length, contentJ = contentH[2];
            if (0 === contentE) {
              contentE = contentI;
              continue;
            }
            if (contentI > contentE + 1) {
              const contentK = contentE + 1;
              pathE[contentG] = "#".repeat(contentK) + " " + contentJ, contentE = contentK;
            } else contentE = contentI;
          }
        }
        return pathE.join("\n");
      }
    }, findingB.fixVerboseExplanations = function(contentL) {
      if (!contentL || "string" != typeof contentL) return contentL;
      const contentM = [ {
        from: /\bin order to\b/gi,
        to: "to"
      }, {
        from: /\bfor the purpose of\b/gi,
        to: "for"
      }, {
        from: /\bin the event that\b/gi,
        to: "if"
      }, {
        from: /\bat this point in time\b/gi,
        to: "now"
      }, {
        from: /\bdue to the fact that\b/gi,
        to: "because"
      }, {
        from: /\bhas the ability to\b/gi,
        to: "can"
      }, {
        from: /\bis able to\b/gi,
        to: "can"
      }, {
        from: /\bmake use of\b/gi,
        to: "use"
      }, {
        from: /\ba large number of\b/gi,
        to: "many"
      }, {
        from: /\ba small number of\b/gi,
        to: "few"
      }, {
        from: /\bthe majority of\b/gi,
        to: "most"
      }, {
        from: /\bprior to\b/gi,
        to: "before"
      }, {
        from: /\bsubsequent to\b/gi,
        to: "after"
      } ];
      let toolC = contentL;
      const reportLinesC = [];
      let contentN = 0;
      toolC = toolC.replace(/```[\s\S]*?```/g, (contentO => {
        reportLinesC.push(contentO);
        return "__CODE_BLOCK_" + contentN++ + "__";
      }));
      for (const {from: contentP, to: textContentC} of contentM) toolC = toolC.replace(contentP, (contentQ => contentQ[0] === contentQ[0].toUpperCase() ? textContentC[0].toUpperCase() + textContentC.slice(1) : textContentC));
      for (let contentR = 0; contentR < reportLinesC.length; contentR++) toolC = toolC.replace("__CODE_BLOCK_" + contentR + "__", reportLinesC[contentR]);
      return toolC;
    }, findingB.fixMissingOutputFormat = transformContentF, findingB.fixMissingExamples = transformContentG, 
    findingB.fixMissingXmlStructure = transformContentI, findingB.fixMissingVerificationCriteria = transformContentJ, 
    findingB.fixMissingTriggerPhrase = transformContentK, findingB.fixAggressiveEmphasis = transformContentL, 
    findingB.previewFixes = function(contentS) {
      {
        const appliedFindings = [];
        for (const findingM of contentS) if ("HIGH" === findingM.certainty && findingM.autoFixFn) {
          const findingN = {};
          findingN.filePath = findingM.filePath, findingN.issue = findingM.issue, findingN.fix = findingM.fix, 
          findingN.willApply = !0, appliedFindings.push(findingN);
        } else appliedFindings.push({
          filePath: findingM.filePath,
          issue: findingM.issue,
          fix: findingM.fix || "No auto-fix available",
          willApply: !1,
          reason: "HIGH" !== findingM.certainty ? "Not HIGH certainty" : "No auto-fix function"
        });
        return appliedFindings;
      }
    }, findingB.restoreFromBackup = function(contentT) {
      {
        const contentU = contentT + ".backup";
        if (!fileSystemA.existsSync(contentU)) return !1;
        transformContentB(contentU), transformContentB(contentT);
        const contentV = fileSystemA.readFileSync(contentU, "utf8");
        return transformContentB(contentT), fileSystemA.writeFileSync(contentT, contentV, "utf8"), 
        fileSystemA.unlinkSync(contentU), !0;
      }
    }, findingB.cleanupBackups = function(contentW) {
      {
        let contentX = 0;
        return function transformContentN(contentY) {
          let contentZ;
          try {
            {
              const tool = {
                withFileTypes: !0
              };
              contentZ = fileSystemA.readdirSync(contentY, tool);
            }
          } catch (errorE) {
            return;
          }
          for (const frontmatterE of contentZ) {
            const contentB = pathA.join(contentY, frontmatterE.name);
            if (frontmatterE.isDirectory()) transformContentN(contentB); else if (frontmatterE.isFile() && frontmatterE.name.endsWith(".backup")) try {
              fileSystemA.unlinkSync(contentB), contentX++;
            } catch (errorF) {
              console.error("[WARN] fixer error:", errorF.message);
            }
          }
        }(contentW), contentX;
      }
    }, findingB.assertNotSymlink = transformContentB, findingB.applyAtPath = updateSchemaPath, module.exports = findingB;
  }
});

const require_reporter = __commonJS({
  "../work/agent-sh__agentsys/lib/enhance/reporter.js"(_unusedExports, module) {
    function transformContentO(findingsC, contentD) {
      return findingsC.filter((findingO => findingO.certainty === contentD)).length;
    }
    function transformContentP(contentE) {
      {
        const lookupA = new Map;
        for (const findingP of contentE) {
          const contentF = [ findingP.file || "", findingP.line || 0, (findingP.issue || "").toLowerCase().trim() ].join("|");
          if (lookupA.has(contentF)) {
            const findingQ = lookupA.get(contentF);
            !findingQ.sources.includes(findingP.source) && findingQ.sources.push(findingP.source), 
            findingP.autoFixable && !findingQ.autoFixable && (findingQ.autoFixable = !0);
          } else {
            const contentG = {
              ...findingP
            };
            contentG.sources = [ findingP.source ], lookupA.set(contentF, contentG);
          }
        }
        return Array.from(lookupA.values());
      }
    }
    function transformContentQ(contentH) {
      {
        const contentI = {};
        for (const contentJ of contentH) {
          const contentK = contentJ.source || "unknown";
          contentI[contentK] || (contentI[contentK] = []);
          contentI[contentK].push(contentJ);
        }
        return contentI;
      }
    }
    function transformContentR(textContentD) {
      return textContentD ? textContentD.charAt(0).toUpperCase() + textContentD.slice(1) : "";
    }
    const contentL = {
      generateReport: function(analysisResult, contentM = {}) {
        {
          const {verbose: verbose = !1, compact: compact = !1} = contentM, transformC = findingsD => verbose ? findingsD : findingsD.filter((findingR => "LOW" !== findingR.certainty)), toolD = transformC(analysisResult.toolIssues || []), toolE = transformC(analysisResult.structureIssues || []), toolF = transformC(analysisResult.securityIssues || []), contentN = toolD.length + toolE.length + toolF.length;
          if (compact) return function(contentO, findingsE, findingsF, findingsG) {
            {
              const appliedFindingsA = [];
              appliedFindingsA.push("## " + contentO + ": " + (findingsE.length + findingsF.length + findingsG.length) + " issues"), 
              appliedFindingsA.push("");
              const toolG = [ ...findingsE.map((contentP => ({
                ...contentP,
                category: "Tool"
              }))), ...findingsF.map((contentQ => ({
                ...contentQ,
                category: "Structure"
              }))), ...findingsG.map((contentR => ({
                ...contentR,
                category: "Security"
              }))) ], contentS = {
                HIGH: 0,
                MEDIUM: 1,
                LOW: 2
              };
              toolG.sort(((findingS, findingT) => contentS[findingS.certainty] - contentS[findingT.certainty]));
              if (toolG.length > 0) {
                appliedFindingsA.push("| Category | Issue | Certainty |"), appliedFindingsA.push("|----------|-------|-----------|");
                for (const findingU of toolG) appliedFindingsA.push("| " + findingU.category + " | " + findingU.issue + " | " + findingU.certainty + " |");
              } else appliedFindingsA.push("No issues found.");
              return appliedFindingsA.join("\n");
            }
          }(analysisResult.pluginName, toolD, toolE, toolF);
          const appliedFindingsB = [];
          appliedFindingsB.push("## Plugin Analysis: " + analysisResult.pluginName), appliedFindingsB.push(""), 
          appliedFindingsB.push("**Analyzed**: " + (new Date).toISOString()), appliedFindingsB.push("**Files scanned**: " + (analysisResult.filesScanned || 0)), 
          appliedFindingsB.push(""), appliedFindingsB.push("### Summary"), appliedFindingsB.push("");
          const contentT = transformContentO([ ...toolD, ...toolE, ...toolF ], "HIGH"), contentU = transformContentO([ ...toolD, ...toolE, ...toolF ], "MEDIUM"), contentV = verbose ? transformContentO([ ...toolD, ...toolE, ...toolF ], "LOW") : 0;
          appliedFindingsB.push("| Certainty | Count |"), appliedFindingsB.push("|-----------|-------|"), 
          appliedFindingsB.push("| HIGH | " + contentT + " |"), appliedFindingsB.push("| MEDIUM | " + contentU + " |");
          verbose && appliedFindingsB.push("| LOW | " + contentV + " |");
          appliedFindingsB.push("| **Total** | **" + contentN + "** |"), appliedFindingsB.push("");
          if (toolD.length > 0) {
            appliedFindingsB.push("### Tool Definitions (" + toolD.length + " issues)"), appliedFindingsB.push(""), 
            appliedFindingsB.push("| Tool | Issue | Fix | Certainty |"), appliedFindingsB.push("|------|-------|-----|-----------|");
            for (const findingV of toolD) appliedFindingsB.push("| " + (findingV.tool || "-") + " | " + findingV.issue + " | " + (findingV.fix || "-") + " | " + findingV.certainty + " |");
            appliedFindingsB.push("");
          }
          if (toolE.length > 0) {
            appliedFindingsB.push("### Structure (" + toolE.length + " issues)"), appliedFindingsB.push(""), 
            appliedFindingsB.push("| File | Issue | Certainty |"), appliedFindingsB.push("|------|-------|-----------|");
            for (const findingW of toolE) appliedFindingsB.push("| " + (findingW.file || "-") + " | " + findingW.issue + " | " + findingW.certainty + " |");
            appliedFindingsB.push("");
          }
          if (toolF.length > 0) {
            appliedFindingsB.push("### Security (" + toolF.length + " issues)"), appliedFindingsB.push(""), 
            appliedFindingsB.push("| File | Line | Issue | Certainty |"), appliedFindingsB.push("|------|------|-------|-----------|");
            for (const findingX of toolF) appliedFindingsB.push("| " + (findingX.file || "-") + " | " + (findingX.line || "-") + " | " + findingX.issue + " | " + findingX.certainty + " |");
            appliedFindingsB.push("");
          }
          0 === contentN && (appliedFindingsB.push("No issues found."), appliedFindingsB.push(""));
          return appliedFindingsB.join("\n");
        }
      },
      generateDiff: function(toolH, toolI, contentW) {
        {
          const reportLinesD = [];
          reportLinesD.push("```diff"), reportLinesD.push("--- a/" + contentW), reportLinesD.push("+++ b/" + contentW);
          const toolJ = toolH.split("\n"), toolK = toolI.split("\n"), contentX = Math.max(toolJ.length, toolK.length);
          for (let contentY = 0; contentY < contentX; contentY++) {
            const contentZ = toolJ[contentY], toolA = toolK[contentY];
            if (contentZ === toolA) void 0 !== contentZ && reportLinesD.push(" " + contentZ); else {
              void 0 !== contentZ && reportLinesD.push("-" + contentZ);
              void 0 !== toolA && reportLinesD.push("+" + toolA);
            }
          }
          return reportLinesD.push("```"), reportLinesD.join("\n");
        }
      },
      generateSummaryReport: function(toolL, toolB = {}) {
        const reportLinesE = [];
        reportLinesE.push("# Plugin Analysis Summary"), reportLinesE.push("");
        reportLinesE.push("**Analyzed**: " + toolL.length + " plugins"), reportLinesE.push("**Date**: " + (new Date).toISOString()), 
        reportLinesE.push("");
        let toolC = 0, toolD = 0, toolE = 0;
        for (const analysisResultA of toolL) {
          const toolF = [ ...analysisResultA.toolIssues || [], ...analysisResultA.structureIssues || [], ...analysisResultA.securityIssues || [] ];
          toolC += transformContentO(toolF, "HIGH"), toolD += transformContentO(toolF, "MEDIUM"), 
          toolE += transformContentO(toolF, "LOW");
        }
        reportLinesE.push("## Overall"), reportLinesE.push(""), reportLinesE.push("| Certainty | Count |"), 
        reportLinesE.push("|-----------|-------|"), reportLinesE.push("| HIGH | " + toolC + " |"), 
        reportLinesE.push("| MEDIUM | " + toolD + " |");
        toolB.verbose && reportLinesE.push("| LOW | " + toolE + " |");
        reportLinesE.push(""), reportLinesE.push("## By Plugin"), reportLinesE.push(""), reportLinesE.push("| Plugin | HIGH | MEDIUM | LOW | Total |"), 
        reportLinesE.push("|--------|------|--------|-----|-------|");
        for (const analysisResultB of toolL) {
          const toolG = [ ...analysisResultB.toolIssues || [], ...analysisResultB.structureIssues || [], ...analysisResultB.securityIssues || [] ], toolH = transformContentO(toolG, "HIGH"), toolI = transformContentO(toolG, "MEDIUM"), toolJ = transformContentO(toolG, "LOW");
          reportLinesE.push("| " + analysisResultB.pluginName + " | " + toolH + " | " + toolI + " | " + toolJ + " | " + (toolH + toolI + toolJ) + " |");
        }
        return reportLinesE.push(""), reportLinesE.join("\n");
      },
      generateAgentReport: function(analysisResultC, toolK = {}) {
        {
          const appliedFindingsC = [];
          appliedFindingsC.push("# Agent Analysis: " + analysisResultC.agentName), appliedFindingsC.push(""), 
          appliedFindingsC.push("**File**: " + analysisResultC.agentPath), appliedFindingsC.push("**Analyzed**: " + (new Date).toISOString()), 
          appliedFindingsC.push("");
          const toolL = [ ...analysisResultC.structureIssues || [], ...analysisResultC.toolIssues || [], ...analysisResultC.xmlIssues || [], ...analysisResultC.cotIssues || [], ...analysisResultC.exampleIssues || [], ...analysisResultC.antiPatternIssues || [], ...analysisResultC.crossPlatformIssues || [] ], toolM = transformContentO(toolL, "HIGH"), toolN = transformContentO(toolL, "MEDIUM"), toolO = transformContentO(toolL, "LOW");
          appliedFindingsC.push("## Summary"), appliedFindingsC.push(""), appliedFindingsC.push("| Certainty | Count |"), 
          appliedFindingsC.push("|-----------|-------|"), appliedFindingsC.push("| HIGH | " + toolM + " |"), 
          appliedFindingsC.push("| MEDIUM | " + toolN + " |");
          toolK.verbose && appliedFindingsC.push("| LOW | " + toolO + " |");
          appliedFindingsC.push("");
          if (analysisResultC.structureIssues && analysisResultC.structureIssues.length > 0) {
            appliedFindingsC.push("### Structure Issues (" + analysisResultC.structureIssues.length + ")"), 
            appliedFindingsC.push(""), appliedFindingsC.push("| Issue | Fix | Certainty |"), appliedFindingsC.push("|-------|-----|-----------|");
            for (const findingY of analysisResultC.structureIssues) appliedFindingsC.push("| " + findingY.issue + " | " + (findingY.fix || "N/A") + " | " + findingY.certainty + " |");
            appliedFindingsC.push("");
          }
          if (analysisResultC.toolIssues && analysisResultC.toolIssues.length > 0) {
            appliedFindingsC.push("### Tool Issues (" + analysisResultC.toolIssues.length + ")"), appliedFindingsC.push(""), 
            appliedFindingsC.push("| Issue | Fix | Certainty |"), appliedFindingsC.push("|-------|-----|-----------|");
            for (const findingZ of analysisResultC.toolIssues) appliedFindingsC.push("| " + findingZ.issue + " | " + (findingZ.fix || "N/A") + " | " + findingZ.certainty + " |");
            appliedFindingsC.push("");
          }
          if (analysisResultC.xmlIssues && analysisResultC.xmlIssues.length > 0) {
            appliedFindingsC.push("### XML Structure Issues (" + analysisResultC.xmlIssues.length + ")"), 
            appliedFindingsC.push(""), appliedFindingsC.push("| Issue | Fix | Certainty |"), appliedFindingsC.push("|-------|-----|-----------|");
            for (const findingAA of analysisResultC.xmlIssues) appliedFindingsC.push("| " + findingAA.issue + " | " + (findingAA.fix || "N/A") + " | " + findingAA.certainty + " |");
            appliedFindingsC.push("");
          }
          if (analysisResultC.cotIssues && analysisResultC.cotIssues.length > 0) {
            appliedFindingsC.push("### Chain-of-Thought Issues (" + analysisResultC.cotIssues.length + ")"), 
            appliedFindingsC.push(""), appliedFindingsC.push("| Issue | Fix | Certainty |"), appliedFindingsC.push("|-------|-----|-----------|");
            for (const findingAB of analysisResultC.cotIssues) appliedFindingsC.push("| " + findingAB.issue + " | " + (findingAB.fix || "N/A") + " | " + findingAB.certainty + " |");
            appliedFindingsC.push("");
          }
          if (analysisResultC.exampleIssues && analysisResultC.exampleIssues.length > 0) {
            appliedFindingsC.push("### Example Issues (" + analysisResultC.exampleIssues.length + ")"), appliedFindingsC.push(""), 
            appliedFindingsC.push("| Issue | Fix | Certainty |"), appliedFindingsC.push("|-------|-----|-----------|");
            for (const findingAC of analysisResultC.exampleIssues) appliedFindingsC.push("| " + findingAC.issue + " | " + (findingAC.fix || "N/A") + " | " + findingAC.certainty + " |");
            appliedFindingsC.push("");
          }
          if (analysisResultC.antiPatternIssues && analysisResultC.antiPatternIssues.length > 0) {
            appliedFindingsC.push("### Anti-Pattern Issues (" + analysisResultC.antiPatternIssues.length + ")"), 
            appliedFindingsC.push(""), appliedFindingsC.push("| Issue | Fix | Certainty |"), appliedFindingsC.push("|-------|-----|-----------|");
            for (const findingAD of analysisResultC.antiPatternIssues) appliedFindingsC.push("| " + findingAD.issue + " | " + (findingAD.fix || "N/A") + " | " + findingAD.certainty + " |");
            appliedFindingsC.push("");
          }
          if (analysisResultC.crossPlatformIssues && analysisResultC.crossPlatformIssues.length > 0) {
            appliedFindingsC.push("### Cross-Platform Issues (" + analysisResultC.crossPlatformIssues.length + ")"), 
            appliedFindingsC.push(""), appliedFindingsC.push("| Issue | Fix | Certainty |"), appliedFindingsC.push("|-------|-----|-----------|");
            for (const findingAE of analysisResultC.crossPlatformIssues) appliedFindingsC.push("| " + findingAE.issue + " | " + (findingAE.fix || "N/A") + " | " + findingAE.certainty + " |");
            appliedFindingsC.push("");
          }
          return appliedFindingsC.join("\n");
        }
      },
      generateAgentSummaryReport: function(toolM, toolP = {}) {
        {
          const reportLinesF = [];
          reportLinesF.push("# Agent Analysis Summary"), reportLinesF.push(""), reportLinesF.push("**Analyzed**: " + toolM.length + " agents"), 
          reportLinesF.push("**Date**: " + (new Date).toISOString()), reportLinesF.push("");
          let toolQ = 0, toolR = 0, toolS = 0;
          for (const analysisResultD of toolM) {
            const toolT = [ ...analysisResultD.structureIssues || [], ...analysisResultD.toolIssues || [], ...analysisResultD.xmlIssues || [], ...analysisResultD.cotIssues || [], ...analysisResultD.exampleIssues || [], ...analysisResultD.antiPatternIssues || [], ...analysisResultD.crossPlatformIssues || [] ];
            toolQ += transformContentO(toolT, "HIGH"), toolR += transformContentO(toolT, "MEDIUM"), 
            toolS += transformContentO(toolT, "LOW");
          }
          reportLinesF.push("## Overall"), reportLinesF.push(""), reportLinesF.push("| Certainty | Count |"), 
          reportLinesF.push("|-----------|-------|"), reportLinesF.push("| HIGH | " + toolQ + " |"), 
          reportLinesF.push("| MEDIUM | " + toolR + " |");
          toolP.verbose && reportLinesF.push("| LOW | " + toolS + " |");
          reportLinesF.push(""), reportLinesF.push("## By Agent"), reportLinesF.push(""), reportLinesF.push("| Agent | HIGH | MEDIUM | LOW | Total |"), 
          reportLinesF.push("|-------|------|--------|-----|-------|");
          for (const analysisResultE of toolM) {
            const toolU = [ ...analysisResultE.structureIssues || [], ...analysisResultE.toolIssues || [], ...analysisResultE.xmlIssues || [], ...analysisResultE.cotIssues || [], ...analysisResultE.exampleIssues || [], ...analysisResultE.antiPatternIssues || [], ...analysisResultE.crossPlatformIssues || [] ], toolV = transformContentO(toolU, "HIGH"), toolW = transformContentO(toolU, "MEDIUM"), toolX = transformContentO(toolU, "LOW");
            reportLinesF.push("| " + analysisResultE.agentName + " | " + toolV + " | " + toolW + " | " + toolX + " | " + (toolV + toolW + toolX) + " |");
          }
          return reportLinesF.push(""), reportLinesF.join("\n");
        }
      },
      generateDocsReport: function(analysisResultF, toolY = {}) {
        {
          const appliedFindingsD = [];
          appliedFindingsD.push("# Documentation Analysis: " + analysisResultF.docName), appliedFindingsD.push(""), 
          appliedFindingsD.push("**File**: " + analysisResultF.docPath), appliedFindingsD.push("**Mode**: " + ("ai" === analysisResultF.mode ? "AI-only (RAG optimized)" : "Both audiences")), 
          appliedFindingsD.push("**Token Count**: ~" + analysisResultF.tokenCount), appliedFindingsD.push("**Analyzed**: " + (new Date).toISOString()), 
          appliedFindingsD.push("");
          const toolN = [ ...analysisResultF.linkIssues || [], ...analysisResultF.structureIssues || [], ...analysisResultF.codeIssues || [], ...analysisResultF.efficiencyIssues || [], ...analysisResultF.ragIssues || [], ...analysisResultF.balanceIssues || [] ], toolZ = transformContentO(toolN, "HIGH"), mediumCount = transformContentO(toolN, "MEDIUM"), lowCount = transformContentO(toolN, "LOW");
          appliedFindingsD.push("## Summary"), appliedFindingsD.push(""), appliedFindingsD.push("| Certainty | Count |"), 
          appliedFindingsD.push("|-----------|-------|"), appliedFindingsD.push("| HIGH | " + toolZ + " |"), 
          appliedFindingsD.push("| MEDIUM | " + mediumCount + " |");
          toolY.verbose && appliedFindingsD.push("| LOW | " + lowCount + " |");
          appliedFindingsD.push("");
          if (analysisResultF.linkIssues && analysisResultF.linkIssues.length > 0) {
            appliedFindingsD.push("### Link Issues (" + analysisResultF.linkIssues.length + ")"), appliedFindingsD.push(""), 
            appliedFindingsD.push("| Issue | Fix | Certainty |"), appliedFindingsD.push("|-------|-----|-----------|");
            for (const findingAF of analysisResultF.linkIssues) appliedFindingsD.push("| " + findingAF.issue + " | " + (findingAF.fix || "N/A") + " | " + findingAF.certainty + " |");
            appliedFindingsD.push("");
          }
          if (analysisResultF.structureIssues && analysisResultF.structureIssues.length > 0) {
            appliedFindingsD.push("### Structure Issues (" + analysisResultF.structureIssues.length + ")"), 
            appliedFindingsD.push(""), appliedFindingsD.push("| Issue | Fix | Certainty |"), appliedFindingsD.push("|-------|-----|-----------|");
            for (const findingAG of analysisResultF.structureIssues) appliedFindingsD.push("| " + findingAG.issue + " | " + (findingAG.fix || "N/A") + " | " + findingAG.certainty + " |");
            appliedFindingsD.push("");
          }
          if (analysisResultF.codeIssues && analysisResultF.codeIssues.length > 0) {
            appliedFindingsD.push("### Code Block Issues (" + analysisResultF.codeIssues.length + ")"), appliedFindingsD.push(""), 
            appliedFindingsD.push("| Issue | Fix | Certainty |"), appliedFindingsD.push("|-------|-----|-----------|");
            for (const findingAH of analysisResultF.codeIssues) appliedFindingsD.push("| " + findingAH.issue + " | " + (findingAH.fix || "N/A") + " | " + findingAH.certainty + " |");
            appliedFindingsD.push("");
          }
          if (analysisResultF.efficiencyIssues && analysisResultF.efficiencyIssues.length > 0) {
            appliedFindingsD.push("### Efficiency Issues (" + analysisResultF.efficiencyIssues.length + ")"), 
            appliedFindingsD.push(""), appliedFindingsD.push("| Issue | Fix | Certainty |"), appliedFindingsD.push("|-------|-----|-----------|");
            for (const findingAI of analysisResultF.efficiencyIssues) appliedFindingsD.push("| " + findingAI.issue + " | " + (findingAI.fix || "N/A") + " | " + findingAI.certainty + " |");
            appliedFindingsD.push("");
          }
          if (analysisResultF.ragIssues && analysisResultF.ragIssues.length > 0) {
            appliedFindingsD.push("### RAG Optimization Issues (" + analysisResultF.ragIssues.length + ")"), 
            appliedFindingsD.push(""), appliedFindingsD.push("| Issue | Fix | Certainty |"), appliedFindingsD.push("|-------|-----|-----------|");
            for (const findingAJ of analysisResultF.ragIssues) appliedFindingsD.push("| " + findingAJ.issue + " | " + (findingAJ.fix || "N/A") + " | " + findingAJ.certainty + " |");
            appliedFindingsD.push("");
          }
          if (analysisResultF.balanceIssues && analysisResultF.balanceIssues.length > 0) {
            appliedFindingsD.push("### Balance Suggestions (" + analysisResultF.balanceIssues.length + ")"), 
            appliedFindingsD.push(""), appliedFindingsD.push("| Issue | Fix | Certainty |"), appliedFindingsD.push("|-------|-----|-----------|");
            for (const findingAK of analysisResultF.balanceIssues) appliedFindingsD.push("| " + findingAK.issue + " | " + (findingAK.fix || "N/A") + " | " + findingAK.certainty + " |");
            appliedFindingsD.push("");
          }
          0 === toolN.length && (appliedFindingsD.push("No issues found."), appliedFindingsD.push(""));
          return appliedFindingsD.join("\n");
        }
      },
      generateDocsSummaryReport: function(toolO, result = {}) {
        {
          const reportLinesG = [], analysisMode = toolO[0]?.mode || "both";
          reportLinesG.push("# Documentation Analysis Summary"), reportLinesG.push(""), reportLinesG.push("**Analyzed**: " + toolO.length + " documents"), 
          reportLinesG.push("**Mode**: " + ("ai" === analysisMode ? "AI-only (RAG optimized)" : "Both audiences")), 
          reportLinesG.push("**Date**: " + (new Date).toISOString()), reportLinesG.push("");
          let index = 0, indexA = 0, indexB = 0, indexC = 0;
          for (const analysisResultG of toolO) {
            const itemsA = [ ...analysisResultG.linkIssues || [], ...analysisResultG.structureIssues || [], ...analysisResultG.codeIssues || [], ...analysisResultG.efficiencyIssues || [], ...analysisResultG.ragIssues || [], ...analysisResultG.balanceIssues || [] ];
            index += transformContentO(itemsA, "HIGH"), indexA += transformContentO(itemsA, "MEDIUM"), 
            indexB += transformContentO(itemsA, "LOW"), indexC += analysisResultG.tokenCount || 0;
          }
          reportLinesG.push("## Overall"), reportLinesG.push(""), reportLinesG.push("**Total Tokens**: ~" + indexC), 
          reportLinesG.push(""), reportLinesG.push("| Certainty | Count |"), reportLinesG.push("|-----------|-------|"), 
          reportLinesG.push("| HIGH | " + index + " |"), reportLinesG.push("| MEDIUM | " + indexA + " |");
          result.verbose && reportLinesG.push("| LOW | " + indexB + " |");
          reportLinesG.push(""), reportLinesG.push("## By Document"), reportLinesG.push(""), reportLinesG.push("| Document | Tokens | HIGH | MEDIUM | LOW | Total |"), 
          reportLinesG.push("|----------|--------|------|--------|-----|-------|");
          for (const analysisResultH of toolO) {
            const itemsB = [ ...analysisResultH.linkIssues || [], ...analysisResultH.structureIssues || [], ...analysisResultH.codeIssues || [], ...analysisResultH.efficiencyIssues || [], ...analysisResultH.ragIssues || [], ...analysisResultH.balanceIssues || [] ], highCount = transformContentO(itemsB, "HIGH"), mediumCount = transformContentO(itemsB, "MEDIUM"), lowCount = transformContentO(itemsB, "LOW");
            reportLinesG.push("| " + analysisResultH.docName + " | " + analysisResultH.tokenCount + " | " + highCount + " | " + mediumCount + " | " + lowCount + " | " + (highCount + mediumCount + lowCount) + " |");
          }
          return reportLinesG.push(""), reportLinesG.join("\n");
        }
      },
      generateProjectMemoryReport: function(analysisResultI, resultA = {}) {
        const appliedFindingsE = [];
        if (analysisResultI.error) {
          appliedFindingsE.push("# Project Memory Analysis: Error"), appliedFindingsE.push(""), appliedFindingsE.push("**Error**: " + analysisResultI.error), 
          appliedFindingsE.push("");
          if (analysisResultI.searchedPaths) {
            appliedFindingsE.push("Searched paths:");
            for (const itemB of analysisResultI.searchedPaths) appliedFindingsE.push("- " + itemB);
          }
          return appliedFindingsE.join("\n");
        }
        appliedFindingsE.push("# Project Memory Analysis: " + analysisResultI.fileName), appliedFindingsE.push(""), 
        appliedFindingsE.push("**File**: " + analysisResultI.filePath), appliedFindingsE.push("**Type**: " + ("agents" === analysisResultI.fileType ? "AGENTS.md (cross-platform)" : "CLAUDE.md")), 
        appliedFindingsE.push("**Analyzed**: " + (new Date).toISOString()), appliedFindingsE.push("");
        if (analysisResultI.metrics) {
          const metrics = analysisResultI.metrics;
          appliedFindingsE.push("## Metrics", "", "| Metric | Value |", "|--------|-------|");
          appliedFindingsE.push("| Estimated Tokens | " + metrics.estimatedTokens + " |");
          appliedFindingsE.push("| Characters | " + metrics.characterCount + " |");
          appliedFindingsE.push("| Lines | " + metrics.lineCount + " |");
          appliedFindingsE.push("| Words | " + metrics.wordCount + " |");
          void 0 !== metrics.readmeOverlap && appliedFindingsE.push("| README Overlap | " + Math.round(100 * metrics.readmeOverlap) + "% |");
          appliedFindingsE.push("");
        }
        const toolP = [ ...analysisResultI.structureIssues || [], ...analysisResultI.referenceIssues || [], ...analysisResultI.efficiencyIssues || [], ...analysisResultI.qualityIssues || [], ...analysisResultI.crossPlatformIssues || [] ], highCount = transformContentO(toolP, "HIGH"), mediumCount = transformContentO(toolP, "MEDIUM"), lowCount = transformContentO(toolP, "LOW");
        appliedFindingsE.push("## Summary"), appliedFindingsE.push(""), appliedFindingsE.push("| Certainty | Count |"), 
        appliedFindingsE.push("|-----------|-------|"), appliedFindingsE.push("| HIGH | " + highCount + " |"), 
        appliedFindingsE.push("| MEDIUM | " + mediumCount + " |");
        resultA.verbose && appliedFindingsE.push("| LOW | " + lowCount + " |");
        appliedFindingsE.push("| **Total** | **" + toolP.length + "** |"), appliedFindingsE.push("");
        if (analysisResultI.structureIssues && analysisResultI.structureIssues.length > 0) {
          appliedFindingsE.push("### Structure Issues (" + analysisResultI.structureIssues.length + ")"), 
          appliedFindingsE.push(""), appliedFindingsE.push("| Issue | Fix | Certainty |"), appliedFindingsE.push("|-------|-----|-----------|");
          for (const findingAL of analysisResultI.structureIssues) appliedFindingsE.push("| " + findingAL.issue + " | " + (findingAL.fix || "N/A") + " | " + findingAL.certainty + " |");
          appliedFindingsE.push("");
        }
        if (analysisResultI.referenceIssues && analysisResultI.referenceIssues.length > 0) {
          appliedFindingsE.push("### Reference Issues (" + analysisResultI.referenceIssues.length + ")"), 
          appliedFindingsE.push(""), appliedFindingsE.push("| Issue | Fix | Certainty |"), appliedFindingsE.push("|-------|-----|-----------|");
          for (const findingAM of analysisResultI.referenceIssues) appliedFindingsE.push("| " + findingAM.issue + " | " + (findingAM.fix || "N/A") + " | " + findingAM.certainty + " |");
          appliedFindingsE.push("");
        }
        if (analysisResultI.efficiencyIssues && analysisResultI.efficiencyIssues.length > 0) {
          appliedFindingsE.push("### Efficiency Issues (" + analysisResultI.efficiencyIssues.length + ")"), 
          appliedFindingsE.push(""), appliedFindingsE.push("| Issue | Fix | Certainty |"), appliedFindingsE.push("|-------|-----|-----------|");
          for (const findingAN of analysisResultI.efficiencyIssues) appliedFindingsE.push("| " + findingAN.issue + " | " + (findingAN.fix || "N/A") + " | " + findingAN.certainty + " |");
          appliedFindingsE.push("");
        }
        if (analysisResultI.qualityIssues && analysisResultI.qualityIssues.length > 0) {
          appliedFindingsE.push("### Quality Issues (" + analysisResultI.qualityIssues.length + ")"), appliedFindingsE.push(""), 
          appliedFindingsE.push("| Issue | Fix | Certainty |"), appliedFindingsE.push("|-------|-----|-----------|");
          for (const findingAO of analysisResultI.qualityIssues) appliedFindingsE.push("| " + findingAO.issue + " | " + (findingAO.fix || "N/A") + " | " + findingAO.certainty + " |");
          appliedFindingsE.push("");
        }
        if (analysisResultI.crossPlatformIssues && analysisResultI.crossPlatformIssues.length > 0) {
          appliedFindingsE.push("### Cross-Platform Issues (" + analysisResultI.crossPlatformIssues.length + ")"), 
          appliedFindingsE.push(""), appliedFindingsE.push("| Issue | Fix | Certainty |"), appliedFindingsE.push("|-------|-----|-----------|");
          for (const findingAP of analysisResultI.crossPlatformIssues) appliedFindingsE.push("| " + findingAP.issue + " | " + (findingAP.fix || "N/A") + " | " + findingAP.certainty + " |");
          appliedFindingsE.push("");
        }
        0 === toolP.length && (appliedFindingsE.push("No issues found."), appliedFindingsE.push(""));
        return appliedFindingsE.join("\n");
      },
      generateProjectMemorySummaryReport: function(toolQ, resultB = {}) {
        {
          const appliedFindingsF = [];
          appliedFindingsF.push("# Project Memory Analysis Summary"), appliedFindingsF.push(""), appliedFindingsF.push("**Analyzed**: " + toolQ.length + " files"), 
          appliedFindingsF.push("**Date**: " + (new Date).toISOString()), appliedFindingsF.push("");
          let indexD = 0, indexE = 0, indexF = 0, indexG = 0;
          for (const analysisResultJ of toolQ) {
            if (analysisResultJ.error) continue;
            const itemsC = [ ...analysisResultJ.structureIssues || [], ...analysisResultJ.referenceIssues || [], ...analysisResultJ.efficiencyIssues || [], ...analysisResultJ.qualityIssues || [], ...analysisResultJ.crossPlatformIssues || [] ];
            indexD += transformContentO(itemsC, "HIGH"), indexE += transformContentO(itemsC, "MEDIUM"), 
            indexF += transformContentO(itemsC, "LOW");
            analysisResultJ.metrics && (indexG += analysisResultJ.metrics.estimatedTokens || 0);
          }
          appliedFindingsF.push("## Overall"), appliedFindingsF.push(""), appliedFindingsF.push("| Metric | Value |"), 
          appliedFindingsF.push("|--------|-------|"), appliedFindingsF.push("| Total Tokens | " + indexG + " |"), 
          appliedFindingsF.push("| HIGH Issues | " + indexD + " |"), appliedFindingsF.push("| MEDIUM Issues | " + indexE + " |");
          resultB.verbose && appliedFindingsF.push("| LOW Issues | " + indexF + " |");
          appliedFindingsF.push(""), appliedFindingsF.push("## By File"), appliedFindingsF.push(""), appliedFindingsF.push("| File | Tokens | HIGH | MEDIUM | LOW | Total |"), 
          appliedFindingsF.push("|------|--------|------|--------|-----|-------|");
          for (const analysisResultK of toolQ) {
            if (analysisResultK.error) {
              appliedFindingsF.push("| " + (analysisResultK.filePath || "Unknown") + " | - | Error | - | - | - |");
              continue;
            }
            const itemsD = [ ...analysisResultK.structureIssues || [], ...analysisResultK.referenceIssues || [], ...analysisResultK.efficiencyIssues || [], ...analysisResultK.qualityIssues || [], ...analysisResultK.crossPlatformIssues || [] ], highCount = transformContentO(itemsD, "HIGH"), mediumCount = transformContentO(itemsD, "MEDIUM"), lowCount = transformContentO(itemsD, "LOW"), estimatedTokens = analysisResultK.metrics?.estimatedTokens || "-";
            appliedFindingsF.push("| " + analysisResultK.fileName + " | " + estimatedTokens + " | " + highCount + " | " + mediumCount + " | " + lowCount + " | " + (highCount + mediumCount + lowCount) + " |");
          }
          return appliedFindingsF.push(""), appliedFindingsF.join("\n");
        }
      },
      generatePromptReport: function(analysisResultL, resultC = {}) {
        const appliedFindingsG = [];
        appliedFindingsG.push("# Prompt Analysis: " + analysisResultL.promptName), appliedFindingsG.push(""), 
        appliedFindingsG.push("**File**: " + analysisResultL.promptPath), appliedFindingsG.push("**Type**: " + (analysisResultL.promptType || "unknown")), 
        appliedFindingsG.push("**Token Count**: ~" + analysisResultL.tokenCount), appliedFindingsG.push("**Analyzed**: " + (new Date).toISOString()), 
        appliedFindingsG.push("");
        const toolR = [ ...analysisResultL.clarityIssues || [], ...analysisResultL.structureIssues || [], ...analysisResultL.exampleIssues || [], ...analysisResultL.contextIssues || [], ...analysisResultL.outputIssues || [], ...analysisResultL.antiPatternIssues || [], ...analysisResultL.codeValidationIssues || [] ], highCount = transformContentO(toolR, "HIGH"), mediumCount = transformContentO(toolR, "MEDIUM"), lowCount = transformContentO(toolR, "LOW");
        appliedFindingsG.push("## Summary");
        appliedFindingsG.push(""), appliedFindingsG.push("| Certainty | Count |"), appliedFindingsG.push("|-----------|-------|"), 
        appliedFindingsG.push("| HIGH | " + highCount + " |"), appliedFindingsG.push("| MEDIUM | " + mediumCount + " |");
        resultC.verbose && appliedFindingsG.push("| LOW | " + lowCount + " |");
        appliedFindingsG.push("");
        if (analysisResultL.clarityIssues && analysisResultL.clarityIssues.length > 0) {
          appliedFindingsG.push("### Clarity Issues (" + analysisResultL.clarityIssues.length + ")"), appliedFindingsG.push(""), 
          appliedFindingsG.push("| Issue | Fix | Certainty |"), appliedFindingsG.push("|-------|-----|-----------|");
          for (const findingAQ of analysisResultL.clarityIssues) appliedFindingsG.push("| " + findingAQ.issue + " | " + (findingAQ.fix || "N/A") + " | " + findingAQ.certainty + " |");
          appliedFindingsG.push("");
        }
        if (analysisResultL.structureIssues && analysisResultL.structureIssues.length > 0) {
          appliedFindingsG.push("### Structure Issues (" + analysisResultL.structureIssues.length + ")"), 
          appliedFindingsG.push(""), appliedFindingsG.push("| Issue | Fix | Certainty |"), appliedFindingsG.push("|-------|-----|-----------|");
          for (const findingAR of analysisResultL.structureIssues) appliedFindingsG.push("| " + findingAR.issue + " | " + (findingAR.fix || "N/A") + " | " + findingAR.certainty + " |");
          appliedFindingsG.push("");
        }
        if (analysisResultL.exampleIssues && analysisResultL.exampleIssues.length > 0) {
          appliedFindingsG.push("### Example Issues (" + analysisResultL.exampleIssues.length + ")"), appliedFindingsG.push(""), 
          appliedFindingsG.push("| Issue | Fix | Certainty |"), appliedFindingsG.push("|-------|-----|-----------|");
          for (const findingAS of analysisResultL.exampleIssues) appliedFindingsG.push("| " + findingAS.issue + " | " + (findingAS.fix || "N/A") + " | " + findingAS.certainty + " |");
          appliedFindingsG.push("");
        }
        if (analysisResultL.contextIssues && analysisResultL.contextIssues.length > 0) {
          appliedFindingsG.push("### Context Issues (" + analysisResultL.contextIssues.length + ")"), appliedFindingsG.push(""), 
          appliedFindingsG.push("| Issue | Fix | Certainty |"), appliedFindingsG.push("|-------|-----|-----------|");
          for (const findingAT of analysisResultL.contextIssues) appliedFindingsG.push("| " + findingAT.issue + " | " + (findingAT.fix || "N/A") + " | " + findingAT.certainty + " |");
          appliedFindingsG.push("");
        }
        if (analysisResultL.outputIssues && analysisResultL.outputIssues.length > 0) {
          appliedFindingsG.push("### Output Format Issues (" + analysisResultL.outputIssues.length + ")"), 
          appliedFindingsG.push(""), appliedFindingsG.push("| Issue | Fix | Certainty |"), appliedFindingsG.push("|-------|-----|-----------|");
          for (const findingAU of analysisResultL.outputIssues) appliedFindingsG.push("| " + findingAU.issue + " | " + (findingAU.fix || "N/A") + " | " + findingAU.certainty + " |");
          appliedFindingsG.push("");
        }
        if (analysisResultL.antiPatternIssues && analysisResultL.antiPatternIssues.length > 0) {
          appliedFindingsG.push("### Anti-Pattern Issues (" + analysisResultL.antiPatternIssues.length + ")"), 
          appliedFindingsG.push(""), appliedFindingsG.push("| Issue | Fix | Certainty |"), appliedFindingsG.push("|-------|-----|-----------|");
          for (const findingAV of analysisResultL.antiPatternIssues) appliedFindingsG.push("| " + findingAV.issue + " | " + (findingAV.fix || "N/A") + " | " + findingAV.certainty + " |");
          appliedFindingsG.push("");
        }
        if (analysisResultL.codeValidationIssues && analysisResultL.codeValidationIssues.length > 0) {
          appliedFindingsG.push("### Code Validation Issues (" + analysisResultL.codeValidationIssues.length + ")"), 
          appliedFindingsG.push(""), appliedFindingsG.push("| Issue | Fix | Certainty |"), appliedFindingsG.push("|-------|-----|-----------|");
          for (const findingAW of analysisResultL.codeValidationIssues) appliedFindingsG.push("| " + findingAW.issue + " | " + (findingAW.fix || "N/A") + " | " + findingAW.certainty + " |");
          appliedFindingsG.push("");
        }
        0 === toolR.length && (appliedFindingsG.push("No issues found."), appliedFindingsG.push(""));
        return appliedFindingsG.join("\n");
      },
      generatePromptSummaryReport: function(toolS, resultD = {}) {
        {
          const reportLinesH = [];
          reportLinesH.push("# Prompt Analysis Summary"), reportLinesH.push(""), reportLinesH.push("**Analyzed**: " + toolS.length + " prompts"), 
          reportLinesH.push("**Date**: " + (new Date).toISOString()), reportLinesH.push("");
          let indexH = 0, indexI = 0, indexJ = 0, indexK = 0;
          for (const analysisResultM of toolS) {
            const itemsE = [ ...analysisResultM.clarityIssues || [], ...analysisResultM.structureIssues || [], ...analysisResultM.exampleIssues || [], ...analysisResultM.contextIssues || [], ...analysisResultM.outputIssues || [], ...analysisResultM.antiPatternIssues || [], ...analysisResultM.codeValidationIssues || [] ];
            indexH += transformContentO(itemsE, "HIGH"), indexI += transformContentO(itemsE, "MEDIUM"), 
            indexJ += transformContentO(itemsE, "LOW"), indexK += analysisResultM.tokenCount || 0;
          }
          reportLinesH.push("## Overall"), reportLinesH.push(""), reportLinesH.push("**Total Tokens**: ~" + indexK), 
          reportLinesH.push(""), reportLinesH.push("| Certainty | Count |"), reportLinesH.push("|-----------|-------|"), 
          reportLinesH.push("| HIGH | " + indexH + " |"), reportLinesH.push("| MEDIUM | " + indexI + " |");
          resultD.verbose && reportLinesH.push("| LOW | " + indexJ + " |");
          reportLinesH.push(""), reportLinesH.push("## By Prompt"), reportLinesH.push(""), reportLinesH.push("| Prompt | Type | Tokens | HIGH | MEDIUM | LOW | Total |"), 
          reportLinesH.push("|--------|------|--------|------|--------|-----|-------|");
          for (const analysisResultN of toolS) {
            const itemsF = [ ...analysisResultN.clarityIssues || [], ...analysisResultN.structureIssues || [], ...analysisResultN.exampleIssues || [], ...analysisResultN.contextIssues || [], ...analysisResultN.outputIssues || [], ...analysisResultN.antiPatternIssues || [], ...analysisResultN.codeValidationIssues || [] ], highCount = transformContentO(itemsF, "HIGH"), mediumCount = transformContentO(itemsF, "MEDIUM"), lowCount = transformContentO(itemsF, "LOW");
            reportLinesH.push("| " + analysisResultN.promptName + " | " + (analysisResultN.promptType || "-") + " | " + analysisResultN.tokenCount + " | " + highCount + " | " + mediumCount + " | " + lowCount + " | " + (highCount + mediumCount + lowCount) + " |");
          }
          return reportLinesH.push(""), reportLinesH.join("\n");
        }
      },
      generateOrchestratorReport: function(entries, resultE = {}) {
        {
          const {verbose: verbose = !1, showAutoFixable: showAutoFixable = !1, targetPath: targetPath = "."} = resultE, appliedFindingsH = [];
          appliedFindingsH.push("# Enhancement Analysis Report"), appliedFindingsH.push(""), appliedFindingsH.push("**Target**: " + targetPath), 
          appliedFindingsH.push("**Analyzed**: " + (new Date).toISOString()), appliedFindingsH.push("**Enhancers Run**: " + (Object.keys(entries?.byEnhancer || {}).join(", ") || "none")), 
          appliedFindingsH.push("");
          const findingsH = transformContentP(Array.isArray(entries?.findings) ? entries.findings : []), autoFixableCount = findingsH.filter((findingAX => "HIGH" === findingAX.certainty && findingAX.autoFixable)).length;
          appliedFindingsH.push("## Executive Summary"), appliedFindingsH.push(""), appliedFindingsH.push("| Enhancer | HIGH | MEDIUM | LOW | Auto-Fixable |"), 
          appliedFindingsH.push("|----------|------|--------|-----|--------------|");
          const itemsG = [ "plugin", "agent", "claudemd", "docs", "prompt", "hooks", "skills" ];
          let indexL = 0, indexM = 0, indexN = 0, indexO = 0;
          for (const itemC of itemsG) {
            const findingsI = findingsH.filter((finding => finding.source === itemC)), sourceHighCount = findingsI.filter((findingAY => "HIGH" === findingAY.certainty)).length, sourceMediumCount = findingsI.filter((findingAZ => "MEDIUM" === findingAZ.certainty)).length, sourceLowCount = findingsI.filter((findingBA => "LOW" === findingBA.certainty)).length, sourceAutoFixableCount = findingsI.filter((findingBB => "HIGH" === findingBB.certainty && findingBB.autoFixable)).length;
            if (sourceHighCount > 0 || sourceMediumCount > 0 || sourceLowCount > 0) {
              appliedFindingsH.push("| " + itemC + " | " + sourceHighCount + " | " + sourceMediumCount + " | " + sourceLowCount + " | " + sourceAutoFixableCount + " |");
              indexL += sourceHighCount;
              indexM += sourceMediumCount;
              indexN += sourceLowCount;
              indexO += sourceAutoFixableCount;
            }
          }
          appliedFindingsH.push("| **Total** | **" + indexL + "** | **" + indexM + "** | **" + indexN + "** | **" + indexO + "** |"), 
          appliedFindingsH.push("");
          if (resultE.autoLearned && resultE.autoLearned.length > 0) {
            appliedFindingsH.push("## Auto-Learned Suppressions"), appliedFindingsH.push(""), appliedFindingsH.push("Learned " + resultE.autoLearned.length + " new false positives:"), 
            appliedFindingsH.push("");
            const agentPatternsA = {};
            resultE.autoLearned.forEach((findingBC => {
              !agentPatternsA[findingBC.patternId] && (agentPatternsA[findingBC.patternId] = []), agentPatternsA[findingBC.patternId].push(findingBC);
            }));
            for (const [keyA, findingsJ] of Object.entries(agentPatternsA)) {
              const countA = Math.max(...findingsJ.map((finding => finding.confidence || 0)));
              appliedFindingsH.push("- **" + keyA + "**: " + findingsJ.length + " file(s) (confidence: " + (100 * countA).toFixed(0) + "%)");
            }
            appliedFindingsH.push("");
          }
          if (findingsH.length === 0) {
            appliedFindingsH.push("## Status: Clean", "", "No issues found.", "");
            return appliedFindingsH.join("\n");
          }
          appliedFindingsH.push("---"), appliedFindingsH.push("");
          const toolT = findingsH.filter((findingBD => "HIGH" === findingBD.certainty));
          if (toolT.length > 0) {
            appliedFindingsH.push("## HIGH Certainty Issues (" + toolT.length + ")"), appliedFindingsH.push(""), 
            appliedFindingsH.push("Issues that should be fixed. Auto-fixable issues marked with [AF]."), 
            appliedFindingsH.push("");
            const agentPatternsB = transformContentQ(toolT);
            for (const [keyB, toolU] of Object.entries(agentPatternsB)) {
              appliedFindingsH.push("### " + transformContentR(keyB) + " Issues (" + toolU.length + ")"), 
              appliedFindingsH.push(""), appliedFindingsH.push("| File | Line | Issue | Fix | [AF] |"), appliedFindingsH.push("|------|------|-------|-----|------|");
              for (const findingBE of toolU) {
                const autoFixLabel = findingBE.autoFixable ? "Yes" : "No", lineNumber = findingBE.line || "-";
                appliedFindingsH.push("| " + (findingBE.file || "-") + " | " + lineNumber + " | " + findingBE.issue + " | " + (findingBE.fix || "-") + " | " + autoFixLabel + " |");
              }
              appliedFindingsH.push("");
            }
            appliedFindingsH.push("---"), appliedFindingsH.push("");
          }
          const toolV = findingsH.filter((findingBF => "MEDIUM" === findingBF.certainty));
          if (toolV.length > 0) {
            appliedFindingsH.push("## MEDIUM Certainty Issues (" + toolV.length + ")"), appliedFindingsH.push(""), 
            appliedFindingsH.push("Issues that likely need attention. Verify context before fixing."), 
            appliedFindingsH.push("");
            const agentPatternsC = transformContentQ(toolV);
            for (const [keyC, toolW] of Object.entries(agentPatternsC)) {
              appliedFindingsH.push("### " + transformContentR(keyC) + " Issues (" + toolW.length + ")"), 
              appliedFindingsH.push(""), appliedFindingsH.push("| File | Line | Issue | Fix |"), appliedFindingsH.push("|------|------|-------|-----|");
              for (const findingBG of toolW) {
                const lineNumber = findingBG.line || "-";
                appliedFindingsH.push("| " + (findingBG.file || "-") + " | " + lineNumber + " | " + findingBG.issue + " | " + (findingBG.fix || "-") + " |");
              }
              appliedFindingsH.push("");
            }
            appliedFindingsH.push("---"), appliedFindingsH.push("");
          }
          const toolX = findingsH.filter((findingBH => "LOW" === findingBH.certainty));
          if (verbose && toolX.length > 0) {
            appliedFindingsH.push("## LOW Certainty Issues (" + toolX.length + ")"), appliedFindingsH.push(""), 
            appliedFindingsH.push("Advisory suggestions. Consider based on project needs."), appliedFindingsH.push("");
            const agentPatternsD = transformContentQ(toolX);
            for (const [keyD, toolY] of Object.entries(agentPatternsD)) {
              appliedFindingsH.push("### " + transformContentR(keyD) + " Issues (" + toolY.length + ")"), 
              appliedFindingsH.push(""), appliedFindingsH.push("| File | Line | Issue | Fix |"), appliedFindingsH.push("|------|------|-------|-----|");
              for (const findingBI of toolY) {
                const lineNumber = findingBI.line || "-";
                appliedFindingsH.push("| " + (findingBI.file || "-") + " | " + lineNumber + " | " + findingBI.issue + " | " + (findingBI.fix || "-") + " |");
              }
              appliedFindingsH.push("");
            }
            appliedFindingsH.push("---"), appliedFindingsH.push("");
          }
          if (showAutoFixable && autoFixableCount > 0) {
            appliedFindingsH.push("## Auto-Fix Summary"), appliedFindingsH.push(""), appliedFindingsH.push("**" + autoFixableCount + " issues can be automatically fixed** with `--apply` flag:"), 
            appliedFindingsH.push(""), appliedFindingsH.push("| Enhancer | Issue Type | Count |"), appliedFindingsH.push("|----------|------------|-------|");
            const autoFixableFindings = findingsH.filter((findingBJ => "HIGH" === findingBJ.certainty && findingBJ.autoFixable)), agentPatternsE = {};
            for (const patternB of autoFixableFindings) {
              const groupKey = patternB.source + "|" + (patternB.category || "general");
              if (!agentPatternsE[groupKey]) {
                const patternC = {};
                patternC.source = patternB.source, patternC.category = patternB.category || "general", 
                patternC.count = 0, agentPatternsE[groupKey] = patternC;
              }
              agentPatternsE[groupKey].count++;
            }
            for (const patternD of Object.values(agentPatternsE)) appliedFindingsH.push("| " + patternD.source + " | " + patternD.category + " | " + patternD.count + " |");
            appliedFindingsH.push("| **Total** | | **" + autoFixableCount + "** |"), appliedFindingsH.push(""), appliedFindingsH.push("Run `/enhance --apply` to fix these automatically."), 
            appliedFindingsH.push("");
          }
          return appliedFindingsH.join("\n");
        }
      }
    };
    contentL.deduplicateOrchestratorFindings = transformContentP;
    module.exports = contentL;
  }
});

const fs = require("fs");
const path = require("path");
const { agentPatterns } = require_agent_patterns();

function parseMarkdownFrontmatter(content) {
  if (!content || "string" != typeof content) return {
    frontmatter: null,
    body: content
  };
  const trimmedContent = content.trim();
  if (!trimmedContent.startsWith("---")) return {
    frontmatter: null,
    body: content
  };
  const lines = trimmedContent.split("\n"), delimiterIndex = lines.findIndex(((line, index) => index > 0 && "---" === line.trim()));
  if (-1 === delimiterIndex) return {
    frontmatter: null,
    body: content
  };
  const frontmatter = {};
  for (const line of lines.slice(1, delimiterIndex)) {
    const colonIndex = line.indexOf(":");
    colonIndex > 0 && (frontmatter[line.slice(0, colonIndex).trim()] = line.slice(colonIndex + 1).trim());
  }
  return {
    frontmatter: frontmatter,
    body: lines.slice(delimiterIndex + 1).join("\n")
  };
}

function analyzeAgent(agentPath, options = {}) {
  const analysis = {
    agentName: path.basename(agentPath, ".md"),
    agentPath,
    frontmatter: null,
    structureIssues: [],
    toolIssues: [],
    xmlIssues: [],
    cotIssues: [],
    exampleIssues: [],
    antiPatternIssues: [],
    crossPlatformIssues: []
  };

  function addIssue(target, pattern, issue, autoFixable = false) {
    if (!issue) return;
    target.push({
      ...issue,
      file: agentPath,
      ...(autoFixable ? { filePath: agentPath } : {}),
      certainty: pattern.certainty,
      patternId: pattern.id
    });
  }

  if (!fs.existsSync(agentPath)) {
    analysis.structureIssues.push({
      issue: "File not found",
      file: agentPath,
      certainty: "HIGH",
      patternId: "file_not_found"
    });
    return analysis;
  }

  let content;
  try {
    content = fs.readFileSync(agentPath, "utf8");
  } catch (error) {
    analysis.structureIssues.push({
      issue: "Failed to read file: " + error.message,
      file: agentPath,
      certainty: "HIGH",
      patternId: "read_error"
    });
    return analysis;
  }

  const { frontmatter } = parseMarkdownFrontmatter(content);
  analysis.frontmatter = frontmatter;

  const missingFrontmatter = agentPatterns.missing_frontmatter;
  addIssue(analysis.structureIssues, missingFrontmatter, missingFrontmatter.check(content));

  if (frontmatter) {
    const missingName = agentPatterns.missing_name;
    const missingDescription = agentPatterns.missing_description;
    const unrestrictedTools = agentPatterns.unrestricted_tools;
    const unrestrictedBash = agentPatterns.unrestricted_bash;
    addIssue(analysis.structureIssues, missingName, missingName.check(frontmatter));
    addIssue(analysis.structureIssues, missingDescription, missingDescription.check(frontmatter));
    addIssue(analysis.toolIssues, unrestrictedTools, unrestrictedTools.check(frontmatter));
    addIssue(analysis.toolIssues, unrestrictedBash, unrestrictedBash.check(frontmatter), true);
  }

  const missingRole = agentPatterns.missing_role;
  addIssue(analysis.structureIssues, missingRole, missingRole.check(content), true);

  const checks = [
    ["missing_output_format", analysis.structureIssues],
    ["missing_constraints", analysis.structureIssues],
    ["missing_xml_structure", analysis.xmlIssues],
    ["unnecessary_cot", analysis.cotIssues],
    ["missing_cot", analysis.cotIssues],
    ["vague_instructions", analysis.antiPatternIssues]
  ];
  for (const [patternId, target] of checks) {
    const pattern = agentPatterns[patternId];
    const issue = pattern.check(content);
    if (issue && (options.verbose || pattern.certainty !== "LOW")) addIssue(target, pattern, issue);
  }

  if (options.verbose) {
    const exampleCount = agentPatterns.example_count_suboptimal;
    const promptBloat = agentPatterns.prompt_bloat;
    addIssue(analysis.exampleIssues, exampleCount, exampleCount.check(content));
    addIssue(analysis.antiPatternIssues, promptBloat, promptBloat.check(content));
  }

  for (const patternId of ["hardcoded_claude_dir", "claude_md_reference", "no_xml_for_data"]) {
    const pattern = agentPatterns[patternId];
    if (!pattern) continue;
    const issue = pattern.check(content);
    if (issue && (options.verbose || pattern.certainty !== "LOW")) {
      addIssue(analysis.crossPlatformIssues, pattern, issue);
    }
  }

  return analysis;
}

function analyzeAllAgents(agentsDirectory, options = {}) {
  const results = [];
  if (!fs.existsSync(agentsDirectory)) return results;
  const agentFiles = fs.readdirSync(agentsDirectory).filter((fileName => fileName.endsWith(".md") && "README.md" !== fileName));
  for (const fileName of agentFiles) {
    const result = analyzeAgent(path.join(agentsDirectory, fileName), options);
    results.push(result);
  }
  return results;
}

function analyze(options = {}) {
  const {agent: agentName, agentsDir: agentsDir = "plugins/enhance/agents", verbose: verbose = !1} = options;
  if (agentName) {
    const fileName = agentName.endsWith(".md") ? agentName : agentName + ".md";
    return analyzeAgent(path.join(agentsDir, fileName), {
      verbose: verbose
    });
  }
  return analyzeAllAgents(agentsDir, {
    verbose: verbose
  });
}

function collectAgentFindings(analysis) {
  return [ ...analysis.structureIssues || [], ...analysis.toolIssues || [], ...analysis.xmlIssues || [], ...analysis.cotIssues || [], ...analysis.exampleIssues || [], ...analysis.antiPatternIssues || [], ...analysis.crossPlatformIssues || [] ];
}

function applyFixes(analysisResults, options = {}) {
  const analyses = Array.isArray(analysisResults) ? analysisResults : [ analysisResults ];
  return require_fixer().applyFixes(analyses.flatMap(collectAgentFindings), options);
}

function generateReport(analysisResults, options = {}) {
  const reporter = require_reporter();
  return Array.isArray(analysisResults) ? reporter.generateAgentSummaryReport(analysisResults, options) : reporter.generateAgentReport(analysisResults, options);
}

module.exports = {
  parseMarkdownFrontmatter: parseMarkdownFrontmatter,
  analyzeAgent: analyzeAgent,
  analyzeAllAgents: analyzeAllAgents,
  analyze: analyze,
  applyFixes: applyFixes,
  generateReport: generateReport
};

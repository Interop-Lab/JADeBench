var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/agent-sh__agentsys/lib/enhance/agent-patterns.js
var require_agent_patterns = __commonJS({
  "../work/agent-sh__agentsys/lib/enhance/agent-patterns.js"(exports2, module2) {
    /**
     * Agent Prompt Patterns
     * Detection patterns for agent prompt engineering best practices
     *
     * @author Avi Fenesh
     * @license MIT
     */
    var agentPatterns2 = {
      /**
       * Missing YAML frontmatter
       * HIGH certainty - always fixable
       */
      missing_frontmatter: {
        id: "missing_frontmatter",
        category: "structure",
        certainty: "HIGH",
        autoFix: true,
        description: "Agent prompt missing YAML frontmatter (---...---)",
        check: (content) => {
          if (!content || typeof content !== "string") return null;
          const hasFrontmatter = content.trim().startsWith("---");
          if (!hasFrontmatter) {
            return {
              issue: "Missing YAML frontmatter",
              fix: "Add frontmatter with name, description, tools, model"
            };
          }
          return null;
        }
      },
      /**
       * Missing name field in frontmatter
       * HIGH certainty - requires manual fix (name is context-dependent)
       */
      missing_name: {
        id: "missing_name",
        category: "structure",
        certainty: "HIGH",
        autoFix: false,
        description: 'Frontmatter missing "name" field',
        check: (frontmatter) => {
          if (!frontmatter || typeof frontmatter !== "object") return null;
          if (!frontmatter.name || typeof frontmatter.name === "string" && frontmatter.name.trim() === "") {
            return {
              issue: 'Frontmatter missing "name" field',
              fix: 'Add "name" field to frontmatter'
            };
          }
          return null;
        }
      },
      /**
       * Missing description field in frontmatter
       * HIGH certainty - requires manual fix (description is context-dependent)
       */
      missing_description: {
        id: "missing_description",
        category: "structure",
        certainty: "HIGH",
        autoFix: false,
        description: 'Frontmatter missing "description" field',
        check: (frontmatter) => {
          if (!frontmatter || typeof frontmatter !== "object") return null;
          if (!frontmatter.description || typeof frontmatter.description === "string" && frontmatter.description.trim() === "") {
            return {
              issue: 'Frontmatter missing "description" field',
              fix: 'Add "description" field to frontmatter'
            };
          }
          return null;
        }
      },
      /**
       * Missing role section
       * HIGH certainty - should have clear role definition
       */
      missing_role: {
        id: "missing_role",
        category: "structure",
        certainty: "HIGH",
        autoFix: true,
        description: 'No role section ("You are..." or "## Role")',
        check: (content) => {
          if (!content || typeof content !== "string") return null;
          const hasYouAre = /you are/i.test(content);
          const hasYouPerform = /you (?:perform|handle|execute|do|manage|coordinate|analyze|review|create|design|implement|validate|update|check|monitor)/i.test(content);
          const hasRoleSection = /##\s+(?:your\s+)?role|\*\*(?:your\s+)?role\*\*/i.test(content);
          if (!hasYouAre && !hasYouPerform && !hasRoleSection) {
            return {
              issue: "Missing role definition",
              fix: "Add role section explaining agent purpose"
            };
          }
          return null;
        }
      },
      /**
       * Missing output format specification
       * HIGH certainty - agents should specify output format
       */
      missing_output_format: {
        id: "missing_output_format",
        category: "structure",
        certainty: "HIGH",
        autoFix: false,
        description: "No output format specification",
        check: (content) => {
          if (!content || typeof content !== "string") return null;
          const hasOutputFormat = /##\s+output\s+format/i.test(content);
          const hasFormatSection = /##\s+format/i.test(content);
          const hasResponseFormat = /##\s+response/i.test(content);
          if (!hasOutputFormat && !hasFormatSection && !hasResponseFormat) {
            return {
              issue: "Missing output format specification",
              fix: "Add section specifying expected output format"
            };
          }
          return null;
        }
      },
      /**
       * Missing constraints section
       * HIGH certainty - agents should have clear constraints
       */
      missing_constraints: {
        id: "missing_constraints",
        category: "structure",
        certainty: "HIGH",
        autoFix: false,
        description: "No constraints section",
        check: (content) => {
          if (!content || typeof content !== "string") return null;
          const hasConstraints = /#{2,3}\s+constraints/i.test(content);
          const hasDontSection = /#{2,3}\s+(?:what\s+)?(?:this\s+agent\s+)?(?:you\s+)?(?:must\s+)?not\s+do/i.test(content);
          const hasRulesSection = /#{2,3}\s+rules/i.test(content);
          const hasWorkflowGates = /#{2,3}\s+workflow\s+gates/i.test(content);
          if (!hasConstraints && !hasDontSection && !hasRulesSection && !hasWorkflowGates) {
            return {
              issue: "Missing constraints section",
              fix: "Add section defining agent limitations and boundaries"
            };
          }
          return null;
        }
      },
      /**
       * Unrestricted tools in frontmatter
       * HIGH certainty - no tools field means all tools allowed
       */
      unrestricted_tools: {
        id: "unrestricted_tools",
        category: "tool",
        certainty: "HIGH",
        autoFix: false,
        description: 'No "tools" field in frontmatter (all tools allowed)',
        check: (frontmatter) => {
          if (!frontmatter || typeof frontmatter !== "object") return null;
          if (!frontmatter.tools) {
            return {
              issue: "No tools restriction - agent has access to all tools",
              fix: 'Add "tools" field to frontmatter with specific tools needed'
            };
          }
          return null;
        }
      },
      /**
       * Unrestricted Bash tool
       * HIGH certainty - Bash without restrictions is dangerous
       */
      unrestricted_bash: {
        id: "unrestricted_bash",
        category: "tool",
        certainty: "HIGH",
        autoFix: true,
        description: 'Has "Bash" without restrictions (should be "Bash(git:*)" etc)',
        check: (frontmatter) => {
          if (!frontmatter || typeof frontmatter !== "object") return null;
          if (frontmatter.tools) {
            const toolsArray = Array.isArray(frontmatter.tools) ? frontmatter.tools : frontmatter.tools.split(",").map((t) => t.trim());
            const hasUnrestrictedBash = toolsArray.some(
              (t) => t === "Bash" || t === "bash"
            );
            if (hasUnrestrictedBash) {
              return {
                issue: "Unrestricted Bash access",
                fix: 'Replace "Bash" with "Bash(git:*)" or specific scope'
              };
            }
          }
          return null;
        }
      },
      /**
       * Missing XML structure for complex data
       * MEDIUM certainty - beneficial for structured prompts
       */
      missing_xml_structure: {
        id: "missing_xml_structure",
        category: "xml",
        certainty: "MEDIUM",
        autoFix: false,
        description: "Could benefit from XML tags for structure",
        check: (content) => {
          if (!content || typeof content !== "string") return null;
          const sectionCount = (content.match(/##\s+/g) || []).length;
          const hasLists = /^\s*[-*]\s+/m.test(content);
          const hasCodeBlocks = /```/g.test(content);
          if (sectionCount >= 5 || hasLists && hasCodeBlocks) {
            const hasXML = /<\w+>/.test(content);
            if (!hasXML) {
              return {
                issue: "Complex prompt without XML structure",
                fix: "Consider using XML tags for key sections (e.g., <rules>, <examples>)"
              };
            }
          }
          return null;
        }
      },
      /**
       * Unnecessary step-by-step reasoning
       * MEDIUM certainty - step-by-step on simple tasks
       */
      unnecessary_cot: {
        id: "unnecessary_cot",
        category: "cot",
        certainty: "MEDIUM",
        autoFix: false,
        description: "Step-by-step reasoning on simple tasks",
        check: (content) => {
          if (!content || typeof content !== "string") return null;
          const hasStepByStep = /step[- ]by[- ]step/i.test(content);
          const hasThinkingTags = /<thinking>/i.test(content);
          const wordCount = content.split(/\s+/).length;
          const sectionCount = (content.match(/##\s+/g) || []).length;
          if ((hasStepByStep || hasThinkingTags) && wordCount < 500 && sectionCount < 4) {
            return {
              issue: "Unnecessary chain-of-thought for simple task",
              fix: "Remove step-by-step instructions for straightforward operations"
            };
          }
          return null;
        }
      },
      /**
       * Missing chain-of-thought for complex reasoning
       * MEDIUM certainty - complex tasks benefit from CoT
       */
      missing_cot: {
        id: "missing_cot",
        category: "cot",
        certainty: "MEDIUM",
        autoFix: false,
        description: "Complex reasoning without thinking guidance",
        check: (content) => {
          if (!content || typeof content !== "string") return null;
          const wordCount = content.split(/\s+/).length;
          const sectionCount = (content.match(/##\s+/g) || []).length;
          const hasAnalysis = /analy[sz]e|evaluate|assess|review/i.test(content);
          const hasStepByStep = /step[- ]by[- ]step/i.test(content);
          const hasThinkingTags = /<thinking>/i.test(content);
          const hasReasoningGuidance = /reasoning|think\s+through/i.test(content);
          if (wordCount > 1e3 && sectionCount >= 5 && hasAnalysis) {
            if (!hasStepByStep && !hasThinkingTags && !hasReasoningGuidance) {
              return {
                issue: "Complex task without reasoning guidance",
                fix: "Add chain-of-thought instructions or <thinking> tags"
              };
            }
          }
          return null;
        }
      },
      /**
       * Suboptimal example count
       * LOW certainty - 2-5 examples is generally optimal
       */
      example_count_suboptimal: {
        id: "example_count_suboptimal",
        category: "example",
        certainty: "LOW",
        autoFix: false,
        description: "Not 2-5 examples",
        check: (content) => {
          if (!content || typeof content !== "string") return null;
          const exampleCount = (content.match(/##\s+example/gi) || []).length;
          const goodExample = (content.match(/<good[- ]?example>/gi) || []).length;
          const badExample = (content.match(/<bad[- ]?example>/gi) || []).length;
          const totalExamples = exampleCount + goodExample + badExample;
          if (totalExamples > 0 && (totalExamples < 2 || totalExamples > 5)) {
            return {
              issue: `Found ${totalExamples} examples (optimal: 2-5)`,
              fix: totalExamples < 2 ? "Consider adding more examples for clarity" : "Consider reducing examples to avoid token bloat"
            };
          }
          return null;
        }
      },
      /**
       * Vague instructions
       * MEDIUM certainty - fuzzy language reduces effectiveness
       */
      vague_instructions: {
        id: "vague_instructions",
        category: "anti-pattern",
        certainty: "MEDIUM",
        autoFix: false,
        description: 'Fuzzy language like "usually", "sometimes"',
        check: (content) => {
          if (!content || typeof content !== "string") return null;
          const vagueWords = [
            "usually",
            "sometimes",
            "often",
            "rarely",
            "maybe",
            "might",
            "could",
            "should probably",
            "try to",
            "as much as possible",
            "if possible"
          ];
          const found = [];
          for (const word of vagueWords) {
            const regex = new RegExp(`\\b${word}\\b`, "gi");
            if (regex.test(content)) {
              found.push(word);
            }
          }
          if (found.length > 3) {
            return {
              issue: `Found vague language: ${found.slice(0, 3).join(", ")}...`,
              fix: "Replace fuzzy language with clear, definitive instructions"
            };
          }
          return null;
        }
      },
      /**
       * Prompt bloat
       * LOW certainty - long prompts use more tokens
       */
      prompt_bloat: {
        id: "prompt_bloat",
        category: "anti-pattern",
        certainty: "LOW",
        autoFix: false,
        description: "Token count > 2000",
        maxTokens: 2e3,
        check: (content) => {
          if (!content || typeof content !== "string") return null;
          const estimatedTokens = Math.ceil(content.length / 4);
          if (estimatedTokens > 2e3) {
            return {
              issue: `Prompt ~${estimatedTokens} tokens (max recommended: 2000)`,
              fix: "Simplify prompt, remove redundant sections, or use XML for compression"
            };
          }
          return null;
        }
      },
      // ============================================
      // CROSS-PLATFORM COMPATIBILITY PATTERNS
      // ============================================
      /**
       * Hardcoded .claude/ state directory
       * HIGH certainty - breaks OpenCode/Codex
       */
      hardcoded_claude_dir: {
        id: "hardcoded_claude_dir",
        category: "cross-platform",
        certainty: "HIGH",
        autoFix: false,
        description: "Hardcoded .claude/ directory (breaks OpenCode/Codex)",
        check: (content) => {
          if (!content || typeof content !== "string") return null;
          const hasHardcoded = /\.claude\//.test(content);
          let usesEnvVar = /AI_STATE_DIR/i.test(content);
          if (!usesEnvVar) {
            for (const m of content.matchAll(/\$\{([^}]{0,1000})\}/g)) {
              if (/STATE/i.test(m[1])) {
                usesEnvVar = true;
                break;
              }
            }
          }
          if (hasHardcoded && !usesEnvVar) {
            return {
              issue: "Hardcoded .claude/ directory path",
              fix: "Use AI_STATE_DIR env var or platform detection for cross-platform support"
            };
          }
          return null;
        }
      },
      /**
       * CLAUDE.md reference without AGENTS.md
       * MEDIUM certainty - OpenCode/Codex use AGENTS.md
       */
      claude_md_reference: {
        id: "claude_md_reference",
        category: "cross-platform",
        certainty: "MEDIUM",
        autoFix: false,
        description: "References CLAUDE.md without also checking AGENTS.md",
        check: (content) => {
          if (!content || typeof content !== "string") return null;
          const hasClaudeMd = /CLAUDE\.md/i.test(content);
          const hasAgentsMd = /AGENTS\.md/i.test(content);
          if (hasClaudeMd && !hasAgentsMd) {
            return {
              issue: "References CLAUDE.md without AGENTS.md",
              fix: "Also check for AGENTS.md (used by OpenCode/Codex)"
            };
          }
          return null;
        }
      },
      /**
       * Missing XML for cross-model compatibility
       * LOW certainty - XML helps both Claude and GPT-4
       */
      no_xml_for_data: {
        id: "no_xml_for_data",
        category: "cross-platform",
        certainty: "LOW",
        autoFix: false,
        description: "Data blocks without XML tags (helps both Claude and GPT-4)",
        check: (content) => {
          if (!content || typeof content !== "string") return null;
          const hasCodeBlocks = /```[\s\S]+?```/.test(content);
          const hasLists = /^[-*]\s{1,1000}[^\n]{1,2000}$/m.test(content);
          const hasXML = /<\w+>[\s\S]{0,50000}?<\/\w+>/.test(content);
          const sectionCount = (content.match(/^##\s+/gm) || []).length;
          if ((hasCodeBlocks || hasLists) && sectionCount >= 4 && !hasXML) {
            return {
              issue: "Complex content without XML tags",
              fix: "Wrap data blocks in XML tags (e.g., <context>, <rules>) for cross-model compatibility"
            };
          }
          return null;
        }
      }
    };
    function getAllPatterns() {
      return agentPatterns2;
    }
    function getPatternsByCertainty(certainty) {
      const result = {};
      for (const [name, pattern] of Object.entries(agentPatterns2)) {
        if (pattern.certainty === certainty) {
          result[name] = pattern;
        }
      }
      return result;
    }
    function getPatternsByCategory(category) {
      const result = {};
      for (const [name, pattern] of Object.entries(agentPatterns2)) {
        if (pattern.category === category) {
          result[name] = pattern;
        }
      }
      return result;
    }
    function getAutoFixablePatterns() {
      const result = {};
      for (const [name, pattern] of Object.entries(agentPatterns2)) {
        if (pattern.autoFix) {
          result[name] = pattern;
        }
      }
      return result;
    }
    module2.exports = {
      agentPatterns: agentPatterns2,
      getAllPatterns,
      getPatternsByCertainty,
      getPatternsByCategory,
      getAutoFixablePatterns
    };
  }
});

// ../work/agent-sh__agentsys/lib/utils/atomic-write.js
var require_atomic_write = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/atomic-write.js"(exports2, module2) {
    var fs2 = require("fs");
    var path2 = require("path");
    var crypto = require("crypto");
    function getTempPath(targetPath) {
      const dir = path2.dirname(targetPath);
      const basename = path2.basename(targetPath);
      const randomSuffix = crypto.randomBytes(6).toString("hex");
      return path2.join(dir, `.${basename}.${randomSuffix}.tmp`);
    }
    function writeFileAtomic(filePath, content, options = {}) {
      const { encoding = "utf8", mode = 420 } = options;
      const dir = path2.dirname(filePath);
      if (!fs2.existsSync(dir)) {
        fs2.mkdirSync(dir, { recursive: true });
      }
      const tempPath = getTempPath(filePath);
      try {
        fs2.writeFileSync(tempPath, content, { encoding, mode });
        fs2.renameSync(tempPath, filePath);
        return true;
      } catch (error) {
        try {
          if (fs2.existsSync(tempPath)) {
            fs2.unlinkSync(tempPath);
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

// ../work/agent-sh__agentsys/lib/enhance/fixer.js
var require_fixer = __commonJS({
  "../work/agent-sh__agentsys/lib/enhance/fixer.js"(exports2, module2) {
    /**
     * Plugin Analysis Fixer
     * @author Avi Fenesh
     * @license MIT
     */
    var fs2 = require("fs");
    var path2 = require("path");
    var { writeFileAtomic } = require_atomic_write();
    function assertNotSymlink(targetPath) {
      let stat;
      try {
        stat = fs2.lstatSync(targetPath);
      } catch (err) {
        if (err.code === "ENOENT") return;
        throw err;
      }
      if (stat.isSymbolicLink()) {
        const err = new Error("target is a symlink; refusing to follow");
        err.code = "ESYMLINK_REFUSED";
        throw err;
      }
    }
    function applyFixes2(issues, options = {}) {
      const { dryRun = false, backup = true } = options;
      const results = {
        applied: [],
        skipped: [],
        errors: []
      };
      const markdownAutoFixPatternIds = [
        // Agent patterns
        "missing_frontmatter",
        "unrestricted_bash",
        "missing_role",
        // Prompt patterns
        "missing_output_format",
        "missing_examples",
        "missing_xml_structure",
        "missing_verification_criteria",
        "aggressive_emphasis",
        // Skill patterns
        "missing_trigger_phrase"
      ];
      const fixableIssues = issues.filter(
        (i) => i.certainty === "HIGH" && (i.filePath || i.file) && (i.autoFixFn || markdownAutoFixPatternIds.includes(i.patternId))
      );
      const byFile = /* @__PURE__ */ new Map();
      for (const issue of fixableIssues) {
        const fp = issue.filePath || issue.file;
        if (!byFile.has(fp)) {
          byFile.set(fp, []);
        }
        byFile.get(fp).push(issue);
      }
      for (const [filePath, fileIssues] of byFile) {
        try {
          if (!fs2.existsSync(filePath)) {
            results.errors.push({ filePath, error: "File not found" });
            continue;
          }
          try {
            assertNotSymlink(filePath);
          } catch (err) {
            if (err.code === "ESYMLINK_REFUSED") {
              results.errors.push({
                filePath,
                error: err.message,
                success: false,
                reason: "target is a symlink; refusing to follow"
              });
              continue;
            }
            throw err;
          }
          const content = fs2.readFileSync(filePath, "utf8");
          let data;
          if (filePath.endsWith(".json")) {
            data = JSON.parse(content);
          } else if (filePath.endsWith(".md")) {
            data = content;
          } else {
            results.skipped.push(...fileIssues.map((i) => ({
              ...i,
              reason: "Unsupported file type - manual fix required"
            })));
            continue;
          }
          let modified = data;
          const appliedToFile = [];
          for (const issue of fileIssues) {
            try {
              if (filePath.endsWith(".md")) {
                if (issue.patternId === "missing_frontmatter") {
                  modified = fixMissingFrontmatter(modified);
                } else if (issue.patternId === "unrestricted_bash") {
                  modified = fixUnrestrictedBash(modified);
                } else if (issue.patternId === "missing_role") {
                  modified = fixMissingRole(modified);
                } else if (issue.patternId === "missing_output_format") {
                  modified = fixMissingOutputFormat(modified);
                } else if (issue.patternId === "missing_examples") {
                  modified = fixMissingExamples(modified);
                } else if (issue.patternId === "missing_xml_structure") {
                  modified = fixMissingXmlStructure(modified);
                } else if (issue.patternId === "missing_verification_criteria") {
                  modified = fixMissingVerificationCriteria(modified);
                } else if (issue.patternId === "aggressive_emphasis") {
                  modified = fixAggressiveEmphasis(modified);
                } else if (issue.patternId === "missing_trigger_phrase") {
                  modified = fixMissingTriggerPhrase(modified);
                } else {
                  continue;
                }
              } else if (issue.schemaPath) {
                modified = applyAtPath(modified, issue.schemaPath, issue.autoFixFn);
              } else {
                modified = issue.autoFixFn(modified);
              }
              appliedToFile.push({
                issue: issue.issue,
                fix: issue.fix,
                filePath
              });
            } catch (err) {
              results.errors.push({
                issue: issue.issue,
                filePath,
                error: err.message
              });
            }
          }
          if (!dryRun && appliedToFile.length > 0) {
            if (backup) {
              const backupPath = `${filePath}.backup`;
              assertNotSymlink(backupPath);
              fs2.writeFileSync(backupPath, content, "utf8");
            }
            let newContent;
            if (filePath.endsWith(".md")) {
              newContent = modified;
            } else {
              newContent = JSON.stringify(modified, null, 2);
            }
            assertNotSymlink(filePath);
            writeFileAtomic(filePath, newContent);
          }
          results.applied.push(...appliedToFile);
        } catch (err) {
          results.errors.push({
            filePath,
            error: err.message
          });
        }
      }
      const nonFixable = issues.filter(
        (i) => i.certainty !== "HIGH" || !markdownAutoFixPatternIds.includes(i.patternId)
      );
      results.skipped.push(...nonFixable.map((i) => ({
        ...i,
        reason: i.certainty !== "HIGH" ? "Not HIGH certainty" : "No auto-fix available for this pattern"
      })));
      return results;
    }
    function isSafeKey(key) {
      return key !== "__proto__" && key !== "constructor" && key !== "prototype";
    }
    function applyAtPath(obj, pathStr, fixFn) {
      const parts = pathStr.split(".");
      const result = structuredClone(obj);
      let current = result;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (part.includes("[")) {
          const match = part.match(/^((?!__proto__|constructor|prototype)[a-zA-Z_]\w*)\[(\d{1,10})\]$/);
          if (match && match[1] !== "__proto__" && match[1] !== "constructor" && match[1] !== "prototype") {
            current = current[match[1]][parseInt(match[2], 10)];
          }
        } else {
          if (!isSafeKey(part)) return result;
          current = current[part];
        }
      }
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes("[")) {
        const match = lastPart.match(/^((?!__proto__|constructor|prototype)[a-zA-Z_]\w*)\[(\d{1,10})\]$/);
        if (match && match[1] !== "__proto__" && match[1] !== "constructor" && match[1] !== "prototype") {
          const key = match[1];
          const idx = parseInt(match[2], 10);
          current[key][idx] = fixFn(current[key][idx]);
        }
      } else if (lastPart !== "__proto__" && lastPart !== "constructor" && lastPart !== "prototype") {
        current[lastPart] = fixFn(current[lastPart]);
      }
      return result;
    }
    function fixAdditionalProperties(schema) {
      if (!schema || typeof schema !== "object") return schema;
      const fixed = { ...schema };
      if (fixed.type === "object" && fixed.properties) {
        fixed.additionalProperties = false;
      }
      if (fixed.properties) {
        fixed.properties = {};
        for (const [key, value] of Object.entries(schema.properties)) {
          fixed.properties[key] = fixAdditionalProperties(value);
        }
      }
      return fixed;
    }
    function fixRequiredFields(schema) {
      if (!schema || typeof schema !== "object") return schema;
      const fixed = { ...schema };
      if (fixed.type === "object" && fixed.properties && !fixed.required) {
        fixed.required = Object.entries(fixed.properties).filter(([_, prop]) => {
          if (prop.default !== void 0) return false;
          if (prop.description && /optional/i.test(prop.description)) return false;
          return true;
        }).map(([key]) => key);
      }
      return fixed;
    }
    function fixVersionMismatch(pluginJson, targetVersion) {
      return {
        ...pluginJson,
        version: targetVersion
      };
    }
    function previewFixes(issues) {
      const previews = [];
      for (const issue of issues) {
        if (issue.certainty === "HIGH" && issue.autoFixFn) {
          previews.push({
            filePath: issue.filePath,
            issue: issue.issue,
            fix: issue.fix,
            willApply: true
          });
        } else {
          previews.push({
            filePath: issue.filePath,
            issue: issue.issue,
            fix: issue.fix || "No auto-fix available",
            willApply: false,
            reason: issue.certainty !== "HIGH" ? "Not HIGH certainty" : "No auto-fix function"
          });
        }
      }
      return previews;
    }
    function restoreFromBackup(filePath) {
      const backupPath = `${filePath}.backup`;
      if (!fs2.existsSync(backupPath)) {
        return false;
      }
      assertNotSymlink(backupPath);
      assertNotSymlink(filePath);
      const backupContent = fs2.readFileSync(backupPath, "utf8");
      assertNotSymlink(filePath);
      fs2.writeFileSync(filePath, backupContent, "utf8");
      fs2.unlinkSync(backupPath);
      return true;
    }
    function cleanupBackups(directory) {
      let count = 0;
      function findBackups(dir) {
        let entries;
        try {
          entries = fs2.readdirSync(dir, { withFileTypes: true });
        } catch (err) {
          return;
        }
        for (const entry of entries) {
          const fullPath = path2.join(dir, entry.name);
          if (entry.isDirectory()) {
            findBackups(fullPath);
          } else if (entry.isFile() && entry.name.endsWith(".backup")) {
            try {
              fs2.unlinkSync(fullPath);
              count++;
            } catch (err) {
              console.error("[WARN] fixer error:", err.message);
            }
          }
        }
      }
      findBackups(directory);
      return count;
    }
    function fixMissingFrontmatter(content) {
      if (!content || typeof content !== "string") return content;
      const template = `---
name: agent-name
description: Agent description
tools: Read, Glob, Grep
model: sonnet
---

`;
      return template + content.trim();
    }
    function fixUnrestrictedBash(content) {
      if (!content || typeof content !== "string") return content;
      const lines = content.split("\n");
      let inFrontmatter = false;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === "---") {
          if (!inFrontmatter) {
            inFrontmatter = true;
          } else {
            break;
          }
        } else if (inFrontmatter && lines[i].startsWith("tools:")) {
          lines[i] = lines[i].replace(/\bBash\b(?!\()/g, "Bash(git:*)");
        }
      }
      return lines.join("\n");
    }
    function fixMissingRole(content) {
      if (!content || typeof content !== "string") return content;
      const lines = content.split("\n");
      let frontmatterEnd = -1;
      let inFrontmatter = false;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === "---") {
          if (!inFrontmatter) {
            inFrontmatter = true;
          } else {
            frontmatterEnd = i;
            break;
          }
        }
      }
      const roleSection = `
## Your Role

You are an agent that [describe agent purpose].
`;
      if (frontmatterEnd >= 0) {
        lines.splice(frontmatterEnd + 1, 0, roleSection);
      } else {
        lines.unshift(roleSection);
      }
      return lines.join("\n");
    }
    function fixInconsistentHeadings(content) {
      if (!content || typeof content !== "string") return content;
      const lines = content.split("\n");
      let lastLevel = 0;
      let inCodeBlock = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith("```")) {
          inCodeBlock = !inCodeBlock;
          continue;
        }
        if (inCodeBlock) continue;
        const headingMatch = line.match(/^(#{1,6})[ \t]+(\S.*)$/);
        if (headingMatch) {
          const currentLevel = headingMatch[1].length;
          const headingText = headingMatch[2];
          if (lastLevel === 0) {
            lastLevel = currentLevel;
            continue;
          }
          if (currentLevel > lastLevel + 1) {
            const fixedLevel = lastLevel + 1;
            lines[i] = "#".repeat(fixedLevel) + " " + headingText;
            lastLevel = fixedLevel;
          } else {
            lastLevel = currentLevel;
          }
        }
      }
      return lines.join("\n");
    }
    function fixVerboseExplanations(content) {
      if (!content || typeof content !== "string") return content;
      const replacements = [
        { from: /\bin order to\b/gi, to: "to" },
        { from: /\bfor the purpose of\b/gi, to: "for" },
        { from: /\bin the event that\b/gi, to: "if" },
        { from: /\bat this point in time\b/gi, to: "now" },
        { from: /\bdue to the fact that\b/gi, to: "because" },
        { from: /\bhas the ability to\b/gi, to: "can" },
        { from: /\bis able to\b/gi, to: "can" },
        { from: /\bmake use of\b/gi, to: "use" },
        { from: /\ba large number of\b/gi, to: "many" },
        { from: /\ba small number of\b/gi, to: "few" },
        { from: /\bthe majority of\b/gi, to: "most" },
        { from: /\bprior to\b/gi, to: "before" },
        { from: /\bsubsequent to\b/gi, to: "after" }
      ];
      let result = content;
      const codeBlockRegex = /```[\s\S]*?```/g;
      const codeBlocks = [];
      let placeholder = 0;
      result = result.replace(codeBlockRegex, (match) => {
        codeBlocks.push(match);
        return `__CODE_BLOCK_${placeholder++}__`;
      });
      for (const { from, to } of replacements) {
        result = result.replace(from, (match) => {
          if (match[0] === match[0].toUpperCase()) {
            return to[0].toUpperCase() + to.slice(1);
          }
          return to;
        });
      }
      for (let i = 0; i < codeBlocks.length; i++) {
        result = result.replace(`__CODE_BLOCK_${i}__`, codeBlocks[i]);
      }
      return result;
    }
    function fixMissingOutputFormat(content) {
      if (!content || typeof content !== "string") return content;
      if (/##\s*output\s*format/i.test(content) || /<output_format>/i.test(content)) {
        return content;
      }
      const outputSection = `

## Output Format

Respond with:
- [Describe expected format: JSON, markdown, plain text, etc.]
- [Include any specific structure requirements]
`;
      return content.trim() + outputSection;
    }
    function fixMissingExamples(content) {
      if (!content || typeof content !== "string") return content;
      if (/<example>|##\s*example/i.test(content)) {
        return content;
      }
      const exampleSection = `

## Examples

<good-example>
Input: [example input]
Output: [example output]
</good-example>

<bad-example>
Input: [example input]
Output: [what NOT to do]
Why bad: [explanation]
</bad-example>
`;
      return content.trim() + exampleSection;
    }
    function wrapSection(text, headingPattern, tagName) {
      const lines = text.split("\n");
      let sectionStart = -1;
      for (let i = 0; i < lines.length; i++) {
        if (sectionStart === -1) {
          if (headingPattern.test(lines[i])) {
            sectionStart = i;
          }
        } else {
          if (/^#{1,6}\s/.test(lines[i]) || /^---/.test(lines[i])) {
            const before = lines.slice(0, sectionStart);
            const section = lines.slice(sectionStart, i);
            const after = lines.slice(i);
            return [...before, `<${tagName}>`, ...section, `</${tagName}>`, ...after].join("\n");
          }
        }
      }
      if (sectionStart !== -1) {
        const before = lines.slice(0, sectionStart);
        const section = lines.slice(sectionStart);
        return [...before, `<${tagName}>`, ...section, `</${tagName}>`].join("\n");
      }
      return text;
    }
    function fixMissingXmlStructure(content) {
      if (!content || typeof content !== "string") return content;
      if (/<[a-z_][a-z0-9_-]*>/i.test(content)) {
        return content;
      }
      let result = content;
      result = wrapSection(result, /^##[ \t]*(?:your[ \t]+)?role[ \t]*$/im, "role");
      result = wrapSection(result, /^##[ \t]*(?:constraints?|rules?)[ \t]*$/im, "constraints");
      return result;
    }
    function fixMissingVerificationCriteria(content) {
      if (!content || typeof content !== "string") return content;
      if (/\bverif|test|validate|expected\s+output/i.test(content)) {
        return content;
      }
      const verificationSection = `

## Verification

After completing this task:
- [ ] Run relevant tests to verify the change works
- [ ] Check for regressions in related functionality
- [ ] Verify expected output matches: [describe expected result]
`;
      return content.trim() + verificationSection;
    }
    function fixMissingTriggerPhrase(content) {
      if (!content || typeof content !== "string") return content;
      const lines = content.split("\n");
      let inFrontmatter = false;
      let descriptionLineIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === "---") {
          if (!inFrontmatter) {
            inFrontmatter = true;
          } else {
            break;
          }
        } else if (inFrontmatter && lines[i].startsWith("description:")) {
          descriptionLineIndex = i;
          break;
        }
      }
      if (descriptionLineIndex >= 0) {
        const descLine = lines[descriptionLineIndex];
        if (!/use when user asks/i.test(descLine)) {
          const match = descLine.match(/^description:[ \t]*(\S.*)$/);
          if (match) {
            const currentDesc = match[1].trim();
            lines[descriptionLineIndex] = `description: Use when user asks to ${currentDesc.toLowerCase().replace(/^to\s+/i, "")}`;
          }
        }
      }
      return lines.join("\n");
    }
    function fixAggressiveEmphasis(content) {
      if (!content || typeof content !== "string") return content;
      let result = content;
      const codeBlocks = [];
      let placeholder = 0;
      result = result.replace(/```[\s\S]*?```/g, (match) => {
        codeBlocks.push(match);
        return `__CODE_BLOCK_${placeholder++}__`;
      });
      const acceptableCaps = ["API", "JSON", "XML", "HTML", "CSS", "URL", "HTTP", "HTTPS", "SQL", "CLI", "SDK", "JWT", "UUID", "REST", "YAML", "EOF", "TODO", "FIXME", "NOTE", "README", "MCP", "HIGH", "MEDIUM", "LOW"];
      result = result.replace(/\b[A-Z]{3,}\b/g, (match) => {
        if (acceptableCaps.includes(match)) return match;
        return match.charAt(0) + match.slice(1).toLowerCase();
      });
      result = result.replace(/!{2,}/g, "!");
      for (let i = 0; i < codeBlocks.length; i++) {
        result = result.replace(`__CODE_BLOCK_${i}__`, codeBlocks[i]);
      }
      return result;
    }
    module2.exports = {
      applyFixes: applyFixes2,
      fixAdditionalProperties,
      fixRequiredFields,
      fixVersionMismatch,
      fixMissingFrontmatter,
      fixUnrestrictedBash,
      fixMissingRole,
      fixInconsistentHeadings,
      fixVerboseExplanations,
      // New prompt fixes
      fixMissingOutputFormat,
      fixMissingExamples,
      fixMissingXmlStructure,
      fixMissingVerificationCriteria,
      fixMissingTriggerPhrase,
      fixAggressiveEmphasis,
      previewFixes,
      restoreFromBackup,
      cleanupBackups,
      assertNotSymlink,
      // Exported for prototype-pollution regression tests.
      applyAtPath
    };
  }
});

// ../work/agent-sh__agentsys/lib/enhance/reporter.js
var require_reporter = __commonJS({
  "../work/agent-sh__agentsys/lib/enhance/reporter.js"(exports2, module2) {
    function generateReport2(results, options = {}) {
      const { verbose = false, compact = false } = options;
      const filterIssues = (issues) => {
        if (verbose) return issues;
        return issues.filter((i) => i.certainty !== "LOW");
      };
      const toolIssues = filterIssues(results.toolIssues || []);
      const structureIssues = filterIssues(results.structureIssues || []);
      const securityIssues = filterIssues(results.securityIssues || []);
      const totalIssues = toolIssues.length + structureIssues.length + securityIssues.length;
      if (compact) {
        return generateCompactReport(results.pluginName, toolIssues, structureIssues, securityIssues);
      }
      const lines = [];
      lines.push(`## Plugin Analysis: ${results.pluginName}`);
      lines.push("");
      lines.push(`**Analyzed**: ${(/* @__PURE__ */ new Date()).toISOString()}`);
      lines.push(`**Files scanned**: ${results.filesScanned || 0}`);
      lines.push("");
      lines.push("### Summary");
      lines.push("");
      const highCount = countByCertainty([...toolIssues, ...structureIssues, ...securityIssues], "HIGH");
      const mediumCount = countByCertainty([...toolIssues, ...structureIssues, ...securityIssues], "MEDIUM");
      const lowCount = verbose ? countByCertainty([...toolIssues, ...structureIssues, ...securityIssues], "LOW") : 0;
      lines.push(`| Certainty | Count |`);
      lines.push(`|-----------|-------|`);
      lines.push(`| HIGH | ${highCount} |`);
      lines.push(`| MEDIUM | ${mediumCount} |`);
      if (verbose) {
        lines.push(`| LOW | ${lowCount} |`);
      }
      lines.push(`| **Total** | **${totalIssues}** |`);
      lines.push("");
      if (toolIssues.length > 0) {
        lines.push(`### Tool Definitions (${toolIssues.length} issues)`);
        lines.push("");
        lines.push("| Tool | Issue | Fix | Certainty |");
        lines.push("|------|-------|-----|-----------|");
        for (const issue of toolIssues) {
          lines.push(`| ${issue.tool || "-"} | ${issue.issue} | ${issue.fix || "-"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (structureIssues.length > 0) {
        lines.push(`### Structure (${structureIssues.length} issues)`);
        lines.push("");
        lines.push("| File | Issue | Certainty |");
        lines.push("|------|-------|-----------|");
        for (const issue of structureIssues) {
          lines.push(`| ${issue.file || "-"} | ${issue.issue} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (securityIssues.length > 0) {
        lines.push(`### Security (${securityIssues.length} issues)`);
        lines.push("");
        lines.push("| File | Line | Issue | Certainty |");
        lines.push("|------|------|-------|-----------|");
        for (const issue of securityIssues) {
          lines.push(`| ${issue.file || "-"} | ${issue.line || "-"} | ${issue.issue} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (totalIssues === 0) {
        lines.push("No issues found.");
        lines.push("");
      }
      return lines.join("\n");
    }
    function generateCompactReport(pluginName, toolIssues, structureIssues, securityIssues) {
      const lines = [];
      lines.push(`## ${pluginName}: ${toolIssues.length + structureIssues.length + securityIssues.length} issues`);
      lines.push("");
      const allIssues = [
        ...toolIssues.map((i) => ({ ...i, category: "Tool" })),
        ...structureIssues.map((i) => ({ ...i, category: "Structure" })),
        ...securityIssues.map((i) => ({ ...i, category: "Security" }))
      ];
      const certOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      allIssues.sort((a, b) => certOrder[a.certainty] - certOrder[b.certainty]);
      if (allIssues.length > 0) {
        lines.push("| Category | Issue | Certainty |");
        lines.push("|----------|-------|-----------|");
        for (const issue of allIssues) {
          lines.push(`| ${issue.category} | ${issue.issue} | ${issue.certainty} |`);
        }
      } else {
        lines.push("No issues found.");
      }
      return lines.join("\n");
    }
    function countByCertainty(issues, certainty) {
      return issues.filter((i) => i.certainty === certainty).length;
    }
    function generateDiff(original, modified, filePath) {
      const lines = [];
      lines.push(`\`\`\`diff`);
      lines.push(`--- a/${filePath}`);
      lines.push(`+++ b/${filePath}`);
      const origLines = original.split("\n");
      const modLines = modified.split("\n");
      const maxLines = Math.max(origLines.length, modLines.length);
      for (let i = 0; i < maxLines; i++) {
        const origLine = origLines[i];
        const modLine = modLines[i];
        if (origLine === modLine) {
          if (origLine !== void 0) {
            lines.push(` ${origLine}`);
          }
        } else {
          if (origLine !== void 0) {
            lines.push(`-${origLine}`);
          }
          if (modLine !== void 0) {
            lines.push(`+${modLine}`);
          }
        }
      }
      lines.push(`\`\`\``);
      return lines.join("\n");
    }
    function generateSummaryReport(allResults, options = {}) {
      const lines = [];
      lines.push("# Plugin Analysis Summary");
      lines.push("");
      lines.push(`**Analyzed**: ${allResults.length} plugins`);
      lines.push(`**Date**: ${(/* @__PURE__ */ new Date()).toISOString()}`);
      lines.push("");
      let totalHigh = 0;
      let totalMedium = 0;
      let totalLow = 0;
      for (const result of allResults) {
        const allIssues = [
          ...result.toolIssues || [],
          ...result.structureIssues || [],
          ...result.securityIssues || []
        ];
        totalHigh += countByCertainty(allIssues, "HIGH");
        totalMedium += countByCertainty(allIssues, "MEDIUM");
        totalLow += countByCertainty(allIssues, "LOW");
      }
      lines.push("## Overall");
      lines.push("");
      lines.push("| Certainty | Count |");
      lines.push("|-----------|-------|");
      lines.push(`| HIGH | ${totalHigh} |`);
      lines.push(`| MEDIUM | ${totalMedium} |`);
      if (options.verbose) {
        lines.push(`| LOW | ${totalLow} |`);
      }
      lines.push("");
      lines.push("## By Plugin");
      lines.push("");
      lines.push("| Plugin | HIGH | MEDIUM | LOW | Total |");
      lines.push("|--------|------|--------|-----|-------|");
      for (const result of allResults) {
        const allIssues = [
          ...result.toolIssues || [],
          ...result.structureIssues || [],
          ...result.securityIssues || []
        ];
        const h = countByCertainty(allIssues, "HIGH");
        const m = countByCertainty(allIssues, "MEDIUM");
        const l = countByCertainty(allIssues, "LOW");
        lines.push(`| ${result.pluginName} | ${h} | ${m} | ${l} | ${h + m + l} |`);
      }
      lines.push("");
      return lines.join("\n");
    }
    function generateAgentReport(results, options = {}) {
      const lines = [];
      lines.push(`# Agent Analysis: ${results.agentName}`);
      lines.push("");
      lines.push(`**File**: ${results.agentPath}`);
      lines.push(`**Analyzed**: ${(/* @__PURE__ */ new Date()).toISOString()}`);
      lines.push("");
      const allIssues = [
        ...results.structureIssues || [],
        ...results.toolIssues || [],
        ...results.xmlIssues || [],
        ...results.cotIssues || [],
        ...results.exampleIssues || [],
        ...results.antiPatternIssues || [],
        ...results.crossPlatformIssues || []
      ];
      const highCount = countByCertainty(allIssues, "HIGH");
      const mediumCount = countByCertainty(allIssues, "MEDIUM");
      const lowCount = countByCertainty(allIssues, "LOW");
      lines.push("## Summary");
      lines.push("");
      lines.push("| Certainty | Count |");
      lines.push("|-----------|-------|");
      lines.push(`| HIGH | ${highCount} |`);
      lines.push(`| MEDIUM | ${mediumCount} |`);
      if (options.verbose) {
        lines.push(`| LOW | ${lowCount} |`);
      }
      lines.push("");
      if (results.structureIssues && results.structureIssues.length > 0) {
        lines.push(`### Structure Issues (${results.structureIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.structureIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.toolIssues && results.toolIssues.length > 0) {
        lines.push(`### Tool Issues (${results.toolIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.toolIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.xmlIssues && results.xmlIssues.length > 0) {
        lines.push(`### XML Structure Issues (${results.xmlIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.xmlIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.cotIssues && results.cotIssues.length > 0) {
        lines.push(`### Chain-of-Thought Issues (${results.cotIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.cotIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.exampleIssues && results.exampleIssues.length > 0) {
        lines.push(`### Example Issues (${results.exampleIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.exampleIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.antiPatternIssues && results.antiPatternIssues.length > 0) {
        lines.push(`### Anti-Pattern Issues (${results.antiPatternIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.antiPatternIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.crossPlatformIssues && results.crossPlatformIssues.length > 0) {
        lines.push(`### Cross-Platform Issues (${results.crossPlatformIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.crossPlatformIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      return lines.join("\n");
    }
    function generateAgentSummaryReport(allResults, options = {}) {
      const lines = [];
      lines.push("# Agent Analysis Summary");
      lines.push("");
      lines.push(`**Analyzed**: ${allResults.length} agents`);
      lines.push(`**Date**: ${(/* @__PURE__ */ new Date()).toISOString()}`);
      lines.push("");
      let totalHigh = 0;
      let totalMedium = 0;
      let totalLow = 0;
      for (const result of allResults) {
        const allIssues = [
          ...result.structureIssues || [],
          ...result.toolIssues || [],
          ...result.xmlIssues || [],
          ...result.cotIssues || [],
          ...result.exampleIssues || [],
          ...result.antiPatternIssues || [],
          ...result.crossPlatformIssues || []
        ];
        totalHigh += countByCertainty(allIssues, "HIGH");
        totalMedium += countByCertainty(allIssues, "MEDIUM");
        totalLow += countByCertainty(allIssues, "LOW");
      }
      lines.push("## Overall");
      lines.push("");
      lines.push("| Certainty | Count |");
      lines.push("|-----------|-------|");
      lines.push(`| HIGH | ${totalHigh} |`);
      lines.push(`| MEDIUM | ${totalMedium} |`);
      if (options.verbose) {
        lines.push(`| LOW | ${totalLow} |`);
      }
      lines.push("");
      lines.push("## By Agent");
      lines.push("");
      lines.push("| Agent | HIGH | MEDIUM | LOW | Total |");
      lines.push("|-------|------|--------|-----|-------|");
      for (const result of allResults) {
        const allIssues = [
          ...result.structureIssues || [],
          ...result.toolIssues || [],
          ...result.xmlIssues || [],
          ...result.cotIssues || [],
          ...result.exampleIssues || [],
          ...result.antiPatternIssues || [],
          ...result.crossPlatformIssues || []
        ];
        const h = countByCertainty(allIssues, "HIGH");
        const m = countByCertainty(allIssues, "MEDIUM");
        const l = countByCertainty(allIssues, "LOW");
        lines.push(`| ${result.agentName} | ${h} | ${m} | ${l} | ${h + m + l} |`);
      }
      lines.push("");
      return lines.join("\n");
    }
    function generateDocsReport(results, options = {}) {
      const lines = [];
      lines.push(`# Documentation Analysis: ${results.docName}`);
      lines.push("");
      lines.push(`**File**: ${results.docPath}`);
      lines.push(`**Mode**: ${results.mode === "ai" ? "AI-only (RAG optimized)" : "Both audiences"}`);
      lines.push(`**Token Count**: ~${results.tokenCount}`);
      lines.push(`**Analyzed**: ${(/* @__PURE__ */ new Date()).toISOString()}`);
      lines.push("");
      const allIssues = [
        ...results.linkIssues || [],
        ...results.structureIssues || [],
        ...results.codeIssues || [],
        ...results.efficiencyIssues || [],
        ...results.ragIssues || [],
        ...results.balanceIssues || []
      ];
      const highCount = countByCertainty(allIssues, "HIGH");
      const mediumCount = countByCertainty(allIssues, "MEDIUM");
      const lowCount = countByCertainty(allIssues, "LOW");
      lines.push("## Summary");
      lines.push("");
      lines.push("| Certainty | Count |");
      lines.push("|-----------|-------|");
      lines.push(`| HIGH | ${highCount} |`);
      lines.push(`| MEDIUM | ${mediumCount} |`);
      if (options.verbose) {
        lines.push(`| LOW | ${lowCount} |`);
      }
      lines.push("");
      if (results.linkIssues && results.linkIssues.length > 0) {
        lines.push(`### Link Issues (${results.linkIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.linkIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.structureIssues && results.structureIssues.length > 0) {
        lines.push(`### Structure Issues (${results.structureIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.structureIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.codeIssues && results.codeIssues.length > 0) {
        lines.push(`### Code Block Issues (${results.codeIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.codeIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.efficiencyIssues && results.efficiencyIssues.length > 0) {
        lines.push(`### Efficiency Issues (${results.efficiencyIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.efficiencyIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.ragIssues && results.ragIssues.length > 0) {
        lines.push(`### RAG Optimization Issues (${results.ragIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.ragIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.balanceIssues && results.balanceIssues.length > 0) {
        lines.push(`### Balance Suggestions (${results.balanceIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.balanceIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (allIssues.length === 0) {
        lines.push("No issues found.");
        lines.push("");
      }
      return lines.join("\n");
    }
    function generateDocsSummaryReport(allResults, options = {}) {
      const lines = [];
      const mode = allResults[0]?.mode || "both";
      lines.push("# Documentation Analysis Summary");
      lines.push("");
      lines.push(`**Analyzed**: ${allResults.length} documents`);
      lines.push(`**Mode**: ${mode === "ai" ? "AI-only (RAG optimized)" : "Both audiences"}`);
      lines.push(`**Date**: ${(/* @__PURE__ */ new Date()).toISOString()}`);
      lines.push("");
      let totalHigh = 0;
      let totalMedium = 0;
      let totalLow = 0;
      let totalTokens = 0;
      for (const result of allResults) {
        const allIssues = [
          ...result.linkIssues || [],
          ...result.structureIssues || [],
          ...result.codeIssues || [],
          ...result.efficiencyIssues || [],
          ...result.ragIssues || [],
          ...result.balanceIssues || []
        ];
        totalHigh += countByCertainty(allIssues, "HIGH");
        totalMedium += countByCertainty(allIssues, "MEDIUM");
        totalLow += countByCertainty(allIssues, "LOW");
        totalTokens += result.tokenCount || 0;
      }
      lines.push("## Overall");
      lines.push("");
      lines.push(`**Total Tokens**: ~${totalTokens}`);
      lines.push("");
      lines.push("| Certainty | Count |");
      lines.push("|-----------|-------|");
      lines.push(`| HIGH | ${totalHigh} |`);
      lines.push(`| MEDIUM | ${totalMedium} |`);
      if (options.verbose) {
        lines.push(`| LOW | ${totalLow} |`);
      }
      lines.push("");
      lines.push("## By Document");
      lines.push("");
      lines.push("| Document | Tokens | HIGH | MEDIUM | LOW | Total |");
      lines.push("|----------|--------|------|--------|-----|-------|");
      for (const result of allResults) {
        const allIssues = [
          ...result.linkIssues || [],
          ...result.structureIssues || [],
          ...result.codeIssues || [],
          ...result.efficiencyIssues || [],
          ...result.ragIssues || [],
          ...result.balanceIssues || []
        ];
        const h = countByCertainty(allIssues, "HIGH");
        const m = countByCertainty(allIssues, "MEDIUM");
        const l = countByCertainty(allIssues, "LOW");
        lines.push(`| ${result.docName} | ${result.tokenCount} | ${h} | ${m} | ${l} | ${h + m + l} |`);
      }
      lines.push("");
      return lines.join("\n");
    }
    function generateProjectMemoryReport(results, options = {}) {
      const lines = [];
      if (results.error) {
        lines.push(`# Project Memory Analysis: Error`);
        lines.push("");
        lines.push(`**Error**: ${results.error}`);
        lines.push("");
        if (results.searchedPaths) {
          lines.push("Searched paths:");
          for (const p of results.searchedPaths) {
            lines.push(`- ${p}`);
          }
        }
        return lines.join("\n");
      }
      lines.push(`# Project Memory Analysis: ${results.fileName}`);
      lines.push("");
      lines.push(`**File**: ${results.filePath}`);
      lines.push(`**Type**: ${results.fileType === "agents" ? "AGENTS.md (cross-platform)" : "CLAUDE.md"}`);
      lines.push(`**Analyzed**: ${(/* @__PURE__ */ new Date()).toISOString()}`);
      lines.push("");
      if (results.metrics) {
        lines.push("## Metrics");
        lines.push("");
        lines.push("| Metric | Value |");
        lines.push("|--------|-------|");
        lines.push(`| Estimated Tokens | ${results.metrics.estimatedTokens} |`);
        lines.push(`| Characters | ${results.metrics.characterCount} |`);
        lines.push(`| Lines | ${results.metrics.lineCount} |`);
        lines.push(`| Words | ${results.metrics.wordCount} |`);
        if (results.metrics.readmeOverlap !== void 0) {
          lines.push(`| README Overlap | ${Math.round(results.metrics.readmeOverlap * 100)}% |`);
        }
        lines.push("");
      }
      const allIssues = [
        ...results.structureIssues || [],
        ...results.referenceIssues || [],
        ...results.efficiencyIssues || [],
        ...results.qualityIssues || [],
        ...results.crossPlatformIssues || []
      ];
      const highCount = countByCertainty(allIssues, "HIGH");
      const mediumCount = countByCertainty(allIssues, "MEDIUM");
      const lowCount = countByCertainty(allIssues, "LOW");
      lines.push("## Summary");
      lines.push("");
      lines.push("| Certainty | Count |");
      lines.push("|-----------|-------|");
      lines.push(`| HIGH | ${highCount} |`);
      lines.push(`| MEDIUM | ${mediumCount} |`);
      if (options.verbose) {
        lines.push(`| LOW | ${lowCount} |`);
      }
      lines.push(`| **Total** | **${allIssues.length}** |`);
      lines.push("");
      if (results.structureIssues && results.structureIssues.length > 0) {
        lines.push(`### Structure Issues (${results.structureIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.structureIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.referenceIssues && results.referenceIssues.length > 0) {
        lines.push(`### Reference Issues (${results.referenceIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.referenceIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.efficiencyIssues && results.efficiencyIssues.length > 0) {
        lines.push(`### Efficiency Issues (${results.efficiencyIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.efficiencyIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.qualityIssues && results.qualityIssues.length > 0) {
        lines.push(`### Quality Issues (${results.qualityIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.qualityIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.crossPlatformIssues && results.crossPlatformIssues.length > 0) {
        lines.push(`### Cross-Platform Issues (${results.crossPlatformIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.crossPlatformIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (allIssues.length === 0) {
        lines.push("No issues found.");
        lines.push("");
      }
      return lines.join("\n");
    }
    function generateProjectMemorySummaryReport(allResults, options = {}) {
      const lines = [];
      lines.push("# Project Memory Analysis Summary");
      lines.push("");
      lines.push(`**Analyzed**: ${allResults.length} files`);
      lines.push(`**Date**: ${(/* @__PURE__ */ new Date()).toISOString()}`);
      lines.push("");
      let totalHigh = 0;
      let totalMedium = 0;
      let totalLow = 0;
      let totalTokens = 0;
      for (const result of allResults) {
        if (result.error) continue;
        const allIssues = [
          ...result.structureIssues || [],
          ...result.referenceIssues || [],
          ...result.efficiencyIssues || [],
          ...result.qualityIssues || [],
          ...result.crossPlatformIssues || []
        ];
        totalHigh += countByCertainty(allIssues, "HIGH");
        totalMedium += countByCertainty(allIssues, "MEDIUM");
        totalLow += countByCertainty(allIssues, "LOW");
        if (result.metrics) {
          totalTokens += result.metrics.estimatedTokens || 0;
        }
      }
      lines.push("## Overall");
      lines.push("");
      lines.push("| Metric | Value |");
      lines.push("|--------|-------|");
      lines.push(`| Total Tokens | ${totalTokens} |`);
      lines.push(`| HIGH Issues | ${totalHigh} |`);
      lines.push(`| MEDIUM Issues | ${totalMedium} |`);
      if (options.verbose) {
        lines.push(`| LOW Issues | ${totalLow} |`);
      }
      lines.push("");
      lines.push("## By File");
      lines.push("");
      lines.push("| File | Tokens | HIGH | MEDIUM | LOW | Total |");
      lines.push("|------|--------|------|--------|-----|-------|");
      for (const result of allResults) {
        if (result.error) {
          lines.push(`| ${result.filePath || "Unknown"} | - | Error | - | - | - |`);
          continue;
        }
        const allIssues = [
          ...result.structureIssues || [],
          ...result.referenceIssues || [],
          ...result.efficiencyIssues || [],
          ...result.qualityIssues || [],
          ...result.crossPlatformIssues || []
        ];
        const h = countByCertainty(allIssues, "HIGH");
        const m = countByCertainty(allIssues, "MEDIUM");
        const l = countByCertainty(allIssues, "LOW");
        const tokens = result.metrics?.estimatedTokens || "-";
        lines.push(`| ${result.fileName} | ${tokens} | ${h} | ${m} | ${l} | ${h + m + l} |`);
      }
      lines.push("");
      return lines.join("\n");
    }
    function generatePromptReport(results, options = {}) {
      const lines = [];
      lines.push(`# Prompt Analysis: ${results.promptName}`);
      lines.push("");
      lines.push(`**File**: ${results.promptPath}`);
      lines.push(`**Type**: ${results.promptType || "unknown"}`);
      lines.push(`**Token Count**: ~${results.tokenCount}`);
      lines.push(`**Analyzed**: ${(/* @__PURE__ */ new Date()).toISOString()}`);
      lines.push("");
      const allIssues = [
        ...results.clarityIssues || [],
        ...results.structureIssues || [],
        ...results.exampleIssues || [],
        ...results.contextIssues || [],
        ...results.outputIssues || [],
        ...results.antiPatternIssues || [],
        ...results.codeValidationIssues || []
      ];
      const highCount = countByCertainty(allIssues, "HIGH");
      const mediumCount = countByCertainty(allIssues, "MEDIUM");
      const lowCount = countByCertainty(allIssues, "LOW");
      lines.push("## Summary");
      lines.push("");
      lines.push("| Certainty | Count |");
      lines.push("|-----------|-------|");
      lines.push(`| HIGH | ${highCount} |`);
      lines.push(`| MEDIUM | ${mediumCount} |`);
      if (options.verbose) {
        lines.push(`| LOW | ${lowCount} |`);
      }
      lines.push("");
      if (results.clarityIssues && results.clarityIssues.length > 0) {
        lines.push(`### Clarity Issues (${results.clarityIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.clarityIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.structureIssues && results.structureIssues.length > 0) {
        lines.push(`### Structure Issues (${results.structureIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.structureIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.exampleIssues && results.exampleIssues.length > 0) {
        lines.push(`### Example Issues (${results.exampleIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.exampleIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.contextIssues && results.contextIssues.length > 0) {
        lines.push(`### Context Issues (${results.contextIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.contextIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.outputIssues && results.outputIssues.length > 0) {
        lines.push(`### Output Format Issues (${results.outputIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.outputIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.antiPatternIssues && results.antiPatternIssues.length > 0) {
        lines.push(`### Anti-Pattern Issues (${results.antiPatternIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.antiPatternIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (results.codeValidationIssues && results.codeValidationIssues.length > 0) {
        lines.push(`### Code Validation Issues (${results.codeValidationIssues.length})`);
        lines.push("");
        lines.push("| Issue | Fix | Certainty |");
        lines.push("|-------|-----|-----------|");
        for (const issue of results.codeValidationIssues) {
          lines.push(`| ${issue.issue} | ${issue.fix || "N/A"} | ${issue.certainty} |`);
        }
        lines.push("");
      }
      if (allIssues.length === 0) {
        lines.push("No issues found.");
        lines.push("");
      }
      return lines.join("\n");
    }
    function generatePromptSummaryReport(allResults, options = {}) {
      const lines = [];
      lines.push("# Prompt Analysis Summary");
      lines.push("");
      lines.push(`**Analyzed**: ${allResults.length} prompts`);
      lines.push(`**Date**: ${(/* @__PURE__ */ new Date()).toISOString()}`);
      lines.push("");
      let totalHigh = 0;
      let totalMedium = 0;
      let totalLow = 0;
      let totalTokens = 0;
      for (const result of allResults) {
        const allIssues = [
          ...result.clarityIssues || [],
          ...result.structureIssues || [],
          ...result.exampleIssues || [],
          ...result.contextIssues || [],
          ...result.outputIssues || [],
          ...result.antiPatternIssues || [],
          ...result.codeValidationIssues || []
        ];
        totalHigh += countByCertainty(allIssues, "HIGH");
        totalMedium += countByCertainty(allIssues, "MEDIUM");
        totalLow += countByCertainty(allIssues, "LOW");
        totalTokens += result.tokenCount || 0;
      }
      lines.push("## Overall");
      lines.push("");
      lines.push(`**Total Tokens**: ~${totalTokens}`);
      lines.push("");
      lines.push("| Certainty | Count |");
      lines.push("|-----------|-------|");
      lines.push(`| HIGH | ${totalHigh} |`);
      lines.push(`| MEDIUM | ${totalMedium} |`);
      if (options.verbose) {
        lines.push(`| LOW | ${totalLow} |`);
      }
      lines.push("");
      lines.push("## By Prompt");
      lines.push("");
      lines.push("| Prompt | Type | Tokens | HIGH | MEDIUM | LOW | Total |");
      lines.push("|--------|------|--------|------|--------|-----|-------|");
      for (const result of allResults) {
        const allIssues = [
          ...result.clarityIssues || [],
          ...result.structureIssues || [],
          ...result.exampleIssues || [],
          ...result.contextIssues || [],
          ...result.outputIssues || [],
          ...result.antiPatternIssues || [],
          ...result.codeValidationIssues || []
        ];
        const h = countByCertainty(allIssues, "HIGH");
        const m = countByCertainty(allIssues, "MEDIUM");
        const l = countByCertainty(allIssues, "LOW");
        lines.push(`| ${result.promptName} | ${result.promptType || "-"} | ${result.tokenCount} | ${h} | ${m} | ${l} | ${h + m + l} |`);
      }
      lines.push("");
      return lines.join("\n");
    }
    function generateOrchestratorReport(aggregatedResults, options = {}) {
      const { verbose = false, showAutoFixable = false, targetPath = "." } = options;
      const lines = [];
      lines.push("# Enhancement Analysis Report");
      lines.push("");
      lines.push(`**Target**: ${targetPath}`);
      lines.push(`**Analyzed**: ${(/* @__PURE__ */ new Date()).toISOString()}`);
      lines.push(`**Enhancers Run**: ${Object.keys(aggregatedResults?.byEnhancer || {}).join(", ") || "none"}`);
      lines.push("");
      const rawFindings = Array.isArray(aggregatedResults?.findings) ? aggregatedResults.findings : [];
      const dedupedFindings = deduplicateOrchestratorFindings(rawFindings);
      const autoFixableCount = dedupedFindings.filter((f) => f.certainty === "HIGH" && f.autoFixable).length;
      lines.push("## Executive Summary");
      lines.push("");
      lines.push("| Enhancer | HIGH | MEDIUM | LOW | Auto-Fixable |");
      lines.push("|----------|------|--------|-----|--------------|");
      const enhancerTypes = ["plugin", "agent", "claudemd", "docs", "prompt", "hooks", "skills"];
      let totalHigh = 0, totalMedium = 0, totalLow = 0, totalAutoFix = 0;
      for (const enhancer of enhancerTypes) {
        const enhancerFindings = dedupedFindings.filter((f) => f.source === enhancer);
        const high = enhancerFindings.filter((f) => f.certainty === "HIGH").length;
        const medium = enhancerFindings.filter((f) => f.certainty === "MEDIUM").length;
        const low = enhancerFindings.filter((f) => f.certainty === "LOW").length;
        const autoFix = enhancerFindings.filter((f) => f.certainty === "HIGH" && f.autoFixable).length;
        if (high > 0 || medium > 0 || low > 0) {
          lines.push(`| ${enhancer} | ${high} | ${medium} | ${low} | ${autoFix} |`);
          totalHigh += high;
          totalMedium += medium;
          totalLow += low;
          totalAutoFix += autoFix;
        }
      }
      lines.push(`| **Total** | **${totalHigh}** | **${totalMedium}** | **${totalLow}** | **${totalAutoFix}** |`);
      lines.push("");
      if (options.autoLearned && options.autoLearned.length > 0) {
        lines.push("## Auto-Learned Suppressions");
        lines.push("");
        lines.push(`Learned ${options.autoLearned.length} new false positives:`);
        lines.push("");
        const byPattern = {};
        options.autoLearned.forEach((s) => {
          if (!byPattern[s.patternId]) {
            byPattern[s.patternId] = [];
          }
          byPattern[s.patternId].push(s);
        });
        for (const [patternId, items] of Object.entries(byPattern)) {
          const maxConf = Math.max(...items.map((i) => i.confidence || 0));
          lines.push(`- **${patternId}**: ${items.length} file(s) (confidence: ${(maxConf * 100).toFixed(0)}%)`);
        }
        lines.push("");
      }
      if (dedupedFindings.length === 0) {
        lines.push("## Status: Clean");
        lines.push("");
        lines.push("No issues found.");
        lines.push("");
        return lines.join("\n");
      }
      lines.push("---");
      lines.push("");
      const highFindings = dedupedFindings.filter((f) => f.certainty === "HIGH");
      if (highFindings.length > 0) {
        lines.push(`## HIGH Certainty Issues (${highFindings.length})`);
        lines.push("");
        lines.push("Issues that should be fixed. Auto-fixable issues marked with [AF].");
        lines.push("");
        const bySource = groupBySource(highFindings);
        for (const [source, findings] of Object.entries(bySource)) {
          lines.push(`### ${capitalizeFirst(source)} Issues (${findings.length})`);
          lines.push("");
          lines.push("| File | Line | Issue | Fix | [AF] |");
          lines.push("|------|------|-------|-----|------|");
          for (const finding of findings) {
            const af = finding.autoFixable ? "Yes" : "No";
            const line = finding.line || "-";
            lines.push(`| ${finding.file || "-"} | ${line} | ${finding.issue} | ${finding.fix || "-"} | ${af} |`);
          }
          lines.push("");
        }
        lines.push("---");
        lines.push("");
      }
      const mediumFindings = dedupedFindings.filter((f) => f.certainty === "MEDIUM");
      if (mediumFindings.length > 0) {
        lines.push(`## MEDIUM Certainty Issues (${mediumFindings.length})`);
        lines.push("");
        lines.push("Issues that likely need attention. Verify context before fixing.");
        lines.push("");
        const bySource = groupBySource(mediumFindings);
        for (const [source, findings] of Object.entries(bySource)) {
          lines.push(`### ${capitalizeFirst(source)} Issues (${findings.length})`);
          lines.push("");
          lines.push("| File | Line | Issue | Fix |");
          lines.push("|------|------|-------|-----|");
          for (const finding of findings) {
            const line = finding.line || "-";
            lines.push(`| ${finding.file || "-"} | ${line} | ${finding.issue} | ${finding.fix || "-"} |`);
          }
          lines.push("");
        }
        lines.push("---");
        lines.push("");
      }
      const lowFindings = dedupedFindings.filter((f) => f.certainty === "LOW");
      if (verbose && lowFindings.length > 0) {
        lines.push(`## LOW Certainty Issues (${lowFindings.length})`);
        lines.push("");
        lines.push("Advisory suggestions. Consider based on project needs.");
        lines.push("");
        const bySource = groupBySource(lowFindings);
        for (const [source, findings] of Object.entries(bySource)) {
          lines.push(`### ${capitalizeFirst(source)} Issues (${findings.length})`);
          lines.push("");
          lines.push("| File | Line | Issue | Fix |");
          lines.push("|------|------|-------|-----|");
          for (const finding of findings) {
            const line = finding.line || "-";
            lines.push(`| ${finding.file || "-"} | ${line} | ${finding.issue} | ${finding.fix || "-"} |`);
          }
          lines.push("");
        }
        lines.push("---");
        lines.push("");
      }
      if (showAutoFixable && autoFixableCount > 0) {
        lines.push("## Auto-Fix Summary");
        lines.push("");
        lines.push(`**${autoFixableCount} issues can be automatically fixed** with \`--apply\` flag:`);
        lines.push("");
        lines.push("| Enhancer | Issue Type | Count |");
        lines.push("|----------|------------|-------|");
        const autoFixable = dedupedFindings.filter((f) => f.certainty === "HIGH" && f.autoFixable);
        const grouped = {};
        for (const finding of autoFixable) {
          const key = `${finding.source}|${finding.category || "general"}`;
          if (!grouped[key]) {
            grouped[key] = { source: finding.source, category: finding.category || "general", count: 0 };
          }
          grouped[key].count++;
        }
        for (const item of Object.values(grouped)) {
          lines.push(`| ${item.source} | ${item.category} | ${item.count} |`);
        }
        lines.push(`| **Total** | | **${autoFixableCount}** |`);
        lines.push("");
        lines.push("Run `/enhance --apply` to fix these automatically.");
        lines.push("");
      }
      return lines.join("\n");
    }
    function deduplicateOrchestratorFindings(findings) {
      const seen = /* @__PURE__ */ new Map();
      for (const finding of findings) {
        const hash = [
          finding.file || "",
          finding.line || 0,
          (finding.issue || "").toLowerCase().trim()
        ].join("|");
        if (!seen.has(hash)) {
          seen.set(hash, { ...finding, sources: [finding.source] });
        } else {
          const existing = seen.get(hash);
          if (!existing.sources.includes(finding.source)) {
            existing.sources.push(finding.source);
          }
          if (finding.autoFixable && !existing.autoFixable) {
            existing.autoFixable = true;
          }
        }
      }
      return Array.from(seen.values());
    }
    function groupBySource(findings) {
      const grouped = {};
      for (const finding of findings) {
        const source = finding.source || "unknown";
        if (!grouped[source]) grouped[source] = [];
        grouped[source].push(finding);
      }
      return grouped;
    }
    function capitalizeFirst(str) {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    module2.exports = {
      generateReport: generateReport2,
      generateDiff,
      generateSummaryReport,
      generateAgentReport,
      generateAgentSummaryReport,
      generateDocsReport,
      generateDocsSummaryReport,
      generateProjectMemoryReport,
      generateProjectMemorySummaryReport,
      generatePromptReport,
      generatePromptSummaryReport,
      generateOrchestratorReport,
      deduplicateOrchestratorFindings
    };
  }
});

// ../work/agent-sh__agentsys/lib/enhance/agent-analyzer.js
/**
 * Agent Analyzer
 * Main orchestrator for agent prompt optimization analysis
 *
 * @author Avi Fenesh
 * @license MIT
 */
var fs = require("fs");
var path = require("path");
var { agentPatterns } = require_agent_patterns();
function parseMarkdownFrontmatter(content) {
  if (!content || typeof content !== "string") {
    return { frontmatter: null, body: content };
  }
  const trimmed = content.trim();
  if (!trimmed.startsWith("---")) {
    return { frontmatter: null, body: content };
  }
  const lines = trimmed.split("\n");
  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endIndex = i;
      break;
    }
  }
  if (endIndex === -1) {
    return { frontmatter: null, body: content };
  }
  const frontmatter = {};
  const fmLines = lines.slice(1, endIndex);
  for (const line of fmLines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      frontmatter[key] = value;
    }
  }
  const body = lines.slice(endIndex + 1).join("\n");
  return { frontmatter, body };
}
function analyzeAgent(agentPath, options = {}) {
  const results = {
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
  if (!fs.existsSync(agentPath)) {
    results.structureIssues.push({
      issue: "File not found",
      file: agentPath,
      certainty: "HIGH",
      patternId: "file_not_found"
    });
    return results;
  }
  let content;
  try {
    content = fs.readFileSync(agentPath, "utf8");
  } catch (err) {
    results.structureIssues.push({
      issue: `Failed to read file: ${err.message}`,
      file: agentPath,
      certainty: "HIGH",
      patternId: "read_error"
    });
    return results;
  }
  const { frontmatter } = parseMarkdownFrontmatter(content);
  results.frontmatter = frontmatter;
  const missingFmPattern = agentPatterns.missing_frontmatter;
  const missingFmResult = missingFmPattern.check(content);
  if (missingFmResult) {
    results.structureIssues.push({
      ...missingFmResult,
      file: agentPath,
      certainty: missingFmPattern.certainty,
      patternId: missingFmPattern.id
    });
  }
  if (frontmatter) {
    const missingNamePattern = agentPatterns.missing_name;
    const missingNameResult = missingNamePattern.check(frontmatter);
    if (missingNameResult) {
      results.structureIssues.push({
        ...missingNameResult,
        file: agentPath,
        certainty: missingNamePattern.certainty,
        patternId: missingNamePattern.id
      });
    }
    const missingDescPattern = agentPatterns.missing_description;
    const missingDescResult = missingDescPattern.check(frontmatter);
    if (missingDescResult) {
      results.structureIssues.push({
        ...missingDescResult,
        file: agentPath,
        certainty: missingDescPattern.certainty,
        patternId: missingDescPattern.id
      });
    }
    const unrestrictedToolsPattern = agentPatterns.unrestricted_tools;
    const unrestrictedToolsResult = unrestrictedToolsPattern.check(frontmatter);
    if (unrestrictedToolsResult) {
      results.toolIssues.push({
        ...unrestrictedToolsResult,
        file: agentPath,
        certainty: unrestrictedToolsPattern.certainty,
        patternId: unrestrictedToolsPattern.id
      });
    }
    const unrestrictedBashPattern = agentPatterns.unrestricted_bash;
    const unrestrictedBashResult = unrestrictedBashPattern.check(frontmatter);
    if (unrestrictedBashResult) {
      results.toolIssues.push({
        ...unrestrictedBashResult,
        file: agentPath,
        filePath: agentPath,
        certainty: unrestrictedBashPattern.certainty,
        patternId: unrestrictedBashPattern.id
      });
    }
  }
  const missingRolePattern = agentPatterns.missing_role;
  const missingRoleResult = missingRolePattern.check(content);
  if (missingRoleResult) {
    results.structureIssues.push({
      ...missingRoleResult,
      file: agentPath,
      filePath: agentPath,
      certainty: missingRolePattern.certainty,
      patternId: missingRolePattern.id
    });
  }
  const missingOutputPattern = agentPatterns.missing_output_format;
  const missingOutputResult = missingOutputPattern.check(content);
  if (missingOutputResult) {
    results.structureIssues.push({
      ...missingOutputResult,
      file: agentPath,
      certainty: missingOutputPattern.certainty,
      patternId: missingOutputPattern.id
    });
  }
  const missingConstraintsPattern = agentPatterns.missing_constraints;
  const missingConstraintsResult = missingConstraintsPattern.check(content);
  if (missingConstraintsResult) {
    results.structureIssues.push({
      ...missingConstraintsResult,
      file: agentPath,
      certainty: missingConstraintsPattern.certainty,
      patternId: missingConstraintsPattern.id
    });
  }
  const missingXmlPattern = agentPatterns.missing_xml_structure;
  const missingXmlResult = missingXmlPattern.check(content);
  if (missingXmlResult && (options.verbose || missingXmlPattern.certainty !== "LOW")) {
    results.xmlIssues.push({
      ...missingXmlResult,
      file: agentPath,
      certainty: missingXmlPattern.certainty,
      patternId: missingXmlPattern.id
    });
  }
  const unnecessaryCotPattern = agentPatterns.unnecessary_cot;
  const unnecessaryCotResult = unnecessaryCotPattern.check(content);
  if (unnecessaryCotResult && (options.verbose || unnecessaryCotPattern.certainty !== "LOW")) {
    results.cotIssues.push({
      ...unnecessaryCotResult,
      file: agentPath,
      certainty: unnecessaryCotPattern.certainty,
      patternId: unnecessaryCotPattern.id
    });
  }
  const missingCotPattern = agentPatterns.missing_cot;
  const missingCotResult = missingCotPattern.check(content);
  if (missingCotResult && (options.verbose || missingCotPattern.certainty !== "LOW")) {
    results.cotIssues.push({
      ...missingCotResult,
      file: agentPath,
      certainty: missingCotPattern.certainty,
      patternId: missingCotPattern.id
    });
  }
  const exampleCountPattern = agentPatterns.example_count_suboptimal;
  const exampleCountResult = exampleCountPattern.check(content);
  if (exampleCountResult && options.verbose) {
    results.exampleIssues.push({
      ...exampleCountResult,
      file: agentPath,
      certainty: exampleCountPattern.certainty,
      patternId: exampleCountPattern.id
    });
  }
  const vaguePattern = agentPatterns.vague_instructions;
  const vagueResult = vaguePattern.check(content);
  if (vagueResult && (options.verbose || vaguePattern.certainty !== "LOW")) {
    results.antiPatternIssues.push({
      ...vagueResult,
      file: agentPath,
      certainty: vaguePattern.certainty,
      patternId: vaguePattern.id
    });
  }
  const bloatPattern = agentPatterns.prompt_bloat;
  const bloatResult = bloatPattern.check(content);
  if (bloatResult && options.verbose) {
    results.antiPatternIssues.push({
      ...bloatResult,
      file: agentPath,
      certainty: bloatPattern.certainty,
      patternId: bloatPattern.id
    });
  }
  const crossPlatformPatterns = [
    "hardcoded_claude_dir",
    "claude_md_reference",
    "no_xml_for_data"
  ];
  for (const patternName of crossPlatformPatterns) {
    const pattern = agentPatterns[patternName];
    if (!pattern) continue;
    const result = pattern.check(content);
    if (result && (options.verbose || pattern.certainty !== "LOW")) {
      results.crossPlatformIssues.push({
        ...result,
        file: agentPath,
        certainty: pattern.certainty,
        patternId: pattern.id
      });
    }
  }
  return results;
}
function analyzeAllAgents(agentsDir, options = {}) {
  const results = [];
  if (!fs.existsSync(agentsDir)) {
    return results;
  }
  const agentFiles = fs.readdirSync(agentsDir).filter((f) => f.endsWith(".md") && f !== "README.md");
  for (const agentFile of agentFiles) {
    const agentPath = path.join(agentsDir, agentFile);
    const result = analyzeAgent(agentPath, options);
    results.push(result);
  }
  return results;
}
function analyze(options = {}) {
  const {
    agent,
    agentsDir = "plugins/enhance/agents",
    verbose = false
  } = options;
  if (agent) {
    const agentPath = agent.endsWith(".md") ? path.join(agentsDir, agent) : path.join(agentsDir, `${agent}.md`);
    return analyzeAgent(agentPath, { verbose });
  } else {
    return analyzeAllAgents(agentsDir, { verbose });
  }
}
function applyFixes(results, options = {}) {
  const fixer = require_fixer();
  let allIssues = [];
  if (Array.isArray(results)) {
    for (const r of results) {
      allIssues.push(...r.structureIssues || []);
      allIssues.push(...r.toolIssues || []);
      allIssues.push(...r.xmlIssues || []);
      allIssues.push(...r.cotIssues || []);
      allIssues.push(...r.exampleIssues || []);
      allIssues.push(...r.antiPatternIssues || []);
      allIssues.push(...r.crossPlatformIssues || []);
    }
  } else {
    allIssues.push(...results.structureIssues || []);
    allIssues.push(...results.toolIssues || []);
    allIssues.push(...results.xmlIssues || []);
    allIssues.push(...results.cotIssues || []);
    allIssues.push(...results.exampleIssues || []);
    allIssues.push(...results.antiPatternIssues || []);
    allIssues.push(...results.crossPlatformIssues || []);
  }
  return fixer.applyFixes(allIssues, options);
}
function generateReport(results, options = {}) {
  const reporter = require_reporter();
  if (Array.isArray(results)) {
    return reporter.generateAgentSummaryReport(results, options);
  } else {
    return reporter.generateAgentReport(results, options);
  }
}
module.exports = {
  parseMarkdownFrontmatter,
  analyzeAgent,
  analyzeAllAgents,
  analyze,
  applyFixes,
  generateReport
};

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/agent-sh__agentsys/lib/utils/fs-safe.js
var require_fs_safe = __commonJS({
  "../work/agent-sh__agentsys/lib/utils/fs-safe.js"(exports2, module2) {
    "use strict";
    var fs2 = require("fs");
    function readFileWithLimit2(filePath, maxSize, encoding = "utf8") {
      const fd = fs2.openSync(filePath, "r");
      try {
        const stat = fs2.fstatSync(fd);
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
        return fs2.readFileSync(fd, encoding);
      } finally {
        fs2.closeSync(fd);
      }
    }
    module2.exports = { readFileWithLimit: readFileWithLimit2 };
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
    function writeJsonAtomic2(filePath, data, options = {}) {
      const { indent = 2, ...writeOptions } = options;
      const content = JSON.stringify(data, null, indent);
      return writeFileAtomic(filePath, content, writeOptions);
    }
    module2.exports = {
      writeFileAtomic,
      writeJsonAtomic: writeJsonAtomic2,
      getTempPath
    };
  }
});

// ../work/agent-sh__agentsys/lib/cross-platform/index.js
var require_cross_platform = __commonJS({
  "../work/agent-sh__agentsys/lib/cross-platform/index.js"(exports2, module2) {
    var path2 = require("path");
    var fs2 = require("fs");
    var os = require("os");
    function compareSemver(a, b) {
      const partsA = a.split(".").map((n) => parseInt(n, 10) || 0);
      const partsB = b.split(".").map((n) => parseInt(n, 10) || 0);
      for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const numA = partsA[i] || 0;
        const numB = partsB[i] || 0;
        if (numA < numB) return -1;
        if (numA > numB) return 1;
      }
      return 0;
    }
    var PLATFORMS = {
      CLAUDE_CODE: "claude-code",
      OPENCODE: "opencode",
      CODEX_CLI: "codex-cli"
    };
    var STATE_DIRS = {
      [PLATFORMS.CLAUDE_CODE]: ".claude",
      [PLATFORMS.OPENCODE]: ".opencode",
      [PLATFORMS.CODEX_CLI]: ".codex"
    };
    function getStateDir() {
      return process.env.AI_STATE_DIR || STATE_DIRS[PLATFORMS.CLAUDE_CODE];
    }
    function detectPlatform() {
      const stateDir = process.env.AI_STATE_DIR;
      if (stateDir === ".opencode") return PLATFORMS.OPENCODE;
      if (stateDir === ".codex") return PLATFORMS.CODEX_CLI;
      return PLATFORMS.CLAUDE_CODE;
    }
    function getPluginRoot(pluginName = "enhance") {
      if (process.env.PLUGIN_ROOT) {
        return process.env.PLUGIN_ROOT;
      }
      const stateDir = getStateDir();
      const home = os.homedir();
      const searchPaths = [
        path2.join(home, stateDir, "plugins", "cache", "agentsys", pluginName),
        path2.join(home, stateDir, "plugins", "agentsys", pluginName)
      ];
      for (const searchPath of searchPaths) {
        if (fs2.existsSync(searchPath)) {
          const versions = fs2.readdirSync(searchPath).filter((v) => {
            return fs2.statSync(path2.join(searchPath, v)).isDirectory();
          });
          if (versions.length > 0) {
            const latest = versions.sort(compareSemver).reverse()[0];
            return path2.join(searchPath, latest);
          }
        }
      }
      return null;
    }
    function getSuppressionPath2() {
      const stateDir = getStateDir();
      const home = os.homedir();
      return path2.join(home, stateDir, "enhance", "suppressions.json");
    }
    var TOOL_SCHEMA_GUIDELINES = {
      // Max description length for token efficiency
      maxDescriptionLength: 100,
      // Naming conventions
      namingPattern: /^[a-z][a-z0-9_]*$/,
      // Parameter best practices
      preferFlatStructures: true,
      useEnumsForConstraints: true,
      documentDefaults: true
    };
    function createToolDefinition(name, description, properties = {}, required = []) {
      if (!TOOL_SCHEMA_GUIDELINES.namingPattern.test(name)) {
        console.warn(`Tool name "${name}" should be snake_case`);
      }
      if (description.length > TOOL_SCHEMA_GUIDELINES.maxDescriptionLength) {
        console.warn(`Tool "${name}" description exceeds ${TOOL_SCHEMA_GUIDELINES.maxDescriptionLength} chars`);
      }
      return {
        name,
        description,
        inputSchema: {
          type: "object",
          properties,
          required
        }
      };
    }
    function successResponse(data) {
      const text = typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
      return {
        content: [{ type: "text", text }]
      };
    }
    function errorResponse(message, details = null) {
      let text = `Error: ${message}`;
      if (details) {
        text += `
Details: ${JSON.stringify(details)}`;
      }
      return {
        content: [{ type: "text", text }],
        isError: true
      };
    }
    function unknownToolResponse(name, available = []) {
      let text = `Error: Unknown tool "${name}"`;
      if (available.length > 0) {
        text += `
Available tools: ${available.join(", ")}`;
      }
      return {
        content: [{ type: "text", text }],
        isError: true
      };
    }
    function formatBlock(tag, content) {
      return `<${tag}>
${content}
</${tag}>`;
    }
    function formatList(items, numbered = false) {
      return items.map((item, i) => {
        const prefix = numbered ? `${i + 1}.` : "-";
        return `${prefix} ${item}`;
      }).join("\n");
    }
    function formatSection(title, content) {
      return `## ${title}

${content}
`;
    }
    function truncate(text, maxLength) {
      if (maxLength <= 0) return text;
      const codePoints = [...text];
      if (codePoints.length <= maxLength) return text;
      return codePoints.slice(0, maxLength - 3).join("") + "...";
    }
    function compactSummary(items, keyFn, maxItems = 10) {
      const limited = items.slice(0, maxItems);
      const truncated = items.length > maxItems;
      const groups = {};
      for (const item of limited) {
        const key = keyFn(item);
        groups[key] = (groups[key] || 0) + 1;
      }
      return {
        total: items.length,
        showing: limited.length,
        truncated,
        byKey: groups
      };
    }
    var AGENT_TEMPLATE = `# Agent: {name}

## Role
{role}

## Instructions
{instructions}

## Tools Available
{tools}
If a tool is not listed above, respond with: "Tool not available"

## Output Format
{outputFormat}

## Critical Constraints
{constraints}`;
    function createAgentPrompt(config) {
      const {
        name,
        role,
        instructions = [],
        tools = [],
        outputFormat = "Respond with structured JSON",
        constraints = []
      } = config;
      const instructionsList = instructions.map((inst, i) => `${i + 1}. ${inst}`).join("\n");
      const toolsList = tools.map((t) => `- ${t.name}: ${t.description}`).join("\n");
      const constraintsList = constraints.map((c) => `- **${c}**`).join("\n");
      return AGENT_TEMPLATE.replace("{name}", name).replace("{role}", role).replace("{instructions}", instructionsList).replace("{tools}", toolsList).replace("{outputFormat}", outputFormat).replace("{constraints}", constraintsList);
    }
    function normalizePathForRequire(p) {
      return p.replace(/\\/g, "/");
    }
    function getOpenCodeConfig(serverPath, env = {}) {
      return {
        mcp: {
          "agentsys": {
            type: "local",
            command: ["node", serverPath],
            environment: {
              PLUGIN_ROOT: path2.dirname(path2.dirname(serverPath)),
              AI_STATE_DIR: ".opencode",
              ...env
            },
            timeout: 1e4,
            enabled: true
          }
        }
      };
    }
    function getCodexConfig(serverPath, env = {}) {
      const envEntries = Object.entries({
        PLUGIN_ROOT: path2.dirname(path2.dirname(serverPath)),
        AI_STATE_DIR: ".codex",
        ...env
      }).map(([k, v]) => `${k} = "${v}"`).join(", ");
      return `
[mcp_servers.agentsys]
command = "node"
args = ["${serverPath}"]
env = { ${envEntries} }
enabled = true
`.trim();
    }
    var INSTRUCTION_FILES = {
      [PLATFORMS.CLAUDE_CODE]: ["CLAUDE.md", ".claude/CLAUDE.md"],
      [PLATFORMS.OPENCODE]: ["AGENTS.md", "CLAUDE.md"],
      [PLATFORMS.CODEX_CLI]: ["AGENTS.md", "AGENTS.override.md"]
    };
    function getInstructionFiles(platform = null) {
      const p = platform || detectPlatform();
      return INSTRUCTION_FILES[p] || INSTRUCTION_FILES[PLATFORMS.CLAUDE_CODE];
    }
    module2.exports = {
      // Platform detection
      PLATFORMS,
      STATE_DIRS,
      getStateDir,
      detectPlatform,
      getPluginRoot,
      getSuppressionPath: getSuppressionPath2,
      // Tool schema
      TOOL_SCHEMA_GUIDELINES,
      createToolDefinition,
      // Response helpers
      successResponse,
      errorResponse,
      unknownToolResponse,
      // Prompt formatting
      formatBlock,
      formatList,
      formatSection,
      // Token efficiency
      truncate,
      compactSummary,
      // Agent prompts
      AGENT_TEMPLATE,
      createAgentPrompt,
      // Platform configs
      getOpenCodeConfig,
      getCodexConfig,
      getInstructionFiles,
      INSTRUCTION_FILES,
      // Path normalization
      normalizePathForRequire
    };
  }
});

// ../work/agent-sh__agentsys/lib/enhance/auto-suppression.js
var fs = require("fs");
var path = require("path");
var { execFileSync } = require("child_process");
var { readFileWithLimit } = require_fs_safe();
var { writeJsonAtomic } = require_atomic_write();
var getSuppressionPath;
try {
  const crossPlatform = require_cross_platform();
  getSuppressionPath = crossPlatform.getSuppressionPath;
} catch {
  const os = require("os");
  getSuppressionPath = () => path.join(os.homedir(), ".claude", "enhance", "suppressions.json");
}
var CONFIDENCE_THRESHOLD = 0.9;
var MAX_SUPPRESSIONS_PER_PROJECT = 100;
var SUPPRESSION_EXPIRY_MS = 6 * 30 * 24 * 60 * 60 * 1e3;
var PATTERN_HEURISTICS = {
  /**
   * vague_instructions: Detects when vague terms appear in pattern documentation
   * False positive when content describes the pattern itself
   */
  vague_instructions: (finding, content, context) => {
    const contentLower = content.toLowerCase();
    const isPatternDoc = /pattern[^\n]{0,500}detect[^\n]{0,500}usually|example[^\n]{0,500}vague|fuzzy[^\n]{0,500}language[^\n]{0,500}like/i.test(content) || /vague[^\n]{0,500}terms[^\n]{0,500}like|"usually"[^\n]{0,500}"sometimes"/i.test(content);
    if (isPatternDoc) {
      return {
        reason: "Pattern documentation self-reference (describes vague language detection)",
        confidence: 0.98
      };
    }
    const line = finding.line || 0;
    const lines = content.split("\n");
    const surroundingLines = lines.slice(Math.max(0, line - 5), line + 5).join("\n");
    if (/\|.*vague.*\||\|.*usually.*sometimes.*\|/i.test(surroundingLines)) {
      return {
        reason: "Pattern table documentation",
        confidence: 0.95
      };
    }
    return null;
  },
  /**
   * aggressive_emphasis: Detects legitimate workflow enforcement usage
   * False positive in workflow gates and critical agent constraints
   */
  aggressive_emphasis: (finding, content, context) => {
    const line = finding.line || 0;
    const lines = content.split("\n");
    const surroundingLines = lines.slice(Math.max(0, line - 20), line + 20).join("\n");
    const isWorkflowGate = /WORKFLOW\s+GATES?/i.test(surroundingLines) || /\[CRITICAL\]\s*NO\s+AGENT\s+may/i.test(surroundingLines) || /MUST\s+NOT\s+DO|NEVER\s+skip|DO\s+NOT\s+proceed/i.test(surroundingLines) || /SubagentStop\s+hook|phase\s+9\s+review/i.test(surroundingLines);
    if (isWorkflowGate) {
      return {
        reason: "Workflow enforcement requires emphasis for gates",
        confidence: 0.95
      };
    }
    const isCriticalRules = /critical-rules|Critical\s+Rules.*Priority/i.test(surroundingLines) || /<critical-rules>/i.test(surroundingLines);
    if (isCriticalRules) {
      return {
        reason: "Critical rules section requires emphasis",
        confidence: 0.93
      };
    }
    return null;
  },
  /**
   * missing_examples: Detects orchestrator/workflow files that delegate to subagents
   * False positive when file is orchestrator that spawns other agents
   */
  missing_examples: (finding, content, context) => {
    const filePath = finding.file || context?.file || "";
    const fileNameLower = path.basename(filePath).toLowerCase();
    const isOrchestrator = fileNameLower.includes("orchestrator") || fileNameLower.includes("coordinator") || // ReDoS fix: bound the unbounded [\s\S]* so a "Task({" with no following
    // subagent_type cannot drive polynomial backtracking; 50k chars covers any
    // realistic Task(...) call body.
    /Task\s{0,100}\(\s{0,100}\{[\s\S]{0,50000}subagent_type/i.test(content);
    if (isOrchestrator) {
      return {
        reason: "Orchestrator file delegates to subagents (examples in subagents)",
        confidence: 0.92
      };
    }
    const isWorkflowCommand = (
      // ReDoS fix: bound the within-line .* runs and \s* runs ([^\n] == . here)
      // to keep the same matches without polynomial backtracking.
      /spawn[^\n]{0,500}agent|invoke[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(content) && fileNameLower.endsWith(".md")
    );
    if (isWorkflowCommand) {
      return {
        reason: "Workflow command invokes agents with examples",
        confidence: 0.9
      };
    }
    return null;
  },
  /**
   * missing_output_format: Detects files that spawn subagents with output specs
   * False positive when subagent is responsible for output format
   */
  missing_output_format: (finding, content, context) => {
    const spawnsSubagent = /subagent_type|spawn[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(content) || /enhance:[^\n]{0,500}-enhancer|enhance:[^\n]{0,500}-reporter/i.test(content);
    if (spawnsSubagent) {
      return {
        reason: "Delegates output to subagent (subagent defines format)",
        confidence: 0.91
      };
    }
    return null;
  },
  /**
   * missing_constraints: Detects files that already have constraint sections
   * False positive when "## What Agent MUST NOT Do" or similar exists
   */
  missing_constraints: (finding, content, context) => {
    const hasConstraintSection = (
      // ReDoS fix: bound the within-line .* and \s runs ([^\n] == . here) so the
      // "## What ... MUST NOT Do" heading still matches without backtracking.
      /##\s{0,100}What\s{1,100}[^\n]{0,500}MUST\s{1,100}NOT\s{1,100}Do/i.test(content) || /##\s*Constraints/i.test(content) || /<constraints>/i.test(content) || /##\s*Critical\s+Constraints/i.test(content) || /WORKFLOW\s+GATES/i.test(content)
    );
    if (hasConstraintSection) {
      return {
        reason: "File has constraint section (different heading format)",
        confidence: 0.94
      };
    }
    return null;
  },
  /**
   * redundant_cot: Detects legitimate step-by-step for complex workflows
   * False positive in multi-phase workflow prompts
   */
  redundant_cot: (finding, content, context) => {
    const isMultiPhase = /Phase\s+\d+:|Step\s+\d+:|###\s+Phase/i.test(content) && /Phase\s+[2-9]:|Step\s+[2-9]:/i.test(content);
    if (isMultiPhase) {
      return {
        reason: "Multi-phase workflow requires step guidance",
        confidence: 0.91
      };
    }
    return null;
  }
};
function isLikelyFalsePositive(finding, content, context = {}) {
  const patternId = (finding.patternId || finding.id || "").toLowerCase();
  if (!content || typeof content !== "string") {
    return null;
  }
  const heuristic = PATTERN_HEURISTICS[patternId];
  if (heuristic) {
    const result = heuristic(finding, content, context);
    if (result && result.confidence >= CONFIDENCE_THRESHOLD) {
      return result;
    }
  }
  if (finding.file && isPatternDocumentation(finding.file, content, patternId)) {
    return {
      reason: "Pattern self-reference in documentation",
      confidence: 0.96
    };
  }
  return null;
}
function isPatternDocumentation(filePath, content, patternId) {
  const fileName = path.basename(filePath).toLowerCase();
  const isPatternFile = fileName.includes("pattern") || fileName.includes("enhance.md") || fileName.includes("enhancer");
  if (!isPatternFile) return false;
  const patternIdReadable = patternId.replace(/_/g, " ");
  const describesPattern = new RegExp(`\\|[^|]*${patternId}[^|]*\\|`, "i").test(content) || new RegExp(`\\|[^|]*${patternIdReadable}[^|]*\\|`, "i").test(content);
  return describesPattern;
}
function getProjectId(projectRoot = process.cwd()) {
  try {
    const remote = execFileSync("git", ["remote", "get-url", "origin"], {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    }).trim();
    if (remote) {
      return remote.replace(/^https?:\/\//, "").replace(/^git@/, "").replace(/\.git$/, "").replace(":", "/");
    }
  } catch {
  }
  const absPath = path.resolve(projectRoot);
  return `local:${path.basename(absPath)}`;
}
function loadAutoSuppressions(suppressionPath, projectId) {
  const defaultResult = { patterns: {}, stats: { totalSuppressed: 0 } };
  try {
    if (!fs.existsSync(suppressionPath)) {
      return defaultResult;
    }
    const data = JSON.parse(fs.readFileSync(suppressionPath, "utf8"));
    const projectData = data.projects?.[projectId];
    if (!projectData?.auto_learned) {
      return defaultResult;
    }
    const autoLearned = projectData.auto_learned;
    const now = Date.now();
    const prunedPatterns = {};
    for (const [patternId, suppression] of Object.entries(autoLearned.patterns || {})) {
      const learnedAt = new Date(suppression.learnedAt).getTime();
      if (now - learnedAt < SUPPRESSION_EXPIRY_MS) {
        prunedPatterns[patternId] = suppression;
      }
    }
    return {
      patterns: prunedPatterns,
      stats: autoLearned.stats || { totalSuppressed: 0 }
    };
  } catch {
    return defaultResult;
  }
}
function saveAutoSuppressions(suppressionPath, projectId, findings) {
  if (!findings || findings.length === 0) return;
  const dir = path.dirname(suppressionPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  let data = { version: "2.0", projects: {} };
  try {
    if (fs.existsSync(suppressionPath)) {
      data = JSON.parse(fs.readFileSync(suppressionPath, "utf8"));
    }
  } catch {
  }
  if (!data.projects) data.projects = {};
  if (!data.projects[projectId]) data.projects[projectId] = {};
  if (!data.projects[projectId].auto_learned) {
    data.projects[projectId].auto_learned = {
      patterns: {},
      stats: { totalSuppressed: 0, lastAnalysis: null }
    };
  }
  const autoLearned = data.projects[projectId].auto_learned;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const byPattern = {};
  for (const finding of findings) {
    const patternId = (finding.patternId || finding.id || "").toLowerCase();
    if (!patternId) continue;
    if (!byPattern[patternId]) {
      byPattern[patternId] = {
        files: [],
        reason: finding.suppressionReason || "Auto-detected false positive",
        confidence: finding.confidence || CONFIDENCE_THRESHOLD,
        learnedAt: now,
        occurrences: 0
      };
    }
    if (finding.file && !byPattern[patternId].files.includes(finding.file)) {
      byPattern[patternId].files.push(finding.file);
    }
    byPattern[patternId].occurrences++;
    if (finding.confidence > byPattern[patternId].confidence) {
      byPattern[patternId].confidence = finding.confidence;
      byPattern[patternId].reason = finding.suppressionReason;
    }
  }
  for (const [patternId, newSuppression] of Object.entries(byPattern)) {
    const existing = autoLearned.patterns[patternId];
    if (existing) {
      const allFiles = [.../* @__PURE__ */ new Set([...existing.files, ...newSuppression.files])];
      existing.files = allFiles.slice(0, 50);
      existing.occurrences = (existing.occurrences || 0) + newSuppression.occurrences;
      existing.lastSeen = now;
      if (newSuppression.confidence > existing.confidence) {
        existing.confidence = newSuppression.confidence;
        existing.reason = newSuppression.reason;
      }
    } else {
      autoLearned.patterns[patternId] = newSuppression;
    }
  }
  const patternIds = Object.keys(autoLearned.patterns);
  if (patternIds.length > MAX_SUPPRESSIONS_PER_PROJECT) {
    const sorted = patternIds.sort((a, b) => {
      const aDate = new Date(autoLearned.patterns[a].learnedAt);
      const bDate = new Date(autoLearned.patterns[b].learnedAt);
      return aDate - bDate;
    });
    const toRemove = sorted.slice(0, patternIds.length - MAX_SUPPRESSIONS_PER_PROJECT);
    for (const id of toRemove) {
      delete autoLearned.patterns[id];
    }
  }
  autoLearned.stats.totalSuppressed = Object.keys(autoLearned.patterns).length;
  autoLearned.stats.lastAnalysis = now;
  fs.writeFileSync(suppressionPath, JSON.stringify(data, null, 2));
}
function clearAutoSuppressions(suppressionPath, projectId) {
  try {
    const data = JSON.parse(readFileWithLimit(suppressionPath));
    if (data.projects?.[projectId]?.auto_learned) {
      data.projects[projectId].auto_learned = {
        patterns: {},
        stats: { totalSuppressed: 0, lastAnalysis: (/* @__PURE__ */ new Date()).toISOString() }
      };
      writeJsonAtomic(suppressionPath, data);
    }
  } catch {
  }
}
function mergeSuppressions(autoLearned, manual) {
  return {
    ignore: {
      patterns: [...manual.ignore?.patterns || []],
      files: [...manual.ignore?.files || []],
      rules: { ...manual.ignore?.rules || {} }
    },
    severity: { ...manual.severity || {} },
    auto_learned: autoLearned
  };
}
function exportAutoSuppressions(suppressionPath, projectId) {
  const autoLearned = loadAutoSuppressions(suppressionPath, projectId);
  return {
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    projectId,
    suppressions: autoLearned.patterns,
    stats: autoLearned.stats
  };
}
function importAutoSuppressions(suppressionPath, projectId, importData) {
  if (!importData?.suppressions) return;
  const findings = [];
  for (const [patternId, suppression] of Object.entries(importData.suppressions)) {
    for (const file of suppression.files || []) {
      findings.push({
        patternId,
        file,
        suppressionReason: suppression.reason,
        confidence: suppression.confidence
      });
    }
  }
  saveAutoSuppressions(suppressionPath, projectId, findings);
}
function analyzeForAutoSuppression(findings, fileContents, options = {}) {
  if (options.noLearn) return [];
  const toSuppress = [];
  for (const finding of findings) {
    const filePath = finding.file || finding.filePath;
    const content = fileContents.get(filePath);
    if (!content) continue;
    const fpCheck = isLikelyFalsePositive(finding, content, {
      file: filePath,
      projectRoot: options.projectRoot
    });
    if (fpCheck) {
      toSuppress.push({
        ...finding,
        suppressed: true,
        suppressionReason: fpCheck.reason,
        confidence: fpCheck.confidence
      });
    }
  }
  return toSuppress;
}
module.exports = {
  // Constants
  CONFIDENCE_THRESHOLD,
  MAX_SUPPRESSIONS_PER_PROJECT,
  SUPPRESSION_EXPIRY_MS,
  // Core functions
  isLikelyFalsePositive,
  getProjectId,
  // Storage functions
  loadAutoSuppressions,
  saveAutoSuppressions,
  clearAutoSuppressions,
  mergeSuppressions,
  // Import/export
  exportAutoSuppressions,
  importAutoSuppressions,
  // Analysis helper
  analyzeForAutoSuppression,
  // For testing
  PATTERN_HEURISTICS,
  isPatternDocumentation
};

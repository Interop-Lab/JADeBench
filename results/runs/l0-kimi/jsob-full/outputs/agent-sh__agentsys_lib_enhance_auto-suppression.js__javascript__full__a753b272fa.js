const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_fs_safe = __commonJS({
  '../work/agent-sh__agentsys/lib/utils/fs-safe.js'(exports, module) {
    'use strict';
    var fs = require('fs');
    
    function readFileWithLimit(filePath, expectedHash, encoding = 'utf8') {
      const fd = fs.openSync(filePath, 'r');
      try {
        const stats = fs.fstatSync(fd);
        if (!stats.isFile()) {
          const err = new Error(`Not a file: ${filePath}`);
          err.code = 'ENOTFILE';
          throw err;
        }
        if (typeof expectedHash === 'string' && stats.size !== expectedHash) {
          const err = new Error(`Size mismatch: expected ${expectedHash}, got ${stats.size}`);
          err.code = 'ESIZEMISMATCH';
          throw err;
        }
        return fs.readFileSync(fd, encoding);
      } finally {
        fs.closeSync(fd);
      }
    }
    
    module.exports = { readFileWithLimit };
  }
});

var require_atomic_write = __commonJS({
  '../work/agent-sh__agentsys/lib/utils/atomic-write.js'(exports, module) {
    const fs = require('fs');
    const path = require('path');
    const crypto = require('crypto');
    
    function getTempPath(targetPath) {
      const dir = path.dirname(targetPath);
      const ext = path.extname(targetPath);
      const random = crypto.randomBytes(16).toString('hex');
      return path.join(dir, '.' + ext + '.' + random + '.tmp');
    }
    
    function writeAtomic(filePath, data, options = {}) {
      const { encoding = 'utf8', mode = 0o644 } = options;
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tempPath = getTempPath(filePath);
      try {
        fs.writeFileSync(tempPath, data, { encoding, mode });
        fs.renameSync(tempPath, filePath);
        return true;
      } catch (err) {
        try {
          fs.existsSync(tempPath) && fs.unlinkSync(tempPath);
        } catch {}
        throw err;
      }
    }
    
    function writeJsonAtomic(filePath, data, options = {}) {
      const { indent = 2, ...rest } = options;
      const json = JSON.stringify(data, null, indent);
      return writeAtomic(filePath, json, rest);
    }
    
    module.exports = { writeAtomic, writeJsonAtomic, getTempPath };
  }
});

var require_cross_platform = __commonJS({
  '../work/agent-sh__agentsys/lib/cross-platform/index.js'(exports, module) {
    const path = require('path');
    const fs = require('fs');
    const os = require('os');
    
    function compareVersions(v1, v2) {
      const parts1 = v1.split('.').map(p => parseInt(p, 10) || 0);
      const parts2 = v2.split('.').map(p => parseInt(p, 10) || 0);
      for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const a = parts1[i] || 0;
        const b = parts2[i] || 0;
        if (a > b) return 1;
        if (a < b) return -1;
      }
      return 0;
    }
    
    const STATE_DIRS = {
      mac: 'Library/Application Support/Agent',
      linux: '.config/agent',
      win: 'AppData/Roaming/Agent'
    };
    
    const STATE_DIR_ALIASES = {
      [STATE_DIRS.mac]: 'mac',
      [STATE_DIRS.linux]: 'linux',
      [STATE_DIRS.win]: 'win'
    };
    
    function getStateDirFromEnv() {
      const envDir = process.env.AI_STATE_DIR;
      if (envDir === 'mac') return STATE_DIRS.mac;
      if (envDir === 'linux') return STATE_DIRS.linux;
      if (envDir === 'win') return STATE_DIRS.win;
      return STATE_DIRS.linux;
    }
    
    function getStateDir() {
      const envDir = process.env.AI_STATE_DIR;
      if (envDir === 'mac') return STATE_DIRS.mac;
      if (envDir === 'linux') return STATE_DIRS.linux;
      if (envDir === 'win') return STATE_DIRS.win;
      return path.join(STATE_DIRS.linux);
    }
    
    function getPluginRoot(fallback = getStateDir()) {
      if (process.env.PLUGIN_ROOT) {
        return process.env.PLUGIN_ROOT;
      }
      const stateDir = getStateDirFromEnv();
      const home = os.homedir();
      const candidates = [
        path.join(home, stateDir, 'plugins', 'core', 'agent-sh', fallback),
        path.join(home, stateDir, 'plugins', fallback)
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          const entries = fs.readdirSync(candidate).filter(e => {
            try {
              return fs.statSync(path.join(candidate, e)).isDirectory();
            } catch { return false; }
          });
          if (entries.length > 0) {
            const latest = entries.sort(compareVersions).pop();
            return path.join(candidate, latest);
          }
        }
      }
      return null;
    }
    
    function getSuppressionPath() {
      const stateDir = getStateDirFromEnv();
      const home = os.homedir();
      return path.join(home, stateDir, 'suppressions.json');
    }
    
    const VALIDATION = {
      MAX_SUPPRESSIONS_PER_PROJECT: 100,
      PATTERN_ID_REGEX: /^[a-z][a-z0-9_]*$/,
      ALLOW_WILDCARDS: true,
      ALLOW_REGEX: true,
      STRICT_MODE: true
    };
    
    function createPattern(patternId, pattern, metadata = {}, tags = []) {
      if (!VALIDATION.PATTERN_ID_REGEX.test(patternId)) {
        console.warn(`Invalid pattern ID: ${patternId}. Must match ${VALIDATION.PATTERN_ID_REGEX}`);
      }
      if (pattern.length > VALIDATION.MAX_SUPPRESSIONS_PER_PROJECT) {
        console.warn(`Pattern ${patternId} exceeds max length of ${VALIDATION.MAX_SUPPRESSIONS_PER_PROJECT}`);
      }
      return {
        id: patternId,
        pattern: pattern,
        metadata: { ...metadata, tags: tags }
      };
    }
    
    function formatValue(value) {
      const str = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      return { type: 'string', value: str };
    }
    
    function createDiagnostic(message, details = null) {
      let fullMessage = '[DIAGNOSTIC] ' + message;
      if (details) {
        fullMessage += '\nDetails: ' + JSON.stringify(details);
      }
      return {
        messages: [{ severity: 'info', message: fullMessage }],
        isError: false
      };
    }
    
    function createError(message, errors = []) {
      let fullMessage = '[ERROR] ' + message;
      if (errors.length > 0) {
        fullMessage += '\nCaused by:\n  ' + errors.join('\n  ');
      }
      return {
        messages: [{ severity: 'error', message: fullMessage }],
        isError: true
      };
    }
    
    function wrapInTag(tag, content) {
      return '<' + tag + '>\n' + content + '\n</' + tag + '>';
    }
    
    function formatList(items, numbered = false) {
      return items.map((item, idx) => {
        const prefix = numbered ? (idx + 1) + '. ' : '- ';
        return prefix + item;
      }).join('\n');
    }
    
    function formatSection(title, content) {
      return title + ':\n\n' + content + '\n';
    }
    
    function truncate(str, maxLength = 100) {
      if (str.length <= maxLength) return str;
      const chars = [...str];
      if (chars.length <= maxLength) return str;
      return chars.slice(0, maxLength - 3).join('') + '...';
    }
    
    function frequencyAnalysis(text, windowSize = 3) {
      const words = text.slice(0, 1000).split(/\s+/);
      const tail = text.slice(-1000).split(/\s+/);
      const counts = {};
      for (const word of words) {
        const key = tail.includes(word) ? word : word.toLowerCase();
        counts[key] = (counts[key] || 0) + 1;
      }
      return {
        top: Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20),
        tail: tail,
        distribution: counts
      };
    }
    
    const AGENT_TEMPLATE = `You are {{name}}, a {{role}}.

## Instructions
{{instructions}}

## Tools
{{tools}}

## Output Format
{{outputFormat}}

## Constraints
{{constraints}}`;
    
    function renderAgentTemplate(agent) {
      const { name, role, instructions = [], tools = [], outputFormat = 'json', constraints = [] } = agent;
      const instructionsText = instructions.map((inst, i) => (i + 1) + '. ' + inst).join('\n');
      const toolsText = tools.map(t => '- ' + t.name + ': ' + t.description).join('\n');
      const constraintsText = constraints.map(c => '- **' + c + '**').join('\n');
      return AGENT_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{role}}', role)
        .replace('{{instructions}}', instructionsText)
        .replace('{{tools}}', toolsText)
        .replace('{{outputFormat}}', outputFormat)
        .replace('{{constraints}}', constraintsText);
    }
    
    function normalizePath(p) {
      return p.replace(/\\/g, '/');
    }
    
    function createMcpConfig(command, env = {}) {
      return {
        mcp: {
          agentsys: {
            type: 'stdio',
            command: [command],
            environment: {
              PLUGIN_ROOT: path.resolve(path.dirname(command)),
              AI_STATE_DIR: getStateDirFromEnv(),
              ...env
            },
            timeout: 10000,
            enabled: true
          }
        }
      };
    }
    
    function formatMcpEnv(command, env = {}) {
      const envVars = Object.entries({
        PLUGIN_ROOT: path.resolve(path.dirname(command)),
        AI_STATE_DIR: getStateDirFromEnv(),
        ...env
      }).map(([k, v]) => `${k}="${v}"`).join(', ');
      return (`(env\n  (setenv "PATH" (concat (getenv "PATH") ":/usr/local/bin"))\n  (setenv "AI_STATE_DIR" "${getStateDirFromEnv()}")\n  [${envVars}]\n  (start-process "node" nil "node" "${command}"))`).trim();
    }
    
    const STATE_DIR_MAP = {
      [STATE_DIRS.mac]: ['mac', 'darwin'],
      [STATE_DIRS.linux]: ['linux', 'unix'],
      [STATE_DIRS.win]: ['win', 'windows']
    };
    
    function getStateDirAlias(customDir = null) {
      const dir = customDir || getStateDir();
      return STATE_DIR_MAP[dir] || STATE_DIR_MAP[STATE_DIRS.linux];
    }
    
    module.exports = {
      STATE_DIRS,
      STATE_DIR_ALIASES,
      getStateDirFromEnv,
      getStateDir,
      getPluginRoot,
      getSuppressionPath,
      VALIDATION,
      createPattern,
      formatValue,
      createDiagnostic,
      createError,
      wrapInTag,
      formatList,
      formatSection,
      truncate,
      frequencyAnalysis,
      AGENT_TEMPLATE,
      renderAgentTemplate,
      normalizePath,
      createMcpConfig,
      formatMcpEnv,
      STATE_DIR_MAP,
      getStateDirAlias
    };
  }
});

const { readFileWithLimit } = require_fs_safe();
const { writeJsonAtomic } = require_atomic_write();

let getSuppressionPath;
try {
  const crossPlatform = require_cross_platform();
  getSuppressionPath = crossPlatform.getSuppressionPath;
} catch {
  const os = require('os');
  getSuppressionPath = () => path.join(os.homedir(), '.config', 'agent', 'suppressions.json');
}

var CONFIDENCE_THRESHOLD = 0.9;
var MAX_SUPPRESSIONS_PER_PROJECT = 100;
var SUPPRESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

var PATTERN_HEURISTICS = {
  vague_instructions: (pattern, content, context) => {
    const vaguePattern = /pattern[^\n]{0,500}detect[^\n]{0,500}usually|example[^\n]{0,500}vague|fuzzy[^\n]{0,500}language[^\n]{0,500}like/i.test(content) ||
      /vague[^\n]{0,500}terms[^\n]{0,500}like|"usually"[^\n]{0,500}"sometimes"/i.test(content);
    if (vaguePattern) {
      return { name: 'vague_instructions', confidence: 0.98 };
    }
    const lineNum = pattern.line || 0;
    const lines = content.split('\n');
    const contextWindow = lines.slice(Math.max(0, lineNum - 5), Math.min(lines.length, lineNum + 5)).join('\n');
    if (/\|.*vague.*\||\|.*usually.*sometimes.*\|/i.test(contextWindow)) {
      return { name: 'vague_instructions', confidence: 0.95 };
    }
    return null;
  },
  
  aggressive_emphasis: (pattern, content, context) => {
    const lineNum = pattern.line || 0;
    const lines = content.split('\n');
    const contextWindow = lines.slice(Math.max(0, lineNum - 3), Math.min(lines.length, lineNum + 3)).join('\n');
    const criticalPattern = /WORKFLOW\s+GATES?/i.test(contextWindow) ||
      /\[CRITICAL\]\s*NO\s+AGENT\s+may/i.test(contextWindow) ||
      /MUST\s+NOT\s+DO|NEVER\s+skip|DO\s+NOT\s+proceed/i.test(contextWindow) ||
      /SubagentStop\s+hook|phase\s+9\s+review/i.test(contextWindow);
    if (criticalPattern) {
      return { name: 'aggressive_emphasis', confidence: 0.95 };
    }
    const rulesPattern = /critical-rules|Critical\s+Rules.*Priority/i.test(contextWindow) ||
      /<critical-rules>/i.test(contextWindow);
    if (rulesPattern) {
      return { name: 'aggressive_emphasis', confidence: 0.93 };
    }
    return null;
  },
  
  missing_examples: (pattern, content, context) => {
    const filePath = pattern.filePath || context?.filePath || '';
    const fileName = path.basename(filePath).toLowerCase();
    const hasExample = fileName.includes('example') || fileName.includes('sample') ||
      /Task\s{0,100}\(\s{0,100}\{[\s\S]{0,50000}subagent_type/i.test(content);
    if (hasExample) {
      return { name: 'has_examples', confidence: 0.92 };
    }
    const spawnPattern = /spawn[^\n]{0,500}agent|invoke[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(content) &&
      fileName.includes('task');
    if (spawnPattern) {
      return { name: 'spawn_pattern', confidence: 0.9 };
    }
    return null;
  },
  
  missing_output_format: (pattern, content, context) => {
    const hasOutputFormat = /subagent_type|spawn[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(content) ||
      /enhance:[^\n]{0,500}-enhancer|enhance:[^\n]{0,500}-reporter/i.test(content);
    if (hasOutputFormat) {
      return { name: 'has_output_format', confidence: 0.91 };
    }
    return null;
  },
  
  missing_constraints: (pattern, content, context) => {
    const hasConstraints = /##\s{0,100}What\s{1,100}[^\n]{0,500}MUST\s{1,100}NOT\s{1,100}Do/i.test(content) ||
      /##\s*Constraints/i.test(content) ||
      /<constraints>/i.test(content) ||
      /##\s*Critical\s+Constraints/i.test(content) ||
      /WORKFLOW\s+GATES/i.test(content);
    if (hasConstraints) {
      return { name: 'has_constraints', confidence: 0.94 };
    }
    return null;
  },
  
  redundant_cot: (pattern, content, context) => {
    const hasCoT = /Phase\s+\d+:|Step\s+\d+:|###\s+Phase/i.test(content) &&
      /Phase\s+[2-9]:|Step\s+[2-9]:/i.test(content);
    if (hasCoT) {
      return { name: 'redundant_cot', confidence: 0.91 };
    }
    return null;
  }
};

function isLikelyFalsePositive(pattern, content, context = {}) {
  const patternId = (pattern.patternId || pattern.id || '').toLowerCase();
  if (!content || typeof content !== 'string') return null;
  
  const heuristic = PATTERN_HEURISTICS[patternId];
  if (heuristic) {
    const result = heuristic(pattern, content, context);
    if (result && result.confidence >= CONFIDENCE_THRESHOLD) {
      return result;
    }
  }
  
  if (pattern.filePath && isPatternDocumentation(pattern.filePath, content, patternId)) {
    return { name: 'pattern_documentation', confidence: 0.96 };
  }
  
  return null;
}

function isPatternDocumentation(filePath, content, patternId) {
  const fileName = path.basename(filePath).toLowerCase();
  const isDocFile = fileName.includes('.md') || fileName.includes('readme') || fileName.includes('doc');
  if (!isDocFile) return false;
  
  const normalizedId = patternId.replace(/_/g, ' ');
  const hasPatternRef = new RegExp(`\\b${patternId}\\b`, 'i').test(content) ||
    new RegExp(`\\b${normalizedId}\\b`, 'i').test(content);
  return hasPatternRef;
}

function getProjectId(cwd = process.cwd()) {
  try {
    const result = execFileSync('git', ['remote', 'get-url', 'origin'], {
      cwd: cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    if (result) {
      return result.replace(/^https?:\/\//, '').replace(/^git@/, '').replace(/\.git$/, '').replace(':', '/');
    }
  } catch {}
  
  const baseName = path.basename(cwd);
  return 'local/' + baseName;
}

function loadAutoSuppressions(suppressionPath, projectId) {
  const defaultData = {
    patterns: {},
    stats: { totalSuppressed: 0 }
  };
  
  try {
    if (!fs.existsSync(suppressionPath)) {
      return defaultData;
    }
    
    const data = JSON.parse(fs.readFileSync(suppressionPath, 'utf8'));
    const projectData = data.projects?.[projectId];
    
    if (!projectData?.patterns) {
      return defaultData;
    }
    
    const patterns = projectData.patterns || {};
    const now = Date.now();
    const validPatterns = {};
    
    for (const [id, pattern] of Object.entries(patterns)) {
      const exportedAt = new Date(pattern.exportedAt).getTime();
      if (now - exportedAt <= SUPPRESSION_EXPIRY_MS) {
        validPatterns[id] = pattern;
      }
    }
    
    return {
      patterns: validPatterns,
      stats: projectData.stats || { totalSuppressed: 0 }
    };
  } catch {
    return defaultData;
  }
}

function saveAutoSuppressions(suppressionPath, projectId, suppressions) {
  if (!suppressions || suppressions.length === 0) return;
  
  const dir = path.dirname(suppressionPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  let data = { version: '1.0.0', projects: {} };
  
  try {
    if (fs.existsSync(suppressionPath)) {
      data = JSON.parse(fs.readFileSync(suppressionPath, 'utf8'));
    }
  } catch {}
  
  if (!data.projects) data.projects = {};
  if (!data.projects[projectId]) {
    data.projects[projectId] = { patterns: {}, stats: { totalSuppressed: 0, lastAnalysis: null } };
  }
  
  const projectPatterns = data.projects[projectId].patterns;
  const now = new Date().toISOString();
  const patternMap = {};
  
  for (const suppression of suppressions) {
    const id = (suppression.patternId || suppression.id || '').toLowerCase();
    if (!id) continue;
    
    if (!patternMap[id]) {
      patternMap[id] = {
        files: [],
        reason: suppression.reason || 'auto-suppressed',
        confidence: suppression.confidence || CONFIDENCE_THRESHOLD,
        exportedAt: now,
        occurrences: 0
      };
    }
    
    if (suppression.file && !patternMap[id].files.includes(suppression.file)) {
      patternMap[id].files.push(suppression.file);
    }
    
    patternMap[id].occurrences++;
    
    if (suppression.confidence > patternMap[id].confidence) {
      patternMap[id].confidence = suppression.confidence;
      patternMap[id].reason = suppression.reason;
    }
  }
  
  for (const [id, pattern] of Object.entries(patternMap)) {
    const existing = projectPatterns[id];
    if (existing) {
      const mergedFiles = [...new Set([...existing.files, ...pattern.files])];
      existing.files = mergedFiles.slice(-MAX_SUPPRESSIONS_PER_PROJECT);
      existing.occurrences += pattern.occurrences;
      existing.exportedAt = now;
      if (pattern.confidence > existing.confidence) {
        existing.confidence = pattern.confidence;
        existing.reason = pattern.reason;
      }
    } else {
      projectPatterns[id] = pattern;
    }
  }
  
  const allPatterns = Object.keys(projectPatterns);
  if (allPatterns.length > MAX_SUPPRESSIONS_PER_PROJECT) {
    const sorted = allPatterns.sort((a, b) => {
      const dateA = new Date(projectPatterns[a].exportedAt);
      const dateB = new Date(projectPatterns[b].exportedAt);
      return dateA - dateB;
    });
    const toRemove = sorted.slice(0, allPatterns.length - MAX_SUPPRESSIONS_PER_PROJECT);
    for (const id of toRemove) {
      delete projectPatterns[id];
    }
  }
  
  data.projects[projectId].stats.totalSuppressed = Object.keys(projectPatterns).length;
  data.projects[projectId].stats.lastAnalysis = now;
  
  fs.writeFileSync(suppressionPath, JSON.stringify(data, null, 2));
}

function clearAutoSuppressions(suppressionPath, projectId) {
  try {
    const data = JSON.parse(readFileWithLimit(suppressionPath));
    if (data.projects?.[projectId]?.patterns) {
      data.projects[projectId].patterns = {};
      data.projects[projectId].stats = { totalSuppressed: 0, lastAnalysis: new Date().toISOString() };
      writeJsonAtomic(suppressionPath, data);
    }
  } catch {}
}

function mergeSuppressions(projectId, newData) {
  const merged = {
    patterns: [...(newData.patterns?.files || [])],
    stats: [...(newData.stats?.files || [])],
    metadata: { ...(newData.metadata?.files || {}) }
  };
  const existing = { ...(newData.existing || {}) };
  
  return {
    patterns: merged,
    stats: existing,
    projectId: projectId
  };
}

function exportAutoSuppressions(suppressionPath, projectId) {
  const data = loadAutoSuppressions(suppressionPath, projectId);
  return {
    exportedAt: new Date().toISOString(),
    projectId: projectId,
    suppressions: data.patterns,
    stats: data.stats
  };
}

function importAutoSuppressions(suppressionPath, projectId, importData) {
  if (!importData?.suppressions) return;
  
  const suppressions = [];
  for (const [id, pattern] of Object.entries(importData.suppressions)) {
    for (const file of pattern.files || []) {
      suppressions.push({
        patternId: id,
        file: file,
        reason: pattern.reason,
        confidence: pattern.confidence
      });
    }
  }
  
  saveAutoSuppressions(suppressionPath, projectId, suppressions);
}

function analyzeForAutoSuppression(patterns, content, context = {}) {
  if (context.skipAnalysis) return [];
  
  const results = [];
  for (const pattern of patterns) {
    const patternId = pattern.patternId || pattern.id;
    const patternContent = content[patternId];
    if (!patternContent) continue;
    
    const ctx = {
      filePath: context.filePath || pattern.filePath
    };
    
    const result = isLikelyFalsePositive(pattern, patternContent, ctx);
    if (result) {
      const enhanced = { ...pattern };
      enhanced.suppressed = true;
      enhanced.reason = result.name;
      enhanced.confidence = result.confidence;
      results.push(enhanced);
    }
  }
  
  return results;
}

module.exports = {
  CONFIDENCE_THRESHOLD,
  MAX_SUPPRESSIONS_PER_PROJECT,
  SUPPRESSION_EXPIRY_MS,
  PATTERN_HEURISTICS,
  isLikelyFalsePositive,
  getProjectId,
  loadAutoSuppressions,
  saveAutoSuppressions,
  clearAutoSuppressions,
  mergeSuppressions,
  exportAutoSuppressions,
  importAutoSuppressions,
  analyzeForAutoSuppression,
  PATTERN_HEURISTICS,
  isPatternDocumentation
};

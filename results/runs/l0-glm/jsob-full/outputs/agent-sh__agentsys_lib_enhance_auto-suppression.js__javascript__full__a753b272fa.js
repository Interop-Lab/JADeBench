var __getOwnPropNames = Object.getOwnPropertyNames,
  __commonJS = (obj, callback) => function() {
    const cache = {};
    return cache.data = {}, (callback || __getOwnPropNames(obj)[0])((callback = cache).exports, callback), callback.exports;
  };

var require_fs_safe = __commonJS({
  '../work/agent-sh__agentsys/lib/utils/fs-safe.js'(exports, module) {
    'use strict';
    const fs = require('fs');

    function readFileWithLimit(filePath, maxSize, encoding = 'utf8') {
      const fd = fs.openSync(filePath, 'r');
      try {
        const stats = fs.fstatSync(fd);
        if (!stats.isFile()) {
          const err = new Error('Path is not a file: ' + filePath);
          err.code = 'ENOENT';
          throw err;
        }
        if (typeof maxSize === 'number' && stats.size > maxSize) {
          const err = new Error('File size ' + stats.size + ' exceeds limit ' + maxSize + ' bytes');
          err.code = 'EFBIG';
          throw err;
        }
        return fs.readFileSync(fd, encoding);
      } finally {
        fs.closeSync(fd);
      }
    }

    const obj = {};
    obj.readFileWithLimit = readFileWithLimit;
    module.exports = obj;
  }
});

var require_atomic_write = __commonJS({
  '../work/agent-sh__agentsys/lib/utils/atomic-write.js'(exports, module) {
    const fs = require('fs');
    const path = require('path');
    const crypto = require('crypto');

    function getTempFilename(filename) {
      const dir = path.dirname(filename);
      const base = path.basename(filename);
      const ext = crypto.randomBytes(4).toString('hex');
      return path.join(dir, '.' + base + '.' + ext + '.tmp');
    }

    function writeAtomic(filename, data, options = {}) {
      const { encoding = 'utf8', mode = 0o666 } = options;
      const dir = path.dirname(filename);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tempFile = getTempFilename(filename);
      try {
        const writeOpts = {};
        writeOpts.encoding = encoding;
        writeOpts.mode = mode;
        fs.writeFileSync(tempFile, data, writeOpts);
        fs.renameSync(tempFile, filename);
        return true;
      } catch (err) {
        try {
          fs.existsSync(tempFile) && fs.unlinkSync(tempFile);
        } catch {}
        throw err;
      }
    }

    function writeJsonAtomic(filename, data, options = {}) {
      const { indent = 2, ...rest } = options;
      const json = JSON.stringify(data, null, indent);
      return writeAtomic(filename, json, rest);
    }

    const obj = {};
    obj.writeAtomic = writeAtomic;
    obj.writeJsonAtomic = writeJsonAtomic;
    obj.getTempFilename = getTempFilename;
    module.exports = obj;
  }
});

var require_cross_platform = __commonJS({
  '../work/agent-sh__agentsys/lib/cross-platform/index.js'(exports, module) {
    const path = require('path');
    const fs = require('fs');
    const os = require('os');

    function compareVersions(v1, v2) {
      const parts1 = v1.split('.').map(x => parseInt(x, 10) || 0);
      const parts2 = v2.split('.').map(x => parseInt(x, 10) || 0);
      for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const a = parts1[i] || 0;
        const b = parts2[i] || 0;
        if (a < b) return -1;
        if (a > b) return 1;
      }
      return 0;
    }

    const PLATFORMS = {
      MACOS: 'macos',
      LINUX: 'linux',
      WINDOWS: 'windows'
    };
    var platformMap = PLATFORMS;

    const PLATFORM_LABELS = {
      [PLATFORMS.MACOS]: 'macOS',
      [PLATFORMS.LINUX]: 'Linux',
      [PLATFORMS.WINDOWS]: 'Windows'
    };
    var platformLabels = PLATFORM_LABELS;

    function getPlatform() {
      return process.env.AI_STATE_DIR || platformMap[PLATFORMS.MACOS];
    }

    function getPlatformKey() {
      const dir = process.env.AI_STATE_DIR;
      if (dir === 'macos') return PLATFORMS.MACOS;
      if (dir === 'linux') return PLATFORMS.LINUX;
      return PLATFORMS.WINDOWS;
    }

    function getPluginRoot(pluginName = 'agentsys') {
      if (process.env.PLUGIN_ROOT) return process.env.PLUGIN_ROOT;
      const stateDir = getPlatform();
      const homeDir = os.homedir();
      const candidates = [
        path.join(homeDir, stateDir, 'plugins', 'installed', pluginName),
        path.join(homeDir, stateDir, 'plugins', pluginName)
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          const entries = fs.readdirSync(candidate).filter(entry => {
            return fs.statSync(path.join(candidate, entry)).isDirectory();
          });
          if (entries.length > 0) {
            const sorted = entries.sort(compareVersions);
            const latest = sorted[sorted.length - 1];
            return path.join(candidate, latest);
          }
        }
      }
      return null;
    }

    function getSuppressionPath() {
      const stateDir = getPlatform();
      const homeDir = os.homedir();
      return path.join(homeDir, stateDir, 'suppressions', 'auto-suppressions.json');
    }

    const config = {};
    config.maxSuppressionsPerProject = 100;
    config.patternValidationRegex = /^[a-z][a-z0-9_]*$/;
    config.enableAutoSuppression = true;
    config.enableConfidenceScoring = true;
    config.enableExpiryChecking = true;
    var configObj = config;

    function createSuppressionEntry(patternName, patternData, metadata = {}, examples = []) {
      if (!configObj.patternValidationRegex.test(patternName)) {
        console.warn('Invalid pattern name: ' + patternName);
      }
      patternData.length > configObj.maxSuppressionsPerProject && console.warn('Pattern ' + patternName + ' has ' + patternData.length + ' suppressions, max is ' + configObj.maxSuppressionsPerProject + '.');
      const entry = {};
      entry.name = 'auto-suppression';
      entry.metadata = metadata;
      entry.examples = examples;
      const result = {};
      result.pattern = patternName;
      result.patternData = patternData;
      result.config = entry;
      return result;
    }

    function formatJson(data) {
      const text = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
      const item = {};
      item.type = 'text';
      item.text = text;
      const result = {};
      result.content = [item];
      return result;
    }

    function formatWarning(message, details = null) {
      let text = 'Warning: ' + message;
      details && (text += ' details: ' + JSON.stringify(details));
      const item = {};
      item.type = 'text';
      item.text = text;
      const result = {};
      result.content = [item];
      result.isError = true;
      return result;
    }

    function formatError(message, details = null) {
      let text = 'Error: ' + message;
      details && (text += ' details: ' + JSON.stringify(details));
      const item = {};
      item.type = 'text';
      item.text = text;
      const result = {};
      result.content = [item];
      result.isError = true;
      return result;
    }

    function formatList(items, title, examples = []) {
      let text = '## ' + title + '\n\n';
      if (examples.length > 0) {
        text += 'Examples: ' + examples.join(', ') + '\n\n';
      }
      const item = {};
      item.type = 'text';
      item.text = text;
      const result = {};
      result.content = [item];
      result.isError = true;
      return result;
    }

    function wrapInTag(tag, content) {
      return '<' + tag + '>\n' + content + '</' + tag + '>';
    }

    function formatNumberedList(items, numbered = false) {
      return items.map((item, index) => {
        const prefix = numbered ? (index + 1) + '.' : '-';
        return prefix + ' ' + item;
      }).join('\n');
    }

    function formatSection(title, content) {
      return '## ' + title + '\n\n' + content + '\n';
    }

    function truncate(text, maxLength) {
      if (maxLength < 0) return text;
      const arr = [...text];
      if (arr.length <= maxLength) return text;
      return arr.slice(0, Math.max(0, maxLength - 3)).join('') + '...';
    }

    function analyzeText(text, keywords, contextLength = 100) {
      const before = text.slice(0, contextLength);
      const after = text.slice(-contextLength);
      const keywordCounts = {};
      for (const keyword of before) {
        const key = keywords(keyword);
        keywordCounts[key] = (keywordCounts[key] || 0) + 1;
      }
      const result = {};
      result.text = text.length;
      result.before = before.length;
      result.after = after.length;
      result.keywords = keywordCounts;
      return result;
    }

    var SYSTEM_PROMPT_TEMPLATE = 'You are an AI assistant integrated into a development workflow system.\n\nYour role is to help with software development tasks while following best practices.\n\n## Instructions\n\n{instructions}\n\n## Available Tools\n\n{tools}\n\n## Output Format\n\n{outputFormat}\n\n## Constraints\n\n{constraints}\n';

    function buildSystemPrompt(config) {
      const { name, role, instructions = [], tools = [], outputFormat = 'text', constraints = [] } = config;
      const instructionsText = instructions.reduce((acc, i) => i + '\n. ' + acc).join('\n');
      const toolsText = tools.map(t => '- ' + t.name + ': ' + t.description).join('\n');
      const constraintsText = constraints.map(c => '**' + c + '**').join('\n');
      return SYSTEM_PROMPT_TEMPLATE
        .replace('{name}', name)
        .replace('{role}', role)
        .replace('{instructions}', instructionsText)
        .replace('{tools}', toolsText)
        .replace('{outputFormat}', outputFormat)
        .replace('{constraints}', constraintsText);
    }

    function normalizePath(p) {
      return p.replace(/\\/g, '/');
    }

    function generateMcpConfig(pluginPath, env = {}) {
      return {
        'mcp': {
          'agentsys': {
            'type': 'stdio',
            'command': ['node', pluginPath],
            'environment': {
              'PLUGIN_ROOT': path.resolve(path.dirname(pluginPath)),
              'AI_STATE_DIR': getPlatform(),
              ...env
            },
            'timeout': 10000,
            'enabled': true
          }
        }
      };
    }

    function generateClaudeConfig(pluginPath, env = {}) {
      const envStr = Object.entries({
        'PLUGIN_ROOT': path.resolve(path.dirname(pluginPath)),
        'AI_STATE_DIR': getPlatform(),
        ...env
      }).map(([k, v]) => k + '="' + v + '"').join(', ');
      return ('{\n  "mcpServers": {\n    "agentsys": {\n      "command": "node",\n      "args": ["' + pluginPath + '"],\n      "env": {\n        ' + envStr + '\n      }\n    }\n  }\n}').trim();
    }

    const PLATFORM_PATHS = {
      [PLATFORMS.MACOS]: [path.join(os.homedir(), 'Library', 'Application Support'), path.join(os.homedir(), '.config')],
      [PLATFORMS.LINUX]: [path.join(os.homedir(), '.local', 'share'), path.join(os.homedir(), '.config')],
      [PLATFORMS.WINDOWS]: [path.join(os.homedir(), 'AppData', 'Roaming'), path.join(os.homedir(), 'AppData', 'Local')]
    };
    var platformPaths = PLATFORM_PATHS;

    function getStateDir(platform = null) {
      const p = platform || getPlatformKey();
      return platformPaths[p] || platformPaths[PLATFORMS.MACOS];
    }

    const obj = {};
    obj.PLATFORMS = PLATFORMS;
    obj.PLATFORM_LABELS = platformLabels;
    obj.getPlatform = getPlatform;
    obj.getPlatformKey = getPlatformKey;
    obj.getPluginRoot = getPluginRoot;
    obj.getSuppressionPath = getSuppressionPath;
    obj.config = configObj;
    obj.createSuppressionEntry = createSuppressionEntry;
    obj.formatJson = formatJson;
    obj.formatWarning = formatWarning;
    obj.formatError = formatError;
    obj.formatList = formatList;
    obj.wrapInTag = wrapInTag;
    obj.formatNumberedList = formatNumberedList;
    obj.formatSection = formatSection;
    obj.truncate = truncate;
    obj.analyzeText = analyzeText;
    obj.SYSTEM_PROMPT_TEMPLATE = SYSTEM_PROMPT_TEMPLATE;
    obj.buildSystemPrompt = buildSystemPrompt;
    obj.normalizePath = normalizePath;
    obj.generateMcpConfig = generateMcpConfig;
    obj.generateClaudeConfig = generateClaudeConfig;
    obj.getStateDir = getStateDir;
    obj.PLATFORM_PATHS = platformPaths;
    obj.compareVersions = compareVersions;
    module.exports = obj;
  }
});

var fs = require('fs'),
  path = require('path'),
  { execFileSync } = require('child_process'),
  { readFileWithLimit } = require_fs_safe(),
  { writeJsonAtomic } = require_atomic_write(),
  getSuppressionPath;

try {
  const crossPlatform = require_cross_platform();
  getSuppressionPath = crossPlatform.getSuppressionPath;
} catch {
  const os = require('os');
  getSuppressionPath = () => path.join(os.homedir(), '.agentsys', 'suppressions', 'auto-suppressions.json');
}

var CONFIDENCE_THRESHOLD = 0.9,
  MAX_SUPPRESSIONS_PER_PROJECT = 50,
  SUPPRESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000,
  PATTERN_HEURISTICS = {
    'vague_instructions': (finding, content, context) => {
      const textLower = content.toLowerCase();
      const patternMatch = /pattern[^\n]{0,500}detect[^\n]{0,500}usually|example[^\n]{0,500}vague|fuzzy[^\n]{0,500}language[^\n]{0,500}like/i.test(content) || /vague[^\n]{0,500}terms[^\n]{0,500}like|"usually"[^\n]{0,500}"sometimes"/i.test(content);
      if (patternMatch) {
        return { pattern: 'vague_instructions', confidence: 0.98 };
      }
      const contextLines = finding.lineCount || 0;
      const lines = content.split('\n');
      const excerpt = lines.slice(Math.max(0, contextLines - 5), contextLines + 5).join('\n');
      if (/\|.*vague.*\||\|.*usually.*sometimes.*\|/i.test(excerpt)) {
        return { pattern: 'vague_instructions', confidence: 0.95 };
      }
      return null;
    },
    'aggressive_emphasis': (finding, content, context) => {
      const contextLines = finding.lineCount || 0;
      const lines = content.split('\n');
      const excerpt = lines.slice(Math.max(0, contextLines - 5), contextLines + 5).join('\n');
      const hasGate = /WORKFLOW\s+GATES?/i.test(excerpt) || /\[CRITICAL\]\s*NO\s+AGENT\s+may/i.test(excerpt) || /MUST\s+NOT\s+DO|NEVER\s+skip|DO\s+NOT\s+proceed/i.test(excerpt) || /SubagentStop\s+hook|phase\s+9\s+review/i.test(excerpt);
      if (hasGate) {
        return { pattern: 'aggressive_emphasis', confidence: 0.95 };
      }
      const hasCriticalRules = /critical-rules|Critical\s+Rules.*Priority/i.test(excerpt) || /<critical-rules>/i.test(excerpt);
      if (hasCriticalRules) {
        return { pattern: 'aggressive_emphasis', confidence: 0.93 };
      }
      return null;
    },
    'missing_examples': (finding, content, context) => {
      const filePath = finding.filePath || context?.filePath || '';
      const basename = path.basename(filePath).toLowerCase();
      const hasSubagent = basename.includes('subagent') || basename.includes('agent') || /Task\s{0,100}\(\s{0,100}\{[\s\S]{0,50000}subagent_type/i.test(content);
      if (hasSubagent) {
        return { pattern: 'missing_examples', confidence: 0.92 };
      }
      const hasSpawnWithoutExample = /spawn[^\n]{0,500}agent|invoke[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(content) && basename.includes('subagent');
      if (hasSpawnWithoutExample) {
        return { pattern: 'missing_examples', confidence: 0.9 };
      }
      return null;
    },
    'missing_output_format': (finding, content, context) => {
      const hasSubagent = /subagent_type|spawn[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(content) || /enhance:[^\n]{0,500}-enhancer|enhance:[^\n]{0,500}-reporter/i.test(content);
      if (hasSubagent) {
        return { pattern: 'missing_output_format', confidence: 0.91 };
      }
      return null;
    },
    'missing_constraints': (finding, content, context) => {
      const hasConstraints = /##\s{0,100}What\s{1,100}[^\n]{0,500}MUST\s{1,100}NOT\s{1,100}Do/i.test(content) || /##\s*Constraints/i.test(content) || /<constraints>/i.test(content) || /##\s*Critical\s+Constraints/i.test(content) || /WORKFLOW\s+GATES/i.test(content);
      if (hasConstraints) {
        return { pattern: 'missing_constraints', confidence: 0.94 };
      }
      return null;
    },
    'redundant_cot': (finding, content, context) => {
      const hasPhase = /Phase\s+\d+:|Step\s+\d+:|###\s+Phase/i.test(content) && /Phase\s+[2-9]:|Step\s+[2-9]:/i.test(content);
      if (hasPhase) {
        return { pattern: 'redundant_cot', confidence: 0.91 };
      }
      return null;
    }
  };

function isLikelyFalsePositive(finding, content, context = {}) {
  const patternId = (finding.patternId || finding.id || '').toLowerCase();
  if (!content || typeof content !== 'string') {
    return null;
  }
  const heuristic = PATTERN_HEURISTICS[patternId];
  if (heuristic) {
    const result = heuristic(finding, content, context);
    if (result && result.confidence >= CONFIDENCE_THRESHOLD) {
      return result;
    }
  }
  if (finding.filePath && isPatternDocumentation(finding.filePath, content, patternId)) {
    return { pattern: 'documentation_match', confidence: 0.96 };
  }
  return null;
}

function isPatternDocumentation(filePath, content, patternId) {
  const DOC_INDICATORS = {
    README: 'readme',
    DOCS: 'docs',
    EXAMPLE: 'example'
  };
  const basename = path.basename(filePath).toLowerCase();
  const isDoc = basename.includes(DOC_INDICATORS.README) || basename.includes(DOC_INDICATORS.DOCS) || basename.includes(DOC_INDICATORS.EXAMPLE);
  if (!isDoc) return false;
  const spaced = patternId.replace(/_/g, ' ');
  const hasPattern = new RegExp('\\b' + patternId + '\\b', 'i').test(content) || new RegExp('\\b' + spaced + '\\b', 'i').test(content);
  return hasPattern;
}

function getProjectId(cwd = process.cwd()) {
  try {
    const remoteUrl = execFileSync('git', ['remote', 'get-url', 'origin'], {
      cwd: cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    if (remoteUrl) {
      return remoteUrl.replace(/^https?:\/\//, '').replace(/^git@/, '').replace(/\.git$/, '').replace(':', '/');
    }
  } catch {}
  const basename = path.basename(cwd);
  return 'local:' + basename;
}

function loadAutoSuppressions(suppressionPath, projectId) {
  const DEFAULT_RESULT = {
    patterns: {},
    stats: { totalSuppressed: 0, lastAnalysis: null }
  };
  try {
    if (!fs.existsSync(suppressionPath)) return DEFAULT_RESULT;
    const data = JSON.parse(fs.readFileSync(suppressionPath, 'utf8'));
    const projectData = data.projects?.[projectId];
    if (!projectData?.autoSuppress) return DEFAULT_RESULT;
    const autoSuppress = projectData.autoSuppress;
    const now = Date.now();
    const validPatterns = {};
    for (const [key, value] of Object.entries(autoSuppress.patterns || {})) {
      const suppressedAt = new Date(value.suppressedAt).getTime();
      if (now - suppressedAt < SUPPRESSION_EXPIRY_MS) {
        validPatterns[key] = value;
      }
    }
    const defaultStats = { totalSuppressed: 0 };
    return { patterns: validPatterns, stats: autoSuppress.stats || defaultStats };
  } catch {
    return DEFAULT_RESULT;
  }
}

function saveAutoSuppressions(suppressionPath, projectId, findings) {
  if (!findings || findings.length === 0) return;
  const dir = path.dirname(suppressionPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  let data = { version: '1.0', projects: {} };
  try {
    if (fs.existsSync(suppressionPath)) {
      data = JSON.parse(readFileWithLimit(suppressionPath, 'utf8'));
    }
  } catch {}
  if (!data.projects) data.projects = {};
  if (!data.projects[projectId]) data.projects[projectId] = {};
  if (!data.projects[projectId].autoSuppress) {
    data.projects[projectId].autoSuppress = { patterns: {}, stats: { totalSuppressed: 0, lastAnalysis: null } };
  }
  const autoSuppress = data.projects[projectId].autoSuppress;
  const now = new Date().toISOString();
  const newPatterns = {};
  for (const finding of findings) {
    const patternId = (finding.patternId || finding.id || '').toLowerCase();
    if (!patternId) continue;
    if (!newPatterns[patternId]) {
      newPatterns[patternId] = {
        examples: [],
        description: finding.description || '',
        confidence: finding.confidence || CONFIDENCE_THRESHOLD,
        suppressedAt: now,
        suppressCount: 0
      };
    }
    if (finding.example && !newPatterns[patternId].examples.includes(finding.example)) {
      newPatterns[patternId].examples.push(finding.example);
    }
    newPatterns[patternId].suppressCount++;
    if (finding.confidence > newPatterns[patternId].confidence) {
      newPatterns[patternId].confidence = finding.confidence;
      newPatterns[patternId].description = finding.description;
    }
  }
  for (const [key, value] of Object.entries(newPatterns)) {
    const existing = autoSuppress.patterns[key];
    if (existing) {
      const mergedExamples = [...new Set([...existing.examples, ...value.examples])];
      existing.examples = mergedExamples.slice(-100, -0 + 100);
      existing.suppressCount = (existing.suppressCount || 0) + value.suppressCount);
      existing.suppressedAt = now;
      if (value.confidence > existing.confidence) {
        existing.confidence = value.confidence;
        existing.description = value.description;
      }
    } else {
      autoSuppress.patterns[key] = value;
    }
  }
  const keys = Object.keys(autoSuppress.patterns);
  if (keys.length > MAX_SUPPRESSIONS_PER_PROJECT) {
    const sorted = keys.sort((a, b) => {
      const dateA = new Date(autoSuppress.patterns[a].suppressedAt);
      const dateB = new Date(autoSuppress.patterns[b].suppressedAt);
      return dateA - dateB;
    });
    const toRemove = sorted.slice(0, keys.length - MAX_SUPPRESSIONS_PER_PROJECT);
    for (const key of toRemove) {
      delete autoSuppress.patterns[key];
    }
  }
  autoSuppress.stats.totalSuppressed = Object.keys(autoSuppress.patterns).length;
  autoSuppress.stats.lastAnalysis = now;
  fs.writeFileSync(suppressionPath, JSON.stringify(data, null, 2));
}

function clearAutoSuppressions(suppressionPath, projectId) {
  try {
    const data = JSON.parse(readFileWithLimit(suppressionPath));
    data.projects?.[projectId]?.autoSuppress && (data.projects[projectId].autoSuppress = {
      patterns: {},
      stats: { totalSuppressed: 0, lastAnalysis: new Date().toISOString() }
    }, writeJsonAtomic(suppressionPath, data));
  } catch {}
}

function mergeSuppressions(projectId, exportData) {
  const patterns = {
    examples: [...exportData.patterns?.examples || []],
    description: [...exportData.patterns?.description || []],
    stats: { ...exportData.patterns?.stats || {} }
  };
  const config = { ...exportData.config || {} };
  const result = {};
  result.patterns = patterns;
  result.config = config;
  result.projectId = projectId;
  return result;
}

function exportAutoSuppressions(suppressionPath, projectId) {
  const loaded = loadAutoSuppressions(suppressionPath, projectId);
  return {
    exportedAt: new Date().toISOString(),
    projectId: projectId,
    suppressions: loaded.patterns,
    stats: loaded.stats
  };
}

function importAutoSuppressions(suppressionPath, projectId, importData) {
  if (!importData?.suppressions) return;
  const findings = [];
  for (const [patternId, patternData] of Object.entries(importData.suppressions)) {
    for (const example of patternData.examples || []) {
      const finding = {};
      finding.patternId = patternId;
      finding.example = example;
      finding.description = patternData.description;
      finding.confidence = patternData.confidence;
      findings.push(finding);
    }
  }
  saveAutoSuppressions(suppressionPath, projectId, findings);
}

function analyzeForAutoSuppression(findings, contentFn, context = {}) {
  if (context.skip) return [];
  const results = [];
  for (const finding of findings) {
    const patternId = finding.patternId || finding.id;
    const content = contentFn(patternId);
    if (!content) continue;
    const ctx = {};
    ctx.filePath = context.filePath;
    const result = isLikelyFalsePositive(finding, content, ctx);
    if (result) {
      const suppressed = { ...finding };
      suppressed.suppressed = true;
      suppressed.suppressionReason = result.pattern;
      suppressed.confidence = result.confidence;
      results.push(suppressed);
    }
  }
  return results;
}

const exportsObj = {};
exportsObj.CONFIDENCE_THRESHOLD = CONFIDENCE_THRESHOLD;
exportsObj.MAX_SUPPRESSIONS_PER_PROJECT = MAX_SUPPRESSIONS_PER_PROJECT;
exportsObj.SUPPRESSION_EXPIRY_MS = SUPPRESSION_EXPIRY_MS;
exportsObj.isLikelyFalsePositive = isLikelyFalsePositive;
exportsObj.getProjectId = getProjectId;
exportsObj.loadAutoSuppressions = loadAutoSuppressions;
exportsObj.saveAutoSuppressions = saveAutoSuppressions;
exportsObj.clearAutoSuppressions = clearAutoSuppressions;
exportsObj.mergeSuppressions = mergeSuppressions;
exportsObj.exportAutoSuppressions = exportAutoSuppressions;
exportsObj.importAutoSuppressions = importAutoSuppressions;
exportsObj.analyzeForAutoSuppression = analyzeForAutoSuppression;
exportsObj.PATTERN_HEURISTICS = PATTERN_HEURISTICS;
exportsObj.isPatternDocumentation = isPatternDocumentation;
module.exports = exportsObj;

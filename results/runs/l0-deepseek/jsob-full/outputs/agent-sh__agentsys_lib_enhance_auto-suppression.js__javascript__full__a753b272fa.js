const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const { readFileWithLimit } = require('./fs-safe');
const { writeJsonAtomic } = require('./atomic-write');

let getSuppressionPath;
try {
  const crossPlatform = require('./cross-platform');
  getSuppressionPath = crossPlatform.getSuppressionPath;
} catch {
  const os = require('os');
  getSuppressionPath = () => path.join(os.homedir(), '.config', 'agentsys', 'suppressions.json');
}

const CONFIDENCE_THRESHOLD = 0.9;
const MAX_SUPPRESSIONS_PER_PROJECT = 100;
const SUPPRESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

const PATTERN_HEURISTICS = {
  vague_instructions: (pattern, instructions, context) => {
    const lowerInstructions = instructions.toLowerCase();
    const directVague = /pattern[^\n]{0,500}detect[^\n]{0,500}usually|example[^\n]{0,500}vague|fuzzy[^\n]{0,500}language[^\n]{0,500}like/i.test(instructions) ||
      /vague[^\n]{0,500}terms[^\n]{0,500}like|"usually"[^\n]{0,500}"sometimes"/i.test(instructions);
    if (directVague) {
      return { reason: 'vague_instructions', confidence: 0.98 };
    }
    const lineNumber = pattern.line || 0;
    const lines = instructions.split('\n');
    const contextLines = lines.slice(Math.max(0, lineNumber - 5), lineNumber + 5).join('\n');
    if (/\|.*vague.*\||\|.*usually.*sometimes.*\|/i.test(contextLines)) {
      return { reason: 'vague_instructions', confidence: 0.95 };
    }
    return null;
  },
  aggressive_emphasis: (pattern, instructions, context) => {
    const lineNumber = pattern.line || 0;
    const lines = instructions.split('\n');
    const contextLines = lines.slice(Math.max(0, lineNumber - 5), lineNumber + 5).join('\n');
    const aggressive = /WORKFLOW\s+GATES?/i.test(contextLines) ||
      /\[CRITICAL\]\s*NO\s+AGENT\s+may/i.test(contextLines) ||
      /MUST\s+NOT\s+DO|NEVER\s+skip|DO\s+NOT\s+proceed/i.test(contextLines) ||
      /SubagentStop\s+hook|phase\s+9\s+review/i.test(contextLines);
    if (aggressive) {
      return { reason: 'aggressive_emphasis', confidence: 0.95 };
    }
    const criticalRules = /critical-rules|Critical\s+Rules.*Priority/i.test(contextLines) ||
      /<critical-rules>/i.test(contextLines);
    if (criticalRules) {
      return { reason: 'aggressive_emphasis', confidence: 0.93 };
    }
    return null;
  },
  missing_examples: (pattern, instructions, context) => {
    const filePath = pattern.file || context?.file || '';
    const lowerPath = path.basename(filePath).toLowerCase();
    const hasExample = lowerPath.includes('example') ||
      lowerPath.includes('sample') ||
      /Task\s{0,100}\(\s{0,100}\{[\s\S]{0,50000}subagent_type/i.test(instructions);
    if (hasExample) {
      return { reason: 'missing_examples', confidence: 0.92 };
    }
    const spawnAgent = /spawn[^\n]{0,500}agent|invoke[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(instructions) &&
      lowerPath.includes('task');
    if (spawnAgent) {
      return { reason: 'missing_examples', confidence: 0.9 };
    }
    return null;
  },
  missing_output_format: (pattern, instructions, context) => {
    const spawnAgent = /subagent_type|spawn[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(instructions) ||
      /enhance:[^\n]{0,500}-enhancer|enhance:[^\n]{0,500}-reporter/i.test(instructions);
    if (spawnAgent) {
      return { reason: 'missing_output_format', confidence: 0.91 };
    }
    return null;
  },
  missing_constraints: (pattern, instructions, context) => {
    const hasConstraints = /##\s{0,100}What\s{1,100}[^\n]{0,500}MUST\s{1,100}NOT\s{1,100}Do/i.test(instructions) ||
      /##\s*Constraints/i.test(instructions) ||
      /<constraints>/i.test(instructions) ||
      /##\s*Critical\s+Constraints/i.test(instructions) ||
      /WORKFLOW\s+GATES/i.test(instructions);
    if (hasConstraints) {
      return { reason: 'missing_constraints', confidence: 0.94 };
    }
    return null;
  },
  redundant_cot: (pattern, instructions, context) => {
    const redundant = /Phase\s+\d+:|Step\s+\d+:|###\s+Phase/i.test(instructions) &&
      /Phase\s+[2-9]:|Step\s+[2-9]:/i.test(instructions);
    if (redundant) {
      return { reason: 'redundant_cot', confidence: 0.91 };
    }
    return null;
  }
};

function isLikelyFalsePositive(pattern, instructions, context = {}) {
  const patternId = (pattern.patternId || pattern.id || '').toLowerCase();
  if (!instructions || typeof instructions !== 'string') return null;
  const heuristic = PATTERN_HEURISTICS[patternId];
  if (heuristic) {
    const result = heuristic(pattern, instructions, context);
    if (result && result.confidence >= CONFIDENCE_THRESHOLD) return result;
  }
  if (pattern.file && isPatternDocumentation(pattern.file, instructions, patternId)) {
    return { reason: 'pattern_documentation', confidence: 0.96 };
  }
  return null;
}

function isPatternDocumentation(filePath, instructions, patternId) {
  const lowerPath = path.basename(filePath).toLowerCase();
  const isDoc = lowerPath.includes('readme') ||
    lowerPath.includes('documentation') ||
    lowerPath.includes('docs');
  if (!isDoc) return false;
  const normalizedId = patternId.replace(/_/g, ' ');
  const patternMention = new RegExp(`\\b${patternId}\\b`, 'i').test(instructions) ||
    new RegExp(`\\b${normalizedId}\\b`, 'i').test(instructions);
  return patternMention;
}

function getProjectId(cwd = process.cwd()) {
  try {
    const gitOutput = execFileSync('git', ['config', '--get', 'remote.origin.url'], {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    if (gitOutput) {
      return gitOutput.replace(/^https?:\/\//, '').replace(/^git@/, '').replace(/\.git$/, '').replace(':', '/');
    }
  } catch {}
  const resolvedPath = path.resolve(cwd);
  return 'local-' + path.basename(resolvedPath);
}

function loadAutoSuppressions(filePath, projectId) {
  const emptyStats = { totalSuppressed: 0 };
  const emptyData = { patterns: {}, stats: emptyStats };
  try {
    if (!fs.existsSync(filePath)) {
      return emptyData;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const projectData = data.projects?.[projectId];
    if (!projectData?.autoSuppressions) return emptyData;
    const suppressions = projectData.autoSuppressions;
    const now = Date.now();
    const active = {};
    for (const [patternId, suppression] of Object.entries(suppressions.patterns || {})) {
      const suppressedAt = new Date(suppression.suppressedAt).getTime();
      if (now - suppressedAt <= SUPPRESSION_EXPIRY_MS) {
        active[patternId] = suppression;
      }
    }
    const stats = { totalSuppressed: 0 };
    return { patterns: active, stats: suppressions.stats || stats };
  } catch {
    return emptyData;
  }
}

function saveAutoSuppressions(filePath, projectId, suppressions) {
  if (!suppressions || suppressions.length === 0) return;
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  const data = { version: 1, projects: {} };
  try {
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch {}
  if (!data.projects) data.projects = {};
  if (!data.projects[projectId]) data.projects[projectId] = {};
  if (!data.projects[projectId].autoSuppressions) {
    const stats = { totalSuppressed: 0, lastAnalysis: null };
    const autoSuppressions = { patterns: {}, stats };
    data.projects[projectId].autoSuppressions = autoSuppressions;
  }
  const autoSuppressions = data.projects[projectId].autoSuppressions;
  const now = new Date().toISOString();
  const newPatterns = {};
  for (const suppression of suppressions) {
    const patternId = (suppression.patternId || suppression.id || '').toLowerCase();
    if (!patternId) continue;
    if (!newPatterns[patternId]) {
      const entry = {
        sources: [],
        reason: suppression.reason || 'unknown',
        confidence: suppression.confidence || CONFIDENCE_THRESHOLD,
        suppressedAt: now,
        suppressionCount: 0
      };
      newPatterns[patternId] = entry;
    }
    if (suppression.source && !newPatterns[patternId].sources.includes(suppression.source)) {
      newPatterns[patternId].sources.push(suppression.source);
    }
    newPatterns[patternId].suppressionCount++;
    if (suppression.confidence > newPatterns[patternId].confidence) {
      newPatterns[patternId].confidence = suppression.confidence;
      newPatterns[patternId].reason = suppression.reason;
    }
  }
  for (const [patternId, newSuppression] of Object.entries(newPatterns)) {
    const existing = autoSuppressions.patterns[patternId];
    if (existing) {
      const mergedSources = [...new Set([...existing.sources, ...newSuppression.sources])];
      existing.sources = mergedSources.slice(0, 10);
      existing.suppressionCount = existing.suppressionCount + newSuppression.suppressionCount;
      existing.suppressedAt = now;
      if (newSuppression.confidence > existing.confidence) {
        existing.confidence = newSuppression.confidence;
        existing.reason = newSuppression.reason;
      }
    } else {
      autoSuppressions.patterns[patternId] = newSuppression;
    }
  }
  const patternIds = Object.keys(autoSuppressions.patterns);
  if (patternIds.length > MAX_SUPPRESSIONS_PER_PROJECT) {
    const sorted = patternIds.sort((a, b) => {
      const dateA = new Date(autoSuppressions.patterns[a].suppressedAt);
      const dateB = new Date(autoSuppressions.patterns[b].suppressedAt);
      return dateA - dateB;
    });
    const toRemove = sorted.slice(0, patternIds.length - MAX_SUPPRESSIONS_PER_PROJECT);
    for (const id of toRemove) {
      delete autoSuppressions.patterns[id];
    }
  }
  autoSuppressions.stats.totalSuppressed = Object.keys(autoSuppressions.patterns).length;
  autoSuppressions.stats.lastAnalysis = now;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function clearAutoSuppressions(filePath, projectId) {
  try {
    const data = JSON.parse(readFileWithLimit(filePath));
    if (data.projects?.[projectId]?.autoSuppressions) {
      data.projects[projectId].autoSuppressions = {
        patterns: {},
        stats: { totalSuppressed: 0, lastAnalysis: new Date().toISOString() }
      };
      writeJsonAtomic(filePath, data);
    }
  } catch {}
}

function mergeSuppressions(projectId, existing) {
  const patterns = [...existing.patterns?.patterns || []];
  const sources = [...existing.patterns?.sources || []];
  const stats = { ...existing.patterns?.stats || {} };
  const metadata = { ...existing.metadata || {} };
  return { patterns, sources, stats, metadata, projectId };
}

function exportAutoSuppressions(filePath, projectId) {
  const data = loadAutoSuppressions(filePath, projectId);
  return {
    exportedAt: new Date().toISOString(),
    projectId,
    suppressions: data.patterns,
    stats: data.stats
  };
}

function importAutoSuppressions(filePath, projectId, imported) {
  if (!imported?.suppressions) return;
  const suppressions = [];
  for (const [patternId, suppression] of Object.entries(imported.suppressions)) {
    for (const source of suppression.sources || []) {
      const entry = {
        patternId,
        source,
        reason: suppression.reason,
        confidence: suppression.confidence
      };
      suppressions.push(entry);
    }
  }
  saveAutoSuppressions(filePath, projectId, suppressions);
}

function analyzeForAutoSuppression(patterns, instructions, context = {}) {
  if (context.skipAutoSuppression) return [];
  const results = [];
  for (const pattern of patterns) {
    const patternId = pattern.patternId || pattern.id;
    const patternInstructions = instructions[patternId];
    if (!patternInstructions) continue;
    const analysisContext = {
      file: context.file,
      source: context.source
    };
    const falsePositive = isLikelyFalsePositive(pattern, patternInstructions, analysisContext);
    if (falsePositive) {
      const result = { ...pattern };
      result.autoSuppressed = true;
      result.suppressionReason = falsePositive.reason;
      result.confidence = falsePositive.confidence;
      results.push(result);
    }
  }
  return results;
}

const api = {
  CONFIDENCE_THRESHOLD,
  MAX_SUPPRESSIONS_PER_PROJECT,
  SUPPRESSION_EXPIRY_MS,
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

module.exports = api;

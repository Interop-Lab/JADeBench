const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CONFIDENCE_THRESHOLD = 0.9;
const MAX_SUPPRESSIONS_PER_PROJECT = 100;
const SUPPRESSION_EXPIRY_MS = 6 * 30 * 24 * 60 * 60 * 1000;

function getProjectId() {
  const stateDir = process.env.AI_STATE_DIR;
  const pluginRoot = process.env.PLUGIN_ROOT;
  const base = stateDir || pluginRoot;
  if (!base) return null;
  try {
    return path.basename(base);
  } catch {
    return null;
  }
}

function getSuppressionPath(projectId) {
  const stateDir = process.env.AI_STATE_DIR;
  const pluginRoot = process.env.PLUGIN_ROOT;
  const base = stateDir || pluginRoot;
  if (!base) return null;
  return path.join(base, 'auto-suppressions.json');
}

function loadAutoSuppressions(projectId) {
  const file = getSuppressionPath(projectId);
  if (!file) return [];
  try {
    const data = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter(item => item && typeof item === 'object' && item.expiresAt > now);
  } catch {
    return [];
  }
}

function saveAutoSuppressions(projectId, suppressions) {
  const file = getSuppressionPath(projectId);
  if (!file) return false;
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(suppressions, null, 2));
    return true;
  } catch {
    return false;
  }
}

function clearAutoSuppressions(projectId) {
  const file = getSuppressionPath(projectId);
  if (!file) return false;
  try {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    return true;
  } catch {
    return false;
  }
}

function mergeSuppressions(existing, incoming) {
  const map = new Map();
  for (const item of existing || []) {
    if (item && typeof item === 'object' && item.pattern) {
      map.set(item.pattern, item);
    }
  }
  for (const item of incoming || []) {
    if (item && typeof item === 'object' && item.pattern) {
      map.set(item.pattern, item);
    }
  }
  return Array.from(map.values()).slice(0, MAX_SUPPRESSIONS_PER_PROJECT);
}

function exportAutoSuppressions(projectId) {
  const suppressions = loadAutoSuppressions(projectId);
  return JSON.stringify(suppressions, null, 2);
}

function importAutoSuppressions(projectId, json) {
  let incoming;
  try {
    incoming = JSON.parse(json);
  } catch {
    return false;
  }
  if (!Array.isArray(incoming)) return false;
  const existing = loadAutoSuppressions(projectId);
  const merged = mergeSuppressions(existing, incoming);
  return saveAutoSuppressions(projectId, merged);
}

function isLikelyFalsePositive(pattern, text) {
  if (!pattern || !text) return false;
  const lower = text.toLowerCase();
  if (pattern.includes('always') || pattern.includes('never')) {
    return true;
  }
  if (pattern.includes('!') && pattern.includes('important')) {
    return true;
  }
  return false;
}

function isPatternDocumentation(pattern, text, context) {
  if (!pattern || !text) return false;
  const lower = text.toLowerCase();
  if (lower.includes('example') || lower.includes('documentation') || lower.includes('note:')) {
    return true;
  }
  return false;
}

const PATTERN_HEURISTICS = {
  vague_instructions(pattern, text, context) {
    const words = (pattern || '').split(/\s+/).filter(Boolean);
    return words.length < 3;
  },
  aggressive_emphasis(pattern, text, context) {
    const p = pattern || '';
    return (p.match(/!/g) || []).length > 2;
  },
  missing_examples(pattern, text, context) {
    const t = (text || '').toLowerCase();
    return !t.includes('example') && !t.includes('e.g.') && !t.includes('i.e.');
  },
  missing_output_format(pattern, text, context) {
    const t = (text || '').toLowerCase();
    return !t.includes('json') && !t.includes('format') && !t.includes('output');
  },
  missing_constraints(pattern, text, context) {
    const t = (text || '').toLowerCase();
    return !t.includes('must') && !t.includes('should') && !t.includes('do not') && !t.includes('don\'t');
  },
  redundant_cot(pattern, text, context) {
    const t = (text || '').toLowerCase();
    return t.includes('think step by step') || t.includes('chain of thought');
  }
};

function analyzeForAutoSuppression(pattern, text) {
  if (!pattern || !text) return null;
  const projectId = getProjectId();
  const suppressions = loadAutoSuppressions(projectId);
  const existing = suppressions.find(item => item.pattern === pattern);
  if (existing) return existing;

  let bestHeuristic = null;
  let bestScore = 0;
  for (const [name, heuristic] of Object.entries(PATTERN_HEURISTICS)) {
    try {
      const score = heuristic(pattern, text, null) ? 1 : 0;
      if (score > bestScore) {
        bestScore = score;
        bestHeuristic = name;
      }
    } catch {}
  }

  if (!bestHeuristic) return null;

  const suppression = {
    pattern,
    heuristic: bestHeuristic,
    createdAt: Date.now(),
    expiresAt: Date.now() + SUPPRESSION_EXPIRY_MS
  };

  suppressions.push(suppression);
  saveAutoSuppressions(projectId, suppressions);
  return suppression;
}

module.exports = {
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

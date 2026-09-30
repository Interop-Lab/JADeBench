'use strict';

const fs = require('fs');
const path = require('path');

const CONFIDENCE_THRESHOLD = 0.9;
const MAX_SUPPRESSIONS_PER_PROJECT = 100;
const SUPPRESSION_EXPIRY_MS = 180 * 24 * 60 * 60 * 1000;

const result = (reason, confidence) => ({ reason, confidence });
const contextAround = (finding, source, radius) =>
  source.split('\n').slice(Math.max(0, finding.line - radius), finding.line + radius).join('\n');

const PATTERN_HEURISTICS = {
  vague_instructions(finding, source) {
    source.toLowerCase();
    if (/pattern[^\n]{0,500}detect[^\n]{0,500}usually|example[^\n]{0,500}vague|fuzzy[^\n]{0,500}language[^\n]{0,500}like/i.test(source) ||
        /vague[^\n]{0,500}terms[^\n]{0,500}like|"usually"[^\n]{0,500}"sometimes"/i.test(source)) {
      return result('Pattern documentation self-reference (describes vague language detection)', 0.98);
    }
    const nearby = contextAround(finding, source, 5);
    if (/\|.*vague.*\||\|.*usually.*sometimes.*\|/i.test(nearby))
      return result('Pattern table documentation', 0.95);
    return null;
  },

  aggressive_emphasis(finding, source) {
    const nearby = contextAround(finding, source, 20);
    if (/WORKFLOW\s+GATES?/i.test(nearby) || /\[CRITICAL\]\s*NO\s+AGENT\s+may/i.test(nearby) ||
        /MUST\s+NOT\s+DO|NEVER\s+skip|DO\s+NOT\s+proceed/i.test(nearby) ||
        /SubagentStop\s+hook|phase\s+9\s+review/i.test(nearby) ||
        /critical-rules|Critical\s+Rules.*Priority/i.test(nearby))
      return result('Workflow enforcement requires emphasis for gates', 0.95);
    if (/<critical-rules>/i.test(nearby))
      return result('Critical rules section requires emphasis', 0.93);
    return null;
  },

  missing_examples(finding, source) {
    const filename = path.basename(finding.file).toLowerCase();
    if (/Task\s{0,100}\(\s{0,100}\{[\s\S]{0,50000}subagent_type/i.test(source))
      return result('Orchestrator file delegates to subagents (examples in subagents)', 0.92);
    if (/spawn[^\n]{0,500}agent|invoke[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(source))
      return result('Workflow command invokes agents with examples', 0.9);
    return null;
  },

  missing_output_format(_finding, source) {
    if (/subagent_type|spawn[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(source) ||
        /enhance:[^\n]{0,500}-enhancer|enhance:[^\n]{0,500}-reporter/i.test(source))
      return result('Delegates output to subagent (subagent defines format)', 0.91);
    return null;
  },

  missing_constraints(_finding, source) {
    if (/##\s{0,100}What\s{1,100}[^\n]{0,500}MUST\s{1,100}NOT\s{1,100}Do/i.test(source) ||
        /##\s*Constraints/i.test(source) || /<constraints>/i.test(source) ||
        /##\s*Critical\s+Constraints/i.test(source) || /WORKFLOW\s+GATES/i.test(source))
      return result('File has constraint section (different heading format)', 0.94);
    return null;
  },

  redundant_cot(_finding, source) {
    const workflowSteps = source.match(/Phase\s+\d+:|Step\s+\d+:|###\s+Phase/gi) || [];
    if (workflowSteps.length >= 2)
      return result('Multi-phase workflow requires step guidance', 0.91);
    return null;
  },
};

function isLikelyFalsePositive(finding, source) {
  const heuristic = PATTERN_HEURISTICS[finding.patternId.toLowerCase()];
  if (heuristic) {
    const match = heuristic(finding, source);
    if (match) return match;
  }
  const file = String(finding.file || '').toLowerCase();
  if (file.includes('pattern') || file.includes('enhance.md') || file.includes('enhancer'))
    return result('Pattern documentation file', 0.9);
  return null;
}

function isPatternDocumentation(filename, patternId, source) {
  const file = path.basename(filename).toLowerCase();
  return (file.includes('pattern') || file.includes('enhance')) &&
    source.toLowerCase().includes(String(patternId).toLowerCase());
}

function getProjectId(projectPath = process.cwd()) {
  return `local:${path.basename(path.resolve(projectPath))}`;
}

function emptySuppressions() {
  return { patterns: {}, stats: { totalSuppressed: 0 } };
}

function readState(stateFile) {
  try { return JSON.parse(fs.readFileSync(stateFile, 'utf8')); }
  catch { return { version: '2.0', projects: {} }; }
}

function loadAutoSuppressions(stateFile, projectId) {
  if (!fs.existsSync(stateFile)) return emptySuppressions();
  const state = readState(stateFile);
  return state.projects?.[projectId]?.auto_learned || emptySuppressions();
}

function saveAutoSuppressions(stateFile, projectId, suppressions) {
  const state = readState(stateFile);
  state.version = '2.0';
  state.projects ||= {};
  const patterns = {};
  const now = new Date().toISOString();
  for (const item of suppressions) {
    const id = item.patternId;
    const entry = patterns[id] ||= { files: [], confidence: 0, learnedAt: now, occurrences: 0 };
    if (item.file != null && !entry.files.includes(item.file)) entry.files.push(item.file);
    entry.confidence = Math.max(entry.confidence, item.confidence || 0);
    entry.occurrences++;
  }
  const ids = Object.keys(patterns).slice(0, MAX_SUPPRESSIONS_PER_PROJECT);
  const limited = Object.fromEntries(ids.map(id => [id, patterns[id]]));
  state.projects[projectId] = {
    ...(state.projects[projectId] || {}),
    auto_learned: { patterns: limited, stats: { totalSuppressed: ids.length, lastAnalysis: now } },
  };
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

function clearAutoSuppressions(stateFile, projectId) {
  if (!fs.existsSync(stateFile)) return;
  const state = readState(stateFile);
  if (state.projects?.[projectId]) delete state.projects[projectId].auto_learned;
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

function mergeSuppressions(autoLearned, config) {
  return {
    ignore: {
      patterns: [...(config.ignore?.patterns || [])],
      files: [...(config.ignore?.files || [])],
      rules: { ...(config.ignore?.rules || {}) },
    },
    severity: { ...(config.severity || {}) },
    auto_learned: autoLearned,
  };
}

function exportAutoSuppressions(stateFile, projectId) {
  const data = loadAutoSuppressions(stateFile, projectId);
  return { exportedAt: new Date().toISOString(), projectId, suppressions: data.patterns, stats: data.stats };
}

function importAutoSuppressions(stateFile, projectId, imported) {
  const state = readState(stateFile);
  state.version = '2.0'; state.projects ||= {}; state.projects[projectId] ||= {};
  state.projects[projectId].auto_learned = {
    patterns: { ...(imported.suppressions || {}) },
    stats: imported.stats || { totalSuppressed: Object.keys(imported.suppressions || {}).length },
  };
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

function analyzeForAutoSuppression(findings, sources, options = {}) {
  if (options.noLearn) return [];
  const suppressed = [];
  for (const finding of findings) {
    const source = sources.get(finding.file);
    if (source == null) continue;
    const match = isLikelyFalsePositive(finding, source);
    if (match && match.confidence >= (options.confidenceThreshold ?? CONFIDENCE_THRESHOLD)) {
      suppressed.push({ ...finding, suppressed: true, suppressionReason: match.reason, confidence: match.confidence });
    }
  }
  return suppressed;
}

module.exports = {
  CONFIDENCE_THRESHOLD, MAX_SUPPRESSIONS_PER_PROJECT, SUPPRESSION_EXPIRY_MS,
  isLikelyFalsePositive, getProjectId, loadAutoSuppressions, saveAutoSuppressions,
  clearAutoSuppressions, mergeSuppressions, exportAutoSuppressions,
  importAutoSuppressions, analyzeForAutoSuppression, PATTERN_HEURISTICS,
  isPatternDocumentation,
};

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CONFIDENCE_THRESHOLD = 0.9;
const MAX_SUPPRESSIONS_PER_PROJECT = 100;
const SUPPRESSION_EXPIRY_MS = 180 * 24 * 60 * 60 * 1000;

const EMPTY_SUPPRESSIONS = () => ({
  patterns: {},
  stats: { totalSuppressed: 0 },
});

function result(reason, confidence) {
  return { reason, confidence };
}

const PATTERN_HEURISTICS = {
  vague_instructions(finding, content, context) {
    const text = content.toLowerCase();
    if (
      /pattern[^\n]{0,500}detect[^\n]{0,500}usually|example[^\n]{0,500}vague|fuzzy[^\n]{0,500}language[^\n]{0,500}like/i.test(text) ||
      /vague[^\n]{0,500}terms[^\n]{0,500}like|"usually"[^\n]{0,500}"sometimes"/i.test(text)
    ) {
      return result('Pattern documentation self-reference (describes vague language detection)', 0.98);
    }
    if (/\|.*vague.*\||\|.*usually.*sometimes.*\|/i.test(text)) {
      return result('Pattern table documentation', 0.95);
    }
    return null;
  },

  aggressive_emphasis(finding, content, context) {
    const lines = content.split('\n');
    const lineIndex = Math.max(0, (finding.line || 1) - 1);
    const nearbyText = lines.slice(Math.max(0, lineIndex - 3), lineIndex + 4).join('\n');
    if (
      /WORKFLOW\s+GATES?/i.test(nearbyText) ||
      /\[CRITICAL\]\s*NO\s+AGENT\s+may/i.test(nearbyText) ||
      /MUST\s+NOT\s+DO|NEVER\s+skip|DO\s+NOT\s+proceed/i.test(nearbyText) ||
      /SubagentStop\s+hook|phase\s+9\s+review/i.test(nearbyText)
    ) {
      return result('Workflow enforcement requires emphasis for gates', 0.95);
    }
    if (/critical-rules|Critical\s+Rules.*Priority/i.test(nearbyText) || /<critical-rules>/i.test(nearbyText)) {
      return result('Critical rules section requires emphasis', 0.93);
    }
    return null;
  },

  missing_examples(finding, content, context) {
    const file = finding.file || context?.file || '';
    if (/Task\s{0,100}\(\s{0,100}\{[\s\S]{0,50000}subagent_type/i.test(content)) {
      return result('Orchestrator file delegates to subagents (examples in subagents)', 0.92);
    }
    if (/spawn[^\n]{0,500}agent|invoke[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(content)) {
      return result('Workflow command invokes agents with examples', 0.9);
    }
    return null;
  },

  missing_output_format(finding, content, context) {
    if (
      /subagent_type|spawn[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(content) ||
      /enhance:[^\n]{0,500}-enhancer|enhance:[^\n]{0,500}-reporter/i.test(content)
    ) {
      return result('Delegates output to subagent (subagent defines format)', 0.91);
    }
    return null;
  },

  missing_constraints(finding, content, context) {
    if (
      /##\s{0,100}What\s{1,100}[^\n]{0,500}MUST\s{1,100}NOT\s{1,100}Do/i.test(content) ||
      /##\s*Constraints/i.test(content) ||
      /<constraints>/i.test(content) ||
      /##\s*Critical\s+Constraints/i.test(content) ||
      /WORKFLOW\s+GATES/i.test(content)
    ) {
      return result('File has constraint section (different heading format)', 0.94);
    }
    return null;
  },

  redundant_cot(finding, content, context) {
    const workflowMarkers = content.match(/Phase\s+\d+:|Step\s+\d+:|###\s+Phase/gi) || [];
    if (/Step\s+\d+:/i.test(content) || workflowMarkers.length > 1) {
      return result('Multi-phase workflow requires step guidance', 0.91);
    }
    return null;
  },
};

function isLikelyFalsePositive(finding, content) {
  const patternId = finding.patternId || finding.id;
  const heuristic = PATTERN_HEURISTICS[patternId];
  return heuristic ? heuristic(finding, content) : null;
}

function isPatternDocumentation(filePath, content, patternId) {
  const basename = path.basename(filePath).toLowerCase();
  if (!basename.includes('pattern') && !basename.includes('enhance.md') && !basename.includes('enhancer')) {
    return false;
  }
  const readablePattern = patternId.replace(/_/g, ' ');
  const escapedId = patternId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedReadable = readablePattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\|[^|]*${escapedId}[^|]*\\|`, 'i').test(content) ||
    new RegExp(`\\|[^|]*${escapedReadable}[^|]*\\|`, 'i').test(content);
}

function getProjectId() {
  try {
    const remote = execFileSync('git', ['remote', 'get-url', 'origin'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    if (remote) {
      return remote
        .replace(/^https?:\/\//, '')
        .replace(/^git@/, '')
        .replace(':', '/')
        .replace(/\.git$/, '')
        .replace(/\/$/, '');
    }
  } catch {}
  return `local:${path.basename(path.resolve(process.cwd()))}`;
}

function readStore(filePath) {
  if (!fs.existsSync(filePath)) return { version: '2.0', projects: {} };
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!parsed.projects || typeof parsed.projects !== 'object') parsed.projects = {};
    return parsed;
  } catch {
    return { version: '2.0', projects: {} };
  }
}

function writeStore(filePath, store) {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

function loadAutoSuppressions(filePath, projectId) {
  if (!fs.existsSync(filePath)) return EMPTY_SUPPRESSIONS();
  const learned = readStore(filePath).projects[projectId]?.auto_learned;
  if (!learned) return EMPTY_SUPPRESSIONS();
  const now = Date.now();
  const patterns = Object.fromEntries(Object.entries(learned.patterns || {}).filter(([, entry]) => {
    return !entry.learnedAt || now - new Date(entry.learnedAt).getTime() <= SUPPRESSION_EXPIRY_MS;
  }));
  return { patterns, stats: learned.stats || { totalSuppressed: 0 } };
}

function saveAutoSuppressions(filePath, projectId, suppressions) {
  if (!suppressions.length) return;
  const store = readStore(filePath);
  const now = new Date().toISOString();
  const project = store.projects[projectId] || (store.projects[projectId] = {});
  const learned = project.auto_learned || (project.auto_learned = EMPTY_SUPPRESSIONS());
  const patterns = learned.patterns || (learned.patterns = {});

  for (const suppression of suppressions) {
    const existing = patterns[suppression.patternId];
    if (existing) {
      if (suppression.file && !existing.files.includes(suppression.file)) existing.files.push(suppression.file);
      existing.occurrences = (existing.occurrences || 0) + 1;
      existing.lastSeen = now;
    } else {
      patterns[suppression.patternId] = {
        files: suppression.file ? [suppression.file] : [],
        reason: 'Auto-detected false positive',
        confidence: suppression.confidence || CONFIDENCE_THRESHOLD,
        learnedAt: now,
        occurrences: 1,
      };
    }
  }

  const entries = Object.entries(patterns);
  if (entries.length > MAX_SUPPRESSIONS_PER_PROJECT) {
    learned.patterns = Object.fromEntries(entries.slice(-MAX_SUPPRESSIONS_PER_PROJECT));
  }
  learned.stats = { totalSuppressed: Object.keys(learned.patterns).length, lastAnalysis: now };
  store.version = '2.0';
  writeStore(filePath, store);
}

function clearAutoSuppressions(filePath, projectId) {
  if (!fs.existsSync(filePath)) return;
  const store = readStore(filePath);
  const project = store.projects[projectId];
  if (!project) return;
  project.auto_learned = {
    patterns: {},
    stats: { totalSuppressed: 0, lastAnalysis: new Date().toISOString() },
  };
  writeStore(filePath, store);
}

function mergeSuppressions(autoLearned, config) {
  return {
    ignore: config.ignore || { patterns: [], files: [], rules: {} },
    severity: config.severity || {},
    auto_learned: autoLearned,
  };
}

function exportAutoSuppressions(filePath, projectId) {
  const learned = loadAutoSuppressions(filePath, projectId);
  return {
    exportedAt: new Date().toISOString(),
    projectId,
    suppressions: learned.patterns,
    stats: learned.stats,
  };
}

function importAutoSuppressions(filePath, projectId, imported) {
  const additions = Object.entries(imported.suppressions || {}).map(([patternId, entry]) => ({
    patternId,
    file: entry.files?.[0],
    confidence: entry.confidence,
  }));
  if (!additions.length) return;
  saveAutoSuppressions(filePath, projectId, additions);
  const store = readStore(filePath);
  const patterns = store.projects[projectId].auto_learned.patterns;
  for (const [patternId, entry] of Object.entries(imported.suppressions)) {
    if (patterns[patternId]) {
      patterns[patternId].files = [...(entry.files || [])];
      patterns[patternId].reason = entry.reason || 'Imported false positive';
    }
  }
  writeStore(filePath, store);
}

function analyzeForAutoSuppression(findings, fileContents, options = {}) {
  if (options.noLearn) return [];
  const suppressions = [];
  for (const finding of findings) {
    const content = fileContents.get(finding.file);
    if (typeof content !== 'string') continue;
    const match = isLikelyFalsePositive(finding, content);
    if (match && match.confidence >= CONFIDENCE_THRESHOLD) {
      suppressions.push({
        ...finding,
        suppressed: true,
        suppressionReason: match.reason,
        confidence: match.confidence,
      });
    }
  }
  return suppressions;
}

globalThis.PATTERN_HEURISTICS = PATTERN_HEURISTICS;

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
  isPatternDocumentation,
};

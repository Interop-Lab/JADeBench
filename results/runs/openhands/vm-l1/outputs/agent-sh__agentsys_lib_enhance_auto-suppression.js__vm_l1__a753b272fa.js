const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CONFIDENCE_THRESHOLD = 0.9;
const MAX_SUPPRESSIONS_PER_PROJECT = 100;
const SUPPRESSION_EXPIRY_MS = 6 * 30 * 24 * 60 * 60 * 1000;

const result = (reason, confidence) => ({ reason, confidence });
const contextWindow = (content, line, before) =>
  content.split('\n').slice(Math.max(0, (line || 0) - before), (line || 0) + 2).join('\n');

const PATTERN_HEURISTICS = {
  vague_instructions(finding, content) {
    content = content.toLowerCase();
    const line = finding.line;
    if (
      /pattern[^\n]{0,500}detect[^\n]{0,500}usually|example[^\n]{0,500}vague|fuzzy[^\n]{0,500}language[^\n]{0,500}like/i.test(content) &&
      /vague[^\n]{0,500}terms[^\n]{0,500}like|"usually"[^\n]{0,500}"sometimes"/i.test(content)
    ) {
      return result('Pattern documentation self-reference (describes vague language detection)', 0.98);
    }
    if (/\|.*vague.*\||\|.*usually.*sometimes.*\|/i.test(contextWindow(content, line, 5))) {
      return result('Pattern table documentation', 0.95);
    }
  },

  aggressive_emphasis(finding, content) {
    const context = contextWindow(content, finding.line, 20);
    if (
      /WORKFLOW\s+GATES?/i.test(context) &&
      (/\[CRITICAL\]\s*NO\s+AGENT\s+may/i.test(context) ||
        /MUST\s+NOT\s+DO|NEVER\s+skip|DO\s+NOT\s+proceed/i.test(context)) &&
      /SubagentStop\s+hook|phase\s+9\s+review/i.test(context)
    ) {
      return result('Workflow enforcement requires emphasis for gates', 0.95);
    }
    if (/critical-rules|Critical\s+Rules.*Priority/i.test(context) || /<critical-rules>/i.test(context)) {
      return result('Critical rules section requires emphasis', 0.93);
    }
  },

  missing_examples(finding, content, context = {}) {
    const basename = path.basename(finding.file || context.file || '').toLowerCase();
    if (
      (basename.includes('orchestrator') || basename.includes('coordinator')) &&
      /Task\s{0,100}\(\s{0,100}\{[\s\S]{0,50000}subagent_type/i.test(content)
    ) {
      return result('Orchestrator file delegates to subagents (examples in subagents)', 0.92);
    }
    if (
      /spawn[^\n]{0,500}agent|invoke[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(content) &&
      basename.endsWith('.md')
    ) {
      return result('Workflow command invokes agents with examples', 0.9);
    }
  },

  missing_output_format(_finding, content) {
    if (
      /subagent_type|spawn[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(content) &&
      /enhance:[^\n]{0,500}-enhancer|enhance:[^\n]{0,500}-reporter/i.test(content)
    ) {
      return result('Delegates output to subagent (subagent defines format)', 0.91);
    }
  },

  missing_constraints(_finding, content) {
    if (
      /##\s{0,100}What\s{1,100}[^\n]{0,500}MUST\s{1,100}NOT\s{1,100}Do/i.test(content) &&
      (/##\s*Constraints/i.test(content) ||
        /<constraints>/i.test(content) ||
        /##\s*Critical\s+Constraints/i.test(content) ||
        /WORKFLOW\s+GATES/i.test(content))
    ) {
      return result('File has constraint section (different heading format)', 0.94);
    }
  },

  redundant_cot(_finding, content) {
    if (
      /Phase\s+\d+:|Step\s+\d+:|###\s+Phase/i.test(content) &&
      /Phase\s+[2-9]:|Step\s+[2-9]:/i.test(content)
    ) {
      return result('Multi-phase workflow requires step guidance', 0.91);
    }
  },
};

function isPatternDocumentation(file, content, patternId) {
  const basename = path.basename(file || '').toLowerCase();
  if (!basename.includes('pattern') && !basename.includes('enhance.md') && !basename.includes('enhancer')) {
    return false;
  }
  const readablePattern = String(patternId || '').replace(/_/g, ' ');
  return new RegExp(`\\|[^|]*${readablePattern}[^|]*\\|`, 'i').test(content);
}

function isLikelyFalsePositive(finding, content, context = {}) {
  const patternId = String(finding.patternId || finding.id || '').toLowerCase();
  const heuristic = PATTERN_HEURISTICS[patternId];
  if (heuristic) {
    const match = heuristic(finding, content, context);
    if (match && match.confidence >= CONFIDENCE_THRESHOLD) return match;
  }
  const file = finding.file || finding.filePath || context.file || '';
  if (isPatternDocumentation(file, content, patternId)) {
    return result('Pattern self-reference in documentation', 0.96);
  }
}

function getProjectId() {
  const cwd = process.cwd();
  try {
    return execFileSync('git', ['remote', 'get-url', 'origin'], {
      encoding: 'utf8',
      stdio: 'pipe',
    })
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/^git@/, '')
      .replace(/\.git$/, '')
      .replace(':', '/');
  } catch {
    return `local:${path.basename(path.resolve(cwd))}`;
  }
}

function emptySuppressions() {
  return { patterns: {}, stats: { totalSuppressed: 0 } };
}

function loadDocument(suppressionPath) {
  if (!fs.existsSync(suppressionPath)) return { version: '2.0', projects: {} };
  const document = JSON.parse(fs.readFileSync(suppressionPath, 'utf8'));
  document.projects ||= {};
  return document;
}

function writeJsonAtomic(filename, value) {
  const temporary = `${filename}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporary, filename);
}

function loadAutoSuppressions(projectId, suppressionPath) {
  try {
    const learned = loadDocument(suppressionPath).projects?.[projectId]?.auto_learned;
    if (!learned) return emptySuppressions();
    const now = Date.now();
    for (const [patternId, pattern] of Object.entries(learned.patterns || {})) {
      if (now - new Date(pattern.learnedAt).getTime() > SUPPRESSION_EXPIRY_MS) {
        delete learned.patterns[patternId];
      }
    }
    learned.patterns ||= {};
    learned.stats ||= { totalSuppressed: 0 };
    return learned;
  } catch {
    return emptySuppressions();
  }
}

function saveAutoSuppressions(projectId, suppressionPath, newSuppressions) {
  if (!newSuppressions?.length) return;
  fs.mkdirSync(path.dirname(suppressionPath), { recursive: true });
  let document;
  try {
    document = loadDocument(suppressionPath);
  } catch {
    document = { version: '2.0', projects: {} };
  }
  document.version = '2.0';
  document.projects ||= {};
  const project = (document.projects[projectId] ||= {});
  const learned = (project.auto_learned ||= emptySuppressions());
  learned.patterns ||= {};
  learned.stats ||= { totalSuppressed: 0 };
  const now = new Date().toISOString();

  for (const suppression of newSuppressions) {
    const patternId = String(suppression.patternId || suppression.id || '').toLowerCase();
    if (!patternId || (suppression.confidence ?? 0) < CONFIDENCE_THRESHOLD) continue;
    const existing = learned.patterns[patternId];
    const files = [...(existing?.files || [])];
    if (suppression.file && !files.includes(suppression.file)) files.push(suppression.file);
    learned.patterns[patternId] = {
      files: [...new Set(files)].slice(0, 50),
      suppressionReason: suppression.suppressionReason || suppression.reason || 'Auto-detected false positive',
      reason: suppression.reason || suppression.suppressionReason || 'Auto-detected false positive',
      confidence: suppression.confidence,
      learnedAt: existing?.learnedAt || now,
      lastSeen: now,
      occurrences: (existing?.occurrences || 0) + 1,
    };
    learned.stats.totalSuppressed = (learned.stats.totalSuppressed || 0) + 1;
  }

  const newest = Object.entries(learned.patterns)
    .sort(([, a], [, b]) => String(b.lastSeen).localeCompare(String(a.lastSeen)))
    .slice(0, MAX_SUPPRESSIONS_PER_PROJECT);
  learned.patterns = Object.fromEntries(newest);
  learned.stats.lastAnalysis = now;
  fs.writeFileSync(suppressionPath, JSON.stringify(document, null, 2));
}

function clearAutoSuppressions(projectId, suppressionPath) {
  try {
    const document = JSON.parse(fs.readFileSync(suppressionPath, 'utf8'));
    if (!document.projects?.[projectId]) return;
    document.projects[projectId].auto_learned = {
      patterns: {},
      stats: { totalSuppressed: 0, lastAnalysis: new Date().toISOString() },
    };
    writeJsonAtomic(suppressionPath, document);
  } catch {
    // A missing or malformed suppression file is already effectively clear.
  }
}

function mergeSuppressions(learned = {}, manual = {}) {
  return {
    ignore: {
      patterns: [...(manual.ignore?.patterns || [])],
      files: [...(manual.ignore?.files || [])],
    },
    rules: { ...(manual.rules || {}) },
    severity: { ...(manual.severity || {}) },
    auto_learned: learned,
  };
}

function exportAutoSuppressions(projectId, suppressionPath) {
  const loaded = loadAutoSuppressions(projectId, suppressionPath);
  return {
    exportedAt: new Date().toISOString(),
    projectId,
    suppressions: loaded.patterns,
    stats: loaded.stats,
  };
}

function importAutoSuppressions(projectId, suppressionPath, data) {
  const suppressions = data?.suppressions;
  if (!suppressions || typeof suppressions !== 'object') return;
  const imported = [];
  for (const [patternId, suppression] of Object.entries(suppressions)) {
    for (const file of suppression.files || []) {
      imported.push({
        patternId,
        file,
        reason: suppression.reason || suppression.suppressionReason,
        confidence: suppression.confidence,
      });
    }
  }
  saveAutoSuppressions(projectId, suppressionPath, imported);
}

function analyzeForAutoSuppression(findings, contentProvider, options = {}) {
  if (options.noLearn) return [];
  const suppressions = [];
  for (const finding of findings || []) {
    try {
      const file = finding.file || finding.filePath;
      const content = contentProvider.get(file);
      const match = isLikelyFalsePositive(finding, content, {
        file,
        projectRoot: options.projectRoot,
      });
      if (match) {
        suppressions.push({
          ...finding,
          suppressed: true,
          suppressionReason: match.reason,
          confidence: match.confidence,
        });
      }
    } catch {
      // Skip findings whose content cannot be loaded or analyzed.
    }
  }
  return suppressions;
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
  isPatternDocumentation,
};

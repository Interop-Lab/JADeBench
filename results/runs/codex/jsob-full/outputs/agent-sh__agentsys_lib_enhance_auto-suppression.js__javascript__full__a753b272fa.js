'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CONFIDENCE_THRESHOLD = 0.9;
const MAX_SUPPRESSIONS_PER_PROJECT = 100;
const SUPPRESSION_EXPIRY_MS = 15_552_000_000;

function createSuppression(reason, confidence) {
  return { reason, confidence };
}

const PATTERN_HEURISTICS = {
  vague_instructions(pattern, content) {
    const vagueLanguage = /pattern[^\n]{0,500}detect[^\n]{0,500}usually|example[^\n]{0,500}vague|fuzzy[^\n]{0,500}language[^\n]{0,500}like/i.test(content)
      || /vague[^\n]{0,500}terms[^\n]{0,500}like|"usually"[^\n]{0,500}"sometimes"/i.test(content);
    if (vagueLanguage) {
      return createSuppression('Pattern documentation self-reference (describes vague language detection)', 0.98);
    }

    const line = pattern.line || 0;
    const nearbyText = content.split('\n').slice(Math.max(0, line - 20), line + 20).join('\n');
    if (/\|.*vague.*\||\|.*usually.*sometimes.*\|/i.test(nearbyText)) {
      return createSuppression('Pattern table documentation', 0.95);
    }
    return null;
  },

  aggressive_emphasis(pattern, content) {
    const line = pattern.line || 0;
    const nearbyText = content.split('\n').slice(Math.max(0, line - 20), line + 20).join('\n');
    const workflowGate = /WORKFLOW\s+GATES?|\[CRITICAL\]\s*NO\s+AGENT\s+may|MUST\s+NOT\s+DO|NEVER\s+skip|DO\s+NOT\s+proceed|SubagentStop\s+hook|phase\s+9\s+review/i.test(nearbyText);
    if (workflowGate) {
      return createSuppression('Workflow enforcement requires emphasis for gates', 0.95);
    }

    const criticalRules = /critical-rules|Critical\s+Rules.*Priority/i.test(nearbyText) || /<critical-rules>/i.test(nearbyText);
    if (criticalRules) {
      return createSuppression('Critical rules section requires emphasis', 0.93);
    }
    return null;
  },

  missing_examples(pattern, content, context) {
    const file = pattern.file || context?.file || '';
    const fileName = path.basename(file).toLowerCase();
    const orchestratorFile = fileName.includes('orchestrator')
      || fileName.includes('coordinator')
      || /Task\s{0,100}\(\s{0,100}\{[\s\S]{0,50000}subagent_type/i.test(content);
    if (orchestratorFile) {
      return createSuppression('Orchestrator file delegates to subagents (examples in subagents)', 0.92);
    }

    const workflowCommand = /spawn[^\n]{0,500}agent|invoke[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(content)
      && fileName.endsWith('.md');
    if (workflowCommand) {
      return createSuppression('Workflow command invokes agents with examples', 0.9);
    }
    return null;
  },

  missing_output_format(pattern, content) {
    const delegatesOutput = /subagent_type|spawn[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(content)
      || /enhance:[^\n]{0,500}-enhancer|enhance:[^\n]{0,500}-reporter/i.test(content);
    if (delegatesOutput) {
      return createSuppression('Delegates output to subagent (subagent defines format)', 0.91);
    }
    return null;
  },

  missing_constraints(pattern, content) {
    const hasConstraintSection = /##\s{0,100}What\s{1,100}[^\n]{0,500}MUST\s{1,100}NOT\s{1,100}Do/i.test(content)
      || /##\s*Constraints/i.test(content)
      || /<constraints>/i.test(content)
      || /##\s*Critical\s+Constraints/i.test(content)
      || /WORKFLOW\s+GATES/i.test(content);
    if (hasConstraintSection) {
      return createSuppression('File has constraint section (different heading format)', 0.94);
    }
    return null;
  },

  redundant_cot(pattern, content) {
    const multiPhaseWorkflow = /Phase\s+\d+:|Step\s+\d+:|###\s+Phase/i.test(content)
      && /Phase\s+[2-9]:|Step\s+[2-9]:/i.test(content);
    if (multiPhaseWorkflow) {
      return createSuppression('Multi-phase workflow requires step guidance', 0.91);
    }
    return null;
  }
};

function isPatternDocumentation(file, content, patternId) {
  const fileName = path.basename(file).toLowerCase();
  if (!fileName.includes('pattern') && !fileName.includes('enhance.md') && !fileName.includes('enhancer')) {
    return false;
  }
  const spacedPatternId = patternId.replace(/_/g, ' ');
  return new RegExp(`\\|[^|]*${patternId}[^|]*\\|`, 'i').test(content)
    || new RegExp(`\\|[^|]*${spacedPatternId}[^|]*\\|`, 'i').test(content);
}

function isLikelyFalsePositive(result, fileContent, context = {}) {
  const patternId = (result.patternId || result.id || '').toLowerCase();
  if (!fileContent || typeof fileContent !== 'string') return null;

  const heuristic = PATTERN_HEURISTICS[patternId];
  if (heuristic) {
    const suppression = heuristic(result, fileContent, context);
    if (suppression && suppression.confidence >= CONFIDENCE_THRESHOLD) return suppression;
  }

  if (result.file && isPatternDocumentation(result.file, fileContent, patternId)) {
    return createSuppression('Pattern self-reference in documentation', 0.96);
  }
  return null;
}

function getProjectId(projectRoot = process.cwd()) {
  try {
    const remoteUrl = execFileSync('git', ['remote', 'get-url', 'origin'], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    if (remoteUrl) {
      return remoteUrl.replace(/^https?:\/\//, '').replace(/^git@/, '').replace(/\.git$/, '').replace(':', '/');
    }
  } catch {
    // Fall through to the local path identifier.
  }
  return `local:${path.basename(path.resolve(projectRoot))}`;
}

function loadAutoSuppressions(filePath, projectId) {
  const empty = { patterns: {}, stats: { totalSuppressed: 0 } };
  try {
    if (!fs.existsSync(filePath)) return empty;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const project = data.projects?.[projectId];
    if (!project?.auto_learned) return empty;

    const learned = project.auto_learned;
    const now = Date.now();
    const patterns = {};
    for (const [patternId, suppression] of Object.entries(learned.patterns || {})) {
      if (now - new Date(suppression.learnedAt).getTime() < SUPPRESSION_EXPIRY_MS) {
        patterns[patternId] = suppression;
      }
    }
    return { patterns, stats: learned.stats || { totalSuppressed: 0 } };
  } catch {
    return empty;
  }
}

function saveAutoSuppressions(filePath, projectId, findings) {
  if (!findings || findings.length === 0) return;
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

  let data = { version: '2.0', projects: {} };
  try {
    if (fs.existsSync(filePath)) data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    // Start with an empty store if the existing file is invalid.
  }

  data.projects ||= {};
  data.projects[projectId] ||= {};
  data.projects[projectId].auto_learned ||= {
    patterns: {},
    stats: { totalSuppressed: 0, lastAnalysis: null }
  };

  const learned = data.projects[projectId].auto_learned;
  const analyzedAt = new Date().toISOString();
  const byPattern = {};
  for (const finding of findings) {
    const patternId = (finding.patternId || finding.id || '').toLowerCase();
    if (!patternId) continue;
    byPattern[patternId] ||= {
      files: [],
      reason: finding.suppressionReason || 'Auto-detected false positive',
      confidence: finding.confidence || CONFIDENCE_THRESHOLD,
      learnedAt: analyzedAt,
      occurrences: 0
    };
    if (finding.file && !byPattern[patternId].files.includes(finding.file)) byPattern[patternId].files.push(finding.file);
    byPattern[patternId].occurrences++;
    if (finding.confidence > byPattern[patternId].confidence) {
      byPattern[patternId].confidence = finding.confidence;
      byPattern[patternId].reason = finding.suppressionReason;
    }
  }

  for (const [patternId, current] of Object.entries(byPattern)) {
    const previous = learned.patterns[patternId];
    if (previous) {
      previous.files = [...new Set([...previous.files, ...current.files])].slice(0, 50);
      previous.occurrences = (previous.occurrences || 0) + current.occurrences;
      previous.lastSeen = analyzedAt;
      if (current.confidence > previous.confidence) {
        previous.confidence = current.confidence;
        previous.reason = current.reason;
      }
    } else {
      learned.patterns[patternId] = current;
    }
  }

  const patternIds = Object.keys(learned.patterns);
  if (patternIds.length > MAX_SUPPRESSIONS_PER_PROJECT) {
    patternIds.sort((left, right) => new Date(learned.patterns[left].learnedAt) - new Date(learned.patterns[right].learnedAt));
    for (const patternId of patternIds.slice(0, patternIds.length - MAX_SUPPRESSIONS_PER_PROJECT)) {
      delete learned.patterns[patternId];
    }
  }

  learned.stats.totalSuppressed = Object.keys(learned.patterns).length;
  learned.stats.lastAnalysis = analyzedAt;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function clearAutoSuppressions(filePath, projectId) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.projects?.[projectId]?.auto_learned) {
      data.projects[projectId].auto_learned = {
        patterns: {},
        stats: { totalSuppressed: 0, lastAnalysis: new Date().toISOString() }
      };
      writeJsonAtomic(filePath, data);
    }
  } catch {
    // Clearing is best-effort.
  }
}

function writeJsonAtomic(filePath, data, options = {}) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, JSON.stringify(data, null, options.indent ?? 2), options);
    fs.renameSync(temporaryPath, filePath);
  } catch (error) {
    try { if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath); } catch {}
    throw error;
  }
}

function mergeSuppressions(autoLearned, config) {
  return {
    ignore: {
      patterns: [...(config.ignore?.patterns || [])],
      files: [...(config.ignore?.files || [])],
      rules: { ...(config.ignore?.rules || {}) }
    },
    severity: { ...(config.severity || {}) },
    auto_learned: autoLearned
  };
}

function exportAutoSuppressions(filePath, projectId) {
  const suppressions = loadAutoSuppressions(filePath, projectId);
  return {
    exportedAt: new Date().toISOString(),
    projectId,
    suppressions: suppressions.patterns,
    stats: suppressions.stats
  };
}

function importAutoSuppressions(filePath, projectId, exported) {
  if (!exported?.suppressions) return;
  const findings = [];
  for (const [patternId, suppression] of Object.entries(exported.suppressions)) {
    for (const file of suppression.files || []) {
      findings.push({ patternId, file, suppressionReason: suppression.reason, confidence: suppression.confidence });
    }
  }
  saveAutoSuppressions(filePath, projectId, findings);
}

function analyzeForAutoSuppression(findings, fileContents, options = {}) {
  if (options.noLearn) return [];
  const suppressedFindings = [];
  for (const finding of findings) {
    const fileContent = fileContents.get(finding.file || finding.filePath);
    if (!fileContent) continue;
    const suppression = isLikelyFalsePositive(finding, fileContent, {
      file: finding.file || finding.filePath,
      projectRoot: options.projectRoot
    });
    if (suppression) {
      suppressedFindings.push({
        ...finding,
        suppressed: true,
        suppressionReason: suppression.reason,
        confidence: suppression.confidence
      });
    }
  }
  return suppressedFindings;
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

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CONFIDENCE_THRESHOLD = 0.9;
const MAX_SUPPRESSIONS_PER_PROJECT = 100;
const SUPPRESSION_EXPIRY_MS = 180 * 24 * 60 * 60 * 1000;

function readFileWithLimit(filePath, maxBytes, encoding = 'utf8') {
  const fd = fs.openSync(filePath, 'r');

  try {
    const stat = fs.fstatSync(fd);

    if (!stat.isFile()) {
      const error = new Error(`Expected a regular file: ${filePath}`);
      error.code = 'EISDIR';
      throw error;
    }

    if (typeof maxBytes === 'number' && stat.size > maxBytes) {
      const error = new Error(
        `File size ${stat.size} exceeds maximum allowed size ${maxBytes}: ${filePath}`
      );
      error.code = 'EFBIG';
      throw error;
    }

    return fs.readFileSync(fd, encoding);
  } finally {
    fs.closeSync(fd);
  }
}

function writeJsonAtomic(filePath, value, options = {}) {
  const {
    indent = 2,
    encoding = 'utf8',
    mode = 0o600
  } = options;

  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const temporaryPath = createTemporaryPath(filePath);

  try {
    fs.writeFileSync(temporaryPath, JSON.stringify(value, null, indent), {
      encoding,
      mode
    });
    fs.renameSync(temporaryPath, filePath);
    return true;
  } catch (error) {
    try {
      if (fs.existsSync(temporaryPath)) {
        fs.unlinkSync(temporaryPath);
      }
    } catch {}
    throw error;
  }
}

function createTemporaryPath(filePath) {
  const directory = path.dirname(filePath);
  const basename = path.basename(filePath);
  const suffix = Math.random().toString(36).slice(2);
  return path.join(directory, `.${basename}.${suffix}.tmp`);
}

function findingLine(finding) {
  const line = Number(finding && finding.line);
  return Number.isFinite(line) ? line : 0;
}

function surroundingText(content, line, radius = 10) {
  const lines = String(content).split('\n');
  return lines
    .slice(Math.max(0, line - radius), line + radius)
    .join('\n');
}

function reasonResult(reason, confidence) {
  return { reason, confidence };
}

const PATTERN_HEURISTICS = {
  vague_instructions(finding, content) {
    const documentationPattern =
      /pattern[^\n]{0,500}detect[^\n]{0,500}usually|example[^\n]{0,500}vague|fuzzy[^\n]{0,500}language[^\n]{0,500}like/i.test(content) ||
      /vague[^\n]{0,500}terms[^\n]{0,500}like|"usually"[^\n]{0,500}"sometimes"/i.test(content);

    if (documentationPattern) {
      return reasonResult(
        'Vague-language examples are pattern documentation',
        0.98
      );
    }

    const context = surroundingText(content, findingLine(finding));
    if (/\|.*vague.*\||\|.*usually.*sometimes.*\|/i.test(context)) {
      return reasonResult(
        'Vague-language terms occur in a documentation table',
        0.95
      );
    }

    return null;
  },

  aggressive_emphasis(finding, content) {
    const context = surroundingText(content, findingLine(finding));

    if (
      /WORKFLOW\s+GATES?/i.test(context) ||
      /\[CRITICAL\]\s*NO\s+AGENT\s+may/i.test(context) ||
      /MUST\s+NOT\s+DO|NEVER\s+skip|DO\s+NOT\s+proceed/i.test(context) ||
      /SubagentStop\s+hook|phase\s+9\s+review/i.test(context)
    ) {
      return reasonResult(
        'Strong emphasis is part of an intentional workflow gate',
        0.95
      );
    }

    if (
      /critical-rules|Critical\s+Rules.*Priority/i.test(context) ||
      /<critical-rules>/i.test(context)
    ) {
      return reasonResult(
        'Strong emphasis is part of a critical-rules section',
        0.93
      );
    }

    return null;
  },

  missing_examples(finding, content, context = {}) {
    const filePath =
      finding.file ||
      finding.filePath ||
      finding.path ||
      context.filePath ||
      '';

    const basename = path.basename(filePath).toLowerCase();

    const isAgentDocumentation =
      basename.includes('agent') ||
      basename.includes('command') ||
      /Task\s{0,100}\(\s{0,100}\{[\s\S]{0,50000}subagent_type/i.test(content);

    if (isAgentDocumentation) {
      return reasonResult(
        'The finding describes agent invocation syntax rather than an instruction requiring examples',
        0.92
      );
    }

    const invokesAgent =
      /spawn[^\n]{0,500}agent|invoke[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(content);

    if (invokesAgent && /readme|docs?|example|reference/i.test(basename)) {
      return reasonResult(
        'Agent invocation documentation does not require an additional example',
        0.9
      );
    }

    return null;
  },

  missing_output_format(finding, content) {
    const delegatesOutput =
      /subagent_type|spawn[^\n]{0,500}agent|Task\s{0,100}\(\s{0,100}\{/i.test(content) ||
      /enhance:[^\n]{0,500}-enhancer|enhance:[^\n]{0,500}-reporter/i.test(content);

    if (delegatesOutput) {
      return reasonResult(
        'Output formatting is delegated to a named subagent',
        0.91
      );
    }

    return null;
  },

  missing_constraints(finding, content) {
    const hasConstraints =
      /##\s{0,100}What\s{1,100}[^\n]{0,500}MUST\s{1,100}NOT\s{1,100}Do/i.test(content) ||
      /##\s*Constraints/i.test(content) ||
      /<constraints>/i.test(content) ||
      /##\s*Critical\s+Constraints/i.test(content) ||
      /WORKFLOW\s+GATES/i.test(content);

    if (hasConstraints) {
      return reasonResult(
        'Constraints are already declared elsewhere in the document',
        0.94
      );
    }

    return null;
  },

  redundant_cot(finding, content) {
    const hasPhases =
      /Phase\s+\d+:|Step\s+\d+:|###\s+Phase/i.test(content) &&
      /Phase\s+[2-9]:|Step\s+[2-9]:/i.test(content);

    if (hasPhases) {
      return reasonResult(
        'Numbered phases describe workflow structure rather than redundant chain-of-thought',
        0.91
      );
    }

    return null;
  }
};

function isPatternDocumentation(filePath, content, patternId) {
  const normalizedPath = String(filePath || '').replace(/\\/g, '/').toLowerCase();
  const basename = path.basename(normalizedPath);

  const isDocumentation =
    basename.includes('readme') ||
    basename.includes('example') ||
    basename.includes('reference') ||
    basename.includes('pattern') ||
    normalizedPath.includes('/docs/') ||
    normalizedPath.includes('/documentation/') ||
    normalizedPath.includes('/examples/');

  if (!isDocumentation) {
    return false;
  }

  const id = String(patternId || '');
  const readableName = id.replace(/_/g, ' ');

  return (
    new RegExp(`\\b${escapeRegExp(id)}\\b`, 'i').test(content) ||
    new RegExp(`\\b${escapeRegExp(readableName)}\\b`, 'i').test(content)
  );
}

function isLikelyFalsePositive(finding, content, context = {}) {
  const patternId = String(
    finding.ruleId ||
    finding.patternId ||
    finding.id ||
    ''
  ).toLowerCase();

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

  const filePath = finding.file || finding.filePath || finding.path;
  if (
    filePath &&
    isPatternDocumentation(filePath, content, patternId)
  ) {
    return reasonResult(
      'The matched text is documentation for this analysis pattern',
      0.96
    );
  }

  return null;
}

function getProjectId(cwd = process.cwd()) {
  try {
    const remote = execFileSync(
      'git',
      ['config', '--get', 'remote.origin.url'],
      {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      }
    ).trim();

    if (remote) {
      return remote
        .replace(/^https?:\/\//, '')
        .replace(/^git@/, '')
        .replace(/\.git$/, '')
        .replace(':', '/');
    }
  } catch {}

  return `local:${path.basename(path.resolve(cwd))}`;
}

function emptySuppressionData() {
  return {
    patterns: {},
    stats: {
      totalSuppressed: 0
    }
  };
}

function loadAutoSuppressions(filePath, projectId) {
  const empty = emptySuppressionData();

  try {
    if (!fs.existsSync(filePath)) {
      return empty;
    }

    const document = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const project = document.projects && document.projects[projectId];
    const autoSuppressions = project && project.autoSuppressions;

    if (!autoSuppressions) {
      return empty;
    }

    const now = Date.now();
    const patterns = {};

    for (const [patternId, suppression] of Object.entries(
      autoSuppressions.patterns || {}
    )) {
      const lastSeen = new Date(suppression.lastSeen).getTime();
      if (now - lastSeen < SUPPRESSION_EXPIRY_MS) {
        patterns[patternId] = suppression;
      }
    }

    return {
      patterns,
      stats: autoSuppressions.stats || { totalSuppressed: 0 }
    };
  } catch {
    return empty;
  }
}

function saveAutoSuppressions(filePath, projectId, findings) {
  if (!findings || findings.length === 0) {
    return;
  }

  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  let document = {
    version: '1.0',
    projects: {}
  };

  try {
    if (fs.existsSync(filePath)) {
      document = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch {}

  if (!document.projects) {
    document.projects = {};
  }
  if (!document.projects[projectId]) {
    document.projects[projectId] = {};
  }
  if (!document.projects[projectId].autoSuppressions) {
    document.projects[projectId].autoSuppressions = {
      patterns: {},
      stats: {
        totalSuppressed: 0,
        lastAnalysis: null
      }
    };
  }

  const autoSuppressions = document.projects[projectId].autoSuppressions;
  if (!autoSuppressions.patterns) {
    autoSuppressions.patterns = {};
  }
  if (!autoSuppressions.stats) {
    autoSuppressions.stats = {
      totalSuppressed: 0,
      lastAnalysis: null
    };
  }

  const now = new Date().toISOString();
  const aggregated = {};

  for (const finding of findings) {
    const patternId = String(
      finding.ruleId ||
      finding.patternId ||
      finding.id ||
      ''
    ).toLowerCase();

    if (!patternId) {
      continue;
    }

    if (!aggregated[patternId]) {
      aggregated[patternId] = {
        examples: [],
        reason:
          finding.suppressionReason ||
          finding.reason ||
          'Likely false positive',
        confidence:
          finding.confidence == null
            ? CONFIDENCE_THRESHOLD
            : finding.confidence,
        lastSeen: now,
        occurrenceCount: 0
      };
    }

    const example = finding.file || finding.filePath || finding.path;
    if (example && !aggregated[patternId].examples.includes(example)) {
      aggregated[patternId].examples.push(example);
    }

    aggregated[patternId].occurrenceCount++;

    if (finding.confidence > aggregated[patternId].confidence) {
      aggregated[patternId].confidence = finding.confidence;
      aggregated[patternId].reason =
        finding.suppressionReason ||
        finding.reason ||
        aggregated[patternId].reason;
    }
  }

  for (const [patternId, incoming] of Object.entries(aggregated)) {
    const existing = autoSuppressions.patterns[patternId];

    if (!existing) {
      autoSuppressions.patterns[patternId] = incoming;
      continue;
    }

    existing.examples = [
      ...new Set([
        ...(existing.examples || []),
        ...(incoming.examples || [])
      ])
    ].slice(0, 10);

    existing.occurrenceCount =
      (existing.occurrenceCount || 0) +
      incoming.occurrenceCount;

    existing.lastSeen = now;

    if (incoming.confidence > existing.confidence) {
      existing.confidence = incoming.confidence;
      existing.reason = incoming.reason;
    }
  }

  const patternIds = Object.keys(autoSuppressions.patterns);
  if (patternIds.length > MAX_SUPPRESSIONS_PER_PROJECT) {
    const sorted = patternIds.sort((left, right) => {
      return (
        new Date(autoSuppressions.patterns[left].lastSeen) -
        new Date(autoSuppressions.patterns[right].lastSeen)
      );
    });

    const remove = sorted.slice(
      0,
      patternIds.length - MAX_SUPPRESSIONS_PER_PROJECT
    );

    for (const patternId of remove) {
      delete autoSuppressions.patterns[patternId];
    }
  }

  autoSuppressions.stats.totalSuppressed =
    Object.keys(autoSuppressions.patterns).length;
  autoSuppressions.stats.lastAnalysis = now;

  fs.writeFileSync(filePath, JSON.stringify(document, null, 2));
}

function clearAutoSuppressions(filePath, projectId) {
  try {
    const document = JSON.parse(readFileWithLimit(filePath));
    const project = document.projects && document.projects[projectId];

    if (project && project.autoSuppressions) {
      project.autoSuppressions = {
        patterns: {},
        stats: {
          totalSuppressed: 0,
          lastAnalysis: new Date().toISOString()
        }
      };
      writeJsonAtomic(filePath, document);
    }
  } catch {}
}

function mergeSuppressions(autoSuppressions, configuration) {
  const source = configuration || {};
  const suppression = source.suppression || source.suppressions || {};

  return {
    suppression: {
      rules: [...(suppression.rules || [])],
      patterns: [...(suppression.patterns || [])],
      overrides: { ...(suppression.overrides || {}) }
    },
    metadata: { ...(source.metadata || {}) },
    autoSuppressions
  };
}

function exportAutoSuppressions(filePath, projectId) {
  const loaded = loadAutoSuppressions(filePath, projectId);

  return {
    exportedAt: new Date().toISOString(),
    projectId,
    suppressions: loaded.patterns,
    stats: loaded.stats
  };
}

function importAutoSuppressions(filePath, projectId, imported) {
  if (!imported || !imported.suppressions) {
    return;
  }

  const findings = [];

  for (const [patternId, suppression] of Object.entries(
    imported.suppressions
  )) {
    for (const example of suppression.examples || []) {
      findings.push({
        ruleId: patternId,
        file: example,
        suppressionReason: suppression.reason,
        confidence: suppression.confidence
      });
    }
  }

  saveAutoSuppressions(filePath, projectId, findings);
}

function analyzeForAutoSuppression(findings, contentByFile, options = {}) {
  if (
    options.disabled ||
    options.disableAutoSuppression ||
    options.autoSuppression === false
  ) {
    return [];
  }

  const suppressed = [];

  for (const finding of findings) {
    const filePath =
      finding.file ||
      finding.filePath ||
      finding.path;

    let content;
    if (contentByFile && typeof contentByFile.get === 'function') {
      content = contentByFile.get(filePath);
    } else if (contentByFile) {
      content = contentByFile[filePath];
    }

    if (!content) {
      continue;
    }

    const result = isLikelyFalsePositive(finding, content, {
      filePath,
      projectPath: options.projectPath
    });

    if (result) {
      suppressed.push({
        ...finding,
        autoSuppressed: true,
        suppressionReason: result.reason,
        confidence: result.confidence
      });
    }
  }

  return suppressed;
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

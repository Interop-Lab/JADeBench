\b/g
  ];
  let docScore = 0;
  for (const indicator of docIndicators) {
    if (indicator.test(context)) docScore += 0.2;
  }
  if (metadata && metadata.isDocumentation) docScore += 0.5;
  return docScore >= 0.5;
}

function getProjectId(projectPath) {
  if (!projectPath) {
    projectPath = process.cwd();
  }
  try {
    const gitDir = path.join(projectPath, '.git');
    if (fs.existsSync(gitDir)) {
      const configPath = path.join(gitDir, 'config');
      if (fs.existsSync(configPath)) {
        const config = fs.readFileSync(configPath, 'utf8');
        const match = config.match(/url\s*=\s*(.+)/);
        if (match) {
          const url = match[1].trim();
          const hash = require('crypto').createHash('sha256').update(url).digest('hex');
          return hash.substring(0, 16);
        }
      }
    }
  } catch {}
  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const id = pkg.name + ':' + (pkg.version || '0.0.0');
      const hash = require('crypto').createHash('sha256').update(id).digest('hex');
      return hash.substring(0, 16);
    }
  } catch {}
  const hash = require('crypto').createHash('sha256').update(projectPath).digest('hex');
  return hash.substring(0, 16);
}

function loadAutoSuppressions(projectId, suppressionPath) {
  if (!suppressionPath) {
    suppressionPath = getSuppressionPath();
  }
  try {
    if (!fs.existsSync(suppressionPath)) {
      return {};
    }
    const data = fs.readFileSync(suppressionPath, 'utf8');
    const all = JSON.parse(data);
    if (projectId) {
      return all[projectId] || {};
    }
    return all;
  } catch {
    return {};
  }
}

function saveAutoSuppressions(suppressions, projectId, suppressionPath) {
  if (!suppressionPath) {
    suppressionPath = getSuppressionPath();
  }
  try {
    let all = {};
    if (fs.existsSync(suppressionPath)) {
      try {
        all = JSON.parse(fs.readFileSync(suppressionPath, 'utf8'));
      } catch {}
    }
    if (projectId) {
      all[projectId] = suppressions;
    } else {
      all = suppressions;
    }
    const dir = path.dirname(suppressionPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(suppressionPath, JSON.stringify(all, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

function clearAutoSuppressions(projectId, suppressionPath) {
  if (!suppressionPath) {
    suppressionPath = getSuppressionPath();
  }
  try {
    if (!fs.existsSync(suppressionPath)) {
      return true;
    }
    if (projectId) {
      const all = JSON.parse(fs.readFileSync(suppressionPath, 'utf8'));
      delete all[projectId];
      fs.writeFileSync(suppressionPath, JSON.stringify(all, null, 2), 'utf8');
    } else {
      fs.writeFileSync(suppressionPath, '{}', 'utf8');
    }
    return true;
  } catch {
    return false;
  }
}

function mergeSuppressions(existing, newSuppressions) {
  if (!existing) existing = {};
  if (!newSuppressions) newSuppressions = {};
  const merged = { ...existing };
  const now = Date.now();
  for (const key of Object.keys(merged)) {
    if (merged[key].expiresAt && merged[key].expiresAt < now) {
      delete merged[key];
    }
  }
  for (const key of Object.keys(newSuppressions)) {
    const supp = newSuppressions[key];
    if (supp.expiresAt && supp.expiresAt < now) continue;
    if (merged[key]) {
      merged[key].count = (merged[key].count || 0) + (supp.count || 1);
      merged[key].lastSeen = supp.lastSeen || now;
      if (supp.confidence !== undefined) {
        merged[key].confidence = Math.max(merged[key].confidence || 0, supp.confidence);
      }
    } else {
      merged[key] = { ...supp };
    }
  }
  const keys = Object.keys(merged);
  if (keys.length > MAX_SUPPRESSIONS_PER_PROJECT) {
    const sorted = keys.sort((a, b) => (merged[b].lastSeen || 0) - (merged[a].lastSeen || 0));
    for (let i = MAX_SUPPRESSIONS_PER_PROJECT; i < sorted.length; i++) {
      delete merged[sorted[i]];
    }
  }
  return merged;
}

function exportAutoSuppressions(projectId, suppressionPath) {
  if (!suppressionPath) {
    suppressionPath = getSuppressionPath();
  }
  const suppressions = loadAutoSuppressions(projectId, suppressionPath);
  return JSON.stringify(suppressions, null, 2);
}

function importAutoSuppressions(jsonStr, projectId, suppressionPath) {
  if (!suppressionPath) {
    suppressionPath = getSuppressionPath();
  }
  try {
    const imported = JSON.parse(jsonStr);
    const existing = loadAutoSuppressions(projectId, suppressionPath);
    const merged = mergeSuppressions(existing, imported);
    saveAutoSuppressions(merged, projectId, suppressionPath);
    return true;
  } catch {
    return false;
  }
}

function analyzeForAutoSuppression(content, context) {
  if (!content || typeof content !== 'string') {
    return { shouldSuppress: false, confidence: 0, patterns: [] };
  }
  const results = [];
  let totalConfidence = 0;
  for (const [name, heuristic] of Object.entries(PATTERN_HEURISTICS)) {
    try {
      const score = heuristic(content, context || '', {});
      if (score > 0) {
        results.push({ pattern: name, confidence: score });
        totalConfidence += score;
      }
    } catch {}
  }
  const avgConfidence = results.length > 0 ? totalConfidence / results.length : 0;
  const shouldSuppress = avgConfidence >= CONFIDENCE_THRESHOLD;
  return {
    shouldSuppress,
    confidence: avgConfidence,
    patterns: results
  };
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

/g) || []).join('').length / text.length;
  if (codeBlockRatio > 0.7) {
    return true;
  }
  
  return false;
}

function isPatternDocumentation(text, patternType, confidence) {
  if (!text || typeof text !== 'string') return false;
  if (!PATTERN_HEURISTICS[patternType]) return false;
  
  const heuristicScore = PATTERN_HEURISTICS[patternType](text, confidence, {});
  return heuristicScore >= CONFIDENCE_THRESHOLD;
}

function getProjectId() {
  try {
    const cwd = process.cwd();
    const gitDir = path.join(cwd, '.git');
    
    if (fs.existsSync(gitDir)) {
      const headFile = path.join(gitDir, 'HEAD');
      if (fs.existsSync(headFile)) {
        const head = fs.readFileSync(headFile, 'utf8').trim();
        if (head.startsWith('ref:')) {
          const refPath = path.join(gitDir, head.substring(5).trim());
          if (fs.existsSync(refPath)) {
            const commit = fs.readFileSync(refPath, 'utf8').trim();
            return commit.substring(0, 8);
          }
        } else {
          return head.substring(0, 8);
        }
      }
    }
    
    const packageJson = path.join(cwd, 'package.json');
    if (fs.existsSync(packageJson)) {
      const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
      return `${pkg.name || 'unknown'}-${(pkg.version || '0.0.0').replace(/\./g, '')}`;
    }
    
    return path.basename(cwd).replace(/[^a-zA-Z0-9]/g, '_');
  } catch (error) {
    return 'unknown_project';
  }
}

function getSuppressionFilePath(projectId) {
  const suppressionDir = getSuppressionPath();
  if (!fs.existsSync(suppressionDir)) {
    fs.mkdirSync(suppressionDir, { recursive: true });
  }
  return path.join(suppressionDir, `${projectId}.json`);
}

function loadAutoSuppressions(projectId, options = {}) {
  const filePath = getSuppressionFilePath(projectId);
  
  try {
    if (!fs.existsSync(filePath)) {
      return { suppressions: [], version: 1, created: Date.now() };
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const now = Date.now();
    const validSuppressions = (data.suppressions || []).filter(s => {
      if (!s.expires) return true;
      return s.expires > now;
    });
    
    if (validSuppressions.length !== (data.suppressions || []).length) {
      data.suppressions = validSuppressions;
      data.lastPruned = now;
    }
    
    return data;
  } catch (error) {
    return { suppressions: [], version: 1, created: Date.now(), error: error.message };
  }
}

function saveAutoSuppressions(projectId, suppressions, options = {}) {
  const filePath = getSuppressionFilePath(projectId);
  
  const data = {
    version: 1,
    updated: Date.now(),
    projectId,
    suppressions: suppressions.slice(0, MAX_SUPPRESSIONS_PER_PROJECT).map(s => ({
      ...s,
      expires: s.expires || Date.now() + SUPPRESSION_EXPIRY_MS
    }))
  };
  
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const tempFile = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, filePath);
    
    return { success: true, count: data.suppressions.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function clearAutoSuppressions(projectId, options = {}) {
  const filePath = getSuppressionFilePath(projectId);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { success: true, cleared: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function mergeSuppressions(existing, incoming) {
  const merged = [...existing];
  const seen = new Set(existing.map(s => s.pattern || s.id));
  
  for (const suppression of incoming) {
    const key = suppression.pattern || suppression.id;
    if (!seen.has(key)) {
      merged.push(suppression);
      seen.add(key);
    }
  }
  
  return merged.slice(0, MAX_SUPPRESSIONS_PER_PROJECT);
}

function exportAutoSuppressions(projectId, format = 'json') {
  const data = loadAutoSuppressions(projectId);
  
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }
  
  if (format === 'markdown') {
    let md = `# Auto-Suppressions for ${projectId}\n\n`;
    md += `Generated: ${new Date().toISOString()}\n\n`;
    md += `| Pattern | Type | Confidence | Created | Expires |\n`;
    md += `|---------|------|------------|---------|--------|\n`;
    
    for (const s of data.suppressions) {
      const expires = s.expires ? new Date(s.expires).toISOString().split('T')[0] : 'never';
      md += `| ${s.pattern || s.id} | ${s.type || 'unknown'} | ${s.confidence || 'N/A'} | ${new Date(s.created).toISOString().split('T')[0]} | ${expires} |\n`;
    }
    
    return md;
  }
  
  throw new Error(`Unsupported export format: ${format}`);
}

function importAutoSuppressions(projectId, data, options = {}) {
  let parsed;
  
  try {
    if (typeof data === 'string') {
      parsed = JSON.parse(data);
    } else {
      parsed = data;
    }
  } catch (error) {
    throw new Error(`Failed to parse import data: ${error.message}`);
  }
  
  const incoming = parsed.suppressions || parsed;
  if (!Array.isArray(incoming)) {
    throw new Error('Import data must contain a suppressions array');
  }
  
  const validated = incoming.filter(s => {
    return s && (s.pattern || s.id) && typeof s.confidence === 'number';
  });
  
  const current = loadAutoSuppressions(projectId);
  const merged = mergeSuppressions(current.suppressions, validated);
  
  return saveAutoSuppressions(projectId, merged);
}

function analyzeForAutoSuppression(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return { shouldSuppress: false, reason: 'invalid_input' };
  }
  
  const results = [];
  
  for (const [patternType, heuristic] of Object.entries(PATTERN_HEURISTICS)) {
    const score = heuristic(text, 0, options.context || {});
    if (score >= CONFIDENCE_THRESHOLD) {
      results.push({
        pattern: patternType,
        confidence: score,
        type: 'heuristic_match'
      });
    }
  }
  
  if (isLikelyFalsePositive(text, 1.0)) {
    results.push({
      pattern: 'false_positive',
      confidence: 0.95,
      type: 'code_heuristic'
    });
  }
  
  if (results.length === 0) {
    return { shouldSuppress: false, reason: 'no_patterns_matched' };
  }
  
  const bestMatch = results.reduce((a, b) => a.confidence > b.confidence ? a : b);
  
  return {
    shouldSuppress: true,
    pattern: bestMatch.pattern,
    confidence: bestMatch.confidence,
    allMatches: results,
    recommendation: `Consider refining prompt to address: ${bestMatch.pattern}`
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

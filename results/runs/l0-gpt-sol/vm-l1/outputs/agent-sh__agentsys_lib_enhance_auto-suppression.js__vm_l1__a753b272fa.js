|~~~/g);
  return Boolean(fences && fences.length % 2);
}

function isPatternDocumentation(content, pattern, location) {
  if (typeof content !== 'string' || !content) {
    return false;
  }

  let index = indexFromLocation(content, location);

  if (index < 0) {
    if (pattern && typeof pattern === 'object') {
      index = indexFromLocation(content, pattern);
      pattern =
        pattern.match ||
        pattern.text ||
        pattern.pattern ||
        pattern.message ||
        '';
    }

    if (index < 0 && typeof pattern === 'string') {
      index = content.indexOf(pattern);
    }
  }

  if (index < 0) {
    return false;
  }

  if (isInsideCodeFence(content, index)) {
    return true;
  }

  const lineStart = content.lastIndexOf('\n', index - 1) + 1;
  const lineEnd = content.indexOf('\n', index);
  const line = content.slice(
    lineStart,
    lineEnd < 0 ? content.length : lineEnd
  );
  const prefix = line.slice(0, Math.max(0, index - lineStart));

  if (/^\s*(?:>|[-*+]\s+)?(?:example|examples|e\.g\.|for example|sample|documentation|docs?|quoted?|literal|pattern|regex)\b/i.test(line)) {
    return true;
  }

  if (/^\s*(?:\/\/|#|\/\*|\*|<!--)/.test(line)) {
    return true;
  }

  const singleQuotes = (prefix.match(/'/g) || []).length;
  const doubleQuotes = (prefix.match(/"/g) || []).length;
  const backticks = (prefix.match(/`/g) || []).length;

  return singleQuotes % 2 === 1 ||
    doubleQuotes % 2 === 1 ||
    backticks % 2 === 1;
}

function getFindingText(finding, content) {
  if (typeof content === 'string') {
    return content;
  }

  if (finding && typeof finding === 'object') {
    return String(
      finding.content ??
      finding.source ??
      finding.prompt ??
      finding.text ??
      ''
    );
  }

  return '';
}

function findingPattern(finding) {
  if (typeof finding === 'string') {
    return finding;
  }

  if (!finding || typeof finding !== 'object') {
    return '';
  }

  return String(
    finding.patternId ??
    finding.pattern ??
    finding.ruleId ??
    finding.rule ??
    finding.code ??
    finding.type ??
    ''
  );
}

function containsExamples(text) {
  return /\b(?:for example|examples?|e\.g\.|sample|such as)\b/i.test(text) ||
    /

const discovery = (() => {
  const fs = require('fs');
  const path = require('path');

  function loadDiscovery() {
    const discoveryPath = path.join(__dirname, '..', 'work', 'agent-sh__agentsys', 'lib', 'discovery', 'index.js');
    if (!fs.existsSync(discoveryPath)) {
      throw new Error(`Discovery module not found at ${discoveryPath}`);
    }
    return require(discoveryPath);
  }

  return loadDiscovery();
})();

function transformBodyForOpenCode(body, frontmatter) {
  const lines = body.split('\n');
  const transformed = lines.map(line => {
    if (line.startsWith('## ')) {
      return `### ${line.slice(3)}`;
    }
    return line;
  });
  return transformed.join('\n');
}

function transformCommandFrontmatterForOpenCode(frontmatter) {
  const result = { ...frontmatter };
  if (result.name) {
    result.title = result.name;
    delete result.name;
  }
  if (result.description) {
    result.summary = result.description;
    delete result.description;
  }
  return result;
}

function transformAgentFrontmatterForOpenCode(frontmatter, body) {
  const result = { ...frontmatter };
  if (result.name) {
    result.title = result.name;
    delete result.name;
  }
  if (result.description) {
    result.summary = result.description;
    delete result.description;
  }
  if (body && !result.instructions) {
    result.instructions = body;
  }
  return result;
}

function transformSkillBodyForOpenCode(body, frontmatter) {
  const lines = body.split('\n');
  const transformed = lines.map(line => {
    if (line.startsWith('## ')) {
      return `### ${line.slice(3)}`;
    }
    return line;
  });
  return transformed.join('\n');
}

function transformForCodex(agent, frontmatter) {
  const result = { ...agent };
  if (frontmatter) {
    result.frontmatter = frontmatter;
  }
  return result;
}

function transformRuleForCursor(rule, frontmatter) {
  const result = { ...rule };
  if (frontmatter) {
    result.frontmatter = frontmatter;
  }
  return result;
}

function transformSkillForCursor(skill, frontmatter) {
  const result = { ...skill };
  if (frontmatter) {
    result.frontmatter = frontmatter;
  }
  return result;
}

function transformCommandForCursor(command, frontmatter) {
  const result = { ...command };
  if (frontmatter) {
    result.frontmatter = frontmatter;
  }
  return result;
}

function transformSkillForKiro(skill, frontmatter) {
  const result = { ...skill };
  if (frontmatter) {
    result.frontmatter = frontmatter;
  }
  return result;
}

function transformCommandForKiro(command, frontmatter) {
  const result = { ...command };
  if (frontmatter) {
    result.frontmatter = frontmatter;
  }
  return result;
}

function transformAgentForKiro(agent, frontmatter) {
  const result = { ...agent };
  if (frontmatter) {
    result.frontmatter = frontmatter;
  }
  return result;
}

function generateCombinedReviewerAgent(agents, options = {}) {
  const combined = {
    name: 'combined-reviewer',
    description: 'Combined reviewer agent',
    instructions: '',
    tools: [],
    model: options.model || 'claude-sonnet-4-20250514',
    temperature: options.temperature || 0.2,
  };

  const agentList = Array.isArray(agents) ? agents : [agents];
  const sections = [];

  for (const agent of agentList) {
    if (!agent) continue;
    const name = agent.name || 'unnamed-agent';
    const description = agent.description || '';
    const instructions = agent.instructions || '';
    sections.push(`## ${name}\n${description}\n\n${instructions}`);
  }

  combined.instructions = sections.join('\n\n---\n\n');
  return combined;
}

module.exports = {
  transformBodyForOpenCode,
  transformCommandFrontmatterForOpenCode,
  transformAgentFrontmatterForOpenCode,
  transformSkillBodyForOpenCode,
  transformForCodex,
  transformRuleForCursor,
  transformSkillForCursor,
  transformCommandForCursor,
  transformForCursor: transformRuleForCursor,
  transformSkillForKiro,
  transformCommandForKiro,
  transformAgentForKiro,
  generateCombinedReviewerAgent,
};

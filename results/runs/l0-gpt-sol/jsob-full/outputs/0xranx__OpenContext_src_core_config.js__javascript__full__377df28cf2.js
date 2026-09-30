const path = require('path');
const fs = require('fs');
const os = require('os');

const DEFAULT_BASE_ROOT = path.join(os.homedir(), '.opencontext');
const BASE_ROOT = process.env.OPENCONTEXT_ROOT || DEFAULT_BASE_ROOT;
const CONFIG_PATH = path.join(BASE_ROOT, 'config.json');

const CONFIG_KEYS = {
  OPENAI_API_KEY: {
    description: 'OpenAI API key.',
    sensitive: true,
    envVar: 'OPENCONTEXT_OPENAI_API_KEY',
    fallbackEnvVar: 'OPENAI_API_KEY'
  },
  OPENAI_API_BASE: {
    description: 'Base URL for the OpenAI-compatible API service.',
    sensitive: false,
    envVar: 'OPENCONTEXT_OPENAI_API_BASE',
    fallbackEnvVar: 'OPENAI_API_BASE',
    default: 'https://api.openai.com/v1'
  },
  OPENAI_MODEL: {
    description: 'OpenAI-compatible model to use.',
    sensitive: false,
    envVar: 'OPENCONTEXT_OPENAI_MODEL',
    default: 'gpt-4o'
  },
  OPENAI_TEMPERATURE: {
    description: 'Temperature used when generating responses.',
    sensitive: false,
    envVar: 'OPENCONTEXT_OPENAI_TEMPERATURE',
    default: '0.1'
  },
  ANTHROPIC_API_KEY: {
    description: 'Anthropic API key.',
    sensitive: true,
    envVar: 'OPENCONTEXT_ANTHROPIC_API_KEY',
    fallbackEnvVar: 'ANTHROPIC_API_KEY'
  },
  ANTHROPIC_MODEL: {
    description: 'Anthropic model to use.',
    sensitive: false,
    envVar: 'OPENCONTEXT_ANTHROPIC_MODEL',
    default: 'claude-3-5-sonnet-20241022'
  },
  PROVIDER: {
    description: 'AI provider name.',
    sensitive: false,
    envVar: 'OPENCONTEXT_PROVIDER',
    default: 'openai'
  },
  SYSTEM_PROMPT: {
    description: 'System prompt used when generating responses.',
    sensitive: false,
    envVar: 'OPENCONTEXT_SYSTEM_PROMPT',
    default: ''
  }
};

function ensureConfigDir() {
  if (!fs.existsSync(BASE_ROOT)) {
    fs.mkdirSync(BASE_ROOT, { recursive: true });
  }
}

function loadConfig() {
  ensureConfigDir();

  if (!fs.existsSync(CONFIG_PATH)) {
    return {};
  }

  try {
    const contents = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(contents);
  } catch (error) {
    console.warn(`Failed to load configuration: ${error.message}`);
    return {};
  }
}

function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

function get(key) {
  const definition = CONFIG_KEYS[key];

  if (definition?.envVar && process.env[definition.envVar]) {
    return process.env[definition.envVar];
  }

  if (
    definition?.fallbackEnvVar &&
    process.env[definition.fallbackEnvVar]
  ) {
    return process.env[definition.fallbackEnvVar];
  }

  const config = loadConfig();

  if (config[key] !== undefined) {
    return config[key];
  }

  return definition?.default;
}

function set(key, value) {
  if (!CONFIG_KEYS[key]) {
    throw new Error(
      `Unknown configuration key "${key}". Available keys: ${Object.keys(
        CONFIG_KEYS
      ).join(', ')}`
    );
  }

  const config = loadConfig();
  config[key] = value;
  saveConfig(config);
}

function unset(key) {
  const config = loadConfig();
  delete config[key];
  saveConfig(config);
}

function maskSensitive(value) {
  if (!value || value.length < 8) {
    return '********';
  }

  return `${value.substring(0, 4)}****${value.substring(value.length - 4)}`;
}

function list(maskValues = false) {
  const config = loadConfig();
  const entries = [];

  for (const [key, definition] of Object.entries(CONFIG_KEYS)) {
    let value = null;
    let source = 'not set';

    if (definition.envVar && process.env[definition.envVar]) {
      value = process.env[definition.envVar];
      source = 'environment';
    } else if (
      definition.fallbackEnvVar &&
      process.env[definition.fallbackEnvVar]
    ) {
      value = process.env[definition.fallbackEnvVar];
      source = 'fallback environment';
    } else if (config[key] !== undefined) {
      value = config[key];
      source = 'config';
    } else if (definition.default !== undefined) {
      value = definition.default;
      source = 'default';
    }

    let displayedValue = value;

    if (value && definition.sensitive && maskValues) {
      displayedValue = maskSensitive(value);
    } else if (value && definition.sensitive) {
      displayedValue = '********';
    }

    entries.push({
      key,
      value: displayedValue,
      source,
      description: definition.description,
      isSet: value !== null && value !== undefined
    });
  }

  return entries;
}

function getConfigPath() {
  return CONFIG_PATH;
}

function getAvailableKeys() {
  return Object.keys(CONFIG_KEYS);
}

module.exports = {
  get,
  set,
  unset,
  list,
  loadConfig,
  saveConfig,
  getConfigPath,
  getAvailableKeys,
  CONFIG_KEYS,
  BASE_ROOT
};

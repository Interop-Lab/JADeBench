const path = require('path');
const fs = require('fs');
const os = require('os');

const DEFAULT_BASE_ROOT = path.join(os.homedir(), '.opencontext');
const BASE_ROOT = process.env.OPENCONTEXT_ROOT || DEFAULT_BASE_ROOT;
const CONFIG_PATH = path.join(BASE_ROOT, 'config.json');

const CONFIG_KEYS = {
  EMBEDDING_API_KEY: {
    description: 'API Key for embedding generation (OpenAI, DashScope, etc.)',
    sensitive: true,
    envVar: 'EMBEDDING_API_KEY',
    fallbackEnvVar: 'OPENAI_API_KEY',
  },
  EMBEDDING_API_BASE: {
    description: 'API Base URL for embedding service',
    sensitive: false,
    envVar: 'EMBEDDING_API_BASE',
    fallbackEnvVar: 'OPENAI_BASE_URL',
    default: 'https://api.openai.com/v1',
  },
  EMBEDDING_MODEL: {
    description: 'Embedding model name',
    sensitive: false,
    envVar: 'EMBEDDING_MODEL',
    default: 'text-embedding-3-small',
  },
  AI_PROVIDER: {
    description: 'AI provider: openai | ollama',
    sensitive: false,
    envVar: 'AI_PROVIDER',
    default: 'openai',
  },
  AI_API_KEY: {
    description: 'API Key for AI chat (OpenAI compatible)',
    sensitive: true,
    envVar: 'AI_API_KEY',
    fallbackEnvVar: 'OPENAI_API_KEY',
  },
  AI_API_BASE: {
    description: 'API Base URL for AI chat service',
    sensitive: false,
    envVar: 'AI_API_BASE',
    default: 'https://api.openai.com/v1',
  },
  AI_MODEL: {
    description: 'AI chat model name',
    sensitive: false,
    envVar: 'AI_MODEL',
    default: 'gpt-4o',
  },
  AI_PROMPT: {
    description: 'Custom system prompt for AI reflections',
    sensitive: false,
    envVar: 'AI_PROMPT',
    default:
      'You are an AI within a journaling app. Your job is to help the user reflect on their thoughts in a thoughtful and kind manner. The user can never directly address you or directly respond to you. Try not to repeat what the user said, instead try to seed new ideas, encourage or debate. Keep your responses concise, but meaningful. Respond in the same language as the user.',
  },
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
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch (error) {
    console.error(`Warning: Failed to parse config file: ${error.message}`);
    return {};
  }
}

function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

function get(key) {
  const keyConfig = CONFIG_KEYS[key];

  if (keyConfig?.envVar && process.env[keyConfig.envVar]) {
    return process.env[keyConfig.envVar];
  }

  if (keyConfig?.fallbackEnvVar && process.env[keyConfig.fallbackEnvVar]) {
    return process.env[keyConfig.fallbackEnvVar];
  }

  const config = loadConfig();
  if (config[key] !== undefined) {
    return config[key];
  }

  if (key === 'EMBEDDING_API_KEY' && config.OPENAI_API_KEY !== undefined) {
    return config.OPENAI_API_KEY;
  }

  if (key === 'EMBEDDING_API_BASE' && config.OPENAI_BASE_URL !== undefined) {
    return config.OPENAI_BASE_URL;
  }

  return keyConfig?.default;
}

function set(key, value) {
  if (!CONFIG_KEYS[key]) {
    throw new Error(
      `Unknown config key: ${key}. Run "oc config list" to see available keys.`,
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

function list(showValues = false) {
  const config = loadConfig();
  const entries = [];

  for (const [key, keyConfig] of Object.entries(CONFIG_KEYS)) {
    let value = null;
    let source = 'default';

    if (keyConfig.envVar && process.env[keyConfig.envVar]) {
      value = process.env[keyConfig.envVar];
      source = 'env';
    } else if (
      keyConfig.fallbackEnvVar &&
      process.env[keyConfig.fallbackEnvVar]
    ) {
      value = process.env[keyConfig.fallbackEnvVar];
      source = 'env (legacy)';
    } else if (config[key] !== undefined) {
      value = config[key];
      source = 'config';
    } else if (keyConfig.default) {
      value = keyConfig.default;
    }

    let displayValue = value;
    if (value && keyConfig.sensitive) {
      displayValue = showValues ? maskSensitive(value) : '********';
    }

    entries.push({
      key,
      value: displayValue,
      source,
      description: keyConfig.description,
      isSet: value !== null && value !== undefined,
    });
  }

  return entries;
}

function maskSensitive(value) {
  if (!value || value.length < 8) {
    return '********';
  }

  return `${value.substring(0, 4)}••••••••${value.substring(value.length - 4)}`;
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
  BASE_ROOT,
};

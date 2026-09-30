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
    fallbackEnvVar: 'OPENAI_API_KEY'
  },
  EMBEDDING_API_BASE: {
    description: 'API Base URL for embedding service',
    sensitive: false,
    envVar: 'EMBEDDING_API_BASE',
    fallbackEnvVar: 'OPENAI_BASE_URL',
    default: 'https://api.openai.com/v1'
  },
  EMBEDDING_MODEL: {
    description: 'Embedding model name',
    sensitive: false,
    envVar: 'EMBEDDING_MODEL',
    default: 'text-embedding-3-small'
  },
  AI_PROVIDER: {
    description: 'AI provider: openai | ollama',
    sensitive: false,
    envVar: 'AI_PROVIDER',
    default: 'openai'
  },
  AI_API_KEY: {
    description: 'API Key for AI chat (OpenAI compatible)',
    sensitive: true,
    envVar: 'AI_API_KEY',
    fallbackEnvVar: 'OPENAI_API_KEY'
  },
  AI_API_BASE: {
    description: 'API Base URL for AI chat service',
    sensitive: false,
    envVar: 'AI_API_BASE',
    default: 'https://api.openai.com/v1'
  },
  AI_MODEL: {
    description: 'AI chat model name',
    sensitive: false,
    envVar: 'AI_MODEL',
    default: 'gpt-4o'
  },
  AI_PROMPT: {
    description: 'Custom system prompt for AI reflections',
    sensitive: false,
    envVar: 'AI_PROMPT',
    default: 'You are an AI within a journaling app. Your job is to help the user reflect on their thoughts in a thoughtful and kind manner. The user can never directly address you or directly respond to you. Try not to repeat what the user said, instead try to seed new ideas, encourage or debate. Keep your responses concise, but meaningful. Respond in the same language as the user.'
  }
};

function ensureConfigDir() {
  if (!fs.existsSync(BASE_ROOT)) {
    fs.mkdirSync(BASE_ROOT, { recursive: true });
  }
}

function loadConfig() {
  ensureConfigDir();
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading config:', err.message);
  }
  return {};
}

function saveConfig(config) {
  ensureConfigDir();
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving config:', err.message);
    return false;
  }
}

function get(key) {
  const config = loadConfig();
  const keyConfig = CONFIG_KEYS[key];
  
  if (!keyConfig) {
    return undefined;
  }
  
  if (process.env[keyConfig.envVar]) {
    return process.env[keyConfig.envVar];
  }
  
  if (keyConfig.fallbackEnvVar && process.env[keyConfig.fallbackEnvVar]) {
    return process.env[keyConfig.fallbackEnvVar];
  }
  
  if (config[key] !== undefined) {
    return config[key];
  }
  
  return keyConfig.default;
}

function set(key, value) {
  const config = loadConfig();
  config[key] = value;
  return saveConfig(config);
}

function unset(key) {
  const config = loadConfig();
  delete config[key];
  return saveConfig(config);
}

function list() {
  const config = loadConfig();
  const result = {};
  
  for (const key of Object.keys(CONFIG_KEYS)) {
    result[key] = {
      value: get(key),
      source: config[key] !== undefined ? 'config' : 
              process.env[CONFIG_KEYS[key].envVar] ? 'env' :
              CONFIG_KEYS[key].fallbackEnvVar && process.env[CONFIG_KEYS[key].fallbackEnvVar] ? 'fallback_env' :
              CONFIG_KEYS[key].default !== undefined ? 'default' : 'unset'
    };
  }
  
  return result;
}

function maskSensitive(value) {
  if (!value) return value;
  if (value.length <= 8) return '***';
  return value.slice(0, 4) + '***' + value.slice(-4);
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

var path = require('path'),
    fs = require('fs'),
    os = require('os'),
    DEFAULT_BASE_ROOT = path.join(os.homedir(), '.opencontext'),
    BASE_ROOT = process.env.OPENCONTEXT_ROOT || DEFAULT_BASE_ROOT,
    CONFIG_PATH = path.join(BASE_ROOT, 'config.json');

const CONFIG_KEYS = {
    API_KEY: {
        description: 'API key for authentication (required to use the API.)',
        isSecret: true,
        envVar: 'OPENCONTEXT_API_KEY',
        fallbackEnvVar: 'OPEN_API_KEY'
    },
    MODEL: {
        description: 'Model preference for completions',
        isSecret: false,
        envVar: 'OPENCONTEXT_MODEL',
        fallbackEnvVar: 'OPEN_MODEL',
        defaultValue: 'default'
    },
    OUTPUT_FORMAT: {
        description: 'Output format preference',
        isSecret: false,
        envVar: 'OPENCONTEXT_OUTPUT',
        defaultValue: 'text'
    },
    MAX_TOKENS: {
        description: 'Maximum tokens for response',
        isSecret: false,
        envVar: 'OPENCONTEXT_MAX_TOKENS',
        defaultValue: '4096'
    },
    TEMPERATURE: {
        description: 'Temperature for response generation',
        isSecret: false,
        envVar: 'OPENCONTEXT_TEMPERATURE',
        defaultValue: '0.7'
    },
    SYSTEM_PROMPT: {
        description: 'Custom system prompt',
        isSecret: false,
        envVar: 'OPENCONTEXT_SYSTEM_PROMPT',
        defaultValue: ''
    },
    VERBOSE: {
        description: 'Enable verbose output',
        isSecret: false,
        envVar: 'OPENCONTEXT_VERBOSE',
        defaultValue: 'false'
    },
    ENDPOINT: {
        description: 'Custom API endpoint URL (use with compatible API providers like OpenRouter, Azure OpenAI, or local servers like Ollama, LM Studio, vLLM, etc. Set this to use providers other than the default OpenContext API.)',
        isSecret: false,
        envVar: 'OPENCONTEXT_ENDPOINT',
        defaultValue: 'default'
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
        const data = fs.readFileSync(CONFIG_PATH, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return console.error('Error loading config: ' + e.message), {};
    }
}

function saveConfig(config) {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

function get(key) {
    const configKey = CONFIG_KEYS[key];
    if (configKey?.envVar && process.env[configKey.envVar]) {
        return process.env[configKey.envVar];
    }
    if (configKey?.fallbackEnvVar && process.env[configKey.fallbackEnvVar]) {
        return process.env[configKey.fallbackEnvVar];
    }
    const config = loadConfig();
    if (config[key] !== undefined) {
        return config[key];
    }
    if (key === 'MODEL' && config['OPENCONTEXT_MODEL'] !== undefined) {
        return config['OPENCONTEXT_MODEL'];
    }
    if (key === 'OUTPUT_FORMAT' && config['OPENCONTEXT_OUTPUT'] !== undefined) {
        return config['OPENCONTEXT_OUTPUT'];
    }
    return configKey?.defaultValue;
}

function set(key, value) {
    if (!CONFIG_KEYS[key]) {
        throw new Error('Unknown configuration key: ' + key + '. Use getAvailableKeys() to see valid options.');
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

function list(maskSecrets = false) {
    const config = loadConfig();
    const result = [];
    for (const [key, keyConfig] of Object.entries(CONFIG_KEYS)) {
        let value = null, source = 'not set';
        if (keyConfig.envVar && process.env[keyConfig.envVar]) {
            value = process.env[keyConfig.envVar];
            source = 'env';
        } else {
            if (keyConfig.fallbackEnvVar && process.env[keyConfig.fallbackEnvVar]) {
                value = process.env[keyConfig.fallbackEnvVar];
                source = 'env';
            } else {
                if (config[key] !== undefined) {
                    value = config[key];
                    source = 'config';
                } else {
                    if (keyConfig.defaultValue) {
                        value = keyConfig.defaultValue;
                        source = 'default';
                    }
                }
            }
        }
        let displayValue = value;
        if (value && keyConfig.isSecret && maskSecrets) {
            displayValue = maskSensitive(value);
        } else {
            if (value && keyConfig.isSecret) {
                displayValue = '[hidden]';
            }
        }
        result.push({
            key: key,
            value: displayValue,
            source: source,
            description: keyConfig.description,
            isSet: value !== null && value !== undefined
        });
    }
    return result;
}

function maskSensitive(value) {
    if (!value || value.length < 4) {
        return '****';
    }
    const prefix = value.slice(0, 2);
    const suffix = value.slice(value.length - 2);
    return prefix + '****' + suffix;
}

function getConfigPath() {
    return CONFIG_PATH;
}

function getAvailableKeys() {
    return Object.keys(CONFIG_KEYS);
}

const exports_obj = {};
exports_obj.get = get;
exports_obj.set = set;
exports_obj.unset = unset;
exports_obj.list = list;
exports_obj.loadConfig = loadConfig;
exports_obj.saveConfig = saveConfig;
exports_obj.getConfigPath = getConfigPath;
exports_obj.getAvailableKeys = getAvailableKeys;
exports_obj.CONFIG_KEYS = CONFIG_KEYS;
exports_obj.BASE_ROOT = BASE_ROOT;

module.exports = exports_obj;

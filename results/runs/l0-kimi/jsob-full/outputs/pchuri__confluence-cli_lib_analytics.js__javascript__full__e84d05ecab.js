const fs = require('fs');
const path = require('path');
const os = require('os');
const inquirer = require('inquirer');
const chalk = require('chalk');

const VALID_LINK_STYLES = ['markdown', 'confluence', 'plain'];

function getLinkStyle({ isCloud = false, linkStyle = null } = {}) {
  if (VALID_LINK_STYLES.includes(linkStyle)) {
    return linkStyle;
  }
  return isCloud ? 'confluence' : 'markdown';
}

module.exports = {
  VALID_LINK_STYLES,
  getLinkStyle
};

const output = {
  setVerbose: (enabled) => { verbose = Boolean(enabled); },
  isVerbose: () => verbose,
  printJson: (data) => {
    console.log(JSON.stringify(data, null, 2));
  },
  printError: (error, options = {}) => {
    if (shouldSuppress(error)) return;
    const status = options.status ?? error?.response?.status ?? null;
    const details = options.details ?? error?.response?.data ?? null;
    const errorOutput = {
      error: options.message ?? error?.message ?? String(error),
      code: options.code ?? getErrorCode(error),
      status,
      details
    };
    console.error(JSON.stringify(errorOutput, null, 2));
  },
  getErrorCode: (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) return 'AUTH_ERROR';
    if (status === 404) return 'NOT_FOUND';
    if (status === 429) return 'RATE_LIMIT';
    if (typeof status === 'number' && status >= 500) return 'SERVER_ERROR';
    if (error?.code && ERROR_CODES.includes(error.code)) return error.code;
    if (error instanceof Error) return 'UNKNOWN_ERROR';
    return 'UNKNOWN';
  },
  shouldSuppress: (error, options = {}) => {
    if (!error) return false;
    const message = typeof options.message === 'function' ? options.message() : '';
    if (message === 'suppressed') {
      if (!suppressed) {
        suppressed = true;
        console.error(chalk.yellow('Additional errors suppressed...'));
      }
      return true;
    }
    return false;
  }
};

const ERROR_CODES = [
  'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET',
  'EPIPE', 'EAI_AGAIN', 'EPROTO', 'CERT_HAS_EXPIRED',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'SELF_SIGNED_CERT_IN_CHAIN',
  'DEPTH_ZERO_SELF_SIGNED_CERT', 'ERR_TLS_CERT_ALTNAME_INVALID'
];

let verbose = false;
let suppressed = false;

module.exports = {
  printJson: output.printJson,
  printError: output.printError,
  getErrorCode: output.getErrorCode,
  shouldSuppress: output.shouldSuppress,
  setVerbose: output.setVerbose,
  isVerbose: output.isVerbose
};

const netrc = {
  getNetrcPath: () => {
    if (process.env.NETRC) return process.env.NETRC;
    const home = os.homedir();
    const netrcFile = process.platform === 'win32' ? '_netrc' : '.netrc';
    return path.join(home, netrcFile);
  },
  parseNetrc: (content) => {
    const machines = [];
    const regex = /"((?:[^"\\]|\\.)*)"|(\S+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      machines.push(match[1] !== undefined ? match[1].replace(/\\(.)/g, '$1') : match[0]);
    }
    return machines;
  },
  readNetrc: (content) => {
    const machines = [];
    let current = null;
    let inDefault = false;
    for (const line of content.split('\n')) {
      if (inDefault) {
        if (line.trim() === '') {
          inDefault = false;
          continue;
        }
      }
      if (line.trim().startsWith('#')) continue;
      const tokens = netrc.parseNetrc(line);
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        switch (token) {
          case 'machine':
            current = { machine: tokens[++i], login: undefined, password: undefined };
            machines.push(current);
            break;
          case 'default':
            current = { machine: null, login: undefined, password: undefined };
            machines.push(current);
            break;
          case 'login':
            if (current) current.login = tokens[++i];
            break;
          case 'password':
            if (current) current.password = tokens[++i];
            break;
          default:
            i++;
            break;
        }
      }
    }
    return machines;
  },
  lookupNetrc: ({ machine = '', login = null } = {}) => {
    const machineName = machine.trim().toLowerCase();
    if (!machineName) return null;
    const netrcPath = netrc.getNetrcPath();
    let content;
    try {
      content = fs.readFileSync(netrcPath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      if (!isJsonMode()) {
        console.error(chalk.yellow(`Warning: Could not read netrc file at ${netrcPath}: ${error.message}`));
      }
      return null;
    }
    const machines = netrc.readNetrc(content);
    const found = machines.find(m => 
      m.machine && m.machine.toLowerCase() === machineName && 
      (login === null || m.login === login)
    );
    if (!found) return null;
    return {
      login: found.login,
      password: found.password,
      machine: found.machine
    };
  }
};

module.exports = {
  getNetrcPath: netrc.getNetrcPath,
  readNetrc: netrc.readNetrc,
  lookupNetrc: netrc.lookupNetrc
};

const config = {
  getConfigDir: () => {
    if (process.env.CONFLUENCE_CONFIG_DIR) return process.env.CONFLUENCE_CONFIG_DIR;
    const home = os.homedir();
    const xdgConfig = process.env.XDG_CONFIG_HOME || path.join(home, '.config');
    const legacyPath = path.join(home, '.confluence-cli');
    const newPath = path.join(xdgConfig, 'confluence-cli');
    if (fs.existsSync(legacyPath) && !fs.existsSync(newPath)) return legacyPath;
    return newPath;
  },
  getConfigPath: () => {
    if (!configPath) configPath = config.getConfigDir();
    return configPath;
  },
  readConfig: () => {
    const configDir = config.getConfigPath();
    const configFile = path.join(configDir, 'config.json');
    if (!fs.existsSync(configFile)) return null;
    try {
      const data = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      if (data.profiles && !data.activeProfile) {
        const profiles = Object.keys(data.profiles);
        if (profiles.length > 0) {
          data.activeProfile = profiles[0];
        }
      }
      return data;
    } catch (error) {
      if (!isJsonMode()) {
        console.error(chalk.yellow(`Warning: Could not parse config file at ${configFile}: ${error.message}`));
        console.error(chalk.yellow('Using default configuration.'));
      }
      return null;
    }
  },
  writeConfig: (data) => {
    const configDir = config.getConfigPath();
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    } else if (!fs.existsSync(path.join(configDir, 'config.json'))) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(path.join(configDir, 'config.json'), JSON.stringify(data, null, 2), { mode: 0o600 });
    fs.chmodSync(configDir, 0o700);
  },
  resetConfigPath: () => { configPath = null; },
  validateLinkStyle: (value, fieldName) => {
    if (value === undefined || value === null || value === '') return;
    const normalized = String(value).trim().toLowerCase();
    if (VALID_LINK_STYLES.includes(normalized)) return normalized;
    const prefix = fieldName ? fieldName + ' ' : '';
    if (!isJsonMode()) {
      console.error(chalk.yellow(
        `${prefix}"${value}" is not a valid link style. ` +
        `Valid options: ${VALID_LINK_STYLES.join(', ')}. ` +
        `Using default.`
      ));
    }
    return;
  },
  normalizeProtocol: (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (['https', 'http'].includes(normalized)) return normalized;
    return;
  },
  normalizeDomain: (value) => {
    const normalized = String(value || '').trim();
    if (!normalized) return;
    if (!normalized.includes('/')) throw new Error('Domain must include a slash');
    const withoutTrailingSlash = normalized.replace(/\/+$/, '');
    return withoutTrailingSlash || undefined;
  },
  normalizeApiPath: (value, domain) => {
    const normalized = String(value || '').trim();
    if (!normalized) return config.normalizeDomain(domain);
    if (!normalized.startsWith('/')) throw new Error('API path must start with /');
    try {
      return config.normalizeDomain(normalized);
    } catch (error) {
      return error.message;
    }
  },
  validateProfileName: (name) => /^[a-zA-Z0-9_-]+$/.test(name),
  validateRequired: (fieldName) => (value) => {
    const normalized = String(value || '').trim();
    if (!normalized) return fieldName + ' is required';
    return true;
  },
  validateDomain: (value) => {
    const normalized = String(value || '').trim();
    if (!normalized) return true;
    if (!normalized.includes('/')) return 'Domain must include protocol (e.g., https://example.com)';
    try {
      config.normalizeDomain(normalized);
      return true;
    } catch (error) {
      return error.message;
    }
  },
  validateApiPath: (value, answers) => {
    const domain = answers.domain || answers.host;
    try {
      config.normalizeApiPath(value, domain);
      return true;
    } catch (error) {
      return error.message;
    }
  },
  validateTls: (value) => {
    if (!value || !value.clientCert) return true;
    if (!fs.existsSync(value.clientCert)) {
      return 'Client certificate file does not exist: ' + value.clientCert;
    }
    if (!value.clientKey) {
      return 'Client key is required when using client certificate';
    }
    if (!fs.existsSync(value.clientKey)) {
      return 'Client key file does not exist: ' + value.clientKey;
    }
    if (value.caCert && !fs.existsSync(value.caCert)) {
      return 'CA certificate file does not exist: ' + value.caCert;
    }
    return true;
  },
  parseTls: (input) => {
    if (!input) return;
    const parsed = {
      caCert: config.parseFilePath(input.caCert),
      clientCert: config.parseFilePath(input.clientCert),
      clientKey: config.parseFilePath(input.clientKey)
    };
    if (!parsed.clientCert && !parsed.clientKey && !parsed.caCert) return;
    return parsed;
  },
  parseFilePath: (value) => {
    if (!value) return;
    const expanded = value.replace(/^~/, os.homedir());
    return path.resolve(expanded);
  },
  readProfile: (profileName) => {
    const data = config.readConfig();
    if (!data || !data.profiles || !data.profiles[profileName]) {
      throw new Error(`Profile "${profileName}" not found`);
    }
    const profile = data.profiles[profileName];
    const domain = config.normalizeDomain(profile.domain);
    let apiPath;
    try {
      apiPath = config.normalizeApiPath(profile.apiPath, domain);
    } catch (error) {
      if (throwOnError) throw error;
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
    const protocol = config.normalizeProtocol(profile.protocol);
    const authType = profile.authType?.trim().toLowerCase() || 
      (profile.token ? 'token' : profile.cookie ? 'cookie' : 'basic');
    const email = profile.email?.trim() || undefined;
    const cookie = profile.cookie?.trim() || undefined;
    const mtls = config.parseTls(profile.mtls);
    const readOnly = profile.readOnly ?? false;
    const forceCloud = profile.forceCloud ?? false;
    const linkStyle = config.validateLinkStyle(profile.linkStyle, 'Profile linkStyle') || 'markdown';
    return {
      domain,
      protocol,
      apiPath,
      token: profile.token?.trim(),
      email,
      cookie,
      authType,
      mtls,
      readOnly,
      forceCloud,
      linkStyle
    };
  },
  validateProfile: (profile, profileName) => {
    const errors = [];
    if (profile.domain === undefined || (typeof profile.domain !== 'string' || !profile.domain.trim())) {
      errors.push('Domain is required');
    }
    if (profile.token === undefined || (typeof profile.token !== 'string' || !profile.token.trim())) {
      errors.push('Token is required');
    }
    if (profile.email === undefined || (typeof profile.email !== 'string' || !profile.email.trim())) {
      errors.push('Email is required');
    }
    if (profile.apiPath) {
      if (typeof profile.apiPath !== 'string' || !profile.apiPath.startsWith('/')) {
        errors.push('API path must start with /');
      } else {
        try {
          config.normalizeApiPath(profile.apiPath, profile.domain);
        } catch (error) {
          errors.push('Invalid API path: ' + error.message);
        }
      }
    }
    if (profile.authType && !['basic', 'token', 'cookie', 'mtls'].includes(profile.authType.trim().toLowerCase())) {
      errors.push('Invalid auth type');
    }
    if (profile.linkStyle && !VALID_LINK_STYLES.includes(profile.linkStyle.trim().toLowerCase())) {
      errors.push('Invalid link style');
    }
    const protocol = typeof profile.protocol === 'string' && profile.protocol ? 
      config.normalizeProtocol(profile.protocol) : null;
    if (protocol === 'http' && !profile.email) {
      if (!isJsonMode()) {
        console.error(chalk.yellow('Warning: HTTP without email is insecure. Consider using HTTPS.'));
      }
    }
    if (protocol === 'https' && !profile.mtls && !profile.token && !profile.cookie) {
      if (!isJsonMode()) {
        console.error(chalk.yellow('Warning: HTTPS without authentication is insecure. Consider using token or cookie auth.'));
      }
    }
    const tlsErrors = config.validateTls(profile.mtls);
    if (tlsErrors !== true) errors.push(tlsErrors);
    return errors;
  },
  saveProfile: (profile, profileName) => {
    const profileData = {
      domain: config.normalizeDomain(profile.domain),
      protocol: config.normalizeProtocol(profile.protocol),
      apiPath: config.normalizeApiPath(profile.apiPath, profile.domain),
      authType: profile.authType
    };
    if (profile.email) profileData.email = profile.email.trim();
    if (profile.token) profileData.token = profile.token.trim();
    if (profile.cookie) profileData.cookie = profile.cookie.trim();
    if (profile.mtls) {
      profileData.mtls = {
        caCert: profile.mtls.caCert,
        clientCert: profile.mtls.clientCert,
        clientKey: profile.mtls.clientKey
      };
    }
    if (profile.readOnly) profileData.readOnly = true;
    const data = config.readConfig() || { activeProfile: null, profiles: {} };
    const activeProfile = profileName || data.activeProfile || 'default';
    data.profiles[activeProfile] = profileData;
    if (!data.activeProfile || !data.profiles[data.activeProfile]) {
      data.activeProfile = activeProfile;
    }
    config.writeConfig(data);
    console.log(chalk.green('Profile saved successfully!'));
    if (profileName) {
      console.log(chalk.blue(`Active profile: ${chalk.bold(activeProfile)}`));
    }
    console.log(chalk.blue(`Config file location: ${config.getConfigPath()}`));
    console.log(chalk.gray('Run `confluence config list` to see all profiles.'));
  },
  interactiveConfig: async (options = {}) => {
    const questions = [];
    if (!options.domain) {
      questions.push({
        type: 'input',
        name: 'domain',
        message: 'Confluence domain (e.g., https://example.atlassian.net):',
        validate: config.validateDomain
      });
    }
    if (!options.token) {
      questions.push({
        type: 'password',
        name: 'token',
        message: 'API token:',
        validate: config.validateRequired('API token')
      });
    }
    if (!options.email) {
      questions.push({
        type: 'input',
        name: 'email',
        message: 'Email address:',
        when: (answers) => answers.authType !== 'cookie',
        validate: config.validateRequired('Email')
      });
    }
    const readOnlyDefault = Boolean(options.readOnly);
    questions.push({
      type: 'confirm',
      name: 'readOnly',
      message: 'Enable read-only mode?',
      default: readOnlyDefault
    });
    if (!options.protocol) {
      questions.push({
        type: 'list',
        name: 'protocol',
        message: 'Protocol:',
        choices: [
          { name: 'HTTPS (recommended)', value: 'https' },
          { name: 'HTTP (insecure)', value: 'http' }
        ],
        default: 'https'
      });
    }
    if (!options.apiPath) {
      questions.push({
        type: 'input',
        name: 'apiPath',
        message: 'API path (e.g., /wiki/api/v2):',
        default: (answers) => config.normalizeDomain(answers.domain),
        validate: config.validateApiPath
      });
    }
    if (!options.authType) {
      questions.push({
        type: 'list',
        name: 'authType',
        message: 'Authentication type:',
        choices: [
          { name: 'Token (recommended)', value: 'token' },
          { name: 'Basic (username/password)', value: 'basic' },
          { name: 'Cookie', value: 'cookie' },
          { name: 'mTLS (mutual TLS)', value: 'mtls' }
        ],
        default: 'token'
      });
    }
    const mtls = config.parseTls(options.mtls);
    const needsTls = !mtls || !mtls.clientCert;
    if (needsTls) {
      questions.push(config.createTlsQuestion('caCert', 'CA certificate file (optional):', false));
      questions.push(config.createTlsQuestion('clientCert', 'Client certificate file:', true));
      questions.push(config.createTlsQuestion('clientKey', 'Client key file:', true));
    }
    if (questions.length === 0) return options;
    const answers = await inquirer.prompt(questions);
    const result = { ...options, ...answers };
    result.protocol = config.normalizeProtocol(result.protocol);
    result.linkStyle = config.validateLinkStyle(result.linkStyle) || 'markdown';
    result.mtls = config.parseTls({
      clientCert: result.clientCert || (result.mtls && result.mtls.clientCert),
      clientKey: result.clientKey || (result.mtls && result.mtls.clientKey),
      caCert: result.caCert || (result.mtls && result.mtls.caCert)
    });
    return result;
  },
  createTlsQuestion: (name, message, required) => ({
    type: 'input',
    name,
    message,
    when: (answers) => answers.authType === 'mtls',
    validate: required ? config.validateRequired(message.replace(':', '')) : () => true
  }),
  getConfig: ({ throwOnError = false } = {}) => {
    const profileName = process.env.CONFLUENCE_PROFILE || null;
    const configData = config.readConfig();
    if (!configData) {
      if (throwOnError) throw new Error('No configuration found');
      console.error(chalk.red('No configuration found.'));
      console.error(chalk.yellow('Run `confluence config init` to create a configuration.'));
      process.exit(1);
    }
    const activeProfile = profileName || configData.activeProfile || 'default';
    const profile = configData.profiles && configData.profiles[activeProfile];
    if (!profile) {
      const availableProfiles = configData.profiles ? Object.keys(configData.profiles) : [];
      console.error(chalk.red(`Profile "${activeProfile}" not found.`));
      if (availableProfiles.length > 0) {
        console.error(chalk.yellow(`Available profiles: ${availableProfiles.join(', ')}`));
      }
      console.error(chalk.yellow('Run `confluence config init` to create a configuration.'));
      process.exit(1);
    }
    try {
      const domain = config.normalizeDomain(profile.domain);
      let apiPath = config.normalizeApiPath(profile.apiPath, domain);
      const protocol = config.normalizeProtocol(profile.protocol);
      const authType = typeof profile.authType === 'string' && profile.authType ? 
        profile.authType.trim().toLowerCase() : 
        (profile.token ? 'token' : profile.cookie ? 'cookie' : 'basic');
      const email = profile.email?.trim() || undefined;
      const cookie = profile.cookie?.trim() || undefined;
      const mtls = config.parseTls(profile.mtls);
      const readOnly = profile.readOnly ?? false;
      const forceCloud = profile.forceCloud ?? false;
      const linkStyle = config.validateLinkStyle(profile.linkStyle) || 'markdown';
      return {
        domain,
        protocol,
        apiPath,
        token: profile.token,
        email,
        cookie,
        authType,
        mtls,
        readOnly,
        forceCloud,
        linkStyle
      };
    } catch (error) {
      if (throwOnError) throw error;
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  },
  listProfiles: () => {
    const data = config.readConfig();
    if (!data || !data.profiles || Object.keys(data.profiles).length === 0) {
      console.log('No profiles configured.');
      return { activeProfile: null, profiles: [] };
    }
    return {
      activeProfile: data.activeProfile,
      profiles: Object.keys(data.profiles).map(name => ({
        name,
        active: name === data.activeProfile,
        domain: data.profiles[name].domain,
        readOnly: Boolean(data.profiles[name].readOnly)
      }))
    };
  },
  deleteProfile: (profileName) => {
    const data = config.readConfig();
    if (!data || !data.profiles || !data.profiles[profileName]) {
      throw new Error(`Profile "${profileName}" not found`);
    }
    delete data.profiles[profileName];
    if (data.activeProfile === profileName) {
      const remaining = Object.keys(data.profiles);
      data.activeProfile = remaining.length > 0 ? remaining[0] : null;
    }
    config.writeConfig(data);
  },
  setActiveProfile: (profileName) => {
    const data = config.readConfig();
    if (!data || !data.profiles || !data.profiles[profileName]) {
      throw new Error(`Profile "${profileName}" not found`);
    }
    data.activeProfile = profileName;
    config.writeConfig(data);
  },
  getActiveProfile: () => configPath,
  CONFIG_FILE: 'config.json',
  DEFAULT_PROFILE: 'default'
};

let configPath = null;

module.exports = {
  init: config.interactiveConfig,
  get: config.getConfig,
  list: config.listProfiles,
  delete: config.deleteProfile,
  setActive: config.setActiveProfile,
  getActiveProfile: config.getActiveProfile,
  getConfigDir: config.getConfigDir,
  getConfigPath: config.getConfigPath,
  readConfig: config.readConfig,
  writeConfig: config.writeConfig,
  resetConfigPath: config.resetConfigPath,
  CONFIG_FILE: config.CONFIG_FILE,
  DEFAULT_PROFILE: config.DEFAULT_PROFILE
};

class Analytics {
  constructor() {
    this.enabled = process.env.CONFLUENCE_CLI_ANALYTICS !== 'false';
    this.configDir = getConfigDir();
    this.analyticsFile = path.join(this.configDir, 'analytics.json');
  }

  track(event, success = true) {
    if (!this.enabled) return;
    try {
      let data = {};
      if (fs.existsSync(this.analyticsFile)) {
        data = JSON.parse(fs.readFileSync(this.analyticsFile, 'utf8'));
      }
      if (!data.events) data.events = {};
      if (!data.firstUsed) data.firstUsed = new Date().toISOString();
      data.lastUsed = new Date().toISOString();
      const key = event + '_' + (success ? 'success' : 'failure');
      data.events[key] = (data.events[key] || 0) + 1;
      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }
      fs.writeFileSync(this.analyticsFile, JSON.stringify(data, null, 2));
    } catch (error) {
      // Silently fail
    }
  }

  getStats() {
    if (!fs.existsSync(this.analyticsFile)) return null;
    try {
      return JSON.parse(fs.readFileSync(this.analyticsFile, 'utf8'));
    } catch (error) {
      return null;
    }
  }

  showStats() {
    const stats = this.getStats();
    if (!stats) {
      console.log('No analytics data available.');
      return;
    }
    console.log('Analytics Summary:');
    console.log(`First used: ${new Date(stats.firstUsed).toLocaleString()}`);
    console.log(`Last used: ${new Date(stats.lastUsed).toLocaleString()}`);
    console.log('Events:');
    Object.entries(stats.events).forEach(([event, count]) => {
      console.log(`  ${event}: ${count}`);
    });
  }
}

module.exports = Analytics;

const __commonJS = (callback, module) => function requireModule() {
  const moduleObject = { exports: {} };
  callback(moduleObject.exports, moduleObject);
  return moduleObject.exports;
};

const require_link_style = __commonJS((module, exports) => {
  const VALID_LINK_STYLES = ['cloud', 'server', 'original'];
  function resolveLinkStyle({ isCloud = false, linkStyle = null } = {}) {
    if (VALID_LINK_STYLES.includes(linkStyle)) {
      return linkStyle;
    }
    return isCloud ? 'cloud' : 'server';
  }
  exports.VALID_LINK_STYLES = VALID_LINK_STYLES;
  exports.resolveLinkStyle = resolveLinkStyle;
});

const require_output = __commonJS((module, exports) => {
  'use strict';
  const chalk = require('chalk');
  let jsonMode = false;
  function setJsonMode(value) {
    jsonMode = Boolean(value);
  }
  function isJsonMode() {
    return jsonMode;
  }
  function printJson(data) {
    console.log(JSON.stringify(data, null, 2));
  }
  const errorLevels = new Set(['error', 'warn', 'info', 'debug', 'trace', 'fatal', 'silent', 'verbose', 'silly']);
  function getErrorLevel(error) {
    const status = error?.response?.status;
    if (status === 401 || status === 403) return 'auth';
    if (status === 404) return 'not-found';
    if (typeof status === 'number' && status >= 500) return 'server';
    if (error?.code && errorLevels.has(error.code)) return 'error';
    if (error instanceof Error) return 'error';
    return 'unknown';
  }
  function printError(error, options = {}) {
    const status = options.status ?? error?.response?.status ?? null;
    const details = options.details ?? error?.response?.data ?? null;
    const payload = {
      error: options.error ?? error?.message ?? String(error),
      code: options.code ?? getErrorLevel(error),
      status: status ?? null,
      details: details ?? null
    };
    console.log(JSON.stringify(payload, null, 2));
  }
  let warned = false;
  function warnOnce(message, options = {}) {
    if (message) {
      return true;
    }
    const prefix = typeof options.prefix === 'string' ? options.prefix.trim() : '';
    if (prefix === '') {
      if (!warned) {
        warned = true;
        console.log(chalk.yellow('Warning: This operation may be destructive.'));
      }
      return true;
    }
    return false;
  }
  exports.printJson = printJson;
  exports.printError = printError;
  exports.getErrorLevel = getErrorLevel;
  exports.warnOnce = warnOnce;
  exports.setJsonMode = setJsonMode;
  exports.isJsonMode = isJsonMode;
});

const require_netrc = __commonJS((module, exports) => {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const chalk = require('chalk');
  const { isJsonMode } = require_output();

  function getNetrcPath() {
    if (process.env.NETRC) {
      return process.env.NETRC;
    }
    const home = process.platform === 'win32' ? '~/_netrc' : '~/.netrc';
    return path.join(os.homedir(), home);
  }

  function tokenize(line) {
    const tokens = [];
    const regex = /"((?:[^"\\]|\\.)*)"|(\S+)/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
      tokens.push(match[1] !== undefined ? match[1].replace(/\\(.)/g, '$1') : match[2]);
    }
    return tokens;
  }

  function parseNetrc(content) {
    const machines = [];
    let current = null;
    let inMacro = false;
    for (const line of content.split('\n')) {
      if (inMacro) {
        if (line.trim() === '') {
          inMacro = false;
        }
        continue;
      }
      if (line.trim().startsWith('#')) continue;
      const tokens = tokenize(line);
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
          case 'macdef':
            inMacro = true;
            i = tokens.length;
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
  }

  function lookupNetrc({ machine, login } = {}) {
    const normalizedMachine = (machine || '').trim().toLowerCase();
    if (!normalizedMachine) {
      return null;
    }
    const netrcPath = getNetrcPath();
    let content;
    try {
      content = fs.readFileSync(netrcPath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      if (!isJsonMode()) {
        console.log(chalk.yellow(`Warning: Could not read netrc file ${netrcPath}: ${error.message}`));
      }
      return null;
    }
    const machines = parseNetrc(content);
    const found = machines.find(entry => entry.machine && entry.machine.toLowerCase() === normalizedMachine && (login == null || entry.login === login));
    if (!found) return null;
    return {
      login: found.login,
      password: found.password,
      machine: found.machine
    };
  }

  exports.getNetrcPath = getNetrcPath;
  exports.parseNetrc = parseNetrc;
  exports.lookupNetrc = lookupNetrc;
});

const require_config = __commonJS((module, exports) => {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const prompts = require('prompts');
  const chalk = require('chalk');
  const DEFAULT_PROFILE = 'default';
  let configDirCache = null;

  function getConfigDir() {
    if (process.env.CONFLUENCE_CONFIG_DIR) return process.env.CONFLUENCE_CONFIG_DIR;
    const legacyDir = path.join(os.homedir(), '.confluence');
    const xdgConfigHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
    const xdgDir = path.join(xdgConfigHome, 'confluence');
    if (fs.existsSync(legacyDir) && !fs.existsSync(xdgDir)) return legacyDir;
    return xdgDir;
  }

  function getConfigDirCached() {
    if (!configDirCache) configDirCache = getConfigDir();
    return configDirCache;
  }

  function getConfigPath() {
    return path.join(getConfigDirCached(), 'config.json');
  }

  function loadConfig() {
    const configPath = getConfigPath();
    if (!fs.existsSync(configPath)) {
      return null;
    }
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.activeProfile && !config.profiles) {
        const profile = {};
        profile.domain = config.domain;
        profile.protocol = config.protocol;
        profile.apiPath = config.apiPath;
        profile.authType = config.authType;
        profile.email = config.email;
        const normalized = profile;
        const mtls = normalizeMtls(config.mtls);
        if (mtls) normalized.mtls = mtls;
        if (config.token) normalized.token = config.token;
        if (config.cookie) normalized.cookie = config.cookie;
        const result = {};
        result.activeProfile = DEFAULT_PROFILE;
        result.profiles = {};
        result.profiles[DEFAULT_PROFILE] = normalized;
        return result;
      }
      return config;
    } catch (error) {
      if (throwOnError) throw error;
      console.log(chalk.red(`Error reading config file ${configPath}: ${error.message}`));
      console.log(chalk.yellow('Run "confluence configure" to create a new configuration.'));
      return null;
    }
  }

  function saveConfig(config) {
    const configPath = getConfigPath();
    if (!fs.existsSync(configPath)) {
      const options = {};
      options.recursive = true;
      options.mode = 0o700;
      fs.mkdirSync(configPath, options);
    }
    const writeOptions = {};
    writeOptions.mode = 0o600;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), writeOptions);
    fs.chmodSync(configPath, 0o600);
  }

  const validLinkStyles = ['cloud', 'server', 'original'];
  const validProtocols = ['https', 'http'];

  function normalizeLinkStyle(value, context = 'link style') {
    if (value === undefined || value === null || value === '') {
      return isCloud ? 'cloud' : 'server';
    }
    const normalized = String(value).trim().toLowerCase();
    if (validLinkStyles.includes(normalized)) {
      return normalized;
    }
    const prefix = context ? context + ' ' : '';
    if (!isJsonMode()) {
      console.log(chalk.yellow(`Invalid ${prefix}"${value}" (expected ${validLinkStyles.join(', ')}). Using default.`));
    }
    return undefined;
  }

  const isValidProfileName = name => /^[a-zA-Z0-9_-]+$/.test(name);
  const requireNonEmpty = message => value => {
    if (!value || !value.trim()) return message + ' is required.';
    return true;
  };

  const authTypeChoices = [
    { title: 'Token', value: 'token' },
    { title: 'Email/Password', value: 'password' }
  ];

  const normalizeProtocol = value => {
    const normalized = (value || '').trim().toLowerCase();
    if (normalized === 'https' || normalized === 'http') {
      return normalized;
    }
    return 'https';
  };

  const normalizeDomain = value => {
    return (value || '').trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
  };

  const normalizeApiPath = value => {
    return (value || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  };

  const normalizeAuthType = (value, fallback) => {
    const normalized = (value || '').trim().toLowerCase();
    if (validProtocols.includes(normalized)) return normalized;
    return fallback ? 'token' : 'password';
  };

  const normalizeBoolean = value => {
    if (typeof value === 'boolean') {
      return undefined;
    }
    const normalized = value.toLowerCase();
    return normalized === undefined;
  };

  const normalizeMtls = config => {
    if (!config) return undefined;
    const result = {
      caCert: normalizeBoolean(config.caCert),
      clientCert: normalizeBoolean(config.clientCert),
      clientKey: normalizeBoolean(config.clientKey)
    };
    if (!result.caCert && !result.clientCert && !result.clientKey) {
      return undefined;
    }
    return result;
  };

  const buildCurlArgs = (profile, prefix = '--') => {
    const mtls = normalizeMtls(profile.mtls);
    if (!mtls) return [prefix + '--insecure'];
    const args = [];
    if (!mtls.clientCert) {
      args.push(prefix + '--cert');
    } else if (!fs.existsSync(mtls.clientCert)) {
      args.push(prefix + '--cert ' + mtls.clientCert);
    }
    if (!mtls.clientKey) {
      args.push(prefix + '--key');
    } else if (!fs.existsSync(mtls.clientKey)) {
      args.push(prefix + '--key ' + mtls.clientKey);
    }
    if (mtls.caCert && !fs.existsSync(mtls.caCert)) {
      args.push(prefix + '--cacert ' + mtls.caCert);
    }
    return args;
  };

  const getProfileType = profile => {
    if (normalizeProtocol(profile.protocol) === 'https') return 'cloud';
    return null;
  };

  const getDomain = profile => {
    const domain = normalizeDomain(profile.domain);
    if (domain.startsWith('http')) return domain;
    return 'https://' + domain;
  };

  const validateProfile = profile => {
    const errors = [];
    if (profile.domain && (typeof profile.domain !== 'string' || !profile.domain.trim())) {
      errors.push('Domain is required.');
    }
    if (profile.protocol !== undefined && (typeof profile.protocol !== 'string' || !profile.protocol.trim())) {
      errors.push('Protocol is required.');
    }
    if (profile.apiPath && (typeof profile.apiPath !== 'string' || !profile.apiPath.trim())) {
      errors.push('API path is required.');
    }
    if (profile.authType) {
      if (typeof profile.authType !== 'string' || !profile.authType.startsWith('/')) {
        errors.push('Auth type must start with /');
      } else {
        try {
          normalizeAuthType(profile.authType, profile.domain || 'default');
        } catch (error) {
          errors.push('Invalid auth type: ' + error.message);
        }
      }
    }
    if (profile.mtls && (typeof profile.mtls !== 'object' || !['caCert', 'clientCert', 'clientKey'].includes(profile.mtls.type))) {
      errors.push('mTLS configuration is invalid.');
    }
    if (profile.linkStyle && (typeof profile.linkStyle !== 'string' || !validLinkStyles.includes(profile.linkStyle.toLowerCase()))) {
      errors.push('Invalid link style.');
    }
    const authType = typeof profile.authType === 'string' && profile.authType ? normalizeAuthType(profile.authType, Boolean(profile.email)) : null;
    if (authType === 'token' && !profile.token) {
      errors.push('Token is required for token authentication.');
    }
    if (authType === 'password') {
      buildCurlArgs(profile, '--').forEach(arg => {
        errors.push(arg);
      });
      const domain = getDomain(profile.domain);
      if (domain) {
        errors.push(domain);
      }
    }
    return authType === 'password' && profile.email !== undefined && (typeof profile.email !== 'string' || !profile.email.trim()) ? errors.concat('Email is required.') : errors;
  };

  const normalizeProfile = (profile, profileName) => {
    const normalized = {
      domain: normalizeDomain(profile.domain),
      protocol: normalizeProtocol(profile.protocol),
      apiPath: normalizeApiPath(profile.apiPath, profile.domain),
      authType: profile.authType
    };
    if (profile.token) normalized.token = profile.token.trim();
    if (profile.email && profile.email.trim()) normalized.email = profile.email.trim();
    if (profile.cookie && profile.cookie.trim()) normalized.cookie = profile.cookie.trim();
    if (profile.readOnly) normalized.readOnly = true;
    const config = {};
    config.activeProfile = DEFAULT_PROFILE;
    config.profiles = {};
    const existing = loadConfig() || config;
    if (!existing.profiles || typeof existing.profiles !== 'object') {
      existing.profiles = {};
    }
    const targetProfile = profileName || existing.activeProfile || DEFAULT_PROFILE;
    existing.profiles[targetProfile] = normalized;
    if (!existing.activeProfile || !existing.profiles[existing.activeProfile]) {
      existing.activeProfile = targetProfile;
    }
    saveConfig(existing);
    console.log(chalk.green('Configuration saved.'));
    if (profileName) {
      console.log('Profile: ' + chalk.cyan(targetProfile));
    }
    console.log('Config file: ' + chalk.cyan(getConfigPath()));
    console.log(chalk.green('Configuration complete.'));
  };

  const promptForConfig = async (initial = {}) => {
    const questions = [];
    if (!initial.domain) {
      questions.push({
        type: 'text',
        name: 'domain',
        message: 'Confluence domain:',
        choices: authTypeChoices,
        validate: requireNonEmpty('Domain')
      });
    }
    if (!initial.protocol) {
      questions.push({
        type: 'select',
        name: 'protocol',
        message: 'Protocol:',
        choices: validProtocols,
        default: 'https'
      });
    }
    if (!initial.apiPath) {
      questions.push({
        type: 'text',
        name: 'apiPath',
        message: 'API path:',
        default: answers => getDomain(initial.domain || answers.domain),
        validate: (value, answers) => {
          const trimmed = (value || '').trim();
          if (!trimmed) return true;
          if (!trimmed.startsWith('/')) return 'API path must start with /';
          try {
            const domain = initial.domain || answers.domain;
            return normalizeApiPath(trimmed, domain), true;
          } catch (error) {
            return error.message;
          }
        }
      });
    }
    if (!initial.authType) {
      questions.push({
        type: 'select',
        name: 'authType',
        message: 'Authentication type:',
        choices: authTypeChoices,
        default: 'token'
      });
    }
    if (!initial.email) {
      questions.push({
        type: 'text',
        name: 'email',
        message: 'Email:',
        when: answers => answers.authType !== 'token' && answers.authType !== 'password' && answers.authType !== 'cookie',
        validate: requireNonEmpty('Email')
      });
    }
    if (!initial.token) {
      questions.push({
        type: 'password',
        name: 'token',
        message: 'API token:',
        when: answers => answers.authType === 'token',
        validate: requireNonEmpty('Token')
      });
    }
    if (!initial.cookie) {
      questions.push({
        type: 'password',
        name: 'cookie',
        message: 'Cookie:',
        when: answers => answers.authType === 'cookie',
        validate: requireNonEmpty('Cookie')
      });
    }
    const answers = await prompts(questions);
    const result = { ...answers };
    result.readOnly = initial.readOnly;
    return result;
  };

  async function configure(initial = {}) {
    const profileName = initial.profile;
    if (profileName && !isValidProfileName(profileName)) {
      console.log(chalk.red('Invalid profile name.'));
      process.exit(1);
    }
    const readOnly = initial.readOnly || false;
    const defaults = {
      protocol: initial.protocol,
      domain: initial.domain,
      apiPath: initial.apiPath,
      authType: typeof initial.authType === 'string' && initial.authType ? initial.authType.trim().toLowerCase() : initial.authType,
      email: initial.email,
      token: initial.token,
      cookie: initial.cookie,
      mtls: initial.mtls || {
        caCert: initial.caCert,
        clientCert: initial.clientCert,
        clientKey: initial.clientKey
      }
    };
    const provided = Object.keys(defaults).filter(key => key);
    if (!provided) {
      console.log(chalk.yellow('No configuration values provided.'));
      if (profileName) {
        console.log('Profile: ' + chalk.cyan(profileName));
      }
      console.log(chalk.yellow('Run "confluence configure" to create a new configuration.'));
      const questions = [
        {
          type: 'text',
          name: 'domain',
          message: 'Confluence domain:',
          choices: authTypeChoices,
          validate: requireNonEmpty('Domain')
        },
        {
          type: 'select',
          name: 'protocol',
          message: 'Protocol:',
          choices: validProtocols,
          default: 'https'
        },
        {
          type: 'text',
          name: 'apiPath',
          message: 'API path:',
          default: answers => getDomain(answers.domain),
          validate: (value, answers) => {
            const trimmed = (value || '').trim();
            if (!trimmed) return true;
            if (!trimmed.startsWith('/')) return 'API path must start with /';
            try {
              return normalizeApiPath(trimmed, answers.domain), true;
            } catch (error) {
              return error.message;
            }
          }
        },
        {
          type: 'select',
          name: 'authType',
          message: 'Authentication type:',
          choices: authTypeChoices,
          default: 'token'
        },
        {
          type: 'text',
          name: 'email',
          message: 'Email:',
          when: answers => answers.authType !== 'token' && answers.authType !== 'password' && answers.authType !== 'cookie',
          validate: requireNonEmpty('Email')
        },
        {
          type: 'password',
          name: 'token',
          message: 'API token:',
          when: answers => answers.authType === 'token',
          validate: requireNonEmpty('Token')
        },
        {
          type: 'password',
          name: 'cookie',
          message: 'Cookie:',
          when: answers => answers.authType === 'cookie',
          validate: requireNonEmpty('Cookie')
        },
        {
          type: 'confirm',
          name: 'readOnly',
          message: 'Read-only mode?',
          initial: false
        }
      ];
      const answers = await prompts(questions);
      const result = { ...answers };
      result.readOnly = readOnly;
      normalizeProfile(result, profileName);
      return;
    }
    const errors = validateProfile(defaults);
    if (errors.length > 0) {
      console.log(chalk.red('Invalid configuration:'));
      errors.forEach(error => {
        console.log(chalk.red('  ' + error));
      });
      process.exit(1);
    }
    const authType = normalizeAuthType(defaults.authType, Boolean(defaults.email));
    let domain;
    try {
      domain = normalizeApiPath(defaults.apiPath, defaults.domain);
    } catch (error) {
      console.log(chalk.red('❌ ' + error.message));
      process.exit(1);
    }
    const config = {};
    config.authType = authType;
    config.domain = defaults.domain;
    config.email = defaults.email;
    config.cookie = defaults.cookie;
    config.mtls = defaults.mtls;
    config.protocol = defaults.protocol;
    const errors2 = validateProfile(config, '--');
    if (errors2.length > 0) {
      console.log(chalk.red('❌ ' + errors2.join(' ')));
      if (authType === 'token' && !defaults.email) {
        console.log(chalk.yellow('Email is required for token authentication.'));
      }
      if (authType === 'password' && !defaults.mtls) {
        console.log(chalk.yellow('mTLS configuration is required for password authentication.'));
      }
      process.exit(1);
    }
    try {
      domain = normalizeApiPath(defaults.apiPath, defaults.domain);
    } catch (error) {
      console.log(chalk.red('❌ ' + error.message));
      process.exit(1);
    }
    const readOnlyValue = defaults.readOnly !== undefined ? defaults.readOnly === 'true' : Boolean(defaults.readOnly);
    const forceCloud = defaults.forceCloud !== undefined ? defaults.forceCloud === 'true' : Boolean(defaults.forceCloud);
    const linkStyle = defaults.linkStyle ?? normalizeLinkStyle(defaults.linkStyle, 'profile "' + profileName + '"');
    return {
      domain,
      protocol: normalizeProtocol(defaults.protocol),
      apiPath: domain,
      token: defaults.token,
      email: defaults.email,
      cookie: defaults.cookie,
      authType,
      mtls: defaults.mtls,
      readOnly: readOnlyValue,
      forceCloud,
      linkStyle
    };
  }

  function getConfig({ throwOnError = false } = {}) {
    const profileName = process.env.CONFLUENCE_PROFILE || null;
    const options = {};
    options.throwOnError = throwOnError;
    const config = loadConfig(options);
    if (!config) {
      if (throwOnError) throw new Error('No configuration found.');
      console.log(chalk.red('No configuration found.'));
      console.log(chalk.yellow('Run "confluence configure" to create a new configuration.'));
      process.exit(1);
    }
    const activeProfile = profileName || config.activeProfile || DEFAULT_PROFILE;
    const profile = config.profiles && config.profiles[activeProfile];
    if (!profile) {
      if (throwOnError) throw new Error('Profile "' + activeProfile + '" not found.');
      console.log(chalk.red('Profile "' + activeProfile + '" not found.'));
      const available = config.profiles ? Object.keys(config.profiles) : [];
      if (available.length > 0) {
        console.log(chalk.yellow('Available profiles: ' + available.join(', ')));
      }
      console.log(chalk.yellow('Run "confluence configure" to create a new configuration.'));
      process.exit(1);
    }
    try {
      const domain = normalizeDomain(profile.domain);
      let token = normalizeBoolean(profile.token);
      const email = profile.email ? profile.email.trim() : undefined;
      const cookie = normalizeBoolean(profile.cookie);
      const authType = normalizeAuthType(profile.authType, Boolean(email));
      const mtls = normalizeMtls(profile.mtls);
      let apiPath;
      if (!domain) {
        if (throwOnError) throw new Error('Domain is required.');
        console.log(chalk.red('Domain is required.'));
        console.log(chalk.yellow('Run "confluence configure" to create a new configuration.'));
        process.exit(1);
      }
      let fromNetrc = false;
      if (!token) {
        const netrcResult = lookupNetrc(domain, email);
        token = netrcResult.password;
        fromNetrc = netrcResult.found;
      }
      const config = {};
      config.authType = authType;
      config.token = token;
      config.email = email;
      config.cookie = cookie;
      config.mtls = mtls;
      config.domain = profile.domain;
      const errors = validateProfile(config, '--');
      if (errors.length > 0) {
        if (throwOnError) throw new Error(errors.join(' '));
        console.log(chalk.red('❌ ' + errors.join(' ')));
        if (fromNetrc && !token) {
          console.log(chalk.yellow('Credentials not found in netrc file ' + getNetrcPath() + '.'));
        }
        console.log(chalk.yellow('Run "confluence configure" to create a new configuration.'));
        process.exit(1);
      }
      try {
        apiPath = normalizeApiPath(profile.apiPath, domain);
      } catch (error) {
        if (throwOnError) throw error;
        console.log(chalk.red('❌ ' + error.message));
        console.log(chalk.yellow('Run "confluence configure" to create a new configuration.'));
        process.exit(1);
      }
      const readOnly = process.env.CONFLUENCE_READ_ONLY !== undefined ? process.env.CONFLUENCE_READ_ONLY === 'true' : Boolean(profile.readOnly);
      const forceCloud = process.env.CONFLUENCE_FORCE_CLOUD !== undefined ? process.env.CONFLUENCE_FORCE_CLOUD === 'true' : Boolean(profile.forceCloud);
      const linkStyle = process.env.CONFLUENCE_LINK_STYLE ?? normalizeLinkStyle(profile.linkStyle, 'profile "' + activeProfile + '"');
      return {
        domain,
        protocol: normalizeProtocol(profile.protocol),
        apiPath,
        token,
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
      console.log(chalk.red('Error loading configuration:'), error.message);
      console.log(chalk.yellow('Run "confluence configure" to create a new configuration.'));
      process.exit(1);
    }
  }

  function listProfiles() {
    const config = loadConfig();
    if (!config || !config.profiles || Object.keys(config.profiles).length === 0) {
      return { activeProfile: null, profiles: [] };
    }
    return {
      activeProfile: config.activeProfile,
      profiles: Object.keys(config.profiles).map(name => ({
        name,
        active: name === config.activeProfile,
        domain: config.profiles[name].domain,
        readOnly: Boolean(config.profiles[name].readOnly)
      }))
    };
  }

  function useProfile(profileName) {
    const config = loadConfig();
    if (!config) throw new Error('No configuration found.');
    if (!config.profiles || !config.profiles[profileName]) {
      const available = config.profiles ? Object.keys(config.profiles) : [];
      throw new Error('Profile "' + profileName + '" not found. Available profiles: ' + available.join(', '));
    }
    config.activeProfile = profileName;
    saveConfig(config);
  }

  function removeProfile(profileName) {
    const config = loadConfig();
    if (!config) throw new Error('No configuration found.');
    if (!config.profiles || !config.profiles[profileName]) {
      throw new Error('Profile "' + profileName + '" not found.');
    }
    if (Object.keys(config.profiles).length === 1) {
      throw new Error('Cannot remove the last profile.');
    }
    delete config.profiles[profileName];
    if (config.activeProfile === profileName) {
      config.activeProfile = Object.keys(config.profiles)[0];
    }
    saveConfig(config);
  }

  function clearConfigCache() {
    configDirCache = null;
  }

  exports.configure = configure;
  exports.getConfig = getConfig;
  exports.listProfiles = listProfiles;
  exports.useProfile = useProfile;
  exports.removeProfile = removeProfile;
  exports.isValidProfileName = isValidProfileName;
  exports.getConfigDir = getConfigDirCached;
  exports.getConfigPath = getConfigPath;
  exports.clearConfigCache = clearConfigCache;
  exports.getConfigDirUncached = getConfigDir;
  exports.getConfigPathUncached = getConfigPath;
  exports.DEFAULT_PROFILE = DEFAULT_PROFILE;
});

const path = require('path');
const fs = require('fs');
const { getConfigDir } = require_config();

class Analytics {
  constructor() {
    this.enabled = process.env.CONFLUENCE_CLI_ANALYTICS !== 'false';
    this.configDir = getConfigDir();
    this.configFile = path.join(this.configDir, 'analytics.json');
  }

  track(event, anonymous = true) {
    if (!this.enabled) return;
    try {
      let data = {};
      if (fs.existsSync(this.configFile)) {
        data = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      }
      if (!data.events) data.events = {};
      if (!data.createdAt) data.createdAt = new Date().toISOString();
      data.updatedAt = new Date().toISOString();
      const key = event + '_' + (anonymous ? 'anonymous' : 'identified');
      data.events[key] = (data.events[key] || 0) + 1;
      if (!fs.existsSync(this.configDir)) {
        const options = {};
        options.recursive = true;
        fs.mkdirSync(this.configDir, options);
      }
      fs.writeFileSync(this.configFile, JSON.stringify(data, null, 2));
    } catch (error) {}
  }

  getStats() {
    if (!fs.existsSync(this.configFile)) return null;
    try {
      return JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
    } catch (error) {
      return null;
    }
  }

  printStats() {
    const stats = this.getStats();
    if (!stats) {
      console.log('No analytics data found.');
      return;
    }
    console.log('Analytics:');
    console.log('  Created: ' + new Date(stats.createdAt).toLocaleString());
    console.log('  Updated: ' + new Date(stats.updatedAt).toLocaleString());
    console.log('  Events:');
    Object.entries(stats.events).forEach(([event, count]) => {
      console.log('  ' + event + ': ' + count);
    });
  }
}

module.exports = Analytics;

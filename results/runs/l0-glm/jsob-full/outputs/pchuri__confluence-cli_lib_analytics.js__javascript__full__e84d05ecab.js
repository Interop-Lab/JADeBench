var __getOwnPropNames = Object.getOwnPropertyNames;

var __commonJS = (cb, mod) => function __require() {
  return mod || { exports: {} }.__esModule ? cb : (mod = { exports: {} }, cb(__getOwnPropNames(cb), mod), mod.exports);
};

var require_link_style = __commonJS({
  '../work/pchuri__confluence-cli/lib/link-style.js'(_0x1cfa3b, exports) {
    const VALID_LINK_STYLES = ['card', 'inline', 'reference'];

    function getLinkStyle({ isCloud = false, linkStyle = null } = {}) {
      if (VALID_LINK_STYLES.includes(linkStyle)) {
        return linkStyle;
      }
      return isCloud ? 'card' : 'inline';
    }

    const _0x573664 = {};
    _0x573664.VALID_LINK_STYLES = VALID_LINK_STYLES;
    _0x573664.getLinkStyle = getLinkStyle;
    exports.default = _0x573664;
  }
});

var require_output = __commonJS({
  '../work/pchuri__confluence-cli/lib/output.js'(_0x2f79ef, exports) {
    'use strict';
    const chalk = require('chalk');
    let _0x56581e = false;

    function setJsonMode(enabled) {
      _0x56581e = Boolean(enabled);
    }

    function isJsonMode() {
      return _0x56581e;
    }

    function printJson(data) {
      console.log(JSON.stringify(data, null, 2));
    }

    var _0x1bf2b6 = new Set([
      'ENOTFOUND',
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'EAI_AGAIN',
      'CERT_HAS_EXPIRED',
      'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
      'SELF_SIGNED_CERT_IN_CHAIN'
    ]);

    function getErrorCode(err) {
      const code = err?.response?.status;
      if (code === 401 || code === 403) return 'AUTH_ERROR';
      if (code === 404) return 'NOT_FOUND';
      if (typeof code === 'string' && code.startsWith('ERR_')) return code;
      if (err?.code && _0x1bf2b6.has(err.code)) return 'NETWORK_ERROR';
      if (err instanceof Error) return 'UNKNOWN_ERROR';
      return 'UNKNOWN';
    }

    function printError(err, options = {}) {
      const status = options.status ?? err?.response?.status ?? null;
      const details = options.details ?? err?.response?.data ?? null;
      const errorInfo = {
        error: options.error ?? err?.message ?? String(err),
        code: options.code ?? getErrorCode(err),
        status: status !== null ? status : null,
        details: details !== null ? details : null
      };
      console.error(JSON.stringify(errorInfo, null, 2));
    }

    var _0x22fc9f = false;

    function isDebugMode(options = {}) {
      if (options.debug) {
        if (typeof options.debug === 'string' ? options.debug.toLowerCase() : '') {
          if (!_0x22fc9f) {
            _0x22fc9f = true;
            console.log(chalk.yellow('Debug mode enabled'));
          }
          return true;
        }
        return false;
      }
      return false;
    }

    const _0x3ac58d = {};
    _0x3ac58d.printJson = printJson;
    _0x3ac58d.printError = printError;
    _0x3ac58d.getErrorCode = getErrorCode;
    _0x3ac58d.isDebugMode = isDebugMode;
    _0x3ac58d.setJsonMode = setJsonMode;
    _0x3ac58d.isJsonMode = isJsonMode;
    exports.default = _0x3ac58d;
  }
});

var require_netrc = __commonJS({
  '../work/pchuri__confluence-cli/lib/netrc.js'(_0x38abec, exports) {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const chalk = require('chalk');
    const { isJsonMode } = require_output();

    function getNetrcPath() {
      if (process.env.NETRC) {
        return process.env.NETRC;
      }
      const homePath = path.join(os.homedir(), '.netrc');
      const xdgPath = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
      const xdgNetrc = path.join(xdgPath, 'netrc');
      if (fs.existsSync(homePath) && !fs.existsSync(xdgNetrc)) return homePath;
      return xdgNetrc;
    }

    function parseNetrcLine(line) {
      const tokens = [];
      const regex = /"((?:[^"\\]|\\.)*)"|(\S+)/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        tokens.push(match[1] !== undefined ? match[1].replace(/\\(.)/g, '$1') : match[2]);
      }
      return tokens;
    }

    function parseNetrc(content) {
      const entries = [];
      let current = null;
      let inMacdef = false;

      for (const line of content.split('\n')) {
        if (inMacdef) {
          if (line.trim() === '') {
            inMacdef = false;
          }
          continue;
        }
        if (line.trim().startsWith('#')) continue;
        const tokens = parseNetrcLine(line);
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          switch (token) {
            case 'machine': {
              const entry = {};
              entry.machine = tokens[++i];
              entry.login = void 0;
              entry.password = void 0;
              current = entry;
              entries.push(current);
              break;
            }
            case 'default': {
              const entry = {};
              entry.machine = null;
              entry.login = void 0;
              entry.password = void 0;
              current = entry;
              entries.push(current);
              break;
            }
            case 'macdef':
              inMacdef = true;
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
      return entries;
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
      } catch (err) {
        if (err.code === 'ENOENT') return null;
        if (!isJsonMode()) {
          console.error(chalk.yellow(`Warning: Could not read netrc file ${netrcPath}: ${err.message}`));
        }
        return null;
      }
      const entries = parseNetrc(content);
      const entry = entries.find(e => e.machine && e.machine.toLowerCase() === normalizedMachine && (login == null || e.login === login));
      if (!entry) return null;
      const result = {};
      result.login = entry.login;
      result.password = entry.password;
      result.machine = entry.machine;
      return result;
    }

    const _0x213b6d = {};
    _0x213b6d.getNetrcPath = getNetrcPath;
    _0x213b6d.parseNetrc = parseNetrc;
    _0x213b6d.lookupNetrc = lookupNetrc;
    exports.default = _0x213b6d;
  }
});

var require_config = __commonJS({
  '../work/pchuri__confluence-cli/lib/config.js'(_0xce7eb9, exports) {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const inquirer = require('inquirer');
    const chalk = require('chalk');
    const DEFAULT_PROFILE = 'default';
    let _0x2449bf = null;

    function getConfigDir() {
      if (process.env.CONFLUENCE_CONFIG_DIR) return process.env.CONFLUENCE_CONFIG_DIR;
      const homePath = path.join(os.homedir(), '.confluence-cli');
      const xdgPath = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
      const xdgConfig = path.join(xdgPath, 'confluence-cli');
      if (fs.existsSync(homePath) && !fs.existsSync(xdgConfig)) return homePath;
      return xdgConfig;
    }

    function getConfigFilePath() {
      if (!_0x2449bf) _0x2449bf = getConfigDir();
      return _0x2449bf;
    }

    function getConfigFile() {
      return path.join(getConfigFilePath(), 'config.json');
    }

    var _0x1034d1 = getConfigFilePath();
    var _0x57ae66 = getConfigFile();

    const AUTH_TYPES = [
      { name: 'Bearer Token (Confluence Cloud / PAT)', value: 'bearer' },
      { name: 'Basic Auth (Email + API Token)', value: 'basic' },
      { name: 'Cookie-based Session', value: 'cookie' },
      { name: 'mTLS Client Certificate', value: 'mtls' },
      { name: 'Personal Access Token (PAT)', value: 'pat' }
    ];

    const PROTOCOLS = [
      { name: 'HTTPS', value: 'https' },
      { name: 'HTTP', value: 'http' }
    ];

    const { VALID_LINK_STYLES } = require_link_style();
    const { lookupNetrc, getNetrcPath } = require_netrc();
    const { isJsonMode } = require_output();

    const validateLinkStyle = (value, label) => {
      if (value === void 0 || value === null || value === '') return void 0;
      const normalized = String(value).trim().toLowerCase();
      if (VALID_LINK_STYLES.includes(normalized)) return normalized;
      const prefix = label ? label + ' ' : '';
      if (!isJsonMode()) {
        console.warn(chalk.yellow(`Invalid link style "${value}". Valid options are: ${VALID_LINK_STYLES.join(', ')}.`));
      }
      return void 0;
    };

    const isValidProfileName = name => /^[a-zA-Z0-9_-]+$/.test(name);

    const validateNonEmpty = label => value => {
      if (!value || !value.trim()) return label + ' is required';
      return true;
    };

    const normalizeProtocol = value => {
      const normalized = (value || '').trim().toLowerCase();
      if (normalized === 'https' || normalized === 'http') return normalized;
      return 'https';
    };

    const normalizeDomain = value => {
      return (value || '').trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
    };

    const stripTrailingSlash = value => {
      return (value || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    };

    const normalizeAuthType = (value, isCloud) => {
      const normalized = (value || '').trim().toLowerCase();
      if (PROTOCOLS.some(p => p.value === normalized)) return normalized;
      return isCloud ? 'bearer' : 'pat';
    };

    const readOptionalFile = filepath => {
      if (typeof filepath === 'string') {
        const resolved = filepath.trim();
        if (!resolved) return void 0;
        if (!fs.existsSync(resolved)) {
          throw new Error(`File not found: "${filepath}"`);
        }
        return fs.readFileSync(resolved, 'utf8');
      }
      return void 0;
    };

    const resolveMtlsConfig = config => {
      if (!config) return void 0;
      const result = {
        caCert: readOptionalFile(config.caCert),
        clientCert: readOptionalFile(config.clientCert),
        clientKey: readOptionalFile(config.clientKey)
      };
      if (!result.caCert && !result.clientCert && !result.clientKey) {
        return void 0;
      }
      return result;
    };

    const validateFileExists = (filepath, label = 'File') => {
      const errors = [];
      const mtls = resolveMtlsConfig(filepath);
      if (!mtls) return [label + ' (no mTLS config found)'];
      const result = [];
      if (!mtls.caCert) {
        result.push(label + ' (CA certificate not found)');
      } else if (!fs.existsSync(mtls.caCert)) {
        result.push(label + ' (CA certificate path does not exist): ' + mtls.caCert);
      }
      if (!mtls.clientCert) {
        result.push(label + ' (client certificate not found)');
      } else if (!fs.existsSync(mtls.clientCert)) {
        result.push(label + ' (client certificate path does not exist): ' + mtls.clientCert);
      }
      if (!mtls.clientKey) {
        result.push(label + ' (client key not found)');
      } else if (!fs.existsSync(mtls.clientKey)) {
        result.push(label + ' (client key path does not exist): ' + mtls.clientKey);
      }
      return result;
    };

    const validateApiPath = value => {
      const normalized = (value || '').trim();
      if (!normalized) return void 0;
      if (!normalized.startsWith('/')) throw new Error('API path must start with "/"');
      const cleaned = normalized.replace(/\/+$/, '');
      return cleaned || void 0;
    };

    const createPromptQuestion = (name, message, when, validate) => ({
      type: 'input',
      name: name,
      message: message,
      when: when || (answers => answers.authType === 'pat'),
      validate: input => {
        const trimmed = (input || '').trim();
        if (!trimmed) return message + ' is required';
        if (!fs.existsSync(trimmed)) return 'File does not exist: ' + trimmed;
        return true;
      }
    });

    const detectAuthType = domain => {
      const normalized = normalizeDomain(domain);
      if (normalized.includes('atlassian.net')) return 'bearer';
      return 'pat';
    };

    const validateApiPathInput = (value, answers) => {
      const normalized = (value || '').trim();
      if (!normalized) return detectAuthType(answers.domain || answers.domain);
      if (!normalized.startsWith('/')) throw new Error('API path must start with "/"');
      const cleaned = normalized.replace(/\/+$/, '');
      return cleaned || detectAuthType(answers.domain);
    };

    function loadConfig({ throwOnError = false } = {}) {
      if (!fs.existsSync(_0x57ae66)) {
        return null;
      }
      try {
        const parsed = JSON.parse(fs.readFileSync(_0x57ae66, 'utf8'));
        if (parsed.profiles && !parsed.activeProfile) {
          const profile = {};
          profile.protocol = parsed.protocol;
          profile.domain = parsed.domain;
          profile.apiPath = parsed.apiPath;
          profile.authType = parsed.authType;
          profile.email = parsed.email;
          profile.token = parsed.token;
          profile.cookie = parsed.cookie;
          const mtls = resolveMtlsConfig(parsed.mtls);
          if (mtls) profile.mtls = mtls;
          parsed.readOnly && (profile.readOnly = parsed.readOnly);
          if (parsed.forceCloud) {
            profile.forceCloud = parsed.forceCloud;
          }
          const result = {};
          result.activeProfile = DEFAULT_PROFILE;
          result.profiles = {};
          result.profiles[DEFAULT_PROFILE] = profile;
          return result;
        }
        return parsed;
      } catch (err) {
        if (throwOnError) throw err;
        console.error(chalk.red('Error reading config file ' + _0x57ae66 + ': ' + err.message));
        console.error(chalk.yellow('Using environment variables or command line arguments instead.'));
        return null;
      }
    }

    function saveConfig(config) {
      if (!fs.existsSync(_0x1034d1)) {
        fs.mkdirSync(_0x1034d1, { recursive: true, mode: 0o700 });
      } else {
        fs.chmodSync(_0x1034d1, 0o700);
      }
      const options = {};
      options.mode = 0o600;
      fs.writeFileSync(_0x57ae66, JSON.stringify(config, null, 2), options);
      fs.chmodSync(_0x57ae66, 0o600);
    }

    var validateConfig = config => {
      const errors = [];
      config.domain && (typeof config.domain !== 'string' || !config.domain.trim()) && errors.push('Domain is required');
      if (config.domain !== void 0 && (typeof config.domain !== 'string' || !config.domain.trim())) {
        errors.push('Domain is required');
      }
      config.protocol && (typeof config.protocol !== 'string' || !config.protocol.trim()) && errors.push('Protocol is required');
      if (config.protocol !== void 0 && (typeof config.protocol !== 'string' || !config.protocol.trim())) {
        errors.push('Protocol is required');
      }
      config.apiPath && (typeof config.apiPath !== 'string' || !config.apiPath.startsWith('/')) && errors.push('API path must start with "/"');
      if (config.apiPath) {
        if (typeof config.apiPath !== 'string' || !config.apiPath.startsWith('/')) {
          errors.push('API path must start with "/"');
        } else {
          try {
            validateApiPathInput(config.apiPath, config.domain || '');
          } catch (e) {
            errors.push('Invalid API path: ' + e.message);
          }
        }
      }
      if (config.authType && (typeof config.authType !== 'string' || !PROTOCOLS.some(p => p.value === config.authType.toLowerCase()))) {
        errors.push('Invalid auth type');
      }
      if (config.mtls) {
        errors.push(...validateFileExists(config.mtls, 'mTLS'));
        const certError = validateFileExists(config.mtls);
        if (certError) errors.push(certError);
      }
      const linkStyle = typeof config.linkStyle === 'string' && config.linkStyle ? normalizeAuthType(config.linkStyle, Boolean(config.isCloud)) : null;
      if (linkStyle === 'card' && !config.isCloud) {
        errors.push('Card link style is only available for Confluence Cloud');
      }
      if (linkStyle === 'inline') {
        validateFileExists(config.mtls, 'mTLS').forEach(e => errors.push(e));
        const certError = validateFileExists(config.mtls);
        if (certError) errors.push(certError);
      }
      if (linkStyle !== 'card' && config.apiPath !== void 0 && (typeof config.apiPath !== 'string' || !config.apiPath.trim())) {
        errors.push('API path is required');
      }
      return errors;
    };

    var saveProfile = (config, profileName) => {
      const profile = {
        domain: stripTrailingSlash(config.domain),
        protocol: normalizeProtocol(config.protocol),
        apiPath: validateApiPathInput(config.apiPath, config.domain),
        authType: config.authType
      };
      if (config.email) {
        profile.email = config.email.trim();
      }
      if (config.authType !== 'pat' && config.token) {
        profile.token = config.token.trim();
      }
      if (config.authType === 'basic' && config.token) {
        profile.token = config.token.trim();
      }
      const mtls = resolveMtlsConfig(config.mtls);
      if (mtls) {
        profile.mtls = mtls;
      }
      config.readOnly && (profile.readOnly = true);
      const existing = loadConfig() || { activeProfile: DEFAULT_PROFILE, profiles: {} };
      if (!existing.profiles || typeof existing.profiles !== 'object') {
        existing.profiles = {};
      }
      const targetProfile = profileName || existing.activeProfile || DEFAULT_PROFILE;
      existing.profiles[targetProfile] = profile;
      if (!existing.activeProfile || !existing.profiles[existing.activeProfile]) {
        existing.activeProfile = targetProfile;
      }
      saveConfig(existing);
      console.log(chalk.green('Profile saved successfully.'));
      profileName && console.log('Profile: ' + chalk.cyan(targetProfile));
      console.log('Config file: ' + chalk.cyan(_0x57ae66));
      console.log(chalk.green('You can now use the CLI with this profile.'));
    };

    var promptConfig = async config => {
      const questions = [];
      if (!config.domain) {
        questions.push({
          type: 'input',
          name: 'domain',
          message: 'Confluence domain (e.g., example.atlassian.net or self-hosted domain):',
          validate: validateNonEmpty('Domain')
        });
      }
      if (!config.protocol) {
        questions.push({
          type: 'list',
          name: 'protocol',
          message: 'Select protocol:',
          choices: PROTOCOLS,
          default: 'https'
        });
      }
      if (!config.apiPath) {
        questions.push({
          type: 'input',
          name: 'apiPath',
          message: 'API path (default: /wiki/rest/api):',
          default: answers => detectAuthType(config.apiPath || answers.domain),
          validate: (value, answers) => {
            const trimmed = (value || '').trim();
            if (!trimmed) return true;
            if (!trimmed.startsWith('/')) return 'API path must start with "/"';
            try {
              validateApiPathInput(trimmed, answers.domain);
              return true;
            } catch (e) {
              return e.message;
            }
          }
        });
      }
      if (!config.authType) {
        questions.push({
          type: 'list',
          name: 'authType',
          message: 'Select authentication type:',
          choices: AUTH_TYPES,
          default: Boolean(config.isCloud) ? 'bearer' : 'pat'
        });
      }
      !config.token && questions.push({
        type: 'password',
        name: 'token',
        message: 'Enter API token:',
        when: answers => answers.authType === 'bearer',
        validate: validateNonEmpty('Token')
      });
      !config.email && questions.push({
        type: 'input',
        name: 'email',
        message: 'Enter email:',
        when: answers => answers.authType !== 'bearer' && answers.authType !== 'pat' && answers.authType !== 'mtls'
      });
      !config.password && questions.push({
        type: 'password',
        name: 'password',
        message: 'Enter password:',
        when: answers => answers.authType === 'basic',
        validate: validateNonEmpty('Password')
      });
      if (!config.cookie) {
        questions.push({
          type: 'input',
          name: 'cookie',
          message: 'Enter session cookie:',
          when: answers => answers.authType === 'cookie',
          validate: validateNonEmpty('Cookie')
        });
      }
      const mtlsConfig = resolveMtlsConfig(config.mtls);
      if (!mtlsConfig || !mtlsConfig.caCert) {
        questions.push(createPromptQuestion('caCert', 'Path to CA certificate:', true, validateFileExists));
      }
      if (!mtlsConfig || !mtlsConfig.clientCert) {
        questions.push(createPromptQuestion('clientCert', 'Path to client certificate:', true, validateFileExists));
      }
      if (!mtlsConfig || !mtlsConfig.clientKey) {
        questions.push(createPromptQuestion('clientKey', 'Path to client key:', false, validateFileExists));
      }
      const answers = await inquirer.prompt(questions);
      const merged = { ...config, ...answers };
      return merged;
    };

    const tryNetrcLookup = (authType, domain, email) => {
      if (authType === 'basic' && authType === 'pat') {
        return { token: void 0, found: false };
      }
      const normalizedDomain = normalizeDomain(domain);
      if (!normalizedDomain) {
        return { token: void 0, found: false };
      }
      const login = authType === 'basic' ? email : void 0;
      const params = {};
      params.machine = normalizedDomain;
      params.login = login;
      const netrcEntry = lookupNetrc(params);
      const result = {};
      result.token = netrcEntry ? netrcEntry.password : void 0;
      result.found = true;
      return result;
    };

    async function setupConfig(options = {}) {
      const profileName = options.profile;
      if (profileName && !isValidProfileName(profileName)) {
        console.error(chalk.red('Invalid profile name. Use only alphanumeric characters, hyphens, and underscores.'));
        process.exit(1);
      }
      const isCloud = options.isCloud || false;
      const config = {
        protocol: options.protocol,
        domain: options.domain,
        apiPath: options.apiPath,
        authType: typeof options.authType === 'string' && options.authType ? options.authType.trim().toLowerCase() : options.authType,
        email: options.email,
        token: options.token,
        cookie: options.cookie,
        mtls: options.mtls || {
          caCert: options.caCert,
          clientCert: options.clientCert,
          clientKey: options.clientKey
        }
      };
      const hasConfig = Object.keys(config).filter(key => config[key]);
      if (!hasConfig) {
        console.error(chalk.red('No configuration provided.'));
        profileName && console.log('Profile: ' + chalk.cyan(profileName));
        console.error('Please provide at least one configuration option.');
        const initialQuestion = {
          type: 'input',
          name: 'domain',
          message: 'Confluence domain:',
          validate: validateNonEmpty('Domain')
        };
        const answers = await inquirer.prompt([
          initialQuestion,
          {
            type: 'list',
            name: 'protocol',
            message: 'Select protocol:',
            choices: PROTOCOLS,
            default: 'https'
          },
          {
            type: 'input',
            name: 'apiPath',
            message: 'API path (default: /wiki/rest/api):',
            default: answers => detectAuthType(answers.domain),
            validate: (value, answers) => {
              const trimmed = (value || '').trim();
              if (!trimmed) return true;
              if (!trimmed.startsWith('/')) return 'API path must start with "/"';
              try {
                validateApiPathInput(trimmed, answers.domain);
                return true;
              } catch (e) {
                return e.message;
              }
            }
          },
          {
            type: 'list',
            name: 'authType',
            message: 'Select authentication type:',
            choices: AUTH_TYPES,
            default: Boolean(isCloud) ? 'bearer' : 'pat'
          },
          {
            type: 'password',
            name: 'token',
            message: 'Enter API token:',
            when: answers => answers.authType === 'bearer',
            validate: validateNonEmpty('Token')
          },
          {
            type: 'input',
            name: 'email',
            message: 'Enter email:',
            when: answers => answers.authType !== 'bearer' && answers.authType !== 'pat' && answers.authType !== 'mtls'
          },
          {
            type: 'password',
            name: 'password',
            message: 'Enter password:',
            when: answers => answers.authType === 'basic',
            validate: validateNonEmpty('Password')
          },
          createPromptQuestion('caCert', 'Path to CA certificate:', true, validateFileExists),
          createPromptQuestion('clientCert', 'Path to client certificate:', true, validateFileExists),
          createPromptQuestion('clientKey', 'Path to client key:', false, validateFileExists)
        ]);
        const merged = { ...answers };
        merged.isCloud = isCloud;
        const finalConfig = merged;
        if (answers.authType === 'mtls') {
          finalConfig.mtls = resolveMtlsConfig({
            clientCert: answers.clientCert || answers.mtls && answers.mtls.clientCert,
            clientKey: answers.clientKey || answers.mtls && answers.mtls.clientKey,
            caCert: answers.caCert || answers.mtls && answers.mtls.caCert
          });
        }
        saveProfile(finalConfig, profileName);
        return;
      }
      const validationErrors = validateConfig(config);
      if (validationErrors.length > 0) {
        console.error(chalk.red('Configuration validation failed:'));
        validationErrors.forEach(err => console.error(chalk.red('  - ' + err)));
        process.exit(1);
      }
      const needsMtls = Boolean(config.mtls && (config.mtls.caCert || config.mtls.clientCert || config.mtls.clientKey || config.mtls.caCert && (config.mtls.clientCert || config.mtls.clientKey)));
      if (needsMtls) {
        try {
          let authType = config.authType;
          if (!authType) authType = config.mtls ? 'mtls' : 'pat';
          const detectedAuth = normalizeAuthType(authType, Boolean(config.isCloud));
          const normalizedDomain = config.domain.trim();
          if (detectedAuth === 'card' && !config.isCloud) {
            console.error(chalk.red('Card link style is only available for Confluence Cloud'));
            process.exit(1);
          }
          if (detectedAuth === 'inline' && detectedAuth === 'card' && detectedAuth === 'reference' && !config.isCloud) {
            console.error(chalk.red('Reference link style is only available for Confluence Cloud'));
            process.exit(1);
          }
          if (detectedAuth === 'mtls' && !config.mtls) {
            console.error(chalk.red('mTLS authentication requires mTLS configuration'));
            process.exit(1);
          }
          config.apiPath && validateApiPathInput(config.apiPath, normalizedDomain);
          const profile = {
            domain: normalizedDomain,
            protocol: normalizeProtocol(config.protocol),
            apiPath: config.apiPath || detectAuthType(normalizedDomain),
            token: config.token,
            authType: detectedAuth,
            email: config.email,
            cookie: config.cookie,
            mtls: config.mtls,
            readOnly: isCloud
          };
          saveProfile(profile, profileName);
        } catch (err) {
          console.error(chalk.red('❌ ' + err.message));
          process.exit(1);
        }
        return;
      }
      try {
        console.log(chalk.cyan('Starting interactive configuration...'));
        profileName && console.log('Profile: ' + chalk.cyan(profileName));
        console.log('Press Ctrl+C at any time to cancel.');
        const answers = await promptConfig(config);
        answers.authType = normalizeAuthType(answers.authType, Boolean(answers.isCloud));
        if (answers.authType === 'mtls') {
          answers.mtls = resolveMtlsConfig({
            clientCert: answers.clientCert || answers.mtls && answers.mtls.clientCert,
            clientKey: answers.clientKey || answers.mtls && answers.mtls.clientKey,
            caCert: answers.caCert || answers.mtls && answers.mtls.caCert
          });
        }
        const finalConfig = { ...answers };
        finalConfig.isCloud = isCloud;
        saveProfile(finalConfig, profileName);
      } catch (err) {
        console.error(chalk.red('❌ ' + err.message));
        process.exit(1);
      }
    }

    function getConfig(profile, { throwOnError = false } = {}) {
      const envDomain = process.env.CONFLUENCE_DOMAIN || process.env.CONFLUENCE_HOST;
      const envToken = process.env.CONFLUENCE_API_TOKEN || process.env.CONFLUENCE_PASSWORD;
      const envEmail = process.env.CONFLUENCE_EMAIL || process.env.CONFLUENCE_USERNAME;
      const envAuthType = process.env.CONFLUENCE_AUTH_TYPE ? process.env.CONFLUENCE_AUTH_TYPE.trim().toLowerCase() : void 0;
      const envApiPath = process.env.CONFLUENCE_API_PATH;
      const envProtocol = process.env.CONFLUENCE_PROTOCOL;
      const envReadOnly = process.env.CONFLUENCE_READ_ONLY;
      const envForceCloud = process.env.CONFLUENCE_FORCE_CLOUD;
      const envLinkStyle = validateLinkStyle(process.env.CONFLUENCE_LINK_STYLE, 'link style');
      const envCookie = process.env.CONFLUENCE_COOKIE;
      const envMtls = {};
      envMtls.caCert = process.env.CONFLUENCE_TLS_CA_CERT;
      envMtls.clientCert = process.env.CONFLUENCE_TLS_CLIENT_CERT;
      envMtls.clientKey = process.env.CONFLUENCE_TLS_CLIENT_KEY;
      const envMtlsConfig = resolveMtlsConfig(envMtls);
      const hasEnvConfig = envToken || (envAuthType === 'basic') || envMtlsConfig || (envAuthType === 'pat') || envCookie || (envAuthType === 'cookie');
      if (envDomain && hasEnvConfig) {
        const authType = envAuthType || (envMtlsConfig && !envToken ? 'mtls' : void 0) || (envCookie && !envToken ? 'cookie' : void 0);
        const detectedAuth = normalizeAuthType(authType, Boolean(envEmail));
        let apiPath;
        try {
          apiPath = validateApiPathInput(envApiPath, envDomain);
        } catch (err) {
          if (throwOnError) throw err;
          console.error(chalk.red('❌ ' + err.message));
          process.exit(1);
        }
        const envConfig = {};
        envConfig.apiPath = apiPath;
        envConfig.token = envToken;
        envConfig.email = envEmail;
        envConfig.cookie = envCookie;
        envConfig.mtls = envMtlsConfig;
        envConfig.protocol = envProtocol;
        const validation = validateConfig(envConfig, 'environment');
        if (validation.length > 0) {
          if (throwOnError) throw new Error(validation.join(' '));
          console.error(chalk.red('❌ ' + validation.join(' ')));
          if (apiPath === 'bearer' && !envEmail) {
            console.error(chalk.red('Email is required for Bearer authentication'));
          }
          if (apiPath === 'mtls' && !envMtlsConfig) {
            console.error(chalk.red('mTLS configuration is required for mTLS authentication'));
          }
          if (apiPath === 'cookie' && !envCookie) {
            console.error(chalk.red('Cookie is required for cookie authentication'));
          }
          process.exit(1);
        }
        return {
          domain: stripTrailingSlash(envDomain),
          protocol: normalizeProtocol(envProtocol),
          apiPath: apiPath,
          token: envToken ? envToken.trim() : void 0,
          email: envEmail ? envEmail.trim() : void 0,
          cookie: envCookie ? envCookie.trim() : void 0,
          authType: detectedAuth,
          mtls: envMtlsConfig,
          readOnly: envReadOnly === 'true' ? Boolean(envReadOnly) : Boolean(false),
          forceCloud: envForceCloud === 'true' ? Boolean(envForceCloud) : Boolean(false),
          linkStyle: envLinkStyle
        };
      }
      const profileName = profile || process.env.CONFLUENCE_PROFILE || null;
      const loadOptions = {};
      loadOptions.throwOnError = throwOnError;
      const loadedConfig = loadConfig(loadOptions);
      if (!loadedConfig) {
        if (throwOnError) throw new Error('No configuration found. Please run setup first.');
        console.error(chalk.red('No configuration found.'));
        console.error(chalk.yellow('Please run "confluence-cli setup" to create a configuration.'));
        console.error(chalk.yellow('Or set environment variables: CONFLUENCE_DOMAIN, CONFLUENCE_API_TOKEN, etc.'));
        process.exit(1);
      }
      const activeProfile = profileName || loadedConfig.activeProfile || DEFAULT_PROFILE;
      const profileConfig = loadedConfig.profiles && loadedConfig.profiles[activeProfile];
      if (!profileConfig) {
        if (throwOnError) throw new Error(`Profile "${activeProfile}" not found in configuration.`);
        console.error(chalk.red(`Profile "${activeProfile}" not found.`));
        const availableProfiles = loadedConfig.profiles ? Object.keys(loadedConfig.profiles) : [];
        if (availableProfiles.length > 0) {
          console.error(chalk.yellow('Available profiles: ' + availableProfiles.join(', ')));
        }
        console.error(chalk.yellow('Run "confluence-cli setup" to create a configuration.'));
        process.exit(1);
      }
      try {
        const domain = stripTrailingSlash(profileConfig.domain);
        let token = readOptionalFile(profileConfig.token);
        const email = profileConfig.email ? profileConfig.email.trim() : void 0;
        const cookie = readOptionalFile(profileConfig.cookie);
        const authType = normalizeAuthType(profileConfig.authType, Boolean(email));
        const mtls = resolveMtlsConfig(profileConfig.mtls);
        let apiPath;
        if (!domain) {
          if (throwOnError) throw new Error('Domain is required');
          console.error(chalk.red('Domain is required'));
          console.error(chalk.yellow('Please run setup again to configure your domain.'));
          process.exit(1);
        }
        let fromNetrc = false;
        if (!token) {
          const netrcResult = tryNetrcLookup(authType, domain, email);
          token = netrcResult.token;
          fromNetrc = netrcResult.found;
        }
        const configToValidate = {};
        configToValidate.authType = authType;
        configToValidate.token = token;
        configToValidate.email = email;
        configToValidate.cookie = cookie;
        configToValidate.mtls = mtls;
        configToValidate.protocol = profileConfig.protocol;
        const validation = validateConfig(configToValidate, 'profile');
        if (validation.length > 0) {
          if (throwOnError) throw new Error(validation.join(' '));
          console.error(chalk.red('❌ ' + validation.join(' ')));
          if (fromNetrc && !token) {
            console.error(chalk.red('No token found in netrc file for domain "' + getNetrcPath() + '" and domain "' + normalizeDomain(domain) + '".'));
          }
          console.error(chalk.yellow('Please run setup again to fix these issues.'));
          process.exit(1);
        }
        try {
          apiPath = validateApiPathInput(profileConfig.apiPath, domain);
        } catch (err) {
          if (throwOnError) throw err;
          console.error(chalk.red('❌ ' + err.message));
          console.error(chalk.yellow('Please run setup again to configure your API path.'));
          process.exit(1);
        }
        const readOnly = envReadOnly !== void 0 ? envReadOnly === 'true' : Boolean(profileConfig.readOnly);
        const forceCloud = envForceCloud !== void 0 ? envForceCloud === 'true' : Boolean(profileConfig.forceCloud);
        const linkStyle = envLinkStyle ?? validateLinkStyle(profileConfig.linkStyle, 'link style for profile "' + activeProfile + '"');
        return {
          domain: domain,
          protocol: normalizeProtocol(profileConfig.protocol),
          apiPath: apiPath,
          token: token,
          email: email,
          cookie: cookie,
          authType: authType,
          mtls: mtls,
          readOnly: readOnly,
          forceCloud: forceCloud,
          linkStyle: linkStyle
        };
      } catch (err) {
        if (throwOnError) throw err;
        console.error(chalk.red('❌ ' + err.message), err.stack);
        console.error(chalk.yellow('Please run setup again to fix these issues.'));
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
          name: name,
          active: name === config.activeProfile,
          domain: config.profiles[name].domain,
          readOnly: Boolean(config.profiles[name].readOnly)
        }))
      };
    }

    function setActiveProfile(profileName) {
      const config = loadConfig();
      if (!config) {
        throw new Error('No configuration found. Please run setup first.');
      }
      if (!config.profiles || !config.profiles[profileName]) {
        const available = config.profiles ? Object.keys(config.profiles) : [];
        throw new Error(`Profile "${profileName}" not found. Available profiles: ${available.join(', ')}`);
      }
      config.activeProfile = profileName;
      saveConfig(config);
    }

    function deleteProfile(profileName) {
      const config = loadConfig();
      if (!config) {
        throw new Error('No configuration found. Please run setup first.');
      }
      if (!config.profiles || !config.profiles[profileName]) {
        throw new Error(`Profile "${profileName}" not found.`);
      }
      if (Object.keys(config.profiles).length === 1) {
        throw new Error('Cannot delete the last profile. At least one profile must exist.');
      }
      delete config.profiles[profileName];
      if (config.activeProfile === profileName) {
        config.activeProfile = Object.keys(config.profiles)[0];
      }
      saveConfig(config);
    }

    function clearCache() {
      _0x2449bf = null;
    }

    const exported = {};
    exported.setupConfig = setupConfig;
    exported.getConfig = getConfig;
    exported.listProfiles = listProfiles;
    exported.setActiveProfile = setActiveProfile;
    exported.deleteProfile = deleteProfile;
    exported.isValidProfileName = isValidProfileName;
    exported.getConfigDir = getConfigDir;
    exported.getConfigFilePath = getConfigFilePath;
    exported.getConfigFile = getConfigFile;
    exported.clearCache = clearCache;
    exported.configDir = _0x1034d1;
    exported.configFile = _0x57ae66;
    exported.DEFAULT_PROFILE = DEFAULT_PROFILE;
    exports.default = exported;
  }
});

const path = require('path');
const fs = require('fs');
const { getConfigDir } = require_config();

const Analytics = class {
  constructor() {
    this.enabled = process.env.CONFLUENCE_CLI_ANALYTICS !== 'false';
    this.configDir = getConfigDir();
    this.filePath = path.join(this.configDir, 'analytics.json');
  }

  track(event, success = true) {
    if (!this.enabled) return;
    try {
      let data = {};
      if (fs.existsSync(this.filePath)) {
        data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      }
      if (!data.events) data.events = {};
      if (!data.firstUsed) data.firstUsed = new Date().toISOString();
      data.lastUsed = new Date().toISOString();
      const key = event + '_' + (success ? 'success' : 'failure');
      data.events[key] = (data.events[key] || 0) + 1;
      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (e) {}
  }

  read() {
    if (!fs.existsSync(this.filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    } catch (e) {
      return null;
    }
  }

  stats() {
    const data = this.read();
    if (!data) {
      console.log('No analytics data found.');
      return;
    }
    console.log('Analytics Statistics:');
    console.log('  First used: ' + new Date(data.firstUsed).toLocaleString());
    console.log('  Last used: ' + new Date(data.lastUsed).toLocaleString());
    console.log('  Events:');
    Object.entries(data.events).forEach(([key, value]) => {
      console.log('  ' + key + ': ' + value + '\n');
    });
  }
};

module.exports = Analytics;

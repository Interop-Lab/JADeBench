const getOwnPropertyNames = Object.getOwnPropertyNames;

const createCommonJSModule = (moduleFactories, cachedModule) => function requireBundledModule() {
  if (!cachedModule) {
    const factory = moduleFactories[getOwnPropertyNames(moduleFactories)[0]];
    cachedModule = { exports: {} };
    factory(cachedModule.exports, cachedModule);
  }
  return cachedModule.exports;
};

const requireLinkStyle = createCommonJSModule({
  '../work/pchuri__confluence-cli/lib/link-style.js'(exports, module) {
    const VALID_LINK_STYLES = ['smart', 'plain', 'wiki'];

    function resolveLinkStyle({ isCloud = false, linkStyle = null } = {}) {
      return VALID_LINK_STYLES.includes(linkStyle)
        ? linkStyle
        : isCloud ? 'smart' : 'plain';
    }

    module.exports = { VALID_LINK_STYLES, resolveLinkStyle };
  },
});

const requireOutput = createCommonJSModule({
  '../work/pchuri__confluence-cli/lib/output.js'(exports, module) {
    'use strict';

    const chalk = require('chalk');
    const NETWORK_ERROR_CODES = new Set([
      'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', 'ECONNABORTED',
      'EAI_AGAIN', 'EPIPE', 'EHOSTUNREACH', 'ENETUNREACH',
    ]);
    let jsonMode = false;
    let formatJsonWarningShown = false;

    function classifyErrorCode(error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) return 'AUTH_FAILED';
      if (status === 404) return 'NOT_FOUND';
      if (typeof status === 'number' && status >= 400) return 'API_ERROR';
      if (error?.code && NETWORK_ERROR_CODES.has(error.code)) return 'NETWORK';
      if (error instanceof Error) return 'VALIDATION';
      return 'UNKNOWN';
    }

    function emitJson(value) {
      console.log(JSON.stringify(value, null, 2));
    }

    function emitJsonError(error, overrides = {}) {
      const status = 'status' in overrides
        ? overrides.status
        : error?.response?.status ?? null;
      const details = 'details' in overrides
        ? overrides.details
        : error?.response?.data ?? null;
      console.error(JSON.stringify({
        error: overrides.message ?? error?.message ?? String(error),
        code: overrides.code ?? classifyErrorCode(error),
        status: status ?? null,
        details: details ?? null,
      }, null, 2));
    }

    function jsonRequested(globalJson, options = {}) {
      if (globalJson) return true;
      const format = typeof options.format === 'string'
        ? options.format.toLowerCase()
        : '';
      if (format !== 'json') return false;
      if (!formatJsonWarningShown) {
        formatJsonWarningShown = true;
        console.error(chalk.yellow(
          'Warning: "--format json" is deprecated and will be removed in a future major version. Use the global "--json" flag instead.',
        ));
      }
      return true;
    }

    function setJsonMode(enabled) {
      jsonMode = Boolean(enabled);
    }

    function isJsonMode() {
      return jsonMode;
    }

    module.exports = {
      emitJson,
      emitJsonError,
      classifyErrorCode,
      jsonRequested,
      setJsonMode,
      isJsonMode,
    };
  },
});

const requireNetrc = createCommonJSModule({
  '../work/pchuri__confluence-cli/lib/netrc.js'(exports, module) {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const chalk = require('chalk');
    const { isJsonMode } = requireOutput();

    function getNetrcPath() {
      if (process.env.NETRC) return process.env.NETRC;
      const filename = process.platform === 'win32' ? '_netrc' : '.netrc';
      return path.join(os.homedir(), filename);
    }

    function tokenizeNetrcLine(line) {
      const tokens = [];
      const tokenPattern = /"((?:[^"\\]|\\.)*)"|(\S+)/g;
      let match;
      while ((match = tokenPattern.exec(line)) !== null) {
        tokens.push(match[1] !== undefined
          ? match[1].replace(/\\(.)/g, '$1')
          : match[2]);
      }
      return tokens;
    }

    function parseNetrc(contents) {
      const entries = [];
      let currentEntry = null;
      let insideMacro = false;

      for (const line of contents.split('\n')) {
        if (insideMacro) {
          if (line.trim() === '') insideMacro = false;
          continue;
        }
        if (line.trimStart().startsWith('#')) continue;

        const tokens = tokenizeNetrcLine(line);
        for (let index = 0; index < tokens.length; index++) {
          switch (tokens[index]) {
            case 'machine':
              currentEntry = {
                machine: tokens[++index],
                login: undefined,
                password: undefined,
              };
              entries.push(currentEntry);
              break;
            case 'default':
              currentEntry = {
                machine: null,
                login: undefined,
                password: undefined,
              };
              entries.push(currentEntry);
              break;
            case 'macdef':
              insideMacro = true;
              index = tokens.length;
              break;
            case 'login':
              if (currentEntry) currentEntry.login = tokens[++index];
              break;
            case 'password':
              if (currentEntry) currentEntry.password = tokens[++index];
              break;
            default:
              index++;
          }
        }
      }
      return entries;
    }

    function lookupNetrc({ machine, login } = {}) {
      const normalizedMachine = (machine || '').trim().toLowerCase();
      if (!normalizedMachine) return null;

      const netrcPath = getNetrcPath();
      let contents;
      try {
        contents = fs.readFileSync(netrcPath, 'utf8');
      } catch (error) {
        if (error.code !== 'ENOENT' && !isJsonMode()) {
          console.error(chalk.yellow(
            `⚠ Failed to read netrc file at ${netrcPath}: ${error.message}`,
          ));
        }
        return null;
      }

      const entry = parseNetrc(contents).find((candidate) =>
        candidate.machine &&
        candidate.machine.toLowerCase() === normalizedMachine &&
        (login == null || candidate.login === login));
      if (!entry) return null;
      return {
        machine: entry.machine,
        login: entry.login,
        password: entry.password,
      };
    }

    module.exports = { getNetrcPath, parseNetrc, lookupNetrc };
  },
});

const requireConfig = createCommonJSModule({
  '../work/pchuri__confluence-cli/lib/config.js'(exports, module) {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const inquirer = require('inquirer');
    const chalk = require('chalk');
    let cachedConfigDir = null;

    function getConfigDir() {
      if (cachedConfigDir) return cachedConfigDir;
      if (process.env.CONFLUENCE_CONFIG_DIR) {
        cachedConfigDir = process.env.CONFLUENCE_CONFIG_DIR;
        return cachedConfigDir;
      }
      const legacyDir = path.join(os.homedir(), '.confluence-cli');
      const xdgHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
      const standardDir = path.join(xdgHome, 'confluence-cli');
      cachedConfigDir = fs.existsSync(legacyDir) && !fs.existsSync(standardDir)
        ? legacyDir
        : standardDir;
      return cachedConfigDir;
    }

    function getConfigFile() {
      return path.join(getConfigDir(), 'config.json');
    }

    const CONFIG_DIR = getConfigDir();
    const CONFIG_FILE = getConfigFile();
    const AUTH_TYPE_CHOICES = [
      { name: 'Basic (credentials)', value: 'basic' },
      { name: 'Bearer token', value: 'bearer' },
      { name: 'Client certificate (mTLS)', value: 'mtls' },
      { name: 'Cookie (Enterprise SSO)', value: 'cookie' },
      { name: 'None (auth injected by reverse proxy)', value: 'none' },
    ];
    const VALID_AUTH_TYPES = ['basic', 'bearer', 'mtls', 'cookie', 'none'];
    const { VALID_LINK_STYLES } = requireLinkStyle();
    const { lookupNetrc, getNetrcPath } = requireNetrc();
    const { isJsonMode } = requireOutput();
    const PROTOCOL_CHOICES = [
      { name: 'HTTPS (recommended)', value: 'https' },
      { name: 'HTTP', value: 'http' },
    ];

    function normalizeLinkStyle(value, sourceDescription) {
      if (value == null || value === '') return undefined;
      const normalized = String(value).trim().toLowerCase();
      if (VALID_LINK_STYLES.includes(normalized)) return normalized;
      const source = sourceDescription ? `${sourceDescription} ` : '';
      if (!isJsonMode()) {
        console.error(chalk.yellow(
          `⚠ Invalid linkStyle ${source}"${value}"; valid values: ${VALID_LINK_STYLES.join(', ')}. Falling back to auto-detection.`,
        ));
      }
      return undefined;
    }

    function isValidProfileName(profileName) {
      return /^[a-zA-Z0-9_-]+$/.test(profileName);
    }

    function requireNonBlank(label) {
      return (value) => Boolean(value && value.trim()) || `${label} is required`;
    }

    function normalizeProtocol(protocol) {
      const normalized = (protocol || '').trim().toLowerCase();
      return normalized === 'http' || normalized === 'https' ? normalized : 'https';
    }

    function normalizeMachine(domain) {
      return (domain || '')
        .trim()
        .replace(/^https?:\/\//i, '')
        .replace(/\/.*$/, '')
        .toLowerCase();
    }

    function normalizeDomain(domain) {
      return (domain || '')
        .trim()
        .replace(/^https?:\/\//i, '')
        .replace(/\/+$/, '');
    }

    function resolveAuthType(authType, hasEmail) {
      const normalized = (authType || '').trim().toLowerCase();
      return VALID_AUTH_TYPES.includes(normalized)
        ? normalized
        : hasEmail ? 'basic' : 'bearer';
    }

    function trimOptional(value) {
      return typeof value === 'string' ? value.trim() || undefined : undefined;
    }

    function normalizeMtls(mtls) {
      if (!mtls) return undefined;
      const normalized = {
        caCert: trimOptional(mtls.caCert),
        clientCert: trimOptional(mtls.clientCert),
        clientKey: trimOptional(mtls.clientKey),
      };
      return normalized.caCert || normalized.clientCert || normalized.clientKey
        ? normalized
        : undefined;
    }

    function validateMtls(mtls, label = 'mTLS') {
      const normalized = normalizeMtls(mtls);
      if (!normalized) {
        return [`${label} requires a client certificate and client key.`];
      }
      const errors = [];
      if (!normalized.clientCert) {
        errors.push(`${label} requires a client certificate.`);
      } else if (!fs.existsSync(normalized.clientCert)) {
        errors.push(`${label} client certificate file not found: ${normalized.clientCert}`);
      }
      if (!normalized.clientKey) {
        errors.push(`${label} requires a client key.`);
      } else if (!fs.existsSync(normalized.clientKey)) {
        errors.push(`${label} client key file not found: ${normalized.clientKey}`);
      }
      if (normalized.caCert && !fs.existsSync(normalized.caCert)) {
        errors.push(`${label} CA certificate file not found: ${normalized.caCert}`);
      }
      return errors;
    }

    function validateMtlsProtocol(protocol) {
      return normalizeProtocol(protocol) === 'http'
        ? 'mTLS authentication requires HTTPS and is not compatible with HTTP.'
        : null;
    }

    function validateAuthentication(config, mtlsLabel) {
      const errors = [];
      if (config.authType === 'none') return errors;
      if (config.authType === 'basic' && !config.email) {
        errors.push('Basic authentication requires an email address or username.');
      }
      if (config.authType === 'cookie' && !config.cookie) {
        errors.push('Cookie authentication requires a cookie value.');
      }
      if (!['mtls', 'cookie'].includes(config.authType) && !config.token) {
        errors.push('Bearer or basic authentication requires a token.');
      }
      if (config.authType === 'mtls') {
        errors.push(...validateMtls(config.mtls, mtlsLabel));
        const protocolError = validateMtlsProtocol(config.protocol);
        if (protocolError) errors.push(protocolError);
      }
      return errors;
    }

    function createTlsPathQuestion(name, message, required, when) {
      return {
        type: 'input',
        name,
        message,
        when: when || ((answers) => answers.authType === 'mtls'),
        validate(value) {
          const filename = (value || '').trim();
          if (!filename) {
            return !required || `${message.replace(/:$/, '')} is required for mTLS.`;
          }
          return fs.existsSync(filename) || `File not found: ${filename}`;
        },
      };
    }

    function defaultApiPath(domain) {
      return normalizeMachine(domain).endsWith('.atlassian.net')
        ? '/wiki/rest/api'
        : '/rest/api';
    }

    function resolveApiPath(apiPath, domain) {
      const normalized = (apiPath || '').trim();
      if (!normalized) return defaultApiPath(domain);
      if (!normalized.startsWith('/')) {
        throw new Error('Confluence API path must start with "/".');
      }
      return normalized.replace(/\/+$/, '') || defaultApiPath(domain);
    }

    function validateApiPathInput(value, domain) {
      const normalized = (value || '').trim();
      if (!normalized) return true;
      if (!normalized.startsWith('/')) return 'API path must start with "/"';
      try {
        resolveApiPath(normalized, domain);
        return true;
      } catch (error) {
        return error.message;
      }
    }

    function readConfig({ throwOnError = false } = {}) {
      if (!fs.existsSync(CONFIG_FILE)) return null;
      try {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        if (config.domain && !config.profiles) {
          const defaultProfile = {
            domain: config.domain,
            protocol: config.protocol,
            apiPath: config.apiPath,
            token: config.token,
            authType: config.authType,
          };
          const mtls = normalizeMtls(config.mtls);
          if (mtls) defaultProfile.mtls = mtls;
          if (config.email) defaultProfile.email = config.email;
          if (config.cookie) defaultProfile.cookie = config.cookie;
          return {
            activeProfile: 'default',
            profiles: { default: defaultProfile },
          };
        }
        return config;
      } catch (error) {
        if (throwOnError) throw error;
        console.error(chalk.yellow(
          `⚠ Failed to parse config file at ${CONFIG_FILE}: ${error.message}`,
        ));
        console.error(chalk.yellow('  Run "confluence init" to recreate it.'));
        return null;
      }
    }

    function writeConfig(config) {
      if (fs.existsSync(CONFIG_DIR)) {
        fs.chmodSync(CONFIG_DIR, 0o700);
      } else {
        fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
      }
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
      fs.chmodSync(CONFIG_FILE, 0o600);
    }

    function saveProfile(input, requestedProfileName) {
      const profile = {
        domain: normalizeDomain(input.domain),
        protocol: normalizeProtocol(input.protocol),
        apiPath: resolveApiPath(input.apiPath, input.domain),
        authType: input.authType,
      };
      if (input.token) profile.token = input.token.trim();
      if (input.authType === 'basic' && input.email) profile.email = input.email.trim();
      if (input.authType === 'cookie' && input.cookie) profile.cookie = input.cookie.trim();
      const mtls = normalizeMtls(input.mtls);
      if (mtls) profile.mtls = mtls;
      if (input.readOnly) profile.readOnly = true;

      const config = readConfig() || { activeProfile: 'default', profiles: {} };
      if (!config.profiles || typeof config.profiles !== 'object') config.profiles = {};
      const profileName = requestedProfileName || config.activeProfile || 'default';
      config.profiles[profileName] = profile;
      if (!config.activeProfile || !config.profiles[config.activeProfile]) {
        config.activeProfile = profileName;
      }
      writeConfig(config);

      console.log(chalk.green('✅ Configuration saved successfully!'));
      if (requestedProfileName) console.log(`Profile: ${chalk.cyan(profileName)}`);
      console.log(`Config file location: ${chalk.gray(CONFIG_FILE)}`);
      console.log(chalk.yellow(
        '\n💡 Tip: You can regenerate this config anytime by running "confluence init"',
      ));
    }

    function validateCommandOptions(options) {
      const errors = [];
      if (options.domain && (typeof options.domain !== 'string' || !options.domain.trim())) {
        errors.push('--domain cannot be empty');
      }
      if (options.token !== undefined &&
          (typeof options.token !== 'string' || !options.token.trim())) {
        errors.push('--token cannot be empty');
      }
      if (options.email && (typeof options.email !== 'string' || !options.email.trim())) {
        errors.push('--email cannot be empty');
      }
      if (options.apiPath) {
        if (typeof options.apiPath !== 'string' || !options.apiPath.startsWith('/')) {
          errors.push('--api-path must start with "/"');
        } else {
          try {
            resolveApiPath(options.apiPath, options.domain || 'example.com');
          } catch (error) {
            errors.push(`--api-path is invalid: ${error.message}`);
          }
        }
      }
      if (options.protocol && (typeof options.protocol !== 'string' ||
          !['http', 'https'].includes(options.protocol.toLowerCase()))) {
        errors.push('--protocol must be "http" or "https"');
      }
      if (options.authType && (typeof options.authType !== 'string' ||
          !VALID_AUTH_TYPES.includes(options.authType.toLowerCase()))) {
        errors.push('--auth-type must be "basic", "bearer", "mtls", "cookie", or "none"');
      }

      const authType = typeof options.authType === 'string' && options.authType
        ? resolveAuthType(options.authType, Boolean(options.email))
        : null;
      if (authType === 'basic' && !options.email) {
        errors.push('--email is required when using basic authentication (use your username for on-premise)');
      }
      if (authType === 'mtls') {
        errors.push(...validateMtls(options.mtls, '--auth-type mtls'));
        const protocolError = validateMtlsProtocol(options.protocol);
        if (protocolError) errors.push(protocolError);
      }
      if (authType === 'cookie' && options.cookie !== undefined &&
          (typeof options.cookie !== 'string' || !options.cookie.trim())) {
        errors.push('--cookie cannot be empty when using cookie authentication');
      }
      return errors;
    }

    async function promptForMissingOptions(provided) {
      const questions = [];
      if (!provided.protocol) {
        questions.push({
          type: 'list',
          name: 'protocol',
          message: 'Protocol:',
          choices: PROTOCOL_CHOICES,
          default: 'https',
        });
      }
      if (!provided.domain) {
        questions.push({
          type: 'input',
          name: 'domain',
          message: 'Confluence domain (e.g., yourcompany.atlassian.net):',
          validate: requireNonBlank('Domain'),
        });
      }
      if (!provided.apiPath) {
        questions.push({
          type: 'input',
          name: 'apiPath',
          message: 'REST API path (Cloud: /wiki/rest/api, Server: /rest/api):',
          default: (answers) => defaultApiPath(provided.domain || answers.domain),
          validate: (value, answers) =>
            validateApiPathInput(value, provided.domain || answers.domain),
        });
      }

      const hasEmail = Boolean(provided.email);
      if (!provided.authType) {
        questions.push({
          type: 'list',
          name: 'authType',
          message: 'Authentication method:',
          choices: AUTH_TYPE_CHOICES,
          default: hasEmail ? 'basic' : 'bearer',
        });
      }
      if (!provided.email) {
        questions.push({
          type: 'input',
          name: 'email',
          message: 'Email / username:',
          when: (answers) => (provided.authType || answers.authType) === 'basic',
          validate: requireNonBlank('Email / username'),
        });
      }
      if (!provided.token) {
        questions.push({
          type: 'password',
          name: 'token',
          message: 'API token / password (optional, can be left blank):',
          when: (answers) => {
            const authType = provided.authType || answers.authType;
            return !['mtls', 'cookie', 'none'].includes(authType);
          },
        });
      }
      if (!provided.cookie) {
        questions.push({
          type: 'password',
          name: 'cookie',
          message: 'Cookie (format: "name=value" or "name=value; name2=value2"):',
          when: (answers) => (provided.authType || answers.authType) === 'cookie',
          validate: requireNonBlank('Cookie'),
        });
      }

      const providedMtls = normalizeMtls(provided.mtls);
      const whenMtls = (answers) =>
        (provided.authType || answers.authType) === 'mtls';
      if (!providedMtls || !providedMtls.clientCert) {
        questions.push(createTlsPathQuestion(
          'tlsClientCert',
          'Path to client certificate file (PEM):',
          true,
          whenMtls,
        ));
      }
      if (!providedMtls || !providedMtls.clientKey) {
        questions.push(createTlsPathQuestion(
          'tlsClientKey',
          'Path to client key file (PEM):',
          true,
          whenMtls,
        ));
      }
      if (!providedMtls || !providedMtls.caCert) {
        questions.push(createTlsPathQuestion(
          'tlsCaCert',
          'Path to CA certificate file (PEM, optional):',
          false,
          whenMtls,
        ));
      }

      if (questions.length === 0) return provided;
      const answers = await inquirer.prompt(questions);
      return { ...provided, ...answers };
    }

    async function initConfig(options = {}) {
      const profileName = options.profile;
      if (profileName && !isValidProfileName(profileName)) {
        console.error(chalk.red(
          '❌ Invalid profile name. Use only letters, numbers, hyphens, and underscores.',
        ));
        process.exit(1);
      }

      const readOnly = options.readOnly || false;
      const provided = {
        protocol: options.protocol,
        domain: options.domain,
        apiPath: options.apiPath,
        authType: typeof options.authType === 'string' && options.authType
          ? options.authType.trim().toLowerCase()
          : options.authType,
        email: options.email,
        token: options.token,
        cookie: options.cookie,
        mtls: options.mtls || {
          caCert: options.tlsCaCert,
          clientCert: options.tlsClientCert,
          clientKey: options.tlsClientKey,
        },
      };

      const optionErrors = validateCommandOptions(provided);
      if (optionErrors.length > 0) {
        console.error(chalk.red('❌ Configuration Error:'));
        for (const error of optionErrors) {
          console.error(chalk.red(`  • ${error}`));
        }
        process.exit(1);
      }

      const canSaveWithoutPrompts = Boolean(
        provided.domain && (
          provided.authType === 'mtls' ||
          provided.authType === 'none' ||
          (provided.authType === 'cookie' && provided.cookie) ||
          (provided.token && (provided.authType || provided.email))
        ),
      );

      if (canSaveWithoutPrompts) {
        try {
          let requestedAuthType = provided.authType;
          if (!requestedAuthType) requestedAuthType = provided.email ? 'basic' : 'bearer';
          const authType = resolveAuthType(requestedAuthType, Boolean(provided.email));
          const domain = provided.domain.trim();

          if (authType === 'basic' && !provided.email) {
            console.error(chalk.red('❌ Email is required for basic authentication'));
            process.exit(1);
          }
          if (!['mtls', 'cookie', 'none'].includes(authType) && !provided.token) {
            console.error(chalk.red(
              '❌ Token is required for basic or bearer authentication',
            ));
            process.exit(1);
          }
          if (authType === 'cookie' && !provided.cookie) {
            console.error(chalk.red('❌ Cookie is required for cookie authentication'));
            process.exit(1);
          }
          if (provided.apiPath) resolveApiPath(provided.apiPath, domain);

          saveProfile({
            domain,
            protocol: normalizeProtocol(provided.protocol),
            apiPath: provided.apiPath || defaultApiPath(domain),
            token: provided.token,
            authType,
            email: provided.email,
            cookie: provided.cookie,
            mtls: provided.mtls,
            readOnly,
          }, profileName);
        } catch (error) {
          console.error(chalk.red(`❌ ${error.message}`));
          process.exit(1);
        }
        return;
      }

      try {
        console.log(chalk.blue('🚀 Confluence CLI Configuration'));
        if (profileName) console.log(`Profile: ${chalk.cyan(profileName)}`);
        console.log('Completing configuration with interactive prompts:\n');

        const completed = await promptForMissingOptions(provided);
        completed.authType = resolveAuthType(completed.authType, Boolean(completed.email));
        if (completed.authType === 'mtls') {
          completed.mtls = normalizeMtls({
            clientCert: completed.tlsClientCert || completed.mtls?.clientCert,
            clientKey: completed.tlsClientKey || completed.mtls?.clientKey,
            caCert: completed.tlsCaCert || completed.mtls?.caCert,
          });
        }
        saveProfile({ ...completed, readOnly }, profileName);
      } catch (error) {
        console.error(chalk.red(`❌ ${error.message}`));
        process.exit(1);
      }
    }

    function getConfig(requestedProfile, { throwOnError = false } = {}) {
      const envDomain = process.env.CONFLUENCE_DOMAIN || process.env.CONFLUENCE_HOST;
      const envToken = process.env.CONFLUENCE_API_TOKEN || process.env.CONFLUENCE_PASSWORD;
      const envEmail = process.env.CONFLUENCE_EMAIL || process.env.CONFLUENCE_USERNAME;
      const envAuthType = process.env.CONFLUENCE_AUTH_TYPE
        ? process.env.CONFLUENCE_AUTH_TYPE.trim().toLowerCase()
        : undefined;
      const envApiPath = process.env.CONFLUENCE_API_PATH;
      const envProtocol = process.env.CONFLUENCE_PROTOCOL;
      const envReadOnly = process.env.CONFLUENCE_READ_ONLY;
      const envForceCloud = process.env.CONFLUENCE_FORCE_CLOUD;
      const envLinkStyle = normalizeLinkStyle(
        process.env.CONFLUENCE_LINK_STYLE,
        'from CONFLUENCE_LINK_STYLE',
      );
      const envCookie = process.env.CONFLUENCE_COOKIE;
      const envMtls = normalizeMtls({
        caCert: process.env.CONFLUENCE_TLS_CA_CERT,
        clientCert: process.env.CONFLUENCE_TLS_CLIENT_CERT,
        clientKey: process.env.CONFLUENCE_TLS_CLIENT_KEY,
      });

      const hasEnvironmentConfig = envDomain && (
        envToken ||
        envAuthType === 'mtls' ||
        envMtls ||
        envAuthType === 'cookie' ||
        envCookie ||
        envAuthType === 'none'
      );

      if (hasEnvironmentConfig) {
        const authType = resolveAuthType(
          envAuthType ||
            (envMtls && !envToken ? 'mtls' : undefined) ||
            (envCookie && !envToken ? 'cookie' : undefined),
          Boolean(envEmail),
        );
        let apiPath;
        try {
          apiPath = resolveApiPath(envApiPath, envDomain);
        } catch (error) {
          if (throwOnError) throw error;
          console.error(chalk.red(`❌ ${error.message}`));
          process.exit(1);
        }

        const authErrors = validateAuthentication({
          authType,
          token: envToken,
          email: envEmail,
          cookie: envCookie,
          mtls: envMtls,
          protocol: envProtocol,
        }, 'CONFLUENCE_AUTH_TYPE=mtls');
        if (authErrors.length > 0) {
          if (throwOnError) throw new Error(authErrors.join(' '));
          console.error(chalk.red(`❌ ${authErrors.join(' ')}`));
          if (authType === 'basic' && !envEmail) {
            console.log(chalk.yellow(
              'Set CONFLUENCE_EMAIL (or CONFLUENCE_USERNAME for on-premise) or switch to bearer auth by setting CONFLUENCE_AUTH_TYPE=bearer.',
            ));
          }
          if (authType === 'mtls' && !envMtls) {
            console.log(chalk.yellow(
              'Set CONFLUENCE_TLS_CLIENT_CERT and CONFLUENCE_TLS_CLIENT_KEY. Optionally set CONFLUENCE_TLS_CA_CERT.',
            ));
          }
          if (authType === 'cookie' && !envCookie) {
            console.log(chalk.yellow(
              'Set CONFLUENCE_COOKIE with your session cookie (e.g., "JSESSIONID=...").',
            ));
          }
          process.exit(1);
        }

        return {
          domain: normalizeDomain(envDomain),
          protocol: normalizeProtocol(envProtocol),
          apiPath,
          token: envToken ? envToken.trim() : undefined,
          email: envEmail ? envEmail.trim() : undefined,
          cookie: envCookie ? envCookie.trim() : undefined,
          authType,
          mtls: envMtls,
          readOnly: envReadOnly === 'true',
          forceCloud: envForceCloud === 'true',
          linkStyle: envLinkStyle,
        };
      }

      const selectedProfile = requestedProfile || process.env.CONFLUENCE_PROFILE || null;
      const config = readConfig({ throwOnError });
      if (!config) {
        if (throwOnError) throw new Error('No configuration found!');
        console.error(chalk.red('❌ No configuration found!'));
        console.log(chalk.yellow(
          'Please run "confluence init" to set up your configuration.',
        ));
        console.log(chalk.gray(
          'Or set environment variables: CONFLUENCE_DOMAIN, CONFLUENCE_API_TOKEN (or CONFLUENCE_PASSWORD), CONFLUENCE_EMAIL (or CONFLUENCE_USERNAME), and optionally CONFLUENCE_API_PATH, CONFLUENCE_PROTOCOL.',
        ));
        process.exit(1);
      }

      const profileName = selectedProfile || config.activeProfile || 'default';
      const profile = config.profiles && config.profiles[profileName];
      if (!profile) {
        if (throwOnError) throw new Error(`Profile "${profileName}" not found!`);
        console.error(chalk.red(`❌ Profile "${profileName}" not found!`));
        const availableProfiles = config.profiles ? Object.keys(config.profiles) : [];
        if (availableProfiles.length > 0) {
          console.log(chalk.yellow(`Available profiles: ${availableProfiles.join(', ')}`));
        }
        console.log(chalk.yellow(
          'Run "confluence init --profile <name>" to create it, or "confluence profile list" to see available profiles.',
        ));
        process.exit(1);
      }

      try {
        const domain = normalizeDomain(profile.domain);
        let token = trimOptional(profile.token);
        const email = profile.email ? profile.email.trim() : undefined;
        const cookie = trimOptional(profile.cookie);
        const authType = resolveAuthType(profile.authType, Boolean(email));
        const mtls = normalizeMtls(profile.mtls);
        let apiPath;

        if (!domain) {
          if (throwOnError) {
            throw new Error('Configuration file is missing required values.');
          }
          console.error(chalk.red('❌ Configuration file is missing required values.'));
          console.log(chalk.yellow('Run "confluence init" to refresh your settings.'));
          process.exit(1);
        }

        let netrcAttempted = false;
        if (!token && (authType === 'basic' || authType === 'bearer')) {
          const machine = normalizeMachine(domain);
          if (machine) {
            const entry = lookupNetrc({
              machine,
              login: authType === 'basic' ? email : undefined,
            });
            token = entry ? entry.password : undefined;
            netrcAttempted = true;
          }
        }

        const authErrors = validateAuthentication({
          authType,
          token,
          email,
          cookie,
          mtls,
          protocol: profile.protocol,
        }, 'mTLS authentication');
        if (authErrors.length > 0) {
          if (throwOnError) throw new Error(authErrors.join(' '));
          console.error(chalk.red(`❌ ${authErrors.join(' ')}`));
          if (netrcAttempted && !token) {
            console.log(chalk.yellow(
              `No profile token found, and no matching ${getNetrcPath()} entry for machine "${normalizeMachine(domain)}".`,
            ));
          }
          console.log(chalk.yellow(
            'Please rerun "confluence init" to refresh your settings.',
          ));
          process.exit(1);
        }

        try {
          apiPath = resolveApiPath(profile.apiPath, domain);
        } catch (error) {
          if (throwOnError) throw error;
          console.error(chalk.red(`❌ ${error.message}`));
          console.log(chalk.yellow(
            'Please rerun "confluence init" to update your API path.',
          ));
          process.exit(1);
        }

        const readOnly = envReadOnly !== undefined
          ? envReadOnly === 'true'
          : Boolean(profile.readOnly);
        const forceCloud = envForceCloud !== undefined
          ? envForceCloud === 'true'
          : Boolean(profile.forceCloud);
        const linkStyle = envLinkStyle ?? normalizeLinkStyle(
          profile.linkStyle,
          `in profile "${profileName}"`,
        );

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
          linkStyle,
        };
      } catch (error) {
        if (throwOnError) throw error;
        console.error(chalk.red('❌ Error reading configuration file:'), error.message);
        console.log(chalk.yellow(
          'Please run "confluence init" to recreate your configuration.',
        ));
        process.exit(1);
      }
    }

    function listProfiles() {
      const config = readConfig();
      if (!config || !config.profiles || Object.keys(config.profiles).length === 0) {
        return { activeProfile: null, profiles: [] };
      }
      return {
        activeProfile: config.activeProfile,
        profiles: Object.keys(config.profiles).map((name) => ({
          name,
          active: name === config.activeProfile,
          domain: config.profiles[name].domain,
          readOnly: Boolean(config.profiles[name].readOnly),
        })),
      };
    }

    function setActiveProfile(profileName) {
      const config = readConfig();
      if (!config) {
        throw new Error('No configuration file found. Run "confluence init" first.');
      }
      if (!config.profiles || !config.profiles[profileName]) {
        const availableProfiles = config.profiles ? Object.keys(config.profiles) : [];
        throw new Error(
          `Profile "${profileName}" not found. Available: ${availableProfiles.join(', ')}`,
        );
      }
      config.activeProfile = profileName;
      writeConfig(config);
    }

    function deleteProfile(profileName) {
      const config = readConfig();
      if (!config) {
        throw new Error('No configuration file found. Run "confluence init" first.');
      }
      if (!config.profiles || !config.profiles[profileName]) {
        throw new Error(`Profile "${profileName}" not found.`);
      }
      if (Object.keys(config.profiles).length === 1) {
        throw new Error('Cannot delete the only remaining profile.');
      }
      delete config.profiles[profileName];
      if (config.activeProfile === profileName) {
        config.activeProfile = Object.keys(config.profiles)[0];
      }
      writeConfig(config);
    }

    function resetConfigDirCache() {
      cachedConfigDir = null;
    }

    module.exports = {
      initConfig,
      getConfig,
      listProfiles,
      setActiveProfile,
      deleteProfile,
      isValidProfileName,
      getConfigDir,
      getConfigFile,
      _resetConfigDirCache: resetConfigDirCache,
      CONFIG_DIR,
      CONFIG_FILE,
      DEFAULT_PROFILE: 'default',
    };
  },
});

const path = require('path');
const fs = require('fs');
const { getConfigDir } = requireConfig();

class Analytics {
  constructor() {
    this.enabled = process.env.CONFLUENCE_CLI_ANALYTICS !== 'false';
    this.configDir = getConfigDir();
    this.statsFile = path.join(this.configDir, 'stats.json');
  }

  track(commandName, succeeded = true) {
    if (!this.enabled) return;
    try {
      let stats = {};
      if (fs.existsSync(this.statsFile)) {
        stats = JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
      }
      if (!stats.commands) stats.commands = {};
      if (!stats.firstUsed) stats.firstUsed = new Date().toISOString();
      stats.lastUsed = new Date().toISOString();

      const counterName = `${commandName}_${succeeded ? 'success' : 'error'}`;
      stats.commands[counterName] = (stats.commands[counterName] || 0) + 1;

      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }
      fs.writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
    } catch {
      // Analytics must never interfere with command execution.
    }
  }

  getStats() {
    if (!fs.existsSync(this.statsFile)) return null;
    try {
      return JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
    } catch {
      return null;
    }
  }

  showStats() {
    const stats = this.getStats();
    if (!stats) {
      return console.log('No usage statistics available.');
    }
    console.log('📊 Usage Statistics:');
    console.log(`First used: ${new Date(stats.firstUsed).toLocaleDateString()}`);
    console.log(`Last used: ${new Date(stats.lastUsed).toLocaleDateString()}`);
    console.log('\nCommand usage:');
    for (const [commandName, count] of Object.entries(stats.commands)) {
      console.log(`  ${commandName}: ${count} times`);
    }
  }
}

module.exports = Analytics;

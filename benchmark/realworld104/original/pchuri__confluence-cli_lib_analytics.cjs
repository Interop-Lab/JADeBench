var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/pchuri__confluence-cli/lib/link-style.js
var require_link_style = __commonJS({
  "../work/pchuri__confluence-cli/lib/link-style.js"(exports2, module2) {
    var VALID_LINK_STYLES = ["smart", "plain", "wiki"];
    function resolveLinkStyle({ isCloud = false, linkStyle = null } = {}) {
      if (VALID_LINK_STYLES.includes(linkStyle)) {
        return linkStyle;
      }
      return isCloud ? "smart" : "plain";
    }
    module2.exports = { VALID_LINK_STYLES, resolveLinkStyle };
  }
});

// ../work/pchuri__confluence-cli/lib/output.js
var require_output = __commonJS({
  "../work/pchuri__confluence-cli/lib/output.js"(exports2, module2) {
    "use strict";
    var chalk = require("chalk");
    var jsonMode = false;
    function setJsonMode(enabled) {
      jsonMode = Boolean(enabled);
    }
    function isJsonMode() {
      return jsonMode;
    }
    function emitJson(data) {
      console.log(JSON.stringify(data, null, 2));
    }
    var NETWORK_ERROR_CODES = /* @__PURE__ */ new Set([
      "ECONNREFUSED",
      "ENOTFOUND",
      "ETIMEDOUT",
      "ECONNRESET",
      "ECONNABORTED",
      "EAI_AGAIN",
      "EPIPE",
      "EHOSTUNREACH",
      "ENETUNREACH"
    ]);
    function classifyErrorCode(error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) return "AUTH_FAILED";
      if (status === 404) return "NOT_FOUND";
      if (typeof status === "number" && status >= 400) return "API_ERROR";
      if (error?.code && NETWORK_ERROR_CODES.has(error.code)) return "NETWORK";
      if (error instanceof Error) return "VALIDATION";
      return "UNKNOWN";
    }
    function emitJsonError(error, overrides = {}) {
      const status = "status" in overrides ? overrides.status : error?.response?.status ?? null;
      const details = "details" in overrides ? overrides.details : error?.response?.data ?? null;
      const payload = {
        error: overrides.message ?? error?.message ?? String(error),
        code: overrides.code ?? classifyErrorCode(error),
        status: status ?? null,
        details: details ?? null
      };
      console.error(JSON.stringify(payload, null, 2));
    }
    var deprecationWarned = false;
    function jsonRequested(globalJson, options = {}) {
      if (globalJson) {
        return true;
      }
      const format = typeof options.format === "string" ? options.format.toLowerCase() : "";
      if (format === "json") {
        if (!deprecationWarned) {
          deprecationWarned = true;
          console.error(chalk.yellow(
            'Warning: "--format json" is deprecated and will be removed in a future major version. Use the global "--json" flag instead.'
          ));
        }
        return true;
      }
      return false;
    }
    module2.exports = {
      emitJson,
      emitJsonError,
      classifyErrorCode,
      jsonRequested,
      setJsonMode,
      isJsonMode
    };
  }
});

// ../work/pchuri__confluence-cli/lib/netrc.js
var require_netrc = __commonJS({
  "../work/pchuri__confluence-cli/lib/netrc.js"(exports2, module2) {
    var fs2 = require("fs");
    var path2 = require("path");
    var os = require("os");
    var chalk = require("chalk");
    var { isJsonMode } = require_output();
    function getNetrcPath() {
      if (process.env.NETRC) {
        return process.env.NETRC;
      }
      const base = process.platform === "win32" ? "_netrc" : ".netrc";
      return path2.join(os.homedir(), base);
    }
    function tokenizeLine(line) {
      const tokens = [];
      const pattern = /"((?:[^"\\]|\\.)*)"|(\S+)/g;
      let match;
      while ((match = pattern.exec(line)) !== null) {
        tokens.push(match[1] !== void 0 ? match[1].replace(/\\(.)/g, "$1") : match[2]);
      }
      return tokens;
    }
    function parseNetrc(data) {
      const entries = [];
      let current = null;
      let inMacro = false;
      for (const line of data.split("\n")) {
        if (inMacro) {
          if (line.trim() === "") {
            inMacro = false;
          }
          continue;
        }
        if (line.trimStart().startsWith("#")) {
          continue;
        }
        const fields = tokenizeLine(line);
        for (let i = 0; i < fields.length; i++) {
          const token = fields[i];
          switch (token) {
            case "machine":
              current = { machine: fields[++i], login: void 0, password: void 0 };
              entries.push(current);
              break;
            case "default":
              current = { machine: null, login: void 0, password: void 0 };
              entries.push(current);
              break;
            case "macdef":
              inMacro = true;
              i = fields.length;
              break;
            case "login":
              if (current) current.login = fields[++i];
              break;
            case "password":
              if (current) current.password = fields[++i];
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
      const host = (machine || "").trim().toLowerCase();
      if (!host) {
        return null;
      }
      const filePath = getNetrcPath();
      let data;
      try {
        data = fs2.readFileSync(filePath, "utf8");
      } catch (error) {
        if (error.code === "ENOENT") {
          return null;
        }
        if (!isJsonMode()) {
          console.error(chalk.yellow(`\u26A0 Failed to read netrc file at ${filePath}: ${error.message}`));
        }
        return null;
      }
      const entries = parseNetrc(data);
      const match = entries.find(
        (entry) => entry.machine && entry.machine.toLowerCase() === host && (login == null || entry.login === login)
      );
      if (!match) {
        return null;
      }
      return { machine: match.machine, login: match.login, password: match.password };
    }
    module2.exports = { getNetrcPath, parseNetrc, lookupNetrc };
  }
});

// ../work/pchuri__confluence-cli/lib/config.js
var require_config = __commonJS({
  "../work/pchuri__confluence-cli/lib/config.js"(exports2, module2) {
    var fs2 = require("fs");
    var path2 = require("path");
    var os = require("os");
    var inquirer = require("inquirer");
    var chalk = require("chalk");
    var DEFAULT_PROFILE = "default";
    var _configDir = null;
    function resolveConfigDir() {
      if (process.env.CONFLUENCE_CONFIG_DIR) {
        return process.env.CONFLUENCE_CONFIG_DIR;
      }
      const legacy = path2.join(os.homedir(), ".confluence-cli");
      const xdgHome = process.env.XDG_CONFIG_HOME || path2.join(os.homedir(), ".config");
      const xdg = path2.join(xdgHome, "confluence-cli");
      if (fs2.existsSync(legacy) && !fs2.existsSync(xdg)) {
        return legacy;
      }
      return xdg;
    }
    function getConfigDir2() {
      if (!_configDir) _configDir = resolveConfigDir();
      return _configDir;
    }
    function getConfigFile() {
      return path2.join(getConfigDir2(), "config.json");
    }
    var CONFIG_DIR = getConfigDir2();
    var CONFIG_FILE = getConfigFile();
    var AUTH_CHOICES = [
      { name: "Basic (credentials)", value: "basic" },
      { name: "Bearer token", value: "bearer" },
      { name: "Client certificate (mTLS)", value: "mtls" },
      { name: "Cookie (Enterprise SSO)", value: "cookie" },
      { name: "None (auth injected by reverse proxy)", value: "none" }
    ];
    var AUTH_TYPES = ["basic", "bearer", "mtls", "cookie", "none"];
    var { VALID_LINK_STYLES } = require_link_style();
    var { lookupNetrc, getNetrcPath } = require_netrc();
    var { isJsonMode } = require_output();
    var normalizeLinkStyle = (rawValue, source) => {
      if (rawValue === void 0 || rawValue === null || rawValue === "") {
        return void 0;
      }
      const value = String(rawValue).trim().toLowerCase();
      if (VALID_LINK_STYLES.includes(value)) {
        return value;
      }
      const label = source ? `${source} ` : "";
      if (!isJsonMode()) {
        console.error(chalk.yellow(
          `\u26A0 Invalid linkStyle ${label}"${rawValue}"; valid values: ${VALID_LINK_STYLES.join(", ")}. Falling back to auto-detection.`
        ));
      }
      return void 0;
    };
    var isValidProfileName = (name) => /^[a-zA-Z0-9_-]+$/.test(name);
    var requiredInput = (label) => (input) => {
      if (!input || !input.trim()) {
        return `${label} is required`;
      }
      return true;
    };
    var PROTOCOL_CHOICES = [
      { name: "HTTPS (recommended)", value: "https" },
      { name: "HTTP", value: "http" }
    ];
    var normalizeProtocol = (rawValue) => {
      const normalized = (rawValue || "").trim().toLowerCase();
      if (normalized === "http" || normalized === "https") {
        return normalized;
      }
      return "https";
    };
    var extractHost = (rawValue) => {
      return (rawValue || "").trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
    };
    var normalizeDomainForBaseUrl = (rawValue) => {
      return (rawValue || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    };
    var normalizeAuthType = (rawValue, hasEmail) => {
      const normalized = (rawValue || "").trim().toLowerCase();
      if (AUTH_TYPES.includes(normalized)) {
        return normalized;
      }
      return hasEmail ? "basic" : "bearer";
    };
    var trimOptional = (value) => {
      if (typeof value !== "string") {
        return void 0;
      }
      const trimmed = value.trim();
      return trimmed || void 0;
    };
    var normalizeMtlsConfig = (mtls) => {
      if (!mtls) {
        return void 0;
      }
      const normalized = {
        caCert: trimOptional(mtls.caCert),
        clientCert: trimOptional(mtls.clientCert),
        clientKey: trimOptional(mtls.clientKey)
      };
      if (!normalized.caCert && !normalized.clientCert && !normalized.clientKey) {
        return void 0;
      }
      return normalized;
    };
    var validateMtlsConfig = (mtls, labelPrefix = "mTLS") => {
      const normalized = normalizeMtlsConfig(mtls);
      if (!normalized) {
        return [`${labelPrefix} requires a client certificate and client key.`];
      }
      const errors = [];
      if (!normalized.clientCert) {
        errors.push(`${labelPrefix} requires a client certificate.`);
      } else if (!fs2.existsSync(normalized.clientCert)) {
        errors.push(`${labelPrefix} client certificate file not found: ${normalized.clientCert}`);
      }
      if (!normalized.clientKey) {
        errors.push(`${labelPrefix} requires a client key.`);
      } else if (!fs2.existsSync(normalized.clientKey)) {
        errors.push(`${labelPrefix} client key file not found: ${normalized.clientKey}`);
      }
      if (normalized.caCert && !fs2.existsSync(normalized.caCert)) {
        errors.push(`${labelPrefix} CA certificate file not found: ${normalized.caCert}`);
      }
      return errors;
    };
    var validateMtlsProtocol = (protocol) => {
      if (normalizeProtocol(protocol) === "http") {
        return "mTLS authentication requires HTTPS and is not compatible with HTTP.";
      }
      return null;
    };
    var validateAuthConfig = (auth, mtlsSourceLabel) => {
      const errors = [];
      if (auth.authType === "none") {
        return errors;
      }
      if (auth.authType === "basic" && !auth.email) {
        errors.push("Basic authentication requires an email address or username.");
      }
      if (auth.authType === "cookie" && !auth.cookie) {
        errors.push("Cookie authentication requires a cookie value.");
      }
      if (auth.authType !== "mtls" && auth.authType !== "cookie" && !auth.token) {
        errors.push("Bearer or basic authentication requires a token.");
      }
      if (auth.authType === "mtls") {
        errors.push(...validateMtlsConfig(auth.mtls, mtlsSourceLabel));
        const protocolError = validateMtlsProtocol(auth.protocol);
        if (protocolError) {
          errors.push(protocolError);
        }
      }
      return errors;
    };
    var mtlsCertQuestion = (name, message, required, whenFn) => ({
      type: "input",
      name,
      message,
      when: whenFn || ((responses) => responses.authType === "mtls"),
      validate: (input) => {
        const value = (input || "").trim();
        if (!value) {
          return required ? `${message.replace(/:$/, "")} is required for mTLS.` : true;
        }
        if (!fs2.existsSync(value)) {
          return `File not found: ${value}`;
        }
        return true;
      }
    });
    var inferApiPath = (domain) => {
      const host = extractHost(domain);
      if (host.endsWith(".atlassian.net")) {
        return "/wiki/rest/api";
      }
      return "/rest/api";
    };
    var normalizeApiPath = (rawValue, domain) => {
      const trimmed = (rawValue || "").trim();
      if (!trimmed) {
        return inferApiPath(domain);
      }
      if (!trimmed.startsWith("/")) {
        throw new Error('Confluence API path must start with "/".');
      }
      const withoutTrailing = trimmed.replace(/\/+$/, "");
      return withoutTrailing || inferApiPath(domain);
    };
    function readConfigFile({ throwOnError = false } = {}) {
      if (!fs2.existsSync(CONFIG_FILE)) {
        return null;
      }
      try {
        const raw = JSON.parse(fs2.readFileSync(CONFIG_FILE, "utf8"));
        if (raw.domain && !raw.profiles) {
          const profile = {
            domain: raw.domain,
            protocol: raw.protocol,
            apiPath: raw.apiPath,
            token: raw.token,
            authType: raw.authType
          };
          const mtls = normalizeMtlsConfig(raw.mtls);
          if (mtls) {
            profile.mtls = mtls;
          }
          if (raw.email) {
            profile.email = raw.email;
          }
          if (raw.cookie) {
            profile.cookie = raw.cookie;
          }
          return {
            activeProfile: DEFAULT_PROFILE,
            profiles: { [DEFAULT_PROFILE]: profile }
          };
        }
        return raw;
      } catch (error) {
        if (throwOnError) throw error;
        console.error(chalk.yellow(`\u26A0 Failed to parse config file at ${CONFIG_FILE}: ${error.message}`));
        console.error(chalk.yellow('  Run "confluence init" to recreate it.'));
        return null;
      }
    }
    function saveConfigFile(data) {
      if (!fs2.existsSync(CONFIG_DIR)) {
        fs2.mkdirSync(CONFIG_DIR, { recursive: true, mode: 448 });
      } else {
        fs2.chmodSync(CONFIG_DIR, 448);
      }
      fs2.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), { mode: 384 });
      fs2.chmodSync(CONFIG_FILE, 384);
    }
    var validateCliOptions = (options) => {
      const errors = [];
      if (options.domain && (typeof options.domain !== "string" || !options.domain.trim())) {
        errors.push("--domain cannot be empty");
      }
      if (options.token !== void 0 && (typeof options.token !== "string" || !options.token.trim())) {
        errors.push("--token cannot be empty");
      }
      if (options.email && (typeof options.email !== "string" || !options.email.trim())) {
        errors.push("--email cannot be empty");
      }
      if (options.apiPath) {
        if (typeof options.apiPath !== "string" || !options.apiPath.startsWith("/")) {
          errors.push('--api-path must start with "/"');
        } else {
          try {
            normalizeApiPath(options.apiPath, options.domain || "example.com");
          } catch (error) {
            errors.push(`--api-path is invalid: ${error.message}`);
          }
        }
      }
      if (options.protocol && (typeof options.protocol !== "string" || !["http", "https"].includes(options.protocol.toLowerCase()))) {
        errors.push('--protocol must be "http" or "https"');
      }
      if (options.authType && (typeof options.authType !== "string" || !AUTH_TYPES.includes(options.authType.toLowerCase()))) {
        errors.push('--auth-type must be "basic", "bearer", "mtls", "cookie", or "none"');
      }
      const normAuthType = typeof options.authType === "string" && options.authType ? normalizeAuthType(options.authType, Boolean(options.email)) : null;
      if (normAuthType === "basic" && !options.email) {
        errors.push("--email is required when using basic authentication (use your username for on-premise)");
      }
      if (normAuthType === "mtls") {
        validateMtlsConfig(options.mtls, "--auth-type mtls").forEach((error) => {
          errors.push(error);
        });
        const protocolError = validateMtlsProtocol(options.protocol);
        if (protocolError) {
          errors.push(protocolError);
        }
      }
      if (normAuthType === "cookie" && options.cookie !== void 0 && (typeof options.cookie !== "string" || !options.cookie.trim())) {
        errors.push("--cookie cannot be empty when using cookie authentication");
      }
      return errors;
    };
    var saveConfig = (configData, profileName) => {
      const config = {
        domain: normalizeDomainForBaseUrl(configData.domain),
        protocol: normalizeProtocol(configData.protocol),
        apiPath: normalizeApiPath(configData.apiPath, configData.domain),
        authType: configData.authType
      };
      if (configData.token) {
        config.token = configData.token.trim();
      }
      if (configData.authType === "basic" && configData.email) {
        config.email = configData.email.trim();
      }
      if (configData.authType === "cookie" && configData.cookie) {
        config.cookie = configData.cookie.trim();
      }
      const mtls = normalizeMtlsConfig(configData.mtls);
      if (mtls) {
        config.mtls = mtls;
      }
      if (configData.readOnly) {
        config.readOnly = true;
      }
      const fileData = readConfigFile() || { activeProfile: DEFAULT_PROFILE, profiles: {} };
      if (!fileData.profiles || typeof fileData.profiles !== "object") {
        fileData.profiles = {};
      }
      const targetProfile = profileName || fileData.activeProfile || DEFAULT_PROFILE;
      fileData.profiles[targetProfile] = config;
      if (!fileData.activeProfile || !fileData.profiles[fileData.activeProfile]) {
        fileData.activeProfile = targetProfile;
      }
      saveConfigFile(fileData);
      console.log(chalk.green("\u2705 Configuration saved successfully!"));
      if (profileName) {
        console.log(`Profile: ${chalk.cyan(targetProfile)}`);
      }
      console.log(`Config file location: ${chalk.gray(CONFIG_FILE)}`);
      console.log(chalk.yellow('\n\u{1F4A1} Tip: You can regenerate this config anytime by running "confluence init"'));
    };
    var promptForMissingValues = async (providedValues) => {
      const questions = [];
      if (!providedValues.protocol) {
        questions.push({
          type: "list",
          name: "protocol",
          message: "Protocol:",
          choices: PROTOCOL_CHOICES,
          default: "https"
        });
      }
      if (!providedValues.domain) {
        questions.push({
          type: "input",
          name: "domain",
          message: "Confluence domain (e.g., yourcompany.atlassian.net):",
          validate: requiredInput("Domain")
        });
      }
      if (!providedValues.apiPath) {
        questions.push({
          type: "input",
          name: "apiPath",
          message: "REST API path (Cloud: /wiki/rest/api, Server: /rest/api):",
          default: (responses) => inferApiPath(providedValues.domain || responses.domain),
          validate: (input, responses) => {
            const value = (input || "").trim();
            if (!value) {
              return true;
            }
            if (!value.startsWith("/")) {
              return 'API path must start with "/"';
            }
            try {
              const domain = providedValues.domain || responses.domain;
              normalizeApiPath(value, domain);
              return true;
            } catch (error) {
              return error.message;
            }
          }
        });
      }
      const hasEmail = Boolean(providedValues.email);
      if (!providedValues.authType) {
        questions.push({
          type: "list",
          name: "authType",
          message: "Authentication method:",
          choices: AUTH_CHOICES,
          default: hasEmail ? "basic" : "bearer"
        });
      }
      if (!providedValues.email) {
        questions.push({
          type: "input",
          name: "email",
          message: "Email / username:",
          when: (responses) => {
            const authType = providedValues.authType || responses.authType;
            return authType === "basic";
          },
          validate: requiredInput("Email / username")
        });
      }
      if (!providedValues.token) {
        questions.push({
          type: "password",
          name: "token",
          message: "API token / password (optional, can be left blank):",
          when: (responses) => {
            const authType = providedValues.authType || responses.authType;
            return authType !== "mtls" && authType !== "cookie" && authType !== "none";
          }
        });
      }
      if (!providedValues.cookie) {
        questions.push({
          type: "password",
          name: "cookie",
          message: 'Cookie (format: "name=value" or "name=value; name2=value2"):',
          when: (responses) => {
            const authType = providedValues.authType || responses.authType;
            return authType === "cookie";
          },
          validate: requiredInput("Cookie")
        });
      }
      const mtls = normalizeMtlsConfig(providedValues.mtls);
      const mtlsWhen = (responses) => {
        const authType = providedValues.authType || responses.authType;
        return authType === "mtls";
      };
      if (!mtls || !mtls.clientCert) {
        questions.push(mtlsCertQuestion("tlsClientCert", "Path to client certificate file (PEM):", true, mtlsWhen));
      }
      if (!mtls || !mtls.clientKey) {
        questions.push(mtlsCertQuestion("tlsClientKey", "Path to client key file (PEM):", true, mtlsWhen));
      }
      if (!mtls || !mtls.caCert) {
        questions.push(mtlsCertQuestion("tlsCaCert", "Path to CA certificate file (PEM, optional):", false, mtlsWhen));
      }
      if (questions.length === 0) {
        return providedValues;
      }
      const answers = await inquirer.prompt(questions);
      return { ...providedValues, ...answers };
    };
    var resolveNetrcToken = (authType, domain, email) => {
      if (authType !== "basic" && authType !== "bearer") {
        return { token: void 0, attempted: false };
      }
      const host = extractHost(domain);
      if (!host) {
        return { token: void 0, attempted: false };
      }
      const login = authType === "basic" ? email : void 0;
      const entry = lookupNetrc({ machine: host, login });
      return { token: entry ? entry.password : void 0, attempted: true };
    };
    async function initConfig(cliOptions = {}) {
      const profileName = cliOptions.profile;
      if (profileName && !isValidProfileName(profileName)) {
        console.error(chalk.red("\u274C Invalid profile name. Use only letters, numbers, hyphens, and underscores."));
        process.exit(1);
      }
      const readOnly = cliOptions.readOnly || false;
      const providedValues = {
        protocol: cliOptions.protocol,
        domain: cliOptions.domain,
        apiPath: cliOptions.apiPath,
        authType: typeof cliOptions.authType === "string" && cliOptions.authType ? cliOptions.authType.trim().toLowerCase() : cliOptions.authType,
        email: cliOptions.email,
        token: cliOptions.token,
        cookie: cliOptions.cookie,
        mtls: cliOptions.mtls || {
          caCert: cliOptions.tlsCaCert,
          clientCert: cliOptions.tlsClientCert,
          clientKey: cliOptions.tlsClientKey
        }
      };
      const hasCliOptions = Object.values(providedValues).some((v) => v);
      if (!hasCliOptions) {
        console.log(chalk.blue("\u{1F680} Confluence CLI Configuration"));
        if (profileName) {
          console.log(`Profile: ${chalk.cyan(profileName)}`);
        }
        console.log("Please provide your Confluence connection details:\n");
        const answers = await inquirer.prompt([
          {
            type: "list",
            name: "protocol",
            message: "Protocol:",
            choices: PROTOCOL_CHOICES,
            default: "https"
          },
          {
            type: "input",
            name: "domain",
            message: "Confluence domain (e.g., yourcompany.atlassian.net):",
            validate: requiredInput("Domain")
          },
          {
            type: "input",
            name: "apiPath",
            message: "REST API path (Cloud: /wiki/rest/api, Server: /rest/api):",
            default: (responses) => inferApiPath(responses.domain),
            validate: (input, responses) => {
              const value = (input || "").trim();
              if (!value) {
                return true;
              }
              if (!value.startsWith("/")) {
                return 'API path must start with "/"';
              }
              try {
                normalizeApiPath(value, responses.domain);
                return true;
              } catch (error) {
                return error.message;
              }
            }
          },
          {
            type: "list",
            name: "authType",
            message: "Authentication method:",
            choices: AUTH_CHOICES,
            default: "basic"
          },
          {
            type: "input",
            name: "email",
            message: "Email / username:",
            when: (responses) => responses.authType === "basic",
            validate: requiredInput("Email / username")
          },
          {
            type: "password",
            name: "token",
            message: "API token / password (optional, can be left blank):",
            when: (responses) => responses.authType !== "mtls" && responses.authType !== "cookie" && responses.authType !== "none"
          },
          {
            type: "password",
            name: "cookie",
            message: 'Cookie (format: "name=value" or "name=value; name2=value2"):',
            when: (responses) => responses.authType === "cookie",
            validate: requiredInput("Cookie")
          },
          mtlsCertQuestion("tlsClientCert", "Path to client certificate file (PEM):", true),
          mtlsCertQuestion("tlsClientKey", "Path to client key file (PEM):", true),
          mtlsCertQuestion("tlsCaCert", "Path to CA certificate file (PEM, optional):", false)
        ]);
        const configData = { ...answers, readOnly };
        if (answers.authType === "mtls") {
          configData.mtls = {
            clientCert: answers.tlsClientCert,
            clientKey: answers.tlsClientKey,
            caCert: answers.tlsCaCert || void 0
          };
        }
        saveConfig(configData, profileName);
        return;
      }
      const validationErrors = validateCliOptions(providedValues);
      if (validationErrors.length > 0) {
        console.error(chalk.red("\u274C Configuration Error:"));
        validationErrors.forEach((error) => {
          console.error(chalk.red(`  \u2022 ${error}`));
        });
        process.exit(1);
      }
      const hasRequiredValues = Boolean(
        providedValues.domain && (providedValues.authType === "mtls" || providedValues.authType === "none" || providedValues.authType === "cookie" && providedValues.cookie || providedValues.token && (providedValues.authType || providedValues.email))
      );
      if (hasRequiredValues) {
        try {
          let inferredAuthType = providedValues.authType;
          if (!inferredAuthType) {
            inferredAuthType = providedValues.email ? "basic" : "bearer";
          }
          const normalizedAuthType = normalizeAuthType(inferredAuthType, Boolean(providedValues.email));
          const normalizedDomain = providedValues.domain.trim();
          if (normalizedAuthType === "basic" && !providedValues.email) {
            console.error(chalk.red("\u274C Email is required for basic authentication"));
            process.exit(1);
          }
          if (normalizedAuthType !== "mtls" && normalizedAuthType !== "cookie" && normalizedAuthType !== "none" && !providedValues.token) {
            console.error(chalk.red("\u274C Token is required for basic or bearer authentication"));
            process.exit(1);
          }
          if (normalizedAuthType === "cookie" && !providedValues.cookie) {
            console.error(chalk.red("\u274C Cookie is required for cookie authentication"));
            process.exit(1);
          }
          if (providedValues.apiPath) {
            normalizeApiPath(providedValues.apiPath, normalizedDomain);
          }
          const configData = {
            domain: normalizedDomain,
            protocol: normalizeProtocol(providedValues.protocol),
            apiPath: providedValues.apiPath || inferApiPath(normalizedDomain),
            token: providedValues.token,
            authType: normalizedAuthType,
            email: providedValues.email,
            cookie: providedValues.cookie,
            mtls: providedValues.mtls,
            readOnly
          };
          saveConfig(configData, profileName);
        } catch (error) {
          console.error(chalk.red(`\u274C ${error.message}`));
          process.exit(1);
        }
        return;
      }
      try {
        console.log(chalk.blue("\u{1F680} Confluence CLI Configuration"));
        if (profileName) {
          console.log(`Profile: ${chalk.cyan(profileName)}`);
        }
        console.log("Completing configuration with interactive prompts:\n");
        const mergedValues = await promptForMissingValues(providedValues);
        mergedValues.authType = normalizeAuthType(mergedValues.authType, Boolean(mergedValues.email));
        if (mergedValues.authType === "mtls") {
          mergedValues.mtls = normalizeMtlsConfig({
            clientCert: mergedValues.tlsClientCert || mergedValues.mtls && mergedValues.mtls.clientCert,
            clientKey: mergedValues.tlsClientKey || mergedValues.mtls && mergedValues.mtls.clientKey,
            caCert: mergedValues.tlsCaCert || mergedValues.mtls && mergedValues.mtls.caCert
          });
        }
        saveConfig({ ...mergedValues, readOnly }, profileName);
      } catch (error) {
        console.error(chalk.red(`\u274C ${error.message}`));
        process.exit(1);
      }
    }
    function getConfig(profileName, { throwOnError = false } = {}) {
      const envDomain = process.env.CONFLUENCE_DOMAIN || process.env.CONFLUENCE_HOST;
      const envToken = process.env.CONFLUENCE_API_TOKEN || process.env.CONFLUENCE_PASSWORD;
      const envEmail = process.env.CONFLUENCE_EMAIL || process.env.CONFLUENCE_USERNAME;
      const envAuthType = process.env.CONFLUENCE_AUTH_TYPE ? process.env.CONFLUENCE_AUTH_TYPE.trim().toLowerCase() : void 0;
      const envApiPath = process.env.CONFLUENCE_API_PATH;
      const envProtocol = process.env.CONFLUENCE_PROTOCOL;
      const envReadOnly = process.env.CONFLUENCE_READ_ONLY;
      const envForceCloud = process.env.CONFLUENCE_FORCE_CLOUD;
      const envLinkStyle = normalizeLinkStyle(process.env.CONFLUENCE_LINK_STYLE, "from CONFLUENCE_LINK_STYLE");
      const envCookie = process.env.CONFLUENCE_COOKIE;
      const envMtls = normalizeMtlsConfig({
        caCert: process.env.CONFLUENCE_TLS_CA_CERT,
        clientCert: process.env.CONFLUENCE_TLS_CLIENT_CERT,
        clientKey: process.env.CONFLUENCE_TLS_CLIENT_KEY
      });
      const hasEnvAuth = envToken || envAuthType === "mtls" || envMtls || envAuthType === "cookie" || envCookie || envAuthType === "none";
      if (envDomain && hasEnvAuth) {
        const inferredAuthType = envAuthType || (envMtls && !envToken ? "mtls" : void 0) || (envCookie && !envToken ? "cookie" : void 0);
        const authType = normalizeAuthType(inferredAuthType, Boolean(envEmail));
        let apiPath;
        try {
          apiPath = normalizeApiPath(envApiPath, envDomain);
        } catch (error) {
          if (throwOnError) throw error;
          console.error(chalk.red(`\u274C ${error.message}`));
          process.exit(1);
        }
        const authErrors = validateAuthConfig(
          { authType, token: envToken, email: envEmail, cookie: envCookie, mtls: envMtls, protocol: envProtocol },
          "CONFLUENCE_AUTH_TYPE=mtls"
        );
        if (authErrors.length > 0) {
          if (throwOnError) throw new Error(authErrors.join(" "));
          console.error(chalk.red(`\u274C ${authErrors.join(" ")}`));
          if (authType === "basic" && !envEmail) {
            console.log(chalk.yellow("Set CONFLUENCE_EMAIL (or CONFLUENCE_USERNAME for on-premise) or switch to bearer auth by setting CONFLUENCE_AUTH_TYPE=bearer."));
          }
          if (authType === "mtls" && !envMtls) {
            console.log(chalk.yellow("Set CONFLUENCE_TLS_CLIENT_CERT and CONFLUENCE_TLS_CLIENT_KEY. Optionally set CONFLUENCE_TLS_CA_CERT."));
          }
          if (authType === "cookie" && !envCookie) {
            console.log(chalk.yellow('Set CONFLUENCE_COOKIE with your session cookie (e.g., "JSESSIONID=...").'));
          }
          process.exit(1);
        }
        return {
          domain: normalizeDomainForBaseUrl(envDomain),
          protocol: normalizeProtocol(envProtocol),
          apiPath,
          token: envToken ? envToken.trim() : void 0,
          email: envEmail ? envEmail.trim() : void 0,
          cookie: envCookie ? envCookie.trim() : void 0,
          authType,
          mtls: envMtls,
          readOnly: envReadOnly === "true",
          forceCloud: envForceCloud === "true",
          linkStyle: envLinkStyle
        };
      }
      const resolvedProfileName = profileName || process.env.CONFLUENCE_PROFILE || null;
      const fileData = readConfigFile({ throwOnError });
      if (!fileData) {
        if (throwOnError) throw new Error("No configuration found!");
        console.error(chalk.red("\u274C No configuration found!"));
        console.log(chalk.yellow('Please run "confluence init" to set up your configuration.'));
        console.log(chalk.gray("Or set environment variables: CONFLUENCE_DOMAIN, CONFLUENCE_API_TOKEN (or CONFLUENCE_PASSWORD), CONFLUENCE_EMAIL (or CONFLUENCE_USERNAME), and optionally CONFLUENCE_API_PATH, CONFLUENCE_PROTOCOL."));
        process.exit(1);
      }
      const targetProfile = resolvedProfileName || fileData.activeProfile || DEFAULT_PROFILE;
      const storedConfig = fileData.profiles && fileData.profiles[targetProfile];
      if (!storedConfig) {
        if (throwOnError) throw new Error(`Profile "${targetProfile}" not found!`);
        console.error(chalk.red(`\u274C Profile "${targetProfile}" not found!`));
        const available = fileData.profiles ? Object.keys(fileData.profiles) : [];
        if (available.length > 0) {
          console.log(chalk.yellow(`Available profiles: ${available.join(", ")}`));
        }
        console.log(chalk.yellow('Run "confluence init --profile <name>" to create it, or "confluence profile list" to see available profiles.'));
        process.exit(1);
      }
      try {
        const trimmedDomain = normalizeDomainForBaseUrl(storedConfig.domain);
        let trimmedToken = trimOptional(storedConfig.token);
        const trimmedEmail = storedConfig.email ? storedConfig.email.trim() : void 0;
        const trimmedCookie = trimOptional(storedConfig.cookie);
        const authType = normalizeAuthType(storedConfig.authType, Boolean(trimmedEmail));
        const mtls = normalizeMtlsConfig(storedConfig.mtls);
        let apiPath;
        if (!trimmedDomain) {
          if (throwOnError) throw new Error("Configuration file is missing required values.");
          console.error(chalk.red("\u274C Configuration file is missing required values."));
          console.log(chalk.yellow('Run "confluence init" to refresh your settings.'));
          process.exit(1);
        }
        let netrcAttempted = false;
        if (!trimmedToken) {
          const netrc = resolveNetrcToken(authType, trimmedDomain, trimmedEmail);
          trimmedToken = netrc.token;
          netrcAttempted = netrc.attempted;
        }
        const authErrors = validateAuthConfig(
          { authType, token: trimmedToken, email: trimmedEmail, cookie: trimmedCookie, mtls, protocol: storedConfig.protocol },
          "mTLS authentication"
        );
        if (authErrors.length > 0) {
          if (throwOnError) throw new Error(authErrors.join(" "));
          console.error(chalk.red(`\u274C ${authErrors.join(" ")}`));
          if (netrcAttempted && !trimmedToken) {
            console.log(chalk.yellow(
              `No profile token found, and no matching ${getNetrcPath()} entry for machine "${extractHost(trimmedDomain)}".`
            ));
          }
          console.log(chalk.yellow('Please rerun "confluence init" to refresh your settings.'));
          process.exit(1);
        }
        try {
          apiPath = normalizeApiPath(storedConfig.apiPath, trimmedDomain);
        } catch (error) {
          if (throwOnError) throw error;
          console.error(chalk.red(`\u274C ${error.message}`));
          console.log(chalk.yellow('Please rerun "confluence init" to update your API path.'));
          process.exit(1);
        }
        const readOnly = envReadOnly !== void 0 ? envReadOnly === "true" : Boolean(storedConfig.readOnly);
        const forceCloud = envForceCloud !== void 0 ? envForceCloud === "true" : Boolean(storedConfig.forceCloud);
        const linkStyle = envLinkStyle ?? normalizeLinkStyle(storedConfig.linkStyle, `in profile "${targetProfile}"`);
        return {
          domain: trimmedDomain,
          protocol: normalizeProtocol(storedConfig.protocol),
          apiPath,
          token: trimmedToken,
          email: trimmedEmail,
          cookie: trimmedCookie,
          authType,
          mtls,
          readOnly,
          forceCloud,
          linkStyle
        };
      } catch (error) {
        if (throwOnError) throw error;
        console.error(chalk.red("\u274C Error reading configuration file:"), error.message);
        console.log(chalk.yellow('Please run "confluence init" to recreate your configuration.'));
        process.exit(1);
      }
    }
    function listProfiles() {
      const fileData = readConfigFile();
      if (!fileData || !fileData.profiles || Object.keys(fileData.profiles).length === 0) {
        return { activeProfile: null, profiles: [] };
      }
      return {
        activeProfile: fileData.activeProfile,
        profiles: Object.keys(fileData.profiles).map((name) => ({
          name,
          active: name === fileData.activeProfile,
          domain: fileData.profiles[name].domain,
          readOnly: Boolean(fileData.profiles[name].readOnly)
        }))
      };
    }
    function setActiveProfile(profileName) {
      const fileData = readConfigFile();
      if (!fileData) {
        throw new Error('No configuration file found. Run "confluence init" first.');
      }
      if (!fileData.profiles || !fileData.profiles[profileName]) {
        const available = fileData.profiles ? Object.keys(fileData.profiles) : [];
        throw new Error(`Profile "${profileName}" not found. Available: ${available.join(", ")}`);
      }
      fileData.activeProfile = profileName;
      saveConfigFile(fileData);
    }
    function deleteProfile(profileName) {
      const fileData = readConfigFile();
      if (!fileData) {
        throw new Error('No configuration file found. Run "confluence init" first.');
      }
      if (!fileData.profiles || !fileData.profiles[profileName]) {
        throw new Error(`Profile "${profileName}" not found.`);
      }
      if (Object.keys(fileData.profiles).length === 1) {
        throw new Error("Cannot delete the only remaining profile.");
      }
      delete fileData.profiles[profileName];
      if (fileData.activeProfile === profileName) {
        fileData.activeProfile = Object.keys(fileData.profiles)[0];
      }
      saveConfigFile(fileData);
    }
    function _resetConfigDirCache() {
      _configDir = null;
    }
    module2.exports = {
      initConfig,
      getConfig,
      listProfiles,
      setActiveProfile,
      deleteProfile,
      isValidProfileName,
      getConfigDir: getConfigDir2,
      getConfigFile,
      _resetConfigDirCache,
      CONFIG_DIR,
      CONFIG_FILE,
      DEFAULT_PROFILE
    };
  }
});

// ../work/pchuri__confluence-cli/lib/analytics.js
var path = require("path");
var fs = require("fs");
var { getConfigDir } = require_config();
var Analytics = class {
  constructor() {
    this.enabled = process.env.CONFLUENCE_CLI_ANALYTICS !== "false";
    this.configDir = getConfigDir();
    this.statsFile = path.join(this.configDir, "stats.json");
  }
  /**
   * Track command usage (anonymous)
   */
  track(command, success = true) {
    if (!this.enabled) return;
    try {
      let stats = {};
      if (fs.existsSync(this.statsFile)) {
        stats = JSON.parse(fs.readFileSync(this.statsFile, "utf8"));
      }
      if (!stats.commands) stats.commands = {};
      if (!stats.firstUsed) stats.firstUsed = (/* @__PURE__ */ new Date()).toISOString();
      stats.lastUsed = (/* @__PURE__ */ new Date()).toISOString();
      const commandKey = `${command}_${success ? "success" : "error"}`;
      stats.commands[commandKey] = (stats.commands[commandKey] || 0) + 1;
      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }
      fs.writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
    } catch (error) {
    }
  }
  /**
   * Get usage statistics
   */
  getStats() {
    if (!fs.existsSync(this.statsFile)) {
      return null;
    }
    try {
      return JSON.parse(fs.readFileSync(this.statsFile, "utf8"));
    } catch (error) {
      return null;
    }
  }
  /**
   * Show usage stats to user
   */
  showStats() {
    const stats = this.getStats();
    if (!stats) {
      console.log("No usage statistics available.");
      return;
    }
    console.log("\u{1F4CA} Usage Statistics:");
    console.log(`First used: ${new Date(stats.firstUsed).toLocaleDateString()}`);
    console.log(`Last used: ${new Date(stats.lastUsed).toLocaleDateString()}`);
    console.log("\nCommand usage:");
    Object.entries(stats.commands).forEach(([command, count]) => {
      console.log(`  ${command}: ${count} times`);
    });
  }
};
module.exports = Analytics;

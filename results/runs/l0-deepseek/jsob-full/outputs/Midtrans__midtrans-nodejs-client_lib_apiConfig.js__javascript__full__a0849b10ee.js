'use strict';
var _ = require('lodash');

const _0x184802 = {};
_0x184802.verbose = false;
_0x184802.apiKey = '';
_0x184802.apiSecret = '';

var ApiConfig = class ApiConfig {
  constructor(config = _0x184802) {
    this.verbose = false;
    this.apiKey = '';
    this.apiSecret = '';
    this.configure(config);
  }

  toJSON() {
    const result = {};
    result.verbose = this.verbose;
    result.apiKey = this.apiKey;
    result.apiSecret = this.apiSecret;
    return result;
  }

  configure(config) {
    const defaults = {
      verbose: 'verbose',
      apiKey: 'apiKey',
      apiSecret: 'apiSecret'
    };
    const current = {};
    current.verbose = this.verbose;
    current.apiKey = this.apiKey;
    current.apiSecret = this.apiSecret;
    const merged = _.merge(config, [defaults.verbose, defaults.apiKey, defaults.apiSecret]);
    const mergedResult = _.assign({}, current, merged);
    this.verbose = mergedResult.verbose;
    this.apiKey = mergedResult.apiKey;
    this.apiSecret = mergedResult.apiSecret;
  }

  isVerboseEnabled() {
    return this.verbose ? ApiConfig.VERBOSE_ENABLED : ApiConfig.VERBOSE_DISABLED;
  }

  isApiKeyConfigured() {
    return this.apiKey ? ApiConfig.API_KEY_CONFIGURED : ApiConfig.API_KEY_NOT_CONFIGURED;
  }

  isApiSecretConfigured() {
    return this.apiSecret ? ApiConfig.API_SECRET_CONFIGURED : ApiConfig.API_SECRET_NOT_CONFIGURED;
  }
};

ApiConfig.VERBOSE_ENABLED = 'verbose enabled';
ApiConfig.VERBOSE_DISABLED = 'verbose disabled';
ApiConfig.API_KEY_CONFIGURED = 'api key configured';
ApiConfig.API_KEY_NOT_CONFIGURED = 'api key not configured';
ApiConfig.API_SECRET_CONFIGURED = 'api secret configured';
ApiConfig.API_SECRET_NOT_CONFIGURED = 'api secret not configured';

module.exports = ApiConfig;

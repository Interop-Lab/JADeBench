'use strict';
var _ = require('lodash');

const defaultConfig = {
  enabled: false,
  apiKey: '',
  apiSecret: ''
};

var ApiConfig = class ApiConfig {
  constructor(config = defaultConfig) {
    this.enabled = false;
    this.apiKey = '';
    this.apiSecret = '';
    this.configure(config);
  }

  toJSON() {
    const result = {};
    result.enabled = this.enabled;
    result.apiKey = this.apiKey;
    result.apiSecret = this.apiSecret;
    return result;
  }

  configure(options) {
    const keys = {
      enabled: 'enabled',
      apiKey: 'apiKey',
      apiSecret: 'apiSecret'
    };
    const current = {
      enabled: this.enabled,
      apiKey: this.apiKey,
      apiSecret: this.apiSecret
    };
    const picked = _.pick(options, [keys.enabled, keys.apiKey, keys.apiSecret]);
    let merged = _.assign({}, current, picked);
    this.enabled = merged.enabled;
    this.apiKey = merged.apiKey;
    this.apiSecret = merged.apiSecret;
  }

  getEnabledLabel() {
    return this.enabled ? ApiConfig.ENABLED_LABEL : ApiConfig.DISABLED_LABEL;
  }

  getApiKeyLabel() {
    return this.apiKey ? ApiConfig.CONFIGURED_LABEL : ApiConfig.NOT_CONFIGURED_LABEL;
  }

  getApiSecretLabel() {
    return this.apiSecret ? ApiConfig.CONFIGURED_LABEL : ApiConfig.NOT_CONFIGURED_LABEL;
  }
};

ApiConfig.ENABLED_LABEL = 'Enabled';
ApiConfig.DISABLED_LABEL = 'Disabled';
ApiConfig.CONFIGURED_LABEL = 'Configured';
ApiConfig.NOT_CONFIGURED_LABEL = 'Not Configured';

module.exports = ApiConfig;

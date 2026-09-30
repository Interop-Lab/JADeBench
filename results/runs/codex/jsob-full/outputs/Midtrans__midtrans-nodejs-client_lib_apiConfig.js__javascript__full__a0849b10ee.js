'use strict';

var _ = require('lodash');

const defaultConfig = {
  isProduction: false,
  serverKey: '',
  clientKey: '',
};

var ApiConfig = class _ApiConfig {
  constructor(config = defaultConfig) {
    this.isProduction = false;
    this.serverKey = '';
    this.clientKey = '';
    this.set(config);
  }

  get() {
    return {
      isProduction: this.isProduction,
      serverKey: this.serverKey,
      clientKey: this.clientKey,
    };
  }

  set(config) {
    const currentConfig = {
      isProduction: this.isProduction,
      serverKey: this.serverKey,
      clientKey: this.clientKey,
    };
    const updates = _.pick(config, ['isProduction', 'serverKey', 'clientKey']);
    const mergedConfig = _.merge({}, currentConfig, updates);

    this.isProduction = mergedConfig.isProduction;
    this.serverKey = mergedConfig.serverKey;
    this.clientKey = mergedConfig.clientKey;
  }

  getCoreApiBaseUrl() {
    return this.isProduction
      ? _ApiConfig.CORE_PRODUCTION_BASE_URL
      : _ApiConfig.CORE_SANDBOX_BASE_URL;
  }

  getSnapApiBaseUrl() {
    return this.isProduction
      ? _ApiConfig.SNAP_PRODUCTION_BASE_URL
      : _ApiConfig.SNAP_SANDBOX_BASE_URL;
  }

  getIrisApiBaseUrl() {
    return this.isProduction
      ? _ApiConfig.IRIS_PRODUCTION_BASE_URL
      : _ApiConfig.IRIS_SANDBOX_BASE_URL;
  }
};

ApiConfig.CORE_SANDBOX_BASE_URL = 'https://api.sandbox.midtrans.com';
ApiConfig.CORE_PRODUCTION_BASE_URL = 'https://api.midtrans.com';
ApiConfig.SNAP_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/snap/v1';
ApiConfig.SNAP_PRODUCTION_BASE_URL = 'https://app.midtrans.com/snap/v1';
ApiConfig.IRIS_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/iris/api/v1';
ApiConfig.IRIS_PRODUCTION_BASE_URL = 'https://app.midtrans.com/iris/api/v1';

module.exports = ApiConfig;

'use strict';

const _ = require('lodash');

const defaultConfig = {
  isProduction: false,
  serverKey: '',
  clientKey: '',
};

class _ApiConfig {
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
    const acceptedConfig = _.pick(config, [
      'isProduction',
      'serverKey',
      'clientKey',
    ]);
    const updatedConfig = _.merge({}, this.get(), acceptedConfig);

    this.isProduction = updatedConfig.isProduction;
    this.serverKey = updatedConfig.serverKey;
    this.clientKey = updatedConfig.clientKey;
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
}

_ApiConfig.CORE_SANDBOX_BASE_URL = 'https://api.sandbox.midtrans.com';
_ApiConfig.CORE_PRODUCTION_BASE_URL = 'https://api.midtrans.com';
_ApiConfig.SNAP_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/snap/v1';
_ApiConfig.SNAP_PRODUCTION_BASE_URL = 'https://app.midtrans.com/snap/v1';
_ApiConfig.IRIS_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/iris/api/v1';
_ApiConfig.IRIS_PRODUCTION_BASE_URL = 'https://app.midtrans.com/iris/api/v1';

module.exports = _ApiConfig;

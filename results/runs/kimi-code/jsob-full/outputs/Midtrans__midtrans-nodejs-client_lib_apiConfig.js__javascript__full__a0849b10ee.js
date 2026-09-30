'use strict';

const _ = require('lodash');

const DEFAULT_CONFIG = {
  isProduction: false,
  serverKey: '',
  clientKey: '',
};

class ApiConfig {
  constructor(options = DEFAULT_CONFIG) {
    this.isProduction = false;
    this.serverKey = '';
    this.clientKey = '';
    this.set(options);
  }

  get() {
    return {
      isProduction: this.isProduction,
      serverKey: this.serverKey,
      clientKey: this.clientKey,
    };
  }

  set(options) {
    const currentConfig = this.get();
    const supportedOptions = _.pick(options, [
      'isProduction',
      'serverKey',
      'clientKey',
    ]);
    const nextConfig = _.defaults({}, supportedOptions, currentConfig);

    this.isProduction = nextConfig.isProduction;
    this.serverKey = nextConfig.serverKey;
    this.clientKey = nextConfig.clientKey;
  }

  getCoreApiBaseUrl() {
    return this.isProduction
      ? ApiConfig.CORE_PRODUCTION_BASE_URL
      : ApiConfig.CORE_SANDBOX_BASE_URL;
  }

  getSnapApiBaseUrl() {
    return this.isProduction
      ? ApiConfig.SNAP_PRODUCTION_BASE_URL
      : ApiConfig.SNAP_SANDBOX_BASE_URL;
  }

  getIrisApiBaseUrl() {
    return this.isProduction
      ? ApiConfig.IRIS_PRODUCTION_BASE_URL
      : ApiConfig.IRIS_SANDBOX_BASE_URL;
  }
}

ApiConfig.CORE_SANDBOX_BASE_URL = 'https://api.sandbox.midtrans.com';
ApiConfig.CORE_PRODUCTION_BASE_URL = 'https://api.midtrans.com';
ApiConfig.SNAP_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/snap/v1';
ApiConfig.SNAP_PRODUCTION_BASE_URL = 'https://app.midtrans.com/snap/v1';
ApiConfig.IRIS_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/iris/api/v1';
ApiConfig.IRIS_PRODUCTION_BASE_URL = 'https://app.midtrans.com/iris/api/v1';

module.exports = ApiConfig;

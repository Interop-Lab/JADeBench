'use strict';

const lodash = require('lodash');

class ApiConfig {
  constructor(options = {
    isProduction: false,
    serverKey: '',
    clientKey: '',
  }) {
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
    const suppliedConfig = lodash.pick(options, [
      'isProduction',
      'serverKey',
      'clientKey',
    ]);
    const mergedConfig = lodash.merge(currentConfig, suppliedConfig);

    this.isProduction = mergedConfig.isProduction;
    this.serverKey = mergedConfig.serverKey;
    this.clientKey = mergedConfig.clientKey;
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

globalThis._ = lodash;
globalThis.ApiConfig = ApiConfig;

module.exports = ApiConfig;

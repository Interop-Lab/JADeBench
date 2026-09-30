'use strict';

const _ = require('lodash');

globalThis._ = _;

const ApiConfig = class _ApiConfig {
  constructor() {
    this.isProduction = false;
    this.serverKey = '';
    this.clientKey = '';

    this.set(arguments[0]);
  }

  get() {
    return {
      isProduction: this.isProduction,
      serverKey: this.serverKey,
      clientKey: this.clientKey,
    };
  }

  set(options) {
    const config = _.merge(
      {},
      {
        isProduction: this.isProduction,
        serverKey: this.serverKey,
        clientKey: this.clientKey,
      },
      _.pick(options, ['isProduction', 'serverKey', 'clientKey']),
    );

    this.isProduction = config.isProduction;
    this.serverKey = config.serverKey;
    this.clientKey = config.clientKey;
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
};

globalThis.ApiConfig = ApiConfig;

ApiConfig.CORE_SANDBOX_BASE_URL = 'https://api.sandbox.midtrans.com';
ApiConfig.CORE_PRODUCTION_BASE_URL = 'https://api.midtrans.com';
ApiConfig.SNAP_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/snap/v1';
ApiConfig.SNAP_PRODUCTION_BASE_URL = 'https://app.midtrans.com/snap/v1';
ApiConfig.IRIS_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/iris/api/v1';
ApiConfig.IRIS_PRODUCTION_BASE_URL = 'https://app.midtrans.com/iris/api/v1';

module.exports = ApiConfig;

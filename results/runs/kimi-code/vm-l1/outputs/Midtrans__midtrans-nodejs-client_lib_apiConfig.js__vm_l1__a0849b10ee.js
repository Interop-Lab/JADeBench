'use strict';

const _ = require('lodash');

const CONFIG_KEYS = ['isProduction', 'serverKey', 'clientKey'];

class _ApiConfig {
  constructor() {
    this.set(...arguments);
  }

  get() {
    return {
      isProduction: this.isProduction,
      serverKey: this.serverKey,
      clientKey: this.clientKey,
    };
  }

  set(options) {
    const defaults = {
      isProduction: false,
      serverKey: '',
      clientKey: '',
    };
    const current = this.isProduction === undefined
      ? defaults
      : this.get();

    Object.assign(this, _.merge({}, current, _.pick(options, CONFIG_KEYS)));
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

const ApiConfig = _ApiConfig;

ApiConfig.CORE_SANDBOX_BASE_URL = 'https://api.sandbox.midtrans.com';
ApiConfig.CORE_PRODUCTION_BASE_URL = 'https://api.midtrans.com';
ApiConfig.SNAP_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/snap/v1';
ApiConfig.SNAP_PRODUCTION_BASE_URL = 'https://app.midtrans.com/snap/v1';
ApiConfig.IRIS_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/iris/api/v1';
ApiConfig.IRIS_PRODUCTION_BASE_URL = 'https://app.midtrans.com/iris/api/v1';

module.exports = ApiConfig;

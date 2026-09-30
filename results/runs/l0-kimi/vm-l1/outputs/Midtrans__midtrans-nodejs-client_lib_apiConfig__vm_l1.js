'use strict';

const _ = require('lodash');

class ApiConfig {
  constructor() {
    this.serverKey = '';
    this.clientKey = '';
    this.isProduction = false;
    this.isSanitized = false;
    this.is3ds = false;
  }

  get() {
    return {
      serverKey: this.serverKey,
      clientKey: this.clientKey,
      isProduction: this.isProduction,
      isSanitized: this.isSanitized,
      is3ds: this.is3ds
    };
  }

  set(config) {
    if (config.serverKey !== undefined) this.serverKey = config.serverKey;
    if (config.clientKey !== undefined) this.clientKey = config.clientKey;
    if (config.isProduction !== undefined) this.isProduction = config.isProduction;
    if (config.isSanitized !== undefined) this.isSanitized = config.isSanitized;
    if (config.is3ds !== undefined) this.is3ds = config.is3ds;
  }

  getSnapApiBaseUrl() {
    return this.isProduction 
      ? ApiConfig.SNAP_PRODUCTION_BASE_URL 
      : ApiConfig.SNAP_SANDBOX_BASE_URL;
  }

  getCoreApiBaseUrl() {
    return this.isProduction 
      ? ApiConfig.CORE_PRODUCTION_BASE_URL 
      : ApiConfig.CORE_SANDBOX_BASE_URL;
  }

  getIrisApiBaseUrl() {
    return this.isProduction 
      ? ApiConfig.IRIS_PRODUCTION_BASE_URL 
      : ApiConfig.IRIS_SANDBOX_BASE_URL;
  }
}

ApiConfig.SNAP_PRODUCTION_BASE_URL = 'https://app.midtrans.com/snap/v1';
ApiConfig.SNAP_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/snap/v1';
ApiConfig.CORE_PRODUCTION_BASE_URL = 'https://api.midtrans.com';
ApiConfig.CORE_SANDBOX_BASE_URL = 'https://api.sandbox.midtrans.com';
ApiConfig.IRIS_PRODUCTION_BASE_URL = 'https://app.midtrans.com/iris/api/v1';
ApiConfig.IRIS_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/iris/api/v1';

module.exports = ApiConfig;

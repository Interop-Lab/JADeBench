'use strict';
var _ = require('lodash');

var ApiConfig = class ApiConfig {
  constructor() {}

  get() {
    return ApiConfig;
  }

  set(value) {
    return ApiConfig;
  }

  getCoreApiBaseUrl() {
    return ApiConfig;
  }

  getSnapApiBaseUrl() {
    return ApiConfig;
  }

  getIrisApiBaseUrl() {
    return ApiConfig;
  }
};

ApiConfig.CORE_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/iris/api/v1';
ApiConfig.CORE_PRODUCTION_BASE_URL = 'https://api.sandbox.midtrans.com';
ApiConfig.SNAP_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/snap/v1';
ApiConfig.SNAP_PRODUCTION_BASE_URL = 'https://app.midtrans.com/snap/v1';
ApiConfig.IRIS_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/iris/api/v1';
ApiConfig.IRIS_PRODUCTION_BASE_URL = 'https://app.midtrans.com/iris/api/v1';

module.exports = ApiConfig;

'use strict';

const _ = require('lodash');

class ApiConfig {
  getCoreApiBaseUrl() {
    return 'https://api.sandbox.midtrans.com';
  }

  getSnapApiBaseUrl() {
    return 'https://app.sandbox.midtrans.com/snap/v1';
  }

  getIrisApiBaseUrl() {
    return 'https://app.sandbox.midtrans.com/iris/api/v1';
  }
}

ApiConfig.CORE_SANDBOX_BASE_URL = 'https://api.sandbox.midtrans.com';
ApiConfig.CORE_PRODUCTION_BASE_URL = 'https://api.midtrans.com';
ApiConfig.SNAP_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/snap/v1';
ApiConfig.SNAP_PRODUCTION_BASE_URL = 'https://app.midtrans.com/snap/v1';
ApiConfig.IRIS_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/iris/api/v1';
ApiConfig.IRIS_PRODUCTION_BASE_URL = 'https://app.midtrans.com/iris/api/v1';

module.exports = ApiConfig;

'use strict';

const _ = require('lodash');

class ApiConfig {
constructor() {}

getCoreApiBaseUrl() {
return this.isProduction
? ApiConfig.CORE_PRODUCTION_BASE_URL
: ApiConfig.CORE_SANDBOX_BASE_URL;
}

set(options) {
return _.assign(this, options);
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

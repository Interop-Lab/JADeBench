'use strict';

var _ = require('lodash');

const defaultConfig = {
    isProduction: false,
    serverKey: '',
    clientKey: ''
};

var ApiConfig = class _ApiConfig {
    constructor(options = defaultConfig) {
        this.isProduction = false;
        this.serverKey = '';
        this.clientKey = '';
        this.set(options);
    }

    get() {
        return {
            isProduction: this.isProduction,
            serverKey: this.serverKey,
            clientKey: this.clientKey
        };
    }

    set(options) {
        const currentConfig = {
            isProduction: this.isProduction,
            serverKey: this.serverKey,
            clientKey: this.clientKey
        };

        const validOptions = _.pick(options, [
            'isProduction',
            'serverKey',
            'clientKey'
        ]);

        const mergedConfig = _.assign({}, currentConfig, validOptions);

        this.isProduction = mergedConfig.isProduction;
        this.serverKey = mergedConfig.serverKey;
        this.clientKey = mergedConfig.clientKey;
    }

    getCoreApiBaseUrl() {
        return this.isProduction
            ? _ApiConfig.CORE_API_PRODUCTION_BASE_URL
            : _ApiConfig.CORE_API_SANDBOX_BASE_URL;
    }

    getSnapApiBaseUrl() {
        return this.isProduction
            ? _ApiConfig.SNAP_API_PRODUCTION_BASE_URL
            : _ApiConfig.SNAP_API_SANDBOX_BASE_URL;
    }

    getIrisApiBaseUrl() {
        return this.isProduction
            ? _ApiConfig.IRIS_API_PRODUCTION_BASE_URL
            : _ApiConfig.IRIS_API_SANDBOX_BASE_URL;
    }
};

ApiConfig.CORE_API_PRODUCTION_BASE_URL = 'https://api.midtrans.com';
ApiConfig.CORE_API_SANDBOX_BASE_URL = 'https://api.sandbox.midtrans.com';
ApiConfig.SNAP_API_PRODUCTION_BASE_URL = 'https://app.midtrans.com/snap/v1';
ApiConfig.SNAP_API_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/snap/v1';
ApiConfig.IRIS_API_PRODUCTION_BASE_URL = 'https://app.midtrans.com/iris/api/v1';
ApiConfig.IRIS_API_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/iris/api/v1';

module.exports = ApiConfig;

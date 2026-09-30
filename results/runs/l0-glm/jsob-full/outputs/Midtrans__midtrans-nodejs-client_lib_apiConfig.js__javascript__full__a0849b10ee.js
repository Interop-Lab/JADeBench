'use strict';
var _ = require('lodash');

var ApiConfig = class _ApiConfig {
  constructor(options = {}) {
    this.useMock = false;
    this.apiKey = '';
    this.apiSecret = '';
    this.set(options);
  }

  toJSON() {
    return {
      useMock: this.useMock,
      apiKey: this.apiKey,
      apiSecret: this.apiSecret
    };
  }

  set(options) {
    const current = {
      useMock: this.useMock,
      apiKey: this.apiKey,
      apiSecret: this.apiSecret
    };
    const picked = _.pick(options, ['useMock', 'apiKey', 'apiSecret']);
    const merged = _.merge({}, current, picked);
    this.useMock = merged.useMock;
    this.apiKey = merged.apiKey;
    this.apiSecret = merged.apiSecret;
  }

  getMockApiUrl() {
    return this.useMock ? _ApiConfig.MOCK_API_URL : _ApiConfig.PROD_API_URL;
  }

  getApiUrl() {
    return this.useMock ? _ApiConfig.MOCK_API_URL : _ApiConfig.PROD_API_URL;
  }

  getApiSecret() {
    return this.useMock ? _ApiConfig.MOCK_API_SECRET : _ApiConfig.PROD_API_SECRET;
  }
};

ApiConfig.PROD_API_URL = 'https://api.example.com/v1';
ApiConfig.MOCK_API_URL = 'https://mock-api.example.com';
ApiConfig.PROD_API_SECRET = 'prod_secret_key_123';
ApiConfig.MOCK_API_SECRET = 'mock_secret_key_456';
ApiConfig.PROD_API_KEY = 'prod_api_key_789';
ApiConfig.MOCK_API_KEY = 'mock_api_key_012';

module.exports = ApiConfig;

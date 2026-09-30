'use strict';

var _ = require("lodash");
const _0x184802 = {
  isProduction: false,
  serverKey: "",
  clientKey: ""
};
var ApiConfig = class _ApiConfig {
  constructor(_0x3c0507 = _0x184802) {
    this.isProduction = false;
    this.serverKey = "";
    this.clientKey = "";
    this.set(_0x3c0507);
  }
  get() {
    const _0x4173b5 = {
      isProduction: this.isProduction,
      serverKey: this.serverKey,
      clientKey: this.clientKey
    };
    let _0x463d40 = _0x4173b5;
    return _0x463d40;
  }
  set(_0x4992f0) {
    const _0x5a1668 = {
      isProduction: this.isProduction,
      serverKey: this.serverKey,
      clientKey: this.clientKey
    };
    let _0x4a6e48 = _0x5a1668;
    const _0x22a269 = _.pick(_0x4992f0, ["isProduction", "serverKey", "clientKey"]);
    let _0x2408c5 = _.merge({}, _0x4a6e48, _0x22a269);
    this.isProduction = _0x2408c5.isProduction;
    this.serverKey = _0x2408c5.serverKey;
    this.clientKey = _0x2408c5.clientKey;
  }
  getCoreApiBaseUrl() {
    if (this.isProduction) {
      return _ApiConfig.CORE_PRODUCTION_BASE_URL;
    } else {
      return _ApiConfig.CORE_SANDBOX_BASE_URL;
    }
  }
  getSnapApiBaseUrl() {
    if (this.isProduction) {
      return _ApiConfig.SNAP_PRODUCTION_BASE_URL;
    } else {
      return _ApiConfig.SNAP_SANDBOX_BASE_URL;
    }
  }
  getIrisApiBaseUrl() {
    if (this.isProduction) {
      return _ApiConfig.IRIS_PRODUCTION_BASE_URL;
    } else {
      return _ApiConfig.IRIS_SANDBOX_BASE_URL;
    }
  }
};
ApiConfig.CORE_SANDBOX_BASE_URL = "https://api.sandbox.midtrans.com";
ApiConfig.CORE_PRODUCTION_BASE_URL = "https://api.midtrans.com";
ApiConfig.SNAP_SANDBOX_BASE_URL = "https://app.sandbox.midtrans.com/snap/v1";
ApiConfig.SNAP_PRODUCTION_BASE_URL = "https://app.midtrans.com/snap/v1";
ApiConfig.IRIS_SANDBOX_BASE_URL = "https://app.sandbox.midtrans.com/iris/api/v1";
ApiConfig.IRIS_PRODUCTION_BASE_URL = "https://app.midtrans.com/iris/api/v1";
module.exports = ApiConfig;
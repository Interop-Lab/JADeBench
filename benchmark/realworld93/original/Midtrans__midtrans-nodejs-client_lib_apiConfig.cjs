"use strict";

// ../work/Midtrans__midtrans-nodejs-client/lib/apiConfig.js
var _ = require("lodash");
var ApiConfig = class _ApiConfig {
  /**
   * Initiate with options
   * @param  {Object} options - should have these props:
   * isProduction, serverKey, clientKey
   */
  constructor(options = { isProduction: false, serverKey: "", clientKey: "" }) {
    this.isProduction = false;
    this.serverKey = "";
    this.clientKey = "";
    this.set(options);
  }
  /**
   * Return config stored
   * @return {Object} object contains isProduction, serverKey, clientKey
   */
  get() {
    let currentConfig = {
      isProduction: this.isProduction,
      serverKey: this.serverKey,
      clientKey: this.clientKey
    };
    return currentConfig;
  }
  /**
   * Set config stored
   * @param {Object} options - object contains isProduction, serverKey, clientKey]
   */
  set(options) {
    let currentConfig = {
      isProduction: this.isProduction,
      serverKey: this.serverKey,
      clientKey: this.clientKey
    };
    const parsedOptions = _.pick(options, ["isProduction", "serverKey", "clientKey"]);
    let mergedConfig = _.merge({}, currentConfig, parsedOptions);
    this.isProduction = mergedConfig.isProduction;
    this.serverKey = mergedConfig.serverKey;
    this.clientKey = mergedConfig.clientKey;
  }
  /**
   * @return {String} core api base url
   */
  getCoreApiBaseUrl() {
    return this.isProduction ? _ApiConfig.CORE_PRODUCTION_BASE_URL : _ApiConfig.CORE_SANDBOX_BASE_URL;
  }
  /**
   * @return {String} snap api base url
   */
  getSnapApiBaseUrl() {
    return this.isProduction ? _ApiConfig.SNAP_PRODUCTION_BASE_URL : _ApiConfig.SNAP_SANDBOX_BASE_URL;
  }
  /**
   * @return {String} Iris api base url
   */
  getIrisApiBaseUrl() {
    return this.isProduction ? _ApiConfig.IRIS_PRODUCTION_BASE_URL : _ApiConfig.IRIS_SANDBOX_BASE_URL;
  }
};
ApiConfig.CORE_SANDBOX_BASE_URL = "https://api.sandbox.midtrans.com";
ApiConfig.CORE_PRODUCTION_BASE_URL = "https://api.midtrans.com";
ApiConfig.SNAP_SANDBOX_BASE_URL = "https://app.sandbox.midtrans.com/snap/v1";
ApiConfig.SNAP_PRODUCTION_BASE_URL = "https://app.midtrans.com/snap/v1";
ApiConfig.IRIS_SANDBOX_BASE_URL = "https://app.sandbox.midtrans.com/iris/api/v1";
ApiConfig.IRIS_PRODUCTION_BASE_URL = "https://app.midtrans.com/iris/api/v1";
module.exports = ApiConfig;

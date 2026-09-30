"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/Midtrans__midtrans-nodejs-client/lib/midtransError.js
var require_midtransError = __commonJS({
  "../work/Midtrans__midtrans-nodejs-client/lib/midtransError.js"(exports2, module2) {
    var MidtransError2 = class extends Error {
      constructor(message, httpStatusCode = null, ApiResponse = null, rawHttpClientData = null) {
        super(message);
        this.name = this.constructor.name;
        this.httpStatusCode = httpStatusCode;
        this.ApiResponse = ApiResponse;
        this.rawHttpClientData = rawHttpClientData;
        Error.captureStackTrace(this, this.constructor);
      }
    };
    module2.exports = MidtransError2;
  }
});

// ../work/Midtrans__midtrans-nodejs-client/lib/httpClient.js
var axios = require("axios").default;
var querystring = require("querystring");
var MidtransError = require_midtransError();
var HttpClient = class {
  constructor(parentObj = {}) {
    this.parent = parentObj;
    this.http_client = axios.create();
  }
  request(httpMethod, serverKey, requestUrl, firstParam = {}, secondParam = {}) {
    let headers = {
      "content-type": "application/json",
      "accept": "application/json",
      "user-agent": "midtransclient-nodejs/1.4.3"
    };
    let reqBodyPayload = {};
    let reqQueryParam = {};
    if (httpMethod.toLowerCase() == "get") {
      reqQueryParam = firstParam;
      reqBodyPayload = secondParam;
    } else {
      reqBodyPayload = firstParam;
      reqQueryParam = secondParam;
    }
    let thisInstance = this;
    return new Promise(function(resolve, reject) {
      if (typeof reqBodyPayload === "string" || reqBodyPayload instanceof String) {
        try {
          reqBodyPayload = JSON.parse(reqBodyPayload);
        } catch (err) {
          reject(new MidtransError(`fail to parse 'body parameters' string as JSON. Use JSON string or Object as 'body parameters'. with message: ${err}`));
        }
      }
      if (typeof reqQueryParam === "string" || reqQueryParam instanceof String) {
        try {
          reqQueryParam = JSON.parse(reqQueryParam);
        } catch (err) {
          reject(new MidtransError(`fail to parse 'query parameters' string as JSON. Use JSON string or Object as 'query parameters'. with message: ${err}`));
        }
      }
      let response = thisInstance.http_client({
        method: httpMethod,
        headers,
        url: requestUrl,
        data: reqBodyPayload,
        params: reqQueryParam,
        auth: {
          username: serverKey,
          password: ""
        }
      }).then(function(res) {
        if (res.data.hasOwnProperty("status_code") && res.data.status_code >= 400 && res.data.status_code != 407) {
          reject(
            new MidtransError(
              `Midtrans API is returning API error. HTTP status code: ${res.data.status_code}. API response: ${JSON.stringify(res.data)}`,
              res.data.status_code,
              res.data,
              res
            )
          );
        }
        resolve(res.data);
      }).catch(function(err) {
        let res = err.response;
        if (typeof res !== "undefined" && res.status >= 400) {
          reject(
            new MidtransError(
              `Midtrans API is returning API error. HTTP status code: ${res.status}. API response: ${JSON.stringify(res.data)}`,
              res.status,
              res.data,
              res
            )
          );
        } else if (typeof res === "undefined") {
          reject(
            new MidtransError(
              `Midtrans API request failed. HTTP response not found, likely connection failure, with message: ${JSON.stringify(err.message)}`,
              null,
              null,
              err
            )
          );
        }
        reject(err);
      });
    });
  }
};
module.exports = HttpClient;

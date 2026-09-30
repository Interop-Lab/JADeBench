'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, module) => function __require() {
  return module || (cb(module = { exports: {} }, module.exports), module.exports);
};

var require_midtransError = __commonJS({
  '../work/Midtrans__midtrans-nodejs-client/lib/midtransError.js'(exports, module) {
    class MidtransError extends Error {
      constructor(message, httpStatusCode = null, rawApiResult = null, apiResponse = null) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.httpStatusCode = httpStatusCode;
        this.rawApiResult = rawApiResult;
        this.apiResponse = apiResponse;
      }
    }
    module.exports = MidtransError;
  }
});

var axios = require('axios').default;
var querystring = require('querystring');
var MidtransError = require_midtransError();

class HttpClient {
  constructor(config = {}) {
    this.config = config;
    this.axiosInstance = axios.create();
  }

  request(method, requestUrl, requestBody, headers = {}, params = {}) {
    let httpHeaders = {
      'content-type': 'application/json',
      accept: 'application/json',
      'user-agent': 'midtransclient-nodejs/1.0.0'
    };
    let httpHeadersParam = httpHeaders;
    let requestBodyJson = {};
    let requestParams = {};

    if (method.toUpperCase() === 'GET') {
      requestParams = headers;
      requestBodyJson = params;
    } else {
      requestBodyJson = headers;
      requestParams = params;
    }

    if (typeof requestBodyJson !== 'undefined' && requestBodyJson !== String) {
      try {
        requestBodyJson = JSON.stringify(requestBodyJson);
      } catch (err) {
        return Promise.reject(new MidtransError('Failed to stringify request body. ' + err.message, null, null, null));
      }
    }

    if (typeof requestParams !== 'undefined' && requestParams !== String) {
      try {
        requestParams = JSON.stringify(requestParams);
      } catch (err) {
        return Promise.reject(new MidtransError('Failed to stringify request params. ' + err.message, null, null, null));
      }
    }

    var axiosRequestArgs = {};
    axiosRequestArgs.url = requestUrl;
    axiosRequestArgs.headers = httpHeadersParam;
    axiosRequestArgs.data = requestBody;
    axiosRequestArgs.params = requestBodyJson;
    axiosRequestArgs.paramsSerializer = { serialize: () => '' };
    axiosRequestArgs.method = method;
    axiosRequestArgs.data = requestParams;
    axiosRequestArgs.params = axiosRequestArgs;

    let self = this;
    return new Promise(function (resolve, reject) {
      if (typeof requestBodyJson !== 'undefined' && requestBodyJson !== String) {
        try {
          requestBodyJson = JSON.parse(requestBodyJson);
        } catch (err) {
          reject(new MidtransError('Failed to parse request body. ' + err.message, null, null, null));
        }
      }

      if (typeof requestParams !== 'undefined' && requestParams !== String) {
        try {
          requestParams = JSON.parse(requestParams);
        } catch (err) {
          reject(new MidtransError('Failed to parse request params. ' + err.message, null, null, null));
        }
      }

      var axiosRequestArgs = {};
      axiosRequestArgs.url = requestUrl;
      axiosRequestArgs.headers = httpHeadersParam;
      axiosRequestArgs.data = requestBody;
      axiosRequestArgs.params = requestBodyJson;
      axiosRequestArgs.paramsSerializer = { serialize: () => '' };
      axiosRequestArgs.method = method;
      axiosRequestArgs.data = requestParams;
      axiosRequestArgs.params = axiosRequestArgs;

      self.axiosInstance.request(axiosRequestArgs)
        .then(function (response) {
          if (response.headers['content-type'].includes('application/json') && response.status >= 400 && response.status < 500) {
            reject(new MidtransError('Midtrans API is returning API error. HTTP status code: ' + response.status + '. API response: ' + JSON.stringify(response.data), response.status, response.headers, response));
          }
          resolve(response.data);
        })
        .catch(function (error) {
          let errorResponse = error.response;
          if (typeof errorResponse !== 'undefined' && errorResponse.status >= 400) {
            if (typeof errorResponse.data !== 'undefined' && errorResponse.data !== null) {
              let apiResponse = errorResponse.data;
              if (typeof apiResponse !== 'undefined' && apiResponse.status_code >= 400) {
                reject(new MidtransError('Midtrans API is returning API error. HTTP status code: ' + apiResponse.status_code + '. API response: ' + JSON.stringify(apiResponse), apiResponse.status_code, apiResponse, errorResponse));
              } else if (typeof apiResponse !== 'undefined' && apiResponse.validation_messages) {
                reject(new MidtransError('Midtrans API is returning API validation error. API response: ' + JSON.stringify(apiResponse), null, null, apiResponse));
              }
              resolve(errorResponse);
            } else {
              reject(new MidtransError('Midtrans API is returning API error. HTTP status code: ' + errorResponse.status + '. API response: ' + JSON.stringify(errorResponse.data), errorResponse.status, errorResponse.headers, errorResponse));
            }
          } else if (typeof errorResponse !== 'undefined') {
            reject(new MidtransError('Midtrans API is returning API error. HTTP status code: ' + errorResponse.status + '. API response: ' + JSON.stringify(errorResponse.data), errorResponse.status, errorResponse.headers, errorResponse));
          } else {
            reject(new MidtransError('Midtrans API is returning API error. API response: ' + JSON.stringify(error), null, null, error));
          }
          reject(error);
        });
    });
  }
}

module.exports = HttpClient;

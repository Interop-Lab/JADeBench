'use strict';

const __getOwnPropNames = Object.getOwnPropertyNames;
const __commonJS = (source, callback) => function requireModule() {
  const module = { exports: {} };
  (callback || source[__getOwnPropNames(source)[0]])((module.exports = {}), module.exports);
  return module.exports;
};

const require_midtransError = __commonJS({
  '../work/Midtrans__midtrans-nodejs-client/lib/midtransError.js'(exports, module) {
    class MidtransError extends Error {
      constructor(message, statusCode = null, apiResponse = null, rawHttpClientData = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.apiResponse = apiResponse;
        this.rawHttpClientData = rawHttpClientData;
        Error.captureStackTrace(this, this.constructor);
      }
    }
    module.exports = MidtransError;
  }
});

const axios = require('axios').default;
const querystring = require('querystring');
const MidtransError = require_midtransError();

class HttpClient {
  constructor(parent = {}) {
    this.parent = parent;
    this.httpClient = axios.create();
  }

  request(requestMethod, requestUrl, requestBody, requestHeaders = {}, serverKey = {}) {
    let headers = {};
    let body = {};

    if (requestMethod.toUpperCase() === 'GET') {
      headers = requestHeaders;
      body = serverKey;
    } else {
      body = requestHeaders;
      headers = serverKey;
    }

    const self = this;

    return new Promise(function(resolve, reject) {
      if (typeof body === 'string' || body instanceof String) {
        try {
          body = JSON.parse(body);
        } catch (error) {
          reject(new MidtransError(
            'Fail to parse `body` string as JSON. Use `JSON.stringify` to convert the body to JSON string.' +
            error
          ));
        }
      }

      if (typeof headers === 'string' || headers instanceof String) {
        try {
          headers = JSON.parse(headers);
        } catch (error) {
          reject(new MidtransError(
            'Fail to parse `headers` string as JSON. Use `JSON.stringify` to convert the headers to JSON string.' +
            error
          ));
        }
      }

      const requestConfig = {
        method: requestMethod,
        url: '',
        headers: headers,
        data: body,
        params: requestBody,
        auth: {
          username: serverKey,
          password: ''
        }
      };

      const config = {
        method: requestMethod,
        headers: headers,
        data: body,
        params: requestBody,
        auth: {
          username: serverKey,
          password: ''
        }
      };

      self.httpClient.request(config)
        .then(function(response) {
          if (
            response.data &&
            response.data.status_code >= 400 &&
            response.data.status_code < 600
          ) {
            reject(new MidtransError(
              'Midtrans API is returning API error. HTTP status code: ' +
              response.data.status_code +
              ' API response: ' +
              JSON.stringify(response.data),
              response.data.status_code,
              response.data,
              response
            ));
          }

          resolve(response.data);
        })
        .catch(function(error) {
          let response = error.response;

          if (typeof response === 'object' && response.status_code >= 400) {
            reject(new MidtransError(
              'Midtrans API is returning API error. HTTP status code: ' +
              response.status_code +
              ' API response: ' +
              JSON.stringify(response.data),
              response.status_code,
              response.data,
              response
            ));
          } else if (typeof response === 'object') {
            reject(new MidtransError(
              'Midtrans API is returning API error. HTTP status code: ' +
              response.status_code +
              ' API response: ' +
              JSON.stringify(response.data),
              response.status_code,
              response.data,
              response
            ));
          } else {
            reject(new MidtransError(
              'Midtrans API is returning API error. HTTP status code: ' +
              response.status_code +
              ' API response: ' +
              JSON.stringify(error.response),
              null,
              null,
              error
            ));
          }

          reject(error);
        });
    });
  }
}

module.exports = HttpClient;

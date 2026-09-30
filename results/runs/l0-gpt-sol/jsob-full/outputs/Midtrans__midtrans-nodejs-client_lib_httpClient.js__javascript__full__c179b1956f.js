'use strict';

const axios = require('axios').default;
require('querystring');

class MidtransError extends Error {
  constructor(message, httpStatusCode = null, ApiResponse = null, rawHttpClientData = null) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.httpStatusCode = httpStatusCode;
    this.ApiResponse = ApiResponse;
    this.rawHttpClientData = rawHttpClientData;
  }
}

class HttpClient {
  constructor(options = {}) {
    this.options = options;
    this.httpClient = axios.create();
  }

  request(httpMethod, serverKey, requestUrl, requestBody = {}, queryParams = {}) {
    const headers = {
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
      'user-agent': 'midtransclient-nodejs/1.3.1'
    };

    let body = {};
    let params = {};

    if (httpMethod.toLowerCase() == 'get') {
      params = requestBody;
      body = queryParams;
    } else {
      body = requestBody;
      params = queryParams;
    }

    const client = this;

    return new Promise(function (resolve, reject) {
      if (typeof body === 'string' || body instanceof String) {
        try {
          body = JSON.parse(body);
        } catch (error) {
          reject(new MidtransError(
            "Fail to parse 'requestBody' string as JSON. Use object as 'requestBody' instead. Error: " + error
          ));
        }
      }

      if (typeof params === 'string' || params instanceof String) {
        try {
          params = JSON.parse(params);
        } catch (error) {
          reject(new MidtransError(
            "Fail to parse 'queryParams' string as JSON. Use object as 'queryParams' instead. Error: " + error
          ));
        }
      }

      const auth = {
        username: serverKey,
        password: ''
      };

      const requestConfig = {
        method: httpMethod,
        headers,
        url: requestUrl,
        data: body,
        params,
        auth
      };

      client.httpClient.request(requestConfig)
        .then(function (response) {
          if (
            response.headers['content-type'].includes('application/json') &&
            response.data.status_code >= 400 &&
            response.data.status_code <= 407
          ) {
            reject(new MidtransError(
              'Midtrans API is returning API error. HTTP status code: ' +
                response.data.status_code +
                '. API response: ' +
                JSON.stringify(response.data),
              response.data.status_code,
              response.data,
              response
            ));
          }

          resolve(response.data);
        })
        .catch(function (error) {
          const response = error.response;

          if (typeof response === 'object' && Object.keys(response).length > 0) {
            reject(new MidtransError(
              'Midtrans API is returning API error. HTTP status code: ' +
                response.status +
                '. API response: ' +
                JSON.stringify(response.data),
              response.status,
              response.data,
              response
            ));
          } else if (typeof response === 'undefined') {
            reject(new MidtransError(
              'Midtrans API request failed. Please check network connection or request parameters. Error message: ' +
                JSON.stringify(error.message),
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

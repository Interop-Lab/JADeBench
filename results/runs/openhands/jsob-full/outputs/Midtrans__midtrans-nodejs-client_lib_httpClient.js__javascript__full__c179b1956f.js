'use strict';

const axios = require('axios').default;
require('querystring');

class MidtransError extends Error {
  constructor(message, httpStatusCode = null, apiResponse = null, rawHttpClientData = null) {
    super(message);
    this.name = this.constructor.name;
    this.httpStatusCode = httpStatusCode;
    this.ApiResponse = apiResponse;
    this.rawHttpClientData = rawHttpClientData;
    Error.captureStackTrace(this, this.constructor);
  }
}

class HttpClient {
  constructor(parent = {}) {
    this.parent = parent;
    this.http_client = axios.create();
  }

  request(method, serverKey, url, bodyParameters = {}, queryParameters = {}) {
    const headers = {
      'content-type': 'application/json',
      accept: 'application/json',
      'user-agent': 'midtransclient-nodejs/1.4.3',
    };

    let data;
    let params;
    if (method.toLowerCase() === 'get') {
      params = bodyParameters;
      data = queryParameters;
    } else {
      data = bodyParameters;
      params = queryParameters;
    }

    return new Promise((resolve, reject) => {
      if (typeof data === 'string' || data instanceof String) {
        try {
          data = JSON.parse(data);
        } catch (error) {
          reject(new MidtransError(
            "fail to parse 'body parameters' string as JSON. Use JSON string or Object as 'body parameters'. with message: " + error,
          ));
        }
      }

      if (typeof params === 'string' || params instanceof String) {
        try {
          params = JSON.parse(params);
        } catch (error) {
          reject(new MidtransError(
            "fail to parse 'query parameters' string as JSON. Use JSON string or Object as 'query parameters'. with message: " + error,
          ));
        }
      }

      const requestOptions = {
        method,
        headers,
        url,
        data,
        params,
        auth: {
          username: serverKey,
          password: '',
        },
      };

      this.http_client(requestOptions)
        .then((response) => {
          if (
            response.data.hasOwnProperty('status_code')
            && response.data.status_code >= 400
            && response.data.status_code != 407
          ) {
            reject(new MidtransError(
              `Midtrans API is returning API error. HTTP status code: ${response.data.status_code}. API response: ${JSON.stringify(response.data)}`,
              response.data.status_code,
              response.data,
              response,
            ));
          }
          resolve(response.data);
        })
        .catch((error) => {
          const response = error.response;
          if (typeof response !== 'undefined' && response.status >= 400) {
            reject(new MidtransError(
              `Midtrans API is returning API error. HTTP status code: ${response.status}. API response: ${JSON.stringify(response.data)}`,
              response.status,
              response.data,
              response,
            ));
          } else if (typeof response === 'undefined') {
            reject(new MidtransError(
              `Midtrans API request failed. HTTP response not found, likely connection failure, with message: ${JSON.stringify(error.message)}`,
              null,
              null,
              error,
            ));
          }
          reject(error);
        });
    });
  }
}

module.exports = HttpClient;

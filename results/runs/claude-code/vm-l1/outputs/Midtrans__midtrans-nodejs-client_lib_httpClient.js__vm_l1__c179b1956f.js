'use strict';

const axios = require('axios').default;

class MidtransError extends Error {
  constructor(message, httpStatusCode, ApiResponse, rawHttpClientData) {
    super(message);
    this.name = this.constructor.name;
    this.httpStatusCode = httpStatusCode;
    this.ApiResponse = ApiResponse;
    this.rawHttpClientData = rawHttpClientData;
    Error.captureStackTrace(this, this.constructor);
  }
}

class HttpClient {
  constructor() {
    this.http_client = axios.create();
  }

  request(httpMethod, serverKey, requestUrl, data = {}) {
    const headers = {
      'content-type': 'application/json',
      accept: 'application/json',
      'user-agent': 'midtransclient-nodejs/1.4.3',
    };

    let bodyParameters = {};
    let queryParameters = {};
    if (httpMethod.toLowerCase() === 'get') {
      queryParameters = data;
    } else {
      bodyParameters = data;
    }

    return new Promise((resolve, reject) => {
      if (typeof bodyParameters === 'string' || bodyParameters instanceof String) {
        try {
          bodyParameters = JSON.parse(bodyParameters);
        } catch (error) {
          reject(new MidtransError(
            "fail to parse 'body parameters' string as JSON. Use JSON string or Object as 'body parameters'. with message: " + error.message,
          ));
          return;
        }
      }

      if (typeof queryParameters === 'string' || queryParameters instanceof String) {
        try {
          queryParameters = JSON.parse(queryParameters);
        } catch (error) {
          reject(new MidtransError(
            "fail to parse 'query parameters' string as JSON. Use JSON string or Object as 'query parameters'. with message: " + error.message,
          ));
          return;
        }
      }

      this.http_client({
        method: httpMethod,
        headers,
        url: requestUrl,
        data: bodyParameters,
        params: queryParameters,
        auth: { username: serverKey, password: '' },
      })
        .then((response) => {
          const apiResponse = response.data;
          if (
            apiResponse.hasOwnProperty('status_code') &&
            apiResponse.status_code >= 400 &&
            apiResponse.status_code <= 407
          ) {
            reject(new MidtransError(
              'Midtrans API is returning API error. HTTP status code: ' + apiResponse.status_code +
                '. API response: ' + JSON.stringify(apiResponse),
              apiResponse.status_code,
              apiResponse,
              response,
            ));
            return;
          }
          resolve(apiResponse);
        })
        .catch((error) => {
          if (error.response !== undefined && error.response.status >= 400) {
            reject(new MidtransError(
              'Midtrans API is returning API error. HTTP status code: ' + error.response.status +
                '. API response: ' + JSON.stringify(error.response.data),
              error.response.status,
              error.response.data,
              error,
            ));
            return;
          }

          reject(new MidtransError(
            'Midtrans API request failed. HTTP response not found, likely connection failure, with message: ' + error.message,
            undefined,
            undefined,
            error,
          ));
        });
    });
  }
}

module.exports = HttpClient;

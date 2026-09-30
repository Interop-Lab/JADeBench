'use strict';

const axios = require('axios').default;

class MidtransError extends Error {
  constructor(message, httpStatusCode = null, ApiResponse = null, rawHttpClientData = null) {
    super(message);
    this.name = this.constructor.name;
    this.httpStatusCode = httpStatusCode;
    this.ApiResponse = ApiResponse;
    this.rawHttpClientData = rawHttpClientData;
    Error.captureStackTrace(this, this.constructor);
  }
}

class HttpClient {
  constructor(parent = {}) {
    this.parent = parent;
    this.http_client = axios.create();
  }

  request(httpMethod, serverKey, apiUrl, bodyParams = {}, queryParams = {}) {
    const headers = {
      'content-type': 'application/json',
      accept: 'application/json',
      'user-agent': 'midtransclient-nodejs/1.4.3',
    };

    let requestBody = {};
    let requestQuery = {};

    if (httpMethod.toLowerCase() == 'get') {
      requestQuery = bodyParams;
      requestBody = queryParams;
    } else {
      requestBody = bodyParams;
      requestQuery = queryParams;
    }

    const client = this;

    return new Promise((resolve, reject) => {
      if (typeof requestBody === 'string' || requestBody instanceof String) {
        try {
          requestBody = JSON.parse(requestBody);
        } catch (error) {
          reject(
            new MidtransError(
              "fail to parse 'body parameters' string as JSON. Use JSON string or Object as 'body parameters'. with message: " +
                String(error),
            ),
          );
        }
      }

      if (typeof requestQuery === 'string' || requestQuery instanceof String) {
        try {
          requestQuery = JSON.parse(requestQuery);
        } catch (error) {
          reject(
            new MidtransError(
              "fail to parse 'query parameters' string as JSON. Use JSON string or Object as 'query parameters'. with message: " +
                String(error),
            ),
          );
        }
      }

      client
        .http_client({
          method: httpMethod,
          headers,
          url: apiUrl,
          data: requestBody,
          params: requestQuery,
          auth: {
            username: serverKey,
            password: '',
          },
        })
        .then((response) => {
          if (
            response.data.hasOwnProperty('status_code') &&
            response.data.status_code >= 400 &&
            response.data.status_code != 407
          ) {
            reject(
              new MidtransError(
                'Midtrans API is returning API error. HTTP status code: ' +
                  response.data.status_code +
                  '. API response: ' +
                  JSON.stringify(response.data),
                response.data.status_code,
                response.data,
                response,
              ),
            );
          }

          resolve(response.data);
        })
        .catch((error) => {
          if (typeof error.response !== 'undefined' && error.response.status >= 400) {
            reject(
              new MidtransError(
                'Midtrans API is returning API error. HTTP status code: ' +
                  error.response.status +
                  '. API response: ' +
                  JSON.stringify(error.response.data),
                error.response.status,
                error.response.data,
                error,
              ),
            );
          } else if (typeof error.response === 'undefined') {
            reject(
              new MidtransError(
                'Midtrans API request failed. HTTP response not found, likely connection failure, with message: ' +
                  JSON.stringify(error.message),
                null,
                null,
                error,
              ),
            );
          }

          reject(error);
        });
    });
  }
}

globalThis.HttpClient = HttpClient;
module.exports = HttpClient;

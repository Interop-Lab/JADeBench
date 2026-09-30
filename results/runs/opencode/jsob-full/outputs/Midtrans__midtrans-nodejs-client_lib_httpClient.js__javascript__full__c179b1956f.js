'use strict';

const axios = require('axios').default;
const querystring = require('querystring');

class MidtransError extends Error {
  constructor(message, httpStatusCode = null, apiResponse = null, rawHttpClientData = null) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.httpStatusCode = httpStatusCode;
    this.ApiResponse = apiResponse;
    this.rawHttpClientData = rawHttpClientData;
  }
}

class HttpClient {
  constructor(parent = {}) {
    this.parent = parent;
    this.http_client = axios.create();
  }

  request(httpMethod, serverKey, requestUrl, firstParameters = {}, secondParameters = {}) {
    let bodyParameters;
    let queryParameters;

    if (httpMethod.toLowerCase() === 'get') {
      queryParameters = firstParameters;
      bodyParameters = secondParameters;
    } else {
      bodyParameters = firstParameters;
      queryParameters = secondParameters;
    }

    return new Promise((resolve, reject) => {
      if (typeof bodyParameters === 'string' || bodyParameters instanceof String) {
        try {
          bodyParameters = JSON.parse(bodyParameters);
        } catch (error) {
          reject(new MidtransError(
            "fail to parse 'body parameters' string as JSON. Use JSON string or Object as 'body parameters'. with message: " + error
          ));
        }
      }

      if (typeof queryParameters === 'string' || queryParameters instanceof String) {
        try {
          queryParameters = JSON.parse(queryParameters);
        } catch (error) {
          reject(new MidtransError(
            "fail to parse 'query parameters' string as JSON. Use JSON string or Object as 'query parameters'. with message: " + error
          ));
        }
      }

      const config = {
        method: httpMethod,
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          'user-agent': 'midtransclient-nodejs/1.4.3'
        },
        url: requestUrl,
        data: bodyParameters,
        params: queryParameters,
        auth: {
          username: serverKey,
          password: ''
        }
      };

      this.http_client(config)
        .then((response) => {
          if (
            response.data &&
            response.data.hasOwnProperty('status_code') &&
            Number(response.data.status_code) >= 400 &&
            Number(response.data.status_code) <= 599
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
        .catch((error) => {
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
          } else if (typeof response === 'string') {
            reject(new MidtransError(
              'Midtrans API request failed. HTTP response not found, likely connection failure, with message: ' +
                JSON.stringify(error.message),
              null,
              null,
              error
            ));
          } else {
            reject(new MidtransError(
              'Midtrans API request failed. HTTP response not found, likely connection failure, with message: ' +
                JSON.stringify(error.message),
              null,
              null,
              error
            ));
          }
        });
    });
  }
}

module.exports = HttpClient;

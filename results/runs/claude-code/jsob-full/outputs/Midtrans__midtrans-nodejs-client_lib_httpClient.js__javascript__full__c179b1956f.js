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

  request(httpMethod, serverKey, requestUrl, bodyParameters = {}, queryParameters = {}) {
    const headers = {
      'content-type': 'application/json',
      accept: 'application/json',
      'user-agent': 'midtransclient-nodejs/1.4.3',
    };

    let requestBody = {};
    let requestQuery = {};

    if (httpMethod.toLowerCase() === 'get') {
      requestQuery = bodyParameters;
      requestBody = queryParameters;
    } else {
      requestBody = bodyParameters;
      requestQuery = queryParameters;
    }

    return new Promise((resolve, reject) => {
      if (typeof requestBody === 'string' || requestBody instanceof String) {
        try {
          requestBody = JSON.parse(requestBody);
        } catch (parseError) {
          reject(new MidtransError(
            `fail to parse 'body parameters' string as JSON. Use JSON string or Object as 'body parameters'. with message: ${parseError}`,
          ));
        }
      }

      if (typeof requestQuery === 'string' || requestQuery instanceof String) {
        try {
          requestQuery = JSON.parse(requestQuery);
        } catch (parseError) {
          reject(new MidtransError(
            `fail to parse 'query parameters' string as JSON. Use JSON string or Object as 'query parameters'. with message: ${parseError}`,
          ));
        }
      }

      const requestConfig = {
        method: httpMethod,
        headers,
        url: requestUrl,
        data: requestBody,
        params: requestQuery,
        auth: {
          username: serverKey,
          password: '',
        },
      };

      this.http_client(requestConfig)
        .then((response) => {
          if (
            response.headers['content-type'].includes('application/json')
            && response.status >= 400
            && response.status < 407
          ) {
            reject(new MidtransError(
              `Midtrans API is returning API error. HTTP status code: ${response.status}. API response: ${JSON.stringify(response.data)}`,
              response.status,
              response.data,
              response,
            ));
          }

          resolve(response.data);
        })
        .catch((error) => {
          const responseData = error.response;

          if (typeof responseData === 'object' && typeof responseData.data === 'object') {
            reject(new MidtransError(
              `Midtrans API is returning API error. HTTP status code: ${responseData.data.status_code}. API response: ${JSON.stringify(responseData.data)}`,
              responseData.data.status_code,
              responseData.data,
              responseData,
            ));
          } else if (typeof responseData === 'object' && typeof responseData.data === 'string') {
            reject(new MidtransError(
              `Midtrans API is returning API error. API response: ${JSON.stringify(error.response)}`,
              null,
              null,
              error.response,
            ));
          }

          reject(error);
        });
    });
  }
}

module.exports = HttpClient;

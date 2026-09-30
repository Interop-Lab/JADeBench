'use strict';

const axios = require('axios').default;
const querystring = require('querystring');

class MidtransError extends Error {
  constructor(message, httpStatusCode, ApiResponse, rawHttpClientData) {
    super(message);
    this.name = 'MidtransError';
    this.httpStatusCode = httpStatusCode;
    this.ApiResponse = ApiResponse;
    this.rawHttpClientData = rawHttpClientData;
  }
}

class HttpClient {
  constructor() {
    this.http_client = axios;
  }

  request(httpMethod, serverKey, requestUrl, firstParam) {
    const headers = {
      'content-type': 'application/json',
      accept: 'application/json',
      'user-agent': 'midtransclient-nodejs/1.3.1',
      authorization: 'Basic ' + Buffer.from(serverKey + ':').toString('base64')
    };

    let reqBody = {};

    if (httpMethod.toLowerCase() === 'get') {
      requestUrl += '?' + querystring.stringify(firstParam);
    } else {
      reqBody = firstParam;
    }

    return this.http_client({
      method: httpMethod,
      url: requestUrl,
      headers,
      data: reqBody
    })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        const response = error.response;

        if (response) {
          throw new MidtransError(
            `Midtrans API is returning API error. HTTP status code: \`${response.status}\`. API response: \`${JSON.stringify(response.data)}\``,
            response.status,
            response.data,
            response
          );
        }

        throw new MidtransError(
          `Failed to send request due to: ${error.message}`,
          null,
          null,
          error
        );
      });
  }
}

module.exports = HttpClient;

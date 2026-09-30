'use strict';

const querystring = require('querystring');
const axios = require('axios').default;

class MidtransError extends Error {
  constructor(message, statusCode = null, responseBody = null, rawResponse = null) {
    super(message);
    this.name = 'MidtransError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    this.rawResponse = rawResponse;
  }
}

class HttpClient {
  constructor(parent = {}) {
    this.parent = parent;
    this.http_client = axios.create();
  }

  request(method, username, url, data = {}, params = {}) {
    const config = {
      method,
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        'user-agent': 'midtransclient-nodejs/1.4.3'
      },
      url,
      data,
      params,
      auth: {
        username,
        password: ''
      }
    };

    return this.http_client(config)
      .then((response) => {
        if (response && response.status >= 400) {
          throw new MidtransError(
            `Midtrans API is returning API error. HTTP status code: ${response.status}. API response: ${JSON.stringify(response.data)}`,
            response.status,
            response.data,
            response
          );
        }
        return response.data;
      })
      .catch((error) => {
        if (error instanceof MidtransError) {
          throw error;
        }
        if (error && error.response) {
          const response = error.response;
          throw new MidtransError(
            `Midtrans API is returning API error. HTTP status code: ${response.status}. API response: ${JSON.stringify(response.data)}`,
            response.status,
            response.data,
            response
          );
        }
        throw new MidtransError(
          `Midtrans API request failed. HTTP response not found, likely connection failure, with message: ${JSON.stringify(error && error.message)}`,
          null,
          null,
          error
        );
      });
  }
}

module.exports = HttpClient;

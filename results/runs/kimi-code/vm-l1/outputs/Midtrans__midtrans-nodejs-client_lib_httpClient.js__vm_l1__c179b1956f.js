'use strict';

const axios = require('axios').default;

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
  constructor(parent = {}) {
    this.parent = parent;
    this.http_client = axios.create();
  }

  request(httpMethod, serverKey, requestUrl, requestData) {
    const method = httpMethod.toUpperCase();
    const payload = requestData || {};
    const requestConfig = {
      method: httpMethod,
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        'user-agent': 'midtransclient-nodejs/1.4.3',
      },
      url: requestUrl,
      data: method === 'GET' ? {} : payload,
      params: method === 'GET' ? payload : {},
      auth: {
        username: serverKey,
        password: '',
      },
    };

    return this.http_client(requestConfig)
      .then((response) => response.data)
      .catch((error) => {
        let message;
        let httpStatusCode = null;
        let apiResponse = null;
        let rawHttpClientData = error;

        if (error.response) {
          httpStatusCode = error.response.status;
          apiResponse = error.response.data;
          rawHttpClientData = error.response;
          message = `Midtrans API is returning API error. HTTP status code: ${httpStatusCode}. API response: ${JSON.stringify(apiResponse)}`;
        } else {
          message = `Midtrans API request failed. HTTP response not found, likely connection failure, with message: ${JSON.stringify(error.message)}`;
        }

        throw new MidtransError(message, httpStatusCode, apiResponse, rawHttpClientData);
      });
  }
}

module.exports = HttpClient;

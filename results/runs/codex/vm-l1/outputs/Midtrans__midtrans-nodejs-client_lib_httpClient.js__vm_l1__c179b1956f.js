'use strict';

const axios = require('axios').default;
require('querystring');

class MidtransError extends Error {
  constructor(message, httpStatusCode, apiResponse, rawHttpClientData) {
    super(message);
    this.name = this.constructor.name;
    this.httpStatusCode = httpStatusCode;
    this.ApiResponse = apiResponse;
    this.rawHttpClientData = rawHttpClientData;
  }
}

class HttpClient {
  constructor(parent) {
    this.parent = parent;
    this.http_client = axios.create();
  }

  request(httpMethod, serverKey, requestUrl, data) {
    if (data === undefined) data = {};

    const requestConfig = {
      method: httpMethod,
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        'user-agent': 'midtransclient-nodejs/1.4.3',
      },
      url: requestUrl,
      data: {},
      params: {},
      auth: {
        username: serverKey,
        password: '',
      },
    };

    if (httpMethod.toLowerCase() === 'get') {
      requestConfig.params = data;
    } else {
      requestConfig.data = data;
    }

    return this.http_client(requestConfig)
      .then((response) => {
        const apiResponse = response.data;
        if (apiResponse.hasOwnProperty('status_code') && apiResponse.status_code >= 400) {
          const message = 'Midtrans API is returning API error. HTTP status code: '
            + apiResponse.status_code + '. API response: ' + JSON.stringify(apiResponse);
          throw new MidtransError(message, apiResponse.status_code, apiResponse, response);
        }
        return apiResponse;
      })
      .catch((error) => {
        if (error instanceof MidtransError) throw error;

        if (error.response && error.response.status >= 400) {
          const apiResponse = error.response.data;
          const message = 'Midtrans API is returning API error. HTTP status code: '
            + error.response.status + '. API response: ' + JSON.stringify(apiResponse);
          throw new MidtransError(message, error.response.status, apiResponse, error.response);
        }

        if (!error.response) {
          const message = 'Midtrans API request failed. HTTP response not found, likely connection failure, with message: '
            + JSON.stringify(error.message);
          throw new MidtransError(message, null, null, error);
        }

        throw error;
      });
  }
}

module.exports = HttpClient;

'use strict';

const axios = require('axios').default;
const querystring = require('querystring');

class MidtransError extends Error {
  constructor(message, statusCode, rawResponse) {
    super(message);
    this.name = 'MidtransError';
    this.statusCode = statusCode;
    this.rawResponse = rawResponse;
  }
}

class HttpClient {
  constructor() {
    this.http = axios.create();
  }

  request(method, url, data, headers) {
    const config = {
      method: method.toLowerCase(),
      url: url,
      headers: headers,
      data: data
    };

    if (method.toLowerCase() === 'get' && data) {
      config.params = data;
      config.paramsSerializer = params => querystring.stringify(params);
    }

    return this.http.request(config).catch(error => {
      let response = null;
      if (error.response) {
        response = error.response.data;
      }
      throw new MidtransError(
        error.message,
        error.response ? error.response.status : null,
        response
      );
    });
  }
}

module.exports = { MidtransError, HttpClient };

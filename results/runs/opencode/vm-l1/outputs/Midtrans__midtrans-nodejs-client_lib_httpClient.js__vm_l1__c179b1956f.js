'use strict';

const axiosModule = require('axios');
const axios = axiosModule.default || axiosModule;

class MidtransError extends Error {
  constructor(message, httpStatusCode = null, apiResponse = null, rawHttpClientData = null) {
    super(message);
    this.name = 'MidtransError';
    this.httpStatusCode = httpStatusCode;
    this.ApiResponse = apiResponse;
    this.rawHttpClientData = rawHttpClientData;
  }
}

class HttpClient {
  constructor(parent = {}) {
    this.parent = parent;
    this.http_client = axios;
  }

  async request(httpMethod, serverKey, requestUrl, requestData) {
    const isGetRequest = httpMethod.toLowerCase() === 'get';
    const requestConfig = {
      method: httpMethod,
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        'user-agent': 'midtransclient-nodejs/1.4.3',
      },
      url: requestUrl,
      data: isGetRequest ? {} : requestData,
      params: isGetRequest ? requestData : {},
      auth: {
        username: serverKey,
        password: '',
      },
    };

    try {
      const response = await this.http_client(requestConfig);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        throw new MidtransError(
          `Midtrans API is returning API error. HTTP status code: ${status}. API response: ${JSON.stringify(data)}`,
          status,
          data,
          error.response,
        );
      }

      throw new MidtransError(
        `Midtrans API request failed. HTTP response not found, likely connection failure, with message: "${error.message}"`,
        null,
        null,
        error,
      );
    }
  }
}

module.exports = HttpClient;

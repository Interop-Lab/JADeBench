'use strict';

const axios = require('axios').default;

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

  request(method, serverKey, url, bodyParameters = {}, queryParameters = {}) {
    let requestBody = {};
    let requestQuery = {};

    if (method.toLowerCase() === 'get') {
      requestQuery = bodyParameters;
      requestBody = queryParameters;
    } else {
      requestBody = bodyParameters;
      requestQuery = queryParameters;
    }

    if (typeof requestQuery === 'string' || requestQuery instanceof String) {
      try {
        requestQuery = JSON.parse(requestQuery);
      } catch (error) {
        return Promise.reject(new MidtransError(
          "fail to parse 'query parameters' string as JSON. Use JSON string or Object as 'query parameters'. with message: " + error,
        ));
      }
    }

    if (typeof requestBody === 'string' || requestBody instanceof String) {
      try {
        requestBody = JSON.parse(requestBody);
      } catch (error) {
        return Promise.reject(new MidtransError(
          "fail to parse 'body parameters' string as JSON. Use JSON string or Object as 'body parameters'. with message: " + error,
        ));
      }
    }

    const config = {
      method,
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        'user-agent': 'midtransclient-nodejs/1.4.3',
      },
      url,
      data: requestBody,
      params: requestQuery,
      auth: {
        username: serverKey,
        password: '',
      },
    };

    return this.http_client(config).then((response) => {
      const responseData = response.data;
      if (
        typeof responseData === 'object' &&
        responseData.status_code >= 400 &&
        responseData.status_code <= 599
      ) {
        throw new MidtransError(
          `Midtrans API is returning API error. HTTP status code: ${responseData.status_code}. API response: ${JSON.stringify(responseData)}`,
          responseData.status_code,
          responseData,
          response,
        );
      }
      return responseData;
    }).catch((error) => {
      if (error instanceof MidtransError) {
        throw error;
      }

      if (error.response) {
        const response = error.response;
        const responseData = response.data;
        throw new MidtransError(
          `Midtrans API is returning API error. HTTP status code: ${response.status}. API response: ${JSON.stringify(responseData)}`,
          response.status,
          responseData,
          response,
        );
      }

      if (typeof error.message === 'string') {
        throw new MidtransError(
          `Midtrans API request failed. HTTP response not found, likely connection failure, with message: ${JSON.stringify(error.message)}`,
          null,
          null,
          error,
        );
      }

      throw error;
    });
  }
}

module.exports = HttpClient;

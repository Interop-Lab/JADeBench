'use strict';

const axios = require('axios');
const querystring = require('querystring');
const MidtransError = require('../work/Midtrans__midtrans-nodejs-client/lib/midtransError.js');

class HttpClient {
  constructor() {}

  request(axiosConfig, requestBody, requestOptions) {
    const config = Object.assign({}, axiosConfig);
    const data = requestBody;
    const options = requestOptions || {};

    if (options.rawBody) {
      config.data = data;
    } else {
      config.data = querystring.stringify(data);
    }

    config.headers = Object.assign({}, config.headers, {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    });

    return axios(config)
      .then(response => response.data)
      .catch(error => {
        if (error.response) {
          throw new MidtransError(
            error.response.data,
            error.response.status,
            error.response.headers
          );
        }
        throw error;
      });
  }
}

module.exports = HttpClient;

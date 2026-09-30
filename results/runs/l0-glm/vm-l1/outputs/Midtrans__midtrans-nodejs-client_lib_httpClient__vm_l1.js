var MidtransError=require_midtransError();

class HttpClient {
  constructor() {}

  request(param) {
    let self = this;
    return new Promise(function(resolve, reject) {
      let headers = {
        'content-type': 'application/json',
        'accept': 'application/json'
      };
      if (param.serverKey) {
        let auth = Buffer.from(param.serverKey + ':').toString('base64');
        headers.authorization = 'Basic ' + auth;
      }
      axios({
        method: param.requestOptions.method,
        url: param.requestOptions.url,
        data: param.requestOptions.data,
        headers: headers
      }).then(function(response) {
        resolve(response.data);
      }).catch(function(error) {
        if (error.response) {
          reject(new MidtransError({
            message: error.response.data,
            httpStatusCode: error.response.status
          }));
        } else {
          reject(error);
        }
      });
    });
  }
}

module.exports = HttpClient;

'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x41e7ff, _0x4c72c8) => function _0x44c4a0() {
  if (!_0x4c72c8) {
    (0, _0x41e7ff[__getOwnPropNames(_0x41e7ff)[0]])((_0x4c72c8 = {
      exports: {}
    }).exports, _0x4c72c8);
  }
  return _0x4c72c8.exports;
};
var require_midtransError = __commonJS({
  "../work/Midtrans__midtrans-nodejs-client/lib/midtransError.js"(_0x399842, _0x5a281c) {
    var _0x4f0987 = class extends Error {
      constructor(_0x17836f, _0x26a66c = null, _0x434915 = null, _0x1e5adc = null) {
        super(_0x17836f);
        this.name = this.constructor.name;
        this.httpStatusCode = _0x26a66c;
        this.ApiResponse = _0x434915;
        this.rawHttpClientData = _0x1e5adc;
        Error.captureStackTrace(this, this.constructor);
      }
    };
    _0x5a281c.exports = _0x4f0987;
  }
});
var axios = require("axios").default;
var querystring = require("querystring");
var MidtransError = require_midtransError();
var HttpClient = class {
  constructor(_0x156a32 = {}) {
    this.parent = _0x156a32;
    this.http_client = axios.create();
  }
  request(_0x390855, _0x1e3cd3, _0x54bfc1, _0x389dff = {}, _0x159d3a = {}) {
    let _0x47e202 = {
      "content-type": "application/json",
      accept: "application/json",
      "user-agent": "midtransclient-nodejs/1.4.3"
    };
    let _0x8015bc = {};
    let _0x3a3288 = {};
    if (_0x390855.toLowerCase() == "get") {
      _0x3a3288 = _0x389dff;
      _0x8015bc = _0x159d3a;
    } else {
      _0x8015bc = _0x389dff;
      _0x3a3288 = _0x159d3a;
    }
    let _0x572801 = this;
    return new Promise(function (_0x3a5266, _0x53ee42) {
      if (typeof _0x8015bc === "string" || _0x8015bc instanceof String) {
        try {
          _0x8015bc = JSON.parse(_0x8015bc);
        } catch (_0x2011de) {
          _0x53ee42(new MidtransError("fail to parse 'body parameters' string as JSON. Use JSON string or Object as 'body parameters'. with message: " + _0x2011de));
        }
      }
      if (typeof _0x3a3288 === "string" || _0x3a3288 instanceof String) {
        try {
          _0x3a3288 = JSON.parse(_0x3a3288);
        } catch (_0x24c2ac) {
          _0x53ee42(new MidtransError("fail to parse 'query parameters' string as JSON. Use JSON string or Object as 'query parameters'. with message: " + _0x24c2ac));
        }
      }
      var _0xf65e7d = {
        username: _0x1e3cd3,
        password: ""
      };
      var _0x2a2685 = {
        method: _0x390855,
        headers: _0x47e202,
        url: _0x54bfc1,
        data: _0x8015bc,
        params: _0x3a3288,
        auth: _0xf65e7d
      };
      let _0x25d873 = _0x572801.http_client(_0x2a2685).then(function (_0x4a5d2c) {
        if (_0x4a5d2c.data.hasOwnProperty("status_code") && _0x4a5d2c.data.status_code >= 400 && _0x4a5d2c.data.status_code != 407) {
          _0x53ee42(new MidtransError("Midtrans API is returning API error. HTTP status code: " + _0x4a5d2c.data.status_code + ". API response: " + JSON.stringify(_0x4a5d2c.data), _0x4a5d2c.data.status_code, _0x4a5d2c.data, _0x4a5d2c));
        }
        _0x3a5266(_0x4a5d2c.data);
      }).catch(function (_0x1438ef) {
        let _0x4e0e81 = _0x1438ef.response;
        if (typeof _0x4e0e81 !== "undefined" && _0x4e0e81.status >= 400) {
          _0x53ee42(new MidtransError("Midtrans API is returning API error. HTTP status code: " + _0x4e0e81.status + ". API response: " + JSON.stringify(_0x4e0e81.data), _0x4e0e81.status, _0x4e0e81.data, _0x4e0e81));
        } else if (typeof _0x4e0e81 === "undefined") {
          _0x53ee42(new MidtransError("Midtrans API request failed. HTTP response not found, likely connection failure, with message: " + JSON.stringify(_0x1438ef.message), null, null, _0x1438ef));
        }
        _0x53ee42(_0x1438ef);
      });
    });
  }
};
module.exports = HttpClient;
'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x54d8b8, _0x59fc89) => function _0x198e38() {
  if (!_0x59fc89) {
    (0, _0x54d8b8[__getOwnPropNames(_0x54d8b8)[0]])((_0x59fc89 = {
      exports: {}
    }).exports, _0x59fc89);
  }
  return _0x59fc89.exports;
};
var require_jsonapiUtil = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js"(_0x27a595, _0xf23927) {
    'use strict';

    "use strict";
    var _0x52654e = require("json-api-serializer");
    var _0x33fee2 = new _0x52654e({
      jsonapiObject: false
    });
    var _0x100834 = {
      UserType: "users",
      AppType: "apps",
      LogType: "logs"
    };
    _0x33fee2.register(_0x100834.UserType, {});
    _0x33fee2.register(_0x100834.AppType, {});
    const _0x865f05 = {
      topLevelMeta: function (_0x2469ae, _0x116a81) {
        const _0x88e160 = {};
        _0x88e160.filters = _0x116a81;
        return _0x88e160;
      }
    };
    _0x33fee2.register(_0x100834.LogType, _0x865f05);
    _0x100834.Serializer = _0x33fee2;
    _0xf23927.exports = _0x100834;
  }
});
var require_npmUpdates = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/npmUpdates.js"(_0xfa8d8c, _0x215a07) {
    'use strict';

    var _0x156c20 = require("axios");
    var _0x12ba02 = {};
    _0x12ba02.fetchLatestVersion = async function (_0x1fc53a) {
      const _0x181b27 = await _0x156c20({
        method: "get",
        url: "https://registry.npmjs.org/" + _0x1fc53a + "/latest"
      });
      if (_0x181b27.status === 200 && _0x181b27.data) {
        if (_0x181b27.data.version) {
          return _0x181b27.data.version;
        } else {
          return "0.0.0";
        }
      } else {
        throw new Error("badRequest");
      }
    };
    _0x215a07.exports = _0x12ba02;
  }
});
var require_storageConnection = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/storageConnection.js"(_0x26e951, _0x7e8050) {
    'use strict';

    var _0x1aec8b = null;
    function _0x2bb1b4(_0x497aca) {
      if (!_0x1aec8b) {
        _0x1aec8b = _0x497aca;
      }
      return _0x1aec8b;
    }
    function _0x3bbad3() {
      if (!_0x1aec8b) {
        throw new Error("Storage connection has not been initialized.");
      }
      return _0x1aec8b;
    }
    const _0x55720a = {
      initializeStorageConnection: _0x2bb1b4,
      getStorageConnection: _0x3bbad3
    };
    _0x7e8050.exports = _0x55720a;
  }
});
const _0x1fd683 = {
  "../work/errsole__errsole.js/package.json": function (_0x3afb58, _0x1b1146) {
    const _0x4b702 = {};
    _0x4b702.name = "errsole";
    _0x4b702.version = "2.18.2";
    _0x4b702.description = "Collect, Store, and Visualize Logs with a Single Module";
    _0x4b702.keywords = ["log", "logs", "logging", "logger"];
    _0x4b702.homepage = "https://github.com/errsole/errsole.js";
    _0x4b702.bugs = {};
    _0x4b702.license = "MIT";
    _0x4b702.author = "Rishi Kumar <rishi@errsole.com>";
    _0x4b702.contributors = ["Rishi Kumar <rishi@errsole.com>", "Venkateswarlu Ganji <venki@errsole.com>", "Sai Kumar <sai@errsole.com>"];
    _0x4b702.files = ["docs", "examples", "lib", "types"];
    _0x4b702.main = "lib/errsole.js";
    _0x4b702.types = "types/errsole.d.ts";
    _0x4b702.scripts = {};
    _0x4b702.dependencies = {};
    _0x4b702.devDependencies = {};
    _0x4b702.bugs.url = "https://github.com/errsole/errsole.js/issues";
    _0x4b702.scripts["build:web"] = "NODE_OPTIONS=--openssl-legacy-provider webpack --config lib/web/webpack/website.config.js";
    _0x4b702.scripts.setup = "npm install && npm install errsole-sqlite sqlite3 --no-save && npm run build:web";
    _0x4b702.scripts.dev = "node examples/index.js";
    _0x4b702.scripts.test = "jest --coverage";
    _0x4b702.scripts.coveralls = "jest --coverage && cat ./coverage/lcov.info | coveralls";
    _0x4b702.dependencies["@ant-design/icons"] = "^5.5.1";
    _0x4b702.dependencies["@hapi/h2o2"] = "^10.0.4";
    _0x4b702.dependencies.ajv = "^8.17.1";
    _0x4b702.dependencies["ajv-keywords"] = "^5.1.0";
    _0x4b702.dependencies.axios = "^1.6.8";
    _0x4b702.dependencies["body-parser"] = "^1.20.2";
    _0x4b702.dependencies.dompurify = "^3.1.7";
    _0x4b702.dependencies["errsole-sqlite"] = "^2.2.0";
    _0x4b702.dependencies.express = "^4.17.1";
    _0x4b702.dependencies["express-static-gzip"] = "^2.1.7";
    _0x4b702.dependencies["http-proxy-middleware"] = "^3.0.0";
    _0x4b702.dependencies.immutable = "^4.3.7";
    _0x4b702.dependencies["json-api-serializer"] = "^2.6.6";
    _0x4b702.dependencies.jsonwebtoken = "^9.0.2";
    _0x4b702.dependencies["koa-proxies"] = "^0.12.4";
    _0x4b702.dependencies.nodemailer = "^6.9.13";
    _0x4b702.dependencies["strip-ansi"] = "^6.0.1";
    _0x4b702.dependencies.uuid = "^10.0.0";
    _0x4b702.devDependencies["@babel/core"] = "^7.24.5";
    _0x4b702.devDependencies["@babel/preset-env"] = "^7.24.0";
    _0x4b702.devDependencies["@babel/preset-react"] = "^7.23.3";
    _0x4b702.devDependencies["@jest/globals"] = "^29.7.0";
    _0x4b702.devDependencies["@microlink/react-json-view"] = "^1.23.3";
    _0x4b702.devDependencies.antd = "^5.22.2";
    _0x4b702.devDependencies.babel = "^6.23.0";
    _0x4b702.devDependencies["babel-core"] = "^6.26.3";
    _0x4b702.devDependencies["babel-loader"] = "^9.1.3";
    _0x4b702.devDependencies["babel-preset-es2015"] = "^6.24.1";
    _0x4b702.devDependencies["babel-preset-react"] = "^6.24.1";
    _0x4b702.devDependencies["compression-webpack-plugin"] = "^11.1.0";
    _0x4b702.devDependencies.coveralls = "^3.1.1";
    _0x4b702.devDependencies["css-loader"] = "^7.1.2";
    _0x4b702.devDependencies.history = "^5.3.0";
    _0x4b702.devDependencies.jest = "^29.7.0";
    _0x4b702.devDependencies.moment = "^2.30.1";
    _0x4b702.devDependencies.react = "^18.3.1";
    _0x4b702.devDependencies["react-dom"] = "^18.3.1";
    _0x4b702.devDependencies["react-redux"] = "^9.1.2";
    _0x4b702.devDependencies["react-router-dom"] = "^6.28.0";
    _0x4b702.devDependencies.redux = "^5.0.1";
    _0x4b702.devDependencies["redux-thunk"] = "^3.1.0";
    _0x4b702.devDependencies["style-loader"] = "^4.0.0";
    _0x4b702.devDependencies.supertest = "^7.0.0";
    _0x4b702.devDependencies["universal-cookie"] = "^7.1.0";
    _0x4b702.devDependencies.webpack = "^5.90.3";
    _0x4b702.devDependencies["webpack-cli"] = "^5.1.4";
    _0x4b702.devDependencies["webpack-merge"] = "^6.0.1";
    _0x1b1146.exports = _0x4b702;
  }
};
var require_package = __commonJS(_0x1fd683);
var require_helpers = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/helpers.js"(_0x24ab71) {
    'use strict';

    var {
      v4: _0x2c614f
    } = require("uuid");
    var {
      getStorageConnection: _0xc2c46
    } = require_storageConnection();
    var _0x290d9f;
    _0x24ab71.extractAttributes = _0x31b83b => {
      if (_0x31b83b && _0x31b83b.data && _0x31b83b.data.attributes) {
        return _0x31b83b.data.attributes;
      } else {
        return {};
      }
    };
    _0x24ab71.SlackUrl = _0x474aca => {
      const _0x265801 = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
      return _0x265801.test(_0x474aca);
    };
    _0x24ab71.addJWTSecret = async () => {
      try {
        const _0x1cb618 = _0xc2c46();
        const _0x16e5eb = await _0x1cb618.getConfig("jwtSecret");
        if (_0x16e5eb && _0x16e5eb.item && _0x16e5eb.item.key === "jwtSecret") {
          _0x290d9f = _0x16e5eb.item.value;
        } else {
          const _0x1dc02f = _0x2c614f();
          const _0x3bdf97 = await _0x1cb618.setConfig("jwtSecret", _0x1dc02f);
          if (_0x3bdf97 && _0x3bdf97.item && _0x3bdf97.item.key === "jwtSecret") {
            _0x290d9f = _0x3bdf97.item.value;
          }
        }
        return _0x290d9f || false;
      } catch (_0xb48b1b) {
        console.error("An error occurred in addJWTSecret:", _0xb48b1b);
        throw _0xb48b1b;
      }
    };
    _0x24ab71.getJWTSecret = () => {
      if (_0x290d9f) {
        return _0x290d9f;
      } else {
        return false;
      }
    };
  }
});
var require_alerts = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/alerts.js"(_0x17287e) {
    'use strict';

    var {
      getStorageConnection: _0x4542ce
    } = require_storageConnection();
    var _0x250f6b = require("axios");
    var _0x410d2e = require("nodemailer");
    var _0x1c338e = require("crypto");
    _0x17287e.customLoggerAlert = async function (_0x2e2563, _0x3e2bda, _0x451916, _0x55f50d) {
      try {
        const {
          isDuplicateAlert: _0x240a28,
          todayCount: _0x182926
        } = await _0x5642bd(_0x2e2563, _0x3e2bda, _0x451916);
        if (_0x240a28) {
          return false;
        }
        await _0x46b921.sendAlert(_0x2e2563, "Alert", _0x3e2bda, _0x451916, _0x182926, _0x55f50d);
        await _0x3adb63.sendAlert(_0x2e2563, "Alert", _0x3e2bda, _0x451916, _0x182926, _0x55f50d);
        return true;
      } catch (_0x4a8373) {
        console.error("Error in customLoggerAlert:", _0x4a8373);
        return false;
      }
    };
    _0x17287e.handleUncaughtExceptions = async function (_0x3d443c, _0x14fffd, _0x48d888, _0x182b21) {
      try {
        const {
          isDuplicateAlert: _0x49a52a,
          todayCount: _0x2b7f34
        } = await _0x5642bd(_0x3d443c, _0x14fffd, _0x48d888);
        if (_0x49a52a) {
          return false;
        }
        await _0x46b921.sendAlert(_0x3d443c, "Uncaught Exception", _0x14fffd, _0x48d888, _0x2b7f34, _0x182b21);
        await _0x3adb63.sendAlert(_0x3d443c, "Uncaught Exception", _0x14fffd, _0x48d888, _0x2b7f34, _0x182b21);
        return true;
      } catch (_0x5a933f) {
        console.error("Error in handleUncaughtExceptions:", _0x5a933f);
        return false;
      }
    };
    _0x17287e.testSlackAlert = async function (_0x524d05, _0x1e918f) {
      try {
        const _0x141aee = await _0x46b921.sendAlert(_0x524d05, "Test", _0x1e918f);
        return _0x141aee;
      } catch (_0x1ccfdf) {
        console.error("Error in testSlackAlert:", _0x1ccfdf);
        return false;
      }
    };
    _0x17287e.testEmailAlert = async function (_0x27707a, _0x4f3250) {
      try {
        const _0x1e2011 = await _0x3adb63.sendAlert(_0x27707a, "Test", _0x4f3250);
        return _0x1e2011;
      } catch (_0x3af6) {
        console.error("Error in testEmailAlert:", _0x3af6);
        return false;
      }
    };
    var _0x46b921 = {};
    _0x46b921.sendAlert = async function (_0x552e9d, _0x5bd2a5, _0x3517bd, _0x500a87, _0x2708de, _0x5178b2) {
      try {
        const _0x3d0105 = _0x4542ce();
        const _0x886d02 = await _0x3d0105.getConfig("slackIntegration");
        if (_0x886d02 && _0x886d02.item) {
          const _0x1f4a02 = JSON.parse(_0x886d02.item.value);
          if (!_0x1f4a02.status) {
            return false;
          }
          const _0x3ee260 = await _0x3d0105.getConfig("alertUrl");
          let _0x2556f7;
          if (_0x3ee260 && _0x3ee260.item && _0x500a87) {
            const _0x35d2be = JSON.parse(_0x3ee260.item.value);
            let _0x4d682e;
            if (!_0x5178b2) {
              _0x4d682e = new Date(new Date().getTime() + 2000).toISOString();
            } else {
              _0x4d682e = _0x2f85bb(_0x5178b2);
              _0x4d682e = _0x4d682e.toISOString();
            }
            _0x2556f7 = _0x35d2be.url + "#/logs?errsole_log_id=" + _0x500a87 + "&timestamp=" + _0x4d682e;
          }
          const _0x415a24 = _0x1f4a02.url;
          const _0x4d2bff = _0x5b146c(_0x552e9d, _0x5bd2a5, _0x3517bd, _0x2556f7, _0x2708de);
          _0x4d2bff.username = _0x1f4a02.username || "Errsole";
          _0x4d2bff.icon_url = _0x1f4a02.icon_url || "https://avatars.githubusercontent.com/u/84983840";
          const _0x4b73ca = _0x250f6b.post(_0x415a24, _0x4d2bff);
          const _0x4844f1 = new Promise((_0x10316a, _0x3257ee) => {
            setTimeout(() => {
              _0x3257ee(new Error("Slack send timed out"));
            }, 5000);
          });
          try {
            await Promise.race([_0x4b73ca, _0x4844f1]);
          } catch (_0x1ffc75) {
            return false;
          }
          return true;
        }
        return false;
      } catch (_0x1e1606) {
        console.error("Failed to send slack alert:", _0x1e1606);
        return false;
      }
    };
    function _0x5b146c(_0x4ca339, _0x16f667, _0x518052 = {}, _0x225831, _0x4a6bcc) {
      const _0x50139d = {
        blocks: []
      };
      _0x50139d.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: " :warning: *Errsole: " + _0x16f667 + "*"
        }
      });
      if (_0x518052.appName) {
        const _0x4ee0d8 = {
          type: "rich_text",
          elements: [{
            type: "rich_text_section",
            elements: [{
              type: "text",
              text: "App Name: ",
              style: {
                bold: true
              }
            }, {
              type: "text",
              text: _0x518052.appName
            }]
          }]
        };
        _0x50139d.blocks.push(_0x4ee0d8);
      }
      if (_0x518052.environmentName) {
        const _0x57b65b = {
          type: "rich_text",
          elements: [{
            type: "rich_text_section",
            elements: [{
              type: "text",
              text: "Environment Name: ",
              style: {
                bold: true
              }
            }, {
              type: "text",
              text: _0x518052.environmentName
            }]
          }]
        };
        _0x50139d.blocks.push(_0x57b65b);
      }
      if (_0x518052.serverName) {
        const _0x5f42b2 = {
          type: "rich_text",
          elements: [{
            type: "rich_text_section",
            elements: [{
              type: "text",
              text: "Server Name: ",
              style: {
                bold: true
              }
            }, {
              type: "text",
              text: _0x518052.serverName
            }]
          }]
        };
        _0x50139d.blocks.push(_0x5f42b2);
      }
      const _0x13bfbf = {
        type: "rich_text",
        elements: [{
          type: "rich_text_preformatted",
          elements: [{
            type: "text",
            text: _0x4ca339
          }]
        }]
      };
      _0x50139d.blocks.push(_0x13bfbf);
      if (_0x4a6bcc) {
        if (_0x16f667 === "Alert") {
          _0x50139d.blocks.push({
            type: "section",
            text: {
              type: "mrkdwn",
              text: "This alert has occurred *" + _0x4a6bcc + " time" + (_0x4a6bcc > 1 ? "s" : "") + " today*."
            }
          });
        } else {
          _0x50139d.blocks.push({
            type: "section",
            text: {
              type: "mrkdwn",
              text: "This error has occurred *" + _0x4a6bcc + " time" + (_0x4a6bcc > 1 ? "s" : "") + " today*."
            }
          });
        }
      }
      if (_0x225831) {
        _0x50139d.blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: "<" + _0x225831 + "|Click here> to view the logs in the Errsole dashboard."
          }
        });
      }
      if (_0x16f667 === "Alert") {
        const _0xc481b2 = {
          type: "section",
          text: {}
        };
        _0xc481b2.text.type = "mrkdwn";
        _0xc481b2.text.text = "_Note:_\n• _You will not receive another notification for this alert on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._";
        _0x50139d.blocks.push(_0xc481b2);
      } else if (_0x16f667 !== "Test") {
        const _0x1edc3a = {
          type: "section",
          text: {}
        };
        _0x1edc3a.text.type = "mrkdwn";
        _0x1edc3a.text.text = "_Note:_\n• _You will not receive another notification for this error on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._";
        _0x50139d.blocks.push(_0x1edc3a);
      }
      _0x50139d.blocks.push({
        type: "divider"
      });
      return _0x50139d;
    }
    var _0x3adb63 = {
      transporter: null
    };
    _0x3adb63.emailTransport = async function () {
      try {
        if (this.transporter === null) {
          const _0x50e611 = _0x4542ce();
          const _0x33df03 = await _0x50e611.getConfig("emailIntegration");
          if (_0x33df03 && _0x33df03.item) {
            const _0xf88cff = JSON.parse(_0x33df03.item.value);
            this.transporter = _0x410d2e.createTransport({
              pool: true,
              maxConnections: 5,
              maxMessages: 100,
              rateLimit: 10,
              host: _0xf88cff.host,
              port: parseInt(_0xf88cff.port),
              secure: parseInt(_0xf88cff.port) === 465,
              auth: {
                user: _0xf88cff.username,
                pass: _0xf88cff.password
              }
            });
          }
        }
      } catch (_0x6b89f8) {
        console.error("Failed to create email transporter: ", _0x6b89f8);
        this.transporter = null;
      }
    };
    _0x3adb63.sendAlert = async function (_0x18ccce, _0x109645, _0x24aa32, _0x4b61e9, _0x3b458f, _0x37ac99) {
      try {
        await _0x3adb63.emailTransport();
        if (this.transporter !== null) {
          const _0x263457 = _0x4542ce();
          const _0x80915e = await _0x263457.getConfig("emailIntegration");
          if (_0x80915e && _0x80915e.item) {
            const _0x3e731f = JSON.parse(_0x80915e.item.value);
            if (!_0x3e731f.status) {
              return false;
            }
            const _0x20352d = await _0x263457.getConfig("alertUrl");
            let _0x4cebef;
            if (_0x20352d && _0x20352d.item && _0x4b61e9) {
              const _0x4d4131 = JSON.parse(_0x20352d.item.value);
              let _0x4ce850;
              if (!_0x37ac99) {
                _0x4ce850 = new Date(new Date().getTime() + 2000).toISOString();
              } else {
                _0x4ce850 = _0x2f85bb(_0x37ac99);
                _0x4ce850 = _0x4ce850.toISOString();
              }
              _0x4cebef = _0x4d4131.url + "#/logs?errsole_log_id=" + _0x4b61e9 + "&timestamp=" + _0x4ce850;
            }
            let _0x1b46b2;
            let _0x3d01d1 = "";
            if (_0x24aa32.appName && _0x24aa32.environmentName) {
              _0x1b46b2 = "Errsole: " + _0x109645 + " (" + _0x24aa32.appName + " app, " + _0x24aa32.environmentName + " environment)";
              _0x3d01d1 = "<p><b>App Name:</b> " + _0x24aa32.appName + "</p>\n          <p><b>Environment Name:</b> " + _0x24aa32.environmentName + "</p>";
            } else if (_0x24aa32.appName) {
              _0x1b46b2 = "Errsole: " + _0x109645 + " (" + _0x24aa32.appName + " app)";
              _0x3d01d1 = "<p><b>App Name:</b> " + _0x24aa32.appName + "</p>";
            } else if (_0x24aa32.environmentName) {
              _0x1b46b2 = "Errsole: " + _0x109645 + " (" + _0x24aa32.environmentName + " environment)";
              _0x3d01d1 = "<p><b>Environment Name:</b> " + _0x24aa32.environmentName + "</p>";
            } else {
              _0x1b46b2 = "Errsole: " + _0x109645;
            }
            if (_0x24aa32.serverName) {
              _0x3d01d1 += "<p><b>Server Name:</b> " + _0x24aa32.serverName + "</p>";
            }
            _0x18ccce = _0x3d01d1 + "<pre style=\"border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;\">" + _0x18ccce + "</pre>";
            if (_0x3b458f) {
              if (_0x109645 === "Alert") {
                _0x18ccce = _0x18ccce + "<p>This alert has occurred <b>" + _0x3b458f + " time" + (_0x3b458f > 1 ? "s" : "") + " today</b>.</p>";
              } else {
                _0x18ccce = _0x18ccce + "<p>This error has occurred <b>" + _0x3b458f + " time" + (_0x3b458f > 1 ? "s" : "") + " today</b>.</p>";
              }
            }
            if (_0x4cebef) {
              _0x18ccce = _0x18ccce + "<p><a href=\"" + _0x4cebef + "\">Click here</a> to view the logs in the Errsole dashboard.</p>";
            }
            if (_0x109645 === "Alert") {
              _0x18ccce = _0x18ccce + "<br/><p style=\"margin:0px;font-size:small\"><i>Note:<ul style=\"margin:0px;padding:0px 5px;\"><li>You will not receive another notification for this alert on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>";
            } else {
              _0x18ccce = _0x18ccce + "<br/><p style=\"margin:0px;font-size:small\"><i>Note:<ul style=\"margin:0px;padding:0px 5px;\"><li>You will not receive another notification for this error on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>";
            }
            const _0x4ffda5 = {
              from: _0x3e731f.sender,
              to: _0x3e731f.receivers,
              subject: _0x1b46b2,
              html: _0x18ccce
            };
            const _0x1d631f = this.transporter.sendMail(_0x4ffda5);
            const _0x53f88e = new Promise((_0x3850da, _0x28e907) => {
              setTimeout(() => {
                _0x28e907(new Error("Email send timed out"));
              }, 5000);
            });
            try {
              await Promise.race([_0x1d631f, _0x53f88e]);
            } catch (_0x3c7a25) {
              console.log(_0x3c7a25);
              return false;
            }
            return true;
          }
        }
        return false;
      } catch (_0x45bfa3) {
        console.error("Failed to send email alert:", _0x45bfa3);
        return false;
      }
    };
    _0x17287e.clearEmailTransport = async function () {
      _0x3adb63.transporter = null;
      return true;
    };
    var _0x5642bd = async (_0x1ba928, _0x2f341d, _0x47688b) => {
      let _0x26c4f2 = false;
      let _0x4022ad = 0;
      const _0x546351 = _0xdeee93 => {
        if (typeof _0xdeee93 === "string") {
          return _0xdeee93;
        }
        try {
          return JSON.stringify(_0xdeee93);
        } catch {
          return String(_0xdeee93);
        }
      };
      const _0x430a1d = _0x4542ce();
      if (_0x430a1d && _0x430a1d.insertNotificationItem) {
        const _0x1519cc = _0x546351(_0x1ba928) + "|" + _0x546351(_0x2f341d);
        const _0x48fab9 = _0x1c338e.createHash("sha256").update(_0x1519cc).digest("hex");
        const _0x4894a7 = {
          errsole_id: _0x47688b,
          hashed_message: _0x48fab9,
          hostname: _0x2f341d.serverName
        };
        const _0x2baab3 = _0x4894a7;
        try {
          const _0x351608 = await _0x430a1d.insertNotificationItem(_0x2baab3);
          if (_0x351608) {
            const _0x26f076 = _0x351608.previousNotificationItem;
            _0x4022ad = _0x351608.todayNotificationCount;
            if (_0x26f076) {
              const _0xfff66e = new Date();
              const _0x346e48 = new Date(_0x26f076.created_at);
              if (_0xfff66e.getUTCFullYear() === _0x346e48.getUTCFullYear() && _0xfff66e.getUTCMonth() === _0x346e48.getUTCMonth() && _0xfff66e.getUTCDate() === _0x346e48.getUTCDate() && _0xfff66e.getUTCHours() === _0x346e48.getUTCHours()) {
                _0x26c4f2 = true;
              }
            }
          }
        } catch (_0x2ff209) {
          console.error("Error inserting notification item:", _0x2ff209);
          return false;
        }
      }
      const _0x5560de = {
        isDuplicateAlert: _0x26c4f2,
        todayCount: _0x4022ad
      };
      return _0x5560de;
    };
    function _0x2f85bb(_0x73f1d8) {
      const _0x4933cf = new Date(_0x73f1d8);
      if (_0x4933cf.getMilliseconds() > 0) {
        _0x4933cf.setSeconds(_0x4933cf.getSeconds() + 1);
        _0x4933cf.setMilliseconds(0);
      }
      return _0x4933cf;
    }
    _0x17287e.SlackService = _0x46b921;
    _0x17287e.EmailService = _0x3adb63;
  }
});
var Jsonapi = require_jsonapiUtil();
var NPMUpdates = require_npmUpdates();
var {
  getStorageConnection
} = require_storageConnection();
var packageJson = require_package();
var helpers = require_helpers();
var Alerts = require_alerts();
exports.checkUpdates = async (_0xa7795, _0x3218f0) => {
  try {
    const _0x19d518 = await NPMUpdates.fetchLatestVersion("errsole");
    const _0x33345d = getStorageConnection();
    const _0x4abb7c = await NPMUpdates.fetchLatestVersion(_0x33345d.name);
    const _0x847813 = {
      name: packageJson.name,
      version: packageJson.version,
      latest_version: _0x19d518,
      storage_name: _0x33345d.name,
      storage_version: _0x33345d.version,
      storage_latest_version: _0x4abb7c,
      storage_dialect: _0x33345d.dialect
    };
    const _0x14cfaf = _0x847813;
    _0x3218f0.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, _0x14cfaf));
  } catch (_0x35f33a) {
    console.error(_0x35f33a);
    const _0x22edf6 = {
      error: "Internal Server Error",
      message: _0x35f33a && _0x35f33a.message ? _0x35f33a.message : "An unexpected error occurred"
    };
    const _0x107f29 = {
      errors: [_0x22edf6]
    };
    _0x3218f0.status(500).send(_0x107f29);
  }
};
exports.getSlackDetails = async (_0x1abeba, _0x488f23) => {
  try {
    const _0x299e86 = getStorageConnection();
    const _0x24e26e = await _0x299e86.getConfig("slackIntegration");
    if (_0x24e26e && _0x24e26e.item) {
      _0x24e26e.item.value = JSON.parse(_0x24e26e.item.value);
      delete _0x24e26e.item.value.url;
    }
    _0x488f23.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, _0x24e26e.item || {}));
  } catch (_0x19b8f8) {
    console.error(_0x19b8f8);
    const _0x242245 = {
      error: "Internal Server Error",
      message: _0x19b8f8 && _0x19b8f8.message ? _0x19b8f8.message : "An unexpected error occurred"
    };
    const _0x56a5a8 = {
      errors: [_0x242245]
    };
    _0x488f23.status(500).send(_0x56a5a8);
  }
};
exports.addSlackDetails = async (_0x3a23a7, _0x1cf1ba) => {
  try {
    const {
      url: _0x17e011
    } = helpers.extractAttributes(_0x3a23a7.body);
    const _0xd4508a = await helpers.SlackUrl(_0x17e011);
    if (!_0xd4508a) {
      const _0x46cd24 = [{
        error: "Conflict",
        message: "You have sent a url which is not a slack url."
      }];
      const _0x5d61c5 = {
        errors: _0x46cd24
      };
      return _0x1cf1ba.status(409).send(_0x5d61c5);
    } else {
      const _0x13e905 = getStorageConnection();
      const _0xa9bc6f = await _0x13e905.getConfig("slackIntegration");
      if (_0xa9bc6f && !_0xa9bc6f.item) {
        const _0x228e3a = {
          url: _0x17e011,
          username: "Errsole",
          icon_url: "https://avatars.githubusercontent.com/u/84983840",
          status: true
        };
        const _0x2bc3b5 = _0x228e3a;
        const _0xa8455d = await _0x13e905.setConfig("slackIntegration", JSON.stringify(_0x2bc3b5));
        if (_0xa8455d && _0xa8455d.item) {
          _0xa8455d.item.value = JSON.parse(_0xa8455d.item.value);
          _0x1cf1ba.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, _0xa8455d.item));
        } else {
          _0x1cf1ba.status(500).send({
            errors: [{
              error: "Internal Server Error",
              message: "An unexpected error occurred"
            }]
          });
        }
      } else {
        const _0x14f70d = [{
          error: "Conflict",
          message: "You have already added a webhook url for slack."
        }];
        const _0x3a8513 = {
          errors: _0x14f70d
        };
        _0x1cf1ba.status(409).send(_0x3a8513);
      }
    }
  } catch (_0x285d20) {
    console.error(_0x285d20);
    const _0x52bca1 = {
      error: "Internal Server Error",
      message: _0x285d20 && _0x285d20.message ? _0x285d20.message : "An unexpected error occurred"
    };
    const _0x3c9bd7 = {
      errors: [_0x52bca1]
    };
    _0x1cf1ba.status(500).send(_0x3c9bd7);
  }
};
exports.updateSlackDetails = async (_0x1a2d14, _0x19201e) => {
  try {
    const {
      status: _0x37390c
    } = helpers.extractAttributes(_0x1a2d14.body);
    const _0x4db9dd = getStorageConnection();
    const _0x425e48 = await _0x4db9dd.getConfig("slackIntegration");
    if (_0x425e48 && _0x425e48.item) {
      let _0xcbc410;
      try {
        _0xcbc410 = JSON.parse(_0x425e48.item.value);
        _0xcbc410.status = JSON.parse(_0x37390c);
      } catch (_0x549d05) {
        console.error(_0x549d05);
        const _0x4a9d55 = {
          error: "Internal Server Error",
          message: _0x549d05 && _0x549d05.message ? _0x549d05.message : "An unexpected error occurred"
        };
        const _0x275c70 = {
          errors: [_0x4a9d55]
        };
        _0x19201e.status(500).send(_0x275c70);
      }
      _0x425e48.item.value.status = JSON.parse(_0x37390c);
      const _0x19a001 = await _0x4db9dd.setConfig("slackIntegration", JSON.stringify(_0xcbc410));
      if (_0x19a001 && _0x19a001.item) {
        _0x19a001.item.value = JSON.parse(_0x19a001.item.value);
        _0x19201e.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, _0x19a001.item));
      } else {
        _0x19201e.status(500).send({
          errors: [{
            error: "Internal Server Error",
            message: "An unexpected error occurred"
          }]
        });
      }
    } else {
      _0x19201e.status(500).send({
        errors: [{
          error: "Internal Server Error",
          message: "An unexpected error occurred"
        }]
      });
    }
  } catch (_0x42647e) {
    console.error(_0x42647e);
    const _0x52c3ee = {
      error: "Internal Server Error",
      message: _0x42647e && _0x42647e.message ? _0x42647e.message : "An unexpected error occurred"
    };
    const _0x1a7949 = {
      errors: [_0x52c3ee]
    };
    _0x19201e.status(500).send(_0x1a7949);
  }
};
exports.deleteSlackDetails = async (_0x361a43, _0x233dd9) => {
  try {
    const _0x3a7bd9 = getStorageConnection();
    const _0x33349b = await _0x3a7bd9.deleteConfig("slackIntegration");
    if (_0x33349b) {
      _0x233dd9.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, {
        data: "slack integration has been removed"
      }));
    } else {
      _0x233dd9.status(500).send({
        errors: [{
          error: "Internal Server Error",
          message: "An unexpected error occurred"
        }]
      });
    }
  } catch (_0x51e264) {
    console.error(_0x51e264);
    const _0x65b250 = {
      error: "Internal Server Error",
      message: _0x51e264 && _0x51e264.message ? _0x51e264.message : "An unexpected error occurred"
    };
    const _0x5944b7 = {
      errors: [_0x65b250]
    };
    _0x233dd9.status(500).send(_0x5944b7);
  }
};
exports.getEmailDetails = async (_0x5301b1, _0x49dbd1) => {
  try {
    const _0x484f80 = getStorageConnection();
    const _0x3aaa6c = await _0x484f80.getConfig("emailIntegration");
    if (_0x3aaa6c && _0x3aaa6c.item) {
      _0x3aaa6c.item.value = JSON.parse(_0x3aaa6c.item.value);
      delete _0x3aaa6c.item.value.url;
    }
    _0x49dbd1.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, _0x3aaa6c.item || {}));
  } catch (_0x2b62d1) {
    console.error(_0x2b62d1);
    const _0x15c1c8 = {
      error: "Internal Server Error",
      message: _0x2b62d1 && _0x2b62d1.message ? _0x2b62d1.message : "An unexpected error occurred"
    };
    const _0x51a41b = {
      errors: [_0x15c1c8]
    };
    _0x49dbd1.status(500).send(_0x51a41b);
  }
};
exports.addEmailDetails = async (_0x24e4bc, _0x14d123) => {
  try {
    const {
      sender: _0xea3ba4,
      host: _0x1b0a2b,
      port: _0x3beb1c,
      username: _0x291e45,
      password: _0x2ab77f,
      receivers: _0x19f5f1
    } = helpers.extractAttributes(_0x24e4bc.body);
    const _0x320fb5 = getStorageConnection();
    const _0x36d23e = {
      sender: _0xea3ba4,
      host: _0x1b0a2b,
      port: _0x3beb1c,
      username: _0x291e45,
      password: _0x2ab77f,
      receivers: _0x19f5f1,
      status: true
    };
    const _0xb0c905 = _0x36d23e;
    const _0x1cb2dc = await _0x320fb5.setConfig("emailIntegration", JSON.stringify(_0xb0c905));
    if (_0x1cb2dc && _0x1cb2dc.item) {
      _0x1cb2dc.item.value = JSON.parse(_0x1cb2dc.item.value);
      await Alerts.clearEmailTransport();
      _0x14d123.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, _0x1cb2dc.item));
    } else {
      _0x14d123.status(500).send({
        errors: [{
          error: "Internal Server Error",
          message: "An unexpected error occurred"
        }]
      });
    }
  } catch (_0x2a933f) {
    console.error(_0x2a933f);
    const _0x192148 = {
      error: "Internal Server Error",
      message: _0x2a933f && _0x2a933f.message ? _0x2a933f.message : "An unexpected error occurred"
    };
    const _0x3520ed = {
      errors: [_0x192148]
    };
    _0x14d123.status(500).send(_0x3520ed);
  }
};
exports.updateEmailDetails = async (_0x3bb9ee, _0x277edc) => {
  try {
    const {
      status: _0x887e45
    } = helpers.extractAttributes(_0x3bb9ee.body);
    const _0x1f3b5f = getStorageConnection();
    const _0x43320d = await _0x1f3b5f.getConfig("emailIntegration");
    if (_0x43320d && _0x43320d.item) {
      let _0x5ef98b;
      try {
        _0x5ef98b = JSON.parse(_0x43320d.item.value);
        _0x5ef98b.status = JSON.parse(_0x887e45);
      } catch (_0x23c211) {
        console.error(_0x23c211);
        const _0x4e32b7 = {
          error: "Internal Server Error",
          message: _0x23c211 && _0x23c211.message ? _0x23c211.message : "An unexpected error occurred"
        };
        const _0x144513 = {
          errors: [_0x4e32b7]
        };
        _0x277edc.status(500).send(_0x144513);
      }
      _0x43320d.item.value.status = JSON.parse(_0x887e45);
      const _0x3abc14 = await _0x1f3b5f.setConfig("emailIntegration", JSON.stringify(_0x5ef98b));
      if (_0x3abc14 && _0x3abc14.item) {
        _0x3abc14.item.value = JSON.parse(_0x3abc14.item.value);
        await Alerts.clearEmailTransport();
        _0x277edc.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, _0x3abc14.item));
      } else {
        _0x277edc.status(500).send({
          errors: [{
            error: "Internal Server Error",
            message: "An unexpected error occurred"
          }]
        });
      }
    } else {
      _0x277edc.status(500).send({
        errors: [{
          error: "Internal Server Error",
          message: "An unexpected error occurred"
        }]
      });
    }
  } catch (_0x499c14) {
    console.error(_0x499c14);
    const _0x1f7e3d = {
      error: "Internal Server Error",
      message: _0x499c14 && _0x499c14.message ? _0x499c14.message : "An unexpected error occurred"
    };
    const _0x606832 = {
      errors: [_0x1f7e3d]
    };
    _0x277edc.status(500).send(_0x606832);
  }
};
exports.deleteEmailDetails = async (_0x2c611c, _0x5999fe) => {
  try {
    const {
      url: _0x316e42
    } = helpers.extractAttributes(_0x2c611c.body);
    const _0x13580c = getStorageConnection();
    const _0x415c55 = await _0x13580c.deleteConfig("emailIntegration");
    if (_0x415c55) {
      const _0x232b10 = {
        url: _0x316e42
      };
      _0x5999fe.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, _0x232b10));
    } else {
      _0x5999fe.status(500).send({
        errors: [{
          error: "Internal Server Error",
          message: "An unexpected error occurred"
        }]
      });
    }
  } catch (_0x53ec42) {
    console.error(_0x53ec42);
    const _0x3e8322 = {
      error: "Internal Server Error",
      message: _0x53ec42 && _0x53ec42.message ? _0x53ec42.message : "An unexpected error occurred"
    };
    const _0xaa7fd6 = {
      errors: [_0x3e8322]
    };
    _0x5999fe.status(500).send(_0xaa7fd6);
  }
};
exports.testSlackNotification = async (_0x3ce129, _0x4c8baa) => {
  try {
    const _0x2f7758 = await Alerts.testSlackAlert("This is a test notification from the Errsole Logger.", "Test Notification");
    const _0x22b34f = {
      success: _0x2f7758
    };
    _0x4c8baa.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, _0x22b34f));
  } catch (_0x516592) {
    console.error(_0x516592);
    const _0x57a7a3 = {
      error: "Internal Server Error",
      message: _0x516592 && _0x516592.message ? _0x516592.message : "An unexpected error occurred"
    };
    const _0x4662ac = {
      errors: [_0x57a7a3]
    };
    _0x4c8baa.status(500).send(_0x4662ac);
  }
};
exports.testEmailNotification = async (_0x1296e5, _0x15f109) => {
  try {
    const _0x1a287f = await Alerts.testEmailAlert("This is a test notification from the Errsole Logger. If you received this email, it means your SMTP settings are correctly configured in Errsole.", "Test Notification");
    const _0x438b14 = {
      success: _0x1a287f
    };
    _0x15f109.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, _0x438b14));
  } catch (_0x61af29) {
    console.error(_0x61af29);
    const _0x2b5951 = {
      error: "Internal Server Error",
      message: _0x61af29 && _0x61af29.message ? _0x61af29.message : "An unexpected error occurred"
    };
    const _0x5eef48 = {
      errors: [_0x2b5951]
    };
    _0x15f109.status(500).send(_0x5eef48);
  }
};
exports.getAlertUrlDetails = async (_0x33a4c8, _0x38a90a) => {
  try {
    const _0x2635d6 = getStorageConnection();
    const _0x3d883a = await _0x2635d6.getConfig("alertUrl");
    if (_0x3d883a && _0x3d883a.item) {
      _0x3d883a.item.value = JSON.parse(_0x3d883a.item.value);
    }
    _0x38a90a.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, _0x3d883a.item || {}));
  } catch (_0x19c657) {
    console.error(_0x19c657);
    const _0x2d76b3 = {
      error: "Internal Server Error",
      message: _0x19c657 && _0x19c657.message ? _0x19c657.message : "An unexpected error occurred"
    };
    const _0x366a64 = {
      errors: [_0x2d76b3]
    };
    _0x38a90a.status(500).send(_0x366a64);
  }
};
exports.addAlertUrlDetails = async (_0x2494b8, _0xba9a0e) => {
  try {
    const {
      url: _0x14bf63
    } = helpers.extractAttributes(_0x2494b8.body);
    const _0x3e1b5c = getStorageConnection();
    const _0x11ac82 = {
      url: _0x14bf63
    };
    const _0x41d69a = _0x11ac82;
    const _0x10d0ee = await _0x3e1b5c.setConfig("alertUrl", JSON.stringify(_0x41d69a));
    if (_0x10d0ee && _0x10d0ee.item) {
      _0x10d0ee.item.value = JSON.parse(_0x10d0ee.item.value);
      _0xba9a0e.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, _0x10d0ee.item));
    } else {
      _0xba9a0e.status(500).send({
        errors: [{
          error: "Internal Server Error",
          message: "An unexpected error occurred"
        }]
      });
    }
  } catch (_0x545e20) {
    console.error(_0x545e20);
    const _0x10db26 = {
      error: "Internal Server Error",
      message: _0x545e20 && _0x545e20.message ? _0x545e20.message : "An unexpected error occurred"
    };
    const _0x183125 = {
      errors: [_0x10db26]
    };
    _0xba9a0e.status(500).send(_0x183125);
  }
};
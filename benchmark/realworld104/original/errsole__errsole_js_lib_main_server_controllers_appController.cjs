"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js
var require_jsonapiUtil = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js"(exports2, module2) {
    "use strict";
    var JSONAPISerializer = require("json-api-serializer");
    var Serializer = new JSONAPISerializer({
      jsonapiObject: false
    });
    var Jsonapi2 = {};
    Jsonapi2.UserType = "users";
    Jsonapi2.AppType = "apps";
    Jsonapi2.LogType = "logs";
    Serializer.register(Jsonapi2.UserType, {});
    Serializer.register(Jsonapi2.AppType, {});
    Serializer.register(Jsonapi2.LogType, {
      topLevelMeta: function(data, filters) {
        return {
          filters
        };
      }
    });
    Jsonapi2.Serializer = Serializer;
    module2.exports = Jsonapi2;
  }
});

// ../work/errsole__errsole.js/lib/main/server/utils/npmUpdates.js
var require_npmUpdates = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/npmUpdates.js"(exports2, module2) {
    "use strict";
    var axios = require("axios");
    var NPMUpdates2 = {};
    NPMUpdates2.fetchLatestVersion = async function(packageName) {
      const npmResponse = await axios({
        method: "get",
        url: "https://registry.npmjs.org/" + packageName + "/latest"
      });
      if (npmResponse.status === 200 && npmResponse.data) {
        if (npmResponse.data.version) {
          return npmResponse.data.version;
        } else {
          return "0.0.0";
        }
      } else {
        throw new Error("badRequest");
      }
    };
    module2.exports = NPMUpdates2;
  }
});

// ../work/errsole__errsole.js/lib/main/server/storageConnection.js
var require_storageConnection = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/storageConnection.js"(exports2, module2) {
    "use strict";
    var storageConnection = null;
    function initializeStorageConnection(storage) {
      if (!storageConnection) {
        storageConnection = storage;
      }
      return storageConnection;
    }
    function getStorageConnection2() {
      if (!storageConnection) {
        throw new Error("Storage connection has not been initialized.");
      }
      return storageConnection;
    }
    module2.exports = { initializeStorageConnection, getStorageConnection: getStorageConnection2 };
  }
});

// ../work/errsole__errsole.js/package.json
var require_package = __commonJS({
  "../work/errsole__errsole.js/package.json"(exports2, module2) {
    module2.exports = {
      name: "errsole",
      version: "2.18.2",
      description: "Collect, Store, and Visualize Logs with a Single Module",
      keywords: [
        "log",
        "logs",
        "logging",
        "logger"
      ],
      homepage: "https://github.com/errsole/errsole.js",
      bugs: {
        url: "https://github.com/errsole/errsole.js/issues"
      },
      license: "MIT",
      author: "Rishi Kumar <rishi@errsole.com>",
      contributors: [
        "Rishi Kumar <rishi@errsole.com>",
        "Venkateswarlu Ganji <venki@errsole.com>",
        "Sai Kumar <sai@errsole.com>"
      ],
      files: [
        "docs",
        "examples",
        "lib",
        "types"
      ],
      main: "lib/errsole.js",
      types: "types/errsole.d.ts",
      scripts: {
        "build:web": "NODE_OPTIONS=--openssl-legacy-provider webpack --config lib/web/webpack/website.config.js",
        setup: "npm install && npm install errsole-sqlite sqlite3 --no-save && npm run build:web",
        dev: "node examples/index.js",
        test: "jest --coverage",
        coveralls: "jest --coverage && cat ./coverage/lcov.info | coveralls"
      },
      dependencies: {
        "@ant-design/icons": "^5.5.1",
        "@hapi/h2o2": "^10.0.4",
        ajv: "^8.17.1",
        "ajv-keywords": "^5.1.0",
        axios: "^1.6.8",
        "body-parser": "^1.20.2",
        dompurify: "^3.1.7",
        "errsole-sqlite": "^2.2.0",
        express: "^4.17.1",
        "express-static-gzip": "^2.1.7",
        "http-proxy-middleware": "^3.0.0",
        immutable: "^4.3.7",
        "json-api-serializer": "^2.6.6",
        jsonwebtoken: "^9.0.2",
        "koa-proxies": "^0.12.4",
        nodemailer: "^6.9.13",
        "strip-ansi": "^6.0.1",
        uuid: "^10.0.0"
      },
      devDependencies: {
        "@babel/core": "^7.24.5",
        "@babel/preset-env": "^7.24.0",
        "@babel/preset-react": "^7.23.3",
        "@jest/globals": "^29.7.0",
        "@microlink/react-json-view": "^1.23.3",
        antd: "^5.22.2",
        babel: "^6.23.0",
        "babel-core": "^6.26.3",
        "babel-loader": "^9.1.3",
        "babel-preset-es2015": "^6.24.1",
        "babel-preset-react": "^6.24.1",
        "compression-webpack-plugin": "^11.1.0",
        coveralls: "^3.1.1",
        "css-loader": "^7.1.2",
        history: "^5.3.0",
        jest: "^29.7.0",
        moment: "^2.30.1",
        react: "^18.3.1",
        "react-dom": "^18.3.1",
        "react-redux": "^9.1.2",
        "react-router-dom": "^6.28.0",
        redux: "^5.0.1",
        "redux-thunk": "^3.1.0",
        "style-loader": "^4.0.0",
        supertest: "^7.0.0",
        "universal-cookie": "^7.1.0",
        webpack: "^5.90.3",
        "webpack-cli": "^5.1.4",
        "webpack-merge": "^6.0.1"
      }
    };
  }
});

// ../work/errsole__errsole.js/lib/main/server/utils/helpers.js
var require_helpers = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/helpers.js"(exports2) {
    "use strict";
    var { v4: uuidv4 } = require("uuid");
    var { getStorageConnection: getStorageConnection2 } = require_storageConnection();
    var JWT_SECRET;
    exports2.extractAttributes = (data) => {
      if (data && data.data && data.data.attributes) {
        return data.data.attributes;
      } else {
        return {};
      }
    };
    exports2.SlackUrl = (data) => {
      const urlRegex = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
      return urlRegex.test(data);
    };
    exports2.addJWTSecret = async () => {
      try {
        const storageConnection = getStorageConnection2();
        const data = await storageConnection.getConfig("jwtSecret");
        if (data && data.item && data.item.key === "jwtSecret") {
          JWT_SECRET = data.item.value;
        } else {
          const newJwtSecret = uuidv4();
          const result = await storageConnection.setConfig(
            "jwtSecret",
            newJwtSecret
          );
          if (result && result.item && result.item.key === "jwtSecret") {
            JWT_SECRET = result.item.value;
          }
        }
        return JWT_SECRET || false;
      } catch (err) {
        console.error("An error occurred in addJWTSecret:", err);
        throw err;
      }
    };
    exports2.getJWTSecret = () => {
      if (JWT_SECRET) {
        return JWT_SECRET;
      } else {
        return false;
      }
    };
  }
});

// ../work/errsole__errsole.js/lib/main/server/utils/alerts.js
var require_alerts = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/utils/alerts.js"(exports2) {
    "use strict";
    var { getStorageConnection: getStorageConnection2 } = require_storageConnection();
    var axios = require("axios");
    var nodemailer = require("nodemailer");
    var crypto = require("crypto");
    exports2.customLoggerAlert = async function(message, messageExtraInfo, errsoleLogId, timestamp) {
      try {
        const { isDuplicateAlert, todayCount } = await checkAlertStatus(message, messageExtraInfo, errsoleLogId);
        if (isDuplicateAlert) {
          return false;
        }
        await SlackService.sendAlert(message, "Alert", messageExtraInfo, errsoleLogId, todayCount, timestamp);
        await EmailService.sendAlert(message, "Alert", messageExtraInfo, errsoleLogId, todayCount, timestamp);
        return true;
      } catch (error) {
        console.error("Error in customLoggerAlert:", error);
        return false;
      }
    };
    exports2.handleUncaughtExceptions = async function(message, messageExtraInfo, errsoleLogId, timestamp) {
      try {
        const { isDuplicateAlert, todayCount } = await checkAlertStatus(message, messageExtraInfo, errsoleLogId);
        if (isDuplicateAlert) {
          return false;
        }
        await SlackService.sendAlert(message, "Uncaught Exception", messageExtraInfo, errsoleLogId, todayCount, timestamp);
        await EmailService.sendAlert(message, "Uncaught Exception", messageExtraInfo, errsoleLogId, todayCount, timestamp);
        return true;
      } catch (error) {
        console.error("Error in handleUncaughtExceptions:", error);
        return false;
      }
    };
    exports2.testSlackAlert = async function(message, messageExtraInfo) {
      try {
        const result = await SlackService.sendAlert(message, "Test", messageExtraInfo);
        return result;
      } catch (error) {
        console.error("Error in testSlackAlert:", error);
        return false;
      }
    };
    exports2.testEmailAlert = async function(message, messageExtraInfo) {
      try {
        const result = await EmailService.sendAlert(message, "Test", messageExtraInfo);
        return result;
      } catch (error) {
        console.error("Error in testEmailAlert:", error);
        return false;
      }
    };
    var SlackService = {};
    SlackService.sendAlert = async function(message, type, messageExtraInfo, errsoleLogId, todayCount, timestamp) {
      try {
        const storageConnection = getStorageConnection2();
        const data = await storageConnection.getConfig("slackIntegration");
        if (data && data.item) {
          const parsedValue = JSON.parse(data.item.value);
          if (!parsedValue.status) {
            return false;
          }
          const alertUrlData = await storageConnection.getConfig("alertUrl");
          let alertUrl;
          if (alertUrlData && alertUrlData.item && errsoleLogId) {
            const parsedAlertUrlValue = JSON.parse(alertUrlData.item.value);
            let alertTimestap;
            if (!timestamp) {
              alertTimestap = new Date((/* @__PURE__ */ new Date()).getTime() + 2e3).toISOString();
            } else {
              alertTimestap = roundUpToNextSecond(timestamp);
              alertTimestap = alertTimestap.toISOString();
            }
            alertUrl = parsedAlertUrlValue.url + "#/logs?errsole_log_id=" + errsoleLogId + "&timestamp=" + alertTimestap;
          }
          const webhookUrl = parsedValue.url;
          const payload = blockKit(message, type, messageExtraInfo, alertUrl, todayCount);
          payload.username = parsedValue.username || "Errsole";
          payload.icon_url = parsedValue.icon_url || "https://avatars.githubusercontent.com/u/84983840";
          const slackPromise = axios.post(webhookUrl, payload);
          const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error("Slack send timed out"));
            }, 5e3);
          });
          try {
            await Promise.race([slackPromise, timeoutPromise]);
          } catch (error) {
            return false;
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to send slack alert:", error);
        return false;
      }
    };
    function blockKit(message, type, messageExtraInfo = {}, alertUrl, todayCount) {
      const payload = {
        blocks: []
      };
      payload.blocks.push({ type: "section", text: { type: "mrkdwn", text: " :warning: *Errsole: " + type + "*" } });
      if (messageExtraInfo.appName) {
        payload.blocks.push({ type: "rich_text", elements: [{ type: "rich_text_section", elements: [{ type: "text", text: "App Name: ", style: { bold: true } }, { type: "text", text: messageExtraInfo.appName }] }] });
      }
      if (messageExtraInfo.environmentName) {
        payload.blocks.push({ type: "rich_text", elements: [{ type: "rich_text_section", elements: [{ type: "text", text: "Environment Name: ", style: { bold: true } }, { type: "text", text: messageExtraInfo.environmentName }] }] });
      }
      if (messageExtraInfo.serverName) {
        payload.blocks.push({ type: "rich_text", elements: [{ type: "rich_text_section", elements: [{ type: "text", text: "Server Name: ", style: { bold: true } }, { type: "text", text: messageExtraInfo.serverName }] }] });
      }
      payload.blocks.push({ type: "rich_text", elements: [{ type: "rich_text_preformatted", elements: [{ type: "text", text: message }] }] });
      if (todayCount) {
        if (type === "Alert") {
          payload.blocks.push({ type: "section", text: { type: "mrkdwn", text: `This alert has occurred *${todayCount} time${todayCount > 1 ? "s" : ""} today*.` } });
        } else {
          payload.blocks.push({ type: "section", text: { type: "mrkdwn", text: `This error has occurred *${todayCount} time${todayCount > 1 ? "s" : ""} today*.` } });
        }
      }
      if (alertUrl) {
        payload.blocks.push({ type: "section", text: { type: "mrkdwn", text: "<" + alertUrl + "|Click here> to view the logs in the Errsole dashboard." } });
      }
      if (type === "Alert") {
        payload.blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: "_Note:_\n\u2022 _You will not receive another notification for this alert on this server within the current hour._\n\u2022 _Errsole uses the UTC timezone in notifications._"
          }
        });
      } else if (type !== "Test") {
        payload.blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: "_Note:_\n\u2022 _You will not receive another notification for this error on this server within the current hour._\n\u2022 _Errsole uses the UTC timezone in notifications._"
          }
        });
      }
      payload.blocks.push({ type: "divider" });
      return payload;
    }
    var EmailService = {
      transporter: null
    };
    EmailService.emailTransport = async function() {
      try {
        if (this.transporter === null) {
          const storageConnection = getStorageConnection2();
          const data = await storageConnection.getConfig("emailIntegration");
          if (data && data.item) {
            const parsedValue = JSON.parse(data.item.value);
            this.transporter = nodemailer.createTransport({
              pool: true,
              maxConnections: 5,
              maxMessages: 100,
              rateLimit: 10,
              host: parsedValue.host,
              port: parseInt(parsedValue.port),
              secure: parseInt(parsedValue.port) === 465,
              auth: {
                user: parsedValue.username,
                pass: parsedValue.password
              }
            });
          }
        }
      } catch (error) {
        console.error("Failed to create email transporter: ", error);
        this.transporter = null;
      }
    };
    EmailService.sendAlert = async function(message, type, messageExtraInfo, errsoleLogId, todayCount, timestamp) {
      try {
        await EmailService.emailTransport();
        if (this.transporter !== null) {
          const storageConnection = getStorageConnection2();
          const data = await storageConnection.getConfig("emailIntegration");
          if (data && data.item) {
            const parsedValue = JSON.parse(data.item.value);
            if (!parsedValue.status) {
              return false;
            }
            const alertUrlData = await storageConnection.getConfig("alertUrl");
            let alertUrl;
            if (alertUrlData && alertUrlData.item && errsoleLogId) {
              const parsedAlertUrlValue = JSON.parse(alertUrlData.item.value);
              let alertTimestap;
              if (!timestamp) {
                alertTimestap = new Date((/* @__PURE__ */ new Date()).getTime() + 2e3).toISOString();
              } else {
                alertTimestap = roundUpToNextSecond(timestamp);
                alertTimestap = alertTimestap.toISOString();
              }
              alertUrl = parsedAlertUrlValue.url + "#/logs?errsole_log_id=" + errsoleLogId + "&timestamp=" + alertTimestap;
            }
            let subject;
            let messagePrefix = "";
            if (messageExtraInfo.appName && messageExtraInfo.environmentName) {
              subject = `Errsole: ${type} (${messageExtraInfo.appName} app, ${messageExtraInfo.environmentName} environment)`;
              messagePrefix = `<p><b>App Name:</b> ${messageExtraInfo.appName}</p>
          <p><b>Environment Name:</b> ${messageExtraInfo.environmentName}</p>`;
            } else if (messageExtraInfo.appName) {
              subject = `Errsole: ${type} (${messageExtraInfo.appName} app)`;
              messagePrefix = `<p><b>App Name:</b> ${messageExtraInfo.appName}</p>`;
            } else if (messageExtraInfo.environmentName) {
              subject = `Errsole: ${type} (${messageExtraInfo.environmentName} environment)`;
              messagePrefix = `<p><b>Environment Name:</b> ${messageExtraInfo.environmentName}</p>`;
            } else {
              subject = `Errsole: ${type}`;
            }
            if (messageExtraInfo.serverName) {
              messagePrefix += `<p><b>Server Name:</b> ${messageExtraInfo.serverName}</p>`;
            }
            message = `${messagePrefix}<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${message}</pre>`;
            if (todayCount) {
              if (type === "Alert") {
                message = `${message}<p>This alert has occurred <b>${todayCount} time${todayCount > 1 ? "s" : ""} today</b>.</p>`;
              } else {
                message = `${message}<p>This error has occurred <b>${todayCount} time${todayCount > 1 ? "s" : ""} today</b>.</p>`;
              }
            }
            if (alertUrl) {
              message = `${message}<p><a href="${alertUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
            }
            if (type === "Alert") {
              message = `${message}<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this alert on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>`;
            } else {
              message = `${message}<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this error on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>`;
            }
            const emailPromise = this.transporter.sendMail({
              from: parsedValue.sender,
              to: parsedValue.receivers,
              subject,
              html: message
            });
            const timeoutPromise = new Promise((resolve, reject) => {
              setTimeout(() => {
                reject(new Error("Email send timed out"));
              }, 5e3);
            });
            try {
              await Promise.race([emailPromise, timeoutPromise]);
            } catch (error) {
              console.log(error);
              return false;
            }
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error("Failed to send email alert:", error);
        return false;
      }
    };
    exports2.clearEmailTransport = async function() {
      EmailService.transporter = null;
      return true;
    };
    var checkAlertStatus = async (message, messageExtraInfo, errsoleLogId) => {
      let isDuplicateAlert = false;
      let todayCount = 0;
      const stringify = (input) => {
        if (typeof input === "string") return input;
        try {
          return JSON.stringify(input);
        } catch {
          return String(input);
        }
      };
      const storageConnection = getStorageConnection2();
      if (storageConnection && storageConnection.insertNotificationItem) {
        const combined = `${stringify(message)}|${stringify(messageExtraInfo)}`;
        const hashedMessage = crypto.createHash("sha256").update(combined).digest("hex");
        const notification = {
          errsole_id: errsoleLogId,
          hashed_message: hashedMessage,
          hostname: messageExtraInfo.serverName
        };
        try {
          const insertAlertResult = await storageConnection.insertNotificationItem(notification);
          if (insertAlertResult) {
            const previousItem = insertAlertResult.previousNotificationItem;
            todayCount = insertAlertResult.todayNotificationCount;
            if (previousItem) {
              const now = /* @__PURE__ */ new Date();
              const previousTime = new Date(previousItem.created_at);
              if (now.getUTCFullYear() === previousTime.getUTCFullYear() && now.getUTCMonth() === previousTime.getUTCMonth() && now.getUTCDate() === previousTime.getUTCDate() && now.getUTCHours() === previousTime.getUTCHours()) {
                isDuplicateAlert = true;
              }
            }
          }
        } catch (error) {
          console.error("Error inserting notification item:", error);
          return false;
        }
      }
      return { isDuplicateAlert, todayCount };
    };
    function roundUpToNextSecond(date) {
      const roundedDate = new Date(date);
      if (roundedDate.getMilliseconds() > 0) {
        roundedDate.setSeconds(roundedDate.getSeconds() + 1);
        roundedDate.setMilliseconds(0);
      }
      return roundedDate;
    }
    exports2.SlackService = SlackService;
    exports2.EmailService = EmailService;
  }
});

// ../work/errsole__errsole.js/lib/main/server/controllers/appController.js
var Jsonapi = require_jsonapiUtil();
var NPMUpdates = require_npmUpdates();
var { getStorageConnection } = require_storageConnection();
var packageJson = require_package();
var helpers = require_helpers();
var Alerts = require_alerts();
exports.checkUpdates = async (req, res) => {
  try {
    const errsoleLatestVersion = await NPMUpdates.fetchLatestVersion("errsole");
    const storageConnection = getStorageConnection();
    const storageLatestVersion = await NPMUpdates.fetchLatestVersion(
      storageConnection.name
    );
    const data = {
      name: packageJson.name,
      version: packageJson.version,
      latest_version: errsoleLatestVersion,
      storage_name: storageConnection.name,
      storage_version: storageConnection.version,
      storage_latest_version: storageLatestVersion,
      storage_dialect: storageConnection.dialect
    };
    res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, data));
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};
exports.getSlackDetails = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const data = await storageConnection.getConfig("slackIntegration");
    if (data && data.item) {
      data.item.value = JSON.parse(data.item.value);
      delete data.item.value.url;
    }
    res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, data.item || {}));
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};
exports.addSlackDetails = async (req, res) => {
  try {
    const { url } = helpers.extractAttributes(req.body);
    const slackUrl = await helpers.SlackUrl(url);
    if (!slackUrl) {
      const errorData = [
        {
          error: "Conflict",
          message: "You have sent a url which is not a slack url."
        }
      ];
      return res.status(409).send({ errors: errorData });
    } else {
      const storageConnection = getStorageConnection();
      const data = await storageConnection.getConfig("slackIntegration");
      if (data && !data.item) {
        const details = {
          url,
          username: "Errsole",
          icon_url: "https://avatars.githubusercontent.com/u/84983840",
          status: true
        };
        const result = await storageConnection.setConfig(
          "slackIntegration",
          JSON.stringify(details)
        );
        if (result && result.item) {
          result.item.value = JSON.parse(result.item.value);
          res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, result.item));
        } else {
          res.status(500).send({
            errors: [
              {
                error: "Internal Server Error",
                message: "An unexpected error occurred"
              }
            ]
          });
        }
      } else {
        const errorData = [
          {
            error: "Conflict",
            message: "You have already added a webhook url for slack."
          }
        ];
        res.status(409).send({ errors: errorData });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};
exports.updateSlackDetails = async (req, res) => {
  try {
    const { status } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    const data = await storageConnection.getConfig("slackIntegration");
    if (data && data.item) {
      let parsedValue;
      try {
        parsedValue = JSON.parse(data.item.value);
        parsedValue.status = JSON.parse(status);
      } catch (err) {
        console.error(err);
        res.status(500).send({
          errors: [
            {
              error: "Internal Server Error",
              message: err && err.message ? err.message : "An unexpected error occurred"
            }
          ]
        });
      }
      data.item.value.status = JSON.parse(status);
      const result = await storageConnection.setConfig(
        "slackIntegration",
        JSON.stringify(parsedValue)
      );
      if (result && result.item) {
        result.item.value = JSON.parse(result.item.value);
        res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, result.item));
      } else {
        res.status(500).send({
          errors: [
            {
              error: "Internal Server Error",
              message: "An unexpected error occurred"
            }
          ]
        });
      }
    } else {
      res.status(500).send({
        errors: [
          {
            error: "Internal Server Error",
            message: "An unexpected error occurred"
          }
        ]
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};
exports.deleteSlackDetails = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const data = await storageConnection.deleteConfig("slackIntegration");
    if (data) {
      res.send(
        Jsonapi.Serializer.serialize(Jsonapi.AppType, {
          data: "slack integration has been removed"
        })
      );
    } else {
      res.status(500).send({
        errors: [
          {
            error: "Internal Server Error",
            message: "An unexpected error occurred"
          }
        ]
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};
exports.getEmailDetails = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const data = await storageConnection.getConfig("emailIntegration");
    if (data && data.item) {
      data.item.value = JSON.parse(data.item.value);
      delete data.item.value.url;
    }
    res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, data.item || {}));
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};
exports.addEmailDetails = async (req, res) => {
  try {
    const { sender, host, port, username, password, receivers } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    const details = {
      sender,
      host,
      port,
      username,
      password,
      receivers,
      status: true
    };
    const result = await storageConnection.setConfig(
      "emailIntegration",
      JSON.stringify(details)
    );
    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      await Alerts.clearEmailTransport();
      res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, result.item));
    } else {
      res.status(500).send({
        errors: [
          {
            error: "Internal Server Error",
            message: "An unexpected error occurred"
          }
        ]
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};
exports.updateEmailDetails = async (req, res) => {
  try {
    const { status } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    const data = await storageConnection.getConfig("emailIntegration");
    if (data && data.item) {
      let parsedValue;
      try {
        parsedValue = JSON.parse(data.item.value);
        parsedValue.status = JSON.parse(status);
      } catch (err) {
        console.error(err);
        res.status(500).send({
          errors: [
            {
              error: "Internal Server Error",
              message: err && err.message ? err.message : "An unexpected error occurred"
            }
          ]
        });
      }
      data.item.value.status = JSON.parse(status);
      const result = await storageConnection.setConfig(
        "emailIntegration",
        JSON.stringify(parsedValue)
      );
      if (result && result.item) {
        result.item.value = JSON.parse(result.item.value);
        await Alerts.clearEmailTransport();
        res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, result.item));
      } else {
        res.status(500).send({
          errors: [
            {
              error: "Internal Server Error",
              message: "An unexpected error occurred"
            }
          ]
        });
      }
    } else {
      res.status(500).send({
        errors: [
          {
            error: "Internal Server Error",
            message: "An unexpected error occurred"
          }
        ]
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};
exports.deleteEmailDetails = async (req, res) => {
  try {
    const { url } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    const data = await storageConnection.deleteConfig("emailIntegration");
    if (data) {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, { url }));
    } else {
      res.status(500).send({
        errors: [
          {
            error: "Internal Server Error",
            message: "An unexpected error occurred"
          }
        ]
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};
exports.testSlackNotification = async (req, res) => {
  try {
    const result = await Alerts.testSlackAlert("This is a test notification from the Errsole Logger.", "Test Notification");
    res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, { success: result }));
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};
exports.testEmailNotification = async (req, res) => {
  try {
    const result = await Alerts.testEmailAlert("This is a test notification from the Errsole Logger. If you received this email, it means your SMTP settings are correctly configured in Errsole.", "Test Notification");
    res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, { success: result }));
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};
exports.getAlertUrlDetails = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const data = await storageConnection.getConfig("alertUrl");
    if (data && data.item) {
      data.item.value = JSON.parse(data.item.value);
    }
    res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, data.item || {}));
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};
exports.addAlertUrlDetails = async (req, res) => {
  try {
    const { url } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    const details = { url };
    const result = await storageConnection.setConfig(
      "alertUrl",
      JSON.stringify(details)
    );
    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, result.item));
    } else {
      res.status(500).send({
        errors: [
          {
            error: "Internal Server Error",
            message: "An unexpected error occurred"
          }
        ]
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: "Internal Server Error",
          message: error && error.message ? error.message : "An unexpected error occurred"
        }
      ]
    });
  }
};

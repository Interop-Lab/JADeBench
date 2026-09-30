'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x3bef1b, _0x42e546) => function _0x11522d() {
  if (!_0x42e546) {
    (0, _0x3bef1b[__getOwnPropNames(_0x3bef1b)[0]])((_0x42e546 = {
      exports: {}
    }).exports, _0x42e546);
  }
  return _0x42e546.exports;
};
var require_storageConnection = __commonJS({
  "../work/errsole__errsole.js/lib/main/server/storageConnection.js"(_0x29297f, _0x3b7a09) {
    'use strict';

    var _0x12cf71 = null;
    function _0x59103d(_0xe5c8ea) {
      if (!_0x12cf71) {
        _0x12cf71 = _0xe5c8ea;
      }
      return _0x12cf71;
    }
    function _0x36c532() {
      if (!_0x12cf71) {
        throw new Error("Storage connection has not been initialized.");
      }
      return _0x12cf71;
    }
    const _0x3a8570 = {
      initializeStorageConnection: _0x59103d,
      getStorageConnection: _0x36c532
    };
    _0x3b7a09.exports = _0x3a8570;
  }
});
var {
  getStorageConnection
} = require_storageConnection();
var axios = require("axios");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
exports.customLoggerAlert = async function (_0x44a92a, _0xc26179, _0x1fa97f, _0x2ba54d) {
  try {
    const {
      isDuplicateAlert: _0x1822fd,
      todayCount: _0x4f8b47
    } = await checkAlertStatus(_0x44a92a, _0xc26179, _0x1fa97f);
    if (_0x1822fd) {
      return false;
    }
    await SlackService.sendAlert(_0x44a92a, "Alert", _0xc26179, _0x1fa97f, _0x4f8b47, _0x2ba54d);
    await EmailService.sendAlert(_0x44a92a, "Alert", _0xc26179, _0x1fa97f, _0x4f8b47, _0x2ba54d);
    return true;
  } catch (_0xbf14e2) {
    console.error("Error in customLoggerAlert:", _0xbf14e2);
    return false;
  }
};
exports.handleUncaughtExceptions = async function (_0x3d9c14, _0x155dae, _0x150f21, _0xafbc19) {
  try {
    const {
      isDuplicateAlert: _0x2b4895,
      todayCount: _0x46354a
    } = await checkAlertStatus(_0x3d9c14, _0x155dae, _0x150f21);
    if (_0x2b4895) {
      return false;
    }
    await SlackService.sendAlert(_0x3d9c14, "Uncaught Exception", _0x155dae, _0x150f21, _0x46354a, _0xafbc19);
    await EmailService.sendAlert(_0x3d9c14, "Uncaught Exception", _0x155dae, _0x150f21, _0x46354a, _0xafbc19);
    return true;
  } catch (_0x39a37b) {
    console.error("Error in handleUncaughtExceptions:", _0x39a37b);
    return false;
  }
};
exports.testSlackAlert = async function (_0x1955d9, _0xf64f4c) {
  try {
    const _0x514465 = await SlackService.sendAlert(_0x1955d9, "Test", _0xf64f4c);
    return _0x514465;
  } catch (_0x93b7d9) {
    console.error("Error in testSlackAlert:", _0x93b7d9);
    return false;
  }
};
exports.testEmailAlert = async function (_0x303aa7, _0xe08570) {
  try {
    const _0x9c98a3 = await EmailService.sendAlert(_0x303aa7, "Test", _0xe08570);
    return _0x9c98a3;
  } catch (_0x324e60) {
    console.error("Error in testEmailAlert:", _0x324e60);
    return false;
  }
};
var SlackService = {};
SlackService.sendAlert = async function (_0x5636d2, _0x41b582, _0x30facd, _0x2cff60, _0x61dd6, _0x29e91a) {
  try {
    const _0x49a213 = getStorageConnection();
    const _0x517b52 = await _0x49a213.getConfig("slackIntegration");
    if (_0x517b52 && _0x517b52.item) {
      const _0x4a7ed0 = JSON.parse(_0x517b52.item.value);
      if (!_0x4a7ed0.status) {
        return false;
      }
      const _0x4bb446 = await _0x49a213.getConfig("alertUrl");
      let _0x5105f8;
      if (_0x4bb446 && _0x4bb446.item && _0x2cff60) {
        const _0x54270c = JSON.parse(_0x4bb446.item.value);
        let _0x5afd7a;
        if (!_0x29e91a) {
          _0x5afd7a = new Date(new Date().getTime() + 2000).toISOString();
        } else {
          _0x5afd7a = roundUpToNextSecond(_0x29e91a);
          _0x5afd7a = _0x5afd7a.toISOString();
        }
        _0x5105f8 = _0x54270c.url + "#/logs?errsole_log_id=" + _0x2cff60 + "&timestamp=" + _0x5afd7a;
      }
      const _0x20117f = _0x4a7ed0.url;
      const _0x51a1fc = blockKit(_0x5636d2, _0x41b582, _0x30facd, _0x5105f8, _0x61dd6);
      _0x51a1fc.username = _0x4a7ed0.username || "Errsole";
      _0x51a1fc.icon_url = _0x4a7ed0.icon_url || "https://avatars.githubusercontent.com/u/84983840";
      const _0x16c38c = axios.post(_0x20117f, _0x51a1fc);
      const _0x3af8c9 = new Promise((_0x4ba6bf, _0x410987) => {
        setTimeout(() => {
          _0x410987(new Error("Slack send timed out"));
        }, 5000);
      });
      try {
        await Promise.race([_0x16c38c, _0x3af8c9]);
      } catch (_0x123368) {
        return false;
      }
      return true;
    }
    return false;
  } catch (_0x56686b) {
    console.error("Failed to send slack alert:", _0x56686b);
    return false;
  }
};
function blockKit(_0x3fea5b, _0x5b6f6e, _0x3e68f5 = {}, _0x1da4a0, _0x49bf58) {
  const _0x558978 = {
    blocks: []
  };
  _0x558978.blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: " :warning: *Errsole: " + _0x5b6f6e + "*"
    }
  });
  if (_0x3e68f5.appName) {
    const _0x366461 = {
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
          text: _0x3e68f5.appName
        }]
      }]
    };
    _0x558978.blocks.push(_0x366461);
  }
  if (_0x3e68f5.environmentName) {
    const _0x21bab4 = {
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
          text: _0x3e68f5.environmentName
        }]
      }]
    };
    _0x558978.blocks.push(_0x21bab4);
  }
  if (_0x3e68f5.serverName) {
    const _0x1fc778 = {
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
          text: _0x3e68f5.serverName
        }]
      }]
    };
    _0x558978.blocks.push(_0x1fc778);
  }
  const _0x1bf6a9 = {
    type: "rich_text",
    elements: [{
      type: "rich_text_preformatted",
      elements: [{
        type: "text",
        text: _0x3fea5b
      }]
    }]
  };
  _0x558978.blocks.push(_0x1bf6a9);
  if (_0x49bf58) {
    if (_0x5b6f6e === "Alert") {
      _0x558978.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "This alert has occurred *" + _0x49bf58 + " time" + (_0x49bf58 > 1 ? "s" : "") + " today*."
        }
      });
    } else {
      _0x558978.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "This error has occurred *" + _0x49bf58 + " time" + (_0x49bf58 > 1 ? "s" : "") + " today*."
        }
      });
    }
  }
  if (_0x1da4a0) {
    _0x558978.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "<" + _0x1da4a0 + "|Click here> to view the logs in the Errsole dashboard."
      }
    });
  }
  if (_0x5b6f6e === "Alert") {
    const _0x732bc9 = {
      type: "section",
      text: {}
    };
    _0x732bc9.text.type = "mrkdwn";
    _0x732bc9.text.text = "_Note:_\n• _You will not receive another notification for this alert on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._";
    _0x558978.blocks.push(_0x732bc9);
  } else if (_0x5b6f6e !== "Test") {
    const _0x60699e = {
      type: "section",
      text: {}
    };
    _0x60699e.text.type = "mrkdwn";
    _0x60699e.text.text = "_Note:_\n• _You will not receive another notification for this error on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._";
    _0x558978.blocks.push(_0x60699e);
  }
  _0x558978.blocks.push({
    type: "divider"
  });
  return _0x558978;
}
var EmailService = {
  transporter: null
};
EmailService.emailTransport = async function () {
  try {
    if (this.transporter === null) {
      const _0x117867 = getStorageConnection();
      const _0x1ca259 = await _0x117867.getConfig("emailIntegration");
      if (_0x1ca259 && _0x1ca259.item) {
        const _0x85c720 = JSON.parse(_0x1ca259.item.value);
        this.transporter = nodemailer.createTransport({
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateLimit: 10,
          host: _0x85c720.host,
          port: parseInt(_0x85c720.port),
          secure: parseInt(_0x85c720.port) === 465,
          auth: {
            user: _0x85c720.username,
            pass: _0x85c720.password
          }
        });
      }
    }
  } catch (_0x5a4ce4) {
    console.error("Failed to create email transporter: ", _0x5a4ce4);
    this.transporter = null;
  }
};
EmailService.sendAlert = async function (_0x2f6265, _0x97a54b, _0x58f0cd, _0x5544f7, _0x364891, _0x2f2d3b) {
  try {
    await EmailService.emailTransport();
    if (this.transporter !== null) {
      const _0x8b380b = getStorageConnection();
      const _0x58c470 = await _0x8b380b.getConfig("emailIntegration");
      if (_0x58c470 && _0x58c470.item) {
        const _0x531106 = JSON.parse(_0x58c470.item.value);
        if (!_0x531106.status) {
          return false;
        }
        const _0x4de52b = await _0x8b380b.getConfig("alertUrl");
        let _0x5c73c1;
        if (_0x4de52b && _0x4de52b.item && _0x5544f7) {
          const _0x5d62b4 = JSON.parse(_0x4de52b.item.value);
          let _0x8b1c37;
          if (!_0x2f2d3b) {
            _0x8b1c37 = new Date(new Date().getTime() + 2000).toISOString();
          } else {
            _0x8b1c37 = roundUpToNextSecond(_0x2f2d3b);
            _0x8b1c37 = _0x8b1c37.toISOString();
          }
          _0x5c73c1 = _0x5d62b4.url + "#/logs?errsole_log_id=" + _0x5544f7 + "&timestamp=" + _0x8b1c37;
        }
        let _0x18754a;
        let _0x2fcae2 = "";
        if (_0x58f0cd.appName && _0x58f0cd.environmentName) {
          _0x18754a = "Errsole: " + _0x97a54b + " (" + _0x58f0cd.appName + " app, " + _0x58f0cd.environmentName + " environment)";
          _0x2fcae2 = "<p><b>App Name:</b> " + _0x58f0cd.appName + "</p>\n          <p><b>Environment Name:</b> " + _0x58f0cd.environmentName + "</p>";
        } else if (_0x58f0cd.appName) {
          _0x18754a = "Errsole: " + _0x97a54b + " (" + _0x58f0cd.appName + " app)";
          _0x2fcae2 = "<p><b>App Name:</b> " + _0x58f0cd.appName + "</p>";
        } else if (_0x58f0cd.environmentName) {
          _0x18754a = "Errsole: " + _0x97a54b + " (" + _0x58f0cd.environmentName + " environment)";
          _0x2fcae2 = "<p><b>Environment Name:</b> " + _0x58f0cd.environmentName + "</p>";
        } else {
          _0x18754a = "Errsole: " + _0x97a54b;
        }
        if (_0x58f0cd.serverName) {
          _0x2fcae2 += "<p><b>Server Name:</b> " + _0x58f0cd.serverName + "</p>";
        }
        _0x2f6265 = _0x2fcae2 + "<pre style=\"border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;\">" + _0x2f6265 + "</pre>";
        if (_0x364891) {
          if (_0x97a54b === "Alert") {
            _0x2f6265 = _0x2f6265 + "<p>This alert has occurred <b>" + _0x364891 + " time" + (_0x364891 > 1 ? "s" : "") + " today</b>.</p>";
          } else {
            _0x2f6265 = _0x2f6265 + "<p>This error has occurred <b>" + _0x364891 + " time" + (_0x364891 > 1 ? "s" : "") + " today</b>.</p>";
          }
        }
        if (_0x5c73c1) {
          _0x2f6265 = _0x2f6265 + "<p><a href=\"" + _0x5c73c1 + "\">Click here</a> to view the logs in the Errsole dashboard.</p>";
        }
        if (_0x97a54b === "Alert") {
          _0x2f6265 = _0x2f6265 + "<br/><p style=\"margin:0px;font-size:small\"><i>Note:<ul style=\"margin:0px;padding:0px 5px;\"><li>You will not receive another notification for this alert on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>";
        } else {
          _0x2f6265 = _0x2f6265 + "<br/><p style=\"margin:0px;font-size:small\"><i>Note:<ul style=\"margin:0px;padding:0px 5px;\"><li>You will not receive another notification for this error on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>";
        }
        const _0x2ead5a = {
          from: _0x531106.sender,
          to: _0x531106.receivers,
          subject: _0x18754a,
          html: _0x2f6265
        };
        const _0x1394e7 = this.transporter.sendMail(_0x2ead5a);
        const _0x295647 = new Promise((_0x35a5c8, _0x13ea9b) => {
          setTimeout(() => {
            _0x13ea9b(new Error("Email send timed out"));
          }, 5000);
        });
        try {
          await Promise.race([_0x1394e7, _0x295647]);
        } catch (_0x26455f) {
          console.log(_0x26455f);
          return false;
        }
        return true;
      }
    }
    return false;
  } catch (_0x213511) {
    console.error("Failed to send email alert:", _0x213511);
    return false;
  }
};
exports.clearEmailTransport = async function () {
  EmailService.transporter = null;
  return true;
};
var checkAlertStatus = async (_0x4947e1, _0x3b1006, _0x2fc058) => {
  let _0x3ea726 = false;
  let _0x299231 = 0;
  const _0x2075ab = _0x501a78 => {
    if (typeof _0x501a78 === "string") {
      return _0x501a78;
    }
    try {
      return JSON.stringify(_0x501a78);
    } catch {
      return String(_0x501a78);
    }
  };
  const _0x24cf68 = getStorageConnection();
  if (_0x24cf68 && _0x24cf68.insertNotificationItem) {
    const _0x7708e0 = _0x2075ab(_0x4947e1) + "|" + _0x2075ab(_0x3b1006);
    const _0x4ab7f6 = crypto.createHash("sha256").update(_0x7708e0).digest("hex");
    const _0x1b3492 = {
      errsole_id: _0x2fc058,
      hashed_message: _0x4ab7f6,
      hostname: _0x3b1006.serverName
    };
    const _0x4711ca = _0x1b3492;
    try {
      const _0x49894f = await _0x24cf68.insertNotificationItem(_0x4711ca);
      if (_0x49894f) {
        const _0x1d9bf8 = _0x49894f.previousNotificationItem;
        _0x299231 = _0x49894f.todayNotificationCount;
        if (_0x1d9bf8) {
          const _0x3febff = new Date();
          const _0x1a0f76 = new Date(_0x1d9bf8.created_at);
          if (_0x3febff.getUTCFullYear() === _0x1a0f76.getUTCFullYear() && _0x3febff.getUTCMonth() === _0x1a0f76.getUTCMonth() && _0x3febff.getUTCDate() === _0x1a0f76.getUTCDate() && _0x3febff.getUTCHours() === _0x1a0f76.getUTCHours()) {
            _0x3ea726 = true;
          }
        }
      }
    } catch (_0x3c8bed) {
      console.error("Error inserting notification item:", _0x3c8bed);
      return false;
    }
  }
  const _0x363193 = {
    isDuplicateAlert: _0x3ea726,
    todayCount: _0x299231
  };
  return _0x363193;
};
function roundUpToNextSecond(_0x287f27) {
  const _0x419c62 = new Date(_0x287f27);
  if (_0x419c62.getMilliseconds() > 0) {
    _0x419c62.setSeconds(_0x419c62.getSeconds() + 1);
    _0x419c62.setMilliseconds(0);
  }
  return _0x419c62;
}
exports.SlackService = SlackService;
exports.EmailService = EmailService;
"use strict";

const axios = require("axios");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// This singleton is the bundled storage-connection module used by the alert services.
let storageConnection = null;

function initializeStorageConnection(connection) {
  if (!storageConnection) storageConnection = connection;
  return storageConnection;
}

function getStorageConnection() {
  if (!storageConnection) {
    throw new Error("Storage connection has not been initialized.");
  }
  return storageConnection;
}

function roundUpToNextSecond(value) {
  const date = new Date(value);
  if (date.getMilliseconds() > 0) {
    date.setSeconds(date.getSeconds() + 1);
    date.setMilliseconds(0);
  }
  return date;
}

function createLogUrl(config, logId, timestamp) {
  if (!config?.item || !logId) return undefined;

  const { url } = JSON.parse(config.item.value);
  const date = timestamp
    ? roundUpToNextSecond(timestamp)
    : new Date(Date.now() + 2000);

  return `${url}#/logs?errsole_log_id=${logId}&timestamp=${date.toISOString()}`;
}

function addMetadataBlock(blocks, label, value) {
  if (!value) return;
  blocks.push({
    type: "rich_text",
    elements: [
      {
        type: "rich_text_section",
        elements: [
          { type: "text", text: `${label}: `, style: { bold: true } },
          { type: "text", text: value },
        ],
      },
    ],
  });
}

function blockKit(message, alertType, metadata = {}, logUrl, todayCount) {
  const payload = { blocks: [] };

  payload.blocks.push({
    type: "section",
    text: { type: "mrkdwn", text: ` :warning: *Errsole: ${alertType}*` },
  });

  addMetadataBlock(payload.blocks, "App Name", metadata.appName);
  addMetadataBlock(payload.blocks, "Environment Name", metadata.environmentName);
  addMetadataBlock(payload.blocks, "Server Name", metadata.serverName);

  payload.blocks.push({
    type: "rich_text",
    elements: [
      {
        type: "rich_text_preformatted",
        elements: [{ type: "text", text: message }],
      },
    ],
  });

  if (todayCount) {
    const noun = alertType === "Alert" ? "alert" : "error";
    payload.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `This ${noun} has occurred *${todayCount} time${todayCount > 1 ? "s" : ""} today*.`,
      },
    });
  }

  if (logUrl) {
    payload.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<${logUrl}|Click here> to view the logs in the Errsole dashboard.`,
      },
    });
  }

  if (alertType === "Alert") {
    payload.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "_Note:_\n• _You will not receive another notification for this alert on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._",
      },
    });
  } else if (alertType !== "Test") {
    payload.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "_Note:_\n• _You will not receive another notification for this error on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._",
      },
    });
  }

  payload.blocks.push({ type: "divider" });
  return payload;
}

const SlackService = {
  async sendAlert(message, alertType, metadata, logId, todayCount, timestamp) {
    try {
      const storage = getStorageConnection();
      const result = await storage.getConfig("slackIntegration");
      if (!result?.item) return false;

      const integration = JSON.parse(result.item.value);
      if (!integration.status) return false;

      const alertUrl = await storage.getConfig("alertUrl");
      const logUrl = createLogUrl(alertUrl, logId, timestamp);
      const payload = blockKit(message, alertType, metadata, logUrl, todayCount);

      payload.username = integration.username || "Errsole";
      payload.icon_url =
        integration.icon_url || "https://avatars.githubusercontent.com/u/84983840";

      const request = axios.post(integration.url, payload);
      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error("Slack send timed out")), 5000);
      });

      try {
        await Promise.race([request, timeout]);
      } catch {
        return false;
      }
      return true;
    } catch (error) {
      console.error("Failed to send slack alert:", error);
      return false;
    }
  },
};

const ALERT_NOTE =
  '<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this alert on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>';
const ERROR_NOTE =
  '<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this error on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>';

const EmailService = {
  transporter: null,

  async emailTransport() {
    try {
      if (this.transporter === null) {
        const storage = getStorageConnection();
        const result = await storage.getConfig("emailIntegration");
        if (result?.item) {
          const integration = JSON.parse(result.item.value);
          const port = parseInt(integration.port);
          this.transporter = nodemailer.createTransport({
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateLimit: 10,
            host: integration.host,
            port,
            secure: port === 465,
            auth: {
              user: integration.username,
              pass: integration.password,
            },
          });
        }
      }
    } catch (error) {
      console.error("Failed to create email transporter: ", error);
      this.transporter = null;
    }
  },

  async sendAlert(message, alertType, metadata, logId, todayCount, timestamp) {
    try {
      await this.emailTransport();
      if (this.transporter === null) return false;

      const storage = getStorageConnection();
      const result = await storage.getConfig("emailIntegration");
      if (!result?.item) return false;

      const integration = JSON.parse(result.item.value);
      if (!integration.status) return false;

      const alertUrl = await storage.getConfig("alertUrl");
      const logUrl = createLogUrl(alertUrl, logId, timestamp);
      metadata ||= {};

      let subject;
      let metadataHtml = "";
      if (metadata.appName && metadata.environmentName) {
        subject = `Errsole: ${alertType} (${metadata.appName} app, ${metadata.environmentName} environment)`;
        metadataHtml = `<p><b>App Name:</b> ${metadata.appName}</p>\n          <p><b>Environment Name:</b> ${metadata.environmentName}</p>`;
      } else if (metadata.appName) {
        subject = `Errsole: ${alertType} (${metadata.appName} app)`;
        metadataHtml = `<p><b>App Name:</b> ${metadata.appName}</p>`;
      } else if (metadata.environmentName) {
        subject = `Errsole: ${alertType} (${metadata.environmentName} environment)`;
        metadataHtml = `<p><b>Environment Name:</b> ${metadata.environmentName}</p>`;
      } else {
        subject = `Errsole: ${alertType}`;
      }

      if (metadata.serverName) {
        metadataHtml += `<p><b>Server Name:</b> ${metadata.serverName}</p>`;
      }

      let html = `${metadataHtml}<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${message}</pre>`;
      if (todayCount) {
        const noun = alertType === "Alert" ? "alert" : "error";
        html += `<p>This ${noun} has occurred <b>${todayCount} time${todayCount > 1 ? "s" : ""} today</b>.</p>`;
      }
      if (logUrl) {
        html += `<p><a href="${logUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
      }
      html += alertType === "Alert" ? ALERT_NOTE : ERROR_NOTE;

      const send = this.transporter.sendMail({
        from: integration.sender,
        to: integration.receivers,
        subject,
        html,
      });
      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error("Email send timed out")), 5000);
      });

      try {
        await Promise.race([send, timeout]);
      } catch (error) {
        console.log(error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Failed to send email alert:", error);
      return false;
    }
  },
};

function serializeForHash(value) {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

async function checkAlertStatus(message, metadata, errsoleId) {
  let isDuplicateAlert = false;
  let todayCount = 0;
  const storage = getStorageConnection();

  if (storage?.insertNotificationItem) {
    const source = `${serializeForHash(message)}|${serializeForHash(metadata)}`;
    const hashedMessage = crypto.createHash("sha256").update(source).digest("hex");
    const item = {
      errsole_id: errsoleId,
      hashed_message: hashedMessage,
      hostname: metadata.serverName,
    };

    try {
      const result = await storage.insertNotificationItem(item);
      if (result) {
        todayCount = result.todayNotificationCount;
        if (result.previousNotificationItem) {
          const now = new Date();
          const previous = new Date(result.previousNotificationItem.created_at);
          isDuplicateAlert =
            now.getUTCFullYear() === previous.getUTCFullYear() &&
            now.getUTCMonth() === previous.getUTCMonth() &&
            now.getUTCDate() === previous.getUTCDate() &&
            now.getUTCHours() === previous.getUTCHours();
        }
      }
    } catch (error) {
      console.error("Error inserting notification item:", error);
      return false;
    }
  }

  return { isDuplicateAlert, todayCount };
}

async function sendCheckedAlert(message, alertType, metadata, errsoleId, timestamp) {
  const { isDuplicateAlert, todayCount } = await checkAlertStatus(
    message,
    metadata,
    errsoleId,
  );
  if (isDuplicateAlert) return false;

  await SlackService.sendAlert(
    message,
    alertType,
    metadata,
    errsoleId,
    todayCount,
    timestamp,
  );
  await EmailService.sendAlert(
    message,
    alertType,
    metadata,
    errsoleId,
    todayCount,
    timestamp,
  );
  return true;
}

exports.customLoggerAlert = async function customLoggerAlert(
  message,
  metadata,
  errsoleId,
  timestamp,
) {
  try {
    return await sendCheckedAlert(message, "Alert", metadata, errsoleId, timestamp);
  } catch (error) {
    console.error("Error in customLoggerAlert:", error);
    return false;
  }
};

exports.handleUncaughtExceptions = async function handleUncaughtExceptions(
  message,
  metadata,
  errsoleId,
  timestamp,
) {
  try {
    return await sendCheckedAlert(
      message,
      "Uncaught Exception",
      metadata,
      errsoleId,
      timestamp,
    );
  } catch (error) {
    console.error("Error in handleUncaughtExceptions:", error);
    return false;
  }
};

exports.testSlackAlert = async function testSlackAlert(message, metadata) {
  try {
    return await SlackService.sendAlert(message, "Test", metadata);
  } catch (error) {
    console.error("Error in testSlackAlert:", error);
    return false;
  }
};

exports.testEmailAlert = async function testEmailAlert(message, metadata) {
  try {
    return await EmailService.sendAlert(message, "Test", metadata);
  } catch (error) {
    console.error("Error in testEmailAlert:", error);
    return false;
  }
};

exports.clearEmailTransport = async function clearEmailTransport() {
  EmailService.transporter = null;
  return true;
};

exports.SlackService = SlackService;
exports.EmailService = EmailService;

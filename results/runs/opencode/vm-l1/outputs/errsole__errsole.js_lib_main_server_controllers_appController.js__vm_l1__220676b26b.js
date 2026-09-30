'use strict';

const Jsonapi = require('../utils/jsonapiUtil');
const NPMUpdates = require('../utils/npmUpdates');
const { getStorageConnection } = require('../storageConnection');
const packageJson = require('../../../../package.json');
const helpers = require('../utils/helpers');
const Alerts = require('../utils/alerts');

const INTERNAL_SERVER_ERROR = 'Internal Server Error';
const UNEXPECTED_ERROR = 'An unexpected error occurred';
const SLACK_CONFIG = 'slackIntegration';
const EMAIL_CONFIG = 'emailIntegration';
const ALERT_URL_CONFIG = 'alertUrl';

function serialize(value) {
  return Jsonapi.Serializer.serialize(Jsonapi.AppType, value);
}

function sendUnexpectedError(response, error) {
  console.error(error);
  response.status(500).send({
    errors: [{
      error: INTERNAL_SERVER_ERROR,
      message: error && error.message ? error.message : UNEXPECTED_ERROR,
    }],
  });
}

function sendStorageError(response) {
  response.status(500).send({
    errors: [{ error: INTERNAL_SERVER_ERROR, message: UNEXPECTED_ERROR }],
  });
}

function parseStoredValue(result) {
  if (result && result.item) {
    result.item.value = JSON.parse(result.item.value);
  }
  return result;
}

exports.checkUpdates = async function checkUpdates(request, response) {
  try {
    const errsoleLatestVersion = await NPMUpdates.fetchLatestVersion('errsole');
    const storage = getStorageConnection();
    const storageLatestVersion = await NPMUpdates.fetchLatestVersion(storage.name);

    response.send(serialize({
      name: packageJson.name,
      version: packageJson.version,
      latest_version: errsoleLatestVersion,
      storage_name: storage.name,
      storage_version: storage.version,
      storage_latest_version: storageLatestVersion,
      storage_dialect: storage.dialect,
    }));
  } catch (error) {
    sendUnexpectedError(response, error);
  }
};

exports.getSlackDetails = async function getSlackDetails(request, response) {
  try {
    const result = parseStoredValue(
      await getStorageConnection().getConfig(SLACK_CONFIG),
    );
    if (result && result.item) delete result.item.value.url;
    response.send(serialize(result.item || {}));
  } catch (error) {
    sendUnexpectedError(response, error);
  }
};

exports.addSlackDetails = async function addSlackDetails(request, response) {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const isSlackUrl = await helpers.SlackUrl(url);
    if (!isSlackUrl) {
      return response.status(409).send({
        errors: [{
          error: 'Conflict',
          message: 'You have sent a url which is not a slack url.',
        }],
      });
    }

    const storage = getStorageConnection();
    const existingConfig = await storage.getConfig(SLACK_CONFIG);
    if (existingConfig && !existingConfig.item) {
      const slackConfig = {
        url,
        username: 'Errsole',
        icon_url: 'https://avatars.githubusercontent.com/u/84983840',
        status: true,
      };
      const result = parseStoredValue(
        await storage.setConfig(SLACK_CONFIG, JSON.stringify(slackConfig)),
      );
      if (result && result.item) {
        response.send(serialize(result.item));
      } else {
        sendStorageError(response);
      }
    } else {
      response.status(409).send({
        errors: [{
          error: 'Conflict',
          message: 'You have already added a webhook url for slack.',
        }],
      });
    }
  } catch (error) {
    sendUnexpectedError(response, error);
  }
};

exports.updateSlackDetails = async function updateSlackDetails(request, response) {
  try {
    const { status } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const existingConfig = await storage.getConfig(SLACK_CONFIG);
    if (!existingConfig || !existingConfig.item) {
      sendStorageError(response);
      return;
    }

    let slackConfig;
    try {
      slackConfig = JSON.parse(existingConfig.item.value);
      slackConfig.status = JSON.parse(status);
    } catch (error) {
      sendUnexpectedError(response, error);
    }

    // Retained from the recovered source. Depending on the storage adapter,
    // `value` may also expose the parsed value.
    existingConfig.item.value.status = JSON.parse(status);
    const result = parseStoredValue(
      await storage.setConfig(SLACK_CONFIG, JSON.stringify(slackConfig)),
    );
    if (result && result.item) response.send(serialize(result.item));
    else sendStorageError(response);
  } catch (error) {
    sendUnexpectedError(response, error);
  }
};

exports.deleteSlackDetails = async function deleteSlackDetails(request, response) {
  try {
    const deleted = await getStorageConnection().deleteConfig(SLACK_CONFIG);
    if (deleted) {
      response.send(serialize({ data: 'slack integration has been removed' }));
    } else {
      sendStorageError(response);
    }
  } catch (error) {
    sendUnexpectedError(response, error);
  }
};

exports.getEmailDetails = async function getEmailDetails(request, response) {
  try {
    const result = parseStoredValue(
      await getStorageConnection().getConfig(EMAIL_CONFIG),
    );
    if (result && result.item) delete result.item.value.url;
    response.send(serialize(result.item || {}));
  } catch (error) {
    sendUnexpectedError(response, error);
  }
};

exports.addEmailDetails = async function addEmailDetails(request, response) {
  try {
    const { sender, host, port, username, password, receivers } =
      helpers.extractAttributes(request.body);
    const emailConfig = {
      sender,
      host,
      port,
      username,
      password,
      receivers,
      status: true,
    };
    const result = parseStoredValue(
      await getStorageConnection().setConfig(
        EMAIL_CONFIG,
        JSON.stringify(emailConfig),
      ),
    );
    if (result && result.item) {
      await Alerts.clearEmailTransport();
      response.send(serialize(result.item));
    } else {
      sendStorageError(response);
    }
  } catch (error) {
    sendUnexpectedError(response, error);
  }
};

exports.updateEmailDetails = async function updateEmailDetails(request, response) {
  try {
    const { status } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const existingConfig = await storage.getConfig(EMAIL_CONFIG);
    if (!existingConfig || !existingConfig.item) {
      sendStorageError(response);
      return;
    }

    let emailConfig;
    try {
      emailConfig = JSON.parse(existingConfig.item.value);
      emailConfig.status = JSON.parse(status);
    } catch (error) {
      sendUnexpectedError(response, error);
    }

    existingConfig.item.value.status = JSON.parse(status);
    const result = parseStoredValue(
      await storage.setConfig(EMAIL_CONFIG, JSON.stringify(emailConfig)),
    );
    if (result && result.item) {
      await Alerts.clearEmailTransport();
      response.send(serialize(result.item));
    } else {
      sendStorageError(response);
    }
  } catch (error) {
    sendUnexpectedError(response, error);
  }
};

exports.deleteEmailDetails = async function deleteEmailDetails(request, response) {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const deleted = await getStorageConnection().deleteConfig(EMAIL_CONFIG);
    if (deleted) response.send(serialize({ url }));
    else sendStorageError(response);
  } catch (error) {
    sendUnexpectedError(response, error);
  }
};

exports.testSlackNotification = async function testSlackNotification(
  request,
  response,
) {
  try {
    const success = await Alerts.testSlackAlert(
      'This is a test notification from the Errsole Logger.',
      'Test Notification',
    );
    response.send(serialize({ success }));
  } catch (error) {
    sendUnexpectedError(response, error);
  }
};

exports.testEmailNotification = async function testEmailNotification(
  request,
  response,
) {
  try {
    const success = await Alerts.testEmailAlert(
      'This is a test notification from the Errsole Logger. If you received this email, it means your SMTP settings are correctly configured in Errsole.',
      'Test Notification',
    );
    response.send(serialize({ success }));
  } catch (error) {
    sendUnexpectedError(response, error);
  }
};

exports.getAlertUrlDetails = async function getAlertUrlDetails(request, response) {
  try {
    const result = parseStoredValue(
      await getStorageConnection().getConfig(ALERT_URL_CONFIG),
    );
    response.send(serialize(result.item || {}));
  } catch (error) {
    sendUnexpectedError(response, error);
  }
};

exports.addAlertUrlDetails = async function addAlertUrlDetails(request, response) {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const result = parseStoredValue(
      await getStorageConnection().setConfig(
        ALERT_URL_CONFIG,
        JSON.stringify({ url }),
      ),
    );
    if (result && result.item) response.send(serialize(result.item));
    else sendStorageError(response);
  } catch (error) {
    sendUnexpectedError(response, error);
  }
};

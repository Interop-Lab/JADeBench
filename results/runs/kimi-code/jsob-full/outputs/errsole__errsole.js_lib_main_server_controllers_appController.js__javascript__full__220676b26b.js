'use strict';

const Jsonapi = require('../utils/jsonapiUtil.js');
const NPMUpdates = require('../utils/npmUpdates.js');
const { getStorageConnection } = require('../storageConnection.js');
const packageJson = require('../../../../package.json');
const helpers = require('../utils/helpers.js');
const Alerts = require('../utils/alerts.js');

const INTERNAL_ERROR = 'Internal Server Error';
const UNEXPECTED_ERROR = 'An unexpected error occurred';

function sendError(response, error) {
  console.error(error);
  response.status(500).send({
    errors: [{
      error: INTERNAL_ERROR,
      message: error && error.message ? error.message : UNEXPECTED_ERROR
    }]
  });
}

function sendUnexpectedError(response) {
  response.status(500).send({
    errors: [{ error: INTERNAL_ERROR, message: UNEXPECTED_ERROR }]
  });
}

function serialize(response, value) {
  response.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, value));
}

exports.checkUpdates = async (request, response) => {
  try {
    const latestVersion = await NPMUpdates.fetchLatestVersion('errsole');
    const storage = getStorageConnection();
    const storageLatestVersion = await NPMUpdates.fetchLatestVersion(storage.name);

    serialize(response, {
      name: packageJson.name,
      version: packageJson.version,
      latest_version: latestVersion,
      storage_name: storage.name,
      storage_version: storage.version,
      storage_latest_version: storageLatestVersion,
      storage_dialect: storage.dialect
    });
  } catch (error) {
    sendError(response, error);
  }
};

exports.getSlackDetails = async (request, response) => {
  try {
    const result = await getStorageConnection().getConfig('slackIntegration');
    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      delete result.item.value.url;
    }
    serialize(response, result.item || {});
  } catch (error) {
    sendError(response, error);
  }
};

exports.addSlackDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    if (!await helpers.SlackUrl(url)) {
      return response.status(409).send({
        errors: [{ error: 'Conflict', message: 'You have sent a url which is not a slack url.' }]
      });
    }

    const storage = getStorageConnection();
    const existing = await storage.getConfig('slackIntegration');
    if (!existing || existing.item) {
      return response.status(409).send({
        errors: [{ error: 'Conflict', message: 'You have already added a webhook url for slack.' }]
      });
    }

    const result = await storage.setConfig('slackIntegration', JSON.stringify({
      url,
      username: 'Errsole',
      icon_url: 'https://avatars.githubusercontent.com/u/84983840',
      status: true
    }));
    if (!result || !result.item) return sendUnexpectedError(response);

    result.item.value = JSON.parse(result.item.value);
    serialize(response, result.item);
  } catch (error) {
    sendError(response, error);
  }
};

exports.updateSlackDetails = async (request, response) => {
  try {
    const { status } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const existing = await storage.getConfig('slackIntegration');
    if (!existing || !existing.item) return sendUnexpectedError(response);

    const value = JSON.parse(existing.item.value);
    value.status = JSON.parse(status);
    const result = await storage.setConfig('slackIntegration', JSON.stringify(value));
    if (!result || !result.item) return sendUnexpectedError(response);

    result.item.value = JSON.parse(result.item.value);
    serialize(response, result.item);
  } catch (error) {
    sendError(response, error);
  }
};

exports.deleteSlackDetails = async (request, response) => {
  try {
    const deleted = await getStorageConnection().deleteConfig('slackIntegration');
    if (!deleted) return sendUnexpectedError(response);
    serialize(response, { data: 'slack integration has been removed' });
  } catch (error) {
    sendError(response, error);
  }
};

exports.getEmailDetails = async (request, response) => {
  try {
    const result = await getStorageConnection().getConfig('emailIntegration');
    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      delete result.item.value.url;
    }
    serialize(response, result.item || {});
  } catch (error) {
    sendError(response, error);
  }
};

exports.addEmailDetails = async (request, response) => {
  try {
    const { sender, host, port, username, password, receivers } = helpers.extractAttributes(request.body);
    const result = await getStorageConnection().setConfig('emailIntegration', JSON.stringify({
      sender,
      host,
      port,
      username,
      password,
      receivers,
      status: true
    }));
    if (!result || !result.item) return sendUnexpectedError(response);

    result.item.value = JSON.parse(result.item.value);
    await Alerts.clearEmailTransport();
    serialize(response, result.item);
  } catch (error) {
    sendError(response, error);
  }
};

exports.updateEmailDetails = async (request, response) => {
  try {
    const { status } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const existing = await storage.getConfig('emailIntegration');
    if (!existing || !existing.item) return sendUnexpectedError(response);

    const value = JSON.parse(existing.item.value);
    value.status = JSON.parse(status);
    const result = await storage.setConfig('emailIntegration', JSON.stringify(value));
    if (!result || !result.item) return sendUnexpectedError(response);

    result.item.value = JSON.parse(result.item.value);
    await Alerts.clearEmailTransport();
    serialize(response, result.item);
  } catch (error) {
    sendError(response, error);
  }
};

exports.deleteEmailDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const deleted = await getStorageConnection().deleteConfig('emailIntegration');
    if (!deleted) return sendUnexpectedError(response);
    serialize(response, { url });
  } catch (error) {
    sendError(response, error);
  }
};

exports.testSlackNotification = async (request, response) => {
  try {
    const success = await Alerts.testSlackAlert(
      'This is a test notification from the Errsole Logger.',
      'Test Notification'
    );
    serialize(response, { success });
  } catch (error) {
    sendError(response, error);
  }
};

exports.testEmailNotification = async (request, response) => {
  try {
    const success = await Alerts.testEmailAlert(
      'This is a test notification from the Errsole Logger. If you received this email, it means your SMTP settings are correctly configured in Errsole.',
      'Test Notification'
    );
    serialize(response, { success });
  } catch (error) {
    sendError(response, error);
  }
};

exports.getAlertUrlDetails = async (request, response) => {
  try {
    const result = await getStorageConnection().getConfig('alertUrl');
    if (result && result.item) result.item.value = JSON.parse(result.item.value);
    serialize(response, result.item || {});
  } catch (error) {
    sendError(response, error);
  }
};

exports.addAlertUrlDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const result = await getStorageConnection().setConfig('alertUrl', JSON.stringify({ url }));
    if (!result || !result.item) return sendUnexpectedError(response);

    result.item.value = JSON.parse(result.item.value);
    serialize(response, result.item);
  } catch (error) {
    sendError(response, error);
  }
};

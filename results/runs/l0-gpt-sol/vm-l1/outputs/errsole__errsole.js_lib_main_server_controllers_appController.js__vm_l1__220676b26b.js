'use strict';

const Jsonapi = require('./utils/jsonapiUtil');
const NPMUpdates = require('./utils/npmUpdates');
const { getStorageConnection } = require('./storageConnection');
const packageJson = require('../../../package.json');
const helpers = require('./utils/helpers');
const Alerts = require('./utils/alerts');

const INTERNAL_SERVER_ERROR = 'Internal Server Error';
const UNEXPECTED_ERROR = 'An unexpected error occurred';

function sendInternalError(response, error) {
  console.error(error);
  response.status(500).send({
    errors: [{
      error: INTERNAL_SERVER_ERROR,
      message: error && error.message ? error.message : UNEXPECTED_ERROR
    }]
  });
}

exports.checkUpdates = async (request, response) => {
  try {
    const latestVersion = await NPMUpdates.fetchLatestVersion('errsole');
    const storage = getStorageConnection();
    const storageLatestVersion = await NPMUpdates.fetchLatestVersion(storage.name);

    response.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, {
      name: packageJson.name,
      version: packageJson.version,
      latest_version: latestVersion,
      storage_name: storage.name,
      storage_version: storage.version,
      storage_latest_version: storageLatestVersion,
      storage_dialect: storage.dialect
    }));
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getSlackDetails = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getConfig('slackIntegration');

    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      delete result.item.value.password;
    }

    response.send(
      Jsonapi.Serializer.serialize(Jsonapi.AppType, result.item || {})
    );
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.addSlackDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const validUrl = await helpers.SlackUrl(url);

    if (!validUrl) {
      return response.status(409).send({
        errors: [{
          error: 'Conflict',
          message: 'You have sent a url which is not a slack url.'
        }]
      });
    }

    const storage = getStorageConnection();
    const existing = await storage.getConfig('slackIntegration');

    if (existing && existing.item) {
      return response.status(409).send({
        errors: [{
          error: 'Conflict',
          message: 'You have already added a webhook url for slack.'
        }]
      });
    }

    const slackDetails = {
      url,
      username: 'Errsole',
      icon_url: 'https://avatars.githubusercontent.com/u/84983840',
      status: true
    };

    const result = await storage.setConfig(
      'slackIntegration',
      JSON.stringify(slackDetails)
    );

    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.AppType, result.item)
      );
    } else {
      response.status(500).send({
        errors: [{
          error: INTERNAL_SERVER_ERROR,
          message: UNEXPECTED_ERROR
        }]
      });
    }
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.updateSlackDetails = async (request, response) => {
  try {
    const { status } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const existing = await storage.getConfig('slackIntegration');

    if (!existing || !existing.item) {
      return response.status(500).send({
        errors: [{
          error: INTERNAL_SERVER_ERROR,
          message: UNEXPECTED_ERROR
        }]
      });
    }

    let details;

    try {
      details = JSON.parse(existing.item.value);
      details.status = JSON.parse(status);
    } catch (error) {
      console.error(error);
      response.status(500).send({
        errors: [{
          error: INTERNAL_SERVER_ERROR,
          message: error && error.message ? error.message : UNEXPECTED_ERROR
        }]
      });
    }

    existing.item.value.status = JSON.parse(status);

    const result = await storage.setConfig(
      'slackIntegration',
      JSON.stringify(details)
    );

    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.AppType, result.item)
      );
    } else {
      response.status(500).send({
        errors: [{
          error: INTERNAL_SERVER_ERROR,
          message: UNEXPECTED_ERROR
        }]
      });
    }
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.deleteSlackDetails = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const deleted = await storage.deleteConfig('slackIntegration');

    if (deleted) {
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.AppType, {
          data: 'slack integration has been removed'
        })
      );
    } else {
      response.status(500).send({
        errors: [{
          error: INTERNAL_SERVER_ERROR,
          message: UNEXPECTED_ERROR
        }]
      });
    }
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getEmailDetails = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getConfig('emailIntegration');

    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      delete result.item.value.password;
    }

    response.send(
      Jsonapi.Serializer.serialize(Jsonapi.AppType, result.item || {})
    );
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.addEmailDetails = async (request, response) => {
  try {
    const {
      sender,
      host,
      port,
      username,
      password,
      receivers
    } = helpers.extractAttributes(request.body);

    const storage = getStorageConnection();
    const emailDetails = {
      sender,
      host,
      port,
      username,
      password,
      receivers,
      status: true
    };

    const result = await storage.setConfig(
      'emailIntegration',
      JSON.stringify(emailDetails)
    );

    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      await Alerts.clearEmailTransport();
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.AppType, result.item)
      );
    } else {
      response.status(500).send({
        errors: [{
          error: INTERNAL_SERVER_ERROR,
          message: UNEXPECTED_ERROR
        }]
      });
    }
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.updateEmailDetails = async (request, response) => {
  try {
    const { status } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const existing = await storage.getConfig('emailIntegration');

    if (!existing || !existing.item) {
      return response.status(500).send({
        errors: [{
          error: INTERNAL_SERVER_ERROR,
          message: UNEXPECTED_ERROR
        }]
      });
    }

    let details;

    try {
      details = JSON.parse(existing.item.value);
      details.status = JSON.parse(status);
    } catch (error) {
      console.error(error);
      response.status(500).send({
        errors: [{
          error: INTERNAL_SERVER_ERROR,
          message: error && error.message ? error.message : UNEXPECTED_ERROR
        }]
      });
    }

    existing.item.value.status = JSON.parse(status);

    const result = await storage.setConfig(
      'emailIntegration',
      JSON.stringify(details)
    );

    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      await Alerts.clearEmailTransport();
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.AppType, result.item)
      );
    } else {
      response.status(500).send({
        errors: [{
          error: INTERNAL_SERVER_ERROR,
          message: UNEXPECTED_ERROR
        }]
      });
    }
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.deleteEmailDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const deleted = await storage.deleteConfig('emailIntegration');

    if (deleted) {
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.AppType, { url })
      );
    } else {
      response.status(500).send({
        errors: [{
          error: INTERNAL_SERVER_ERROR,
          message: UNEXPECTED_ERROR
        }]
      });
    }
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.testSlackNotification = async (request, response) => {
  try {
    const success = await Alerts.testSlackAlert(
      'This is a test notification from the Errsole Logger.',
      'Test Notification'
    );

    response.send(
      Jsonapi.Serializer.serialize(Jsonapi.AppType, { success })
    );
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.testEmailNotification = async (request, response) => {
  try {
    const success = await Alerts.testEmailAlert(
      'This is a test notification from the Errsole Logger. If you received this email, it means your SMTP settings are correctly configured in Errsole.',
      'Test Notification'
    );

    response.send(
      Jsonapi.Serializer.serialize(Jsonapi.AppType, { success })
    );
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.getAlertUrlDetails = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getConfig('alertUrl');

    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
    }

    response.send(
      Jsonapi.Serializer.serialize(Jsonapi.AppType, result.item || {})
    );
  } catch (error) {
    sendInternalError(response, error);
  }
};

exports.addAlertUrlDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    const result = await storage.setConfig(
      'alertUrl',
      JSON.stringify({ url })
    );

    if (result && result.item) {
      result.item.value = JSON.parse(result.item.value);
      response.send(
        Jsonapi.Serializer.serialize(Jsonapi.AppType, result.item)
      );
    } else {
      response.status(500).send({
        errors: [{
          error: INTERNAL_SERVER_ERROR,
          message: UNEXPECTED_ERROR
        }]
      });
    }
  } catch (error) {
    sendInternalError(response, error);
  }
};

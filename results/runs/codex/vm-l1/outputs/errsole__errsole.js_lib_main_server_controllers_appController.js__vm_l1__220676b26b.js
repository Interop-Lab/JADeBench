'use strict';

const Jsonapi = require('../utils/jsonapiUtil');
const NPMUpdates = require('../utils/npmUpdates');
const { getStorageConnection } = require('../storageConnection');
const packageJson = require('../../../../package.json');
const helpers = require('../utils/helpers');
const Alerts = require('../utils/alerts');

const INTERNAL_SERVER_ERROR = 'Internal Server Error';
const UNEXPECTED_ERROR = 'An unexpected error occurred';

function serialize(data) {
  return Jsonapi.Serializer.serialize(Jsonapi.AppType, data);
}

function sendInternalServerError(response, error) {
  response.status(500).send({
    errors: [
      {
        error: INTERNAL_SERVER_ERROR,
        message: error && error.message ? error.message : UNEXPECTED_ERROR,
      },
    ],
  });
}

exports.checkUpdates = async (_request, response) => {
  try {
    const latestVersion = await NPMUpdates.fetchLatestVersion('errsole');
    const storage = getStorageConnection();
    const latestStorageVersion = await NPMUpdates.fetchLatestVersion(storage.name);

    response.send(
      serialize({
        name: packageJson.name,
        version: packageJson.version,
        latest_version: latestVersion,
        storage_name: storage.name,
        storage_version: storage.version,
        storage_latest_version: latestStorageVersion,
        storage_dialect: storage.dialect,
      }),
    );
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.getSlackDetails = async (_request, response) => {
  try {
    const storage = getStorageConnection();
    const storedConfig = await storage.getConfig('slackIntegration');

    if (storedConfig && storedConfig.item) {
      storedConfig.item.value = JSON.parse(storedConfig.item.value);
      delete storedConfig.item.value.url;
    }

    response.send(serialize(storedConfig.item || {}));
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.addSlackDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const isSlackUrl = await helpers.SlackUrl(url);

    if (!isSlackUrl) {
      return response.status(409).send({
        errors: [
          {
            error: 'Conflict',
            message: 'You have sent a url which is not a slack url.',
          },
        ],
      });
    }

    const storage = getStorageConnection();
    const existingConfig = await storage.getConfig('slackIntegration');

    if (existingConfig && !existingConfig.item) {
      const slackConfig = {
        url,
        username: 'Errsole',
        icon_url: 'https://avatars.githubusercontent.com/u/84983840',
        status: true,
      };
      const storedConfig = await storage.setConfig(
        'slackIntegration',
        JSON.stringify(slackConfig),
      );

      if (storedConfig && storedConfig.item) {
        storedConfig.item.value = JSON.parse(storedConfig.item.value);
        response.send(serialize(storedConfig.item));
      } else {
        sendInternalServerError(response);
      }
    } else {
      response.status(409).send({
        errors: [
          {
            error: 'Conflict',
            message: 'You have already added a webhook url for slack.',
          },
        ],
      });
    }
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.updateSlackDetails = async (request, response) => {
  try {
    const { status } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const storedConfig = await storage.getConfig('slackIntegration');

    if (storedConfig && storedConfig.item) {
      let updatedConfig;
      try {
        updatedConfig = JSON.parse(storedConfig.item.value);
        updatedConfig.status = JSON.parse(status);
      } catch (error) {
        console.error(error);
        sendInternalServerError(response, error);
      }

      storedConfig.item.value.status = JSON.parse(status);
      const result = await storage.setConfig(
        'slackIntegration',
        JSON.stringify(updatedConfig),
      );

      if (result && result.item) {
        result.item.value = JSON.parse(result.item.value);
        response.send(serialize(result.item));
      } else {
        sendInternalServerError(response);
      }
    } else {
      sendInternalServerError(response);
    }
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.deleteSlackDetails = async (_request, response) => {
  try {
    const storage = getStorageConnection();
    const wasDeleted = await storage.deleteConfig('slackIntegration');

    if (wasDeleted) {
      response.send(serialize({ data: 'slack integration has been removed' }));
    } else {
      sendInternalServerError(response);
    }
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.getEmailDetails = async (_request, response) => {
  try {
    const storage = getStorageConnection();
    const storedConfig = await storage.getConfig('emailIntegration');

    if (storedConfig && storedConfig.item) {
      storedConfig.item.value = JSON.parse(storedConfig.item.value);
      delete storedConfig.item.value.url;
    }

    response.send(serialize(storedConfig.item || {}));
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.addEmailDetails = async (request, response) => {
  try {
    const { sender, host, port, username, password, receivers } =
      helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const emailConfig = {
      sender,
      host,
      port,
      username,
      password,
      receivers,
      status: true,
    };
    const storedConfig = await storage.setConfig(
      'emailIntegration',
      JSON.stringify(emailConfig),
    );

    if (storedConfig && storedConfig.item) {
      storedConfig.item.value = JSON.parse(storedConfig.item.value);
      await Alerts.clearEmailTransport();
      response.send(serialize(storedConfig.item));
    } else {
      sendInternalServerError(response);
    }
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.updateEmailDetails = async (request, response) => {
  try {
    const { status } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const storedConfig = await storage.getConfig('emailIntegration');

    if (storedConfig && storedConfig.item) {
      let updatedConfig;
      try {
        updatedConfig = JSON.parse(storedConfig.item.value);
        updatedConfig.status = JSON.parse(status);
      } catch (error) {
        console.error(error);
        sendInternalServerError(response, error);
      }

      storedConfig.item.value.status = JSON.parse(status);
      const result = await storage.setConfig(
        'emailIntegration',
        JSON.stringify(updatedConfig),
      );

      if (result && result.item) {
        result.item.value = JSON.parse(result.item.value);
        await Alerts.clearEmailTransport();
        response.send(serialize(result.item));
      } else {
        sendInternalServerError(response);
      }
    } else {
      sendInternalServerError(response);
    }
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.deleteEmailDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const wasDeleted = await storage.deleteConfig('emailIntegration');

    if (wasDeleted) {
      response.send(serialize({ url }));
    } else {
      sendInternalServerError(response);
    }
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.testSlackNotification = async (_request, response) => {
  try {
    const success = await Alerts.testSlackAlert(
      'This is a test notification from the Errsole Logger.',
      'Test Notification',
    );
    response.send(serialize({ success }));
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.testEmailNotification = async (_request, response) => {
  try {
    const success = await Alerts.testEmailAlert(
      'This is a test notification from the Errsole Logger. If you received this email, it means your SMTP settings are correctly configured in Errsole.',
      'Test Notification',
    );
    response.send(serialize({ success }));
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.getAlertUrlDetails = async (_request, response) => {
  try {
    const storage = getStorageConnection();
    const storedConfig = await storage.getConfig('alertUrl');

    if (storedConfig && storedConfig.item) {
      storedConfig.item.value = JSON.parse(storedConfig.item.value);
    }

    response.send(serialize(storedConfig.item || {}));
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

exports.addAlertUrlDetails = async (request, response) => {
  try {
    const { url } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();
    const storedConfig = await storage.setConfig(
      'alertUrl',
      JSON.stringify({ url }),
    );

    if (storedConfig && storedConfig.item) {
      storedConfig.item.value = JSON.parse(storedConfig.item.value);
      response.send(serialize(storedConfig.item));
    } else {
      sendInternalServerError(response);
    }
  } catch (error) {
    console.error(error);
    sendInternalServerError(response, error);
  }
};

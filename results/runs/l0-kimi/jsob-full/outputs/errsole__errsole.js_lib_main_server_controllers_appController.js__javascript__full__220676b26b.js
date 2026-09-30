'use strict';
const {v4: uuidv4} = require('uuid');
const {getStorageConnection} = require('./storageConnection');
const Jsonapi = require('./jsonapiUtil');
const NPMUpdates = require('./npmUpdates');
const packageJson = require('../package.json');
const helpers = require('./helpers');
const Alerts = require('./alerts');

exports.getSystemInfo = async (req, res) => {
  try {
    const npmUpdates = await NPMUpdates.checkForUpdates(packageJson.name);
    const storageConnection = getStorageConnection();
    const storageUpdates = await NPMUpdates.checkForUpdates(storageConnection.packageName);

    const systemInfo = {
      name: packageJson.name,
      version: packageJson.version,
      npmUpdates: npmUpdates,
      storageConnection: {
        packageName: storageConnection.packageName,
        packageVersion: storageConnection.packageVersion,
        storageUpdates: storageUpdates
      },
      nodeVersion: process.version
    };

    res.status(Jsonapi.ResponseCodes.OK).json(Jsonapi.successResponse(Jsonapi.ResponseTypes.SYSTEM_INFO, systemInfo));
  } catch (error) {
    console.error(error);
    const errorResponse = {
      title: 'System Info Error',
      detail: error && error.message ? error.message : 'An unknown error occurred'
    };
    res.status(500).json(Jsonapi.errorResponse([errorResponse]));
  }
};

exports.getConfig = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const config = await storageConnection.getConfig('appConfig');

    if (config && config.value) {
      try {
        config.value = JSON.parse(config.value);
        config.value.status = JSON.parse(config.status);
      } catch (parseError) {
        console.error(parseError);
        const errorResponse = {
          title: 'Config Parse Error',
          detail: parseError && parseError.message ? parseError.message : 'An unknown error occurred'
        };
        res.status(500).json(Jsonapi.errorResponse([errorResponse]));
        return;
      }
      config.value.status = JSON.parse(config.status);
      res.status(Jsonapi.ResponseCodes.OK).json(Jsonapi.successResponse(Jsonapi.ResponseTypes.CONFIG, config.value));
    } else {
      const errorResponse = {
        title: 'Config Not Found',
        detail: 'No configuration found'
      };
      res.status(404).json(Jsonapi.errorResponse([errorResponse]));
    }
  } catch (error) {
    console.error(error);
    const errorResponse = {
      title: 'Config Error',
      detail: error && error.message ? error.message : 'An unknown error occurred'
    };
    res.status(500).json(Jsonapi.errorResponse([errorResponse]));
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const {status} = helpers.parseRequestBody(req.body);
    const storageConnection = getStorageConnection();
    const existingConfig = await storageConnection.getConfig('appConfig');

    let configValue;
    try {
      configValue = JSON.parse(existingConfig.value);
      configValue.status = JSON.parse(status);
    } catch (parseError) {
      console.error(parseError);
      const errorResponse = {
        title: 'Config Parse Error',
        detail: parseError && parseError.message ? parseError.message : 'An unknown error occurred'
      };
      res.status(500).json(Jsonapi.errorResponse([errorResponse]));
      return;
    }

    existingConfig.value.status = JSON.parse(status);
    const updatedConfig = await storageConnection.setConfig('appConfig', JSON.stringify(configValue));

    if (updatedConfig && updatedConfig.value) {
      updatedConfig.value = JSON.parse(updatedConfig.value);
      await Alerts.initializeAlertSystem();
      res.status(Jsonapi.ResponseCodes.OK).json(Jsonapi.successResponse(Jsonapi.ResponseTypes.CONFIG, updatedConfig.value));
    } else {
      const errorResponse = {
        title: 'Config Update Error',
        detail: 'Failed to update configuration'
      };
      res.status(500).json(Jsonapi.errorResponse([errorResponse]));
    }
  } catch (error) {
    console.error(error);
    const errorResponse = {
      title: 'Config Update Error',
      detail: error && error.message ? error.message : 'An unknown error occurred'
    };
    res.status(500).json(Jsonapi.errorResponse([errorResponse]));
  }
};

exports.getSlackWebhookUrl = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const slackConfig = await storageConnection.getConfig('slackWebhookUrl');

    if (slackConfig) {
      const response = {slackWebhookUrl: slackConfig.value};
      res.status(Jsonapi.ResponseCodes.OK).json(Jsonapi.successResponse(Jsonapi.ResponseTypes.SLACK_WEBHOOK_URL, response));
    } else {
      const errorResponse = {
        title: 'Slack Webhook URL Not Found',
        detail: 'No Slack webhook URL configured'
      };
      res.status(404).json(Jsonapi.errorResponse([errorResponse]));
    }
  } catch (error) {
    console.error(error);
    const errorResponse = {
      title: 'Slack Webhook URL Error',
      detail: error && error.message ? error.message : 'An unknown error occurred'
    };
    res.status(500).json(Jsonapi.errorResponse([errorResponse]));
  }
};

exports.setSlackWebhookUrl = async (req, res) => {
  try {
    const {url} = helpers.parseRequestBody(req.body);
    const isValid = helpers.isValidSlackWebhookUrl(url);

    if (!isValid) {
      const errorResponse = {
        title: 'Invalid Slack Webhook URL',
        detail: 'The provided URL is not a valid Slack webhook URL'
      };
      const errorResponses = [errorResponse];
      res.status(400).json(Jsonapi.errorResponse(errorResponses));
      return;
    }

    const storageConnection = getStorageConnection();
    const slackConfig = {slackWebhookUrl: url, enabled: true};
    const result = await storageConnection.setConfig('slackWebhookUrl', JSON.stringify(slackConfig));

    if (result && result.value) {
      result.value = JSON.parse(result.value);
      res.status(Jsonapi.ResponseCodes.OK).json(Jsonapi.successResponse(Jsonapi.ResponseTypes.SLACK_WEBHOOK_URL, result.value));
    } else {
      const errorResponse = {
        title: 'Slack Webhook URL Error',
        detail: 'Failed to set Slack webhook URL'
      };
      res.status(500).json(Jsonapi.errorResponse([errorResponse]));
    }
  } catch (error) {
    console.error(error);
    const errorResponse = {
      title: 'Slack Webhook URL Error',
      detail: error && error.message ? error.message : 'An unknown error occurred'
    };
    res.status(500).json(Jsonapi.errorResponse([errorResponse]));
  }
};

exports.deleteSlackWebhookUrl = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    await storageConnection.deleteConfig('slackWebhookUrl');
    res.status(Jsonapi.ResponseCodes.OK).json(Jsonapi.successResponse(Jsonapi.ResponseTypes.SLACK_WEBHOOK_URL, {}));
  } catch (error) {
    console.error(error);
    const errorResponse = {
      title: 'Slack Webhook URL Error',
      detail: error && error.message ? error.message : 'An unknown error occurred'
    };
    res.status(500).json(Jsonapi.errorResponse([errorResponse]));
  }
};

exports.getEmailConfig = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const emailConfig = await storageConnection.getConfig('emailConfig');

    if (emailConfig && emailConfig.value) {
      emailConfig.value = JSON.parse(emailConfig.value);
      delete emailConfig.value.password;
      res.status(Jsonapi.ResponseCodes.OK).json(Jsonapi.successResponse(Jsonapi.ResponseTypes.EMAIL_CONFIG, emailConfig.value));
    } else {
      res.status(Jsonapi.ResponseCodes.OK).json(Jsonapi.successResponse(Jsonapi.ResponseTypes.EMAIL_CONFIG, {}));
    }
  } catch (error) {
    console.error(error);
    const errorResponse = {
      title: 'Email Config Error',
      detail: error && error.message ? error.message : 'An unknown error occurred'
    };
    res.status(500).json(Jsonapi.errorResponse([errorResponse]));
  }
};

exports.setEmailConfig = async (req, res) => {
  try {
    const {sender, host, port, username, password, receivers} = helpers.parseRequestBody(req.body);
    const storageConnection = getStorageConnection();
    const emailConfig = {
      sender: sender,
      host: host,
      port: port,
      username: username,
      password: password,
      receivers: receivers,
      enabled: true
    };
    const result = await storageConnection.setConfig('emailConfig', JSON.stringify(emailConfig));

    if (result && result.value) {
      result.value = JSON.parse(result.value);
      delete result.value.password;
      await Alerts.initializeAlertSystem();
      res.status(Jsonapi.ResponseCodes.OK).json(Jsonapi.successResponse(Jsonapi.ResponseTypes.EMAIL_CONFIG, result.value));
    } else {
      const errorResponse = {
        title: 'Email Config Error',
        detail: 'Failed to set email configuration'
      };
      res.status(500).json(Jsonapi.errorResponse([errorResponse]));
    }
  } catch (error) {
    console.error(error);
    const errorResponse = {
      title: 'Email Config Error',
      detail: error && error.message ? error.message : 'An unknown error occurred'
    };
    res.status(500).json(Jsonapi.errorResponse([errorResponse]));
  }
};

exports.deleteEmailConfig = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    await storageConnection.deleteConfig('emailConfig');
    res.status(Jsonapi.ResponseCodes.OK).json(Jsonapi.successResponse(Jsonapi.ResponseTypes.EMAIL_CONFIG, {}));
  } catch (error) {
    console.error(error);
    const errorResponse = {
      title: 'Email Config Error',
      detail: error && error.message ? error.message : 'An unknown error occurred'
    };
    res.status(500).json(Jsonapi.errorResponse([errorResponse]));
  }
};

exports.sendTestSlackAlert = async (req, res) => {
  const alertTypes = {
    ERROR: 'error',
    WARNING: 'warning'
  };

  try {
    const result = await Alerts.sendAlert(alertTypes.ERROR, 'This is a test Slack alert from Errsole.');
    const response = {success: result};
    res.status(Jsonapi.ResponseCodes.OK).json(Jsonapi.successResponse(Jsonapi.ResponseTypes.TEST_ALERT, response));
  } catch (error) {
    console.error(error);
    const errorResponse = {
      title: 'Test Alert Error',
      detail: error && error.message ? error.message : 'An unknown error occurred'
    };
    res.status(500).json(Jsonapi.errorResponse([errorResponse]));
  }
};

exports.sendTestEmailAlert = async (req, res) => {
  const alertTypes = {
    ERROR: 'error',
    WARNING: 'warning'
  };

  try {
    const result = await Alerts.sendAlert(alertTypes.ERROR, 'This is a test email alert from Errsole.');
    const response = {success: result};
    res.status(Jsonapi.ResponseCodes.OK).json(Jsonapi.successResponse(Jsonapi.ResponseTypes.TEST_ALERT, response));
  } catch (error) {
    console.error(error);
    const errorResponse = {
      title: 'Test Alert Error',
      detail: error && error.message ? error.message : 'An unknown error occurred'
    };
    res.status(500).json(Jsonapi.errorResponse([errorResponse]));
  }
};

'use strict';

const globalObject = typeof globalThis !== 'undefined' ? globalThis :
  typeof self !== 'undefined' ? self :
  typeof global !== 'undefined' ? global :
  typeof window !== 'undefined' ? window : void 0;

const moduleCache = globalObject['vm_0x250d08_8fcf80'] || (globalObject['vm_0x250d08_8fcf80'] = {});

(function () {
  if (!moduleCache['module']) {
    try { moduleCache['module'] = module; } catch (_) {}
  }
  if (!moduleCache['exports']) {
    try { moduleCache['exports'] = exports; } catch (_) {}
  }
  if (!moduleCache['require']) {
    try { moduleCache['require'] = require; } catch (_) {}
  }
  if (!moduleCache['__dirname']) {
    try { moduleCache['__dirname'] = __dirname; } catch (_) {}
  }
  if (!moduleCache['__filename']) {
    try { moduleCache['__filename'] = __filename; } catch (_) {}
  }
})();

const require_jsonapiUtil = moduleCache['__commonJS']({
  '../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js'(_module, _exports) {
    'use strict';
  }
});
moduleCache['require_jsonapiUtil'] = require_jsonapiUtil;
globalThis['require_jsonapiUtil'] = require_jsonapiUtil;

const require_npmUpdates = moduleCache['__commonJS']({
  '../work/errsole__errsole.js/lib/main/server/utils/npmUpdates.js'(_module, _exports) {
    'use strict';
  }
});
moduleCache['require_npmUpdates'] = require_npmUpdates;
globalThis['require_npmUpdates'] = require_npmUpdates;

const require_storageConnection = moduleCache['__commonJS']({
  '../work/errsole__errsole.js/lib/main/server/storageConnection.js'(_module, _exports) {
    'use strict';
  }
});
moduleCache['require_storageConnection'] = require_storageConnection;
globalThis['require_storageConnection'] = require_storageConnection;

const require_package = moduleCache['__commonJS']({
  '../work/errsole__errsole.js/package.json'(_module, _exports) {
    'use strict';
  }
});
moduleCache['require_package'] = require_package;
globalThis['require_package'] = require_package;

const require_helpers = moduleCache['__commonJS']({
  '../work/errsole__errsole.js/lib/main/server/utils/helpers.js'(_module, _exports) {
    'use strict';
  }
});
moduleCache['require_helpers'] = require_helpers;
globalThis['require_helpers'] = require_helpers;

const require_alerts = moduleCache['__commonJS']({
  '../work/errsole__errsole.js/lib/main/server/utils/alerts.js'(_module, _exports) {
    'use strict';
  }
});
moduleCache['require_alerts'] = require_alerts;
globalThis['require_alerts'] = require_alerts;

const Jsonapi = moduleCache['require_jsonapiUtil']();
moduleCache['Jsonapi'] = Jsonapi;
globalThis['Jsonapi'] = Jsonapi;

const NPMUpdates = moduleCache['require_npmUpdates']();
moduleCache['NPMUpdates'] = NPMUpdates;
globalThis['NPMUpdates'] = NPMUpdates;

const { getStorageConnection } = moduleCache['require_storageConnection']();
moduleCache['getStorageConnection'] = getStorageConnection;
globalThis['getStorageConnection'] = getStorageConnection;

const packageJson = moduleCache['require_package']();
moduleCache['packageJson'] = packageJson;
globalThis['packageJson'] = packageJson;

const helpers = moduleCache['require_helpers']();
moduleCache['helpers'] = helpers;
globalThis['helpers'] = helpers;

const Alerts = moduleCache['require_alerts']();
moduleCache['Alerts'] = Alerts;
globalThis['Alerts'] = Alerts;

exports['checkUpdates'] = async (_req, _res) => {
  try {
    const latestVersion = await NPMUpdates['fetchLatestVersion']('errsole');
    const storageConnection = getStorageConnection();
    const storageLatestVersion = await NPMUpdates['fetchLatestVersion'](storageConnection['name']);
    const data = {
      'name': packageJson['name'],
      'version': packageJson['version'],
      'latest_version': latestVersion,
      'storage_name': storageConnection['name'],
      'storage_version': storageConnection['version'],
      'storage_latest_version': storageLatestVersion,
      'storage_dialect': storageConnection['dialect']
    };
    _res['send'](Jsonapi['Serializer']['serialize'](Jsonapi['AppType'], data));
  } catch (error) {
    console['error'](error);
    _res['status'](500)['send']({
      'errors': [{
        'error': 'Internal Server Error',
        'message': error && error['message'] ? error['message'] : 'An unexpected error occurred'
      }]
    });
  }
};

exports['getSlackDetails'] = async (_req, _res) => {
  try {
    const storageConnection = getStorageConnection();
    const config = await storageConnection['getConfig']('slackIntegration');
    if (config && config['item']) {
      config['item']['value'] = JSON['parse'](config['item']['value']);
      delete config['item']['value']['url'];
    }
    _res['send'](Jsonapi['Serializer']['serialize'](Jsonapi['AppType'], config['item'] || {}));
  } catch (error) {
    console['error'](error);
    _res['status'](500)['send']({
      'errors': [{
        'error': 'Internal Server Error',
        'message': error && error['message'] ? error['message'] : 'An unexpected error occurred'
      }]
    });
  }
};

exports['addSlackDetails'] = async (_req, _res) => {
  try {
    const { url } = helpers['extractAttributes'](_req['body']);
    const isValidSlackUrl = await helpers['getAlertUrlDetails'](url);
    if (!isValidSlackUrl) {
      const errors = [{
        'error': 'Conflict',
        'message': 'You have sent a url which is not a slack url.'
      }];
      return _res['status'](409)['send']({ 'errors': errors });
    } else {
      const storageConnection = getStorageConnection();
      const config = await storageConnection['getConfig']('slackIntegration');
      if (config && !config['item']) {
        const slackDetails = {
          'url': url,
          'username': 'Errsole',
          'icon_url': 'https://avatars.githubusercontent.com/u/84983840',
          'status': true
        };
        const savedConfig = await storageConnection['setConfig']('slackIntegration', JSON['stringify'](slackDetails));
        if (savedConfig && savedConfig['item']) {
          savedConfig['item']['value'] = JSON['parse'](savedConfig['item']['value']);
          _res['send'](Jsonapi['Serializer']['serialize'](Jsonapi['AppType'], savedConfig['item']));
        } else {
          _res['status'](500)['send']({
            'errors': [{
              'error': 'Internal Server Error',
              'message': 'An unexpected error occurred'
            }]
          });
        }
      } else {
        const errors = [{
          'error': 'Conflict',
          'message': 'You have already added a webhook url for slack.'
        }];
        _res['status'](409)['send']({ 'errors': errors });
      }
    }
  } catch (error) {
    console['error'](error);
    _res['status'](500)['send']({
      'errors': [{
        'error': 'Internal Server Error',
        'message': error && error['message'] ? error['message'] : 'An unexpected error occurred'
      }]
    });
  }
};

exports['updateSlackDetails'] = async (_req, _res) => {
  try {
    const { status } = helpers['extractAttributes'](_req['body']);
    const storageConnection = getStorageConnection();
    const config = await storageConnection['getConfig']('slackIntegration');
    if (config && config['item']) {
      let slackDetails;
      try {
        slackDetails = JSON['parse'](config['item']['value']);
        slackDetails['status'] = JSON['parse'](status);
      } catch (error) {
        console['error'](error);
        _res['status'](500)['send']({
          'errors': [{
            'error': 'Internal Server Error',
            'message': error && error['message'] ? error['message'] : 'An unexpected error occurred'
          }]
        });
      }
      config['item']['value']['status'] = JSON['parse'](status);
      const savedConfig = await storageConnection['setConfig']('slackIntegration', JSON['stringify'](slackDetails));
      if (savedConfig && savedConfig['item']) {
        savedConfig['item']['value'] = JSON['parse'](savedConfig['item']['value']);
        _res['send'](Jsonapi['Serializer']['serialize'](Jsonapi['AppType'], savedConfig['item']));
      } else {
        _res['status'](500)['send']({
          'errors': [{
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred'
          }]
        });
      }
    } else {
      _res['status'](500)['send']({
        'errors': [{
          'error': 'Internal Server Error',
          'message': 'An unexpected error occurred'
        }]
      });
    }
  } catch (error) {
    console['error'](error);
    _res['status'](500)['send']({
      'errors': [{
        'error': 'Internal Server Error',
        'message': error && error['message'] ? error['message'] : 'An unexpected error occurred'
      }]
    });
  }
};

exports['deleteSlackDetails'] = async (_req, _res) => {
  try {
    const storageConnection = getStorageConnection();
    const deleted = await storageConnection['deleteConfig']('slackIntegration');
    if (deleted) {
      _res['send'](Jsonapi['Serializer']['serialize'](Jsonapi['AppType'], {
        'data': 'slack integration has been removed'
      }));
    } else {
      _res['status'](500)['send']({
        'errors': [{
          'error': 'Internal Server Error',
          'message': 'An unexpected error occurred'
        }]
      });
    }
  } catch (error) {
    console['error'](error);
    _res['status'](500)['send']({
      'errors': [{
        'error': 'Internal Server Error',
        'message': error && error['message'] ? error['message'] : 'An unexpected error occurred'
      }]
    });
  }
};

exports['getEmailDetails'] = async (_req, _res) => {
  try {
    const storageConnection = getStorageConnection();
    const config = await storageConnection['getConfig']('emailIntegration');
    if (config && config['item']) {
      config['item']['value'] = JSON['parse'](config['item']['value']);
      delete config['item']['value']['url'];
    }
    _res['send'](Jsonapi['Serializer']['serialize'](Jsonapi['AppType'], config['item'] || {}));
  } catch (error) {
    console['error'](error);
    _res['status'](500)['send']({
      'errors': [{
        'error': 'Internal Server Error',
        'message': error && error['message'] ? error['message'] : 'An unexpected error occurred'
      }]
    });
  }
};

exports['addEmailDetails'] = async (_req, _res) => {
  try {
    const {
      sender,
      host,
      port,
      username,
      password,
      receivers
    } = helpers['extractAttributes'](_req['body']);
    const storageConnection = getStorageConnection();
    const emailDetails = {
      'sender': sender,
      'host': host,
      'port': port,
      'username': username,
      'password': password,
      'receivers': receivers,
      'status': true
    };
    const savedConfig = await storageConnection['setConfig']('emailIntegration', JSON['stringify'](emailDetails));
    if (savedConfig && savedConfig['item']) {
      savedConfig['item']['value'] = JSON['parse'](savedConfig['item']['value']);
      await Alerts['clearEmailTransport']();
      _res['send'](Jsonapi['Serializer']['serialize'](Jsonapi['AppType'], savedConfig['item']));
    } else {
      _res['status'](500)['send']({
        'errors': [{
          'error': 'Internal Server Error',
          'message': 'An unexpected error occurred'
        }]
      });
    }
  } catch (error) {
    console['error'](error);
    _res['status'](500)['send']({
      'errors': [{
        'error': 'Internal Server Error',
        'message': error && error['message'] ? error['message'] : 'An unexpected error occurred'
      }]
    });
  }
};

exports['updateEmailDetails'] = async (_req, _res) => {
  try {
    const { status } = helpers['extractAttributes'](_req['body']);
    const storageConnection = getStorageConnection();
    const config = await storageConnection['getConfig']('emailIntegration');
    if (config && config['item']) {
      let emailDetails;
      try {
        emailDetails = JSON['parse'](config['item']['value']);
        emailDetails['status'] = JSON['parse'](status);
      } catch (error) {
        console['error'](error);
        _res['status'](500)['send']({
          'errors': [{
            'error': 'Internal Server Error',
            'message': error && error['message'] ? error['message'] : 'An unexpected error occurred'
          }]
        });
      }
      config['item']['value']['status'] = JSON['parse'](status);
      const savedConfig = await storageConnection['setConfig']('emailIntegration', JSON['stringify'](emailDetails));
      if (savedConfig && savedConfig['item']) {
        savedConfig['item']['value'] = JSON['parse'](savedConfig['item']['value']);
        await Alerts['clearEmailTransport']();
        _res['send'](Jsonapi['Serializer']['serialize'](Jsonapi['AppType'], savedConfig['item']));
      } else {
        _res['status'](500)['send']({
          'errors': [{
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred'
          }]
        });
      }
    } else {
      _res['status'](500)['send']({
        'errors': [{
          'error': 'Internal Server Error',
          'message': 'An unexpected error occurred'
        }]
      });
    }
  } catch (error) {
    console['error'](error);
    _res['status'](500)['send']({
      'errors': [{
        'error': 'Internal Server Error',
        'message': error && error['message'] ? error['message'] : 'An unexpected error occurred'
      }]
    });
  }
};

exports['deleteEmailDetails'] = async (_req, _res) => {
  try {
    const { url } = helpers['extractAttributes'](_req['body']);
    const storageConnection = getStorageConnection();
    const deleted = await storageConnection['deleteConfig']('emailIntegration');
    if (deleted) {
      _res['send'](Jsonapi['Serializer']['serialize'](Jsonapi['AppType'], { 'url': url }));
    } else {
      _res['status'](500)['send']({
        'errors': [{
          'error': 'Internal Server Error',
          'message': 'An unexpected error occurred'
        }]
      });
    }
  } catch (error) {
    console['error'](error);
    _res['status'](500)['send']({
      'errors': [{
        'error': 'Internal Server Error',
        'message': error && error['message'] ? error['message'] : 'An unexpected error occurred'
      }]
    });
  }
};

exports['testSlackNotification'] = async (_req, _res) => {
  try {
    const success = await Alerts['testSlackAlert'](
      'This is a test notification from the Errsole Logger.',
      'Test Notification'
    );
    _res['send'](Jsonapi['Serializer']['serialize'](Jsonapi['AppType'], { 'success': success }));
  } catch (error) {
    console['error'](error);
    _res['status'](500)['send']({
      'errors': [{
        'error': 'Internal Server Error',
        'message': error && error['message'] ? error['message'] : 'An unexpected error occurred'
      }]
    });
  }
};

exports['testEmailNotification'] = async (_req, _res) => {
  try {
    const success = await Alerts['testEmailAlert'](
      'This is a test notification from the Errsole Logger. If you received this email, it means your SMTP settings are correctly configured in Errsole.',
      'Test Notification'
    );
    _res['send'](Jsonapi['Serializer']['serialize'](Jsonapi['AppType'], { 'success': success }));
  } catch (error) {
    console['error'](error);
    _res['status'](500)['send']({
      'errors': [{
        'error': 'Internal Server Error',
        'message': error && error['message'] ? error['message'] : 'An unexpected error occurred'
      }]
    });
  }
};

exports['getAlertUrlDetails'] = async (_req, _res) => {
  try {
    const storageConnection = getStorageConnection();
    const config = await storageConnection['getConfig']('alertUrl');
    if (config && config['item']) {
      config['item']['value'] = JSON['parse'](config['item']['value']);
    }
    _res['send'](Jsonapi['Serializer']['serialize'](Jsonapi['AppType'], config['item'] || {}));
  } catch (error) {
    console['error'](error);
    _res['status'](500)['send']({
      'errors': [{
        'error': 'Internal Server Error',
        'message': error && error['message'] ? error['message'] : 'An unexpected error occurred'
      }]
    });
  }
};

exports['addAlertUrlDetails'] = async (_req, _res) => {
  try {
    const { url } = helpers['extractAttributes'](_req['body']);
    const storageConnection = getStorageConnection();
    const alertUrlDetails = { 'url': url };
    const savedConfig = await storageConnection['setConfig']('alertUrl', JSON['stringify'](alertUrlDetails));
    if (savedConfig && savedConfig['item']) {
      savedConfig['item']['value'] = JSON['parse'](savedConfig['item']['value']);
      _res['send'](Jsonapi['Serializer']['serialize'](Jsonapi['AppType'], savedConfig['item']));
    } else {
      _res['status'](500)['send']({
        'errors': [{
          'error': 'Internal Server Error',
          'message': 'An unexpected error occurred'
        }]
      });
    }
  } catch (error) {
    console['error'](error);
    _res['status'](500)['send']({
      'errors': [{
        'error': 'Internal Server Error',
        'message': error && error['message'] ? error['message'] : 'An unexpected error occurred'
      }]
    });
  }
};

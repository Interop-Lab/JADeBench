'use strict';
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const Jsonapi = (() => {
  const JSONAPISerializer = require('jsonapi-serializer').Serializer;
  const serializer = new JSONAPISerializer({
    attributes: ['id', 'name', 'email'],
    keyForAttribute: 'camelCase'
  });
  
  const serializerOptions = {
    id: 'id',
    name: 'name',
    email: 'email'
  };
  
  serializer.register('user', {});
  serializer.register('error', {});
  serializer.register('session', {
    topLevelMeta: function(data, extraData) {
      return { meta: extraData };
    }
  });
  
  return {
    serializer: serializer,
    Error: 'error',
    User: 'user',
    Session: 'session'
  };
})();

const helpers = (() => {
  let cachedSecret = null;
  
  const getStorageConnection = (() => {
    let storageConnection = null;
    return {
      setStorageConnection: function(connection) {
        if (!storageConnection) {
          storageConnection = connection;
        }
        return storageConnection;
      },
      getStorageConnection: function() {
        if (!storageConnection) {
          throw new Error('Storage connection not initialized');
        }
        return storageConnection;
      }
    };
  })();
  
  const getJwtSecret = () => {
    const storage = getStorageConnection.getStorageConnection();
    if (storage && storage.config && storage.config.jwtSecret) {
      return storage.config.jwtSecret;
    }
    return {};
  };
  
  const isValidSlackWebhookUrl = (url) => {
    const slackWebhookRegex = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
    return slackWebhookRegex.test(url);
  };
  
  const initializeJwtSecret = async () => {
    try {
      const storage = getStorageConnection.getStorageConnection();
      const config = await storage.getConfig();
      
      if (config && config.data && config.data.jwtSecret) {
        cachedSecret = config.data.jwtSecret;
      } else {
        const newSecret = uuidv4();
        const result = await storage.setConfig('jwtSecret', newSecret);
        if (result && result.data && result.data.jwtSecret) {
          cachedSecret = result.data.jwtSecret;
        }
      }
      return cachedSecret || false;
    } catch (error) {
      console.error('Error initializing JWT secret:', error);
      throw error;
    }
  };
  
  const getCachedJwtSecret = () => {
    return cachedSecret ? cachedSecret : false;
  };
  
  return {
    getJwtSecret: getJwtSecret,
    isValidSlackWebhookUrl: isValidSlackWebhookUrl,
    initializeJwtSecret: initializeJwtSecret,
    getCachedJwtSecret: getCachedJwtSecret
  };
})();

const { getStorageConnection } = (() => {
  let storageConnection = null;
  return {
    setStorageConnection: function(connection) {
      if (!storageConnection) {
        storageConnection = connection;
      }
      return storageConnection;
    },
    getStorageConnection: function() {
      if (!storageConnection) {
        throw new Error('Storage connection not initialized');
      }
      return storageConnection;
    }
  };
})();

exports.checkSession = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token === null) {
    const errorResponse = {
      title: 'Unauthorized',
      detail: 'No token provided'
    };
    res.status(401).json(Jsonapi.serializer.serialize(Jsonapi.Error, errorResponse));
    return;
  }
  
  if (!helpers.getCachedJwtSecret()) {
    await helpers.initializeJwtSecret();
  }
  
  const secret = helpers.getJwtSecret();
  
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      const errorResponse = {
        title: 'Unauthorized',
        detail: 'Invalid token'
      };
      res.status(401).json(Jsonapi.serializer.serialize(Jsonapi.Error, errorResponse));
      return;
    }
    req.user = user.user;
    next();
  });
};

exports.login = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token === null) {
    const errorResponse = {
      title: 'Unauthorized',
      detail: 'No token provided'
    };
    res.status(401).json(Jsonapi.serializer.serialize(Jsonapi.Error, errorResponse));
    return;
  }
  
  if (!helpers.getCachedJwtSecret()) {
    await helpers.initializeJwtSecret();
  }
  
  const secret = helpers.getJwtSecret();
  
  jwt.verify(token, secret, async (err, decoded) => {
    if (err) {
      const errorDetail = {
        title: 'Unauthorized',
        detail: 'Invalid token'
      };
      const errorResponse = { errors: [errorDetail] };
      res.status(401).json(errorResponse);
      return;
    }
    
    req.user = decoded.user;
    const storage = getStorageConnection();
    const userData = await storage.getUser(req.user);
    
    if (userData && userData.data && userData.data.role === 'admin') {
      next();
    } else {
      const errorDetail = {
        title: 'Forbidden',
        detail: 'Insufficient permissions'
      };
      const errorResponse = { errors: [errorDetail] };
      res.status(403).json(errorResponse);
    }
  });
};

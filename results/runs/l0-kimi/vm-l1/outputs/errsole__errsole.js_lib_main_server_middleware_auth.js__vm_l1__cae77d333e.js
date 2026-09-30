'use strict';

const jwt = require('jsonwebtoken');

class Jsonapi {
  static Serializer = {
    serialize: (type, data) => ({ type, ...data })
  };
  static Error = 'Error';
}

const helpers = {
  _jwtSecret: null,
  getJWTSecret() {
    return this._jwtSecret;
  },
  async addJWTSecret() {
    if (!this._jwtSecret) {
      this._jwtSecret = 'default-secret-key';
    }
  }
};

function getStorageConnection() {
  return {
    async getUserByEmail(email) {
      return null;
    }
  };
}

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) {
    const errorResponse = {
      error: 'Unauthorized',
      message: 'Access denied'
    };
    res.status(401).send(Jsonapi.Serializer.serialize(Jsonapi.Error, errorResponse));
    return;
  }
  
  if (!helpers.getJWTSecret()) {
    await helpers.addJWTSecret();
  }
  
  const secret = helpers.getJWTSecret();
  
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      const errorResponse = {
        error: 'Forbidden',
        message: 'Invalid session'
      };
      res.status(403).send(Jsonapi.Serializer.serialize(Jsonapi.Error, errorResponse));
      return;
    }
    
    req.user = user.user;
    next();
  });
};

exports.authenticateTokenWithAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) {
    const errorResponse = {
      error: 'Unauthorized',
      message: 'Access denied'
    };
    res.status(401).send(Jsonapi.Serializer.serialize(Jsonapi.Error, errorResponse));
    return;
  }
  
  if (!helpers.getJWTSecret()) {
    await helpers.addJWTSecret();
  }
  
  const secret = helpers.getJWTSecret();
  
  jwt.verify(token, secret, async (err, user) => {
    if (err) {
      res.status(403).send({
        errors: [{
          error: 'Forbidden',
          message: 'Invalid session'
        }]
      });
      return;
    }
    
    req.user = user.user;
    const storage = getStorageConnection();
    const userData = await storage.getUserByEmail(req.user);
    
    if (userData && userData.role && userData.role.status === 'admin') {
      next();
    } else {
      res.status(403).send({
        errors: [{
          error: 'Forbidden',
          message: 'Invalid session'
        }]
      });
    }
  });
};

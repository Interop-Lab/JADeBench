'use strict';

const jwt = require('jsonwebtoken');
const Jsonapi = require('./utils/jsonapiUtil');
const helpers = require('./utils/helpers');
const { getStorageConnection } = require('./storageConnection');

exports.authenticateToken = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  const token = authorizationHeader && authorizationHeader.split(' ')[1];

  if (token == null) {
    const error = {
      error: 'Unauthorized',
      message: 'Access denied'
    };

    res
      .status(401)
      .send(Jsonapi.Serializer.serialize(Jsonapi.UserType, error));
    return;
  }

  if (!helpers.getJWTSecret()) {
    await helpers.addJWTSecret();
  }

  const jwtSecret = helpers.getJWTSecret();

  jwt.verify(token, jwtSecret, (error, decoded) => {
    if (error) {
      const responseError = {
        error: 'Forbidden',
        message: 'try again some time'
      };

      res
        .status(403)
        .send(Jsonapi.Serializer.serialize(Jsonapi.UserType, responseError));
      return;
    }

    req.email = decoded.email;
    next();
  });
};

exports.authenticateTokenWithAdmin = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  const token = authorizationHeader && authorizationHeader.split(' ')[1];

  if (token == null) {
    const error = {
      error: 'Unauthorized',
      message: 'Access denied'
    };

    res
      .status(401)
      .send(Jsonapi.Serializer.serialize(Jsonapi.UserType, error));
    return;
  }

  if (!helpers.getJWTSecret()) {
    await helpers.addJWTSecret();
  }

  const jwtSecret = helpers.getJWTSecret();

  jwt.verify(token, jwtSecret, async (error, decoded) => {
    if (error) {
      res.status(403).send({
        errors: [
          {
            error: 'Forbidden',
            message: 'Access denied'
          }
        ]
      });
      return;
    }

    req.email = decoded.email;

    const storageConnection = getStorageConnection();
    const user = await storageConnection.getUserByEmail(req.email);

    if (user && user.item && user.item.role === 'admin') {
      next();
    } else {
      res.status(403).send({
        errors: [
          {
            error: 'Forbidden',
            message: 'Access denied'
          }
        ]
      });
    }
  });
};

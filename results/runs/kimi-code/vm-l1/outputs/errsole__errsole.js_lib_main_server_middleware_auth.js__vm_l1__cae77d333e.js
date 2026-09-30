'use strict';

const jwt = require('jsonwebtoken');
const Jsonapi = require('../utils/jsonapiUtil');
const helpers = require('../utils/helpers');
const { getStorageConnection } = require('../storageConnection');

function sendUnauthorized(response) {
  const error = {
    error: 'Unauthorized',
    message: 'invalid session',
  };

  response
    .status(401)
    .send(Jsonapi.Serializer.serialize(Jsonapi.UserType, error));
}

function sendForbidden(response, message, serialize = false) {
  const error = {
    error: 'Forbidden',
    message,
  };

  response
    .status(403)
    .send(
      serialize
        ? Jsonapi.Serializer.serialize(Jsonapi.UserType, error)
        : { errors: [error] },
    );
}

function getBearerToken(request) {
  const authorization = request.headers.authorization;
  return authorization && authorization.split(' ')[1];
}

async function ensureJWTSecret() {
  if (!helpers.getJWTSecret()) {
    await helpers.addJWTSecret();
  }
  return helpers.getJWTSecret();
}

exports.authenticateToken = async (request, response, next) => {
  const token = getBearerToken(request);
  if (token == null) {
    sendUnauthorized(response);
    return;
  }

  const secret = await ensureJWTSecret();
  jwt.verify(token, secret, (error, payload) => {
    if (error) {
      sendForbidden(response, 'try again some time', true);
      return;
    }

    request.email = payload.email;
    next();
  });
};

exports.authenticateTokenWithAdmin = async (request, response, next) => {
  const token = getBearerToken(request);
  if (token == null) {
    sendUnauthorized(response);
    return;
  }

  const secret = await ensureJWTSecret();
  jwt.verify(token, secret, async (error, payload) => {
    if (error) {
      sendForbidden(response, 'Access denied');
      return;
    }

    request.email = payload.email;
    const storageConnection = getStorageConnection();
    const user = await storageConnection.getUserByEmail(request.email);

    if (user && user.item && user.item.role === 'admin') {
      next();
    } else {
      sendForbidden(response, 'Access denied');
    }
  });
};

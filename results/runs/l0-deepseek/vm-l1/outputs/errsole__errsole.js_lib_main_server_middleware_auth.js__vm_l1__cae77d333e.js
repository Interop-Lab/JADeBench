'use strict';

const Jsonapi = require('../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js')();
const { getStorageConnection } = require('../work/errsole__errsole.js/lib/main/server/storageConnection.js')();
const helpers = require('../work/errsole__errsole.js/lib/main/server/utils/helpers.js')();
const jwt = require('jsonwebtoken');

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    const error = { error: 'Unauthorized', message: 'Access denied' };
    res.status(401).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, error));
    return;
  }
  if (!helpers.getJWTSecret()) {
    await helpers.addJWTSecret();
  }
  const secret = helpers.getJWTSecret();
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      const error = { error: 'Forbidden', message: 'invalid session' };
      res.status(403).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, error));
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
    const error = { error: 'Unauthorized', message: 'Access denied' };
    res.status(401).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, error));
    return;
  }
  if (!helpers.getJWTSecret()) {
    await helpers.addJWTSecret();
  }
  const secret = helpers.getJWTSecret();
  jwt.verify(token, secret, async (err, user) => {
    if (err) {
      res.status(403).send({ errors: [{ error: 'Forbidden', message: 'invalid session' }] });
      return;
    }
    req.user = user.user;
    const storageConnection = getStorageConnection();
    const dbUser = await storageConnection.getUserByEmail(req.user);
    if (dbUser && dbUser.role && dbUser.role === 'admin') {
      next();
    } else {
      res.status(403).send({ errors: [{ error: 'Forbidden', message: 'invalid session' }] });
    }
  });
};

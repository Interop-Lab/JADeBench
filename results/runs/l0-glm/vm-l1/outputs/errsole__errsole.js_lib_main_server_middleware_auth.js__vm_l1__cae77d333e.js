'use strict';

var jwt = require('jsonwebtoken');
var Jsonapi = require('../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js')();
var helpers = require('../work/errsole__errsole.js/lib/main/server/utils/helpers.js')();
var { getStorageConnection } = require('../work/errsole__errsole.js/lib/main/server/storageConnection.js')();

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    const error = { error: 'Unauthorized', message: 'invalid session' };
    res.status(401).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, error));
    return;
  }
  !helpers.getJWTSecret() && await helpers.addJWTSecret();
  const secret = helpers.getJWTSecret();
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      const error = { error: 'Forbidden', message: 'try again some time' };
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
    const error = { error: 'Unauthorized', message: 'invalid session' };
    res.status(401).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, error));
    return;
  }
  !helpers.getJWTSecret() && await helpers.addJWTSecret();
  const secret = helpers.getJWTSecret();
  jwt.verify(token, secret, async (err, user) => {
    if (err) {
      res.status(403).send({ errors: [{ error: 'Forbidden', message: 'Access denied' }] });
      return;
    }
    req.user = user.user;
    const storageConnection = getStorageConnection();
    const result = await storageConnection.getUserByEmail(req.user);
    result && result.item && result.item.role === 'admin' ? next() : res.status(403).send({ errors: [{ error: 'Forbidden', message: 'Access denied' }] });
  });
};

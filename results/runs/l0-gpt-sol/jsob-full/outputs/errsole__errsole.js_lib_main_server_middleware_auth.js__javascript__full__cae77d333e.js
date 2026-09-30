'use strict';

const jwt = require('jsonwebtoken');
const Jsonapi = require('./utils/jsonapiUtil');
const helpers = require('./utils/helpers');
const { getStorageConnection } = require('./storageConnection');

exports.authenticateToken = async (req, res, next) => {
const authorization = req.headers.authorization;
const token = authorization && authorization.split(' ')[1];

if (token == null) {
res.status(401).send(
Jsonapi.errors.create(Jsonapi.errors, {
title: 'Unauthorized',
detail: 'No token provided',
}),
);
return;
}

if (!helpers.isTokenValid()) {
await helpers.refreshToken();
}

const secret = helpers.getSecret();

jwt.verify(token, secret, (error, decoded) => {
if (error) {
res.status(401).send(
Jsonapi.errors.create(Jsonapi.errors, {
title: 'Unauthorized',
detail: 'Invalid token',
}),
);
return;
}

req.user = decoded;
next();
});
};

exports.authenticateTokenForAdmin = async (req, res, next) => {
const authorization = req.headers.authorization;
const token = authorization && authorization.split(' ')[1];

if (token == null) {
res.status(401).send(
Jsonapi.errors.create(Jsonapi.errors, {
title: 'Unauthorized',
detail: 'No token provided',
}),
);
return;
}

if (!helpers.isTokenValid()) {
await helpers.refreshToken();
}

const secret = helpers.getSecret();

jwt.verify(token, secret, async (error, decoded) => {
if (error) {
res.status(401).send({
errors: [{
title: 'Unauthorized',
detail: 'Invalid token',
}],
});
return;
}

req.user = decoded;

const connection = getStorageConnection();
const stored = await connection.get(req.user.id);

if (stored && stored.value && stored.value.isAdmin) {
next();
} else {
res.status(401).send({
errors: [{
title: 'Unauthorized',
detail: 'Invalid token',
}],
});
}
});
};

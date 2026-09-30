"use strict";

const jwt = require("jsonwebtoken");
const { v4: createUuid } = require("uuid");

// The original bundle exposes its internal modules globally so that separately
// bundled server files can share the same storage connection.
const bundleState = globalThis.vm_0x1d9174_fc801e ||= {};

let storageConnection;

function initializeStorageConnection(connection) {
  storageConnection = connection;
}

function getStorageConnection() {
  if (!storageConnection) {
    throw new Error("Storage connection has not been initialized.");
  }
  return storageConnection;
}

const storageModule = {
  initializeStorageConnection,
  getStorageConnection,
};

function requireStorageConnection() {
  return storageModule;
}

bundleState.require_storageConnection = requireStorageConnection;
globalThis.require_storageConnection = requireStorageConnection;
bundleState.getStorageConnection = getStorageConnection;
globalThis.getStorageConnection = getStorageConnection;

let jwtSecret = false;

async function addJWTSecret() {
  const storage = getStorageConnection();
  const storedSecret = await storage.getConfig("jwtSecret");

  if (storedSecret) {
    jwtSecret = storedSecret;
    return true;
  }

  const newSecret = createUuid();
  const saved = await storage.setConfig("jwtSecret", newSecret);
  if (!saved) return false;

  jwtSecret = newSecret;
  return true;
}

function getJWTSecret() {
  return jwtSecret;
}

const helpers = {
  addJWTSecret,
  getJWTSecret,
};

function requireHelpers() {
  return helpers;
}

bundleState.require_helpers = requireHelpers;
bundleState.helpers = helpers;
globalThis.require_helpers = requireHelpers;
globalThis.helpers = helpers;

function serializeUser(data) {
  const attributes = { ...data };
  const id = attributes.id;
  delete attributes.id;

  const resource = { type: "users" };
  if (id !== undefined && id !== null) resource.id = String(id);
  resource.attributes = attributes;
  return { data: resource };
}

const Jsonapi = {
  UserType: "users",
  AppType: "apps",
  LogType: "logs",
  Serializer: {
    serialize(type, data) {
      return type === "users" ? serializeUser(data) : { data };
    },
  },
};

function requireJsonapiUtil() {
  return Jsonapi;
}

bundleState.require_jsonapiUtil = requireJsonapiUtil;
bundleState.Jsonapi = Jsonapi;
globalThis.require_jsonapiUtil = requireJsonapiUtil;
globalThis.Jsonapi = Jsonapi;

function getBearerToken(request) {
  const authorization = request.headers.authorization;
  return authorization && authorization.split(" ")[1];
}

function sendSerializedError(response, status, error, message) {
  response.status(status).send(
    Jsonapi.Serializer.serialize(Jsonapi.UserType, { error, message }),
  );
}

async function ensureJWTSecret() {
  if (!helpers.getJWTSecret()) await helpers.addJWTSecret();
  return helpers.getJWTSecret();
}

exports.authenticateToken = async (request, response, next) => {
  const token = getBearerToken(request);
  if (token == null) {
    sendSerializedError(response, 401, "Unauthorized", "invalid session");
    return;
  }

  const secret = await ensureJWTSecret();
  jwt.verify(token, secret, (error, payload) => {
    if (error) {
      sendSerializedError(response, 403, "Forbidden", "try again some time");
      return;
    }

    request.email = payload.email;
    next();
  });
};

exports.authenticateTokenWithAdmin = async (request, response, next) => {
  const token = getBearerToken(request);
  if (token == null) {
    sendSerializedError(response, 401, "Unauthorized", "invalid session");
    return;
  }

  const secret = await ensureJWTSecret();
  jwt.verify(token, secret, async (error, payload) => {
    if (error) {
      response.status(403).send({
        errors: [{ error: "Forbidden", message: "Access denied" }],
      });
      return;
    }

    request.email = payload.email;
    const storage = getStorageConnection();
    const user = await storage.getUserByEmail(request.email);

    if (user && user.item && user.item.role === "admin") {
      next();
    } else {
      response.status(403).send({
        errors: [{ error: "Forbidden", message: "Access denied" }],
      });
    }
  });
};

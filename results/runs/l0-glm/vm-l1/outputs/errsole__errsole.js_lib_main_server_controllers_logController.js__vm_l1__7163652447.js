'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;

var require_jsonapiUtil = require('../work/errsole__errsole.js/lib/main/server/utils/jsonapiUtil.js');
var require_storageConnection = require('../work/errsole__errsole.js/lib/main/server/storageConnection.js');
var require_helpers = require('../work/errsole__errsole.js/lib/main/server/utils/helpers.js');

var Jsonapi = require_jsonapiUtil();
var { getStorageConnection } = require_storageConnection();
var helpers = require_helpers();

exports.getLogs = async (req, res) => {
  try {
    const query = req.query || {};
    let search_terms;
    query.search_terms && (search_terms = query.search_terms.split(','));
    query.limit && (query.limit = parseInt(query.limit));
    query.hostnames && (query.hostnames = query.hostnames.split(',').map(item => item.trim()));
    query.level_json && (query.level_json = query.level_json && JSON.parse(query.level_json).length === 0 ? [{}] : JSON.parse(query.level_json));
    query.filters && (query.filters = query.filters && JSON.parse(query.filters).length === 0 ? [] : JSON.parse(query.filters));
    const storageConnection = getStorageConnection();
    let result = {};
    if (search_terms) {
      result = await storageConnection.searchLogs(search_terms, query);
    } else {
      result = await storageConnection.getLogs(query);
    }
    if (result && result.items) {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.items, result.meta));
    } else {
      const errors = [{ 'error': 'Bad Request', 'message': result && result.error ? result.error : 'invalid request' }];
      res.status(400).send({ 'errors': errors });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ 'errors': [{ 'error': 'Internal Server Error', 'message': err && err.message ? err.message : 'An unexpected error occurred' }] });
  }
};

exports.getLogsTTL = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const result = await storageConnection.getConfig('logsTTL');
    if (result && result.item) {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
    } else {
      const errors = [{ 'error': 'Bad Request', 'message': result && result.error ? result.error : 'invalid request' }];
      res.status(400).send({ 'errors': errors });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ 'errors': [{ 'error': 'Internal Server Error', 'message': err && err.message ? err.message : 'An unexpected error occurred' }] });
  }
};

exports.updateLogsTTL = async (req, res) => {
  try {
    const { ttl } = helpers.ensureLogsTTL(req.body);
    if (ttl) {
      const storageConnection = getStorageConnection();
      const result = await storageConnection.setConfig('logsTTL', ttl);
      if (result && result.item) {
        await storageConnection.deleteAllLogs();
        res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
      } else {
        const errors = [{ 'error': 'Bad Request', 'message': result && result.error ? result.error : 'invalid request' }];
        res.status(400).send({ 'errors': errors });
      }
    } else {
      const errors = [{ 'error': 'Bad Request', 'message': 'invalid request' }];
      res.status(400).send({ 'errors': errors });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ 'errors': [{ 'error': 'Internal Server Error', 'message': err && err.message ? err.message : 'An unexpected error occurred' }] });
  }
};

exports.getLogMeta = async (req, res) => {
  const logId = req.params.logId;
  try {
    if (logId) {
      const storageConnection = getStorageConnection();
      const result = await storageConnection.getMeta(logId);
      if (result && result.item) {
        res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
      } else {
        const errors = [{ 'error': 'Bad Request', 'message': 'invalid request' }];
        res.status(400).send({ 'errors': errors });
      }
    } else {
      const errors = [{ 'error': 'Bad Request', 'message': 'invalid request' }];
      res.status(400).send({ 'errors': errors });
    }
  } catch (err) {
    console.error(err);
    if (err.message === 'storageConnection.getMeta is not a function') {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, { 'id': logId, 'meta': '{}' }));
    } else {
      res.status(500).send({ 'errors': [{ 'error': 'Internal Server Error', 'message': err && err.message ? err.message : 'An unexpected error occurred' }] });
    }
  }
};

exports.getHostnames = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const result = await storageConnection.getHostnames();
    if (result && result.items) {
      const data = { 'hostnames': result.items };
      res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, data));
    } else {
      const errors = [{ 'error': 'Bad Request', 'message': result && result.error ? result.error : 'invalid request' }];
      res.status(400).send({ 'errors': errors });
    }
  } catch (err) {
    console.error(err);
    if (err.message === 'storageConnection.getHostnames is not a function') {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, {}));
    } else {
      res.status(500).send({ 'errors': [{ 'error': 'Internal Server Error', 'message': err && err.message ? err.message : 'An unexpected error occurred' }] });
    }
  }
};

exports.deleteAllLogs = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    await storageConnection.deleteAllLogs();
    res.send({ 'message': 'All logs have been successfully deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ 'errors': [{ 'error': 'Internal Server Error', 'message': err.message || 'An unexpected error occurred while deleting logs.' }] });
  }
};

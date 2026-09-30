'use strict';

const encodedStrings = [
  'hqC6sW',
  'oCkEWRxcLW',
  'gLhcT8kvWQZcHa',
  'ywZcTSoQsq',
  'zmooDCk+WOxdT3bJ',
  'DmogpqpcLa',
  'o0tcMbe',
  'deZcPSkrWRS',
  'phOGvGFdUCoB',
  'WQJdLCkSWOpdHSoQaW',
  'eSklfuK',
  'W60unXhcPConlSodzSkdW6/cSMm',
  'W6GJxGxdQSo6',
  'WOxcTHNcN002sGm',
  'dNxcN8kNwgPCW7W',
  'cwlcNW',
  'W4JcQGJcVLa',
  'W7lcPsNcH0tdGqRdOG',
  'WPGcumoIW7y6WQNcMX1B',
  'CSobAmkuWOW',
  'WQfEm8oThbJdOveEqL8',
  'tCkDW60wxmkxgSkV',
  'x8oxcq',
  'r2tcICottSo+W4G',
  'EeNcVSowuW',
  'WOyvW5SBWRa',
  'dwhcQSkxEa',
  'zqKRCq',
  'cIpcPSoqW7m',
  'W7fcWR7cGai',
  'W67cQahcH2tdIXVdUW',
  'W7OpqXRdLG',
  'j8kGWO/cQSk/',
  'nrJcLCoiW7xcLCkb',
  'WPRdOCkxAxldQIVdLSklgCkLW4Wv',
  'm1dcMXFcMCkPW7ZdPq',
  'CmocBCkPWPldKNHQ',
  'yHxdG0xcO8kLW7BdSXFcPW',
  'WQlcVWJcM0a',
  'WRmPW4aaWQfVWRVcSG',
  'W6NdOCo5W4BcMG',
  'W6HdcCkRW5O',
  'kmoUuuORWPDiW4JcI8kBvq',
  'AKFdRq',
  'W4ddGGJcJ8kjW4/cPSkT',
  'WPbWFtZcGW',
  'W6GJxGxdQSo6cfu',
  'WPDfWRpdI8orv1OaW5qfDSoK',
  'W5ddQ1tdGXz2hZlcT8ktWQVcJte',
  'W4b2WOtcNrhdGcCW',
  'W4SKAJtdKq',
  'jLhcLadcMmkZ',
  'A8oiD8o0WOhdPxjO',
  'xCkYtmkChCoPAG',
  'tmkYyefvBSo0W5S',
  'k3hcRSk/WPK',
  'W6KCpbdcRSojF8ofv8kjW6ZcNa',
  'DmoVoupdQq',
  'v3RcKCoorSo/',
  'W4qCW63cLSkmbLy2',
  'gmo8eSoR',
  'WPNcGa7cGCkXW5BcGSkJ',
  'o03cVrpcUq',
  'W4RdQmk1W7JdVSoVwKC',
  'qSo2ixRdIG',
  'W7VdPCkWW5JdHG',
  'W43cMvfEpa',
  'W5BdSCknW7/dOG',
  'W4JcPMG',
  'D8oXwmkoWQO',
  'o8kbc8oYvGVdGKy',
  'WQZcSGhcK00Rqbi',
  'pe3cSsxcMhVcTSo3',
  'W7JdNrxcJCkN',
  'qIPiWQe',
  'ASk9ASkYha',
  'rSk8c8oKp01PFq',
  'sCkcW4VcNq',
  'xJFdMSoWtunpW43cP8kG',
  'W60zpHNcPmomk8oas8kdW5VcNeq',
  'W5ddGt7cOmkb',
  'nmo5FwVdTsGZWQZcTmoR',
  'W7NcO33dMIW',
  'nxe6qXRdTa',
  'W6eKlMxcRSknWOLrW7Ge',
  'eZRdImkyfSkTWOTdBCkRWR3cLhu',
  'lgJcG8kYrezDWRC',
  'wfVdR18',
  'EJeEW5hdTsdcHCkVW4/cVgNdT08',
  'B8k8AfmoFSoKWP0',
  'bmkwcfa',
  'W6/cRHtcM0VdGrO',
  'WO9FWOldOmkWfCoUoW',
  'j8oPv0nDWPn3W6RcKmkb',
  'WPBdLCk/WOpdISo7ba',
  'WQiZW48LWPe',
  'B37cU8oRCq'
];

function decrypt(value, key) {
  const decoded = Buffer.from(value, 'base64').toString('utf8');
  const state = Array.from({ length: 256 }, (_, index) => index);

  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + state[i] + key.charCodeAt(i % key.length)) % 256;
    [state[i], state[j]] = [state[j], state[i]];
  }

  let i = 0;
  j = 0;
  let result = '';

  for (let position = 0; position < decoded.length; position++) {
    i = (i + 1) % 256;
    j = (j + state[i]) % 256;
    [state[i], state[j]] = [state[j], state[i]];

    const keyByte = state[(state[i] + state[j]) % 256];
    result += String.fromCharCode(decoded.charCodeAt(position) ^ keyByte);
  }

  return result;
}

const fileStringIndex = encodedStrings.findIndex(
  value => decrypt(value, '6p31') === 'File'
);
const rotation = (
  fileStringIndex - 83 + encodedStrings.length
) % encodedStrings.length;

function decode(index, key) {
  const actualIndex = (
    index + rotation + encodedStrings.length
  ) % encodedStrings.length;
  return decrypt(encodedStrings[actualIndex], key);
}

const scannerModuleName = decode(58, 'VlPV');
const { scanBuffer, Verdict } = require(scannerModuleName);

const NodeFile =
  globalThis.File ??
  require('node:buffer').File;

const SCAN_KEYS = [
  decode(63, 'eA)g'),
  decode(80, 'WiW$'),
  decode(89, '1e7a'),
  decode(39, 'NjAh'),
  decode(81, 'R35('),
  decode(22, 'A%Sd') + 'ay'
];

const emptyInputVerdictName = decode(24, 'IU@W');
const emptyBufferVerdictName = decode(31, ')%2j');
const maliciousVerdictName = decode(57, 'IU@W') + 's';
const defaultFilename = decode(78, '0lEz');
const callbackFilenameKey = decode(87, 'A%Sd');
const responseErrorKey = decode(90, '1e7a');
const responseFilenameKey = decode(45, '2R*b');
const maliciousFileMessage =
  decode(75, '0y5l') +
  decode(96, 'IU@W');
const jsonContentType =
  decode(30, 'BCmj') +
  decode(38, 'A%Sd');

function buildScanOptions(options) {
  const scanOptions = {};

  for (const key of SCAN_KEYS) {
    if (options[key] !== undefined) {
      scanOptions[key] = options[key];
    }
  }

  return scanOptions;
}

async function toBuffer(value) {
  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }

  if (value && typeof value.arrayBuffer === 'function') {
    return Buffer.from(await value.arrayBuffer());
  }

  return null;
}

async function scanUpload(upload, options) {
  if (!upload) {
    return Verdict[emptyInputVerdictName];
  }

  const scanOptions = buildScanOptions(options || {});
  const buffer = await toBuffer(upload);

  if (!buffer || buffer.length === 0) {
    return Verdict[emptyBufferVerdictName];
  }

  const verdict = await scanBuffer(buffer, scanOptions);

  if (verdict === Verdict[maliciousVerdictName]) {
    const filename =
      upload && typeof upload.name === 'string'
        ? upload.name
        : defaultFilename;

    const onInfected = options && options.onInfected;

    if (typeof onInfected === 'function') {
      return onInfected({
        [callbackFilenameKey]: filename
      });
    }

    const body = {
      [responseErrorKey]: maliciousFileMessage,
      [responseFilenameKey]: filename
    };

    throw new Response(JSON.stringify(body), {
      status: 422,
      headers: {
        'content-type': jsonContentType
      }
    });
  }

  return verdict;
}

async function scanFormData(formData, options) {
  if (!formData || typeof formData.entries !== 'function') {
    return;
  }

  for (const [, value] of formData.entries()) {
    if (
      value instanceof NodeFile ||
      (
        value &&
        typeof value.arrayBuffer === 'function'
      )
    ) {
      await scanUpload(value, options);
    }
  }
}

module.exports = {
  scanUpload,
  scanFormData,
  Verdict
};

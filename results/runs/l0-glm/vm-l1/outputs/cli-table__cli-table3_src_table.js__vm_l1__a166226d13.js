const debug = require('debug')('cli-table3');
const utils = require('./utils');
const tableLayout = require('./layout-manager');

class Table extends Array {
  constructor(options) {
    super();
    this.options = utils.options(options);
    this.table = tableLayout(this);
  }

  toString() {
    let tableStr = this.table.render();
    debug('Table output:\n%s', tableStr);
    return tableStr;
  }

  get width() {
    return this.table.width;
  }
}

Table.reset = () => debug.reset();

function doDraw(rows, options, callback) {
  const table = new Table(options);
  for (const row of rows) {
    table.push(row);
  }
  const output = table.toString();
  if (callback) {
    callback(null, output);
  }
  return output;
}

module.exports = Table;

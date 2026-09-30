'use strict';

const debug = require('./debug');
const utils = require('./utils');
const tableLayout = require('./layout-manager');

class Table extends Array {
  constructor(options) {
    super();

    this.options = utils.mergeOptions(options, {
      chars: {
        top: '─',
        'top-mid': '┬',
        'top-left': '┌',
        'top-right': '┐',
        bottom: '─',
        'bottom-mid': '┴',
        'bottom-left': '└',
        'bottom-right': '┘',
        left: '│',
        'left-mid': '├',
        mid: '─',
        'mid-mid': '┼',
        right: '│',
        'right-mid': '┤',
        middle: '│',
      },
      truncate: '…',
      colWidths: [],
      rowHeights: [],
      colAligns: [],
      rowAligns: [],
      style: {
        'padding-left': 1,
        'padding-right': 1,
        head: ['red'],
        border: ['grey'],
        compact: false,
      },
      head: [],
      wordWrap: false,
      wrapOnWordBoundary: true,
    });
  }

  toString() {
    let cells = tableLayout.makeTableLayout(this);

    cells = tableLayout.fillInTable(cells);
    cells = tableLayout.addRowSpanCells(cells);

    tableLayout.computeWidths(this.options.colWidths, cells);
    tableLayout.computeHeights(this.options.rowHeights, cells);

    for (const row of cells) {
      for (const cell of row) {
        cell.mergeTableOptions(this.options, cells);
      }
    }

    return tableLayout.layoutTable(cells).map(doDraw).join('\n');
  }

  get width() {
    return (
      this.options.colWidths.reduce((sum, width) => sum + width, 0) +
      this.options.colWidths.length +
      1
    );
  }
}

Table.reset = () => debug.reset();

function doDraw(row, lineNum, table) {
  return row.map((cell) => cell.draw(lineNum, table)).join('');
}

module.exports = Table;

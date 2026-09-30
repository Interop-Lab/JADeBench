const doDraw = function (options, debug, tableLayout) {
  const utils = require('./utils');
  const Cell = require('./cell');
  const layoutManager = require('./layout-manager');

  const defaultOptions = {
    border: {
      topBody: '─',
      topJoin: '┬',
      topLeft: '┌',
      topRight: '┐',
      bottomBody: '─',
      bottomJoin: '┴',
      bottomLeft: '└',
      bottomRight: '┘',
      bodyLeft: '│',
      bodyRight: '│',
      bodyJoin: '│',
      joinBody: '─',
      joinLeft: '├',
      joinRight: '┤',
      joinJoin: '┼'
    },
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
      middle: '│'
    },
    style: {
      'padding-left': 1,
      'padding-right': 1,
      head: ['red'],
      border: ['grey'],
      compact: false
    },
    colWidths: [],
    colAligns: [],
    truncate: '…'
  };

  options = Object.assign({}, defaultOptions, options);

  if (typeof options.head === 'undefined') {
    options.head = [];
  }

  if (typeof options.colWidths === 'undefined') {
    options.colWidths = [];
  }

  if (typeof options.colAligns === 'undefined') {
    options.colAligns = [];
  }

  if (typeof options.style === 'undefined') {
    options.style = {};
  }

  if (typeof options.style.head === 'undefined') {
    options.style.head = [];
  }

  if (typeof options.style.border === 'undefined') {
    options.style.border = [];
  }

  if (typeof options.style.compact === 'undefined') {
    options.style.compact = false;
  }

  if (typeof options.chars === 'undefined') {
    options.chars = {};
  }

  if (typeof options.border === 'undefined') {
    options.border = {};
  }

  const chars = Object.assign({}, defaultOptions.chars, options.chars);
  const border = Object.assign({}, defaultOptions.border, options.border);

  const table = new Table(options);

  table.options = options;
  table.chars = chars;
  table.border = border;

  if (options.head && options.head.length) {
    table.push(options.head);
  }

  if (options.rows && options.rows.length) {
    for (const row of options.rows) {
      table.push(row);
    }
  }

  const layout = layoutManager(table, options);

  const output = [];

  const drawLine = (index, size, style) => {
    const line = [];
    for (let i = 0; i < size; i++) {
      line.push(style);
    }
    output.push(line.join(''));
  };

  const drawTop = () => {
    const line = [];
    line.push(border.topLeft);
    for (let i = 0; i < layout.length; i++) {
      line.push(border.topBody.repeat(layout[i]));
      if (i < layout.length - 1) {
        line.push(border.topJoin);
      }
    }
    line.push(border.topRight);
    output.push(line.join(''));
  };

  const drawBottom = () => {
    const line = [];
    line.push(border.bottomLeft);
    for (let i = 0; i < layout.length; i++) {
      line.push(border.bottomBody.repeat(layout[i]));
      if (i < layout.length - 1) {
        line.push(border.bottomJoin);
      }
    }
    line.push(border.bottomRight);
    output.push(line.join(''));
  };

  const drawMiddle = () => {
    const line = [];
    line.push(border.joinLeft);
    for (let i = 0; i < layout.length; i++) {
      line.push(border.joinBody.repeat(layout[i]));
      if (i < layout.length - 1) {
        line.push(border.joinJoin);
      }
    }
    line.push(border.joinRight);
    output.push(line.join(''));
  };

  const drawRow = (row, style) => {
    const line = [];
    line.push(border.bodyLeft);
    for (let i = 0; i < row.length; i++) {
      const cell = new Cell(row[i], layout[i], options);
      line.push(cell.toString());
      if (i < row.length - 1) {
        line.push(border.bodyJoin);
      }
    }
    line.push(border.bodyRight);
    output.push(line.join(''));
  };

  drawTop();
  if (table.length) {
    drawRow(table[0], options.style.head);
    if (table.length > 1) {
      drawMiddle();
      for (let i = 1; i < table.length; i++) {
        drawRow(table[i], options.style.border);
      }
    }
  }
  drawBottom();

  return output.join('\n');
};

module.exports = doDraw;

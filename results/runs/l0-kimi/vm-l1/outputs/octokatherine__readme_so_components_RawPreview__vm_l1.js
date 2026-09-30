const React = require('react');

function RawPreview() {
  return React.createElement('div', { className: 'raw-preview' }, 'Raw Preview Content');
}

module.exports = { default: RawPreview };

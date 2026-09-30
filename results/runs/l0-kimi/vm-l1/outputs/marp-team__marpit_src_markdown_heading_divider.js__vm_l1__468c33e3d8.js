const headingDivider = (() => {
  const plugin = require('../work/marp-team__marpit/src/plugin.js');
  
  function _headingDivider() {
    return plugin.default(_headingDivider);
  }
  
  return _headingDivider;
})();

function split(str, separator) {
  return str.split(separator);
}

module.exports = {
  headingDivider,
  split
};

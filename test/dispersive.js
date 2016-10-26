if (process.env.DISPERSIVE_ECMA === '5') {
  module.exports = require('..');
} else {
  module.exports = require('../src');
}

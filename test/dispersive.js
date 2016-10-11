if (process.env.DISPERSIVE_ECMA === '5') {
  module.exports = require('../es5');
} else {
  module.exports = require('..');
}

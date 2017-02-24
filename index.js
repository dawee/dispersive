const modules = require('./modules');
const dispersive = module.exports = {};

Object.keys(modules).forEach(key => dispersive[key] = require(modules[key]));

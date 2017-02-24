const path = require('path');


const relative = sub => path.join(__dirname, sub);


module.exports = {
  assert: relative('./assert'),
  error: relative('./error'),
  manager: relative('./manager'),
  model: relative('./model'),
  transaction: relative('./transaction'),
};

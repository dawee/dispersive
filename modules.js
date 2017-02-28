const path = require('path');


const relative = sub => path.join(__dirname, sub);


module.exports = {
  action: relative('./action'),
  assert: relative('./assert'),
  emitter: relative('./emitter'),
  error: relative('./error'),
  field: {
    index: relative('./field'),
    many: relative('./field/many'),
  },
  manager: relative('./manager'),
  model: relative('./model'),
  pool: relative('./pool'),
  queryset: relative('./queryset'),
  transaction: relative('./transaction'),
};

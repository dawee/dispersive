const assign = require('101/assign');


class Schema {

  constructor(fields = {}) {
    this.fields = assign({id: null}, fields);
  }

  has(name) {
    return name in this.fields;
  }

}

module.exports = Schema;

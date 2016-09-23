

class Field {

  constructor({initial = null, indexed = false}) {
    this.initial = initial;
    this.indexed = indexed;
  }

}


class Schema {

  constructor(fields = {}) {
    this.fields = {};

    for (const name of Object.keys(fields)) {
      this.fields[name] = new Field({initial: fields[name]});
    }

    this.fields.id = new Field({indexed: true});
  }

  has(name) {
    return name in this.fields;
  }

}

module.exports = Schema;

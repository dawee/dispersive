

class Field {

  constructor({initial = null, indexed = false, unique = false}) {
    this.initial = initial;
    this.indexed = indexed;
    this.unique = unique;
  }

}


class Schema {

  constructor(fields = {}) {
    this._fields = {};

    for (const name of Object.keys(fields)) {
      this._fields[name] = new Field({initial: fields[name]});
    }

    this._fields.id = new Field({indexed: true, unique: true});
  }

  *fields() {
    for (const name of Object.keys(this._fields)) {
      yield [name, this._fields[name]];
    }
  }

  *names() {
    for (const name of Object.keys(this._fields)) {
      yield name;
    }
  }

  *initials() {
    for (const [name, field] of this.fields()) {
      yield [name, field.initial];
    }
  }

  has(name) {
    return name in this._fields;
  }

  isIndexed(name) {
    return this.fields[name].indexed;
  }

}

module.exports = Schema;

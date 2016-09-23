

class Field {

  constructor({initial = null, index = false, unique = false}) {
    this.initial = initial;
    this.index = index;
    this.unique = unique;
  }

  static create(expression) {
    let field = null;

    if (typeof expression === 'object' && expression !== null) {
      field = new Field(expression);
    } else {
      field = new Field({initial: expression});
    }

    return field;
  }

}


class Schema {

  constructor(fields = {}) {
    this._fields = {};

    for (const name of Object.keys(fields)) {
      this._fields[name] = Field.create(fields[name]);
    }

    this._fields.id = new Field({index: true, unique: true});
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
    return this.fields[name].index;
  }

  isUnique(name) {
    return this.fields[name].unique;
  }

}

module.exports = Schema;

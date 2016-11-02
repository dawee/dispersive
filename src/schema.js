

class Field {

  constructor({initial = null, index = false, unique = false}) {
    this.initial = initial;
    this.index = index;
    this.unique = unique;
  }

  static create(spec) {
    if (spec instanceof Field) return spec;

    let field = null;

    if (typeof spec === 'object' && spec !== null && !Array.isArray(spec)) {
      field = new Field(spec);
    } else {
      field = new Field({initial: spec});
    }

    return field;
  }

}

class IndexedField extends Field {

  constructor(opts = {initial: null, unique: false}) {
    super(Object.assign({index: true}, opts));
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
    return this._fields[name].index;
  }

  isUnique(name) {
    return this._fields[name].unique;
  }

}

Schema.IndexedField = IndexedField;

module.exports = Schema;

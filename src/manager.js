const Immutable = require('immutable');
const assert = require('./assert');


const createObjectManagerConstructor = QuerySetConstructor => class extends QuerySetConstructor {

  constructor({ setup, values, transaction = null }) {
    super({ QuerySetConstructor, values });

    this.manager = this;
    this.transaction = transaction;
    this.setup = setup;
  }

  build(values = Immutable.Map()) {
    const EntryConstructor = this.setup.get('EntryConstructor');
    return new EntryConstructor({ values, manager: this, setup: this.setup });
  }

  get(expression) {
    return typeof expression === 'string'
      ? this.build(this.values.get(expression))
      : super.get(expression);
  }

  create(rawValues = {}) {
    const entry = this.build();

    entry.save();
    entry.update(rawValues);

    return entry;
  }

  getOrCreate(expression) {
    return this.get(expression) || this.create(expression);
  }

  sync(values) {
    assert.hasTransaction(this);
    return this.transaction.sync(values);
  }

  unsync(values) {
    assert.hasTransaction(this);
    return this.transaction.unsync(values);
  }

};

module.exports = {
  createObjectManagerConstructor,
};

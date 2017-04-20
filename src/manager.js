const Immutable = require('immutable');
const assert = require('assert');

const NO_VALUES = `
  Trying to build entry without values.
`.trim();

const NO_TRANSACTION = `
  Trying to change model without a transaction.
  Make sure you are inside an action.
`.trim();

const createObjectManagerConstructor = QuerySetConstructor => class extends QuerySetConstructor {

  constructor({ setup, values, transaction = null }) {
    super({ QuerySetConstructor, values });

    this.manager = this;
    this.transaction = transaction;
    this.setup = setup;
  }

  get values() {
    return this.transaction ? this.transaction.values : this.inputValues;
  }

  build(values = Immutable.Map()) {
    assert.ok(values && values instanceof Immutable.Map, NO_VALUES);

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
    assert.ok(this.transaction, NO_TRANSACTION);
    return this.transaction.sync(values);
  }

  unsync(values) {
    assert.ok(this.transaction, NO_TRANSACTION);
    return this.transaction.unsync(values);
  }

};

module.exports = {
  createObjectManagerConstructor,
};

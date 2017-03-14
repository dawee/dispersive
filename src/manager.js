const Immutable = require('immutable');
const assert = require('./assert');
const {Transaction} = require('./transaction');

const createObjectManagerConstructor = QuerySetConstructor => class extends QuerySetConstructor {

  constructor({model, emitter, setup, values, transaction = null}) {
    super({QuerySetConstructor});

    this.model = model;
    this.values = values;
    this.emitter = emitter;
    this.transaction = transaction;
    this.setup = setup;
  }

  * entries() {
    for (const [, values] of this.values.entries()) {
      yield this.build(values);
    }
  }

  createTransaction() {
    assert.hasNoTransaction(this);
    this.transaction = new Transaction({values: this.values, setup: this.setup});

    return this.transaction;
  }

  commitTransaction() {
    this.values = this.transaction.values;
    this.transaction = null;
  }

  abortTransaction() {
    this.transaction = null;
  }

  build(values = Immutable.Map()) {
    const EntryConstructor = this.setup.get('EntryConstructor');
    return new EntryConstructor({values, model: this.model, setup: this.setup});
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

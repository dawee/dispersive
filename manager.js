const Immutable = require('immutable');
const assert = require('./assert');
const {Transaction} = require('./transaction');
const {QuerySet} = require('./queryset');

class EntriesGenerator {

  constructor(manager) {
    this.manager = manager;
  }

  * entries() {
    for (const keyValues of this.manager.values.entries()) {
      const values = keyValues[1];
      yield this.manager.initEntryFromValues(values);
    }
  }

}

class ObjectManager extends QuerySet {

  constructor({emitter, setup, values = Immutable.Map()}) {
    super({parent: null});

    this.values = values;
    this.parent = new EntriesGenerator(this);
    this.emitter = emitter;
    this.transaction = null;
    this.setup = setup;
  }

  useSetup(setup) {
    const ObjectManagerConstructor = setup.get('ObjectManagerConstructor');
    return new ObjectManagerConstructor({emitter: this.emitter, values: this.values, setup});
  }

  createTransaction() {
    assert.hasNoTransaction(this);
    this.transaction = new Transaction({values: this.values, setup: this.setup});

    return this.transaction;
  }

  commitTransaction() {
    this.values = this.transaction.values;

    this.transaction = null;
    this.emitter.emitChange();
  }

  abortTransaction() {
    this.transaction = null;
  }

  initEntryFromValues(values) {
    const EntryConstructor = this.setup.get('EntryConstructor');
    return new EntryConstructor({values: Immutable.Map(values), manager: this, setup: this.setup});
  }

  create(values = {}) {
    const entry = this.initEntryFromValues(values);

    entry.save();
    return entry;
  }

  sync(entry) {
    assert.hasTransaction(this);
    return this.transaction.sync(entry);
  }

  get length() {
    return this.values.count();
  }

}

module.exports = {
  ObjectManager,
};

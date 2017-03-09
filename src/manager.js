const Immutable = require('immutable');
const assert = require('./assert');
const {Transaction} = require('./transaction');

class EntriesGenerator {

  constructor(manager) {
    this.manager = manager;
  }

  * entries() {
    for (const [, values] of this.manager.stageValues.entries()) {
      yield this.manager.build(values);
    }
  }

}

const createObjectManagerConstructor = QuerySetConstructor => class extends QuerySetConstructor {

  constructor({emitter, setup, values = Immutable.Map()}) {
    super({parent: null, QuerySetConstructor});

    this.values = values;
    this.parent = new EntriesGenerator(this);
    this.emitter = emitter;
    this.transaction = null;
    this.setup = setup;
  }

  get stageValues() {
    return this.transaction ? this.transaction.values : this.values;
  }

  useSetup(setup) {
    const NewQuerySetConstructor = setup.get('QuerySetConstructor');
    const ObjectManagerConstructor = createObjectManagerConstructor(NewQuerySetConstructor);
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

  build(values = Immutable.Map()) {
    const EntryConstructor = this.setup.get('EntryConstructor');
    return new EntryConstructor({values, manager: this, setup: this.setup});
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

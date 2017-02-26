const Immutable = require('immutable');
const assert = require('./assert');
const {createTransaction} = require('./transaction');
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

  constructor({emitter, entryFactory, EntryConstructor}) {
    super({parent: null});

    this.values = Immutable.Map();
    this.parent = new EntriesGenerator(this);
    this.transaction = null;
    this.emitter = emitter;
    this.entryFactory = entryFactory;
    this.EntryConstructor = EntryConstructor;
  }

  createTransaction() {
    assert.hasNoTransaction(this);
    this.transaction = createTransaction(this);

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
    return this.entryFactory({
      EntryConstructor: this.EntryConstructor,
      values: Immutable.Map(values),
      objects: this,
    });
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


const createObjects = setup => new ObjectManager(setup);


module.exports = {
  ObjectManager,
  createObjects,
};

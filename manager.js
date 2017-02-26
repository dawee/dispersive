const Immutable = require('immutable');
const assert = require('./assert');
const {createTransaction} = require('./transaction');
const {QuerySet} = require('./queryset');


class ObjectManager extends QuerySet {

  constructor({emitter, entryFactory}) {
    super({parent: null});

    this.values = Immutable.Map();
    this.transaction = null;
    this.emitter = emitter;
    this.entryFactory = entryFactory;
  }

  get parent() {
    return this.values;
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

  create(values = {}) {
    const entry = this.entryFactory({
      values: Immutable.Map(values),
      objects: this,
    });

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

const Immutable = require('immutable');
const assert = require('./assert');
const {createTransaction} = require('./transaction');


class ObjectManager {

  constructor(deps = {createTransaction}) {
    this.map = Immutable.Map();
    this.transaction = null;
    this.deps = deps;
  }

  createTransaction() {
    assert.hasNoTransaction(this);
    this.transaction = this.deps.createTransaction(this);

    return this.transaction;
  }

  commitTransaction() {
    this.map = this.transaction.map;
    this.transaction = null;
  }

  abortTransaction() {
    this.transaction = null;
  }

  create(values = {}) {
    const entry = this.deps.model.factory({
      values: Immutable.Map(values),
      model: this.deps.model,
      manager: this,
    });

    entry.save();

    return entry;
  }

  sync(entry) {
    assert.hasTransaction(this);
    return this.transaction.sync(entry);
  }

  get length() {
    return this.map.count();
  }

}


const createObjects = ({model}) => new ObjectManager({createTransaction, model});


module.exports = {
  ObjectManager,
  createObjects,
};

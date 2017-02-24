const Immutable = require('immutable');
const assert = require('./assert');
const {createTransaction} = require('./transaction');


class ObjectManager {

  constructor(deps = {createTransaction}) {
    this.list = Immutable.List();
    this.transaction = null;
    this.deps = deps;
  }

  createTransaction() {
    assert.hasNoTransaction(this);
    this.transaction = this.deps.createTransaction(this);

    return this.transaction;
  }

  commitTransaction() {
    this.list = this.transaction.list;
    this.transaction = null;
  }

  abortTransaction() {
    this.transaction = null;
  }

  create(values = {}) {
    assert.hasTransaction(this);
    this.transaction.create(values);
  }

  get length() {
    return this.list.count();
  }

}


const createObjects = () => new ObjectManager({createTransaction});


module.exports = {
  ObjectManager,
  createObjects,
};

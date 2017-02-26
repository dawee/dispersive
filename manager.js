const Immutable = require('immutable');
const assert = require('./assert');
const {createTransaction} = require('./transaction');
const {QuerySet} = require('./queryset');


class ObjectManager extends QuerySet {

  constructor(deps = {createTransaction}) {
    super({parent: null});

    this.values = Immutable.Map();
    this.transaction = null;
    this.deps = deps;
  }

  get parent() {
    return this.values;
  }

  createTransaction() {
    assert.hasNoTransaction(this);
    this.transaction = this.deps.createTransaction(this);

    return this.transaction;
  }

  commitTransaction() {
    this.values = this.transaction.values;

    this.transaction = null;
    this.deps.model.get('emitter').emitChange();
  }

  abortTransaction() {
    this.transaction = null;
  }

  create(values = {}) {
    const createEntry = this.deps.model.get('factory');
    const entry = createEntry({
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
    return this.values.count();
  }

}


const createObjects = ({model}) => new ObjectManager({createTransaction, model});


module.exports = {
  ObjectManager,
  createObjects,
};

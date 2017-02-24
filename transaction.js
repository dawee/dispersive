const ulid = require('ulid');
const assert = require('./assert');

const ID_KEY = '_id';

class Transaction {

  constructor({map}) {
    this.map = map;
  }

  syncNew(entry) {
    const id = ulid();
    const values = entry.values.set(ID_KEY, id);

    this.map = this.map.set(id, values);

    return values;
  }

  syncExisting(entry) {
    const id = entry.values.get(ID_KEY);

    assert.entryExists(this, id);

    if (entry.values !== this.map.get(id)) {
      this.map = this.map.set(id, entry.values);
    }

    return entry.values;
  }

  sync(entry) {
    return entry.values.has(ID_KEY) ? this.syncExisting(entry) : this.syncNew(entry);
  }

}

const createTransaction = ({map}) => new Transaction({map});

module.exports = {
  Transaction,
  createTransaction,
};

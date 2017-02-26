const ulid = require('ulid');
const assert = require('./assert');

const ID_KEY = '_id';

class Transaction {

  constructor({values}) {
    this.values = values;
  }

  syncNew(entry) {
    const id = ulid();
    const values = entry.values.set(ID_KEY, id);

    this.values = this.values.set(id, values);

    return values;
  }

  syncExisting(entry) {
    const id = entry.values.get(ID_KEY);

    assert.entryExists(this, id);

    if (entry.values !== this.values.get(id)) {
      this.values = this.values.set(id, entry.values);
    }

    return entry.values;
  }

  sync(entry) {
    return entry.values.has(ID_KEY) ? this.syncExisting(entry) : this.syncNew(entry);
  }

}

const createTransaction = ({values}) => new Transaction({values});

module.exports = {
  Transaction,
  createTransaction,
};

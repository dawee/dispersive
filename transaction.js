const ulid = require('ulid');
const assert = require('./assert');


class Transaction {

  constructor({values, idKey}) {
    this.values = values;
    this.idKey = idKey;
  }

  syncNew(entry) {
    const id = ulid();
    const values = entry.values.set(this.idKey, id);

    this.values = this.values.set(id, values);

    return values;
  }

  syncExisting(entry) {
    const id = entry.values.get(this.idKey);

    assert.entryExists(this, id);

    if (entry.values !== this.values.get(id)) {
      this.values = this.values.set(id, entry.values);
    }

    return entry.values;
  }

  sync(entry) {
    return entry.values.has(this.idKey) ? this.syncExisting(entry) : this.syncNew(entry);
  }

}

const createTransaction = ({values}) => new Transaction({values});

module.exports = {
  Transaction,
  createTransaction,
};

const ulid = require('ulid');
const assert = require('./assert');


class Transaction {

  constructor({values, setup}) {
    this.values = values;
    this.idKey = setup.get('primaryKeyName');
  }

  syncNew(values) {
    const id = ulid();
    const newValues = values.set(this.idKey, id);

    this.values = this.values.set(id, newValues);

    return newValues;
  }

  syncExisting(values) {
    const id = values.get(this.idKey);

    assert.entryExists(this, id);

    if (values !== this.values.get(id)) {
      this.values = this.values.set(id, values);
    }

    return values;
  }

  sync(values) {
    return values.has(this.idKey) ? this.syncExisting(values) : this.syncNew(values);
  }

  unsync(values) {
    this.values = this.values.remove(values.get(this.idKey));
    return values.remove(this.idKey);
  }

}

module.exports = {
  Transaction,
};

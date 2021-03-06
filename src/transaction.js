const ulid = require('ulid');
const assert = require('assert');
const Immutable = require('immutable');


const ENTRY_DOES_NOT_EXIST = id => `
  Entry with id '${id}' does not exist.
`.trim();

const SYNC_NO_MAP = `
  Trying to sync values with invalid type.
`.trim();


class Transaction {

  constructor({ values, setup }) {
    this.values = values;
    this.keyName = setup.get('keyName');
  }

  syncNew(values) {
    const id = ulid();
    const newValues = values.set(this.keyName, id);

    assert.ok(newValues instanceof Immutable.Map, SYNC_NO_MAP);

    this.values = this.values.set(id, newValues);

    return newValues;
  }

  syncExisting(values) {
    const id = values.get(this.keyName);

    assert.ok(this.values.has(id), ENTRY_DOES_NOT_EXIST(id));
    assert.ok(values instanceof Immutable.Map, SYNC_NO_MAP);

    if (values !== this.values.get(id)) {
      this.values = this.values.set(id, values);
    }

    return values;
  }

  sync(values) {
    return values.has(this.keyName) ? this.syncExisting(values) : this.syncNew(values);
  }

  unsync(values) {
    this.values = this.values.remove(values.get(this.keyName));
    return values.remove(this.keyName);
  }

}

module.exports = {
  Transaction,
};

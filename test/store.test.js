const assert = require('assert');
const Dispersive = require('..');
const Store = require('../lib/store');

describe('Store', () => {

  it('create a new entry', () => {
    const store = new Store();

    store.create({id: 42});
    assert.equal(store.values[0].id, 42);
  });


  it('delete a given entry', () => {
    const store = new Store();
    const entry = {id: 42};

    store.create(entry);
    store.delete(entry);
    assert.equal(store.values.length, 0);
  });

})
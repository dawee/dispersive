const assert = require('assert');
const Dispersive = require('..');
const ObjectsManager = require('../lib/manager');

describe('Action', () => {

  it('create a new entry', () => {
    const manager = new ObjectsManager();

    manager.create({id: 42});
    assert.equal(manager.values[0].id, 42);
  });


  it('delete a given entry', () => {
    const manager = new ObjectsManager();
    const entry = {id: 42};

    manager.create(entry);
    manager.delete(entry);
    assert.equal(manager.values.length, 0);
  });

})
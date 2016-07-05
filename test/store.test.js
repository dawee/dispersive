const assert = require('assert');
const sinon = require('sinon');
const Dispersive = require('..');

describe('Store', () => {

  it('create a new entry', () => {
    const store = Dispersive.createStore();

    store.create({id: 42});
    assert.equal(store.values[0].id, 42);
  });


  it('delete a given entry', () => {
    const store = Dispersive.createStore();
    const entry = {id: 42};

    store.create(entry);
    store.delete(entry);
    assert.equal(store.values.length, 0);
  });

  it('should bind action', (done) => {
    const store = Dispersive.createStore();
    const action = Dispersive.createAction();

    store.bindAction(action, () => {
      done();
    });

    action();
  });

  it('should unbind all action', (done) => {
    const groupedStore = Dispersive.createStore();
    const store = Dispersive.createStore();
    const action = Dispersive.createAction();
    const grouped = Dispersive.createAction(() => Dispersive.createActionGroup().chain(action));
    const listener = sinon.spy();

    groupedStore.bindAction(grouped, () => {
      assert(!listener.called);
      done();
    });

    store.bindAction(action, listener);
    store.unbindAll();

    grouped();
  });

})
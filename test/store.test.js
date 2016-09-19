const assert = require('assert');
const sinon = require('sinon');
const Dispersive = require('..');

describe('Store', () => {

  it('create a new entry', () => {
    const Model = Dispersive.createStoreModel({id: null});

    Model.objects().create({id: 42});
    assert.equal(Model.objects().first().id, 42);
  });


  it('delete a given entry', () => {
    const Model = Dispersive.createStoreModel({id: null});
    const entry = Model.objects().create({id: 42});
    
    entry.delete();
    assert.equal(Model.objects().count(), 0);
  });

  it('should bind action', (done) => {
    const Model = Dispersive.createStoreModel({id: null});
    const action = Dispersive.createAction();

    Model.subscribe(action, () => done());
    action();
  });

  it('should unbind all action', (done) => {
    const groupedStore = Dispersive.createStoreModel();
    const Model = Dispersive.createStoreModel({id: null});
    const action = Dispersive.createAction();
    const grouped = Dispersive.createAction(() => Dispersive.createActionGroup().chain(action));
    const listener = sinon.spy();

    groupedStore.subscribe(grouped, () => {
      assert(!listener.called);
      done();
    });

    Model.subscribe(action, listener);
    Model.unsubscribeAll();

    grouped();
  });

})
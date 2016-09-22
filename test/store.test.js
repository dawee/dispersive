const assert = require('assert');
const sinon = require('sinon');
const Dispersive = require('..');

describe('Store', () => {

  it('create a new entry', () => {
    const Model = Dispersive.createStoreModel({id: null});

    Model.objects.create({id: 42});
    assert.equal(Model.objects.first().id, 42);
  });


  it('delete a given entry', () => {
    const Model = Dispersive.createStoreModel({id: null});
    const entry = Model.objects.create({id: 42});
    
    entry.delete();
    assert.equal(Model.objects.count(), 0);
  });

  describe('objects', () => {

    it('should trigger a new object', (done) => {
      const Model = Dispersive.createStoreModel();

      Model.objects.changed(() => done());
      Model.objects.create();
    });

    it('should not trigger a deleted object', (done) => {
      const Model = Dispersive.createStoreModel();
      const model = Model.objects.create();

      Model.objects.changed(() => done());
      model.delete();
    });

  })

})
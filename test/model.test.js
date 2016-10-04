const assert = require('assert');
const sinon = require('sinon');
const Dispersive = require('..');

describe('Model', () => {

  it('create a new entry', () => {
    const Model = class extends Dispersive.Model.use({foo: null}) {};

    Model.objects.create({foo: 42});
    assert.equal(Model.objects.first().foo, 42);
  });


  it('delete a given entry', () => {
    const Model = class extends Dispersive.Model.use({foo: null}) {};
    const model = Model.objects.create({foo: 42});
    
    model.delete();

    assert.equal(Model.objects.count(), 0);
  });

  describe('objects', () => {

    it('should trigger a new object', (done) => {
      const Model = Dispersive.Model.attach(class extends Dispersive.Model {});

      Model.objects.changed(() => done());
      Model.objects.create();
    });

    it('should not trigger a deleted object', (done) => {
      const Model = class extends Dispersive.Model {};
      Dispersive.Model.attach(Model);

      const model = Model.objects.create();

      Model.objects.changed(() => done());
      model.delete();
    });

    it('should create a SetIndex for each indexed field', () => {
      const schema = {
        age: {index: true},
        name: {index: false},
      };

      const Model = class extends Dispersive.Model {};

      Dispersive.Model.attach(Model, schema);

      assert('age' in Model.objects.index);
      assert.equal('name' in Model.objects.index, false);
    });

    it('should add values to SetIndex', () => {
      const schema = {
        age: {index: true},
        name: null,
      };

      const Model = class extends Dispersive.Model.use(schema) {};
      const model = Model.objects.create({age: 20, name: 'joe'});
      const values = Model.objects.index.id.get(model.id);

      assert.equal(Model.objects.index.age.refs[values.id], 20);
      assert(Model.objects.index.age.sets[20].has(values));
    });

    it('should remove values from SetIndex', () => {
      const schema = {
        age: {index: true},
        name: null,
      };

      const Model = class extends Dispersive.Model.use(schema) {};
      const model = Model.objects.create({age: 20, name: 'joe'});
      const values = Model.objects.index.id.get(model.id);

      model.delete();

      assert.equal(Object.keys(Model.objects.index.age.refs).length, 0);
      assert.equal(Model.objects.index.age.sets[20].has(values), false);
    });

    it('should remove all entries', () => {
      const schema = {
        age: {index: true},
        name: null,
      };

      const Model = class extends Dispersive.Model.use(schema) {};
      
      Model.objects.create({age: 20, name: 'joe'});
      Model.objects.create({age: 20, name: 'jack'});

      assert.equal(Model.objects.count(), 2);

      Model.objects.delete();

      assert.equal(Model.objects.count(), 0);
    });


  })

  describe('emitter', () => {

    it('should emit on all other models pointing on the same entry id', () => {
      const Model = class extends Dispersive.Model {};

      Dispersive.Model.attach(Model);

      const {id} = Model.objects.create();
      const listener = sinon.spy();

      const first = Model.objects.get({id});
      const second = Model.objects.get({id});

      first.changed(listener);
      second.save();

      assert(listener.called);
    });

  });


})
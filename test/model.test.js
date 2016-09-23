const assert = require('assert');
const sinon = require('sinon');
const Dispersive = require('..');

describe('Model', () => {

  it('create a new entry', () => {
    const Model = class extends Dispersive.Model({foo: null}) {};

    Model.objects.create({foo: 42});
    assert.equal(Model.objects.first().foo, 42);
  });


  it('delete a given entry', () => {
    const Model = class extends Dispersive.Model({foo: null}) {};
    const entry = Model.objects.create({foo: 42});
    
    entry.delete();
    assert.equal(Model.objects.count(), 0);
  });

  describe('objects', () => {

    it('should trigger a new object', (done) => {
      const Model = class extends Dispersive.Model() {};

      Model.objects.changed(() => done());
      Model.objects.create();
    });

    it('should not trigger a deleted object', (done) => {
      const Model = class extends Dispersive.Model() {};
      const model = Model.objects.create();

      Model.objects.changed(() => done());
      model.delete();
    });

    it('should create a SetIndex for each indexed field', () => {
      const schema = {
        age: {index: true},
        name: null,
      };

      const Model = class extends Dispersive.Model(schema) {};

      assert('age' in Model.objects.index);
      assert(! ('name' in Model.objects.index));
    });

    it('should add values to SetIndex', () => {
      const schema = {
        age: {index: true},
        name: null,
      };

      const Model = class extends Dispersive.Model(schema) {};
      const model = Model.objects.create({age: 20, name: 'joe'});
      const values = Model.objects.index.id[model.id];

      assert.equal(Model.objects.index.age.refs[values], 20);
      assert(Model.objects.index.age.sets[20].has(values));
    });

    it('should remove values from SetIndex', () => {
      const schema = {
        age: {index: true},
        name: null,
      };

      const Model = class extends Dispersive.Model(schema) {};
      const model = Model.objects.create({age: 20, name: 'joe'});
      const values = Model.objects.index.id[model.id];

      model.delete();

      assert.equal(Object.keys(Model.objects.index.age.refs).length, 0);
      assert.equal(Model.objects.index.age.sets[20].has(values), false);
    });

  })

})
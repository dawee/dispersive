const assert = require('assert');
const chai = require('chai');
const Dispersive = require('./dispersive');

describe('QuerySet', () => {

  describe('basis', () => {
    const schema = {
      name: null,
      age: null,
      job: null,
    };

    const Teammate = Dispersive.Model.use(schema);

    before((done) => {
      Teammate.objects.create({name: 'jane', age: 40, job: 'developer'});
      Teammate.objects.create({name: 'joe', age: 30, job: 'developer'});
      Teammate.objects.create({name: 'josh', age: 40, job: 'designer'});
      Teammate.objects.create({name: 'betty', age: 40, job: 'developer'});
      done();
    });

    it('should filter objects', () => {
      chai.assert.deepEqual([
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'josh', age: 40, job: 'designer'},
        {name: 'betty', age: 40, job: 'developer'},
      ], Teammate.objects.filter({age: 40}).values({exclude: ['id']}));
    });

    it('should exclude objects', () => {
      chai.assert.deepEqual([
        {name: 'joe', age: 30, job: 'developer'},
      ], Teammate.objects.exclude({age: 40}).values({exclude: ['id']}));
    });

    it('should get only first object', () => {
      chai.assert.deepEqual({name: 'jane', age: 40, job: 'developer'}, Teammate.objects.first().values({exclude: ['id']}));
    });

    it('should get an object when threre\'s only one', () => {
      chai.assert.deepEqual({name: 'joe', age: 30, job: 'developer'}, Teammate.objects.get({name: 'joe'}).values({exclude: ['id']}));
    });

    it('should throw DoesNotExist when no objects is found', () => {
      let err = null;

      try {
        Teammate.objects.get({age: 20});
      } catch (cathed) {
        err = cathed;
      }

      chai.assert.equal('DoesNotExist', err.name);
    });

    it('should throw MoreThanOneValue when more than one object is found', () => {
      let err = null;

      try {
        Teammate.objects.get({age: 40});
      } catch (cathed) {
        err = cathed;
      }

      chai.assert.equal('MoreThanOneValue', err.name);
    });

    it('should create a copy after a filter', () => {
      const filter40 = Teammate.objects.filter({age: 40});
      const filterDeveloper = filter40.filter({job: 'developer'});

      chai.assert.deepEqual([
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'josh', age: 40, job: 'designer'},
        {name: 'betty', age: 40, job: 'developer'},
      ], filter40.all().map(p => p.values({exclude: ['id']})));

      chai.assert.deepEqual([
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'betty', age: 40, job: 'developer'},
      ], filterDeveloper.all().map(p => p.values({exclude: ['id']})));
    });

    it('should create a copy after an exclude', () => {
      const exclude30 = Teammate.objects.exclude({age: 30});
      const excludeDesigner = exclude30.exclude({job: 'designer'});

      chai.assert.deepEqual([
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'josh', age: 40, job: 'designer'},
        {name: 'betty', age: 40, job: 'developer'},
      ], exclude30.all().map(p => p.values({exclude: ['id']})));

      chai.assert.deepEqual([
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'betty', age: 40, job: 'developer'},
      ], excludeDesigner.all().map(p => p.values({exclude: ['id']})));
    });

    it('should sort by name', () => {
      chai.assert.deepEqual([
        {name: 'betty', age: 40, job: 'developer'},
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'joe', age: 30, job: 'developer'},
        {name: 'josh', age: 40, job: 'designer'},
      ], Teammate.objects.orderBy('name').all().map(p => p.values({exclude: ['id']})));
    });

    it('should sort by age', () => {
      chai.assert.deepEqual([
        {name: 'joe', age: 30, job: 'developer'},
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'josh', age: 40, job: 'designer'},
        {name: 'betty', age: 40, job: 'developer'},
      ], Teammate.objects.orderBy('age').all().map(p => p.values({exclude: ['id']})));
    });

  })

  describe('perfs', () => {
    const schema = {
      age: {index: true},
    };

    class CountingObjectManager extends Dispersive.ObjectManager {

      _modelFromValues(values) {
        this.iterations++;
        return new this.ModelType(values);
      }

    }

    class Teammate extends Dispersive.Model.use(schema) {

      static get objects() {
        this._objects = !!this._objects ? this._objects : new CountingObjectManager(this);

        return this._objects;
      }

    }

    for (let i = 0; i < 100; ++i) {
      Teammate.objects.create({name: 'jack', age: 20});
    }

    Teammate.objects.create({name: 'joe', age: 40});

    it('should iterate only once through indexes', () => {
      Teammate.objects.iterations = 0;
      Teammate.objects.filter({age: 40}).all();

      assert.equal(Teammate.objects.iterations, 1);
    });
  })

})
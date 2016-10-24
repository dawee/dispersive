const {assert} = require('chai');
const sinon = require('sinon');
const Dispersive = require('./dispersive');

describe('QuerySet', () => {

  describe('basis', () => {
    const schema = {
      name: null,
      age: null,
      job: null,
    };

    const Teammate = class extends Dispersive.Model {};
    const store = new Dispersive.Store();

    store.register('teammates', {model: Teammate, schema});

    beforeEach(() => {
      Teammate.objects.delete();
      Teammate.objects.create({name: 'jane', age: 40, job: 'developer'});
      Teammate.objects.create({name: 'joe', age: 30, job: 'developer'});
      Teammate.objects.create({name: 'josh', age: 40, job: 'designer'});
      Teammate.objects.create({name: 'betty', age: 40, job: 'developer'});
    });

    it('should filter objects', () => {
      assert.deepEqual([
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'josh', age: 40, job: 'designer'},
        {name: 'betty', age: 40, job: 'developer'},
      ], Teammate.objects.filter({age: 40}).values({exclude: ['id']}));
    });

    it('should filter objects using predicate', () => {
      assert.deepEqual([
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'josh', age: 40, job: 'designer'},
        {name: 'betty', age: 40, job: 'developer'},
      ], Teammate.objects.filter(teammate => teammate.age === 40).values({exclude: ['id']}));
    });

    it('should exclude objects', () => {
      assert.deepEqual([
        {name: 'joe', age: 30, job: 'developer'},
      ], Teammate.objects.exclude({age: 40}).values({exclude: ['id']}));
    });

    it('should exclude objects using predicate', () => {
      assert.deepEqual([
        {name: 'joe', age: 30, job: 'developer'},
      ], Teammate.objects.exclude(teammate => teammate.age === 40).values({exclude: ['id']}));
    });

    it('should get only first object', () => {
      assert.deepEqual({name: 'jane', age: 40, job: 'developer'}, Teammate.objects.first().values({exclude: ['id']}));
    });

    it('should get only last object', () => {
      assert.deepEqual({name: 'betty', age: 40, job: 'developer'}, Teammate.objects.last().values({exclude: ['id']}));
    });

    it('should get an object when threre\'s only one', () => {
      assert.deepEqual({name: 'joe', age: 30, job: 'developer'}, Teammate.objects.get({name: 'joe'}).values({exclude: ['id']}));
    });

    it('should throw DoesNotExist when no objects is found', () => {
      let err = null;

      try {
        Teammate.objects.get({age: 20});
      } catch (cathed) {
        err = cathed;
      }

      assert.equal('DoesNotExist', err.name);
    });

    it('should throw MoreThanOneValue when more than one object is found', () => {
      let err = null;

      try {
        Teammate.objects.get({age: 40});
      } catch (cathed) {
        err = cathed;
      }

      assert.equal('MoreThanOneValue', err.name);
    });

    it('should create a copy after a filter', () => {
      const filter40 = Teammate.objects.filter({age: 40});
      const filterDeveloper = filter40.filter({job: 'developer'});

      assert.deepEqual([
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'josh', age: 40, job: 'designer'},
        {name: 'betty', age: 40, job: 'developer'},
      ], filter40.all().map(p => p.values({exclude: ['id']})));

      assert.deepEqual([
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'betty', age: 40, job: 'developer'},
      ], filterDeveloper.all().map(p => p.values({exclude: ['id']})));
    });

    it('should create a copy after an exclude', () => {
      const exclude30 = Teammate.objects.exclude({age: 30});
      const excludeDesigner = exclude30.exclude({job: 'designer'});

      assert.deepEqual([
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'josh', age: 40, job: 'designer'},
        {name: 'betty', age: 40, job: 'developer'},
      ], exclude30.all().map(p => p.values({exclude: ['id']})));

      assert.deepEqual([
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'betty', age: 40, job: 'developer'},
      ], excludeDesigner.all().map(p => p.values({exclude: ['id']})));
    });

    it('should sort by name', () => {
      assert.deepEqual([
        {name: 'betty', age: 40, job: 'developer'},
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'joe', age: 30, job: 'developer'},
        {name: 'josh', age: 40, job: 'designer'},
      ], Teammate.objects.orderBy('name').all().map(p => p.values({exclude: ['id']})));
    });

    it('should sort by age', () => {
      assert.deepEqual([
        {name: 'joe', age: 30, job: 'developer'},
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'josh', age: 40, job: 'designer'},
        {name: 'betty', age: 40, job: 'developer'},
      ], Teammate.objects.orderBy('age').all().map(p => p.values({exclude: ['id']})));
    });

    it('should sort by age using predicate', () => {
      const sorted = Teammate.objects
        .orderBy(teammate => teammate.name)
        .orderBy(teammate => -teammate.age);

      assert.deepEqual([
        {name: 'betty', age: 40, job: 'developer'},
        {name: 'jane', age: 40, job: 'developer'},
        {name: 'josh', age: 40, job: 'designer'},
        {name: 'joe', age: 30, job: 'developer'},
      ], sorted.all().map(p => p.values({exclude: ['id']})));
    });

  })

  describe('emitter', () => {
    const schema = {
      name: null,
      age: null,
      job: null,
    };

    const Teammate = class extends Dispersive.Model {};
    const store = new Dispersive.Store();

    store.register('teammates', {model: Teammate, schema});

    it('should listen only to valid created source', () => {
      const listener30 = sinon.spy()
      const listener30NoDev = sinon.spy()
      const listener40 = sinon.spy()
      const filter30 = Teammate.objects.filter({age: 30});
      const filter30NoDev = filter30.exclude({job: 'developer'});
      const filter40 = Teammate.objects.filter({age: 40});

      filter30.changed(listener30);
      filter30NoDev.changed(listener30NoDev);
      filter40.changed(listener40);

      Teammate.objects.create({age: 30, job: 'developer'});

      assert.equal(listener30.called, true);
      assert.equal(listener30NoDev.called, false);
      assert.equal(listener40.called, false);
    });

    it('should listen only to valid deleted source', () => {
      const listener30 = sinon.spy()
      const listener30NoDev = sinon.spy()
      const listener40 = sinon.spy()
      const filter30 = Teammate.objects.filter({age: 30});
      const filter30NoDev = filter30.exclude({job: 'developer'});
      const filter40 = Teammate.objects.filter({age: 40});

      const model = Teammate.objects.create({age: 30, job: 'developer'});

      filter30.changed(listener30);
      filter30NoDev.changed(listener30NoDev);
      filter40.changed(listener40);

      model.delete();

      assert.equal(listener30.called, true);
      assert.equal(listener30NoDev.called, false);
      assert.equal(listener40.called, false);
    });

    it('should listen only to valid created source, with event funnel', () => {
      const listener30 = sinon.spy()
      const listener30NoDev = sinon.spy()
      const listener40 = sinon.spy()
      const filter30 = Teammate.objects.filter({age: 30});
      const filter30NoDev = filter30.exclude({job: 'developer'});
      const filter40 = Teammate.objects.filter({age: 40});

      filter30.changed(listener30);
      filter30NoDev.changed(listener30NoDev);
      filter40.changed(listener40);

      Dispersive.usingEventFunnel(() => {
        Teammate.objects.create({age: 30, job: 'developer'});
      });

      assert.equal(listener30.called, true);
      assert.equal(listener30NoDev.called, false);
      assert.equal(listener40.called, false);
    });

    it('should listen only to valid deleted source, with event funnel', () => {
      const listener30 = sinon.spy()
      const listener30NoDev = sinon.spy()
      const listener40 = sinon.spy()
      const filter30 = Teammate.objects.filter({age: 30});
      const filter30NoDev = filter30.exclude({job: 'developer'});
      const filter40 = Teammate.objects.filter({age: 40});

      const model = Teammate.objects.create({age: 30, job: 'developer'});

      filter30.changed(listener30);
      filter30NoDev.changed(listener30NoDev);
      filter40.changed(listener40);

      Dispersive.usingEventFunnel(() => {
        model.delete();
      });

      assert.equal(listener30.called, true);
      assert.equal(listener30NoDev.called, false);
      assert.equal(listener40.called, false);
    });

    it('should trigger only once using event funnel', () => {
      const listener = sinon.spy();
      const listener30 = sinon.spy()
      const listener40 = sinon.spy();
      const listener50 = sinon.spy();

      Teammate.objects.changed(listener);
      Teammate.objects.filter({age: 30}).changed(listener30);
      Teammate.objects.filter({age: 40}).changed(listener40);
      Teammate.objects.filter({age: 50}).changed(listener50);

      Dispersive.usingEventFunnel(() => {
        Teammate.objects.create({age: 30});
        Teammate.objects.create({age: 30});
        Teammate.objects.create({age: 40});
        Teammate.objects.create({age: 40});
      });

      assert(listener30.calledOnce);
      assert(listener40.calledOnce);
      assert(!listener50.called);
      assert(listener.calledOnce);
    });

  });

  describe('perfs', () => {
    const schema = {
      age: new Dispersive.IndexedField(),
    };

    class CountingObjectManager extends Dispersive.ObjectManager {

      _modelFromValues(values) {
        const ModelType = this.model;

        this.iterations++;
        return new ModelType(values);
      }

    }

    const Teammate = class extends Dispersive.Model {};
    const store = new Dispersive.Store();


    store.register('teammates', {model: Teammate, manager: CountingObjectManager, schema});


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
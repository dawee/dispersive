const assert = require('assert');
const chai = require('chai');
const Dispersive = require('..');


describe('QuerySet', () => {

  const Store = Dispersive.createStore();

  before((done) => {
    Store.create({name: 'jane', age: 40, job: 'developer'});
    Store.create({name: 'joe', age: 30, job: 'developer'});
    Store.create({name: 'josh', age: 40, job: 'designer'});
    Store.create({name: 'betty', age: 40, job: 'developer'});
    done();
  });

  it('should filter objects', () => {
    chai.assert.deepEqual([
      {name: 'jane', age: 40, job: 'developer'},
      {name: 'josh', age: 40, job: 'designer'},
      {name: 'betty', age: 40, job: 'developer'},
    ], Store.filter({age: 40}).all());
  });

  it('should exclude objects', () => {
    chai.assert.deepEqual([
      {name: 'joe', age: 30, job: 'developer'},
    ], Store.exclude({age: 40}).all());
  });

  it('should get only first object', () => {
    chai.assert.deepEqual({name: 'jane', age: 40, job: 'developer'}, Store.first());
  });

  it('should get an object when threre\'s only one', () => {
    chai.assert.deepEqual({name: 'joe', age: 30, job: 'developer'}, Store.get({name: 'joe'}));
  });

  it('should throw DoesNotExist when no objects is found', () => {
    let err = null;

    try {
      Store.get({age: 20}) 
    } catch (cathed) {
      err = cathed;
    }

    chai.assert.equal('DoesNotExist', err.name);
  });

  it('should throw MoreThanOneValue when more than one object is found', () => {
    let err = null;

    try {
      Store.get({age: 40});
    } catch (cathed) {
      err = cathed;
    }

    chai.assert.equal('MoreThanOneValue', err.name);
  });

  it('should create a copy after a filter', () => {
    const filter40 = Store.filter({age: 40});
    const filterDeveloper = filter40.filter({job: 'developer'});

    chai.assert.deepEqual([
      {name: 'jane', age: 40, job: 'developer'},
      {name: 'josh', age: 40, job: 'designer'},
      {name: 'betty', age: 40, job: 'developer'},
    ], filter40.all());

    chai.assert.deepEqual([
      {name: 'jane', age: 40, job: 'developer'},
      {name: 'betty', age: 40, job: 'developer'},
    ], filterDeveloper.all());
  });

  it('should create a copy after an exclude', () => {
    const exclude30 = Store.exclude({age: 30});
    const excludeDesigner = exclude30.exclude({job: 'designer'});

    chai.assert.deepEqual([
      {name: 'jane', age: 40, job: 'developer'},
      {name: 'josh', age: 40, job: 'designer'},
      {name: 'betty', age: 40, job: 'developer'},
    ], exclude30.all());

    chai.assert.deepEqual([
      {name: 'jane', age: 40, job: 'developer'},
      {name: 'betty', age: 40, job: 'developer'},
    ], excludeDesigner.all());
  });

  it('should sort by name', () => {
    chai.assert.deepEqual([
      {name: 'betty', age: 40, job: 'developer'},
      {name: 'jane', age: 40, job: 'developer'},
      {name: 'joe', age: 30, job: 'developer'},
      {name: 'josh', age: 40, job: 'designer'},
    ], Store.orderBy('name').all());
  });

  it('should sort by age', () => {
    chai.assert.deepEqual([
      {name: 'joe', age: 30, job: 'developer'},
      {name: 'jane', age: 40, job: 'developer'},
      {name: 'josh', age: 40, job: 'designer'},
      {name: 'betty', age: 40, job: 'developer'},
    ], Store.orderBy('age').all());
  });

})
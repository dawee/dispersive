const {assert, expect} = require('chai');
const {spy} = require('sinon');
const {model, error} = require('..');


describe('manager', () => {

  it('should throw an error if trying to create without a transaction', () => {
    const objects = model.createModel().objects;

    expect(() => objects.create()).to.throw(error.TransactionDoesNotExist);
  });

  it('should throw an error if trying to create a transaction if one already exists', () => {
    const objects = model.createModel().objects;

    objects.createTransaction();

    expect(() => objects.createTransaction()).to.throw(error.TransactionAlreadyExists);
  });

  it('should not create an entry if transaction is aborted', () => {
    const {objects, emitter} = model.createModel();
    const render = spy();
    const subscription = emitter.changed(render);

    objects.createTransaction();
    objects.create({foo: 42});
    objects.abortTransaction();
    subscription.remove();

    assert(!render.called);
    expect(objects.length).to.equal(0);
  });

  it('should create an entry if transaction is commited', () => {
    const {objects, emitter} = model.createModel();
    const render = spy();
    const subscription = emitter.changed(render);

    objects.createTransaction();
    objects.create({foo: 42});
    objects.commitTransaction();
    subscription.remove();

    assert(render.called);
    expect(objects.length).to.equal(1);
  });

  it('should return a updatable entry', () => {
    const objects = model.createModel().objects;

    objects.createTransaction();
    const entry = objects.create({foo: 42});
    entry.values = entry.values.set('foo', 0);
    entry.save();
    objects.commitTransaction();

    expect(objects.values.first().get('foo')).to.equal(0);
  });

  it('should map entries', () => {
    const objects = model.createModel().objects;

    objects.createTransaction();
    objects.create({foo: 42});
    objects.commitTransaction();

    const foos = objects.map(entry => 42);

    expect(foos).to.deep.equal([42]);
  });

})

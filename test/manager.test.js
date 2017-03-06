const {assert, expect} = require('chai');
const {spy} = require('sinon');
const {model, field, error} = require('..');

const {withField} = field;

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

  it('should retreive first', () => {
    const objects = model.createModel([
      withField('text'),
    ]).objects;

    objects.createTransaction();
    objects.create({text: 'foo'});
    objects.create({text: 'bar'});
    objects.commitTransaction();

    expect(objects.first().text).to.equal('foo');
  });

  it('should retreive last', () => {
    const objects = model.createModel([
      withField('text'),
    ]).objects;

    objects.createTransaction();
    objects.create({text: 'foo'});
    objects.create({text: 'bar'});
    objects.commitTransaction();

    expect(objects.last().text).to.equal('bar');
  });

  it('should delete filtered entries', () => {
    const objects = model.createModel([
      withField('text'),
    ]).objects;

    objects.createTransaction();
    objects.create({text: 'foo'});
    objects.create({text: 'bar'});
    objects.create({text: 'foobar'});
    objects.filter(entry => entry.text.length <= 3).delete();
    objects.commitTransaction();


    expect(objects.length).to.equal(1);
    expect(objects.get().text).to.equal('foobar');
  });
})

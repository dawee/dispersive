const {assert, expect} = require('chai');
const {spy} = require('sinon');
const {createModel} = require('../src/model');
const {withField} = require('../src/field');
const error = require('../src/error');

describe('manager', () => {

  it('should throw an error if trying to create without a transaction', () => {
    const model = createModel();

    expect(() => model.objects.create()).to.throw(error.TransactionDoesNotExist);
  });

  it('should throw an error if trying to create a transaction if one already exists', () => {
    const model = createModel();

    model.objects.createTransaction();

    expect(() => model.objects.createTransaction()).to.throw(error.TransactionAlreadyExists);
  });

  it('should not create an entry if transaction is aborted', () => {
    const model = createModel();
    const render = spy();

    model.emitter.changed(render);
    model.objects.createTransaction();
    model.objects.create({foo: 42});
    model.objects.abortTransaction();

    assert(!render.called);
    expect(model.objects.length).to.equal(0);
  });

  it('should create an entry if transaction is commited', () => {
    const model = createModel();
    const render = spy();

    model.emitter.changed(render);
    model.objects.createTransaction();
    model.objects.create({foo: 42});
    model.objects.commitTransaction();

    assert(render.called);
    expect(model.objects.length).to.equal(1);
  });

  it('should return a updatable entry', () => {
    const model = createModel();

    model.objects.createTransaction();
    const entry = model.objects.create({foo: 42});
    entry.values = entry.values.set('foo', 0);
    entry.save();
    model.objects.commitTransaction();

    expect(model.objects.values.first().get('foo')).to.equal(0);
  });

  it('should map entries', () => {
    const model = createModel();

    model.objects.createTransaction();
    model.objects.create({foo: 42});
    model.objects.commitTransaction();

    const foos = model.objects.map(entry => 42);

    expect(foos).to.deep.equal([42]);
  });

  it('should retreive first', () => {
    const model = createModel([
      withField('text'),
    ]);

    model.objects.createTransaction();
    model.objects.create({text: 'foo'});
    model.objects.create({text: 'bar'});
    model.objects.commitTransaction();

    expect(model.objects.first().text).to.equal('foo');
  });

  it('should retreive last', () => {
    const model = createModel([
      withField('text'),
    ]);

    model.objects.createTransaction();
    model.objects.create({text: 'foo'});
    model.objects.create({text: 'bar'});
    model.objects.commitTransaction();

    expect(model.objects.last().text).to.equal('bar');
  });

  it('should export to JSON', () => {
    const model = createModel([
      withField('text'),
    ]);

    model.objects.createTransaction();
    model.objects.create({text: 'foo'});
    model.objects.create({text: 'bar'});
    model.objects.commitTransaction();

    expect(model.objects.toJSON()).to.deep.equal([{text: 'foo'}, {text: 'bar'}]);
  });

  it('should delete filtered entries', () => {
    const model = createModel([
      withField('text'),
    ]);

    model.objects.createTransaction();
    model.objects.create({text: 'foo'});
    model.objects.create({text: 'bar'});
    model.objects.create({text: 'foobar'});
    model.objects.filter(entry => entry.text.length <= 3).delete();
    model.objects.commitTransaction();


    expect(model.objects.length).to.equal(1);
    expect(model.objects.get().text).to.equal('foobar');
  });

  it('should update entries', () => {
    const model = createModel([
      withField('text'),
    ]);

    model.objects.createTransaction();
    model.objects.create({text: 'foo'});
    model.objects.create({text: 'bar'});
    model.objects.create({text: 'foobar'});
    model.objects.update({text: 'baz'});
    model.objects.commitTransaction();

    expect(model.objects.map(entry => entry.text)).to.deep.equal(['baz', 'baz', 'baz']);
  });

})

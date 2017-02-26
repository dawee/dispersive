const {expect, assert} = require('chai');
const {model, error} = require('..');


describe('model', () => {

  it('should create a default object manager', () => {
    const Foo = model.createModel();

    Foo.objects.createTransaction();
    Foo.objects.create();
    Foo.objects.commitTransaction();

    expect(Foo.objects.length).to.equal(1);
  });

  it('should create a default emitter', () => {
    const Foo = model.createModel();

    expect(Foo.emitter.subscriptions.count()).to.equal(0);
  });

})

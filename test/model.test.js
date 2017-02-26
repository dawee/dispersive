const {expect, assert} = require('chai');
const {model, field, error} = require('..');


describe('model', () => {

  it('should init field value', () => {
    const Foo = model.createModel(
      field.withField('bar', {initial: 42})
    );

    Foo.objects.createTransaction();
    Foo.objects.create();
    Foo.objects.commitTransaction();

    expect(Foo.objects.first().bar).to.equal(42);
  });

})

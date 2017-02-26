const {expect, assert} = require('chai');
const {model, field, error} = require('..');


describe('model', () => {

  it('should init field value', () => {
    const Foo = model.createModel(
      field.withField('bar', {initial: 42})
    );

    Foo.objects.createTransaction();
    const entry = Foo.objects.create();
    Foo.objects.commitTransaction();

    expect(entry.bar).to.equal(42);
  });

})

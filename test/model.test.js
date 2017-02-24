const {expect} = require('chai');
const {model, error} = require('..');


describe('model', () => {

  it('should should be usable a simple composer', () => {
    const createFakeObjects = model => model.set('objects', {foo: 42});
    const Fake = model.createModel(createFakeObjects);

    expect(Fake.objects.foo).to.equal(42);
  });

})

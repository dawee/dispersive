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

  it('should be injectable', () => {
    const Foo = model.createModel();

    const injector = model.createInjector(
      EntryConstructor => class extends EntryConstructor {
        get bar() {
          return 42;
        }
      }
    );

    Foo.inject(injector);

    Foo.objects.createTransaction();
    Foo.objects.create();
    Foo.objects.commitTransaction();

    expect(Foo.objects.first().bar).to.equal(42);
  });

})

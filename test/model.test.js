const {expect, assert} = require('chai');
const {model, field, error} = require('..');


const withEntryBar = () => model.createEntryMixin(
  Base => class extends Base {
    get bar() {
      return 42;
    }
  }
);

const withObjectsBar = () => model.createObjectManagerMixin(
  Base => class extends Base {
    get bar() {
      return 42;
    }
  }
);

const withMix = () => model.mixModelComposers([withEntryBar(), withObjectsBar()]);


describe('model', () => {

  it('should init field value', () => {
    const Foo = model.createModel([
      field.withField('bar', {initial: 42}),
    ]);

    Foo.objects.createTransaction();
    Foo.objects.create();
    Foo.objects.commitTransaction();

    expect(Foo.objects.first().bar).to.equal(42);
  });

  it('should inject objects mixins', () => {
    const Foo = model.createModel();

    Foo.inject(withEntryBar());

    Foo.objects.createTransaction();
    Foo.objects.create();
    Foo.objects.commitTransaction();

    expect(Foo.objects.first().bar).to.equal(42);
  });

  it('should use manager mixins', () => {
    const Foo = model.createModel([
      withObjectsBar(),
    ]);

    expect(Foo.objects.bar).to.equal(42);
  });

  it('should inject manager mixins', () => {
    const Foo = model.createModel();

    Foo.inject(withObjectsBar());

    expect(Foo.objects.bar).to.equal(42);
  });

  it('should mix composers', () => {
    const Foo = model.createModel([withMix()]);

    expect(Foo.objects.bar).to.equal(42);
  });
})

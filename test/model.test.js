const {expect, assert} = require('chai');
const {createModel, createAction} = require('../src');
const {withOne, withMany} = require('../src/relation');
const {createEntryMixin, createObjectManagerMixin, mix} = require('../src/model');
const {withField} = require('../src/field');
const error = require('../src/error');


const withEntryBar = () => createEntryMixin(
  ({Base}) => class extends Base {
    get bar() {
      return 42;
    }
  }
);

const withObjectsBar = () => createObjectManagerMixin(
  ({Base}) => class extends Base {
    get bar() {
      return 42;
    }
  }
);

const withMix = () => mix([withEntryBar(), withObjectsBar()]);


describe('model', () => {

  it('should init field value', () => {
    const Foo = createModel([
      withField('bar', {initial: 42}),
    ]);

    Foo.objects.createTransaction();
    Foo.objects.create();
    Foo.objects.commitTransaction();

    expect(Foo.objects.first().bar).to.equal(42);
  });

  it('should inject objects mixins', () => {
    const Foo = createModel();

    Foo.inject(withEntryBar());

    Foo.objects.createTransaction();
    Foo.objects.create();
    Foo.objects.commitTransaction();

    expect(Foo.objects.first().bar).to.equal(42);
  });

  it('should use manager mixins', () => {
    const Foo = createModel([
      withObjectsBar(),
    ]);

    expect(Foo.objects.bar).to.equal(42);
  });

  it('should inject manager mixins', () => {
    const Foo = createModel();

    Foo.inject(withObjectsBar());

    expect(Foo.objects.bar).to.equal(42);
  });

  it('should mix composers', () => {
    const Foo = createModel([withMix()]);

    expect(Foo.objects.bar).to.equal(42);
  });

})

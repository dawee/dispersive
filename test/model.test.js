const {expect, assert} = require('chai');
const {createModel, createAction} = require('../src');
const {withOne, withMany} = require('../src/relation');
const {createEntryMixin, createObjectManagerMixin, mix} = require('../src/model');
const {withField} = require('../src/field');
const {runAsAction} = require('../src/action');


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

    Foo.createTransaction();
    Foo.objects.create();
    Foo.commitTransaction();

    expect(Foo.objects.first().bar).to.equal(42);
  });

  it('should inject objects mixins', () => {
    const Foo = createModel();

    Foo.inject(withEntryBar());

    Foo.createTransaction();
    Foo.objects.create();
    Foo.commitTransaction();

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

  it('should test if values are equal', async () => {
    const Foo = createModel([
      withField('bar'),
    ]);

    const fooV1 = await createAction(() => Foo.objects.create({bar: 0}), [Foo])();
    const fooV2 = await createAction(() => Foo.objects.get().update({bar: 42}), [Foo])();

    expect(fooV1.equals(fooV2)).to.equal(false);
    expect(fooV2.equals(Foo.objects.get())).to.equal(true);
  });

  it('should expose fields as iterable', async () => {
    const Book = createModel([
      withField('title'),
    ]);

    const book = runAsAction(() => Book.objects.create({ title: 'Peter Pan' }), [Book]);

    expect(Object.keys(book)).to.contain('title');
    expect(Object.keys(book)).to.contain('key');
  });

})

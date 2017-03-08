const {expect, assert} = require('chai');
const {model, field, relation, error} = require('..');

const {withField} = field;
const {withMany} = relation;
const {createModel} = model;

const withEntryBar = () => model.createEntryMixin(
  ({Base}) => class extends Base {
    get bar() {
      return 42;
    }
  }
);

const withObjectsBar = () => model.createQuerySetMixin(
  ({Base}) => class extends Base {
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

  it('should connect a many relation', () => {
    const Book = createModel([
      withField('title'),
    ]);

    const Author = createModel([
      withField('name'),
      withMany('books', {model: Book, relatedName: 'author'}),
    ]);

    Author.objects.createTransaction();
    Book.objects.createTransaction();

    const diana = Author.objects.create({name: 'Diana Wynne Jones'});
    const book = Book.objects.create({
      author: diana,
      title: 'Howl\'s Moving Castle',
    });

    Book.objects.commitTransaction();
    Author.objects.commitTransaction();

    expect(diana.books.first().title).to.equal('Howl\'s Moving Castle');
  });
})

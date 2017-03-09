
const {expect, assert} = require('chai');
const {model, field, relation, action, error} = require('../src/index');

const {withField} = field;
const {withMany} = relation;
const {createModel} = model;
const {createAction} = action;


describe('relation', () => {

  it('should connect a one-to-many relation (related model declaration + field.add)', async () => {
    const Book = createModel([
      withField('title'),
    ]);

    const Author = createModel([
      withField('name'),
      withMany('books', Book),
    ]);

    const diana = await createAction(() => {
      const author = Author.objects.create({name: 'Diana Wynne Jones'});
      const howlsMovingCastle = Book.objects.create({title: 'Howl\'s Moving Castle'});

      author.books.add(howlsMovingCastle);

      return author;
    }, [Author, Book])();

    expect(diana.books.first().title).to.equal('Howl\'s Moving Castle');
  });


  it('should connect a one-to-many relation (relation declaration + related setter)', async () => {
    const Book = createModel([
      withField('title'),
    ]);

    const Author = createModel([
      withField('name'),
      withMany('books', {model: Book, relatedName: 'author'}),
    ]);

    const diana = await createAction(() => {
      const author = Author.objects.create({name: 'Diana Wynne Jones'});

      Book.objects.create({author, title: 'Howl\'s Moving Castle'});

      return author;
    }, [Author, Book])();

    expect(diana.books.first().title).to.equal('Howl\'s Moving Castle');
  });

})

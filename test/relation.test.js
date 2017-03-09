
const {expect, assert} = require('chai');
const {model, field, relation, error} = require('..');

const {withField} = field;
const {withMany} = relation;
const {createModel} = model;



describe('relation', () => {

  it('should connect a one-to-many relation (relation declaration + related setter)', () => {
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

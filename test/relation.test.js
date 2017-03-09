
const {expect, assert} = require('chai');
const {model, field, relation, action, error} = require('../src/index');

const {withField} = field;
const {withOne, withMany} = relation;
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

  it('should remove a one-to-many relation', async () => {
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
      author.books.remove(howlsMovingCastle);

      return author;
    }, [Author, Book])();

    expect(diana.books.count()).to.equal(0);
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

      const howlsMovingCastle = Book.objects.create({author, title: 'Howl\'s Moving Castle'});

      return author;
    }, [Author, Book])();

    expect(diana.books.first().title).to.equal('Howl\'s Moving Castle');
  });

  it('should connect a many-to-many relation (adding from root model)', async () => {
    const Book = createModel([
      withField('title'),
    ]);

    const Library = createModel([
      withField('name'),
      withMany('books', {model: Book, relatedName: 'libraries', hasMany: true}),
    ]);

    const [harryPotter, neverendingStory] = await createAction(() => {
      const harryPotter = Book.objects.create({title: 'Harry Potter'});
      const neverendingStory = Book.objects.create({title: 'Neverending Story'});
      const hogwarts = Library.objects.create({name: 'Hogwarts Library'});
      const libraryPlanet = Library.objects.create({name: 'The Library Planet (DW)'});

      libraryPlanet.books.add(harryPotter);
      libraryPlanet.books.add(neverendingStory);
      hogwarts.books.add(neverendingStory);

      return [harryPotter, neverendingStory];
    }, [Book, Library])();

    expect(harryPotter.libraries.count()).to.equal(1);
    expect(neverendingStory.libraries.count()).to.equal(2);
  });

  it('should connect a many-to-many relation (adding from related model)', async () => {
    const Book = createModel([
      withField('title'),
    ]);

    const Library = createModel([
      withField('name'),
      withMany('books', {model: Book, relatedName: 'libraries', hasMany: true}),
    ]);

    const [harryPotter, neverendingStory] = await createAction(() => {
      const harryPotter = Book.objects.create({title: 'Harry Potter'});
      const neverendingStory = Book.objects.create({title: 'Neverending Story'});
      const hogwarts = Library.objects.create({name: 'Hogwarts Library'});
      const libraryPlanet = Library.objects.create({name: 'The Library Planet (DW)'});

      harryPotter.libraries.add(libraryPlanet)
      neverendingStory.libraries.add(libraryPlanet);
      neverendingStory.libraries.add(hogwarts);

      return [harryPotter, neverendingStory];
    }, [Book, Library])();

    expect(harryPotter.libraries.count()).to.equal(1);
    expect(neverendingStory.libraries.count()).to.equal(2);
  });

  it('should connect a one-to-one relation', async () => {
    const Book = createModel([
      withField('title'),
    ]);

    const Movie = createModel([
      withField('title'),
      withOne('book', {model: Book, relatedName: 'movie'}),
    ]);

    const [peterPan, hook] = await createAction(() => {
      const peterPan = Book.objects.create({title: 'Peter Pan'});
      const hook = Movie.objects.create({title: 'Hook', book: peterPan});

      return [peterPan, hook];
    }, [Book, Movie])();

    expect(peterPan.movie.title).to.equal('Hook');
    expect(hook.book.title).to.equal('Peter Pan');
  });

});

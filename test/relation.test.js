
const {expect, assert} = require('chai');

const {createModel, createAction} = require('../src');
const {withOne, withMany} = require('../src/relation');
const {withField} = require('../src/field');
const error = require('../src/error');
const {runAsAction} = require('../src/action');


describe('relation', () => {

  it('should connect a one-to-many relation (related model declaration + field.add)', () => {
    const Book = createModel([
      withField('title'),
    ]);

    const Author = createModel([
      withField('name'),
      withMany('books', Book),
    ]);

    const diana = createAction(() => {
      const author = Author.objects.create({name: 'Diana Wynne Jones'});
      const howlsMovingCastle = Book.objects.create({title: 'Howl\'s Moving Castle'});

      author.books.add(howlsMovingCastle);

      return author;
    }, [Author, Book])();

    expect(diana.books.first().title).to.equal('Howl\'s Moving Castle');
  });

  it('should remove a one-to-many relation', () => {
    const Book = createModel([
      withField('title'),
    ]);

    const Author = createModel([
      withField('name'),
      withMany('books', Book),
    ]);

    const [diana, howlsMovingCastle]  = createAction(() => {
      const author = Author.objects.create({name: 'Diana Wynne Jones'});
      const book = Book.objects.create({title: 'Howl\'s Moving Castle'});

      author.books.add(book);

      return [author, book];
    }, [Author, Book])();

    createAction(() => diana.books.remove(howlsMovingCastle), [Author, Book])();

    expect(diana.books.count()).to.equal(0);
  });

  it('should connect a one-to-many relation (relation declaration + related setter)', () => {
    const Book = createModel([
      withField('title'),
    ]);

    const Author = createModel([
      withField('name'),
      withMany('books', {model: Book, relatedName: 'author'}),
    ]);

    const diana = createAction(() => {
      const author = Author.objects.create({name: 'Diana Wynne Jones'});

      const howlsMovingCastle = Book.objects.create({author, title: 'Howl\'s Moving Castle'});

      return author;
    }, [Author, Book])();

    expect(diana.books.first().title).to.equal('Howl\'s Moving Castle');
  });

  it('should connect a many-to-many relation (adding from root model)', () => {
    const Book = createModel([
      withField('title'),
    ]);

    const Library = createModel([
      withField('name'),
      withMany('books', {model: Book, relatedName: 'libraries', hasMany: true}),
    ]);

    const [harryPotter, neverendingStory] = createAction(() => {
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

  it('should connect a many-to-many relation (adding from related model)', () => {
    const Book = createModel([
      withField('title'),
    ]);

    const Library = createModel([
      withField('name'),
      withMany('books', {model: Book, relatedName: 'libraries', hasMany: true}),
    ]);

    const [harryPotter, neverendingStory] = createAction(() => {
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

  it('should connect a one-to-one relation', () => {
    const Book = createModel([
      withField('title'),
    ]);

    const Movie = createModel([
      withField('title'),
      withOne('book', {model: Book, relatedName: 'movie'}),
    ]);

    const [peterPan, hook] = createAction(() => {
      const peterPan = Book.objects.create({title: 'Peter Pan'});
      const hook = Movie.objects.create({title: 'Hook', book: peterPan});

      return [peterPan, hook];
    }, [Book, Movie])();

    expect(peterPan.movie.title).to.equal('Hook');
    expect(hook.book.title).to.equal('Peter Pan');
  });

  it('should update a one-to-many relation using setter', () => {
    const Reader = createModel([
      withField('name'),
    ]);

    const Book = createModel([
      withField('title'),
      withOne('owner', {model: Reader, relatedName: 'books', hasMany: true}),
    ]);

    runAsAction(() => {
      Reader.objects.create({name: 'John'});
      Book.objects.create({ title: 'Peter Pan', owner: Reader.objects.create({name: 'Bob'}) });
    }, [Book, Reader]);

    expect(Book.objects.get().owner.name).to.equal('Bob');
    expect(Reader.objects.get({name: 'Bob'}).books.length).to.equal(1);
    expect(Reader.objects.get({name: 'John'}).books.length).to.equal(0);

    runAsAction(
      () => Book.objects.get().update({ owner: Reader.objects.get({name: 'John'}) }),
      [Book, Reader]
    );

    expect(Book.objects.get().owner.name).to.equal('John');
    expect(Reader.objects.get({name: 'Bob'}).books.length).to.equal(0);
    expect(Reader.objects.get({name: 'John'}).books.length).to.equal(1);
  });

  it('should update a one-to-many relation using add()/remove()', () => {
    const Reader = createModel([
      withField('name'),
    ]);

    const Book = createModel([
      withField('title'),
      withOne('owner', {model: Reader, relatedName: 'books', hasMany: true}),
    ]);

    runAsAction(() => {
      Reader.objects.create({name: 'John'});
      Reader.objects.create({name: 'Bob'}).books.add(
        Book.objects.create({ title: 'Peter Pan'})
      );
    }, [Book, Reader]);

    expect(Book.objects.get().owner.name).to.equal('Bob');
    expect(Reader.objects.get({name: 'Bob'}).books.length).to.equal(1);
    expect(Reader.objects.get({name: 'John'}).books.length).to.equal(0);

    runAsAction(() => {
      const peterPan = Book.objects.get();

      Reader.objects.get({name: 'Bob'}).books.remove(peterPan);
      Reader.objects.get({name: 'John'}).books.add(peterPan);
    }, [Book, Reader]);

    expect(Book.objects.get().owner.name).to.equal('John');
    expect(Reader.objects.get({name: 'Bob'}).books.length).to.equal(0);
    expect(Reader.objects.get({name: 'John'}).books.length).to.equal(1);
  });

  it('should update a one-to-one relation from source', () => {
    const Reader = createModel([
      withField('name'),
    ]);

    const Book = createModel([
      withField('title'),
      withOne('owner', {model: Reader, relatedName: 'currentBook'}),
    ]);

    runAsAction(() => {
      Reader.objects.create({name: 'John'});
      Book.objects.create({ title: 'Peter Pan', owner: Reader.objects.create({name: 'Bob'}) });
    }, [Book, Reader]);

    expect(Book.objects.get().owner.name).to.equal('Bob');
    expect(Reader.objects.get({name: 'Bob'}).currentBook).to.not.equal(null);
    expect(Reader.objects.get({name: 'John'}).currentBook).to.equal(null);

    runAsAction(() => {
      Book.objects.get().update({ owner: Reader.objects.get({name: 'John'}) });
    }, [Book, Reader]);

    expect(Book.objects.get().owner.name).to.equal('John');
    expect(Reader.objects.get({name: 'Bob'}).currentBook).to.equal(null);
    expect(Reader.objects.get({name: 'John'}).currentBook).to.not.equal(null);
  });

  it('should update a one-to-one relation from destination', () => {
    const Reader = createModel([
      withField('name'),
    ]);

    const Book = createModel([
      withField('title'),
      withOne('owner', {model: Reader, relatedName: 'currentBook'}),
    ]);

    runAsAction(() => {
      Reader.objects.create({name: 'John'});
      Reader.objects.create({
        name: 'Bob',
        currentBook: Book.objects.create({ title: 'Peter Pan' })
      });
    }, [Book, Reader]);

    expect(Book.objects.get().owner.name).to.equal('Bob');
    expect(Reader.objects.get({name: 'Bob'}).currentBook).to.not.equal(null);
    expect(Reader.objects.get({name: 'John'}).currentBook).to.equal(null);

    runAsAction(() => {
      Reader.objects.get({name: 'John'}).update({ currentBook: Book.objects.get() });
    }, [Book, Reader]);

    expect(Book.objects.get().owner.name).to.equal('John');
    expect(Reader.objects.get({name: 'Bob'}).currentBook).to.equal(null);
    expect(Reader.objects.get({name: 'John'}).currentBook).to.not.equal(null);
  });

  it('should remove connection if setting to null (from src)', () => {
    const Reader = createModel([
      withField('name'),
    ]);

    const Book = createModel([
      withField('title'),
      withOne('owner', {model: Reader, relatedName: 'currentBook'}),
    ]);

    runAsAction(() => Book.objects.create({
      name: 'John',
      owner: Reader.objects.create({ name: 'John' }),
    }), [Book, Reader]);

    expect(Reader.objects.get({name: 'John'}).currentBook).to.not.equal(null);

    runAsAction(() => Book.objects.get().update({ owner: null }), [Book, Reader]);

    expect(Reader.objects.get({name: 'John'}).currentBook).to.equal(null);
  });

  it('should remove connection if setting to null (from dest)', () => {
    const Reader = createModel([
      withField('name'),
    ]);

    const Book = createModel([
      withField('title'),
      withOne('owner', {model: Reader, relatedName: 'currentBook'}),
    ]);

    runAsAction(() => Reader.objects.create({
      name: 'John',
      currentBook: Book.objects.create({ title: 'Peter Pan' })
    }), [Book, Reader]);

    expect(Reader.objects.get({name: 'John'}).currentBook).to.not.equal(null);

    runAsAction(() => Reader.objects.get({ name: 'John'}).update({ currentBook: null }), [Book, Reader]);

    expect(Reader.objects.get({name: 'John'}).currentBook).to.equal(null);
  });
});

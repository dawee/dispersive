const {assert, expect} = require('chai');
const {spy} = require('sinon');
const {createModel, createAction} = require('../src');
const {withOne, withMany} = require('../src/relation');
const {withField} = require('../src/field');
const {createChangesFunnelEmitter} = require('../src/emitter');
const error = require('../src/error');



describe('action', () => {

  it('should always be asynchronous', async () => {
    const greet = createAction(name => `Hello ${name}`);
    const res = await greet('Paul');

    expect(res).to.equal('Hello Paul');
  });

  it('should wait for async handler', async () => {
    const asyncAdd = async (a, b) => a + b;
    const add = createAction(async (a, b) => await asyncAdd(a, b));
    const res = await add(20, 22);

    expect(res).to.equal(42);
  });

  it('should commit change to models', async () => {
    const Book = createModel();
    const createBook = createAction(() => Book.objects.create(), [Book]);

    await createBook();

    expect(Book.objects.length).to.equal(1);
  });

  it('should update a given entry', async () => {
    const Book = createModel([
      withField('title'),
    ]);

    const emptyBook = await createAction(() => Book.objects.create(), [Book])();
    const peterPan = await createAction(({key}) => {
      const book = Book.objects.get(key);

      return book.update({title: 'Peter Pan'})
    }, [Book])(emptyBook);

    expect(Book.objects.get().title).to.equal('Peter Pan');
  });

  it('should emit events before resolving the promise', async () => {
    const Book = createModel();
    const renderer = spy();
    const createBook = createAction(() => Book.objects.create(), [Book]);

    const subscription = Book.emitter.changed(() => renderer(Book.objects.length));

    await createBook();

    subscription.remove();

    assert(renderer.called);
    assert(renderer.calledWith(1));
  });


  it('should trig a funnel just once', async () => {
    const Book = createModel([
      withField('title'),
    ]);
    const Author = createModel([
      withField('name'),
      withMany('books', Book),
    ]);

    const store = [Book, Author];
    const render = spy();

    createChangesFunnelEmitter({sources: store}).changed(() => (
      render(Book.objects.length, Author.objects.length)
    ));

    await createAction(() => {
      const jmBarrie = Author.objects.getOrCreate({name: 'J.M. Barrie'});
      const peterPan = Book.objects.create({author: jmBarrie, title: 'Peter Pan'});
    }, store)();

    assert(render.calledOnce);
    assert(render.calledWith(1, 1));
  })

})


const {expect, assert} = require('chai');
const {model, field, relation, action, error} = require('../src/index');

const {withField} = field;
const {withOne, withMany} = relation;
const {createModel} = model;
const {createAction} = action;


describe('queryset with queries', () => {

  it('should filter using object', async () => {
    const Book = createModel([
      withField('title'),
    ]);

    const peterPan = await createAction(() => Book.objects.create({title: 'Peter Pan'}), [Book])();

    expect(Book.objects.filter({title: 'Peter Pan'}).get().pk).to.equal(peterPan.pk);
  });

  it('should filter using predicate', async () => {
    const Book = createModel([
      withField('title'),
    ]);

    const peterPan = await createAction(() => Book.objects.create({title: 'Peter Pan'}), [Book])();

    expect(Book.objects.filter(entry => entry.title === 'Peter Pan').get().pk).to.equal(peterPan.pk);
  });

  it('should exclude using object', async () => {
    const Book = createModel([
      withField('title'),
    ]);

    const peterPan = await createAction(() => {
      Book.objects.create({title: 'A Series Of Unfortunate Events'});

      return Book.objects.create({title: 'Peter Pan'});
    }, [Book])();

    expect(Book.objects.exclude({title: 'A Series Of Unfortunate Events'}).get().pk).to.equal(peterPan.pk);
  });

  it('should exclude using object', async () => {
    const Book = createModel([
      withField('title'),
    ]);

    const peterPan = await createAction(() => {
      Book.objects.create({title: 'A Series Of Unfortunate Events'});

      return Book.objects.create({title: 'Peter Pan'});
    }, [Book])();

    expect(Book.objects.exclude(entry => entry.title !== 'A Series Of Unfortunate Events').get().pk).to.equal(peterPan.pk);
  });
});

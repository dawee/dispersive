
const {expect, assert} = require('chai');
const {createModel, createAction} = require('../src');
const {withOne, withMany} = require('../src/relation');
const {withField} = require('../src/field');


describe('queryset with queries', () => {

  it('should return all objects', async () => {
    const Book = createModel([
      withField('title'),
    ]);

    const peterPan = await createAction(() => Book.objects.create({title: 'Peter Pan'}), [Book])();

    expect(Book.objects.all().map(book => book.title)).to.deep.equal(['Peter Pan']);
  });

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

  it('should sort using comparator', async () => {
    const Buddy = createModel([
      withField('name'),
      withField('age'),
    ]);

    await createAction(() => {
      Buddy.objects.create({name: 'betty', age: 30});
      Buddy.objects.create({name: 'jack', age: 50});
      Buddy.objects.create({name: 'john', age: 20});
    }, [Buddy])();

    expect(Buddy.objects.sort((bud1, bud2) => bud1.age - bud2.age).map(bud => bud.name))
      .to.deep.equal(['john', 'betty', 'jack']);
  });

  it('should reverse sort', async () => {
    const Buddy = createModel([
      withField('name'),
      withField('age'),
    ]);

    await createAction(() => {
      Buddy.objects.create({name: 'betty', age: 30});
      Buddy.objects.create({name: 'jack', age: 50});
      Buddy.objects.create({name: 'john', age: 20});
    }, [Buddy])();

    expect(Buddy.objects.sort((bud1, bud2) => bud1.age - bud2.age).reverse().map(bud => bud.name))
      .to.deep.equal(['jack', 'betty', 'john']);
  });

  it('should order using field name', async () => {
    const Buddy = createModel([
      withField('name'),
      withField('age'),
    ]);

    await createAction(() => {
      Buddy.objects.create({name: 'betty', age: 30});
      Buddy.objects.create({name: 'jack', age: 50});
      Buddy.objects.create({name: 'john', age: 20});
    }, [Buddy])();

    expect(Buddy.objects.orderBy('name').map(bud => bud.name))
      .to.deep.equal(['betty', 'jack', 'john']);

    expect(Buddy.objects.orderBy('-name').map(bud => bud.name))
      .to.deep.equal(['john', 'jack', 'betty']);

    expect(Buddy.objects.orderBy('age').map(bud => bud.name))
      .to.deep.equal(['john', 'betty', 'jack']);

    expect(Buddy.objects.orderBy('-age').map(bud => bud.name))
      .to.deep.equal(['jack', 'betty', 'john']);
  });

});

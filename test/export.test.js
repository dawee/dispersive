
const {expect, assert} = require('chai');
const {model, field, relation, action, error} = require('../src/index');

const {withField} = field;
const {withOne, withMany} = relation;
const {createModel} = model;
const {createAction} = action;


describe('queryset with exporters', () => {

  it('should map entries', async () => {
    const titles = [
      'Peter Pan',
      'Neverending Story',
    ]

    const Book = createModel([
      withField('title'),
    ]);

    await createAction(() => titles.forEach(title => Book.objects.create({title})), [Book])();

    expect(Book.objects.map(entry => entry.title)).to.deep.equal(titles);
  });

});


const {expect, assert} = require('chai');
const {model, field, relation, action, error} = require('../src/index');

const {withField} = field;
const {withOne, withMany} = relation;
const {createModel} = model;
const {createAction} = action;


describe('queryset with exporters', () => {

  it('should [map] entries', async () => {
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

  it('should return if [every] expression are corrects', async () => {
    const Cat = createModel([
      withField('color'),
      withField('hasMustache', {initial: true}),
    ]);

    await createAction(
      colors => colors.map(color => Cat.objects.create({color}))
    , [Cat])(['black', 'white']);

    expect(Cat.objects.every({color: 'black'})).to.equal(false);
    expect(Cat.objects.every(cat => cat.color === 'black')).to.equal(false);
    expect(Cat.objects.every({hasMustache: true})).to.equal(true);
    expect(Cat.objects.every(cat => cat.hasMustache)).to.equal(true);
  });
});

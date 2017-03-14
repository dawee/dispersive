
const {expect, assert} = require('chai');
const {createModel, createAction} = require('../src');
const {withOne, withMany} = require('../src/relation');
const {withField} = require('../src/field');
const error = require('../src/error');


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

  it('should return if [any/some] expression are corrects', async () => {
    const Cat = createModel([
      withField('color'),
      withField('hasMustache', {initial: true}),
    ]);

    await createAction(
      colors => colors.map(color => Cat.objects.create({color}))
    , [Cat])(['black', 'white']);

    [Cat.objects.any, Cat.objects.some]
      .map(some => some.bind(Cat.objects))
      .forEach(some => {
        expect(some({color: 'black'})).to.equal(true);
        expect(some(cat => cat.color === 'black')).to.equal(true);
        expect(some({hasMustache: false})).to.equal(false);
        expect(some(cat => !cat.hasMustache)).to.equal(false);
      });
  });
});

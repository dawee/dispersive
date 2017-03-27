const {assert, expect} = require('chai');
const { createModel, createAction } = require('../src');
const { withOne, withMany } = require('../src/relation');
const { withField } = require('../src/field');
const { runAsAction } = require('../src/action');
const Immutable = require('immutable');

const computeTime = (task) => {
  const start = Date.now();

  task();
  return Date.now() - start;
};

const ACCEPTANCE = 5;

describe('perfs', () => {

  it(`should fit [build time] acceptance (< ${5}x pure immutable time)`, () => {
    const range = [...Array(1000).keys()];

    const Slot = createModel([
      withField('num'),
      withField('active'),
    ]);

    const Pokedex = createModel([
      withMany('slots', Slot),
    ]);

    const pureDuration = computeTime(() => {
      const pokedex = Immutable.Map();

      pokedex.set('slots', Immutable.OrderedMap(range.map(num => [num, Immutable.Map({num})])));
    });

    const dispersiveDuration = computeTime(createAction(() => {
      const pokedex = Pokedex.objects.create();

      range.forEach(num => pokedex.slots.add(Slot.objects.create({num})));
    }, [Slot, Pokedex]));

    expect(dispersiveDuration).to.be.below(pureDuration * ACCEPTANCE);

  });

})

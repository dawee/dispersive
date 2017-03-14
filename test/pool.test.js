const {assert, expect} = require('chai');
const {spy} = require('sinon');
const error = require('../src/error');
const {createActionPool} = require('../src/pool');
const {packAction} = require('../src/action');


const createDeferedAction = (handler) => {
  return packAction(() => new Promise(
    resolve => process.nextTick(() => {
      handler();
      resolve();
    })
  ))
};

describe('pool', () => {

  it('should call action', async () => {
    const addPool = createActionPool();
    const packedAdd = packAction(((a, b) => a + b), [20, 22]);

    const res = await addPool.delegate(packedAdd);

    expect(res).to.equal(42);
  });

  it('should chain actions', async () => {
    const chainPool = createActionPool();
    const firstSpy = spy();
    const secondSpy = spy();

    const firstAction = createDeferedAction(firstSpy);
    const secondAction = createDeferedAction(secondSpy);

    chainPool.delegate(firstAction);

    assert(!firstSpy.called);

    await chainPool.delegate(secondAction);

    assert(firstSpy.called);
    assert(secondSpy.called);
  });

})

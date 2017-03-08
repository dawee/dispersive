const ulid = require('ulid');
const {ActionPool} = require('./pool');

const pools = {};

class LockedPool extends ActionPool {

  constructor() {
    super();
    this.id = ulid();
    this.locks = {};
  }

  incrementLock(source) {
    if (!(source.id in this.locks)) this.locks[source.id] = 0;

    this.locks[source.id] += 1;
  }

  decrementLock(source) {
    if (!(source.id in this.locks)) return;

    this.locks[source.id] -= 1;

    if (this.locks[source.id] === 0) {
      delete this.locks[source.id];
    }
  }

  locked(source) {
    return source.id in this.locks;
  }

  hasAnyLock() {
    return Object.keys(this.locks) > 0;
  }

  lock(sources = []) {
    sources.forEach(source => this.incrementLock(source));
  }

  unlock(sources = []) {
    sources.forEach(source => this.decrementLock(source));
  }

}

const createPool = () => {
  const pool = new LockedPool();

  pools[pool.id] = pool;
  return pool;
};

const findPool = (sources) => {
  const foundId = Object.keys(pools).find(poolId => (
    sources.some(source => pools[poolId].locked(source))
  ));

  return foundId ? pools[foundId] : null;
};

const getOrCreatePool = sources => findPool(sources) || createPool();

const cleanPool = (pool) => {
  if (!pool.hasAnyLock()) delete pools[pool.id];
};

const dispatch = async (action, sources) => {
  const pool = getOrCreatePool(sources);

  pool.lock(sources);
  const res = await pool.delegate(action);
  pool.unlock(sources);

  cleanPool(pool);

  return res;
};

module.exports = {
  dispatch,
};

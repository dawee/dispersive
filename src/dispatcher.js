const ulid = require('ulid');
const {ActionPool} = require('./pool');

const pools = {};

class LockedPool extends ActionPool {

  constructor() {
    super();
    this.id = ulid();
    this.locks = {};
  }

  incrementLock(model) {
    if (!(model.id in this.locks)) this.locks[model.id] = 0;

    this.locks[model.id] += 1;
  }

  decrementLock(model) {
    if (!(model.id in this.locks)) return;

    this.locks[model.id] -= 1;

    if (this.locks[model.id] === 0) {
      delete this.locks[model.id];
    }
  }

  locked(model) {
    return model.id in this.locks;
  }

  hasAnyLock() {
    return Object.keys(this.locks) > 0;
  }

  lock(models = []) {
    models.forEach(model => this.incrementLock(model));
  }

  unlock(models = []) {
    models.forEach(model => this.decrementLock(model));
  }

}

const createPool = () => {
  const pool = new LockedPool();

  pools[pool.id] = pool;
  return pool;
};

const findPool = models => (
  Object.keys(pools).find(poolId => (
    models.some(model => pools[poolId].locked(model))
  ))
);

const getOrCreatePool = models => findPool(models) || createPool();

const cleanPool = (pool) => {
  if (!pool.hasAnyLock()) delete pools[pool.id];
};

const dispatch = async (action, models) => {
  const pool = getOrCreatePool(models);

  pool.lock(models);
  const res = await pool.delegate(action);
  pool.unlock(models);

  cleanPool(pool);

  return res;
};

module.exports = {
  dispatch,
};

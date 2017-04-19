const { createChangesFunnelEmitter } = require('./emitter');

const createTransactions = models => models.map(model => model.createTransaction());
const commitTransactions = models => models.map(model => model.commitTransaction());
const abortTransactions = models => models.map(model => model.abortTransaction());
const emitChanges = models => createChangesFunnelEmitter({ models }).emitChange();
const normalized = value => (Array.isArray(value) && value) || [value];

const createNormalizedAction = (handler, models) => (
  (...args) => {
    let res = null;
    let catchedError = null;

    createTransactions(models);

    try {
      res = handler(...args);
      commitTransactions(models);
    } catch (error) {
      catchedError = error;
      abortTransactions(models);
      throw error;
    }

    if (!catchedError) {
      emitChanges(models);
    }

    return res;
  }
);

const createAction = (handler, models) => createNormalizedAction(handler, normalized(models));
const runAsAction = (handler, models) => createAction(handler, models)();

module.exports = {
  createAction,
  runAsAction,
};

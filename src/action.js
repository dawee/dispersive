const {createChangesFunnelEmitter} = require('./emitter');

const createTransactions = models => models.map(model => model.createTransaction());
const commitTransactions = models => models.map(model => model.commitTransaction());
const abortTransactions = models => models.map(model => model.abortTransaction());
const emitChanges = models => createChangesFunnelEmitter({models}).emitChange();

const createAction = (handler, models = []) => (
  (...args) => {
    let res = null;

    createTransactions(models);

    try {
      res = handler(...args);
      commitTransactions(models);
      emitChanges(models);
    } catch (error) {
      abortTransactions(models);
      throw error;
    }

    return res;
  }
);


module.exports = {
  createAction,
};

const {dispatch} = require('./dispatcher');

const readHandlerResult = async res => res;

const callHandler = async (handler, args) => readHandlerResult(handler(...args));

const createTransactions = models => models.map(model => model.objects.createTransaction());
const commitTransactions = models => models.map(model => model.objects.commitTransaction());

const callHandlerAndCommit = async (handler, models, args) => {
  const res = await callHandler(handler, args);

  commitTransactions(models);
  return res;
};

const packAction = (handler, args = [], models = []) => (
  async () => {
    createTransactions(models);
    return callHandlerAndCommit(handler, models, args);
  }
);

const createAction = (handler, models = []) => (
  async (...args) => {
    const action = packAction(handler, args, models);
    return dispatch(action, models);
  }
);


module.exports = {
  readHandlerResult,
  callHandler,
  createTransactions,
  commitTransactions,
  callHandlerAndCommit,
  createAction,
  packAction,
};

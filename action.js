const readHandlerResult = async res => res;

const callHandler = async (handler, args) => readHandlerResult(handler(...args));

const createTransactions = models => models.map(model => model.objects.createTransaction());
const commitTransactions = models => models.map(model => model.objects.commitTransaction());

const callHandlerAndCommit = (handler, models, args) => {
  const res = callHandler(handler, args);

  commitTransactions(models);
  return res;
};

const packAction = (handler, models, args) => (
  async () => {
    createTransactions(models);
    return callHandlerAndCommit(handler, models, args);
  }
);

const createAction = (handler, models = []) => (
  async (...args) => packAction(handler, models, args)()
);


module.exports = {
  readHandlerResult,
  callHandler,
  createTransactions,
  commitTransactions,
  callHandlerAndCommit,
  createAction,
};
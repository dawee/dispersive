const {dispatch} = require('./dispatcher');
const {createChangesFunnelEmitter} = require('./emitter');

const readHandlerResult = async res => res;

const callHandler = async (handler, args) => readHandlerResult(handler(...args));

const createTransactions = sources => sources.map(source => source.createTransaction());
const commitTransactions = sources => sources.map(source => source.commitTransaction());
const emitChanges = sources => createChangesFunnelEmitter({sources}).emitChange();

const callHandlerAndCommit = async (handler, sources, args) => {
  const res = await callHandler(handler, args);

  commitTransactions(sources);
  emitChanges(sources);

  return res;
};

const packAction = (handler, args = [], sources = []) => (
  async () => {
    createTransactions(sources);
    return callHandlerAndCommit(handler, sources, args);
  }
);

const createAction = (handler, sources = []) => (
  async (...args) => {
    const action = packAction(handler, args, sources);
    return dispatch(action, sources);
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

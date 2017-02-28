const error = require('./error');

const hasTransaction = (manager) => {
  if (manager.transaction) return;

  throw new error.TransactionDoesNotExist({
    message: 'A transaction is needed to perform this action.',
  });
};

const hasNoTransaction = (manager) => {
  if (!manager.transaction) return;

  throw new error.TransactionAlreadyExists({
    message: 'You need to abort or commit the existing one before creating another',
  });
};

const entryExists = (transaction, id) => {
  if (transaction.values.has(id)) return;

  throw new error.LostId({
    message: 'Id lost. Impossible to sync the entry.',
  });
};

const composersAreArray = (composers) => {
  if (Array.isArray(composers)) return;

  throw new error.ComposersShouldBeArray(composers);
};

module.exports = {
  hasTransaction,
  hasNoTransaction,
  entryExists,
  composersAreArray,
};

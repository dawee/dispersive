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


module.exports = {
  hasTransaction,
  hasNoTransaction,
};

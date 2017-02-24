function TransactionDoesNotExist(message) {
  Object.assign({name: 'TransactionDoesNotExist', message});
}

function TransactionAlreadyExists(message) {
  Object.assign({name: 'TransactionAlreadyExists', message});
}

module.exports = {
  TransactionDoesNotExist,
  TransactionAlreadyExists,
};

function TransactionDoesNotExist({message}) {
  Object.assign({name: 'TransactionDoesNotExist', message});
}

function TransactionAlreadyExists({message}) {
  Object.assign({name: 'TransactionAlreadyExists', message});
}

function LostId({message}) {
  Object.assign({name: 'LostId', message});
}

module.exports = {
  TransactionDoesNotExist,
  TransactionAlreadyExists,
  LostId,
};

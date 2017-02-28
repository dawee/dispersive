function TransactionDoesNotExist({message}) {
  Object.assign({name: 'TransactionDoesNotExist', message});
}

function TransactionAlreadyExists({message}) {
  Object.assign({name: 'TransactionAlreadyExists', message});
}

function LostId({message}) {
  Object.assign({name: 'LostId', message});
}

function ComposersShouldBeArray(composers) {
  Object.assign({
    name: 'ComposersShouldBeArray',
    message: `Models should be created with an array of composers. Received ${composers} instead.`,
  });
}

module.exports = {
  TransactionDoesNotExist,
  TransactionAlreadyExists,
  LostId,
  ComposersShouldBeArray,
};

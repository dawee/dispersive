class Transaction {

  constructor({list}) {
    this.list = list;
  }

  sync(entry) {
    this.list = this.list.push(entry.values);
  }

}

const createTransaction = ({list}) => new Transaction({list});

module.exports = {
  Transaction,
  createTransaction,
};

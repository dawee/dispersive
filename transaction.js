class Transaction {

  constructor({list}) {
    this.list = list;
  }

  create(values = {}) {
    this.list = this.list.push(values);
  }

}

const createTransaction = ({list}) => new Transaction({list});

module.exports = {
  Transaction,
  createTransaction,
};

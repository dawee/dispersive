const {expect} = require('chai');
const {manager, model, error} = require('..');


describe('manager', () => {

  it('should throw an error if trying to create without a transaction', () => {
    const objects = manager.createObjects({model: model.createModel()});

    expect(() => objects.create()).to.throw(error.TransactionDoesNotExist);
  });

  it('should throw an error if trying to create a transaction if one already exists', () => {
    const objects = manager.createObjects({model: model.createModel()});

    objects.createTransaction();

    expect(() => objects.createTransaction()).to.throw(error.TransactionAlreadyExists);
  });

  it('should not create an entry if transaction is aborted', () => {
    const objects = manager.createObjects({model: model.createModel()});

    objects.createTransaction();
    objects.create({foo: 42});
    objects.abortTransaction();

    expect(objects.length).to.equal(0);
  });

  it('should create an entry if transaction is commited', () => {
    const objects = manager.createObjects({model: model.createModel()});

    objects.createTransaction();
    objects.create({foo: 42});
    objects.commitTransaction();

    expect(objects.length).to.equal(1);
  });

})

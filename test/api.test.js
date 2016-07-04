const chai = require('chai');
const sinon = require('sinon');
const Dispersive = require('..');


describe('README example', () => {

  it('should fit current API', () => {
    const myComponent = {
      setState: sinon.spy()
    };

    const addContactToNotebook = Dispersive.createAction(
      (name, age, phone) => ({name, age, phone})
    );

    const ContactStore = Dispersive.createStore();

    ContactStore.bindAction(addContactToNotebook, (contact) => {
      ContactStore.create(contact);
      ContactStore.trigger('change');
    });

    ContactStore.get30s = () => ContactStore.filter({age: 30}).all();


    ContactStore.on('change', () => myComponent.setState(ContactStore.get30s()));

    addContactToNotebook('joe', 30, '0786898754');
    
    chai.assert.equal(myComponent.setState.called, true);
    chai.assert.deepEqual(myComponent.setState.getCall(0).args[0], [
      {
        "age": 30,
        "name": "joe",
        "phone": "0786898754",
      }
    ]);
  });

});
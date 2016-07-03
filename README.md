![Dispersive](https://raw.githubusercontent.com/dawee/dispersive-logo/master/dispersive-white-bg.png)


Dispersive is a data flow controller for ES6 applications based on [Flux](https://github.com/facebook/flux) architecture.


## Install

```sh
npm install dispersive
```

## Create an Action

```js
const addContactToNotebook = Dispersive.createAction((name, age, phone) => {
  const id = hat(); // Creating id using substack's hat lib 

  return {
    name: name,
    age: age,
    phone: phone,
    active: true,
  };
});
```

## Create a Store

```js
const ContactStore = Dispersive.createStore();

ContactStore.dispatcher.bindAction(addContactToNotebook, (contact) => {
  ContactStore.objects.create(contact);
  ContactStore.emitter.trigger('change');
});

ContactStore.getAllActive = () => {
  return ContactStore.objects.filter({active: true}).all();
};
```

## Component example (with React)

```js
class Notebook extends React.Component {
  
  constructor() {
    super();


    this.state = {contacts: ContactStore.getAllActive()};
    ContactStore.emitter.on('change', this.onContactsChange);
  }

  onContactChange() {
    this.setState('change', {contacts: ContactStore.getAllActive()});
  }

  addContact() {
    addContactToNotebook(
      this.refs.name.value,
      this.refs.age.value,
      this.refs.phone.value
    );
  }

  render() {
    const contacts = this.state.contacts.map(
      (contact) => <Contact contactId={contact.id} />
    );

    return (
      <div className="contacts-list">
        contacts
      </div>
      <div className="contact-creation">
        <input type="text" ref="name" />
        <input type="text" ref="age" />
        <input type="text" ref="phone" />
        <button onClick={this.addContact}>Add contact</button>
      </div>
    );
  }

}
```

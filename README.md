![Dispersive](https://raw.githubusercontent.com/dawee/dispersive-logo/master/dispersive-white-bg.png)


Dispersive is a data flow controller for ES6 applications based on [Flux](https://github.com/facebook/flux) architecture.


## Install

```sh
npm install dispersive
```

## Create an Action

```js
const addContactToNotebook = Dispersive.createAction(
  (name, age, phone) => ({name, age, phone})
);
```

## Create a Store

```js
const ContactStore = Dispersive.createStore();

ContactStore.bindAction(addContactToNotebook, (contact) => {
  ContactStore.create(contact);
  ContactStore.trigger('change');
});

ContactStore.get30s = () => ContactStore.filter({age: 30}).all();
```

## Trigger Action

```js
addContactToNotebook('joe', 30, '0786898754');
```

## Listen to store

```js
ContactStore.on('change', () => myComponent.setState(ContactStore.get30s()));
```

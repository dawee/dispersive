# Actions

Actions are the entry point of the [flow](https://facebook.github.io/flux/img/flux-simple-f8-diagram-1300w.png). Yet, they are not exactly like flux actions as they can be **asynchronous** and **chained**. A component (or a view if you're not using a React-like renderer) should be the only element capable of calling an action. Most of the time a component call an action when a user-interface event was received.


## Create an action

To create a simple action you need to call **createAction** with an *action handler*.

The action handler is the function that will execute the action and return its result :

```js
const addTodo = Dispersive.createAction(text => ({text}));
```

This previous example send an event with the object **{text: '...'}** every time **addTodo('...')** is called.


## Subscribe to an action

An action is meant to be subscribed to. Only stores should be able to subscribe to an action. Most of the time, you will subscribe to an action to create/delete store entries.

```js
function createTodoFromText(data) {
  // Here we use data.text to create a new Todo entry
}

function createNotificationFromText(data) {
  // Here we use data.text to create a new Notification entry
}


addTodo.subscribe(data => createTodoFromText(data));
addTodo.subscribe(data => createNotificationFromText(data));
```

## Asynchronous action

You can execute an asynchronous action by returning a Promise instead of an object. In this case, every subscriptions will be called when the Promise *resolve* function is called.

```js
const fetchAllTodos = createAction(_ => new Promise(
  (resolve) => request.get('http://www.example/api/todo').then(resolve)
));
```

## Catch asynchronous errors

When a Promise *reject* is called, you can subscribe to the action error. This is done by subscribing to the **error subaction**.

```js
const fetchAllTodos = createAction(_ => new Promise(
  (resolve) => request.get('http://www.example/api/todo')
    .then(resolve)
    .catch(reject)
));

function createErrorMessage(error) {
  // Here we create a new ErrorMessage entry from the error object
}

fetchAllTodos.error.subscribe(error => createErrorMessage(error));
```

## Chain actions

Any action can be used as a promise. Sometimes you'll need that the complete flow of an action is finished to call another one. This is done by creating an action group.

```js
const addTodo = Dispersive.createAction(text => ({text}));
const notifyTodo = Dispersive.createAction(text => ({text}));

const createAndNotifyTodo = createAction(
  text => addTodo(text).then(_ => notifyTodo(text))
);
```

Then, you can listen to the action group *createAndNotifyTodo* or one of the actions called in series (*addTodo* and *notifyTodo*).

# Actions

Actions are the entry point of the flow. They are not though like flux actions as they can be **asynchronous** and **chained**. A component (or a view if you're not using a React-like renderer) should be the only element capable of calling an action. Most of the time a component call an action when a user-interface event was received.


## Import

To create actions, you can require only **createAction** as it's the only API you'll need.

```js
import {createAction} from 'dispersive';
```


## Create an action

To create a simple action you need to call **createAction** with an *action handler*.

The action handler is the function that will execute the action and return its result :

```js
const addTodo = createAction(text => ({text}));
```

This previous example send an event with the object **{text: '...'}** every time **addTodo('...')** is called.


## Subscribe an action

TODO.
#Getting started

Here's a simple Todo example with React.

## Import

```js
import Dispersive from 'dispersive';
import React from 'react';
```

## Actions

```js
const createTodo = Dispersive.createAction(text => {text});
const checkTodo = Dispersive.createAction(todoId => {todoId});
```

## Store

```js
const store = new Dispersive.Store();
store.register('todos', {schema: {text: '', checked: false}});

createTodo.subscribe({text} => store.todos.create({text}));
checkTodo.subscribe({todoId} => store.todos.get({id: todoId}).update({checked: true});
```

## TodoLine Component

```js
const props = {
  todoId: React.PropTypes.string.isRequired,
};

const state = {
  todo: new Dispersive.UniqueStateField(props => store.todos.filter({id: todoId})),
};

class TodoLine extends Dispersive.mixin(React.Component, {props, state}) {

  render() {
    return (
      <li className={this.state.todo.checked ? 'checked' : ''}>
      {this.state.todo.text}
      </li>
      {this.state.todo.checked ? null : (
        <button onClick={this.onCheck}>Check</button>
      )}
    );
  }

}
```

## TodoList Component

```js
const events = ['onCreateTodo'];

const state = {
  todos: new Dispersive.ListStateField(store.todos),
};

class TodoList extends Dispersive.mixin(React.Component, {events, state}) {

render() {
    return (
      <ul>
        {this.state.todos.map(todo => <TodoLine todoId={todo.id}>)}
      </ul>
      <input type="text" ref="text" onKeyPress={this.onCreateTodo} />
    );
  }

}
```

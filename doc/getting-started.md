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
const schema = {text: '', checked: false};
const Todo = Dispersive.Model.use(schema);

createTodo.subscribe({text} => Todo.objects.create({text}));
checkTodo.subscribe({todoId} => {
  const todo = Todo.objects.get({id: todoId});
  todo.checked = true;
  todo.save();
});
```

## TodoLine Component

```js
class TodoLine extends React.Component {
  
  constructor(props) {
    super(props);
    this.todo.changed(_ => this.updateState());
    this.onCheck = (_ => checkTodo(this.props.todoId));
    this.state = this.getState();
  }

  get todo() {
    return Todo.objects.get({id: this.props.todoId});
  }

  updateState() {
    this.setState(this.getState());
  }

  getState() {
    return {todo: this.todo.values()};
  }

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
class TodoList extends React.Component {
  
  constructor(props) {
    super(props);
    Todo.objects.changed(_ => this.updateState());
    this.onCreateTodo = this.onCreateTodo.bind(this);
    this.state = this.getState();
  }

  onCreateTodo(e) {
    if (e.key === 'Enter') createTodo(this.refs.text.value);
  }

  updateState() {
    this.setState(this.getState());
  }

  getState() {
    return {todos: Todo.objects.values()};
  }

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

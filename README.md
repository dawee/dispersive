![Dispersive](https://raw.githubusercontent.com/dawee/dispersive-logo/master/dispersive-white-bg.png)

[![Build Status](https://travis-ci.org/dawee/dispersive.svg?branch=master)](https://travis-ci.org/dawee/dispersive)

[Django](https://www.djangoproject.com/) ORM-ish for the browser


Table of Contents
=================

      * [Install](#install)
      * [Getting started](#getting-started)
      * [The set of objects](#the-set-of-objects)
      * [Objects manipulation (or the basis of querysets)](#objects-manipulation-or-the-basis-of-querysets)
      * [Create and delete objects (talks to the manager)](#create-and-delete-objects-talks-to-the-manager)


## Install

Dispersive is hosted on [NPM](https://www.npmjs.com/package/dispersive)
It's meant to be used with **es6** and built in an app using [webpack](https://webpack.js.org/) or [browserify](http://browserify.org/)

```sh
npm install dispersive
```

## Getting started

Dispersive is now installed. You can now open a node terminal and try this :

```js
>>> const {Store} = require('dispersive')
>>> const todos = Store.createObjects({schema: {text: '', checked: false}})
>>> const checkedTodos = todos.filter({checked: true})
>>> todos.create({text: 'wash dishes'})
>>> const countTodos = () => console.log(`there are now ${todos.count()} todos`);
>>> const countChecked = () => console.log(`there are now ${checkedTodos.count()} checked todos`);
>>> countTodos()
there are now 1 todos
>>> countChecked()
there are now 0 checked todos
>>> todos.changed(countTodos)
>>> checkedTodos.changed(countChecked)
>>> todos.create({text: 'eat a banana'})
there are now 2 todos
>>> todos.first().update({checked: true})
there are now 1 checked todos
```


## The set of objects

Like an SQL table, a _set of objects_ store entries.
With dispersive, there are 3 different type of actors to manipulate a set of objects: the **schema**, the **model** and the **manager**.

* The **schema** is a simple json object with a list of fields. It describes to dispersive which values should be synchronised.
* The **model** can manipulate one entry. It's created from the data itself and the **manager**.
* The **manager** manipulates the set of objects. In fact the set of objects is an instance of the manager itself.

Only the schema is required to create a set of objects.
So, in order to create a set of objects for a TodoList, you should write :

```js
import {Store} from 'dispersive';

const schema = {
  text: '',
  checked: false,
};

const todos = Store.createObjects({schema});
```

## Objects manipulation (or the basis of querysets)

Dispersive in mainly inspired by [Django ORM](https://docs.djangoproject.com/en/1.10/topics/db/) since the first prototype, dispersive began to diverge from its father's specification. However, Django developers will recognize this API.

A QuerySet is not the data itself. It's a way to store an accessor of the data. Confused ? OK, I bet an example would be better.

We'll say you have a javascript array you want to filter. The good way to do it is **Array.prototype.filter** :

```js
const validEntries = myArray.filter(entry => entry.isValid());
```

In this case, _validEntries_ contains the data itself. A queryset of this example would be (in pure js) :

```js
const makeValidEntries = array => array.filter(entry => entry.isValid());
const validEntries = makeValidEntries(myArray);
```

Here you got the same result. But you saved a generator for filtered data. If your array changes you can call this function any time, it will filter the new data like in the first example. This function is (kind of) a queryset.

With dispersive, you will accomplish this kind of tasks with the functions **filter** and **entries**.
To continue with the TodoList example, let say you want to append all **unchecked** todos on screen.

It will look like that :

```js
const uncheckedTodos = todos.filter({checked: false});
const ul = document.getElementById('todo-list');

function updateTodoList() {
  // Remove all children (very bad DOM practice but it makes the example very simple)
  ul.childNodes(child => ul.removeChild(child));

  for (const todo of uncheckedTodos.entries()) {
    const li = document.createElement('li');

    li.appendChild(document.createTextNode(todo.text));
    ul.appendChild(li);
  }
}
```

**filter** prepare a QuerySet that can be used to actually filter the data. So, every time _updateTodoList()_ is called, it will show the new uncheked todos elements on screen.

**entries** is a generator. It **yields** to you the filtered elements.


## Create and delete objects (talks to the manager)

As we said in the first paragraph, the set of objects is created by the manager. We said that, in order to create a set of objects, we do not need to create a manager (we didn't use one in our TodoList example).

In fact, dispersive creates a default one. **todos** was an instance of this default manager.

So, what's a manager ? The manager is the first accessor to your objects. It's a QuerySet itself, so it can filter data. But it can create and delete entries.

```js
todos.create({text: 'eat a banana'}); // create one entry
todos.create([{text: 'eat a banana'}, {text: 'wash dishes'}]); // create multiple entries
```

In the next example we will delete entries :

```js
todos.delete();
```

That's ok if we want to flush every objects in the set. But, if we want to delete specifics entries, we'll want to create a sub queryset :

```js
const checkedTodos = todos.filter({checked: true});

checkedTodos.delete(); // delete all checked todos.
```


![Dispersive](https://raw.githubusercontent.com/dawee/dispersive-logo/master/dispersive-white-bg.png)

[![Build Status](https://travis-ci.org/dawee/dispersive.svg?branch=master)](https://travis-ci.org/dawee/dispersive)

 Data flow controller inspired by [Django](https://www.djangoproject.com/) ORM-ish for the browser


## Install

Dispersive is hosted on [NPM](https://www.npmjs.com/package/dispersive)
It's meant to be used with **es6** and built in an app using [webpack](https://webpack.js.org/) or [browserify](http://browserify.org/)

```sh
npm install dispersive
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


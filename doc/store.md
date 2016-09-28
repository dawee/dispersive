# Store


The store manager save transitory data. A store entry is meant to be shown by components (or views). **The store is not a cache system**. If a data cache is needed it should be managed during the execution of an (action Promise)[actions.md#asynchronous-action].


## Model


The store is a stack of differents model classes.

```js
class Todo extends Dispersive.Model {
  ...
}
```

At this point, **Todo** has an *ObjectManager* but no schema.
So, **Todo** is able to store entries with *id* but no specific data.
We need to add a *schema*.

## Schema

A schema describes the values to store for each model with their default values.

You can define it this way :

```js
class Todo extends Dispersive.Model {
  static createSchema() {
    return super.createSchema({
        text: '',
        checked: false,
    });
  }
}
```

Or with the helper mix-in **Model.use(schema)** :

```js
const schema = {
  text: '',
  checked: false,
};

class Todo extends Dispersive.Model.use(schema) {
  ...
}
```

At this point. **Todo** is ready to save data (*text* and *checked* values) in the *ObjectManager*.

## ObjectManager

The ObjectManager stores and retrieve values defined by the *Schema*.
All the creations and the queries are inspired by the [Django managers](https://docs.djangoproject.com/en/1.10/topics/db/managers/).

### Create a new entry

```js
Todo.objects.create({text: 'wash dishes'});
```

is equivalent to :

```js
const todo = new Todo();

todo.text = 'wash dishes';
todo.save();
```

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

### Model.schema

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
  tag: null,
};

class Todo extends Dispersive.Model.use(schema) {
  ...
}
```

At this point. **Todo** is ready to save data in the *ObjectManager*.

### Model.constructor(data)

When a model instance is created, you can pass the first values to the constructor.

```js
const todo = new Todo({text: 'wash dishes'});

console.log(todo.text); // 'wash dishes'
console.log(todo.checked); // false
```

### model.save({emitChange: true})

A model is an interface to manipulate the values defined in the schema. To sync current model values with the store, you should save it.

```js
todo.checked = true;
todo.save();
```

At this point, if a component is listening to this entry changes, it will be notified.

If you don't want to trigger an event, you should pass *emitChange: false*

```js
todo.save({emitChange: false});
```

### model.id

Every saved model instance has an generated unique id. **You must never not change its value**. Unique ids are generated with [substack's hat](https://github.com/substack/node-hat) library.

```js
todo.save();
console.log(todo.id); // 'c65ba62db9f82a26e8a4aa2249970df9'
```

### model.emitChange()

*emitChange* is equivalent to **model.emit('change')**

### model.changed(listener)

*changed* is equivalent to **model.on('change', listener)**

### model.emit(name, data) / model.on(name, listener)

Every models instances are event emitters. Their parent class is [Facebook EventEmitter](https://github.com/facebook/emitter). **Only components/views should listen to model events.**

```js
model.on('hello', data => console.log(data.foo)); // 'bar'
model.emit('hello', {foo: 'bar'});
```

### model.values({include: [], exclude: []})

To get only the schema values of an entry you should call :

```js
const values = todo.values();
```

Example :

```js
const todo = new Todo({text: 'wash dishes'});
console.log(todo.values());
// {text: 'wash dishes', checked: false, tag: null, id: null};
```

You can exclude some values, example :

```js
console.log(todo.values({exclude: ['id']}));
// {text: 'wash dishes', checked: false, tag: null};
```

Or you can force to include some values, example :

```js
console.log(todo.values({include: ['text', 'checked']}));
// {text: 'wash dishes', checked: false};
```

### model.delete({emitChange: true})

To remove an entry from the store you should call :

```js
model.delete();
```

At this point, if a component is listening to the *ObjectManager* changes, it will be notified. 

If you don't want to trigger an event, you should pass *emitChange: false*

```js
todo.delete({emitChange: false});
```

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

An ObjectManager is a *Queryset* object. So it can do queries and delete entries too.

## Queryset

A Queryset is used to search entries in the store. The entry point of all querysets is the ObjectManager attached to Model classes : **Model.objects**.


### queryset.all()

To retrieve all entries of a queryset, you should call :

```js
const allTodos = Todo.objects.all();
```

### queryset.filter(expression), queryset.exclude(expression)

Each methods *filter* and *exclude* create a new queryset object that filters or exclude the results following an *expression*. An expression is key-value object like this :

```js
const onlyCheckedTodos = Todo.objects.filter({checked: true});
const onlyNotCheckedTodos = Todo.objects.exclude({checked: true});
```

As they return another queryset, it's possible to chain them :

```js
const onlyCheckedTodos = Todo.objects.filter({checked: true});
const homeTodos = onlyCheckedTodos.filter({tag: 'home'});
const workTodos = onlyCheckedTodos.filter({tag: 'work'});

homeTodos.all(); // an array of home checked todos
workTodos.all(); // an array of work checked todos
```

### queryset.orderBy(name)

You can create a sorted queryset by calling *orderBy* :

Example :

```js
const sortedTodo = Todo.objects.orderBy('text');
sortedTodo.all(); // an array of all todos, sorted alphabetically
```

As *filter* and *exclude*, orderBy returns a new queryset. You can chain filters before and after calling it.

Example :

```js
Todo.objects
    .filter({checked: true})
    .orderBy('text')
    .exclude({tag: 'work'})
    .all();
```

### queryset.values(opts)

Retrieve a values list for a given queryset.

Calling :

```js
const valuesArray = Todo.objects.filter({checked: true}).values()
```

Is equivalent to :

```js
const valuesArray = Todo.objects.filter({checked: true}).all().map(
  todo => todo.values()
);
```

### queryset.first()

Returns the first value of a given queryset.

```js
const firstSortedTodo = Todo.objects.orderBy('text').first();
```

### queryset.get(expression)

Returns the only existing result for the given *expression*.

Calling

```js
Todo.objects.get({id: '65ba62db9'});
```

is like calling :

```js
Todo.objects.filter({id: '65ba62db9'}).all()[0];
```

except *get* method :

  * does not iterate on all the results to create an array
  * throw an exception if no entry was found
  * throw an exception if more than one entry is found


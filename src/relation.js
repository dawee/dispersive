const ulid = require('ulid');
const Immutable = require('immutable');
const { createEntryMixin, Entry } = require('./model');
const { QuerySet } = require('./queryset');
const {
  OneToOneMapping,
  OneToManyMapping,
  ManyToOneMapping,
  ManyToManyMapping,
} = require('./mapping');


const normalize = ({
  model = null,
  hasMany = false,
  relatedName = null,
}) => ({ model, hasMany, relatedName });

const parse = opts => normalize(opts.model ? opts : {model: opts});


const createOneAccessor = ({ Base, name, mapping, model }) => (
  class extends Base {
    constructor(...args) {
      super(...args);
      Object.defineProperty(this, name, {
        enumerable: true,
        get: () => {
          const key = mapping.get(this.getKey());

          return key ? model.objects.get(key) : null;
        },

        set: (other) => {
          return other ? mapping.attach(this.getKey(), other.getKey()) : mapping.detach(this.getKey());
        },
      });
    }
  }
);


class RelationQuerySet extends QuerySet {

  constructor(opts) {
    super(opts);

    this.entry = opts.entry;
    this.mapping = opts.mapping;
  }

  addExisting(other) {
    this.mapping.attach(this.entry.getKey(), other.getKey());
    return other;
  }

  createAndAdd(rawValues = {}) {
    return this.addExisting(this.manager.create(rawValues));
  }

  addOne(other) {
    return (other instanceof Entry) ? this.addExisting(other) : this.createAndAdd(other);
  }

  addMany(others) {
    return others.map(other => this.addOne(other));
  }

  add(oneOrMany) {
    return Array.isArray(oneOrMany) ? this.addMany(oneOrMany) : this.addOne(oneOrMany);
  }

  remove(other) {
    return this.mapping.detach(this.entry.getKey(), other.getKey());
  }

}

const createManyAccessor = ({ Base, name, mapping, model }) => (
  class extends Base {

    constructor(...args) {
      super(...args);
      Object.defineProperty(this, name, {
        enumerable: true,
        get: () => {
          const objects = model.objects;
          const keyName = objects.setup.get('keyName');
          const keyset = mapping.get(this.getKey());

          return new RelationQuerySet({
            entry: this,
            mapping,
            manager: objects,
            values: keyset ? objects.values.filter(values => keyset.has(values.get(keyName))) : [],
            QuerySetConstructor: objects.QuerySetConstructor,
          });
        },
      });
    }

  }
);

const createRelation = ({
  name,
  relatedName,
  relatedModel,
  mapping,
  accessorFactory,
  relatedAccessorFactory,
}) => (
  createEntryMixin(({ Base, model }) => {
    if (relatedName) {
      relatedModel.inject(createEntryMixin(({ Base: RelatedBase }) => (
        relatedAccessorFactory({
          Base: RelatedBase,
          name: relatedName,
          mapping: mapping.reversed,
          model
        })
      )));
    }

    return accessorFactory({ Base, name, mapping, model: relatedModel });
  })
);

const createOneToOneRelation = ({ name, relatedName, relatedModel }) => createRelation({
  name,
  relatedName,
  relatedModel,
  mapping: new OneToOneMapping(),
  accessorFactory: createOneAccessor,
  relatedAccessorFactory: createOneAccessor,
});

const createOneToManyRelation = ({ name, relatedName, relatedModel }) => createRelation({
  name,
  relatedName,
  relatedModel,
  mapping: new OneToManyMapping(),
  accessorFactory: createOneAccessor,
  relatedAccessorFactory: createManyAccessor,
});

const createManyToOneRelation = ({ name, relatedName, relatedModel }) => createRelation({
  name,
  relatedName,
  relatedModel,
  mapping: new ManyToOneMapping(),
  accessorFactory: createManyAccessor,
  relatedAccessorFactory: createOneAccessor,
});

const createManyToManyRelation = ({ name, relatedName, relatedModel }) => createRelation({
  name,
  relatedName,
  relatedModel,
  mapping: new ManyToManyMapping(),
  accessorFactory: createManyAccessor,
  relatedAccessorFactory: createManyAccessor,
});

const withOne = (name, opts) => {
  const { hasMany, relatedName, model: relatedModel } = parse(opts);

  return hasMany
    ? createOneToManyRelation({ name, relatedName, relatedModel })
    : createOneToOneRelation({ name, relatedName, relatedModel });
};


const withMany = (name, opts) => {
  const { hasMany, relatedName, model: relatedModel } = parse(opts);

  return hasMany
    ? createManyToManyRelation({ name, relatedName, relatedModel })
    : createManyToOneRelation({ name, relatedName, relatedModel });
};

module.exports = {
  withOne,
  withMany,
};

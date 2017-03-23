const { createModel, createEntryMixin, createObjectManagerMixin, mix } = require('./model');
const { withField } = require('./field');
const Immutable = require('immutable');


const TARGET_KEY_NAME = 'targetKey';
const ROOT_KEY_NAME = 'rootKey';


/*
 * Generate relation data
 */

const assignRelation = (name, { model, relatedName = null, hasMany = false }) => (
  { model, hasMany, relatedName }
);

const parseRelation = (name, opts = {}) => (
  opts.model ? assignRelation(name, opts) : assignRelation(name, { model: opts })
);


/*
 * Association
 */


class FieldIndex {

  constructor(fieldName, keyName) {
    this.index = {};
    this.fieldName = fieldName;
    this.keyName = keyName;
    this.pointers = {};
  }

  add({ key, fieldValue, values }) {
    if (!key || !fieldValue || !values) return;

    this.index[fieldValue] = this.index[fieldValue]
      ? this.index[fieldValue].set(key, values)
      : Immutable.OrderedMap({ [key]: values });

    this.pointers[key] = fieldValue;
  }

  remove({ key, fieldValue, values }) {
    if (!key || !fieldValue || !values) return;

    this.index[fieldValue] = this.index[fieldValue].remove(key);
    delete this.pointers[key];
  }

  link(values) {
    const key = values.get(this.keyName);
    const fieldValue = values.get(this.fieldName);

    this.unlink(values);
    this.add({ key, fieldValue, values });
  }

  unlink(values) {
    const key = values.get(this.keyName);
    const fieldValue = this.pointers[key];

    this.remove({ key, fieldValue, values });
  }

  filterByValue(fieldValue) {
    const index = this.index[fieldValue];

    return (index && index.size > 0) ? index : null;
  }

  filter(expression = {}) {
    const fieldValue = expression[this.fieldName];

    return fieldValue ? this.filterByValue(fieldValue) : null;
  }

}

const withAssociationIndex = (...fieldNames) => {
  const indexes = [];

  const init = ({ setup }) => {
    indexes.concat(fieldNames.map(fieldName => (
      new FieldIndex(fieldName, setup.get('keyName'))
    )));

    return setup;
  };

  const mixin = createObjectManagerMixin(({ Base }) => class extends Base {
    static unlink(values) {
      indexes.forEach(index => index.unlink(values));

      return values;
    }

    static link(values) {
      indexes.forEach(index => index.link(values));

      return values;
    }

    unsync(values) {
      return super.unsync(this.constructor.unlink(values));
    }

    sync(values) {
      return this.constructor.link(super.sync(values));
    }

    filter(expression) {
      const values = indexes
        .map(index => index.filter(expression))
        .reduce((res, map) => {
          const hasMapNoRes = map && !res;
          const mapSizeIsLess = res && map && map.size < res.size;

          return hasMapNoRes || mapSizeIsLess ? map : res;
        }, null);

      return values ? this.subset({ values }).filter(expression) : super.filter(expression);
    }
  });

  return mix([init, mixin]);
};

const createAssociation = ({ root, target }) => ({
  src: {
    model: root,
    keyName: ROOT_KEY_NAME,
  },
  dest: {
    model: target,
    keyName: TARGET_KEY_NAME,
  },
  model: createModel([
    withField(ROOT_KEY_NAME),
    withField(TARGET_KEY_NAME),
    withAssociationIndex(ROOT_KEY_NAME, TARGET_KEY_NAME),
  ]),
});

const reverseAssociation = ({ src, dest, model }) => ({ src: dest, dest: src, model });


/*
 * Many relation
 */

const createManyQuerysetConstructor = QuerySetConstructor => (
  class extends QuerySetConstructor {

    constructor({ association, entry }) {
      super({
        values: association.model.objects.filter({
          [association.src.keyName]: entry.getKey(),
        }).values,
        manager: association.model.objects,
      });

      this.association = association;
      this.originEntry = entry;
    }

    nextEntry(iterator) {
      const entry = super.nextEntry(iterator);
      const keyValue = entry && entry[this.association.dest.keyName];

      return keyValue ? this.association.dest.model.objects.get(keyValue) : null;
    }

    add(entry) {
      this.association.model.createTransaction();

      this.association.model.objects.getOrCreate({
        [this.association.src.keyName]: this.originEntry.getKey(),
        [this.association.dest.keyName]: entry.getKey(),
      });

      this.association.model.commitTransaction();
    }

    remove(entry) {
      this.association.model.createTransaction();

      const associatedEntry = this.association.model.objects.get({
        [this.association.src.keyName]: this.originEntry.getKey(),
        [this.association.dest.keyName]: entry.getKey(),
      });

      if (associatedEntry) associatedEntry.delete();

      this.association.model.commitTransaction();
    }

    subset({ values }) {
      return new this.QuerySetConstructor({
        values,
        manager: this.association.dest.model.objects,
        QuerySetConstructor: this.QuerySetConstructor,
      });
    }

  }
);

const createWithManyAccessor = ({ fieldName, association, setup }) => {
  const QuerySetConstructor = createManyQuerysetConstructor(setup.get('QuerySetConstructor'));

  return createEntryMixin(({ Base }) => class extends Base {

    get [fieldName]() {
      return new QuerySetConstructor({ association, entry: this });
    }

  });
};


/*
 * One relation
 */

const createWithOneAccessor = ({ fieldName, association, hasMany }) => (
  createEntryMixin(({ Base }) => class extends Base {

    get [fieldName]() {
      const associatedEntry = association.model.objects.get({
        [association.src.keyName]: this.getKey(),
      });

      return associatedEntry
        ? association.dest.model.objects.get(associatedEntry[association.dest.keyName])
        : null;
    }

    getRelationEntry(entry) {
      let relationEntry = null;

      if (hasMany) {
        relationEntry = association.model.objects.getOrCreate({
          [association.dest.keyName]: entry.getKey(),
          [association.src.keyName]: this.getKey(),
        });
      } else {
        relationEntry = association.model.objects.get({ [association.src.keyName]: this.getKey() })
         || association.model.objects.get({ [association.dest.keyName]: entry.getKey() })
         || association.model.objects.create();
      }

      return relationEntry;
    }

    set [fieldName](entry) {
      association.model.createTransaction();

      if (entry) {
        this.getRelationEntry(entry).update({
          [association.dest.keyName]: entry.getKey(),
          [association.src.keyName]: this.getKey(),
        });
      } else {
        association.model.objects.filter({ [association.src.keyName]: this.getKey() }).delete();
      }

      association.model.commitTransaction();
    }

  })
);


/*
 * API
 */

const createRelationComposer = (name, opts = {}, rootAccessor, fromMany = false) => (
  ({ model, setup }) => {
    const relation = parseRelation(name, opts);
    const association = createAssociation({ root: model, target: relation.model });
    const relationOpts = {
      setup,
      fieldName: relation.relatedName,
      association: reverseAssociation(association),
    };

    if (relation.relatedName && !relation.hasMany) {
      relation.model.inject(createWithOneAccessor(Object.assign({
        hasMany: fromMany,
      }, relationOpts)));
    } else if (relation.relatedName && relation.hasMany) {
      relation.model.inject(createWithManyAccessor(relationOpts));
    }

    return rootAccessor({ association, setup, fieldName: name })({ model, setup });
  }
);

const withMany = (name, opts = {}) => (
  createRelationComposer(name, opts, createWithManyAccessor, true)
);

const withOne = (name, opts = {}) => (
  createRelationComposer(name, opts, createWithOneAccessor)
);


module.exports = {
  withOne,
  withMany,
};

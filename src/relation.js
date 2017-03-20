const { createModel, createEntryMixin, createObjectManagerMixin } = require('./model');
const { withField } = require('./field');
const Immutable = require('immutable');


const TARGET_PK_FIELD = 'targetPk';
const ROOT_PK_FIELD = 'rootPk';


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

  add({key, fieldValue, values}) {
    if (!key || !fieldValue || !values) return;

    this.index[fieldValue] = this.index[fieldValue]
      ? this.index[fieldValue].set(key, values)
      : Immutable.OrderedMap({[key]: values});

    this.pointers[key] = fieldValue;
  }

  remove({key, fieldValue, values}) {
    if (!key || !fieldValue || !values) return;

    this.index[fieldValue] = this.index[fieldValue].remove(key);
    delete this.pointers[key];
  }

  link(values) {
    const key = values.get(this.keyName);
    const fieldValue = values.get(this.fieldName);

    this.unlink(values);
    this.add({key, fieldValue, values});
  }

  unlink(values) {
    const key = values.get(this.keyName);
    const fieldValue = this.pointers[key];

    this.remove({key, fieldValue, values});
  }

  filterByValue(fieldValue) {
    const index = this.index[fieldValue];

    console.log('filter by value', fieldValue, this.index, Object.keys(this.index))

    return (index && index.size > 0) ? index : null;
  }

  filter(expression = {}) {
    const fieldValue = expression[this.fieldName];

    return fieldValue ? this.filterByValue(fieldValue) : null;
  }

}

const withAssociationIndex = (...fieldNames) => (
  createObjectManagerMixin(({ Base, setup, model }) => class extends Base {
    constructor(...args) {
      super(...args);

      this.indexes = model.indexes || fieldNames.map(fieldName => new FieldIndex(fieldName, setup.get('keyName')));
      model.indexes = this.indexes;
    }

    unlink(values) {
      this.indexes.forEach(index => index.unlink(values));

      return values;
    }

    link(values) {
      this.indexes.forEach(index => index.link(values));

      return values;
    }

    unsync(values) {
      return super.unsync(this.unlink(values));
    }

    sync(values) {
      return this.link(super.sync(values));
    }

    filter(expression) {
      const values = this.indexes
        .map(index => index.filter(expression))
        .reduce((res, map) => (map && !res) || (res && map && map.size < res.size) ? map : res, null);

      return values ? this.subset({ values }).filter(expression) : super.filter(expression);
    }
  })
);

const createAssociation = ({ root, target }) => ({
  src: {
    model: root,
    pkField: ROOT_PK_FIELD,
  },
  dest: {
    model: target,
    pkField: TARGET_PK_FIELD,
  },
  model: createModel([
    withField(ROOT_PK_FIELD),
    withField(TARGET_PK_FIELD),
    withAssociationIndex(ROOT_PK_FIELD, TARGET_PK_FIELD),
  ]),
});

const reverseAssociation = ({ src, dest, model }) => ({ src: dest, dest: src, model });


/*
 * Many relation
 */

const createManyQuerysetConstructor = QuerySetConstructor => (
  class extends QuerySetConstructor {

    constructor({ association, entry }) {
      super({ parent: association.model.objects.filter({
        [association.src.pkField]: entry.getKey(),
      }) });

      this.association = association;
      this.originEntry = entry;
    }

    * entries() {
      for (const entry of super.entries()) {
        yield this.association.dest.model.objects.get(entry[this.association.dest.pkField]);
      }
    }

    add(entry) {
      this.association.model.createTransaction();

      this.association.model.objects.getOrCreate({
        [this.association.src.pkField]: this.originEntry.getKey(),
        [this.association.dest.pkField]: entry.getKey(),
      });

      this.association.model.commitTransaction();
    }

    remove(entry) {
      this.association.model.createTransaction();

      const associatedEntry = this.association.model.objects.get({
        [this.association.src.pkField]: this.originEntry.getKey(),
        [this.association.dest.pkField]: entry.getKey(),
      });

      if (associatedEntry) associatedEntry.delete();

      this.association.model.commitTransaction();
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
        [association.src.pkField]: this.getKey(),
      });

      return associatedEntry
        ? association.dest.model.objects.get(associatedEntry[association.dest.pkField])
        : null;
    }

    getRelationEntry(entry) {
      let relationEntry = null;

      if (hasMany) {
        relationEntry = association.model.objects.getOrCreate({
          [association.src.pkField]: this.getKey(),
        });
      } else {
        relationEntry = association.model.objects.get({ [association.src.pkField]: this.getKey() })
         || association.model.objects.get({ [association.dest.pkField]: entry.getKey() })
         || association.model.objects.create();
      }

      return relationEntry;
    }

    set [fieldName](entry) {
      association.model.createTransaction();

      if (entry) {
        this.getRelationEntry(entry).update({
          [association.dest.pkField]: entry.getKey(),
          [association.src.pkField]: this.getKey(),
        });
      } else {
        association.model.objects.filter({ [association.src.pkField]: this.getKey() }).delete();
      }

      association.model.commitTransaction();
    }

  })
);


/*
 * API
 */

const createRelationComposer = (name, opts = {}, rootAccessor) => (
  ({ model, setup }) => {
    const relation = parseRelation(name, opts);
    const association = createAssociation({ root: model, target: relation.model });
    const relationOpts = {
      setup,
      hasMany: relation.hasMany,
      fieldName: relation.relatedName,
      association: reverseAssociation(association),
    };

    if (relation.relatedName && !relation.hasMany) {
      relation.model.inject(createWithOneAccessor(relationOpts));
    } else if (relation.relatedName && relation.hasMany) {
      relation.model.inject(createWithManyAccessor(relationOpts));
    }

    return rootAccessor({ association, setup, fieldName: name })({ model, setup });
  }
);

const withMany = (name, opts = {}) => createRelationComposer(name, opts, createWithManyAccessor);
const withOne = (name, opts = {}) => createRelationComposer(name, opts, createWithOneAccessor);


module.exports = {
  withOne,
  withMany,
};

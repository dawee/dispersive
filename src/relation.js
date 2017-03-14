const {createModel, createEntryMixin, createObjectManagerMixin} = require('./model');
const {withField} = require('./field');


const TARGET_PK_FIELD = 'targetPk';
const ROOT_PK_FIELD = 'rootPk';


/*
 * Generate relation data
 */

const assignRelation = (name, {model, relatedName = null, hasMany = false}) => (
  {model, hasMany, relatedName}
);

const parseRelation = (name, opts = {}) => (
  opts.model ? assignRelation(name, opts) : assignRelation(name, {model: opts})
);


/*
 * Association
 */

const withPkSetEntries = ({Base, pkSet, manager}) => class extends Base {

  * entries() {
    for (const [, entry] of pkSet.entries()) {
      yield manager.build(entry);
    }
  }

};

const withAssociationIndex = (pk1, pk2) => (
  createObjectManagerMixin(({Base}) => class extends Base {
    constructor(opts) {
      super(opts);
      this.indexes = this.getIndexes(opts);
    }

    getIndexes({indexes = {[pk1]: {}, [pk2]: {}}}) {
      return indexes;
    }

    unlink(values) {
      const pk1Value = values.get(pk1);
      const pk2Value = values.get(pk2);

      if (pk1Value in this.indexes[pk1]) this.indexes[pk1][pk1Value].delete(values);
      if (pk2Value in this.indexes[pk2]) this.indexes[pk2][pk2Value].delete(values);
    }

    link(values) {
      const pk1Value = values.get(pk1);
      const pk2Value = values.get(pk2);

      if (!(pk1Value in this.indexes[pk1])) this.indexes[pk1][pk1Value] = new Set();
      if (!(pk2Value in this.indexes[pk2])) this.indexes[pk2][pk2Value] = new Set();

      if (pk1Value && pk2Value) {
        this.indexes[pk1][pk1Value].add(values);
        this.indexes[pk2][pk2Value].add(values);
      }
    }

    unsync(values) {
      this.unlink(values);
      return super.unsync(values);
    }

    sync(values) {
      this.unlink(values);

      const newValues = super.sync(values);

      this.link(newValues);
      return newValues;
    }

    filterPkSet(expression = {}, pk) {
      const pkValue = expression[pk];

      return pkValue ? this.indexes[pk][pkValue] : null;
    }

    filter(expression) {
      const pk1Set = this.filterPkSet(expression, pk1);
      const pk2Set = this.filterPkSet(expression, pk2);
      const pkSet = (pk1Set && (!pk2Set || pk2Set.size > pk1Set.size)) ? pk1Set : pk2Set;

      return pkSet ? this.clone({
        QuerySetConstructor: withPkSetEntries({
          pkSet,
          Base: this.QuerySetConstructor,
          manager: this,
        }),
      }).filter(expression) : super.filter(expression);
    }
  })
);

const createAssociation = ({root, target}) => ({
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

const reverseAssociation = ({src, dest, model}) => ({src: dest, dest: src, model});


/*
 * Many relation
 */

const createManyQuerysetConstructor = QuerySetConstructor => (
  class extends QuerySetConstructor {

    constructor({association, entry}) {
      super({parent: association.model.objects.filter({[association.src.pkField]: entry.pk})});
      this.association = association;
      this.originEntry = entry;
    }

    * entries() {
      for (const entry of super.entries()) {
        yield this.association.dest.model.objects.get(entry[this.association.dest.pkField]);
      }
    }

    add(entry) {
      this.association.model.objects.createTransaction();

      this.association.model.objects.getOrCreate({
        [this.association.src.pkField]: this.originEntry.pk,
        [this.association.dest.pkField]: entry.pk,
      });

      this.association.model.objects.commitTransaction();
    }

    remove(entry) {
      this.association.model.objects.createTransaction();

      const associatedEntry = this.association.model.objects.get({
        [this.association.src.pkField]: this.originEntry.pk,
        [this.association.dest.pkField]: entry.pk,
      });

      if (associatedEntry) associatedEntry.delete();

      this.association.model.objects.commitTransaction();
    }

  }
);

const createWithManyAccessor = ({fieldName, association, setup}) => {
  const QuerySetConstructor = createManyQuerysetConstructor(setup.get('QuerySetConstructor'));

  return createEntryMixin(({Base}) => class extends Base {

    get [fieldName]() {
      return new QuerySetConstructor({association, entry: this});
    }

  });
};


/*
 * One relation
 */

const createWithOneAccessor = ({fieldName, association}) => (
  createEntryMixin(({Base}) => class extends Base {

    get [fieldName]() {
      const associatedEntry = association.model.objects.get({[association.src.pkField]: this.pk});

      return associatedEntry
        ? association.dest.model.objects.get(associatedEntry[association.dest.pkField])
        : null;
    }

    set [fieldName](entry) {
      association.model.objects.createTransaction();

      association.model.objects.getOrCreate({
        [association.src.pkField]: this.pk,
      }).update({[association.dest.pkField]: entry.pk});

      association.model.objects.commitTransaction();
    }

  })
);


/*
 * API
 */

const createRelationComposer = (name, opts = {}, rootAccessor) => (
  ({model, setup}) => {
    const relation = parseRelation(name, opts);
    const association = createAssociation({root: model, target: relation.model});
    const relationOpts = {
      setup,
      fieldName: relation.relatedName,
      association: reverseAssociation(association),
    };

    if (relation.relatedName && !relation.hasMany) {
      relation.model.inject(createWithOneAccessor(relationOpts));
    } else if (relation.relatedName && relation.hasMany) {
      relation.model.inject(createWithManyAccessor(relationOpts));
    }

    return rootAccessor({association, setup, fieldName: name})({model, setup});
  }
);

const withMany = (name, opts = {}) => createRelationComposer(name, opts, createWithManyAccessor);
const withOne = (name, opts = {}) => createRelationComposer(name, opts, createWithOneAccessor);


module.exports = {
  withOne,
  withMany,
};

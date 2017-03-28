const ulid = require('ulid');
const Immutable = require('immutable');
const { createEntryMixin } = require('./model');
const { QuerySet } = require('./queryset');


const normalize = ({
  model = null,
  hasMany = false,
  relatedName = null,
}) => ({ model, hasMany, relatedName });

const parse = opts => normalize(opts.model ? opts : {model: opts});


/*
 * One to one relation
 */


const createOneToOneRelation = ({ name, relatedName, relatedModel }) => {
  const indexes = { direct: {}, related: {} };

  const attach = ({directEntry, relatedEntry}) => {
    const directKey = directEntry.getKey();
    const relatedKey = relatedEntry.getKey();

    /*
     * Remove old links
     */

    const lastRelatedKey = indexes.direct[directKey];
    const lastDirectKey = indexes.related[relatedKey];

    delete indexes.direct[lastDirectKey];
    delete indexes.related[lastRelatedKey];

    /*
     * Attach new links
     */

    indexes.direct[directKey] = relatedKey;
    indexes.related[relatedKey] = directKey;
  };


  return createEntryMixin(({ Base, model }) => {

    if (relatedName) {
      relatedModel.inject(createEntryMixin(({ Base: RelatedBase }) => class extends RelatedBase {

        set [relatedName](directEntry) {
          return directEntry && attach({directEntry, relatedEntry: this});
        }

        get [relatedName]() {
          const key = indexes.related[this.getKey()];

          return key ? model.objects.get(key) : null;
        }

      }));
    }

    return class extends Base {

      set [name](relatedEntry) {
        return relatedEntry && attach({directEntry: this, relatedEntry});
      }

      get [name]() {
        const key = indexes.direct[this.getKey()];

        return key ? relatedModel.objects.get(key) : null;
      }

    };
  });
};


const createOneToManyRelation = ({ name, relatedName, relatedModel }) => {
  const indexes = { direct: {}, related: {} };

  const detachKeys = ({directKey, relatedKey}) => {
    const lastRelatedKey = indexes.direct[directKey];
    const lastDirectKey = indexes.related[relatedKey];

    delete indexes.direct[lastDirectKey];

    if (indexes.related[lastRelatedKey]) {
      delete indexes.related[lastRelatedKey][directKey];
    }
  };

  const detach = ({directEntry, relatedEntry}) => {
    const directKey = directEntry.getKey();
    const relatedKey = relatedEntry.getKey();

     detachKeys({ directKey, relatedKey });
  };

  const attach = ({directEntry, relatedEntry}) => {
    const directKey = directEntry.getKey();
    const relatedKey = relatedEntry.getKey();

    /*
     * Remove old links
     */

     detachKeys({ directKey, relatedKey });

    /*
     * Attach new links
     */

    if (!indexes.related[relatedKey]) {
      indexes.related[relatedKey] = {[directKey]: directKey};
    } else {
      indexes.related[relatedKey][directKey] = directKey;
    }

    indexes.direct[directKey] = relatedKey;
  };

  const createRelationQuerySetConstructor = (relatedEntry) => class extends QuerySet {

    add(directEntry) {
      return directEntry && attach({directEntry, relatedEntry});
    }

    remove(directEntry) {
      return directEntry && detach({directEntry, relatedEntry});
    }

  };

  return createEntryMixin(({ Base, model }) => {

    if (relatedName) {
      relatedModel.inject(createEntryMixin(({ Base: RelatedBase }) => class extends RelatedBase {

        get [relatedName]() {
          const objects = model.objects;
          const keys = indexes.related[this.getKey()] || {};

          return objects.subset({
            values: Immutable.OrderedMap(Object.keys(keys).map(key => (
              objects.values.get(key)
            ))),
            QuerySetConstructor: createRelationQuerySetConstructor(this),
          });
        }

      }));
    }

    return class extends Base {

      set [name](relatedEntry) {
        return relatedEntry && attach({directEntry: this, relatedEntry});
      }

      get [name]() {
        const key = indexes.direct[this.getKey()];

        return key ? relatedModel.objects.get(key) : null;
      }

    };
  });
};


const withOne = (name, opts) => {
  const { hasMany, relatedName, model: relatedModel } = parse(opts);

  return hasMany
    ? createOneToManyRelation({ name, relatedName, relatedModel })
    : createOneToOneRelation({ name, relatedName, relatedModel });
};


const withMany = () => (({setup}) => setup);

module.exports = {
  withOne,
  withMany,
};

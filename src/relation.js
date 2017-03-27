const ulid = require('ulid');
const { createEntryMixin } = require('./model');


const normalize = ({
  model = null,
  hasMany = false,
  relatedName = null,
}) => ({ model, hasMany, relatedName });

const parse = opts => normalize(opts.model ? opts : {model: opts});



const withOne = (name, opts) => {
  const { relatedName, model: relatedModel } = parse(opts);
  const indexes = { direct: {}, related: {} };

  const update = ({directEntry, relatedEntry}) => {
    const directKey = directEntry.getKey();
    const relatedKey = relatedEntry.getKey();

    const lastRelatedKey = indexes.direct[directKey];
    const lastDirectKey = indexes.related[relatedKey];

    delete indexes.direct[lastDirectKey];
    delete indexes.related[lastRelatedKey];

    indexes.direct[directKey] = relatedKey;
    indexes.related[relatedKey] = directKey;
  };


  return createEntryMixin(({ Base, model }) => {

    if (relatedName) {
      relatedModel.inject(createEntryMixin(({ Base: RelatedBase }) => class extends RelatedBase {

        set [relatedName](directEntry) {
          return directEntry && update({directEntry, relatedEntry: this});
        }

        get [relatedName]() {
          const key = indexes.related[this.getKey()];

          return key ? model.objects.get(key) : null;
        }

      }));
    }

    return class extends Base {

      set [name](relatedEntry) {
        return relatedEntry && update({directEntry: this, relatedEntry});
      }

      get [name]() {
        const key = indexes.direct[this.getKey()];

        return key ? relatedModel.objects.get(key) : null;
      }

    };
  });
};


const withMany = () => (({setup}) => setup);

module.exports = {
  withOne,
  withMany,
};

const ulid = require('ulid');
const {createEntryMixin} = require('../model');
const {withField} = require('.');

const createManyRelation = ({QuerySetConstructor, relatedModel, relatedPkName, pk}) => {
  const ManyRelation = class extends QuerySetConstructor {

    constructor({parent}) {
      super({QuerySetConstructor, parent});
      this.relatedPkName = relatedPkName;
      this.pk = pk;
    }

    add(entry) {
      return entry.update({[this.relatedPkName]: this.pk});
    }

  };

  return new ManyRelation({parent: relatedModel.objects.filter({[relatedPkName]: pk})});
};


const withMany = (name, relatedModel) => {
  const relatedPkName = `_many_${name}_pk_${ulid()}`;
  const relatedComposer = withField(relatedPkName);

  relatedModel.inject(relatedComposer);

  return createEntryMixin(({Base, setup}) => {
    const QuerySetConstructor = setup.get('QuerySetConstructor');

    return class extends Base {
      get [name]() {
        return createManyRelation({QuerySetConstructor, relatedModel, relatedPkName, pk: this.pk});
      }
    };
  });
};

module.exports = {
  withMany,
};

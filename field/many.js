const ulid = require('ulid');
const {createEntryMixin} = require('../model');
const {withField} = require('.');

const createManyRelation = ({QuerySetConstructor, relation, pk}) => {
  const ManyRelation = class extends QuerySetConstructor {

    constructor({parent}) {
      super({QuerySetConstructor, parent});
      this.relation = relation;
      this.pk = pk;
    }

    add(entry) {
      return entry.update({[this.relation.pkName]: this.pk});
    }

  };

  return new ManyRelation({parent: relation.model.objects.filter({[relation.pkName]: pk})});
};

const withMany = (name, {model = null, relatedName = null}) => {
  const relation = {
    model,
    fieldName: relatedName,
    pkName: relatedName ? `_${relatedName}_pk` : `_many_${name}_pk_${ulid()}`,
  };

  relation.model.inject(withField(relation.pkName));

  return createEntryMixin(({Base, setup}) => {
    const QuerySetConstructor = setup.get('QuerySetConstructor');

    return class extends Base {
      get [name]() {
        return createManyRelation({QuerySetConstructor, relation, pk: this.pk});
      }
    };
  });
};

module.exports = {
  withMany,
};

const ulid = require('ulid');
const {createEntryMixin} = require('../model');
const {withField} = require('.');


const withMany = (name, relatedModel) => {
  const relatedPk = `_many_${name}_pk_${ulid()}`;
  const relatedComposer = withField(relatedPk);

  relatedModel.inject(relatedComposer);

  return createEntryMixin(Base => class extends Base {
    get [name]() {
      return relatedModel.objects.filter({[relatedPk]: this.pk});
    }
  });
};

module.exports = {
  withMany,
};

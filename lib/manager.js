const QuerySet = require('./queryset');
const assign = require('101/assign');
const hat = require('hat');


class ObjectManager extends QuerySet {

  constructor(ModelType) {
    super();
    this.set = new Set();
    this.index = {};
    this.ModelType = ModelType;
    this.generator = this.models;
    this.schema = ModelType.schema;
  }

  *models() {
    for (const values of this.set) {
      yield new this.ModelType(values);
    }
  }

  create(data, opts = {emitChange: true}) {
    return new this.ModelType(data).save(opts);
  }

  _syncNew(model) {
    if (! ('id' in this.index)) this.index.id = {};

    model.id = hat();
    this.index.id[model.id] = model.values();
    this.set.add(model);
  }

  _syncExisting(model) {
    this.index.id[model.id] = assign(this.index.id[model.id], model.values());
  }

  sync(model, opts = {emitChange: true}) {
    if (!!model.id) return this._syncExisting(model);

    this._syncNew(model, opts);

    if (opts.emitChange) this.emitChange();
  }

  unsync(model, opts = {emitChange: true}) {
    this.set.delete(model);
    delete this.index.id[model.id];

    if (opts.emitChange) this.emitChange();
  }

  delete(opts = {emitChange: true}) {
    this.models.forEach(instance => instance.delete(opts));
  }

}

module.exports = ObjectManager;

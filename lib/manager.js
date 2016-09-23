const QuerySet = require('./queryset');
const clone = require('101/clone');
const assign = require('101/assign');
const hat = require('hat');

class ObjectManager extends QuerySet {

  constructor(ModelType) {
    super();
    this.ModelType = ModelType;
    this.generator = this.models;
    this.schema = ModelType.schema;
    this.index = this.buildIndex();
  }

  buildIndex() {
    const index = {};

    for (const [name, field] of this.ModelType.schema.fields()) {
      if (field.indexed) index[name] = {};
    }

    return index;
  }

  *models() {
    for (const id of Object.keys(this.index.id)) {
      yield new this.ModelType(this.index.id[id]);
    }
  }

  create(data, opts = {emitChange: true}) {
    return new this.ModelType(data).save(opts);
  }

  _syncNew(model) {
    model.id = hat();
    this.index.id[model.id] = clone(model.values());
  }

  _syncExisting(model) {
    assign(this.index.id[model.id], clone(model.values()));
  }

  sync(model, opts = {emitChange: true}) {
    if (!!model.id) return this._syncExisting(model);

    this._syncNew(model, opts);
    if (opts.emitChange) this.emitChange();
  }

  unsync(model, opts = {emitChange: true}) {
    delete this.index.id[model.id];

    if (opts.emitChange) this.emitChange();
  }

  delete(opts = {emitChange: true}) {
    this.models.forEach(instance => instance.delete(opts));
  }

}

module.exports = ObjectManager;

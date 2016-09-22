const QuerySet = require('./queryset');
const assign = require('101/assign');
const hat = require('hat');


class ObjectManager extends QuerySet {

  constructor(ModelType) {
    super();
    this.raw = new Set();
    this.index = {};
    this.ModelType = ModelType;
    this.generator = this.instances;
  }

  *instances() {
    for (const entry of this.raw) {
      yield new this.ModelType(entry);
    }
  }

  create(data, opts = {emitChange: true}) {
    const entry = new this.ModelType(data);

    entry.save(opts);
    return entry;
  }

  _syncNew(model) {
    if (! ('id' in this.index)) this.index.id = {};

    model.id = hat();
    this.index.id[model.id] = model.values();
    this.raw.add(model);
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
    this.raw.delete(model);
    delete this.index.id[model.id];

    if (opts.emitChange) this.emitChange();
  }

  delete(opts = {emitChange: true}) {
    this.instances.forEach(instance => instance.delete(opts));
  }

}

module.exports = ObjectManager;

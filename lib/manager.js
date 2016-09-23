const QuerySet = require('./queryset');
const clone = require('101/clone');
const assign = require('101/assign');
const hat = require('hat');


class SetIndex {

  constructor(name) {
    this.name = name;
    this.sets = {};
    this.refs = {};
  }

  add(values) {
    const val = values[this.name];

    this.delete(values);

    if (val !== null) {
      if (! (val in this.sets)) this.sets[val] = new Set();

      this.sets[val].add(values);
      this.refs[values] = val;
    }
  }

  delete(values) {
    if (! (values in this.refs)) return;

    const val = this.refs[values];

    this.sets[val].delete(values);
    delete this.refs[values];
  }

}


class ObjectManager extends QuerySet {

  constructor(ModelType) {
    super();
    this.ModelType = ModelType;
    this.generator = this.models;
    this.schema = ModelType.schema;
    this.index = this.buildIndex();
    this.indexNames = Object.keys(this.index).filter(name => name !== 'id');
  }

  buildIndex() {
    const index = {id: {}};

    for (const [name, field] of this.ModelType.schema.fields()) {
      if (name !== 'id' && field.index) index[name] = new SetIndex(name);
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


  _syncLinks(values) {
    for (const indexName of this.indexNames) {
      this.index[indexName].add(values);
    }
  }

  _unsyncLinks(values) {
    for (const indexName of this.indexNames) {
      this.index[indexName].delete(values);
    }
  }

  _syncNew(model) {
    model.id = hat();

    this.index.id[model.id] = clone(model.values());
    this._syncLinks(this.index.id[model.id]);
  }

  _syncExisting(model) {
    assign(this.index.id[model.id], clone(model.values()));
    this._syncLinks();
  }

  sync(model, opts = {emitChange: true}) {
    if (!!model.id) return this._syncExisting(model);

    this._syncNew(model, opts);
    if (opts.emitChange) this.emitChange();
  }

  unsync(model, opts = {emitChange: true}) {
    this._unsyncLinks(this.index.id[model.id]);
    delete this.index.id[model.id];

    if (opts.emitChange) this.emitChange();
  }

  delete(opts = {emitChange: true}) {
    this.models.forEach(instance => instance.delete(opts));
  }

}

module.exports = ObjectManager;

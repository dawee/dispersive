const QuerySet = require('./queryset');
const clone = require('101/clone');
const assign = require('101/assign');
const hat = require('hat');

class Index {

  constructor(name) {
    this.name = name;
    this.refs = {};
  }

  add(values) {
    const val = values[this.name];

    if (val !== null) {
      this.link(val, values);
      this.refs[values] = val;
    }
  }

  delete(values) {
    if (! (values in this.refs)) return;

    const val = this.refs[values];

    this.unlink(val, values);
    delete this.refs[values];
  }

}

class SetIndex extends Index {

  constructor(name) {
    super(name);
    this.sets = {};
  }

  link(val, values) {
    if (! (val in this.sets)) this.sets[val] = new Set();

    this.sets[val].add(values);
  }

  unlink(val, values) {
    this.sets[val].delete(values);
  }

  countOf(val) {
    return (val in this.sets) ? Array.from(this.sets[val]).length : 0;
  }

  *allOf(val) {
    if (val in this.sets) {
      for (const values of this.sets[val]) {
        yield values;
      }
    }
  }

}

class UniqueIndex extends Index {

  constructor(name) {
    super(name);
    this.kvs = {};
  }

  link(val, values) {
    if (val in this.kvs) throw new UniqueIndex.AlreadyExists(this.name, val);

    this.kvs[val] = values;
  }

  unlink(val) {
    delete this.kvs[val];
  }

  get(val) {
    return this.kvs[val];
  }

  countOf(val) {
    return (val in this.kvs) ? 1 : 0;
  }

  *allOf(val) {
    if (val in this.kvs) yield this.kvs[val];
  }

  *all() {
    for (const val of Object.keys(this.kvs)) {
      yield this.kvs[val];
    }
  }

}

UniqueIndex.AlreadyExists = class {

  constructor(name, val) {
    this.name = 'AlreadyExists';
    this.message = `Model with '${name}' = ${val} already exists`;
  }

};


class ObjectManager extends QuerySet {

  constructor(ModelType) {
    super({ModelType});
    this.generator = this.models;
    this.index = this.buildIndex();
    this.indexNames = Object.keys(this.index).filter(name => name !== 'id');
  }

  buildIndex() {
    const index = {};

    for (const [name, field] of this.ModelType.schema.fields()) {
      if (!!field.index) {
        const IndexType = field.unique ? UniqueIndex : SetIndex;

        index[name] = new IndexType(name);
      }
    }

    return index;
  }

  *models(prefilters = []) {
    let base = this.index.id.all();
    let lowerCount = Infinity;

    for (const prefilter of prefilters) {
      const count = this.index[prefilter.name].countOf(prefilter.val);

      if (count < lowerCount) {
        base = this.index[prefilter.name].allOf(prefilter.val);
        lowerCount = count;
      }
    }

    for (const values of base) {
      yield this._modelFromValues(values);
    }
  }

  _modelFromValues(values) {
    return new this.ModelType(values);
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

    this.index.id.add(clone(model.values()));
    this._syncLinks(this.index.id.get(model.id));
  }

  _syncExisting(model) {
    assign(this.index.id.get(model.id), clone(model.values()));
    this._syncLinks();
  }

  sync(model, opts = {emitChange: true}) {
    if (!!model.id) return this._syncExisting(model);

    this._syncNew(model, opts);
    if (opts.emitChange) this.emitChange();
  }

  unsync(model, opts = {emitChange: true}) {
    const values = this.index.id.get(model.id);

    this._unsyncLinks(values);
    this.index.id.delete(values);

    if (opts.emitChange) this.emitChange();
  }

  delete(opts = {emitChange: true}) {
    this.models.forEach(instance => instance.delete(opts));
  }

}

module.exports = ObjectManager;

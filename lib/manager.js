const QuerySet = require('./queryset');
const EventEmitter = require('./emitter');
const clone = require('clone');
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

    if (!ModelType || !ModelType.schema) throw new ObjectManager.NoSchema();

    this.generator = this.models;
    this.index = this.buildIndex();
    this.indexNames = Object.keys(this.index).filter(name => name !== 'id');
    this.emitters = {};
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
    const model = new this.ModelType(values);

    model.emitter = this.emitters[model.id];
    return model;
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
    model.emitter = EventEmitter.createEmitter();

    this.emitters[model.id] = model.emitter;
    this.index.id.add(clone(model.values()));
    this._syncLinks(this.index.id.get(model.id));
  }

  _syncExisting(model) {
    if (! this.index.id.get(model.id)) throw new ObjectManager.ModelNotSyncable();

    Object.assign(this.index.id.get(model.id), clone(model.values()));
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
    delete this.emitters[model.id];

    if (opts.emitChange) this.emitChange();
  }

  delete(opts = {emitChange: true}) {
    this.models.forEach(instance => instance.delete(opts));
  }

}

ObjectManager.ModelNotSyncable = class extend {

  constructor() {
    this.name = 'ModelNotSyncable';
    this.message = 'Could not sync model that was previously deleted';
  }

};

ObjectManager.NoSchema = class {

  constructor() {
    this.name = 'NoSchema';
    this.message = 'Cannot create a model without a schema';
  }

};

module.exports = ObjectManager;

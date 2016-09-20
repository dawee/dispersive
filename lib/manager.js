const QuerySet = require('./queryset');


class ObjectManager extends QuerySet {

  constructor(EntryType) {
    super();
    this.instances = [];
    this.EntryType = EntryType;
    this.generator = this.baseGenerator;
  }

  *baseGenerator() {
    for (const entry of this.instances) {
      yield entry;
    }
  }

  create(data, trigger = true) {
    const entry = new this.EntryType(data);

    this.instances.push(entry);
    if (trigger) this.change();
    return entry;
  }

  delete(entry, trigger = true) {
    if (!!entry) {
      this.instances = this.instances.filter((other) => other !== entry);
    } else {
      this.instances = [];
    }

    if (trigger) this.change();
  }

}

module.exports = ObjectManager;

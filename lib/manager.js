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

  create(data) {
    const entry = new this.EntryType(data);

    this.instances.push(entry);
    return entry;
  }

  delete(entry) {
    if (!!entry) {
      this.instances = this.instances.filter((other) => other !== entry);
    } else {
      this.instances = [];
    }
  }

}

module.exports = ObjectManager;

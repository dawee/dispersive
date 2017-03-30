const Immutable = require('immutable');

const map = init => Immutable.Map(init);
const extractMaps = ({ maps = { src: map(), dest: map() } }) => maps;


class ReversedMapping {

  constructor({ mapping }) {
    this.mapping = mapping;
  }

  attach(srcKey, destKey) {
    return this.mapping.attach(destKey, srcKey);
  }

  detach(srcKey, destKey) {
    return this.mapping.detach(destKey, srcKey);
  }

  get(destKey) {
    return this.mapping.getFromDest(destKey);
  }

}

class Mapping {

  constructor(opts = {}) {
    this.maps = extractMaps(opts);
  }

  getFromSrc(srcKey) {
    return this.maps.src.get(srcKey);
  }

  getFromDest(destKey) {
    return this.maps.dest.get(destKey);
  }

  get(srcKey) {
    return this.getFromSrc(srcKey);
  }

  reverse() {
    return new ReversedMapping({ mapping: this });
  }

}


class OneToOneMapping extends Mapping {

  attach(srcKey, destKey) {
    const lastPointedDestKey = this.maps.src.get(srcKey);
    const lastPointedSrcKey = this.maps.dest.get(destKey);

    this.maps.src = this.maps.src.remove(lastPointedSrcKey).set(srcKey, destKey);
    this.maps.dest = this.maps.dest.remove(lastPointedDestKey).set(destKey, srcKey);
  }

  detach(srcKey, destKey) {
    this.maps.src = this.maps.src.remove(srcKey);
    this.maps.dest = this.maps.dest.remove(destKey);
  }

}


module.exports = {
  OneToOneMapping,
};

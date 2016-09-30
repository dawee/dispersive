const object = module.exports = {};

object.filter = (src, predicate) => {
  const dest = {};

  for (const key of Object.keys(src)) {
    const value = src[key];

    if (predicate(key, value)) dest[key] = value;
  }

  return dest;
};

object.omit = (src, ...keys) => object.filter(src, key => keys.indexOf(key) < 0);
object.pick = (src, ...keys) => object.filter(src, key => keys.indexOf(key) >= 0);

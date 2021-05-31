const { get } = require('lodash')

function getRef(ref, schema) {
  const path = ref.replace(/^#\//, '').replace(/\//gm, '.')
  return get(schema, path)
}

module.exports = getRef;
const getRef = require("./get-ref")

const typeMapper = {
  integer: 'number'
}

const getTsType = (type) => typeMapper[type] || type

function generateTypings(name, parameters = {}) {
  const typeName = `${name[0].toUpperCase()}${name.slice(1)}Parameters`
  let result = `interface ${typeName} {
`;
  Object.values(parameters).forEach(({ name, required, description, schema }) => {
    if(description) {
      result = `${result} /** ${description} */\n`
    } else {
      result = `${result}\n`
    }
    result = `${result}  ${name}${required ? '' : '?'}: ${getTsType(schema.type)}\n`
  })
  return {typeName, interface: `${result}};`}
}

function generateParameters(parameters = [], schema) {
  let result = {}
  if(parameters.length > 0) {
    parameters.forEach(({ name, ...rest }) => {
      if(name) {
        result[name] = {name, ...rest}
      }
      if(rest['$ref']) {
        const spec = getRef(rest['$ref'], schema)
        result[spec.name] = spec
      }
    })
  }
  return result;
}

function queryGenerator (url, {get}, schema, queryName) {
  const availableParameters = generateParameters(get.parameters, schema);
  const {typeName, interface} = generateTypings(queryName, availableParameters);
  const content = `import GlobalInstance from '../globalInstance'

${interface}

async function getData(parameters: ${typeName}) {
    return GlobalInstance.getInstance().get("${url}", {params: parameters})
}

export default getData
`;
return content
}

module.exports = queryGenerator;

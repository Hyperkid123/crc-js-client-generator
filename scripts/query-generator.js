const getRef = require("./get-ref")

const typeMapper = {
  integer: 'number',
  string: 'string'
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

function extractBodySchema(attributes, schema) {
  let content
  if(attributes.content) {
    content = attributes.content
  }

  if(attributes['$ref']) {
    content = getRef(attributes['$ref'], schema)
  }

  if(content.content) {
    content = content.content
  }

  if(content['application/json']) {
    content = content['application/json']
  }
  content = content.schema

  if(content['$ref']) {
    content = getRef(content['$ref'], schema)
  }

  return content
}

const functionMapper = {
  string: (name, def, required) => `\n  /** ${def.example} */\n  ${name}${required ? '' : '?'}: string`,
  array: (name, def, required, schema) => {
    const config = def;
    if(config.items['$ref']) {
      config.items = getRef(def.items['$ref'], schema)
    }
    let itemType = config.items.type;
    if(typeof config.items === 'object' && config.items.properties) {
      itemType = interpretItemType(config.items)
    }
    return `${config.items.example ? `\n/** ${config.items.example} */` : ''}\n  ${name}${required ? '' : '?'}: ${itemType}[]`
  }
}

function interpretItemType({properties, required}) {
  return `{${Object.entries(properties).reduce((acc, [name, { type }]) => `${acc} ${name}${required.includes(name) ? '' : '?'}: ${typeMapper[type]}` ,'')}}`
}

function interpretProperties(queryName, properties, required, schema) {
  const typeName = `${queryName[0].toUpperCase()}${queryName.slice(1)}Payload`
  let result = `interface ${typeName} {`
  Object.entries(properties).forEach(([name, definition]) => {
    result = `${result}${functionMapper[definition.type](name, definition, required.includes(name), schema)}`
  })
  return {typeName, content: `${result}\n}`}
}

function createPostInterface(queryName, attributes, schema) {
  const bodySchema = extractBodySchema(attributes, schema)
  let result;
  if(bodySchema.properties) {
    result = interpretProperties(queryName, bodySchema.properties, bodySchema.required, schema)
  }
  console.log(result)
}

function queryGenerator (url, method, options, schema, queryName) {
  const availableParameters = generateParameters(options.parameters, schema);
  const {typeName, interface} = generateTypings(queryName, availableParameters);
  if(method === 'post') {
    createPostInterface(queryName, options.requestBody, schema)
  }
  const content = `import GlobalInstance from '../globalInstance'
import { generateUrl } from '../helpers'

const availableParameters = ${JSON.stringify(availableParameters)}

${interface}

async function getData(parameters: ${typeName}) {
    return GlobalInstance.getInstance().${method}(generateUrl("${url}", availableParameters), {params: parameters})
}

export default getData
`;
return content
}

module.exports = queryGenerator;

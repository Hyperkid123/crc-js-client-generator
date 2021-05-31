const http = require('http');
const https = require('https')
const fs = require('fs');
const path = require('path')
const queryGenerator = require('./query-generator');

const URL = 'https://raw.githubusercontent.com/RedHatInsights/insights-rbac/master/docs/source/specs/openapi.json'

const schemaPath = path.resolve(__dirname, "../schema.json");
const file = fs.createWriteStream(schemaPath);
const getFunction = URL.match(/^https/) ? https.get : http.get

file.on('finish', () => {
  generateFiles()
})
function readFile(URL) {
  return getFunction(URL, function(response) {
    response.pipe(file);
  });
}
readFile(URL)

const SUPPORTED_METHODS = ['get', 'post'];

function createMethods(endpoint) {
  return SUPPORTED_METHODS.reduce((acc, curr) => Object.prototype.hasOwnProperty.call(endpoint, curr) ? ({
    ...acc,
    [curr]: endpoint[curr]
  }) : acc, {})
}

function generateFiles() {
  let schema = fs.readFileSync(schemaPath, {encoding: 'utf-8'})
  schema = JSON.parse(schema);
  const paths = schema.paths;
  Object.entries(paths).forEach(([pathname, config]) => {
    const methods = createMethods(config)
    Object.entries(methods).forEach(([method, options]) => {
      const fileName = options.operationId
      const output = queryGenerator(pathname, method, options, schema, fileName)
      const folderPath = path.resolve(__dirname, '..', 'src', fileName)
      if(!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath)
      }
      fs.writeFileSync(path.resolve(folderPath, `${fileName}.ts`), output)
    })
  })
}




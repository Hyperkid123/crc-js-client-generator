const fs = require('fs')
const path = require('path')

const data = fs.readFileSync(path.resolve(__dirname, './sample-spec.json'), {
    encoding: 'utf-8'
})

const jsonData = JSON.parse(data)
console.log({ jsonData });

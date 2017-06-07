import util from 'util'
import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import config from './config.js'
import samanageAssistant from './assistant-handler.js'

const app = express()
const ApiAiApp = require('actions-on-google').ApiAiAssistant
const port = process.env.port || process.env.PORT || config('PORT') || 8080
if (!port) {
  console.log('Error: Port not specified in environment')
  process.exit(1)
}

app.set('port', port)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ type: 'application/json' }))
app.use(express.static(path.join(__dirname, '../public')))

app.get('/', (request, response) => {
  response.sendFile('index.html')
})

app.post('/actions', (request, response) => {
  console.log('--> /actions Webhook Received')
  console.log(`\nRequest headers: ${util.inspect(request.headers)}\nRequest body:\n${util.inspect(request.body)}`)
  const assistant = new ApiAiApp({ request, response })
  samanageAssistant(assistant)
})

const server = app.listen(app.get('port'), () => {
  console.log('App listening on port %s', server.address().port)
  console.log('Press Ctrl+C to quit')
})

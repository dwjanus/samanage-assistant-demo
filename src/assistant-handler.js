import util from 'util'
import _ from 'lodash'
import Promise from 'bluebird'

// consts for intent map
const GOOGLE_ASSISTANT_WELCOME = 'input.welcome'

const welcomeIntent = (app) => {
  console.log('--> welcome intent called')
  // app.ask('What can I do for you? If you are not totally sure what to do, just say: I need help')
}

const actionMap = new Map()
actionMap.set(GOOGLE_ASSISTANT_WELCOME, welcomeIntent)

export default ((app) => {
  console.log('--> assistant-handler called')
  const action = actionMap.get(app.getIntent())
  console.log(`action: ${util.inspect(action)}`)
  const promisedAction = Promise.promisify(action)
  promisedAction(app).then((result) => {
    console.log(`--> promisedAction fulfilled\nResult:\n${util.inspect(result)}`)
    app.ask(result)
  })
  .catch((err) => {
    console.log(err)
  })
})

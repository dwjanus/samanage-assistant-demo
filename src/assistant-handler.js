import util from 'util'
import _ from 'lodash'
import Promise from 'bluebird'
import samanage from '../samanage/mmbu-api.js'

// consts for intent map
const GOOGLE_ASSISTANT_WELCOME = 'input.welcome'
const SINGLE_RETURN_NO_CONTEXT = 'input.singlereturn'
const SINGLE_RETURN = 'context.singlereturn'
const GET_LATEST = 'input.getlatest'
const RECORD_DETAILS = 'record.details'
const COMMENTS = 'context.comments'

const welcomeIntent = (app) => {
  console.log('** inside welcome case **')
  app.ask('What can I do for you? If you are not totally sure what to do, just say: I need help')
}

const getLatestIntent = (app, cb) => {
  console.log('** inside get latest case **')
  const type = app.getArgument('record-type')
  let recordType = type
  if (!_.endsWith(recordType, 's')) recordType += 's'
  samanage.getLatest(recordType).then((record) => {
    console.log(`--> record ${util.inspect(record.id)} retrieved`)
    let text = `I'm sorry, I was unable to retrieve any information on that ${recordType}`
    if (record !== 'none' || null || undefined) {
      text = `The latest ${type} is ${record.number}, ${record.name}. Would you like more information on that?`
      let description = 'I\'m sorry, no text description was provided'
      if (record.description) console.log(`--> description with html:\n${util.inspect(record.description)}`) // need a way to parse out signatures
      if (record.description_no_html !== '' || undefined || null) description = record.description_no_html
      app.data = {
        temp_record: {
          type: recordType,
          id: record.id,
          number: record.number,
          name: record.name,
          description,
          state: record.state,
          priority: record.priority,
          assignee: record.assignee,
          requester: record.requester,
          created_by: record.created_by,
          created_at: record.created_at,
          updated_at: record.updated_at,
          due_at: record.due_at,
          number_of_comments: record.number_of_comments
        }
      }
      console.log(`--> app data saved\n${util.inspect(app.data)}`)
      temprecord = app.data.temp_record
    }
    return cb(null, text)
  })
  .catch((err) => {
    cb(err, null)
  })
}

const singleReturnNCIntent = (app, cb) => {
  console.log('--> calling single return [nc] case')
  const type = app.getArgument('record-type')
  let recordType = type
  if (!_.endsWith(recordType, 's')) recordType += 's'
  const caseNumber = app.getArgument('casenumber')
  const returnType = app.getArgument('return-type')
  console.log(`Returning: ${returnType} for ${recordType}: ${caseNumber}`)
  return samanage.singleReturn(caseNumber, returnType, recordType).then((record) => {
    console.log(`--> record ${util.inspect(record.id)} retrieved`)
    let text = `I'm sorry, I was unable to retrieve any information on that ${recordType}`
    if (record !== 'none' || null || undefined) {
      text = `The ${returnType} of ${type} ${caseNumber} is ${record[returnType]}`
      // eventually check if we can provide image output and then display images
      let description = 'I\'m sorry, no text description was provided'
      if (record.description_no_html !== '' || undefined || null) description = record.description_no_html
      app.data.temp_record = {
        type: recordType,
        id: record.id,
        number: record.number,
        name: record.name,
        description,
        state: record.state,
        priority: record.priority,
        assignee: record.assignee,
        requester: record.requester,
        created_by: record.created_by,
        created_at: record.created_at,
        updated_at: record.updated_at,
        due_at: record.due_at,
        number_of_comments: record.number_of_comments
      }
    }
    console.log(`--> app data saved\n${util.inspect(app.data)}`)
    temprecord = app.data.temp_record
    return cb(null, text)
  })
  .catch((err) => {
    cb(err, null)
  })
}

const singleReturnIntent = (app, cb) => {
  const returnType = app.getArgument('return-type')
  const record = app.data.temp_record
  console.log(`--> singleReturn - returnType: ${returnType}`)
  let text = `I'm sorry, I was unable to retrieve the ${returnType}`
  if ((record !== 'none' || null || undefined) && (record[returnType] !== null || undefined)) {
    let output = record[returnType]
    if (returnType === 'assignee') output = output.name
    text = `The ${returnType} is ${output}`
  }
  return cb(null, text)
}

const recordDetails = (app, cb) => {
  console.log('--> grabbin them deets')
  console.log(`app data:\n${util.inspect(app.data)}`)
  const record = app.data.temp_record
  const description = record.description
  const state = record.state
  const priority = record.priority
  const requester = record.requester.name
  const text = `${description}. Currently the state is ${state} with a ${priority} priority level. Requested by ${requester}`
  return cb(null, text)
}

const comments = (app, cb) => {
  console.log('--> grabbin them comments')
  console.log(`app data:\n${util.inspect(app.data)}`)
  console.log(`tempcomments:\n${util.inspect(tempcomments)}`)
  const timeframe = app.getArgument('timeframe')
  const amount = app.getArgument('amount_query')
  console.log(`timeframe: ${timeframe}\namount: ${amount}\ntempcomments:\n${util.inspect(tempcomments)}`)
}

const actionMap = new Map()
actionMap.set(GOOGLE_ASSISTANT_WELCOME, welcomeIntent)
actionMap.set(GET_LATEST, getLatestIntent)
actionMap.set(SINGLE_RETURN_NO_CONTEXT, singleReturnNCIntent)
actionMap.set(SINGLE_RETURN, singleReturnIntent)
actionMap.set(COMMENTS, comments)
actionMap.set(RECORD_DETAILS, recordDetails)

let temprecord
let tempcomments

if (!_.isEmpty(temprecord)) {
  if (temprecord.number_of_comments > 0) {
    samanage.getComments(temprecord.type, temprecord.id).then((recordComments) => {
      tempcomments = recordComments
    })
    .catch((err) => {
      console.log(err)
    })
  } else {
    tempcomments = 0
  }
}

export default ((app) => {
  if (temprecord) app.data.temp_record = temprecord
  console.log('** inside app function **')
  const action = actionMap.get(app.getIntent())
  console.log(`action: ${util.inspect(action)}`)
  const promisedAction = Promise.promisify(action)
  promisedAction(app).then((result) => {
    console.log(`--> promisedAction\nResult:\n${util.inspect(result)}`)
    app.ask(result)
  })
  .catch((err) => {
    console.log(err)
  })
})

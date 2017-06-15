import util from 'util'
import Ssml from 'ssml'
import Promise from 'bluebird'

// consts for intent map
const GOOGLE_ASSISTANT_WELCOME = 'input.welcome'
const BENEFITS = 'input.benefits'
const HEALTH = 'benefits.health'
const SPECIALIST = 'health.specialist'
const INCIDENT = 'input.incident'
// const SUPPORT = 'incident.support'
const SUBMIT = 'incident.submit'
const UPDATE = 'incident.update'
const INCIDENT_WELCOME = 'incident.welcome'
const FOLLOWUP_INCIDENT = 'incident.followup'
const END = 'output.end'

const welcomeIntent = (app) => {
  console.log('--> welcome intent called')
  app.ask('Hi Devin! What can I do for you?')
}

const benefitIntent = (app) => {
  console.log('--> benefit intent called')
  app.ask('Certainly! Would you like to know about your medical, 401k, or another benefit?')
}

const healthBenefitIntent = (app) => {
  console.log('--> healthBenefit intent called')
  app.ask('Ok, do you want me to find a doctor covered under your plan or would you like help with something else?')
}

const specialistHealthBenefitIntent = (app) => {
  console.log('--> specialistHealthBenefit intent called')
  // may have to use ssml to create delay event
  app.ask('Yes, your plan covers chiropractors and other specialists with a $75 co-pay for office visits. ' +
          'Additionally co-pays for generic prescriptions are $15.\nIs there anything else I can help you with?')
  // app.ask('Is there anything else I can help you with?')
}

const incidentIntent = (app) => {
  console.log('--> incident intent called')
  const speech = new Ssml()
  speech.say('I\'m sorry to hear that, let me look into this problem')
    .break(2000)
    .say('I\'ve found that multiple users have reported a similar issue. Would you like me to submit ' +
            'a support ticket on your behalf?')
    .toString({ pretty: true })
  app.setContext('incident-support')
  app.ask(speech)
}

// const incidentIntent = (app) => {
//   console.log('--> incident intent called')
//   console.log(`${util.inspect(app)}`)
//   app.ask('I\'m sorry to hear that, let me look into this problem')
// }
//
// const incidentSupportIntent = (app) => {
//   console.log('--> incidentSupport intent called')
//   app.ask('I\'ve found that multiple users have reported a similar issue. Would you like me to submit ' +
//           'a support ticket on your behalf?')
// }

const incidentSubmitIntent = (app) => {
  console.log('--> incidentSubmit intent called')
  app.ask('Okay, I have submitted your ticket. Would you like to be notified via text message?')
}

// gonna need to do some finagling with contexts/actions to get multiple welcome intents
// Maybe make an intent with the trigger phrase "Talk to Sam"? (not sure if Google will like this...)
const incidentUpdateIntent = (app) => {
  console.log('--> incidentUpdate intent called')
  app.ask('Your ticket information has been sent to 919 586 1684')
  // this is where we send the text
}

const incidentWelcomeIntent = (app) => {
  console.log('--> incidentWelcomeintent called')
  app.ask('Nice to hear from you Devin, is your email issue resolved?')
}

const incidentFollowUpIntent = (app) => {
  console.log('--> incidentFollowUp intent called')
  app.ask('Excellent, I am closing your ticket now. Is there anything else I can do for you?')
}

const convoEndIntent = (app) => {
  console.log('--> convoEnd intent called')
  app.tell('Right on, let me know if you need anything else!')
}

const actionMap = new Map()
actionMap.set(GOOGLE_ASSISTANT_WELCOME, welcomeIntent)
actionMap.set(BENEFITS, benefitIntent)
actionMap.set(HEALTH, healthBenefitIntent)
actionMap.set(SPECIALIST, specialistHealthBenefitIntent)
actionMap.set(INCIDENT, incidentIntent)
// actionMap.set(SUPPORT, incidentSupportIntent)
actionMap.set(SUBMIT, incidentSubmitIntent)
actionMap.set(UPDATE, incidentUpdateIntent)
actionMap.set(INCIDENT_WELCOME, incidentWelcomeIntent)
actionMap.set(FOLLOWUP_INCIDENT, incidentFollowUpIntent)
actionMap.set(END, convoEndIntent)

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

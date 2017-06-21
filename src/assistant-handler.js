import util from 'util'
import Promise from 'bluebird'
import request from 'request'

// consts for intent map
const GOOGLE_ASSISTANT_WELCOME = 'input.welcome'
const BENEFITS = 'input.benefits'
const HEALTH = 'benefits.health'
const SPECIALIST = 'health.specialist'
const BENEFIT_CLOSE = 'benefits.close'
const INCIDENT = 'input.incident'
const SUPPORT = 'incident.support'
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
  // app.ask('Certainly! Would you like to know about your medical, 401k, or another benefit?')
  app.askWithCarousel(app.buildRichResponse()
    .addSimpleResponse('Certainly! Here are some commonly searched employee benefits')
    .addSuggestions(
      ['Dental', 'Life', 'Tax Forms']),
    app.buildCarousel('Employee Benefits')
    .addItems(app.buildOptionItem(HEALTH, ['Medical', 'health', 'health benefits', 'medical'])
      .setTitle('Medical')
      .setDescription('Details about your health insurance policy')
      .setImage('https://samanage-assistant-demo.herokuapp.com/images/healthcare.jpg', 'health')
    )
    .addItems(app.buildOptionItem('Time Off', ['time off', 'time-off', 'pto'])
      .setTitle('Time Off')
      .setDescription('Request time off and view information on your vacation and sick leave')
      .setImage('https://samanage-assistant-demo.herokuapp.com/images/vacation.jpeg', 'time off')
    )
    .addItems(app.buildOptionItem('Retirement', ['retirement', '401k'])
      .setTitle('Retirement')
      .setDescription('Financial planning advice and details about your 401k')
      .setImage('https://samanage-assistant-demo.herokuapp.com/images/retired.jpeg', 'retirement')
    )
  )
}

const healthBenefitIntent = (app) => {
  console.log('--> healthBenefit intent called')
  // app.ask('Ok, do you want me to find a doctor covered under your plan or would you like help with something else?')
  app.askWithList(app.buildRichResponse()
    .addSimpleResponse('Ok, do you need help finding a doctor or something else?')
    .addSuggestions(
      ['Other']),
    app.buildList('Medical Benefits')
    .addItems(app.buildOptionItem('Doctor', ['doctor'])
      .setTitle('Find a doctor')
      .setDescription('Find specialists and primary care physicians covered under your plan')
      .setImage('https://samanage-assistant-demo.herokuapp.com/images/doctoricon.jpg', 'health')
    )
    .addItems(app.buildOptionItem(SPECIALIST, ['chiropractors', 'chiropractor', 'specialist'])
      .setTitle('Co-Pays')
      .setDescription('View details on your co-pay amounts')
      .setImage('https://samanage-assistant-demo.herokuapp.com/images/copay.png', 'time off')
    )
    .addItems(app.buildOptionItem('Details', ['coverage', 'details'])
      .setTitle('Details')
      .setDescription('View a comprehensive description of your insurance policy')
      .setImage('https://samanage-assistant-demo.herokuapp.com/images/details.png', 'retirement')
    )
  )
}

const specialistHealthBenefitIntent = (app) => {
  console.log('--> specialistHealthBenefit intent called')
  app.ask('<speak xml:lang="en-US">Yes, your plan covers chiropractors and other specialists with a $75 co-pay for office visits. ' +
          'Additionally co-pays for generic prescriptions are $15.\n<break time="1s"/>Would you like me to email you this information?</speak>')
}

const benefitCloseIntent = (app) => {
  console.log('--> benefitClose intent called')
  app.ask('Is there anything else I can help you with?')
}

const incidentIntent = (app) => {
  console.log('--> incident intent called')
  app.ask('<speak xml:lang="en-US">I\'m sorry to hear that, <break time="500ms"/>let me look into this problem and I will get back to you in a minute.</speak>')
}

const incidentSupportIntent = (app) => {
  console.log('--> incidentSupport intent called')
  app.ask('<speak xml:lang="en-US"><break time="500ms"/>' +
    'I\'ve found that multiple users have reported a similar issue. Would you like me to submit a support ticket on your behalf?</speak>')
}

const incidentSubmitIntent = (app) => {
  console.log('--> incidentSubmit intent called')
  app.ask('<speak xml:lang="en-US">Okay,<break time="500ms"/> I have submitted your ticket. Would you like to be notified via text message?</speak>')
}

const incidentUpdateIntent = (app) => {
  console.log('--> incidentUpdate intent called')
  app.ask('<speak xml:lang="en-US">Your ticket information has been sent to <say-as interpret-as="telephone">919-586-1684</say-as></speak>')
  // this is where we send the text message
  const countryCode = '+1'
  const mobileNumber = '9195861684'
  const message = 'Howdy Devin! Your support ticket: S45876 has been submitted. Please visit www.servicedesk.com/S45876 for more details'
  request.post({
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Accepts': 'application/json'
    },
    url: `${process.env.BLOWERIO_URL}/messages`,
    form: {
      to: countryCode + mobileNumber,
      message: message
    }
  }, (err, response, body) => {
    if (!err && response.statusCode === 201) console.log('----> SMS Message Sent!')
    else {
      const apiResult = JSON.parse(body)
      console.log(`--! Error: ${apiResult.message}`)
    }
  })
}

const incidentWelcomeIntent = (app) => {
  console.log('--> incidentWelcomeintent called')
  app.ask('<speak xml:lang="en-US">Nice to hear from you Devin, <break time="500ms"/>is your email issue resolved?</speak>')
}

const incidentFollowUpIntent = (app) => {
  console.log('--> incidentFollowUp intent called')
  app.ask('Excellent! I am closing your ticket now. Is there anything else I can do for you?')
}

const convoEndIntent = (app) => {
  console.log('--> convoEnd intent called')
  app.tell('<speak xml:lang="en-US">Right on,<break time="500ms"/> let me know if you need anything else!</speak>')
}

const actionMap = new Map()
actionMap.set(GOOGLE_ASSISTANT_WELCOME, welcomeIntent)
actionMap.set(BENEFITS, benefitIntent)
actionMap.set(HEALTH, healthBenefitIntent)
actionMap.set(SPECIALIST, specialistHealthBenefitIntent)
actionMap.set(BENEFIT_CLOSE, benefitCloseIntent)
actionMap.set(INCIDENT, incidentIntent)
actionMap.set(SUPPORT, incidentSupportIntent)
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
  return promisedAction(app).then(() => {
    console.log('--> promisedAction fulfilled')
  })
  .catch((err) => {
    console.log(err)
  })
})

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');
const Axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()

const slackSigningSecret = process.env.slackSigningSecret;
const slackToken = process.env.slackToken;
// console.log(process.env.slackSigningSecret)
const port = 3000;

const slackEvents = createEventAdapter(slackSigningSecret);
const slackClient = new WebClient(slackToken);

console.log(process.env.API_KEY)
const API_KEY = process.env.API_KEY;
// const city_name = ''
const getWeather = async (city) => {
  try {
    let result = await Axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);
    console.log("Got the result",result.data)
    return result.data
  } catch (error) {
    console.log("EROOR",error)
  }
}

slackEvents.on('app_mention', (event) => {
  console.log(`Got message from user ${event.user}: ${event.text}`);
  (async () => {
    try {
      await slackClient.chat.postMessage({ channel: event.channel, text: `Hello <@${event.user}>! :tada:` })
      getWeather()
    } catch (error) {
      console.log(error.data)
    }
  })();
});

slackEvents.on('message', async (event)=>{
  console.log(`${event.text}`)
  const arr = event.text.split(' ')
  if(arr[0]==='get' && arr[1]==='weather'){
    try {
      const w = await getWeather(arr[2])
      await slackClient.chat.postMessage({ channel: event.channel, text: `desc:${w.weather[0].description},temp:${w.main.temp - 273}` })
    } catch (error) {
      console.log(error.data)
    }
  }
});

slackEvents.on('error', console.error);

slackEvents.start(port).then(() => {
  console.log(`Server started on port ${port}`)
});



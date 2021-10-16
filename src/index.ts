import axios from "axios";
import {CronJob} from "cron";
import config from "./config"
import Discord from "discord.js"
import type {a as WeatherInterface} from "./typings/iFUckedYOUrmOM";
import wmo from "./wmo";

const a = config.webhookLink.split("api/webhooks")[1].split("/")
a.shift();
const webhookClient = new Discord.WebhookClient({
  id: a[0],
  token: a[1]
});

const callforecast = async () => {
  // reference to this https://open-meteo.com/en/docs
  console.log("Making request")
  const {data: weather}: {data: WeatherInterface} = await axios.get("https://api.open-meteo.com/v1/forecast", {
    "params": {
      latitude: "38.7414",
      longitude: "-120.7753",
      hourly: "temperature_2m,cloudcover",
      temperature_unit: "fahrenheit",
      windspeed_unit: "mph",
      precipitation_unit: "inch",
      timeformat: "unixtime",
      timezone: "America/Los_Angeles",
      current_weather: "true"
    }
  });

  const currentWeather = weather.current_weather

  const date = new Date(currentWeather.time * 1000).toLocaleDateString();
  const time = new Date(currentWeather.time * 1000).toLocaleTimeString();
  const embed = new Discord.MessageEmbed()
    .setTitle("Good morning!")
    .setDescription(`Here is the current weather for ${config.location.name} as of ${date} - ${time}`)
    .addField("Temperature", currentWeather.temperature + "°F")
    .addField("Cloud Cover", weather.hourly.cloudcover[0] + "%")
    .addField("Wind Direction", currentWeather.winddirection + "°")
    .addField("Wind Speed", currentWeather.windspeed + " mph")
    .addField("Weather Code", wmo[currentWeather.weathercode] || "None")
    .setColor("ORANGE")
    .setFooter(`Lat: ${config.location.latitude} Long: ${config.location.longitude}`)
  await webhookClient.send({
    embeds: [embed]
  })

  console.log("Finished")

}
// callforecast();
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection: " + reason, promise)
})

process.on("uncaughtException", (reason, origin) => {
  console.error("Uncaught Exception: " + reason, origin)
})
let job = new CronJob(
  `0 ${config.hourOfTheDay} * * *`, callforecast
)

callforecast();
// job.start();
console.log("Now running.")

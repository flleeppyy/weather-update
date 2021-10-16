import axios from "axios";
import {CronJob} from "cron";
import config from "./config"
import Discord from "discord.js"
import type {a as WeatherInterface} from "./typings/iFUckedYOUrmOM";
import wmo from "./wmo";

const a = config.webhookLink.split("api/webhooks")[1].split("/"); a.shift();
const webhookClient = new Discord.WebhookClient({
  id: a[0],
  token: a[1]
});

const callforecast = async () => {  
  const h = new Date()
  const stirng = `${h.toLocaleDateString()} - ${h.toLocaleTimeString()}: Making request [ ]`
  process.stdout.write(stirng);

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

  const timeOfDay = (() => {
    const hour = new Date(currentWeather.time * 1000).getHours();
    if (hour >= 6 && hour < 12) {
      return "morning";
    } else if (hour >= 12 && hour < 18) {
      return "afternoon";
    } else if (hour >= 18 && hour < 24) {
      return "evening";
    } else {
      return "night";
    }
  })();

  const mood = (() => {
    const temp = currentWeather.temperature;   
    if (temp > 80) {
      return "pleasant";
    } else if (temp > 70) {
      return "good";
    } else if (temp > 60) {
      return "happy";
    } else if (temp > 50) {
      return "okay";
    } else if (temp > 40) {
      return "meh";
    } else if (temp > 30) {
      return "bad";
    } else if (temp > 20) {
      return "terrible";
    } else {
      return "horrible";
    }
  })();
  // capitalize the first letter of the mood
  const moodCapitalized = mood[0].toUpperCase() + mood.slice(1);
  const embed = new Discord.MessageEmbed()
    .setTitle(`${moodCapitalized} ${timeOfDay}!`) // This wont go well lmao
    .setDescription(`Here is the current weather for ${config.location.name} as of ${date} - ${time}`)
    .addField("Temperature", currentWeather.temperature + "°F")
    .addField("Cloud Cover", weather.hourly.cloudcover[0] + "%")
    .addField("Wind Direction", currentWeather.winddirection + "°")
    .addField("Wind Speed", currentWeather.windspeed + " mph")
    .addField("Weather Description", wmo[currentWeather.weathercode] || "None")
    .setColor("ORANGE")
    .setFooter(`Lat: ${config.location.latitude} Long: ${config.location.longitude}`)
  await webhookClient.send({
    embeds: [embed]
  })

  // rewrite the line and add a checkmark to the [ ]
  process.stdout.write(`\r${stirng.replace("[ ]", "[✅]")}\n`);
}
// callforecast();
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection: " + reason, promise)
})

process.on("uncaughtException", (reason, origin) => {
  console.error("Uncaught Exception: " + reason, origin)
})
if (process.env.CRON === "true") {
  let job = new CronJob(
    `0 ${config.hourOfTheDay} * * *`, callforecast
  )
  
  job.start();
  console.log("Now running.")
} else {
  callforecast();
}

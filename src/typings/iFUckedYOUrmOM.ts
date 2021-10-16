export interface a {
  utc_offset_seconds: number,
  latitude: number,
  longitude: number,
  generationtime_ms: number,
  elevation: number,
  current_weather: {
    temperature: number
    weathercode: number
    cloudcover: number
    winddirection: number
    windspeed: number
    time: number
  }
  hourly_units: {
    time: "unixtime"
    temperature_2m: "°F"
    cloudcover: "%"
  },
  hourly: {
    /**
     * The time for the corresponding spots in the hourly arrays.
     * The time at which the first element of, lets say, temperature, is the first element of the time array.
     * temperature_2m[15]; time[15]
     */
    time: number[],
    /**
     * Array of integers/decimals that consist of the temperature in your prefered temperature unit
     */
    temperature_2m: number[],
    /**
     * Array of integers 0-100 (Represented as a percentage)
     */
    cloudcover: number[]
  }
}
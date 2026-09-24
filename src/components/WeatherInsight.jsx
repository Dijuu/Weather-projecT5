import React, { useEffect, useState } from 'react'

const DEFAULT_LOCATION = { latitude: 24.8607, longitude: 67.0011 }
const TEMPERATURE_UNIT_KEY = 'weather-temperature-unit'
const THEME_KEY = 'weather-theme'

const getWeatherDetails = (weatherCode) => {
  if (weatherCode === 0) return { icon: '☀️', condition: 'Clear sky' }
  if ([1, 2].includes(weatherCode)) return { icon: '🌤️', condition: 'Partly cloudy' }
  if (weatherCode === 3) return { icon: '☁️', condition: 'Overcast' }
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return { icon: '🌦️', condition: 'Drizzle' }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return { icon: '🌧️', condition: 'Rainy' }
  if ([95, 96, 99].includes(weatherCode)) return { icon: '⛈️', condition: 'Thunderstorm' }

  return { icon: '🌡️', condition: 'Unknown' }
}

const formatForecastTime = (time) => {
  const hour = Number(time.slice(11, 13))
  const minute = time.slice(14, 16)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12

  return `${displayHour}:${minute} ${period}`
}

const getWeatherSummary = ({ condition, rainChance, temperatureCelsius }) => {
  if (condition === 'Thunderstorm') return 'Thunderstorms are expected, so stay indoors and avoid unnecessary travel.'
  if (rainChance >= 60) return 'Rain is very likely today, so carry an umbrella and plan outdoor activities carefully.'
  if (condition === 'Rainy' || condition === 'Drizzle') return 'Light rain may occur today, so keep an umbrella nearby when heading out.'
  if (temperatureCelsius >= 35) return 'It is very hot today, so stay hydrated and avoid extended time in direct sunlight.'
  if (temperatureCelsius >= 30) return 'The weather is warm today, so wear light clothes and drink plenty of water.'
  if (temperatureCelsius <= 15) return 'The weather is cool today, so wear warm layers when going outside.'
  return 'The weather is mild today, with comfortable conditions for outdoor activities.'
}

const WeatherInsight = () => {
  const [weather, setWeather] = useState(null)
  const [isCelsius, setIsCelsius] = useState(() => localStorage.getItem(TEMPERATURE_UNIT_KEY) !== 'fahrenheit')
  const [isDark, setIsDark] = useState(() => localStorage.getItem(THEME_KEY) === 'dark')
  const [temperatureGraph, setTemperatureGraph] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    const fetchInsight = async ({ latitude, longitude }) => {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: 'temperature_2m,weather_code',
        hourly: 'precipitation_probability,temperature_2m',
        forecast_days: '1',
        timezone: 'auto',
      })
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal })
      if (!response.ok) throw new Error('Unable to fetch weather insight')

      const data = await response.json()
      const currentHour = Math.max(0, data.hourly.time.findIndex((time) => time >= data.current.time))
      const graph = data.hourly.time.slice(currentHour, currentHour + 8).map((time, index) => ({
        time: formatForecastTime(time),
        temperatureCelsius: data.hourly.temperature_2m[currentHour + index],
      }))
      if (isMounted) {
        setWeather({
          temperatureCelsius: data.current.temperature_2m,
          rainChance: data.hourly.precipitation_probability[currentHour] ?? 0,
          ...getWeatherDetails(data.current.weather_code),
        })
        setTemperatureGraph(graph)
        setError('')
      }
    }

    const handleUnitChange = (event) => setIsCelsius(event.detail.isCelsius)
    const handleThemeChange = (event) => setIsDark(event.detail.isDark)
    const handleLocationChange = (event) => fetchInsight(event.detail).catch(() => {})

    window.addEventListener('temperature-unit-change', handleUnitChange)
    window.addEventListener('theme-change', handleThemeChange)
    window.addEventListener('weather-location-change', handleLocationChange)
    fetchInsight(DEFAULT_LOCATION).catch(() => {
      if (isMounted) setError('Weather insight is unavailable right now.')
    })

    return () => {
      isMounted = false
      controller.abort()
      window.removeEventListener('temperature-unit-change', handleUnitChange)
      window.removeEventListener('theme-change', handleThemeChange)
      window.removeEventListener('weather-location-change', handleLocationChange)
    }
  }, [])

  const formatTemperature = (temperatureCelsius) => {
    const temperature = isCelsius ? temperatureCelsius : (temperatureCelsius * 9) / 5 + 32
    return `${Math.round(temperature)}°${isCelsius ? 'C' : 'F'}`
  }

  const getInsight = () => {
    if (!weather) return null
    const isRainLikely = weather.rainChance >= 40
    return {
      summary: getWeatherSummary(weather),
      temperature: weather.temperatureCelsius >= 30 ? 'Warm' : weather.temperatureCelsius <= 15 ? 'Cool' : 'Mild',
      rain: isRainLikely ? 'High' : weather.rainChance >= 20 ? 'Moderate' : 'Low',
      recommendation: isRainLikely ? 'Carry an umbrella' : weather.temperatureCelsius >= 30 ? 'Light clothes' : 'Comfortable layers',
    }
  }

  const insight = getInsight()
  const graphTemperatures = temperatureGraph.map((item) => (
    isCelsius ? item.temperatureCelsius : (item.temperatureCelsius * 9) / 5 + 32
  ))
  const lowestTemperature = Math.min(...graphTemperatures)
  const highestTemperature = Math.max(...graphTemperatures)
  const temperatureRange = highestTemperature - lowestTemperature || 1

  return (
    <section id='weather-insight' className='mt-6 rounded-2xl px-3 py-15 sm:px-6 lg:px-10'>
      <div className={`mx-auto w-full max-w-7xl rounded-2xl p-6 shadow-md ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`}>
        <h2 className='text-2xl font-bold'>Weather Insight</h2>

        {error && <p className='mt-4 text-red-500'>{error}</p>}
        {weather && insight && (
          <>
            <div className={`mt-4 rounded-xl p-4 ${isDark ? 'bg-slate-700' : 'bg-cyan-50'}`}>
              <p className='text-lg font-semibold'>{weather.icon} Today&apos;s Weather</p>
              <p className={`mt-2 leading-6 ${isDark ? 'text-white' : 'text-slate-600'}`}>
                {insight.summary} The current temperature is {formatTemperature(weather.temperatureCelsius)} with {weather.condition.toLowerCase()} conditions.
              </p>
            </div>

            <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-500'}`}>🌡️ Temperature</p>
                <p className='mt-1 font-semibold'>{insight.temperature}</p>
              </div>
              <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-500'}`}>🌧️ Rain Chance</p>
                <p className='mt-1 font-semibold'>{insight.rain} ({weather.rainChance}%)</p>
              </div>
              <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-500'}`}>👕 Recommendation</p>
                <p className='mt-1 font-semibold'>{insight.recommendation}</p>
              </div>
            </div>

            {temperatureGraph.length > 0 && (
              <div className={`mt-6 rounded-xl p-4 ${isDark ? 'bg-slate-700' : 'bg-cyan-50'}`}>
                <div className='mb-5 flex items-center justify-between'>
                  <h3 className='text-lg font-semibold'>Temperature trend</h3>
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-500'}`}>Next 8 hours</span>
                </div>
                <div className='flex h-56 items-end gap-2 overflow-x-auto pb-7 sm:gap-4'>
                  {temperatureGraph.map((item, index) => {
                    const temperature = graphTemperatures[index]
                    const height = `${Math.max(15, ((temperature - lowestTemperature) / temperatureRange) * 75 + 25)}%`

                    return (
                      <div key={item.time} className='flex h-full min-w-12 flex-1 flex-col items-center justify-end gap-2'>
                        <span className='text-xs font-semibold'>{formatTemperature(item.temperatureCelsius)}</span>
                        <div className='flex h-36 w-full items-end'>
                          <div
                            className='w-full rounded-t-lg bg-cyan-600 transition-all duration-500'
                            style={{ height }}
                            title={`${item.time}: ${formatTemperature(item.temperatureCelsius)}`}
                          />
                        </div>
                        <span className={`text-xs ${isDark ? 'text-white' : 'text-slate-500'}`}>{item.time}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default WeatherInsight
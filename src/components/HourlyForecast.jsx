import React, { useEffect, useState } from 'react'

const DEFAULT_LOCATION = {
  latitude: 24.8607,
  longitude: 67.0011,
}
const FORECAST_CACHE_KEY = 'weather-hourly-forecast-v2'
const TEMPERATURE_UNIT_KEY = 'weather-temperature-unit'
const THEME_KEY = 'weather-theme'

const getWeatherDetails = (weatherCode) => {
  if (weatherCode === 0) return { icon: '☀️', condition: 'Clear sky' }
  if ([1, 2].includes(weatherCode)) return { icon: '🌤️', condition: 'Partly cloudy' }
  if (weatherCode === 3) return { icon: '☁️', condition: 'Overcast' }
  if ([45, 48].includes(weatherCode)) return { icon: '🌫️', condition: 'Foggy' }
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return { icon: '🌦️', condition: 'Drizzle' }
  if ([61, 63, 65, 66, 67].includes(weatherCode)) return { icon: '🌧️', condition: 'Rainy' }
  if ([71, 73, 75, 77].includes(weatherCode)) return { icon: '🌨️', condition: 'Snowy' }
  if ([80, 81, 82].includes(weatherCode)) return { icon: '🌦️', condition: 'Rain showers' }
  if ([95, 96, 99].includes(weatherCode)) return { icon: '⛈️', condition: 'Thunderstorm' }

  return { icon: '🌡️', condition: 'Unknown' }
}

const HourlyForecast = () => {
  const [hourlyForecast, setHourlyForecast] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCelsius, setIsCelsius] = useState(() => localStorage.getItem(TEMPERATURE_UNIT_KEY) !== 'fahrenheit')
  const [isDark, setIsDark] = useState(() => localStorage.getItem(THEME_KEY) === 'dark')

  useEffect(() => {
    let isMounted = true
    const controllers = new Set()
    const handleUnitChange = (event) => setIsCelsius(event.detail.isCelsius)
    const handleLocationChange = (event) => fetchForecast(event.detail).catch(() => {})
    const handleThemeChange = (event) => setIsDark(event.detail.isDark)

    window.addEventListener('temperature-unit-change', handleUnitChange)
    window.addEventListener('weather-location-change', handleLocationChange)
    window.addEventListener('theme-change', handleThemeChange)

    const fetchForecast = async ({ latitude, longitude }) => {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        hourly: 'temperature_2m,weather_code,precipitation_probability',
        forecast_days: '1',
        timezone: 'auto',
      })

      const controller = new AbortController()
      controllers.add(controller)
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Unable to fetch weather data')

        const data = await response.json()
        const currentHour = new Date().getHours()
        const startIndex = Math.min(currentHour, data.hourly.time.length - 3)
        const forecast = data.hourly.time.slice(startIndex, startIndex + 3).map((time, index) => {
          const dataIndex = startIndex + index
          const details = getWeatherDetails(data.hourly.weather_code[dataIndex])

          return {
            time: new Date(time).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }),
            temperatureCelsius: data.hourly.temperature_2m[dataIndex],
            rainChance: `${data.hourly.precipitation_probability[dataIndex] ?? 0}%`,
            ...details,
          }
        })

        if (isMounted) {
          setHourlyForecast(forecast)
          localStorage.setItem(FORECAST_CACHE_KEY, JSON.stringify(forecast))
          setError('')
          setIsLoading(false)
        }
      } finally {
        clearTimeout(timeoutId)
        controllers.delete(controller)
      }
    }

    const loadForecast = () => {
      const cachedForecast = localStorage.getItem(FORECAST_CACHE_KEY)

      if (cachedForecast) {
        try {
          setHourlyForecast(JSON.parse(cachedForecast))
          setIsLoading(false)
        } catch {
          localStorage.removeItem(FORECAST_CACHE_KEY)
        }
      }

      fetchForecast(DEFAULT_LOCATION).catch(() => {
        if (isMounted && !cachedForecast) {
          setError('Weather data is unavailable right now.')
          setIsLoading(false)
        }
      })

    }

    loadForecast()

    return () => {
      isMounted = false
      window.removeEventListener('temperature-unit-change', handleUnitChange)
      window.removeEventListener('weather-location-change', handleLocationChange)
      window.removeEventListener('theme-change', handleThemeChange)
      controllers.forEach((controller) => controller.abort())
    }
  }, [])

  const formatTemperature = (temperatureCelsius) => {
    const temperature = isCelsius
      ? temperatureCelsius
      : (temperatureCelsius * 9) / 5 + 32

    return `${Math.round(temperature)}°${isCelsius ? 'C' : 'F'}`
  }

  return (
    <section className='px-3 py-15 sm:px-6 lg:px-10'>
      <div className='mx-auto w-full max-w-7xl'>
        <div className='mb-5 flex items-center justify-between'>
          <div>
            <p className={`text-lg font-semibold uppercase tracking-wide ${isDark ? 'text-white' : 'text-cyan-700'}`}>Today</p>
            <h2 className={`text-2xl font-bold sm:text-3xl ${isDark ? 'text-white' : 'text-slate-800'}`}>Hourly Forecast</h2>
          </div>
          <span className={`text-lg ${isDark ? 'text-white' : 'text-slate-500'}`}>Live data · Next 3 hours</span>
        </div>

        {error && <p className='text-red-600'>{error}</p>}

        {!isLoading && !error && <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          {hourlyForecast.map((forecast) => (
            <article
              key={forecast.time}
              className={`min-h-52 rounded-2xl border p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-cyan-100 bg-white text-slate-800'}`}
            >
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-500'}`}>{forecast.time}</p>
              <div className='my-4 flex items-center justify-between'>
                <span className='text-5xl' role='img' aria-label={forecast.condition}>
                  {forecast.icon}
                </span>
                <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-cyan-900'}`}>{formatTemperature(forecast.temperatureCelsius)}</p>
              </div>
              <p className={`text-xl font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{forecast.condition}</p>
              <p className={`mt-3 text-base ${isDark ? 'text-white' : 'text-slate-500'}`}>Rain chance: {forecast.rainChance}</p>
            </article>
          ))}
        </div>}
      </div>
    </section>
  )
}

export default HourlyForecast
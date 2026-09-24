import React, { useEffect, useState } from 'react'

const DEFAULT_LOCATION = {
  latitude: 24.8607,
  longitude: 67.0011,
}
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

const WeeklyForecast = () => {
  const [weeklyForecast, setWeeklyForecast] = useState([])
  const [isCelsius, setIsCelsius] = useState(() => localStorage.getItem(TEMPERATURE_UNIT_KEY) !== 'fahrenheit')
  const [isDark, setIsDark] = useState(() => localStorage.getItem(THEME_KEY) === 'dark')
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    const handleUnitChange = (event) => setIsCelsius(event.detail.isCelsius)
    const handleThemeChange = (event) => setIsDark(event.detail.isDark)
    const handleLocationChange = (event) => fetchForecast(event.detail).catch(() => {})

    window.addEventListener('temperature-unit-change', handleUnitChange)
    window.addEventListener('theme-change', handleThemeChange)
    window.addEventListener('weather-location-change', handleLocationChange)

    const fetchForecast = async ({ latitude, longitude }) => {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        forecast_days: '7',
        timezone: 'auto',
      })

      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
        signal: controller.signal,
      })
      if (!response.ok) throw new Error('Unable to fetch weekly weather data')

      const data = await response.json()
      const forecast = data.daily.time.map((date, index) => ({
        day: new Date(`${date}T12:00:00`).toLocaleDateString([], { weekday: 'long' }),
        maxTemperatureCelsius: data.daily.temperature_2m_max[index],
        minTemperatureCelsius: data.daily.temperature_2m_min[index],
        rain: data.daily.precipitation_probability_max[index] ?? 0,
        ...getWeatherDetails(data.daily.weather_code[index]),
      }))

      if (isMounted) {
        setWeeklyForecast(forecast)
        setError('')
      }
    }

    fetchForecast(DEFAULT_LOCATION).catch(() => {
      if (isMounted) setError('Weekly weather data is unavailable right now.')
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
    const temperature = isCelsius
      ? temperatureCelsius
      : (temperatureCelsius * 9) / 5 + 32

    return `${Math.round(temperature)}°${isCelsius ? 'C' : 'F'}`
  }

  return (
    <section className='px-3 py-15 sm:px-6 lg:px-10'>
      <div className='mx-auto w-full max-w-7xl'>
        <h2 className={`mb-4 text-2xl font-bold sm:text-3xl ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Weekly Forecast
        </h2>

        {error && <p className='text-red-600'>{error}</p>}

        {!error && weeklyForecast.length > 0 && (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7'>
            {weeklyForecast.map((weather) => (
              <article
                key={weather.day}
                className={`rounded-2xl p-4 text-center shadow-md ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`}
              >
                <h3 className='text-lg font-semibold'>{weather.day}</h3>
                <p className='my-4 text-4xl' role='img' aria-label={weather.condition}>{weather.icon}</p>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-500'}`}>{weather.condition}</p>
                <div className='mt-3 flex justify-center gap-3 text-sm'>
                  <span className='font-bold'>High {formatTemperature(weather.maxTemperatureCelsius)}</span>
                  <span className={isDark ? 'text-slate-300' : 'text-slate-400'}>Low {formatTemperature(weather.minTemperatureCelsius)}</span>
                </div>
                <p className={`mt-3 text-sm ${isDark ? 'text-white' : 'text-cyan-600'}`}>🌧️ {weather.rain}%</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default WeeklyForecast
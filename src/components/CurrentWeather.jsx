import React, { useEffect, useState } from 'react'

const DEFAULT_LOCATION = {
  latitude: 33.6844,
  longitude: 73.0479,
  name: 'Islamabad, Pakistan',
}
const TEMPERATURE_UNIT_KEY = 'weather-temperature-unit'

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

const CurrentWeather = () => {
  const [weather, setWeather] = useState(null)
  const [isCelsius, setIsCelsius] = useState(() => localStorage.getItem(TEMPERATURE_UNIT_KEY) !== 'fahrenheit')
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    const handleUnitChange = (event) => setIsCelsius(event.detail.isCelsius)
    const handleThemeChange = (event) => setIsDark(event.detail.isDark)

    window.addEventListener('temperature-unit-change', handleUnitChange)
    window.addEventListener('theme-change', handleThemeChange)

    const fetchWeather = async ({ latitude, longitude, name }) => {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
        hourly: 'precipitation_probability',
        forecast_days: '1',
        timezone: 'auto',
      })
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
        signal: controller.signal,
      })
      if (!response.ok) throw new Error('Unable to fetch current weather')

      const data = await response.json()
      const currentHour = new Date().getHours()
      const details = getWeatherDetails(data.current.weather_code)
      let locationName = name

      if (!locationName) {
        try {
          const locationResponse = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            { signal: controller.signal },
          )
          const locationData = await locationResponse.json()
          const city = locationData.city || locationData.locality || locationData.principalSubdivision
          locationName = [city, locationData.countryName].filter(Boolean).join(', ')
        } catch {
          locationName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
        }
      }

      if (isMounted) {
        setWeather({
          location: locationName || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
          temperatureCelsius: data.current.temperature_2m,
          feelsLikeCelsius: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          rainChance: data.hourly.precipitation_probability[currentHour] ?? 0,
          ...details,
        })
        setError('')
      }
    }

    const handleLocationChange = (event) => {
      fetchWeather(event.detail).catch(() => {
        if (isMounted) setError('Current weather is unavailable right now.')
      })
    }

    window.addEventListener('weather-location-change', handleLocationChange)

    const loadWeather = () => {
      fetchWeather(DEFAULT_LOCATION).catch(() => {
        if (isMounted) setError('Current weather is unavailable right now.')
      })

    }

    loadWeather()

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

  return (
    <section className='px-3 py-15 sm:px-6 lg:px-10'>
      <div className='mx-auto w-full max-w-7xl'>
        {error && <p className='text-red-600'>{error}</p>}
        {weather && (
          <div className={`rounded-2xl p-6 shadow-md ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`}>
            <div className='mb-4'>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>📍 {weather.location}</p>
            </div>

            <div className='text-center'>
              <p className='text-6xl' role='img' aria-label={weather.condition}>{weather.icon}</p>
              <h1 className={`mt-3 text-5xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatTemperature(weather.temperatureCelsius)}</h1>
              <p className={`mt-2 text-xl ${isDark ? 'text-white' : 'text-slate-600'}`}>{weather.condition}</p>
            </div>

            <div className='mt-6 grid grid-cols-2 gap-4'>
              <div className={`rounded-xl p-4 text-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-500'}`}>Humidity</p>
                <p className='mt-1 text-lg font-semibold'>{weather.humidity}%</p>
              </div>
              <div className={`rounded-xl p-4 text-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-500'}`}>Wind</p>
                <p className='mt-1 text-lg font-semibold'>{Math.round(weather.windSpeed)} km/h</p>
              </div>
              <div className={`rounded-xl p-4 text-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-500'}`}>Rain</p>
                <p className='mt-1 text-lg font-semibold'>{weather.rainChance}%</p>
              </div>
              <div className={`rounded-xl p-4 text-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-500'}`}>Condition</p>
                <p className='mt-1 text-lg font-semibold'>{weather.condition}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default CurrentWeather
import React from 'react'
import { Link } from 'react-router-dom'
import Sky from '../assets/SkyCastlogo.png'
import { useState, useEffect } from 'react'

const TEMPERATURE_UNIT_KEY = 'weather-temperature-unit'
const THEME_KEY = 'weather-theme'

const Nav = () => {

  const [menuOpen, setMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => localStorage.getItem(THEME_KEY) === 'dark')
  const [isCelsius, setIsCelsius] = useState(() => localStorage.getItem(TEMPERATURE_UNIT_KEY) !== 'fahrenheit')

  const toggleTheme =() => {
    setIsDark((current) => {
      const nextIsDark = !current
      localStorage.setItem(THEME_KEY, nextIsDark ? 'dark' : 'light')
      window.dispatchEvent(new CustomEvent('theme-change', {
        detail: { isDark: nextIsDark },
      }))
      return nextIsDark
    })
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const requestCurrentLocation = () => {
    window.dispatchEvent(new Event('request-current-location'))
    closeMenu()
  }

  const scrollToForecast = (event) => {
    event.preventDefault()
    document.getElementById('weather-insight')?.scrollIntoView({ behavior: 'smooth' })
    closeMenu()
  }

  const handleTemperatureUnitChange = () => {
    setIsCelsius((current) => {
      const nextIsCelsius = !current
      localStorage.setItem(TEMPERATURE_UNIT_KEY, nextIsCelsius ? 'celsius' : 'fahrenheit')
      window.dispatchEvent(new CustomEvent('temperature-unit-change', {
        detail: { isCelsius: nextIsCelsius },
      }))
      return nextIsCelsius
    })
  }

  useEffect(() => {
    document.body.style.backgroundColor = isDark ? '#15171a' : '#f8fafc'
    document.body.style.color = isDark ? '#f8fafc' : '#15171a'
  }, [isDark])


  return (
  <div className={`relative min-h-20 ${isDark ? 'bg-cyan-900' : 'bg-slate-50'}`}>
  
  <nav className="flex h-15 items-center justify-between px-4 py-2 bg-cyan-900 text-white">
        <Link to='/' className='flex items-center gap-2' onClick={closeMenu}>
          <img src={Sky} alt='Weather Dashboard logo' className='h-16 w-16 object-cover' />
          <h2 className='text-xl text-white font-bold sm:text-3xl'>Weather Dashboard</h2>
        </Link>

        <div className='hidden items-center text-white gap-6 md:flex'>
          <Link className='group relative py-2 text-sm after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-amber-500 after:transition-transform after:duration-200 hover:after:scale-x-100' to='/'>Home</Link>
          <a className='group relative py-2 text-sm after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-amber-500 after:transition-transform after:duration-200 hover:after:scale-x-100' href='#weather-insight' onClick={scrollToForecast}>Forecast</a>
          <Link className='group relative py-2 text-sm after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-amber-500 after:transition-transform after:duration-200 hover:after:scale-x-100' to='/about'>About</Link>
          <Link className='rounded-3xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600' to='/login'>Login</Link>



          <div className='flex items-center gap-4'>
            <button type='button' className='text-2xl hover:text-amber-300' onClick={toggleTheme} aria-label='Toggle dark mode' title='Toggle dark mode'>
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              type='button'
              className='text-2xl font-semibold hover:text-amber-300'
              onClick={handleTemperatureUnitChange}
              aria-label='Change temperature unit'
              title='Change temperature unit'
            >
              {isCelsius ? '°C' : '°F'}
            </button>
            <button type='button' className='text-2xl hover:text-amber-300' onClick={requestCurrentLocation} aria-label='Use current location' title='Use current location'>
              📍
            </button>
          </div>
        </div>

        <button
          type='button'
          className={`rounded-md p-2 text-2xl hover:bg-cyan-900 md:hidden ${isDark ? 'bg-black' : ''}`}
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          title='Navigation menu'
        >
          ☰
        </button>
      </nav>

      {menuOpen && (
        <div className={`absolute right-4 top-20 z-10 w-64 rounded-lg p-4 text-white shadow-xl md:hidden ${isDark ? 'bg-cyan-900' : 'bg-cyan-900'}`}>
          <div className='flex flex-col gap-4'>
            <Link className='group relative w-fit py-1 text-lg after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-amber-500 after:transition-transform after:duration-200 hover:after:scale-x-100' to='/' onClick={closeMenu}>Home</Link>
            <a className='group relative w-fit py-1 text-lg after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-amber-500 after:transition-transform after:duration-200 hover:after:scale-x-100' href='#weather-insight' onClick={scrollToForecast}>Forecast</a>
            <Link className='group relative w-fit py-1 text-lg after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-amber-500 after:transition-transform after:duration-200 hover:after:scale-x-100' to='/about' onClick={closeMenu}>About</Link>
            <Link className='w-fit rounded-full bg-amber-400 px-5 py-2 text-lg font-semibold text-cyan-950 hover:bg-amber-300' to='/login' onClick={closeMenu}>Login</Link>

            <div className='flex items-center gap-4 border-t border-cyan-700 pt-4'>
              <button type='button' className='text-xl hover:text-amber-300' onClick={toggleTheme} aria-label='Toggle dark mode' title='Toggle dark mode'>
                {isDark ? '☀️' : '🌙'}
              </button>
              <button
                type='button'
                className='text-sm font-semibold hover:text-amber-300'
                onClick={handleTemperatureUnitChange}
                aria-label='Change temperature unit'
                title='Change temperature unit'
              >
                {isCelsius ? '°C' : '°F'}
              </button>
              <button type='button' className='text-xl hover:text-amber-300' onClick={requestCurrentLocation} aria-label='Use current location' title='Use current location'>
                📍
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default Nav
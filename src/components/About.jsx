import React, { useEffect, useState } from 'react'

const THEME_KEY = 'weather-theme'

const About = () => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem(THEME_KEY) === 'dark')

  useEffect(() => {
    const handleThemeChange = (event) => setIsDark(event.detail.isDark)
    window.addEventListener('theme-change', handleThemeChange)

    return () => window.removeEventListener('theme-change', handleThemeChange)
  }, [])

  const cardClass = isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'
  const mutedTextClass = isDark ? 'text-white' : 'text-slate-600'

  return (
    <main id='about' className={`px-3 py-10 sm:px-6 lg:px-10 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className='mx-auto max-w-4xl'>
        <div className='text-center'>
          <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            About Weather Dashboard
          </h1>
          <p className={`mt-3 ${mutedTextClass}`}>
            A simple and modern weather dashboard to check weather conditions for different cities.
          </p>
        </div>

        <section className={`mt-8 rounded-2xl p-6 shadow-md ${cardClass}`}>
          <h2 className='text-2xl font-bold'>🌤️ About This Project</h2>
          <p className={`mt-3 leading-7 ${mutedTextClass}`}>
            Weather Dashboard is a React-based weather application that allows users to search for any city and view current weather, hourly forecasts, weekly forecasts, and useful weather insights.
          </p>
        </section>

        <section className={`mt-6 rounded-2xl p-6 shadow-md ${cardClass}`}>
          <h2 className='text-2xl font-bold'>✨ Features</h2>
          <ul className={`mt-4 space-y-3 ${mutedTextClass}`}>
            <li>📍 Search weather by city</li>
            <li>🌡️ View current temperature</li>
            <li>⏰ Check hourly forecast</li>
            <li>📅 View weekly forecast</li>
            <li>🌧️ Check rain probability</li>
            <li>💨 View wind and humidity</li>
            <li>📊 Weather insights and graphs</li>
            <li>🌙 Dark mode support</li>
          </ul>
        </section>

        <section className={`mt-6 rounded-2xl p-6 shadow-md ${cardClass}`}>
          <h2 className='text-2xl font-bold'>🛠️ Technologies Used</h2>
          <div className='mt-4 flex flex-wrap gap-3'>
            {['React', 'JavaScript', 'Tailwind CSS', 'Open-Meteo API'].map((technology) => (
              <span key={technology} className={`rounded-lg px-4 py-2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                {technology}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default About
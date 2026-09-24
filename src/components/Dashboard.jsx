import React from 'react'
import Nav from './Nav'
import HourlyForecast from './HourlyForecast'
import WeeklyForecast from './WeeklyForecast'
import CurrentWeather from './CurrentWeather'
import SearchBar from './SearchBar'
import Location from './Location'
import WeatherInsight from './WeatherInsight'

const Dashboard = () => {
  return (
    <div>
      <Nav />
      <Location />
      <SearchBar />
      <CurrentWeather/>
      <HourlyForecast/>
      <WeeklyForecast/>
      <WeatherInsight/>
    </div>
  )
}

export default Dashboard
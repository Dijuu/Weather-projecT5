import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import About from './components/About'
import Nav from './components/Nav'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Dashboard />} />
      <Route path='/about' element={<><Nav /><About /></>} />
    </Routes>
  )
}

export default App
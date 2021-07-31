import React, { useState } from 'react'
import './App.css'
import RtCanvas from './Canvas'

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <p>RayB Tracer</p>
        <RtCanvas></RtCanvas>
      </header>
    </div>
  )
}

export default App

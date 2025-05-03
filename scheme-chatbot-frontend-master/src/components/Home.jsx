import React from 'react'
import Hero from './Hero'
import MiscelleanousData from './MiscelleanousData'
import Project from './Project'
import Usp from './Usp'
import Advertisement from './Advertisement'
import Footer from './Footer'

const Home = () => {
  return (
    <div className="bg-white">
    <div className="hero">
      <Hero/>
      <MiscelleanousData/>
      <Usp/>
      <Project/>
      <Advertisement/>
    </div>
    <div className="px-5 xl:px-20 mt-6">
        <Footer/>
    </div>
  </div>
  )
}

export default Home
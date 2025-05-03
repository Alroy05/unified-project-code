import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatBot from './components/ChatBot';
import Navbar from './components/Navbar';
import Home from './components/Home';

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scheme-bot" element={<ChatBot />} />
          <Route path="/constituition-bot" element={<></>} />
          <Route path="/learn" element={<></>} />
          <Route path="/create" element={<></>} />
          <Route path="/login" element={<></>} />
          <Route path="/signup" element={<></>} />
        </Routes>
      </div>
      
    </Router>
  );
};

export default App;

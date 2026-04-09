import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Lessons from './pages/Lessons';
import Navbar from './components/Layout/Navbar';
import { MainDashboard } from './components/Layout/MainDashboard';
import './index.css';

function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/ate' && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/ate" element={<MainDashboard />} />
      </Routes>
    </>
  );
}

export default App;

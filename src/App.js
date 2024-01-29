import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import 'react-toastify/dist/ReactToastify.min.css';
import Plan from './pages/plan';
import Signup from './pages/signup';
import Login from './pages/login';
import Home from './pages/home';
import { ToastContainer } from 'react-toastify';
import ExchangeToken from './components/exchange_token';

const App = () => {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/exchange_token/*" element={<ExchangeToken />} />
      </Routes>
    </Router>
    <ToastContainer 
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
    </>
    
  );
}

export default App;

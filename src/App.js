import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import NotFound from './pages/NotFound';
import './styles/main.css';

function App() {
  return React.createElement(
    Router,
    null,
    React.createElement(
      Routes,
      null,
      React.createElement(Route, { path: '/', element: React.createElement(AuthPage) }),
      React.createElement(Route, { path: '/auth', element: React.createElement(AuthPage) }),
      React.createElement(Route, { path: '/home', element: React.createElement(Home) }),
      React.createElement(Route, { path: '*', element: React.createElement(NotFound) })
    )
  );
}

export default App;
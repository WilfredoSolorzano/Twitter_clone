// App.js - 
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppContent from './pages/AppContent';
import './index.css';

function App() {
  // Logs para debug 
  console.log('=== X Clone App Iniciado ===');
  console.log('Ambiente:', process.env.NODE_ENV);
  console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);
  console.log('================================');
  
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
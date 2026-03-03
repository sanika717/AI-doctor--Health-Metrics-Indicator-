import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import HomePage from './pages/HomePage';
import ScanPage from './pages/ScanPage';
import DoctorPage from './pages/DoctorPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <LangProvider>
        <Router>
          <div className="min-h-screen mesh-bg grid-pattern">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/doctors" element={<DoctorPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </LangProvider>
    </AuthProvider>
  );
}

export default App;

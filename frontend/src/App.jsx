import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import DetectionPage from './pages/DetectionPage';
import HistoryPage from './pages/HistoryPage';
import ChatPage from './pages/ChatPage';
import { HistoryProvider } from './context/HistoryContext';
import { SettingsProvider } from './context/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <HistoryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="detect" element={<DetectionPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </HistoryProvider>
    </SettingsProvider>
  );
}


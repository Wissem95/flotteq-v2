import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPortalPage from './pages/LoginPortalPage';
import RegisterPortalPage from './pages/RegisterPortalPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPortalPage />} />
        <Route path="/register" element={<RegisterPortalPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

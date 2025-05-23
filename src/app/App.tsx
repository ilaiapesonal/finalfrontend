import React, { useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import useAuthStore from '@common/store/authStore';
import SigninApp from '@features/signin/pages/App';
import DashboardApp from '@features/dashboard/pages/App';
import ResetPassword from '@features/signin/components/resetpassword';

const App: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const isPasswordResetRequired = useAuthStore((state) => state.isPasswordResetRequired);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else if (isPasswordResetRequired) {
      navigate('/reset-password');
    } else {
      navigate('/dashboard');
    }
  }, [token, isPasswordResetRequired, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<SigninApp />} />
      <Route path="/dashboard" element={<DashboardApp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Redirect any unknown routes to login */}
      <Route path="*" element={<SigninApp />} />
    </Routes>
  );
};

export default App;

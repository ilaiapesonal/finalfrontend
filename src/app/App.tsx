import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import SigninApp from './signin/App';
import DashboardApp from './dashboard/App';

const App: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  return token ? <DashboardApp /> : <SigninApp />;
};

export default App;

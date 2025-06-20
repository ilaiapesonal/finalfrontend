import React, { useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation, useOutletContext } from 'react-router-dom';
import useAuthStore from '@common/store/authStore';
import SigninApp from '@features/signin/pages/App';
import DashboardApp from '@features/dashboard/pages/App';
import ResetPassword from '@features/signin/components/resetpassword';
import ProjectsList from '@features/project/components/ProjectsList';
import AdminCreation from '@features/admin/components/AdminCreation';
import UserList from '@features/user/components/UserList';
import { default as UserDetail } from '@features/user/components/userdetail';
import CompanyDetailsForm from '@features/companydetails/companydetails';
import ErrorBoundary from './ErrorBoundary';
import type { UserData } from '@features/user/types'; // Import UserData

// Wrapper component to pass Outlet context to UserDetail
const ProfileWrapper: React.FC = () => {
  const { userToApprove, onApprovalSuccess } = useOutletContext<{
    userToApprove?: UserData | null; // Changed any to UserData
    onApprovalSuccess?: (approvedUserId: number) => void;
  }>();
  // The props for UserDetail will be updated based on its own definition in a later step.
  // For now, this ensures App.tsx is typed.
  return <UserDetail userToApprove={userToApprove} onApprovalSuccess={onApprovalSuccess} />;
};

const App: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const isPasswordResetRequired = useAuthStore((state) => state.isPasswordResetRequired);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token && location.pathname !== '/login') {
      navigate('/login');
    } else if (isPasswordResetRequired && location.pathname !== '/reset-password') {
      navigate('/reset-password');
    } else if (token && !isPasswordResetRequired && !location.pathname.startsWith('/dashboard')) {
      navigate('/dashboard');
    }
  }, [token, isPasswordResetRequired, navigate, location.pathname]);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<SigninApp />} />
        <Route path="/dashboard" element={<DashboardApp />}>
          <Route index element={<div>Overview</div>} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="adminusers" element={<AdminCreation />} />
          <Route path="users" element={<UserList />} />
          <Route path="profile" element={<ProfileWrapper />} />
          <Route path="settings" element={<CompanyDetailsForm />} />
        </Route>
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<SigninApp />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;

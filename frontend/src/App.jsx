import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard   from './pages/Dashboard';
import Contacts    from './pages/contacts/Contacts';
import ContactDetail from './pages/contacts/ContactDetail';
import Leads       from './pages/leads/Leads';
import LeadDetail  from './pages/leads/LeadDetail';
import Deals       from './pages/deals/Deals';
import DealDetail  from './pages/deals/DealDetail';
import Tasks       from './pages/tasks/Tasks';
import Emails      from './pages/emails/Emails';
import Reports     from './pages/reports/Reports';
import Users       from './pages/Users';
import Profile     from './pages/Profile';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', fontSize: '14px' } }} />
        <Routes>
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="contacts"     element={<Contacts />} />
            <Route path="contacts/:id" element={<ContactDetail />} />
            <Route path="leads"        element={<Leads />} />
            <Route path="leads/:id"    element={<LeadDetail />} />
            <Route path="deals"        element={<Deals />} />
            <Route path="deals/:id"    element={<DealDetail />} />
            <Route path="tasks"        element={<Tasks />} />
            <Route path="emails"       element={<Emails />} />
            <Route path="reports"      element={<Reports />} />
            <Route path="users"        element={<PrivateRoute roles={['admin']}><Users /></PrivateRoute>} />
            <Route path="profile"      element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Cars from './pages/Cars';
import ParkingSlots from './pages/ParkingSlots';
import ParkingRecords from './pages/ParkingRecords';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import Settings from './pages/Settings';
import Users from './pages/Users';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="cars" element={<Cars />} />
          <Route path="parking-slots" element={<ParkingSlots />} />
          <Route path="operations" element={<ParkingRecords />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

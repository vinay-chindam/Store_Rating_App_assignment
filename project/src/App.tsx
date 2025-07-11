import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import SignUpForm from './components/Auth/SignUpForm';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import UserDashboard from './components/Dashboard/UserDashboard';
import StoreOwnerDashboard from './components/Dashboard/StoreOwnerDashboard';
import StoreList from './components/Stores/StoreList';
import ProfileSettings from './components/Profile/ProfileSettings';

function App() {
  const { user, loading } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading application...</p>
        <p className="text-sm text-gray-500 mt-2">If this takes too long, check your database connection</p>
      </div>
    );
  }

  if (!user) {
    return showSignUp ? (
      <SignUpForm onToggleForm={() => setShowSignUp(false)} />
    ) : (
      <LoginForm onToggleForm={() => setShowSignUp(true)} />
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        if (user.role === 'admin') {
          return <AdminDashboard />;
        } else if (user.role === 'store_owner') {
          return <StoreOwnerDashboard />;
        } else {
          return <UserDashboard />;
        }
      case 'stores':
        return <StoreList />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return <div className="p-6">Content for {currentView} coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
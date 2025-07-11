import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Users, 
  Store, 
  Star, 
  Settings,
  BarChart3
} from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user } = useAuth();

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'profile', label: 'Profile', icon: Settings },
    ];

    if (user.role === 'admin') {
      return [
        ...baseItems,
        { id: 'users', label: 'Users', icon: Users },
        { id: 'stores', label: 'Stores', icon: Store },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ];
    }

    if (user.role === 'user') {
      return [
        ...baseItems,
        { id: 'stores', label: 'Stores', icon: Store },
        { id: 'ratings', label: 'My Ratings', icon: Star },
      ];
    }

    if (user.role === 'store_owner') {
      return [
        ...baseItems,
        { id: 'store', label: 'My Store', icon: Store },
        { id: 'ratings', label: 'Store Ratings', icon: Star },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-gray-50 border-r border-gray-200 w-64 min-h-screen p-4">
      <div className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                currentView === item.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DashboardStats } from '../../types';
import { Users, Store, Star, TrendingUp } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersResponse, storesResponse, ratingsResponse] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('stores').select('id', { count: 'exact' }),
        supabase.from('ratings').select('id', { count: 'exact' })
      ]);

      setStats({
        total_users: usersResponse.count || 0,
        total_stores: storesResponse.count || 0,
        total_ratings: ratingsResponse.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Stores',
      value: stats?.total_stores || 0,
      icon: Store,
      color: 'bg-green-500',
    },
    {
      title: 'Total Ratings',
      value: stats?.total_ratings || 0,
      icon: Star,
      color: 'bg-yellow-500',
    },
    {
      title: 'Average Rating',
      value: stats?.total_ratings ? (stats.total_ratings / stats.total_stores).toFixed(1) : '0.0',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of platform statistics and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900">User Management</h3>
            <p className="text-sm text-gray-600 mt-1">
              Add, edit, and manage user accounts and roles
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900">Store Management</h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage store listings and owner assignments
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900">Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">
              View detailed analytics and reports
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
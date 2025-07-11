import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Store, Star, Users, TrendingUp } from 'lucide-react';

const StoreOwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    recentRatings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreData();
  }, [user]);

  const fetchStoreData = async () => {
    if (!user) return;

    try {
      // Get store owned by current user
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (storeError) {
        console.error('Error fetching store:', storeError);
        return;
      }

      setStore(storeData);

      // Get ratings for this store
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select(`
          *,
          users:user_id (
            id,
            name,
            email
          )
        `)
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (ratingsError) {
        console.error('Error fetching ratings:', ratingsError);
        return;
      }

      setRatings(ratingsData || []);

      // Calculate stats
      const totalRatings = ratingsData?.length || 0;
      const averageRating = totalRatings > 0 
        ? ratingsData.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings
        : 0;
      
      const recentRatings = ratingsData?.filter(rating => {
        const ratingDate = new Date(rating.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return ratingDate > weekAgo;
      }).length || 0;

      setStats({
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings,
        recentRatings,
      });
    } catch (error) {
      console.error('Error fetching store data:', error);
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

  if (!store) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800">No Store Assigned</h2>
          <p className="text-yellow-700 mt-2">
            You don't have a store assigned to your account. Please contact the system administrator.
          </p>
        </div>
      </div>
    );
  }

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating}/5</span>
      </div>
    );
  };

  const statCards = [
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: 'bg-yellow-500',
    },
    {
      title: 'Total Ratings',
      value: stats.totalRatings,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Recent Ratings',
      value: stats.recentRatings,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Store Dashboard</h1>
        <p className="text-gray-600 mt-2">Managing {store.name}</p>
      </div>

      {/* Store Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <Store className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Store Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Store Name</p>
            <p className="text-lg text-gray-900">{store.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Email</p>
            <p className="text-lg text-gray-900">{store.email}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-600">Address</p>
            <p className="text-lg text-gray-900">{store.address}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

      {/* Recent Ratings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Ratings</h2>
        <div className="space-y-4">
          {ratings.length > 0 ? (
            ratings.slice(0, 10).map((rating) => (
              <div key={rating.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{rating.users?.name}</h3>
                  <p className="text-sm text-gray-600">{rating.users?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  {renderStarRating(rating.rating)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No ratings yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
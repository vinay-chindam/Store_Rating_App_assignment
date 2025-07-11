import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Store, Star, MapPin } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentStores, setRecentStores] = useState<any[]>([]);
  const [userRatings, setUserRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const [storesResponse, ratingsResponse] = await Promise.all([
        supabase
          .from('stores')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('ratings')
          .select(`
            *,
            stores:store_id (
              id,
              name,
              address
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      setRecentStores(storesResponse.data || []);
      setUserRatings(ratingsResponse.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Discover and rate amazing stores</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stores */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Store className="h-5 w-5 mr-2" />
            Recent Stores
          </h2>
          <div className="space-y-4">
            {recentStores.length > 0 ? (
              recentStores.map((store) => (
                <div key={store.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{store.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {store.address}
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No stores available</p>
            )}
          </div>
        </div>

        {/* Your Recent Ratings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Your Recent Ratings
          </h2>
          <div className="space-y-4">
            {userRatings.length > 0 ? (
              userRatings.map((rating) => (
                <div key={rating.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{rating.stores?.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {rating.stores?.address}
                    </p>
                  </div>
                  <div className="text-right">
                    {renderStarRating(rating.rating)}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No ratings yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <h3 className="font-medium text-gray-900">Browse Stores</h3>
            <p className="text-sm text-gray-600 mt-1">
              Explore all available stores and their ratings
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <h3 className="font-medium text-gray-900">Submit Rating</h3>
            <p className="text-sm text-gray-600 mt-1">
              Rate a store you've visited recently
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <h3 className="font-medium text-gray-900">Update Profile</h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
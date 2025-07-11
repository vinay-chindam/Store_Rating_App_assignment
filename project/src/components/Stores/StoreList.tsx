import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Store, Star, MapPin, Search, Plus } from 'lucide-react';
import RatingModal from './RatingModal';

const StoreList: React.FC = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState<any[]>([]);
  const [filteredStores, setFilteredStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [user]);

  useEffect(() => {
    filterStores();
  }, [stores, searchTerm]);

  const fetchStores = async () => {
    try {
      const { data: storesData, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');

      if (error) throw error;

      // Get ratings for each store
      const storesWithRatings = await Promise.all(
        storesData.map(async (store) => {
          const { data: ratingsData } = await supabase
            .from('ratings')
            .select('rating, user_id')
            .eq('store_id', store.id);

          const averageRating = ratingsData?.length > 0
            ? ratingsData.reduce((sum, rating) => sum + rating.rating, 0) / ratingsData.length
            : 0;

          const userRating = ratingsData?.find(rating => rating.user_id === user?.id)?.rating || 0;

          return {
            ...store,
            average_rating: Math.round(averageRating * 10) / 10,
            user_rating: userRating,
          };
        })
      );

      setStores(storesWithRatings);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStores = () => {
    if (!searchTerm) {
      setFilteredStores(stores);
      return;
    }

    const filtered = stores.filter(store =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStores(filtered);
  };

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

  const handleRateStore = (store: any) => {
    setSelectedStore(store);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async () => {
    setShowRatingModal(false);
    setSelectedStore(null);
    await fetchStores(); // Refresh the stores list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stores</h1>
        <p className="text-gray-600">Discover and rate amazing stores</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search stores by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <Store className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <p className="text-sm text-gray-600">{store.address}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Overall Rating</p>
                  {renderStarRating(store.average_rating)}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">Your Rating</p>
                  {store.user_rating > 0 ? (
                    renderStarRating(store.user_rating)
                  ) : (
                    <p className="text-sm text-gray-500">Not rated</p>
                  )}
                </div>
              </div>

              {user?.role === 'user' && (
                <button
                  onClick={() => handleRateStore(store)}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                >
                  <Star className="h-4 w-4 mr-2" />
                  {store.user_rating > 0 ? 'Update Rating' : 'Rate Store'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-12">
          <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No stores found</p>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedStore && (
        <RatingModal
          store={selectedStore}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
};

export default StoreList;
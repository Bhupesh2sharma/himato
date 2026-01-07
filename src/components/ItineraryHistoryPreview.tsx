import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ItineraryPreview {
  _id: string;
  prompt: string;
  itineraryData: {
    days: Array<{
      day: number;
      title: string;
    }>;
  };
  createdAt: string;
}

export const ItineraryHistoryPreview = () => {
  const { isAuthenticated } = useAuth();
  const [itineraries, setItineraries] = useState<ItineraryPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadLatestItineraries();
    }
  }, [isAuthenticated]);

  const loadLatestItineraries = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getItineraryHistory(1, 1);
      if (response.status === 'success') {
        setItineraries(response.data.itineraries || []);
      }
    } catch (error) {
      console.error('Failed to load itinerary history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || itineraries.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-ai-accent" />
          Latest Itinerary
        </h2>
        <Link
          to="/history"
          className="text-ai-accent hover:text-ai-accent/80 text-sm font-medium transition-colors flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1].map((i) => (
            <div
              key={i}
              className="glass rounded-xl p-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {itineraries.map((itinerary, index) => (
            <motion.div
              key={itinerary._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/itinerary/${itinerary._id}`}
                className="group block"
              >
                <div className="glass rounded-xl p-3 cursor-pointer transition-all hover:border-ai-accent/50 hover:bg-ai-card/40">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-ai-accent/10 rounded-lg border border-ai-accent/30 flex-shrink-0 group-hover:bg-ai-accent/20 transition-colors">
                      <MapPin className="w-5 h-5 text-ai-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-ai-accent text-base font-semibold line-clamp-1 group-hover:text-ai-accent/80 transition-colors">
                          {itinerary.prompt}
                        </h3>
                        <div className="w-6 h-6 rounded-full bg-ai-accent/10 border border-ai-accent/30 flex items-center justify-center group-hover:bg-ai-accent/20 transition-colors flex-shrink-0 mt-1">
                          <ArrowRight className="w-3 h-3 text-ai-accent/50 group-hover:text-ai-accent transition-colors" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-ai-muted mt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(itinerary.createdAt)}</span>
                        </div>
                        <span className="text-white/20">•</span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{itinerary.itineraryData.days.length} {itinerary.itineraryData.days.length === 1 ? 'Day' : 'Days'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};


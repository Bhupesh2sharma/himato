import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Calendar, Trash2, ArrowRight } from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface ItineraryItem {
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

export const ItineraryHistory = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState<ItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; prompt: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadItineraries();
  }, [isAuthenticated, navigate, page]);

  const loadItineraries = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getItineraryHistory(page, 12);
      if (response.status === 'success') {
        setItineraries(response.data.itineraries || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to load itinerary history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string, prompt: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete({ id, prompt });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;

    const id = confirmDelete.id;
    setDeletingId(id);
    try {
      await apiClient.deleteItinerary(id);
      setItineraries(itineraries.filter(item => item._id !== id));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Failed to delete itinerary:', error);
      alert('Failed to delete itinerary. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-ai-dark text-white pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-ai-muted hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-ai-text to-ai-accent">
            My Itineraries
          </h1>
          <p className="text-ai-muted">Manage and view all your saved travel plans</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="glass rounded-xl p-5 animate-pulse"
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
        ) : itineraries.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-16 h-16 text-ai-muted mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold text-white mb-2">No Itineraries Yet</h2>
            <p className="text-ai-muted mb-6">Start planning your Sikkim adventure!</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ai-accent/10 hover:bg-ai-accent/20 border border-ai-accent/30 hover:border-ai-accent/50 text-ai-accent rounded-xl transition-all"
            >
              <MapPin className="w-5 h-5" />
              Create Your First Itinerary
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-8">
              {itineraries.map((itinerary, index) => (
                <motion.div
                  key={itinerary._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <Link to={`/itinerary/${itinerary._id}`} className="block">
                    <div className="glass rounded-xl p-5 cursor-pointer transition-all hover:border-ai-accent/50 hover:bg-ai-card/40">
                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteClick(itinerary._id, itinerary.prompt, e)}
                        disabled={deletingId === itinerary._id}
                        className="absolute top-5 right-5 p-2 text-ai-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                        title="Delete itinerary"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-3 pr-12">
                        <div className="p-2.5 bg-ai-accent/10 rounded-lg border border-ai-accent/30 flex-shrink-0 group-hover:bg-ai-accent/20 transition-colors">
                          <MapPin className="w-5 h-5 text-ai-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-ai-accent text-base font-semibold line-clamp-1 group-hover:text-ai-accent/80 transition-colors">
                              {itinerary.prompt}
                            </h3>
                            <div className="w-8 h-8 rounded-full bg-ai-accent/10 border border-ai-accent/30 flex items-center justify-center group-hover:bg-ai-accent/20 transition-colors flex-shrink-0 mt-1">
                              <ArrowRight className="w-4 h-4 text-ai-accent/50 group-hover:text-ai-accent transition-colors" />
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-ai-muted mt-2">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 glass rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-ai-accent/50 transition-all"
                >
                  Previous
                </button>
                <span className="text-ai-muted">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 glass rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-ai-accent/50 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Itinerary"
        message={`Are you sure you want to delete "${confirmDelete?.prompt}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deletingId !== null}
      />
    </div>
  );
};


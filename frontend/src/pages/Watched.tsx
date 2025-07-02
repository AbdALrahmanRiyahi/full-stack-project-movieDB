import React from 'react';
import { Link } from 'react-router-dom';
import { useMovies } from '../hooks/useMovies';
import { Film, Eye, Calendar, Clock, Star, User } from 'lucide-react';
import { format } from 'date-fns';
import { getWatched, removeFromWatched } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

const Watched: React.FC = () => {
  const { data: allMovies = [], isLoading } = useMovies();
  const [watched, setWatched] = React.useState<string[]>([]);
  const { user } = useAuth();

  React.useEffect(() => {
    if (user?.id) {
      setWatched(getWatched(user.id));
    } else {
      setWatched([]);
    }
  }, [user?.id]);

  const watchedMovies = allMovies.filter(movie => watched.includes(movie._id));

  const handleRemoveFromWatched = (movieId: string) => {
    if (!user?.id) return;
    removeFromWatched(movieId, user.id);
    setWatched(getWatched(user.id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Eye className="h-8 w-8 mr-3 text-green-400" />
            Watched Movies
          </h1>
          <p className="text-white/60 mt-2">Movies you've watched and enjoyed</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{watchedMovies.length}</p>
          <p className="text-white/60 text-sm">Watched</p>
        </div>
      </div>

      {watchedMovies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchedMovies.map((movie) => (
            <div
              key={movie._id}
              className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden hover:bg-white/20 transition-all group"
            >
              <div className="p-6">
                {/* Action Buttons - Top Horizontal Row */}
                <div className="flex justify-end items-center gap-2 mb-4">
                  <button
                    onClick={() => handleRemoveFromWatched(movie._id)}
                    className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                    title="Remove from Watched"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M9 12l2 2 4-4"/>
                      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                    </svg>
                  </button>
                  <Link
                    to={`/movies/${movie._id}`}
                    className="p-2 text-white/60 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </Link>
                </div>

                {/* Image and Title Side by Side */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative w-40 h-56 bg-gradient-to-br from-green-500 to-teal-500 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {/* Rating Badge - Upper Left */}
                    {movie.rating != null && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1 z-10">
                        <Star className="h-3 w-3 fill-current" />
                        {movie.rating}/10
                      </div>
                    )}
                    {movie.imageUrl ? (
                      <img src={movie.imageUrl} alt={movie.title} className="object-cover w-full h-full" />
                    ) : (
                      <Film className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-lg mb-2">{movie.title}</h3>
                    <p className="text-green-400 text-sm mb-1">{movie.genre}</p>
                    {movie.country && (
                      <p className="text-white/60 text-xs mb-2">{movie.country}</p>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center text-white/60 text-sm">
                        <Calendar className="h-3 w-3 mr-2" />
                        {movie.releaseDate ? format(new Date(movie.releaseDate), 'MMM dd, yyyy') : 'Unknown'}
                      </div>
                      <div className="flex items-center text-white/60 text-sm">
                        <Clock className="h-3 w-3 mr-2" />
                        {movie.duration ?? 'N/A'} minutes
                      </div>
                      <div className="flex items-center text-white/60 text-sm">
                        <User className="h-3 w-3 mr-2" />
                        Director: {typeof movie.director === 'string' ? movie.director : movie.director?.name ?? 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-4">No watched movies yet</h3>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Start tracking the movies you've watched by marking them as watched in your movie collection.
          </p>
          <div className="space-y-4">
            <Link
              to="/movies"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all"
            >
              <Eye className="h-5 w-5 mr-2" />
              Browse Movies
            </Link>
            <p className="text-white/50 text-sm">
              Click the checkmark icon on any movie to mark it as watched
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watched; 
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMovie, useDeleteMovie } from '../hooks/useMovies';
import { useDirector } from '../hooks/useDirectors';
import { Film, Calendar, Clock, Edit, Trash2, ArrowLeft, Star, Heart, User, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { addToFavorites, removeFromFavorites, isFavorite, addToWatched, removeFromWatched, isWatched as checkIsWatched } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { Movie } from '../types';

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: movie, isLoading } = useMovie(id!);
  const { data: director } = useDirector(typeof movie?.director === 'string' ? movie.director : movie?.director?._id || '');
  const deleteMovie = useDeleteMovie();
  const [isFav, setIsFav] = React.useState(false);
  const [watchedStatus, setWatchedStatus] = React.useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  React.useEffect(() => {
    if (id && user?.id) {
      setIsFav(isFavorite(id, user.id));
      setWatchedStatus(checkIsWatched(id, user.id));
    }
  }, [id, user?.id]);

  const handleDelete = async () => {
    if (movie && window.confirm(`Are you sure you want to delete "${movie.title}"?`)) {
      try {
        await deleteMovie.mutateAsync(movie._id);
        navigate('/movies');
      } catch (error) {
        console.error('Failed to delete movie:', error);
      }
    }
  };

  const toggleFavorite = () => {
    if (!id || !user?.id) return;

    if (isFav) {
      removeFromFavorites(id, user.id);
      setIsFav(false);
    } else {
      addToFavorites(id, user.id);
      setIsFav(true);
    }
  };

  const toggleWatched = () => {
    if (!id || !user?.id) return;

    if (watchedStatus) {
      removeFromWatched(id, user.id);
      setWatchedStatus(false);
    } else {
      addToWatched(id, user.id);
      setWatchedStatus(true);
    }
  };

  // Helper to check if a movie was created by any admin
  const isAdminCreated = (movie: Movie) => {
    if (typeof movie.userId === 'object' && movie.userId.role === 'admin') return true;
    if (typeof movie.userId === 'string' && isAdmin) return true;
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-12">
        <Film className="h-16 w-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Movie not found</h3>
        <p className="text-white/60 mb-6">The movie you're looking for doesn't exist.</p>
        <Link
          to="/movies"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Movies
        </Link>
      </div>
    );
  }

  const movieDirector = director || (typeof movie.director === 'object' ? movie.director : null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/movies"
          className="inline-flex items-center text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Movies
        </Link>
        <div className="flex space-x-2">
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              isFav
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/10 text-white/60 hover:text-red-400 hover:bg-red-500/10'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={toggleWatched}
            className={`p-2 rounded-lg transition-colors ${
              watchedStatus
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-white/10 text-white/60 hover:text-green-400 hover:bg-green-500/10'
            }`}
            title={watchedStatus ? 'Mark as Unwatched' : 'Mark as Watched'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${watchedStatus ? 'fill-current' : ''}`}>
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
            </svg>
          </button>
          {(
            (typeof movie.userId === 'string' && movie.userId === user?.id) ||
            (typeof movie.userId === 'object' && movie.userId._id === user?.id) ||
            (isAdmin && isAdminCreated(movie))
          ) && (
            <>
              <Link
                to={`/movies/${movie._id}/edit`}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
              </Link>
              <button
                onClick={handleDelete}
                className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden">
        <div className="p-8">
          <div className="flex items-start space-x-6">
            <div className="w-40 h-56 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {movie.imageUrl ? (
                <img src={movie.imageUrl} alt={movie.title} className="object-cover w-full h-full" />
              ) : (
                <Film className="h-12 w-12 text-white" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{movie.title}</h1>
                  <p className="text-blue-400 text-lg font-medium">{movie.genre ?? 'Unknown Genre'}</p>
                  {movie.country && (
                    <p className="text-white/60 text-sm mt-1">{movie.country}</p>
                  )}
                </div>
                {movie.rating != null && (
                  <div className="flex items-center bg-yellow-500/20 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-yellow-400 font-medium">{movie.rating}/10</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center text-white/70">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{movie.releaseDate ? format(new Date(movie.releaseDate), 'MMMM dd, yyyy') : 'Unknown'}</span>
                </div>
                <div className="flex items-center text-white/70">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{movie.duration ?? 'N/A'} minutes</span>
                </div>
                <div className="flex items-center text-white/70">
                  <User className="h-4 w-4 mr-2" />
                  <span>
                    {movieDirector ? (
                      <Link
                        to={`/directors/${movieDirector._id}`}
                        className="hover:text-purple-400 transition-colors"
                      >
                        {movieDirector.name}
                      </Link>
                    ) : (
                      'Unknown Director'
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Description</h2>
                  <p className="text-white/80 leading-relaxed">{movie.description ?? 'No description available.'}</p>
                </div>

                {movieDirector && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">Director</h2>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start space-x-3">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {movieDirector.imageUrl ? (
                            <img src={movieDirector.imageUrl} alt={movieDirector.name} className="object-cover w-full h-full rounded-full" />
                          ) : (
                            <User className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{movieDirector.name}</h3>
                          <p className="text-white/60 text-sm">{movieDirector.nationality ?? 'Unknown'}</p>
                          <p className="text-white/70 text-sm mt-2 line-clamp-3">{movieDirector.bio ?? 'No biography available.'}</p>
                          <Link
                            to={`/directors/${movieDirector._id}`}
                            className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-2 inline-block transition-colors"
                          >
                            View Director Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actors Section */}
                {movie.actors && movie.actors.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">Cast</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {movie.actors.map((actor) => {
                        const actorData = typeof actor === 'string' ? null : actor;
                        return actorData ? (
                          <div key={actorData._id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-start space-x-3">
                              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {actorData.imageUrl ? (
                                  <img src={actorData.imageUrl} alt={actorData.name} className="object-cover w-full h-full rounded-full" />
                                ) : (
                                  <UserCheck className="h-5 w-5 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-white truncate">{actorData.name}</h3>
                                <p className="text-white/60 text-sm">{actorData.nationality ?? 'Unknown'}</p>
                                <p className="text-white/70 text-sm mt-1 line-clamp-2">{actorData.bio ?? 'No biography available.'}</p>
                                <Link
                                  to={`/actors/${actorData._id}`}
                                  className="text-orange-400 hover:text-orange-300 text-sm font-medium mt-2 inline-block transition-colors"
                                >
                                  View Actor Details →
                                </Link>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Video */}
      {movie.teaserUrl && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">Trailer</h2>
          {movie.teaserUrl.includes('youtube.com') || movie.teaserUrl.includes('youtu.be') ? (
            <iframe
              src={
                movie.teaserUrl.includes('youtube.com')
                  ? movie.teaserUrl.replace('/watch?v=', '/embed/')
                  : movie.teaserUrl.replace('youtu.be/', 'youtube.com/embed/')
              }
              title="Movie Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full rounded-lg border border-white/20"
              style={{ aspectRatio: '16/9', minHeight: 200 }}
            />
          ) : (
            <video
              src={movie.teaserUrl}
              controls
              className="w-full rounded-lg border border-white/20 bg-black"
              style={{ aspectRatio: '16/9', minHeight: 200 }}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}
    </div>
  );
};

export default MovieDetails;

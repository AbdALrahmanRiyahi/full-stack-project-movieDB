import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDirector, useDeleteDirector } from '../hooks/useDirectors';
import { useMovies } from '../hooks/useMovies';
import { Users, Calendar, Edit, Trash2, ArrowLeft, Film, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

const DirectorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: director, isLoading } = useDirector(id!);
  const { data: allMovies = [] } = useMovies();
  const deleteDirector = useDeleteDirector();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const directorMovies = allMovies.filter(movie => 
    (typeof movie.director === 'string' ? movie.director : movie.director?._id) === id
  );

  // Helper to check if a director was created by any admin
  const isAdminCreated = (director: any) => {
    if (typeof director.userId === 'object' && director.userId.role === 'admin') return true;
    if (typeof director.userId === 'string' && isAdmin) return true;
    return false;
  };

  const handleDelete = async () => {
    if (director && window.confirm(`Are you sure you want to delete "${director.name}"?`)) {
      try {
        await deleteDirector.mutateAsync(director._id);
        navigate('/directors');
      } catch (error) {
        console.error('Failed to delete director:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!director) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Director not found</h3>
        <p className="text-white/60 mb-6">The director you're looking for doesn't exist.</p>
        <Link
          to="/directors"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/directors"
          className="inline-flex items-center text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directors
        </Link>
        <div className="flex space-x-2">
          {(
            (typeof director.userId === 'string' && director.userId === user?.id) ||
            (typeof director.userId === 'object' && director.userId._id === user?.id) ||
            (isAdmin && isAdminCreated(director))
          ) && (
            <>
              <Link
                to={`/directors/${director._id}/edit`}
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
            <div className="w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              {director.imageUrl ? (
                <img src={director.imageUrl} alt={director.name} className="object-cover w-full h-full rounded-full" />
              ) : (
                <Users className="h-12 w-12 text-white" />
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{director.name}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-white/70">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>{director.nationality ?? 'Unknown'}</span>
                </div>
                <div className="flex items-center text-white/70">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Born {director.birthDate ? format(new Date(director.birthDate), 'MMMM dd, yyyy') : 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">Biography</h2>
                  <p className="text-white/80 leading-relaxed">{director.bio ?? 'No biography available.'}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">
                    Movies ({directorMovies.length})
                  </h2>
                  {directorMovies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {directorMovies.map((movie) => (
                        <Link
                          key={movie._id}
                          to={`/movies/${movie._id}`}
                          className="group bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all border border-white/10"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-24 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {movie.imageUrl ? (
                                <img src={movie.imageUrl} alt={movie.title} className="object-cover w-full h-full" />
                              ) : (
                                <Film className="h-5 w-5 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                {movie.title}
                              </h3>
                              <p className="text-white/60 text-sm mt-1">{movie.genre}</p>
                              <p className="text-white/50 text-xs mt-1">
                                {movie.releaseDate ? format(new Date(movie.releaseDate), 'yyyy') : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
                      <Film className="h-12 w-12 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60">No movies found for this director</p>
                      <Link
                        to="/movies/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
                      >
                        Add Movie
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorDetails;

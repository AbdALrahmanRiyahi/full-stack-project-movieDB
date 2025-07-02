import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useActor, useDeleteActor } from '../hooks/useActors';
import { useMovies } from '../hooks/useMovies';
import { Users, Calendar, Edit, Trash2, ArrowLeft, Film, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

const ActorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: actor, isLoading } = useActor(id!);
  const { data: allMovies = [] } = useMovies();
  const deleteActor = useDeleteActor();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const actorMovies = allMovies.filter(movie => 
    movie.actors && Array.isArray(movie.actors) && 
    movie.actors.some(actor => 
      (typeof actor === 'string' ? actor : actor._id) === id
    )
  );

  // Helper to check if an actor was created by any admin
  const isAdminCreated = (actor: any) => {
    if (typeof actor.userId === 'object' && actor.userId.role === 'admin') return true;
    if (typeof actor.userId === 'string' && isAdmin) return true;
    return false;
  };

  const handleDelete = async () => {
    if (actor && window.confirm(`Are you sure you want to delete "${actor.name}"?`)) {
      try {
        await deleteActor.mutateAsync(actor._id);
        navigate('/actors');
      } catch (error) {
        console.error('Failed to delete actor:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Actor not found</h3>
        <p className="text-white/60 mb-6">The actor you're looking for doesn't exist.</p>
        <Link
          to="/actors"
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Actors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/actors"
          className="inline-flex items-center text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Actors
        </Link>
        <div className="flex space-x-2">
          {(
            (typeof actor.userId === 'string' && actor.userId === user?.id) ||
            (typeof actor.userId === 'object' && actor.userId._id === user?.id) ||
            (isAdmin && isAdminCreated(actor))
          ) && (
            <>
              <Link
                to={`/actors/${actor._id}/edit`}
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
            <div className="w-40 h-40 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              {actor.imageUrl ? (
                <img src={actor.imageUrl} alt={actor.name} className="object-cover w-full h-full rounded-full" />
              ) : (
                <Users className="h-12 w-12 text-white" />
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{actor.name}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-white/70">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>{actor.nationality ?? 'Unknown'}</span>
                </div>
                <div className="flex items-center text-white/70">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Born {actor.birthDate ? format(new Date(actor.birthDate), 'MMMM dd, yyyy') : 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">Biography</h2>
                  <p className="text-white/80 leading-relaxed">{actor.bio ?? 'No biography available.'}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">
                    Movies ({actorMovies.length})
                  </h2>
                  {actorMovies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {actorMovies.map((movie) => (
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
                      <p className="text-white/60">No movies found for this actor</p>
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

export default ActorDetails; 
import React from 'react';
import { Link } from 'react-router-dom';
import { useMovies } from '../hooks/useMovies';
import { useDirectors } from '../hooks/useDirectors';
import { useActors } from '../hooks/useActors';
import { Film, Users, Heart, Plus, TrendingUp, Clock, Star, UserCheck } from 'lucide-react';
import { getFavorites, getWatched } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { data: movies = [], isLoading: moviesLoading } = useMovies();
  const { data: directors = [], isLoading: directorsLoading } = useDirectors();
  const { data: actors = [], isLoading: actorsLoading } = useActors();
  const { user } = useAuth();
  const favorites = user?.id ? getFavorites(user.id) : [];
  const watched = user?.id ? getWatched(user.id) : [];
  const favoriteMovies = movies.filter(movie => favorites.includes(movie._id));
  const watchedMovies = movies.filter(movie => watched.includes(movie._id));

  const recentMovies = movies.slice(0, 3);
  const recentDirectors = directors.slice(0, 3);
  const recentActors = actors.slice(0, 3);

  const stats = [
    {
      name: 'Total Movies',
      value: movies.length,
      icon: Film,
      color: 'bg-blue-500',
      href: '/movies'
    },
    {
      name: 'Total Directors',
      value: directors.length,
      icon: Users,
      color: 'bg-purple-500',
      href: '/directors'
    },
    {
      name: 'Total Actors',
      value: actors.length,
      icon: UserCheck,
      color: 'bg-orange-500',
      href: '/actors'
    },
    {
      name: 'Favorites',
      value: favoriteMovies.length,
      icon: Heart,
      color: 'bg-red-500',
      href: '/favorites'
    },
    {
      name: 'Watched',
      value: watchedMovies.length,
      icon: Clock,
      color: 'bg-green-500',
      href: '/watched'
    },
    {
      name: 'Average Rating',
      value: movies.length > 0 ? (movies.reduce((acc, movie) => acc + (movie.rating || 0), 0) / movies.length).toFixed(1) : '0.0',
      icon: Star,
      color: 'bg-yellow-500',
      href: '/movies'
    },
  ];

  if (moviesLoading || directorsLoading || actorsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/60 mt-2">Welcome back! Here's what's happening with your movie collection.</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/movies/new"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Movie
          </Link>
          <Link
            to="/directors/new"
            className="inline-flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Director
          </Link>
          <Link
            to="/actors/new"
            className="inline-flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Actor
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex flex-row gap-6 w-full">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className="flex-1 min-w-0 bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">{stat.name}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Movies */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
            Recent Movies
          </h2>
          <Link
            to="/movies"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            View all →
          </Link>
        </div>
        
        {recentMovies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentMovies.map((movie) => (
              <Link
                key={movie._id}
                to={`/movies/${movie._id}`}
                className="group bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all border border-white/10"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {movie.imageUrl ? (
                      <img src={movie.imageUrl} alt={movie.title} className="object-cover w-full h-full" />
                    ) : (
                      <Film className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                      {movie.title}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">{movie.genre}</p>
                    <div className="flex items-center mt-2 text-xs text-white/50">
                      <Clock className="h-3 w-3 mr-1" />
                      {movie.duration} min
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-white/60 text-sm">No movies found.</p>
        )}
      </div>

      {/* Recent Directors */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-400" />
            Recent Directors
          </h2>
          <Link
            to="/directors"
            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
          >
            View all →
          </Link>
        </div>
        {recentDirectors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentDirectors.map((director) => (
              <Link
                key={director._id}
                to={`/directors/${director._id}`}
                className="group bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all border border-white/10"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {director.imageUrl ? (
                      <img src={director.imageUrl} alt={director.name} className="object-cover w-full h-full rounded-full" />
                    ) : (
                      <Users className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                      {director.name}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">{director.nationality}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">No directors yet. Add your first director to get started!</p>
            <Link
              to="/directors/new"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Director
            </Link>
          </div>
        )}
      </div>

      {/* Recent Actors */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-orange-400" />
            Recent Actors
          </h2>
          <Link
            to="/actors"
            className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
          >
            View all →
          </Link>
        </div>
        {recentActors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentActors.map((actor) => (
              <Link
                key={actor._id}
                to={`/actors/${actor._id}`}
                className="group bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all border border-white/10"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {actor.imageUrl ? (
                      <img src={actor.imageUrl} alt={actor.name} className="object-cover w-full h-full rounded-full" />
                    ) : (
                      <UserCheck className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white group-hover:text-orange-400 transition-colors">
                      {actor.name}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">{actor.nationality}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <UserCheck className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">No actors yet. Add your first actor to get started!</p>
            <Link
              to="/actors/new"
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Actor
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
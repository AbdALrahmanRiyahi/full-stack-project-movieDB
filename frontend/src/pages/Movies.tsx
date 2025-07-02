import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMovies, useDeleteMovie } from '../hooks/useMovies';
import { Film, Plus, Search, Calendar, Clock, Trash2, Edit, Star, Filter, X, User } from 'lucide-react';
import { format } from 'date-fns';
import { addToFavorites, removeFromFavorites, addToWatched, removeFromWatched } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { Movie } from '../types';

interface FilterState {
  genre: string;
  country: string;
  releaseDateFrom: string;
  releaseDateTo: string;
  ratingFrom: string;
  ratingTo: string;
  durationFrom: string;
  durationTo: string;
}

const Movies: React.FC = () => {
  const { data: movies = [], isLoading } = useMovies();
  const deleteMovie = useDeleteMovie();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    genre: '',
    country: '',
    releaseDateFrom: '',
    releaseDateTo: '',
    ratingFrom: '',
    ratingTo: '',
    durationFrom: '',
    durationTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [watchedIds, setWatchedIds] = useState<string[]>([]);
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const [sortOption, setSortOption] = useState('yearDesc');

  const sortOptions = [
    { value: 'ratingDesc', label: 'Rating (High to Low)' },
    { value: 'ratingAsc', label: 'Rating (Low to High)' },
    { value: 'yearDesc', label: 'Year (Newest First)' },
    { value: 'yearAsc', label: 'Year (Oldest First)' },
    { value: 'durationDesc', label: 'Duration (Longest First)' },
    { value: 'durationAsc', label: 'Duration (Shortest First)' },
  ];

  // Update favorites when user changes
  useEffect(() => {
    if (user?.id) {
      const userFavorites = JSON.parse(localStorage.getItem(`movie_favorites_${user.id}`) || '[]');
      const userWatched = JSON.parse(localStorage.getItem(`movie_watched_${user.id}`) || '[]');
      setFavoriteIds(userFavorites);
      setWatchedIds(userWatched);
    } else {
      setFavoriteIds([]);
      setWatchedIds([]);
    }
  }, [user?.id]);

  const filteredMovies = movies.filter(movie => {
    const titleMatch = movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const descMatch = movie.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const matchesSearch = titleMatch || descMatch;
    
    // Genre filter
    const matchesGenre = !filters.genre || movie.genre === filters.genre;
    
    // Country filter
    const matchesCountry = !filters.country || movie.country === filters.country;
    
    // Release date filter
    const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : null;
    const fromDate = filters.releaseDateFrom ? new Date(filters.releaseDateFrom) : null;
    const toDate = filters.releaseDateTo ? new Date(filters.releaseDateTo) : null;
    const matchesReleaseDate = (!fromDate || (releaseDate && releaseDate >= fromDate)) &&
                               (!toDate || (releaseDate && releaseDate <= toDate));
    
    // Rating filter
    const rating = movie.rating ?? 0;
    const ratingFrom = filters.ratingFrom ? parseFloat(filters.ratingFrom) : 0;
    const ratingTo = filters.ratingTo ? parseFloat(filters.ratingTo) : 10;
    const matchesRating = rating >= ratingFrom && rating <= ratingTo;
    
    // Duration filter
    const duration = movie.duration ?? 0;
    const durationFrom = filters.durationFrom ? parseInt(filters.durationFrom) : 0;
    const durationTo = filters.durationTo ? parseInt(filters.durationTo) : 999;
    const matchesDuration = duration >= durationFrom && duration <= durationTo;
    
    return matchesSearch && matchesGenre && matchesCountry && matchesReleaseDate && matchesRating && matchesDuration;
  });

  function sortMovies(moviesArr: Movie[]) {
    let unwatched = moviesArr.filter(m => !watchedIds.includes(m._id));
    let watched = moviesArr.filter(m => watchedIds.includes(m._id));
    const compare = (a: Movie, b: Movie) => {
      switch (sortOption) {
        case 'ratingDesc':
          return (b.rating ?? 0) - (a.rating ?? 0);
        case 'ratingAsc':
          return (a.rating ?? 0) - (b.rating ?? 0);
        case 'yearDesc': {
          const aYear = a.releaseDate ? new Date(a.releaseDate).getFullYear() : 0;
          const bYear = b.releaseDate ? new Date(b.releaseDate).getFullYear() : 0;
          return bYear - aYear;
        }
        case 'yearAsc': {
          const aYear = a.releaseDate ? new Date(a.releaseDate).getFullYear() : 0;
          const bYear = b.releaseDate ? new Date(b.releaseDate).getFullYear() : 0;
          return aYear - bYear;
        }
        case 'durationDesc':
          return (b.duration ?? 0) - (a.duration ?? 0);
        case 'durationAsc':
          return (a.duration ?? 0) - (b.duration ?? 0);
        default:
          return 0;
      }
    };
    return [
      ...[...unwatched].sort(compare),
      ...[...watched].sort(compare)
    ];
  }

  const sortedMovies = sortMovies(filteredMovies);
  const sortedMyMovies = sortMovies(movies.filter(movie => {
    if (typeof movie.userId === 'string') return movie.userId === user?.id;
    if (typeof movie.userId === 'object') return movie.userId._id === user?.id;
    return false;
  }));

  const genres = Array.from(new Set(movies.map(m => m.genre).filter(Boolean)));
  const countries = Array.from(new Set(movies.map(m => m.country).filter(Boolean)));

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteMovie.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete movie:', error);
      }
    }
  };

  const toggleFavorite = (movieId: string) => {
    if (!user?.id) return;
    
    if (favoriteIds.includes(movieId)) {
      removeFromFavorites(movieId, user.id);
      setFavoriteIds(favoriteIds.filter(id => id !== movieId));
    } else {
      addToFavorites(movieId, user.id);
      setFavoriteIds([...favoriteIds, movieId]);
    }
  };

  const toggleWatched = (movieId: string) => {
    if (!user?.id) return;
    
    if (watchedIds.includes(movieId)) {
      removeFromWatched(movieId, user.id);
      setWatchedIds(watchedIds.filter(id => id !== movieId));
    } else {
      addToWatched(movieId, user.id);
      setWatchedIds([...watchedIds, movieId]);
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Movies</h1>
          <p className="text-white/60 mt-2">Manage your movie collection</p>
        </div>
        <Link
          to="/movies/new"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Movie
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors focus:outline-none ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}
          onClick={() => setActiveTab('all')}
        >
          All Movies
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors focus:outline-none ${activeTab === 'mine' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}
          onClick={() => setActiveTab('mine')}
        >
          My Movies
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              showFilters 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {Object.values(filters).some(value => value !== '') && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">Active</span>
            )}
          </button>
          <div className="flex items-center">
            <label className="text-white/80 mr-2 font-medium">Sort by:</label>
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="border-t border-white/20 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Genre Filter */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Genre</label>
          <select
                  value={filters.genre}
                  onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre} className="bg-slate-800">
                {genre}
              </option>
            ))}
          </select>
        </div>

              {/* Country Filter */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country} className="bg-slate-800">
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Release Date Range */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Release Date From</label>
                <input
                  type="date"
                  value={filters.releaseDateFrom}
                  onChange={(e) => setFilters({ ...filters, releaseDateFrom: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Release Date To</label>
                <input
                  type="date"
                  value={filters.releaseDateTo}
                  onChange={(e) => setFilters({ ...filters, releaseDateTo: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Rating Range */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Rating From</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="0"
                  value={filters.ratingFrom}
                  onChange={(e) => setFilters({ ...filters, ratingFrom: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Rating To</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="10"
                  value={filters.ratingTo}
                  onChange={(e) => setFilters({ ...filters, ratingTo: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Duration Range */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Duration From (min)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={filters.durationFrom}
                  onChange={(e) => setFilters({ ...filters, durationFrom: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Duration To (min)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="999"
                  value={filters.durationTo}
                  onChange={(e) => setFilters({ ...filters, durationTo: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setFilters({
                  genre: '',
                  country: '',
                  releaseDateFrom: '',
                  releaseDateTo: '',
                  ratingFrom: '',
                  ratingTo: '',
                  durationFrom: '',
                  durationTo: ''
                })}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Movies Grid */}
      {activeTab === 'all' ? (
        sortedMovies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedMovies.map((movie) => (
            <div
              key={movie._id}
                className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden hover:bg-white/20 transition-all group min-w-[10rem] min-h-[14rem]"
            >
              <div className="p-6">
                {/* Action Buttons - Top Horizontal Row */}
                <div className="flex justify-end items-center gap-2 mb-4">
                  <button
                    onClick={() => toggleFavorite(movie._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      favoriteIds.includes(movie._id)
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white/10 text-white/60 hover:text-red-400 hover:bg-red-500/10'
                    }`}
                    title={favoriteIds.includes(movie._id) ? 'Remove from Favorites' : 'Add to Favorites'}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${favoriteIds.includes(movie._id) ? 'fill-current' : ''}`}> <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </button>
                  <button
                    onClick={() => toggleWatched(movie._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      watchedIds.includes(movie._id)
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-white/10 text-white/60 hover:text-green-400 hover:bg-green-500/10'
                    }`}
                    title={watchedIds.includes(movie._id) ? 'Mark as Unwatched' : 'Mark as Watched'}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${watchedIds.includes(movie._id) ? 'fill-current' : ''}`}>
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
                  {(
                    (typeof movie.userId === 'string' && movie.userId === user?.id) ||
                    (typeof movie.userId === 'object' && movie.userId._id === user?.id) ||
                    (isAdmin && isAdminCreated(movie))
                  ) && (
                    <>
                    <Link
                      to={`/movies/${movie._id}/edit`}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit Movie"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(movie._id, movie.title ?? '')}
                      className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Movie"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    </>
                  )}
                </div>

                {/* Image and Title Side by Side */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative w-40 h-56 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                    <h3 className="font-semibold text-white text-lg mb-2">{movie.title ?? 'Untitled'}</h3>
                    <p className="text-blue-400 text-sm mb-1">{movie.genre ?? 'Unknown Genre'}</p>
                    {movie.country && (
                      <p className="text-white/60 text-xs mb-2">{movie.country}</p>
                    )}
                    <div className="space-y-1">
                  <div className="flex items-center text-white/60 text-sm">
                        <Calendar className="h-3 w-3 mr-2" />
                    {movie.releaseDate ? format(new Date(movie.releaseDate), 'MMM dd, yyyy') : 'Unknown release date'}
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
        <div className="text-center py-12">
          <Film className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
              {searchTerm || filters.genre ? 'No movies found' : 'No movies yet'}
          </h3>
          <p className="text-white/60 mb-6">
              {searchTerm || filters.genre
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first movie'}
          </p>
          <Link
            to="/movies/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Movie
          </Link>
        </div>
        )
      ) : (
        sortedMyMovies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedMyMovies.map((movie) => (
              <div
                key={movie._id}
                className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden hover:bg-white/20 transition-all group min-w-[10rem] min-h-[14rem]"
              >
                <div className="p-6">
                  {/* Action Buttons - Top Horizontal Row */}
                  <div className="flex justify-end items-center gap-2 mb-4">
                    <button
                      onClick={() => toggleFavorite(movie._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        favoriteIds.includes(movie._id)
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-white/10 text-white/60 hover:text-red-400 hover:bg-red-500/10'
                      }`}
                      title={favoriteIds.includes(movie._id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${favoriteIds.includes(movie._id) ? 'fill-current' : ''}`}> <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                    <button
                      onClick={() => toggleWatched(movie._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        watchedIds.includes(movie._id)
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-white/10 text-white/60 hover:text-green-400 hover:bg-green-500/10'
                      }`}
                      title={watchedIds.includes(movie._id) ? 'Mark as Unwatched' : 'Mark as Watched'}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${watchedIds.includes(movie._id) ? 'fill-current' : ''}`}>
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
                    {(
                      (typeof movie.userId === 'string' && movie.userId === user?.id) ||
                      (typeof movie.userId === 'object' && movie.userId._id === user?.id) ||
                      (isAdmin && isAdminCreated(movie))
                    ) && (
                      <>
                        <Link
                          to={`/movies/${movie._id}/edit`}
                          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit Movie"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(movie._id, movie.title ?? '')}
                          className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Movie"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Image and Title Side by Side */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative w-40 h-56 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                      <h3 className="font-semibold text-white text-lg mb-2">{movie.title ?? 'Untitled'}</h3>
                      <p className="text-blue-400 text-sm mb-1">{movie.genre ?? 'Unknown Genre'}</p>
                      {movie.country && (
                        <p className="text-white/60 text-xs mb-2">{movie.country}</p>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center text-white/60 text-sm">
                          <Calendar className="h-3 w-3 mr-2" />
                          {movie.releaseDate ? format(new Date(movie.releaseDate), 'MMM dd, yyyy') : 'Unknown release date'}
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
          <div className="text-center py-12">
            <Film className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No movies found</h3>
            <p className="text-white/60 mb-6">You haven't added any movies yet.</p>
            <Link
              to="/movies/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Movie
            </Link>
          </div>
        )
      )}
    </div>
  );
};

export default Movies;

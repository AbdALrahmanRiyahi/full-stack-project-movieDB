import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMovie, useCreateMovie, useUpdateMovie } from '../hooks/useMovies';
import { useDirectors } from '../hooks/useDirectors';
import { useActors } from '../hooks/useActors';
import { ArrowLeft, Save, X } from 'lucide-react';

const MovieForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');

  const { data: movie, isLoading: movieLoading } = useMovie(id || '');
  const { data: directors = [], isLoading: directorsLoading } = useDirectors();
  const { data: actors = [], isLoading: actorsLoading } = useActors();
  const createMovie = useCreateMovie();
  const updateMovie = useUpdateMovie();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    releaseDate: '',
    genre: '',
    duration: '',
    director: '',
    rating: '',
    imageUrl: '',
    country: '',
    teaserUrl: '',
  });

  const [selectedActors, setSelectedActors] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && movie) {
      setFormData({
        title: movie.title,
        description: movie.description,
        releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
        genre: movie.genre,
        duration: movie.duration?.toString() || '',
        director: typeof movie.director === 'string' ? movie.director : movie.director?._id || '',
        rating: movie.rating?.toString() || '',
        imageUrl: movie.imageUrl || '',
        country: movie.country || '',
        teaserUrl: movie.teaserUrl || '',
      });
      
      // Set selected actors
      if (movie.actors && Array.isArray(movie.actors)) {
        const actorIds = movie.actors.map(actor => 
          typeof actor === 'string' ? actor : actor._id
        );
        setSelectedActors(actorIds);
      }
    }
  }, [isEditing, movie]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleActorToggle = (actorId: string) => {
    setSelectedActors(prev => 
      prev.includes(actorId) 
        ? prev.filter(id => id !== actorId)
        : [...prev, actorId]
    );
  };

  const removeActor = (actorId: string) => {
    setSelectedActors(prev => prev.filter(id => id !== actorId));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.releaseDate) newErrors.releaseDate = 'Release date is required';
    if (!formData.genre.trim()) newErrors.genre = 'Genre is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    else if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be a positive number';
    }
    if (!formData.director) newErrors.director = 'Director is required';
    if (formData.rating && (isNaN(Number(formData.rating)) || Number(formData.rating) < 0 || Number(formData.rating) > 10)) {
      newErrors.rating = 'Rating must be between 0 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const movieData = {
        title: formData.title,
        description: formData.description,
        releaseDate: formData.releaseDate,
        genre: formData.genre,
        duration: Number(formData.duration),
        director: formData.director,
        actors: selectedActors,
        rating: formData.rating ? Number(formData.rating) : undefined,
        imageUrl: formData.imageUrl,
        country: formData.country,
        teaserUrl: formData.teaserUrl,
      };

      if (isEditing && id) {
        await updateMovie.mutateAsync({ id, data: movieData });
      } else {
        await createMovie.mutateAsync(movieData);
      }

      navigate('/movies');
    } catch (error: unknown) {
      console.error('Failed to save movie:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save movie';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (movieLoading || directorsLoading || actorsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/movies"
            className="inline-flex items-center text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Movies
          </Link>
          <h1 className="text-3xl font-bold text-white">
            {isEditing ? 'Edit Movie' : 'Add New Movie'}
          </h1>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">{errors.submit}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white/80 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.title ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="Enter movie title"
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Genre */}
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-white/80 mb-2">
                Genre *
              </label>
              <input
                type="text"
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.genre ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="e.g., Action, Drama, Comedy"
              />
              {errors.genre && <p className="text-red-400 text-sm mt-1">{errors.genre}</p>}
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-white/80 mb-2">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all border-white/20"
                placeholder="e.g., USA, France, Japan"
              />
            </div>

            {/* Release Date */}
            <div>
              <label htmlFor="releaseDate" className="block text-sm font-medium text-white/80 mb-2">
                Release Date *
              </label>
              <input
                type="date"
                id="releaseDate"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.releaseDate ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.releaseDate && <p className="text-red-400 text-sm mt-1">{errors.releaseDate}</p>}
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-white/80 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.duration ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="e.g., 120"
                min="1"
              />
              {errors.duration && <p className="text-red-400 text-sm mt-1">{errors.duration}</p>}
            </div>

            {/* Director */}
            <div>
              <label htmlFor="director" className="block text-sm font-medium text-white/80 mb-2">
                Director *
              </label>
              <select
                id="director"
                name="director"
                value={formData.director}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.director ? 'border-red-500' : 'border-white/20'
                }`}
              >
                <option value="" className="bg-slate-800">Select a director</option>
                {directors.map(director => (
                  <option key={director._id} value={director._id} className="bg-slate-800">
                    {director.name}
                  </option>
                ))}
              </select>
              {errors.director && <p className="text-red-400 text-sm mt-1">{errors.director}</p>}
            </div>

            {/* Actors */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Actors
              </label>
              <div className="space-y-2">
                {/* Selected Actors */}
                {selectedActors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedActors.map(actorId => {
                      const actor = actors.find(a => a._id === actorId);
                      return actor ? (
                        <span
                          key={actorId}
                          className="inline-flex items-center px-2 py-1 bg-orange-500/20 text-orange-300 text-sm rounded-lg border border-orange-500/30"
                        >
                          {actor.name}
                          <button
                            type="button"
                            onClick={() => removeActor(actorId)}
                            className="ml-2 text-orange-400 hover:text-orange-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                
                {/* Actor Selection */}
                <div className="max-h-32 overflow-y-auto border border-white/20 rounded-lg bg-white/5">
                  {actors.map(actor => (
                    <label
                      key={actor._id}
                      className={`flex items-center px-3 py-2 cursor-pointer hover:bg-white/10 transition-colors ${
                        selectedActors.includes(actor._id) ? 'bg-orange-500/20' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedActors.includes(actor._id)}
                        onChange={() => handleActorToggle(actor._id)}
                        className="mr-3 rounded border-white/30 bg-white/10 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-white/80 text-sm">{actor.name}</span>
                    </label>
                  ))}
                </div>
                {actors.length === 0 && (
                  <p className="text-white/50 text-sm italic">No actors available. Add some actors first.</p>
                )}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-white/80 mb-2">
                Rating (0-10)
              </label>
              <input
                type="number"
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.rating ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="e.g., 8.5"
                min="0"
                max="10"
                step="0.1"
              />
              {errors.rating && <p className="text-red-400 text-sm mt-1">{errors.rating}</p>}
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-white/80 mb-2">
                Image URL
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all border-white/20"
                placeholder="Paste an image URL (optional)"
              />
            </div>

            {/* Trailer URL */}
            <div>
              <label htmlFor="teaserUrl" className="block text-sm font-medium text-white/80 mb-2">
                Trailer URL
              </label>
              <input
                type="text"
                id="teaserUrl"
                name="teaserUrl"
                value={formData.teaserUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all border-white/20"
                placeholder="Paste a video URL (YouTube, Vimeo, etc.)"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                errors.description ? 'border-red-500' : 'border-white/20'
              }`}
              placeholder="Enter movie description"
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              to="/movies"
              className="px-6 py-2 text-white/70 hover:text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Movie' : 'Create Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm;

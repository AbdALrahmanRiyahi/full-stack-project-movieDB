import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDirector, useCreateDirector, useUpdateDirector } from '../hooks/useDirectors';
import { ArrowLeft, Save } from 'lucide-react';

const DirectorForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');

  const { data: director, isLoading: directorLoading } = useDirector(id || '');
  const createDirector = useCreateDirector();
  const updateDirector = useUpdateDirector();

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    birthDate: '',
    nationality: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && director) {
      setFormData({
        name: director.name || '',
        bio: director.bio || '',
        birthDate: director.birthDate ? director.birthDate.split('T')[0] : '',
        nationality: director.nationality || '',
        imageUrl: director.imageUrl || '',
      });
    }
  }, [isEditing, director]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.bio.trim()) newErrors.bio = 'Biography is required';
    if (!formData.birthDate) newErrors.birthDate = 'Birth date is required';
    if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const directorData = {
        name: formData.name,
        bio: formData.bio,
        birthDate: formData.birthDate,
        nationality: formData.nationality,
        imageUrl: formData.imageUrl,
      };

      if (isEditing && id) {
        await updateDirector.mutateAsync({ id, data: directorData });
      } else {
        await createDirector.mutateAsync(directorData);
      }

      navigate('/directors');
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save director' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (directorLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/directors"
            className="inline-flex items-center text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Directors
          </Link>
          <h1 className="text-3xl font-bold text-white">
            {isEditing ? 'Edit Director' : 'Add New Director'}
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
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="Enter director's full name"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-white/80 mb-2">
                Nationality *
              </label>
              <input
                type="text"
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.nationality ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="e.g., American, British, French"
              />
              {errors.nationality && <p className="text-red-400 text-sm mt-1">{errors.nationality}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="birthDate" className="block text-sm font-medium text-white/80 mb-2">
                Birth Date *
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.birthDate ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.birthDate && <p className="text-red-400 text-sm mt-1">{errors.birthDate}</p>}
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-white/80 mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.imageUrl ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.imageUrl && <p className="text-red-400 text-sm mt-1">{errors.imageUrl}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-white/80 mb-2">
              Biography *
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={6}
              value={formData.bio}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none ${
                errors.bio ? 'border-red-500' : 'border-white/20'
              }`}
              placeholder="Enter director's biography..."
            />
            {errors.bio && <p className="text-red-400 text-sm mt-1">{errors.bio}</p>}
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              to="/directors"
              className="px-6 py-2 text-white/70 hover:text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Director' : 'Create Director'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DirectorForm;

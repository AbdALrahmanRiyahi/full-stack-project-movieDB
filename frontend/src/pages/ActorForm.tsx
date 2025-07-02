import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useActor, useCreateActor, useUpdateActor } from '../hooks/useActors';
import { ArrowLeft, Save } from 'lucide-react';

const ActorForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');

  const { data: actor, isLoading: actorLoading } = useActor(id || '');
  const createActor = useCreateActor();
  const updateActor = useUpdateActor();

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
    if (isEditing && actor) {
      setFormData({
        name: actor.name || '',
        bio: actor.bio || '',
        birthDate: actor.birthDate ? actor.birthDate.split('T')[0] : '',
        nationality: actor.nationality || '',
        imageUrl: actor.imageUrl || '',
      });
    }
  }, [isEditing, actor]);

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
      const actorData = {
        name: formData.name,
        bio: formData.bio,
        birthDate: formData.birthDate,
        nationality: formData.nationality,
        imageUrl: formData.imageUrl,
      };

      if (isEditing && id) {
        await updateActor.mutateAsync({ id, data: actorData });
      } else {
        await createActor.mutateAsync(actorData);
      }

      navigate('/actors');
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save actor' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (actorLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/actors"
            className="inline-flex items-center text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Actors
          </Link>
          <h1 className="text-3xl font-bold text-white">
            {isEditing ? 'Edit Actor' : 'Add New Actor'}
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
                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="Enter actor's full name"
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
                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
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
                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
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
                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
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
              className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none ${
                errors.bio ? 'border-red-500' : 'border-white/20'
              }`}
              placeholder="Enter actor's biography..."
            />
            {errors.bio && <p className="text-red-400 text-sm mt-1">{errors.bio}</p>}
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              to="/actors"
              className="px-6 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Actor' : 'Add Actor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActorForm; 
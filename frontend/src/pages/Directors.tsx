import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDirectors, useDeleteDirector } from '../hooks/useDirectors';
import { Users, Plus, Search, Trash2, Edit, Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { Director } from '../types';

const Directors: React.FC = () => {
  const { data: directors = [], isLoading } = useDirectors();
  const deleteDirector = useDeleteDirector();
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const filteredDirectors = directors.filter(director =>
    director.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (director.nationality?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (director.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteDirector.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete director:', error);
      }
    }
  };

  // Helper to check if a director was created by any admin
  const isAdminCreated = (director: Director) => {
    if (typeof director.userId === 'object' && director.userId.role === 'admin') return true;
    if (typeof director.userId === 'string' && isAdmin) return true;
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Directors</h1>
          <p className="text-white/60 mt-2">Manage your director collection</p>
        </div>
        <Link
          to="/directors/new"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Director
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <input
            type="text"
            placeholder="Search directors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Directors Grid */}
      {filteredDirectors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDirectors.map((director) => (
            <div
              key={director._id}
              className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden hover:bg-white/20 transition-all group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {director.imageUrl ? (
                        <img src={director.imageUrl} alt={director.name} className="object-cover w-full h-full rounded-full" />
                      ) : (
                        <Users className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg">{director.name}</h3>
                      <p className="text-purple-400 text-sm">{director.nationality ?? 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Link
                      to={`/directors/${director._id}`}
                      className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-full transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
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
                          onClick={() => handleDelete(director._id, director.name)}
                          className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-white/60 text-sm mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  Born: {director.birthDate ? format(new Date(director.birthDate), 'MMM dd, yyyy') : 'Unknown'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchTerm ? 'No directors found' : 'No directors yet'}
          </h3>
          <p className="text-white/60 mb-6">
            {searchTerm
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first director'
            }
          </p>
          <Link
            to="/directors/new"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Director
          </Link>
        </div>
      )}
    </div>
  );
};

export default Directors;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useActors, useDeleteActor } from '../hooks/useActors';
import { Users, Plus, Search, Trash2, Edit, Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { Actor } from '../types';

const Actors: React.FC = () => {
  const { data: actors = [], isLoading } = useActors();
  const deleteActor = useDeleteActor();
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const filteredActors = actors.filter(actor =>
    actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (actor.nationality?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (actor.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteActor.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete actor:', error);
      }
    }
  };

  // Helper to check if an actor was created by any admin
  const isAdminCreated = (actor: Actor) => {
    if (typeof actor.userId === 'object' && actor.userId.role === 'admin') return true;
    if (typeof actor.userId === 'string' && isAdmin) return true;
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Actors</h1>
          <p className="text-white/60 mt-2">Manage your actor collection</p>
        </div>
        <Link
          to="/actors/new"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Actor
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <input
            type="text"
            placeholder="Search actors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Actors Grid */}
      {filteredActors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActors.map((actor) => (
            <div
              key={actor._id}
              className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden hover:bg-white/20 transition-all group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-40 h-40 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {actor.imageUrl ? (
                        <img src={actor.imageUrl} alt={actor.name} className="object-cover w-full h-full rounded-full" />
                      ) : (
                        <Users className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg">{actor.name}</h3>
                      <p className="text-orange-400 text-sm">{actor.nationality ?? 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Link
                      to={`/actors/${actor._id}`}
                      className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-full transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
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
                          onClick={() => handleDelete(actor._id, actor.name)}
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
                  Born: {actor.birthDate ? format(new Date(actor.birthDate), 'MMM dd, yyyy') : 'Unknown'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchTerm ? 'No actors found' : 'No actors yet'}
          </h3>
          <p className="text-white/60 mb-6">
            {searchTerm
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first actor'
            }
          </p>
          <Link
            to="/actors/new"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Actor
          </Link>
        </div>
      )}
    </div>
  );
};

export default Actors; 
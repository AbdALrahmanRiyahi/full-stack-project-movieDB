import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import MovieForm from './pages/MovieForm';
import Directors from './pages/Directors';
import DirectorDetails from './pages/DirectorDetails';
import DirectorForm from './pages/DirectorForm';
import Actors from './pages/Actors';
import ActorDetails from './pages/ActorDetails';
import ActorForm from './pages/ActorForm';
import Favorites from './pages/Favorites';
import Watched from './pages/Watched';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="movies" element={<Movies />} />
              <Route path="movies/new" element={<MovieForm />} />
              <Route path="movies/:id" element={<MovieDetails />} />
              <Route path="movies/:id/edit" element={<MovieForm />} />
              <Route path="directors" element={<Directors />} />
              <Route path="directors/new" element={<DirectorForm />} />
              <Route path="directors/:id" element={<DirectorDetails />} />
              <Route path="directors/:id/edit" element={<DirectorForm />} />
              <Route path="actors" element={<Actors />} />
              <Route path="actors/new" element={<ActorForm />} />
              <Route path="actors/:id" element={<ActorDetails />} />
              <Route path="actors/:id/edit" element={<ActorForm />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="watched" element={<Watched />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
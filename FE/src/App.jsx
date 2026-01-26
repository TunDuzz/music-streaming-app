import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';

// Shared
import PrivateRoute from './components/shared/PrivateRoute';
import AdminRoute from './components/shared/AdminRoute';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';

// Auth pages
import Landing from './pages/auth/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Music pages
import Home from './pages/music/Home';
import Search from './pages/music/Search';
import Library from './pages/music/Library';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ArtistManagement from './pages/admin/ArtistManagement';
import SongManagement from './pages/admin/SongManagement';
import GenreManagement from './pages/admin/GenreManagement';
import PlaylistManagement from './pages/admin/PlaylistManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Main App */}
          <Route path="/app/*" element={
            <PrivateRoute>
              <PlayerProvider>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="*" element={<Navigate to="/app" replace />} />
                  </Routes>
                </AppLayout>
              </PlayerProvider>
            </PrivateRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/artists" element={<ArtistManagement />} />
                  <Route path="/songs" element={<SongManagement />} />
                  <Route path="/genres" element={<GenreManagement />} />
                  <Route path="/playlists" element={<PlaylistManagement />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </AdminLayout>
            </AdminRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

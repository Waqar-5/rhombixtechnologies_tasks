import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import SavedPostsPage from './pages/SavedPostsPage';
import SinglePostPage from './pages/SinglePostPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#232834',
                color: '#F2F0EB',
                border: '1px solid #2C313D',
              },
            }}
          />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <FeedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:username"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <FriendsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <SavedPostsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post/:postId"
              element={
                <ProtectedRoute>
                  <SinglePostPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

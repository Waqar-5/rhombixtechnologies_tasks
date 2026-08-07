import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import CookieConsent from './components/ui/CookieConsent';
import { PageLoader } from './components/ui/Spinner';

import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Landing + auth pages are eager — they're the entry points most people
// hit first, so there's no benefit to lazy-loading them. Everything behind
// a login (dashboard, admin) is lazy-loaded to keep the initial bundle lean.
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import NotFoundPage from './pages/NotFoundPage';

const BlogsPage = lazy(() => import('./pages/BlogsPage'));
const SingleBlogPage = lazy(() => import('./pages/SingleBlogPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const AuthorProfilePage = lazy(() => import('./pages/AuthorProfilePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

const DashboardHome = lazy(() => import('./pages/user/DashboardHome'));
const MyBlogsPage = lazy(() => import('./pages/user/MyBlogsPage'));
const WriteBlogPage = lazy(() => import('./pages/user/WriteBlogPage'));
const BookmarksPage = lazy(() => import('./pages/user/BookmarksPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/user/SettingsPage'));
const NotificationsPage = lazy(() => import('./pages/user/NotificationsPage'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminBlogsPage = lazy(() => import('./pages/admin/AdminBlogsPage'));
const AdminCommentsPage = lazy(() => import('./pages/admin/AdminCommentsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminTagsPage = lazy(() => import('./pages/admin/AdminTagsPage'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Public site */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blogs/:slug" element={<SingleBlogPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/authors/:id" element={<AuthorProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Route>

          {/* Auth (standalone layout, no navbar/footer) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

          {/* Authenticated user dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/my-blogs" element={<MyBlogsPage />} />
              <Route path="/dashboard/write" element={<WriteBlogPage />} />
              <Route path="/dashboard/write/:id" element={<WriteBlogPage />} />
              <Route path="/dashboard/bookmarks" element={<BookmarksPage />} />
              <Route path="/dashboard/profile" element={<ProfilePage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route path="/dashboard/notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          {/* Admin panel */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/blogs" element={<AdminBlogsPage />} />
              <Route path="/admin/comments" element={<AdminCommentsPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/tags" element={<AdminTagsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
        <CookieConsent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

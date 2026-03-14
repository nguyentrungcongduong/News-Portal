import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PostList from './pages/PostList';
import CreatePost from './pages/CreatePost';

import CategoryList from './pages/CategoryList';
import CommentList from './pages/CommentList';
import AdList from './pages/AdList';
import NotificationList from './pages/NotificationList';
import ModerationDashboard from './pages/ModerationDashboard';
import BreakingNewsList from './pages/BreakingNewsList';
import NotificationPreferences from './pages/NotificationPreferences';
import NotificationAnalytics from './pages/NotificationAnalytics';
import AuthorRequestList from './pages/AuthorRequestList';
import UserList from './pages/UserList';
import ReviewList from './pages/ReviewList';
import ReviewDetail from './pages/ReviewDetail';
import AuditLogList from './pages/AuditLogList';
import PagesListPage from './pages/PagesListPage';
import PageBuilderPage from './pages/PageBuilderPage';
import TagsPage from './pages/TagsPage';
import MenuManagement from './pages/MenuManagement';
import MenuBuilderPage from './pages/MenuBuilderPage';

import { AuthProvider } from './contexts/AuthContext';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<RequireAuth />}>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="posts" element={<PostList />} />
              <Route path="posts/create" element={<CreatePost />} />
              <Route path="posts/edit/:id" element={<CreatePost />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="comments" element={<CommentList />} />
              <Route path="ads" element={<AdList />} />
              <Route path="moderation" element={<ModerationDashboard />} />
              <Route path="announcements" element={<NotificationList />} />
              <Route path="breaking-news" element={<BreakingNewsList />} />
              <Route path="settings/notifications" element={<NotificationPreferences />} />
              <Route path="statistics/notifications" element={<NotificationAnalytics />} />
              <Route path="author-requests" element={<AuthorRequestList />} />
              <Route path="users" element={<UserList />} />
              <Route path="review" element={<ReviewList />} />
              <Route path="review/:id" element={<ReviewDetail />} />
              <Route path="audit-logs" element={<AuditLogList />} />
              
              {/* Page Builder Routes */}
              <Route path="pages" element={<PagesListPage />} />
              <Route path="pages/create" element={<PageBuilderPage />} />
              <Route path="pages/:id/edit" element={<PageBuilderPage />} />
              
              {/* Tags Management */}
              <Route path="tags" element={<TagsPage />} />

              {/* Menu Management */}
              <Route path="menus" element={<MenuManagement />} />
              <Route path="menus/:id/builder" element={<MenuBuilderPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import AdminLayout from './layouts/AdminLayout';
import { AuthProvider } from './contexts/AuthContext';
import RequireAuth from './components/RequireAuth';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PostList = lazy(() => import('./pages/PostList'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const CategoryList = lazy(() => import('./pages/CategoryList'));
const CommentList = lazy(() => import('./pages/CommentList'));
const AdList = lazy(() => import('./pages/AdList'));
const NotificationList = lazy(() => import('./pages/NotificationList'));
const ModerationDashboard = lazy(() => import('./pages/ModerationDashboard'));
const BreakingNewsList = lazy(() => import('./pages/BreakingNewsList'));
const NotificationPreferences = lazy(() => import('./pages/NotificationPreferences'));
const NotificationAnalytics = lazy(() => import('./pages/NotificationAnalytics'));
const AuthorRequestList = lazy(() => import('./pages/AuthorRequestList'));
const UserList = lazy(() => import('./pages/UserList'));
const ReviewList = lazy(() => import('./pages/ReviewList'));
const ReviewDetail = lazy(() => import('./pages/ReviewDetail'));
const AuditLogList = lazy(() => import('./pages/AuditLogList'));
const PagesListPage = lazy(() => import('./pages/PagesListPage'));
const PageBuilderPage = lazy(() => import('./pages/PageBuilderPage'));
const TagsPage = lazy(() => import('./pages/TagsPage'));
const MenuManagement = lazy(() => import('./pages/MenuManagement'));
const MenuBuilderPage = lazy(() => import('./pages/MenuBuilderPage'));

const PageLoader = () => (
  <div style={{ minHeight: '40vh', display: 'grid', placeItems: 'center' }}>
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
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
                <Route path="pages" element={<PagesListPage />} />
                <Route path="pages/create" element={<PageBuilderPage />} />
                <Route path="pages/:id/edit" element={<PageBuilderPage />} />
                <Route path="tags" element={<TagsPage />} />
                <Route path="menus" element={<MenuManagement />} />
                <Route path="menus/:id/builder" element={<MenuBuilderPage />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

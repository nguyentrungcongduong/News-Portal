import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Button, notification } from 'antd';
import { DashboardOutlined, FileTextOutlined, LogoutOutlined, FolderOutlined, CommentOutlined, DollarOutlined, NotificationOutlined, BellOutlined, SafetyCertificateOutlined, UserOutlined, UsergroupAddOutlined, SettingOutlined, BarChartOutlined, CheckCircleOutlined, HistoryOutlined, TagOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Badge, Dropdown, List, Typography, Avatar } from 'antd';
import api from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { io } from 'socket.io-client';

dayjs.extend(relativeTime);

const { Header, Content, Sider } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const isEditor = user?.role === 'editor';
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
        const response = await api.get('/api/admin/notifications');
        setNotifications(response.data.data);
        // Backend returns paginated data, data property contains the items
        const items = response.data.data;
        setUnreadCount(items.filter(n => !n.read_at).length);
    } catch (error) {
        console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    if (user) {
        fetchNotifications();
        
        // Polling fallback
        const interval = setInterval(fetchNotifications, 60000);

        // Socket.IO Connection (Optional - graceful degradation)
        try {
            const socketUrl = import.meta.env.VITE_SOCKET_URL || "https://news-portal-api-qh1p.onrender.com";
            const socket = io(socketUrl, {
                reconnection: true,
                reconnectionAttempts: 3,
                reconnectionDelay: 5000,
                timeout: 10000
            });
            
            socket.on('connect', () => {
                 console.log('Connected to socket server');
                 socket.emit('join_admin');
            });

            socket.on('connect_error', (error) => {
                console.warn('Socket.IO not available, using polling fallback');
            });

            // Listen for realtime admin events
            socket.on('comment_reported', (data) => {
                 notification.warning({
                      message: 'Có báo cáo vi phạm mới',
                      description: `Bình luận tại bài "${data.post_title}" bị báo cáo: ${data.reason}`,
                      placement: 'bottomRight',
                      duration: 5,
                      onClick: () => navigate('/comments?status=reported')
                 });
                 fetchNotifications();
            });

            socket.on('post_pending', (data) => {
                 notification.info({
                      message: 'Bài viết chờ duyệt',
                      description: `"${data.title}" từ ${data.user_name}`,
                      placement: 'bottomRight'
                 });
                 fetchNotifications();
            });

            socket.on('system_alert', (data) => {
                 notification.error({
                      message: data.title,
                      description: data.reason,
                      placement: 'bottomRight'
                 });
                 fetchNotifications();
            });

            return () => {
                 clearInterval(interval);
                 socket.disconnect();
            };
        } catch (error) {
            console.warn('Socket.IO initialization failed, continuing without real-time updates');
            return () => clearInterval(interval);
        }
    }
  }, [user]);

  const getNotificationIcon = (type) => {
      switch (type) {
          case 'comment_reported': return <SafetyCertificateOutlined style={{ color: '#ff4d4f' }} />;
          case 'post_pending': return <FileTextOutlined style={{ color: '#1890ff' }} />;
          case 'post_published': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
          case 'post_rejected': return <LogoutOutlined style={{ color: '#faad14' }} />;
          case 'system_alert': return <NotificationOutlined style={{ color: '#ff7875' }} />;
          case 'author_request': return <UsergroupAddOutlined style={{ color: '#722ed1' }} />;
          default: return <BellOutlined />;
      }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read_at) {
        await api.post(`/api/admin/notifications/${notif.id}/read`);
        fetchNotifications();
    }

    // Redirect based on type
    const data = notif.data || {};
    switch (notif.type) {
        case 'comment_reported':
            navigate('/comments?status=reported');
            break;
        case 'comment_pending':
            navigate('/comments?status=pending');
            break;
        case 'post_pending':
        case 'post_approved':
            navigate('/review'); // Go to review room
            break;
        case 'post_published':
        case 'post_rejected':
            navigate('/posts');
            break;
        case 'breaking_news':
            navigate('/announcements');
            break;
        case 'ad_quota':
            navigate('/ads');
            break;
        case 'author_request':
            navigate('/author-requests');
            break;
        default:
            break;
    }
  };

  const getNotificationText = (notif) => {
      const { type, data } = notif;
      if (!data) return notif.message || notif.title || 'Thông báo mới';

      switch (type) {
          case 'comment_reported':
              return `Bình luận tại bài "${data.post_title || '...'}" bị báo cáo: ${data.reason}`;
          case 'comment_pending':
              return `Bình luận mới từ ${data.user_name} cần duyệt tại bài "${data.post_title}"`;
          case 'post_pending':
              return `Bài viết mới chờ duyệt: "${data.title}" từ ${data.submitted_by}`;
          case 'post_approved':
              return `Bài viết "${data.title}" đã được Editor ${data.approved_by} duyệt, sẵn sàng để xuất bản.`;
          case 'post_published':
              return `Bài viết "${data.title}" đã được xuất bản bởi ${data.published_by}`;
          case 'post_rejected':
              return `Bài viết "${data.title}" bị từ chối: ${data.reason}`;
          case 'breaking_news':
              return `Tin nóng mới: "${data.title}"`;
          case 'ad_quota':
              return `Quảng cáo "${data.ad_name}" sắp hết quota (${data.type}: ${data.current}/${data.quota})`;
          case 'author_request':
              return `Yêu cầu làm Tác giả mới từ ${data.user_name || 'người dùng'}`;
          case 'system_alert':
              return data.reason || notif.message || 'Cảnh báo hệ thống';
          default:
              return notif.message || notif.title || 'Thông báo mới từ hệ thống';
      }
  };

  const notificationMenu = (
      <div style={{ background: 'white', width: 380, boxShadow: '0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
              <Typography.Text strong style={{ fontSize: '16px' }}>Thông báo</Typography.Text>
              <div style={{ display: 'flex', gap: '8px' }}>
                  {unreadCount > 0 && <Button type="text" size="small" style={{ color: '#1890ff', fontSize: '12px' }} onClick={async (e) => {
                      e.stopPropagation();
                      try {
                          await api.post('/api/admin/notifications/read-all');
                          fetchNotifications();
                      } catch (err) {
                          console.error('Failed to mark all read', err);
                      }
                  }}>Đánh dấu đã đọc</Button>}
              </div>
          </div>
          <div style={{ maxHeight: 450, overflowY: 'auto' }}>
              {notifications && notifications.length > 0 ? (
                  notifications.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        style={{ 
                            padding: '16px 20px', 
                            cursor: 'pointer', 
                            borderBottom: '1px solid #f5f5f5',
                            background: item.read_at ? 'transparent' : '#f0faff',
                            transition: 'all 0.2s',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = item.read_at ? '#fafafa' : '#e6f7ff'}
                        onMouseLeave={(e) => e.currentTarget.style.background = item.read_at ? 'transparent' : '#f0faff'}
                      >
                          <Avatar 
                             icon={getNotificationIcon(item.type)} 
                             style={{ 
                                background: item.read_at ? '#f5f5f5' : '#e6f7ff',
                                flexShrink: 0
                             }} 
                          />
                          <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                  <Typography.Text strong={!item.read_at} style={{ fontSize: '14px', color: '#262626' }}>
                                      {item.title || (item.type === 'comment_reported' ? 'Báo cáo vi phạm' : 'Thông báo hệ thống')}
                                  </Typography.Text>
                                  {!item.read_at && <Badge status="processing" color="#1890ff" />}
                              </div>
                              <div style={{ 
                                  fontSize: '13px', 
                                  color: item.read_at ? '#8c8c8c' : '#595959',
                                  lineHeight: '1.4',
                                  marginBottom: 8
                              }}>
                                  {getNotificationText(item)}
                              </div>
                              <div style={{ fontSize: '11px', color: '#bfbfbf', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <HistoryOutlined style={{ fontSize: '10px' }} />
                                  {dayjs(item.created_at).fromNow()}
                              </div>
                          </div>
                      </div>
                  ))
              ) : (
                  <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                      <BellOutlined style={{ fontSize: '48px', color: '#f0f0f0', marginBottom: 16 }} />
                      <div style={{ color: '#bfbfbf', fontSize: '14px' }}>Không có thông báo mới</div>
                  </div>
              )}
          </div>
          <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
              <Button type="link" size="small" onClick={() => navigate('/announcements')} style={{ fontSize: '13px' }}>Xem tất cả thông báo</Button>
          </div>
      </div>
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine active menu key based on current path
  // If path is /posts/create, active key should be /posts
  const getSelectedKey = () => {
      if (location.pathname.startsWith('/posts')) return '/posts';
      if (location.pathname.startsWith('/review')) return '/review';
      if (location.pathname.startsWith('/moderation')) return '/moderation';
      if (location.pathname.startsWith('/pages')) return '/pages';
      if (location.pathname.startsWith('/menus')) return '/menus';
      return location.pathname;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            {collapsed ? 'CMS' : 'NEWS ADMIN'}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={['/dashboard']}
          selectedKeys={[getSelectedKey()]}
          mode="inline"
          items={[
            {
              key: '/dashboard',
              icon: <DashboardOutlined />,
              label: 'Dashboard',
              onClick: () => navigate('/dashboard'),
            },
            {
              key: '/posts',
              icon: <FileTextOutlined />,
              label: 'Quản lý bài viết',
              onClick: () => navigate('/posts'),
            },
            {
              key: '/review',
              icon: <CheckCircleOutlined />,
              label: 'Phòng biên tập',
              onClick: () => navigate('/review'),
            },
            {
              key: '/categories',
              icon: <FolderOutlined />,
              label: 'Quản lý chuyên mục',
              onClick: () => navigate('/categories'),
            },
            !isEditor && {
              key: '/tags',
              icon: <TagOutlined />,
              label: '🏷️ Quản lý Tags',
              onClick: () => navigate('/tags'),
            },
            // Editor KHÔNG được truy cập Moderation Dashboard và Audit Logs
            !isEditor && {
              key: '/moderation',
              icon: <SafetyCertificateOutlined />,
              label: 'Trung tâm kiểm soát',
              onClick: () => navigate('/moderation'),
            },
            !isEditor && {
              key: '/audit-logs',
              icon: <HistoryOutlined />,
              label: 'Audit Logs',
              onClick: () => navigate('/audit-logs'),
            },
            {
              key: '/comments',
              icon: <CommentOutlined />,
              label: 'Quản lý bình luận',
              onClick: () => navigate('/comments'),
            },
            // Editor KHÔNG được quản lý Ads, Breaking News, Users, Settings
            !isEditor && {
              key: '/ads',
              icon: <DollarOutlined />,
              label: 'Quản lý quảng cáo',
              onClick: () => navigate('/ads'),
            },
            !isEditor && {
              key: '/pages',
              icon: <FileTextOutlined />,
              label: '📄 Page Builder',
              onClick: () => navigate('/pages'),
            },
            !isEditor && {
              key: '/menus',
              icon: <SettingOutlined />,
              label: '🗺️ Quản lý Menu',
              onClick: () => navigate('/menus'),
            },
            !isEditor && {
              key: '/breaking-news',
              icon: <NotificationOutlined />,
              label: 'Breaking News 🔴',
              onClick: () => navigate('/breaking-news'),
            },
            !isEditor && {
                 key: 'author-management',
                 icon: <UserOutlined />,
                 label: 'Quản lý nhân sự',
                 children: [
                    {
                        key: '/author-requests',
                        label: 'Duyệt Author mới',
                        onClick: () => navigate('/author-requests'),
                    },
                    {
                        key: '/users',
                        label: 'Danh sách nhân viên',
                        onClick: () => navigate('/users'),
                    }
                 ]
            },
            {
                key: 'notification-center',
                icon: <BellOutlined />,
                label: 'Trung tâm thông báo',
                children: [
                    {
                        key: '/announcements',
                        label: 'Thông báo hệ thống',
                        onClick: () => navigate('/announcements'),
                    },
                    // Editor KHÔNG được truy cập Settings và Statistics
                    !isEditor && {
                        key: '/settings/notifications',
                        label: 'Cài đặt thông báo',
                        onClick: () => navigate('/settings/notifications'),
                    },
                    !isEditor && {
                        key: '/statistics/notifications',
                        label: 'Thống kê & Analytics',
                        onClick: () => navigate('/statistics/notifications'),
                    },
                ].filter(Boolean)
            },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Đăng xuất',
                danger: true,
                onClick: handleLogout
            }
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h2 style={{ margin: 0 }}>News Portal CMS</h2>
             <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Dropdown popupRender={() => notificationMenu} trigger={['click']} placement="bottomRight">
                    <Badge count={unreadCount} overflowCount={99} size="small">
                        <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
                    </Badge>
                </Dropdown>
                {user && <span>Welcome, <strong>{user.name}</strong></span>}
             </div>
        </Header>
        <Content style={{ margin: '16px 16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

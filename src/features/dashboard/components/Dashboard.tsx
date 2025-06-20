import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Avatar, Badge, Typography, Space, message, notification } from 'antd';
import {
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  ProjectOutlined,
  DashboardOutlined,
  TeamOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import useAuthStore from '@common/store/authStore';
import api from '@common/utils/axiosetup';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [userToApprove, setUserToApprove] = useState<any | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const clearToken = useAuthStore((state) => state.clearToken);
  const username = useAuthStore((state) => state.username);
  const usertype = useAuthStore((state) => state.usertype);
  const djangoUserType = useAuthStore((state) => state.django_user_type);
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  // Determine selected menu key based on current path
  const getSelectedKey = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/dashboard/projects')) return 'projects';
    if (path.includes('/dashboard/adminusers')) return 'adminusers';
    if (path.includes('/dashboard/users')) return 'users';
    if (path.includes('/dashboard/profile')) return 'profile';
    if (path.includes('/dashboard/settings')) return 'settings';
    return 'overview';
  };

  const [selectedKey, setSelectedKey] = useState<string>(getSelectedKey());

  useEffect(() => {
    setSelectedKey(getSelectedKey());
  }, [location]);

  // Fetch pending approvals for projectadmin
  const fetchPendingApprovals = async () => {
    try {
      const response = await api.get('/authentication/userdetail/pending/');
      const pending = Array.isArray(response.data)
        ? response.data
        : [];
      setPendingUsers(pending);
      setPendingApprovalCount(pending.length);
    } catch (_error) { // Changed error to _error
      // Optionally handle error
      message.error('Failed to fetch pending approvals.');
    }
  };

  useEffect(() => {
    if (djangoUserType === 'projectadmin') {
      fetchPendingApprovals();
    }
  }, [djangoUserType]);

  // Show notification when pendingUsers changes and is > 0
  useEffect(() => {
    if (pendingUsers.length > 0) {
      pendingUsers.forEach((user: any) => {
        notification.info({
          message: 'Pending User Approval',
          description: (
            <div>
              <div>{`User: ${user.name} (${user.email})`}</div>
              <div style={{ marginTop: 8 }}>
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    navigate('/dashboard/profile');
                    setUserToApprove(user);
                  }}
                >
                  Click to Approve
                </a>
              </div>
            </div>
          ),
          duration: 0,
          key: `pending-user-${user.id}`,
        });
      });
    }
  }, [pendingUsers, navigate]);

  // Callback to handle approval success from UserDetail
  const handleApprovalSuccess = (approvedUserId: number) => {
    // Remove approved user from pendingUsers
    const updatedPendingUsers = pendingUsers.filter(user => user.id !== approvedUserId);
    setPendingUsers(updatedPendingUsers);
    setPendingApprovalCount(updatedPendingUsers.length);
    setUserToApprove(null);
    message.success('User approved successfully.');
    fetchPendingApprovals();
  };

  const handleMenuClick = (e: any) => {
    setSelectedKey(e.key);
    switch (e.key) {
      case 'overview':
        navigate('/dashboard', { replace: true });
        break;
      case 'projects':
        navigate('/dashboard/projects', { replace: true });
        break;
      case 'adminusers':
        navigate('/dashboard/adminusers', { replace: true });
        break;
      case 'users':
        navigate('/dashboard/users', { replace: true });
        break;
      case 'profile':
        navigate('/dashboard/profile', { replace: true });
        break;
      case 'settings':
        navigate('/dashboard/settings', { replace: true });
        break;
      default:
        navigate('/dashboard', { replace: true });
    }
  };

  const handleUserMenuClick = (e: any) => {
    if (e.key === 'profile') {
      navigate('/dashboard/profile');
    } else if (e.key === 'logout') {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    try {
      if (!token || !refreshToken) {
        message.error('No valid tokens found. Please login again.');
        navigate('/login');
        return;
      }
      await api.post(
        '/authentication/logout/',
        { refresh: refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      clearToken();
      message.success('Logged out successfully');
      navigate('/login');
    } catch (_error) { // Changed error to _error
      message.error('Logout failed. Please try again.');
    }
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    { type: 'divider' as 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 64, margin: 16, background: 'rgba(255, 255, 255, 0.3)', color: 'white', fontSize: 24, textAlign: 'center', lineHeight: '64px', fontWeight: 'bold' }}>
          Logo
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={
            djangoUserType === 'adminuser'
              ? []
              : usertype === 'master'
              ? [
                  { key: 'overview', icon: <DashboardOutlined />, label: 'Overview' },
                  { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
                  { key: 'projects', icon: <ProjectOutlined />, label: 'Projects' },
                  { key: 'adminusers', icon: <TeamOutlined />, label: 'Admin Users' },
                ]
              : ['client', 'epc', 'contractor'].includes(usertype ?? '')
              ? [
                  { key: 'users', icon: <UserOutlined />, label: 'Users' },
                ]
              : []
          }
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: 20 }}>
            {selectedKey.charAt(0).toUpperCase() + selectedKey.slice(1)}
          </Text>
          <Space size="middle" align="center">
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#333' }}>
              Welcome, {username || 'User'}
            </Text>
            <Badge count={pendingApprovalCount} size="small">
              <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight" arrow>
              <Avatar style={{ backgroundColor: '#7265e6', cursor: 'pointer' }} icon={<UserOutlined />} />
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', minHeight: 360 }}>
          <Outlet context={{ userToApprove, onApprovalSuccess: handleApprovalSuccess }} />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;

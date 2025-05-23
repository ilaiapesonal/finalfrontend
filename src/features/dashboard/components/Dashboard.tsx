import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Avatar, Badge, Typography, Space, message } from 'antd';
import {
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  ProjectOutlined,
  DashboardOutlined,
  TeamOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@common/store/authStore';
import axios from '@common/utils/axiosetup';
import ProjectsList from '@features/project/components/ProjectsList';
import AdminCreation from '@features/admin/components/AdminCreation';
import UserList from '@features/user/components/UserList';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('selectedMenu');
      return storedKey !== null ? storedKey : 'overview';
    }
    return 'overview';
  });
  const navigate = useNavigate();
  const clearToken = useAuthStore((state) => state.clearToken);
  const username = useAuthStore((state) => state.username);
  const usertype = useAuthStore((state) => state.usertype);
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  useEffect(() => {
    console.log('Dashboard username:', username);
  }, [username]);

  const handleMenuClick = (e: any) => {
    setSelectedKey(e.key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedMenu', e.key);
    }
  };

  const handleLogout = async () => {
    try {
      if (!token || !refreshToken) {
        message.error('No valid tokens found. Please login again.');
        navigate('/login');
        return;
      }
      await axios.post(
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
      navigate('/login'); // Redirect to login page
    } catch (error) {
      message.error('Logout failed. Please try again.');
    }
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    { type: 'divider' as 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'projects':
        return <ProjectsList />;
      case 'adminusers':
        return <AdminCreation />;
      case 'users':
        return <UserList />;
      default:
        return (
          <>
            <h2>{selectedKey.charAt(0).toUpperCase() + selectedKey.slice(1)}</h2>
            <p>This is the {selectedKey} page content.</p>
          </>
        );
    }
  };

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
          usertype === 'master'
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
            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Avatar style={{ backgroundColor: '#7265e6', cursor: 'pointer' }} icon={<UserOutlined />} />
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', minHeight: 360 }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;

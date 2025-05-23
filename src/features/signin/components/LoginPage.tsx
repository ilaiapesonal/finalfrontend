import React from 'react';
import api from '@common/utils/axiosetup';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@common/store/authStore';
import { Form, Input, Button, Typography, Checkbox, Row, Col, message, notification } from 'antd';
import { UserOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);
  const setUsername = useAuthStore((state) => state.setUsername);
  const setUsertype = useAuthStore((state) => state.setUsertype);
  const setDjangoUserType = useAuthStore((state) => state.setDjangoUserType);
  const setUserId = useAuthStore((state) => state.setUserId);
  const clearToken = useAuthStore((state) => state.clearToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const onFinish = async (values: any) => {
    try {
      const response = await api.post('/authentication/login/', {
        username: values.username,
        password: values.password,
      });

      // Extract all relevant fields from backend response
      const token = response.data.access || response.data.token;
      const refreshToken = response.data.refresh;
      const username = response.data.username || null;
      const userType = response.data.usertype || null;
      const djangoUserType = response.data.django_user_type || null;
      const userId = response.data.userId || response.data.user_id || null;
      const isPasswordResetRequired = response.data.isPasswordResetRequired || false;

      if (!token || !refreshToken) {
        notification.error({
          message: 'Login Failed',
          description: 'Token or refresh token is missing from the server response.',
          placement: 'topRight',
          duration: 5,
          style: { fontWeight: 'bold' },
        });
        return;
      }

      // Set all values in Zustand store (and localStorage)
      setToken(token);
      setRefreshToken(refreshToken);
      setUsername(username);
      setUsertype(userType);
      setDjangoUserType(djangoUserType); // <-- This sets localStorage 'django_user_type'
      setUserId(userId);
      useAuthStore.getState().setIsPasswordResetRequired(isPasswordResetRequired);

      // Debug: Check if django_user_type is set in localStorage
      // console.log('django_user_type in localStorage:', localStorage.getItem('django_user_type'));

      message.success('Login successful!');

      if (isPasswordResetRequired) {
        navigate('/reset-password');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        notification.error({
          message: 'Login Failed',
          description: 'Invalid username or password. Please check your credentials and try again.',
          placement: 'topRight',
          duration: 5,
          style: { fontWeight: 'bold' },
        });
      } else {
        notification.error({
          message: 'Login Failed',
          description: 'An unexpected error occurred. Please try again later.',
          placement: 'topRight',
          duration: 5,
          style: { fontWeight: 'bold' },
        });
      }
    }
  };


  const handleLogout = async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        await api.post('/authentication/logout/', {
          refresh: refreshToken
        });
      }

      clearToken();

      notification.success({
        message: 'Logged out successfully',
        placement: 'topRight',
        duration: 3,
        style: { fontWeight: 'bold' },
      });

      setTimeout(() => {
        navigate('/signin');
      }, 1500);
    } catch (error) {
      message.error('Logout failed. Please try again.');
      clearToken();
      navigate('/signin');
    }
  };

  return (
    <Row style={{ minHeight: '100vh' }}>
      <Col
        span={12}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          backgroundColor: '#f0f2f5',
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: '100%',
            backgroundColor: 'white',
            padding: '60px 60px 50px 60px',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
            border: '1px solid #5a5aee',
            transition: 'box-shadow 0.3s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 30px 80px rgba(102, 126, 234, 0.7)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.4)';
          }}
        >
          <Title level={2} style={{ textAlign: 'center', marginBottom: 32, color: '#333', fontWeight: 'bold' }}>
            Sign In
          </Title>
          <Form
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#667eea' }} />}
                placeholder="Username"
                style={{ borderRadius: 8, borderColor: '#667eea' }}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#667eea' }} />}
                placeholder="Password"
                style={{ borderRadius: 8, borderColor: '#667eea' }}
                size="large"
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 24 }}>
              <Checkbox style={{ color: '#667eea', fontWeight: 'bold' }}>Remember me</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  width: '100%',
                  fontWeight: 'bold',
                  fontSize: 18,
                  borderRadius: 12,
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.6)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.9)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.6)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
              >
                Log in
              </Button>
            </Form.Item>
          </Form>
          {isAuthenticated() && (
            <Button
              type="default"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ marginTop: 16, width: '100%', fontWeight: 'bold', borderRadius: 12 }}
            >
              Log out
            </Button>
          )}
        </div>
      </Col>
      <Col
        span={12}
        style={{
          padding: 0,
          margin: 0,
          height: '100vh',
          backgroundImage: `url(${new URL('../../assets/login/image2.jpg', import.meta.url).href})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </Row>
  );
};

export default LoginPage;
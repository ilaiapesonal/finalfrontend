import React from 'react';
import axios from '../../utils/axiosetup';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Form, Input, Button, Typography, Checkbox, Row, Col, message, notification } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  const onFinish = async (values: any) => {
    try {
      const response = await axios.post('/authentication/login/', {
        username: values.username,
        password: values.password,
      });
      // Assuming the backend returns a token on successful login
      const token = response.data.access || response.data.token;
      const refreshToken = response.data.refresh;
      const username = response.data.username || response.data.user?.username || null;
      console.log('Login response tokens:', { token, refreshToken, username });
      setToken(token);
      useAuthStore.getState().setRefreshToken(refreshToken);
      useAuthStore.getState().setUsername(username);
      console.log('AuthStore state after setting tokens:', useAuthStore.getState());
      message.success('Login successful!');
      navigate('/dashboard');
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
        message.error('Login failed. Please try again later.');
      }
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

            <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
              <a href="#" style={{ color: '#764ba2', fontWeight: 'bold' }}>
                Forgot password?
              </a>
              <span style={{ margin: '0 8px', color: '#aaa' }}>|</span>
              <a href="#" style={{ color: '#764ba2', fontWeight: 'bold' }}>
                Register now
              </a>
            </Form.Item>
          </Form>
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

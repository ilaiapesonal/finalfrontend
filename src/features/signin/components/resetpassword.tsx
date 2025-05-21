import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import axios from '@common/utils/axiosetup';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@common/store/authStore';

const { Title } = Typography;

const ResetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setIsPasswordResetRequired = useAuthStore((state) => state.setIsPasswordResetRequired);

  const onFinish = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('New password and confirm password do not match');
      return;
    }

    setLoading(true);
    try {
      const username = useAuthStore.getState().username;
      await axios.put('/authentication/admin/reset-password/', {
        username,
        password: values.newPassword,
      });
      message.success('Password reset successful. Please log in with your new password.');
      setIsPasswordResetRequired(false);
      navigate('/login');
    } catch (error) {
      message.error('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '40px 20px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        Reset Password
      </Title>
      <Form layout="vertical" onFinish={onFinish} size="large">
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{ required: true, message: 'Please input your current password!' }]}
        >
          <Input.Password placeholder="Enter your current password" />
        </Form.Item>
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ required: true, message: 'Please input your new password!' }]}
        >
          <Input.Password placeholder="Enter your new password" />
        </Form.Item>
        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your new password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm your new password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPassword;

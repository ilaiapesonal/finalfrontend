import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import type { UserData } from '../types';

const { Title } = Typography;

interface UserEditProps {
  user: UserData;
  visible: boolean;
  onSave: (updatedUser: UserData) => void;
  onCancel: () => void;
}

const UserEdit: React.FC<UserEditProps> = ({ user, visible, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    }
  }, [user, form]);

  const onFinish = (values: UserData) => {
    setLoading(true);
    try {
      // Include the id property to ensure it is passed back
      const updatedUser = { ...values, id: user.id };
      
      // Remove password field if empty or undefined to avoid backend validation error
      if (!updatedUser.password) {
        delete updatedUser.password;
      }
      
      onSave(updatedUser);
      message.success('User updated successfully');
    } catch (error) {
      message.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        Edit User
      </Title>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={user}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please enter the email' }, { type: 'email', message: 'Please enter a valid email' }]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please enter the username' }]}
        >
          <Input placeholder="Enter username" disabled />
        </Form.Item>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter the name' }]}
        >
          <Input placeholder="Enter name" />
        </Form.Item>
        <Form.Item
          label="Surname"
          name="surname"
          rules={[{ required: true, message: 'Please enter the surname' }]}
        >
          <Input placeholder="Enter surname" />
        </Form.Item>
        <Form.Item
          label="Department"
          name="department"
          rules={[{ required: true, message: 'Please enter the department' }]}
        >
          <Input placeholder="Enter department" />
        </Form.Item>
        <Form.Item
          label="Designation"
          name="designation"
          rules={[{ required: true, message: 'Please enter the designation' }]}
        >
          <Input placeholder="Enter designation" />
        </Form.Item>
        <Form.Item
          label="Phone Number"
          name="phone_number"
          rules={[{ required: true, message: 'Please enter the phone number' }]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
        >
          <Input.Password placeholder="Enter new password (leave blank to keep current)" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
            Save Changes
          </Button>
        </Form.Item>
        <Form.Item>
          <Button onClick={onCancel} style={{ width: '100%' }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserEdit;

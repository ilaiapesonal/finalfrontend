import React, { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';

const { Title } = Typography;

interface UserData {
  email: string;
  username: string;
  name: string;
  surname: string;
  department: string;
  designation: string;
  phone_number: string;
  password?: string;
}

const generatePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const UserCreation: React.FC<{ onFinish?: (values: any) => void }> = ({ onFinish }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const internalOnFinish = async (values: UserData) => {
    setLoading(true);
    try {
      const password = generatePassword();
      const payload = { ...values, password };

      if (onFinish) {
        onFinish(payload);
      } else {
        // TODO: Replace with actual API call to create user
        console.log('Creating user with data:', payload);

        // Simulate success
        message.success('User created successfully');

        // Download credentials file
        const textContent = `Username: ${values.username}\nPassword: ${password}\nEmail: ${values.email}\nName: ${values.name} ${values.surname}\nDepartment: ${values.department}\nDesignation: ${values.designation}\nPhone Number: ${values.phone_number}\n`;
        const element = document.createElement('a');
        const file = new Blob([textContent], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${values.username}_credentials.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        form.resetFields();
      }
    } catch (error) {
      message.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const onValuesChange = (changedValues: any) => {
    if (changedValues.email !== undefined) {
      form.setFieldsValue({ username: changedValues.email });
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        Create New User
      </Title>
      <Form form={form} layout="vertical" onFinish={internalOnFinish} initialValues={{}} onValuesChange={onValuesChange}>
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
          <Input placeholder="Enter username" />
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
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
            Create User
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserCreation;

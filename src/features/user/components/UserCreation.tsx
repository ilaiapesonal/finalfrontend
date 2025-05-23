import React from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import api from '../../../common/utils/axiosetup';

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

const UserCreation: React.FC<{ onFinish?: (values: any) => void }> = ({ onFinish }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const internalOnFinish = async (values: UserData) => {
    setLoading(true);
    try {
      // Send to backend, let backend generate password
      const payload = { ...values, user_type: 'adminuser' };
      const response = await api.post('/authentication/projectadminuser/create/', payload);

      // Use backend-generated password for download
      const backendPassword = response.data?.password;
      if (!backendPassword) {
        message.warning('User created, but backend did not return a password.');
      } else {
        const textContent = `Username: ${response.data.username}
Password: ${backendPassword}
Email: ${response.data.email}
Name: ${response.data.name} ${response.data.surname}
Department: ${response.data.department}
Designation: ${response.data.designation}
Phone Number: ${response.data.phone_number}
`;
        const element = document.createElement('a');
        const file = new Blob([textContent], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${response.data.username}_credentials.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }

      message.success('User created successfully');
      form.resetFields();
      if (onFinish) onFinish(response.data);
    } catch (error: any) {
      message.error('Failed to create user');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        Add New User
      </Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={internalOnFinish}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter the email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
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
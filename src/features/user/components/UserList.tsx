import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import UserCreation from './UserCreation';
import UserEdit from './UserEdit';
import UserView from './UserView';
import api from '../../../common/utils/axiosetup';
import type { UserData } from '../types';

import useAuthStore from '@common/store/authStore';

// Define the interface for the raw user object from the API
interface RawUserFromApi {
  id: string | number; // API might send string or number for ID before parsing
  email: string;
  username: string;
  name: string;
  surname: string;
  department: string;
  designation: string;
  phone_number: string;
  // Add other fields if the API returns more that are not directly in UserData
}

const UserList: React.FC = () => {
  const djangoUserType = useAuthStore((state) => state.django_user_type);
  const [users, setUsers] = useState<UserData[]>([]);
  const [viewingUser, setViewingUser] = useState<UserData | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [addingUser, setAddingUser] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Only fetch users created by the logged-in admin (handled by backend)
      const response = await api.get('/authentication/projectadminuser/list/');
      if (Array.isArray(response.data)) {
        const fetchedUsers: UserData[] = response.data.map((user: RawUserFromApi) => ({
          key: String(user.id),
          id: Number(user.id), // Ensure ID is a number for UserData
          email: user.email,
          username: user.username,
          name: user.name,
          surname: user.surname,
          department: user.department,
          designation: user.designation,
          phone_number: user.phone_number,
        }));
        setUsers(fetchedUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      // Only show error if not an admin user, as admin users aren't supposed to see this page
      if (djangoUserType !== 'adminuser') {
        message.error('Failed to fetch users');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch users if not an admin user
    if (djangoUserType !== 'adminuser') {
      fetchUsers();
    }
  }, [djangoUserType]); // Add djangoUserType as a dependency

  const handleView = (user: UserData) => {
    setViewingUser(user);
  };

  const handleEdit = (user: UserData) => {
    // user.id is now always a number, user.key is string. No specific conversion needed here if UserData is correct.
    setEditingUser(user);
  };

  const handleAddUser = () => {
    setAddingUser(true);
  };

  const handleCancel = () => {
    setViewingUser(null);
    setEditingUser(null);
    setAddingUser(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/authentication/projectadminuser/delete/${String(id)}/`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      message.success('User deleted successfully');
    } catch (error) {
      message.error('Failed to delete user');
      console.error(error);
    }
  };

  const handleSaveNewUser = async (newUser: UserData) => { // Typed newUser
    try {
      // newUser object should conform to UserData, including id as a number.
      // UserCreation's onFinish is responsible for this transformation if needed.
      // The backend response for user creation should provide the new user's ID.
      // For now, let's assume newUser (which is response.data from UserCreation's onFinish)
      // has an id that is a number.
      const newId = Number(newUser.id); // Ensure it's a number
      setUsers((prev) => [
        ...prev,
        {
          key: String(newId), // key must be string for AntD
          id: newId,
          email: newUser.email,
          username: newUser.username,
          name: newUser.name,
          surname: newUser.surname,
          department: newUser.department,
          designation: newUser.designation,
          phone_number: newUser.phone_number,
        },
      ]);
      message.success('User added successfully');
      setAddingUser(false);
    } catch (error) {
      message.error('Failed to add user');
      console.error(error);
    }
  };

  const handleSaveEditedUser = async (updatedUser: UserData) => {
    try {
      if (!updatedUser.password) {
        delete updatedUser.password;
      }
      // Ensure updatedUser.id is a number before sending. The type UserData already enforces this.
      // API URL might need string, but payload can be number.
      const response = await api.put(`/authentication/projectadminuser/update/${String(updatedUser.id)}/`, updatedUser);
      const updated = response.data;
      const updatedId = Number(updated.id); // Ensure response id is number
      setUsers((prev) =>
        prev.map((user) =>
          user.id === updatedId // Compare numbers
            ? {
                key: String(updatedId), // key must be string
                id: updatedId,
                email: updated.email,
                username: updated.username,
                name: updated.name,
                surname: updated.surname,
                department: updated.department,
                designation: updated.designation,
                phone_number: updated.phone_number,
              }
            : user
        )
      );
      message.success('User updated successfully');
      setEditingUser(null);
    } catch (error) {
      message.error('Failed to update user');
      console.error(error);
    }
  };

  const columns = [
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Surname', dataIndex: 'surname', key: 'surname' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Designation', dataIndex: 'designation', key: 'designation' },
    { title: 'Phone Number', dataIndex: 'phone_number', key: 'phone_number' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_text: unknown, record: UserData) => ( // Typed render params
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  if (djangoUserType === 'adminuser') {
    return <div>You do not have permission to view this page.</div>;
  }

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser} style={{ marginBottom: 16 }}>
        Add User
      </Button>
      <Table columns={columns} dataSource={users} loading={loading} />

      {viewingUser && (
        <UserView
          user={viewingUser} // viewingUser.id is already a number
          visible={true}
          onClose={handleCancel}
        />
      )}

      {editingUser && (
        <UserEdit user={editingUser} visible={true} onSave={handleSaveEditedUser} onCancel={handleCancel} />
      )}

      <Modal open={addingUser} title="Add New User" footer={null} onCancel={handleCancel} destroyOnHidden>
        <UserCreation onFinish={handleSaveNewUser} />
      </Modal>
    </div>
  );
};

export default UserList;
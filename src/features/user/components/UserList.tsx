import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import UserCreation from './UserCreation';
import UserEdit from './UserEdit';
import UserView from './UserView';
import api from '../../../common/utils/axiosetup';
import type { UserData } from '../types';

import useAuthStore from '@common/store/authStore';

const UserList: React.FC = () => {
  const djangoUserType = useAuthStore((state) => state.django_user_type);

  if (djangoUserType === 'adminuser') {
    return <div>You do not have permission to view this page.</div>;
  }

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
        const fetchedUsers: UserData[] = response.data.map((user: any) => ({
          key: String(user.id),
          id: user.id,
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
      message.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleView = (user: UserData) => {
    setViewingUser(user);
  };

  const handleEdit = (user: UserData) => {
    if (!user.id && user.key) {
      user.id = Number(user.key);
    }
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

  const handleDelete = async (key: string) => {
    try {
      await api.delete(`/authentication/projectadminuser/delete/${key}/`);
      setUsers((prev) => prev.filter((user) => user.key !== key));
      message.success('User deleted successfully');
    } catch (error) {
      message.error('Failed to delete user');
      console.error(error);
    }
  };

  const handleSaveNewUser = async (newUser: any) => {
    try {
      setUsers((prev) => [
        ...prev,
        {
          key: String(newUser.id ?? prev.length),
          id: newUser.id,
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
      const response = await api.put(`/authentication/projectadminuser/update/${updatedUser.id}/`, updatedUser);
      const updated = response.data;
      setUsers((prev) =>
        prev.map((user) =>
          user.key === String(updated.id)
            ? {
                key: String(updated.id),
                id: updated.id,
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
      render: (_: any, record: UserData) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.key)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      {djangoUserType !== 'adminuser' && (
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser} style={{ marginBottom: 16 }}>
          Add User
        </Button>
      )}
      <Table columns={columns} dataSource={users} loading={loading} />

      {viewingUser && (
        <UserView 
          user={{
            ...viewingUser,
            id: typeof viewingUser.id === 'string' ? parseInt(viewingUser.id) : viewingUser.id
          }} 
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
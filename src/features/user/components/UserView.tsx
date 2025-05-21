import React from 'react';
import { Descriptions, Modal } from 'antd';

interface UserData {
  email: string;
  username: string;
  name: string;
  surname: string;
  department: string;
  designation: string;
  phone_number: string;
}

interface UserViewProps {
  user: UserData;
  visible: boolean;
  onClose: () => void;
}

const UserView: React.FC<UserViewProps> = ({ user, visible, onClose }) => {
  if (!user) {
    return null;
  }
  return (
    <Modal open={visible} title="View User" footer={null} onCancel={onClose}>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
        <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
        <Descriptions.Item label="Surname">{user.surname}</Descriptions.Item>
        <Descriptions.Item label="Department">{user.department}</Descriptions.Item>
        <Descriptions.Item label="Designation">{user.designation}</Descriptions.Item>
        <Descriptions.Item label="Phone Number">{user.phone_number}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default UserView;

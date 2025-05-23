import React from 'react';
import { Descriptions, Modal, Typography } from 'antd';

const { Text } = Typography;

import type { UserData as ImportedUserData } from '../types';

interface UserData extends Omit<ImportedUserData, 'id'> {
  id?: number;
}

interface UserViewProps {
  user: UserData | null;
  visible: boolean;
  onClose: () => void;
}

const UserView: React.FC<UserViewProps> = ({ user, visible, onClose }) => {
  if (!user) {
    return null;
  }
  
  return (
    <Modal 
      open={visible} 
      title={`User Details: ${user.name} ${user.surname}`} 
      footer={null} 
      onCancel={onClose}
      width={600}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Email">
          <Text copyable>{user.email}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
        <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
        <Descriptions.Item label="Surname">{user.surname}</Descriptions.Item>
        <Descriptions.Item label="Department">{user.department}</Descriptions.Item>
        <Descriptions.Item label="Designation">{user.designation}</Descriptions.Item>
        <Descriptions.Item label="Phone Number">
          <Text copyable>{user.phone_number}</Text>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default UserView;

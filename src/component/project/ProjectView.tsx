import React from 'react';
import { Descriptions, Modal } from 'antd';

interface Project {
  key: string;
  id: number;
  name: string;
  category: string;
  capacity: string;
  location: string;
  policeStation: string;
  policeContact: string;
  hospital: string;
  hospitalContact: string;
  commencementDate: string;
}

interface ProjectViewProps {
  project: Project;
  visible: boolean;
  onClose: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, visible, onClose }) => {
  if (!project) {
    return null;
  }
  return (
    <Modal
      open={visible}
      title="View Project"
      footer={null}
      onCancel={onClose}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Project Name">{project.name}</Descriptions.Item>
        <Descriptions.Item label="Project Category">{project.category}</Descriptions.Item>
        <Descriptions.Item label="Capacity / Size">{project.capacity}</Descriptions.Item>
        <Descriptions.Item label="Location">{project.location}</Descriptions.Item>
        <Descriptions.Item label="Nearest Police Station">{project.policeStation}</Descriptions.Item>
        <Descriptions.Item label="Police Station Contact">{project.policeContact}</Descriptions.Item>
        <Descriptions.Item label="Nearest Hospital">{project.hospital}</Descriptions.Item>
        <Descriptions.Item label="Hospital Contact">{project.hospitalContact}</Descriptions.Item>
        <Descriptions.Item label="Commencement Date">{project.commencementDate}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ProjectView;

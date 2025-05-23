import React from 'react';
import { Descriptions, Modal, Tag } from 'antd';
import moment from 'moment';

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
  project: Project | null;
  visible: boolean;
  onClose: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, visible, onClose }) => {
  if (!project) {
    return null;
  }
  
  // Format category for display
  const getCategoryDisplay = (category: string) => {
    switch (category) {
      case 'residential':
        return <Tag color="green">Residential</Tag>;
      case 'commercial':
        return <Tag color="blue">Commercial</Tag>;
      case 'industrial':
        return <Tag color="orange">Industrial</Tag>;
      case 'infrastructure':
        return <Tag color="purple">Infrastructure</Tag>;
      default:
        return category;
    }
  };
  
  // Format date for better readability
  const formattedDate = project.commencementDate ? 
    moment(project.commencementDate).format('MMMM D, YYYY') : 
    'Not specified';
  
  return (
    <Modal
      open={visible}
      title={`Project Details: ${project.name}`}
      footer={null}
      onCancel={onClose}
      width={600}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Project Name">{project.name}</Descriptions.Item>
        <Descriptions.Item label="Project Category">{getCategoryDisplay(project.category)}</Descriptions.Item>
        <Descriptions.Item label="Capacity / Size">{project.capacity}</Descriptions.Item>
        <Descriptions.Item label="Location">{project.location}</Descriptions.Item>
        <Descriptions.Item label="Nearest Police Station">{project.policeStation}</Descriptions.Item>
        <Descriptions.Item label="Police Station Contact">{project.policeContact}</Descriptions.Item>
        <Descriptions.Item label="Nearest Hospital">{project.hospital}</Descriptions.Item>
        <Descriptions.Item label="Hospital Contact">{project.hospitalContact}</Descriptions.Item>
        <Descriptions.Item label="Commencement Date">{formattedDate}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ProjectView;

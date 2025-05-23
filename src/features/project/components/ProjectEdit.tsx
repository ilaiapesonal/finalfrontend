import React, { useState } from 'react';
import moment from 'moment';
import { Modal, Form, Input, DatePicker, Select, Button, message } from 'antd';
import axios from '@common/utils/axiosetup';

const { Option } = Select;

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

interface ProjectEditProps {
  project: Project;
  visible: boolean;
  onSave: (updatedProject: Project) => void;
  onCancel: () => void;
}

const ProjectEdit: React.FC<ProjectEditProps> = ({ project, visible, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (project) {
      form.setFieldsValue({
        projectName: project.name,
        projectCategory: project.category,
        capacity: project.capacity,
        location: project.location,
        nearestPoliceStation: project.policeStation,
        nearestPoliceStationContact: project.policeContact,
        nearestHospital: project.hospital,
        nearestHospitalContact: project.hospitalContact,
        commencementDate: project.commencementDate ? moment(project.commencementDate) : null,
      });
    }
  }, [project, form]);

  const onFinish = async (values: any) => {
    if (!project || !project.id) {
      message.error('No project selected for editing or project ID missing.');
      return;
    }

    const updatedProject: Project = {
      key: project.key,
      id: project.id,
      name: values.projectName,
      category: values.projectCategory,
      capacity: values.capacity,
      location: values.location,
      policeStation: values.nearestPoliceStation,
      policeContact: values.nearestPoliceStationContact,
      hospital: values.nearestHospital,
      hospitalContact: values.nearestHospitalContact,
      commencementDate: values.commencementDate.format('YYYY-MM-DD'),
    };

    // Prepare data for API
    const apiData = {
      name: updatedProject.name,
      category: updatedProject.category,
      capacity: updatedProject.capacity,
      location: updatedProject.location,
      policeStation: updatedProject.policeStation,
      policeContact: updatedProject.policeContact,
      hospital: updatedProject.hospital,
      hospitalContact: updatedProject.hospitalContact,
      commencementDate: updatedProject.commencementDate,
    };

    setLoading(true);
    try {
      await axios.put(`/authentication/project/update/${project.id}/`, apiData);
      onSave(updatedProject);
      message.success('Project updated successfully');
    } catch (error: any) {
      console.error('Error updating project:', error);
      message.error(error.response?.data?.error || 'Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title="Edit Project"
      onCancel={onCancel}
      footer={null}
      destroyOnHidden={true}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Project Name"
          name="projectName"
          rules={[{ required: true, message: 'Please enter the project name' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Project Category"
          name="projectCategory"
          rules={[{ required: true, message: 'Please select the project category' }]}
        >
          <Select>
            <Option value="residential">Residential</Option>
            <Option value="commercial">Commercial</Option>
            <Option value="industrial">Industrial</Option>
            <Option value="infrastructure">Infrastructure</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Capacity / Size"
          name="capacity"
          rules={[{ required: true, message: 'Please enter the capacity or size' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: 'Please enter the location' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Nearest Police Station"
          name="nearestPoliceStation"
          rules={[{ required: true, message: 'Please enter the nearest police station' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Nearest Police Station Contact Detail"
          name="nearestPoliceStationContact"
          rules={[{ required: true, message: 'Please enter the contact detail' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Nearest Hospital"
          name="nearestHospital"
          rules={[{ required: true, message: 'Please enter the nearest hospital' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Nearest Hospital Contact Detail"
          name="nearestHospitalContact"
          rules={[{ required: true, message: 'Please enter the contact detail' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Commencement Date"
          name="commencementDate"
          rules={[{ required: true, message: 'Please select the commencement date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectEdit;

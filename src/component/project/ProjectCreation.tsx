import React from 'react';
import { Form, Input, Button, DatePicker, Select, Typography } from 'antd';

const { Title } = Typography;
const { Option } = Select;

interface ProjectCreationProps {
  onFinish?: (values: any) => void;
}

const ProjectCreation: React.FC<ProjectCreationProps> = ({ onFinish }) => {
  const [form] = Form.useForm();

  const internalOnFinish = (values: any) => {
    if (onFinish) {
      onFinish(values);
    } else {
      console.log('Project form values:', values);
      // TODO: Handle form submission, e.g., API call to create project
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        Create New Project
      </Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={internalOnFinish}
        initialValues={{}}
      >
        <Form.Item
          label="Project Name"
          name="projectName"
          rules={[{ required: true, message: 'Please enter the project name' }]}
        >
          <Input placeholder="Enter project name" />
        </Form.Item>

        <Form.Item
          label="Project Category"
          name="projectCategory"
          rules={[{ required: true, message: 'Please select the project category' }]}
        >
          <Select placeholder="Select project category">
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
          <Input placeholder="Enter capacity or size" />
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: 'Please enter the location' }]}
        >
          <Input placeholder="Enter location" />
        </Form.Item>

        <Form.Item
          label="Nearest Police Station"
          name="nearestPoliceStation"
          rules={[{ required: true, message: 'Please enter the nearest police station' }]}
        >
          <Input placeholder="Enter nearest police station" />
        </Form.Item>

        <Form.Item
          label="Nearest Police Station Contact Detail"
          name="nearestPoliceStationContact"
          rules={[{ required: true, message: 'Please enter the contact detail' }]}
        >
          <Input placeholder="Enter nearest police station contact detail" />
        </Form.Item>

        <Form.Item
          label="Nearest Hospital"
          name="nearestHospital"
          rules={[{ required: true, message: 'Please enter the nearest hospital' }]}
        >
          <Input placeholder="Enter nearest hospital" />
        </Form.Item>

        <Form.Item
          label="Nearest Hospital Contact Detail"
          name="nearestHospitalContact"
          rules={[{ required: true, message: 'Please enter the contact detail' }]}
        >
          <Input placeholder="Enter nearest hospital contact detail" />
        </Form.Item>

        <Form.Item
          label="Commencement Date"
          name="commencementDate"
          rules={[{ required: true, message: 'Please select the commencement date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Create Project
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProjectCreation;

import React from 'react'; // Removed useState and message
import { Form, Input, Button, DatePicker, Select, Typography } from 'antd';
// import api from '@common/utils/axiosetup'; // No longer making API calls here
import type { Moment } from 'moment'; // Import Moment for DatePicker type

const { Title } = Typography;
const { Option } = Select;

// Interface for raw form values from Ant Design form
interface RawProjectCreationFormValues {
  projectName: string;
  projectCategory: string;
  capacity: string;
  location: string;
  nearestPoliceStation: string;
  nearestPoliceStationContact: string;
  nearestHospital: string;
  nearestHospitalContact: string;
  commencementDate: Moment; // DatePicker value is a Moment object
}

// Define the structure of the form data passed to onFinish
export interface ProjectFormData {
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

interface ProjectCreationProps {
  onFinish: (values: ProjectFormData) => void; // onFinish is now mandatory
  // onSuccess prop is removed
}

const ProjectCreation: React.FC<ProjectCreationProps> = ({ onFinish }) => {
  const [form] = Form.useForm<RawProjectCreationFormValues>(); // Use the raw form values type for the form
  // loading state is removed

  const internalOnFinish = async (values: RawProjectCreationFormValues) => {
    // 'values' is now correctly typed as RawProjectCreationFormValues
    // Map form field names to match the structure of ProjectFormData
    const apiData: ProjectFormData = {
      name: values.projectName,
      category: values.projectCategory,
      capacity: values.capacity,
      location: values.location,
      policeStation: values.nearestPoliceStation,
      policeContact: values.nearestPoliceStationContact,
      hospital: values.nearestHospital,
      hospitalContact: values.nearestHospitalContact,
      commencementDate: values.commencementDate.format('YYYY-MM-DD'), // Format Moment object to string
    };

    // Directly call onFinish with the mapped data
    onFinish(apiData);
    form.resetFields(); // Reset form after submitting data to parent
    // setLoading, api.post, message.success, and onSuccess logic are removed
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
          {/* loading prop is removed from Button */}
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Create Project
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProjectCreation;

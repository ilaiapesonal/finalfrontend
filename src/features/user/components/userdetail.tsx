import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Upload, Button, Row, Col, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { RcFile, UploadChangeParam } from 'antd/es/upload';
import moment from 'moment';
import api from '../../../common/utils/axiosetup';

const { Option } = Select;
const { TextArea } = Input;

interface UserDetailForm {
  employeeId: string;
  name: string;
  surname: string;
  gender: string;
  fatherOrSpouseName: string;
  dateOfBirth: moment.Moment | null;
  nationality: string;
  educationLevel: string;
  dateOfJoining: moment.Moment | null;
  department: string;
  designation: string;
  email: string;
  mobile: string;
  uan: string;
  pan: string;
  panAttachment: RcFile | null;
  aadhaar: string;
  aadhaarAttachment: RcFile | null;
  presentAddress: string;
  permanentAddress: string;
  markOfIdentification: string;
  photo: RcFile | null;
  specimenSignature: RcFile | null;
}

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const UserDetail: React.FC = () => {
  const [form] = Form.useForm();

  const [formData, setFormData] = useState<UserDetailForm>({
    employeeId: '',
    name: '',
    surname: '',
    gender: '',
    fatherOrSpouseName: '',
    dateOfBirth: null,
    nationality: '',
    educationLevel: '',
    dateOfJoining: null,
    department: '',
    designation: '',
    email: '',
    mobile: '',
    uan: '',
    pan: '',
    panAttachment: null,
    aadhaar: '',
    aadhaarAttachment: null,
    presentAddress: '',
    permanentAddress: '',
    markOfIdentification: '',
    photo: null,
    specimenSignature: null,
  });

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const response = await api.get('authentication/userdetail/');
        const data = response.data;

        setFormData({
          employeeId: data.employeeId || '',
          name: data.name || '',
          surname: data.surname || '',
          gender: data.gender || '',
          fatherOrSpouseName: data.fatherOrSpouseName || '',
          dateOfBirth: data.dateOfBirth ? moment(data.dateOfBirth) : null,
          nationality: data.nationality || '',
          educationLevel: data.educationLevel || '',
          dateOfJoining: data.dateOfJoining ? moment(data.dateOfJoining) : null,
          department: data.department || '',
          designation: data.designation || '',
          email: data.email || '',
          mobile: data.mobile || '',
          uan: data.uan || '',
          pan: data.pan || '',
          panAttachment: null,
          aadhaar: data.aadhaar || '',
          aadhaarAttachment: null,
          presentAddress: data.presentAddress || '',
          permanentAddress: data.permanentAddress || '',
          markOfIdentification: data.markOfIdentification || '',
          photo: null,
          specimenSignature: null,
        });

        form.setFieldsValue({
          ...data,
          dateOfBirth: data.dateOfBirth ? moment(data.dateOfBirth) : null,
          dateOfJoining: data.dateOfJoining ? moment(data.dateOfJoining) : null,
          panAttachment: [],
          aadhaarAttachment: [],
          photo: [],
          specimenSignature: [],
        });
      } catch (error) {
        message.error('Failed to load user details.');
      }
    };

    fetchUserDetail();
  }, [form]);

  const handleUploadChange = (name: keyof UserDetailForm) => (info: UploadChangeParam) => {
    setFormData(prev => ({
      ...prev,
      [name]: info.fileList && info.fileList.length > 0 ? info.fileList[0].originFileObj : null,
    }));
  };

  const onValuesChange = (_changedValues: any, allValues: any) => {
    setFormData(prev => ({
      ...prev,
      ...allValues,
    }));
  };

  const onFinish = async (values: any) => {
    // Validate required file fields
    if (!formData.panAttachment || !formData.aadhaarAttachment || !formData.photo || !formData.specimenSignature) {
      message.error('Please upload all required files: PAN, AADHAAR, Photo, and Signature.');
      return;
    }

    // Validate required text fields
    const requiredFields = [
      'employeeId', 'name', 'surname', 'gender', 'fatherOrSpouseName', 'dateOfBirth',
      'nationality', 'educationLevel', 'dateOfJoining', 'department', 'designation',
      'email', 'mobile', 'uan', 'pan', 'aadhaar', 'presentAddress', 'permanentAddress', 'markOfIdentification'
    ];
    for (const field of requiredFields) {
      if (!values[field]) {
        message.error(`Please fill the required field: ${field}`);
        return;
      }
    }

    const formPayload = new FormData();

    // Append text fields
    formPayload.append('employeeId', values.employeeId || '');
    formPayload.append('gender', values.gender || '');
    formPayload.append('fatherOrSpouseName', values.fatherOrSpouseName || '');
    formPayload.append('dateOfBirth', values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : '');
    formPayload.append('nationality', values.nationality || '');
    formPayload.append('educationLevel', values.educationLevel || '');
    formPayload.append('dateOfJoining', values.dateOfJoining ? values.dateOfJoining.format('YYYY-MM-DD') : '');
    formPayload.append('mobile', values.mobile || '');
    formPayload.append('uan', values.uan || '');
    formPayload.append('pan', values.pan || '');
    formPayload.append('aadhaar', values.aadhaar || '');
    formPayload.append('presentAddress', values.presentAddress || '');
    formPayload.append('permanentAddress', values.permanentAddress || '');
    formPayload.append('markOfIdentification', values.markOfIdentification || '');

    // Append files
    formPayload.append('panAttachment', formData.panAttachment);
    formPayload.append('aadhaarAttachment', formData.aadhaarAttachment);
    formPayload.append('photo', formData.photo);
    formPayload.append('specimenSignature', formData.specimenSignature);

    try {
      await api.put('authentication/userdetail/', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('User details updated successfully.');
    } catch (error) {
      message.error('Failed to update user details.');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={formData}
      onValuesChange={onValuesChange}
      onFinish={onFinish}
      style={{ maxWidth: 800, margin: '0 auto' }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Employee ID" name="employeeId" rules={[{ required: true, message: 'Employee ID is required' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input readOnly />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Surname" name="surname" rules={[{ required: true, message: 'Surname is required' }]}>
            <Input readOnly />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Gender" name="gender" rules={[{ required: true, message: 'Gender is required' }]}>
            <Select placeholder="Select Gender" allowClear>
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Father’s/Spouse Name" name="fatherOrSpouseName" rules={[{ required: true, message: 'Father/Spouse Name is required' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Date of Birth" name="dateOfBirth" rules={[{ required: true, message: 'Date of Birth is required' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Nationality" name="nationality" rules={[{ required: true, message: 'Nationality is required' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Education Level" name="educationLevel" rules={[{ required: true, message: 'Education Level is required' }]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Date of Joining" name="dateOfJoining" rules={[{ required: true, message: 'Date of Joining is required' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Department" name="department" rules={[{ required: true, message: 'Department is required' }]}>
            <Input readOnly />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Designation" name="designation" rules={[{ required: true, message: 'Designation is required' }]}>
            <Input readOnly />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Email is required' }]}>
            <Input readOnly />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Mobile" name="mobile" rules={[{ required: true, message: 'Mobile is required' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="UAN" name="uan" rules={[{ required: true, message: 'UAN is required' }]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="PAN" name="pan" rules={[{ required: true, message: 'PAN is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="panAttachment"
            label="PAN Attachment"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: 'PAN Attachment is required' }]}
            noStyle
          >
            <Upload
              beforeUpload={() => false}
              onChange={handleUploadChange('panAttachment')}
              accept=".pdf,.jpg,.jpeg,.png"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload PAN</Button>
            </Upload>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="AADHAAR" name="aadhaar" rules={[{ required: true, message: 'AADHAAR is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="aadhaarAttachment"
            label="AADHAAR Attachment"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: 'AADHAAR Attachment is required' }]}
            noStyle
          >
            <Upload
              beforeUpload={() => false}
              onChange={handleUploadChange('aadhaarAttachment')}
              accept=".pdf,.jpg,.jpeg,.png"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload AADHAAR</Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Present Address" name="presentAddress" rules={[{ required: true, message: 'Present Address is required' }]}>
            <TextArea rows={3} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Permanent Address" name="permanentAddress" rules={[{ required: true, message: 'Permanent Address is required' }]}>
            <TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Mark of Identification" name="markOfIdentification" rules={[{ required: true, message: 'Mark of Identification is required' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Photo"
            name="photo"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: 'Photo is required' }]}
            noStyle
          >
            <Upload
              beforeUpload={() => false}
              onChange={handleUploadChange('photo')}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Photo</Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Specimen Signature/Thumb Impression"
            name="specimenSignature"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: 'Signature is required' }]}
            noStyle
          >
            <Upload
              beforeUpload={() => false}
              onChange={handleUploadChange('specimenSignature')}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Signature</Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ marginTop: 16 }}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UserDetail;
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
    if (info.file.status === 'done' || info.file.status === 'uploading' || info.file.status === 'removed') {
      setFormData(prev => ({
        ...prev,
        [name]: info.file.originFileObj || null,
      }));
    }
  };

  const onValuesChange = (_changedValues: any, allValues: any) => {
    setFormData(allValues);
  };

  const onFinish = async (values: any) => {
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

    // Append files if present
    if (formData.panAttachment) {
      formPayload.append('panAttachment', formData.panAttachment);
    }
    if (formData.aadhaarAttachment) {
      formPayload.append('aadhaarAttachment', formData.aadhaarAttachment);
    }
    if (formData.photo) {
      formPayload.append('photo', formData.photo);
    }
    if (formData.specimenSignature) {
      formPayload.append('specimenSignature', formData.specimenSignature);
    }

    try {
      await api.put('/userdetail/', formPayload, {
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
          <Form.Item label="Employee ID" name="employeeId">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Name" name="name">
            <Input readOnly />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Surname" name="surname">
            <Input readOnly />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Gender" name="gender">
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
          <Form.Item label="Father’s/Spouse Name" name="fatherOrSpouseName">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Date of Birth" name="dateOfBirth">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Nationality" name="nationality">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Education Level" name="educationLevel">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Date of Joining" name="dateOfJoining">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Department" name="department">
            <Input readOnly />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Designation" name="designation">
            <Input readOnly />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Email" name="email">
            <Input readOnly />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Mobile" name="mobile">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="UAN" name="uan">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="PAN" name="pan">
            <Input />
          </Form.Item>
          <Form.Item name="panAttachment" label="PAN Attachment" valuePropName="fileList" getValueFromEvent={e => (Array.isArray(e) ? e : e && e.fileList)} noStyle>
            <Upload beforeUpload={() => false} onChange={handleUploadChange('panAttachment')} accept=".pdf,.jpg,.jpeg,.png" maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload PAN</Button>
            </Upload>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="AADHAAR" name="aadhaar">
            <Input />
          </Form.Item>
          <Form.Item name="aadhaarAttachment" label="AADHAAR Attachment" valuePropName="fileList" getValueFromEvent={e => (Array.isArray(e) ? e : e && e.fileList)} noStyle>
            <Upload beforeUpload={() => false} onChange={handleUploadChange('aadhaarAttachment')} accept=".pdf,.jpg,.jpeg,.png" maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload AADHAAR</Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Present Address" name="presentAddress">
            <TextArea rows={3} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Permanent Address" name="permanentAddress">
            <TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Mark of Identification" name="markOfIdentification">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Photo" name="photo" valuePropName="fileList" getValueFromEvent={e => (Array.isArray(e) ? e : e && e.fileList)} noStyle>
            <Upload beforeUpload={() => false} onChange={handleUploadChange('photo')} accept="image/*" maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload Photo</Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Specimen Signature/Thumb Impression" name="specimenSignature" valuePropName="fileList" getValueFromEvent={e => (Array.isArray(e) ? e : e && e.fileList)} noStyle>
            <Upload beforeUpload={() => false} onChange={handleUploadChange('specimenSignature')} accept="image/*" maxCount={1}>
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

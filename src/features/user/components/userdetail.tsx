import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Upload, Button, Row, Col, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { RcFile, UploadChangeParam, UploadFile } from 'antd/es/upload'; // Added UploadFile
import moment from 'moment';
import api from '../../../common/utils/axiosetup';

const { Option } = Select;

// Interface for the data structure coming from the API (snake_case)
interface UserDetailApiResponse {
  id: number;
  user: number; // Or a nested user object if serialized deeply
  employee_id: string;
  gender: string;
  father_or_spouse_name: string;
  date_of_birth: string | null; // ISO date string
  nationality: string;
  education_level: string;
  date_of_joining: string | null; // ISO date string
  mobile: string;
  uan: string;
  pan: string;
  pan_attachment: string | null; // URL string
  aadhaar: string;
  aadhaar_attachment: string | null; // URL string
  mark_of_identification: string;
  photo: string | null; // URL string
  specimen_signature: string | null; // URL string
  is_approved: boolean;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  name: string; // From serializer custom field
  surname: string; // From serializer custom field
  designation: string; // From serializer custom field
  department: string; // From serializer custom field
  email: string; // From serializer custom field
}


// Interface for the form's state (camelCase for form items, File objects for uploads)
interface UserDetailFormState {
  employeeId: string;
  gender: string;
  fatherOrSpouseName: string;
  dateOfBirth: moment.Moment | null;
  nationality: string;
  educationLevel: string;
  dateOfJoining: moment.Moment | null;
  mobile: string;
  uan: string;
  pan: string;
  aadhaar: string;
  markOfIdentification: string;

  // Read-only fields displayed in form
  name: string;
  surname: string;
  designation: string;
  department: string;
  email: string;

  // File objects for new uploads
  panAttachmentFile: RcFile | null;
  aadhaarAttachmentFile: RcFile | null;
  photoFile: RcFile | null;
  specimenSignatureFile: RcFile | null;
}

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

// Helper to create AntD file list item from URL
const createFileListItem = (url: string | null, fieldName: string): UploadFile[] => {
  if (!url) return [];
  return [{
    uid: `-${fieldName}-${Date.now()}`,
    name: url.substring(url.lastIndexOf('/') + 1) || fieldName,
    status: 'done',
    url: url,
  }];
};


interface UserDetailProps {
  userToApprove?: any | null;
  onApprovalSuccess?: (approvedUserId: number) => void;
}

import { useOutletContext } from 'react-router-dom';

const UserDetail: React.FC<UserDetailProps> = () => {
  const { userToApprove, onApprovalSuccess } = useOutletContext<{
    userToApprove?: any | null;
    onApprovalSuccess?: (approvedUserId: number) => void;
  }>();

  const [form] = Form.useForm();
  // State to hold actual File objects for uploading
  const [fileObjects, setFileObjects] = useState<{
    panAttachment: RcFile | null;
    aadhaarAttachment: RcFile | null;
    photo: RcFile | null;
    specimenSignature: RcFile | null;
  }>({
    panAttachment: null,
    aadhaarAttachment: null,
    photo: null,
    specimenSignature: null,
  });
  
  // To track if data has been loaded, to prevent overriding form with initial empty state
  const [dataLoaded, setDataLoaded] = useState(false);

  // State to track if form is read-only (approved)
  // Removed readOnly state as it is unused and causing TS warning

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        let data: UserDetailApiResponse;
        if (userToApprove && userToApprove.id) {
          // If userToApprove is passed, use that data directly or fetch by id if needed
          // Assuming userToApprove has all necessary fields
          data = userToApprove;
        } else {
          const response = await api.get<UserDetailApiResponse>('authentication/userdetail/');
          data = response.data;
        }

        // Map API response (snake_case) to form values (camelCase)
        const formValues = {
          employeeId: data.employee_id || '',
          name: data.name || '',
          surname: data.surname || '',
          gender: data.gender || '',
          fatherOrSpouseName: data.father_or_spouse_name || '',
          dateOfBirth: data.date_of_birth ? moment(data.date_of_birth) : null,
          nationality: data.nationality || '',
          educationLevel: data.education_level || '',
          dateOfJoining: data.date_of_joining ? moment(data.date_of_joining) : null,
          department: data.department || '',
          designation: data.designation || '',
          email: data.email || '',
          mobile: data.mobile || '',
          uan: data.uan || '',
          pan: data.pan || '',
          aadhaar: data.aadhaar || '',
          markOfIdentification: data.mark_of_identification || '',
          
          // For AntD Upload components, set up fileList to show existing files
          panAttachment: createFileListItem(data.pan_attachment, 'pan'),
          aadhaarAttachment: createFileListItem(data.aadhaar_attachment, 'aadhaar'),
          photo: createFileListItem(data.photo, 'photo'),
          specimenSignature: createFileListItem(data.specimen_signature, 'specimen_signature'),
        };
        form.setFieldsValue(formValues);
        setDataLoaded(true); // Mark data as loaded
        // setReadOnly(data.is_approved); // Removed as readOnly state is removed
      } catch (_error) { // Changed error to _error
        message.error('Failed to load user details.');
      }
    };

    fetchUserDetail();
  }, [form, userToApprove]);

  const handleUploadChange = (fieldName: keyof typeof fileObjects) => (info: UploadChangeParam) => {
    if (info.fileList && info.fileList.length > 0) {
      // User selected/changed a file
      setFileObjects(prev => ({
        ...prev,
        [fieldName]: info.fileList[0].originFileObj || null,
      }));
    } else {
      // User removed a file
      setFileObjects(prev => ({
        ...prev,
        [fieldName]: null,
      }));
    }
  };


  const onFinish = async (values: Omit<UserDetailFormState, 'panAttachmentFile' | 'aadhaarAttachmentFile' | 'photoFile' | 'specimenSignatureFile'>) => {
    // `values` contains text fields and date objects from the form.
    // `fileObjects` state contains the actual File objects.

    // Validate required file fields from our dedicated state
    if (!fileObjects.panAttachment && !form.getFieldValue('panAttachment')?.length) { // Check if new file selected or existing file present
      message.error('Please upload PAN Attachment.');
      return;
    }
    if (!fileObjects.aadhaarAttachment && !form.getFieldValue('aadhaarAttachment')?.length) {
      message.error('Please upload AADHAAR Attachment.');
      return;
    }
    if (!fileObjects.photo && !form.getFieldValue('photo')?.length) {
      message.error('Please upload Photo.');
      return;
    }
    if (!fileObjects.specimenSignature && !form.getFieldValue('specimenSignature')?.length) {
      message.error('Please upload Signature.');
      return;
    }
    
    // No need for this manual text field validation, AntD `rules` handle it.
    // const requiredFields = [ ... ];

    const formPayload = new FormData();

    // Append text fields using snake_case keys
    formPayload.append('employee_id', values.employeeId || '');
    formPayload.append('gender', values.gender || '');
    formPayload.append('father_or_spouse_name', values.fatherOrSpouseName || '');
    formPayload.append('date_of_birth', values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : '');
    formPayload.append('nationality', values.nationality || '');
    formPayload.append('education_level', values.educationLevel || '');
    formPayload.append('date_of_joining', values.dateOfJoining ? values.dateOfJoining.format('YYYY-MM-DD') : '');
    formPayload.append('mobile', values.mobile || '');
    formPayload.append('uan', values.uan || '');
    formPayload.append('pan', values.pan || '');
    formPayload.append('aadhaar', values.aadhaar || '');
    formPayload.append('mark_of_identification', values.markOfIdentification || '');

    // Append files IF a new file has been selected.
    // If a file is optional and the user wants to remove it, the backend should handle null/empty string for the field.
    // Here, we only send the file if it's a new one. If it's not in fileObjects, it means
    // either an old one exists (and we don't resend it unless changed) or it's being cleared.
    // DRF behavior: if a file field is not in the request, it's typically not changed.
    // To clear a file, you might need to send null or an empty string, depending on serializer's `allow_null`.
    // For simplicity, this only sends *newly uploaded* files.
    
    if (fileObjects.panAttachment) {
      formPayload.append('pan_attachment', fileObjects.panAttachment);
    }
    if (fileObjects.aadhaarAttachment) {
      formPayload.append('aadhaar_attachment', fileObjects.aadhaarAttachment);
    }
    if (fileObjects.photo) {
      formPayload.append('photo', fileObjects.photo);
    }
    if (fileObjects.specimenSignature) {
      formPayload.append('specimen_signature', fileObjects.specimenSignature);
    }
    
    // If you need to explicitly clear a file, you might send `field_name: null`
    // For example, if `fileObjects.photo` is `null` AND there was an existing photo,
    // you might append `formPayload.append('photo', '');` or `formPayload.append('photo', null);`
    // For FileField/ImageField to clear it, often sending an empty string or null (if allow_null=True) works.
    // For this example, if a file is removed in UI and `fileObjects.fieldName` is null,
    // we don't append it. Backend will keep the old file.
    // If you want to allow clearing, you need to send a specific signal, e.g. an empty string.
    // e.g. if (!fileObjects.photo && form.getFieldValue('photo')?.length === 0 && initialPhotoUrlExisted) { formPayload.append('photo', ''); }


    try {
      await api.put('authentication/userdetail/', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('User details updated successfully.');
      if (userToApprove && userToApprove.id) {
        try {
          await api.post(`authentication/userdetail/approve/${userToApprove.id}/`);
          message.success('User approved successfully.');
          if (onApprovalSuccess) {
            onApprovalSuccess(userToApprove.id);
          }
        } catch (_approvalError) { // Changed approvalError to _approvalError
          message.error('Failed to approve user.');
        }
      } else {
        if (onApprovalSuccess && userToApprove && userToApprove.id) {
          onApprovalSuccess(userToApprove.id);
        }
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        // Log or display specific backend validation errors
        console.error('Backend validation errors:', error.response.data);
        // You can iterate through error.response.data and display messages
        let errorMessages = 'Failed to update user details. ';
        for (const key in error.response.data) {
            errorMessages += `${key}: ${error.response.data[key].join(', ')} `;
        }
        message.error(errorMessages);
      } else {
        message.error('Failed to update user details.');
      }
    }
  };

  // Removed onValuesChange as it was problematic.
  // Ant Design Form manages its own state for text/date inputs.
  // We use `fileObjects` state specifically for file uploads.
  // Removed initialValues from <Form> to rely solely on form.setFieldsValue from useEffect

  return (
    <Form
      form={form}
      layout="vertical"
      // initialValues removed, form.setFieldsValue in useEffect handles population
      onFinish={onFinish}
      style={{ maxWidth: 800, margin: '0 auto' }}
    >
      {/* Employee ID and Name */}
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

      {/* Surname and Gender */}
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

      {/* Father/Spouse Name and Date of Birth */}
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

      {/* Nationality and Education Level */}
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

      {/* Date of Joining and Department */}
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

      {/* Designation and Email */}
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

      {/* Mobile and UAN */}
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
      
      {/* PAN and PAN Attachment */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="PAN" name="pan" rules={[{ required: true, message: 'PAN is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="panAttachment" // Name for AntD form state
            label="PAN Attachment"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ 
                validator: async (_, value) => {
                    // If there's a new file selected OR an existing file shown in UI
                    if (fileObjects.panAttachment || (value && value.length > 0)) {
                        return Promise.resolve();
                    }
                    return Promise.reject(new Error('PAN Attachment is required'));
                }
            }]}
          >
            <Upload
              beforeUpload={() => false} // Prevent auto-upload
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
            rules={[{ 
                validator: async (_, value) => {
                    if (fileObjects.aadhaarAttachment || (value && value.length > 0)) {
                        return Promise.resolve();
                    }
                    return Promise.reject(new Error('AADHAAR Attachment is required'));
                }
            }]}
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

      {/* Mark of Identification and Photo */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Mark of Identification" name="markOfIdentification" rules={[{ required: true, message: 'Mark of Identification is required' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Photo"
            name="photo" // Name for AntD form state
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ 
                validator: async (_, value) => {
                    if (fileObjects.photo || (value && value.length > 0)) {
                        return Promise.resolve();
                    }
                    return Promise.reject(new Error('Photo is required'));
                }
            }]}
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

      {/* Specimen Signature */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Specimen Signature/Thumb Impression"
            name="specimenSignature" // Name for AntD form state
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ 
                validator: async (_, value) => {
                    if (fileObjects.specimenSignature || (value && value.length > 0)) {
                        return Promise.resolve();
                    }
                    return Promise.reject(new Error('Signature is required'));
                }
            }]}
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
        <Button type="primary" htmlType="submit" style={{ marginTop: 16 }} disabled={!dataLoaded}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UserDetail;
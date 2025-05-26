import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Upload, Typography, InputNumber, Space, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import api from '../../common/utils/axiosetup'; // Ensure this path is correct

const { TextArea } = Input;
const { Title } = Typography;

const FORM_ID = "companyDetailsForm"; // Define a constant for the form ID

const CompanyDetailsForm: React.FC = () => {
  const [form] = Form.useForm();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCompanyDetails = useCallback(async (makeEditableIfEmpty = false) => {
    console.log("[FETCH] Starting. makeEditableIfEmpty:", makeEditableIfEmpty);
    setIsLoading(true);
    try {
      const response = await api.get('/authentication/companydetail/');
      const data = response.data;
      console.log("[FETCH] API response data:", data);

      if (!data || !data.company_name) {
        console.log("[FETCH] Data is empty or company_name missing.");
        form.resetFields();
        setLogoPreview(null);
        if (makeEditableIfEmpty) {
          console.log("[FETCH] Setting editMode to TRUE (empty data).");
          setEditMode(true);
        } else {
          console.log("[FETCH] Data empty, not forcing edit. Setting editMode to FALSE.");
          setEditMode(false);
        }
      } else {
        console.log("[FETCH] Existing data found. Populating form.");
        form.setFieldsValue({
          company_name: data.company_name || '',
          registered_office_address: data.registered_office_address || '',
          pan: data.pan || '',
          gst: data.gst || '',
          contact_phone: data.contact_phone || '',
          contact_email: data.contact_email || '',
          project_capacity_completed: data.project_capacity_completed ?? 0,
          project_capacity_ongoing: data.project_capacity_ongoing ?? 0,
          company_logo: data.company_logo ? [{
            uid: '-1',
            name: data.company_logo.substring(data.company_logo.lastIndexOf('/') + 1) || 'logo.png',
            status: 'done',
            url: data.company_logo,
          }] : [],
        });
        setLogoPreview(data.company_logo || null);
        console.log("[FETCH] Setting editMode to FALSE (data loaded).");
        setEditMode(false);
      }
    } catch (error: any) {
      console.error("[FETCH] Error:", error.response?.data || error.message || error);
      form.resetFields();
      setLogoPreview(null);
      if (error.response && error.response.status === 404) {
        message.info('No company details found. Please fill in the form.');
        console.log("[FETCH] API 404. Setting editMode to TRUE.");
        setEditMode(true);
      } else {
        message.error('Failed to fetch company details.');
        console.log("[FETCH] Other fetch error. Setting editMode to TRUE as fallback.");
        setEditMode(true);
      }
    } finally {
      setIsLoading(false);
      console.log("[FETCH] Finished. isLoading:", false);
    }
  }, [form]);

  useEffect(() => {
    console.log("[useEffect MOUNT] Triggering initial fetchCompanyDetails.");
    fetchCompanyDetails(true);
  }, [fetchCompanyDetails]);

  const onFinish = async (values: any) => {
    console.log("[SUBMIT HANDLER - onFinish] Starting. Current editMode:", editMode);
    console.log("[SUBMIT HANDLER - onFinish] Form values:", values);
    const projectCapacityCompleted = Number(values.project_capacity_completed ?? 0);
    const projectCapacityOngoing = Number(values.project_capacity_ongoing ?? 0);

    // Added debug log to confirm submission
    console.log("[SUBMIT HANDLER - onFinish] Submission triggered");

    try {
      const formData = new FormData();
      formData.append('company_name', values.company_name || "");
      formData.append('registered_office_address', values.registered_office_address || "");
      formData.append('pan', values.pan || "");
      formData.append('gst', values.gst || "");
      formData.append('contact_phone', values.contact_phone || "");
      formData.append('contact_email', values.contact_email || "");
      formData.append('project_capacity_completed', String(projectCapacityCompleted));
      formData.append('project_capacity_ongoing', String(projectCapacityOngoing));

      if (values.company_logo && values.company_logo.length > 0 && values.company_logo[0].originFileObj) {
        formData.append('company_logo', values.company_logo[0].originFileObj);
      } else if ((!values.company_logo || values.company_logo.length === 0) && logoPreview === null) {
        // To explicitly clear logo, backend must support receiving an empty string or specific signal
        // formData.append('company_logo', '');
      }
      
      await api.put('/authentication/companydetail/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      message.success('Company details submitted successfully!');
      console.log("[SUBMIT HANDLER - onFinish] Success. Setting editMode to FALSE.");
      setEditMode(false);
      // Optionally re-fetch to ensure data is absolutely current, e.g., if backend modifies logo URL
      // await fetchCompanyDetails(false); 
    } catch (error: any) {
      console.error("[SUBMIT HANDLER - onFinish] Error:", error.response?.data || error.message);
      if (error.response && error.response.data) {
        let errorMessageStr = 'Failed to submit company details: ';
        const errors = error.response.data;
        Object.keys(errors).forEach(key => {
          const fieldErrors = Array.isArray(errors[key]) ? errors[key].join(', ') : String(errors[key]);
          errorMessageStr += `\n${key.replace(/_/g, ' ')}: ${fieldErrors}`;
        });
        message.error(<pre style={{textAlign: 'left'}}>{errorMessageStr}</pre>, 10);
      } else {
        message.error('Failed to submit company details. Please check network or contact support.');
      }
      console.log("[SUBMIT HANDLER - onFinish] Failed. editMode remains:", editMode);
    }
  };

  const onEditClick = () => {
    console.log("!!!!!! [EDIT CLICK HANDLER] Clicked! Current editMode BEFORE setEditMode(true):", editMode);
    setEditMode(true);
    console.log("!!!!!! [EDIT CLICK HANDLER] After setEditMode(true) call. (Re-render will reflect the change)");
  };

  const onCancelClick = () => {
    console.log("[CANCEL CLICK HANDLER] Clicked. Re-fetching details, will set editMode to FALSE via fetch.");
    fetchCompanyDetails(false); // Fetch, and if data exists, it will set editMode to false.
                               // If data is empty, it will also set editMode to false (as per makeEditableIfEmpty=false).
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) { return e; }
    return e && e.fileList;
  };

  const handleLogoChange = (info: any) => {
    console.log("[LOGO CHANGE] File status:", info.file.status);
    if (info.file.originFileObj && info.file.status !== 'removed') {
      const file = info.file.originFileObj;
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG files!');
        form.setFieldsValue({ company_logo: info.fileList.filter((f: any) => f.uid !== info.file.uid) });
        return;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
        form.setFieldsValue({ company_logo: info.fileList.filter((f: any) => f.uid !== info.file.uid) });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => { setLogoPreview(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoRemove = () => {
    console.log("[LOGO REMOVE] Clearing logo.");
    setLogoPreview(null);
    form.setFieldsValue({ company_logo: [] });
    return true;
  };

  // Removed debug console log for cleaner output
  // console.log(`[RENDER] Component rendering. editMode: ${editMode}, isLoading: ${isLoading}`);

  return (
    <Spin spinning={isLoading} tip="Loading company details...">
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={3}>Company Details</Title>
        {/* Removed debug render line for cleaner UI */}
        {/* <p>[DEBUG RENDER] Form `editMode` state: {String(editMode)}, Form `disabled` prop will be: {String(!editMode)}</p> */}
         
        <Form
          id={FORM_ID} // Added ID for external submit button
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={!editMode} // Form items will be disabled if editMode is false
          initialValues={{
              project_capacity_completed: 0,
              project_capacity_ongoing: 0,
          }}
        >
          {/* All Form.Item fields go here as before */}
          <Form.Item
            label="Company Name"
            name="company_name"
            rules={[{ required: editMode, message: 'Please enter the company name' }]}
          >
            <Input placeholder="Enter company name" />
          </Form.Item>
          {/* Removed extra edit button below company name */}
          {/* <Form.Item style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
            {editMode ? (
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit"
                >
                  Submit Changes
                </Button>
                <Button onClick={onCancelClick}>
                  Cancel
                </Button>
              </Space>
            ) : (
              <Button
                type="default"
                onClick={onEditClick}
              >
                Edit Details
              </Button>
            )}
          </Form.Item> */}

          <Form.Item
            label="Registered Office Address"
            name="registered_office_address"
            rules={[{ required: editMode, message: 'Please enter the registered office address' }]}
          >
            <TextArea rows={3} placeholder="Enter registered office address" />
          </Form.Item>

          <Form.Item
            label="PAN"
            name="pan"
            rules={[{ required: editMode, message: 'Please enter the PAN' }]}
          >
            <Input placeholder="Enter PAN" />
          </Form.Item>

          <Form.Item
            label="GST"
            name="gst"
            rules={[{ required: editMode, message: 'Please enter the GST' }]}
          >
            <Input placeholder="Enter GST" />
          </Form.Item>

        <Form.Item
          label="Company Logo"
          name="company_logo"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          extra="Upload company logo (JPG/PNG, max 2MB)"
        >
          <div>
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
              onChange={handleLogoChange}
              onRemove={handleLogoRemove}
              accept="image/jpeg,image/png"
              // The disabled state of the Upload button inside will be controlled by the Form's disabled prop
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
            {logoPreview && (
              <div style={{ marginTop: 10, border: '1px solid #f0f0f0', padding: '5px', display: 'inline-block' }}>
                <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: 150 }} />
              </div>
            )}
          </div>
        </Form.Item>

          <Form.Item label="Contact Details">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                name="contact_phone"
                rules={[{ required: editMode, message: 'Please enter the phone number' }]}
                noStyle
              >
                <Input placeholder="Phone No." />
              </Form.Item>
              <Form.Item
                name="contact_email"
                rules={[
                  { required: editMode, message: 'Please enter the email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
                noStyle
              >
                <Input placeholder="Email" />
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item label="Overall Project Capacity (e.g., MW)">
            <Space align="baseline" size="large">
              <Form.Item
                label="Completed"
                name="project_capacity_completed"
                rules={[{ required: editMode, message: 'Enter completed capacity' }]}
              >
                <InputNumber min={0} style={{ width: '130px' }} placeholder="e.g., 100" />
              </Form.Item>
              <Form.Item
                label="On Going"
                name="project_capacity_ongoing"
                rules={[{ required: editMode, message: 'Enter ongoing capacity' }]}
              >
                <InputNumber min={0} style={{ width: '130px' }} placeholder="e.g., 50" />
              </Form.Item>
            </Space>
          </Form.Item>

          {/* THE ACTION BUTTONS ARE NO LONGER INSIDE A Form.Item WITHIN THE <Form> */}
        {/* Moved action buttons inside the main Form */}
        </Form>
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
          {editMode ? (
            <Space>
              <Button 
                type="primary" 
                onClick={() => form.submit()}
              >
                Submit Changes
              </Button>
              <Button onClick={onCancelClick}>
                Cancel
              </Button>
            </Space>
          ) : (
            <Button
              type="default"
              onClick={onEditClick}
            >
              Edit Details
            </Button>
          )}
        </div>
      </div>
    </Spin>
  );
};

export default CompanyDetailsForm;
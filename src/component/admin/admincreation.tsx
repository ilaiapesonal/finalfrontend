import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message, Typography, Divider } from 'antd';
import axios from '../../utils/axiosetup';
import useAuthStore from '../../store/authStore';

const { Option } = Select;
const { Title } = Typography;

interface Project {
  id: number;
  name: string;
}

interface AdminData {
  username: string;
  companyName: string;
  registeredAddress: string;
  password?: string;
  created: boolean;
}

const generatePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const AdminCreation: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [clientAdmin, setClientAdmin] = useState<AdminData>({ username: '', companyName: '', registeredAddress: '', created: false });
  const [epcAdmin, setEpcAdmin] = useState<AdminData>({ username: '', companyName: '', registeredAddress: '', created: false });
  const [contractorAdmin, setContractorAdmin] = useState<AdminData>({ username: '', companyName: '', registeredAddress: '', created: false });
  const [loadingClient, setLoadingClient] = useState(false);
  const [loadingEpc, setLoadingEpc] = useState(false);
  const [loadingContractor, setLoadingContractor] = useState(false);
  const authStore = useAuthStore();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/authentication/project/list/', {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        if (Array.isArray(response.data)) {
          setProjects(response.data);
        } else {
          setProjects([]);
        }
      } catch (error) {
        message.error('Failed to fetch projects');
      }
    };
    fetchProjects();
  }, [authStore.token]);

  const fetchAdminsForProject = async (projectId: number) => {
    try {
      const response = await axios.get(`/authentication/admin/list/${projectId}/`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });
      if (response.data) {
        const admins = response.data;
        if (admins.clientAdmin) {
          setClientAdmin({
            username: admins.clientAdmin.username,
            companyName: admins.clientAdmin.company_name,
            registeredAddress: admins.clientAdmin.registered_address,
            created: true,
          });
        } else {
          setClientAdmin({ username: '', companyName: '', registeredAddress: '', created: false });
        }
        if (admins.epcAdmin) {
          setEpcAdmin({
            username: admins.epcAdmin.username,
            companyName: admins.epcAdmin.company_name,
            registeredAddress: admins.epcAdmin.registered_address,
            created: true,
          });
        } else {
          setEpcAdmin({ username: '', companyName: '', registeredAddress: '', created: false });
        }
        if (admins.contractorAdmin) {
          setContractorAdmin({
            username: admins.contractorAdmin.username,
            companyName: admins.contractorAdmin.company_name,
            registeredAddress: admins.contractorAdmin.registered_address,
            created: true,
          });
        } else {
          setContractorAdmin({ username: '', companyName: '', registeredAddress: '', created: false });
        }
      }
    } catch (error) {
      message.error('Failed to fetch admin users for selected project');
      setClientAdmin({ username: '', companyName: '', registeredAddress: '', created: false });
      setEpcAdmin({ username: '', companyName: '', registeredAddress: '', created: false });
      setContractorAdmin({ username: '', companyName: '', registeredAddress: '', created: false });
    }
  };

  const handleProjectChange = (value: number) => {
    setSelectedProjectId(value);
    fetchAdminsForProject(value);
  };

  const handleInputChange = (adminType: string, field: string, value: string) => {
    const updateAdmin = (admin: AdminData) => ({ ...admin, [field]: value });
    if (adminType === 'client') setClientAdmin(updateAdmin(clientAdmin));
    else if (adminType === 'epc') setEpcAdmin(updateAdmin(epcAdmin));
    else if (adminType === 'contractor') setContractorAdmin(updateAdmin(contractorAdmin));
  };

  const createOrResetAdmin = async (adminType: string) => {
    if (!selectedProjectId) {
      message.error('Please select a project first');
      return;
    }
    let adminData: AdminData;
    let setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    let setAdmin: React.Dispatch<React.SetStateAction<AdminData>>;

    if (adminType === 'client') {
      adminData = clientAdmin;
      setLoading = setLoadingClient;
      setAdmin = setClientAdmin;
    } else if (adminType === 'epc') {
      adminData = epcAdmin;
      setLoading = setLoadingEpc;
      setAdmin = setEpcAdmin;
    } else {
      adminData = contractorAdmin;
      setLoading = setLoadingContractor;
      setAdmin = setContractorAdmin;
    }

    if (!adminData.username || !adminData.companyName || !adminData.registeredAddress) {
      message.error('Please fill all fields for ' + adminType.toUpperCase() + ' Admin');
      return;
    }

    setLoading(true);
    try {
      const password = generatePassword();

      const payload = {
        project: selectedProjectId,
        admin_type: adminType,
        username: adminData.username,
        company_name: adminData.companyName,
        registered_address: adminData.registeredAddress,
        password,
      };

      if (!adminData.created) {
        // Create admin
        await axios.post('/authentication/admin/create/', payload, {
          headers: { Authorization: `Bearer ${authStore.token}` },
        });
        message.success(`${adminType.toUpperCase()} Admin created successfully`);
      } else {
        // Reset password
        await axios.put('/authentication/admin/reset-password/', payload, {
          headers: { Authorization: `Bearer ${authStore.token}` },
        });
        message.success(`${adminType.toUpperCase()} Admin password reset successfully`);
      }

      // Update state
      setAdmin({ ...adminData, password, created: true });

      // Download credentials text file on creation only
      if (!adminData.created) {
        const textContent = `Admin Type: ${adminType.toUpperCase()}\nUsername: ${adminData.username}\nPassword: ${password}\nCompany Name: ${adminData.companyName}\nRegistered Address: ${adminData.registeredAddress}\n`;
        const element = document.createElement('a');
        const file = new Blob([textContent], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${adminType}_admin_credentials.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    } catch (error) {
      message.error(`Failed to ${adminData.created ? 'reset password for' : 'create'} ${adminType} admin`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3}>Create Admin Users</Title>
      <Form layout="vertical">
        <Form.Item label="Select Project" required>
          <Select
            placeholder="Select a project"
            onChange={handleProjectChange}
            value={selectedProjectId || undefined}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
            }
          >
            {projects.map((project) => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Client Admin Section */}
        <Divider orientation="left">Client Admin</Divider>
        <Form.Item label="Username" required>
          <Input
            value={clientAdmin.username}
            onChange={(e) => handleInputChange('client', 'username', e.target.value)}
            disabled={clientAdmin.created}
            placeholder="Enter client admin username"
          />
        </Form.Item>
        <Form.Item label="Company Name" required>
          <Input
            value={clientAdmin.companyName}
            onChange={(e) => handleInputChange('client', 'companyName', e.target.value)}
            placeholder="Enter company name"
          />
        </Form.Item>
        <Form.Item label="Registered Official Address" required>
          <Input.TextArea
            value={clientAdmin.registeredAddress}
            onChange={(e) => handleInputChange('client', 'registeredAddress', e.target.value)}
            rows={3}
            placeholder="Enter registered official address"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={() => createOrResetAdmin('client')} loading={loadingClient}>
            {clientAdmin.created ? 'Reset Password' : 'Create Admin'}
          </Button>
        </Form.Item>

        {/* EPC Admin Section */}
        <Divider orientation="left">EPC Admin</Divider>
        <Form.Item label="Username" required>
          <Input
            value={epcAdmin.username}
            onChange={(e) => handleInputChange('epc', 'username', e.target.value)}
            disabled={epcAdmin.created}
            placeholder="Enter EPC admin username"
          />
        </Form.Item>
        <Form.Item label="Company Name" required>
          <Input
            value={epcAdmin.companyName}
            onChange={(e) => handleInputChange('epc', 'companyName', e.target.value)}
            placeholder="Enter company name"
          />
        </Form.Item>
        <Form.Item label="Registered Official Address" required>
          <Input.TextArea
            value={epcAdmin.registeredAddress}
            onChange={(e) => handleInputChange('epc', 'registeredAddress', e.target.value)}
            rows={3}
            placeholder="Enter registered official address"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={() => createOrResetAdmin('epc')} loading={loadingEpc}>
            {epcAdmin.created ? 'Reset Password' : 'Create Admin'}
          </Button>
        </Form.Item>

        {/* Contractor Admin Section */}
        <Divider orientation="left">Contractor Admin</Divider>
        <Form.Item label="Username" required>
          <Input
            value={contractorAdmin.username}
            onChange={(e) => handleInputChange('contractor', 'username', e.target.value)}
            disabled={contractorAdmin.created}
            placeholder="Enter contractor admin username"
          />
        </Form.Item>
        <Form.Item label="Company Name" required>
          <Input
            value={contractorAdmin.companyName}
            onChange={(e) => handleInputChange('contractor', 'companyName', e.target.value)}
            placeholder="Enter company name"
          />
        </Form.Item>
        <Form.Item label="Registered Official Address" required>
          <Input.TextArea
            value={contractorAdmin.registeredAddress}
            onChange={(e) => handleInputChange('contractor', 'registeredAddress', e.target.value)}
            rows={3}
            placeholder="Enter registered official address"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={() => createOrResetAdmin('contractor')} loading={loadingContractor}>
            {contractorAdmin.created ? 'Reset Password' : 'Create Admin'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AdminCreation;

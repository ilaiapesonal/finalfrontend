import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import ProjectCreation from '@features/project/components/ProjectCreation';
import ProjectEdit from '@features/project/components/ProjectEdit';
import ProjectView from '@features/project/components/ProjectView';
import api from '@common/utils/axiosetup';

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

// Interface for raw project data from API
interface RawProjectFromApi {
  id: string | number; // ID can be string or number from API
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

// Interface for new project data for creation
interface NewProjectData {
  name: string;
  category: string;
  capacity: string;
  location: string;
  policeStation: string;
  policeContact: string;
  hospital: string;
  hospitalContact: string;
  commencementDate: string;
  // Add any other fields expected by the creation API endpoint
}

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [addingProject, setAddingProject] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get('/authentication/project/list/');
      console.log('API response data:', response.data);
      
      if (Array.isArray(response.data)) {
        const fetchedProjects: Project[] = response.data.map((proj: RawProjectFromApi) => {
          const numericId = Number(proj.id); // Convert ID to number
          return {
            key: String(numericId), // Key should be string
            id: numericId,
            name: proj.name,
            category: proj.category,
            capacity: proj.capacity,
            location: proj.location,
            policeStation: proj.policeStation,
            policeContact: proj.policeContact,
            hospital: proj.hospital,
            hospitalContact: proj.hospitalContact,
            commencementDate: proj.commencementDate,
          }));
        
        setProjects(fetchedProjects);
      } else {
        setProjects([]);
      }
    } catch (error) {
      message.error('Failed to fetch projects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleView = (project: Project) => {
    setViewingProject(project);
  };

  const handleEdit = (project: Project) => {
    console.log('Editing project:', project);
    setEditingProject(project);
  };

  const handleAddProject = () => {
    setAddingProject(true);
  };

  const handleCancel = () => {
    setViewingProject(null);
    setEditingProject(null);
    setAddingProject(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/authentication/project/delete/${id}/`);
      setProjects((prev) => prev.filter((proj) => proj.id !== id));
      message.success('Project deleted successfully');
    } catch (error) {
      message.error('Failed to delete project');
      console.error(error);
    }
  };

  const handleSaveNewProject = async (values: NewProjectData) => {
    try {
      const response = await api.post('/authentication/master-admin/projects/create/', values);
      // Assuming the response 'newProject' also has an id that might need conversion
      const newProjectFromApi: RawProjectFromApi = response.data;
      const numericId = Number(newProjectFromApi.id);

      const formattedProject: Project = {
        key: String(numericId),
        id: numericId,
        name: newProjectFromApi.name,
        category: newProjectFromApi.category,
        capacity: newProjectFromApi.capacity,
        location: newProject.location,
        policeStation: newProject.policeStation,
        policeContact: newProject.policeContact,
        hospital: newProject.hospital,
        hospitalContact: newProject.hospitalContact,
        commencementDate: newProject.commencementDate,
      };
      
      setProjects((prev) => [...prev, formattedProject]);
      message.success('Project added successfully');
      setAddingProject(false);
    } catch (error) {
      message.error('Failed to add project');
      console.error(error);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Capacity', dataIndex: 'capacity', key: 'capacity' },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_text: unknown, record: Project) => ( // Typed render params
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProject} style={{ marginBottom: 16 }}>
        Add Project
      </Button>
      <Table columns={columns} dataSource={projects} loading={loading} />

      {viewingProject && (
        <ProjectView
          project={viewingProject}
          visible={viewingProject !== null}
          onClose={handleCancel}
        />
      )}

      {editingProject && (
        <ProjectEdit
          project={editingProject}
          visible={true}
          onSave={async (updatedProject: Project) => {
            try {
              const payload = {
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
              
              const response = await api.put(`/authentication/project/update/${updatedProject.id}/`, payload);
              const updated = response.data;
              
              setProjects((prev) =>
                prev.map((proj) =>
                  proj.id === updated.id
                    ? {
                        key: String(updated.id),
                        id: updated.id,
                        name: updated.name,
                        category: updated.category,
                        capacity: updated.capacity,
                        location: updated.location,
                        policeStation: updated.policeStation,
                        policeContact: updated.policeContact,
                        hospital: updated.hospital,
                        hospitalContact: updated.hospitalContact,
                        commencementDate: updated.commencementDate,
                      }
                    : proj
                )
              );
              
              message.success('Project updated successfully');
              setEditingProject(null);
            } catch (error) {
              message.error('Failed to update project');
              console.error(error);
            }
          }}
          onCancel={handleCancel}
        />
      )}
      <Modal
  open={addingProject}
  title="Add New Project"
  footer={null}
  onCancel={handleCancel}
  maskClosable={false}
  afterClose={() => {
    // Any cleanup code here
  }}
>
  <ProjectCreation onFinish={handleSaveNewProject} />
</Modal>



    </div>
  );
};

export default ProjectsList;

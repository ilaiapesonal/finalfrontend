import React from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import ProjectCreation from './ProjectCreation';
import ProjectEdit from './ProjectEdit';
import ProjectView from './ProjectView';
import axios from '../../utils/axiosetup';
import useAuthStore from '../../store/authStore';

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

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [viewingProject, setViewingProject] = React.useState<Project | null>(null);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [addingProject, setAddingProject] = React.useState(false);
  const authStore = useAuthStore();

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/authentication/project/list/', {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });
      console.log('API response data:', response.data);
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('Full projects from API:', response.data);
        const filteredProjects = response.data.filter((proj: any) => typeof proj.id === 'number' && proj.id !== 0);
        console.log('Filtered projects:', filteredProjects);
        const fetchedProjects: Project[] = filteredProjects.map((proj: any) => ({
          key: String(proj.id),
          id: proj.id,
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
        console.log('Projects set in state:', fetchedProjects);
      } else {
        setProjects([]);
      }
    } catch (error) {
      message.error('Failed to fetch projects');
      console.error(error);
    }
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const handleView = (project: Project) => {
    setViewingProject(project);
  };

  const handleEdit = (project: Project) => {
    console.log('Editing project:', project);
    if (!project.id) {
      message.error('Selected project has no ID. Cannot edit.');
      return;
    }
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
      await axios.delete(`/authentication/project/delete/${id}/`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });
      setProjects((prev) => prev.filter((proj) => proj.id !== id));
      message.success('Project deleted successfully');
    } catch (error) {
      message.error('Failed to delete project');
      console.error(error);
    }
  };

  const handleSaveNewProject = async (values: any) => {
    try {
      const payload = {
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
      const response = await axios.post('/authentication/project/create/', payload, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });
      const newProject = response.data;
      setProjects((prev) => [
        ...prev,
        {
          key: String(newProject.id ?? prev.length),
          id: newProject.id ?? prev.length,
          name: newProject.name,
          category: newProject.category,
          capacity: newProject.capacity,
          location: newProject.location,
          policeStation: newProject.policeStation,
          policeContact: newProject.policeContact,
          hospital: newProject.hospital,
          hospitalContact: newProject.hospitalContact,
          commencementDate: newProject.commencementDate,
        },
      ]);
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
      render: (_: any, record: Project) => (
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
      <Table columns={columns} dataSource={projects} />

      <ProjectView
        project={viewingProject!}
        visible={viewingProject !== null}
        onClose={handleCancel}
      />

      {editingProject && (
        <ProjectEdit
          project={editingProject}
          visible={true}
          onSave={async (updatedProject) => {
            if (!updatedProject.id) {
              message.error('Project ID is missing. Cannot update project.');
              return;
            }
            try {
              console.log('Updating project with ID:', updatedProject.id);
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
            const response = await axios.put(`/authentication/project/update/${updatedProject.id}/`, payload, {
                headers: {
                  Authorization: `Bearer ${authStore.token}`,
                },
              });
              const updated = response.data;
              setProjects((prev) =>
                prev.map((proj) =>
                  proj.id === updated.id
                    ? {
                        key: updated.id,
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
        destroyOnHidden
        maskClosable={false}
      >
        <ProjectCreation onFinish={handleSaveNewProject} />
      </Modal>
    </div>
  );
};

export default ProjectsList;

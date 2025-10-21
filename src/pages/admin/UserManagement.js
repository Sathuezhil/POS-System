import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit, FiTrash2, FiUser, FiUserCheck, FiUserX, FiX, FiSave } from 'react-icons/fi';

const Container = styled.div`
  padding: 24px;
  background: transparent;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(217, 119, 6, 0.3);
  }
`;

const UsersTable = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #374151;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const RoleBadge = styled.div`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.role === 'admin' ? '#dbeafe' : '#f0fdf4'};
  color: ${props => props.role === 'admin' ? '#1e40af' : '#166534'};
`;

const StatusBadge = styled.div`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.active ? '#f0fdf4' : '#fef2f2'};
  color: ${props => props.active ? '#166534' : '#dc2626'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8fafc;
  }
`;

const EditButton = styled(ActionButton)`
  color: #3b82f6;
  border-color: #3b82f6;
  
  &:hover {
    background: #eff6ff;
  }
`;

const DeleteButton = styled(ActionButton)`
  color: #dc2626;
  border-color: #dc2626;
  
  &:hover {
    background: #fef2f2;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #64748b;
  
  &:hover {
    color: #1e293b;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #d97706;
    box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #d97706;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const CancelButton = styled.button`
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #d1d5db;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

const DeleteConfirmButton = styled.button`
  background: #dc2626;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: #b91c1c;
  }
`;

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@sebakers.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15 09:30'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@sebakers.com',
      role: 'cashier',
      status: 'active',
      lastLogin: '2024-01-15 08:45'
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike@sebakers.com',
      role: 'cashier',
      status: 'inactive',
      lastLogin: '2024-01-10 16:20'
    },
    {
      id: 4,
      name: 'Emma Wilson',
      email: 'emma@sebakers.com',
      role: 'cashier',
      status: 'active',
      lastLogin: '2024-01-15 10:15'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: 'active'
  });

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowModal(true);
  };

  const handleDeleteUser = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const handleSaveUser = () => {
    if (!formData.name || !formData.email || !formData.role) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingUser) {
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData }
          : u
      ));
      alert('User updated successfully!');
    } else {
      const newUser = {
        id: Date.now(),
        ...formData,
        lastLogin: 'Never'
      };
      setUsers([...users, newUser]);
      alert('User added successfully!');
    }

    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      status: 'active'
    });
  };

  const confirmDelete = () => {
    if (deletingUser) {
      setUsers(users.filter(u => u.id !== deletingUser.id));
      alert('User deleted successfully!');
      setShowDeleteModal(false);
      setDeletingUser(null);
    }
  };

  const cancelModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      status: 'active'
    });
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingUser(null);
  };

  return (
    <Container>
      <Header>
        <Title>User Management</Title>
        <AddButton onClick={handleAddUser}>
          <FiPlus />
          Add User
        </AddButton>
      </Header>

      <UsersTable>
        <TableHeader>
          <div>User</div>
          <div>Role</div>
          <div>Status</div>
          <div>Last Login</div>
          <div>Actions</div>
        </TableHeader>
        
        {users.map((user) => (
          <TableRow key={user.id}>
            <UserInfo>
              <UserAvatar>
                {user.name.split(' ').map(n => n[0]).join('')}
              </UserAvatar>
              <UserDetails>
                <UserName>{user.name}</UserName>
                <UserEmail>{user.email}</UserEmail>
              </UserDetails>
            </UserInfo>
            
            <RoleBadge role={user.role}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </RoleBadge>
            
            <StatusBadge active={user.status === 'active'}>
              {user.status === 'active' ? 'Active' : 'Inactive'}
            </StatusBadge>
            
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              {user.lastLogin}
            </div>
            
            <ActionButtons>
              <EditButton onClick={() => handleEditUser(user)}>
                <FiEdit size={12} />
                Edit
              </EditButton>
              <DeleteButton onClick={() => handleDeleteUser(user)}>
                <FiTrash2 size={12} />
                Delete
              </DeleteButton>
            </ActionButtons>
          </TableRow>
        ))}
      </UsersTable>

      {/* Add/Edit User Modal */}
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </ModalTitle>
              <CloseButton onClick={cancelModal}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            <FormRow>
              <FormGroup>
                <Label>Full Name *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="user@sebakers.com"
                  required
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>Role *</Label>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="">Select role</option>
                  <option value="admin">👑 Admin - Full Access</option>
                  <option value="cashier">💰 Cashier - Sales Only</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">✅ Active</option>
                  <option value="inactive">❌ Inactive</option>
                </Select>
              </FormGroup>
            </FormRow>

            <ModalActions>
              <CancelButton onClick={cancelModal}>
                Cancel
              </CancelButton>
              <SaveButton onClick={handleSaveUser}>
                <FiSave />
                {editingUser ? 'Update User' : 'Add User'}
              </SaveButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Delete User</ModalTitle>
              <CloseButton onClick={cancelDelete}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            <div style={{ padding: '20px 0' }}>
              <div style={{ 
                background: '#fef2f2', 
                border: '1px solid #fecaca', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '20px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    {deletingUser?.name?.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 style={{ margin: '0', color: '#dc2626', fontSize: '16px' }}>
                      {deletingUser?.name}
                    </h4>
                    <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
                      {deletingUser?.email} • {deletingUser?.role}
                    </p>
                  </div>
                </div>
                <p style={{ margin: '0', color: '#dc2626', fontSize: '14px', fontWeight: '500' }}>
                  ⚠️ This user will be permanently removed from the system.
                </p>
              </div>
              
              <FormGroup>
                <Label>Confirm Deletion</Label>
                <Input
                  type="text"
                  placeholder={`Type "${deletingUser?.name}" to confirm`}
                  id="deleteUserConfirm"
                  style={{ marginBottom: '8px' }}
                />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  Type the user name exactly to confirm deletion
                </small>
              </FormGroup>
            </div>

            <ModalActions>
              <CancelButton onClick={cancelDelete}>
                Cancel
              </CancelButton>
              <DeleteConfirmButton 
                onClick={() => {
                  const confirmInput = document.getElementById('deleteUserConfirm');
                  if (confirmInput && confirmInput.value === deletingUser?.name) {
                    confirmDelete();
                  } else {
                    alert('Please type the user name exactly to confirm deletion.');
                  }
                }}
              >
                <FiTrash2 size={12} />
                Delete User
              </DeleteConfirmButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default UserManagement;

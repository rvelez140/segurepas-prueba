import React, { useState } from 'react';
import { Role } from '../../types/role.types';
import { RoleList } from './RoleList';
import { RoleForm } from './RoleForm';
import { UserRoleAssignment } from './UserRoleAssignment';
import styles from './RoleManagement.module.css';

export const RoleManagement: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [showUserAssignment, setShowUserAssignment] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowForm(true);
  };

  const handleCreateRole = () => {
    setSelectedRole(undefined);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedRole(undefined);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className={styles.roleManagement}>
      <div className={styles.managementHeader}>
        <h1>Gestión de Roles y Permisos</h1>
        <p className={styles.subtitle}>
          Administra los roles del sistema y asigna permisos a cada uno
        </p>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tab} ${!showUserAssignment ? styles.tabActive : ''}`}
          onClick={() => setShowUserAssignment(false)}
        >
          Roles
        </button>
        <button
          className={`${styles.tab} ${showUserAssignment ? styles.tabActive : ''}`}
          onClick={() => setShowUserAssignment(true)}
        >
          Asignar Roles a Usuarios
        </button>
      </div>

      <div className={styles.tabContent}>
        {!showUserAssignment ? (
          <RoleList
            onEditRole={handleEditRole}
            onCreateRole={handleCreateRole}
            refreshTrigger={refreshTrigger}
          />
        ) : (
          <UserRoleAssignment />
        )}
      </div>

      {showForm && (
        <RoleForm
          role={selectedRole}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

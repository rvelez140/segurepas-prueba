import React, { useState, useEffect } from 'react';
import { Role } from '../../types/role.types';
import { getAllRoles, deleteRole } from '../../api/role.api';
import { FaEdit, FaTrash, FaPlus, FaShieldAlt } from 'react-icons/fa';
import styles from './RoleManagement.module.css';

interface RoleListProps {
  onEditRole: (role: Role) => void;
  onCreateRole: () => void;
  refreshTrigger?: number;
}

export const RoleList: React.FC<RoleListProps> = ({ onEditRole, onCreateRole, refreshTrigger }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoles();
  }, [refreshTrigger]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await getAllRoles(false);
      setRoles(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar roles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.isSystem) {
      alert('No se pueden eliminar roles del sistema');
      return;
    }

    if (!window.confirm(`¿Está seguro de eliminar el rol "${role.name}"?`)) {
      return;
    }

    try {
      await deleteRole(role.id);
      await loadRoles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al eliminar rol');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Cargando roles...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.roleList}>
      <div className={styles.roleListHeader}>
        <h2>Roles del Sistema</h2>
        <button onClick={onCreateRole} className={styles.btnCreate}>
          <FaPlus /> Crear Rol
        </button>
      </div>

      <div className={styles.rolesGrid}>
        {roles.map((role) => (
          <div key={role.id} className={styles.roleCard}>
            <div className={styles.roleCardHeader}>
              <div className={styles.roleColor} style={{ backgroundColor: role.color }}></div>
              <div className={styles.roleInfo}>
                <h3>{role.name}</h3>
                {role.isSystem && (
                  <span className={styles.systemBadge}>
                    <FaShieldAlt /> Sistema
                  </span>
                )}
              </div>
            </div>

            <p className={styles.roleDescription}>{role.description}</p>

            <div className={styles.roleStats}>
              <span className={styles.permissionCount}>
                {Array.isArray(role.permissions) ? role.permissions.length : 0} permisos
              </span>
              <span className={styles.roleSlug}>{role.slug}</span>
            </div>

            <div className={styles.roleActions}>
              <button
                onClick={() => onEditRole(role)}
                className={styles.btnEdit}
                title="Editar rol"
              >
                <FaEdit /> Editar
              </button>
              {!role.isSystem && (
                <button
                  onClick={() => handleDelete(role)}
                  className={styles.btnDelete}
                  title="Eliminar rol"
                >
                  <FaTrash /> Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div className={styles.emptyState}>
          <p>No hay roles disponibles</p>
          <button onClick={onCreateRole} className={styles.btnCreate}>
            <FaPlus /> Crear el primer rol
          </button>
        </div>
      )}
    </div>
  );
};

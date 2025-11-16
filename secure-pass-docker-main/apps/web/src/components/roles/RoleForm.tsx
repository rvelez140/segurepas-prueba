import React, { useState, useEffect } from 'react';
import { Role, Permission, CreateRoleDTO, UpdateRoleDTO, RESOURCE_LABELS, ACTION_LABELS, PermissionResource } from '../../types/role.types';
import { createRole, updateRole, getAllPermissions } from '../../api/role.api';
import { FaSave, FaTimes } from 'react-icons/fa';
import styles from './RoleManagement.module.css';

interface RoleFormProps {
  role?: Role;
  onClose: () => void;
  onSuccess: () => void;
}

export const RoleForm: React.FC<RoleFormProps> = ({ role, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPermissions();

    if (role) {
      setName(role.name);
      setDescription(role.description);
      setColor(role.color);

      // Extraer IDs de permisos
      if (Array.isArray(role.permissions)) {
        const permIds = role.permissions.map((p: any) =>
          typeof p === 'string' ? p : p.id
        );
        setSelectedPermissions(permIds);
      }
    }
  }, [role]);

  const loadPermissions = async () => {
    try {
      const data = await getAllPermissions();
      setAllPermissions(data);
    } catch (err) {
      console.error('Error loading permissions:', err);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllInResource = (resource: PermissionResource) => {
    const resourcePerms = allPermissions
      .filter((p) => p.resource === resource)
      .map((p) => p.id);

    const allSelected = resourcePerms.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      // Deseleccionar todos
      setSelectedPermissions((prev) => prev.filter((id) => !resourcePerms.includes(id)));
    } else {
      // Seleccionar todos
      setSelectedPermissions((prev) => [...new Set([...prev, ...resourcePerms])]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (role) {
        // Actualizar rol existente
        const updateData: UpdateRoleDTO = {
          name: role.isSystem ? undefined : name,
          description,
          permissions: selectedPermissions,
          color,
        };
        await updateRole(role.id, updateData);
      } else {
        // Crear nuevo rol
        const createData: CreateRoleDTO = {
          name,
          description,
          permissions: selectedPermissions,
          color,
        };
        await createRole(createData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar rol');
    } finally {
      setLoading(false);
    }
  };

  // Agrupar permisos por recurso
  const permissionsByResource: Record<string, Permission[]> = {};
  allPermissions.forEach((perm) => {
    if (!permissionsByResource[perm.resource]) {
      permissionsByResource[perm.resource] = [];
    }
    permissionsByResource[perm.resource].push(perm);
  });

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{role ? 'Editar Rol' : 'Crear Nuevo Rol'}</h2>
          <button onClick={onClose} className={styles.btnClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.roleForm}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="name">Nombre del Rol *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={role?.isSystem}
              placeholder="Ej: Técnico, Supervisor"
            />
            {role?.isSystem && (
              <small className={styles.helpText}>
                El nombre de los roles del sistema no puede ser modificado
              </small>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Descripción *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Describe las responsabilidades de este rol"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="color">Color del Rol</label>
            <div className={styles.colorPicker}>
              <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <span>{color}</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Permisos *</label>
            <div className={styles.permissionsGrid}>
              {Object.entries(permissionsByResource).map(([resource, perms]) => {
                const allSelected = perms.every((p) => selectedPermissions.includes(p.id));

                return (
                  <div key={resource} className={styles.resourceGroup}>
                    <div className={styles.resourceHeader}>
                      <h4>{RESOURCE_LABELS[resource as PermissionResource]}</h4>
                      <button
                        type="button"
                        onClick={() => handleSelectAllInResource(resource as PermissionResource)}
                        className={styles.btnSelectAll}
                      >
                        {allSelected ? 'Deseleccionar' : 'Seleccionar'} todos
                      </button>
                    </div>
                    <div className={styles.permissionsList}>
                      {perms.map((perm) => (
                        <label key={perm.id} className={styles.permissionItem}>
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.id)}
                            onChange={() => handlePermissionToggle(perm.id)}
                          />
                          <span className={styles.permissionLabel}>
                            <strong>{ACTION_LABELS[perm.action]}</strong>
                            <small>{perm.description}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.btnCancel}>
              <FaTimes /> Cancelar
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              <FaSave /> {loading ? 'Guardando...' : 'Guardar Rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

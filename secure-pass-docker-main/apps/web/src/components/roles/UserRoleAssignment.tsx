import React, { useState, useEffect } from 'react';
import { getUsersWithRoles } from '../../api/role.api';
import { getAllRoles, assignRoleToUser } from '../../api/role.api';
import { Role } from '../../types/role.types';
import { FaUser, FaShieldAlt, FaSave } from 'react-icons/fa';
import styles from './RoleManagement.module.css';

interface UserWithRole {
  _id: string;
  name: string;
  auth: { email: string };
  role: string;
  roleId?: Role;
  registerDate: string;
}

export const UserRoleAssignment: React.FC = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        getUsersWithRoles(),
        getAllRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      setSaving(userId);
      await assignRoleToUser(userId, roleId);
      await loadData();
      alert('Rol asignado exitosamente');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al asignar rol');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Cargando usuarios...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.userRoleAssignment}>
      <div className={styles.assignmentHeader}>
        <h2>Asignar Roles a Usuarios</h2>
        <p>Selecciona el rol que deseas asignar a cada usuario</p>
      </div>

      <div className={styles.usersTable}>
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol Actual</th>
              <th>Asignar Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const [selectedRoleId, setSelectedRoleId] = useState(
                user.roleId ? (user.roleId as any).id || user.roleId : ''
              );

              return (
                <tr key={user._id}>
                  <td>
                    <div className={styles.userInfo}>
                      <FaUser className={styles.userIcon} />
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.auth.email}</td>
                  <td>
                    {user.roleId && typeof user.roleId === 'object' ? (
                      <span
                        className={styles.roleBadge}
                        style={{ backgroundColor: user.roleId.color }}
                      >
                        {user.roleId.name}
                      </span>
                    ) : (
                      <span className={styles.legacyRole}>
                        {user.role || 'Sin rol'}
                      </span>
                    )}
                  </td>
                  <td>
                    <select
                      value={selectedRoleId}
                      onChange={(e) => setSelectedRoleId(e.target.value)}
                      className={styles.roleSelect}
                      disabled={saving === user._id}
                    >
                      <option value="">Seleccionar rol...</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleAssignRole(user._id, selectedRoleId)}
                      disabled={!selectedRoleId || saving === user._id}
                      className={styles.btnAssign}
                    >
                      {saving === user._id ? (
                        'Guardando...'
                      ) : (
                        <>
                          <FaSave /> Asignar
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className={styles.emptyState}>
          <p>No hay usuarios disponibles</p>
        </div>
      )}
    </div>
  );
};

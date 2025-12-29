import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPermanentAdmin, isTemporaryAdminActive } from '../../api/setup.api';
import { delToken, loadToken, setAuthToken } from '../../services/auth.service';
import ThemeToggle from '../../components/settings/ThemeToggle';
import styles from './Setup.module.css';

const CreateAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      // Verificar que el token esté presente
      const token = loadToken();
      if (!token) {
        navigate('/');
        return;
      }

      setAuthToken(token);

      // Verificar que el admin temporal esté activo
      const isActive = await isTemporaryAdminActive();
      if (!isActive) {
        delToken();
        navigate('/');
      }
    };
    checkAccess();
  }, [navigate]);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return false;
    }

    if (!formData.email.trim()) {
      setError('El email es requerido');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('El formato del email no es valido');
      return false;
    }

    if (!formData.password) {
      setError('La contrasena es requerida');
      return false;
    }

    if (formData.password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contrasenas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const result = await createPermanentAdmin({
      name: formData.name,
      email: formData.email,
      username: formData.username || undefined,
      password: formData.password,
    });

    if (result.success) {
      setSuccess(true);
      // Limpiar token temporal
      delToken();
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  if (success) {
    return (
      <div className={styles.setupContainer}>
        <div className={styles.themeToggle}>
          <ThemeToggle />
        </div>
        <div className={styles.setupCard}>
          <div className={styles.stepContent}>
            <div className={styles.completeIcon}>&#10004;</div>
            <h2>Administrador Creado!</h2>
            <p className={styles.stepDescription}>
              El usuario administrador ha sido creado exitosamente.
              Sera redirigido al login en unos segundos...
            </p>
            <button onClick={() => navigate('/')} className={styles.primaryButton}>
              Ir al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.setupContainer}>
      <div className={styles.themeToggle}>
        <ThemeToggle />
      </div>

      <div className={styles.setupCard}>
        <div className={styles.header}>
          <div className={styles.logo}>SecurePass</div>
          <h1>Crear Usuario Administrador</h1>
        </div>

        <div className={styles.stepContent}>
          <p className={styles.stepDescription}>
            Por seguridad, debe crear un usuario administrador permanente para reemplazar
            las credenciales temporales.
          </p>

          <form onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <div className={styles.formGroup}>
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nombre del administrador"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@ejemplo.com"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Nombre de Usuario (opcional)</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="admin"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Contrasena *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimo 8 caracteres"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        padding: '0',
                      }}
                    >
                      {showPassword ? '***' : '---'}
                    </button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Confirmar Contrasena *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repita la contrasena"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        padding: '0',
                      }}
                    >
                      {showConfirmPassword ? '***' : '---'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                disabled={isLoading}
                className={styles.primaryButton}
              >
                {isLoading ? 'Creando...' : 'Crear Administrador'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;

import React, { useState, useEffect } from 'react';
import styles from '../../styles/apiConfig.module.css';
import {
  getAllApiConfigs,
  updateApiConfig,
  toggleProvider,
  testProviderConnection,
  ApiConfig,
} from '../../api/apiConfig.api';

const providerIcons: Record<string, string> = {
  stripe: 'S',
  paypal: 'P',
  cloudinary: 'C',
  email: '@',
  firebase: 'F',
  sentry: 'S',
};

const ApiConfiguration: React.FC = () => {
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [editedFields, setEditedFields] = useState<Record<string, Record<string, string>>>({});
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string } | null>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllApiConfigs();
      setConfigs(data);

      // Inicializar campos editados con valores actuales
      const initialFields: Record<string, Record<string, string>> = {};
      data.forEach((config) => {
        initialFields[config.provider] = {};
        config.fields.forEach((field) => {
          initialFields[config.provider][field.key] = field.value;
        });
      });
      setEditedFields(initialFields);
    } catch (err: any) {
      setError(err.message || 'Error al cargar configuraciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (provider: string, currentState: boolean) => {
    try {
      const updatedConfig = await toggleProvider(provider, !currentState);
      setConfigs((prev) =>
        prev.map((c) => (c.provider === provider ? { ...c, isEnabled: updatedConfig.isEnabled } : c))
      );
      setSuccessMessage(`${updatedConfig.displayName} ${updatedConfig.isEnabled ? 'habilitado' : 'deshabilitado'}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleFieldChange = (provider: string, key: string, value: string) => {
    setEditedFields((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [key]: value,
      },
    }));
  };

  const handleSave = async (provider: string) => {
    try {
      setSaving(provider);
      const fields = Object.entries(editedFields[provider] || {}).map(([key, value]) => ({
        key,
        value,
      }));

      const updatedConfig = await updateApiConfig(provider, fields);
      setConfigs((prev) =>
        prev.map((c) => (c.provider === provider ? { ...c, ...updatedConfig, fields: updatedConfig.fields } : c))
      );
      setSuccessMessage('Configuracion guardada correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(null);
    }
  };

  const handleTest = async (provider: string) => {
    try {
      setTesting(provider);
      setTestResults((prev) => ({ ...prev, [provider]: null }));
      const result = await testProviderConnection(provider);
      setTestResults((prev) => ({ ...prev, [provider]: result }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: { success: false, message: err.message },
      }));
    } finally {
      setTesting(null);
    }
  };

  const toggleExpand = (provider: string) => {
    setExpandedProvider((prev) => (prev === provider ? null : provider));
    setTestResults((prev) => ({ ...prev, [provider]: null }));
  };

  if (isLoading) {
    return (
      <div className={styles.apiConfigContainer}>
        <h2 className={styles.apiConfigTitle}>Configuracion de APIs</h2>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando configuraciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.apiConfigContainer}>
      <h2 className={styles.apiConfigTitle}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
        Configuracion de APIs
      </h2>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

      <div className={styles.infoBox}>
        Configure las credenciales de los servicios externos. Las APIs funcionaran con las credenciales de la base de datos o con las variables de entorno (.env) como respaldo.
      </div>

      <div className={styles.providersList}>
        {configs.map((config) => (
          <div key={config.provider} className={styles.providerCard}>
            <div className={styles.providerHeader} onClick={() => toggleExpand(config.provider)}>
              <div className={styles.providerInfo}>
                <div className={`${styles.providerIcon} ${styles[config.provider]}`}>
                  {providerIcons[config.provider] || '?'}
                </div>
                <div>
                  <div className={styles.providerName}>{config.displayName}</div>
                  <div className={styles.providerDescription}>{config.description}</div>
                </div>
              </div>
              <div className={styles.providerStatus}>
                <span
                  className={`${styles.statusBadge} ${
                    config.isConfigured ? styles.available : styles.unavailable
                  }`}
                >
                  {config.isConfigured ? 'Configurado' : 'No configurado'}
                </span>
                <label className={styles.toggleSwitch} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={config.isEnabled}
                    onChange={() => handleToggle(config.provider, config.isEnabled)}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
                <svg
                  className={`${styles.expandIcon} ${expandedProvider === config.provider ? styles.expanded : ''}`}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            {expandedProvider === config.provider && (
              <div className={styles.providerContent}>
                {config.fields.map((field) => (
                  <div key={field.key} className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                    <input
                      type={field.isSecret ? 'password' : 'text'}
                      className={`${styles.fieldInput} ${field.isSecret ? styles.secret : ''}`}
                      value={editedFields[config.provider]?.[field.key] || ''}
                      onChange={(e) => handleFieldChange(config.provider, field.key, e.target.value)}
                      placeholder={field.isSecret ? '••••••••' : `Ingrese ${field.label.toLowerCase()}`}
                    />
                  </div>
                ))}

                <div className={styles.providerActions}>
                  <button
                    className={styles.saveButton}
                    onClick={() => handleSave(config.provider)}
                    disabled={saving === config.provider}
                  >
                    {saving === config.provider ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button
                    className={styles.testButton}
                    onClick={() => handleTest(config.provider)}
                    disabled={testing === config.provider || !config.isConfigured}
                  >
                    {testing === config.provider ? 'Probando...' : 'Probar Conexion'}
                  </button>
                </div>

                {testResults[config.provider] && (
                  <div
                    className={`${styles.testResult} ${
                      testResults[config.provider]?.success ? styles.success : styles.error
                    }`}
                  >
                    {testResults[config.provider]?.message}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiConfiguration;

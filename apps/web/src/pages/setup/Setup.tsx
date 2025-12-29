import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DatabaseConfig,
  ApiConfigInput,
  AvailableApi,
  testDatabaseConnection,
  installMongoDB,
  completeSetup,
  getAvailableApis,
  checkSetupNeeded,
} from '../../api/setup.api';
import ThemeToggle from '../../components/settings/ThemeToggle';
import styles from './Setup.module.css';

type SetupStep = 'database' | 'apis' | 'complete';

const Setup: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SetupStep>('database');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Database config
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    host: 'localhost',
    port: 27017,
    database: 'securepass',
    username: '',
    password: '',
    useDocker: false,
  });
  const [dbTested, setDbTested] = useState(false);
  const [installingDocker, setInstallingDocker] = useState(false);

  // API configs
  const [availableApis, setAvailableApis] = useState<AvailableApi[]>([]);
  const [apiConfigs, setApiConfigs] = useState<Record<string, { enabled: boolean; fields: Record<string, string> }>>({});

  // Temporary credentials
  const [tempCredentials, setTempCredentials] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    const checkSetup = async () => {
      const result = await checkSetupNeeded();
      if (!result.needsWizard) {
        if (result.needsAdminCreation) {
          navigate('/create-admin');
        } else {
          navigate('/');
        }
      }
    };
    checkSetup();
  }, [navigate]);

  useEffect(() => {
    const loadApis = async () => {
      const apis = await getAvailableApis();
      setAvailableApis(apis);

      // Inicializar configuraciones
      const initialConfigs: Record<string, { enabled: boolean; fields: Record<string, string> }> = {};
      apis.forEach((api) => {
        initialConfigs[api.provider] = {
          enabled: false,
          fields: api.fields.reduce((acc, field) => ({ ...acc, [field.key]: '' }), {}),
        };
      });
      setApiConfigs(initialConfigs);
    };
    loadApis();
  }, []);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    const result = await testDatabaseConnection(dbConfig);

    if (result.success) {
      setSuccess(result.message);
      setDbTested(true);
    } else {
      setError(result.message);
      setDbTested(false);
    }

    setIsLoading(false);
  };

  const handleInstallDocker = async () => {
    setInstallingDocker(true);
    setError('');
    setSuccess('');

    const result = await installMongoDB({
      port: dbConfig.port,
      database: dbConfig.database,
      username: dbConfig.username || 'securepass_admin',
      password: dbConfig.password || '',
    });

    if (result.success) {
      setSuccess(result.message);
      setDbConfig((prev) => ({
        ...prev,
        host: 'localhost',
        useDocker: true,
      }));
      setDbTested(true);
    } else {
      setError(result.message);
    }

    setInstallingDocker(false);
  };

  const handleCompleteSetup = async () => {
    setIsLoading(true);
    setError('');

    // Preparar APIs configuradas
    const configuredApis: ApiConfigInput[] = Object.entries(apiConfigs)
      .filter(([, config]) => config.enabled)
      .map(([provider, config]) => ({
        provider,
        isEnabled: true,
        fields: Object.entries(config.fields).map(([key, value]) => ({ key, value })),
      }));

    const result = await completeSetup(dbConfig, configuredApis);

    if (result.success) {
      setTempCredentials(result.temporaryCredentials || null);
      setCurrentStep('complete');
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  const handleApiFieldChange = (provider: string, fieldKey: string, value: string) => {
    setApiConfigs((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        fields: {
          ...prev[provider].fields,
          [fieldKey]: value,
        },
      },
    }));
  };

  const handleApiToggle = (provider: string) => {
    setApiConfigs((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        enabled: !prev[provider].enabled,
      },
    }));
  };

  const renderDatabaseStep = () => (
    <div className={styles.stepContent}>
      <h2>Configuracion de Base de Datos</h2>
      <p className={styles.stepDescription}>
        Configure la conexion a MongoDB. Esta es la unica configuracion obligatoria.
      </p>

      <div className={styles.formSection}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Host</label>
            <input
              type="text"
              value={dbConfig.host}
              onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
              placeholder="localhost"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Puerto</label>
            <input
              type="number"
              value={dbConfig.port}
              onChange={(e) => setDbConfig({ ...dbConfig, port: parseInt(e.target.value) || 27017 })}
              placeholder="27017"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Nombre de Base de Datos</label>
          <input
            type="text"
            value={dbConfig.database}
            onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
            placeholder="securepass"
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Usuario (opcional)</label>
            <input
              type="text"
              value={dbConfig.username}
              onChange={(e) => setDbConfig({ ...dbConfig, username: e.target.value })}
              placeholder="Usuario de MongoDB"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Contrasena (opcional)</label>
            <input
              type="password"
              value={dbConfig.password}
              onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
              placeholder="Contrasena"
            />
          </div>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}

      <div className={styles.buttonGroup}>
        <button
          onClick={handleTestConnection}
          disabled={isLoading}
          className={styles.secondaryButton}
        >
          {isLoading ? 'Probando...' : 'Probar Conexion'}
        </button>

        <button
          onClick={() => setCurrentStep('apis')}
          disabled={!dbTested}
          className={styles.primaryButton}
        >
          Siguiente
        </button>
      </div>

      <div className={styles.dockerSection}>
        <h3>No tiene MongoDB instalado?</h3>
        <p>Puede instalar MongoDB automaticamente usando Docker.</p>
        <button
          onClick={handleInstallDocker}
          disabled={installingDocker}
          className={styles.dockerButton}
        >
          {installingDocker ? 'Instalando MongoDB...' : 'Instalar MongoDB con Docker'}
        </button>
      </div>
    </div>
  );

  const renderApisStep = () => (
    <div className={styles.stepContent}>
      <h2>Configuracion de APIs (Opcional)</h2>
      <p className={styles.stepDescription}>
        Configure las APIs externas que desea utilizar. Todas son opcionales.
      </p>

      <div className={styles.apisList}>
        {availableApis.map((api) => (
          <div key={api.provider} className={styles.apiCard}>
            <div className={styles.apiHeader}>
              <div className={styles.apiInfo}>
                <h3>{api.displayName}</h3>
                <p>{api.description}</p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={apiConfigs[api.provider]?.enabled || false}
                  onChange={() => handleApiToggle(api.provider)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            {apiConfigs[api.provider]?.enabled && (
              <div className={styles.apiFields}>
                {api.fields.map((field) => (
                  <div key={field.key} className={styles.formGroup}>
                    <label>
                      {field.label}
                      {field.required && <span className={styles.required}>*</span>}
                    </label>
                    <input
                      type={field.isSecret ? 'password' : 'text'}
                      value={apiConfigs[api.provider]?.fields[field.key] || ''}
                      onChange={(e) => handleApiFieldChange(api.provider, field.key, e.target.value)}
                      placeholder={field.description || field.label}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.buttonGroup}>
        <button onClick={() => setCurrentStep('database')} className={styles.secondaryButton}>
          Atras
        </button>
        <button
          onClick={handleCompleteSetup}
          disabled={isLoading}
          className={styles.primaryButton}
        >
          {isLoading ? 'Completando...' : 'Completar Configuracion'}
        </button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.completeIcon}>&#10004;</div>
      <h2>Configuracion Completada!</h2>
      <p className={styles.stepDescription}>
        La configuracion inicial se ha completado exitosamente.
      </p>

      {tempCredentials && (
        <div className={styles.credentialsBox}>
          <h3>Credenciales Temporales</h3>
          <p>Use estas credenciales para el primer acceso:</p>
          <div className={styles.credential}>
            <strong>Email:</strong> {tempCredentials.email}
          </div>
          <div className={styles.credential}>
            <strong>Contrasena:</strong> {tempCredentials.password}
          </div>
          <p className={styles.warning}>
            Importante: Al iniciar sesion, debera crear un usuario administrador permanente.
          </p>
        </div>
      )}

      <button onClick={() => navigate('/')} className={styles.primaryButton}>
        Ir al Login
      </button>
    </div>
  );

  return (
    <div className={styles.setupContainer}>
      <div className={styles.themeToggle}>
        <ThemeToggle />
      </div>

      <div className={styles.setupCard}>
        <div className={styles.header}>
          <div className={styles.logo}>SecurePass</div>
          <h1>Configuracion Inicial</h1>
        </div>

        <div className={styles.stepper}>
          <div className={`${styles.step} ${currentStep === 'database' ? styles.active : ''} ${currentStep !== 'database' ? styles.completed : ''}`}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepLabel}>Base de Datos</span>
          </div>
          <div className={styles.stepLine}></div>
          <div className={`${styles.step} ${currentStep === 'apis' ? styles.active : ''} ${currentStep === 'complete' ? styles.completed : ''}`}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>APIs</span>
          </div>
          <div className={styles.stepLine}></div>
          <div className={`${styles.step} ${currentStep === 'complete' ? styles.active : ''}`}>
            <span className={styles.stepNumber}>3</span>
            <span className={styles.stepLabel}>Completado</span>
          </div>
        </div>

        {currentStep === 'database' && renderDatabaseStep()}
        {currentStep === 'apis' && renderApisStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </div>
    </div>
  );
};

export default Setup;

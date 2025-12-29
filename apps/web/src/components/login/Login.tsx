import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import style from '../../styles/visits.module.css';
import { getAuthenticatedUser, loginUser } from '../../api/auth.api';
import { checkSetupNeeded, isTemporaryAdminActive } from '../../api/setup.api';
import {
  delToken,
  loadRememberMe,
  loadToken,
  saveRememberMe,
  saveToken,
  setAuthToken,
} from '../../services/auth.service';
import ThemeToggle from '../settings/ThemeToggle';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState({
    email: '', // Estado para errores de email/usuario
    password: '', // Estado para errrores de contraseña
    credentials: '', // Estado para errores de credenciales
  });
  const [rememberMe, setRememberMe] = useState('false');
  const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Use Effect para verificar si hay un usuario autenticado antes de realizar Login
  useEffect(() => {
    const validateLogedOnUser = async () => {
      // Primero verificar si necesita configuración inicial
      try {
        const setupCheck = await checkSetupNeeded();
        if (setupCheck.needsWizard) {
          navigate('/setup');
          return;
        }
      } catch (error) {
        console.error('Error al verificar setup:', error);
      }

      const checkRemember = loadRememberMe();
      if (checkRemember && checkRemember === 'true') {
        try {
          setAuthToken(loadToken());
          const userLogedOn = await getAuthenticatedUser();
          if (userLogedOn) navigate('/home');
        } catch (error) {
          console.error('Sesion anterior no encontrada o expirada', error);
        } finally {
          setPageLoading(false);
        }
      } else {
        delToken();
        setPageLoading(false);
      }
    };
    validateLogedOnUser();
  }, [navigate]);

  const validateFields = () => {
    let valid = true;
    const newErrors = {
      email: '',
      password: '',
      credentials: '',
    };

    if (!email.trim()) {
      newErrors.email = 'El usuario o email es requerido';
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida';
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRememberMe = () => {
    rememberMe.includes('true') ? setRememberMe('false') : setRememberMe('true');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!validateFields()) {
      setIsLoading(false);
      return;
    }

    try {
      const { token } = await loginUser({ email, password });

      setAuthToken(token);
      saveRememberMe(rememberMe);
      saveToken(token);

      const verifiedUser = await getAuthenticatedUser();

      if (verifiedUser.role === 'guardia') throw new Error('Usuario no puede ser un guardia');

      // Verificar si es el admin temporal y necesita crear admin permanente
      const isTempAdmin = await isTemporaryAdminActive();
      if (isTempAdmin && email === 'admin@securepass.local') {
        navigate('/create-admin');
        return;
      }

      navigate('/home');
    } catch (error: any) {
      // Manejo especifico de errores de credenciales
      if (error.message.includes('Credenciales invalidas') || error.message.includes('Credenciales inválidas')) {
        setErrors((prev) => ({
          ...prev,
          credentials: 'Email o contrasena incorrectos',
        }));
      } else if (error.message.includes('Usuario no puede ser guardia')) {
        setErrors((prev) => ({
          ...prev,
          credentials: 'El usuario no puede ser guardia',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          credentials: 'Ocurrio un error al iniciar sesion',
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}></div>;
  } else
    return (
      <div className={`${style.loginResidentContainer} ${style.fadein}`}>
        <div className={style.loginThemeToggle}>
          <ThemeToggle />
        </div>
        <div className={`${style['loginCard']}`}>
          <h2>SecurePass</h2>
          <h3>Residentes</h3>
          <form onSubmit={handleSubmit}>
            {errors.email && <div className={style.errorMessage}>{errors.email}</div>}
            <input
              placeholder="Usuario o Correo Electrónico"
              value={email}
              className={`${style.loginInput}`}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />

            {errors.password && <div className={style.errorMessage}>{errors.password}</div>}
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                className={`${style.loginInput}`}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            <div className={style.options}>
              <label>
                <input id="checkbox" type="checkbox" onClick={handleRememberMe} />
                Mantener Sesión Iniciada
              </label>
            </div>
            <button type="submit">{isLoading ? 'CARGANDO...' : 'Iniciar Sesión'}</button>
          </form>
          {errors.credentials && (
            <div className={style.credentialsMessage}>{errors.credentials}</div>
          )}
        </div>
      </div>
    );
};

export default Login;

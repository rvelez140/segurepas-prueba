import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import style from '../../styles/visits.module.css';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tokenVerifying, setTokenVerifying] = useState(false);

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Verificar si hay un token en la URL para verificación automática o un email
  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (token) {
      verifyWithToken(token);
    }

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const verifyWithToken = async (token: string) => {
    setTokenVerifying(true);
    try {
      const response = await axios.get(`${backendUrl}/api/verification/verify-token/${token}`);
      setMessage({ type: 'success', text: response.data.message });
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Error al verificar el token',
      });
    } finally {
      setTokenVerifying(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!email.trim() || !verificationCode.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingresa tu email y el código de verificación' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/verification/verify-code`, {
        email,
        code: verificationCode,
      });

      setMessage({ type: 'success', text: response.data.message });
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Error al verificar el código',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingresa tu email' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(`${backendUrl}/api/verification/resend`, { email });
      setMessage({ type: 'success', text: response.data.message });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Error al reenviar el email',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenVerifying) {
    return (
      <div className={style.loginResidentContainer}>
        <div className={style.loginCard}>
          <h2>SecurePass</h2>
          <div className={style.logo} style={{ fontSize: '48px', marginTop: '20px' }}>
            🔐
          </div>
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>Verificando tu email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={style.loginResidentContainer}>
      <div className={style.loginCard}>
        <h2>SecurePass</h2>
        <div className={style.logo} style={{ fontSize: '48px', marginTop: '10px' }}>
          📧
        </div>
        <h3>Verifica tu Email</h3>

        <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '20px' }}>
          Ingresa el código de 6 dígitos que enviamos a tu correo electrónico
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            className={style.loginInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Código de Verificación (6 dígitos)"
            value={verificationCode}
            className={style.loginInput}
            maxLength={6}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              // Solo permitir números
              const value = e.target.value.replace(/\D/g, '');
              setVerificationCode(value);
            }}
            style={{ letterSpacing: '8px', fontSize: '20px', textAlign: 'center' }}
          />

          <button type="submit" disabled={isLoading} style={{ marginTop: '10px' }}>
            {isLoading ? 'VERIFICANDO...' : 'Verificar Código'}
          </button>
        </form>

        {message && (
          <div
            className={message.type === 'error' ? style.errorMessage : style.successMessage}
            style={{ marginTop: '15px' }}
          >
            {message.text}
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>¿No recibiste el código?</p>
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={isLoading}
            className={style.backButton}
            style={{ marginTop: '10px' }}
          >
            Reenviar Email
          </button>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button type="button" onClick={() => navigate('/')} className={style.backButton}>
            Volver al Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;

import React, { useState } from 'react';
import { createCheckoutSession } from '../../services/payment.service';
import Sidebar from '../../components/visits/Sidebar';
import styles from '../../styles/visits.module.css';
import { useSidebar } from '../../contexts/SidebarContext';

const Subscriptions = () => {
  const { isOpen } = useSidebar();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan: string, cycle: string) => {
    try {
      setLoading(true);
      const { url } = await createCheckoutSession(plan, cycle);
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error al iniciar el pago. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar setShowLogoutModal={() => {}} />
      <div className={`${styles.mainContent} ${!isOpen ? styles.mainContentFull : ''}`}>
        <div style={{ padding: '20px' }}>
          <h1>Planes de Suscripción</h1>
          <p>Elija el plan que mejor se adapte a sus necesidades</p>

          <div style={{ display: 'flex', gap: '20px', marginTop: '40px', justifyContent: 'center' }}>
            {/* Basic Plan */}
            <div style={planCardStyle}>
              <h2>Básico</h2>
              <p style={priceStyle}>$10 / mes</p>
              <ul style={featureListStyle}>
                <li>Acceso para residentes</li>
                <li>Generación de QR</li>
                <li>Historial básico</li>
              </ul>
              <button
                style={buttonStyle}
                onClick={() => handleSubscribe('basic', 'monthly')}
                disabled={loading}
              >
                Suscribirse
              </button>
            </div>

            {/* Premium Plan */}
            <div style={{ ...planCardStyle, border: '2px solid #007bff', transform: 'scale(1.05)' }}>
              <div style={{ background: '#007bff', color: 'white', padding: '5px', borderRadius: '4px 4px 0 0', marginTop: '-20px', marginBottom: '15px' }}>Recomendado</div>
              <h2>Premium</h2>
              <p style={priceStyle}>$20 / mes</p>
              <ul style={featureListStyle}>
                <li>Todo lo de Básico</li>
                <li>Soporte Prioritario</li>
                <li>Reportes avanzados</li>
                <li>Múltiples vehículos</li>
              </ul>
              <button
                style={{ ...buttonStyle, background: '#007bff' }}
                onClick={() => handleSubscribe('premium', 'monthly')}
                disabled={loading}
              >
                Suscribirse
              </button>
            </div>

            {/* Enterprise Plan */}
            <div style={planCardStyle}>
              <h2>Enterprise</h2>
              <p style={priceStyle}>$50 / mes</p>
              <ul style={featureListStyle}>
                <li>Todo lo de Premium</li>
                <li>API Access</li>
                <li>Soporte dedicado 24/7</li>
                <li>Integraciones personalizadas</li>
              </ul>
              <button
                style={buttonStyle}
                onClick={() => handleSubscribe('enterprise', 'monthly')}
                disabled={loading}
              >
                Suscribirse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const planCardStyle: React.CSSProperties = {
  background: 'white',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  width: '300px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const priceStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '20px 0',
  color: '#333',
};

const featureListStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '0 0 30px 0',
  textAlign: 'left',
  width: '100%',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: '#333',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
  width: '100%',
};

export default Subscriptions;

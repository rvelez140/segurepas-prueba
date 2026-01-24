import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { getDashboard, getTrends } from '../../services/analytics.service';
import Sidebar from '../../components/visits/Sidebar';
import styles from '../../styles/visits.module.css'; // Reusing visit styles for layout
import { useSidebar } from '../../contexts/SidebarContext';

const Analytics = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [trendsData, setTrendsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isOpen } = useSidebar();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboard = await getDashboard();
        const trends = await getTrends();
        setDashboardData(dashboard.data);
        setTrendsData(trends.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Cargando analytics...</div>;

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar setShowLogoutModal={() => {}} /> {/* Mocking prop for now */}
      <div className={`${styles.mainContent} ${!isOpen ? styles.mainContentFull : ''}`}>
        <div style={{ padding: '20px' }}>
          <h1>Analytics Dashboard</h1>

          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
            <div style={cardStyle}>
              <h3>Revenue (MRR)</h3>
              <p style={metricStyle}>${dashboardData?.revenue?.monthlyRecurringRevenue / 100 || 0}</p>
            </div>
            <div style={cardStyle}>
              <h3>Suscripciones Activas</h3>
              <p style={metricStyle}>{dashboardData?.subscriptions?.totalActive || 0}</p>
            </div>
            <div style={cardStyle}>
              <h3>Churn Rate</h3>
              <p style={metricStyle}>{dashboardData?.subscriptions?.churnRate || 0}%</p>
            </div>
            <div style={cardStyle}>
              <h3>Pagos Exitosos</h3>
              <p style={metricStyle}>{dashboardData?.payments?.successfulPayments || 0}</p>
            </div>
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Revenue Trend */}
            <div style={chartCardStyle}>
              <h3>Tendencia de Ingresos</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendsData?.revenue || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Ingresos ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subscription Growth */}
            <div style={chartCardStyle}>
              <h3>Crecimiento de Suscripciones</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendsData?.subscriptions || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" name="Nuevas Suscripciones" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const chartCardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const metricStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
};

export default Analytics;

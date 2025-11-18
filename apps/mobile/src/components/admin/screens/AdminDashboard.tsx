import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/types";
import { User } from "../../../types/user.types";
import { getAuthenticatedUser } from "../../../api/auth.api";
import { loadToken, setAuthToken, delToken } from "../../../services/auth.service";
import { getDashboard, DashboardData } from "../../../api/analytics.api";

type AdminDashboardProps = NativeStackScreenProps<
  RootStackParamList,
  "AdminDashboard"
>;

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setAuthToken(await loadToken());

      const userData = await getAuthenticatedUser();
      setUser(userData);

      // Cargar datos del dashboard (últimos 30 días)
      const data = await getDashboard();
      setDashboardData(data);
    } catch (error: any) {
      console.error("Error al cargar datos:", error);
      Alert.alert("Error", error.message);
      if (error.message.includes("Sesión")) {
        delToken();
        navigation.replace("Login");
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const handleViewAnalytics = () => {
    navigation.navigate("Analytics");
  };

  const handleUserManagement = () => {
    navigation.navigate("UserManagement");
  };

  const handleReports = () => {
    navigation.navigate("Reports");
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: () => {
            delToken();
            setAuthToken(null);
            navigation.replace("Login");
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Panel de Administración</Text>
        <Text style={styles.userName}>{user?.name}</Text>
      </View>

      {/* Revenue Metrics */}
      {dashboardData && (
        <>
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>Métricas de Ingresos</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {formatCurrency(dashboardData.revenueMetrics.totalRevenue)}
                </Text>
                <Text style={styles.metricLabel}>Ingresos Totales</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {formatCurrency(dashboardData.revenueMetrics.mrr)}
                </Text>
                <Text style={styles.metricLabel}>MRR</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {formatCurrency(dashboardData.revenueMetrics.arr)}
                </Text>
                <Text style={styles.metricLabel}>ARR</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {formatCurrency(dashboardData.revenueMetrics.averageRevenuePerUser)}
                </Text>
                <Text style={styles.metricLabel}>ARPU</Text>
              </View>
            </View>
          </View>

          {/* Subscription Metrics */}
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>Métricas de Suscripciones</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={[styles.metricValue, { color: "#4CAF50" }]}>
                  {dashboardData.subscriptionMetrics.totalActive}
                </Text>
                <Text style={styles.metricLabel}>Activas</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={[styles.metricValue, { color: "#F44336" }]}>
                  {dashboardData.subscriptionMetrics.totalCanceled}
                </Text>
                <Text style={styles.metricLabel}>Canceladas</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {formatPercentage(dashboardData.subscriptionMetrics.churnRate)}
                </Text>
                <Text style={styles.metricLabel}>Churn Rate</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {formatPercentage(dashboardData.subscriptionMetrics.retentionRate)}
                </Text>
                <Text style={styles.metricLabel}>Retención</Text>
              </View>
            </View>
          </View>

          {/* Growth Metrics */}
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>Crecimiento</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={[styles.metricValue, { color: "#4CAF50" }]}>
                  +{dashboardData.growthMetrics.newSubscriptions}
                </Text>
                <Text style={styles.metricLabel}>Nuevas</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={[styles.metricValue, { color: "#F44336" }]}>
                  -{dashboardData.growthMetrics.canceledSubscriptions}
                </Text>
                <Text style={styles.metricLabel}>Canceladas</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {dashboardData.growthMetrics.netGrowth > 0 ? "+" : ""}
                  {dashboardData.growthMetrics.netGrowth}
                </Text>
                <Text style={styles.metricLabel}>Neto</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {formatPercentage(dashboardData.growthMetrics.growthRate)}
                </Text>
                <Text style={styles.metricLabel}>Tasa</Text>
              </View>
            </View>
          </View>

          {/* Payment Metrics */}
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>Métricas de Pagos</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {dashboardData.paymentMetrics.totalPayments}
                </Text>
                <Text style={styles.metricLabel}>Total Pagos</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={[styles.metricValue, { color: "#4CAF50" }]}>
                  {dashboardData.paymentMetrics.successfulPayments}
                </Text>
                <Text style={styles.metricLabel}>Exitosos</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={[styles.metricValue, { color: "#F44336" }]}>
                  {dashboardData.paymentMetrics.failedPayments}
                </Text>
                <Text style={styles.metricLabel}>Fallidos</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {formatPercentage(dashboardData.paymentMetrics.successRate)}
                </Text>
                <Text style={styles.metricLabel}>Éxito</Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

        <TouchableOpacity
          style={[styles.actionButton, styles.analyticsAction]}
          onPress={handleViewAnalytics}
        >
          <Text style={styles.actionButtonText}>Ver Analytics Detallado</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.usersAction]}
          onPress={handleUserManagement}
        >
          <Text style={styles.actionButtonText}>Gestionar Usuarios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.reportsAction]}
          onPress={handleReports}
        >
          <Text style={styles.actionButtonText}>Generar Reportes</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#673AB7",
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  userName: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 5,
  },
  metricsContainer: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    backgroundColor: "#FFF",
    width: "48%",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#673AB7",
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: "#666",
  },
  actionsContainer: {
    margin: 15,
  },
  actionButton: {
    padding: 18,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsAction: {
    backgroundColor: "#2196F3",
  },
  usersAction: {
    backgroundColor: "#4CAF50",
  },
  reportsAction: {
    backgroundColor: "#FF9800",
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#F44336",
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomPadding: {
    height: 30,
  },
});

export default AdminDashboard;

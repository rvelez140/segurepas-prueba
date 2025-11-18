import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/types";
import { User } from "../../../types/user.types";
import { getAuthenticatedUser } from "../../../api/auth.api";
import { loadToken, setAuthToken, delToken } from "../../../services/auth.service";
import { getActiveSubscription, Subscription } from "../../../api/subscription.api";
import { getVisitsFromResident } from "../../../api/visit.api";
import { VisitResponse } from "../../../types/visit.types";

type ResidentDashboardProps = NativeStackScreenProps<
  RootStackParamList,
  "ResidentDashboard"
>;

const ResidentDashboard: React.FC<ResidentDashboardProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [recentVisits, setRecentVisits] = useState<VisitResponse[]>([]);
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

      // Cargar suscripción activa
      const activeSub = await getActiveSubscription(userData.id);
      setSubscription(activeSub);

      // Cargar visitas recientes
      const visits = await getVisitsFromResident(userData.id);
      setRecentVisits(visits.slice(0, 5)); // Últimas 5 visitas

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

  const handleAuthorizeVisit = () => {
    navigation.navigate("AuthorizeVisit");
  };

  const handleViewHistory = () => {
    navigation.navigate("VisitHistory");
  };

  const handleManageSubscription = () => {
    navigation.navigate("ManageSubscription");
  };

  const handlePaymentHistory = () => {
    navigation.navigate("PaymentHistory");
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

  const getSubscriptionStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "trial":
        return "#2196F3";
      case "canceled":
        return "#FF9800";
      case "expired":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getSubscriptionPlanName = (plan?: string) => {
    switch (plan) {
      case "basic":
        return "Básico";
      case "premium":
        return "Premium";
      case "enterprise":
        return "Empresarial";
      default:
        return "Sin plan";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        <Text style={styles.welcomeText}>Bienvenido, {user?.name}</Text>
        <Text style={styles.apartmentText}>Apartamento: {user?.apartment}</Text>
      </View>

      {/* Subscription Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Suscripción Actual</Text>
        {subscription ? (
          <>
            <View style={styles.subscriptionInfo}>
              <Text style={styles.planName}>
                {getSubscriptionPlanName(subscription.plan)}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getSubscriptionStatusColor(subscription.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {subscription.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.subscriptionDetail}>
              Fecha de vencimiento: {formatDate(subscription.endDate)}
            </Text>
            <Text style={styles.subscriptionDetail}>
              Ciclo: {subscription.billingCycle === "monthly" ? "Mensual" : "Anual"}
            </Text>
          </>
        ) : (
          <Text style={styles.noSubscription}>No tienes suscripción activa</Text>
        )}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleManageSubscription}
        >
          <Text style={styles.secondaryButtonText}>
            {subscription ? "Gestionar Suscripción" : "Obtener Suscripción"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction]}
          onPress={handleAuthorizeVisit}
        >
          <Text style={styles.actionButtonText}>Autorizar Nueva Visita</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryAction]}
          onPress={handleViewHistory}
        >
          <Text style={styles.actionButtonText}>Ver Historial de Visitas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.tertiaryAction]}
          onPress={handlePaymentHistory}
        >
          <Text style={styles.actionButtonText}>Historial de Pagos</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Visits */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Visitas Recientes</Text>
        {recentVisits.length > 0 ? (
          recentVisits.map((visit) => (
            <View key={visit._id} style={styles.visitItem}>
              <Text style={styles.visitName}>{visit.visit.name}</Text>
              <Text style={styles.visitDetail}>
                {visit.visit.document} " {formatDate(visit.authorization.date)}
              </Text>
              <View
                style={[
                  styles.visitStatusBadge,
                  {
                    backgroundColor:
                      visit.authorization.state === "approved"
                        ? "#4CAF50"
                        : visit.authorization.state === "pending"
                        ? "#FF9800"
                        : "#F44336",
                  },
                ]}
              >
                <Text style={styles.visitStatusText}>
                  {visit.authorization.state.toUpperCase()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No hay visitas recientes</Text>
        )}
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
    backgroundColor: "#2196F3",
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  apartmentText: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 5,
  },
  card: {
    backgroundColor: "#FFF",
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  subscriptionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  planName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2196F3",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  subscriptionDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  noSubscription: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#2196F3",
    fontWeight: "bold",
    fontSize: 14,
  },
  actionsContainer: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
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
  primaryAction: {
    backgroundColor: "#4CAF50",
  },
  secondaryAction: {
    backgroundColor: "#2196F3",
  },
  tertiaryAction: {
    backgroundColor: "#FF9800",
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  visitItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingVertical: 12,
  },
  visitName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  visitDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  visitStatusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  visitStatusText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  noData: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
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

export default ResidentDashboard;

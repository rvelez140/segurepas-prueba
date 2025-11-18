import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/types";
import { getVisitsFromResident } from "../../../api/visit.api";
import { getAuthenticatedUser } from "../../../api/auth.api";
import { VisitResponse } from "../../../types/visit.types";

type VisitHistoryProps = NativeStackScreenProps<
  RootStackParamList,
  "VisitHistory"
>;

const VisitHistory: React.FC<VisitHistoryProps> = ({ navigation }) => {
  const [visits, setVisits] = useState<VisitResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const user = await getAuthenticatedUser();
      const visitsData = await getVisitsFromResident(user.id);
      setVisits(visitsData);
    } catch (error: any) {
      console.error("Error al cargar visitas:", error);
      Alert.alert("Error", error.message || "No se pudieron cargar las visitas");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVisits();
    setRefreshing(false);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "rejected":
        return "#F44336";
      case "expired":
        return "#9E9E9E";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobada";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazada";
      case "expired":
        return "Expirada";
      default:
        return status;
    }
  };

  const handleVisitPress = (visit: VisitResponse) => {
    if (visit.authorization.state === "approved") {
      navigation.navigate("QRDisplay", {
        visitId: visit._id,
        qrId: visit.qrId,
      });
    }
  };

  const renderVisit = ({ item }: { item: VisitResponse }) => (
    <TouchableOpacity
      style={styles.visitCard}
      onPress={() => handleVisitPress(item)}
      activeOpacity={item.authorization.state === "approved" ? 0.7 : 1}
    >
      <View style={styles.visitHeader}>
        <Text style={styles.visitName}>{item.visit.name}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.authorization.state) },
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusLabel(item.authorization.state)}
          </Text>
        </View>
      </View>

      <Text style={styles.visitDetail}>
        Documento: {item.visit.document}
      </Text>
      <Text style={styles.visitDetail}>
        Email: {item.visit.email}
      </Text>
      <Text style={styles.visitDetail}>
        Autorizada: {formatDate(item.authorization.date)}
      </Text>
      <Text style={styles.visitDetail}>
        Vencimiento: {formatDate(item.authorization.exp)}
      </Text>

      {item.authorization.reason && (
        <Text style={styles.visitReason}>
          Motivo: {item.authorization.reason}
        </Text>
      )}

      {item.registry?.entry && (
        <View style={styles.registryInfo}>
          <Text style={styles.registryTitle}>Registro de Entrada:</Text>
          <Text style={styles.registryText}>
            {formatDate(item.registry.entry.date!)}
          </Text>
        </View>
      )}

      {item.registry?.exit && (
        <View style={styles.registryInfo}>
          <Text style={styles.registryTitle}>Registro de Salida:</Text>
          <Text style={styles.registryText}>
            {formatDate(item.registry.exit.date!)}
          </Text>
        </View>
      )}

      {item.authorization.state === "approved" && (
        <Text style={styles.tapToView}>Toca para ver código QR</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={visits}
        renderItem={renderVisit}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No tienes visitas autorizadas
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate("AuthorizeVisit")}
            >
              <Text style={styles.addButtonText}>
                Autorizar Nueva Visita
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {visits.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate("AuthorizeVisit")}
        >
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  listContainer: {
    padding: 15,
  },
  visitCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  visitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  visitName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
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
  visitDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  visitReason: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  registryInfo: {
    backgroundColor: "#F0F0F0",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  registryTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  registryText: {
    fontSize: 13,
    color: "#666",
  },
  tapToView: {
    fontSize: 12,
    color: "#2196F3",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#4CAF50",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  floatingButtonText: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "bold",
  },
});

export default VisitHistory;

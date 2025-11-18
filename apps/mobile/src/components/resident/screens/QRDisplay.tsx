import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Share,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/types";
import { getVisitById } from "../../../api/visit.api";
import { VisitResponse } from "../../../types/visit.types";

type QRDisplayProps = NativeStackScreenProps<RootStackParamList, "QRDisplay">;

const QRDisplay: React.FC<QRDisplayProps> = ({ route, navigation }) => {
  const { visitId, qrId } = route.params;
  const [visit, setVisit] = useState<VisitResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVisit();
  }, [visitId]);

  const loadVisit = async () => {
    try {
      setLoading(true);
      const visitData = await getVisitById(visitId);
      setVisit(visitData);
    } catch (error: any) {
      console.error("Error al cargar visita:", error);
      Alert.alert("Error", error.message || "No se pudo cargar la visita");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrId}`;
      const message = `
Autorización de Visita - SecurePass

Visitante: ${visit?.visit.name}
Documento: ${visit?.visit.document}
Válido hasta: ${new Date(visit?.authorization.exp!).toLocaleDateString("es-ES")}

Código QR: ${qrUrl}

Este código QR debe ser presentado en la entrada.
      `.trim();

      await Share.share({
        message,
        title: "Autorización de Visita",
      });
    } catch (error: any) {
      console.error("Error al compartir:", error);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || !visit) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrId}`;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Código QR de Autorización</Text>

        {/* QR Code Image */}
        <View style={styles.qrContainer}>
          <Text style={styles.qrPlaceholder}>
            [QR Code]
          </Text>
          <Text style={styles.qrUrl}>{qrImageUrl}</Text>
          <Text style={styles.qrId}>ID: {qrId}</Text>
        </View>

        {/* Visit Information */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Información del Visitante</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{visit.visit.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Documento:</Text>
            <Text style={styles.infoValue}>{visit.visit.document}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{visit.visit.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Autorizada:</Text>
            <Text style={styles.infoValue}>
              {formatDate(visit.authorization.date)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vence:</Text>
            <Text style={styles.infoValue}>
              {formatDate(visit.authorization.exp)}
            </Text>
          </View>

          {visit.authorization.reason && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Motivo:</Text>
              <Text style={styles.infoValue}>{visit.authorization.reason}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado:</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    visit.authorization.state === "approved"
                      ? "#4CAF50"
                      : "#FF9800",
                },
              ]}
            >
              <Text style={styles.statusText}>
                {visit.authorization.state === "approved"
                  ? "APROBADA"
                  : visit.authorization.state.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Entry/Exit Registry */}
        {visit.registry?.entry && (
          <View style={styles.registryCard}>
            <Text style={styles.registryTitle}>Registro de Entrada</Text>
            <Text style={styles.registryText}>
              {formatDate(visit.registry.entry.date!)}
            </Text>
            {visit.registry.entry.note && (
              <Text style={styles.registryNote}>
                Nota: {visit.registry.entry.note}
              </Text>
            )}
          </View>
        )}

        {visit.registry?.exit && (
          <View style={styles.registryCard}>
            <Text style={styles.registryTitle}>Registro de Salida</Text>
            <Text style={styles.registryText}>
              {formatDate(visit.registry.exit.date!)}
            </Text>
            {visit.registry.exit.note && (
              <Text style={styles.registryNote}>
                Nota: {visit.registry.exit.note}
              </Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Compartir QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            Nota: El visitante debe presentar este código QR al guardia de
            seguridad en la entrada. También se ha enviado una copia por email.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  qrContainer: {
    backgroundColor: "#FFF",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrPlaceholder: {
    fontSize: 100,
    color: "#DDD",
    marginBottom: 10,
  },
  qrUrl: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
  },
  qrId: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    flex: 2,
    textAlign: "right",
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
  registryCard: {
    backgroundColor: "#E3F2FD",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  registryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976D2",
    marginBottom: 8,
  },
  registryText: {
    fontSize: 14,
    color: "#333",
  },
  registryNote: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
    marginTop: 5,
  },
  shareButton: {
    backgroundColor: "#2196F3",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  backButtonText: {
    color: "#2196F3",
    fontSize: 16,
    fontWeight: "bold",
  },
  note: {
    backgroundColor: "#FFF9C4",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 30,
  },
  noteText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default QRDisplay;

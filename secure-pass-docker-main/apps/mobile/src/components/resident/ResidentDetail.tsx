import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/types";
import { User } from "../../types/user.types";
import { VisitResponse } from "@/types/visit.types";
import { getVisitsByResidentId } from "@/api/visit.api";

type ResidentDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ResidentDetail"
>;

const ResidentDetail: React.FC<ResidentDetailScreenProps> = ({ route }) => {
  const resident = route.params.resident;

  const [visits, setVisits] = useState<VisitResponse[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getVisits = async () => {
      try {
        setVisits(await getVisitsByResidentId(resident._id));
        setIsLoading(false);
      } catch (error) {
        console.error(`Ocurrio un error al obtener visitas`, error);
      }
    };
    getVisits();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para obtener los estilos del badge según el estado
  const getBadgeStyles = (state: string) => {
    const lowerState = state.toLowerCase();
    
    switch(lowerState) {
      case 'aprobada':
        return styles.badgeAprobada;
      case 'rechazada':
        return styles.badgeRechazada;
      case 'pendiente':
        return styles.badgePendiente;
      case 'expirada':
        return styles.badgeExpirada;
      case 'finalizada':
        return styles.badgeFinalizada;
      default:
        return styles.badgeDefault;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Detalles del Residente</Text>
      </View>

      <View style={styles.card}>
        {/* Secciones existentes de información del residente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nombre:</Text>
            <Text style={styles.detailValue}>{resident.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{resident.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Teléfono:</Text>
            <Text style={styles.detailValue}>{resident.tel || 'No especificado'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Residencia</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Apartamento:</Text>
            <Text style={styles.detailValue}>{resident.apartment || 'No especificado'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Cuenta</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha de Registro:</Text>
            <Text style={styles.detailValue}>{formatDate(resident.registerDate)}</Text>
          </View>
        </View>

        {/* Sección de Historial de Visitas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Visitas</Text>
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>Nombre</Text>
            <Text style={styles.headerText}>Estado</Text>
            <Text style={styles.headerText}>Autorización</Text>
          </View>
          
          {visits?.map((v, i) => (
            <TouchableOpacity 
              key={i}
              style={styles.visitRow}
            >
              <Text style={styles.columnText}>{v.visit.name}</Text>
              <View style={[styles.badge, getBadgeStyles(v.authorization.state)]}>
                <Text style={styles.badgeText}>{v.authorization.state.toUpperCase()}</Text>
              </View>
              <Text style={styles.dateText}>{formatDate(v.authorization.date)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    textAlign: "right",
    flexShrink: 1,
    flexWrap: "wrap",
    maxWidth: "60%",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    flex: 1,
    textAlign: "center",
  },
  columnText: {
    fontSize: 13,
    color: "#2c3e50",
    flex: 1,
    textAlign: "left",
  },
  dateText: {
    fontSize: 14,
    color: "#2c3e50",
    flex: 1,
    textAlign: "center",
  },
  visitRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingVertical: 17,
    paddingHorizontal: 17,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  // Estilos para los badges
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  badgeAprobada: {
    backgroundColor: '#d1fae5',
  },
  badgeRechazada: {
    backgroundColor: '#fee2e2',
  },
  badgePendiente: {
    backgroundColor: '#fef9c3',
  },
  badgeExpirada: {
    backgroundColor: '#e5e7eb',
  },
  badgeFinalizada: {
    backgroundColor: '#cddff9',
  },
  badgeDefault: {
    backgroundColor: '#f3f4f6',
  },
  // Estilos de texto para cada badge
  badgeAprobadaText: {
    color: '#065f46',
  },
  badgeRechazadaText: {
    color: '#991b1b',
  },
  badgePendienteText: {
    color: '#92400e',
  },
  badgeExpiradaText: {
    color: '#374151',
  },
  badgeFinalizadaText: {
    color: '#0284c7',
  },
  badgeDefaultText: {
    color: '#6b7280',
  },
});

// Combinar estilos de color de texto con los badges
Object.assign(styles, {
  badgeAprobada: {
    ...styles.badgeAprobada,
    ...styles.badgeAprobadaText,
  },
  badgeRechazada: {
    ...styles.badgeRechazada,
    ...styles.badgeRechazadaText,
  },
  badgePendiente: {
    ...styles.badgePendiente,
    ...styles.badgePendienteText,
  },
  badgeExpirada: {
    ...styles.badgeExpirada,
    ...styles.badgeExpiradaText,
  },
  badgeFinalizada: {
    ...styles.badgeFinalizada,
    ...styles.badgeFinalizadaText,
  },
  badgeDefault: {
    ...styles.badgeDefault,
    ...styles.badgeDefaultText,
  },
});

export default ResidentDetail;
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/types";
import { authorizeVisit } from "../../../api/visit.api";
import { getAuthenticatedUser } from "../../../api/auth.api";

type AuthorizeVisitProps = NativeStackScreenProps<
  RootStackParamList,
  "AuthorizeVisit"
>;

const AuthorizeVisit: React.FC<AuthorizeVisitProps> = ({ navigation }) => {
  const [visitName, setVisitName] = useState("");
  const [visitEmail, setVisitEmail] = useState("");
  const [visitDocument, setVisitDocument] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateDocument = (document: string) => {
    // Validar formato de documento (11 dígitos)
    return /^\d{11}$/.test(document);
  };

  const validateDate = (dateStr: string) => {
    // Validar formato DD/MM/YYYY
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(dateRegex);

    if (!match) return false;

    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = parseInt(match[3]);

    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    const date = new Date(year, month - 1, day);
    return date > new Date();
  };

  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!visitName.trim()) {
      Alert.alert("Error", "El nombre del visitante es requerido");
      return;
    }

    if (!validateEmail(visitEmail)) {
      Alert.alert("Error", "Por favor ingresa un email válido");
      return;
    }

    if (!validateDocument(visitDocument)) {
      Alert.alert("Error", "El documento debe tener 11 dígitos");
      return;
    }

    if (!validateDate(expirationDate)) {
      Alert.alert(
        "Error",
        "La fecha debe estar en formato DD/MM/YYYY y ser futura"
      );
      return;
    }

    try {
      setLoading(true);

      const user = await getAuthenticatedUser();
      const exp = parseDate(expirationDate);

      const visitData = {
        visitName: visitName.trim(),
        visitEmail: visitEmail.trim(),
        visitDocument: visitDocument.trim(),
        resident: user.id,
        exp,
        reason: reason.trim() || undefined,
      };

      const response = await authorizeVisit(visitData);

      Alert.alert(
        "Éxito",
        "Visita autorizada correctamente. Se ha enviado un email con el código QR al visitante.",
        [
          {
            text: "Ver QR",
            onPress: () => {
              navigation.navigate("QRDisplay", {
                visitId: response._id,
                qrId: response.qrId,
              });
            },
          },
          {
            text: "Volver",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );

      // Limpiar formulario
      setVisitName("");
      setVisitEmail("");
      setVisitDocument("");
      setExpirationDate("");
      setReason("");
    } catch (error: any) {
      console.error("Error al autorizar visita:", error);
      Alert.alert("Error", error.message || "No se pudo autorizar la visita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Autorizar Nueva Visita</Text>
        <Text style={styles.subtitle}>
          Completa la información del visitante para generar una autorización
        </Text>

        {/* Nombre del visitante */}
        <Text style={styles.label}>Nombre del Visitante *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Juan Pérez"
          value={visitName}
          onChangeText={setVisitName}
          autoCapitalize="words"
        />

        {/* Email del visitante */}
        <Text style={styles.label}>Email del Visitante *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: juan.perez@email.com"
          value={visitEmail}
          onChangeText={setVisitEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Documento del visitante */}
        <Text style={styles.label}>Documento de Identidad *</Text>
        <TextInput
          style={styles.input}
          placeholder="11 dígitos"
          value={visitDocument}
          onChangeText={setVisitDocument}
          keyboardType="numeric"
          maxLength={11}
        />

        {/* Fecha de expiración */}
        <Text style={styles.label}>Fecha de Vencimiento *</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/YYYY"
          value={expirationDate}
          onChangeText={setExpirationDate}
          keyboardType="numeric"
        />
        <Text style={styles.helpText}>
          Ingresa la fecha hasta la cual será válida la autorización
        </Text>

        {/* Motivo de la visita */}
        <Text style={styles.label}>Motivo de la Visita (Opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ej: Visita familiar"
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        {/* Botones */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            loading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Autorizando..." : "Autorizar Visita"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  helpText: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
    fontStyle: "italic",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: "#9E9E9E",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#F44336",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  cancelButtonText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AuthorizeVisit;

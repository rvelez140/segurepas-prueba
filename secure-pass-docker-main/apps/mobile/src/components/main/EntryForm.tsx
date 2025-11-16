import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Button,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { RegistryData, VisitResponse } from "@/types/visit.types";
import { getVisitsByQRId, RegisterEntry, uploadImage } from "@/api/visit.api";
import { useRoute } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/types";
import { loadToken, setAuthToken } from "@/services/auth.service";
import { getAuthenticatedUser } from "@/api/auth.api";
import { User } from "@/types/user.types";

type EntryFormProps = NativeStackScreenProps<RootStackParamList, "EntryForm">;

const EntryForm: React.FC<EntryFormProps> = ({ navigation, route }) => {
  const [imagenPersona, setImagenPersona] = useState<string | null>(null);
  const [imagenVehiculo, setImagenVehiculo] = useState<string | null>(null);
  const { qrData } = route.params;
  const [guard, setGuard] = useState<User | null>(null);
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [visits, setVisits] = useState<VisitResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await loadToken();
        setAuthTokenState(token);
        setAuthToken(token);

        if (token) {
          const user = await getAuthenticatedUser();
          setGuard(user);
        }
      } catch (error) {
        console.error("Error autenticando:", error);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const getVisits = async () => {
      try {
        setVisits(await getVisitsByQRId(qrData));
        setIsLoading(false);
      } catch (error) {
        console.error(`Ocurrio un error al obtener visitas`, error);
        setIsLoading(false);
      }
    };
    getVisits();
  }, [qrData]);

  const tomarFoto = async (tipo: "upload-visit" | "upload-vehicle") => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        "Permiso denegado",
        "Se necesita acceso a la cámara para tomar fotos"
      );
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      const uri = resultado.assets[0].uri;
      if (tipo === "upload-visit") {
        setImagenPersona(uri);
      } else {
        setImagenVehiculo(uri);
      }
    }
  };

  const createFormData = (uri: string) => {
    const formData = new FormData();
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri,
      name: filename,
      type,
    } as any);

    return formData;
  };

  const handleImageUpload = async (
    imageUri: string | null,
    endpoint: "upload-visit" | "upload-vehicle",
    document: string
  ) => {
    if (!imageUri) return;

    try {
      setIsUploading(true);
      const formData = createFormData(imageUri);
      await uploadImage(endpoint, document, formData);
    } catch (error) {
      console.error("Error al subir imagen:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const aprobarVisita = async () => {
    if (!visits || !guard) return;

    try {
      setIsUploading(true);

      const payload: RegistryData = {
        qrId: visits.qrId,
        guardId: guard._id,
      };
      await RegisterEntry(payload, "aprobada");

      if (imagenPersona) {
        await handleImageUpload(
          imagenPersona,
          "upload-visit",
          visits.visit.document
        );
      }

      if (imagenVehiculo) {
        await handleImageUpload(
          imagenVehiculo,
          "upload-vehicle",
          visits.visit.document
        );
      }

      Alert.alert("Éxito", "Entrada aprobada");
      navigation.navigate("Main");
    } catch (error) {
      Alert.alert("Error", "No se pudo aprobar la visita");
      console.error("Error en aprobarVisita:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const rechazarVisita = async () => {
    if (!visits || !guard) return;

    try {
      const payload: RegistryData = {
        qrId: visits.qrId,
        guardId: guard._id,
      };
      await RegisterEntry(payload, "rechazada");
      Alert.alert("Éxito", "Entrada rechazada");
      navigation.navigate("Main");
    } catch (error) {
      Alert.alert("Error", "No se pudo rechazar la visita");
      console.error("Error en rechazarVisita:", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!visits) {
    return (
      <View style={styles.container}>
        <Text>No se encontró la visita</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Información de la Visita</Text>

        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.value}>{visits.visit.name}</Text>

        <Text style={styles.label}>Correo:</Text>
        <Text style={styles.value}>{visits.visit.email}</Text>

        <Text style={styles.label}>Cédula:</Text>
        <Text style={styles.value}>{visits.visit.document}</Text>

        <Text style={styles.label}>Imagen de la cédula:</Text>
        {imagenPersona && (
          <Image source={{ uri: imagenPersona }} style={styles.image} />
        )}
        <Button 
          title="Tomar foto" 
          onPress={() => tomarFoto("upload-visit")} 
          disabled={isUploading}
        />

        <Text style={styles.label}>Imagen del vehículo:</Text>
        {imagenVehiculo && (
          <Image source={{ uri: imagenVehiculo }} style={styles.image} />
        )}
        <Button 
          title="Tomar foto" 
          onPress={() => tomarFoto("upload-vehicle")} 
          disabled={isUploading}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.btnGreen}
            onPress={aprobarVisita}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Aprobar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.btnRed}
            onPress={rechazarVisita}
            disabled={isUploading}
          >
            <Text style={styles.btnText}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
    backgroundColor: "#f2f6fc",
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#222",
    textAlign: "center",
  },
  label: {
    fontWeight: "600",
    marginTop: 18,
    fontSize: 18,
    color: "#333",
  },
  value: {
    fontSize: 17,
    marginTop: 4,
    color: "#555",
  },
  image: {
    width: "100%",
    height: 260,
    marginVertical: 15,
    borderRadius: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  btnGreen: {
    flex: 1,
    backgroundColor: "#28a745",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 12,
  },
  btnRed: {
    flex: 1,
    backgroundColor: "#dc3545",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 12,
  },
  btnText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default EntryForm;
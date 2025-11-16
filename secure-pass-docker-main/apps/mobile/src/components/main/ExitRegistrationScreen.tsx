import {
  Camera,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { BarCodeScannerResult } from "expo-barcode-scanner";
import {
  RouteProp,
  useRoute,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import { RootStackParamList } from "../../types/types";
import Navigation from "@/navigation/Navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { RegistryData, VisitResponse } from "@/types/visit.types";
import { getVisitsByQRId, RegisterEntry } from "@/api/visit.api";
import { loadToken, setAuthToken } from "@/services/auth.service";
import { getAuthenticatedUser } from "@/api/auth.api";
import { User } from "@/types/user.types";

type ScannerRouteProp = RouteProp<RootStackParamList, "ExitRegistration">;
type Nav = NavigationProp<RootStackParamList>;
export default function ExitRegistrationScreen() {
  const route = useRoute<ScannerRouteProp>();
  const navigation = useNavigation<Nav>();
  const { qrData } = route.params;

  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [guard, setGuard] = useState<User | null>(null);
  const [visits, setVisits] = useState<VisitResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const SetUpCamera = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    //Obtener visitas
    const getVisits = async () => {
      try {
        if (!qrData) throw new Error("El QR escaneado es invalido");

        setVisits(await getVisitsByQRId(qrData as string));
        setIsLoading(false);
      } catch (error) {
        console.error(`Ocurrio un error al obtener visitas`, error);
      }
    };

    //validacion del usuario
    const initializeAuth = async () => {
      try {
        const token = await loadToken();
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
    getVisits();
    SetUpCamera();
  }, []);

  // Simula la carga desde una API

  //Obtiene los datos de las visitas

  const finalizarVisita = async () => {
    const payload: RegistryData = {
      qrId: visits!.qrId,
      guardId: guard!._id,
    };
    try {
      Alert.alert("Éxito", "La visita fue finalizada");
    } catch (error) {
      Alert.alert("Error", "No se pudo finalizar la visita");
    }
  };

  const handleBarCodeScanned = async ({ data }: BarCodeScannerResult) => {
    if (!scanned) {
      setScanned(true);
      setScannedData(data);

      try {
        const visit = await getVisitsByQRId(data); // valida contra la API
        if (visit.authorization.state != "finalizada") {
          if (visit.qrId === data) {
            finalizarVisita();
            Alert.alert("Éxito", "QR válido, Visita finalizada", [
              {
                text: "OK",
              },
            ]);
          }
        }
      } catch (error) {
        console.error("QR inválido o no encontrado:", error);
        Alert.alert("Error", "El QR no está registrado.", [
          {
            text: "OK",
            onPress: () => {
              setScanned(false); // permite escanear de nuevo
            },
          },
        ]);
      }
    }
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso de cámara...</Text>;
  }

  if (hasPermission === false) {
    return <Text>Sin acceso a la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        facing={cameraType}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        {scannedData && (
          <Button
            title="Escanear otro"
            onPress={() => {
              setScanned(false);
              setScannedData(null);
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
});

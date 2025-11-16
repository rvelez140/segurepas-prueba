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
import { getVisitsByQRId, RegisterExit } from "@/api/visit.api";
import { getAuthenticatedUser } from "@/api/auth.api";

type ScannerRouteProp = RouteProp<RootStackParamList, "Scanner">;
type Nav = NavigationProp<RootStackParamList>;
export default function QRScannerScreen() {
  const route = useRoute<ScannerRouteProp>();
  const navigation = useNavigation<Nav>();
  const { state } = route.params;

  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: BarCodeScannerResult) => {
    if (!scanned) {
      setScanned(true);

      try {
        const visit = await getVisitsByQRId(data); // valida contra la API

        //Comprobar el qrID
        if (visit.qrId === data) {
          //Verificar que uno que ya este aprobado/desaprobado no salga para aprobar o desaprobar nuevamente.
          if (
            (state === "entry" && visit.authorization.state === "aprobada") ||
            (state === "exit" && visit.authorization.state === "pendiente") ||
            visit.authorization.state === "rechazada" ||
            visit.authorization.state === "finalizada"
          ) {
            navigation.navigate("Main");
            Alert.alert("Error", "Estado de visita invalido", [
              {
                text: "OK",
              },
            ]);
          } else {
            if (state === "entry") {
              navigation.navigate("EntryForm", { qrData: data });
              setScanned(false);
            }

            if (state === "exit") {
              navigation.navigate("Main");
              const user = await getAuthenticatedUser();
              const qrRegistryData: RegistryData = {
                qrId: data,
                guardId: user._id,
              };
              await RegisterExit(qrRegistryData);
              Alert.alert("Éxito", "Salida registrada", [
                {
                  text: "OK",
                },
              ]);
            }
          }
        }
      } catch (error) {
        console.error("Ocurrió un error al tratar de escanear el código", error);
        navigation.navigate("Main");
      }
    }

    if (hasPermission === null) {
      return <Text>Solicitando permiso de cámara...</Text>;
    }

    if (hasPermission === false) {
      return <Text>Sin acceso a la cámara</Text>;
    }
  };
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

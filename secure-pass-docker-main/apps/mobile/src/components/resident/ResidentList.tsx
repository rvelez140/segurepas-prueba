import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/types";
import { User } from "../../types/user.types";
import { getResidents } from "@/api/user.api";
import { delToken, loadToken, setAuthToken } from "@/services/auth.service";
import { getAuthenticatedUser } from "@/api/auth.api";

type PersonDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ResidentList"
>;

const ResidentList: React.FC<PersonDetailScreenProps> = ({ route, navigation }) => {
  
  const [user, setUser] = useState(route.params.user);
  const [residents, setResidents] = useState<User[] | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
          try {
            setLoading(true);
            setAuthToken(await loadToken());
            setUser(await getAuthenticatedUser());
          } catch (error: any) {
            console.error("Se produjo un error al verificar sesión", error);
            Alert.alert("Error", error.message);
            navigation.replace("Login");
            delToken();
        };
      }

    const getResidentsFromApi = async () => {
      try {
        setResidents(await getResidents());
        setLoading(false);
      } catch (error) {
        console.error(`Ocurrio un error al obtener residentes`);
      }
    };
    verifySession();
    getResidentsFromApi();
  }, []);

  const handleResidentPress = (resident: User) => {
    navigation.navigate('ResidentDetail', { resident });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lista de Residentes</Text>

      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Nombre</Text>
        <Text style={styles.headerText}>Apartamento</Text>
        <Text style={styles.headerText}>Teléfono</Text>
      </View>

      {residents?.map((resident) => (
        <TouchableOpacity 
          key={resident._id}
          style={styles.residentRow}
          onPress={() => handleResidentPress(resident)}
        >
          <Text style={styles.columnText}>{resident.name}</Text>
          <Text style={styles.columnText}>{resident.apartment}</Text>
          <Text style={styles.columnText}>{resident.tel}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    color: "#333",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  residentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingVertical: 17,
    paddingHorizontal: 17,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  columnText: {
    fontSize: 15,
    color: "#2c3e50",
    flex: 1,
    textAlign: "center",
  },
});

export default ResidentList;
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginComponent from "../components/auth/LoginComponent";
import MainScreen from "../components/main/MainScreen";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { RootStackParamList } from "../types/types";
import QRScannerScreen from "../components/main/QRCodeScanner";
import ExitRegistrationScreen from "../components/main/ExitRegistrationScreen";
import ResidentList from "../components/resident/ResidentList";
import ResidentDetail from "../components/resident/ResidentDetail";
import EntryForm from "@/components/main/EntryForm";

// Resident screens
import ResidentDashboard from "../components/resident/screens/ResidentDashboard";
import AuthorizeVisit from "../components/resident/screens/AuthorizeVisit";
import VisitHistory from "../components/resident/screens/VisitHistory";
import QRDisplay from "../components/resident/screens/QRDisplay";

// Admin screens
import AdminDashboard from "../components/admin/screens/AdminDashboard";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Login Screen */}
        <Stack.Screen
          name="Login"
          options={{ headerShown: false }}
        >
          {(props) => (
            <>
              <StatusBar style="auto" />
              <LoginComponent
                logoImage={require("../assets/guardia.png")}
                {...props}
              />
            </>
          )}
        </Stack.Screen>

        {/* Guard Main Screen (legacy) */}
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{
            title: "SecurePass Control de Acceso",
            headerBackVisible: false
          }}
        />

        {/* Guard Screens */}
        <Stack.Screen
          name="Scanner"
          component={QRScannerScreen}
          options={{ title: "Escanear QR" }}
        />

        <Stack.Screen
          name="EntryForm"
          component={EntryForm}
          options={{ title: "Formulario de registrar acceso" }}
        />

        <Stack.Screen
          name="ResidentDetail"
          component={ResidentDetail}
          options={{ title: "Detalles de Residente" }}
        />

        <Stack.Screen
          name="ResidentList"
          component={ResidentList}
          options={{ title: "Lista de Residentes" }}
        />

        <Stack.Screen
          name="ExitRegistration"
          component={ExitRegistrationScreen}
          options={{ title: "Registrar Salida" }}
        />

        {/* Resident Screens */}
        <Stack.Screen
          name="ResidentDashboard"
          component={ResidentDashboard}
          options={{
            title: "Dashboard Residente",
            headerBackVisible: false
          }}
        />

        <Stack.Screen
          name="AuthorizeVisit"
          component={AuthorizeVisit}
          options={{ title: "Autorizar Visita" }}
        />

        <Stack.Screen
          name="VisitHistory"
          component={VisitHistory}
          options={{ title: "Historial de Visitas" }}
        />

        <Stack.Screen
          name="QRDisplay"
          component={QRDisplay}
          options={{ title: "Código QR" }}
        />

        {/* Admin Screens */}
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{
            title: "Panel de Administración",
            headerBackVisible: false
          }}
        />

        {/* Placeholder screens - to be implemented */}
        <Stack.Screen
          name="Analytics"
          component={() => null}
          options={{ title: "Analytics" }}
        />

        <Stack.Screen
          name="UserManagement"
          component={() => null}
          options={{ title: "Gestión de Usuarios" }}
        />

        <Stack.Screen
          name="Reports"
          component={() => null}
          options={{ title: "Reportes" }}
        />

        <Stack.Screen
          name="ManageSubscription"
          component={() => null}
          options={{ title: "Gestionar Suscripción" }}
        />

        <Stack.Screen
          name="PaymentHistory"
          component={() => null}
          options={{ title: "Historial de Pagos" }}
        />

        <Stack.Screen
          name="CreateUser"
          component={() => null}
          options={{ title: "Crear Usuario" }}
        />

        <Stack.Screen
          name="EditUser"
          component={() => null}
          options={{ title: "Editar Usuario" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import { getAuthenticatedUser, loginUser } from "../../api/auth.api";
import {
  getAuthToken,
  loadToken,
  saveToken,
  setAuthToken,
} from "@/services/auth.service";
interface LoginComponentProps {
  logoImage: any;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ logoImage }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "", // Estado para errores de email
    password: "", // Estado para errrores de contraseña
    credentials: "", // Estado para errores de credenciales
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Use Effect para verificar si hay un usuario autenticado antes de realizar Login
  useEffect(() => {
    const validateLogedOnUser = async () => {
      try {
        setAuthToken(await loadToken());
        await getAuthenticatedUser();

        navigation.replace("Main");
      } catch (error) {
        console.log("Sesión anterior no encontrada o expirada");
      } finally {
        setPageLoading(false);
      }
    };
    validateLogedOnUser();
  }, []);

  const validateFields = () => {
    let valid = true;
    const newErrors = {
      email: "", // Resetear errores de email al validar
      password: "", // Resetear errores de contraseña al validar
      credentials: "", // Resetear error de credenciales al validar
    };

    if (!email.trim()) {
      newErrors.email = "El email es requerido";
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Email no válido";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "La contraseña es requerida";
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateFields()) return;

    setIsLoading(true);
    try {
      // Solo tomo el token de la respuesta y lo valido con el request api/auth/me
      const { token } = await loginUser({ email, password });
      setAuthToken(token);
      await saveToken(token);

      // api/auth/me
      const verifiedUser = await getAuthenticatedUser();

      if (verifiedUser.role == "residente")
        throw new Error("Usuario no puede ser residente");

      navigation.replace("Main");
    } catch (error: any) {
      // Manejo específico de errores de credenciales
      if (error.message.includes("Credenciales inválidas")) {
        setErrors({
          ...errors,
          credentials: "Email o contraseña incorrectos",
        });
      } else if (error.message.includes("Usuario no puede ser residente")) {
        setErrors({
          ...errors,
          credentials: "El usuario no puede ser residente",
        });
      } else {
        Alert.alert("Error", error.message || "Error al iniciar sesión");
        setErrors({
          ...errors,
          credentials: "Ocurrió un error al iniciar sesión",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      ></View>
    );
  } else
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.loginContainer}>
          <Image source={logoImage} style={styles.logo} resizeMode="contain" />

          {/* Campo de Email */}
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: "", credentials: "" });
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}

          {/* Campo de Contraseña */}
          <TextInput
            style={[styles.input, errors.password ? styles.inputError : null]}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: "", credentials: "" });
            }}
            secureTextEntry
          />
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}

          {/* Mensaje de error de credenciales */}
          {errors.credentials ? (
            <Text style={[styles.errorText, styles.credentialsError]}>
              {errors.credentials}
            </Text>
          ) : null}

          {/* Botón de Login */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "CARGANDO..." : "LOGIN"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  loginContainer: {
    paddingHorizontal: 30,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 40,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 5,
    backgroundColor: "#f9f9f9",
  },
  inputError: {
    borderColor: "#ff4444",
  },
  errorText: {
    color: "#ff4444",
    marginBottom: 10,
    fontSize: 12,
  },
  credentialsError: {
    textAlign: "center",
    marginBottom: 15,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default LoginComponent;

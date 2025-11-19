import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = '@biometric_enabled';

// Verificar si el dispositivo tiene hardware biométrico
export async function checkBiometricSupport(): Promise<{
  compatible: boolean;
  biometricType: string;
}> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();

  if (!compatible || !enrolled) {
    return { compatible: false, biometricType: 'none' };
  }

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const biometricType = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
    ? 'Face ID'
    : types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
    ? 'Touch ID'
    : types.includes(LocalAuthentication.AuthenticationType.IRIS)
    ? 'Iris'
    : 'Biometric';

  return { compatible: true, biometricType };
}

// Autenticar con biométrico
export async function authenticateWithBiometric(
  promptMessage: string = 'Autenticar para continuar'
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancelar',
      fallbackLabel: 'Usar contraseña',
      disableDeviceFallback: false,
    });

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error || 'Autenticación fallida'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error en autenticación biométrica'
    };
  }
}

// Verificar si biométrico está habilitado
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch {
    return false;
  }
}

// Habilitar/deshabilitar autenticación biométrica
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
}

// Autenticar si está habilitado
export async function authenticateIfEnabled(
  promptMessage?: string
): Promise<boolean> {
  const enabled = await isBiometricEnabled();

  if (!enabled) {
    return true; // Si no está habilitado, permitir acceso
  }

  const { compatible } = await checkBiometricSupport();

  if (!compatible) {
    return true; // Si no hay soporte, permitir acceso
  }

  const result = await authenticateWithBiometric(promptMessage);
  return result.success;
}

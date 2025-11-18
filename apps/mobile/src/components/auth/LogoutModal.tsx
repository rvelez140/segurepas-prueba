import React from "react";
import { 
  Modal, 
  Pressable, 
  StyleSheet, 
  Text, 
  View, 
  Dimensions,
  TouchableWithoutFeedback
} from "react-native";

const { width, height } = Dimensions.get("window");

export const LogoutConfirmationModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ visible, onCancel, onConfirm }) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Cerrar sesión</Text>
              <Text style={styles.modalText}>
                ¿Estás seguro de que quieres salir de la aplicación?
              </Text>

              <View style={styles.buttonsContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    styles.cancelButton,
                    pressed && styles.buttonPressed
                  ]}
                  onPress={onCancel}
                  accessibilityLabel="Cancelar cierre de sesión"
                  accessibilityHint="Mantén presionado para cancelar la acción"
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    styles.confirmButton,
                    pressed && styles.buttonPressed
                  ]}
                  onPress={onConfirm}
                  accessibilityLabel="Confirmar cierre de sesión"
                  accessibilityHint="Mantén presionado para cerrar sesión"
                >
                  <Text style={styles.buttonText}>Cerrar Sesión</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Diseño optimizado para móviles
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    color: "#666",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#79817C",
  },
  confirmButton: {
    backgroundColor: "#FA392B",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff"
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default LogoutConfirmationModal;
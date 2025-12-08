import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, themePreference, toggleTheme, setThemePreference, colors } = useTheme();
  const [showModal, setShowModal] = useState(false);

  const preferences = [
    {
      key: "manual" as const,
      label: "Manual",
      description: "Elige el tema manualmente",
      icon: "👆",
    },
    {
      key: "auto" as const,
      label: "Automático",
      description: "Cambia según la hora (6AM-6PM)",
      icon: "🕐",
    },
    {
      key: "system" as const,
      label: "Sistema",
      description: "Sigue la preferencia del sistema",
      icon: "📱",
    },
  ];

  const handlePreferenceChange = (preference: "manual" | "auto" | "system") => {
    setThemePreference(preference);
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.toggleButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Text style={[styles.toggleIcon, { color: colors.text }]}>
          {theme === "dark" ? "☀️" : "🌙"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={[styles.settingsButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Text style={[styles.settingsIcon, { color: colors.text }]}>⚙️</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>Modo de tema</Text>

            {preferences.map((pref) => (
              <TouchableOpacity
                key={pref.key}
                onPress={() => handlePreferenceChange(pref.key)}
                style={[
                  styles.preferenceItem,
                  themePreference === pref.key && {
                    backgroundColor: colors.primary + "20",
                    borderColor: colors.primary,
                  },
                  { borderColor: colors.border },
                ]}
              >
                <Text style={styles.preferenceIcon}>{pref.icon}</Text>
                <View style={styles.preferenceTextContainer}>
                  <Text
                    style={[
                      styles.preferenceLabel,
                      {
                        color: themePreference === pref.key ? colors.primary : colors.text,
                      },
                    ]}
                  >
                    {pref.label}
                  </Text>
                  <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                    {pref.description}
                  </Text>
                </View>
                {themePreference === pref.key && <Text style={{ color: colors.primary }}>✓</Text>}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleIcon: {
    fontSize: 20,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsIcon: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    gap: 12,
  },
  preferenceIcon: {
    fontSize: 24,
  },
  preferenceTextContainer: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 12,
  },
  closeButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ThemeToggle;

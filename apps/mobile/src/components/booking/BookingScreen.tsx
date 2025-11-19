import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/types";
import { getCommonSpaces, CommonSpace } from "../../api/booking.api";
import { useTheme } from "../../contexts/ThemeContext";

type BookingScreenProps = NativeStackScreenProps<RootStackParamList, "BookingList">;

const BookingScreen: React.FC<BookingScreenProps> = ({ navigation }) => {
  const [spaces, setSpaces] = useState<CommonSpace[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      const data = await getCommonSpaces();
      setSpaces(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudieron cargar los espacios");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSpaces();
    setRefreshing(false);
  };

  const handleSpacePress = (space: CommonSpace) => {
    navigation.navigate("BookingDetail", { space });
  };

  const renderSpace = ({ item }: { item: CommonSpace }) => (
    <TouchableOpacity
      style={[styles.spaceCard, { backgroundColor: theme.colors.card }]}
      onPress={() => handleSpacePress(item)}
      activeOpacity={0.7}
    >
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.spaceImage} />
      )}

      <View style={styles.spaceInfo}>
        <Text style={[styles.spaceName, { color: theme.colors.text }]}>
          {item.name}
        </Text>

        <Text style={[styles.spaceDescription, { color: theme.colors.textSecondary }]}>
          {item.description}
        </Text>

        <View style={styles.spaceDetails}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Capacidad:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {item.capacity} personas
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Precio:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.success }]}>
              ${item.pricePerHour}/hora
            </Text>
          </View>
        </View>

        {item.amenities.length > 0 && (
          <View style={styles.amenities}>
            {item.amenities.slice(0, 3).map((amenity, index) => (
              <View key={index} style={[styles.amenityBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.amenityText, { color: theme.colors.primary }]}>
                  {amenity}
                </Text>
              </View>
            ))}
            {item.amenities.length > 3 && (
              <Text style={[styles.moreAmenities, { color: theme.colors.textSecondary }]}>
                +{item.amenities.length - 3} más
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleSpacePress(item)}
        >
          <Text style={styles.bookButtonText}>Reservar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={spaces}
        renderItem={renderSpace}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {loading ? "Cargando espacios..." : "No hay espacios disponibles"}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.myBookingsButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("MyBookings")}
      >
        <Text style={styles.myBookingsText}>Mis Reservas</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  spaceCard: {
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  spaceImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  spaceInfo: {
    padding: 15,
  },
  spaceName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  spaceDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  spaceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  amenities: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  amenityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  moreAmenities: {
    fontSize: 12,
    alignSelf: "center",
    marginLeft: 5,
  },
  bookButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
  },
  myBookingsButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  myBookingsText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default BookingScreen;

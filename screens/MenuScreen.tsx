import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Sample data for menu items
const menuItems = [
  {
    id: "1",
    name: "Crab Soup",
    price: "450.000₫",
    description: "Fresh Crab Meat",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80",
    available: true,
  },
  {
    id: "2",
    name: "Fried Chicken",
    price: "120.000₫",
    description: "Crispy fried chicken with special sauce",
    image:
      "https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1173&q=80",
    available: true,
  },
  {
    id: "3",
    name: "Chicken Pho",
    price: "56.000₫",
    description: "Traditional Vietnamese noodle soup",
    image:
      "https://images.unsplash.com/photo-1576577445504-6af96477db52?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80",
    available: true,
  },
  {
    id: "4",
    name: "Beef Steak",
    price: "350.000₫",
    description: "Premium beef with vegetables",
    image:
      "https://images.unsplash.com/photo-1546964124-0cce460f38ef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80",
    available: false,
  },
];

const MenuScreen = () => {
  const navigation = useNavigation();

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItem}>
      <Image source={{ uri: item.image }} style={styles.menuItemImage} />

      <View style={styles.menuItemContent}>
        <View style={styles.menuItemHeader}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          <Text style={styles.menuItemPrice}>{item.price}</Text>
        </View>

        <Text style={styles.menuItemDescription}>{item.description}</Text>

        <View style={styles.menuItemFooter}>
          <View
            style={[
              styles.availabilityBadge,
              item.available ? styles.availableBadge : styles.unavailableBadge,
            ]}
          >
            <Text
              style={[
                styles.availabilityText,
                item.available ? styles.availableText : styles.unavailableText,
              ]}
            >
              {item.available ? "Available" : "Out of Stock"}
            </Text>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
          <Text style={styles.headerTitle}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FF6B00" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.menuList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 5,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  menuList: {
    padding: 20,
  },
  menuItem: {
    flexDirection: "row",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    overflow: "hidden",
  },
  menuItemImage: {
    width: 100,
    height: 100,
  },
  menuItemContent: {
    flex: 1,
    padding: 10,
  },
  menuItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B00",
  },
  menuItemDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
  menuItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  availableBadge: {
    backgroundColor: "#E8F5E9",
  },
  unavailableBadge: {
    backgroundColor: "#FFEBEE",
  },
  availabilityText: {
    fontSize: 12,
  },
  availableText: {
    color: "#4CAF50",
  },
  unavailableText: {
    color: "#F44336",
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FF6B00",
  },
  editButtonText: {
    fontSize: 12,
    color: "#FF6B00",
  },
});

export default MenuScreen;

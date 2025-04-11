import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const HelpCenterScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
          <Text style={styles.headerTitle}>Help Center</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help"
            />
          </View>
        </View>

        <View style={styles.supportCard}>
          <View style={styles.supportIconContainer}>
            <Ionicons name="headset" size={24} color="#FF6B00" />
          </View>
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>Contact Support</Text>
            <Text style={styles.supportDescription}>
              Our support team is available 24/7 to help you with any issues.
            </Text>
          </View>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Contact</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I cancel an order?</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I edit my menu items?</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.faqQuestion}>
            How do I change my restaurant information?
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I withdraw my earnings?</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I contact a driver?</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Help Categories</Text>

        <View style={styles.categoriesGrid}>
          <TouchableOpacity style={styles.categoryItem}>
            <View style={styles.categoryIconContainer}>
              <Ionicons name="restaurant-outline" size={24} color="#FF6B00" />
            </View>
            <Text style={styles.categoryText}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryItem}>
            <View style={styles.categoryIconContainer}>
              <Ionicons name="wallet-outline" size={24} color="#FF6B00" />
            </View>
            <Text style={styles.categoryText}>Payments</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryItem}>
            <View style={styles.categoryIconContainer}>
              <Ionicons name="bicycle-outline" size={24} color="#FF6B00" />
            </View>
            <Text style={styles.categoryText}>Delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryItem}>
            <View style={styles.categoryIconContainer}>
              <Ionicons name="settings-outline" size={24} color="#FF6B00" />
            </View>
            <Text style={styles.categoryText}>Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    padding: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
  },
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8F3",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFE0CC",
  },
  supportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  supportDescription: {
    fontSize: 12,
    color: "#666",
  },
  supportButton: {
    backgroundColor: "#FF6B00",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  supportButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  faqItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  faqQuestion: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categoryItem: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF8F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
});

export default HelpCenterScreen;

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

// Sample data for employees
const employees = [
  {
    id: "1",
    name: "John Smith",
    role: "Manager",
    phone: "0956 367 489",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    role: "Chef",
    phone: "0956 367 123",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "active",
  },
  {
    id: "3",
    name: "Michael Brown",
    role: "Waiter",
    phone: "0956 367 456",
    avatar: "https://randomuser.me/api/portraits/men/6.jpg",
    status: "inactive",
  },
  {
    id: "4",
    name: "Emily Davis",
    role: "Cashier",
    phone: "0956 367 789",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    status: "active",
  },
];

const EmployeeScreen = () => {
  const navigation = useNavigation();

  const renderEmployeeItem = ({ item }) => (
    <View style={styles.employeeItem}>
      <Image source={{ uri: item.avatar }} style={styles.employeeAvatar} />

      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.name}</Text>
        <Text style={styles.employeeRole}>{item.role}</Text>
        <Text style={styles.employeePhone}>{item.phone}</Text>
      </View>

      <View style={styles.employeeActions}>
        <View
          style={[
            styles.statusBadge,
            item.status === "active"
              ? styles.activeBadge
              : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === "active"
                ? styles.activeText
                : styles.inactiveText,
            ]}
          >
            {item.status === "active" ? "Active" : "Inactive"}
          </Text>
        </View>

        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call-outline" size={20} color="#FF6B00" />
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Employee</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FF6B00" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={employees}
        renderItem={renderEmployeeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.employeeList}
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
  employeeList: {
    padding: 20,
  },
  employeeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
  },
  employeeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  employeeRole: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  employeePhone: {
    fontSize: 12,
    color: "#999",
  },
  employeeActions: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 10,
  },
  activeBadge: {
    backgroundColor: "#E8F5E9",
  },
  inactiveBadge: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
  },
  activeText: {
    color: "#4CAF50",
  },
  inactiveText: {
    color: "#F44336",
  },
  callButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8F3",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFE0CC",
  },
});

export default EmployeeScreen;

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initialTransactions, Transaction } from "../data/orders";

const PaymentScreen = () => {
  const navigation = useNavigation<any>();
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load transactions and user preference from AsyncStorage when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load show all preference
        const storedPreference = await AsyncStorage.getItem(
          "showAllTransactions"
        );
        if (storedPreference !== null) {
          setShowAllTransactions(JSON.parse(storedPreference));
        }

        // Load transactions
        const storedTransactions = await AsyncStorage.getItem("transactions");
        if (storedTransactions !== null) {
          setTransactions(JSON.parse(storedTransactions));
        } else {
          // Use initial data if no stored transactions
          setTransactions(initialTransactions);
          await AsyncStorage.setItem(
            "transactions",
            JSON.stringify(initialTransactions)
          );
        }
      } catch (error) {
        console.error("Error loading data:", error);
        // Fallback to initial data
        setTransactions(initialTransactions);
      }
    };

    loadData();
  }, []);

  // Save preference to AsyncStorage whenever it changes
  useEffect(() => {
    const saveShowAllPreference = async () => {
      try {
        await AsyncStorage.setItem(
          "showAllTransactions",
          JSON.stringify(showAllTransactions)
        );
      } catch (error) {
        console.error("Error saving transaction preference:", error);
      }
    };

    saveShowAllPreference();
  }, [showAllTransactions]);

  // Save transactions whenever they change
  useEffect(() => {
    const saveTransactions = async () => {
      try {
        await AsyncStorage.setItem(
          "transactions",
          JSON.stringify(transactions)
        );
      } catch (error) {
        console.error("Error saving transactions:", error);
      }
    };

    if (transactions.length > 0) {
      saveTransactions();
    }
  }, [transactions]);

  // Show only first 3 transactions initially
  const displayedTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 3);

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionDate}>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>

      <View style={styles.transactionDetails}>
        <View
          style={[
            styles.transactionIcon,
            item.type === "Transfer to Bank"
              ? styles.transferIcon
              : styles.salesIcon,
          ]}
        >
          {item.type === "Transfer to Bank" ? (
            <Ionicons name="card-outline" size={24} color="#666666" />
          ) : (
            <Ionicons name="wallet-outline" size={24} color="#FF6B00" />
          )}
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.transactionType}>{item.type}</Text>
          <Text style={styles.transactionTime}>{item.time}</Text>
          {item.orderId && (
            <Text style={styles.orderId}>Order {item.orderId}</Text>
          )}
        </View>

        <Text
          style={[
            styles.transactionAmount,
            item.type === "Transfer to Bank"
              ? styles.negativeAmount
              : styles.positiveAmount,
          ]}
        >
          {item.amount}
        </Text>
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
          <Text style={styles.headerTitle}>PAYMENT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <View>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>1.875.000₫</Text>
        </View>

        <TouchableOpacity style={styles.withdrawButton}>
          <Text style={styles.withdrawButtonText}>Withdraw Money</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.transactionsList}
      />

      <View style={styles.viewAllContainer}>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => setShowAllTransactions(!showAllTransactions)}
        >
          <Text style={styles.viewAllButtonText}>
            {showAllTransactions ? "Show Less" : "View All"}
          </Text>
        </TouchableOpacity>
      </View>
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
  balanceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
  },
  balanceLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B00",
  },
  withdrawButton: {
    borderWidth: 1,
    borderColor: "#FF6B00",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  withdrawButtonText: {
    fontSize: 12,
    color: "#FF6B00",
  },
  transactionsList: {
    paddingHorizontal: 20,
  },
  transactionItem: {
    marginBottom: 20,
  },
  transactionDate: {
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  transactionDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  transferIcon: {
    backgroundColor: "#F5F5F5",
  },
  salesIcon: {
    backgroundColor: "#FFF8F3",
    borderWidth: 1,
    borderColor: "#FFE0CC",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: "#999",
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  positiveAmount: {
    color: "#4CAF50",
  },
  negativeAmount: {
    color: "#F44336",
  },
  orderId: {
    fontSize: 12,
    color: "#666",
  },
  viewAllContainer: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  viewAllButton: {
    paddingVertical: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    color: "#FF6B00",
    fontWeight: "500",
  },
});

export default PaymentScreen;

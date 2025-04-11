import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";

const RatingButton = ({
  rating,
  selected,
  onPress,
}: {
  rating: number;
  selected: boolean;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      style={[styles.ratingButton, selected && styles.selectedRating]}
      onPress={onPress}
    >
      <Ionicons
        name="star"
        size={16}
        color={rating <= 2 ? "#FF6B00" : "#FFB300"}
        style={styles.starIcon}
      />
      <Text
        style={[
          styles.ratingText,
          selected && styles.selectedRatingText,
          Platform.OS === "web" && styles.webRatingText,
        ]}
      >
        {rating}
      </Text>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [currentPage, setCurrentPage] = useState(0);

  const navigateToOrders = () => {
    navigation.navigate("Manage", {
      screen: "OrdersMain",
      params: { activeTab: "now" },
    });
  };

  const navigateToHistory = () => {
    navigation.navigate("Manage", {
      screen: "OrdersMain",
      params: { activeTab: "history" },
    });
  };

  const navigateToFeedback = () => {
    // Đảm bảo điều hướng đến màn hình Feedback
    navigation.navigate("Feedback");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.locationText}>
              <Ionicons name="location-outline" size={16} color="#666" /> River
              Oaks
            </Text>
            <Text style={styles.welcomeText}>Hello Loris's Restaurant!</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() =>
              Alert.alert("Notifications", "You have 3 new notifications")
            }
          >
            <Ionicons name="notifications-outline" size={24} color="#333" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceText}>1.875.000 ₫</Text>
          </View>
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() => navigation.navigate("Payment")}
          >
            <Text style={styles.viewMoreButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Today's highlights</Text>

        <View style={styles.statsContainer}>
          {currentPage === 0 && (
            <View style={styles.statsCard}>
              <View style={[styles.iconBox, styles.salesIconBox]}>
                <MaterialCommunityIcons name="cash" size={24} color="#FF6B00" />
              </View>
              <View style={styles.valueContainer}>
                <Text style={styles.statValue}>500.000</Text>
                <Text style={styles.currencyUnit}>₫</Text>
              </View>
              <Text style={styles.statLabel}>Total Sales Today</Text>
              <View style={[styles.trendBox, styles.positiveTrend]}>
                <Ionicons name="arrow-up" size={12} color="#4CAF50" />
                <Text style={[styles.trendText, styles.positiveTrendText]}>
                  12%
                </Text>
              </View>
            </View>
          )}

          {currentPage === 1 && (
            <View style={styles.statsCard}>
              <View style={[styles.iconBox, styles.ordersIconBox]}>
                <MaterialCommunityIcons name="food" size={24} color="#2196F3" />
              </View>
              <View style={styles.valueContainer}>
                <Text style={styles.statValue}>45</Text>
                <Text style={styles.unitText}>orders</Text>
              </View>
              <Text style={styles.statLabel}>Total Orders Today</Text>
              <View style={[styles.trendBox, styles.positiveTrend]}>
                <Ionicons name="arrow-up" size={12} color="#4CAF50" />
                <Text style={[styles.trendText, styles.positiveTrendText]}>
                  8%
                </Text>
              </View>
            </View>
          )}

          {currentPage === 2 && (
            <View style={styles.statsCard}>
              <View style={[styles.iconBox, styles.qualityIconBox]}>
                <MaterialCommunityIcons
                  name="emoticon"
                  size={24}
                  color="#FFB300"
                />
              </View>
              <View style={styles.valueContainer}>
                <Text style={styles.statValue}>85</Text>
                <Text style={styles.unitText}>/100</Text>
              </View>
              <Text style={styles.statLabel}>Quality Score</Text>
              <View style={[styles.trendBox, styles.negativeTrend]}>
                <Ionicons name="arrow-down" size={12} color="#F44336" />
                <Text style={[styles.trendText, styles.negativeTrendText]}>
                  3%
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() =>
              setCurrentPage((prev) => (prev === 2 ? 0 : prev + 1))
            }
          >
            <Ionicons name="chevron-forward" size={24} color="#FF6B00" />
          </TouchableOpacity>
        </View>

        <View style={styles.pageIndicator}>
          <View style={[styles.dot, currentPage === 0 && styles.activeDot]} />
          <View style={[styles.dot, currentPage === 1 && styles.activeDot]} />
          <View style={[styles.dot, currentPage === 2 && styles.activeDot]} />
        </View>

        <View style={styles.menuGrid}>
          <TouchableOpacity style={styles.menuItem} onPress={navigateToOrders}>
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="food" size={24} color="#FF6B00" />
            </View>
            <Text style={styles.menuText}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Menu")}
          >
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons
                name="clipboard-list-outline"
                size={24}
                color="#FF6B00"
              />
            </View>
            <Text style={styles.menuText}>Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Employee")}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="people-outline" size={24} color="#FF6B00" />
            </View>
            <Text style={styles.menuText}>Employee</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={navigateToFeedback}
          >
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons
                name="message-text-outline"
                size={24}
                color="#FF6B00"
              />
            </View>
            <Text style={styles.menuText}>Feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Insights")}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="pie-chart-outline" size={24} color="#FF6B00" />
            </View>
            <Text style={styles.menuText}>Insights</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("HelpCenter")}
          >
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons
                name="headphones"
                size={24}
                color="#FF6B00"
              />
            </View>
            <Text style={styles.menuText}>Help Center</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentOrdersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={navigateToHistory}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recentOrdersScroll}
          >
            {[1, 2, 3, 4].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.recentOrderCard}
                onPress={navigateToHistory}
              >
                <View style={styles.recentOrderHeader}>
                  <View style={styles.orderBadge}>
                    <Text style={styles.orderBadgeText}>F</Text>
                  </View>
                  <Text style={styles.recentOrderId}>F-{420 + item}</Text>
                  <Text style={styles.recentOrderTime}>10:3{item} AM</Text>
                </View>
                <Text style={styles.recentOrderCustomer}>Customer {item}</Text>
                <Text style={styles.recentOrderItems}>
                  2 items • {item}5.000 ₫
                </Text>
                <View style={styles.recentOrderStatus}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>In Progress</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.promotionCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80",
            }}
            style={styles.promotionImage}
            resizeMode="cover"
          />
          <View style={styles.promotionOverlay}>
            <Text style={styles.promotionTitle}>UPGRADE YOUR MENU PHOTOS</Text>
            <Text style={styles.promotionDescription}>
              Professional food photography to make your dishes irresistible
            </Text>
            <TouchableOpacity
              style={styles.promotionButton}
              onPress={() => navigation.navigate("Menu")}
            >
              <Text style={styles.promotionButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 20,
    paddingBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF6B00",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  balanceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF8F3",
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#FFE0CC",
  },
  balanceLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B00",
  },
  viewMoreButton: {
    backgroundColor: "#FF6B00",
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  viewMoreButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
    position: "relative",
    minHeight: 120,
  },
  statsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    maxWidth: Dimensions.get("window").width * 0.65,
  },
  ordersIconBox: {
    backgroundColor: "#E3F2FD",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  salesIconBox: {
    backgroundColor: "#FFF8F3",
  },
  qualityIconBox: {
    backgroundColor: "#FFF8E1",
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  currencyUnit: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginLeft: 2,
  },
  unitText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 8,
  },
  trendBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  positiveTrend: {
    backgroundColor: "#E8F5E9",
  },
  negativeTrend: {
    backgroundColor: "#FFEBEE",
  },
  trendText: {
    fontSize: 12,
    marginLeft: 2,
  },
  positiveTrendText: {
    color: "#4CAF50",
  },
  negativeTrendText: {
    color: "#F44336",
  },
  arrowButton: {
    position: "absolute",
    right: 8,
    top: "50%",
    marginTop: -16,
    width: 32,
    height: 32,
    backgroundColor: "white",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  pageIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EEEEEE",
  },
  activeDot: {
    backgroundColor: "#FF6B00",
    width: 18,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginTop: 20,
  },
  menuItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: 20,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#FFF8F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FFE0CC",
  },
  menuText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  recentOrdersSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  viewAllText: {
    fontSize: 14,
    color: "#FF6B00",
  },
  recentOrdersScroll: {
    marginLeft: -5,
  },
  recentOrderCard: {
    width: 200,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  recentOrderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  orderBadge: {
    backgroundColor: "#FF6B00",
    borderRadius: 4,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  orderBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  recentOrderId: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  recentOrderTime: {
    fontSize: 12,
    color: "#999",
  },
  recentOrderCustomer: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  recentOrderItems: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
  recentOrderStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    color: "#4CAF50",
  },
  promotionCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    overflow: "hidden",
    height: 180,
    marginBottom: 80,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  promotionImage: {
    width: "100%",
    height: "100%",
  },
  promotionOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 16,
    paddingBottom: 20,
  },
  promotionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "white",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  promotionDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 16,
    lineHeight: 18,
  },
  promotionButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  promotionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  ratingButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#F5F5F5",
  },
  selectedRating: {
    backgroundColor: "#FFE0CC",
  },
  starIcon: {
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
  },
  selectedRatingText: {
    color: "#FF6B00",
  },
  webRatingText: {
    marginLeft: 4,
  },
});

export default HomeScreen;

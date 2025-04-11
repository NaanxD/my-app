"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Feedback {
  id: string;
  customer: string;
  customerImage: string;
  rating: number;
  comment: string;
  date: string;
  replied: boolean;
  replyText: string;
  foodImage?: string;
  dishName?: string;
  orderId: string;
}

// Sample feedback data with food images
const initialFeedbacks: Feedback[] = [
  {
    id: "1",
    customer: "John",
    customerImage: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4,
    comment:
      "The food was delicious, but delivery took a bit longer than expected.",
    date: "2d",
    replied: false,
    replyText: "",
    foodImage:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1940&q=80",
    dishName: "Seafood Pasta",
    orderId: "#F-126",
  },
  {
    id: "2",
    customer: "Sarah",
    customerImage: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    comment: "Amazing food and quick delivery! Will order again.",
    date: "1w",
    replied: true,
    replyText:
      "Thank you for your kind feedback! We're glad you enjoyed your meal.",
    foodImage:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    dishName: "Margherita Pizza",
    orderId: "#F-127",
  },
  {
    id: "3",
    customer: "Mike",
    customerImage: "https://randomuser.me/api/portraits/men/22.jpg",
    rating: 3,
    comment: "Food was good but some items were missing from my order.",
    date: "1w",
    replied: false,
    replyText: "",
    foodImage:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80",
    dishName: "Burger Combo",
    orderId: "#F-128",
  },
  {
    id: "4",
    customer: "Emily",
    customerImage: "https://randomuser.me/api/portraits/women/28.jpg",
    rating: 5,
    comment: "The pho soup was absolutely delicious! Perfect for a rainy day.",
    date: "3d",
    replied: false,
    replyText: "",
    foodImage:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80",
    dishName: "Vietnamese Pho",
    orderId: "#F-129",
  },
  {
    id: "5",
    customer: "Dave",
    customerImage: "https://randomuser.me/api/portraits/men/42.jpg",
    rating: 2,
    comment: "The food was cold when it arrived. Very disappointed.",
    date: "5d",
    replied: true,
    replyText:
      "We're very sorry about your experience. We'd like to offer you a discount on your next order. Please contact our customer service.",
    foodImage:
      "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    dishName: "Chicken Curry",
    orderId: "#F-130",
  },
  {
    id: "6",
    customer: "Jess",
    customerImage: "https://randomuser.me/api/portraits/women/52.jpg",
    rating: 4,
    comment: "Sushi was fresh and delicious. Packaging was excellent too!",
    date: "1w",
    replied: false,
    replyText: "",
    foodImage:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    dishName: "Sushi Platter",
    orderId: "#F-131",
  },
  {
    id: "7",
    customer: "Tom",
    customerImage: "https://randomuser.me/api/portraits/men/55.jpg",
    rating: 1,
    comment:
      "Terrible experience! The order was completely wrong and customer service was unhelpful.",
    date: "1d",
    replied: false,
    replyText: "",
    orderId: "#F-132",
  },
  {
    id: "8",
    customer: "Linda",
    customerImage: "https://randomuser.me/api/portraits/women/67.jpg",
    rating: 5,
    comment:
      "The milk tea was perfect! Just the right amount of sweetness and the boba was fresh. Fast delivery too!",
    date: "4d",
    replied: true,
    replyText:
      "Thank you Linda! We're happy you enjoyed your bubble tea. Looking forward to serving you again!",
    orderId: "#F-133",
  },
  {
    id: "9",
    customer: "Rob",
    customerImage: "https://randomuser.me/api/portraits/men/78.jpg",
    rating: 4,
    comment:
      "Great taste and presentation! The steak was cooked perfectly to medium-rare as requested. Only giving 4 stars because it was a bit pricey.",
    date: "2d",
    replied: false,
    replyText: "",
    foodImage:
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    dishName: "Premium Ribeye Steak",
    orderId: "#F-134",
  },
  {
    id: "10",
    customer: "Maria",
    customerImage: "https://randomuser.me/api/portraits/women/90.jpg",
    rating: 3,
    comment:
      "Average experience. Nothing special but nothing terrible either. Delivery was on time though.",
    date: "6d",
    replied: true,
    replyText:
      "Thanks for your feedback Maria. We're constantly working to improve our service and menu. Hope you'll give us another chance!",
    orderId: "#F-135",
  },
];

const FeedbackScreen = () => {
  const navigation = useNavigation();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFeedbacks, setFilteredFeedbacks] =
    useState<Feedback[]>(initialFeedbacks);

  useEffect(() => {
    const filtered = feedbacks.filter((item) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "replied" && item.replied) ||
        (filter === "not_replied" && !item.replied);

      const matchesRating = ratingFilter === 0 || item.rating === ratingFilter;

      const searchLower = searchQuery.toLowerCase().trim();
      const itemOrderId = item.orderId.toLowerCase();
      const searchTerms = searchLower.split(/[\s-]+/); // Split by spaces and hyphens

      const matchesSearch =
        searchLower === "" ||
        item.customer.toLowerCase().includes(searchLower) ||
        searchTerms.every((term) => itemOrderId.includes(term)) || // Match all parts of the search
        itemOrderId.includes(searchLower); // Also try exact match

      return matchesFilter && matchesRating && matchesSearch;
    });
    setFilteredFeedbacks(filtered);
  }, [feedbacks, filter, ratingFilter, searchQuery]);

  // Load saved feedbacks and replies when component mounts
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load saved feedbacks first
        const savedFeedbacks = await AsyncStorage.getItem("feedbacks");

        if (savedFeedbacks) {
          // Parse the saved feedbacks
          const parsedFeedbacks = JSON.parse(savedFeedbacks);

          // Update the format of the dates and names if needed
          const updatedFeedbacks = parsedFeedbacks.map((feedback: Feedback) => {
            // Update date format if it contains "ago"
            if (feedback.date.includes("ago")) {
              // Convert "X days ago" to "Xd" and "X week(s) ago" to "Xw"
              let newDate = feedback.date;
              newDate = newDate.replace(/(\d+)\s*days?\s*ago/, "$1d");
              newDate = newDate.replace(/(\d+)\s*weeks?\s*ago/, "$1w");
              feedback.date = newDate;
            }

            // Update customer names if needed
            if (feedback.customer === "Michael") feedback.customer = "Mike";
            if (feedback.customer === "David") feedback.customer = "Dave";
            if (feedback.customer === "Jessica") feedback.customer = "Jess";
            if (feedback.customer === "Robert") feedback.customer = "Rob";

            return feedback;
          });

          setFeedbacks(updatedFeedbacks);

          // Save the updated feedbacks back to AsyncStorage
          await AsyncStorage.setItem(
            "feedbacks",
            JSON.stringify(updatedFeedbacks)
          );
        } else {
          // Only use initialFeedbacks if no saved data exists
          setFeedbacks(initialFeedbacks);
          await AsyncStorage.setItem(
            "feedbacks",
            JSON.stringify(initialFeedbacks)
          );
        }

        // Load active reply if any
        const activeReplyId = await AsyncStorage.getItem("activeReplyId");
        if (activeReplyId) {
          setReplyingTo(activeReplyId);
          const savedReplyText = await AsyncStorage.getItem(
            `replyText_${activeReplyId}`
          );
          if (savedReplyText) {
            setReplyText(savedReplyText);
          }
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    };

    loadSavedData();
  }, []);

  // Save feedbacks whenever they change
  useEffect(() => {
    const saveFeedbacks = async () => {
      try {
        await AsyncStorage.setItem("feedbacks", JSON.stringify(feedbacks));
      } catch (error) {
        console.error("Error saving feedbacks:", error);
      }
    };

    saveFeedbacks();
  }, [feedbacks]);

  const handleReply = (id: string) => {
    const feedback = feedbacks.find((item) => item.id === id);
    if (!feedback) return;

    if (replyingTo === id) {
      if (replyText.trim()) {
        const updatedFeedbacks = feedbacks.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              replied: true,
              replyText: replyText,
            };
          }
          return item;
        });

        setFeedbacks(updatedFeedbacks);
        setReplyingTo(null);
        setReplyText("");

        AsyncStorage.removeItem(`replyText_${id}`);
        AsyncStorage.removeItem("activeReplyId");
      }
    } else {
      setReplyingTo(id);
      setReplyText(feedback.replied ? feedback.replyText : "");

      AsyncStorage.setItem("activeReplyId", id);
      if (feedback.replied) {
        AsyncStorage.setItem(`replyText_${id}`, feedback.replyText);
      }
    }
  };

  const handleReplyTextChange = (text: string) => {
    setReplyText(text);
    if (replyingTo) {
      AsyncStorage.setItem(`replyText_${replyingTo}`, text);
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
    AsyncStorage.removeItem("activeReplyId");
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const renderFeedbackItem = ({ item }: { item: Feedback }) => (
    <View style={styles.feedbackItem}>
      <View style={styles.feedbackHeader}>
        <View style={styles.customerInfo}>
          {item.customerImage ? (
            <Image
              source={{ uri: item.customerImage }}
              style={styles.customerImage}
            />
          ) : (
            <View style={styles.customerImagePlaceholder}>
              <Text style={styles.customerInitial}>
                {item.customer.charAt(0)}
              </Text>
            </View>
          )}
          <View style={styles.customerDetails}>
            <Text style={styles.customerName} numberOfLines={1}>
              {item.customer}
            </Text>
            <Text style={styles.feedbackDate}>{item.date}</Text>
          </View>
        </View>
        <View style={styles.rightHeader}>
          <Text style={styles.orderIdValue}>{item.orderId}</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= item.rating ? "star" : "star-outline"}
                size={16}
                color="#FFD700"
                style={styles.starIcon}
              />
            ))}
          </View>
        </View>
      </View>

      {item.foodImage && (
        <View style={styles.foodImageContainer}>
          <Text style={styles.dishName}>{item.dishName}</Text>
          <Image source={{ uri: item.foodImage }} style={styles.foodImage} />
        </View>
      )}

      <Text style={styles.feedbackComment}>{item.comment}</Text>

      {item.replied && (
        <View style={styles.replyContainer}>
          <View style={styles.replyHeader}>
            <Ionicons name="return-down-forward" size={16} color="#666" />
            <Text style={styles.replyLabel}>Your Reply</Text>
          </View>
          <Text style={styles.replyText}>{item.replyText}</Text>
        </View>
      )}

      {replyingTo === item.id ? (
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write your reply..."
            value={replyText}
            onChangeText={handleReplyTextChange}
            multiline
          />
          <View style={styles.replyActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelReply}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                !replyText.trim() && styles.submitButtonDisabled,
              ]}
              onPress={() => handleReply(item.id)}
              disabled={!replyText.trim()}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => handleReply(item.id)}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#FF6B00" />
          <Text style={styles.replyButtonText}>
            {item.replied ? "Edit Reply" : "Reply"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
            <Text style={styles.headerTitle}>Feedback</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.ratingFilterButton,
            ratingFilter > 0 && styles.activeRatingButton,
          ]}
          onPress={() =>
            setRatingFilter(ratingFilter === 5 ? 0 : ratingFilter + 1)
          }
        >
          {ratingFilter === 0 ? (
            <Ionicons name="filter" size={20} color="#666666" />
          ) : (
            <View style={styles.ratingDisplay}>
              <Text style={styles.ratingNumber}>{ratingFilter}</Text>
              <Ionicons name="star" size={14} color="#FFD700" />
            </View>
          )}
        </TouchableOpacity>
      </View>

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
            placeholder="Search by customer name or order ID"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "all" && styles.activeFilterTab,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === "all" && styles.activeFilterTabText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "replied" && styles.activeFilterTab,
            ]}
            onPress={() => setFilter("replied")}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === "replied" && styles.activeFilterTabText,
              ]}
            >
              Replied
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "not_replied" && styles.activeFilterTab,
            ]}
            onPress={() => setFilter("not_replied")}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === "not_replied" && styles.activeFilterTabText,
              ]}
            >
              Not Replied
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <FlatList
          data={filteredFeedbacks}
          renderItem={renderFeedbackItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedbackList}
        />
      </KeyboardAvoidingView>
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
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
  ratingFilterButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    minWidth: 40,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  activeRatingButton: {
    backgroundColor: "#FFF0E6",
  },
  ratingDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FF6B00",
    marginRight: 2,
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterTab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#F5F5F5",
  },
  activeFilterTab: {
    backgroundColor: "#FFF0E6",
  },
  filterTabText: {
    fontSize: 14,
    color: "#666",
  },
  activeFilterTabText: {
    color: "#FF6B00",
    fontWeight: "500",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  feedbackList: {
    padding: 20,
  },
  feedbackItem: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 16,
  },
  customerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  customerImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  customerInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#999",
  },
  customerDetails: {
    flex: 1,
    marginLeft: 10,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  feedbackDate: {
    fontSize: 12,
    color: "#666",
  },
  rightHeader: {
    alignItems: "flex-end",
    width: 100,
  },
  orderIdValue: {
    fontSize: 13,
    color: "#FF6B00",
    fontWeight: "500",
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "flex-end",
  },
  foodImageContainer: {
    marginBottom: 10,
  },
  dishName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  foodImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    resizeMode: "cover",
  },
  feedbackComment: {
    fontSize: 14,
    color: "#333",
    marginTop: 10,
    marginBottom: 15,
    lineHeight: 20,
  },
  replyContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
    marginLeft: 5,
  },
  replyText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  replyButtonText: {
    fontSize: 14,
    color: "#FF6B00",
    marginLeft: 5,
  },
  replyInputContainer: {
    marginTop: 10,
  },
  replyInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#333",
  },
  replyActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#FF6B00",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  submitButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
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
    paddingVertical: 8,
    fontSize: 14,
  },
  starIcon: {
    marginLeft: 1,
  },
});

export default FeedbackScreen;

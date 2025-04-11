"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Contact, Driver } from "../index";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface RouteParams {
  driver?: Driver;
}

// Define navigation prop type
type NavigationProp = StackNavigationProp<RootStackParamList>;

// Get screen dimensions
const { width, height } = Dimensions.get("window");

const TrackDriverScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const defaultDriver: Driver = {
    name: "Tony Wang",
    phone: "0274 458 999",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
  };

  const { driver = defaultDriver } = (route.params as RouteParams) || {};

  const [estimatedTime, setEstimatedTime] = useState("15 minutes");
  const [driverStatus, setDriverStatus] = useState("On the way");
  const [currentStop, setCurrentStop] = useState(0);
  const driverPosition = useRef(
    new Animated.ValueXY({ x: 100, y: 100 })
  ).current;

  // Map pan/zoom animations
  const mapScale = useRef(new Animated.Value(1)).current;
  const mapTranslateX = useRef(new Animated.Value(0)).current;
  const mapTranslateY = useRef(new Animated.Value(0)).current;

  // Driver pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Progress line animation
  const progressAnim = useRef(new Animated.Value(0)).current;
  // Time countdown
  const timeRef = useRef(15);

  // Traffic animation
  const trafficAnim1 = useRef(new Animated.Value(0)).current;
  const trafficAnim2 = useRef(new Animated.Value(0)).current;

  // Define route waypoints
  const routePath = [
    { x: 100, y: 100, name: "Starting point" },
    { x: 150, y: 180, name: "Balcombe Road" },
    { x: 200, y: 160, name: "Kingston Road" },
    { x: 280, y: 140, name: "Dingley Village" },
    { x: 320, y: 200, name: "Destination" },
  ];

  // Traffic points (cars on the road)
  const trafficPoints = [
    { startX: 120, startY: 140, endX: 160, endY: 190 },
    { startX: 180, startY: 170, endX: 220, endY: 150 },
    { startX: 240, startY: 150, endX: 290, endY: 140 },
    { startX: 300, startY: 160, endX: 330, endY: 210 },
  ];

  // Create pulse effect animation
  useEffect(() => {
    const createPulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start(() => createPulseAnimation());
    };

    createPulseAnimation();
  }, []);

  // Animate traffic movement
  useEffect(() => {
    const animateTraffic = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(trafficAnim1, {
            toValue: 1,
            duration: 4000,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(trafficAnim1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(trafficAnim2, {
            toValue: 1,
            duration: 6000,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(trafficAnim2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    animateTraffic();
  }, []);

  // Simulate driver movement along waypoints with map panning
  useEffect(() => {
    const animateDriver = () => {
      let sequence = [];
      let totalDuration = 0;

      // Create animation sequence for each route segment
      for (let i = 1; i < routePath.length; i++) {
        // Calculate segment duration based on distance
        const prevPoint = routePath[i - 1];
        const currPoint = routePath[i];
        const distance = Math.sqrt(
          Math.pow(currPoint.x - prevPoint.x, 2) +
            Math.pow(currPoint.y - prevPoint.y, 2)
        );
        const duration = distance * 150; // Adjust speed
        totalDuration += duration;

        // Create parallel animations for driver movement and map panning
        sequence.push(
          Animated.parallel([
            // Move driver
            Animated.timing(driverPosition, {
              toValue: { x: currPoint.x, y: currPoint.y },
              duration: duration,
              useNativeDriver: false,
              easing: Easing.linear,
            }),
            // Update progress
            Animated.timing(progressAnim, {
              toValue: i / (routePath.length - 1),
              duration: duration,
              useNativeDriver: false,
              easing: Easing.linear,
            }),
            // Pan map to follow driver (with slight delay for realistic effect)
            Animated.sequence([
              Animated.delay(duration * 0.2),
              Animated.timing(mapTranslateX, {
                toValue: -currPoint.x + width / 2,
                duration: duration * 0.8,
                useNativeDriver: false,
                easing: Easing.out(Easing.cubic),
              }),
            ]),
            Animated.sequence([
              Animated.delay(duration * 0.2),
              Animated.timing(mapTranslateY, {
                toValue: -currPoint.y + height / 3,
                duration: duration * 0.8,
                useNativeDriver: false,
                easing: Easing.out(Easing.cubic),
              }),
            ]),
            // Subtle zoom in/out effect at key points
            Animated.sequence([
              Animated.delay(duration * 0.3),
              Animated.timing(mapScale, {
                toValue: i === routePath.length - 1 ? 1.15 : 1.1,
                duration: duration * 0.4,
                useNativeDriver: false,
                easing: Easing.inOut(Easing.cubic),
              }),
              Animated.timing(mapScale, {
                toValue: 1.05,
                duration: duration * 0.3,
                useNativeDriver: false,
                easing: Easing.inOut(Easing.cubic),
              }),
            ]),
          ])
        );
      }

      // Run sequence
      Animated.sequence(sequence).start();

      // Update estimated time
      const timerInterval = setInterval(() => {
        if (timeRef.current <= 0) {
          clearInterval(timerInterval);
          setEstimatedTime("Arrived");
          setDriverStatus("Arrived");
        } else {
          timeRef.current -= 1;
          setEstimatedTime(`${timeRef.current} minutes`);

          // Update current stop based on progress
          const progressRatio = 1 - timeRef.current / 15;
          const stopIndex = Math.min(
            Math.floor(progressRatio * routePath.length),
            routePath.length - 1
          );
          setCurrentStop(stopIndex);

          // Update driver status
          if (timeRef.current <= 5) {
            setDriverStatus("Almost there");
          }
        }
      }, 1000);

      return () => {
        clearInterval(timerInterval);
        driverPosition.stopAnimation();
      };
    };

    // Slight initial delay before starting animation
    setTimeout(animateDriver, 500);
  }, []);

  const handleCall = () => {
    navigation.navigate("Call", {
      contact: {
        name: driver.name,
        phone: driver.phone,
        image: driver.image,
      },
    });
  };

  // Draw a line connecting route waypoints
  const renderRoutePath = () => {
    return routePath.map((point, index) => {
      if (index === 0) return null;

      const prevPoint = routePath[index - 1];

      // Calculate line length and angle
      const dx = point.x - prevPoint.x;
      const dy = point.y - prevPoint.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      const isActive = index <= currentStop;

      return (
        <View
          key={`line-${index}`}
          style={[
            styles.routeLine,
            {
              width: length,
              left: prevPoint.x,
              top: prevPoint.y,
              transform: [{ rotate: `${angle}deg` }],
              backgroundColor: isActive ? "#FF6B00" : "#D3D3D3",
            },
          ]}
        />
      );
    });
  };

  // Draw waypoint markers
  const renderWaypoints = () => {
    return routePath.map((point, index) => {
      const isActive = index <= currentStop;
      const isDestination = index === routePath.length - 1;

      return (
        <View
          key={`waypoint-${index}`}
          style={[
            styles.waypointMarker,
            {
              left: point.x - (isDestination ? 7 : 5),
              top: point.y - (isDestination ? 7 : 5),
              width: isDestination ? 14 : 10,
              height: isDestination ? 14 : 10,
              backgroundColor: isActive ? "#FF6B00" : "#D3D3D3",
            },
          ]}
        >
          {isDestination && <View style={styles.destinationPoint} />}
        </View>
      );
    });
  };

  // Render moving traffic on the map
  const renderTraffic = () => {
    return (
      <React.Fragment>
        {trafficPoints.map((point, index) => {
          // Use different animation values for variety
          const anim = index % 2 === 0 ? trafficAnim1 : trafficAnim2;

          // Calculate positions
          const posX = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [point.startX, point.endX],
          });

          const posY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [point.startY, point.endY],
          });

          return (
            <Animated.View
              key={`traffic-${index}`}
              style={[
                styles.trafficDot,
                {
                  left: posX,
                  top: posY,
                  backgroundColor:
                    index % 3 === 0
                      ? "#4CAF50"
                      : index % 3 === 1
                      ? "#2196F3"
                      : "#FFC107",
                },
              ]}
            />
          );
        })}
      </React.Fragment>
    );
  };

  // Progress animation for route completion
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
          <Text style={styles.headerTitle}>Track Driver On Map</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapContainer}>
          <Animated.View
            style={[
              styles.mapWrapper,
              {
                transform: [
                  { scale: mapScale },
                  { translateX: mapTranslateX },
                  { translateY: mapTranslateY },
                ],
              },
            ]}
          >
            <Image
              source={require("../assets/map-bg.png")}
              style={styles.mapImage}
              resizeMode="cover"
            />

            {/* Traffic animation */}
            {renderTraffic()}

            {/* Render route path lines and waypoints */}
            {renderRoutePath()}
            {renderWaypoints()}

            {/* Driver position marker with pulse effect */}
            <Animated.View
              style={[
                styles.driverMarker,
                {
                  transform: [
                    { translateX: driverPosition.x },
                    { translateY: driverPosition.y },
                    { scale: pulseAnim },
                  ],
                },
              ]}
            >
              <View style={styles.markerInner}>
                <Ionicons name="bicycle" size={24} color="white" />
              </View>
            </Animated.View>

            {/* Pulse effect around driver */}
            <Animated.View
              style={[
                styles.pulseCircle,
                {
                  transform: [
                    { translateX: driverPosition.x },
                    { translateY: driverPosition.y },
                    { scale: pulseAnim },
                  ],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.3],
                    outputRange: [0.6, 0],
                  }),
                },
              ]}
            />
          </Animated.View>
        </View>

        <View style={styles.driverInfoCard}>
          <Image source={{ uri: driver.image }} style={styles.driverImage} />
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driver.name}</Text>
            <Text style={styles.driverPhone}>{driver.phone}</Text>
            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      driverStatus === "Arrived" ? "#4CAF50" : "#FF9800",
                  },
                ]}
              />
              <Text style={styles.statusText}>{driverStatus}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Ionicons name="call" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.deliveryInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={24} color="#666" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Estimated Arrival</Text>
              <Text style={styles.infoValue}>{estimatedTime}</Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>

          <View style={styles.locationInfo}>
            <View style={styles.locationRow}>
              <View style={styles.locationDot} />
              <Text style={styles.locationText}>
                422 Nguyen Hue Street, District 1, HCMC
              </Text>
            </View>
            <View style={styles.locationLine} />
            <View style={styles.locationRow}>
              <View style={[styles.locationDot, styles.destinationDot]} />
              <Text style={styles.locationText}>
                456 Le Loi Street, District 1, HCMC
              </Text>
            </View>
          </View>

          <View style={styles.currentWaypointContainer}>
            <Text style={styles.currentWaypointLabel}>Current Location</Text>
            <Text style={styles.currentWaypointText}>
              {currentStop < routePath.length
                ? routePath[currentStop].name
                : "Arrived at destination"}
            </Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
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
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  mapContainer: {
    height: 450,
    backgroundColor: "#f5f5f5",
    position: "relative",
    overflow: "hidden",
    borderRadius: 15,
    margin: 15,
    marginBottom: 0,
  },
  mapWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  driverMarker: {
    position: "absolute",
    zIndex: 10,
    left: -22,
    top: -22,
  },
  pulseCircle: {
    position: "absolute",
    zIndex: 9,
    left: -40,
    top: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 107, 0, 0.3)",
  },
  markerInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF6B00",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeLine: {
    height: 3,
    position: "absolute",
    transformOrigin: "left",
    zIndex: 5,
  },
  waypointMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: "absolute",
    zIndex: 6,
    borderWidth: 1,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  destinationPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "white",
  },
  trafficDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: "absolute",
    zIndex: 4,
    borderWidth: 1,
    borderColor: "white",
  },
  driverInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 15,
    margin: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  driverImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  driverPhone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF9800",
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  callButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF6B00",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  deliveryInfo: {
    backgroundColor: "white",
    borderRadius: 15,
    margin: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoTextContainer: {
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#EEEEEE",
    borderRadius: 2,
    marginVertical: 15,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: "#FF6B00",
    borderRadius: 2,
  },
  locationInfo: {
    marginBottom: 15,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    marginRight: 10,
    marginTop: 5,
  },
  locationLine: {
    width: 2,
    height: 30,
    backgroundColor: "#DDDDDD",
    marginLeft: 4,
    marginVertical: 5,
  },
  destinationDot: {
    backgroundColor: "#FF6B00",
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  currentWaypointContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#FFF8F3",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFE0CC",
  },
  currentWaypointLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  currentWaypointText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF6B00",
  },
});

export default TrackDriverScreen;

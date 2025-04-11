"use client";

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { CallParams } from "..";

const { width, height } = Dimensions.get("window");

const CallScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { contact } = route.params as CallParams;

  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);

  // Animation for the call button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation for waves around the avatar
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  // Audio waves animation
  const audioWaves = Array.from({ length: 12 }).map(
    () => useRef(new Animated.Value(Math.random())).current
  );

  // Time blink animation
  const timeBlink = useRef(new Animated.Value(1)).current;

  // Animation for avatar floating effect
  const avatarFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the pulse animation for call button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start waves animation
    const animateWaves = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(wave1, {
              toValue: 1,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(wave1, {
              toValue: 0,
              duration: 0,
              useNativeDriver: false,
            }),
          ]),
          Animated.sequence([
            Animated.delay(300),
            Animated.timing(wave2, {
              toValue: 1,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(wave2, {
              toValue: 0,
              duration: 0,
              useNativeDriver: false,
            }),
          ]),
          Animated.sequence([
            Animated.delay(600),
            Animated.timing(wave3, {
              toValue: 1,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(wave3, {
              toValue: 0,
              duration: 0,
              useNativeDriver: false,
            }),
          ]),
        ])
      ).start();
    };

    // Animate audio waves
    const animateAudioWaves = () => {
      const animations = audioWaves.map((anim, i) => {
        return Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random() * 0.6 + 0.4, // Random height between 0.4 and 1
            duration: Math.random() * 400 + 200, // Random duration
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: Math.random() * 0.6 + 0.1, // Random height between 0.1 and 0.7
            duration: Math.random() * 400 + 200, // Random duration
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ]);
      });

      Animated.loop(Animated.stagger(80, animations)).start();
    };

    // Animate time blink
    const animateTimeBlink = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(timeBlink, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(timeBlink, {
            toValue: 0.6,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    // Animate avatar floating
    const animateAvatarFloat = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(avatarFloat, {
            toValue: 10,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(avatarFloat, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateWaves();
    animateAudioWaves();
    animateTimeBlink();
    animateAvatarFloat();

    // Timer for call duration
    let timer: NodeJS.Timeout | undefined;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    navigation.goBack();
  };

  // Wave animations styling
  const wave1Style = {
    transform: [
      {
        scale: wave1.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.6],
        }),
      },
    ],
    opacity: wave1.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0.6, 0.3, 0],
    }),
  };

  const wave2Style = {
    transform: [
      {
        scale: wave2.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.8],
        }),
      },
    ],
    opacity: wave2.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0.5, 0.2, 0],
    }),
  };

  const wave3Style = {
    transform: [
      {
        scale: wave3.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2],
        }),
      },
    ],
    opacity: wave3.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0.4, 0.1, 0],
    }),
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactPhone}>{contact.phone}</Text>
          {isCallActive && (
            <Animated.Text style={[styles.callStatus, { opacity: timeBlink }]}>
              Call in progress • {formatTime(callDuration)}
            </Animated.Text>
          )}
        </View>

        <View style={styles.avatarSection}>
          {/* Animated avatar waves */}
          <Animated.View style={[styles.wave, wave3Style]} />
          <Animated.View style={[styles.wave, wave2Style]} />
          <Animated.View style={[styles.wave, wave1Style]} />

          {/* Avatar with floating animation */}
          <Animated.View
            style={[
              styles.avatarContainer,
              { transform: [{ translateY: avatarFloat }] },
            ]}
          >
            <Image
              source={{
                uri:
                  contact.image ||
                  "https://randomuser.me/api/portraits/men/32.jpg",
              }}
              style={styles.avatar}
            />
          </Animated.View>
        </View>

        {/* Audio waves visualization */}
        <View style={styles.audioWavesContainer}>
          {audioWaves.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.audioWave,
                {
                  height: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [5, 40],
                  }),
                  backgroundColor: index % 2 === 0 ? "#FF8F6B" : "#FF6B00",
                },
              ]}
            />
          ))}
        </View>

        <Animated.View
          style={[
            styles.callButtonContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.callButton} onPress={handleEndCall}>
            <Ionicons name="call" size={30} color="white" />
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.endCallText}>Tap to end call</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  contactInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  contactName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
  },
  contactPhone: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 10,
  },
  callStatus: {
    fontSize: 14,
    color: "#4CAF50",
  },
  avatarSection: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  wave: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 107, 0, 0.2)",
  },
  avatarContainer: {
    borderRadius: 75,
    padding: 3,
    borderWidth: 2,
    borderColor: "#FF6B00",
    shadowColor: "#FF6B00",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  audioWavesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: "80%",
    marginBottom: 30,
  },
  audioWave: {
    width: 4,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  callButtonContainer: {
    marginBottom: 20,
  },
  callButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F44336",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  endCallText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 10,
  },
});

export default CallScreen;

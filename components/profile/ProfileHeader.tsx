import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

// Color palette based on #00c5e3
const COLORS = {
  primary: "#00c5e3",
  primaryLight: "#33d1e8",
  primaryDark: "#00a3bd",
  accent: "#3B82F6",
  textLight: "#FFFFFF",
  textDark: "#0A4C76",
};

// Get window dimensions
const { width } = Dimensions.get("window");


const BASE_HEADER_HEIGHT = 64;
const MIN_HEADER_HEIGHT = 48;
const SCROLL_THRESHOLD = 55;

interface AnimatedProfileHeaderProps {
  title: string;
  isOwnProfile?: boolean;
  userId?: string;
  showBackButton?: boolean;
  onSettingsPress?: () => void;
  onSharePress?: () => void;
  scrollY?: Animated.Value; // Optional animated scroll value for parallax effects
}

export default function AnimatedProfileHeader({
  title,
  isOwnProfile = true,
  userId,
  showBackButton = false,
  onSettingsPress,
  onSharePress,
  scrollY,
}: AnimatedProfileHeaderProps) {
  const router = useRouter();

  const safeAreaTopHeight = 3;

  const [headerHeight, setHeaderHeight] = useState(BASE_HEADER_HEIGHT);


  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleSlideAnim = useRef(new Animated.Value(-10)).current;
  const headerScaleAnim = useRef(new Animated.Value(1.03)).current;
  const buttonSlideAnim = useRef(new Animated.Value(10)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    if (scrollY) {
      const listener = scrollY.addListener(({ value }) => {

        const newHeight = Math.max(
          MIN_HEADER_HEIGHT,
          BASE_HEADER_HEIGHT - (value * 0.4)
        );
        setHeaderHeight(newHeight);
      });

      return () => {
        scrollY.removeListener(listener);
      };
    }
  }, [scrollY]);


  const headerOpacity = scrollY
    ? scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD],
      outputRange: [1, 0.95],
      extrapolate: "clamp",
    })
    : 1;

  const titleScale = scrollY
    ? scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD],
      outputRange: [1, 0.92],
      extrapolate: "clamp",
    })
    : 1;


  const waveTransform = scrollY
    ? Animated.multiply(
      waveAnim,
      scrollY.interpolate({
        inputRange: [0, SCROLL_THRESHOLD / 2],
        outputRange: [1, 0],
        extrapolate: 'clamp'
      })
    )
    : waveAnim;


  useEffect(() => {

    Animated.parallel([

      Animated.spring(headerScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),


      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: 100,
        useNativeDriver: true,
      }),


      Animated.spring(titleSlideAnim, {
        toValue: 0,
        friction: 7,
        tension: 45,
        delay: 100,
        useNativeDriver: true,
      }),

      Animated.spring(buttonSlideAnim, {
        toValue: 0,
        friction: 7,
        tension: 45,
        delay: 150,
        useNativeDriver: true,
      }),


      Animated.spring(waveAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);


  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSettings = useCallback(() => {
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      router.push("/(tabs)/setting");
    }
  }, [onSettingsPress, router]);

  const handleShare = useCallback(() => {
    if (onSharePress) {
      onSharePress();
    } else {
      console.log("Share profile", userId || "own");
    }
  }, [onSharePress, userId]);

  return (
    <View style={[styles.headerContainer, { height: headerHeight }]}>
      <Animated.View
        style={{
          opacity: headerOpacity,
          transform: [{ scale: headerScaleAnim }],
          flex: 1,
        }}
      >
        <LinearGradient
          colors={["#FFFFFF", "#F8F8F8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientContainer, { paddingTop: safeAreaTopHeight }]}
        >
          <Animated.View
            style={[
              styles.headerContent,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            {showBackButton && (
              <Animated.View
                style={[
                  styles.backButtonContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateX: Animated.multiply(buttonSlideAnim, -1) },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleGoBack}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color={COLORS.primaryDark}
                  />
                </TouchableOpacity>
              </Animated.View>
            )}

            <Animated.Text
              style={[
                styles.headerTitle,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: titleSlideAnim },
                    { scale: titleScale },
                  ],
                },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Animated.Text>

            <Animated.View
              style={[
                styles.headerActions,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: buttonSlideAnim }],
                },
              ]}
            >
              {isOwnProfile && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push("/profile/search")}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="search"
                    size={22}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              )}
              {isOwnProfile ? (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleSettings}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="settings-outline"
                    size={22}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShare}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={22}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              )}
            </Animated.View>
          </Animated.View>

          {/* Animated wave effect with improved animation */}
          {/* <WaveEffect waveAnim={waveTransform} />  */}
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

// Wave effect component with improved animation
const WaveEffect: React.FC<{ waveAnim: Animated.AnimatedInterpolation<number> }> = React.memo(({ waveAnim }) => {
  const wave1TranslateY = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
    extrapolate: 'clamp'
  });

  const wave1Opacity = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.6, 0.9],
    extrapolate: 'clamp'
  });

  const wave2TranslateY = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [25, 0],
    extrapolate: 'clamp'
  });

  const wave2Opacity = waveAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp'
  });

  return (
    <View style={waveStyles.container}>
      <Animated.View
        style={[
          waveStyles.wave1,
          {
            transform: [{ translateY: wave1TranslateY }, { scaleX: 1.5 }],
            opacity: wave1Opacity,
          },
        ]}
      />
      <Animated.View
        style={[
          waveStyles.wave2,
          {
            transform: [{ translateY: wave2TranslateY }, { scaleX: 1.6 }],
            opacity: wave2Opacity,
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    overflow: "hidden",
    zIndex: 10,
    marginBottom: -2,
  },
  gradientContainer: {
    flex: 1,
    width: "100%",
    paddingBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    height: 48,
    position: "relative",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    maxWidth: width * 0.65,
  },
  backButtonContainer: {
    position: "absolute",
    left: 16,
    zIndex: 2,
  },
  backButton: {
    padding: 6,
  },
  headerActions: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    zIndex: 2,
  },
  actionButton: {
    marginLeft: 16,
    padding: 6,
  },
});


const waveStyles = StyleSheet.create({
  container: {
    height: 20,
    width: "100%",
    position: "absolute",
    bottom: -2,
    overflow: "hidden",
  },
  wave1: {
    height: 22,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 300,
    borderTopRightRadius: 300,
    position: "absolute",
    bottom: -5,
    opacity: 0.95,
  },
  wave2: {
    height: 18,
    width: "110%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 100,
    borderTopRightRadius: 150,
    position: "absolute",
    bottom: -6,
    left: -5,
    opacity: 1,
  },
});

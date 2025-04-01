import React, { memo } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ActivityIndicator,
  TextStyle,
} from "react-native";
import { View, Text } from "./Themed";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export interface GradientButtonProps {
  onPress: () => void;
  text?: string;
  icon?: React.ReactNode;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
  iconPosition?: "left" | "right";
  gradientColors?: [string, string, ...string[]];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  uppercase?: boolean;
  borderRadius?: number; // Configure the border radius
  outline?: boolean;
  outlineColor?: string;
}

const GradientButton = memo(
  ({
    onPress,
    text,
    icon,
    iconName,
    iconSize = 16,
    iconColor = "#FFF",
    iconPosition = "left",
    gradientColors = ["#00c5e3", "#0072ff"],
    gradientStart = { x: 0, y: 0 },
    gradientEnd = { x: 1, y: 0 },
    disabled = false,
    loading = false,
    style,
    textStyle,
    uppercase = true,
    borderRadius = 20,
    outline = false,
    outlineColor,
  }: GradientButtonProps) => {
    const buttonContainerStyle = {
      ...styles.buttonContainer,
      borderRadius,
      ...(outline && {
        borderWidth: 1,
        borderColor: outlineColor || gradientColors[0],
      }),
    };

    const gradientStyle = {
      ...styles.gradient,
      borderRadius,
    };

    const buttonIcon =
      icon ||
      (iconName && (
        <Ionicons name={iconName as any} size={iconSize} color={iconColor} />
      ));

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[
            buttonContainerStyle,
            style,
            disabled && styles.buttonDisabled,
          ]}
          onPress={onPress}
          activeOpacity={0.8}
          disabled={disabled || loading}
        >
          <LinearGradient
            colors={
              disabled
                ? ["#b0b0b0", "#8a8a8a"]
                : (gradientColors as [string, string, ...string[]])
            }
            start={gradientStart}
            end={gradientEnd}
            style={gradientStyle}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                {buttonIcon && iconPosition === "left" && (
                  <View style={styles.iconContainer}>{buttonIcon}</View>
                )}

                <Text
                  style={[
                    styles.text,
                    textStyle,
                    uppercase && styles.uppercase,
                  ]}
                >
                  {text}
                </Text>

                {buttonIcon && iconPosition === "right" && (
                  <View style={styles.iconContainerRight}>{buttonIcon}</View>
                )}
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }
);

GradientButton.displayName = "GradientButton";

export default GradientButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  buttonContainer: {
    overflow: "hidden",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 20, // 略微缩小以适应两个按钮并排
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "transparent",
  },
  uppercase: {
    textTransform: "uppercase",
  },
  iconContainer: {
    marginRight: 8,
    backgroundColor: "transparent",
  },
  iconContainerRight: {
    marginLeft: 8,
    backgroundColor: "transparent",
  },
});

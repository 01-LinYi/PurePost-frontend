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

export interface GradientButtonProps {
  onPress: () => void;
  text: string;
  icon?: React.ReactNode;
  gradientColors?: string[];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  uppercase?: boolean;
  borderRadius?: number; // Configure the border radius
}

const GradientButton = memo(
  ({
    onPress,
    text,
    icon,
    gradientColors = ["#00c5e3", "#0072ff"],
    gradientStart = { x: 0, y: 0 },
    gradientEnd = { x: 1, y: 0 },
    disabled = false,
    loading = false,
    style,
    textStyle,
    uppercase = true,
    borderRadius = 20, // 默认值为 20
  }: GradientButtonProps) => {
    // 创建动态样式
    const buttonContainerStyle = {
      ...styles.buttonContainer,
      borderRadius,
    };

    const gradientStyle = {
      ...styles.gradient,
      borderRadius,
    };

    return (
      <View>
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
            colors={disabled ? ["#b0b0b0", "#8a8a8a"] : gradientColors}
            start={gradientStart}
            end={gradientEnd}
            style={gradientStyle}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <Text
                  style={[
                    styles.text,
                    textStyle,
                    uppercase && styles.uppercase,
                  ]}
                >
                  {text}
                </Text>
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
  buttonContainer: {
    overflow: "hidden",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  uppercase: {
    textTransform: "uppercase",
  },
  iconContainer: {
    marginRight: 8,
  },
});

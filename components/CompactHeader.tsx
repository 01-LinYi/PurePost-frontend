// components/CompactHeader.tsx - A more compact header component for navigation

import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";

interface CompactHeaderProps {
  title: string;
  onBack: () => void;
  rightIcon?: {
    name: keyof typeof Ionicons.glyphMap;
    label?: string;
    onPress: () => void;
  };
}

/**
 * A compact header component for navigation with customizable title and optional right action
 */
const CompactHeader: React.FC<CompactHeaderProps> = ({
  title,
  onBack,
  rightIcon,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={22} color="#333" />
      </TouchableOpacity>

      <Text style={styles.pageTitle}>{title}</Text>

      {rightIcon ? (
        <TouchableOpacity
          style={styles.rightButton}
          onPress={rightIcon.onPress}
          accessibilityLabel={rightIcon.label || "Action"}
          accessibilityRole="button"
        >
          <Ionicons name={rightIcon.name} size={20} color="#00c5e3" />
          {rightIcon.label && (
            <Text style={styles.rightButtonText}>{rightIcon.label}</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  rightButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  rightButtonText: {
    color: "#00c5e3",
    fontWeight: "500",
    fontSize: 14,
    marginLeft: 4,
  },
  placeholder: {
    width: 30,
  },
});

export default CompactHeader;

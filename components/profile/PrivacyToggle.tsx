import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

type PrivacyToggleProps = {
  isPrivate: boolean;
  isOwnProfile: boolean;
  handleToggleVisibility: (value: boolean) => void;
  COLORS: any;
};

const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  isPrivate,
  isOwnProfile,
  handleToggleVisibility,
  COLORS,
}) => {
  return (
    <View style={styles.toggleContainer}>
      <View style={styles.labelRow}>
        {isPrivate ? (
          <MaterialIcons
            name="lock-outline"
            size={20}
            color={COLORS.primary}
            style={styles.visibilityIcon}
          />
        ) : (
          <Ionicons
            name="earth"
            size={20}
            color={COLORS.accent}
            style={styles.visibilityIcon}
          />
        )}
        <Text
          style={[
            styles.toggleLabel,
            { color: isPrivate ? COLORS.primary : COLORS.accent },
          ]}
        >
          {isPrivate ? "Private Profile" : "Public Profile"}
        </Text>
      </View>

      {isOwnProfile && (
        <View>
          <View style={styles.switchRow}>
            <Text style={styles.switchHint}>
              {isPrivate
                ? "Hiding your details..."
                : "Anyone can view your profile"}
            </Text>
            <Switch
              value={isPrivate}
              onValueChange={handleToggleVisibility}
              thumbColor={isPrivate ? COLORS.primary : COLORS.accent}
              trackColor={{
                false: "#D1D5DB",
                true: COLORS.primaryLight,
              }}
              ios_backgroundColor="#D1D5DB"
              accessibilityLabel={`Change profile visibility. Currently ${
                isPrivate ? "private" : "public"
              }`}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingBottom: 4,
    flex: 1,
  },
  visibilityIcon: {
    marginRight: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  badgeIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  switchHint: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default PrivacyToggle;

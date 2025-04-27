// app/notificationSetting.tsx
import { useState, useEffect } from "react";
import {
  Switch,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { NotificationType } from "@/types/notificationType";
import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useNotificationSetting } from "@/hooks/useNotificationSetting";

const THEME_COLOR = "#00c5e3";

const labels: Record<NotificationType, string> = {
  like: "Likes",
  comment: "Comments",
  share: "Shares",
  follow: "Follows",
  report: "Reports",
};

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.LIKE:
      return <Ionicons name="heart" size={20} color="#FF2D55" />;
    case NotificationType.COMMENT:
      return <Ionicons name="chatbubble" size={20} color="#5AC8FA" />;
    case NotificationType.SHARE:
      return <Ionicons name="arrow-redo" size={20} color="#4CD964" />;
    case NotificationType.FOLLOW:
      return <Ionicons name="person-add" size={20} color="#007AFF" />;
    case NotificationType.REPORT:
      return <Ionicons name="warning" size={20} color="#FF3B30" />;
    default:
      return <Ionicons name="notifications" size={20} color="#FF9500" />;
  }
};

const NotificationSettingsScreen = () => {
  const router = useRouter();
  const [loadingType, setLoadingType] = useState<NotificationType | null>(null);
  const { settings, setSettings, isLoading, handleRefresh } =
    useNotificationSetting();

  const toggle = async (type: NotificationType) => {
    if (loadingType) return;
    const enabled = !settings[type];
    setSettings((prev) => ({ ...prev, [type]: enabled }));
    setLoadingType(type);
    try {
      await axiosInstance.put(`/notifications/preferences/${type}/`, {
        enabled: enabled,
      });
    } catch {
      setSettings((prev) => ({ ...prev, [type]: !enabled }));
      Alert.alert("Error", "Failed to update setting.");
    } finally {
      setLoadingType(null);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={22} color="#00c5e3" />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>{`Notification Setting`}</Text>
      </View>

      <FlatList
        data={Object.values(NotificationType)}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const isLoading = loadingType === item;
          return (
            <Pressable
              onPress={() => !isLoading && toggle(item)}
              style={({ pressed }) => [
                styles.item,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.iconLabel}>
                {getNotificationIcon(item)}
                <Text style={styles.label}>{labels[item]}</Text>
              </View>
              {isLoading ? (
                <ActivityIndicator size="small" color={THEME_COLOR} />
              ) : (
                <Switch
                  value={settings[item]}
                  onValueChange={() => toggle(item)}
                  disabled={!!loadingType}
                  trackColor={{ false: "#ccc", true: THEME_COLOR }}
                  thumbColor={"#f4f3f4"}
                />
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    flex: 1,
  },
  createPostButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00c5e3",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 18,
  },
  createPostButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 14,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  iconLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    marginLeft: 8,
    color: "#333",
  },
});

export default NotificationSettingsScreen;

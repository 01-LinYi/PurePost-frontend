// components/post/AuthorInfo.tsx - Component for displaying post author information

import { StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import { User } from "@/types/postType";

interface AuthorInfoProps {
  user: User;
  created_at: string;
  updated_at?: string;
  isEdited?: boolean;
  onEdit?: () => void;
  showEditButton?: boolean;
  isPrivateAccount?: boolean;
}

/**
 * Displays user information and post timestamp
 */
const AuthorInfo: React.FC<AuthorInfoProps> = ({
  user,
  created_at,
  updated_at,
  isEdited,
  onEdit,
  showEditButton = false,
  isPrivateAccount = false,
}) => {
  /**
   * Formats a date string into a user-friendly format
   * @param dateStr ISO date string
   * @returns Formatted date string
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);

    // If today, show time
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // If yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // For older dates, show full date
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Profile picture or fallback avatar */}
      {user.profile_picture ? (
        <Image
          source={{ uri: user.profile_picture }}
          style={styles.avatar}
          defaultSource={{uri: "https://picsum.photos/200"}}
        />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarText}>
            {user.username.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{user.username}</Text>
          {isPrivateAccount && (
            <Ionicons
              name="lock-closed"
              size={14}
              color="#9E9E9E"
              style={styles.privateIcon}
            />
          )}
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formatDate(created_at)}</Text>
          {isEdited && updated_at && (
            <Text style={styles.editedText}>
              • Edited {formatDate(updated_at)}
            </Text>
          )}
        </View>
      </View>

      {showEditButton && (
        <TouchableOpacity
          onPress={onEdit}
          style={styles.editButton}
          accessibilityLabel="Edit post"
          accessibilityRole="button"
        >
          <Ionicons name="pencil-outline" size={20} color="#00c5e3" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00c5e3",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  privateIcon: {
    marginLeft: 6,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 2,
  },
  date: {
    fontSize: 14,
    color: "#9E9E9E",
  },
  editedText: {
    fontSize: 14,
    color: "#9E9E9E",
    fontStyle: "italic",
    marginLeft: 4,
  },
  editButton: {
    padding: 8,
  },
});

export default AuthorInfo;

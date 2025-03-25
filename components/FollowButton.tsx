import React, { useState, useEffect } from "react";
import { StyleSheet, ViewStyle, TextStyle, Alert } from "react-native";
import { View, Text } from "./Themed";
import GradientButton, { GradientButtonProps } from "./GradientButton";
import { Ionicons } from "@expo/vector-icons";

export interface FollowButtonProps {
  // Core props
  userId: number;
  initialFollowStatus?: boolean;
  onFollowStatusChange?: (isFollowing: boolean, userId: number) => void;
  
  // Appearance
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: "small" | "medium" | "large";
  
  // Lock functionality
  isLocked?: boolean;
  lockReason?: string;
  
  // Configuration
  showFollowersCount?: boolean;
  followersCount?: number;
  
  // API Functions
  followUser?: (userId: number) => Promise<any>;
  unfollowUser?: (userId: number) => Promise<any>;
  
  // Additional GradientButton props
  gradientProps?: Partial<GradientButtonProps>;
}

/**
 * FollowButton - A specialized button for handling follow/unfollow actions
 * 
 * This component extends GradientButton to provide specific functionality for
 * following users, including locked state, confirmation dialogs, and visual feedback.
 */
const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialFollowStatus = false,
  onFollowStatusChange,
  style,
  textStyle,
  size = "medium",
  isLocked = false,
  lockReason = "This account cannot be followed at this time",
  showFollowersCount = false,
  followersCount = 0,
  followUser,
  unfollowUser,
  gradientProps = {},
}) => {
  // State management
  const [isFollowing, setIsFollowing] = useState(initialFollowStatus);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sync with external state changes
  useEffect(() => {
    setIsFollowing(initialFollowStatus);
  }, [initialFollowStatus]);
  
  // Default API implementations (replace with your actual implementation)
  const defaultFollowUser = async (id: number) => {
    console.log(`Following user ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  };
  
  const defaultUnfollowUser = async (id: number) => {
    console.log(`Unfollowing user ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  };
  
  // Use provided API functions or defaults
  const followUserFn = followUser || defaultFollowUser;
  const unfollowUserFn = unfollowUser || defaultUnfollowUser;
  
  /**
   * Handles the follow/unfollow action with confirmation and error handling
   */
  const handleFollowToggle = async () => {
    // Handle locked state
    if (isLocked) {
      Alert.alert("Action Unavailable", lockReason);
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isFollowing) {
        // Confirm before unfollowing
        const confirmUnfollow = await new Promise(resolve => {
          Alert.alert(
            "Unfollow Confirmation",
            "Are you sure you want to unfollow this user?",
            [
              { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
              { text: "Unfollow", style: "destructive", onPress: () => resolve(true) }
            ]
          );
        });
        
        if (!confirmUnfollow) {
          setIsLoading(false);
          return;
        }
        
        await unfollowUserFn(userId);
      } else {
        await followUserFn(userId);
      }
      
      // Update state and notify parent
      const newStatus = !isFollowing;
      setIsFollowing(newStatus);
      
      if (onFollowStatusChange) {
        onFollowStatusChange(newStatus, userId);
      }
    } catch (error) {
      console.error("Follow action error:", error);
      Alert.alert(
        "Error",
        `Failed to ${isFollowing ? "unfollow" : "follow"} user. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Size configurations for different button variants
  const sizeStyles = {
    small: {
      height: 32,
      fontSize: 12,
      iconSize: 14,
      paddingHorizontal: 12,
    },
    medium: {
      height: 40,
      fontSize: 14,
      iconSize: 16,
      paddingHorizontal: 16,
    },
    large: {
      height: 48,
      fontSize: 16,
      iconSize: 18,
      paddingHorizontal: 20,
    }
  };
  
  const selectedSize = sizeStyles[size];
  
  /**
   * Determine button appearance based on current state (following, locked, etc.)
   */
  const getButtonProps = (): Partial<GradientButtonProps> => {
      // Base props for all states
      const baseProps: Partial<GradientButtonProps> = {
        text: isFollowing ? "Following" : "Follow",
        iconName: isFollowing ? "checkmark-circle" : "person-add-outline",
        iconSize: selectedSize.iconSize,
        iconPosition: "left",
        style: {
          height: selectedSize.height,
          ...style
        },
        textStyle: StyleSheet.flatten([
          { fontSize: selectedSize.fontSize },
          textStyle
        ]),
        loading: isLoading,
        disabled: isLocked,
        borderRadius: 8,
        ...gradientProps,
      };
    
    // Locked state properties
    if (isLocked) {
      return {
        ...baseProps,
        iconName: "lock-closed",
        text: "Follow",
        gradientColors: ["#D1D5DB", "#9CA3AF"],
        disabled: true,
      };
    }
    
    // Following state properties
    if (isFollowing) {
      return {
        ...baseProps,
        gradientColors: ["transparent", "transparent"],
        outline: true,
        outlineColor: "#D1D5DB",
        textStyle: StyleSheet.flatten([
          { fontSize: selectedSize.fontSize, color: "#6B7280" },
          textStyle
        ]),
        iconColor: "#6B7280",
      };
    }
    
    // Default follow state properties
    return {
      ...baseProps,
      gradientColors: ["#34D399", "#10B981"],
    };
  };
  
  return (
    <View style={styles.container}>
      <GradientButton
        onPress={handleFollowToggle}
        {...getButtonProps()}
      />
      
      {showFollowersCount && (
        <Text style={styles.followersCount}>
          {followersCount.toLocaleString()} follower{followersCount !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  followersCount: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
});

export default FollowButton;
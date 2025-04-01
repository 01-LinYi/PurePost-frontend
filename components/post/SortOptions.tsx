// components/post/SortOptions.tsx - Component for sorting posts by different criteria

import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/Themed";

interface SortOptionsProps {
  currentOrdering: string;
  onSortChange: (ordering: string) => void;
}

const SortOptions = ({ currentOrdering, onSortChange }: SortOptionsProps) => {
  return (
    <View style={styles.sortOptions}>
      <Text style={styles.sortLabel}>Sort by:</Text>
      <View style={styles.sortButtons}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            currentOrdering === "-createdAt" && styles.sortButtonActive,
          ]}
          onPress={() => onSortChange("-createdAt")}
        >
          <Text
            style={[
              styles.sortButtonText,
              currentOrdering === "-createdAt" && styles.sortButtonTextActive,
            ]}
          >
            Newest
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            currentOrdering === "createdAt" && styles.sortButtonActive,
          ]}
          onPress={() => onSortChange("createdAt")}
        >
          <Text
            style={[
              styles.sortButtonText,
              currentOrdering === "createdAt" && styles.sortButtonTextActive,
            ]}
          >
            Oldest
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            currentOrdering === "-likesCount" && styles.sortButtonActive,
          ]}
          onPress={() => onSortChange("-likesCount")}
        >
          <Text
            style={[
              styles.sortButtonText,
              currentOrdering === "-likesCount" && styles.sortButtonTextActive,
            ]}
          >
            Most Liked
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            currentOrdering === "-commentsCount" && styles.sortButtonActive,
          ]}
          onPress={() => onSortChange("-commentsCount")}
        >
          <Text
            style={[
              styles.sortButtonText,
              currentOrdering === "-commentsCount" &&
                styles.sortButtonTextActive,
            ]}
          >
            Most Comments
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sortOptions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sortLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  sortButtonActive: {
    backgroundColor: "#00c5e3",
  },
  sortButtonText: {
    fontSize: 12,
    color: "#666",
  },
  sortButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default SortOptions;

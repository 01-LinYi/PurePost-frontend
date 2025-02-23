import React from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function EditButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={onPress}
        activeOpacity={0.8} 
      >
        <LinearGradient
          colors={["#4facfe", "#00f2fe"]} // 渐变颜色
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={styles.text}>Edit Profile</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
    color: "#fff",
    textTransform: "uppercase",
  },
});
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { View, Text } from "./Themed";
import { LinearGradient } from "expo-linear-gradient";

type EditButtonProps = {
  onPress: () => void;
  style?: ViewStyle; // Allow an optional style prop
};

const EditButton = ({ onPress, style }: EditButtonProps) => {
  return (
    <View>
      <TouchableOpacity
        style={[styles.buttonContainer, style]} // Apply custom styles
        onPress={onPress}
        activeOpacity={0.8} // Provides visual feedback on press
      >
        <LinearGradient
          colors={["#00c5e3", "#0072ff"]} // Gradient with brand color and a complementary shade
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={styles.text}>Edit Profile</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default EditButton;

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 20, // Rounded corners for the button
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 12, // Adjust vertical spacing for better button size
    paddingHorizontal: 25, // Adjust horizontal spacing for a balanced look
    borderRadius: 20, // Consistent rounded corners
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 14, // Balanced font size
    fontWeight: "600", // Semi-bold text for emphasis
    color: "#fff", // White text color for contrast
    textTransform: "uppercase", // Uppercase text for consistency with button style
  },
});

// components/AvatarPicker.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Text } from './Themed';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// Color palette based on #00c5e3
const COLORS = {
  primary: "#00c5e3",
  accent: "#3B82F6",
  cardBackground: "#FFFFFF",
  text: "#1F2937",
  textSecondary: "#4B5563",
};

interface AvatarPickerProps {
  currentAvatar?: string;
  onAvatarChange: (uri: string) => void;
  size?: number;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({
  currentAvatar,
  onAvatarChange,
  size = 100,
}) => {
  const [avatar, setAvatar] = useState<string | null>(currentAvatar || null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Calculate dimensions based on the given size
  const gradientSize = size;
  const innerSize = size - 6; // 3px padding on each side
  
  // Request permissions for camera and media library
  const requestPermissions = async () => {
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    
    // Request media library permissions
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!cameraPermission.granted && !mediaLibraryPermission.granted) {
      Alert.alert(
        "Permissions Required",
        "Please grant camera and media library permissions to change your profile photo.",
        [{ text: "OK" }]
      );
      return false;
    }
    
    // If at least one is granted, we can proceed
    return cameraPermission.granted || mediaLibraryPermission.granted;
  };

  // Process the selected image (crop & resize)
  const processImage = async (uri: string) => {
    try {
      // Define the target size for the avatar (we want a square)
      const targetSize = 500; // A reasonable size that balances quality and file size
      
      // Process the image using the ImageManipulator.manipulate() method
      const manipulatorResult = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: targetSize, height: targetSize } }
        ],
        { 
          compress: 0.8, 
          format: ImageManipulator.SaveFormat.JPEG
        }
      );
      
      return manipulatorResult.uri;
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process the image. Please try again.');
      return uri; // Return original if processing fails
    }
  };

  // Show options to pick an image
  const showImagePickerOptions = async () => {
    // Check permissions first
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;
    
    Alert.alert(
      "Change Profile Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => pickImage(true),
        },
        {
          text: "Choose from Gallery",
          onPress: () => pickImage(false),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  // Pick an image from camera or gallery
  const pickImage = async (useCamera: boolean) => {
    try {
      setIsLoading(true);
      
      // Define options for the image picker
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 1,
      };
      
      // Launch camera or image library
      const result = useCamera 
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
      
      // If the user didn't cancel
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Process the image
        const processedUri = await processImage(result.assets[0].uri);
        
        // Update local state
        setAvatar(processedUri);
        setImageError(false);
        
        // Notify parent component
        onAvatarChange(processedUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Display a placeholder for errors
  const handleImageError = () => {
    setImageError(true);
  };

  // Determine the image source
  const imageSource = imageError || !avatar
    ? { uri: "https://picsum.photos/200" }
    : { uri: avatar };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.avatarContainer, { height: size, width: size }]} 
        onPress={showImagePickerOptions}
        disabled={isLoading}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
          style={[styles.avatarGradientBorder, { height: gradientSize, width: gradientSize, borderRadius: gradientSize / 2 }]}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <Image
              source={imageSource}
              style={[
                styles.avatar, 
                { 
                  height: innerSize, 
                  width: innerSize, 
                  borderRadius: innerSize / 2 
                }
              ]}
              onError={handleImageError}
            />
          )}
        </LinearGradient>
        
        <TouchableOpacity 
          style={styles.changeAvatarButton}
          onPress={showImagePickerOptions}
          disabled={isLoading}
        >
          <Ionicons name="camera" size={18} color={COLORS.cardBackground} />
        </TouchableOpacity>
      </TouchableOpacity>
      
      <Text style={styles.changePhotoText}>Change Profile Photo</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradientBorder: {
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatar: {
    borderWidth: 2,
    borderColor: COLORS.cardBackground,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.cardBackground,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
});

export default AvatarPicker;
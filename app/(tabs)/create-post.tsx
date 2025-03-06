import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

/**
 * This component redirects the user to the /post route when mounted.
 */
export default function CreatePostRedirect() {
  useEffect(() => {
    // when the component is mounted, redirect the user to the /post route
    router.replace('/post');
  }, []);

  // return an empty view
  return <View />;
}
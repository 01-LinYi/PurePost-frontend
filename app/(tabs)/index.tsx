import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { useSession } from '@/components/SessionProvider';
import { Text, View } from '@/components/Themed';

export default function HomeScreen() {
  const { logOut, user } = useSession();
  return (
    <View style={styles.container}>
      <Text
        onPress={() => {
          // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
          logOut();
        }}>
        Log Out
      </Text>
      <Text style={styles.title}>Maybe Home page</Text>
      <Text style={styles.title}>Hello {user?.username} with ID {user?.id}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

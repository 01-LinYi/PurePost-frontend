import { StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import EditButton from '@/components/EditButton';

export default function TabProfileScreen() {
  const router = useRouter();


  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image
          source={{
            uri: 'https://picsum.photos/150',
          }}
          style={styles.avatar}
        />
        <EditButton onPress={() => router.push("/profile/edit" as any)} />

        {/* user name */}
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.username}>@johndoe</Text>

        {/* Stats (Posts, Followers, Following) */}
        <View style={styles.statsContainer}>
          <StatItem number="120" label="Posts" />
          <TouchableOpacity
            style={styles.stat}
            onPress={() => navigateTo('/profile/followers')}
            accessibilityRole="button"
            accessibilityLabel="View followers"
          >
            <StatItem number="350" label="Followers" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stat}
            onPress={() => navigateTo('/profile/following')}
            accessibilityRole="button"
            accessibilityLabel="View following"
          >
            <StatItem number="180" label="Following" />
          </TouchableOpacity>
        </View>

        {/* Division Line */}
        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
          accessibilityLabel="Separator line"
        />

        {/* Text Content */}
        <Text style={styles.text}>
          Welcome to John Doe's profile! Here you can explore more about the user, see their posts, and connect with them.
        </Text>
        <Text style={styles.text}>
          Scroll down to see more content or explore additional features about the user.
        </Text>
      </View>
    </ScrollView>
  );
}

// StatItem component
// TODO: Extract this component to a separate file
function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  username: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  text: {
    fontSize: 16,
    color: '#444',
    marginVertical: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
});
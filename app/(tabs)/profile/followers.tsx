import { StyleSheet, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';


const followers = [
  { id: '1', name: 'Alice', username: '@alice' },
  { id: '2', name: 'Bob', username: '@bob' },
  { id: '3', name: 'Charlie', username: '@charlie' },
];

export default function Followers() {
  return (
    <View style={styles.container}>
      <FlatList
        data={followers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.username}>{item.username}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    marginBottom: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    color: '#555',
  },
});
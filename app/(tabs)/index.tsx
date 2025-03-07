import { StyleSheet } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { useSession } from "@/components/SessionProvider";
import { Text, View } from "@/components/Themed";
import { router } from "expo-router";
import { useStorageState } from "@/hooks/useStorageState";
// Temporary solution to avoid the Token error.

export default function TabOneScreen() {
  const { logOut, user } = useSession();
  const [userStorage, setUser] = useStorageState("user");
  const [session, setSession] = useStorageState("session");
  return (
    <View style={styles.container}>
      <Text
        onPress={() => {
          // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
          logOut();
        }}
      >
        Log Out
      </Text>
      <Text
        onPress={() => {
          setUser(null);
          setSession(null);
          router.push("/login");
        }}
      >
        {" "}
        Clean token
      </Text>
      <Text style={styles.title}>Maybe Home page</Text>
      <Text style={styles.title}>
        Hello {user?.username} with ID {user?.id}
      </Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});

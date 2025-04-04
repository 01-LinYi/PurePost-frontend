import { Stack } from "expo-router";

export default function PostLayout() {
  return (
    <Stack>
        <Stack.Screen
            name="[username]"
            options={{
                title: "All Posts",
                headerShown: false,
            }}
        />
    </Stack>
  );
}

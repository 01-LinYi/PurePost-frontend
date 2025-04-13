import { Stack } from "expo-router";
import React from "react";

export default function PostLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "All Posts",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="my_posts"
        options={{
          title: "My Posts",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Create Post",
          headerShown: false,
          headerBackTitle: "Cancel",
        }}
      />
      <Stack.Screen
        name="preview"
        options={{
          title: "Post Preview",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]/index"
        options={{
          title: "Post Detail",
          headerShown: false,
          headerBackTitle: "Back",
          headerBackVisible: true,
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="[id]/edit"
        options={{
          title: "Edit Post",
          headerBackTitle: "Cancel",
        }}
      />
      <Stack.Screen
        name="saved/index"
        options={{
          title: "Saved Posts",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="saved/[folderId]"
        options={{
          headerShown: false,
          // Dynamic title will be set in the component
        }}
      />
    </Stack>
  );
}

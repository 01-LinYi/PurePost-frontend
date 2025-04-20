// Automatical Redirect
// From: app/(tabs)/create-post.tsx
// To:  app/post/create.tsx
import { Redirect } from "expo-router";

/**
 * This component redirects the user to the /post route when mounted.
 */
export default function CreatePostRedirect() {
  return <Redirect href="/post/create" />;
}

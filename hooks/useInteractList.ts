import { useState } from "react";
import * as api from "@/utils/api";

/**
 * Represents a user who interacted with a post
 */
export interface ListedUser {
  id: string;
  name: string;
  avatar: string;
}

/**
 * Types of interactions a user can have with a post
 */
export type InteractType = "likes" | "comments" | "shares";

/**
 * Return type for the useInteractList hook
 */
interface UseInteractListReturn {
  isLoading: boolean;
  users: ListedUser[];
  error: Error | null;
  fetchUsers: (type: InteractType, postId: string) => Promise<void>;
}

/**
 * Hook to fetch users who interacted with a specific post
 * @returns Object containing loading state, users list, error state, and fetch function
 */
export default function useInteractList(): UseInteractListReturn {
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches users who interacted with the post
   * @param type - The type of interaction to filter by
   * @param postId - The ID of the post
   */
  const fetchUsers = async (type: InteractType, postId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.fetchInteractionUsers(type, Number(postId), null);
      let resultsArray: any[] = [];
      if (Array.isArray(response)) {
        resultsArray = response;
      } else if (response.results && Array.isArray(response.results)) {
        resultsArray = response.results;
      } else {
        resultsArray = [];
      }
      const ansUsers = resultsArray.map((user: any) => ({
        id: user.id,
        name: user.username,
        avatar: user.profile_picture,
      }));
      setUsers(ansUsers);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, users, error, fetchUsers };
}

// hooks/useFeedPosts.ts

import { useState, useEffect, useCallback } from "react";

// Types
type PostUser = {
  id: number;
  username: string;
  avatar: string;
};

type DeepfakeResult = {
  confidence: number; // 0-1 confidence in the result
  status: "pending" | "completed" | "failed";
};

type Post = {
  id: number;
  user: PostUser;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
  disclaimer?: string;
  deepfakeRequested?: boolean;
  deepfakeResult?: DeepfakeResult;
};


/**
 * Custom hook for managing feed posts data and operations
 */
export function useFeedPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ordering, setOrdering] = useState<string>("latest");

  // Nature-themed images for enhanced visual appeal
  const natureImages = [
    "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=500", // Succulents
    "https://images.unsplash.com/photo-1666427613566-43e67abd1a41?q=80&w=500", // Mountain view
    "https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=500", // Additional nature
    "https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?q=80&w=500", // Additional nature
  ];

  // Fetch posts with error handling
  const loadData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const dummyPosts: Post[] = [
        {
          id: 1,
          user: {
            id: 1,
            username: "alex_walker",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          },
          content:
            "Just found these amazing succulents on my hike! Nature's patterns are truly incredible. 🌱",
          image: natureImages[0],
          likes: 24,
          comments: 5,
          timestamp: "10 minutes ago",
          isLiked: false,
          disclaimer: "AI generated contents",
        },
        {
          id: 2,
          user: {
            id: 2,
            username: "taylor_smith",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg",
          },
          content:
            "Standing at the edge of this cliff was both terrifying and exhilarating. The fog below made it feel like I was floating above the clouds.",
          image: natureImages[1],
          likes: 42,
          comments: 7,
          timestamp: "30 minutes ago",
          isLiked: false,
        },
        {
          id: 3,
          user: {
            id: 3,
            username: "jordan_jones",
            avatar: "https://randomuser.me/api/portraits/men/22.jpg",
          },
          content:
            "Does anyone have recommendations for growing succulents? I'm starting a small garden on my balcony.",
          likes: 13,
          comments: 11,
          timestamp: "1 hour ago",
          isLiked: false,
        },
        {
          id: 4,
          user: {
            id: 4,
            username: "sam_wilson",
            avatar: "https://randomuser.me/api/portraits/women/29.jpg",
          },
          content:
            "Just launched my new nature photography website! Would love your feedback on the mountain and succulent collections.",
          image: natureImages[2],
          likes: 31,
          comments: 9,
          timestamp: "2 hours ago",
          isLiked: false,
        },
        {
          id: 5,
          user: {
            id: 5,
            username: "robin_chen",
            avatar: "https://randomuser.me/api/portraits/women/68.jpg",
          },
          content:
            "Morning hike through the fog - there's something magical about being above the clouds.",
          image: natureImages[3],
          likes: 56,
          comments: 13,
          timestamp: "3 hours ago",
          isLiked: false,
        },
      ];

      // Sort posts according to current ordering
      const sortedPosts = sortPosts(dummyPosts, ordering);
      setPosts(sortedPosts);
    } catch (e) {
      setError("Failed to load posts. Please try again later.");
      console.error("Error loading posts:", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [ordering]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle refresh action
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData();
  }, [loadData]);

  // Handle like action
  const handleLike = useCallback((postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const isCurrentlyLiked = post.isLiked || false;
          return {
            ...post,
            likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !isCurrentlyLiked,
          };
        }
        return post;
      })
    );
  }, []);

  // Handle deepfake detection request
  const handleDeepfakeDetection = useCallback((postId: number) => {
    // Immediately set the post to pending state
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            deepfakeRequested: true,
            deepfakeResult: {
              confidence: 0,
              status: "pending",
            },
          };
        }
        return post;
      })
    );

    // Use a timeout to simulate processing
    setTimeout(() => {
      // Use a random confidence value for more realistic simulation
      const confidence = Math.random();

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              deepfakeResult: {
                confidence: confidence,
                status: "completed",
              },
            };
          }
          return post;
        })
      );
    }, 1500);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((newOrdering: string) => {
    setOrdering(newOrdering);
    setPosts((prevPosts) => sortPosts([...prevPosts], newOrdering));
  }, []);

  // Helper function to sort posts
  const sortPosts = (postsToSort: Post[], order: string): Post[] => {
    const sortedPosts = [...postsToSort];

    switch (order) {
      case "latest":
        // Simple simulation using the timestamp strings (in a real app, use actual dates)
        return sortedPosts.sort((a, b) =>
          a.timestamp.includes("minute")
            ? -1
            : b.timestamp.includes("minute")
            ? 1
            : a.timestamp.includes("hour") && !b.timestamp.includes("hour")
            ? 1
            : -1
        );
      case "oldest":
        // Reverse of latest
        return sortedPosts.sort((a, b) =>
          a.timestamp.includes("minute")
            ? 1
            : b.timestamp.includes("minute")
            ? -1
            : a.timestamp.includes("hour") && !b.timestamp.includes("hour")
            ? -1
            : 1
        );
      case "popular":
        // Sort by likes count
        return sortedPosts.sort((a, b) => b.likes - a.likes);
      default:
        return sortedPosts;
    }
  };

  return {
    posts,
    isLoading,
    isRefreshing,
    error,
    ordering,
    handleRefresh,
    handleLike,
    handleDeepfakeDetection,
    handleSortChange,
    loadData,
  };
}

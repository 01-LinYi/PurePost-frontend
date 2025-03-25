import axiosInstance from "@/utils/axiosInstance";

export const getApi = async (url: string) => {
  try {
    const response = await axiosInstance.get(url);
    return response;
  } catch (error: any) {
    return error.response;
  }
};

/**
 * Get the social stats of current user
 * @returns  JSON data = {
            'is_following': boolean,
            'follower_count': int,
            'following_count':int
        }
 */
export const fetchMySocialStat = async () => {
  return getApi(`/social/follow/status/`);
};

/**
 * Get the profile of current user
 * @returns data = {
            'username': string,
            'email': string,
            'avatar': string,
            'bio': string,
            'location': string,
            'website': string,
            'date_of_birth': string,
            'created_at': string,
            'updated_at': string,
            'is_active': boolean,
            'verified': boolean,
        }
 */
export const fetchMyProfile = async () => {
  return getApi(`/users/my-profile/`);
};

/**
 * Get the post counts of given user id
 * If user is current user, will return the post counts of all posts
 * If user is not current user, will return the post counts of public posts
 * @param user_id
 * @returns number of posts
 */
export const fetchPostCounts = async (user_id: number) => {
  //TODO: Implement this function
  return 0;
};

/**
 * Get the list of posts pinned by the current user
 * @returns a list of Post
 */
export const fetchPinnedPosts = async () => {
  //TODO: Implement this function
  return {};
};

export const followUser = async (user_id: number) => {
  //TODO: Implement this function
  return {};
};

export const unfollowUser = async (user_id: number) => {
  //TODO: Implement this function
  return {};
};

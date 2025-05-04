import { SavedFolder, ApiFolder } from "@/types/folderType";
import { formatDate } from "@/utils/dateUtils";
export const transformSavedFolder = (data: ApiFolder): SavedFolder => {
  return {
    id: data.id,
    name: data.name,
    user: data.user,
    createdAt: formatDate(data.created_at),
    updatedAt: formatDate(data.updated_at),
    postCount: data.post_count,
  };
};

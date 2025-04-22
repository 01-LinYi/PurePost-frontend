import { useState, useEffect, useCallback } from "react";
import { SavedFolder } from "@/types/folderType";
import {
  fetchSavedFolders,
  fetchSavedPosts,
  toggleSavePost,
  createFolder,
  renameFolder,
  deleteFolder,
} from "@/utils/api";
import {transformSavedFolder} from "@/utils/transformers/saveTransformers";
import {transformApiPostToPost} from "@/utils/transformers/postsTransformers";

export function useFolders(options?: { forceRefresh?: boolean }) {
  const [folders, setFolders] = useState<SavedFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFolders = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchSavedFolders(forceRefresh);
      const data = res.map((folder) =>
        transformSavedFolder(folder)
      );
      setFolders(data);
    } catch (e: any) {
      setError(e?.message || "Load failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFolders(options?.forceRefresh || false);
  }, [loadFolders, options?.forceRefresh]);

  const handleCreateFolder = useCallback(
    async (name: string) => {
      setIsCreating(true);
      setError(null);
      try {
        await createFolder(name);
        await loadFolders(true);
      } catch (e: any) {
        setError(e?.message || "Create failed");
        throw e;
      } finally {
        setIsCreating(false);
      }
    },
    [loadFolders]
  );

  const handleRenameFolder = useCallback(
    async (id: string, name: string) => {
      setIsRenaming(true);
      setError(null);
      try {
        await renameFolder(id, name);
        await loadFolders(true);
      } catch (e: any) {
        setError(e?.message || "Rename failed");
        throw e;
      } finally {
        setIsRenaming(false);
      }
    },
    [loadFolders]
  );

  const handleDeleteFolder = useCallback(
    async (id: string) => {
      setIsDeleting(true);
      setError(null);
      try {
        await deleteFolder(id);
        await loadFolders(true);
      } catch (e: any) {
        setError(e?.message || "delete failed");
        throw e;
      } finally {
        setIsDeleting(false);
      }
    },
    [loadFolders]
  );

  const handleSaveToFolder = useCallback(
    async (postId: string, folderId?: string) => {
      setIsRenaming(true);
      setError(null);
      try {
        await toggleSavePost(postId, folderId);
        await loadFolders(true);
      } catch (e: any) {
        setError(e?.message || "Save failed");
        throw e;
      } finally {
        setIsRenaming(false);
      }
    },
    [loadFolders]
  );

  const handleFolderDetails = useCallback(
    async (folderId: string, forceRefresh:boolean) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchSavedPosts(folderId, forceRefresh);
        const data = {
          posts: res.posts.map((postInfo) => transformApiPostToPost(postInfo.post)),
          folder: transformSavedFolder(res.folder),
        };
        return data;
      } catch (e: any) {
        setError(e?.message || "Load failed");
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refresh = useCallback(() => loadFolders(true), [loadFolders]);

  return {
    folders,
    isLoading,
    error,
    refresh,
    folderDetails: handleFolderDetails,
    toggleSaveFolder: handleSaveToFolder,
    createFolder: handleCreateFolder,
    isCreating,
    renameFolder: handleRenameFolder,
    isRenaming,
    deleteFolder: handleDeleteFolder,
    isDeleting,
  };
}

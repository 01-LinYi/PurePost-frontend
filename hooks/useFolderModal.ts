// hooks/useFolderModal.js
import { useState, useCallback } from "react";

/**
 * Handles the state and behavior of a folder selection modal.
 */
export default function useFolderModal() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // open modal with given post id
  const openModal = useCallback((id:string) => {
    setSelectedId(id);
    setErrorMsg(null);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedId(null);
    setErrorMsg(null);
  }, []);

  const selectFolder = useCallback((folderId: any) => {
    setSelectedId(folderId);
    setErrorMsg(null);
  }, []);

  const setError = useCallback((msg: string | null) => {
    setErrorMsg(msg);
  }, []);


  const setLoadingState = useCallback((state:boolean) => {
    setLoading(state);
  }, []);

  return {
    modalVisible,
    selectedId,
    errorMsg,
    loading,
    openModal,
    closeModal,
    selectFolder,
    setError,
    setLoading: setLoadingState,
  };
}

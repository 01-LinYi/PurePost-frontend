import React, { useState } from "react";
import {
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SavedFolder } from "@/types/folderType";
import { useFolders } from "@/hooks/useFolders";
import { Text, View } from "@/components/Themed";
import ActionButton from "@/components/ActionButton";

const SavedFolders = () => {
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<SavedFolder | null>(
    null
  );
  const [newFolderName, setNewFolderName] = useState("");
  const [createFolderName, setCreateFolderName] = useState("");

  const router = useRouter();

  const {
    folders,
    isLoading,
    error,
    refresh,
    createFolder,
    renameFolder,
    deleteFolder,
    isCreating,
    isRenaming,
    isDeleting,
  } = useFolders();

  const handleCreateFolder = () => {
    setCreateFolderName("New Folder");
    setCreateModalVisible(true);
  };
  const confirmCreateFolder = async () => {
    if (!createFolderName.trim()) return;
    try {
      await createFolder(createFolderName.trim());
      setCreateModalVisible(false);
      setCreateFolderName("");
      Alert.alert(
        "Success",
        `Folder "${createFolderName}" created successfully`
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to create folder: " +
          ((error as Error).message || "Unknown error")
      );
    }
  };

  const handleRenameFolder = (folder: SavedFolder) => {
    setSelectedFolder(folder);
    setNewFolderName(folder.name);
    setRenameModalVisible(true);
  };
  const confirmRename = async () => {
    if (!selectedFolder || !newFolderName.trim()) return;
    try {
      await renameFolder(selectedFolder.id, newFolderName.trim());
      setRenameModalVisible(false);
      setSelectedFolder(null);
      setNewFolderName("");
      Alert.alert("Success", "Folder renamed successfully");
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to rename folder: " +
          ((error as Error).message || "Unknown error")
      );
    }
  };

  const handleDeleteFolder = (folder: SavedFolder) => {
    setSelectedFolder(folder);
    setDeleteModalVisible(true);
  };
  const confirmDelete = async () => {
    if (!selectedFolder) return;
    try {
      await deleteFolder(selectedFolder.id);
      setDeleteModalVisible(false);
      setSelectedFolder(null);
      Alert.alert("Success", "Folder deleted successfully");
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to delete folder: " +
          ((error as Error).message || "Unknown error")
      );
    }
  };

  // 跳转到文件夹详情
  const handleFolderPress = (folderId: string) => {
    router.push(`/post/saved/${folderId}`);
  };

  const renderFolderItem = ({ item }: { item: SavedFolder }) => (
    <TouchableOpacity
      style={styles.folderItem}
      onPress={() => handleFolderPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.folderItemContent}>
        <Ionicons name="folder" size={24} color="#00c5e3" />
        <View style={styles.folderInfo}>
          <Text style={styles.folderName}>{item.name}</Text>
          <Text style={styles.folderCount}>{item.postCount} posts</Text>
        </View>
      </View>
      <View style={styles.folderActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRenameFolder(item)}
        >
          <Ionicons name="pencil" size={18} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteFolder(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00c5e3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#00c5e3" />
        </TouchableOpacity>
        <Text style={styles.title}>Saved Folders</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateFolder}
        >
          <Ionicons name="add" size={24} color="#00c5e3" />
          <Text style={styles.createButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <Text style={{ color: "red", alignSelf: "center", margin: 8 }}>
          {error}
        </Text>
      ) : null}

      {folders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={60} color="#aaa" />
          <Text style={styles.emptyText}>No saved folders yet</Text>
          <ActionButton
            text="Create your first folder"
            onPress={handleCreateFolder}
            style={styles.createFirstButton}
            textStyle={styles.createFirstButtonText}
          />
        </View>
      ) : (
        <FlatList
          data={folders}
          renderItem={renderFolderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.folderList}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refresh}
        />
      )}

      {/* Rename Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={renameModalVisible}
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Folder</Text>
            <TextInput
              style={styles.input}
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Enter new folder name"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRenameModalVisible(false)}
                disabled={isRenaming}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmRename}
                disabled={isRenaming}
              >
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Folder Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Folder</Text>
            <TextInput
              style={styles.input}
              value={createFolderName}
              onChangeText={setCreateFolderName}
              placeholder="Enter folder name"
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateModalVisible(false)}
                disabled={isCreating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmCreateFolder}
                disabled={isCreating}
              >
                <Text style={styles.confirmButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Folder Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Folder</Text>
            <Text style={styles.modalMessage}>
              All posts under this folder will be removed and cannot be
              undone.{'\n'}
              Are you sure you want to delete "{selectedFolder?.name}"? 
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDelete}
                disabled={isDeleting}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // ...你的原有styles可以直接复制
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
    flexDirection: "row",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f9fc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  createButtonText: {
    color: "#00c5e3",
    fontWeight: "600",
    marginLeft: 4,
  },
  folderList: {
    padding: 16,
  },
  folderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  folderItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "transparent",
  },
  folderInfo: {
    marginLeft: 12,
    backgroundColor: "transparent",
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  folderCount: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  folderActions: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    marginTop: 16,
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  createFirstButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: "100%",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#00c5e3",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default SavedFolders;

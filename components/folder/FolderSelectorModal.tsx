import React, { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SavedFolder } from "@/types/folderType";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  folders: SavedFolder[];
  onSelect: (folder: SavedFolder) => void;
  onCreate: (name: string) => Promise<void>;
  onClose: () => void;
  isCreating?: boolean;
  isCollecting?: boolean;
  error?: string | null;
};

export default function FolderSelectorModal({
  visible,
  folders,
  onSelect,
  onCreate,
  onClose,
  isCreating = false,
  isCollecting = false,
  error,
}: Props) {
  const [newName, setNewName] = useState("");
  const [inputErr, setInputErr] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setNewName("");
      setInputErr(null);
    }
  }, [visible, folders]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      setInputErr("Please enter a name");
      return;
    }
    setInputErr(null);
    try {
      await onCreate(name);
      setNewName(""); 
    } catch (e) {
      
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Saved to</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} />
            </TouchableOpacity>
          </View>

          {folders.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyTip}>
                No folders yet, create one to save 
              </Text>
              <TextInput
                placeholder="New folder"
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                editable={!isCreating}
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />
              {inputErr && <Text style={styles.errText}>{inputErr}</Text>}
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  (!newName.trim() || isCreating) && styles.disabledBtn,
                ]}
                onPress={handleCreate}
                disabled={!newName.trim() || isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmText}>
                    create and save
                  </Text>
                )}
              </TouchableOpacity>
              {error ? <Text style={styles.errText}>{error}</Text> : null}
            </View>
          ) : (
            <>
              <FlatList
                data={folders}
                keyExtractor={(f) => f.id}
                style={styles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.folderItem}
                    onPress={() => onSelect(item)}
                    disabled={isCollecting}
                  >
                    <Ionicons name="folder-outline" size={22} color="#00c5e3" />
                    <Text style={styles.folderName}>{item.name}</Text>
                    {isCollecting && (
                      <ActivityIndicator
                        size="small"
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyTip}>No Folder</Text>
                }
              />
              <View style={styles.divider} />
              <View style={styles.createBlock}>
                <TextInput
                  placeholder="New folder"
                  style={styles.input}
                  value={newName}
                  onChangeText={setNewName}
                  editable={!isCreating}
                  returnKeyType="done"
                  onSubmitEditing={handleCreate}
                />
                <TouchableOpacity
                  style={[
                    styles.createBtn,
                    (!newName.trim() || isCreating) && styles.disabledBtn,
                  ]}
                  onPress={handleCreate}
                  disabled={!newName.trim() || isCreating}
                >
                  {isCreating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.createText}>Create</Text>
                  )}
                </TouchableOpacity>
              </View>
              {inputErr && <Text style={styles.errText}>{inputErr}</Text>}
              {error ? <Text style={styles.errText}>{error}</Text> : null}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 14,
    minHeight: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 9,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e6eaee",
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    color: "#222",
    letterSpacing: 0.2,
  },
  list: {
    maxHeight: 210,
    marginBottom: 4,
  },
  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "#f7fafc",
  },
  folderName: {
    marginLeft: 13,
    fontSize: 16,
    color: "#222",
    flex: 1,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e6eaee",
    marginVertical: 10,
    borderRadius: 1,
  },
  createBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 2,
    minHeight: 44,
    width: "100%",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4ecf5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 11 : 8,
    fontSize: 16,
    backgroundColor: "#f7fbfd",
    color: "#222",
    fontWeight: "500",
    marginRight: 0,
  },
  confirmBtn: {
    marginTop: 16,
    backgroundColor: "#00c5e3",
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
    width: "100%",
    minHeight: 46,
    justifyContent: "center",
    shadowColor: "#00c5e3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 2,
  },
  confirmText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  createBtn: {
    backgroundColor: "#00b2d6",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    minWidth: 82,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00c5e3",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  createText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  disabledBtn: {
    opacity: 0.48,
  },
  emptyBlock: {
    marginTop: 38,
    alignItems: "center",
    width: "100%",
  },
  emptyTip: {
    fontSize: 15,
    color: "#9ab0bc",
    marginBottom: 18,
    letterSpacing: 0.1,
    textAlign: "center",
    width: "100%",
  },
  errText: {
    color: "#e55",
    marginTop: 7,
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
    minHeight: 18,
  },
});

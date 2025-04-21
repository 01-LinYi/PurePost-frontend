import React, { useState, useEffect } from "react";
import {
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { ReportTargetType, ReasonItem } from "@/types/reportType";
import { DEFAULT_REASONS_MAP } from "@/constants/DefaultReport";

export type ReportModalProps = {
  visible: boolean;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (params: { reason: string; extraInfo?: string }) => void;
  targetType?: ReportTargetType;
};

/**
 * The Backend API expects the following reasons:
 * Currently, the backend API only accepts reports for posts.
 *      ('inappropriate', 'Inappropriate Content'),
        ('deepfake', 'Deepfake Content'),
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('misinformation', 'Misinformation'),
        ('copyright', 'Copyright Violation'),
        ('other', 'Other'),
 */

/**
 * A generic report modal for posts, comments, or users.
 */
export default function ReportModal({
  visible,
  loading,
  error,
  onClose,
  onSubmit,
  targetType = "post",
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReasonItem | null>(null);
  const [customReason, setCustomReason] = useState<string>("");

  const reasonList: ReasonItem[] = DEFAULT_REASONS_MAP[targetType];

  // Reset state when modal is closed
  useEffect(() => {
    if (!visible) {
      setSelectedReason(null);
      setCustomReason("");
    }
  }, [visible]);

  /**
   * Confirm submission.
   */
  const handleConfirm = () => {
    if (!selectedReason) return;
    const apiReason = selectedReason.key; // This will be sent to Django backend!
    const extraInfo = apiReason === "other" ? customReason : undefined;
    onSubmit({ reason: apiReason, extraInfo });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Report</Text>
          <Text style={styles.subtitle}>Please select a reason:</Text>
          {reasonList.map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => setSelectedReason(item)}
              style={[
                styles.reasonButton,
                selectedReason === item && styles.selectedReasonButton,
              ]}
            >
              <Text
                style={
                  selectedReason === item
                    ? styles.selectedReasonText
                    : styles.reasonText
                }
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
          {selectedReason?.key === "Other" && (
            <TextInput
              style={styles.input}
              placeholder="Please enter your reason"
              value={customReason}
              onChangeText={setCustomReason}
              multiline
            />
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.submitBtn,
                { opacity: loading ? 0.5 : 1 },
              ]}
              onPress={handleConfirm}
              disabled={
                loading ||
                !selectedReason ||
                (selectedReason.label === "Other" && !customReason.trim())
              }
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.btnText, { color: "#fff" }]}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 10 },
  reasonButton: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
    marginTop: 4,
  },
  selectedReasonButton: {
    backgroundColor: "#00c5e3",
    borderColor: "#00c5e3",
  },
  reasonText: { color: "#222" },
  selectedReasonText: { color: "#fff", fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 6,
    minHeight: 40,
    padding: 8,
    marginTop: 6,
  },
  error: { color: "#e00", fontSize: 13, marginTop: 5 },
  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 20 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 6 },
  submitBtn: { backgroundColor: "#00c5e3", marginLeft: 10 },
  btnText: { fontSize: 15 },
});

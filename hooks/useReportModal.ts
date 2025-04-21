import { useState, useCallback } from "react";
import useReport from "@/hooks/useReport";
import { ReportTarget, ReportTargetType } from "@/types/reportType";

/**
 * Custom hook for managing report modal UI state and report submission.
 */
export default function useReportModal() {
  const [modalVisible, setModalVisible] = useState(false);
  const [target, setTarget] = useState<ReportTarget | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { submitReport } = useReport();

  /**
   * Open modal for a given target id and type.
   */
  const openModal = useCallback(
    (id: string, type: ReportTargetType = "post") => {
      setTarget({ id, type });
      setErrorMsg(null);
      setModalVisible(true);
    },
    []
  );

  /**
   * Close modal and reset state.
   */
  const closeModal = useCallback(() => {
    setModalVisible(false);
    setTarget(null);
    setErrorMsg(null);
  }, []);

  /**
   * Submit a report with reason and optional extra info.
   */
  const report = useCallback(
    async (reason: string, extraInfo?: string) => {
      if (!target) return;
      setLoading(true);
      setErrorMsg(null);
      try {
        await submitReport(target.id, reason, target.type, extraInfo);
        closeModal();
      } catch (e) {
        setErrorMsg("Report failed, please try again.");
      }
      setLoading(false);
    },
    [target, submitReport, closeModal]
  );

  return {
    modalVisible,
    target,
    loading,
    errorMsg,
    openModal, // openModal(id, type)
    closeModal,
    report, // report(reason, extraInfo?)
  };
}

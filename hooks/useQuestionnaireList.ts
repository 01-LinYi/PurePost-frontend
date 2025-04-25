import { useEffect, useState, useCallback } from "react";
import { getAnswers } from "@/utils/api";
import { FormAnswer } from "@/types/feedbackType";
import { loadFormList } from "@/utils/formLoader";
import { transformFeedback } from "@/utils/transformers/feedbackTransformer";

export type Sheets = {
  formName: string;
  title: string;
};
export const useQuestionnaireList = () => {
  const [forms, setForms] = useState<Sheets[]>([]);
  const [answers, setAnswers] = useState<FormAnswer[]>([]);
  const [isFinishedMap, setIsFinishedMap] = useState<Record<string, boolean>>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const loadList = useCallback(async (forceRefresh: boolean = false) => {
    setLoading(true);
    try {
      // Step 1: load the form list
      const formList = await loadFormList();
      console.log("loadFormList", formList);

      // Step 2: load user's answers
      const data = await getAnswers(forceRefresh);

      setForms(formList);
      setAnswers(data);

      // Optional: build status map if needed
      const statusMap: Record<string, boolean> = {};
      data.forEach((a) => {
        statusMap[a.formName] = a.isFinished;
      });
      setIsFinishedMap(statusMap);
    } catch (error) {
      console.error("Failed to load questionnaire list", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  return {
    answers,
    forms,
    isFinishedMap,
    loading,
    refresh: () => loadList(true),
  };
};

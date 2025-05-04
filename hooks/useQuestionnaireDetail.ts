import { useState, useEffect } from "react";
import { loadForm } from "@/utils/formLoader";
import { getSingleAnswer } from "@/utils/api";
import { FormData, FormAnswer } from "@/types/feedbackType";

export const useQuestionnaireDetail = (formName: string | null) => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!formName) return;
      setIsLoading(true);
      try {
        const form = await loadForm(formName);
        setFormData(form ?? null);
      } catch (error) {
        console.error("Error loading form:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [formName]);

  return { formData, isLoading };
};

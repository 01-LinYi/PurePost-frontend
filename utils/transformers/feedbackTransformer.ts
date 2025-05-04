import { FormAnswer, apiFeedback } from "@/types/feedbackType";

/**
 * Transform the API response to the FormAnswer type
 * @param data
 * @returns
 */
export const transformFeedback = (data: apiFeedback): FormAnswer => {
  if (!data) {
    return {} as FormAnswer;
  }
  return {
    answerId: data.id.toString(),
    formName: data.feedback_type,
    content: data.content,
    isFinished: data.is_finished,
    updatedAt: data.updated_at,
  };
}
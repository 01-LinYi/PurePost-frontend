import { User } from "@/types/postType";

export interface FormData {
  title: string;
  questions: Question[];
}

export interface Question {
  id: string;
  label: string;
  type: "single_choice";
  options: string[];
}

export interface Answer {
  questionId: string;
  answer: string;
}

export interface FormAnswer {
  answerId: string;
  formName: string;
  content: Answer[];
  isFinished: boolean;
  updatedAt: string;
}

export interface apiFeedback {
  id: number;
  user: User;
  feedback_type: string;
  content: Answer[];
  is_finished: boolean;
  created_at: string;
  updated_at: string;
}

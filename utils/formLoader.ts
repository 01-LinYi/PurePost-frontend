import { FormData } from "@/types/feedbackType";
import formsData from "@/assets/surveys/forms.json";

export const loadForm = async (formName: string): Promise<FormData | undefined> => {
  const data = formsData[formName as keyof typeof formsData];
  if (!data) {
    console.error(`Form ${formName} not found`);
    return undefined;
  }
  const formData: FormData = {
    title: data.title,
    questions: data.questions.map((question) => ({
      id: question.id,
      label: question.label,
      options: question.options,
      type: "single_choice",
    })),
  };
  return formData;
};

export const loadFormList = async (): Promise<any> => {
  const data = formsData;
  const formNames:string[] = Object.keys(data);
  const formList = formNames.map((formName :string) => {
    return {
      formName: formName,
      title: data[formName as keyof typeof data].title,
    };
  });
  return formList;
};

import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { QuestionnaireDetail } from "@/components/feedback/QuestionnaireDetail";
import { useQuestionnaireDetail } from "@/hooks/useQuestionnaireDetail";
import { Text } from "@/components/Themed";
import { useMemo } from "react";

export default function MCQsScreen() {
  const params = useLocalSearchParams<{ formName: string }>();

  const formName = useMemo(() => {
    return typeof params.formName === "string" ? params.formName : null;
  }, [params.formName]);

  if (!formName) {
    return <Text>Invalid form name</Text>;
  }

  const { formData, isLoading } = useQuestionnaireDetail(formName);


  if (isLoading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {formData && (
        <QuestionnaireDetail
          formName={formName}
          formData={formData}
          isLoading={isLoading}
        />
      )}
    </SafeAreaView>
  );
}

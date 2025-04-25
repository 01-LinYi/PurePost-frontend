
import { QuestionnaireList } from "@/components/feedback/QuestionnaireList";
import { View } from "@/components/Themed";
import { useQuestionnaireList } from "@/hooks/useQuestionnaireList";

export default function FeedbackScreen() {
  const { forms, isFinishedMap, refresh } = useQuestionnaireList();
  return (
    <View style={{ flex: 1 }}>
      <QuestionnaireList
        forms={forms}
        isFinishedMap={isFinishedMap}
        refresh={refresh}
      />
    </View>
  );
}

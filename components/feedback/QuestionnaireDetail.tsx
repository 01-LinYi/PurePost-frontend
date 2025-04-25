import { useState, useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { Answer, FormData, FormAnswer } from "@/types/feedbackType";
import { useRouter } from "expo-router";
import { submitAnswer } from "@/utils/api";

// Custom RadioButton component with improved styling
const RadioButton = ({
  isSelected,
  onPress,
}: {
  isSelected: boolean;
  onPress: () => void;
}) => (
  <View
    style={[
      styles.radioButton,
      { backgroundColor: isSelected ? "#007AFF" : "transparent" },
    ]}
  >
    <TouchableOpacity onPress={onPress} style={styles.radioButtonTouchArea} />
  </View>
);

// Question Component with improved layout and spacing
const Question = ({
  question,
  selectedAnswer,
  onSelectAnswer,
}: {
  question: { id: string; label: string; options: string[] };
  selectedAnswer: string;
  onSelectAnswer: (answer: string) => void;
}) => (
  <View style={styles.questionContainer}>
    <Text style={styles.questionLabel}>{question.label}</Text>
    {question.options.map((option) => (
      <TouchableOpacity
        key={option}
        onPress={() => onSelectAnswer(option)}
        style={styles.optionContainer}
      >
        <RadioButton
          isSelected={selectedAnswer === option}
          onPress={() => onSelectAnswer(option)}
        />
        <Text style={styles.optionText}>{option}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export const QuestionnaireDetail = ({
  formName,
  formData,
  isLoading,
}: {
  formName: string;
  formData: FormData;
  isLoading: boolean;
}) => {
  const [newAnswer, setNewAnswer] = useState<Answer[]>([]);
  const router = useRouter();

  // Initialize the answers if no answers exist
  useEffect(() => {
    if (formData && newAnswer.length === 0) {
      const initialAnswers = formData.questions.map((q) => ({
        questionId: q.id,
        answer: "",
      }));
      setNewAnswer(initialAnswers);
    }
  }, [formData]);

  if (isLoading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  const getAnswerFor = (questionId: string): string => {
    return newAnswer.find((a) => a.questionId === questionId)?.answer || "";
  };

  const setAnswerFor = (questionId: string, selected: string) => {
    const updatedAnswers = newAnswer.map((a) =>
      a.questionId === questionId ? { ...a, answer: selected } : a
    );
    setNewAnswer(updatedAnswers);
  };

  const handleDirectSubmit = async () => {
    Alert.alert("Submit", "Do you want to submit your answers?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Submit",
        onPress: async () => {
          try {
            if (newAnswer.some((ans) => ans.answer === "")) {
              Alert.alert("Error", "Please answer all questions.");
              return;
            }

            const payload: FormAnswer = {
              answerId: "",
              formName: formName,
              content: newAnswer,
              isFinished: true,
              updatedAt: "",
            };
            await submitAnswer(formName, payload, true);
            Alert.alert("Submitted", "Your answers have been submitted.");
            router.back();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Submission failed.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{formData.title}</Text>
      {formData.questions.map((q) => {
        const selectedAnswer = getAnswerFor(q.id);
        return (
          <Question
            key={q.id}
            question={q}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={(answer) => setAnswerFor(q.id, answer)}
          />
        );
      })}
      <View style={styles.buttonContainer}>
        <Button
          title="Submit"
          onPress={handleDirectSubmit}
          color="#007AFF" // Highlighting the button with a distinct color
        />
      </View>
    </ScrollView>
  );
};

// Styles with improved UI elements and layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8", // Light background for a clean feel
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: "bold",
    color: "#007AFF", // Main color accent for title
  },
  questionContainer: {
    marginBottom: 20,
    backgroundColor: "#fff", // White background for each question block
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // Shadow effect for Android
  },
  questionLabel: {
    fontSize: 18,
    marginBottom: 8,
    color: "#333", // Slightly darker gray for readability
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12, // Increased padding for better spacing
  },
  optionText: {
    fontSize: 16,
    color: "#333", // Gray text for the options
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#007AFF", // Color for the radio button border
    marginRight: 12, // More space between button and option text
  },
  radioButtonTouchArea: {
    flex: 1,
  },
  buttonContainer: {
    marginVertical: 24, // Increased vertical margin to separate from content
  },
  buttonSubmit: {
    backgroundColor: "#007AFF", // Submit button color
    paddingVertical: 10,
    borderRadius: 5,
  },
});

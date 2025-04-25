import { Redirect, Stack, useRouter } from 'expo-router';
import CompactHeader from '@/components/CompactHeader';

export default function FeedbackLayout() {
    const router = useRouter();

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                  backgroundColor: "#fff",
                },
                header: ({ options }) => (
                  <CompactHeader
                  title={options.title || ""}
                  onBack={() => router.back()}
                />
                ),
                headerTintColor: 'white',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: "Feedback List",
                }}
            />
            <Stack.Screen
                name="[formName]"
                options={{
                    title: "Questionnaire",
                }}
            />
        </Stack>
    );
}

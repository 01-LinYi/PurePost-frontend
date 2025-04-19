import { Redirect, Stack, useRouter } from 'expo-router';
import { useSession } from '@/components/SessionProvider';
import CompactHeader from '@/components/CompactHeader';

export default function AdminLayout() {
    const { user } = useSession();
    const isAdmin = true; // Replace with actual admin check logic
    const router = useRouter();

    if (!user || !isAdmin) {
        return <Redirect href="/" />;
    }

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
                    title: "Admin Dashboard",
                }}
            />
            
            <Stack.Screen
                name="content/index"
                options={{
                    title: "Content Management",
                }}
            />

            <Stack.Screen
                name="report/index"
                options={{
                    title: "Reports",
                }}
            />
        </Stack>
    );
}

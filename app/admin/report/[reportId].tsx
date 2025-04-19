import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Button } from 'react-native';

const ReportDetail: React.FC = () => {
    const router = useRouter();
    const { reportId } = useLocalSearchParams<{ reportId: string }>();

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Report Detail Screen</Text>
            <Text>Report ID: {reportId}</Text>
            <Button title="Go Back" onPress={() => router.back()} />
        </View>
    );
};

export default ReportDetail;
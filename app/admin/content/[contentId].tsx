import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Button } from 'react-native';

// This file is used to display the details of a post, but with editng capabilities.
// It is used for the admin to edit the post details.
// It can be merged with the post detail screen if needed.
const AdminContentDetail: React.FC = () => {
    const router = useRouter();
    const { contentId } = useLocalSearchParams<{ contentId: string }>();

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Admin: Contetnt Detail Screen</Text>
            <Text>Post Id: {contentId}</Text>
            <Button title="Go Back" onPress={() => router.back()} />
        </View>
    );
};

export default AdminContentDetail;
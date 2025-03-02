import React, { useState } from 'react';
import {View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Alert} from 'react-native';
import Video from 'react-native-video';
import { launchImageLibrary } from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';

const Posting = () => {

    const [postText, setPostText] = useState('');
    const [media, setMedia] = useState(null);

    
    /*const pickMedia = () => {
        launchImageLibrary({ mediaType: 'mixed' }, (response) => {
            if (response.didCancel)
                console.log('User cancelled Media picker');
            else
            { 
                if (response.errorCode)
                    console.log('Media Picker Error:', response.errorCode);
                else 
                {
                    const asset = response.assets[0];
                    setMedia({ uri: asset.uri, type: asset.type });
                }
            }
        });
    };*/

    const pickMedia = async () => {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted')
        {
            Alert.alert('Permission Denied', 'Please allow access to media files in settings.');
            return;
        }

        // Open media picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All, // Support both images and videos
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled)
        {
            const asset = result.assets[0]; // Get the selected file
            setMedia({ uri: asset.uri, type: asset.type });
        }
    };


    
    const handlePost = () => {
        if (!postText.trim())
        {
            Alert.alert('Error', 'Please write something before posting.');
            return;
        }
        Alert.alert('Success', 'Your post has been submitted!');
        setPostText('');
        setMedia(null);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Create a Post</Text>

            {/* Text Input */}
            <TextInput
                style={styles.textInput}
                placeholder="What's on your mind?"
                placeholderTextColor="#888"
                multiline
                value={postText}
                onChangeText={setPostText}
            />

            {/* Media Preview (Image or Video) */}
            {media && media.type.startsWith('image') && (
                <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
            )}
            {media && media.type.startsWith('video') && (
                <Video
                    source={{ uri: media.uri }}
                    style={styles.mediaPreview}
                    controls
                    resizeMode="contain"
                />
            )}

            {/* Media Upload Button */}
            <TouchableOpacity style={styles.uploadButton} onPress={pickMedia}>
                <Text style={styles.uploadText}>Add Image/Video</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.postButton} onPress={handlePost}>
                <Text style={styles.postText}>Post</Text>
            </TouchableOpacity>
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#00c5e3',
        marginBottom: 20,
        marginTop: 100,
    },
    textInput: {
        width: '100%',
        height: 120,
        borderWidth: 1,
        borderColor: '#00c5e3',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        textAlignVertical: 'top',
    },
    mediaPreview: {
        width: '100%',
        aspectRatio: undefined,
        resizeMode: 'contain',
        borderRadius: 10,
        marginTop: 10,
    },
    uploadButton: {
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    uploadText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    postButton: {
        backgroundColor: '#00c5e3',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 20,
    },
    postText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default Posting;
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { userService, imageService } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { Colors } from '@/constants/Colors';
import { Camera, Image as ImageIcon, User, X } from 'lucide-react-native';
import { router } from 'expo-router';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [picture, setPicture] = useState<string | null>(user?.picture || null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async (fromCamera = false) => {
    let permissionResult;
    if (fromCamera) {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission required', 'Camera permission is required.');
        return;
      }
    } else {
      permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission required', 'Gallery permission is required.');
        return;
      }
    }
    let result: ImagePicker.ImagePickerResult;
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
    }
    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', {
        uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any);
      const response = await imageService.upload(formData);
      setPicture(response.data.data.secure_url);
    } catch (e) {
      Alert.alert('Upload failed', 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.updateProfile({ name, email, picture });
      updateUser({ name, email, picture });
      Toast.show({
        type: 'success',
        text1: 'Profile updated!',
        text2: 'Successfull to update profile',
      });
      router.back();
    } catch (e) {
      Alert.alert('Update failed', 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.communication}>Let's update your profile for a better experience!</Text>
        <View style={styles.avatarContainer}>
          {picture ? (
            <Image
              source={{
                uri: picture,
              }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatar}>
              <User size={40} color={Colors.primary} />
            </View>
          )}
          <View style={styles.avatarActions}>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => pickImage(false)}
            >
              <ImageIcon size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => pickImage(true)}
            >
              <Camera size={20} color={Colors.primary} />
            </TouchableOpacity>
            {picture && (
              <TouchableOpacity
                style={styles.avatarButton}
                onPress={() => setPicture(null)}
              >
                <X size={20} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>
          {uploading && (
            <ActivityIndicator
              style={{ marginTop: 8 }}
              color={Colors.primary}
            />
          )}
        </View>
        <View style={styles.containerForm}>
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            autoCapitalize="words"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <Button
          title={saving ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          disabled={saving}
          style={{ marginTop: 24, marginBottom: 24 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 24,
    backgroundColor: Colors.background,
    flexGrow: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  communication: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  containerForm: {
    flexDirection: 'column',
    width: '100%',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
});

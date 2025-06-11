import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { userService } from '@/services/api';
import Toast from 'react-native-toast-message';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { AxiosError } from 'axios';

export default function EditPasswordScreen() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }
    setSaving(true);
    try {
      await userService.changePassword({ oldPassword, newPassword });
      Toast.show({
        type: 'success',
        text1: 'Password updated!',
        text2: 'Your password has been changed successfully.',
      });
      router.back();
    } catch (e) {
      if (e instanceof AxiosError) {
        Alert.alert(
          'Update failed',
          e.response?.data.message || 'Could not update password.'
        );
      } else {
        Alert.alert('Update failed', 'Could not update password.');
      }
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
        <Text style={styles.title}>Edit Password</Text>
        <Text style={styles.communication}>
          Let's keep your account secure by updating your password!
        </Text>
        <View style={styles.containerForm}>
          <Input
            label="Old Password"
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Enter your old password"
            secureTextEntry
            autoCapitalize="none"
          />
          <Input
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter your new password"
            secureTextEntry
            autoCapitalize="none"
          />
          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your new password"
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
        <Button
          title={saving ? 'Saving...' : 'Save Password'}
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
  containerForm: {
    flexDirection: 'column',
    width: '100%',
  },
});

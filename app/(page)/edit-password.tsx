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
      Alert.alert('Kesalahan', 'Harap isi semua kolom');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(
        'Kesalahan',
        'Password baru dan konfirmasi password tidak cocok'
      );
      return;
    }
    setSaving(true);
    try {
      await userService.changePassword({ oldPassword, newPassword });
      Toast.show({
        type: 'success',
        text1: 'Password berhasil diperbarui!',
        text2: 'Password kamu berhasil diubah.',
      });
      router.back();
    } catch (e) {
      if (e instanceof AxiosError) {
        Alert.alert(
          'Gagal memperbarui',
          e.response?.data.message || 'Tidak dapat memperbarui password.'
        );
      } else {
        Alert.alert('Gagal memperbarui', 'Tidak dapat memperbarui password.');
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
          Yuk jaga keamanan akun kamu dengan memperbarui password!
        </Text>
        <View style={styles.containerForm}>
          <Input
            label="Password Lama"
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Masukkan password lama"
            secureTextEntry
            autoCapitalize="none"
          />
          <Input
            label="Password Baru"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Masukkan password baru"
            secureTextEntry
            autoCapitalize="none"
          />
          <Input
            label="Konfirmasi Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Konfirmasi password baru"
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
        <Button
          title={saving ? 'Menyimpan...' : 'Simpan Password'}
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

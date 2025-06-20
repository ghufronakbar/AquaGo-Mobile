import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Colors } from '@/constants/Colors';
import { Droplets } from 'lucide-react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Kesalahan', 'Harap isi semua field');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Kesalahan', 'Konfirmasi password tidak sesuai');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Kesalahan', 'Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
    } catch (error: any) {
      Alert.alert('Registrasi Gagal', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Droplets size={48} color="white" />
              </View>
              <Text style={styles.title}>Gabung AquaGo</Text>
              <Text style={styles.subtitle}>Buat akun Anda</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.form}>
                <Text style={styles.formTitle}>Mulai Sekarang</Text>
                <Text style={styles.formSubtitle}>
                  Isi data diri Anda untuk membuat akun
                </Text>

                <Input
                  label="Nama Lengkap"
                  value={name}
                  onChangeText={setName}
                  placeholder="Masukkan nama lengkap"
                  autoCapitalize="words"
                />

                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Masukkan email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Input
                  label="Kata Sandi"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Masukkan kata sandi"
                  secureTextEntry
                />

                <Input
                  label="Konfirmasi Kata Sandi"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Konfirmasi kata sandi"
                  secureTextEntry
                />

                <Button
                  title="Buat Akun"
                  onPress={handleRegister}
                  loading={loading}
                  style={styles.registerButton}
                />

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Sudah punya akun? </Text>
                  <Pressable
                    onPress={() => router.replace('/login')}
                    style={{}}
                  >
                    <Text style={styles.linkText}>Masuk</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    minHeight: 250,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
  },
  formContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    minHeight: 500,
  },
  form: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  formSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
    fontFamily: 'Inter-Regular',
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  link: {
    textDecorationLine: 'none',
  },
  linkText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});

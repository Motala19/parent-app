import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { colors, gradients, shadow } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Login() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();

  // useState: values that change on screen. Calling the setter redraws the screen.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled"
          contentContainerStyle={[s.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>

          <View style={s.logo}>
            <LinearGradient colors={gradients.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.logoBox}>
              <Ionicons name="chatbubble-ellipses" size={34} color="#fff" />
            </LinearGradient>
            <Text style={s.brand}>School App</Text>
            <Text style={s.tagline}>Announcements, homework and messages from your child's school.</Text>
          </View>

          <View style={s.card}>
            <Text style={s.label}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} style={s.input} placeholder="you@example.com"
              placeholderTextColor={colors.muted} autoCapitalize="none" autoCorrect={false}
              keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />

            <Text style={[s.label, { marginTop: 16 }]}>Password</Text>
            <View>
              <TextInput value={password} onChangeText={setPassword} style={[s.input, { paddingRight: 48 }]}
                placeholder="Your password" placeholderTextColor={colors.muted} secureTextEntry={!show}
                autoCapitalize="none" autoComplete="password" textContentType="password" onSubmitEditing={submit} />
              <Pressable onPress={() => setShow(!show)} hitSlop={10} style={s.eye}>
                <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.muted} />
              </Pressable>
            </View>

            {error ? <Text style={s.error}>{error}</Text> : null}

            <Button title="Log in" onPress={submit} loading={busy} style={{ marginTop: 20 }} />

            <Text style={s.help}>First time? Use the invitation email from your school to choose a password, then log in here.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 22 },
  logo: { alignItems: 'center', marginBottom: 28 },
  logoBox: { height: 72, width: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  brand: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 6, lineHeight: 20, maxWidth: 300 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 22, ...shadow },
  label: { color: colors.inkSoft, fontWeight: '700', fontSize: 13, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.navy200, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: colors.ink, backgroundColor: '#fbfcff' },
  eye: { position: 'absolute', right: 14, top: 13 },
  error: { color: colors.rose, marginTop: 14, fontWeight: '600', lineHeight: 20 },
  help: { color: colors.muted, textAlign: 'center', fontSize: 12, marginTop: 16, lineHeight: 18 },
});
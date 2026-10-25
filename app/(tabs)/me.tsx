import { Avatar, Button, Card, Hero, Loading } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { gradeLabel } from '@/lib/format';
import { colors } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Me() {
  const router = useRouter();
  const { home, signOut } = useAuth();

  if (!home) return <Loading />;

  function confirmLogout() {
    Alert.alert('Log out', 'Do you want to log out of the app?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.navy50 }}>
      <Hero title="Me" subtitle="Your account and settings." />

      <ScrollView contentContainerStyle={s.content}>
        <Card style={s.row}>
          <Avatar name={home.user.name} size={64} />
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{home.user.name}</Text>
            <Text style={s.muted}>{home.user.email ?? 'No email on file'}</Text>
            <Text style={s.muted}>{home.user.phone ?? 'No phone number on file'}</Text>
          </View>
        </Card>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Text style={[s.section, { padding: 16, paddingBottom: 8 }]}>My children</Text>
          {home.children.map((c) => (
            <View key={c.id} style={[s.row, s.line]}>
              <Avatar name={c.name} size={40} />
              <View>
                <Text style={s.childName}>{c.name}</Text>
                <Text style={s.muted}>{c.class ?? 'Not in a class yet'}{c.grade ? ` · ${gradeLabel(c.grade)}` : ''}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Pressable style={[s.row, s.link]} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.navy600} />
            <Text style={s.linkText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </Card>

        <Text style={s.note}>To change your name, phone number or email, please contact your school.</Text>

        <Button variant="ghost" title="Log out" icon="log-out-outline" onPress={confirmLogout} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  line: { paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.navy100 },
  name: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  childName: { color: colors.ink, fontWeight: '700', fontSize: 15 },
  muted: { color: colors.muted, marginTop: 1 },
  section: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  link: { padding: 16 },
  linkText: { flex: 1, color: colors.ink, fontWeight: '700', fontSize: 16 },
  note: { color: colors.muted, textAlign: 'center', fontSize: 12 },
});
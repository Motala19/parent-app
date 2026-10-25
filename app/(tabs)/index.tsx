import { AnnouncementCard } from '@/components/AnnouncementCard';
import { Avatar, Badge, Button, Card, Empty, ErrorBox, Hero, Loading } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { gradeLabel } from '@/lib/format';
import { colors } from '@/lib/theme';
import type { Person } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Home() {
  const router = useRouter();
  const { home, error, refresh } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Runs every time this tab comes into view
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  async function pull() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  const chat = (p: Person) => router.push({ pathname: '/chat/[id]', params: { id: String(p.id) } });

  if (!home) return error ? <ErrorBox message={error} onRetry={refresh} /> : <Loading />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.navy50 }}>
      <Hero
        title={`${greeting()}, ${home.user.name.split(' ')[0]}`}
        subtitle="Here's what's happening at school."
        right={
          <Pressable onPress={() => router.push('/notifications')} hitSlop={10} style={s.bell}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {home.unread.notifications > 0 ? (
              <View style={s.bellBadge}><Badge count={home.unread.notifications} /></View>
            ) : null}
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={pull} tintColor={colors.rose} colors={[colors.rose]} />}>

        <Text style={s.section}>My children</Text>

        {home.children.length === 0 ? (
          <Card><Empty icon="people-outline" title="No children linked yet" text="Please contact your school so they can link your children to your account." /></Card>
        ) : null}

        {home.children.map((c) => (
          <Card key={c.id} style={{ gap: 12 }}>
            <View style={s.row}>
              <Avatar name={c.name} size={52} />
              <View style={{ flex: 1 }}>
                <Text style={s.childName}>{c.name}</Text>
                <Text style={s.muted}>{c.class ?? 'Not in a class yet'}{c.grade ? ` · ${gradeLabel(c.grade)}` : ''}</Text>
              </View>
            </View>

            {c.class_teacher ? (
              <View style={s.teacherBox}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>CLASS TEACHER</Text>
                  <Text style={s.value}>{c.class_teacher.name}</Text>
                </View>
                {c.class_teacher.can_message ? (
                  <Button small title="Message" icon="chatbubble-ellipses" onPress={() => chat(c.class_teacher!)} />
                ) : null}
              </View>
            ) : null}

            {c.subjects.length > 0 ? (
              <View>
                <Text style={[s.label, { marginBottom: 4 }]}>SUBJECTS AND TEACHERS</Text>
                {c.subjects.map((sub) => (
                  <View key={sub.id} style={s.subRow}>
                    <Text style={s.subName}>{sub.name}</Text>
                    <Text style={s.subTeacher} numberOfLines={1}>{sub.teacher?.name ?? 'No teacher yet'}</Text>
                    {sub.teacher?.can_message ? (
                      <Pressable onPress={() => chat(sub.teacher!)} hitSlop={8} style={s.iconBtn}>
                        <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.navy600} />
                      </Pressable>
                    ) : <View style={{ width: 34 }} />}
                  </View>
                ))}
              </View>
            ) : null}
          </Card>
        ))}

        {home.announcements.length > 0 ? (
          <>
            <View style={[s.row, { justifyContent: 'space-between', marginTop: 8 }]}>
              <Text style={s.section}>Latest notices</Text>
              <Pressable onPress={() => router.push('/notices')} hitSlop={8}><Text style={s.link}>View all</Text></Pressable>
            </View>
            {home.announcements.map((a) => <AnnouncementCard key={a.id} a={a} compact />)}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  section: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  childName: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  muted: { color: colors.muted, marginTop: 2 },
  teacherBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, backgroundColor: colors.navy50 },
  label: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  value: { color: colors.ink, fontWeight: '700', fontSize: 15, marginTop: 2 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.navy100 },
  subName: { flex: 1, color: colors.ink, fontWeight: '700' },
  subTeacher: { flex: 1, color: colors.muted, textAlign: 'right' },
  iconBtn: { height: 34, width: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy50 },
  bell: { height: 42, width: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)' },
  bellBadge: { position: 'absolute', top: -4, right: -4 },
  link: { color: colors.rose, fontWeight: '700' },
});
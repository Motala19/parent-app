import { Empty, Hero, Loading } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { timeAgo } from '@/lib/format';
import { colors } from '@/lib/theme';
import type { Notice } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  chat: 'chatbubble-ellipses', file: 'document-text', bell: 'alert-circle', megaphone: 'megaphone',
};

export default function Notifications() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [items, setItems] = useState<Notice[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems((await api<{ data: Notice[] }>('/notifications')).data);
    } catch {
      setItems((i) => i ?? []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function open(n: Notice) {
    await api(`/notifications/${n.id}/read`, { method: 'POST' }).catch(() => {});
    refresh();

    if (n.kind === 'message' && n.sender_id) {
      router.push({ pathname: '/chat/[id]', params: { id: String(n.sender_id) } });
    } else {
      router.push('/notices');
    }
  }

  async function readAll() {
    await api('/notifications/read-all', { method: 'POST' }).catch(() => {});
    refresh();
    load();
  }

  if (items === null) return <Loading />;

  const hasUnread = items.some((n) => !n.read);

  return (
    <View style={{ flex: 1, backgroundColor: colors.navy50 }}>
      <Hero back title="Notifications" subtitle="New messages and announcements."
        right={hasUnread ? (
          <Pressable onPress={readAll} hitSlop={10} style={s.readAll}>
            <Ionicons name="checkmark-done" size={16} color="#fff" />
            <Text style={s.readAllText}>Read all</Text>
          </Pressable>
        ) : null}
      />

      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); load(); }}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={<Empty icon="notifications-outline" title="You're all caught up" text="New messages and announcements will show up here." />}
        renderItem={({ item }) => (
          <Pressable onPress={() => open(item)}
            style={({ pressed }) => [s.row, !item.read && s.unread, pressed && { opacity: 0.7 }]}>
            <View style={[s.icon, !item.read && { backgroundColor: colors.rose }]}>
              <Ionicons name={icons[item.icon] ?? 'notifications'} size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.top}>
                <Text style={[s.title, !item.read && { fontWeight: '800' }]} numberOfLines={2}>{item.title}</Text>
                <Text style={s.time}>{timeAgo(item.created_at)}</Text>
              </View>
              {item.body ? <Text style={s.body} numberOfLines={2}>{item.body}</Text> : null}
              {item.count > 1 ? <Text style={s.count}>{item.count} new messages</Text> : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  readAll: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)' },
  readAllText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  row: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  unread: { backgroundColor: '#eef3ff' },
  icon: { height: 42, width: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy500 },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, color: colors.ink, fontWeight: '600', fontSize: 15 },
  time: { color: colors.muted, fontSize: 12 },
  body: { color: colors.muted, marginTop: 2 },
  count: { color: colors.rose, fontWeight: '700', fontSize: 12, marginTop: 3 },
});
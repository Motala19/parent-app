import { Avatar, Badge, Empty, Hero, Loading } from '@/components/ui';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { colors } from '@/lib/theme';
import type { Conversation } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Messages() {
  const router = useRouter();
  const [rows, setRows] = useState<Conversation[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setRows((await api<{ data: Conversation[] }>('/conversations')).data);
      setError('');
    } catch (e: any) {
      setError(e.message);
      setRows((r) => r ?? []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (rows === null) return <Loading />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.navy50 }}>
      <Hero title="Messages" subtitle="Private chats with your child's teachers."
        right={
          <Pressable onPress={() => router.push('/new-chat')} hitSlop={10} style={s.add}>
            <Ionicons name="add" size={26} color="#fff" />
          </Pressable>
        }
      />

      <FlatList
        data={rows}
        keyExtractor={(c) => String(c.contact.id)}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); load(); }}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          <Empty icon="chatbubbles-outline" title={error ? 'Could not load chats' : 'No conversations yet'}
            text={error || 'Tap + to start a chat with a teacher.'} />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: '/chat/[id]', params: { id: String(item.contact.id) } })}
            style={({ pressed }) => [s.row, pressed && { backgroundColor: colors.navy100 }]}>
            <Avatar name={item.contact.name} size={50} />
            <View style={{ flex: 1 }}>
              <View style={s.line}>
                <Text style={[s.name, item.unread > 0 && { fontWeight: '800' }]} numberOfLines={1}>{item.contact.name}</Text>
                <Text style={s.time}>{timeAgo(item.last.created_at)}</Text>
              </View>
              <View style={s.line}>
                <Text style={[s.preview, item.unread > 0 && { color: colors.ink, fontWeight: '700' }]} numberOfLines={1}>
                  {item.last.mine ? 'You: ' : ''}{item.last.body}
                </Text>
                <Badge count={item.unread} />
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  add: { height: 42, width: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, color: colors.ink, fontSize: 16, fontWeight: '600' },
  time: { color: colors.muted, fontSize: 12 },
  preview: { flex: 1, color: colors.muted, marginTop: 2 },
});
import { Avatar, Empty, Hero, Loading } from '@/components/ui';
import { api } from '@/lib/api';
import { colors } from '@/lib/theme';
import type { Contact } from '@/lib/types';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function NewChat() {
  const router = useRouter();
  const [people, setPeople] = useState<Contact[] | null>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  // useEffect with [] runs once, when the screen opens
  useEffect(() => {
    api<{ data: Contact[] }>('/contacts')
      .then((res) => setPeople(res.data))
      .catch((e) => { setError(e.message); setPeople([]); });
  }, []);

  if (people === null) return <Loading />;

  const shown = people.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: colors.navy50 }}>
      <Hero back title="New chat" subtitle="Your child's teachers and the school office." />

      <View style={{ padding: 16, paddingBottom: 4 }}>
        <TextInput value={q} onChangeText={setQ} placeholder="Search by name" placeholderTextColor={colors.muted} style={s.search} />
      </View>

      <FlatList
        data={shown}
        keyExtractor={(p) => String(p.id)}
        ListEmptyComponent={
          <Empty icon="people-outline" title={error ? 'Could not load teachers' : 'No one to message yet'}
            text={error || "You can message your child's teachers once your child has been placed in a class."} />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.replace({ pathname: '/chat/[id]', params: { id: String(item.id) } })}
            style={({ pressed }) => [s.row, pressed && { backgroundColor: colors.navy100 }]}>
            <Avatar name={item.name} size={46} />
            <View>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.role}>{item.role}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  search: { borderWidth: 1, borderColor: colors.navy200, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.ink, backgroundColor: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  name: { color: colors.ink, fontWeight: '700', fontSize: 16 },
  role: { color: colors.muted, marginTop: 1 },
});
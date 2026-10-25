import { Avatar, Chip, Empty, ErrorBox, Loading } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { openAttachment } from '@/lib/files';
import { clock, dayLabel, sameDay } from '@/lib/format';
import { colors, gradients } from '@/lib/theme';
import type { Message, Thread } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Bubble({ m, older, lastMine }: { m: Message; older?: Message; lastMine: boolean }) {
  const light = m.mine ? { color: 'rgba(255,255,255,0.75)' } : null;

  return (
    <View>
      {!older || !sameDay(older.created_at, m.created_at) ? <Text style={s.day}>{dayLabel(m.created_at)}</Text> : null}

      <View style={[s.bubble, m.mine ? s.mine : s.theirs]}>
        {m.about ? <Text style={[s.about, light]}>About {m.about}</Text> : null}
        {m.body ? <Text style={[s.text, m.mine && { color: '#fff' }]}>{m.body}</Text> : null}

        {m.attachments.map((f) => (
          <Pressable key={f.id} onPress={() => openAttachment(f.id)} style={s.file}>
            <Ionicons name="document-text" size={18} color={m.mine ? '#fff' : colors.navy600} />
            <Text style={[s.fileName, m.mine && { color: '#fff' }]} numberOfLines={1}>{f.name}</Text>
          </Pressable>
        ))}

        <Text style={[s.time, light]}>{clock(m.created_at)}{lastMine ? (m.seen ? ' · Seen' : ' · Sent') : ''}</Text>
      </View>
    </View>
  );
}

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>(); // the [id] from the file name
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refresh } = useAuth();

  const [thread, setThread] = useState<Thread | null>(null);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [about, setAbout] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      setThread(await api<Thread>(`/conversations/${id}`));
      setError('');
    } catch (e: any) {
      setError(e.message);
    }
  }, [id]);

  // While this screen is in view: load now, then check for new messages every 8 seconds
  useFocusEffect(
    useCallback(() => {
      load().then(refresh); // refresh updates the unread badges
      const timer = setInterval(load, 8000);

      return () => clearInterval(timer); // stop when we leave the screen
    }, [load, refresh])
  );

  async function send() {
    const body = text.trim();

    if (!body || sending) return;

    setSending(true);

    try {
      const msg = await api<Message>(`/conversations/${id}`, { method: 'POST', body: { body, student_id: about } });
      setThread((t) => (t ? { ...t, messages: [...t.messages, msg] } : t));
      setText('');
    } catch (e: any) {
      Alert.alert('Message not sent', e.message);
    } finally {
      setSending(false);
    }
  }

  if (!thread) return error ? <ErrorBox message={error} onRetry={load} /> : <Loading />;

  // An inverted list shows the newest item at the bottom, so we feed it newest first
  const newestFirst = [...thread.messages].reverse();
  const lastMineId = newestFirst.find((m) => m.mine)?.id;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.navy50 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[s.head, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.back}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Avatar name={thread.contact.name} size={40} />
        <View style={{ flex: 1 }}>
          <Text style={s.name} numberOfLines={1}>{thread.contact.name}</Text>
          <Text style={s.role}>{thread.contact.role}</Text>
        </View>
        <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.7)" />
      </LinearGradient>

      {thread.messages.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Empty icon="chatbubbles-outline" title="No messages yet" text="Say hello below." />
        </View>
      ) : (
        <FlatList
          inverted
          style={{ flex: 1 }}
          data={newestFirst}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={s.list}
          renderItem={({ item, index }) => (
            <Bubble m={item} older={newestFirst[index + 1]} lastMine={item.id === lastMineId} />
          )}
        />
      )}

      {thread.can_send ? (
        <View style={[s.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          {thread.students.length > 0 ? (
            <View style={s.about_row}>
              <Chip label="General" active={about === null} onPress={() => setAbout(null)} />
              {thread.students.map((st) => (
                <Chip key={st.id} label={`About ${st.name.split(' ')[0]}`} active={about === st.id} onPress={() => setAbout(st.id)} />
              ))}
            </View>
          ) : null}

          <View style={s.inputRow}>
            <TextInput value={text} onChangeText={setText} style={s.input} placeholder="Type a message..."
              placeholderTextColor={colors.muted} multiline maxLength={2000} />
            <Pressable onPress={send} disabled={!text.trim() || sending}
              style={({ pressed }) => [{ opacity: !text.trim() || sending ? 0.5 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
              <LinearGradient colors={gradients.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.send}>
                <Ionicons name="send" size={18} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={[s.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <Text style={s.closed}>You can no longer send messages to this person because your child's class has changed. You can still read the history.</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 14 },
  back: { height: 38, width: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)' },
  name: { color: '#fff', fontSize: 17, fontWeight: '800' },
  role: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  list: { padding: 16, gap: 6 },
  day: { alignSelf: 'center', marginVertical: 10, paddingVertical: 3, paddingHorizontal: 12, borderRadius: 12, overflow: 'hidden', color: colors.muted, backgroundColor: colors.navy100, fontSize: 12, fontWeight: '700' },
  bubble: { maxWidth: '82%', paddingVertical: 9, paddingHorizontal: 13, borderRadius: 18 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.navy600, borderBottomRightRadius: 5 },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 5, borderWidth: 1, borderColor: colors.navy100 },
  about: { color: colors.muted, fontSize: 12, fontWeight: '700', marginBottom: 3 },
  text: { color: colors.ink, fontSize: 16, lineHeight: 22 },
  file: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  fileName: { flex: 1, color: colors.navy600, fontWeight: '700', textDecorationLine: 'underline' },
  time: { color: colors.muted, fontSize: 11, marginTop: 4, alignSelf: 'flex-end' },
  composer: { paddingHorizontal: 12, paddingTop: 8, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.navy100 },
  about_row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: { flex: 1, maxHeight: 130, borderWidth: 1, borderColor: colors.navy200, borderRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 16, color: colors.ink, backgroundColor: '#fbfcff' },
  send: { height: 44, width: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  closed: { color: colors.muted, textAlign: 'center', fontSize: 13, lineHeight: 19, paddingBottom: 4 },
});
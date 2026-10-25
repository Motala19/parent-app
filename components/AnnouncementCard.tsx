import { openAttachment } from '@/lib/files';
import { timeAgo, toneFor } from '@/lib/format';
import { colors, shadow } from '@/lib/theme';
import type { Announcement } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const fileIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  pdf: 'document-text', doc: 'document', xls: 'grid', ppt: 'easel', img: 'image',
};

export function AnnouncementCard({ a, compact }: { a: Announcement; compact?: boolean }) {
  const tone = toneFor(a.type);

  return (
    <View style={[s.card, { borderLeftColor: tone.bar }]}>
      <View style={s.tags}>
        <View style={[s.tag, { backgroundColor: tone.bg }]}>
          <Text style={[s.tagText, { color: tone.fg }]}>{a.type_label}</Text>
        </View>
        <View style={[s.tag, { backgroundColor: colors.navy50 }]}>
          <Text style={[s.tagText, { color: colors.navy700 }]}>{a.audience}</Text>
        </View>
      </View>

      <Text style={s.title}>{a.title}</Text>
      <Text style={s.body} numberOfLines={compact ? 3 : undefined}>{a.body}</Text>

      {a.attachments.map((f) => (
        <Pressable key={f.id} onPress={() => openAttachment(f.id)}
          style={({ pressed }) => [s.file, pressed && { opacity: 0.7 }]}>
          <Ionicons name={fileIcon[f.kind] ?? 'attach'} size={22} color={colors.navy600} />
          <View style={{ flex: 1 }}>
            <Text style={s.fileName} numberOfLines={1}>{f.name}</Text>
            <Text style={s.fileMeta}>{f.size} · tap to open</Text>
          </View>
          <Ionicons name="download-outline" size={20} color={colors.rose} />
        </Pressable>
      ))}

      <Text style={s.footer}>{a.author ?? 'School'} · {timeAgo(a.published_at)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, borderLeftWidth: 5, ...shadow },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tag: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 12 },
  tagText: { fontSize: 12, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  body: { color: colors.inkSoft, marginTop: 6, lineHeight: 21 },
  file: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, padding: 10, borderRadius: 12, backgroundColor: colors.navy50 },
  fileName: { color: colors.ink, fontWeight: '700', fontSize: 14 },
  fileMeta: { color: colors.muted, fontSize: 12 },
  footer: { color: colors.muted, fontSize: 12, marginTop: 12 },
});
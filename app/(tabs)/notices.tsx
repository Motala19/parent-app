import { AnnouncementCard } from '@/components/AnnouncementCard';
import { Chip, Empty, Hero } from '@/components/ui';
import { api } from '@/lib/api';
import { colors } from '@/lib/theme';
import type { Announcement } from '@/lib/types';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';

const TYPES: [string, string][] = [
  ['', 'All'], ['newsletter', 'Newsletters'], ['homework', 'Homework'], ['assignment', 'Assignments'],
  ['question_paper', 'Question papers'], ['test', 'Tests'], ['reminder', 'Reminders'],
  ['event', 'Events'], ['urgent', 'Urgent'], ['general', 'General'],
];

export default function Notices() {
  const [type, setType] = useState('');
  const [items, setItems] = useState<Announcement[]>([]);
  const [next, setNext] = useState<number | null>(null); // the next page number, or null when finished
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const request = useRef(0); // ignore answers from an older filter
  const loadingMore = useRef(false);

  async function fetchPage(page: number, replace: boolean) {
    const id = ++request.current;

    try {
      const res = await api<{ data: Announcement[]; next_page: number | null }>(
        `/announcements?page=${page}${type ? `&type=${type}` : ''}`
      );

      if (id !== request.current) return;

      setItems((prev) => (replace ? res.data : [...prev, ...res.data]));
      setNext(res.next_page);
      setError('');
    } catch (e: any) {
      if (id === request.current) setError(e.message);
    } finally {
      if (id === request.current) {
        setLoading(false);
        setRefreshing(false);
        loadingMore.current = false;
      }
    }
  }

  // Runs when the tab is shown and again whenever the filter changes
  useFocusEffect(useCallback(() => { fetchPage(1, true); }, [type]));

  function pick(value: string) {
    setType(value);
    setItems([]);
    setLoading(true);
  }

  function more() {
    if (next && !loadingMore.current && !loading) {
      loadingMore.current = true;
      fetchPage(next, false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.navy50 }}>
      <Hero title="Notices" subtitle="Newsletters, homework and messages from school." />

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={s.chips}>
          {TYPES.map(([value, label]) => (
            <Chip key={value} label={label} active={type === value} onPress={() => pick(value)} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={items}
        keyExtractor={(a) => String(a.id)}
        renderItem={({ item }) => <AnnouncementCard a={item} />}
        contentContainerStyle={s.list}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); fetchPage(1, true); }}
        onEndReached={more}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          loading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.rose} /> : (
            <Empty icon="megaphone-outline" title={error ? 'Could not load notices' : 'Nothing here yet'}
              text={error || 'New notices from the school will appear here.'} />
          )
        }
        ListFooterComponent={next ? <ActivityIndicator style={{ margin: 16 }} color={colors.rose} /> : null}
      />
    </View>
  );
}

const s = StyleSheet.create({
  chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
});
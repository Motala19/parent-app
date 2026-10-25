import { colors, gradients, shadow } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type IconName = keyof typeof Ionicons.glyphMap;

// The dark gradient header at the top of a screen
export function Hero({ title, subtitle, right, back, children }: {
  title: string; subtitle?: string; right?: ReactNode; back?: boolean; children?: ReactNode;
}) {
  const insets = useSafeAreaInsets(); // keeps the title below the notch and status bar
  const router = useRouter();

  return (
    <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[s.hero, { paddingTop: insets.top + 14 }]}>
      <View style={s.heroRow}>
        {back ? (
          <Pressable onPress={() => router.back()} hitSlop={12} style={s.heroBack}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={s.heroTitle} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={s.heroSub} numberOfLines={2}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </LinearGradient>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';

  return (
    <LinearGradient colors={gradients.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.36 }}>{initials}</Text>
    </LinearGradient>
  );
}

export function Badge({ count }: { count: number }) {
  if (!count) return null;

  return (
    <View style={s.badge}>
      <Text style={s.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

export function Button({ title, onPress, loading, disabled, variant = 'primary', icon, small, style }: {
  title: string; onPress: () => void; loading?: boolean; disabled?: boolean;
  variant?: 'primary' | 'ghost'; icon?: IconName; small?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const off = !!(disabled || loading);
  const primary = variant === 'primary';

  const inner = (
    <View style={[s.btnInner, small && { paddingVertical: 9, paddingHorizontal: 14 }]}>
      {loading ? (
        <ActivityIndicator color={primary ? '#fff' : colors.navy600} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={primary ? '#fff' : colors.navy700} /> : null}
          <Text style={[s.btnText, small && { fontSize: 13 }, !primary && { color: colors.navy700 }]}>{title}</Text>
        </>
      )}
    </View>
  );

  return (
    <Pressable onPress={onPress} disabled={off}
      style={({ pressed }) => [{ opacity: off ? 0.55 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }, style]}>
      {primary ? (
        <LinearGradient colors={gradients.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btnShape}>
          {inner}
        </LinearGradient>
      ) : (
        <View style={[s.btnShape, s.btnGhost]}>{inner}</View>
      )}
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Empty({ icon, title, text }: { icon: IconName; title: string; text?: string }) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}><Ionicons name={icon} size={28} color={colors.navy500} /></View>
      <Text style={s.emptyTitle}>{title}</Text>
      {text ? <Text style={s.emptyText}>{text}</Text> : null}
    </View>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy50 }}>
      <ActivityIndicator size="large" color={colors.rose} />
    </View>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.navy50 }}>
      <Empty icon="cloud-offline-outline" title="Something went wrong" text={message} />
      <Button title="Try again" onPress={onRetry} style={{ marginTop: 8 }} />
    </View>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 26, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroBack: { height: 38, width: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)' },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, ...shadow },
  badge: { minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.rose },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  btnShape: { borderRadius: 14, overflow: 'hidden' },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.navy200 },
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 20 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.navy200 },
  chipActive: { backgroundColor: colors.rose, borderColor: colors.rose },
  chipText: { color: colors.navy700, fontWeight: '600', fontSize: 13 },
  empty: { alignItems: 'center', padding: 32 },
  emptyIcon: { height: 60, width: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12, backgroundColor: colors.navy100 },
  emptyTitle: { color: colors.ink, fontWeight: '800', fontSize: 16, textAlign: 'center' },
  emptyText: { color: colors.muted, marginTop: 4, textAlign: 'center', lineHeight: 20 },
});